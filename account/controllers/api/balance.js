'use strict';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var ObjectID = mongoose.Types.ObjectId;
var fs = require('fs');
var path = require('path');
var request=require('request');
var moment=require('moment');
var getUrl=require('../getUniqueUrl.js');

var Pn=mongoose.model('Pn');
var Rn=mongoose.model('Rn');
var Act=mongoose.model('Act');
var Mo=mongoose.model('MoneyOrder');
var SA=mongoose.model('StockAdjustment');
var Zakaz=mongoose.model('Zakaz');
var ASA=mongoose.model('AgentStockAdjustment');
const edModels =[Pn,SA,ASA,Mo,Rn,Act,Zakaz]
var ClosePeriod=mongoose.model('ClosePeriod');
var Account=mongoose.model('Account');
var VirtualAccount=mongoose.model('VirtualAccount');


var Supplier=mongoose.model('Supplier');
var Customer=mongoose.model('Customer');
var Worker=mongoose.model('Worker');
var Founder=mongoose.model('Founder');
var Contragent=mongoose.model('Contragent');
var Money=mongoose.model('Money');
var MO=mongoose.model('MoneyOrder');
var Material=mongoose.model('Material');

var Models ={
    Money:Money,
    Contragent:Contragent,
    Founder:Founder,
    Worker:Worker,
    Customer:Customer,
    Supplier:Supplier,
    Material:Material
}


