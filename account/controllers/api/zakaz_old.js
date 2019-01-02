'use strict';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var ObjectID = mongoose.Types.ObjectId;
var fs = require('fs');
var path = require('path');
var request=require('request');
var Rn=mongoose.model('Rn');
var Material=mongoose.model('Material');
var Zakaz=mongoose.model('Zakaz');

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
var Account=mongoose.model('Account');
var calculate=require('../calculate');
var globalVariable = require('../../../public/bookkeep/scripts/variables.js')



exports.hold = async function(req, res, next) {
    const currency = req.store.currency
    const mainCurrency=(req.store.currency.mainCurrency)?req.store.currency.mainCurrency:'UAH'
    const currencyArr = req.store.currencyArr
    try {
        const zakaz = await Zakaz.findOne({_id:req.params.id}).populate('contrAgent').populate('rns').populate('acts').lean().exec()
        const zakazCurrency=(zakaz.currency)?zakaz.currency:mainCurrency;
        const zakazCurrencyRate=(currency[zakazCurrency]&& currency[zakazCurrency][0])?currency[zakazCurrency][0]:1;
        if(zakaz.actived){
            return next('документ проведен')
        }
        if(!zakaz.worker){
            return next('не установлен сотрудник')
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
                return next('расходная накладная '+rn.name+ ' не проведена!')
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
        for(let act of zakaz.acts){
            if(!act.actived){
                return next('акт работ '+act.name+ ' не проведен!')
            }
            actsSum[act.currency]+=act.sum
            actsSumForWorker[act.currency]+=act.sumForWorker
        }
        let totalSumRate=0,totalUchetRate=0,totalSumWorkerRate=0,totalActRate=0;
        for(let c of currencyArr){
            totalSum[c]=rnsSum[c]+actsSum[c]
            totalUchet[c]=rnsSumUchet[c];
            totalSumWorker[c]=rnsSumForWorker[c]+actsSumForWorker[c];

            let rate=(currency[c]&& currency[c][0])?currency[c][0]:1;
            totalSumRate+=Math.round((totalSum[c]/rate)*100)/100
            totalUchetRate+=Math.round((totalUchet[c]/rate)*100)/100
            totalSumWorkerRate+=Math.round((totalSumWorker[c]/rate)*100)/100
            totalActRate+=Math.round((actsSum[c]/rate)*100)/100
        }
        totalSumRate=Math.round(totalSumRate*100)/100
        totalUchetRate=Math.round(totalUchetRate*100)/100
        totalSumWorkerRate=Math.round(totalSumWorkerRate*100)/100
        totalActRate=Math.round(totalActRate*100)/100
        console.log('totalSumRate',totalSumRate)
        console.log('totalUchetRate',totalUchetRate)
        console.log('totalSumWorkerRate',totalSumWorkerRate)
        console.log('totalActRate',totalActRate)
        /*console.log('rnsSum',rnsSum)
        console.log('rnsSumUchet',rnsSumUchet)
        console.log('rnsSumForWoker',rnsSumForWorker)
        console.log('actsSum',actsSum)
        console.log('actsSumForWoker',actsSumForWorker)*/
        if(!zakaz.contrAgent){
            return next('не установлен контрагент!')
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


        /***************************проводки *************/
        zakaz.entries=[];
        const accounts = await Account.find({store:req.store._id}).lean().exec();
        let accountCustomer = accounts.find(a=>a.type==zakaz.typeOfContrAgent)._id.toString()
        let accountRealcost = accounts.find(a=>a.type=='Realcost')._id.toString()
        let accountRealcostwork = accounts.find(a=>a.type=='Realcostwork')._id.toString()
        let accounIncome = accounts.find(a=>a.type=='Income')._id.toString()
        let accounIncomeWork = accounts.find(a=>a.type=='Incomework')._id.toString()
        let accounFinresult = accounts.find(a=>a.type=='Finresult')._id.toString()
        let accountManufacture = accounts.find(a=>a.type=='Manufacture')._id.toString()
        /*1 валовый доход материалы*/
        ed.comment='Валовый доход материалы'
        calculate.makeEntries(zakaz.entries,accountCustomer,accounIncome,virtualAccount,totalSumRate,ed)
        /*2 валовый доход работы*/
        ed.comment='Валовый доход работы'
        calculate.makeEntries(zakaz.entries,accountCustomer,accountRealcostwork,virtualAccount,totalActRate,ed)
        /*3 себестоимость материалов*/
        ed.comment='Себестоимость материалов'
        calculate.makeEntries(zakaz.entries,accountRealcost,accountManufacture,virtualAccount,totalUchetRate,ed)
        /*4 Стоимость работ(зп)*/
        ed.comment='Стоимость работ(зп)'
        calculate.makeEntries(zakaz.entries,accountRealcostwork,accountManufacture,virtualAccount,totalSumWorkerRate,ed)
        /*5 валовый доход материалы*/
        ed.comment='Валовый доход материалы на финрезультат'
        calculate.makeEntries(zakaz.entries,accounIncome,accounFinresult,virtualAccount,totalSumRate,ed)
        /*6 валовый доход работы*/
        ed.comment='Валовый доход работы на финрезультат'
        calculate.makeEntries(zakaz.entries,accountRealcostwork,accounFinresult,virtualAccount,totalActRate,ed)
        /*7 себестоимость материалов*/
        ed.comment='Себестоимость материалов на финрезультат'
        calculate.makeEntries(zakaz.entries,accounFinresult,accountRealcost,virtualAccount,totalUchetRate,ed)
        /*7 Стоимость работ(зп)*/
        ed.comment='Стоимость работ(зп) на финрезультат'
        calculate.makeEntries(zakaz.entries,accounFinresult,accountRealcostwork,virtualAccount,totalSumWorkerRate,ed)

        let r = await Zakaz.update({_id:req.params.id},{$set:{actived:true,entries: zakaz.entries,totalSum:totalSum,totalSumWorker:totalSumWorker,totalUchet:totalUchet}});

        console.log('done')
        return res.json({msg:'ok'})

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
        next(err)

    }
}

exports.cancel = async function cancel(req, res, next) {
    const currency = req.store.currency
    const mainCurrency=(req.store.currency.mainCurrency)?req.store.currency.mainCurrency:'UAH'
    const currencyArr = req.store.currencyArr
    try {
        const zakaz = await Zakaz.findOne({_id:req.params.id}).populate('contrAgent').populate('rns').populate('acts').lean().exec()
        const zakazCurrency=(zakaz.currency)?zakaz.currency:mainCurrency;
        const zakazCurrencyRate=(currency[zakazCurrency]&& currency[zakazCurrency][0])?currency[zakazCurrency][0]:1;
        if(!zakaz.actived){
            return next('документ не проведен')
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
                return next('расходная накладная '+rn.name+ ' не проведена!')
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
                return next('акт работ '+act.name+ ' не проведен!')
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
            return next('не установлен контрагент!')
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

        return res.json({})

        console.log('done')
        res.json({msg:'ok'})

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
        next(err)

    }
}










