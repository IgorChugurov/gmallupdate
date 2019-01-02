'use strict';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var ObjectID = mongoose.Types.ObjectId;
var fs = require('fs');
var path = require('path');
var request=require('request');
var Act=mongoose.model('Act');
var Material=mongoose.model('Material');
var SA=mongoose.model('AgentStockAdjustment');
var ClosePeriod=mongoose.model('ClosePeriod');

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
        const virtualAccount = (act.virtualAccount && act.virtualAccount.toString)?act.virtualAccount.toString():act.virtualAccount;
        const actId = (act._id && act._id.toString)?act._id.toString():act._id;


        let queryForSA = {store:req.store._id,date:{$gte:act.date},virtualAccount:virtualAccount,type:'Worker'}
        const doc = await SA.findOne(queryForSA).lean().exec();
        if(doc){
            return next('сформирована инвентаризация по сотрудникам позднее даты проведения документа - '+doc.name)
        }

        if(act.actived){
            return next('документ проведен')
        }
        let queryForCP = {store:req.store._id,actived:true,date:{$gte:act.date},virtualAccount:virtualAccount}
        let CP = await ClosePeriod.findOne(queryForCP).sort({date: -1}).lean().exec()
        if(CP){
            return next('документ не может быть проведен в закрытом периоде '+CP.name)
        }
        let ed = {
            type:'act',
            _id:act._id,
            name:act.name,
            date:act.date
        }
        if(act.desc){
            ed.comment=act.desc
        }
        if(act.zakaz){
            ed.zakazName=act.zakaz.name;
            ed.zakazId=act.zakaz._id;
        }


        let ids = act.works.map(w=>w.worker)
        let workers = await Worker.find({_id:{$in:ids}}).lean().exec();


        act.sumForWorker=0;
        act.sum=0;
        for(let work of act.works){

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
                    calculate.data(worker,sumForWorker,act.currency,virtualAccount,'credit','debet')
                    work.salary=sumForWorker;
                }else{
                    work.salary=0
                }
            }
        }
        for(let w of workers){

            let resultPN = await Worker.update({_id:w._id},{$set:{data:w.data}})
        }




        act.entries=[];



        const accounts = await Account.find({store:req.store._id}).lean().exec();
        /***************************проводки *************/
        let accountManufacture = accounts.find(a=>a.type=='Manufacture')._id.toString()
        let accounWorker = accounts.find(a=>a.type=='Worker')._id.toString()
        /*2 зп продавца*/
        if(act.sumForWorker){
            ed.comment='зп за выполненные работы'
            calculate.makeEntries(act.entries,accountManufacture,accounWorker,virtualAccount,act.sumForWorker,ed,mainCurrency)
        }

        /****************************************/


        /*сумма !!!!!! и сумма для работника и сумма входящая надо сохранять так же*/
        let r = await Act.update({_id:req.params.id},{$set:{entries:act.entries,actived:true,sum:act.sum,sumForWorker:act.sumForWorker,workingHour:workingHour,works:act.works}})
        console.log('done hold act')
        res.json({msg:'ok'})
    } catch (err) {
        console.log('err',err)
        next(err)

    }
}




