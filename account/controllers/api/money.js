'use strict';
var mongoose = require('mongoose')//.set('debug', true)
mongoose.Promise = global.Promise;
var ObjectID = mongoose.Types.ObjectId;
var fs = require('fs');
var path = require('path');
var request=require('request');
var calculate=require('../calculate');
var MoneyOrder=mongoose.model('MoneyOrder');
var Pn=mongoose.model('Pn');
var SA=mongoose.model('AgentStockAdjustment');
var SampleEntries=mongoose.model('SampleEntries');
var Supplier=mongoose.model('Supplier');
var Customer=mongoose.model('Customer');
var Worker=mongoose.model('Worker');
var Founder=mongoose.model('Founder');
var Contragent=mongoose.model('Contragent');
var Money=mongoose.model('Money');
var Account=mongoose.model('Account');
var Models ={
    Money:Money,
    Contragent:Contragent,
    Founder:Founder,
    Worker:Worker,
    Customer:Customer,
    Supplier:Supplier
}
var ClosePeriod=mongoose.model('ClosePeriod');



var globalVariable = require('../../../public/bookkeep/scripts/variables.js')

exports.hold = async function(req, res, next) {
    //https://blog.lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795

    let error = await hold(req.params.id,req.store);
    if(error){
        next(error)
    }else{
        res.json({msg:'ok',diff:0})
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
        const mo = await MoneyOrder.findOne({_id:id}).lean().exec();
        if(mo.contrAgentExchange){
            let cur;
            let sum=0;
            if(mo.contrAgentExchangeData){
                let keys = Object.keys(mo.contrAgentExchangeData);
                if(!keys.length){
                    let error = new Error('не становлена сумма для обмена')
                    return error;
                }else if(keys.length>1){
                    let oneSum = true;
                    if(Number(mo.contrAgentExchangeData[keys[0]])===0){
                        let error = new Error('не становлена сумма для обмена')
                        return error;
                    }
                    cur = keys[0];
                    sum = contrAgentExchangeData[keys[0]];
                }else if(keys.length===1){
                    if(Number(mo.contrAgentExchangeData[keys[0]])===0){
                        let error = new Error('не становлена сумма для обмена')
                        return error;
                    }
                    cur = keys[0];
                    sum = mo.contrAgentExchangeData[keys[0]];
                }

            }else{
                let error = new Error('не становлена сумма для обмена')
                return error;
            }
            mo.contrAgentExchangeData={};mo.contrAgentExchangeData[mo.currency]=mo.sum;
            mo.currency=cur;
            mo.sum = sum;


        }
        const virtualAccount = mo.virtualAccount.toString()
        let queryForCP = {store:store._id,actived:true,date:{$gte:mo.date},virtualAccount:virtualAccount}
        let CP = await ClosePeriod.findOne(queryForCP).sort({date: -1}).lean().exec()
        if(CP){
            return 'документ не может быть проведен в закрытом периоде '+CP.name;
        }


        if(!Models[mo.typeOfContrAgent]){return 'нет такого типа контрагента'}
        let[typeOfMoney,balanceSide]=mo.type.split('_');
        let reverceBalanceSide=(balanceSide=='debet')?'credit':'debet';
        let money = await Money.findOne({store:store._id,type:typeOfMoney}).exec()
        const accounts = await Account.find({store:store._id}).lean().exec();
        let accountMoney = accounts.find(a=>a.type==typeOfMoney)._id.toString()
        let ed={
            type:mo.type,
            _id:mo._id,
            name:mo.name,
            date:mo.date,
            currency:mo.currency,
        }
        if(mo.desc){
            ed.comment=mo.desc
        }
        mo.entries=[];
        let acconutDebet,accountCredit,sum;
        if(balanceSide=='exchange'){
            let err = calculate.exchange(money,mo,virtualAccount,currency,null,mainCurrency);
            if(err){return err}
            await Money.update({_id:money._id},{$set:{data:money.data}})
            /*проводки*/
            let accountExchange = accounts.find(a=>a.type=='Exchange')._id.toString()
            if(mo.diff){
                if(mo.diff.debet){
                    acconutDebet=accountMoney;
                    accountCredit=accountExchange;
                    sum=mo.diff.debet;
                }else if(mo.diff.credit){
                    acconutDebet=accountExchange;
                    accountCredit=accountMoney;
                    sum=mo.diff.credit;
                }
            }
            if(sum){
                /*разница вычисляется по отношению к основной валюте баланса*/
                calculate.makeEntries(mo.entries,acconutDebet,accountCredit,virtualAccount,sum,ed,mainCurrency)
            }
            await MoneyOrder.update({_id:mo._id},{$set:{entries:mo.entries,diff:mo.diff,actived:true}})
        }else{
            let model = await Models[mo.typeOfContrAgent].findOne({store:store._id,_id:mo.contrAgent}).exec()
            if(money && model){
                let o={entries:mo.entries,diff:mo.diff,actived:true};
                if(mo.contrAgentExchange){
                    o.currency=mo.currency;
                    o.sum =  mo.sum;
                    o.contrAgentExchangeData=mo.contrAgentExchangeData;
                    try{
                        let keys=Object.keys(mo.contrAgentExchangeData);
                        /*создание обменного ордера*/
                        let mO ={
                            store:mo.store,
                            name:mo.name+' внутренний обмен',
                            type:typeOfMoney+'_exchange',
                            virtualAccount:mo.virtualAccount,
                            typeOfContrAgent:mo.typeOfContrAgent,
                            contrAgent:mo.contrAgent

                        }
                        if(balanceSide=='debet'){
                            mO.credit=mo.sum;
                            mO.currencyCredit=mo.currency;
                            mO.currencyDebet=keys[0];
                            mO.debet=mo.contrAgentExchangeData[keys[0]]
                        }else if(balanceSide=='credit'){
                            mO.debet=mo.sum;
                            mO.currencyDebet=mo.currency;
                            mO.currencyCredit=keys[0];
                            mO.credit=mo.contrAgentExchangeData[keys[0]]
                        }
                        let moE = new MoneyOrder(mO)

                        o.connectedOrder=moE._id;
                        await moE.save();
                        await hold(moE._id,store);
                        /*обновляем данные по кассе или банку после проведения обменного ордера*/
                        money = await Money.findOne({store:store._id,type:typeOfMoney}).exec()
                        //console.log(moE)
                    }catch(err){console.log(err)}
                }



                calculate.data(money,mo.sum,mo.currency,virtualAccount,balanceSide,reverceBalanceSide)
                calculate.data(model,mo.sum,mo.currency,virtualAccount,reverceBalanceSide,balanceSide)
                await Money.update({_id:money._id},{$set:{data:money.data}})
                await Models[mo.typeOfContrAgent].update({_id:model._id},{$set:{data:model.data}})
                /*проводки*/
                let accountContrAgent = accounts.find(a=>a.type==mo.typeOfContrAgent)._id.toString()
                let currencyRate=(currency[mo.currency] && currency[mo.currency][0])?currency[mo.currency][0]:1;
                //sum =Math.round((mo.sum/currencyRate)*100)/100
                if(balanceSide=='debet'){
                    acconutDebet=accountMoney;
                    accountCredit=accountContrAgent;
                }else{
                    acconutDebet=accountContrAgent;
                    accountCredit=accountMoney;
                }
                calculate.makeEntries(mo.entries,acconutDebet,accountCredit,virtualAccount,mo.sum,ed,mo.currency)

                await MoneyOrder.update({_id:mo._id},{$set:o})
            }
        }
        return null;
    } catch (err) {
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
    const currency = store.currency
    try {
        const mo = await MoneyOrder.findOne({_id:id}).lean().exec();



        const virtualAccount = mo.virtualAccount.toString()
        if(!Models[mo.typeOfContrAgent]){return next('нет такого типа контрагента')}
        let[typeOfMoney,balanceSide]=mo.type.split('_')
        let reverceBalanceSide=(balanceSide=='debet')?'credit':'debet';
        let money = await Money.findOne({store:store._id,type:typeOfMoney}).exec()

        //console.log(r)
        if(balanceSide=='exchange'){
            let err = calculate.exchange(money,mo,virtualAccount,currency,true);
            if(err){return next(err)}
            //console.log(money.data)
            await Money.update({_id:money._id},{$set:{data:money.data,actived:false}})
        }else{
            let model = await Models[mo.typeOfContrAgent].findOne({store:store._id,_id:mo.contrAgent}).exec()
            if(money && model){
                calculate.data(money,mo.sum,mo.currency,virtualAccount,reverceBalanceSide,balanceSide)
                calculate.data(model,mo.sum,mo.currency,virtualAccount,balanceSide,reverceBalanceSide)
                await Money.update({_id:money._id},{$set:{data:money.data}})
                await Models[mo.typeOfContrAgent].update({_id:model._id},{$set:{data:model.data}})
            }
        }

        mo.entries=[];
        let o={entries:mo.entries,actived:false};
        if(mo.contrAgentExchange){
            let keys = Object.keys(mo.contrAgentExchangeData);
            let cur = keys[0];
            let sum = mo.contrAgentExchangeData[keys[0]]
            mo.contrAgentExchangeData={};
            mo.contrAgentExchangeData[mo.currency]=mo.sum;
            mo.currency=cur;;
            mo.sum =  sum;

            o.currency=mo.currency;
            o.sum =  mo.sum;
            o.contrAgentExchangeData=mo.contrAgentExchangeData;
            o.connectedOrder=null;
            if(mo.connectedOrder){
                try{
                    let moE = await MoneyOrder.findOne({_id:mo.connectedOrder}).lean().exec();
                    if(moE){
                        await cancel(mo.connectedOrder,store);
                        await MoneyOrder.findByIdAndRemove(mo.connectedOrder).exec();
                    }

                }catch(err){console.log(err)}

            }
        }

        let r = await MoneyOrder.update({_id:mo._id},{$set:o})


        return null;
    } catch (err) {
        return err;
    }
}











