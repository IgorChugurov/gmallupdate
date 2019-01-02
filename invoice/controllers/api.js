'use strict';
var getUrl = require('./getUniqueUrl.js')
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var ObjectID = mongoose.Types.ObjectId;
var fs = require('fs');
var path = require('path');
var request=require('request')
let Account=mongoose.model('Account')
let VirtualAccount=mongoose.model('VirtualAccount')
let getAccounts=require('./getAccounts')
exports.getAccounts = async function (req,res,next) {
    try{
        let  data = await getAccounts(req.store)
        return res.json(data)
    }catch(err){
        next(err)
    }
}











