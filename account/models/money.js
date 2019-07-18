'use strict';
var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var Schema = mongoose.Schema;
/**
 * User Schema
 */


var Money = new Schema({
    store:String,
    name: {type : String, default : '', trim : true},
    url:{type :String,index:true},
    type:String,// cash or bank
    index: Number,
    data:[],
    transaction:Number,
    /*
    * data item :{
    * virtalsaccount:String,
    *   uah:{
    *       debet:Number,
    *       credit:Number
    *   }
    *    usd:{
     *       debet:Number,
     *       credit:Number
     *   }
    * }
    * */

}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true }});



Money.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .exec(cb)
    },
    searchList: function (options, cb) {
        let searchStr=RegExp( options.searchStr, "i" )
        let criteria = {$and:[options.criteria,{['name']:searchStr}]}
        this.find(criteria)
            .sort({'index': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },
    list: function (options, cb) {
        var self=this;
        var criteria = options.criteria || {}
        this.find(criteria)
            .sort({'index': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
            /*.exec(function (err,items) {
                items.forEach(i=>{
                    console.log(i)
                    if(i.type && typeof i.type=='string'){
                        console.log(i.type)
                        i.type=capitalizeFirstLetter(i.type)
                        self.update({_id:i._id},{$set:{type:i.type}},function (err,res) {
                            console.log(res)
                        })
                    }

                })
                cb(err,items)
            })*/
    },
}

mongoose.model('Money', Money);




var MoneyOrder = new Schema({
    store:String,
    name: {type : String, default : '', trim : true},
    desc: {type : String, default : '', trim : true},
    url:{type :String,index:true},
    type: String,// Cash_debet or Bank_debet or Cash_credit or Bank_credit
    index: Number,
    num:{type:Number,defautl:1},
    sum:{type:Number,defautl:0},
    date: { type: Date, default: Date.now },// поступил
    dateHold: { type: Date, default: Date.now },// дата проведения документа
    actived:{type:Boolean,default:false},
    typeOfContrAgent:'String',
    contrAgent:{type : Schema.ObjectId,refPath:'typeOfContrAgent'},
    contrAgents:[{id: {type : Schema.ObjectId,ref:'Worker'},sum:Number}],
    payroll:Boolean,// ведомость по выдаче зарплаты
    currencyData:{},
    currency:{type:String,default:'UAH'},
    debet:{type:Number,defautl:0},
    credit:{type:Number,defautl:0},
    currencyDebet:{type:String,default:'UAH'},
    currencyCredit:{type:String,default:'UAH'},
    rate:Number,
    diff:{debet:{type:Number,default:0},credit:{type:Number,default:0}},
    virtualAccount:{type : Schema.ObjectId,refPath:'VirtualAccount'},
    entries:[{}],
    zakaz:{type : Schema.ObjectId,ref:'Zakaz'},
    contrAgentExchange:Boolean,
    contrAgentExchangeData:{},
    connectedOrder:{type : Schema.ObjectId,ref:'MoneyOrder'}

}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true }});



MoneyOrder.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .exec(cb)
    },
    searchList: function (options, cb) {
        let searchStr=RegExp( options.searchStr, "i" )
        let criteria = {$and:[options.criteria,{['name']:searchStr}]}
        this.find(criteria)
            .sort({'date': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .populate({
                path: 'contrAgent'
                , select: 'name'
            })
            .lean()
            .exec(cb)
    },
    list: function (options, cb) {
        var self=this;
        var criteria = options.criteria || {}
        this.find(criteria)
            .sort({'date': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .populate({
                path: 'contrAgent'
                , select: 'name'
            })
            .lean()
            .exec(cb)
    },
    preUpdate: async function (req) {
        var self=this;
        var criteria = {store:req.store._id,type:req.body.type}
        let mo = await this.findOne(criteria).sort({'date': -1,num:-1}).lean().exec();
        if(mo){
            let num = (mo.num)?++mo.num:2;
            req.body.num=num;
            req.body.name+=' -'+num
        }
        /*console.log(req.body)
        console.log(mo)*/

    },
}

mongoose.model('MoneyOrder', MoneyOrder);



function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


var Rate = new Schema({
    store:String,
    date: { type: Date, default: Date.now },
    currency:{}
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true }});



Rate.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .exec(cb)
    },

    /*searchList: function (options, cb) {
        let searchStr=RegExp( options.searchStr, "i" )
        let criteria = {$and:[options.criteria,{['name']:searchStr}]}
        this.find(criteria)
            .sort({'index': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },*/
    list: function (options, cb) {
        var self=this;
        var criteria = options.criteria || {}
        this.find(criteria)
            .sort({'date': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(async function (err,data) {
                if(err){
                    return cb(err)
                }
                if(!data.length){
                    let dd ={
                        store:options.req.store._id,
                        currency:options.req.store.currency
                    }
                    let d = new self(dd)
                    await d.save()
                    data.push(d.toObject())
                }
                return cb(err,data)
            })
    },
}

mongoose.model('Rate', Rate);