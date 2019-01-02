'use strict';
var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var Schema = mongoose.Schema;
/**
 * User Schema
 */


var Zakaz = new Schema({
    store:String,
    num:{type:Number,default:1},
    name: {type : String, default : '', trim : true},
    desc: {type : String, default : '', trim : true},
    url:{type :String,index:true},
    date: { type: Date, default: Date.now },// поступил
    actived:{type:Boolean,default:false},
    type:String,// order narjad act
    index: Number,
    rns:[{type : Schema.ObjectId,ref:'Rn'}],//
    pns:[{type : Schema.ObjectId,ref:'Pn'}],//
    acts:[{type : Schema.ObjectId,ref:'Act'}],//
    mos:[{type : Schema.ObjectId,ref:'MoneyOrder'}],//
    worker:{type : Schema.ObjectId,ref:'Worker'},
    typeOfContrAgent:'String',
    contrAgent:{type : Schema.ObjectId,refPath:'typeOfContrAgent'},
    sum:Number,
    currencyData:{},
    currency:{type:String,default:'UAH'},
    totalSum:{},
    totalSumWorker:{},
    totalUchet:{},
    virtualAccount:{type : Schema.ObjectId,ref:'VirtualAccount'},
    entries:[{}],
    createdByAPI:String,
    linkForcreatedByAPI:String,
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true }});

Zakaz.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .populate({
                path: 'rns',
                select:'name date materials actived currency',
                // Get producer of item - populate the 'producer'  for every item
                populate: { path: 'materials.item' ,select:'name sku sku2 producer'}
            })
            .populate({
                path: 'pns',
                select:'name date materials actived currency',
                // Get producer of item - populate the 'producer'  for every item
                populate: { path: 'materials.item' ,select:'name sku sku2 producer'}
            })
            .populate({
                path: 'acts',
                select:'name date works actived currency',
                populate: { path: 'works.worker works.item' ,select:'name'},
                //populate: { path: 'works.worker' ,select:'name'}
            })
            .populate({
                path: 'mos',
            })
            .exec(cb)
    },
    searchList: function (options, cb) {
        let searchStr=RegExp( options.searchStr, "i" )
        let criteria = {$and:[options.criteria,{['name']:searchStr}]}
        console.log(criteria.$and[0])
        this.find(criteria)
            .sort({'date': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },
    list: function (options, cb) {
        var criteria = options.criteria || {}
        var query =this.find(criteria);

        query.sort({'date': -1}) // sort by date
        query.limit(options.perPage)
        query.skip(options.perPage * options.page)
        query.populate('contrAgent','name field1 field2 phone')
        query.populate('worker','name rateSale rateWork');
        if(options.req && options.req.query  && options.req.query.populate){
            query.populate({
                path: 'rns',
                select:'name date materials actived currency contrAgent virtualAccount',
                // Get producer of item - populate the 'producer'  for every item
                populate: { path: 'materials.item' ,select:'name sku sku2 producer'}
            })
            query.populate({
                    path: 'pns',
                    select:'name date materials actived currency contrAgent virtualAccount',
                    // Get producer of item - populate the 'producer'  for every item
                    populate: { path: 'materials.item' ,select:'name sku sku2 producer'}
                })
            query.populate({
                    path: 'acts',
                    select:'name date works actived currency contrAgent virtualAccount',
                    populate: { path: 'works.worker works.item' ,select:'name'},
                    //populate: { path: 'works.worker' ,select:'name'}
                })
        }
        query.lean()
        query.exec(cb)
    },
    preDelete: async function(id){
        let zakaz = await this.findOne({_id:id}).exec()
        if(zakaz){
            if(zakaz.actived){
                return 'наряд проведен'
            }

            /*if(zakaz.rns && zakaz.rns.length){
                zakaz.rns=zakaz.rns.filter(rn=>rn)
                if(zakaz.rns.length){
                    console.log(zakaz.rns)
                    return 'в наряде есть материалы'
                }

            }*/
            if(zakaz.acts && zakaz.acts.length){
                return 'в наряде есть работы'
            }
        }
    },
}
mongoose.model('Zakaz', Zakaz);


