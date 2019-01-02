'use strict';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var ObjectID = mongoose.Types.ObjectId;
var fs = require('fs');
var path = require('path');
var request=require('request');
var Pn=mongoose.model('Pn');
var Rn=mongoose.model('Rn');
var Act=mongoose.model('Act');
let MO =mongoose.model('MoneyOrder')
var SA=mongoose.model('AgentStockAdjustment');
var Zakaz=mongoose.model('Zakaz');

var ClosePeriod=mongoose.model('ClosePeriod');
var Supplier=mongoose.model('Supplier');
var Customer=mongoose.model('Customer');
var Worker=mongoose.model('Worker');
var Founder=mongoose.model('Founder');
var Contragent=mongoose.model('Contragent');
var Money=mongoose.model('Money');
var Account=mongoose.model('Account');
var VirtualAccount=mongoose.model('VirtualAccount');
var Models ={
    Money:Money,
    Contragent:Contragent,
    Founder:Founder,
    Worker:Worker,
    Customer:Customer,
    Supplier:Supplier
}

exports.hold = async function(req, res, next) {
    const currency = req.store.currency
    const currencyArr = req.store.currencyArr
    try {

        const sa = await SA.findOne({_id:req.params.id}).exec();
        if(sa.actived){
            return next('документ проведен')
        }
        let virtualAccount=(sa.virtualAccount && sa.virtualAccount.toString)?sa.virtualAccount.toString():sa.virtualAccount;

        let saQuery={type:sa.type,store:req.store._id,actived:true,date:{$gt:sa.date},virtualAccount:virtualAccount};
        let saNext = await SA.findOne(saQuery).sort({date : -1}).lean().exec()
        if(saNext){
            throw 'Есть проведенная инвентаризация с более поздней датой'
        }
        let queryForCP = {store:req.store._id,actived:true,date:{$gte:sa.date},virtualAccount:virtualAccount}
        let CP = await ClosePeriod.findOne(queryForCP).sort({date: -1}).lean().exec()
        if(CP){
            return next('документ не может быть проведен в закрытом периоде '+CP.name)
        }
        try{
            /*получаем все позиции по выбранному счету*/
            let itemsFromBD = await Models[sa.type].find({store:req.store._id}).lean().exec();
            /*формирование расчетных остатков для инвентаризации*/
            await handleDataForGetBalances(req.store,virtualAccount,itemsFromBD,sa.date,sa.type,sa,'active')

            //let rr = await SA.update({_id:req.params.id},{$set:{diff:null}})

            let diff = calculateDiff(sa,currency,currencyArr)

            //let date = sa.date || Date.now()
            //console.log('diff',diff)
            sa.diff=diff;
            //sa.date=date;
            const accounts = await Account.find({store:req.store._id}).lean().exec();
            /* проводки*/
            let accountProfit = accounts.find(a=>a.type=='Profit')._id.toString()
            //console.log(seSA)
            //return next('error')

            sa.entries=[];
            if(sa.type=='Money'){
                for(let saItem of sa.items){
                    //console.log(saItem)
                    let item = await Models[sa.type].findOne({_id:saItem.item}).exec()
                    //console.log('item',item)
                    let accountMoney = accounts.find(a=>a.type==capitalizeFirstLetter(item.type))._id.toString()
                    let diff = saItem.diff;
                    handleEntries(virtualAccount,accountMoney,accountProfit,diff,sa)
                }
            }else{
                let accountSupplier = accounts.find(a=>a.type==sa.type)._id.toString()
                handleEntries(virtualAccount,accountSupplier,accountProfit,diff,sa)
            }

            console.log(diff)
            let r = await SA.update({_id:req.params.id},{$set:{diff:diff,entries:sa.entries,actived:true}})
            //let r = await sa.save()

            /* изменениние данных для контрагентов*/
            for (let itemFromDB of itemsFromBD){
                let result = await Models[sa.type].update({_id:itemFromDB._id},{$set:{data:itemFromDB.data}})
            }



            return res.json({diff:diff})
        }catch(err){
            return next(err)
        }

    } catch (err) {
        return next(err)
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
        let middleDate= new Date();
        let typeData=sa.type;
        /* изменениние данных для контрагентов - перерасчет на текущую дата*/
        let itemsFromBD = await Models[sa.type].find({store:req.store._id}).lean().exec();
        //console.log(itemsFromBD)
        let error = await handleDataForGetBalances(req.store,virtualAccount,itemsFromBD,middleDate,typeData)
        if(error){
            throw error;
        }
        for (let itemFromDB of itemsFromBD){
            let result = await Models[sa.type].update({_id:itemFromDB._id},{$set:{data:itemFromDB.data}})
        }
        return res.json({})
    } catch (err) {
        //console.log(err)
        next(err)

    }
}
exports.diff = diff;

