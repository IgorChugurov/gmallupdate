'use strict';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var ObjectID = mongoose.Types.ObjectId;

var fs = require('fs');
var co = require('co');
var path = require('path');
const ipHost=require('../../modules/ip/ip' );
const ports=require('../../modules/ports' );


var Stuff=mongoose.model('Stuff');




exports.changeStock = async function(req,res,next){
    console.log(req.body);
    try {
        if(req.body && req.body.stuffs && req.body.stuffs.length){
            const sign = req.body.sign;
            const store = req.body.store;
            for (let stuffData of req.body.stuffs){
                let stuff = await Stuff.findOne({_id:stuffData.stuff}).exec();

                if(stuff.stock && stuff.stock[stuffData.sort]){
                    console.log(stuff.name,' befor ',stuff.stock[stuffData.sort])
                    if(sign=='-'  && stuff.stock[stuffData.sort].quantity && stuff.stock[stuffData.sort].quantity>=stuffData.qty){
                        stuff.stock[stuffData.sort].quantity= stuff.stock[stuffData.sort].quantity - stuffData.qty
                    }else if(sign=='+'){
                        stuff.stock[stuffData.sort].quantity= stuff.stock[stuffData.sort].quantity + stuffData.qty
                    }
                    console.log(stuff.name,' after ',stuff.stock[stuffData.sort])

                    let r = await Stuff.update({_id:stuff._id},{$set:{stock:stuff.stock}})
                    console.log(r)
                }

            }
        }
    }catch (e) {
        console.log(e)
    }

    res.json({msg:'OK'})
}









