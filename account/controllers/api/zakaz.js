'use strict';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var ObjectID = mongoose.Types.ObjectId;
var fs = require('fs');
var path = require('path');
var request=require('request');
var Rn=mongoose.model('Rn');
var Pn=mongoose.model('Pn');
var Material=mongoose.model('Material');
var Zakaz=mongoose.model('Zakaz');
var Worker=mongoose.model('Worker');
var Work=mongoose.model('Work');
var SA=mongoose.model('StockAdjustment');
var Act=mongoose.model('Act');
var MoneyOrder=mongoose.model('MoneyOrder');

var Supplier=mongoose.model('Supplier');
var Customer=mongoose.model('Customer');
var Worker=mongoose.model('Worker');
var Founder=mongoose.model('Founder');
var Contragent=mongoose.model('Contragent');

const Models={
    Supplier:Supplier,
    Customer:Customer,
    Worker:Worker,
    Founder:Founder,
    Contragent:Contragent
}
var ClosePeriod=mongoose.model('ClosePeriod');
var Producer=mongoose.model('Producer');
var Account=mongoose.model('Account');
var VirtualAccount=mongoose.model('VirtualAccount');
var calculate=require('../calculate');
var ActController=require('./act.js');
var RnController=require('./rn');
var PnController=require('./pn');
var MOController=require('./money');
var globalVariable = require('../../../public/bookkeep/scripts/variables.js')


