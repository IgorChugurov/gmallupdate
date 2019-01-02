'use strict';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var ObjectID = mongoose.Types.ObjectId;
var fs = require('fs');
var path = require('path');
var request=require('request');
var Rn=mongoose.model('Rn');
var Material=mongoose.model('Material');

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

exports.reserveHold = async function(req, res, next) {
    try {
        const rn = await Rn.findOne({_id:req.params.id}).lean().exec();
        if(rn.actived){
            return next('накладная проведена')
        }
        const materials = rn.materials.map(m=>{
            return Object.assign({},m)
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
                console.log(material.data[0])
                let r = await Material.update({_id:material._id},{$set:{price:material.price,qty:material.qty,priceForSale:material.priceForSale,data:material.data}});
                console.log('saved material')
            }
        }
        console.log('done')
        res.json({msg:'ok'})

        function handleMaterial(m,material) {
            let supplier = (m.supplier && m.supplier.toString)?m.supplier.toString():m.supplier;
            if(material.data && material.data.length){
                let mData = material.data.find(function (d) {
                    let dVA = (d.virtualAccount && d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount
                    return dVA==virtualAccount && d.supplier.toString()==supplier && d.supplierType==m.supplierType;
                })
                //console.log('mData',mData)
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
                //console.log('mData',mData)
            }
        }
    } catch (err) {
        console.log('err',err)
        next(err)

    }
}

exports.reserveCancel = async function cancel(req, res, next) {
    try {
        const rn = await Rn.findOne({_id:req.params.id}).lean().exec();
        if(rn.actived){
            return next('накладная проведена')
        }
        if(!rn.reserve){
            return next('нет резерва')
        }
        const materials = rn.materials.map(m=>{
            return Object.assign({},m)
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
        console.log('done')
        res.json({msg:'ok'})

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
        next(err)

    }
}



exports.hold = async function(req, res, next) {
    const currency = req.store.currency
    const mainCurrency=(req.store.currency.mainCurrency)?req.store.currency.mainCurrency:'UAH'
    try {
        const rn = await Rn.findOne({_id:req.params.id}).populate('contrAgent').populate('materials.item','currency').populate('worker','data rateSale').populate('zakaz','name').lean().exec()
        const rnCurrency=(rn.currency)?rn.currency:mainCurrency;
        const rnCurrencyRate=(currency[rnCurrency]&& currency[rnCurrency][0])?currency[rnCurrency][0]:1;
        if(rn.typeOfZakaz=='manufacture'){
            if(!rn.zakaz){
                return next('нет наряд-заказа')
            }
        }
        let ed = {
            type:'rn',
            _id:rn._id,
            name:rn.name,
            date:rn.date,
            currency:rn.currency
        }
        if(rn.zakaz){
            ed.zakazName=rn.zakaz.name;
            ed.zakazId=rn.zakaz._id;
        }
        if(rn.actived){
            return next('накладная проведена')
        }
        const materials = rn.materials.map(m=>{
            return Object.assign({},m)
        })
        const virtualAccount = (rn.virtualAccount && rn.virtualAccount.toString)?rn.virtualAccount.toString():rn.virtualAccount;
        const rnId = (rn._id && rn._id.toString)?rn._id.toString():rn._id;
        let ids = materials.map(m=>m.item._id)
        let materialsFromDB = await Material.find({_id:{$in:ids}}).lean().exec()
        for(let m of rn.materials){
            let material = materialsFromDB.find(mat=>{
                return ((mat._id.toString)?mat._id.toString():mat._id)==((m.item && m.item._id.toString)?m.item._id.toString():m.item._id)
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
                //console.log(material.data[0])
                let r = await Material.update({_id:material._id},{$set:{price:material.price,qty:material.qty,priceForSale:material.priceForSale,data:material.data}});
                //console.log('saved material')
            }
        }




        rn.entries=[];
        let oForSum=calculate.getTotalSumRateAndTotalSumForSaleRate(rn.materials,currency,rnCurrency,rnCurrencyRate)
        rn.sum=oForSum.sum;
        rn.sumForSale=oForSum.sumForSale;
        //console.log(oForSum)
        oForSum.sumRate = Math.round((oForSum.sum/rnCurrencyRate)*100)/100
        oForSum.sumForSaleRate = Math.round((oForSum.sumForSale/rnCurrencyRate)*100)/100





        /* расчеты с контрагентом по стоимости продажи*/
        if(rn.typeOfZakaz=='order'){
            if(!rn.contrAgent.data){
                rn.contrAgent.data=[]
            }
            calculate.data(rn.contrAgent,rn.sumForSale,rn.currency,virtualAccount,'debet','credit')
            let resultPN = await Models[rn.typeOfContrAgent].update({_id:rn.contrAgent._id},{$set:{data:rn.contrAgent.data}})

        }
        /* расчеты с контрагентом по складской стоимости*/
        if(rn.typeOfZakaz=='return'){
            if(!rn.contrAgent.data){
                rn.contrAgent.data=[]
            }
            calculate.data(rn.contrAgent,rn.sum,rn.currency,virtualAccount,'debet','credit')
            let resultPN = await Models[rn.typeOfContrAgent].update({_id:rn.contrAgent._id},{$set:{data:rn.contrAgent.data}})

        }
        /*************************/
        /* расчеты с cотрудником начасление зп в случае если продажа материалов или поступление их в производство*/
        let sumForWorker=0;
        if(rn.typeOfZakaz=='order' || rn.typeOfZakaz=='manufacture' && rn.worker && rn.worker.rateSale){
            if(!rn.worker.data){
                rn.worker.data=[]
            }
            sumForWorker = Math.round(((rn.sumForSale/100)*rn.worker.rateSale) *100)/100
            calculate.data(rn.worker,sumForWorker,rn.currency,virtualAccount,'credit','debet')
            //console.log(rn.worker.data)
            let resultPN = await Worker.update({_id:rn.worker._id},{$set:{data:rn.worker.data}})
        }
        /*************************/

        /***************************проводки *************/
        const accounts = await Account.find({store:req.store._id}).lean().exec();
        if(rn.typeOfZakaz=='order'){
            let accountWarehouse = accounts.find(a=>a.type=='Warehouse')._id.toString()
            let accountCustomer = accounts.find(a=>a.type==rn.typeOfContrAgent)._id.toString()
            let accountRealcost = accounts.find(a=>a.type=='Realcost')._id.toString()
            let accounIncome = accounts.find(a=>a.type=='Income')._id.toString()
            let accounFinresult = accounts.find(a=>a.type=='Finresult')._id.toString()
            let accounWorker = accounts.find(a=>a.type=='Worker')._id.toString()
            /*1 себестоимость материалов*/
            ed.comment='Cебестоимость материалов'
            calculate.makeEntries(rn.entries,accountRealcost,accountWarehouse,virtualAccount,rn.sum,ed,rnCurrency)
            /*2 зп продавца*/
            let sumForWorkerRate;
            if(sumForWorker){
                sumForWorkerRate=Math.round((sumForWorker/rnCurrencyRate)*100)/100
                //console.log('sumForWorkerRate',sumForWorkerRate)
                ed.comment='зп продавца'
                calculate.makeEntries(rn.entries,accountRealcost,accounWorker,virtualAccount,sumForWorker,ed,rnCurrency)
            }
            /*3 списание с.стоимости на финрезультат*/
            let realCostSum = (sumForWorker)?rn.sum+sumForWorkerRate:oForSum.sumRate;
            ed.comment='Cписание себестоимости на финрезультат'
            calculate.makeEntries(rn.entries,accounFinresult,accountRealcost,virtualAccount,realCostSum,ed,rnCurrency)
            /*4 валовый доход*/
            ed.comment='Валовый доход'
            calculate.makeEntries(rn.entries,accountCustomer,accounIncome,virtualAccount,oForSum.sumForSaleRate,ed)
            /*5 определяем финрезультат от сделки*/
            ed.comment='Определяем финрезультат от сделки'
            calculate.makeEntries(rn.entries,accounIncome,accounFinresult,virtualAccount,oForSum.sumForSaleRate,ed)
        }else if(rn.typeOfZakaz=='manufacture'){
            let accountWarehouse = accounts.find(a=>a.type=='Warehouse')._id.toString()
            let accountManufacture = accounts.find(a=>a.type=='Manufacture')._id.toString()
            let accounWorker = accounts.find(a=>a.type=='Worker')._id.toString()
            /*1 себестоимость материалов*/
            ed.comment='Cебестоимость материалов'
            calculate.makeEntries(rn.entries,accountManufacture,accountWarehouse,virtualAccount,oForSum.sumRate,ed)
            /*2 зп продавца*/
            let sumForWorkerRate;
            if(sumForWorker){
                sumForWorkerRate=Math.round((sumForWorker/rnCurrencyRate)*100)/100
                console.log('sumForWorkerRate',sumForWorkerRate)
                ed.comment='зп продавца'
                calculate.makeEntries(rn.entries,accountManufacture,accounWorker,virtualAccount,sumForWorkerRate,ed)
            }
        }else if(rn.typeOfZakaz=='return'){
            let accountWarehouse = accounts.find(a=>a.type=='Warehouse')._id.toString()
            let accountSupplier = accounts.find(a=>a.type==rn.typeOfContrAgent)._id.toString()
            /*1 себестоимость материалов*/
            ed.comment='Cебестоимость материалов возврат'
            calculate.makeEntries(rn.entries,accountSupplier,accountWarehouse,virtualAccount,oForSum.sumRate,ed)
        }else if(rn.typeOfZakaz=='loss'){
            let accountWarehouse = accounts.find(a=>a.type=='Warehouse')._id.toString()
            let accountProfit = accounts.find(a=>a.type=='Profit')._id.toString()
            /*1 себестоимость материалов*/
            ed.comment='Cебестоимость материалов списание'
            calculate.makeEntries(rn.entries,accountProfit,accountWarehouse,virtualAccount,oForSum.sumRate,ed)
        }
        //console.log(rn.entries)

        /****************************************/


        /*сумма !!!!!! и сумма для работника и сумма входящая надо сохранять так же*/
        let r = await Rn.update({_id:req.params.id},{$set:{reserve:false,entries:rn.entries,actived:true,sum:rn.sumForSale,sumForWorker:sumForWorker,sumUchet:oForSum.sum,currencyData: currency}})
        console.log('done')
        res.json({msg:'ok'})

        function handleMaterial(m,material) {
            let supplier = (m.supplier && m.supplier.toString)?m.supplier.toString():m.supplier;
            if(material && material.data && material.data.length){
                let mData = material.data.find(function (d) {
                    let dVA = (d.virtualAccount && d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount
                    return dVA==virtualAccount && d.supplier.toString()==supplier && d.supplierType==m.supplierType;
                })
                //console.log('mData',mData)
                /* такой товар на таком складе от такого поставщика уже существует*/
                if(mData){
                    if(!mData.reserve){
                        mData.reserve=[];
                    }
                    /*снимаем с резерва*/
                    let rD = mData.reserve.find(rd=>{
                        return ((rd.rn && rd.rn.toString)?rd.rn.toString():rd.rn)==rnId
                    })
                    if(rD){
                        mData.qty+=m.qty
                    }
                    mData.reserve=mData.reserve.filter(rd=>((rd.rn && rd.rn.toString)?rd.rn.toString():rd.rn)!=rnId)
                    /******************************/
                    mData.qty-=m.qty
                    if(mData.qty<0){
                        throw 'На складе меньшее количесво чем в накладной '+material.name+' '+material.sku
                    }
                    /* списываем на производство*/
                    //console.log("rn.typeOfZakaz=='manufacture'",rn.typeOfZakaz=='manufacture',rn.typeOfZakaz)
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
                //console.log('mData',mData)
            }
        }
    } catch (err) {
        console.log('err',err)
        next(err)

    }
}

exports.cancel = async function cancel(req, res, next) {
    //const currency = req.store.currency
    try {
        const rn = await Rn.findOne({_id:req.params.id}).populate('contrAgent').populate('materials.item','currency').populate('worker','data rateSale').populate('zakaz','actived').lean().exec()
        const currency = (rn.currencyData)?rn.currencyData:req.store.currency;
        const mainCurrency=(req.store.currency.mainCurrency)?req.store.currency.mainCurrency:'UAH'
        const rnCurrency=(rn.currency)?rn.currency:mainCurrency;
        const rnCurrencyRate=(currency[rnCurrency]&& currency[rnCurrency][0])?currency[rnCurrency][0]:1;
        if(!rn.actived){
            return next('накладная не проведена')
        }
        if(rn.typeOfZakaz=='manufacture' && rn.zakaz.actived){
            return next('нарад-заказ проведен')
        }
        const materials = rn.materials.map(m=>{
            return Object.assign({},m)
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
                //console.log(material.data)
                let r = await Material.update({_id:material._id},{$set:{price:material.price,qty:material.qty,priceForSale:material.priceForSale,data:material.data}});
                //console.log('saved material')
            }
        }
        /*  расчеты с контрагентом*/
        let oForSum=calculate.getTotalSumRateAndTotalSumForSaleRate(rn.materials,currency,rnCurrency,rnCurrencyRate)
        rn.sum=oForSum.sum;
        rn.sumForSale=oForSum.sumForSale;
        /* расчеты с контрагентом по стоимости продажи*/
        if(rn.typeOfZakaz=='order'){
            if(!rn.contrAgent.data){
                rn.contrAgent.data=[]
            }
            calculate.data(rn.contrAgent,rn.sumForSale,rn.currency,virtualAccount,'credit','debet')
            //console.log(rn.contrAgent.data)
            let resultPN = await Models[rn.typeOfContrAgent].update({_id:rn.contrAgent._id},{$set:{data:rn.contrAgent.data}})

        }
        /* расчеты с контрагентом по складской стоимости*/
        if(rn.typeOfZakaz=='return'){
            if(!rn.contrAgent.data){
                rn.contrAgent.data=[]
            }
            calculate.data(rn.contrAgent,rn.sum,rn.currency,virtualAccount,'debet','credit')
            let resultPN = await Models[rn.typeOfContrAgent].update({_id:rn.contrAgent._id},{$set:{data:rn.contrAgent.data}})

        }

        /* расчеты с cотрудником*/
        let sumForWorker;
        if(rn.typeOfZakaz=='order' || rn.typeOfZakaz=='manufacture' && rn.worker && rn.worker.rateSale){
            if(!rn.worker.data){
                rn.worker.data=[]
            }
            sumForWorker = Math.round(((rn.sumForSale/100)*rn.worker.rateSale) *100)/100
            calculate.data(rn.worker,sumForWorker,rn.currency,virtualAccount,'debet','credit')
            //console.log(rn.worker.data)
            let resultPN = await Worker.update({_id:rn.worker._id},{$set:{data:rn.worker.data}})
        }
        /*************************/
        let r = await Rn.update({_id:req.params.id},{$set:{entries:[],actived:false}})
        /**********************/


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
        next(err)

    }
}










