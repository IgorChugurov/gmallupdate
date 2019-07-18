'use strict';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var ObjectID = mongoose.Types.ObjectId;
var fs = require('fs');
var path = require('path');
var request=require('request');
var rp = require('request-promise');
var Pn=mongoose.model('Pn');
var Material=mongoose.model('Material');
var SampleEntries=mongoose.model('SampleEntries');
var SA=mongoose.model('StockAdjustment');
var Supplier=mongoose.model('Supplier');
var Customer=mongoose.model('Customer');
var Worker=mongoose.model('Worker');
var Founder=mongoose.model('Founder');
var Contragent=mongoose.model('Contragent');
var Account=mongoose.model('Account');
var globalVariable = require('../../../public/bookkeep/scripts/variables.js')
var calculate=require('../calculate');
const ports = require('../../../modules/ports')
const stuffHost = 'http://127.0.0.1:'+ports.stuffPort;

const Models={
    Supplier:Supplier,
    Customer:Customer,
    Worker:Worker,
    Founder:Founder,
    Contragent:Contragent
}
var ClosePeriod=mongoose.model('ClosePeriod');
exports.hold = async function(req, res, next) {
    //https://blog.lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795
    let authorization= req.headers.authorization||req.headers.Authorization;
    // Set the headers
    let headers = {
        'Authorization':     authorization
    }
    for(let key in req.headers){
        //console.log(key,req.headers[key])
        if(key=='accept' || key=='connection' || key =='accept-encoding'||key=='accept-language'){
            headers[key]=req.headers[key]
        }/*else{
         console.log(key,req.headers[key])
         }*/
    }


    req.store.headers = headers;
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
async function hold(id,store) {
    const currency = store.currency
    const mainCurrency=(store.currency.mainCurrency)?store.currency.mainCurrency:'UAH'
    try {
        let stuffs=[];
        const pn = await Pn.findOne({_id:id}).populate('contrAgent').lean().exec();
        const virtualAccount = (pn.virtualAccount && pn.virtualAccount.toString)?pn.virtualAccount.toString():pn.virtualAccount;
        let queryForSA = {store:store._id,date:{$gte:pn.date},virtualAccount:virtualAccount}
        const doc = await SA.findOne(queryForSA).lean().exec();
        if(doc){
            return 'сформирована инвентаризация позднее даты проведения документа - '+doc.name
        }
        pn.supplier=pn.contrAgent;

        const pnCurrency=(pn.currency)?pn.currency:mainCurrency;
        const pnCurrencyRate=(currency[pnCurrency]&& currency[pnCurrency][0])?currency[pnCurrency][0]:1;
        let supplierRate = (pn.supplier && pn.supplier.rate)?pn.supplier.rate:0; // по умолчанию 25% наценка
        let supplier = pn.supplier._id.toString()
        supplierRate=1+supplierRate/100;
        let ed = {
            type:'pn',
            _id:pn._id,
            name:pn.name,
            date:pn.date,
            currency:pn.currency
        }
        if(pn.desc){
            ed.comment=pn.desc
        }
        pn.supplier=pn.contrAgent;
        if(pn.actived){
            return 'накладная проведена'
        }


        let queryForCP = {store:store._id,actived:true,date:{$gte:pn.date},virtualAccount:virtualAccount}
        let CP = await ClosePeriod.findOne(queryForCP).sort({date: -1}).lean().exec()
        if(CP){
            return 'документ не может быть проведен в закрытом периоде '+CP.name;
        }
        let sa = await SA.findOne(queryForCP).sort({date: -1}).lean().exec()
        if(sa){
            return 'документ не может быть проведен ранее проведенной инвентаризации '+sa.name;
        }

        const materials = pn.materials.map(m=>{
            return JSON.parse(JSON.stringify(m))
        })
        let ids = materials.map(m=>m.item)
        let materialsFromDB = await Material.find({_id:{$in:ids}}).exec()
        //console.log(materialsFromDB)
        for(let m of pn.materials){
            //console.log(m)
            let material = materialsFromDB.find(mat=>{
                return ((mat._id.toString)?mat._id.toString():mat._id)==
                    ((m.item && m.item.toString)?m.item.toString():m.item)
            })
            if(store.bookkeep && material.stuff){
                let item = {
                    stuff:material.stuff,
                    sort:material.sort,
                    qty:m.qty
                }
                stuffs.push(item)
            }
        }


        const promises= pn.materials.map(handleMaterial)
        await Promise.all(promises)


        const accounts = await Account.find({store:store._id}).lean().exec();
        /*сумма накладной  в валюте баланса*/
        let sumPN=materials.reduce(function(s,m){
            //console.log('m',m)
            s +=m.qty*m.price
            return s
        },0)
        pn.sum=Math.round(sumPN*100)/100;
        //let sumPNRate = Math.round((sumPN/pnCurrencyRate)*100)/100
        pn.entries=[];
        /* проводки*/
        let accountWarehouse = accounts.find(a=>a.type=='Warehouse')._id.toString()
        let accountSupplier = accounts.find(a=>a.type==pn.typeOfContrAgent)._id.toString()
        calculate.makeEntries(pn.entries,accountWarehouse,accountSupplier,virtualAccount,pn.sum,ed,pn.currency)

        if(pn.type=='return'){
            let sumPNReturn=materials.reduce(function(s,m){
                //console.log('m',m)
                s +=m.qty*m.priceReturn
                return s
            },0)
            pn.sumReturn=Math.round(sumPNReturn*100)/100;
            let delta = Math.round((pn.sum-pn.sumReturn)*100)/100;
            let accountProfit = accounts.find(a=>a.type=='Profit')._id.toString()
            /*1 разница между стоимостью продажи клиенту и складской ценой*/
            ed.comment='Разница между стоимостью продажи клиенту и складской ценой при возврате товара.'
            calculate.makeEntries(pn.entries,accountProfit,accountWarehouse,virtualAccount,delta,ed,pn.currency)
        }


        let resultPN = await Pn.update({_id:id},{ $set: { currencyData: currency,entries:pn.entries,materials:pn.materials,sum:pn.sum}})
        if(!pn.supplier.data){
            pn.supplier.data=[]
        }
        calculate.data(pn.supplier,pn.sum,pn.currency,virtualAccount,'credit','debet')

        resultPN = await Models[pn.typeOfContrAgent].update({_id:pn.supplier._id},{$set:{data:pn.supplier.data}})
        await Pn.update({_id:pn._id},{$set:{sum:sumPN,actived:true}})

        if(store.bookkeep && stuffs.length){
            try {
                await setStockData(stuffs,'+',store._id)
            }catch (e) {
                return e;
            }
        }

        console.log('done hold pn')
        return null;

        async function handleMaterial(m) {
            //console.log(m)
            let supplierM = m.supplier || supplier;
            let supplierTypeM = m.supplierType || pn.typeOfContrAgent;
            /*if(pn.type=='return'){

            }*/
            let material = materialsFromDB.find(mat=>mat._id.toString()==m.item)
            let materialCurrency = (material.currency)?material.currency:mainCurrency;
            let materialCurrencyRate =(currency[materialCurrency]&& currency[materialCurrency][0])?currency[materialCurrency][0]:1;
            let rate =pnCurrencyRate/materialCurrencyRate;
            if(material){

                if(!material.data) {
                    material.data = [];
                }
                material.data = material.data.filter(d=>d&& d.virtualAccount)

                let data = material.data.find(function (d) {
                    let dVA = (d.virtualAccount && d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount
                    return dVA==virtualAccount && d.supplier.toString()==supplierM && d.supplierType==supplierTypeM;
                })
                /* такой товар на таком складе от такого поставщика уже существует*/
                if(!data){
                    /* создаем пустой объект для данных*/
                    data ={virtualAccount:virtualAccount,supplier:supplierM,supplierType:supplierTypeM,qty:0,price:0,priceForSale:0}
                    material.data.push(data)
                    data = material.data.find(function (d) {
                        return d.virtualAccount==virtualAccount && d.supplier==supplierM && d.supplierType==supplierTypeM;
                    })
                }

                m.priceForSale=Math.round((m.price*supplierRate)*100)/100

                let mm = JSON.parse(JSON.stringify(m))
                /* для возвратной накладной от покупателя. складская цена находится в ячейке priceReturn*/
                if(mm.priceReturn){
                    mm.priceForSale=mm.price;
                    mm.price = mm.priceReturn
                }
                //console.log(mm)
                calculate.pn_getPriceAndPriceForSaleForMaterialData(mm,data,rate)
                //console.log(data)
                let price=0;
                let qty=0;
                let priceForSale=0;
                material.data.forEach(function (mat) {
                    qty +=mat.qty
                    price +=mat.price*mat.qty
                    priceForSale +=mat.priceForSale*mat.qty
                })
                material.qty=qty
                material.price=(qty)?Math.round((price/qty)*100)/100:0;
                material.priceForSale=(qty)?Math.round((priceForSale/qty)*100)/100:0;
                //console.log(material)
                try{
                    let r = await Material.update({_id:material._id},{$set:{price:material.price,qty:material.qty,priceForSale:material.priceForSale,data:material.data}});
                    /*if(material.stuff && material.sort){
                        let data = {_id:material.stuff};
                        let update = 'stock.'+material.sort+'.quantity'
                        data[update]=material.qty;
                        await updateStuff(data,store,update)
                    }*/
                }catch(err){
                    console.log('err saving material ',err)
                    let r = await Material.update({_id:material._id},{$set:{price:material.price,qty:material.qty,priceForSale:material.priceForSale,data:material.data}});
                    console.log('saved material',r)
                }
            }



        }

    } catch (err) {
        //console.log(err)
        return err

    }
}

async function updateStuff(data,store,update) {
    return new Promise(function (resolve, reject) {
        var urll = "http://127.0.0.1:8900/api/collections/Stuff/" + data._id+'?store='+store._id+'&update='+update;
        console.log(urll)
        let options={
            url:urll,
            method: 'POST',
            headers: store.headers,
            body:data,
            json: true,
        }
        request(options, function(error,response,body){
            if (error) {
                reject( error )
            }
            /*console.log(response)
            console.log(body)*/
            resolve(body)
        })
    })
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
    //https://blog.lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795

    try {
        let stuffs=[];
        const pn = await Pn.findOne({_id:id}).populate('contrAgent').lean().exec();
        //console.log('pn',pn)
        if(!pn){
            let err = new Error('нет приходной накладной '+id)
            return err;
        }
        const virtualAccount = (pn.virtualAccount && pn.virtualAccount.toString)?pn.virtualAccount.toString():pn.virtualAccount;
        pn.supplier=pn.contrAgent;
        let queryForCP = {store:store._id,actived:true,date:{$gte:pn.date},virtualAccount:virtualAccount}
        let CP = await ClosePeriod.findOne(queryForCP).sort({date: -1}).lean().exec()
        if(CP){
            return 'документ не может быть проведен в закрытом периоде '+CP.name;
        }
        let sa = await SA.findOne(queryForCP).sort({date: -1}).lean().exec()
        if(sa){
            return 'документ не может быть отменет ранее проведенной инвентаризации '+sa.name;
        }

        const materials = pn.materials.map(m=>{
            return JSON.parse(JSON.stringify(m))
        })
        let sumPN=materials.reduce(function(s,m){
            //console.log('m',m)
            s +=m.qty*m.price
            return s
        },0)

        //console.log(pn)
        const currency = (pn.currencyData)?pn.currencyData:store.currency
        const mainCurrency=(store.currency.mainCurrency)?store.currency.mainCurrency:'UAH'
        const pnCurrency=(pn.currency)?pn.currency:mainCurrency;
        const pnCurrencyRate=(currency[pnCurrency]&& currency[pnCurrency][0])?currency[pnCurrency][0]:1;
        //console.log(pn.supplier);
        let supplierRate = (pn.supplier && pn.supplier.rate)?pn.supplier.rate:0; // по умолчанию 25% наценка

        let supplier = pn.supplier._id.toString()
        supplierRate=1+supplierRate/100;


        let ids = materials.map(m=>m.item)
        let materialsFromDB = await Material.find({_id:{$in:ids}}).exec()
        //console.log(materialsFromDB)

        for(let m of pn.materials){
            let material = materialsFromDB.find(mat=>{
                return ((mat && mat._id && mat._id.toString)?mat._id.toString():mat._id)==
                    ((m.item && m.item.toString)?m.item.toString():m.item)
            })
            if(store.bookkeep && material.stuff){
                let item = {
                    stuff:material.stuff,
                    sort:material.sort,
                    qty:m.qty
                }
                stuffs.push(item)
            }
        }


        const promises= pn.materials.map(handleMaterial)

        await Promise.all(promises)
        pn.entries=[];
        let resultPN = await Pn.update({_id:id},{ $set: { entries: pn.entries,actived:false}})
        console.log('done',resultPN)
        if(!pn.supplier.data){
            pn.supplier.data=[]
        }
        /*сторнируем запись у поставщика*/
        calculate.data(pn.supplier,pn.sum,pn.currency,virtualAccount,'debet','credit')
        resultPN = await Models[pn.typeOfContrAgent].update({_id:pn.supplier._id},{$set:{data:pn.supplier.data}})

        if(store.bookkeep && stuffs.length){
            try {
                await setStockData(stuffs,'-',store._id)
            }catch (e) {
                return e;
            }
        }

       return null;

        async function handleMaterial(m) {
            let supplierM = m.supplier || supplier;
            let supplierTypeM = m.supplierType || pn.typeOfContrAgent;
            //console.log(pnCurrency)
            let material = materialsFromDB.find(mat=>mat._id.toString()==m.item)
            if(!material){return}
            //console.log(currency)
            let materialCurrency = (material.currency)?material.currency:mainCurrency;
            //console.log(materialCurrency)
            let materialCurrencyRate =(currency[materialCurrency]&& currency[materialCurrency][0])?currency[materialCurrency][0]:1;
            let rate =pnCurrencyRate/materialCurrencyRate
            //console.log(pnCurrencyRate,materialCurrencyRate,rate)
            //console.log(material)


            let data ={virtualAccount:virtualAccount,supplier:supplierM,qty:0,price:0,priceForSale:0}
            let isData;
            if(material.data && material.data.length){
                let m = material.data.find(function (d) {
                    let dVA = (d.virtualAccount && d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount
                    return dVA==virtualAccount && d.supplier.toString()==supplierM && d.supplierType==supplierTypeM;
                })
                /* такой товар на таком складе от такого поставщика уже существует*/
                if(m){data = m;isData=true;}
            }
            /* меняем на данные из массива*/
            if(!data.price){data.price=0}
            if(!data.priceForSale){data.priceForSale=0}
            if(!data.qty){data.qty=0;}
            data.sum = data.price*data.qty;
            data.sumForSale = data.priceForSale*data.qty;


            /*let price=(material.price)?material.price:0;
             let priceForSale=(material.priceForSale)?material.priceForSale:0;
             let qty=(material.qty && material.qty>0)?material.qty:0;
             let sum = price*qty;
             let sumForSale = priceForSale*qty;*/
            if(m.priceReturn){
                m.priceForSale=m.price;
                m.price = m.priceReturn
            }

            m.sum = (m.price*m.qty)/rate
            m.sum = Math.round((m.sum)*100)/100
            m.sumForSale = m.sum*supplierRate
            m.sumForSale = Math.round((m.sumForSale)*100)/100

            data.qty-=m.qty;
            if(data.qty && data.qty>0){
                data.price = Math.round(((data.sum-m.sum)/data.qty)*100)/100;
                data.priceForSale = Math.round(((data.sumForSale-m.sumForSale)/data.qty)*100)/100;
            }else{
                data.price=0;
                data.priceForSale=0;
                data.qty=0;
            }
            let price=0;
            let qty=0;
            let priceForSale=0;
            //material.data=material.data.filter((m)=>m.qty>0)
            material.data.forEach(function (mat) {
                qty +=mat.qty
                price +=mat.price*mat.qty
                priceForSale +=mat.priceForSale*mat.qty
            })
            material.qty=qty
            material.price=(qty)?Math.round((price/qty)*100)/100:0;
            material.priceForSale=(qty)?Math.round((priceForSale/qty)*100)/100:0;

            /*console.log(data)
             console.log(material)*/
            //kk='gdflf'
            try{
                let result = await material.save();
                console.log('saved material')
            }catch(err){
                console.log('err saving material ',err)
                let r = await Material.update({_id:material._id},{$set:{price:material.price,qty:material.qty,priceForSale:material.priceForSale,data:material.data}});
                console.log('saved material',r)
            }


        }

    } catch (err) {
        //console.log(err)
        return err;

    }




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











