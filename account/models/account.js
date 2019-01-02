'use strict';
var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var Schema = mongoose.Schema;

var AccountSchema = new Schema({
    store:String,
    name: {type : String, default : '', trim : true},
    nameNum: {type : String, default : '', trim : true},
    url:{type :String,index:true},
    type:String,
    index: Number,
    desc:String,
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true }});







AccountSchema.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .exec(cb)
    },
    searchList: function (options, cb) {
        let criteria = {$and:[options.criteria,{$or:[]}]}
        let searchStr=RegExp( options.searchStr, "i" )
        let o={['name']:searchStr};
        criteria.$and[1].$or.push(o)
        o={['desc']:searchStr};
        criteria.$and[1].$or.push(o)
        o={['nameNum']:searchStr};
        criteria.$and[1].$or.push(o)
        this.find(criteria)
            .sort({'index': 1})
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },
    list: function (options, cb) {
        var criteria = options.criteria || {}
        this.find(criteria)
            .sort({'index': 1})
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },


}

mongoose.model('Account', AccountSchema);


var VirtualAccount = new Schema({
    store:String,
    name: {type : String, default : '', trim : true},
    url:{type :String,index:true},
    index: {type:Number,default:1},
    desc:String,
    actived:{type:Boolean,default:true}
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true }});







VirtualAccount.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .exec(cb)
    },
    searchList: function (options, cb) {
        let criteria = {$and:[options.criteria,{$or:[]}]}
        let searchStr=RegExp( options.searchStr, "i" )
        let o={['name']:searchStr};
        criteria.$and[1].$or.push(o)
        o={['desc']:searchStr};
        criteria.$and[1].$or.push(o)
        this.find(criteria)
            .sort({'index': 1})
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },
    list: function (options, cb) {
        var criteria = options.criteria || {}
        this.find(criteria)
            .sort({'index': 1})
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },


}

mongoose.model('VirtualAccount', VirtualAccount);
/*let M = mongoose.model('Account');
M.find().remove().exec()*/

