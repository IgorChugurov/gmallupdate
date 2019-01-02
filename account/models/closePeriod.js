'use strict';
var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var Schema = mongoose.Schema;
/**
 * User Schema
 */


var ClosePeriod = new Schema({
    store:String,
    name: {type : String, default : '', trim : true},
    url:{type :String,index:true},
    date: { type: Date, default: Date.now },// поступил
    actived:{type:Boolean,default:true},
    index: {type:Number,defaul:1},
    num:Number,
    debet:{},
    credit:{},
    virtualAccount:{type:Schema.ObjectId, ref : 'VirtualAccount'},
    data:[{
        account:{type : Schema.ObjectId, ref : 'Account'},
        debet:{},
        credit:{},
    }],
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true }});

ClosePeriod.statics = {
    load: function (query, cb) {
        this.findOne(query).populate('data.account','name').populate('virtualAccount','name')
            .exec(cb)
    },
    searchList: function (options, cb) {
        let searchStr=RegExp( options.searchStr, "i" )
        let criteria = {$and:[options.criteria,{['name']:searchStr}]}
        this.find(criteria)
            .sort({'date': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .populate('virtualAccount','name')
            .lean()
            .exec(cb)
    },
    list: function (options, cb) {
        var criteria = options.criteria || {}
        this.find(criteria)
            .sort({'date': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .populate('virtualAccount','name')
            .lean()
            .exec(cb)
    },
}

mongoose.model('ClosePeriod', ClosePeriod);

