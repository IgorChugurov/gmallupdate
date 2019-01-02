'use strict';
var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var Schema = mongoose.Schema;
/**
 * User Schema
 */


var PnSchema = new Schema({
    store:String,
    num:Number,
    name: {type : String, default : '', trim : true},
    desc: {type : String, default : '', trim : true},
    url:{type :String,index:true},
    date: { type: Date, default: Date.now },// поступил
    dateHold: { type: Date, default: Date.now },// дата проведения документа
    actived:{type:Boolean,default:false},
    index: Number,
    //supplier:{type : Schema.ObjectId, refPath : 'typeOfContrAgent'},
    typeOfContrAgent:'String',
    contrAgent:{type : Schema.ObjectId,refPath:'typeOfContrAgent'},
    materials:[{
        item:{type : Schema.ObjectId, ref : 'Material'},
        price:Number,
        qty:Number,
        priceForSale:Number,
    }],
    sum:Number,
    currencyData:{},
    currency:{type:String,default:'UAH'},
    virtualAccount:{type : Schema.ObjectId,ref:'VirtualAccount'},
    /*debet:{type : Schema.ObjectId, ref : 'Account'},
    credit:{type : Schema.ObjectId, ref : 'Account'},*/
    entries:[{}],
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true }});


/*PnSchema.virtual('agent').get(function() {
    if(!this)return
    let item = this;
    let o =
        {
            type : Schema.ObjectId, ref : item.typeOfContrAgent
        }
        return o;
});*/
/*const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
NewsSchema.plugin(mongooseLeanVirtuals);*/



PnSchema.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .populate({
                path: 'materials.item',
                select:'name sku sku2 producer unitOfMeasure',
                // Get friends of friends - populate the 'friends' array for every friend
                populate: { path: 'producer' ,select:'name'}
            })
            //.populate('materials.item','name sku sku2 producer')
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
        var Pn=mongoose.model('Pn');
        let query =this.find(criteria);
        //this.find(criteria)
        query.populate({
                path: 'contrAgent'
                , select: 'name'
            })

        if(options.populate){
            query.populate({
                path: 'materials.item',
                select:'name sku sku2 producer unitOfMeasure',
                // Get friends of friends - populate the 'friends' array for every friend
                populate: { path: 'producer' ,select:'name'}
            })
        }

        query.sort({'date': -1}) // sort by date
        query.limit(options.perPage)
        query.skip(options.perPage * options.page)
        query.lean()
        query.exec(cb)

            /*.exec(function (err,docs) {
                docs.forEach( async d=>{
                    await  Pn.populate(d,{path: 'contrAgent', select: 'name', model: d.typeOfContrAgent})
                    console.log(d.contrAgent)
                })
                cb(err,docs)
            })*/
    },
    preDelete: async function(id){
        let pn = await this.findOne({_id:id}).exec()
        if(pn){
            if(pn.actived){
                return 'накладная проведена'
            }
        }
    },
    preUpdate:async function(req){
        try{
            let zzzz = await this.find({store: req.store._id}).sort({num: -1}).limit(1).lean().exec();
            req.body.num = (zzzz.length && zzzz[0].num && Number(zzzz[0].num)) ? ( Number(zzzz[0].num) + 1 ): 1;
            if(!req.body.name){
                req.body.name='Приходная накладная '
            }
            req.body.name+=req.body.num;
        }catch(err){return err}
    },


}

mongoose.model('Pn', PnSchema);

/*
let f = mongoose.model('Pn');
f.find().remove().exec();*/