exports.makeBalances = async function (req, res, next) {
    try{
        let Model,virtualAccounts,sa,middleDate,typeData;
        if(Models[req.params.id]){
            /*формирование остатков по выбранному счету по всем подразделениям на текущую дату*/
            virtualAccounts = await VirtualAccount.find({store:req.store._id,actived:true}).lean().exec();
            virtualAccounts = virtualAccounts.map(va=>((va._id.toString)?va._id.toString():va._id))
            Model = Models[req.params.id];
            middleDate = new Date();
            typeData=req.params.id;
        }else{
            /*формирование остатков по выбранному счету по подразделению  для инвентаризации на ее дату  */
            sa = await SA.findOne({_id:req.params.id}).lean().exec()
            let virtualAccount = (sa.virtualAccount.toString)?sa.virtualAccount.toString():sa.virtualAccount;
            virtualAccounts=[virtualAccount]
            Model=mongoose.model(sa.type);
            middleDate= sa.date;
            typeData=sa.type;
        }
        /*получаем все позиции по выбранному счету*/
        let itemsFromBD = await Model.find({store:req.store._id}).lean().exec();
        //console.log(itemsFromBD)
        for(let virtualAccount of virtualAccounts){
            //console.log(virtualAccount,typeof virtualAccount)
            let error = await handleDataForGetBalances(req.store,virtualAccount,itemsFromBD,middleDate,typeData,sa)
            //console.log('error1',error)
            if(error){
                throw error;
            }
        }
        for (let itemFromDB of itemsFromBD){
            //console.log('itemFromDB',itemFromDB.name)
            let result = await Model.update({_id:itemFromDB._id},{$set:{data:itemFromDB.data}})
        }



        return res.json({msg:'ok'})
    }catch(err){
        console.log(err)
        next(err);
    }

}

