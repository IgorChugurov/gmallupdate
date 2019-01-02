'use strict';
var getUrl = require('./getUniqueUrl.js')
var globalVaribles = require('../../public/bookkeep/scripts/variables.js')
//console.log(globalVaribles)
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var ObjectID = mongoose.Types.ObjectId;
var fs = require('fs');
var path = require('path');
var request=require('request')
let Account=mongoose.model('Account')
let Money=mongoose.model('Money')
let VirtualAccount=mongoose.model('VirtualAccount')
async function getAccounts(store) {
    try{
        //await Account.find({store:store._id}).remove().exec()
        let acts = [Account.find({store:store._id}).sort({index:1}).lean().exec(),
            VirtualAccount.find({store:store._id}).sort({index:1}).lean().exec(),
            Money.find({store:store._id}).lean().exec()]
        let o = await Promise.all(acts)
        let moneys = o.pop();
        //console.log(globalVaribles.typeOfAccounts)
        if(globalVaribles.typeOfAccounts && globalVaribles.typeOfAccounts.length){
            let accounts = o[0];
            let idx=0;
            for(let accountType of globalVaribles.typeOfAccounts){
                //console.log('accountType',accountType)
                if(!accounts.find(a=>a.type==accountType)){
                    let newAccount = {
                        type:accountType,
                        name:accountType,
                        url:accountType,
                        index:++idx,
                        nameNum:accountType,
                        store:store._id
                    }
                    newAccount = new Account(newAccount)
                    await newAccount.save()
                    accounts.push(newAccount.toObject())
                    //console.log(accountType)
                }

            }
            for(let i=0;i<accounts.length;i++){
                let a = globalVaribles.typeOfAccounts.indexOf(accounts[i].type)
                if(a<0){
                    let ss = await Account.remove({_id:accounts[i]._id}).exec()
                    //console.log(ss)
                    accounts.splice(i,1);
                    i--;
                }
            }
            //console.log(accounts)
        }
        let virtualAccounts = o[1];
        if(!virtualAccounts.length){
            let newVirtualAccount ={
                name:'Подразделение 1',
                url:'podrazdelenie_1',
                store:store._id,
                index:1,
            }
            newVirtualAccount = new VirtualAccount(newVirtualAccount)
            await newVirtualAccount.save();
            virtualAccounts.push(newVirtualAccount.toObject())
            //console.log(newVirtualAccount.name);
        }
        if(!moneys.find(m=>m.type=='Cash')){
            let item  ={
                name:'Касса',
                url:'kassa',
                store:store._id,
                type:'Cash'
            }
            item = new Money(item);
            await item.save()
            //console.log(item.name)
        }
        if(!moneys.find(m=>m.type=='Bank')){
            let item  ={
                name:'Банк',
                url:'bank',
                store:store._id,
                type:'Bank'
            }
            item = new Money(item);
            await item.save()
            //console.log(item.name)
        }
        //console.log(o)
        return o;
    }catch(err){
        console.log(err)
        return err
    }

}

/*let r = Money.find().remove().exec()
console.log(r)*/
module.exports = getAccounts











