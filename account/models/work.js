'use strict';
var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var Schema = mongoose.Schema;
/**
 * User Schema
 */


var WorkSchema = new Schema({
    store:String,
    name: {type : String, default : '', trim : true},
    desc: {type : String, default : '', trim : true},
    url:{type :String,index:true},
    actived:{type:Boolean,default:false},
    index: Number,
    workingHour:Number,
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true }});



WorkSchema.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .exec(cb)
    },
    searchList: function (options, cb) {
        let searchStr=RegExp( options.searchStr, "i" )
        let criteria = {$and:[options.criteria,{['name']:searchStr}]}
        this.find(criteria)
            .sort({'name': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },
    list: function (options, cb) {
        var criteria = options.criteria || {}
        this.find(criteria)
            .sort({'name': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },

}
mongoose.model('Work', WorkSchema);


