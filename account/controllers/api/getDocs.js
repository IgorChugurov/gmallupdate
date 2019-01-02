'use strict';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var ObjectID = mongoose.Types.ObjectId;
var fs = require('fs');
var path = require('path');
var request=require('request');
var Pn=mongoose.model('Pn');
var MoneyOrder = mongoose.model('MoneyOrder')
var Rn=mongoose.model('Rn')
var Rn=mongoose.model('Rn')
var Act=mongoose.model('Act')
var Zakaz=mongoose.model('Zakaz')

var SampleEntries=mongoose.model('SampleEntries');
var Supplier=mongoose.model('Supplier');
var Customer=mongoose.model('Customer');
var Worker=mongoose.model('Worker');
var Founder=mongoose.model('Founder');
var Contragent=mongoose.model('Contragent');
var Money=mongoose.model('Money');
var Material=mongoose.model('Material');
var Account=mongoose.model('Account');
var StockAdjustment=mongoose.model('StockAdjustment')
var AgentStockAdjustment=mongoose.model('AgentStockAdjustment')
var Models ={
    Money:Money,
    Contragent:Contragent,
    Founder:Founder,
    Worker:Worker,
    Customer:Customer,
    Supplier:Supplier,
    Material:Material
}




exports.getDocs = async function(req, res, next){
    //console.log('req.params.type',req.params.type)
    try{
        let data =[];
        let virtualAccount=req.query.virtualAccount;

        if(req.params.type=='Material'){
            let item = req.params.id;
            let query={store:req.store._id,'materials.item':req.params.id,actived:true,virtualAccount:virtualAccount};
            let sa = await StockAdjustment.find({store:req.store._id,actived:true,virtualAccount:virtualAccount}).sort({"date": -1}).limit(1).exec();
            if(sa.length){
                query.date= {$gt: sa[0].date}
            }
            //console.log('query',query)
            let pns = await Pn.find(query).sort({"date": -1}).lean().exec()
            //console.log(pns)
            if(pns.length){
                pns.forEach(p=>{
                    let qty = p.materials.reduce((q,m)=>{
                        if(((m.item.toString)?m.item.toString():m.item)===item){
                            q+=m.qty
                        }
                        return q;
                    },0)
                    let o = {
                        ed:'pn',
                        sref:'frame.pns.pn',
                        name:p.name,
                        sum:qty,
                        _id:p._id,
                        date:p.date
                    }
                    data.push(o)
                })
            }
            let rns = await Rn.find(query).sort({"date": -1}).lean().exec()
            //console.log('rns',rns)
            if(rns.length){
                rns.forEach(p=>{
                    let qty = p.materials.reduce((q,m)=>{
                        if(((m.item.toString)?m.item.toString():m.item)===item){
                            q+=m.qty
                        }
                        return q;
                    },0)
                    let o = {
                        ed:'rn',
                        sref:'frame.Rn.item',
                        name:p.name,
                        sum:qty,
                        _id:p._id,
                        date:p.date
                    }
                    data.push(o)
                })
            }
            data.sort((a,b)=>b.date-a.date);
        }else if(req.params.type=='Money'){
            let query={store:req.store._id,$or:[{type:req.params.id+'_credit'},{type:req.params.id+'_debet'},{type:req.params.id+'_exchange'}],actived:true,virtualAccount:virtualAccount};
            let asa = await AgentStockAdjustment.find({store:req.store._id,actived:true,type:req.params.type,virtualAccount:virtualAccount}).sort({"date": -1}).limit(1).exec();
            //console.log(asa)
            if(asa.length){
                query.date= {$gt: asa[0].date}
            }

            let mos = await MoneyOrder.find(query).sort({"date": -1}).lean().exec()
            if(mos.length){
                mos.forEach(mo=>{
                    let[typeOfMoney,balanceSide]=mo.type.split('_')
                    let sref='frame.MoneyOrder'+typeOfMoney+balanceSide.charAt(0).toUpperCase() + balanceSide.substr(1)+'.item'
                    try{
                        if(balanceSide=='exchange'){

                            let o = {
                                ed:'mo',
                                type:mo.type,
                                sref:sref,
                                name:mo.name+' приход',
                                currency:mo.currencyDebet,
                                sum:mo.debet,
                                _id:mo._id,
                                date:mo.date
                            }
                            //console.log(o)
                            data.push(o)
                            let oo = {
                                ed:'mo',
                                type:mo.type,
                                sref:sref,
                                name:mo.name+' расход',
                                currency:mo.currencyCredit,
                                sum:mo.credit,
                                _id:mo._id,
                                date:mo.date
                            }
                            //console.log(oo)
                            data.push(oo)
                        }else{
                            let o = {
                                ed:'mo',
                                type:mo.type,
                                sref:sref,
                                name:mo.name,
                                currency:mo.currency,
                                sum:mo.sum,
                                _id:mo._id,
                                date:mo.date
                            }
                            data.push(o)
                        }
                    }catch(err){
                        console.log(err)
                    }


                })
            }

        }else{
            let query={store:req.store._id,'contrAgent':req.params.id,actived:true,virtualAccount:virtualAccount};
            let asa = await AgentStockAdjustment.find({store:req.store._id,actived:true,type:req.params.type,virtualAccount:virtualAccount}).sort({"date": -1}).limit(1).exec();
            //console.log(asa)
            if(asa.length){
                query.date= {$gt: asa[0].date}
            }
            //console.log(query)
            let pns = await Pn.find(query).sort({"date": -1}).lean().exec()
            //console.log(pns)
            if(pns.length){
                pns.forEach(p=>{
                    let o = {
                        ed:'pn',
                        sref:'frame.pns.pn',
                        name:p.name,
                        currency:p.currency,
                        sum:p.sum,
                        _id:p._id,
                        date:p.date
                    }
                    data.push(o)
                })
            }
            let zakaz = await Zakaz.find(query).sort({"date": -1}).lean().exec()
            //console.log(pns)
            if(zakaz.length){
                zakaz.forEach(p=>{
                    p.sumCurrency={};
                    if(p.totalSum && typeof p.totalSum=='object'){
                        for(let c in p.totalSum){
                            if(!p.sumCurrency[c]){
                                p.sumCurrency[c]=0;
                            }
                            p.sumCurrency[c]+=p.totalSum[c]
                        }
                    }
                    if(p.totalSumWork && typeof p.totalSumWork=='object'){
                        for(let c in p.totalSumWork){
                            if(!p.sumCurrency[c]){
                                p.sumCurrency[c]=0;
                            }
                            p.sumCurrency[c]+=p.totalSumWork[c]
                        }
                    }
                    let o = {
                        ed:'zakaz',
                        sref:'frame.ZakazManufacture.item',
                        name:p.name,
                        currency:p.currency,
                        sum:p.sum,
                        sumCurrency:p.sumCurrency,
                        _id:p._id,
                        date:p.date
                    }
                    data.push(o)
                })
            }


            let rns = await Rn.find(query).sort({"date": -1}).lean().exec()
            //console.log(pns)
            if(rns.length){
                rns.forEach(p=>{
                    let o = {
                        ed:'rn',
                        sref:'frame.Rn.item',
                        name:p.name,
                        currency:p.currency,
                        _id:p._id,
                        date:p.date
                    }
                    if(p.typeOfZakaz=='return'){
                        o.sum=p.sumUchet;
                    }else if(p.typeOfZakaz=='order'){
                        o.sum=p.sum;
                    }
                    data.push(o)
                    /*if(req.params.type=='Worker' && p.worker && p.sumForWorker){
                     o.sum=p.sumForWorker;

                     }else{

                     }*/
                })
            }
            if(req.params.type=='Worker'){
                let queryN = JSON.parse(JSON.stringify(query))
                queryN.worker =  queryN.contrAgent
                delete queryN.contrAgent;
                let rns = await Rn.find(queryN).sort({"date": -1}).lean().exec()
                //console.log(queryN,'rns',rns)
                if(rns.length){
                    rns.forEach(p=>{
                        let o = {
                            ed:'rn',
                            sref:'frame.Rn.item',
                            name:p.name,
                            currency:p.currency,
                            sum:p.sumForWorker,
                            _id:p._id,
                            date:p.date
                        }
                        data.push(o)
                    })
                }
            }
            let mos = await MoneyOrder.find(query).lean().exec()
            //console.log(mos)
            if(mos.length){
                mos.forEach(mo=>{
                    let[typeOfMoney,balanceSide]=mo.type.split('_')
                    if(balanceSide=='exchange'){return}
                    let sref='frame.MoneyOrder'+typeOfMoney+balanceSide.charAt(0).toUpperCase() + balanceSide.substr(1)+'.item'
                    let o = {
                        ed:'mo',
                        type:mo.type,
                        sref:sref,
                        name:mo.name,
                        currency:mo.currency,
                        sum:mo.sum,
                        _id:mo._id,
                        date:mo.date
                    }
                    data.push(o)
                })
            }
            /*акты выполненных работ*/
            if(req.params.type=='Worker'){
                let queryN = JSON.parse(JSON.stringify(query))
                delete queryN.contrAgent;
                let acts = await Act.find(queryN).lean().exec()
                let worker =req.params.id;
                //console.log(mos)
                if(acts.length){
                    acts.forEach(act=>{
                        let sum = act.works.reduce((s,w)=>{
                            if(((w.worker.toString)?w.worker.toString():w.worker)==worker){
                                s+=w.salary
                            }
                            return s;
                        },0)
                        if(sum){
                            let o = {
                                ed:'act',
                                sref:'frame.Act.item',
                                name:act.name,
                                currency:act.currency,
                                sum:sum,
                                _id:act._id,
                                date:act.date
                            }
                            data.push(o)
                        }

                    })
                }
            }




        }
        res.json(data)
    }catch(err){next(err)}

}


