'use strict';
var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var Schema = mongoose.Schema;
/**
 * User Schema
 */

/*
var Supplier=mongoose.model('Supplier');
var Customer=mongoose.model('Customer');
var Worker=mongoose.model('Worker');
var Founder=mongoose.model('Founder');
var Contragent=mongoose.model('Contragent');
var Account=mongoose.model('Account');
var globalVariable = require('../../../public/bookkeep/scripts/variables.js')
const Models={
    Supplier:Supplier,
    Customer:Customer,
    Worker:Worker,
    Founder:Founder,
    Contragent:Contragent
}
*/


var StockAdjustment = new Schema({
    store:String,
    num:{type : Number, default : 0},
    name: {type : String, default : '', trim : true},
    url:{type :String,index:true},
    date: { type: Date, default: Date.now },// поступил
    actived:{type:Boolean,default:false},
    diff:{},
    index: Number,
    materials:[{
        item:{type : Schema.ObjectId, ref : 'Material'},
        data:[{
            supplier:{type:Schema.ObjectId, refPath : 'materials.data.supplierType'},
            supplierType:String,
            qty:{type:Number,default:0},
            newQty:{type:Number,default:0},
            price:{type:Number,default:0},
            newPrice:{type:Number,default:0},
            priceForSale:{type:Number,default:0},
            newPriceForSale:{type:Number,default:0},
            manufacture: [{
                qty:Number,
                rn:{type:Schema.ObjectId, ref : 'Rn'},
                newQty:{type:Number,default:0},
            }]

        }]
    }],
    currencyData:{},
    account:String,
    virtualAccount:{type:Schema.ObjectId, ref : 'VirtualAccount'},
    entries:[{}],
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true }});





StockAdjustment.statics = {
    load: function (query, cb) {
        var SA = mongoose.model('StockAdjustment');
        this.findOne(query)
            .populate('materials.item','name sku sku2 currency')
            .populate('materials.data.manufacture.rn','name')
            .populate('virtualAccount','name')
            .exec(async function (err,doc) {
                if(err){return cb(err)}
                for(let m of doc.materials){
                    if(m && m.data){
                        for(let d of m.data){
                            await  SA.populate(d,{path: 'supplier', select: 'name',model:d.supplierType})
                        }
                    }

                }
                cb(err,doc)
            })
    },
    searchList: function (options, cb) {
        let searchStr=RegExp( options.searchStr, "i" )
        let criteria = {$and:[options.criteria,{['name']:searchStr}]}
        this.find(criteria)
            .populate('virtualAccount','name')
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
        let SA = await this.findOne({store:req.store._id,virtualAccount:req.body.virtualAccount}).sort({num : -1}).lean().exec()
        let currancyArr=req.store.currencyArr
        req.body.num =(SA && SA.num)?Number(SA.num)+1:1;
        req.body.name +=' '+req.body.num;
        if(!req.body.materials){req.body.materials=[]}
        req.body.date=new Date();
        req.body.date.setHours(0,0,0,0);

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

mongoose.model('StockAdjustment', StockAdjustment);

