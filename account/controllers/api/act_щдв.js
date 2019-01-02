'use strict';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var ObjectID = mongoose.Types.ObjectId;
var fs = require('fs');
var path = require('path');
var request=require('request');
var Act=mongoose.model('Act');
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





exports.hold = async function(req, res, next) {
    const currency = req.store.currency
    const mainCurrency=(req.store.currency.mainCurrency)?req.store.currency.mainCurrency:'UAH'
    let workingHour = globalVariable.workingHour;
    try {
        const act = await Act.findOne({_id:req.params.id}).populate('zakaz','name').lean().exec()
        const actCurrency=(act.currency)?act.currency:mainCurrency;
        const actCurrencyRate=(currency[actCurrency]&& currency[actCurrency][0])?currency[actCurrency][0]:1;

        if(act.actived){
            return next('документ проведен')
        }
        let ed = {
            type:'act',
            _id:act._id,
            name:act.name,
            date:act.date
        }
        if(act.zakaz){
            ed.zakazName=act.zakaz.name;
            ed.zakazId=act.zakaz._id;
        }
        const virtualAccount = (act.virtualAccount && act.virtualAccount.toString)?act.virtualAccount.toString():act.virtualAccount;
        const actId = (act._id && act._id.toString)?act._id.toString():act._id;

        let ids = act.works.map(w=>w.worker)
        let workers = await Worker.find({_id:{$in:ids}}).lean().exec();
        //console.log(workers)

        act.sumForWorker=0;
        act.sum=0;
        for(let work of act.works){
            //console.log(work)
            if(work.qty && workingHour[act.currency]){
                work.price=Math.round((workingHour[act.currency]*work.qty)*100)/100
                act.sum+= work.price;
                let worker = workers.find(w=>((w._id.toString)?w._id.toString():w._id)==((work.worker.toString)?work.worker.toString():work.worker))
                //console.log('worker',worker)
                if(worker && worker.rateWork && work.price){
                    if(!worker.data){
                        worker.data=[]
                    }
                    let  sumForWorker = Math.round(((work.price/100)*worker.rateWork) *100)/100
                    act.sumForWorker+=sumForWorker;
                    calculate.data(worker,sumForWorker,act.currency,virtualAccount,'credit','debet')
                    work.salary=sumForWorker;
                }else{
                    work.salary=0
                }
            }
        }
        for(let w of workers){
            //console.log('w.data',w.data)
            let resultPN = await Worker.update({_id:w._id},{$set:{data:w.data}})
        }




        act.entries=[];
        let oForSum={}
        oForSum.sumRate = Math.round((act.sum/actCurrencyRate)*100)/100
        oForSum.sumForWorkerRate = Math.round((act.sumForWorker/actCurrencyRate)*100)/100


        const accounts = await Account.find({store:req.store._id}).lean().exec();
        /***************************проводки *************/
        let accountManufacture = accounts.find(a=>a.type=='Manufacture')._id.toString()
        let accounWorker = accounts.find(a=>a.type=='Worker')._id.toString()
        /*2 зп продавца*/
        let sumForWorkerRate;
        if(oForSum.sumForWorkerRate){
            ed.comment='зп продавца'
            calculate.makeEntries(act.entries,accountManufacture,accounWorker,virtualAccount,oForSum.sumForWorkerRate,ed)
        }
        /****************************************/


        /*сумма !!!!!! и сумма для работника и сумма входящая надо сохранять так же*/
        let r = await Act.update({_id:req.params.id},{$set:{entries:act.entries,actived:true,sum:act.sum,sumForWorker:act.sumForWorker,workingHour:workingHour,works:act.works}})
        console.log('done')
        res.json({msg:'ok'})
    } catch (err) {
        console.log('err',err)
        next(err)

    }
}

exports.cancel = async function cancel(req, res, next) {
    //const currency = req.store.currency
    try {
        const act = await Act.findOne({_id:req.params.id}).populate('works.worker','data rateWork').populate('zakaz','actived').lean().exec()
        let workingHour=act.workingHour||globalVariable.workingHour;
        const currency = (act.currencyData)?act.currencyData:req.store.currency
        const mainCurrency=(req.store.currency.mainCurrency)?req.store.currency.mainCurrency:'UAH'
        const actCurrency=(act.currency)?act.currency:mainCurrency;
        const actCurrencyRate=(currency[actCurrency]&& currency[actCurrency][0])?currency[actCurrency][0]:1;
        if(!act.actived){
            return next('документ не проведен')
        }
        if(act.zakaz.actived){
            return next('нарад-заказ проведен')
        }

        const virtualAccount = (act.virtualAccount && act.virtualAccount.toString)?act.virtualAccount.toString():act.virtualAccount;
        const zakaz = (act.zakaz && act.zakaz.toString)?act.zakaz.toString():act.zakaz;
        const actId = (act._id && act._id.toString)?act._id.toString():act._id;

        let ids = act.works.map(w=>w.worker)
        let workers = await Worker.find({_id:{$in:ids}}).lean().exec();
        act.sumForWorker=0;
        act.sum=0;
        for(let work of act.works){
            //console.log(work)
            if(work.qty && workingHour[act.currency]){
                work.price=Math.round((workingHour[act.currency]*work.qty)*100)/100
                act.sum+= work.price;

                let worker = workers.find(w=>((w._id.toString)?w._id.toString():w._id)==((work.worker.toString)?work.worker.toString():work.worker))
                if(worker && worker.rateWork && work.price){
                    if(!worker.data){
                        worker.data=[]
                    }
                    let  sumForWorker = Math.round(((work.price/100)*worker.rateWork) *100)/100
                    act.sumForWorker+=sumForWorker;
                    calculate.data(worker,sumForWorker,act.currency,virtualAccount,'debet','credit')
                }
            }



        }

        for(let w of workers){
            //console.log(w.data)
            let resultPN = await Worker.update({_id:w._id},{$set:{data:w.data}})
        }

        act.entries=[];
        /*************************/
        let r = await Act.update({_id:req.params.id},{$set:{entries:[],actived:false}})
        /**********************/


        console.log('done')
        res.json({msg:'ok'})
    } catch (err) {
        console.log('err',err)
        next(err)

    }
}










