'use strict';
var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var Schema = mongoose.Schema;
/**
 * User Schema
 */


var Contragent = new Schema({
    store:String,
    name: {type : String, default : '', trim : true},
    url:{type :String,index:true},
    index: Number,
    data:[],
    actived:{type:Boolean,default:true},
    /*
    * data item :{
    * account:String,
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

Contragent.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .exec(cb)
    },
    searchList: function (options, cb) {
        let searchStr=RegExp( options.searchStr, "i" )
        let criteria = {$and:[options.criteria,{['name']:searchStr}]}
        this.find(criteria)
            .sort({'name': 1})
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },
    list: function (options, cb) {
        var criteria = options.criteria || {}
        this.find(criteria)
            .sort({'name': 1})
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },
}

mongoose.model('Contragent', Contragent);

