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
    store:String,
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
        worker:String,
        currency:{type:String,default:'UAH'},
        sum:Number,
      currency:String,
      incomeSum:Number,
      supplier:String,
      supplierType:Boolean,
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
        currency:{type:String,default:'EUR'},
      status:Number
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

JobTicketSchema.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .populate('customer')
            .exec(cb)
    },
    searchList: function (options, cb) {
        let searchStr=RegExp( options.searchStr, "i" )
        let criteria = {$and:[options.criteria,{['name']:searchStr}]}
        this.find(criteria)
            .sort({'date': -1}) // sort by date
            .populate('customer')
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },
    list: function (options, cb) {
        var criteria = options.criteria || {}
        this.find(criteria)
            .sort({'date': -1}) // sort by date
            .populate('customer')
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    }
}



mongoose.model('JobTicket', JobTicketSchema);

let jobTicket = mongoose.model('JobTicket');

/*
jobTicket.find().exec(async function (err,docs) {
    for(let  doc of docs){
        if(!doc.store){
            doc.store='5a3cc10e1626aa0566f7ea87';
            await doc.save()
            console.log('saved')
        }

    }
})
*/


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
        worker:String,
        currency:String,
        sum:Number,
      incomeSum:Number,
      supplier:String,
      supplierType:Boolean,

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
        account:Boolean,
      status:Number
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


JobTicketSchemaArch.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .populate('customer')
            .exec(cb)
    },
    searchList: function (options, cb) {
        let searchStr=RegExp( options.searchStr, "i" )
        let criteria = {$and:[options.criteria,{['name']:searchStr}]}
        this.find(criteria)
            .sort({'date': -1}) // sort by date
            .populate('customer')
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },
    list: function (options, cb) {
        var criteria = options.criteria || {}
        this.find(criteria)
            .sort({'date': -1}) // sort by date
            .populate('customer')
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    }
}


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