exports.holdController = async function(id,store) {
    const currency = store.currency
    const mainCurrency=(store.currency.mainCurrency)?store.currency.mainCurrency:'UAH'
    let workingHour = globalVariable.workingHour;
    try {
        const act = await Act.findOne({_id:id}).populate('zakaz','name').lean().exec()
        const actCurrency=(act.currency)?act.currency:mainCurrency;
        const actCurrencyRate=(currency[actCurrency]&& currency[actCurrency][0])?currency[actCurrency][0]:1;
        const virtualAccount = (act.virtualAccount && act.virtualAccount.toString)?act.virtualAccount.toString():act.virtualAccount;
        const actId = (act._id && act._id.toString)?act._id.toString():act._id;


        let queryForSA = {store:store._id,date:{$gte:act.date},virtualAccount:virtualAccount,type:'Worker'}
        const doc = await SA.findOne(queryForSA).lean().exec();
        if(doc){
            return 'сформирована инвентаризация по сотрудникам позднее даты проведения документа - '+doc.name
        }

        if(act.actived){
            return 'документ проведен';
        }
        let queryForCP = {store:store._id,actived:true,date:{$gte:act.date},virtualAccount:virtualAccount}
        let CP = await ClosePeriod.findOne(queryForCP).sort({date: -1}).lean().exec()
        if(CP){
            'документ не может быть проведен в закрытом периоде '+CP.name
        }
        let ed = {
            type:'act',
            _id:act._id,
            name:act.name,
            date:act.date
        }
        if(act.desc){
            ed.comment=act.desc
        }
        if(act.zakaz){
            ed.zakazName=act.zakaz.name;
            ed.zakazId=act.zakaz._id;
        }


        let ids = act.works.map(w=>w.worker)
        let workers = await Worker.find({_id:{$in:ids}}).lean().exec();

        act.sumForWorker=0;
        act.sum=0;
        for(let work of act.works){

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
                    calculate.data(worker,sumForWorker,act.currency,virtualAccount,'credit','debet')
                    work.salary=sumForWorker;
                }else{
                    work.salary=0
                }
            }
        }
        for(let w of workers){

            let resultPN = await Worker.update({_id:w._id},{$set:{data:w.data}})
        }




        act.entries=[];



        const accounts = await Account.find({store:store._id}).lean().exec();
        /***************************проводки *************/
        let accountManufacture = accounts.find(a=>a.type=='Manufacture')._id.toString()
        let accounWorker = accounts.find(a=>a.type=='Worker')._id.toString()
        /*2 зп продавца*/
        if(act.sumForWorker){
            ed.comment='зп за выполненные работы'
            calculate.makeEntries(act.entries,accountManufacture,accounWorker,virtualAccount,act.sumForWorker,ed,mainCurrency)
        }

        /****************************************/


        /*сумма !!!!!! и сумма для работника и сумма входящая надо сохранять так же*/
        let r = await Act.update({_id:id},{$set:{entries:act.entries,actived:true,sum:act.sum,sumForWorker:act.sumForWorker,workingHour:workingHour,works:act.works}})
        console.log('done hold act')
        return null
    } catch (err) {
        console.log('err',err)
        return err

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
        const act = await Act.findOne({_id:id}).populate('zakaz','actived').lean().exec()
        console.log('act',act)
        let workingHour=act.workingHour||globalVariable.workingHour;
        const currency = (act.currencyData)?act.currencyData:store.currency
        const mainCurrency=(store.currency.mainCurrency)?store.currency.mainCurrency:'UAH'
        const actCurrency=(act.currency)?act.currency:mainCurrency;
        const actCurrencyRate=(currency[actCurrency]&& currency[actCurrency][0])?currency[actCurrency][0]:1;
        if(!act.actived){
            return 'документ не проведен';
        }
        if(act.zakaz.actived){
            return 'нарад-заказ проведен';
        }

        const virtualAccount = (act.virtualAccount && act.virtualAccount.toString)?act.virtualAccount.toString():act.virtualAccount;
        const zakaz = (act.zakaz && act.zakaz.toString)?act.zakaz.toString():act.zakaz;
        const actId = (act._id && act._id.toString)?act._id.toString():act._id;

        let ids = act.works.map(w=>w.worker)
        let workers = await Worker.find({_id:{$in:ids}}).lean().exec();
        act.sumForWorker=0;
        act.sum=0;
        for(let work of act.works){
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
            let resultPN = await Worker.update({_id:w._id},{$set:{data:w.data}})
        }

        act.entries=[];
        /*************************/
        let r = await Act.update({_id:id},{$set:{entries:[],actived:false}})
        /**********************/


        console.log('done cancel act')
        return null;
    } catch (err) {
        console.log('err',err)
        return err;

    }
}








