'use strict';
var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var Schema = mongoose.Schema;
/**
 * User Schema
 */


var RnSchema = new Schema({
    store:String,
    num:Number,
    name: {type : String, default : '', trim : true},
    desc: {type : String, default : '', trim : true},
    url:{type :String,index:true},
    date: { type: Date, default: Date.now },// поступил
    dateHold: { type: Date, default: Date.now },// дата проведения документа
    actived:{type:Boolean,default:false},
    index: Number,
    zakaz:{type : Schema.ObjectId,ref:'Zakaz'},// Order Zakaz ActRabot ActSpisanie
    typeOfZakaz:String,
    typeOfContrAgent:'String',
    contrAgent:{type : Schema.ObjectId,refPath:'typeOfContrAgent'},
    materials:[{
        item:{type : Schema.ObjectId, ref : 'Material'},
        supplier:{type:Schema.ObjectId, refPath : 'materials.supplierType'},
        supplierType:String,
        sum:Number,
        price:Number,
        priceForSale:Number,
        priceRate:Number,
        priceForSaleRate:Number,
        qty:Number,
    }],
    sum:{type:Number,default:0}, /*продажная сумма после проведения*/
    sumUchet:{type:Number,default:0},/*сумма по учету*/
    sumForWorker:{type:Number,default:0},/*сумма процентов работнику*/
    currencyData:{},
    currency:{type:String,default:'UAH'},
    virtualAccount:{type : Schema.ObjectId,ref:'VirtualAccount'},
    reserve:Boolean,
    worker:{type : Schema.ObjectId, ref : 'Worker'},
    entries:[{}],
    invoice:String,

}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true }});



RnSchema.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .populate({
                path: 'zakaz'
                , select: 'name type'
            })
            .populate({
                path: 'materials.item',
                select:'name sku sku2 producer currency',
                // Get producer of item - populate the 'producer'  for every item
                populate: { path: 'producer' ,select:'name'}
            })
            .exec(cb)
    },
    searchList: function (options, cb) {
        let searchStr=RegExp( options.searchStr, "i" )
        let criteria = {$and:[options.criteria,{['name']:searchStr}]}
        this.find(criteria)
            .populate({
                path: 'zakaz'
                , select: 'name type'
            })
            .sort({'date': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)
    },
    list: function (options, cb) {
        var criteria = options.criteria || {}
        var Pn=mongoose.model('Pn');
        /*this.find(criteria)
            .populate({
                path: 'zakaz'
                , select: 'name type'
            })
            .sort({'date': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .lean()
            .exec(cb)*/

        let query =this.find(criteria);
        /*query.populate({
            path: 'zakaz'
            , select: 'name type'
        })*/

        if(options.populate ){
            if(typeof options.populate=='string'){
                try{
                    let pp = JSON.parse(options.populate)
                    /*console.log(pp)
                    console.log(typeof pp)*/
                    query.populate(pp)
                }catch(err){console.log(err)}
            }else if(typeof options.populate=='object'){
                query.populate(options.populate)
            }
           /* console.log('options.populate',options.populate)
            console.log(typeof options.populate)*/

        }

        /*if(options.populate){
            query.populate({
                path: 'materials.item',
                select:'name sku sku2 producer unitOfMeasure',
                // Get friends of friends - populate the 'friends' array for every friend
                populate: { path: 'producer' ,select:'name'}
            })
        }*/

        query.sort({'date': -1}) // sort by date
        query.limit(options.perPage)
        query.skip(options.perPage * options.page)
        query.lean()
        query.exec(cb)

    },
    preUpdate:async function(req){
        let Zakaz = mongoose.model('Zakaz')
        let self=req.body;
        if(self._id){ return}
        try{
            if(self.zakaz=='new' && self.typeOfZakaz=='manufacture'){
                let z = await Zakaz.findOne({store:self.store}).sort({num: -1}).lean().exec();
                let num =(z)?z.num+1:1
                let zakaz = {
                    store:self.store,
                    type:self.typeOfZakaz,
                    currency:self.currency,
                    virtualAccount:self.virtualAccount,
                    typeOfContrAgent:self.typeOfContrAgent,
                    contrAgent:self.contrAgent,
                    name: 'Ордер '+num,
                    num:num,
                    index:1,
                }
                zakaz = new Zakaz(zakaz)
                self.zakaz=zakaz._id;
                let r =await zakaz.save()

               //console.log('r',r)
            }
        }catch(err){return err}
    },
    postUpdate:async function(rn){
        let Zakaz = mongoose.model('Zakaz')
        if(rn.zakaz){
            let zakaz= await Zakaz.findOne({_id:rn.zakaz}).exec()
            if(!zakaz.rns.some(n=>{((n.toSting)?n.toSting():n)!=((rn._id.toSting)?rn._id.toSting():rn._id)})){
                zakaz.rns.push(rn._id)
                let r = await zakaz.save()
                console.log(r)
            }
        }

    },
    preDelete: async function(id){
        let Zakaz = mongoose.model('Zakaz');
        let rn = await this.findOne({_id:id}).exec()
        if(rn){
            if(rn.actived){
                return 'накладная проведена'
            }
            if(rn.reserve){
                return 'накладная в резерве'
            }
            if(rn.zakaz){
                let zakaz= await Zakaz.findOne({_id:rn.zakaz}).lean().exec()
                if(zakaz && zakaz.rns && zakaz.rns.length){
                    const rns = zakaz.rns.filter(rn => ((rn.toString)?rn.toString():rn)!=id)
                    let r = await Zakaz.update({_id:rn.zakaz},{$set:{rns:rns}})
                }
            }else{
                let zakaz= await Zakaz.findOne({rns:id}).lean().exec()
                if(zakaz && zakaz.rns && zakaz.rns.length){
                    const rns = zakaz.rns.filter(rn => ((rn.toString)?rn.toString():rn)!=id)
                    let r = await Zakaz.update({_id:rn.zakaz},{$set:{rns:rns}})
                }
            }


        }


    },
    /*postDelete: async function(result,req){

    }*/
}
mongoose.model('Rn', RnSchema);


