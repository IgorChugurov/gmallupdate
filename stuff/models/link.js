'use strict';
var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var Schema = mongoose.Schema;
    var cToL= require('../controllers/c-l');
/**
 * User Schema
 */


var LinkSchema = new Schema({
    store:String,
    name: {type : String, default : '', trim : true},
    nameL: {},
    desc:String,
    descL:{},
    url:{type :String,index:true},
    date: { type: Date, default: Date.now },// поступил
    type:{type :String,default:'excel'},// excel,xml
    actived:{type:Boolean,default:true},
    index: Number,
    rowQty:Number,
    rows:[{
        name:String,
        value:[],
        filter:[String],
        separator: [String],
    }],
    wrapper:Boolean,// оболочка
    sortsInRow:Boolean,// Положение разновидностей товара в строку или по отдельности
    allQty:Boolean,// показывать только наличие или количество true показываем количество
    maxQty:Number,//Ограничение максимального количества в выгрузке

    tags:[{type : Schema.ObjectId, ref : 'FilterTags'}], // ссылка на группу товары из которой являются акционными
    brandTags:[{type : Schema.ObjectId, ref : 'BrandTags'}],// ссылка на коллекцию товары из которой являются акционными
    brands:[{type : Schema.ObjectId, ref : 'Brand'}],// ссылка на бренд товары из которой являются акционными
    stuffs:[{type : Schema.ObjectId, ref : 'Stuff'}],
    categories:[{type : Schema.ObjectId, ref : 'Category'}],
    conditionTags:[{type : Schema.ObjectId, ref : 'FilterTags'}], // ссылка на группу товары из которой являются условием для применения акции
    conditionBrandTags:[{type : Schema.ObjectId, ref : 'BrandTags'}],// ссылка на коллекцию товары из которой являются условием для применения акции
    conditionBrands:[{type : Schema.ObjectId, ref : 'Brand'}],// ссылка на бренд товары из которой являются условием для применения акции
    conditionStuffs:[{type : Schema.ObjectId, ref : 'Stuff'}],
    conditionCategories:[{type : Schema.ObjectId, ref : 'Category'}],
    revers:{ type: Boolean, default: false },// акция на все товары из каталога за исключением tags,brandTags,stuffs conditions при этом не учитывается
    separator:String,
    term:{type:Number,default:1},
    lang:String,
    currency:String,
    allQtyIn:Boolean,// выводятся все товары а не только те, которые в наличии

}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true }});






LinkSchema.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .populate('tags','name nameL')
            .populate('categories','name nameL')
            .populate('conditionCategories','name nameL')
            .populate('brandTags','name nameL')
            .populate('brands','name nameL')
            .populate('conditionTags','name nameL')
            .populate('conditionBrands','name nameL')
            .populate('conditionBrandTags','name nameL')
            .populate('conditionStuffs','name nameL artikul artikulL gallery')
            .populate('stuffs','name nameL artikul artikulL gallery')
            .exec(cb)
    },
    searchList: function (options, cb) {
        let criteria = {$and:[options.criteria,{$or:[]}]}
        let searchStr=RegExp( options.searchStr, "i" )
        let o={['nameL.'+options.lang]:searchStr};
        criteria.$and[1].$or.push(o)
        o={['name']:searchStr};
        criteria.$and[1].$or.push(o)
        this.find(criteria)
            .sort({'index': 1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },
    list: function (options, cb) {
        var criteria = options.criteria || {}
        this.find(criteria)
            .sort({'index': 1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },


}

mongoose.model('Link', LinkSchema);

