'use strict';
var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var Schema = mongoose.Schema;
/**
 * User Schema
 */


var ActSchema = new Schema({
    store:String,
    num:Number,
    name: {type : String, default : '', trim : true},
    desc: {type : String, default : '', trim : true},
    url:{type :String,index:true},
    date: { type: Date, default: Date.now },// поступил
    actived:{type:Boolean,default:false},
    index: Number,
    zakaz:{type : Schema.ObjectId,ref:'Zakaz'},// Order Zakaz ActRabot ActSpisanie
    typeOfZakaz:{type:String,default:'manufacture'},
    typeOfContrAgent:'String',
    contrAgent:{type : Schema.ObjectId,refPath:'typeOfContrAgent'},
    works:[{
        item:{type : Schema.ObjectId, ref : 'Work'},
        worker:{type:Schema.ObjectId, ref : 'Worker'},
        price:Number,
        qty:Number,
        sum:Number,
        salary:Number
    }],
    sum:{type:Number,default:0}, /*продажная сумма после проведения*/
    sumForWorker:{type:Number,default:0},/*сумма  работникам*/
    workingHour:{},
    currency:{type:String,default:'UAH'},
    virtualAccount:{type : Schema.ObjectId,ref:'VirtualAccount'},
    entries:[{}],
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true }});



ActSchema.statics = {
    load: function (query, cb) {
        this.findOne(query)
            .populate({
                path: 'zakaz'
                , select: 'name type'
            })
            .populate({
                path: 'works.item',
                select:'name workingHour',
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
    postUpdate:async function(act){
        let Zakaz = mongoose.model('Zakaz')
        if(act.zakaz){
            let zakaz= await Zakaz.findOne({_id:act.zakaz}).exec()
            if(!zakaz.acts.some(a=>{((a.toSting)?a.toSting():a)!=((act._id.toSting)?act._id.toSting():act._id)})){
                zakaz.acts.push(act._id)
                let r = await zakaz.save()
                console.log(r)
            }
        }

    },
    preDelete: async function(id){
        let Zakaz = mongoose.model('Zakaz');
        let act = await this.findOne({_id:id}).exec()
        if(act){
            if(act.actived){
                return 'акт проведен'
            }

            if(act.zakaz){
                let zakaz= await Zakaz.findOne({_id:act.zakaz}).lean().exec()
                if(zakaz && zakaz.acts && zakaz.acts.length){
                    const acts = zakaz.acts.filter(act => ((act.toString)?act.toString():act)!=id)
                    let r = await Zakaz.update({_id:act.zakaz},{$set:{acts:acts}})
                }
            }else{
                let zakaz= await Zakaz.findOne({acts:id}).lean().exec()
                if(zakaz && zakaz.acts && zakaz.acts.length){
                    const acts = zakaz.acts.filter(act => ((act.toString)?act.toString():act)!=id)
                    let r = await Zakaz.update({_id:act.zakaz},{$set:{acts:acts}})
                }
            }
        }


    },
    /*postDelete: async function(result,req){

    }*/
}
mongoose.model('Act', ActSchema);


