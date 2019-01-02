'use strict';
var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var Schema = mongoose.Schema;

var SampleEntries = new Schema({
    store:String,
    name: {type : String, default : '', trim : true},
    type:String,// электротронный документ - приходная накладная pn и так далее
    url:{type :String,index:true},
    date: { type: Date, default: Date.now },// created
    actived:{type:Boolean,default:true},
    index: Number,
    desc:String,
    entries:[
        {
            debet: {type : Schema.ObjectId, ref : 'Account'},
            credit:{type : Schema.ObjectId, ref : 'Account'},
            sum:String,// шаблона для суммы проводки - сумма документа, сумма наценки и т.д.
        }
    ]
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true }});







SampleEntries.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .exec(cb)
    },
    searchList: function (options, cb) {
        let criteria = {$and:[options.criteria,{$or:[]}]}
        let searchStr=RegExp( options.searchStr, "i" )
        let o={['nameL.'+options.lang]:searchStr};
        criteria.$and[1].$or.push(o)
        o={['blocks.descL.'+options.lang]:searchStr};
        criteria.$and[1].$or.push(o)
        o={['name']:searchStr};
        criteria.$and[1].$or.push(o)
        o={['desc']:searchStr};
        criteria.$and[1].$or.push(o)
        this.find(criteria)
            .sort({'num': -1})
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },
    list: function (options, cb) {
        var criteria = options.criteria || {}
        this.find(criteria)
            .sort({'num': -1})
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },


}

mongoose.model('SampleEntries', SampleEntries);

