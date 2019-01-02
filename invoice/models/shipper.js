'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */
var ShipperSchema = new Schema({
    name: String,
    code:Number,
    ratio:Number,
    ratioEnter:Number,
    currency:String
});

ShipperSchema.statics = {
    load: function (query, cb) {
        this.findOne(query)
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
            .sort({'date': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    }
}


mongoose.model('Shipper', ShipperSchema);


var SparkSchema = new Schema({
        code:String,
        shipper: {type : Schema.ObjectId, ref : 'Shipper'},
        stuff:[]
});




mongoose.model('Sparks', SparkSchema);