exports.hold = async function(req, res, next) {
    let error = await holdZakaz(req.params.id,req.store);
    if(error){
        next(error)
    }else{
        res.json({msg:'ok'})
    }
}
async function holdZakaz(id,store) {
    const currency = store.currency
    const mainCurrency=(store.currency.mainCurrency)?store.currency.mainCurrency:'UAH'
    const currencyArr = store.currencyArr
    try {
        const zakaz = await Zakaz.findOne({_id:id}).populate('contrAgent').populate('rns').populate('acts').lean().exec()
        const zakazCurrency=(zakaz.currency)?zakaz.currency:mainCurrency;
        const zakazCurrencyRate=(currency[zakazCurrency]&& currency[zakazCurrency][0])?currency[zakazCurrency][0]:1;
        const virtualAccount = (zakaz.virtualAccount && zakaz.virtualAccount.toString)?zakaz.virtualAccount.toString():zakaz.virtualAccount;
        const zakazId = (zakaz._id && zakaz._id.toString)?zakaz._id.toString():zakaz._id;
        let queryForSA = {store:store._id,date:{$gte:zakaz.date},virtualAccount:virtualAccount}
        const doc = await SA.findOne(queryForSA).lean().exec();
        if(doc){
            return 'сформирована инвентаризация позднее даты проведения документа - '+doc.name
        }
        if(zakaz.actived){
            return 'документ проведен'
        }
        if(!zakaz.worker){
            return 'не установлен сотрудник'
        }
        let queryForCP = {store:store._id,actived:true,date:{$gte:zakaz.date},virtualAccount:virtualAccount}
        let CP = await ClosePeriod.findOne(queryForCP).sort({date: -1}).lean().exec()
        if(CP){
            return 'документ не может быть проведен в закрытом периоде '+CP.name
        }
        let rnsSum={},rnsSumUchet={},rnsSumForWorker={},actsSum={},actsSumForWorker={};
        let totalSum={},totalUchet={},totalSumWorker={}
        for(let c of currencyArr){
            rnsSum[c]=0;
            rnsSumUchet[c]=0;
            rnsSumForWorker[c]=0;
            actsSum[c]=0;
            actsSumForWorker[c]=0;
            totalSum[c]=0;
            totalUchet[c]=0;
            totalSumWorker[c]=0;
        }
        let materialsFromRns=[];
        let ids= new Set;
        for(let rn of zakaz.rns){
            if(!rn.actived){
                return 'расходная накладная '+rn.name+ ' не проведена!'
            }
            rnsSum[rn.currency]+=rn.sum
            rnsSumUchet[rn.currency]+=rn.sumUchet
            rnsSumForWorker[rn.currency]+=rn.sumForWorker
            let rnId = (rn._id && rn._id.toString)?rn._id.toString():rn._id;
            rn.materials.forEach(m=>{
                m.rnId=rnId;
                materialsFromRns.push(m);
                ids.add(m.item)
            })

        }
        /*console.log('zakaz.rns',zakaz.rns)
        console.log('rnsSum',rnsSum)*/
        for(let act of zakaz.acts){
            if(!act.actived){
                return 'акт работ '+act.name+ ' не проведен!'
            }
            actsSum[act.currency]+=act.sum
            actsSumForWorker[act.currency]+=act.sumForWorker
        }
        for(let c of currencyArr){
            totalSum[c]=rnsSum[c]+actsSum[c]
            totalUchet[c]=rnsSumUchet[c];
            totalSumWorker[c]=rnsSumForWorker[c]+actsSumForWorker[c];
        }

        if(!zakaz.contrAgent){
            return 'не установлен контрагент!';
        }
        let ed = {
            type:'zakaz',
            _id:zakaz._id,
            name:zakaz.name,
            date:zakaz.date
        }
        if(zakaz.desc){
            ed.comment=zakaz.desc
        }




        /* расчеты с контрагентом по стоимости продажи*/
        if(!zakaz.contrAgent.data){
            zakaz.contrAgent.data=[]
        }
        //console.log(zakaz.contrAgent.data)
        for(let c of currencyArr){
            calculate.data(zakaz.contrAgent,rnsSum[c],c,virtualAccount,'debet','credit')
            calculate.data(zakaz.contrAgent,actsSum[c],c,virtualAccount,'debet','credit')
        }
        //console.log(zakaz.contrAgent.data)
        let resultPN = await Models[zakaz.typeOfContrAgent].update({_id:zakaz.contrAgent._id},{$set:{data:zakaz.contrAgent.data}})
        /* *******************************************************************/
        /* материалы из накладных*/
        let idss=[];
        ids.forEach((id) => {
            idss.push(id)
        });
        let materialsFromDB = await Material.find({_id:{$in:idss}}).lean().exec()
        for(let m of materialsFromRns){
            let material = materialsFromDB.find(mat=>{
                return ((mat._id.toString)?mat._id.toString():mat._id)==
                    ((m.item && m.item.toString)?m.item.toString():m.item)
            })
            handleMaterial(m,material)
        }
        for(let material of materialsFromDB){
            if(material.data && material.data.length){
                let qty=0;
                let price =0;
                let priceForSale=0;
                material.data.forEach(function (mat) {
                    qty +=mat.qty
                    price +=mat.price*mat.qty
                    priceForSale +=mat.priceForSale*mat.qty
                })
                material.qty=qty
                material.price=(qty)?Math.round((price/qty)*100)/100:0;
                material.priceForSale=(qty)?Math.round((priceForSale/qty)*100)/100:0;
                let r = await Material.update({_id:material._id},{$set:{price:material.price,qty:material.qty,priceForSale:material.priceForSale,data:material.data}});
            }
        }

        /* *******************************************************************/
        /* *******************************************************************/


        /***************************проводки *************/
        zakaz.entries=[];
        const accounts = await Account.find({store:store._id}).lean().exec();
        let accountCustomer = accounts.find(a=>a.type==zakaz.typeOfContrAgent)._id.toString()
        let accountRealcost = accounts.find(a=>a.type=='Realcost')._id.toString()
        let accountRealcostwork = accounts.find(a=>a.type=='Realcostwork')._id.toString()
        let accounIncome = accounts.find(a=>a.type=='Income')._id.toString()
        let accounIncomeWork = accounts.find(a=>a.type=='Incomework')._id.toString()
        let accounFinresult = accounts.find(a=>a.type=='Finresult')._id.toString()
        let accountManufacture = accounts.find(a=>a.type=='Manufacture')._id.toString()
        /*1 валовый доход материалы*/
        ed.comment='Валовый доход материалы'
        for(let c of currencyArr){
            if(rnsSum[c]){
                calculate.makeEntries(zakaz.entries,accountCustomer,accounIncome,virtualAccount,rnsSum[c],ed,c)
            }

        }
        /*2 валовый доход работы*/
        ed.comment='Валовый доход работы'
        for(let c of currencyArr){
            if(actsSum[c]){
                calculate.makeEntries(zakaz.entries,accountCustomer,accountRealcostwork,virtualAccount,actsSum[c],ed,c)
            }

        }
        /*3 себестоимость материалов*/
        ed.comment='Себестоимость материалов'
        for(let c of currencyArr){
            if(rnsSumUchet[c]){
                calculate.makeEntries(zakaz.entries,accountRealcost,accountManufacture,virtualAccount,rnsSumUchet[c],ed,c)
            }

        }
        /*4 Стоимость работ(зп)*/
        ed.comment='Стоимость работ(зп)'
        for(let c of currencyArr){
            if(totalSumWorker[c]){
                calculate.makeEntries(zakaz.entries,accountRealcostwork,accountManufacture,virtualAccount,totalSumWorker[c],ed,c)
            }

        }
        /*5 валовый доход материалы*/
        ed.comment='Валовый доход материалы на финрезультат'
        for(let c of currencyArr){
            if(rnsSum[c]){
                calculate.makeEntries(zakaz.entries,accounIncome,accounFinresult,virtualAccount,rnsSum[c],ed,c)
            }

        }
        /*6 валовый доход работы*/
        ed.comment='Валовый доход работы на финрезультат'
        for(let c of currencyArr){
            if(actsSum[c]){
                calculate.makeEntries(zakaz.entries,accountRealcostwork,accounFinresult,virtualAccount,actsSum[c],ed,c)
            }

        }
        /*7 себестоимость материалов*/
        ed.comment='Себестоимость материалов на финрезультат'
        for(let c of currencyArr){
            if(rnsSumUchet[c]){
                calculate.makeEntries(zakaz.entries,accounFinresult,accountRealcost,virtualAccount,rnsSumUchet[c],ed,c)
            }

        }
        /*7 Стоимость работ(зп)*/
        ed.comment='Стоимость работ(зп) на финрезультат'
        for(let c of currencyArr){
            if(totalSumWorker[c]){
                calculate.makeEntries(zakaz.entries,accounFinresult,accountRealcostwork,virtualAccount,totalSumWorker[c],ed,c)
            }

        }
        let r = await Zakaz.update({_id:id},{$set:{actived:true,entries: zakaz.entries,totalSum:totalSum,totalSumWorker:totalSumWorker,totalUchet:totalUchet}});

        console.log('done hold zakaz')
        return null

        function handleMaterial(m,material) {
            let supplier = (m.supplier && m.supplier.toString)?m.supplier.toString():m.supplier;
            if(material && material.data && material.data.length){
                let mData = material.data.find(function (d) {
                    let dVA = (d.virtualAccount && d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount
                    return dVA==virtualAccount && d.supplier.toString()==supplier && d.supplierType==m.supplierType;
                })
                /* такой товар на таком складе от такого поставщика уже существует*/
                if(mData){
                    /* списываем c производствa*/
                    if(!mData.manufacture){
                        mData.manufacture=[];
                    }
                    mData.manufacture=mData.manufacture.filter(rd=>((rd.rn && rd.rn.toString)?rd.rn.toString():rd.rn)!=m.rnId)
                }
            }
        }
    } catch (err) {
        console.log('err',err)
        return err

    }
}


exports.cancel = async function (req, res, next) {
    let  error = await cancelZakaz(req);
    if(error){return next(error)}
    return res.json({msg:'ok'})
}

async function cancelZakaz(req) {

    const currency = req.store.currency
    const mainCurrency=(req.store.currency.mainCurrency)?req.store.currency.mainCurrency:'UAH'
    const currencyArr = req.store.currencyArr
    try {
        const zakaz = await Zakaz.findOne({_id:req.params.id}).populate('contrAgent').populate('rns').populate('acts').lean().exec()
        const zakazCurrency=(zakaz.currency)?zakaz.currency:mainCurrency;
        const zakazCurrencyRate=(currency[zakazCurrency]&& currency[zakazCurrency][0])?currency[zakazCurrency][0]:1;
        if(!zakaz.actived){
            return 'документ не проведен'
        }

        let rnsSum={},rnsSumUchet={},rnsSumForWorker={},actsSum={},actsSumForWorker={}
        for(let c of currencyArr){
            rnsSum[c]=0;
            rnsSumUchet[c]=0;
            rnsSumForWorker[c]=0;
            actsSum[c]=0;
            actsSumForWorker[c]=0;
        }
        let materialsFromRns=[];
        let ids= new Set;
        for(let rn of zakaz.rns){
            if(!rn.actived){
                return 'расходная накладная '+rn.name+ ' не проведена!'
            }
            rnsSum[rn.currency]+=rn.sum
            rnsSumUchet[rn.currency]+=rn.sumUchet
            rnsSumForWorker[rn.currency]+=rn.sumForWorker
            let rnId = (rn._id && rn._id.toString)?rn._id.toString():rn._id;
            rn.materials.forEach(m=>{
                m.rnId=rnId;
                materialsFromRns.push(m);
                ids.add(m.item)
            })

        }
        //console.log(ids,materialsFromRns)
        for(let act of zakaz.acts){
            if(!act.actived){
                return 'акт работ '+act.name+ ' не проведен!';
            }
            actsSum[act.currency]+=act.sum
            actsSumForWorker[act.currency]+=act.sumForWorker
        }
        /*console.log('rnsSum',rnsSum)
         console.log('rnsSumUchet',rnsSumUchet)
         console.log('rnsSumForWoker',rnsSumForWorker)
         console.log('actsSum',actsSum)
         console.log('actsSumForWoker',actsSumForWorker)*/
        if(!zakaz.contrAgent){
            return 'не установлен контрагент!';
        }
        let ed = {
            type:'zakaz',
            _id:zakaz._id,
            name:zakaz.name,
            date:zakaz.date
        }


        const virtualAccount = (zakaz.virtualAccount && zakaz.virtualAccount.toString)?zakaz.virtualAccount.toString():zakaz.virtualAccount;
        const zakazId = (zakaz._id && zakaz._id.toString)?zakaz._id.toString():zakaz._id;


        /* расчеты с контрагентом по стоимости продажи*/
        if(!zakaz.contrAgent.data){
            zakaz.contrAgent.data=[]
        }
        //console.log(zakaz.contrAgent.data)
        for(let c of currencyArr){
            calculate.data(zakaz.contrAgent,rnsSum[c],c,virtualAccount,'credit','debet')
            calculate.data(zakaz.contrAgent,actsSum[c],c,virtualAccount,'credit','debet')
        }
        //console.log(zakaz.contrAgent.data)
        let resultPN = await Models[zakaz.typeOfContrAgent].update({_id:zakaz.contrAgent._id},{$set:{data:zakaz.contrAgent.data}})
        /* *******************************************************************/
        /* материалы из накладных*/
        let idss=[];
        ids.forEach((id) => {
            idss.push(id)
        });
        let materialsFromDB = await Material.find({_id:{$in:idss}}).lean().exec()
        //console.log('materialsFromDB',materialsFromDB)
        for(let m of materialsFromRns){
            let material = materialsFromDB.find(mat=>{
                return ((mat._id.toString)?mat._id.toString():mat._id)==
                    ((m.item && m.item.toString)?m.item.toString():m.item)
            })
            //console.log(material)
            handleMaterial(m,material)
        }
        for(let material of materialsFromDB){
            if(material.data && material.data.length){
                let qty=0;
                let price =0;
                let priceForSale=0;
                material.data.forEach(function (mat) {
                    qty +=mat.qty
                    price +=mat.price*mat.qty
                    priceForSale +=mat.priceForSale*mat.qty
                })
                material.qty=qty
                material.price=(qty)?Math.round((price/qty)*100)/100:0;
                material.priceForSale=(qty)?Math.round((priceForSale/qty)*100)/100:0;
                //console.log(material.name,material.data)
                let r = await Material.update({_id:material._id},{$set:{price:material.price,qty:material.qty,priceForSale:material.priceForSale,data:material.data}});
                //console.log('saved material')
            }
        }

        /* *******************************************************************/
        /* *******************************************************************/




        let r = await Zakaz.update({_id:req.params.id},{$set:{actived:false,entries:[]}});

        return null;

        function handleMaterial(m,material) {
            let supplier = (m.supplier && m.supplier.toString)?m.supplier.toString():m.supplier;
            if(material.data && material.data.length){
                let mData = material.data.find(function (d) {
                    let dVA = (d.virtualAccount && d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount
                    return dVA==virtualAccount && d.supplier.toString()==supplier && d.supplierType==m.supplierType;
                })
                /* такой товар на таком складе от такого поставщика уже существует*/
                //console.log('mData',mData)
                if(mData){
                    if(!mData.manufacture){
                        mData.manufacture=[];
                    }
                    let rD = mData.manufacture.find(rd=>{
                        return ((rd.rn && rd.rn.toString)?rd.rn.toString():rd.rn)==m.rnId
                    })
                    if(!rD){
                        rD={
                            qty:0,
                            rn:m.rnId
                        }
                        mData.manufacture.push(rD)
                    }
                    rD.qty=m.qty
                }
            }
        }
    } catch (err) {
        console.log('err',err)
        return err

    }
}

exports.createByAPI = createByAPI;
async function  createByAPI(req, res, next){
    console.log(req.body)
    //return res.json({})
    try{
        let workingHour = globalVariable.workingHour;
        const mainCurrency=(req.store.currency.mainCurrency)?req.store.currency.mainCurrency:'UAH'
        const currency = req.store.currency;
        let z = req.body;

        if(z.link){
            let zz = await Zakaz.findOne({store:req.store._id,linkForcreatedByAPI:z.link}).lean().exec();
            if(zz){
                return next('в бухгалтерии уже есть наряд-заказ для этого счета-фактуры - '+zz.name);
            }
        }
        let va = {store:req.store._id,name:z.virtualAccount}
        let virtualAccount = await VirtualAccount.findOne(va).lean().exec();
        if(!virtualAccount){
            virtualAccount = new VirtualAccount(va)
            await virtualAccount.save()
        }
        virtualAccount=virtualAccount._id.toString()
        let zakaz={}
        let customer={store:req.store._id,name:z.customer.name};
        if(z.customer.email){
            customer.email=z.customer.email
        }
        if(z.customer.phone){
            customer.phone=z.customer.phone
        }
        if(z.customer.field1){
            customer.field1=z.customer.field1
        }
        if(z.customer.field2){
            customer.field2=z.customer.field2
        }
        let c = await Customer.findOne(customer).lean().exec()
        if(!c){
            c= new Customer(customer);
            await c.save();
        }
        let materials=[]
        if(z.materials){
            for(let m of z.materials){
                let p={store:req.store._id,name:m.producer};

                let producer = await Producer.findOne(p).lean().exec()
                if(!producer){
                    producer= new Producer(p);
                    await producer.save();
                }
                let material = {store:req.store._id};
                material.producer=producer._id
                material.name=m.name;
                if(m.sku){
                    material.sku=m.sku
                }
                let supplier = {store:req.store._id,name:m.supplier}
                let ss = await Supplier.findOne(supplier).lean().exec();
                if(!ss){
                    ss = new Supplier(supplier)
                    await ss.save()
                }


                let mat = await Material.findOne(material).lean().exec();
                if(!mat){
                    console.log(material)
                    throw 'материал автоматически больше не создается.'
                    material.currency=(m.currency)?m.currency:z.currency
                    let data={
                        virtualAccount:virtualAccount,
                        supplier:ss._id.toString(),
                        supplierType:'Supplier'
                    }
                    material.data=[data];
                    material.data.push()
                    mat = new Material(material);
                    await mat.save()
                    mat.price=m.price;

                }else{
                    if(mat.data && mat.data.length){
                        let data = mat.data.find(d=>{
                            return ((d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount)==virtualAccount
                                && ((d.supplier.toString)?d.supplier.toString():d.supplier)==ss._id.toString() && d.supplierType=='Supplier'
                        })
                        if(!data || !data.qty || data.qty<m.qty){
                            throw ('внесите материал '+mat.name+' '+mat.sku+' на склад')
                        }
                    }else{throw ('внесите материал '+mat.name+' '+mat.sku+' на склад')}
                }
                if(! mat.price){
                    mat.price=m.price;
                }
                mat.qty=m.qty;
                mat.priceForSale=m.priceForSale;
                mat.supplier  =ss._id.toString()

                //mat.virtualAccount=virtualAccount;
                //console.log(6,mat)]
                materials.push(mat)
            }
        }
        let works=[];
        if(z.works){
            for(let w of z.works){
                let p={store:req.store._id,name:w.name};
                let work = await Work.findOne(p).lean().exec()
                if(!work){
                    p.workingHour=w.workingHour
                    work= new Work(p);
                    let r = await work.save();
                }
                w.item=work._id.toString();
                p={store:req.store._id,name:w.worker};
                let worker = await Worker.findOne(p).lean().exec()
                if(!worker){
                    p.rateWork=50;
                    p.rateSale=25;
                    worker= new Worker(p);
                    let r = await worker.save();
                }
                if(w.qty && workingHour[z.currency]){
                    w.qty= w.sum/workingHour[z.currency];
                    w.price= Math.round(w.sum*100)/100;
                    //w.price=Math.round((workingHour[z.currency]*w.qty)*100)/100
                }else{
                    w.price=0;
                }
                /*console.log('w.price',w.price)
                console.log('worker.rateWork',worker)
                console.log((w.price/100)*worker.rateWork)*/
                if(worker && worker.rateWork){
                    w.salary = Math.round(((w.price/100)*worker.rateWork) *100)/100
                }else{
                    work.salary=0
                }
                w.worker=worker._id.toString()
                works.push(w)
            }
        }
        /*console.log(works)
        throw 'text'*/


        let zz = {store: req.store._id, name: 'наряд-заказ ', currency: z.currency};
        zz.typeOfContrAgent = 'Customer';
        zz.contrAgent = c._id.toString();
        let zzzz = await Zakaz.find({store: req.store._id}).sort({num: -1}).limit(1).lean().exec();
        zz.num = (zzzz.length && zzzz[0].num && Number(zzzz[0].num)) ? ( Number(zzzz[0].num) + 1 ): 1;
        zz.name+=zz.num;
        zz.type='manufacture';
        zz.virtualAccount=virtualAccount;
        zz.linkForcreatedByAPI=z.link;
        zz.desc=z.comment;

        if(!z.worker){
            let w = await Worker.findOne({store:req.store._id}).lean().sort({name:-1}).exec();
            zz.worker=w._id.toString();

        }else{
            let ww={store:req.store._id,name:z.worker}
            let worker = await Worker.findOne(ww).lean().exec();
            if(!worker){
                ww.rateWork=50;
                ww.rateSale=25;
                worker= new Worker(ww);
                let r = await worker.save();
            }
            zz.worker=worker._id.toString();
            if(zz.worker.toString()){
                zz.worker=zz.worker.toString();
            }
        }
        if(z.comment){
            zz.comment=z.comment;
        }

        let zak = new Zakaz(zz)




        console.log(z.worker);
        console.log('zak.worker');
        console.log(typeof zak.worker);



        //await zak.save();
        let pns=[];
        let rns=[];
        let currencyForRn;
        let materialsFromPn=[];
        if(z.purchase && z.purchase.length){
            for(let p of z.purchase){
                if(!currencyForRn){
                    currencyForRn=p.currency||'UAH'
                }

                let pn = pns.find(item=>item.contrAgent==p.supplier);
                if(!pn){
                    pn={
                        store:req.store._id,
                        name:'Приходная накладная ',
                        contrAgent:p.supplier,
                        typeOfContrAgent :'Supplier',
                        virtualAccount:virtualAccount,
                        date:Date.now(),
                        currency:currencyForRn,
                        materials:[]
                    }
                    let zzz = await Pn.find({store: req.store._id}).sort({num: -1}).limit(1).lean().exec();
                    pn.num = (zzz.length && zzz[0].num && Number(zzz[0].num)) ? ( Number(zzz[0].num) + 1 ): 1;
                    pn.name+=pn.num+pns.length;
                    pns.push(pn)
                }

                let m ={
                    item:p.name,
                    qty:p.qty,
                    price:p.incomeSum,
                    priceForSale:p.sum,
                }
                pn.materials.push(m)
            }
            for(let pn of pns){
                let query = {store:req.store._id,name:pn.contrAgent}
                let supplier = await Supplier.findOne(query).lean().exec();

                if(!supplier){
                    supplier= new Supplier(query);
                    await supplier.save();
                }
                pn.contrAgent= supplier._id;
                for(let m of pn.materials){
                    let query = {store:req.store._id,name:m.item}
                    let material = await Material.findOne(query).lean().exec();
                    if(!material){
                        material= new Material(query);
                        await material.save();
                    }
                    material.supplier=supplier._id.toString();
                    material.qty=m.qty;
                    material.price=m.price;
                    material.priceForSale=m.priceForSale;
                    materialsFromPn.push(material)
                    m.item= material._id;
                }
            }
            let rn = {
                store:req.store._id,
                contrAgent:c._id.toString(),
                typeOfContrAgent :'Customer',
                virtualAccount:virtualAccount,
                date:Date.now(),
                currency:currencyForRn,
                name:'расходная накладная ',
                typeOfZakaz:"manufacture",
                zakaz:zak._id.toString(),
                worker:zak.worker
            }

            let zzzzz = await Rn.find({store: req.store._id}).sort({num: -1}).limit(1).lean().exec();
            rn.num = (zzzzz.length && zzzzz[0].num && Number(zzzzz[0].num)) ? ( Number(zzzzz[0].num) + 1 ): 1;
            rn.name+=rn.num;
            rn.materials=[];
            rn.sum=0
            materialsFromPn.forEach(m=>{
                let material = {
                    item:m._id.toString(),
                    price:m.price,
                    priceForSale:m.priceForSale,
                    qty:m.qty,
                    supplier:m.supplier,
                    supplierType: "Supplier",
                }
                if(m.currency==rn.currency){
                    material.priceRate=m.price;
                }else{
                    let rnCurrency=rn.currency
                    let rnCurrencyRate=(currency[rnCurrency]&& currency[rnCurrency][0])?currency[rnCurrency][0]:1;
                    var materialCurrency = (m.currency)?m.currency:'UAH';
                    let materialCurrencyRate =(currency[materialCurrency]&& currency[materialCurrency][0])?currency[materialCurrency][0]:1;
                    let rate =materialCurrencyRate/rnCurrencyRate;
                    material.priceRate=Math.round((m.price/rate)*100)/100
                }



                material.sum= Math.round((material.priceForSale*material.qty)*100)/100
                rn.sum+=material.sum
                rn.materials.push(material);
            })
            rn = new Rn(rn);
            rns.push(rn)
            zak.rns=[rn._id]

            //let rr = await Zakaz.update({_id:zak._id},{$set:{rns:zak.rns}})
        }
        if(materials && materials.length){
            let rn = {
                store:req.store._id,
                contrAgent:c._id.toString(),
                typeOfContrAgent :'Customer',
                virtualAccount:virtualAccount,
                date:Date.now(),
                currency:z.currencyRn,
                name:'расходная накладная ',
                typeOfZakaz:"manufacture",
                zakaz:zak._id.toString(),
                worker:zak.worker
            }
            //console.log(rn)

            let zzz = await Rn.find({store: req.store._id}).sort({num: -1}).limit(1).lean().exec();
            rn.num = (zzz.length && zzz[0].num && Number(zzz[0].num)) ? ( Number(zzz[0].num) + 1 ): 1;
            //console.log('zzz[0].num',zzz[0].num)
            rn.num+=rns.length
            rn.name+=rn.num;
            rn.materials=[];
            rn = new Rn(rn);
            rns.push(rn)
            //await rn.save()

            if(zak.rns){
                zak.rns.push(rn._id);
            }else{
                zak.rns=[rn._id]
            }
            //let rrr = await Zakaz.update({_id:zak._id},{$set:{rns:zak.rns}})
            rn.materials=[];
            rn.sum=0
            materials.forEach(m=>{
                let material = {
                    item:m._id.toString(),
                    price:m.price,
                    priceForSale:m.priceForSale,
                    qty:m.qty,
                    supplier:m.supplier,
                    supplierType: "Supplier",
                }
                if(m.currency==rn.currency){
                    material.priceRate=m.price;
                }else{
                    let rnCurrency=rn.currency
                    let rnCurrencyRate=(currency[rnCurrency]&& currency[rnCurrency][0])?currency[rnCurrency][0]:1;
                    var materialCurrency = (m.currency)?m.currency:'UAH';
                    let materialCurrencyRate =(currency[materialCurrency]&& currency[materialCurrency][0])?currency[materialCurrency][0]:1;
                    let rate =materialCurrencyRate/rnCurrencyRate;
                    material.priceRate=Math.round((m.price/rate)*100)/100
                }
                //console.log(m.name,material.price,material.priceRate)


                material.sum= Math.round((material.priceForSale*material.qty)*100)/100
                rn.sum+=material.sum
                rn.materials.push(material);
            })
            //await Rn.update({_id:rn._id},{$set:{materials:rn.materials,sum:rn.sum}})


            /*let rnHoldResult = await RnController.holdController(rn._id,req.store)

            if(rnHoldResult){
                return next(rnHoldResult)
            }*/

        }
        let act;
        if(works && works.length){
            act = {
                store:req.store._id,
                contrAgent:c._id.toString(),
                typeOfContrAgent :'Customer',
                virtualAccount:virtualAccount,
                date:Date.now(),
                currency:z.currency,
                name:'акт работ ',
                typeOfZakaz:"manufacture",
                zakaz:zak._id.toString(),
            }

            let zzz1 = await Act.find({store: req.store._id}).sort({num: -1}).limit(1).lean().exec();
            act.num = (zzz1.length && zzz1[0].num && Number(zzz1[0].num)) ? ( Number(zzz1[0].num) + 1 ): 1;
            act.name+=act.num;
            act.works=works;
            act = new Act(act);

            //await act.save()

            zak.acts=[act._id]
            //let r22 = await Zakaz.update({_id:zak._id},{$set:{acts:zak.acts}})
            act.sum=0
            works.forEach(w=>{
                act.sum+=w.price
                act.sumForWorker+=w.salary
            })
            //await Act.update({_id:act._id},{$set:{works:works,sum:act.sum,sumForWorker:act.sumForWorker}})
        }

        if(z.rnsExist){
            for(let rnId of z.rnsExist){
                zak.rns.push(rnId);
                /* обновление цен для расходных накладных уже проведенных*/
                let rn = await Rn.findOne({_id:rnId,store:req.store._id}).lean().exec();
                if(z.materialsFromRns && z.materialsFromRns.length){
                    for(let i =0;i<z.materialsFromRns.length;i++){
                        if(z.materialsFromRns[i].rn===rnId){
                            /*идентификация материала и проверка его цены в накладной и в счете
                            * если не совпадает, обновление цены в накладной*/

                            z.materialsFromRns.splice(i, 1);
                            i--;
                        }

                    }
                }


                await Rn.update({_id:rnId},{$set:{zakaz:zak._id}})
            }
        }
        /*деньги*/





        /*сохнаненеие и проводки*/
        for(let pn of pns){
            pn = new Pn(pn);
            if(!zak.pns){zak.pns=[]};
            zak.pns.push(pn._id.toString())
            await pn.save()
            let pnHoldResult = await PnController.holdController(pn._id,req.store)
            if(pnHoldResult){
                return next(pnHoldResult)
            }
        }
        /*сохраняем здесь так как не было айди для pn*/
        await zak.save();

        for(let rn of rns){
            await rn.save()
            let rnHoldResult = await RnController.holdController(rn._id,req.store)
            if(rnHoldResult){
                return next(rnHoldResult)
            }
        }

        if(act){
            await act.save()
            let actHoldResult = await ActController.holdController(act._id,req.store)
            if(actHoldResult){
                return next(actHoldResult)
            }
        }


        let zakazHoldResult = await holdZakaz(zak._id,req.store);
        if(zakazHoldResult){
            return next(zakazHoldResult)
        }

        return res.json({createByAPI: zak._id.toString()})





    }catch (err){
        return next(err)
    }



    //return res.json({createByAPI:'lskdjfl'});
    /*1. create virtualAccount
    * 2. create customer
    * 3. create materials
    * 32 create supplier
    * 33.create producer
    * 4. create rn
    * 5. create wokers
    * 6. create works
    * 7  create act
    * 8 create moneyOrders*/
}
exports.cancelByAPI = cancelByAPI;


async function cancelByAPI(req, res, next) {
    const zakaz = await Zakaz.findOne({_id:req.params.id}).lean().exec();
    if(!zakaz ||  !zakaz.actived){
        return res.json({msg:'ok'})
    }

    let  error = await cancelZakaz(req);
    console.log('отмена проводок zakaz')
    if(error){return next(error)}
    try {
        const zakaz = await Zakaz.findOne({_id:req.params.id}).lean().exec()
        /* отмена проводок*/
        for(let rn of zakaz.rns){
            console.log('rn',rn)
            let r = await RnController.cancelController(rn,req.store)
            if(r){
                return next(r)
            }
        }
        console.log('отмена проводок rn')
        for(let act of zakaz.acts){
            console.log('act',act)
            let r = await ActController.cancelController(act,req.store)
            if(r){
                return next(r)
            }
        }
        console.log('отмена проводок act')
        if(zakaz.pns){
            for(let pn of zakaz.pns){
                let r = await PnController.cancelController(pn,req.store)
                if(r){
                    return next(r)
                }
            }
        }
        console.log('отмена проводок pn')
        /* удаление документов */
        for(let rn of zakaz.rns){
            try {
                let r = await Rn.findByIdAndRemove(rn).exec();
            } catch (err) {
                return next(r)
            }
        }
        console.log('удаление rn')
        for(let act of zakaz.acts){
            try {
                let r = await Act.findByIdAndRemove(act).exec();
            } catch (err) {
                return next(r)
            }
        }
        console.log('удаление act')
        if(zakaz.pns){
            for(let pn of zakaz.pns){
                try {
                    let r = await Pn.findByIdAndRemove(pn).exec();
                } catch (err) {
                    return next(r)
                }
            }
        }
        try {
            let r = await Zakaz.findByIdAndRemove(zakaz._id).exec();
        } catch (err) {
            next(err)
        }


    }catch(err){
        next(err)
    }
    return res.json({msg:'ok'})
}








