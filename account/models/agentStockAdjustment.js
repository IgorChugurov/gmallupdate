'use strict';
var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var Schema = mongoose.Schema;
/**
 * User Schema
 */


var AgentStockAdjustment = new Schema({
    store:String,
    num:{type : Number, default : 0},
    name: {type : String, default : '', trim : true},
    url:{type :String,index:true},
    date: { type: Date, default: Date.now },// поступил
    actived:{type:Boolean,default:false},
    diff:{},
    type:String, // Supplier Customer Worker Founder Contragent Money
    index: Number,
    desc:String,
    items:[{
        item:{type:Schema.ObjectId, refPath : 'items.itemType'},
        itemType:String,
        diff:{debet:{type:Number,default:0},credit:{type:Number,default:0}},
        data:{}
    }],
    virtualAccount:{type:Schema.ObjectId, ref : 'VirtualAccount'},
    account:String,
    currencyData:{},
    entries:[{}],
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true }});





AgentStockAdjustment.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .populate('virtualAccount','name')
            .populate('items.item','name')
            .exec(cb)
    },
    searchList: function (options, cb) {
        let searchStr=RegExp( options.searchStr, "i" )
        let criteria = {$and:[options.criteria,{['name']:searchStr}]}
        this.find(criteria)
            .sort({'date': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },
    list: function (options, cb) {
        var criteria = options.criteria || {}
        this.find(criteria)
            .populate('virtualAccount','name')
            .sort({'date': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },
    preUpdate:async function (req) {
        let SA = await this.findOne({type:req.body.type,store:req.store._id,virtualAccount:req.body.virtualAccount}).sort({num : -1}).lean().exec()
        let currancyArr=req.store.currencyArr
        req.body.num =(SA && SA.num)?Number(SA.num)+1:1;
        req.body.name +=' '+req.body.num;
        if(!req.body.items){req.body.items=[]}
        if(!req.body.date){
            req.body.date=new Date();
            req.body.date.setHours(0,0,0,0);
        }
    },
    preDelete: async function(id){
        let doc = await this.findOne({_id:id}).exec()
        if(doc){
            if(doc.actived){
                return 'документ проведен'
            }
        }


    },


}

mongoose.model('AgentStockAdjustment', AgentStockAdjustment);