exports.hold = async function(req, res, next) {
    const currency = req.store.currency
    try {
        const sa = await SA.findOne({_id:req.params.id}).exec();
        try{
            let diff = calculateDiff(sa,currency)
            let date = Date.now()
            //console.log('diff',diff)
            sa.diff=diff;
            sa.date=date;
            const accounts = await Account.find({store:req.store._id}).lean().exec();
            /* проводки*/
            let accountProfit = accounts.find(a=>a.type=='Profit')._id.toString()
            //console.log(seSA)
            //return next('error')
            let virtualAccount=(sa.virtualAccount && sa.virtualAccount.toString)?sa.virtualAccount.toString():sa.virtualAccount;
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


            //let r = await SA.update({_id:req.params.id},{$set:{diff:diff,date:date,entries:sa.entries}})
            let r = await sa.save()

            /* изменениние данных для контрагентов*/
            for(let saItem of sa.items){
                let item = await Models[sa.type].findOne({_id:saItem.item}).exec()
                let data = item.data.find(d=>d.virtualAccount==virtualAccount)
                if(!data){
                    data={
                        virtualAccount:virtualAccount
                    }
                    item.data.push(data)
                }
                for(let cur in saItem.data){
                    if(!data[cur]){
                        data[cur]={}
                    }
                    data[cur].debet = saItem.data[cur].newDebet
                    data[cur].credit = saItem.data[cur].newCredit
                }
                /*console.log(saItem.data)
                console.log(item.data)*/
                /*let r = await item.save();
                console.log(1,r._id,r.type,r.data)
                console.log(2,item.data)*/
               /* item.data=item.data.fiter((data)=>{

                })*/
                await Models[sa.type].update({_id:saItem.item},{$set:{data:item.data}})
            }



            return res.json({diff:diff})
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
        sa.entries=[];
        let r = await SA.update({_id:req.params.id},{$set:{entries:sa.entries}})
        let virtualAccount=(sa.virtualAccount && sa.virtualAccount.toString)?sa.virtualAccount.toString():sa.virtualAccount;
        /* изменениние данных для контрагентов*/
        for(let saItem of sa.items){
            let item = await Models[sa.type].findOne({_id:saItem.item}).exec()
            let data = item.data.find(d=>d.virtualAccount==virtualAccount)
            if(!data){
                data={
                    virtualAccount:virtualAccount
                }
                item.data.push(data)
            }

            for(let cur in saItem.data){
                if(!data[cur]){
                    data[cur]={}
                }
                data[cur].debet = saItem.data[cur].debet
                data[cur].credit = saItem.data[cur].credit
            }
            delete data.debet
            delete data.credit
            /*let r = await item.save();
            console.log(1,r._id,r.type,r.data)
            console.log(2,item.data)*/
            await Models[sa.type].update({_id:saItem.item},{$set:{data:item.data}})
        }
        return res.json({})
    } catch (err) {
        //console.log(err)
        next(err)

    }
}
exports.diff = diff;



async function diff(req, res, next) {
    const currency = req.store.currency
    try {
        const sa = await SA.findOne({_id:req.params.id}).exec();
        try{
            let diff = calculateDiff(sa,currency)
            let date = Date.now()
            sa.diff=diff;
            sa.date=date;
            let r = await sa.save()
            //console.log('save sa -',r)
            //let r = await SA.update({_id:req.params.id},{$set:{diff:diff,date:date}})
            return res.json(diff)
        }catch(err){
            return next(err)
        }

    } catch (err) {
        //console.log(err)
        next(err)

    }
}

function calculateDiff(sa,currency) {
    let diff=sa.items.reduce((diffM,item)=>{
        item.diff.debet =0;
        item.diff.credit =0;
        item.diff.newDebet =0;
        item.diff.newCredit =0;
        for(let cur in item.data){
            //console.log(item.data[cur])
            const currencyRate=(currency[cur]&& currency[cur][0])?currency[cur][0]:1;
            let debet = Math.round(((item.data[cur].debet)/currencyRate)*100)/100;
            let newDebet =Math.round(((item.data[cur].newDebet)/currencyRate)*100)/100;
            let credit = Math.round(((item.data[cur].credit)/currencyRate)*100)/100;
            let newCredit=Math.round(((item.data[cur].newCredit)/currencyRate)*100)/100
            diffM.debet += debet;
            diffM.newDebet += newDebet
            diffM.credit += credit
            diffM.newCredit += newCredit;

            item.diff.debet += debet;
            item.diff.credit += credit;
            item.diff.newDebet += newDebet;
            item.diff.newCredit += newCredit;
        }


        handleDiff(item.diff)
        //console.log(item.diff)
        return diffM
    },{debet:0,credit:0,newDebet:0,newCredit:0})

    //console.log(diff)

    handleDiff(diff)
    //console.log(diff)
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

function handleEntries(virtualAccount,accountDebet,accountCredit,diff,sa) {
    //console.log(sa)

    if(diff && diff.debet  && diff.debet!=0){
        let o ={}
        o[accountDebet]={}
        o[accountDebet][virtualAccount]={debet:{
            sum:diff.debet,
            ed:{
                type:'asa'+sa.type,
                _id:sa._id,
                name:sa.name,
                date:sa.date
            }
        }}
        sa.entries.push(o)
        o ={}
        o[accountCredit]={}
        o[accountCredit][virtualAccount]={
            credit:{
                sum:diff.debet,
                ed:{
                    type:'asa'+sa.type,
                    _id:sa._id,
                    name:sa.name,
                    date:sa.date
                }
            }
        }
        sa.entries.push(o)
    }else if(diff && diff.credit && diff.credit!=0){
        let o ={}
        o[accountCredit]={}
        o[accountCredit][virtualAccount]={debet:{
            sum:diff.credit,
            ed:{
                type:'asa'+sa.type,
                _id:sa._id,
                name:sa.name,
                date:sa.date
            }
        }}
        sa.entries.push(o)
        o ={}
        o[accountDebet]={}
        o[accountDebet][virtualAccount]={
            credit:{
                sum:diff.credit,
                ed:{
                    type:'asa'+sa.type,
                    _id:sa._id,
                    name:sa.name,
                    date:sa.date
                }
            }
        }
        sa.entries.push(o)
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}










