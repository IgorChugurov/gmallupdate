'use strict';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var ObjectID = mongoose.Types.ObjectId;
var fs = require('fs');
var path = require('path');
var request=require('request');
var SA=mongoose.model('StockAdjustment');
var Pn=mongoose.model('Pn');
var Rn=mongoose.model('Rn');
var Zakaz=mongoose.model('Zakaz');
var Account=mongoose.model('Account');
var VirtualAccount=mongoose.model('VirtualAccount');
var Material=mongoose.model('Material');
var ClosePeriod=mongoose.model('ClosePeriod');
var calculate=require('../calculate');

exports.hold = async function(req, res, next) {
    const currency = req.store.currency
    const currencyArr = req.store.currencyArr
    try {
        const sa = await SA.findOne({_id:req.params.id}).populate('materials.item','currency').lean().exec();
        let virtualAccount=(sa.virtualAccount && sa.virtualAccount.toString)?sa.virtualAccount.toString():sa.virtualAccount;
        if(sa.actived){
            return next('документ проведен')
        }
        /*если есть проведенные документы позднее даты формирования остатков для инвентаризации
         * необходимо или изменить дату инвентаризации на более позднюю либо отменить проводку более поздних документов */
        let queryLastED = {store:req.store._id,actived:true,date:{$gte:sa.date},virtualAccount:virtualAccount}
        let doc = await Pn.findOne(queryLastED).lean().exec()
        if(doc){return next('проведена приходная накладная позднее даты инвентаризации - '+doc.name+', '+doc.date)}
        doc = await Rn.findOne(queryLastED).lean().exec()
        if(doc){return next('проведена расходная накладная позднее даты инвентаризации - '+doc.name+', '+doc.date)}
        let docs = await Zakaz.find(queryLastED).lean().exec()
        if(docs.some(d=>d.rns.length)){
            return next('проведен наряд-заказ позднее даты инвентаризации')
        }


        let saQuery={store:req.store._id,actived:true,date:{$gt:sa.date},virtualAccount:virtualAccount};
        let saNext = await SA.findOne(saQuery).sort({date : -1}).lean().exec()
        if(saNext){
            throw 'Есть проведенная инвентаризация с более поздней датой'
        }
        let queryForCP = {store:req.store._id,actived:true,date:{$gte:sa.date},virtualAccount:virtualAccount}
        let CP = await ClosePeriod.findOne(queryForCP).sort({date: -1}).lean().exec()
        if(CP){
            return next('документ не может быть проведен в закрытом периоде '+CP.name)
        }
        if(sa.materials && sa.materials.length){
            if(sa.materials.some(m=>(!m.item || (m.newQty && (!Number(m.newPriceForSale)||!Number(m.newPrice) || !m.newPrice))))) {
                return next('недопустимые значения ');
            }
        }

        try{
            let diff = calculateDiff(sa,currency)
            let query={store:req.store._id}
            let itemsFromBD = await Material.find(query).lean().exec();
            let error = await handleDataForGetBalances(req.store,virtualAccount,itemsFromBD,sa.date,sa,'active')
            if(error){throw error}
            const accounts = await Account.find({store:req.store._id}).lean().exec();
            /* проводки*/
            let accountWarehouse = accounts.find(a=>a.type=='Warehouse')._id.toString()
            let accountProfit = accounts.find(a=>a.type=='Profit')._id.toString()
            sa.entries=[];

            let ed={
                type:'sa',
                    _id:sa._id,
                    name:sa.name,
                    date:sa.date
            }
            for(let cur in diff){
                if(diff[cur]>0){
                    calculate.makeEntries(sa.entries,accountWarehouse,accountProfit,virtualAccount,diff[cur],ed,cur)
                }else if(diff[cur]<0){
                    calculate.makeEntries(sa.entries,accountProfit,accountWarehouse,virtualAccount,diff[cur],ed,cur)
                }
            }

            let r = await SA.update({_id:req.params.id},{$set:{diff:diff,entries:sa.entries,actived:true}})
            return res.json({diff:diff})

            /*data:[{
                virtualAccount:{type:Schema.ObjectId, ref : 'VirtualAccount'},// ссылка на виртуальный счет его id (подразделение)
                supplier:{type:Schema.ObjectId, refPath : 'data.supplierType'},
                supplierType:String,
                qty:{type:Number,default:0},
                price:{type:Number,default:0},
                priceForSale:{type:Number,default:0},
            }]
            materials:[{
                item:{type : Schema.ObjectId, ref : 'Material'},
                data:[{
                    supplier:{type:Schema.ObjectId, refPath : 'materials.data.supplierType'},
                    supplierType:String,
                    qty:{type:Number,default:0},
                    newQty:{type:Number,default:0},
                    price:{type:Number,default:0},
                    newPrice:{type:Number,default:0},
                    priceForSale:{type:Number,default:0},
                    newPriceForSale:{type:Number,default:0},
                }]
            }]*/


            /*обновление данных*/
            for(let saMaterial of sa.materials){
                let changed=false
                let material;
                for(let saD of saMaterial.data){
                    if(saD.qty!=saD.newQty){
                        material = await Material.findOne({_id:saMaterial.item}).exec()
                        let data = material.data.find(d=>{
                            //console.log(d.supplier,saD.supplier)
                            return ((d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount)==virtualAccount
                                && ((d.supplier && d.supplier.toString)?d.supplier.toString():d.supplier)==((saD.supplier && saD.supplier.toString)?saD.supplier.toString():saD.supplier)
                                && d.supplierType==saD.supplierType;
                        })
                        if(!data){
                            data= {
                                virtualAccount:virtualAccount,
                                supplierType:saD.supplierType,
                                supplier:saD.supplier
                            }
                            material.data.push(data)
                        }

                        data.qty=saD.newQty;
                        data.price=saD.newPrice;
                        data.priceForSale=saD.newPriceForSale;
                        changed=true;
                    }
                }

                if(changed){
                    material.data = material.data.filter(d=>d.supplier)
                    let {qty,price,priceForSale} = material.data.reduce((o,d)=>{
                        o.qty +=d.qty
                        o.price +=d.price*d.qty
                        o.priceForSale +=d.priceForSale*d.qty
                        return o;

                    },{qty:0,price:0,priceForSale:0})
                    material.qty=qty
                    material.price=(qty)?Math.round((price/qty)*100)/100:0;
                    material.priceForSale=(qty)?Math.round((priceForSale/qty)*100)/100:0;
                    await Material.update({_id:saMaterial.item},{$set:{data:material.data,qty:material.qty,price:material.price,priceForSale:material.priceForSale}})
                }
            }



        }catch(err){
            return next(err)
        }

    } catch (err) {
        next(err)
    }
}
exports.cancel = async function(req, res, next) {
    try {
        const sa = await SA.findOne({_id:req.params.id}).lean().exec();
        if(!sa.actived){
            return next('документ не проведен')
        }
        sa.entries=[];
        let r = await SA.update({_id:req.params.id},{$set:{entries:sa.entries,actived:false}})
        let virtualAccount=(sa.virtualAccount && sa.virtualAccount.toString)?sa.virtualAccount.toString():sa.virtualAccount;
        let query={store:req.store._id}
        let itemsFromBD = await Material.find(query).lean().exec();
        let error = await handleDataForGetBalances(req.store,virtualAccount,itemsFromBD,sa.date,sa,'cancel')
        return res.json({})

        /*обновление данных*/
        for(let saMaterial of sa.materials){
            let changed=false
            let material
            for(let saD of saMaterial.data){
                if(saD.qty!=saD.newQty){
                    material = await Material.findOne({_id:saMaterial.item}).exec()
                    let data = material.data.find(d=>{
                        return ((d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount)==virtualAccount
                            && ((d.supplier && d.supplier.toString)?d.supplier.toString():d.supplier)==((saD.supplier.toString)?saD.supplier.toString():saD.supplier)
                            && d.supplierType==saD.supplierType;
                    })
                    if(!data){
                        data= {
                            virtualAccount:virtualAccount,
                            supplierType:saD.supplierType,
                        }
                        material.data.push(data)
                    }
                    data.qty=saD.qty;
                    data.price=saD.price;
                    data.priceForSale=saD.priceForSale;
                    changed=true;
                }


            }
            if(changed){
                material.data = material.data.filter(d=>d.supplier)
                let {qty,price,priceForSale} = material.data.reduce((o,d)=>{
                    o.qty +=d.qty
                    o.price +=d.price*d.qty
                    o.priceForSale +=d.priceForSale*d.qty
                    return o;

                },{qty:0,price:0,priceForSale:0})
                material.qty=qty
                material.price=(qty)?Math.round((price/qty)*100)/100:0;
                material.priceForSale=(qty)?Math.round((priceForSale/qty)*100)/100:0;
                await Material.update({_id:saMaterial.item},{$set:{data:material.data,qty:material.qty,price:material.price,priceForSale:material.priceForSale}})
            }


        }




    } catch (err) {
        //console.log(err)
        next(err)

    }
}
exports.diff = diff;
async function diff(req, res, next) {
    const currency = req.store.currency
    try {
        const sa = await SA.findOne({_id:req.params.id}).populate('materials.item','currency').lean().exec();
        try{
            let diff = calculateDiff(sa,currency)
            let date = Date.now()
            let r = await SA.update({_id:req.params.id},{$set:{diff:diff,date:date}})
            return res.json({diff:diff})
        }catch(err){
            return next(err)
        }

    } catch (err) {
        //console.log(err)
        next(err)

    }
}
exports.setEmpty = setEmpty;
function setEmpty(req, res, next) {

};

async function diff(req, res, next) {
    const currency = req.store.currency
    try {
        const sa = await SA.findOne({_id:req.params.id}).populate('materials.item','currency').lean().exec();
        try{
            sa.materials.forEach(m=>{
                m.data.forEach(d=>{
                    d.newQty=0;
                })
            })
            let r = await sa.save()
            //let r = await SA.update({_id:req.params.id},{$set:{materials:sa.materials}})
            return res.json({msg:'ok'})
        }catch(err){
            return next(err)
        }

    } catch (err) {
        //console.log(err)
        next(err)

    }
}
function calculateDiff(sa,currency) {
    let diff=sa.materials.reduce((diffM,m)=>{
        const SAcurrency=(m.item.currency)?m.item.currency:'UAH';
        const SACurrencyRate=(currency[SAcurrency]&& currency[SAcurrency][0])?currency[SAcurrency][0]:1;
        //console.log(m)
        let sum = m.data.reduce((diffMM,mm)=>{
            /*let manQty={qty:0,newQty:0}
            if(mm.manufacture && mm.manufacture.length){
                mm.manufacture.forEach(man=>{
                    manQty.qty+=man.qty;
                    manQty.newQty+=man.newQty;
                })
            }
            let manS = (manQty.newQty -manQty.qty)*mm.price;*/
            //console.log(manQty,manS)

            let s = mm.newQty*mm.newPrice -mm.qty*mm.price;

            return diffMM+s;
        },0)
        sum=Math.round(sum*100)/100
        if(!diffM[m.item.currency]){
            diffM[m.item.currency]=0;
        }
        diffM[m.item.currency]+=sum
        return diffM
    },{})
    return diff;
}


exports.makeBalances = async function (req, res, next) {
    try {

        let Model = Material, virtualAccounts, sa, middleDate

        if (req.params.id == 'allVirtualAccounts') {
            /*формирование остатков по материалам  на текущую дату по всем подразделениям*/
            virtualAccounts = await VirtualAccount.find({store: req.store._id, actived: true}).lean().exec();
            virtualAccounts = virtualAccounts.map(va => ((va._id.toString) ? va._id.toString() : va._id))
            middleDate = new Date();
        } else if (req.query.sa) {
            /*формирование остатков по материалам  дату */
            sa = await SA.findOne({_id: req.query.sa}).lean().exec()
            if(sa.actived){
                return next('инвентаризация проведена')
            }
            let virtualAccount = (sa.virtualAccount.toString) ? sa.virtualAccount.toString() : sa.virtualAccount;
            /*если есть проведенные документы позднее даты формирования остатков для инвентаризации
             * необходимо или изменить дату инвентаризации на более позднюю либо отменить проводку более поздних документов */
            let queryLastED = {store:req.store._id,actived:true,date:{$gte:sa.date},virtualAccount:virtualAccount}
            let doc = await Pn.findOne(queryLastED).lean().exec()
            if(doc){return next('проведена приходная накладная позднее даты инвентаризации - '+doc.name+', '+doc.date)}
            doc = await Rn.findOne(queryLastED).lean().exec()
            if(doc){return next('проведена расходная накладная позднее даты инвентаризации - '+doc.name+', '+doc.date)}
            let docs = await Zakaz.find(queryLastED).lean().exec()
            if(docs.some(d=>d.rns.length)){
                return next('проведен наряд-заказ позднее даты инвентаризации')
            }
            virtualAccounts = [virtualAccount]
            middleDate = sa.date;
        } else {
            virtualAccounts = await VirtualAccount.find({store: req.store._id, actived: true}).lean().exec();
            virtualAccounts = virtualAccounts.map(va => ((va._id.toString) ? va._id.toString() : va._id)).filter(va => va === req.params.id)
            middleDate = new Date();
        }
        if (!virtualAccounts || !virtualAccounts.length) {
            return next('нет такого подразделения')
        }

        //console.log('virtualAccounts',virtualAccounts)

        for (let virtualAccount of virtualAccounts) {
            let query = {store: req.store._id}
            let itemsFromBD = await Material.find(query).lean().exec();
            /* вытаскиваем весь склад*/
            let error = await handleDataForGetBalances(req.store, virtualAccount, itemsFromBD, middleDate, sa)
            if (error) {
                throw error;
            }
        }

        return res.json({msg: 'ok'})
    } catch (err) {
        console.log(err)
        next(err);
    }

};

exports.warehouseSaldo= async function (req, res, next) {
    /*console.log(req.params)
    console.log(req.query)*/
    //let virtalAccount ="5b9cb3879d9b4a0585a0cb7b";
    let virtalAccount ="5ba0fd23283d295769190268";
    let start = new Date(req.params.start)
    let end = new Date(req.params.end)
    try{
        let result = await warehouseSaldo(req.store,virtalAccount,start,end)
        res.json(result)
    }catch(err){
        console.log(err);
        return next(err)
    }





}

async function warehouseSaldo(store,virtualAccount,start,end) {
    try{
        let queryM = {store: store._id}
        let itemsFromBD = await Material.find(queryM).lean().exec();
        let error;
        let currancyArr=store.currencyArr
        /*находим предыдущую проведенную инвентаризацию по данному подразделению и счету ранее даты инвентаризации или текущей даты*/
        let saQuery={store:store._id,actived:true,date:{$lt:start},virtualAccount:virtualAccount};
        let saPrevious = await SA.findOne(saQuery).sort({date : -1}).lean().exec()
        /* запрос для выборки  - проведенные документы ранее даты инветаризации или ранее даты формирования остатков*/
        let query = {store:store._id,actived:true,date:{$lt:start},virtualAccount:virtualAccount}
        /*если есть пердыдущая инвентаризация, документы позднее ее даты, если нет то с начала времен*/
        if(saPrevious){
            let d =new Date(saPrevious.date)
            //console.log(d.toString())
            query.date.$gte=saPrevious.date;
        }
        /* массив для расчетных данных*/
        let itemsO={}

        /*формируем список позиций по инвентаризируемому счету с остатками по предыдущей инвентаризации если она есть или нулевыми остатками*/
        itemsFromBD.forEach(function (item) {
            let itemId = (item._id.toString)?item._id.toString():item._id;
            let d = [];
            let o ={
                item:itemId,
                currency:item.currency,
                data:d,
                dataO:{},
                name:item.name,
                sku:item.sku,
            }
            itemsO[itemId]=o;

            //items.push(o)
            let previousData;
            /* если есть предыдущая инвентаризация находим данные для начального остатка для текущей позиции*/
            //console.log('saPrevious',saPrevious)
            if(saPrevious){
                let previosItem = saPrevious.materials.find(ip=>{
                    let id = (ip.item.toString)?ip.item.toString():ip.item;
                    return id==itemId
                })
                //console.log('previosItem.data',item.name,previosItem.data)
                if(previosItem){
                    previosItem.data.forEach(d=>{
                        let supplier = (d.supplier.toString)?d.supplier.toString():d.supplier;
                        o.dataO[supplier+'_'+virtualAccount]=d;
                        d.virtualAccount=virtualAccount;d.price=d.newPrice;d.qty=d.newQty;d.priceForSale=d.newPriceForSale;
                        //console.log(supplier+'_'+virtualAccount,o.dataO[supplier+'_'+virtualAccount])
                    });
                    /*o.data=previosItem.data.map(d=>{
                     d.virtualAccount=virtualAccount;d.price=d.newPrice;d.qty=d.newQty;d.priceForSale=d.newPriceForSale;зь2 ыещз фссщгте
                     тщву фссщгте

                     return d
                     });*/
                }
            }
        })
        /*акамулируем */
        /*приход и расход материалов*/
        error = await  handlePns(query,itemsO)
        if(error){throw error}
        error = await handleRns(query,itemsO)
        if(error){throw error}
        error = await handleZakaz(query,itemsO)
        if(error){throw error}

        /*собираем сальдо*/
        let saldo={
            start:{},
            end:{},
        }
        for(let k in itemsO){
            //console.log(itemsO[k].dataO)
            if(itemsO[k].dataO){
                itemsO[k].start=0;
                for(let kk in itemsO[k].dataO){
                    let s = itemsO[k].dataO[kk].price*itemsO[k].dataO[kk].qty
                    s= Math.round(s*100)/100
                    if(!saldo.start[itemsO[k].currency]){
                        saldo.start[itemsO[k].currency]=0;
                    }
                    saldo.start[itemsO[k].currency]+=s
                    itemsO[k].start+=s;
                }
            }
        }

        /* вычисление текущих остатков для позиций*/
        /* 1. проведенные документы позднее даты инветаризации*/
        let queryLastED = {store:store._id,actived:true,virtualAccount:virtualAccount};
        queryLastED.date={$gte:start,$lt:end};
        /*акамулируем */
        /*приход и расход материалов*/
         error = await  handlePns(queryLastED,itemsO)
         if(error){throw error}
         error = await handleRns(queryLastED,itemsO)
         if(error){throw error}
         error = await handleZakaz(queryLastED,itemsO)
         if(error){throw error}
        let materials2=[];
        saldo.deltaPlus={};
        saldo.deltaMinus={};
        for(let k in itemsO){
            //console.log(itemsO[k].dataO)
            if(itemsO[k].dataO){
                itemsO[k].end=0;
                for(let kk in itemsO[k].dataO){
                    let s = itemsO[k].dataO[kk].price*itemsO[k].dataO[kk].qty
                    s= Math.round(s*100)/100
                    if(!saldo.end[itemsO[k].currency]){
                        saldo.end[itemsO[k].currency]=0;
                    }
                    saldo.end[itemsO[k].currency]+=s
                    itemsO[k].end+=s;

                }
                itemsO[k].deltaPlus=0;
                itemsO[k].deltaMinus=0;
                let d = itemsO[k].end-itemsO[k].start;
                if(d>0){
                    itemsO[k].deltaPlus=Math.round(d*100)/100;
                    if(!saldo.deltaPlus[itemsO[k].currency]){saldo.deltaPlus[itemsO[k].currency]=0}
                    saldo.deltaPlus[itemsO[k].currency]+=itemsO[k].deltaPlus;
                }else{
                    itemsO[k].deltaMinus=Math.round(Math.abs(d)*100)/100;
                    if(!saldo.deltaMinus[itemsO[k].currency]){saldo.deltaMinus[itemsO[k].currency]=0}
                    saldo.deltaMinus[itemsO[k].currency]+=itemsO[k].deltaMinus;
                }
            }
            let o ={
                name:itemsO[k].name,
                sku:itemsO[k].sku,
                currency:itemsO[k].currency,
                start:itemsO[k].start,
                end:itemsO[k].end,
                deltaPlus:itemsO[k].deltaPlus,
                deltaMinus:itemsO[k].deltaMinus,
            }
            materials2.push(o)
        }
        //console.log(saldo)
        for(let k in saldo.start){
            saldo.start[k]=Math.round(saldo.start[k]*100)/100
        }
        for(let k in saldo.end){
            saldo.end[k]=Math.round(saldo.end[k]*100)/100
        }

        saldo.materials = materials2.sort(function (a,b) {
            return a.currency-b.currency
        }).filter(m=>m.start&&m.end);

        currancyArr.forEach(c=>{
            try{
                let d = saldo.end[c]-saldo.start[c];
                /*if(d>0){
                    saldo.deltaPlus[c]=d;
                }else{
                    saldo.deltaMinus[c]=Math.abs(d);
                }*/
            }catch(err){
                console.log(err)
            }

        })

        return saldo;
    }catch(err){
        console.log(err)
        return err
    }

}

/*
* 1. Создаем список материалов с пустым data
* 2. Надодим предыдущую инвентаризацию
* если есть занасим остатки в текущий список материалов
* и меняем метку времени для выбоки документов. не от начала времен, а с даты предыдущей инвентаризации
* 3. Обрабанываем документы и формируем остатки
* 4. если есть инвентаризация обновляем ее список материалов
*
*
*
*
*
*
* */

async function handleDataForGetBalances(store,virtualAccount,itemsFromBD,middleDate,sa,activeteSA) {
    try{
        let error;
        let currancyArr=store.currencyArr
        /*находим предыдущую проведенную инвентаризацию по данному подразделению и счету ранее даты инвентаризации или текущей даты*/
        let saQuery={store:store._id,actived:true,date:{$lt:middleDate},virtualAccount:virtualAccount};
        let saPrevious = await SA.findOne(saQuery).sort({date : -1}).lean().exec()
        /* запрос для выборки  - проведенные документы ранее даты инветаризации или ранее даты формирования остатков*/
        let query = {store:store._id,actived:true,date:{$lt:middleDate},virtualAccount:virtualAccount}
        /*если есть пердыдущая инвентаризация, документы позднее ее даты, если нет то с начала времен*/
        if(saPrevious){
            let d =new Date(saPrevious.date)
            //console.log(d.toString())
            query.date.$gte=saPrevious.date;
        }
        //console.log('query',query)
        /* массив для расчетных данных*/
        //let items =[];
        let itemsO={}

        /*формируем список позиций по инвентаризируемому счету с остатками по предыдущей инвентаризации если она есть или нулевыми остатками*/
        itemsFromBD.forEach(function (item) {
            let itemId = (item._id.toString)?item._id.toString():item._id;
            let d = [];
            let o ={
                item:itemId,
                currency:item.currency,
                data:d,
                dataO:{}
            }
            itemsO[itemId]=o;

            //items.push(o)
            let previousData;
            /* если есть предыдущая инвентаризация находим данные для начального остатка для текущей позиции*/
            //console.log('saPrevious',saPrevious)
            if(saPrevious){
                let previosItem = saPrevious.materials.find(ip=>{
                    let id = (ip.item.toString)?ip.item.toString():ip.item;
                    return id==itemId
                })
                //console.log('previosItem.data',item.name,previosItem.data)
                if(previosItem){
                    previosItem.data.forEach(d=>{
                        let supplier = (d.supplier.toString)?d.supplier.toString():d.supplier;
                        o.dataO[supplier+'_'+virtualAccount]=d;
                        d.virtualAccount=virtualAccount;d.price=d.newPrice;d.qty=d.newQty;d.priceForSale=d.newPriceForSale;
                        //console.log(supplier+'_'+virtualAccount,o.dataO[supplier+'_'+virtualAccount])
                    });
                    /*o.data=previosItem.data.map(d=>{
                        d.virtualAccount=virtualAccount;d.price=d.newPrice;d.qty=d.newQty;d.priceForSale=d.newPriceForSale;зь2 ыещз фссщгте
                        тщву фссщгте

                        return d
                    });*/
                }
            }
        })
        /*акамулируем */
        /*приход и расход материалов*/
        error = await  handlePns(query,itemsO)
        if(error){throw error}
        error = await handleRns(query,itemsO)
        if(error){throw error}
        error = await handleZakaz(query,itemsO)
        if(error){throw error}


        if(sa){
               if(activeteSA && activeteSA=='cansel'){

               }else if(activeteSA && activeteSA=='active'){
                   /*записываем новые отстаки в остатки для материалов*/
                   sa.materials.forEach(mm=>{
                       let idMaterialFromSA = (mm.item._id.toString)?mm.item._id.toString():mm.item;
                       //console.log(idMaterialFromSA)
                       if(itemsO[idMaterialFromSA]){
                           let  materialFromItems=itemsO[idMaterialFromSA];
                           mm.data.forEach(d=>{
                               console.log(d)
                               let supplierD=(d.supplier.toString)?d.supplier.toString():d.supplier
                               //console.log(supplierD+'_'+virtualAccount)
                               if(materialFromItems.dataO[supplierD+'_'+virtualAccount]){
                                   let dataMaterialFromItems=materialFromItems.dataO[supplierD+'_'+virtualAccount]
                                   //console.log(dataMaterialFromItems.qty,dataMaterialFromItems.newQty)
                                   dataMaterialFromItems.qty=d.newQty
                                   dataMaterialFromItems.price=d.newPrice
                                   dataMaterialFromItems.priceForSale=d.newPriceForSale
                               }else {
                                   /*если были новые материалы добавлены в инвентаризацию*/
                                   materialFromItems.dataO[supplierD+'_'+virtualAccount]={
                                       virtualAccount:virtualAccount,
                                       supplier:supplierD,
                                       supplierType:d.supplierType,
                                       qty:d.newQty,
                                       price:d.newPrice,
                                       priceForSale:d.newPriceForSale
                                   }
                               }

                           })
                       }
                   })

                   /*items.forEach(mm=>{
                       let idMaterialFromItems = (mm.item.toString)?mm.item.toString():mm.item;
                       let materialFromSA = sa.materials.find(mfsa=>{
                           let itemId = (mfsa.item && mfsa.item._id.toString)?mfsa.item._id.toString():mfsa.item._id;
                           return itemId===idMaterialFromItems
                       })
                       if(materialFromSA){
                           mm.data.forEach(d=>{
                               let supplierD=(d.supplier.toString)?d.supplier.toString():d.supplier
                               let dataMaterialFromSA=materialFromSA.data.find(dd=>{
                                   let supplierDd=(dd.supplier.toString)?dd.supplier.toString():dd.supplier
                                   return supplierD==supplierDd && d.suplierType==dd.suplierType
                               })
                               if(dataMaterialFromSA){
                                   dataMaterialFromSA.qty=d.newQty
                                   dataMaterialFromSA.price=d.newPrice
                                   dataMaterialFromSA.priceForSale=d.newPriceForSale
                               }else{
                                   let dd = Object.assign({},d)
                                   dd.virtualAccount=virtualAccount;
                                   dd.newQty=dd.qty;
                                   dd.newPrice=dd.price;
                                   dd.newPriceForSale=dd.priceForSale;
                                   materialFromSA.data.push(dd)
                               }

                           })
                       }else{

                           let mmm = Object.assign({},mm);
                           mmm.data.forEach(d=>{d.virtualAccount=virtualAccount;d.newPrice=d.price;d.newQty=d.qty;d.newPriceForSale=d.priceForSale;})
                           console.log(mmm)
                           sa.materials.push(mmm)
                       }
                   })*/
                   let result = await SA.update({_id:sa._id},{$set:{materials:sa.materials}})
               }else if (!activeteSA){
                   /*формируются остатки для инвентаризации на дату ее возможного проведения*/
                   let materials=[]
                   itemsFromBD.forEach(function (item) {
                       let itemId = (item._id.toString)?item._id.toString():item._id;
                       let m = {
                           n:item.name,
                           item:itemsO[itemId].item,
                           currency:itemsO[itemId] .currency,
                           data:[]
                       }
                       let ids = Object.keys(itemsO[itemId].dataO);
                       if(ids && ids.length){
                           ids.forEach(id=>{
                               let d =JSON.parse(JSON.stringify(itemsO[itemId].dataO[id]));
                               d.newQty=d.qty;
                               d.newPrice=d.price;
                               d.newPriceForSale=d.priceForSale;
                               if(d.manufacture && d.manufacture.length){
                                   d.manufacture.forEach(man=>{
                                       man.newQty=man.qty
                                   })
                               }
                               m.data.push(d)
                               /*if(itemId=='5b9e481aade3862a30f75222'){
                                   console.log('data',d)
                               }*/
                           })
                           materials.push(m)
                       }

                   })
                   materials.sort((a,b)=>{return b.n-a.n})



                   //console.log('materials',materials)
                   let result = await SA.update({_id:sa._id},{$set:{materials:materials,diff:{}}})
               }




            /* а затем после сохранения данных произвести расчет остатков исходя из новых значений*/
            /*if(activeteSA){
                items.forEach(mm=>{
                    mm.data.forEach(d=>{
                        d.qty=d.newQty;
                        d.price=d.newPrice;
                        d.priceForSale=d.newPriceForSale;
                        if(d.manufacture && d.manufacture.length){
                            d.manufacture.forEach(man=>{
                                man.newQty=man.qty
                            })
                        }
                    })
                })
            }*/

            /* вычисление текущих остатков для позиций*/
            /* 1. проведенные документы позднее даты инветаризации*/
            //let queryLastED = {store:store._id,actived:true,date:{$gte:sa.date},virtualAccount:virtualAccount}
            /*акамулируем */
            /*приход и расход материалов*/
           /* error = await  handlePns(queryLastED,itemsO)
            if(error){throw error}
            error = await handleRns(queryLastED,itemsO)
            if(error){throw error}
            error = await handleZakaz(queryLastED,itemsO)
            if(error){throw error}*/

        }

        /*обновляем данные для  позиций*/
        for (let itemFromDB of itemsFromBD){
            /*сначала удаляем все данные для подразделения*/

            itemFromDB.data = itemFromDB.data.filter(d=>d.virtualAccount).filter(d=>{
                return ((d.virtualAccount && d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount)!=virtualAccount
            })
            let itemFromDBId =(itemFromDB._id.toString)?itemFromDB._id.toString():itemFromDB._id;
            let material=itemsO[itemFromDBId];
            for(let k in material.dataO){
                material.data.push(material.dataO[k])
            }
            //let material = items.find(itt=>((itt.item.toString)?itt.item.toString():itt.item)==((itemFromDB._id.toString)?itemFromDB._id.toString():itemFromDB._id))
            //console.log('material',material.data)
            itemFromDB.data = itemFromDB.data.concat(material.data)
            let result = await Material.update({_id:itemFromDB._id},{$set:{data:itemFromDB.data}})

        }
    }catch(err){
        console.log(err)
        return err
    }

}




async function handlePns(query,items) {
    let virtualAccount=query.virtualAccount;
    try{
        /*приходные накладные*/
        //console.log(query)
        let docs= await Pn.find(query).lean().exec()
        //console.log(docs)
        docs.forEach(pn=>{
            //console.log('pn',doc)
            const currency= pn.currencyData
            const pnCurrency=(pn.currency)?pn.currency:'UAH';
            const pnCurrencyRate=(currency[pnCurrency]&& currency[pnCurrency][0])?currency[pnCurrency][0]:1;
            pn.materials.forEach(m=>{
                //console.log(m)
                let mId=(m.item.toString)?m.item.toString():m.item;
                let item=items[mId];
                //let item= items.find(it=>it.item==((m.item.toString)?m.item.toString():m.item));
                let materialCurrency = (item.currency)?item.currency:'UAH';
                let materialCurrencyRate =(currency[materialCurrency]&& currency[materialCurrency][0])?currency[materialCurrency][0]:1;
                let rate =pnCurrencyRate/materialCurrencyRate
                /*5ba1000cf7e9400919e433fe_5b9cb3879d9b4a0585a0cb7b { qty: 1,
                    newQty: 1,
                    price: 10,
                    newPrice: 10,
                    priceForSale: 12.5,
                    newPriceForSale: 12.5,
                    manufacture: [],
                    _id: 5bd32973e9a76c7db66ae46b,
                    supplierType: 'Supplier',
                    supplier: 5ba1000cf7e9400919e433fe,
                    virtualAccount: '5b9cb3879d9b4a0585a0cb7b' }*/

                if(item){
                    //console.log()
                    let pnContrAgentId =(pn.contrAgent.toString)?pn.contrAgent.toString():pn.contrAgent;
                    let data = item.dataO[pnContrAgentId+'_'+virtualAccount]
                    //console.log('data',data)
                    //let data =item.data.find(it=>it.supplierType==pn.typeOfContrAgent && ((it.supplier.toString)?it.supplier.toString():it.supplier)==((pn.contrAgent.toString)?pn.contrAgent.toString():pn.contrAgent))
                    if(!data){
                        data ={virtualAccount:virtualAccount,supplier:pn.contrAgent,supplierType:pn.typeOfContrAgent,qty:0,price:0,priceForSale:0,}
                        //item.data.push(data)
                        item.dataO[pnContrAgentId+'_'+virtualAccount]=data;
                    }
                    //console.log('befor',data)
                    calculate.pn_getPriceAndPriceForSaleForMaterialData(m,data,rate)
                    //console.log('after',data)
                }
            })


        })
    }catch (err){return err}

}
async function handleRns(query,items) {
    //console.log('handleRns')
    try{
        /*приходные накладные*/
        let q = JSON.parse(JSON.stringify(query))
        delete q.actived;
        q.$or=[{actived:true},{reserve:true}]
        //console.log(q)
        let docs= await Rn.find(q).lean().populate('materials.item','name sku').exec()

        for(let rn of docs) {
            //console.log(rn.name,rn.actived,rn.reserve)
            if(rn.reserve){
                let r = await Rn.update({_id:rn._id},{$set:{reserve:false}})
                //console.log(r)
            }else{
                const virtualAccount = (rn.virtualAccount && rn.virtualAccount.toString)?rn.virtualAccount.toString():rn.virtualAccount;
                const rnId = (rn._id && rn._id.toString)?rn._id.toString():rn._id;

                rn.materials.forEach(m=>{
                    let supplier = (m.supplier && m.supplier.toString)?m.supplier.toString():m.supplier;
                    let mId=(m.item._id.toString)?m.item._id.toString():m.item._id;
                    let item=items[mId];
                    //let item= items.find(it=>it.item==((m.item.toString)?m.item.toString():m.item));
                    if(item){
                        //console.log(item.data)
                        /*let mData = item.data.find(function (d) {

                            let dVA = (d.virtualAccount && d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount
                            return dVA==virtualAccount && (d.supplier.toString()==supplier) && d.supplierType===m.supplierType;
                        })*/

                        let mData=item.dataO[supplier+'_'+virtualAccount];
                        /*if(mId=='5b9e481aade3862a30f75222'){
                            console.log('mData',mData)
                        }*/
                        if(!mData){
                            mData ={virtualAccount:virtualAccount,supplier:rn.contrAgent,supplierType:rn.typeOfContrAgent,qty:0,price:0,priceForSale:0,}
                            //item.data.push(data)
                            item.dataO[supplier+'_'+virtualAccount]=mData;
                        }
                        /*if(mId=='5b9e481aade3862a30f75222'){
                            console.log('mData',mData)
                        }*/
                        if(mData){
                            if(mData.reserve && mData.reserve.length){
                                mData.reserve=[];
                            }
                            /******************************/
                            mData.qty-=m.qty
                            mData.qty=Math.round(mData.qty*100)/100;
                            if(mData.qty<0){
                                throw 'На складе меньшее количесво чем в накладной '+m.item.name+' '+m.item.sku
                            }
                            if(rn.typeOfZakaz=='manufacture'){
                                if(!mData.manufacture){
                                    mData.manufacture=[];
                                }
                                let rD = mData.manufacture.find(rd=>{
                                    return ((rd.rn && rd.rn.toString)?rd.rn.toString():rd.rn)==rnId
                                })
                                if(!rD){
                                    rD={
                                        qty:0,
                                        rn:rnId
                                    }
                                    mData.manufacture.push(rD)
                                }
                                rD.qty=m.qty
                            }
                        }
                    }
                })
            }
        }
    }catch (err){
        console.log(err)
        return err}

}

async function handleZakaz(query,items) {
    try{
        /*наряд заказы*/
        let docs= await Zakaz.find(query).populate('rns').lean().exec()
        for(let zakaz of docs) {
            const virtualAccount = (zakaz.virtualAccount && zakaz.virtualAccount.toString)?zakaz.virtualAccount.toString():zakaz.virtualAccount;
            const zakazId = (zakaz._id && zakaz._id.toString)?zakaz._id.toString():zakaz._id;
            let materialsFromRns=[];
            let ids= new Set;
            for(let rn of zakaz.rns){
                let rnId = (rn._id && rn._id.toString)?rn._id.toString():rn._id;
                rn.materials.forEach(m=>{
                    m.rnId=rnId;
                    materialsFromRns.push(m);
                    ids.add(m.item)
                })

            }
            for(let m of materialsFromRns){

                //let material= items.find(it=>it.item==((m.item.toString)?m.item.toString():m.item));
                let mId=(m.item.toString)?m.item.toString():m.item;
                let material=items[mId];
                let supplier = (m.supplier && m.supplier.toString)?m.supplier.toString():m.supplier;


                let mData=material.dataO[supplier+'_'+virtualAccount];
                /* такой товар на таком складе от такого поставщика уже существует*/
                if(!mData){
                    mData ={virtualAccount:virtualAccount,supplier:supplier,supplierType:m.supplierType,qty:0,price:0,priceForSale:0,}
                    //item.data.push(data)
                    material.dataO[supplier+'_'+virtualAccount]=mData;
                }
                if(mData){
                    /* списываем c производствa*/
                    if(!mData.manufacture){
                        mData.manufacture=[];
                    }
                    mData.manufacture=mData.manufacture.filter(rd=>((rd.rn && rd.rn.toString)?rd.rn.toString():rd.rn)!=m.rnId)
                }
            }
        }
    }catch (err){
        return err
    }
}











