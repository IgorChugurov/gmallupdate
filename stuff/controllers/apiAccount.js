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
    //console.log(req.body);

    try {
        if(req.body && req.body.stuffs && req.body.stuffs.length){
            /*let stuffs = req.body.stuffs.reduce(function () {

            },[])*/
            let stuffs = {};
            req.body.stuffs.forEach(item=>{
                if(!stuffs[item.stuff]){
                    stuffs[item.stuff]={
                        sorts:{}
                    }
                }
                if(!stuffs[item.stuff].sorts[item.sort]){
                    stuffs[item.stuff].sorts[item.sort]=item.qty;
                }else{
                    stuffs[item.stuff].sorts[item.sort]+=item.qty;
                }
            })
            let stuffsArr =[];
            for(let id in stuffs){
                let o ={
                    stuff:id,
                    sorts:stuffs[id].sorts
                }
                stuffsArr.push(o)
            }
            //console.log(stuffsArr)
            const sign = req.body.sign;
            const store = req.body.store;

            for (let stuffData of stuffsArr){
                let stuff = await Stuff.findOne({_id:stuffData.stuff}).lean().exec();
                //console.log(JSON.stringify(stuff.stock))
                //continue
                let actived=false;
                for(let sort in stuffData.sorts){
                    if(stuff.stock && stuff.stock[sort]){
                        if(sign=='-'  && stuff.stock[sort].quantity && stuff.stock[sort].quantity>=stuffData.sorts[sort]){
                            stuff.stock[sort].quantity= Number(stuff.stock[sort].quantity) - stuffData.sorts[sort]
                        }else if(sign=='+'){
                            console.log(Number(stuff.stock[sort].quantity))
                            console.log(stuffData.sorts[sort])
                            stuff.stock[sort].quantity = Number(stuff.stock[sort].quantity) + stuffData.sorts[sort]
                        }
                    }
                }
                if(sign=='+'){
                    actived=true;
                }else{
                   for(let sort in stuff.stock){
                       if(stuff.stock[sort] && stuff.stock[sort].quantity && Number(stuff.stock[sort].quantity)>0){
                           actived=true;
                           break;
                       }
                   }
                }

                /*if(stuff.stock && stuff.stock[stuffData.sort]){
                    if(sign=='-'  && stuff.stock[stuffData.sort].quantity && stuff.stock[stuffData.sort].quantity>=stuffData.qty){
                        stuff.stock[stuffData.sort].quantity= stuff.stock[stuffData.sort].quantity - stuffData.qty
                    }else if(sign=='+'){
                        stuff.stock[stuffData.sort].quantity= stuff.stock[stuffData.sort].quantity + stuffData.qty
                    }
                }*/
                //console.log('actived',actived)
                let o={stock:stuff.stock,actived:actived};
                if(actived){
                    o.archived=false;
                }
                //console.log(o)
                let r = await Stuff.update({_id:stuff._id},{$set:o})

            }
        }
    }catch (e) {
        console.log(e)
    }

    res.json({msg:'OK'})
}









