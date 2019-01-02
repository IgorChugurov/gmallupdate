'use strict';
var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var Schema = mongoose.Schema;
/**
 * User Schema
 */


var ProducerSchema = new Schema({
    store:String,
    name: {type : String, default : '', trim : true},
    url:{type :String,index:true},
    actived:{type:Boolean,default: true},
    index: Number,
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true }});




ProducerSchema.statics = {
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

mongoose.model('Producer', ProducerSchema);