exports.balance = async function(req, res, next) {
    let endDate = new Date(Number(req.params.date))
    let queryForCP = {store:req.store._id,actived:true,date:{$lte:endDate}}
    let virtualAccounts = await VirtualAccount.find({store:req.store._id,actived:true}).lean().exec()
    if(req.params.virtualAccount && req.params.virtualAccount!='allVirtualAccounts'){
        virtualAccounts=virtualAccounts.filter(va=>((va._id.toString)?va._id.toString():va._id)===req.params.virtualAccount)
    }
    try {
        let data = await getBalance(endDate,req.store._id,queryForCP,virtualAccounts,req.store.currencyArr)
        return res.json(data)
    }catch(err){
        next(err)

    }
}
exports.turnover = async function(req, res, next) {
    const dateStart = new Date(Number(req.params.dateStart))
    const dateEnd = new Date(Number(req.params.dateEnd))
    const type = req.params.type;
    const contrAgent = req.params.contrAgent;
    const virtualAccount = req.params.virtaulAccount;
    let currancyArr=req.store.currencyArr
    //console.log(dateStart,dateEnd,type,virtualAccount)
    try{
        const vas = await VirtualAccount.find({store:req.store._id,actived:true}).lean().exec()
        let asas=[]


        let query = {store:req.store._id};
        if(contrAgent!='forAllContrAgents'){
            query._id=contrAgent;
        }
        if(type=='Money'){
            delete query.actived
        }
        const itemsFromBD = await Models[type].find(query).lean().exec()
        let items  = await getStartBalancesForTurnover(req.store,virtualAccount,itemsFromBD,dateStart,type);

        query = {store:req.store._id,actived:true,date:{$lt:dateEnd,$gte:dateStart},virtualAccount:virtualAccount}
        items.forEach(item=>{
            item.dataS=JSON.parse(JSON.stringify(item.data))
            item.data=JSON.parse(JSON.stringify(item.dataO))
        })
        if(type!='Money'){
            query.typeOfContrAgent=type;
        }

        let error = await handleMoneyOrder(type,query,items,'oborot')
        if(error){throw error}
        /*приход и расход материалов*/
        if(type!='Money'){
            error = await  handlePns(query,items,'oborot')
            if(error){throw error}
            error = await handleRns(query,items,'oborot')
            if(error){throw error}
            if(type=='Worker'){
                error = await handleActs(query,items,'oborot')
                if(error){throw error}
                error = await handleRnsForWorker(query,items,'oborot')
                if(error){throw error}
            }
            error = await handleZakaz(query,items,'oborot')
            if(error){throw error}

        }
        items.forEach(item=>{
            //console.log(item)
            item.dataO=JSON.parse(JSON.stringify(item.data))
            foldingBalancesForItem(item,currancyArr)
        })
        //console.log(items)
        return res.json({items:items})
    }catch(err){return next(err)}
}
async function getStartBalancesForTurnover(store,virtualAccount,itemsFromBD,middleDate,typeData) {
    try{
        let error;
        let currancyArr=store.currencyArr
        /*находим предыдущую проведенную инвентаризацию по данному подразделению и счету ранее даты инвентаризации или текущей даты*/
        let saQuery={type:typeData,store:store._id,actived:true,date:{$lte:middleDate},virtualAccount:virtualAccount};
        let saPrevious = await ASA.findOne(saQuery).sort({date : -1}).lean().exec()
        /* запрос для выборки  - проведенные документы ранее даты инветаризации или ранее даты формирования остатков*/
        let query = {store:store._id,actived:true,date:{$lt:middleDate},virtualAccount:virtualAccount}
        /*если есть пердыдущая инвентаризация, документы позднее ее даты, если нет то с начала времен*/
        if(saPrevious){
            query.date.$gte=saPrevious.date;
        }
        if(typeData!='Money'){
            query.typeOfContrAgent=typeData;
        }
        /* массиа для расчетных данных*/
        let items =[];

        /*формируем список позиций по инвентаризируемому счету с остатками по предыдущей инвентаризации если она есть или нулевыми остатками*/
        itemsFromBD.forEach(function (item) {
            let itemId = (item._id.toString)?item._id.toString():item._id;
            let d = {};
            let dO = {};
            let dE = {};
            let eds={};

            currancyArr.forEach(c=>{
                d[c]={
                    debet:0,credit:0,
                }
                dO[c]={
                    debet:0,credit:0,
                }
                eds[c]={debet:[],credit:[]};
                dE[c]={
                    debet:0,credit:0,
                }
            })
            let o ={
                name:item.name,
                item:itemId,
                itemType:typeData,
                data:d,
                dataO:dO,
                dataE:dE,
                eds:eds,
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
        error = await handleMoneyOrder(typeData,query,items)
        if(error){throw error}
        /*приход и расход материалов*/
        if(typeData!='Money'){
            error = await  handlePns(query,items)
            if(error){throw error}
            error = await handleRns(query,items)
            if(error){throw error}
            if(typeData=='Worker'){
                error = await handleActs(query,items)
                if(error){throw error}
                error = await handleRnsForWorker(query,items)
                if(error){throw error}
            }

            error = await handleZakaz(query,items)
            if(error){throw error}

        }
        /*сворачиваем обороты для получения сальдо*/
        error = await foldingBalances(items,currancyArr)
        if(error){throw error}
        //console.log(items)
        return items;

    }catch(err){
        console.log(err)
        return err
    }

}
async function handleMoneyOrder(typeData,query,items,oborot) {
    //console.log(items)
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
                    let cc={};
                    if(balanceSide!='exchange'){
                        o.data[mo.currency][balanceSide]+=mo.sum;
                        if(!cc[mo.currency]){cc[mo.currency]={debet:0,credit:0};}
                        cc[mo.currency][balanceSide]+=mo.sum;
                    }else{
                        o.data[mo.currencyDebet].debet+=mo.debet;
                        o.data[mo.currencyCredit].credit+=mo.credit;
                        if(!cc[mo.currencyDebet]){cc[mo.currencyDebet]={debet:0,credit:0};}
                        if(!cc[mo.currencyCredit]){cc[mo.currencyCredit]={debet:0,credit:0};}
                        cc[mo.currencyDebet].debet+=mo.debet;
                        cc[mo.currencyCredit].credit+=mo.credit;
                    }
                    if(oborot){
                        for(let c in cc){
                            let sref = 'frame.MoneyOrder'+capitalizeFirstLetter(typeOfMoney)+capitalizeFirstLetter(balanceSide)+'.item';
                            let ed = {
                                type:mo.type,
                                sref:sref,
                                _id:mo._id,
                                name:mo.name,
                                date:mo.date,
                                currency:c
                            }
                            if(cc[c]){
                                if(cc[c].debet){
                                    ed.sum=cc[c].debet;
                                    o.eds[c].debet.push(ed)
                                }
                                if(cc[c].credit){
                                    ed.sum=cc[c].credit;
                                    o.eds[c].credit.push(ed)
                                }

                            }
                        }
                    }
                }

            }else if(balanceSide!='exchange'){
                let contrAgentId=(mo.contrAgent.toString)?mo.contrAgent.toString():mo.contrAgent;
                let o= items.find(it=>it.item==contrAgentId);
                if(o){
                    o.data[mo.currency][reversBalanceSide]+=mo.sum;
                    if(oborot){
                        let sref = 'frame.MoneyOrder'+capitalizeFirstLetter(typeOfMoney)+capitalizeFirstLetter(balanceSide)+'.item';
                        let ed = {
                            type:mo.type,
                            sref:sref,
                            _id:mo._id,
                            name:mo.name,
                            date:mo.date,
                            sum:mo.sum,
                            currency:mo.currency
                        }
                        o.eds[mo.currency][reversBalanceSide].push(ed)
                    }
                }

            }
        })
    }catch (err){return err}

}
async function handlePns(query,items,oborot) {
    try{
        /*приходные накладные*/
        let docs= await Pn.find(query).lean().exec()
        docs.forEach(doc=>{
            //console.log('pn',doc)
            let contrAgentId=(doc.contrAgent.toString)?doc.contrAgent.toString():doc.contrAgent;
            let o= items.find(it=>it.item==contrAgentId);
            if(o){

                o.data[doc.currency].credit+=doc.sum;

                if(oborot){
                    let ed = {
                        type:'pn',
                        sref:'frame.pns.pn',
                        _id:doc._id,
                        name:doc.name,
                        date:doc.date,
                        currency:doc.currency,
                        sum:doc.sum
                    }
                    o.eds[doc.currency].credit.push(ed)
                }
            }

        })
    }catch (err){return err}

}
async function handleRns(query,items,oborot) {
    try{
        let q = JSON.parse(JSON.stringify(query))

        q.typeOfZakaz={$in:['order','return']}
       // console.log('handleRns',oborot,q)
        /*расходные накладные*/
        let docs= await Rn.find(q).lean().exec()
        docs.forEach(doc=>{
            //console.log('rn',doc)
            let contrAgentId=(doc.contrAgent.toString)?doc.contrAgent.toString():doc.contrAgent;
            let o = items.find(it=>it.item==contrAgentId);
            if(o){
                let sum = (doc.typeOfZakaz=='order')?doc.sum:doc.sumUchet;
                o.data[doc.currency].debet+=sum;
                if(oborot){
                    let ed = {
                        type:'rn',
                        sref:'frame.Rns.item',
                        _id:doc._id,
                        name:doc.name,
                        date:doc.date,
                        currency:doc.currency,
                        sum:sum
                    }
                    o.eds[doc.currency].debet.push(ed)
                }
            }
        })
    }catch (err){return err}

}
async function handleRnsForWorker(query,items,oborot) {
    try{
        let q = JSON.parse(JSON.stringify(query))
        q.typeOfZakaz={$in:['order','manufacture']}
        delete q.typeOfContrAgent;
        //console.log('handleRnsForWorker',oborot,q)
        /*расходные накладные*/
        let docs= await Rn.find(q).lean().exec()
        docs.forEach(doc=>{
            //console.log('rn wor worker',doc)
            let contrAgentId=(doc.worker.toString)?doc.worker.toString():doc.worker;
            let o = items.find(it=>it.item==contrAgentId);
            if(o){
                let sum =(doc.sumForWorker)?doc.sumForWorker:0;
                if(sum){
                    o.data[doc.currency].credit+=sum;
                    if(oborot){
                        let ed = {
                            type:'rn',
                            sref:'frame.Rn.item',
                            _id:doc._id,
                            name:doc.name,
                            date:doc.date,
                            currency:doc.currency,
                            sum:sum
                        }
                        o.eds[doc.currency].credit.push(ed)
                    }
                }

            }
        })
    }catch (err){return err}

}
async function handleActs(query,items,oborot) {
    try{
        /*акты выполненных работ*/
        let qT = JSON.parse(JSON.stringify(query));
        delete qT.typeOfContrAgent;
        let docs= await Act.find(qT).lean().exec()
         docs.forEach(doc=>{
             if(doc.works && doc.works.length){
                 doc.works.forEach(w=>{
                     let contrAgentId=(w.worker.toString)?w.worker.toString():w.worker;
                     let o = items.find(it=>it.item==contrAgentId);
                     if(o){
                         o.data[doc.currency].credit+=w.salary;
                         if(oborot){
                             let ed = {
                                 type:'act',
                                 sref:'frame.Act.item',
                                 _id:doc._id,
                                 name:doc.name,
                                 date:doc.date,
                                 currency:doc.currency,
                                 sum:w.salary
                             }
                             o.eds[doc.currency].credit.push(ed)
                         }
                     }
                 })
             }
         })


    }catch (err){return err}
}
async function handleZakaz(query,items,oborot) {
    try{
        /*наряд-заказы*/
         let docs= await Zakaz.find(query).lean().exec()
         docs.forEach(doc=>{
             let contrAgentId=(doc.contrAgent.toString)?doc.contrAgent.toString():doc.contrAgent;
             let o = items.find(it=>it.item==contrAgentId);
             if(o){
                 let cc={};
                 if(doc.totalSum && typeof doc.totalSum=='object'){
                     for(let c in doc.totalSum){
                         o.data[c].debet+=doc.totalSum[c];
                         if(!cc[c]){cc[c]={debet:0,credit:0};}
                         cc[c].debet+=doc.totalSum[c];
                     }

                 }
                 if(doc.totalSumWork && typeof doc.totalSumWork=='object'){
                     for(let c in doc.totalSumWork){
                         o.data[c].debet+=doc.totalSumWork[c];
                         if(!cc[c]){cc[c]={debet:0,credit:0};}
                         cc[c].debet+=doc.totalSumWork[c];
                     }

                 }
                 if(oborot){
                     for(let c in cc){
                         let ed = {
                             type:'zakaz',
                             sref:'frame.ZakazManufacture.item',
                             _id:doc._id,
                             name:doc.name,
                             date:doc.date,
                             currency:c
                         }
                         if(cc[c]){
                             if(cc[c].debet){
                                 ed.sum=cc[c].debet;
                                 o.eds[c].debet.push(ed)
                             }
                             if(cc[c].credit){
                                 ed.sum=cc[c].credit;
                                 o.eds[c].credit.push(ed)
                             }

                         }
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
            })
        })
    }catch (err){return err}

}
function foldingBalancesForItem(item,currancyArr) {
    try{
        currancyArr.forEach(c=>{
            item.dataE[c].debet=item.dataS[c].debet+item.dataO[c].debet;
            item.dataE[c].credit=item.dataS[c].credit+item.dataO[c].credit;
            if(item.dataE[c].debet && item.dataE[c].credit){
                item.dataE[c].debet -=item.dataE[c].credit
                if(item.dataE[c].debet<0){
                    item.dataE[c].credit=-item.dataE[c].debet;
                    item.dataE[c].debet=0;
                }else{
                    item.dataE[c].credit=0;
                }
            }
        })
    }catch (err){return err}

}






exports.closePeriod =async function(req, res, next) {
    let endDate = new Date(Number(req.params.date))
    //console.log(endDate.toString())
    /*находим ближайший закрытый период и выбираем документы между датой закрытия периода и текущей установленной датой*/
    let queryForCP = {store:req.store._id,actived:true,date:{$lte:endDate}}
    let virtualAccounts = await VirtualAccount.find({store:req.store._id,actived:true}).lean().exec()
    const virtualAccount = req.params.virtualAccount;
    if(req.params.virtualAccount && req.params.virtualAccount!='allVirtualAccounts'){
        virtualAccounts=virtualAccounts.filter(va=>((va._id.toString)?va._id.toString():va._id)===req.params.virtualAccount)
    }

    let index=1;

    try {
        let {accounts,itogo} = await getBalance(endDate,req.store._id,queryForCP,virtualAccounts,req.store.currencyArr)

        //console.log(accounts)

        let closePeriod = {
            store:req.store._id,
            name:'Закрытие периода '+moment(endDate).format('DD-MM-YY'),
            index:index,
            debet: itogo.e.d,
            credit:itogo.e.c,
            date:endDate,
            actived:true,
            virtualAccount:virtualAccount,
        };




        closePeriod.data=accounts.map(a=>{
            //console.log(a.name,a.e)
            let o={};
            o.account=a._id;
            o.debet=a.e.d;
            o.credit=a.e.c;
            o.currencyArr=a.currencyArr;
            /*o.va = a.va.map(va=>{
                let o ={}
                o._id=va._id;
                o.debet=va.e.d;
                o.credit=va.e.c;
                return o;
            })*/
            return o;

        })
        let query = {store:req.store._id,actived:true,date:endDate,virtualAccount:virtualAccount}
        let resultDelete = await ClosePeriod.findOne(query).remove().exec()
        /*console.log(resultDelete);
        console.log(closePeriod);*/


        let CPNew = new ClosePeriod(closePeriod)
        closePeriod.url = 'closePeriod'+closePeriod._id;
        let r = await CPNew.save()
        //console.log(r)
        res.json({})

    }catch(err){
        next(err)
    }
}

async function getBalance(endDate,store,queryForCP,virtualAccounts,currencyArr) {
    let self ={}
    self.accounts = await Account.find({root:null}).lean().exec();
    self.itogo={s:{d:{},c:{}},o:{d:{},c:{}},e:{d:{},c:{}}};
    currencyArr.forEach(c=>{
        self.itogo.s.d[c]=0;
        self.itogo.s.c[c]=0;
        self.itogo.o.d[c]=0;
        self.itogo.o.c[c]=0;
        self.itogo.e.d[c]=0;
        self.itogo.e.c[c]=0;
    })
    for(let a of self.accounts) {
        if(a._id.toString){
            a._id=a._id.toString()
        }
        a.s={d:{},c:{}}
        a.o={d:{},c:{}}
        a.e={d:{},c:{}}
        currencyArr.forEach(c=>{
            a.s.d[c]=0
            a.s.c[c]=0
            a.o.d[c]=0
            a.o.c[c]=0
            a.e.d[c]=0
            a.e.c[c]=0
        })
        a.va=virtualAccounts.map(a=>JSON.parse(JSON.stringify(a)));
        for(let va of a.va){
            queryForCP.virtualAccount=va._id;
            let CP = await ClosePeriod.findOne(queryForCP).sort({date: -1}).lean().exec()
            let startDate=(CP)?CP.date:null;
            let query = {date:{$lte:endDate},store:store,actived:true,virtualAccount:va._id}
            if(startDate){query.date.$gte=startDate}
            let data={}
            for (const edModel of edModels) {
                let eds= await edModel.find(query).lean().exec()
                eds.forEach(n=>{
                    if(n.entries && n.entries.length){
                        n.entries.forEach(e=>{
                            for(let account in e){
                                if(!data[account]){data[account]={}}
                                for(let virtualAccount in e[account]){
                                    if(!data[account][virtualAccount]){data[account][virtualAccount]={}}
                                    if(e[account][virtualAccount].debet){
                                        if(!data[account][virtualAccount].debet){data[account][virtualAccount].debet=[]}
                                        //console.log(e[account][virtualAccount].debet)
                                        data[account][virtualAccount].debet.push(e[account][virtualAccount].debet)
                                    }
                                    if(e[account][virtualAccount].credit){
                                        if(!data[account][virtualAccount].credit){data[account][virtualAccount].credit=[]}
                                        data[account][virtualAccount].credit.push(e[account][virtualAccount].credit)
                                    }
                                }
                            }
                        })
                    }
                })
            }

            /***************************************************************************/
            /***************************************************************************/
            /***************************************************************************/
            let closePeriodVAData=null;
            //console.log(CP.data)
            if(CP){
                closePeriodVAData=CP.data.find(aData=>((aData.account.toString)?aData.account.toString():aData.account)===a._id)
            }
            //console.log(closePeriodVAData)
            va.s={d:{},c:{}}
            va.o={d:{},c:{}}
            va.e={d:{},c:{}}
            currencyArr.forEach(c=>{
                va.s.d[c]=0
                va.s.c[c]=0
                va.o.d[c]={s:0,data:[]}
                va.o.c[c]={s:0,data:[]}
                va.e.d[c]=0
                va.e.c[c]=0
            })
            if(closePeriodVAData){
                va.s.d=closePeriodVAData.debet;
                va.s.c=closePeriodVAData.credit;
            }
            /*заполняем начальные остатки в счете остатками из подразделения если было закрытие периода*/
            currencyArr.forEach(c=>{
                a.s.d[c]+=va.s.d[c]
                a.s.c[c]+=va.s.c[c]
            })

            if(data[a._id] && data[a._id][va._id] && data[a._id][va._id].debet){
                data[a._id][va._id].debet.forEach(function (d) {
                    let c = d.currency
                    if(!c){
                        c=d.ed.currency;
                    }
                    if(typeof va.o.d[c]=='undefined'){
                        console.log('c',c)
                        console.log(c=='UAH')
                        console.log("typeof va.o.d[c]=='undefined'",d)
                    }

                    va.o.d[c].s+=Math.round(d.sum*100)/100
                    va.o.d[c].data.push(d);
                })
            }

            if(data[a._id] && data[a._id][va._id] && data[a._id][va._id].credit){
                data[a._id][va._id].credit.forEach(function (d) {
                    let c = d.currency
                    if(!c){
                        c=d.ed.currency;
                    }
                    va.o.c[c].s+=Math.round(d.sum*100)/100
                    va.o.c[c].data.push(d);
                })
            }

            currencyArr.forEach(c=>{
                va.o.d[c].s=Math.round(va.o.d[c].s*100)/100
                va.o.c[c].s=Math.round(va.o.c[c].s*100)/100
                a.o.d[c]+=va.o.d[c].s
                a.o.c[c]+=va.o.c[c].s
                let deb = va.s.d[c]+va.o.d[c].s
                let cre = va.s.c[c]+va.o.c[c].s
                var delta = Math.round((deb-cre)*100)/100;
                if(delta>0){
                    va.e.d[c]=delta
                }else if(delta<0){
                    va.e.c[c]=Math.abs(delta)
                }

                if(va.s.d[c] || va.s.c[c] || va.o.d[c].s || va.o.c[c].s || va.e.d[c] || va.e.d[c]){
                    if(!va.currencyArr){
                        va.currencyArr=[]
                    }
                    va.currencyArr.push(c)
                }
            })
        }

        currencyArr.forEach(c=>{

            /*заполняем начальные остатки в итого остатками из счета если было закрытие периода*/
            self.itogo.s.d[c]+=a.s.d[c]
            self.itogo.s.c[c]+=a.s.c[c]

            let deb = a.s.d[c]+a.o.d[c]
            let cre = a.s.c[c]+a.o.c[c]
            let delta = Math.round((deb-cre)*100)/100;
            if(delta>0){
                a.e.d[c]=delta
            }else if(delta<0){
                a.e.c[c]=Math.abs(delta)
            }
            self.itogo.o.d[c]+=a.o.d[c]
            self.itogo.o.c[c]+=a.o.c[c]
            self.itogo.e.d[c]+=a.e.d[c]
            self.itogo.e.c[c]+=a.e.c[c]
            if(a.s.d[c] || a.s.c[c] || a.o.d[c] || a.o.c[c] || a.e.d[c] || a.e.d[c]){
                if(!a.currencyArr){
                    a.currencyArr=[]
                }
                a.currencyArr.push(c)
            }

        })

    }
    currencyArr.forEach(c=>{
        self.itogo.o.d[c]=Math.round(self.itogo.o.d[c]*100)/100
        self.itogo.o.c[c]=Math.round(self.itogo.o.c[c]*100)/100
        self.itogo.e.d[c]=Math.round(self.itogo.e.d[c]*100)/100
        self.itogo.e.c[c]=Math.round(self.itogo.e.c[c]*100)/100
    })

    return {accounts:self.accounts,itogo:self.itogo}
}

async function getTurnOverForItem(dateStart,dateEnd,type,itemOfModel,vas,asas,queryStore,currencyArr) {
    let a={
        name:itemOfModel.name
    }
    a.s={}
    a.o={}
    a.e={}
    currencyArr.forEach(c=>{
        a.s[c]={d:0,c:0}
        a.o[c]={d:0,c:0}
        a.e[c]={d:0,c:0}
    })
    a.vas=vas.map(a=>{return {name:a.name,_id:a._id}});
    for(let va of a.vas){
        let query={store:queryStore.store}
        query.date={"$lt":dateStart}
        let asa = asas.find(d=>((d.virtualAccount.toString)?d.virtualAccount.toString():d.virtualAccount)==((va._id.toString)?va._id.toString():va._id))
        /* если есть инвентаризация по данному подразделению то достаем документы только от даты инветнаризации и по дату начала оборотки, что бы вычислить остаток */
        if(asa){
            query.date.$gt=new Date(asa.date)
        }
        /*для денег*/
        let debetType=itemOfModel.type+'_debet'
        let creditType=itemOfModel.type+'_credit'
        query.$or=[{type:debetType},{type:creditType}]
        let mos = await Mo.find(query).lean().exec()

        /*формируем остаток на начало*/
        va.s={}
        currencyArr.forEach(c=>{
            va.s[c]={d:0,c:0}
        })
        console.log(asa.items)
        /*формируем оборот*/
        query.date.$gt=new Date(dateStart)
        query.date.$lt=new Date(dateEnd)
        mos = await Mo.find(query).lean().exec()
        //console.log(mos);
        va.o={}
        va.e={}
        currencyArr.forEach(c=>{
            va.o[c]={d:{s:0,data:null},c:{s:0,data:null}}
            va.e[c]={d:0,c:0}
        })
        mos.forEach(mo=>{
            let side;
            if(mo.type==debetType){side='d'}else if(mo.type==creditType){side='c'}
            va.o[mo.currency][side].s+=mo.sum;
            if(!va.o[mo.currency][side].data){
                va.o[mo.currency][side].data=[]
            }
            let[typeOfMoney,balanceSide]=mo.type.split('_')
            let sref='frame.MoneyOrder'+typeOfMoney+balanceSide.charAt(0).toUpperCase() + balanceSide.substr(1)+'.item'
            let o = {
                ed:{
                    type:mo.type,
                    sref:sref,
                    name:mo.name,
                    currency:mo.currency,
                    sum:mo.sum,
                    _id:mo._id,
                    date:mo.date
                },
                type:mo.type,
                sref:sref,
                name:mo.name,
                currency:mo.currency,
                sum:mo.sum,
                _id:mo._id,
                date:mo.date
            }
            va.o[mo.currency][side].data.push(o)
        })
    }
    return a;

}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}