async function handleDataForGetBalances(store,virtualAccount,itemsFromBD,middleDate,typeData,sa,activeteSA) {
    try{
        let error;
        let currancyArr=store.currencyArr
        /*находим предыдущую проведенную инвентаризацию по данному подразделению и счету ранее даты инвентаризации или текущей даты*/
        let saQuery={type:typeData,store:store._id,actived:true,date:{$lt:middleDate},virtualAccount:virtualAccount};
        let saPrevious = await SA.findOne(saQuery).sort({date : -1}).lean().exec()
        /* запрос для выборки  - проведенные документы ранее даты инветаризации или ранее даты формирования остатков*/
        let query = {store:store._id,actived:true,date:{$lt:middleDate},virtualAccount:virtualAccount}
        /*если есть пердыдущая инвентаризация, документы позднее ее даты, если нет то с начала времен*/
        if(saPrevious){
            query.date.$gte=saPrevious.date;
        }
        //console.log('query',query)
        /* массиа для расчетных данных*/
        let items =[];

        /*формируем список позиций по инвентаризируемому счету с остатками по предыдущей инвентаризации если она есть или нулевыми остатками*/
        itemsFromBD.forEach(function (item) {
            let itemId = (item._id.toString)?item._id.toString():item._id;
            let d = {};
            currancyArr.forEach(c=>{
                d[c]={
                    debet:0,credit:0,
                    newDebet:0,newCredit:0
                }
            })
            let o ={
                item:itemId,
                itemType:typeData,
                data:d,
            }
            if(typeData=='Money'){
                o.moneyType=item.type;
            }
            items.push(o)
            let previousData;
            /* если есть предыдущая инвентаризация находим данные для начального остатка для текущей позиции*/
            if(saPrevious){
                let previosItem = saPrevious.items.find(ip=>{
                    let id = (ip.item.toString)?ip.item.toString():ip.item;
                    return id==itemId
                })
                //console.log(previosItem.data)
                if(previosItem){
                    for(let currency in o.data){
                        if(previosItem.data && previosItem.data[currency]){
                            o.data[currency].debet=previosItem.data[currency].newDebet;
                            o.data[currency].credit=previosItem.data[currency].newCredit;
                        }
                    }
                }
            }
        })
        /*акамулируем обороты по дебету и кредиту по валютам для данной позиции из массива электронных документов*/
        /*для денжных документов*/
        if(typeData!='Money'){
            query.typeOfContrAgent=typeData;
        }

        error = await handleMoneyOrder(typeData,query,items)
        if(error){throw error}
        /*приход и расход материалов*/
        if(typeData!='Money'){
            error = await  handlePns(query,items)
            if(error){throw error}
            error = await handleRns(query,items)
            if(error){throw error}
            error = await handleActs(query,items)
            if(error){throw error}
            error = await handleZakaz(query,items)
            if(error){throw error}
        }
        /*сворачиваем обороты для получения сальдо*/
        error = await foldingBalances(items,currancyArr)
        if(error){throw error}


        /*если есть текущая инвентаризация сохраняем данняе для инвентаризации*/
        if(sa){
            /* если происходит перерасчет остатков в момент проведения инвентаризации, то необходимо сначала зафиксить новые значения для позиций
            * а затем после сохранения данных произвести расчет остатков исходя из новых значений*/
            if(activeteSA){
                sa.items.forEach(itSa=>{
                    //console.log(itSa)
                    let itemId= (itSa.item.toString)?itSa.item.toString():itSa.item;
                    let item = items.find(itt=>itt.item==itemId)
                    currancyArr.forEach(c=>{
                        if(itSa.data[c]){
                            item.data[c].newDebet=itSa.data[c].newDebet;
                            item.data[c].newCredit=itSa.data[c].newCredit;
                        }
                    })
                    //console.log(item)
                })
            }
            let result = await SA.update({_id:sa._id},{$set:{items:items}})
            /* а затем после сохранения данных произвести расчет остатков исходя из новых значений*/
            if(activeteSA){
                items.forEach(item=>{
                    currancyArr.forEach(c=>{
                        if(item.data[c]){
                            item.data[c].debet=item.data[c].newDebet;
                            item.data[c].credit=item.data[c].newCredit;
                        }
                    })
                    //console.log(item)
                })
            }

            /* вычисление текущих остатков для позиций*/
            /* 1. проведенные документы позднее даты инветаризации*/
            let queryLastED = {store:store._id,actived:true,date:{$gte:sa.date},virtualAccount:virtualAccount}
            /*акамулируем обороты по дебету и кредиту по валютам для данной позиции из массива электронных документов*/
            if(typeData!='Money'){
                /*приходные накладные*/
                queryLastED.typeOfContrAgent=typeData;
            }
            /*для денжных документов*/
            error = await handleMoneyOrder(typeData,queryLastED,items)
            if(error){throw error}
            /*приход и расход материалов*/
            if(typeData!='Money'){
                /*приходные накладные*/
                error = await handlePns(queryLastED,items)
                if(error){throw error}
                error = await handleRns(queryLastED,items)
                if(error){throw error}
                error = await handleActs(queryLastED,items)
                if(error){throw error}
                error = await handleZakaz(queryLastED,items)
                if(error){throw error}
            }
            /*сворачиваем обороты для получения сальдо*/
            error = await foldingBalances(items,currancyArr)
            if(error){throw error}
        }
        /*обновляем данные для  позиций*/
        for (let itemFromDB of itemsFromBD){
            let data = itemFromDB.data.find(d=>((d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount)==virtualAccount)
            //console.log('data',data)
            if(data){
                let it = items.find(itt=>itt.item==((itemFromDB._id.toString)?itemFromDB._id.toString():itemFromDB._id))
                //console.log(it)
                if(it){
                    currancyArr.forEach(c=>{
                        if(!data[c]){
                            data[c]={}
                        }
                        data[c].debet=  it.data[c].debet
                        data[c].credit=  it.data[c].credit
                    })
                }
            }
        }
    }catch(err){
        console.log(err)
        return err
    }

}
async function handleMoneyOrder(typeData,query,items) {
    try{
        let docs= await MO.find(query).lean().exec()
        docs.forEach(mo=>{
            //console.log('mo',mo)
            let side;
            let[typeOfMoney,balanceSide]=mo.type.split('_');
            let reversBalanceSide=(balanceSide=='debet')?'credit':'debet';
            if(typeData=='Money'){
                let o= items.find(it=>it.moneyType==typeOfMoney);
                if(o){
                    if(balanceSide!='exchange'){
                        o.data[mo.currency][balanceSide]+=mo.sum;
                    }else{
                        o.data[mo.currencyDebet].debet+=mo.debet;
                        o.data[mo.currencyCredit].credit+=mo.credit;
                    }

                }
                /*if(balanceSide=='exchange' || mo.currency=='USD'){
                    console.log(mo)
                    console.log(o.data['USD'])

                }*/
                /*if(typeOfMoney=='Cash'){
                    console.log(o.data['UAH'])
                    if(balanceSide=='exchange'){
                        console.log(mo.credit)
                    }else{
                        console.log(mo.sum)
                    }


                }*/


            }else if(balanceSide!='exchange'){
                let contrAgentId=(mo.contrAgent.toString)?mo.contrAgent.toString():mo.contrAgent;
                let o= items.find(it=>it.item==contrAgentId);
                if(o){
                    o.data[mo.currency][reversBalanceSide]+=mo.sum;
                }
            }
        })
    }catch (err){return err}

}
async function handlePns(query,items) {
    try{
        /*приходные накладные*/
        let docs= await Pn.find(query).lean().exec()
        docs.forEach(doc=>{
            //console.log('pn',doc)
            let contrAgentId=(doc.contrAgent.toString)?doc.contrAgent.toString():doc.contrAgent;
            let o= items.find(it=>it.item==contrAgentId);
            if(o){
                o.data[doc.currency].credit+=doc.sum;
            }
        })
    }catch (err){return err}

}
async function handleRns(query,items) {
    try{
        query=JSON.parse(JSON.stringify(query))
        console.log('query',query)
        let typeOfContrAgent=query.typeOfContrAgent;
        delete query.typeOfContrAgent;
        /*расходные накладные*/
        let docs= await Rn.find(query).lean().exec()
        docs.forEach(doc=>{
            if(doc.typeOfZakaz){
                /*if(typeOfContrAgent=='Worker' && (doc.typeOfZakaz=='order'||doc.typeOfZakaz=='manufacture') && doc.worker){
                    let contrAgentId=(doc.worker.toString)?doc.worker.toString():doc.worker;
                    let o= items.find(it=>it.item==contrAgentId);
                    if(o){
                        o.data[doc.currency].credit+=doc.sumForWorker;
                    }
                }else if(typeOfContrAgent!='Worker'){
                    let contrAgentId=(doc.contrAgent.toString)?doc.contrAgent.toString():doc.contrAgent;
                    let o= items.find(it=>it.item==contrAgentId);
                    if(o){
                        if(doc.typeOfZakaz=='order'){
                            o.data[doc.currency].debet+=doc.sum;
                        }else if(doc.typeOfZakaz=='return'){
                            o.data[doc.currency].debet+=doc.sumUchet;
                        }
                    }
                }*/
                if(doc.typeOfZakaz=='order'){
                    let contrAgentId=(doc.contrAgent.toString)?doc.contrAgent.toString():doc.contrAgent;
                    let o= items.find(it=>it.item==contrAgentId);
                    if(o){
                        o.data[doc.currency].debet+=doc.sum;
                    }
                    if(doc.worker){
                        let contrAgentId=(doc.worker.toString)?doc.worker.toString():doc.worker;
                        let o= items.find(it=>it.item==contrAgentId);
                        if(o){
                            o.data[doc.currency].credit+=doc.sumForWorker;
                        }
                    }
                }else if(doc.typeOfZakaz=='return'){
                    let contrAgentId=(doc.contrAgent.toString)?doc.contrAgent.toString():doc.contrAgent;
                    let o= items.find(it=>it.item==contrAgentId);
                    if(o){
                        o.data[doc.currency].debet+=doc.sumUchet;
                    }
                }else if(doc.typeOfZakaz=='manufacture' && doc.worker){
                    let contrAgentId=(doc.worker.toString)?doc.worker.toString():doc.worker;
                    let o= items.find(it=>it.item==contrAgentId);
                    if(o){
                        o.data[doc.currency].credit+=doc.sumForWorker;
                    }
                }
            }
        })
    }catch (err){return err}
    
}
async function handleActs(query,items) {
    query=JSON.parse(JSON.stringify(query))
    //console.log('query',query)
    let typeOfContrAgent=query.typeOfContrAgent;
    delete query.typeOfContrAgent;
    if (typeOfContrAgent!='Worker'){return}
    try{
        /*акты выполненных работ*/
        let docs= await Act.find(query).lean().exec()
        //console.log(docs)
        docs.forEach(doc=>{
            if(doc.typeOfZakaz && doc.typeOfZakaz=='manufacture' && doc.works  && doc.works.length){
                doc.works.forEach(w=>{
                    if(w.salary){
                        let contrAgentId=(w.worker.toString)?w.worker.toString():w.worker;
                        let o= items.find(it=>it.item==contrAgentId);
                        if(o){
                            o.data[doc.currency].credit+=w.salary;
                        }
                    }

                })
            }
        })
    }catch (err){return err}

}
async function handleZakaz(query,items) {
    try{
        /*наряд заказ*/
        let docs= await Zakaz.find(query).lean().exec()
        docs.forEach(doc=>{
            let contrAgentId=(doc.contrAgent.toString)?doc.contrAgent.toString():doc.contrAgent;
            let o= items.find(it=>it.item==contrAgentId);
            if(o){

                if(doc.totalSum && typeof doc.totalSum=='object'){
                    for(let c in doc.totalSum){
                        o.data[c].debet+=doc.totalSum[c];
                    }
                }
                if(doc.totalSumWork && typeof doc.totalSumWork=='object'){
                    for(let c in doc.totalSumWork){
                        o.data[c].debet+=doc.totalSumWork[c];
                    }
                }
            }
        })
    }catch (err){return err}
}
function foldingBalances(items,currancyArr) {
    try{
        items.forEach(item=>{
            currancyArr.forEach(c=>{
                //console.log('item.data[c]',item.data[c])
                if(item.data[c].debet && item.data[c].credit){
                    item.data[c].debet -=item.data[c].credit
                    if(item.data[c].debet<0){
                        item.data[c].credit=-item.data[c].debet;
                        item.data[c].debet=0;
                    }else{
                        item.data[c].credit=0;
                    }

                }
                item.data[c].newCredit=item.data[c].credit;
                item.data[c].newDebet=item.data[c].debet;
                //console.log('item.data[c] 2',item.data[c])
            })
        })
    }catch (err){return err}

}




async function diff(req, res, next) {
    const currency = req.store.currency
    const currencyArr = req.store.currencyArr
    try {
        const sa = await SA.findOne({_id:req.params.id}).exec();
        try{
            let diff = calculateDiff(sa,currency,currencyArr)
            //let date = Date.now()
            sa.diff=diff;
            //sa.date=date;
            //let r = await sa.save()
            //console.log('save sa -',r)
            let r = await SA.update({_id:req.params.id},{$set:{diff:diff}})
            return res.json(diff)
        }catch(err){
            return next(err)
        }

    } catch (err) {
        //console.log(err)
        next(err)

    }
}

function calculateDiff(sa,currency,currencyArr) {
    //console.log('currencyArr',currencyArr)
    let diffCurrency={};
    for(let c of currencyArr){
        diffCurrency[c]={debet:0,credit:0,newDebet:0,newCredit:0}
    }
    let diff=sa.items.reduce((diffM,item)=>{
        /*console.log(diffM)
        console.log(item.data)*/
        for(let cur in item.data){
            diffM[cur].debet += item.data[cur].debet;
            diffM[cur].newDebet += item.data[cur].newDebet
            diffM[cur].credit += item.data[cur].credit
            diffM[cur].newCredit += item.data[cur].newCredit
        }
        return diffM
    },diffCurrency)
    for(let cur of currencyArr){
        //console.log('diff[cur]',diff[cur])
        handleDiff(diff[cur])
    }
    return diff;
}

function handleDiff(diff) {


    diff.debet= diff.newDebet-diff.debet
    diff.credit= diff.newCredit-diff.credit

    //console.log(diff)

    if(diff.debet<0){
        diff.credit=diff.credit-diff.debet
        diff.debet=0;
    }
    if(diff.credit<0){
        diff.debet=diff.debet-diff.credit
        diff.credit=0;
    }
    if(diff.debet>diff.credit){
        diff.debet= Math.round((diff.debet-diff.credit)*100)/100;
        diff.credit=0;
    }else if(diff.debet<diff.credit){
        diff.credit= Math.round((diff.credit-diff.debet)*100)/100;
        diff.debet=0;
    }
}

function handleEntries(virtualAccount,accountDebet,accountCredit,diffCurrency,sa) {
    //console.log(sa)
    for(let currency in diffCurrency){
        let diff = diffCurrency[currency];
        if(diff && diff.debet  && diff.debet!=0){
            let o ={}
            o[accountDebet]={}
            o[accountDebet][virtualAccount]={debet:{
                sum:diff.debet,
                currency:currency,
                ed:{
                    type:'asa'+sa.type,
                    _id:sa._id,
                    name:sa.name,
                    date:sa.date,
                    currency:currency,
                    comment:(sa.desc)?sa.desc:null
                }
            }}
            sa.entries.push(o)
            o ={}
            o[accountCredit]={}
            o[accountCredit][virtualAccount]={
                credit:{
                    sum:diff.debet,
                    currency:currency,
                    ed:{
                        type:'asa'+sa.type,
                        _id:sa._id,
                        name:sa.name,
                        date:sa.date,
                        currency:currency,
                        comment:(sa.desc)?sa.desc:null
                    }
                }
            }
            sa.entries.push(o)
        }else if(diff && diff.credit && diff.credit!=0){
            let o ={}
            o[accountCredit]={}
            o[accountCredit][virtualAccount]={debet:{
                sum:diff.credit,
                currency:currency,
                ed:{
                    type:'asa'+sa.type,
                    _id:sa._id,
                    name:sa.name,
                    date:sa.date,
                    currency:currency,
                    comment:(sa.desc)?sa.desc:null
                }
            }}
            sa.entries.push(o)
            o ={}
            o[accountDebet]={}
            o[accountDebet][virtualAccount]={
                credit:{
                    sum:diff.credit,
                    currency:currency,
                    ed:{
                        type:'asa'+sa.type,
                        _id:sa._id,
                        name:sa.name,
                        date:sa.date,
                        currency:currency,
                        comment:(sa.desc)?sa.desc:null
                    }
                }
            }
            sa.entries.push(o)
        }
    }

}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}










