'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */
var CustomSchema = new Schema({
    vin:String,
    model:String,
    name: String,
    email:String,
    phone:String,
    notes:String
});
CustomSchema.statics = {
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
    }
}

mongoose.model('Custom', CustomSchema);

var JobTypeSchema = new Schema({
    name:String,
    ratio:{ type: Number, default: 1 }
});
JobTypeSchema.statics = {
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
    }
}
mongoose.model('JobType', JobTypeSchema);

/*
var MasterSchema = new Schema({
    name:String
});
mongoose.model('Master', MasterSchema);
*/


var JobNameSchema = new Schema({
    name:String,
    norma:Number,
    jobType: {type : Schema.ObjectId, ref : 'JobType'}
});
JobNameSchema.statics = {
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
    }
}
mongoose.model('JobName', JobNameSchema);


var JobTicketSchema = new Schema({
    balance: { type: Number, default: 0 },
    customer :{type : Schema.ObjectId, ref : 'Custom'},
    mile     :Number,
    date     : { type: Date, default: Date.now },
    dateClose:Date,
    resSum:Number,
    resPay:Number,
    worker:String,
    createByAPI:String,
    jobs:[{
        name: String,
        norma:Number,
        q:Number,
        jobType: {type : Schema.ObjectId, ref : 'JobType'},
        date:Date,
        worker:{type : Schema.ObjectId, ref : 'Worker'},
        sum:Number
    }],
    sparks:[{
        name:String,
        code:String,
        sku:String,
        price:Number,
        q:Number,
        shipPrice:Number,
        date:Date,
        incomePrice:Number,
        invoice:String,
        supplier:String,
        producer:String,
    }],
    pay:[{
        date:Date,
        val:Number
    }],
    payGrn:[{
        date:Date,
        val:Number
    }],
    text:String

});


mongoose.model('JobTicket', JobTicketSchema);


var JobTicketSchemaArch = new Schema({
    balance:Number,
    customer :{type : Schema.ObjectId, ref : 'Custom'},
    mile     :Number,
    date     : { type: Date, default: Date.now },
    dateClose: { type: Date, default: Date.now },
    resSum:Number,
    resPay:Number,
    worker:String,
    createByAPI:String,
    jobs:[{
        name: String,
        norma:Number,
        q:Number,
        jobType: {type : Schema.ObjectId, ref : 'JobType'},
        date:Date,
        worker:{type : Schema.ObjectId, ref : 'Worker'},
        sum:Number
    }],
    sparks:[{
        name:String,
        code:String,
        sku:String,
        price:Number,
        q:Number,
        shipPrice:Number,
        date:Date,
        incomePrice:Number,
        invoice:String,
        supplier:String,
        producer:String,
    }],
    
    pay:[{
        date:Date,
        val:Number
    }],
    payGrn:[{
        date:Date,
        val:Number
    }],
    text:String,
    rate:Number

});


mongoose.model('JobTicketArch', JobTicketSchemaArch);

var WorkerSchema = new Schema({
    name:String,
    ratio:{ type: Number, default: 0.5 }
});
mongoose.model('Worker', WorkerSchema);


var LinkedJobSchema = new Schema({
    spark:{ type: String, index: true },
    jobs:[{
        job: {type : Schema.ObjectId, ref : 'JobName'},
        category: {type : Schema.ObjectId, ref : 'JobType'}
    }]
});
mongoose.model('LinkedJob', LinkedJobSchema);

