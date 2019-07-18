'use strict';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var ObjectID = mongoose.Types.ObjectId;
var fs = require('fs');
var path = require('path');
var request=require('request');
var Rn=mongoose.model('Rn');
var Pn=mongoose.model('Pn');
var PnController=require('./pn');
var Material=mongoose.model('Material');
var SA=mongoose.model('StockAdjustment');
var Supplier=mongoose.model('Supplier');
var Customer=mongoose.model('Customer');
var Worker=mongoose.model('Worker');
var Founder=mongoose.model('Founder');
var Contragent=mongoose.model('Contragent');
var Producer=mongoose.model('Producer');
const Models={
    Supplier:Supplier,
    Customer:Customer,
    Worker:Worker,
    Founder:Founder,
    Contragent:Contragent
}
var ClosePeriod=mongoose.model('ClosePeriod');
var Account=mongoose.model('Account');
var VirtualAccount=mongoose.model('VirtualAccount');
var calculate=require('../calculate');
var globalVariable = require('../../../public/bookkeep/scripts/variables.js')
const ports = require('../../../modules/ports')
const stuffHost = 'http://127.0.0.1:'+ports.stuffPort;
var request=require('request');
var rp = require('request-promise');
exports.reserveHold = async function(req, res, next) {
    let error = await reserveHold(req.params.id, req.store);
    if (error) {
        next(error)
    } else {
        res.json({msg: 'ok'})
    }
}
async function reserveHold(id,store) {

    try {
        let stuffs=[];
        const rn = await Rn.findOne({_id:id}).lean().exec();
        if(rn.actived){
            return 'накладная проведена';
        }
        const materials = rn.materials.map(m=>{
            return JSON.parse(JSON.stringify(m))
        })
        const virtualAccount = (rn.virtualAccount && rn.virtualAccount.toString)?rn.virtualAccount.toString():rn.virtualAccount;
        const rnId = (rn._id && rn._id.toString)?rn._id.toString():rn._id;
        let ids = materials.map(m=>m.item)
        let materialsFromDB = await Material.find({_id:{$in:ids}}).lean().exec()
        for(let m of rn.materials){
            let material = materialsFromDB.find(mat=>{
                return ((mat._id.toString)?mat._id.toString():mat._id)==((m.item && m.item.toString)?m.item.toString():m.item)
            })
            handleMaterial(m,material);
            if(store.bookkeep && material.stuff){
                let item = {
                    stuff:material.stuff,
                    sort:material.sort,
                    qty:m.qty
                }
                stuffs.push(item)
            }
        }
        //console.log(stuffs)
        for(let material of materialsFromDB){
            //console.log(material.data)
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

        let r = await Rn.update({_id:id},{$set:{reserve:true,actived:false,sum:rn.sum}})
        console.log('done reserve')

        if(store.bookkeep && stuffs.length){
            try {
                await setStockData(stuffs,'-',store._id)
                //console.log('setStockData setStockData setStockData done')
            }catch (e) {
                return e;
            }
        }

        return null;

        function handleMaterial(m,material) {
            let supplier = (m.supplier && m.supplier.toString)?m.supplier.toString():m.supplier;
            if(material.data && material.data.length){
                let mData = material.data.find(function (d) {
                    let dVA = (d.virtualAccount && d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount
                    return dVA==virtualAccount && d.supplier.toString()==supplier && d.supplierType==m.supplierType;
                })
                /* такой товар на таком складе от такого поставщика уже существует*/
                if(mData){
                    if(!mData.reserve){
                        mData.reserve=[];
                    }
                    let rD = mData.reserve.find(rd=>{
                        return ((rd.rn && rd.rn.toString)?rd.rn.toString():rd.rn)==rnId
                    })
                    if(!rD){
                        rD={
                            qty:0,
                            rn:rnId
                        }
                        mData.reserve.push(rD)
                    }
                    rD.qty=m.qty
                    mData.qty-=m.qty
                    if(mData.qty<0){
                        throw 'На складе меньшее количесво чем в накладной '+material.name+' '+material.sku
                    }
                }
            }else{
                throw 'На складе количество '+material.name+' '+material.sku+' = 0';
            }
        }
    } catch (err) {
        console.log('err',err)
        return err;

    }
}

exports.reserveCancel = async function(req, res, next) {
    let error = await reserveCancel(req.params.id,req.store);
    if(error){
        next(error)
    }else{
        res.json({msg:'ok'})
    }
}

async function reserveCancel(id,store) {
    try {
        let stuffs=[];
        const rn = await Rn.findOne({_id:id}).lean().exec();
        if(rn.actived){
            return 'накладная проведена';
        }
        if(!rn.reserve){
            return 'нет резерва';
        }
        const materials = rn.materials.map(m=>{
            return JSON.parse(JSON.stringify(m))
        })
        const virtualAccount = (rn.virtualAccount && rn.virtualAccount.toString)?rn.virtualAccount.toString():rn.virtualAccount;
        const rnId = (rn._id && rn._id.toString)?rn._id.toString():rn._id;
        let ids = materials.map(m=>m.item)
        let materialsFromDB = await Material.find({_id:{$in:ids}}).lean().exec()
        for(let m of rn.materials){
            let material = materialsFromDB.find(mat=>{
                return ((mat._id.toString)?mat._id.toString():mat._id)==((m.item && m.item.toString)?m.item.toString():m.item)
            })
            handleMaterial(m,material)
            if(store.bookkeep && material.stuff){
                let item = {
                    stuff:material.stuff,
                    sort:material.sort,
                    qty:m.qty
                }
                stuffs.push(item)
            }
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
                //console.log(material.data)
                let r = await Material.update({_id:material._id},{$set:{price:material.price,qty:material.qty,priceForSale:material.priceForSale,data:material.data}});
                console.log('saved material')
            }
        }
        let r = await Rn.update({_id:id},{$set:{reserve:false,actived:false}})
        console.log('done')
        if(store.bookkeep && stuffs.length){
            try {
                await setStockData(stuffs,'+',store._id)
            }catch (e) {
                return e;
            }
        }
        return null;

        function handleMaterial(m,material) {

            let supplier = (m.supplier && m.supplier.toString)?m.supplier.toString():m.supplier;
            if(material.data && material.data.length){
                let mData = material.data.find(function (d) {
                    let dVA = (d.virtualAccount && d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount
                    return dVA==virtualAccount && d.supplier.toString()==supplier && d.supplierType==m.supplierType;
                })
                //console.log('mData',mData)
                /* такой товар на таком складе от такого поставщика уже существует*/
                //console.log('mData',mData)
                if(mData){
                    if(!mData.reserve){
                        mData.reserve=[];
                    }
                    /*let rD = mData.reserve.find(rd=>{
                        return ((rd.rn && rd.rn.toString)?rd.rn.toString():rd.rn)==rnId
                    })
                    if(rD){
                        rD.qty-=m.qty;

                    }*/

                    /*удаление этого резерва*/
                    mData.reserve=mData.reserve.filter(rd=>((rd.rn && rd.rn.toString)?rd.rn.toString():rd.rn)!=rnId && rd.rn)
                    /*for(let  i = 0; i < mData.reserve.length; i++) {
                        if((( mData.reserve[i].zakaz &&  mData.reserve[i].zakaz.toString)? mData.reserve[i].zakaz.toString(): mData.reserve[i].zakaz)==zakaz) {
                            mData.reserve.splice(i, 1);
                            break;
                        }
                    }*/
                    mData.qty+=m.qty
                    /*if(mData.qty<0){
                     throw 'На складе меньшее количесво чем в накладной '+material.name+' '+material.sku
                     }*/
                }
                console.log('mData',mData)
            }
        }
    } catch (err) {
        console.log('err',err)
        return err;

    }
}


exports.hold = async function(req, res, next) {
    //https://blog.lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795

    let error = await hold(req.params.id,req.store);
    if(error){
        next(error)
    }else{
        res.json({msg:'ok'})
    }



}
exports.holdController = async function (id,store) {
    let res = await hold(id,store);
    return res;

}


async function hold(id,store,invoice) {
    const currency = store.currency
    const mainCurrency=(store.currency.mainCurrency)?store.currency.mainCurrency:'UAH'
    try {
        let stuffs=[];
        const rn = await Rn.findOne({_id:id}).populate('contrAgent').populate('materials.item','currency').populate('worker','data rateSale').populate('zakaz','name').lean().exec()
        const rnCurrency=(rn.currency)?rn.currency:mainCurrency;
        const rnCurrencyRate=(currency[rnCurrency]&& currency[rnCurrency][0])?currency[rnCurrency][0]:1;
        const virtualAccount = (rn.virtualAccount && rn.virtualAccount.toString)?rn.virtualAccount.toString():rn.virtualAccount;
        const rnId = (rn._id && rn._id.toString)?rn._id.toString():rn._id;
        let queryForSA = {store:store._id,date:{$gte:rn.date},virtualAccount:virtualAccount}
        const doc = await SA.findOne(queryForSA).lean().exec();
        if(doc){
            return 'сформирована инвентаризация позднее даты проведения документа - '+doc.name;
        }

        if(rn.typeOfZakaz=='manufacture'){
            if(!rn.zakaz && !invoice){
                return 'нет наряд-заказа';
            }
        }
        let ed = {
            type:'rn',
            _id:rn._id,
            name:rn.name,
            date:rn.date,
            currency:rn.currency
        }
        if(rn.desc){
            ed.comment=rn.desc
        }
        if(rn.zakaz){
            ed.zakazName=rn.zakaz.name;
            ed.zakazId=rn.zakaz._id;
        }else{
            ed.invoiceName='Cчет-фактру';
            ed.invoiceId=rn.invoice;
        }
        if(rn.actived){
            return 'накладная проведена';
        }
        let queryForCP = {store:store._id,actived:true,date:{$gte:rn.date},virtualAccount:virtualAccount}
        let CP = await ClosePeriod.findOne(queryForCP).sort({date: -1}).lean().exec()
        if(CP){
            return 'документ не может быть проведен в закрытом периоде '+CP.name;
        }
        let sa = await SA.findOne(queryForCP).sort({date: -1}).lean().exec()
        if(sa){
            return 'документ не может быть проведен ранее проведенной инвентаризации '+sa.name;
        }
        const materials = rn.materials.map(m=>{
            return JSON.parse(JSON.stringify(m))
        })

        let ids = materials.map(m=>m.item._id)
        let materialsFromDB = await Material.find({_id:{$in:ids}}).lean().exec()
        for(let m of rn.materials){
            let material = materialsFromDB.find(mat=>{
                return ((mat._id.toString)?mat._id.toString():mat._id)==((m.item && m.item._id.toString)?m.item._id.toString():m.item._id)
            })
            handleMaterial(m,material);
            if(store.bookkeep && !rn.reserve&& material.stuff){
                let item = {
                    stuff:material.stuff,
                    sort:material.sort,
                    qty:m.qty
                }
                stuffs.push(item)
            }
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




        rn.entries=[];
        let oForSum=calculate.getTotalSumRateAndTotalSumForSaleRate(rn.materials,currency,rnCurrency,rnCurrencyRate)
        /*console.log('rn.materials',rn.materials)
        console.log('oForSum',oForSum)*/
        rn.sum=Math.round(oForSum.sumForSale*100)/100;
        rn.sumUchet=oForSum.sum;





        /* расчеты с контрагентом по стоимости продажи*/
        if(rn.typeOfZakaz=='order'){
            if(!rn.contrAgent.data){
                rn.contrAgent.data=[]
            }
            calculate.data(rn.contrAgent,rn.sum,rn.currency,virtualAccount,'debet','credit')
            let resultPN = await Models[rn.typeOfContrAgent].update({_id:rn.contrAgent._id},{$set:{data:rn.contrAgent.data}})

        }
        /* расчеты с контрагентом по складской стоимости*/
        if(rn.typeOfZakaz=='return'){
            if(!rn.contrAgent.data){
                rn.contrAgent.data=[]
            }
            calculate.data(rn.contrAgent,rn.sumUchet,rn.currency,virtualAccount,'debet','credit')
            let resultPN = await Models[rn.typeOfContrAgent].update({_id:rn.contrAgent._id},{$set:{data:rn.contrAgent.data}})

        }
        /*************************/
        /* расчеты с cотрудником начасление зп в случае если продажа материалов или поступление их в производство*/
        let sumForWorker=0;
        if(rn.typeOfZakaz=='order' || rn.typeOfZakaz=='manufacture' && rn.worker && rn.worker.rateSale){
            if(!rn.worker.data){
                rn.worker.data=[]
            }
            sumForWorker = Math.round((((rn.sum-rn.sumUchet)/100)*rn.worker.rateSale) *100)/100
            calculate.data(rn.worker,sumForWorker,rn.currency,virtualAccount,'credit','debet')
            let resultPN = await Worker.update({_id:rn.worker._id},{$set:{data:rn.worker.data}})
        }
        /*************************/

        /***************************проводки *************/
        const accounts = await Account.find({store:store._id}).lean().exec();
        if(rn.typeOfZakaz=='order'){
            let accountWarehouse = accounts.find(a=>a.type=='Warehouse')._id.toString()
            let accountCustomer = accounts.find(a=>a.type==rn.typeOfContrAgent)._id.toString()
            let accountRealcost = accounts.find(a=>a.type=='Realcost')._id.toString()
            let accounIncome = accounts.find(a=>a.type=='Income')._id.toString()
            let accounFinresult = accounts.find(a=>a.type=='Finresult')._id.toString()
            let accounWorker = accounts.find(a=>a.type=='Worker')._id.toString()
            /*1 себестоимость материалов*/
            ed.comment='Cебестоимость материалов'
            calculate.makeEntries(rn.entries,accountRealcost,accountWarehouse,virtualAccount,rn.sumUchet,ed,rnCurrency)
            /*2 зп продавца*/
            if(sumForWorker){
                ed.comment='зп продавца'
                calculate.makeEntries(rn.entries,accountRealcost,accounWorker,virtualAccount,sumForWorker,ed,rnCurrency)
            }
            /*3 списание с.стоимости на финрезультат*/
            let realCostSum = (sumForWorker)?rn.sumUchet+sumForWorker:rn.sumUchet;
            ed.comment='Cписание себестоимости на финрезультат'
            calculate.makeEntries(rn.entries,accounFinresult,accountRealcost,virtualAccount,realCostSum,ed,rnCurrency)
            /*4 валовый доход*/
            ed.comment='Валовый доход'
            calculate.makeEntries(rn.entries,accountCustomer,accounIncome,virtualAccount,rn.sum,ed,rnCurrency)
            /*5 определяем финрезультат от сделки*/
            ed.comment='Определяем финрезультат от сделки'
            calculate.makeEntries(rn.entries,accounIncome,accounFinresult,virtualAccount,rn.sum,ed,rnCurrency)
        }else if(rn.typeOfZakaz=='manufacture'){
            let accountWarehouse = accounts.find(a=>a.type=='Warehouse')._id.toString()
            let accountManufacture = accounts.find(a=>a.type=='Manufacture')._id.toString()
            let accounWorker = accounts.find(a=>a.type=='Worker')._id.toString()
            /*1 себестоимость материалов*/
            ed.comment='Cебестоимость материалов'
            calculate.makeEntries(rn.entries,accountManufacture,accountWarehouse,virtualAccount,rn.sumUchet,ed,rnCurrency)
            /*2 зп продавца*/
            if(sumForWorker){
                ed.comment='зп продавца'
                calculate.makeEntries(rn.entries,accountManufacture,accounWorker,virtualAccount,sumForWorker,ed,rnCurrency)
            }
        }else if(rn.typeOfZakaz=='return'){
            let accountWarehouse = accounts.find(a=>a.type=='Warehouse')._id.toString()
            let accountSupplier = accounts.find(a=>a.type==rn.typeOfContrAgent)._id.toString()
            /*1 себестоимость материалов*/
            ed.comment='Cебестоимость материалов возврат'
            calculate.makeEntries(rn.entries,accountSupplier,accountWarehouse,virtualAccount,rn.sumUchet,ed,rnCurrency)
        }else if(rn.typeOfZakaz=='loss'){
            let accountWarehouse = accounts.find(a=>a.type=='Warehouse')._id.toString()
            let accountProfit = accounts.find(a=>a.type=='Profit')._id.toString()
            /*1 себестоимость материалов*/
            ed.comment='Cебестоимость материалов списание'
            calculate.makeEntries(rn.entries,accountProfit,accountWarehouse,virtualAccount,rn.sumUchet,ed,rnCurrency)
        }

        /****************************************/
        let r = await Rn.update({_id:id},{$set:{reserve:false,entries:rn.entries,actived:true,sum:rn.sum,sumForWorker:sumForWorker,sumUchet:rn.sumUchet,currencyData: currency}})
        console.log('done hold rn')
        if(store.bookkeep && stuffs.length){
            try {
                await setStockData(stuffs,'-',store._id)
            }catch (e) {
                return e;
            }
        }
        return null

        function handleMaterial(m,material) {
            let supplier = (m.supplier && m.supplier.toString)?m.supplier.toString():m.supplier;
            let mData;
            if(material && material.data && material.data.length){
                mData = material.data.find(function (d) {

                    let dVA = (d.virtualAccount && d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount
                    return dVA==virtualAccount && d.supplier.toString()==supplier && d.supplierType==m.supplierType;
                })
            }
            if(!mData){
                /* создаем пустой объект для данных*/
                mData ={virtualAccount:virtualAccount,supplier:supplier,supplierType:m.supplierType,qty:0,price:0,priceForSale:0}
                material.data.push(mData)
                mData = material.data.find(function (d) {
                    return d.virtualAccount==virtualAccount && d.supplier==supplier && d.supplierType==m.supplierType;
                })
            }
                /* такой товар на таком складе от такого поставщика уже существует*/
                if(mData){
                    if(!mData.reserve){
                        mData.reserve=[];
                    }
                    /*снимаем с резерва*/
                    let rD = mData.reserve.find(rd=>{
                        return ((rd.rn && rd.rn.toString)?rd.rn.toString():rd.rn)==rnId
                    })
                    //console.log('mData.qty',mData.qty)
                    if(rD){
                        mData.qty+=m.qty
                    }
                    //console.log('mData.qty',mData.qty)
                    mData.reserve=mData.reserve.filter(rd=>((rd.rn && rd.rn.toString)?rd.rn.toString():rd.rn)!=rnId)
                    /******************************/
                    mData.qty-=m.qty
                    if(mData.qty<0){
                        throw 'На складе меньшее количесво чем в накладной '+material.name+' '+material.sku
                    }
                    /* списываем на производство*/
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
    } catch (err) {
        console.log('err',err)
        return err;

    }
}


exports.cancel = async function(req, res, next) {
    //https://blog.lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795

    let error = await cancel(req.params.id,req.store);
    if(error){
        next(error)
    }else{
        res.json({msg:'ok'})
    }
}
exports.cancelController = async function (id,store) {
    let res = await cancel(id,store);
    return res;

}


async function cancel(id,store) {
    //const currency = req.store.currency
    try {
        let stuffs=[];
        const rn = await Rn.findOne({_id:id}).populate('contrAgent').populate('materials.item','currency').populate('worker','data rateSale').populate('zakaz','actived').lean().exec()
        //console.log(rn)
        const currency = (rn.currencyData)?rn.currencyData:store.currency;
        const mainCurrency=(store.currency.mainCurrency)?store.currency.mainCurrency:'UAH'
        const rnCurrency=(rn.currency)?rn.currency:mainCurrency;
        const rnCurrencyRate=(currency[rnCurrency]&& currency[rnCurrency][0])?currency[rnCurrency][0]:1;
        if(!rn.actived){
            return 'накладная не проведена';
        }
        if(rn.typeOfZakaz=='manufacture' && rn.zakaz && rn.zakaz.actived){
            return 'нарад-заказ проведен';
        }
        const materials = rn.materials.map(m=>{
            return JSON.parse(JSON.stringify(m))
        })
        const virtualAccount = (rn.virtualAccount && rn.virtualAccount.toString)?rn.virtualAccount.toString():rn.virtualAccount;
        const zakaz = (rn.zakaz && rn.zakaz.toString)?rn.zakaz.toString():rn.zakaz;
        const rnId = (rn._id && rn._id.toString)?rn._id.toString():rn._id;
        let ids = materials.map(m=>m.item._id)
        let materialsFromDB = await Material.find({_id:{$in:ids}}).lean().exec()
        for(let m of rn.materials){
            let material = materialsFromDB.find(mat=>{
                return ((mat._id.toString)?mat._id.toString():mat._id)==((m.item && m.item._id.toString)?m.item._id.toString():m.item._id)
            })
            handleMaterial(m,material);
            if(store.bookkeep && material.stuff){
                let item = {
                    stuff:material.stuff,
                    sort:material.sort,
                    qty:m.qty
                }
                stuffs.push(item)
            }
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
                //console.log(material.data)
                let r = await Material.update({_id:material._id},{$set:{price:material.price,qty:material.qty,priceForSale:material.priceForSale,data:material.data}});
                //console.log('saved material')
            }
        }
        /*  расчеты с контрагентом*/
        let oForSum=calculate.getTotalSumRateAndTotalSumForSaleRate(rn.materials,currency,rnCurrency,rnCurrencyRate)
        rn.sumUchet=oForSum.sum;
        rn.sum=oForSum.sumForSale;
        /* расчеты с контрагентом по стоимости продажи*/
        if(rn.typeOfZakaz=='order'){
            if(!rn.contrAgent.data){
                rn.contrAgent.data=[]
            }
            calculate.data(rn.contrAgent,rn.sum,rn.currency,virtualAccount,'credit','debet')
            //console.log(rn.contrAgent.data)
            let resultPN = await Models[rn.typeOfContrAgent].update({_id:rn.contrAgent._id},{$set:{data:rn.contrAgent.data}})

        }
        /* расчеты с контрагентом по складской стоимости*/
        if(rn.typeOfZakaz=='return'){
            if(!rn.contrAgent.data){
                rn.contrAgent.data=[]
            }
            calculate.data(rn.contrAgent,rn.sumUchet,rn.currency,virtualAccount,'credit','debet')
            let resultPN = await Models[rn.typeOfContrAgent].update({_id:rn.contrAgent._id},{$set:{data:rn.contrAgent.data}})

        }

        /* расчеты с cотрудником*/
        let sumForWorker;
        if(rn.typeOfZakaz=='order' || rn.typeOfZakaz=='manufacture' && rn.worker && rn.worker.rateSale){
            if(!rn.worker.data){
                rn.worker.data=[]
            }
            sumForWorker = Math.round(((rn.sum/100)*rn.worker.rateSale) *100)/100
            calculate.data(rn.worker,sumForWorker,rn.currency,virtualAccount,'debet','credit')
            //console.log(rn.worker.data)
            let resultPN = await Worker.update({_id:rn.worker._id},{$set:{data:rn.worker.data}})
        }
        /*************************/
        let r = await Rn.update({_id:id},{$set:{entries:[],actived:false}})
        /**********************/

        if(store.bookkeep && stuffs.length){
            try {
                await setStockData(stuffs,'+',store._id)
            }catch (e) {
                return e;
            }
        }
        console.log('done')
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
                    mData.qty+=m.qty
                    if(rn.typeOfZakaz=='manufacture'){
                        /*удаление из производства*/
                        mData.manufacture=mData.manufacture.filter(rd=>((rd.rn && rd.rn.toString)?rd.rn.toString():rd.rn)!=rnId)
                    }
                }
            }
        }
    } catch (err) {
        console.log('err',err)
        return err;

    }
}

exports.createByAPI = createByAPI;
async function  createByAPI(req, res, next){
   /* console.log(req.store)*/
    //console.log(req.body)

    //return res.json({})
    try{
        const mainCurrency=(req.store.currency.mainCurrency)?req.store.currency.mainCurrency:'UAH'
        const currency = req.store.currency;
        let z = req.body;

        let va = {store:req.store._id,name:z.virtualAccount}
        let virtualAccount = await VirtualAccount.findOne(va).lean().exec();
        if(!virtualAccount){
            virtualAccount = new VirtualAccount(va)
            await virtualAccount.save()
        }
        virtualAccount=virtualAccount._id.toString()
        z.virtualAccount=virtualAccount;
        if(!z.worker){
            return next('не установлен исполнитель')

        }else if(z.worker=='any'){
            let ww={store:req.store._id}
            let workers = await Worker.find(ww).lean().exec();
            if(!workers || !workers.length){
                return next('нет сотрудников')
            }
            z.worker=workers[0]._id.toString();
        }else{
            let ww={store:req.store._id,name:z.worker}
            let worker = await Worker.findOne(ww).lean().exec();
            if(!worker){
                return next('Такой сотрудник не существует')
            }
            z.worker=worker._id.toString();
        }

        let materials=[]
        if(z.materials){
            for(let m of z.materials){
                let p={store:req.store._id,name:m.producer};

                //let producers = await Producer.find({store:req.store._id}).lean().exec()
                //console.log(producers)
                let producer = await Producer.findOne(p).lean().exec()
                if(!producer){
                    return next('Такой производитель не существует')
                }
                let material = {store:req.store._id};
                material.producer=producer._id
                material.name=m.name;
                if(m.sku){
                    material.sku=m.sku
                }
                let supplier = {store:req.store._id,name:m.supplier}
                /*let sss = await Supplier.find({store:req.store._id}).lean().exec();
                console.log(sss)*/
                let ss = await Supplier.findOne(supplier).lean().exec();
                if(!ss){
                    return next('Такой поставщик не существует')
                }
                console.log('material',material)

                let mat = await Material.findOne(material).lean().exec();
                if(!mat){
                    return next('материал автоматически больше не создается.');
                }else{
                    if(mat.data && mat.data.length){
                        let data = mat.data.find(d=>{
                            return ((d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount)==virtualAccount
                                && ((d.supplier.toString)?d.supplier.toString():d.supplier)==ss._id.toString() && d.supplierType=='Supplier'
                        })
                        if(!data || !data.qty || data.qty<m.qty){
                            return next('внесите материал '+mat.name+' '+mat.sku+' на склад')
                        }
                        console.log(data)
                        console.log(m)
                        let material = {
                            item:mat._id.toString(),
                            supplier:ss._id.toString(),
                            supplierType:'Supplier',
                            qty:m.qty,
                            price:data.price,
                            priceForSale:m.price,
                            priceRate:0,
                            priceForSaleRate:0,
                        }
                        material.sum = Math.round((material.qty*material.priceForSale)*100)/100;
                        materials.push(material)
                    }else{return next('внесите материал '+mat.name+' '+mat.sku+' на склад')}
                }



                //mat.virtualAccount=virtualAccount;
                //console.log(6,mat)]

            }
        }
        if(!materials){
            return next('нет материалов')
        }
        z.materials=materials;










        let zzzz = await Rn.find({store: req.store._id}).sort({num: -1}).limit(1).lean().exec();
        z.num = (zzzz.length && zzzz[0].num && Number(zzzz[0].num)) ? ( Number(zzzz[0].num) + 1 ): 1;
        z.name +=" -"+z.num;
        if(!z.store){
            z.store=req.store._id
        }

        let rn = new Rn(z)




        console.log(z.worker);
        console.log('zak.worker');
        console.log(typeof rn.worker);

        console.log(rn)
        await rn.save();
        if(req.body.makeReserve){
            /*let rnHoldResult = await hold(rn._id,req.store,'reserve')
            if(rnHoldResult){
                return next(rnHoldResult)
            }*/

        }else{
            let rnHoldResult = await hold(rn._id,req.store,'invoice')
            if(rnHoldResult){
                return next(rnHoldResult)
            }

        }

        return res.json({rn: rn._id.toString()})





    }catch (err){
        return err;
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

exports.checkPriceForSaleInRn = checkPriceForSaleInRn;
async function  checkPriceForSaleInRn(req, res, next){
     //console.log(req.store)
    //console.log(req.body)
    try{
        if(req.body.materialsFromRns && req.body.materialsFromRns){
            let  materialsFromRns=req.body.materialsFromRns;
            let rns={};
            materialsFromRns.forEach(function (m) {
                if(!rns[m.rn]){
                    rns[m.rn]=[];
                }
                let o ={
                    name:m.name,
                    sku:m.sku,
                    priceForSale:m.priceForSale,
                    supplier:m.supplier
                }
                rns[m.rn].push(o)
            })
            //console.log(rns)
            let rnsA = [];
            for(let rn in rns){
                let o = {
                    id :rn,
                    materials :rns[rn]
                }
                rnsA.push(o)
            }
            //console.log(rnsA);
            for(let item of rnsA){
                let rn = await Rn.findOne({_id:item.id}).populate('materials.supplier','name').populate('materials.item','name sku').lean().exec()
                //console.log(rn.materials)
                if(rn.materials.length){
                    let changePriceForSale=false;
                    rn.materials.forEach(function (m) {
                       /* console.log(m)
                        console.log(item.materials)*/
                        let mFromSite = item.materials.find(function (mFS) {
                            /*console.log(mFS)
                            console.log(m.item.name==mFS.name)
                            console.log(m.item.sku==mFS.sku)*/
                            return m.item.name==mFS.name && m.item.sku==mFS.sku && m.supplier.name==mFS.supplier
                        })
                        if(mFromSite && mFromSite.priceForSale!=m.priceForSale){
                            changePriceForSale=true;
                            m.priceForSale=mFromSite.priceForSale;
                        }
                    })
                    if(changePriceForSale){
                        rn.materials=rn.materials.map(function (m) {
                            m.item=m.item._id;
                            m.supplier=m.supplier._id;
                            m.sum = Math.round((m.qty*m.priceForSale)*100)/100;
                            return m
                        })
                        //console.log(rn.materials);
                        let r = await Rn.update({_id:item.id},{$set:{materials:rn.materials}})
                        //console.log(r)
                        let rnCancelResult = await cancel(item.id,req.store)
                        if(rnCancelResult){
                            return next(rnCancelResult)
                        }
                        let rnHoldResult = await hold(item.id,req.store,'invoice')
                        if(rnHoldResult){
                            return next(rnHoldResult)
                        }
                    }
                }

            }
            return res.json({})

        }else{
            return res.json({})
        }
    }catch(err){
        next(err)
    }

    return res.json({});

    try{
        const mainCurrency=(req.store.currency.mainCurrency)?req.store.currency.mainCurrency:'UAH'
        const currency = req.store.currency;
        let z = req.body;

        let va = {store:req.store._id,name:z.virtualAccount}
        let virtualAccount = await VirtualAccount.findOne(va).lean().exec();
        if(!virtualAccount){
            virtualAccount = new VirtualAccount(va)
            await virtualAccount.save()
        }
        virtualAccount=virtualAccount._id.toString()
        z.virtualAccount=virtualAccount;
        if(!z.worker){
            return next('не установлен исполнитель')

        }else if(z.worker=='any'){
            let ww={store:req.store._id}
            let workers = await Worker.find(ww).lean().exec();
            if(!workers || !workers.length){
                return next('нет сотрудников')
            }
            z.worker=workers[0]._id.toString();
        }else{
            let ww={store:req.store._id,name:z.worker}
            let worker = await Worker.findOne(ww).lean().exec();
            if(!worker){
                return next('Такой сотрудник не существует')
            }
            z.worker=worker._id.toString();
        }

        let materials=[]
        if(z.materials){
            for(let m of z.materials){
                let p={store:req.store._id,name:m.producer};

                //let producers = await Producer.find({store:req.store._id}).lean().exec()
                //console.log(producers)
                let producer = await Producer.findOne(p).lean().exec()
                if(!producer){
                    return next('Такой производитель не существует')
                }
                let material = {store:req.store._id};
                material.producer=producer._id
                material.name=m.name;
                if(m.sku){
                    material.sku=m.sku
                }
                let supplier = {store:req.store._id,name:m.supplier}
                /*let sss = await Supplier.find({store:req.store._id}).lean().exec();
                console.log(sss)*/
                let ss = await Supplier.findOne(supplier).lean().exec();
                if(!ss){
                    return next('Такой поставщик не существует')
                }
                console.log('material',material)

                let mat = await Material.findOne(material).lean().exec();
                if(!mat){
                    return next('материал автоматически больше не создается.');
                }else{
                    if(mat.data && mat.data.length){
                        let data = mat.data.find(d=>{
                            return ((d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount)==virtualAccount
                                && ((d.supplier.toString)?d.supplier.toString():d.supplier)==ss._id.toString() && d.supplierType=='Supplier'
                        })
                        if(!data || !data.qty || data.qty<m.qty){
                            return next('внесите материал '+mat.name+' '+mat.sku+' на склад')
                        }
                        console.log(data)
                        console.log(m)
                        let material = {
                            item:mat._id.toString(),
                            supplier:ss._id.toString(),
                            supplierType:'Supplier',
                            qty:m.qty,
                            price:data.price,
                            priceForSale:m.price,
                            priceRate:0,
                            priceForSaleRate:0,
                        }
                        material.sum = Math.round((material.qty*material.priceForSale)*100)/100;
                        materials.push(material)
                    }else{return next('внесите материал '+mat.name+' '+mat.sku+' на склад')}
                }



                //mat.virtualAccount=virtualAccount;
                //console.log(6,mat)]

            }
        }
        if(!materials){
            return next('нет материалов')
        }
        z.materials=materials;










        let zzzz = await Rn.find({store: req.store._id}).sort({num: -1}).limit(1).lean().exec();
        z.num = (zzzz.length && zzzz[0].num && Number(zzzz[0].num)) ? ( Number(zzzz[0].num) + 1 ): 1;
        z.name +=" -"+z.num;
        if(!z.store){
            z.store=req.store._id
        }

        let rn = new Rn(z)




        console.log(z.worker);
        console.log('zak.worker');
        console.log(typeof rn.worker);

        console.log(rn)
        await rn.save();
        if(req.body.makeReserve){
            /*let rnHoldResult = await hold(rn._id,req.store,'reserve')
            if(rnHoldResult){
                return next(rnHoldResult)
            }*/

        }else{
            let rnHoldResult = await hold(rn._id,req.store,'invoice')
            if(rnHoldResult){
                return next(rnHoldResult)
            }

        }

        return res.json({rn: rn._id.toString()})





    }catch (err){
        return err;
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


exports.deleteByAPI = deleteByAPI;
async function  deleteByAPI(req, res, next){
    let id=req.body.id;

    await cancel(id,req.store);
    try {
        let r = await Rn.findByIdAndRemove(id).exec();
    } catch (err) {
        return next(r)
    }
    res.json({})


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

exports.createByAPIFromSite = createByAPIFromSite;
async function  createByAPIFromSite(req, res, next){
    /* console.log(req.store)*/
    //console.log(req.body)

    //return res.json({})
    try{
        const mainCurrency=(req.store.currency.mainCurrency)?req.store.currency.mainCurrency:'UAH'
        const currency = req.store.currency;
        let z = req.body;

        let va = {store:req.store._id,_id:z.virtualAccount}
        let virtualAccount = await VirtualAccount.findOne(va).lean().exec();
        if(!virtualAccount){
            return next('не установлено подразденение')
        }
        //return next('проверка')
        virtualAccount=virtualAccount._id.toString()
        z.virtualAccount=virtualAccount;
        if(!z.worker){
            return next('не установлен исполнитель')

        }else if(z.worker=='any'){
            let ww={store:req.store._id}
            let workers = await Worker.find(ww).lean().exec();
            if(!workers || !workers.length){
                return next('нет сотрудников')
            }
            z.worker=workers[0]._id.toString();
        }else{
            let ww={store:req.store._id,name:z.worker}
            let worker = await Worker.findOne(ww).lean().exec();
            if(!worker){
                return next('Такой сотрудник не существует')
            }
            z.worker=worker._id.toString();
        }

        let customer={store:req.store._id,email:z.customer.email};
        let c = await Customer.findOne(customer).lean().exec()
        //console.log('customer',c)
        if(!c){
            if(z.customer.name){
                customer.name=z.customer.name
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
            c= new Customer(customer);
            await c.save();
        }
        z.typeOfContrAgent='Customer';
        z.contrAgent=c._id;


        let materials=[]
        if(z.materials){
            for(let m of z.materials){
                let material = {store:req.store._id,stuff:m.stuff,sort:m.sort};
                let mat = await Material.findOne(material).lean().exec();
                if(!mat){
                    return next('материал автоматически больше не создается.');
                }else{
                    if(mat.data && mat.data.length){
                        let data = mat.data.find(d=>{
                            return ((d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount)==virtualAccount
                                && ((d.supplier.toString)?d.supplier.toString():d.supplier)==m.supplier && d.supplierType==m.supplierType
                        })
                        if(!data || !data.qty || data.qty<m.qty){
                            return next('внесите материал '+mat.name+' '+mat.sku+' на склад')
                        }
                        let material = {
                            item:mat._id.toString(),
                            supplier:m.supplier,
                            supplierType:m.supplierType,
                            qty:m.qty,
                            price:data.price,
                            priceForSale:m.priceForSale,
                            priceRate:0,
                            priceForSaleRate:0,
                        }
                        material.sum = Math.round((material.qty*material.priceForSale)*100)/100;
                        materials.push(material)
                    }else{return next('внесите материал '+mat.name+' '+mat.sku+' на склад')}
                }
            }
        }
        if(!materials){
            return next('нет материалов')
        }
        z.materials=materials;
        //console.log(materials)
        let zzzz = await Rn.find({store: req.store._id}).sort({num: -1}).limit(1).lean().exec();
        z.num = (zzzz.length && zzzz[0].num && Number(zzzz[0].num)) ? ( Number(zzzz[0].num) + 1 ): 1;
        z.name +=" -"+z.num;
        if(!z.store){
            z.store=req.store._id
        }

        /*******************************************доставка**********************************************/
        let pn;
        try{
            if(z.delivery){
                let supplier = {store:req.store._id,name:'Доставка'}

                let deliverySupplier = await Supplier.findOne(supplier).lean().exec();
                if(!deliverySupplier){
                    return next('Поставщик по доставке не существует')
                }

                pn={
                    store:req.store._id,
                    name:'Приходная накладная ',
                    contrAgent:deliverySupplier._id,
                    typeOfContrAgent :'Supplier',
                    virtualAccount:virtualAccount,
                    date:Date.now(),
                    currency:z.currency,
                    materials:[]
                }
                let zzz = await Pn.find({store: req.store._id}).sort({num: -1}).limit(1).lean().exec();
                pn.num = (zzz.length && zzz[0].num && Number(zzz[0].num)) ? ( Number(zzz[0].num) + 1 ): 1;
                pn.name+=pn.num;
                let query = {store:req.store._id,name:'Доставка'};
                if(req.store.mainCurrency!=z.currency){
                    query.name+=' '+z.currency;
                }
                let material = await Material.findOne(query).lean().exec();
                if(!material){
                    return next('Товара для доставки не существует')
                }
                let m ={
                    item:material._id,
                    qty:1,
                    price:z.delivery,
                    priceForSale:z.delivery,
                }
                pn.materials.push(m)
                pn = new Pn(pn);
                //console.log(pn)
                await pn.save()
                let pnHoldResult = await PnController.holdController(pn._id,req.store)
                if(pnHoldResult){
                    return next(pnHoldResult)
                }
                //console.log('pnHoldResult',pnHoldResult)
                let m2 = {
                    item:material._id,
                    supplier:deliverySupplier._id,
                    supplierType:'Supplier',
                    qty:1,
                    price:z.delivery,
                    priceForSale:z.delivery,
                    priceRate:0,
                    priceForSaleRate:0,
                }

                z.materials.push(m2)
                //console.log('m2',m2)
                //return next('text')
            }
        }catch(err){
           console.log(err)
            return next(next)
        }







        /*******************************************доставка**********************************************/


        let rn = new Rn(z)

        //console.log('rn.materials',rn.materials)
       /* console.log(z.worker);
        console.log('zak.worker');
        console.log(typeof rn.worker);*/

        //console.log(rn)
        await rn.save();
        if(req.body.makeReserve){
            let rnHoldResult = await reserveHold(rn._id,req.store)
            if(rnHoldResult){
                return next(rnHoldResult)
            }

        }

        let oo ={rn: rn._id.toString()};
        if(pn && pn._id){
            oo.pn=pn._id.toString();
        }
        return res.json(oo)





    }catch (err){
        return err;
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

exports.cancelByAPIFromSite=cancelByAPIFromSite;
async function  cancelByAPIFromSite(req, res, next){
    //console.log(req.body);
    //return next('test')
    if(req.body.rn){
        let r = await reserveCancel(req.body.rn,req.store)
        if(r){
            console.log(r)
            return next(r)
        }
        try {
            await Rn.findByIdAndRemove(req.body.rn).exec();
        } catch (err) {
            return next(r)
        }



    }
    console.log('rn exec')
    //console.log('req.body.pn',req.body.pn)
    if(req.body.pn){
        let r = await PnController.cancelController(req.body.pn,req.store)
        if(r){
            console.log(r)
            return next(r)
        }
        try {
            await Pn.findByIdAndRemove(req.body.pn).exec();
        } catch (err) {
            return next(r)
        }



    }

    /*await cancel(id,req.store);
    try {
        let r = await Rn.findByIdAndRemove(id).exec();
    } catch (err) {
        return next(r)
    }*/
    res.json({})
}


exports.holdByAPIFromSite = async function(req, res, next) {
    let error = await hold(req.body.rn,req.store);
    if(error){
        next(error)
    }else{
        res.json({msg:'ok'})
    }
}

exports.cancelZakazByAPIFromSite = async function(req, res, next) {
    console.log(req.body)
    if(req.body.rn){
        let error = await cancel(req.body.rn,req.store);
        if(error){
            return  next(error)
        };
        try {
            await Rn.findByIdAndRemove(req.body.rn).exec();
        } catch (err) {
            return next(r)
        }
    }
    if(req.body.pn){
        let error = await PnController.cancelController(req.body.pn,req.store);
        if(error){
            return  next(error)
        };
        try {
            await Pn.findByIdAndRemove(req.body.pn).exec();
        } catch (err) {
            return next(r)
        }
    }


    res.json({msg:'ok'})

}


function setStockData(stuffs,sign,store) {
    let url =stuffHost+'/api/stuffs/changeStock';
    var options = {
        method: 'POST',
        uri: url,
        body: {
            stuffs : stuffs,
            sign : sign,
            store:store
        },
        json: true // Automatically stringifies the body to JSON
    };
    //console.log(options)

    try{
        return  rp(options)
            .then(function (parsedBody) {
                console.log(parsedBody)
            })
            .catch(function (err) {
                console.log(err)
            });
    }catch(err){
        console.log(err)
    }

}






