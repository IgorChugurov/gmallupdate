'use strict';
var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var Schema = mongoose.Schema;
/**
 * User Schema
 */


var SupplierSchema = new Schema({
    store:String,
    name: {type : String, default : '', trim : true},
    url:{type :String,index:true},
    index: Number,
    rate:{type:Number,default:25},// процент наценки для поставщика
    data:[],
    actived:{type:Boolean,default:true},
    /*
    * data item :{
    * virtualAccount:String,
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

SupplierSchema.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .exec(cb)
    },
    searchList: function (options, cb) {
        let searchStr=RegExp( options.searchStr, "i" )
        let criteria = {$and:[options.criteria,{['name']:searchStr}]}
        this.find(criteria)
            .sort({'name': 1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },
    list: function (options, cb) {
        var criteria = options.criteria || {}
        this.find(criteria)
            .sort({'name': 1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },
}

mongoose.model('Supplier', SupplierSchema);

/*let M = mongoose.model('Supplier');
M.find().remove().exec()*/
/*M.update({},{$set:{data:[]}},{multi:true}, function (err, raw) {
    if (err) return console.log(err);
    console.log('The raw response from Mongo was ', raw);
})*/


