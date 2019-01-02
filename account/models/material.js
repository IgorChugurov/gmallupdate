'use strict';
var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var Schema = mongoose.Schema;
/**
 * User Schema
 */


var MaterialSchema = new Schema({
    store:String,
    name: {type : String, default : '', trim : true},
    nameL: {},
    url:{type :String,index:true},
    date: { type: Date, default: Date.now },// поступил
    actived:{type:Boolean,default:true},
    index: Number,
    qty:{type:Number,default:0},
    price:{type:Number,default:0},
    priceForSale:{type:Number,default:0},
    unitOfMeasure:{type:String,default:'шт'},
    sku:String,
    sku2:[String],
    currency:{type:String,default:'UAH'},
    producer:{type:Schema.ObjectId, ref : 'Producer'},
    data:[{
        virtualAccount:{type:Schema.ObjectId, ref : 'VirtualAccount'},// ссылка на виртуальный счет его id (подразделение)
        supplier:{type:Schema.ObjectId, refPath : 'data.supplierType'},
        supplierType:String,
        qty:{type:Number,default:0},
        price:{type:Number,default:0},
        priceForSale:{type:Number,default:0},
        reserve: [{
            qty:Number,
            rn:{type:Schema.ObjectId, ref : 'Rn'}
        }]
        ,
        manufacture: [{
            qty:Number,
            rn:{type:Schema.ObjectId, ref : 'Rn'}
        }]
    }],
    stuff:String,// для связи с витриной сайта
    sort:String,
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true }});






MaterialSchema.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .exec(cb)
    },
    searchList: function (options, cb) {
        //console.log(options.searchStr)
        let criteria = {$and:[options.criteria,{$or:[]}]}
        let searchStr=RegExp( options.searchStr, "i" )
        let o={'name':searchStr};
        criteria.$and[1].$or.push(o)
        o={'sku':searchStr};
        criteria.$and[1].$or.push(o)
        o={'sku2':searchStr};
        criteria.$and[1].$or.push(o)
        //console.log(criteria.$and[1].$or)
        this.find(criteria)
            //.sort({'index': 1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .populate('producer','name')
            .populate('data.supplier','name')
            .populate('data.virtaulAccount','name')
            .lean()
            .exec(cb)
    },
    list: function (options, cb) {
        var criteria = options.criteria || {}
        //console.log('criteria',criteria)
        this.find(criteria)
            .sort({'name': 1}) // sort by name
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .populate('producer','name')
            .populate('data.supplier','name')
            .populate('data.virtualAccount','name')
            .lean()
            .exec(cb)
    },
    preDelete : async function (id) {
        console.log(id)
        try{
            let Pn = mongoose.model('Pn')
            let pn = await Pn.findOne({actived:true,"materials.item" : id}).lean().exec()
            if(pn){ pn.ed = 'приходная накладная';return pn}
            Pn = mongoose.model('StockAdjustment')
            pn = await Pn.findOne({actived:true,"materials.item" : id}).lean().exec()
            if(pn){ pn.ed = 'складская инвентаризация';return pn}
            Pn = mongoose.model('Rn')
            pn = await Pn.findOne({actived:true,"materials.item" : id}).lean().exec()
            if(pn){ pn.ed = 'расходная накладная';return pn}
            return null;
        }catch(err){
            return err
        }


    }


}

mongoose.model('Material', MaterialSchema);
/*
let M = mongoose.model('Material');
M.find().remove().exec()
*/

/*
let M = mongoose.model('Material');
M.update({},{$set:{data:[],priceForSale:0,price:0,qty:0}},{multi:true}, function (err, raw) {
    if (err) return console.log(err);
    console.log('The raw response from Mongo was ', raw);
})
*/
