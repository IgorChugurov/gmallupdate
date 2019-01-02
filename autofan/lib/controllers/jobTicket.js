'use strict';



var mongoose = require('mongoose'),
    async = require('async')
    ,JobTicket = mongoose.model('JobTicket');

var _ = require('underscore');

var ObjectId = require('mongoose').Types.ObjectId;

var path = require('path');
var pathC = "../../data/config.json";

exports.list= function(req, res,next) {
    var page =  (req.query && req.query.page && parseInt(req.query.page)>0)?parseInt(req.query.page):0;
    //var page = (req.params['page'] > 0 ? req.params['page'] : 1) - 1;
    var perPage = (req.query && req.query.perPage && parseInt(req.query.perPage)>0)?parseInt(req.query.perPage):200;
    var options = {
        perPage: perPage,
        page: page,
        criteria:null
    }
    if (req.query && req.query.query && req.query.query=='customer'){
        JobTicket.find()
            .select('customer')
            .exec(function(err, docs) {
                if (err)  return next(err);
                return res.json(docs)
            })
    } else {
        if (req.query.query && req.query.query!='{}') {
            try {
                options.criteria=JSON.parse(req.query.query);
            } catch (err) {
                console.log(err)
                options.criteria=req.query.query;
            }
        }
        //console.log(typeof options.criteria,options.criteria)
      //console.log('options.perPage',options.perPage)
        JobTicket.find(options.criteria)
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .populate('customer')
            .select('customer date resSum resPay balance pay payGrn dateClose')
            .sort({'date': -1}) // sort by date
            .exec(function(err, docs) {
                if (err)  return next(err);
                if (page==0){
                    JobTicket.count(options.criteria).exec(function (err, count) {
                        if (docs.length>0){
                            docs.unshift({'index':count});
                        }
                        return res.json(docs)
                    })
                } else {
                    return res.json(docs)
                }
            })
    }

}
exports.get= function(req, res,next) {
    JobTicket.findById(req.params.id)
        .populate('customer')
        .exec(function (err, result) {
            if (err) return next(err);
            res.json(result);
    });

}

exports.convert= function(req, res,next) {
    var rootPath = path.normalize(__dirname + '/../..');
    //console.log(rootPath);
    var pathConfig= path.join(rootPath,'/data/config.json');

    //console.log(pathConfig);
    if (require.cache[pathConfig]){
        console.log('is is is is');
        delete require.cache[pathConfig];
    }
    var  config = require(pathC);
    var normaHour=parseInt(config.normaHour)
    var rate = config.currency['EUR'][0];
    var num = 0;
    console.log(rate);
    var convert = function(ticket,callback){
        var resSum= 0,resPay=0;
        num++
        //if (num==1) console.log(ticket)
        ticket.sparks.forEach(function(el){
            console.log(typeof el.price)
            console.log(el);
            if (typeof el.price=='number'){
                el.price=parseFloat((el.price/rate).toFixed(2));
                resSum += el.price*el.q;
            } else {
                el.price=1;
            }
            console.log(el.price);

        })
        //console.log(ticket.jobs);
        ticket.jobs.forEach(function(el){
            resSum += (el.sum)?parseFloat((el.sum/rate).toFixed(2)):parseFloat(((normaHour*el.norma*el.q/rate)).toFixed(2));
        })
        console.log('resSum ',resSum);
        ticket.pay.forEach(function(el){
            el.val=parseFloat((el.val/rate).toFixed(2));
            resPay += el.val;
        })
        if (  typeof ticket.balance=='number'){
            ticket.balance=parseFloat((ticket.balance/rate).toFixed(2));
            if (ticket.balance>10000  || ticket.balance<-10000){
                ticket.balance=0;
            }
            //typeof ticket.balance;
        }else {
            ticket.balance=0;
        }
        if (ticket.balance<1 && ticket.balance>-1){ticket.balance=0;}

        ticket.resSum=resSum;
        ticket.resPay=parseFloat((ticket.balance+resSum-resPay).toFixed(2));
        if (ticket.resPay<1 && ticket.resPay>-1){ticket.resPay=0;}
        console.log(ticket.balance,ticket.resPay,resSum,resPay)

        //if (num==1)console.log(ticket)
        console.log(num)
        ticket.save(function(e,r){
            //console.log(e);
            if(e) return callback(e);
            callback();
        })

    }
    if (req.query.id){
        JobTicket.findOne({_id:req.query.id})
            .sort({'date': -1}) // sort by date
            .exec(function (err, result) {
                if (err) return next(err);
                convert(result,function(err){
                    if (err) return next(err);
                    res.json({msg:'обработано '+num+' нарядов.'});
                })
            });
    } else {
        JobTicket.find()
            .sort({'date': -1}) // sort by date
            .exec(function (err, result) {
                if (err) return next(err);
                async.eachSeries(result,convert,function(err){
                    if (err) return next(err);
                    res.json({msg:'обработано '+num+' нарядов.'});
                })

            });
    }


}


exports.add= function(req, res,next) {
    console.log(req.body);
    //req.body.filters=JSON.stringify(req.body.filters);
    //console.log(req.body.filters);
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    //return;
    var stuff = new JobTicket(req.body);

    var upsertData = stuff.toObject();
    console.log(upsertData);
    delete upsertData._id;
    JobTicket.update({_id: stuff.id}, upsertData, {upsert: true}, function (err) {
        if (err) return next(err);
        // saved!
        res.json({});
    })
}

exports.delete = function(req,res,next){
    JobTicket.findByIdAndRemove(req.params.id, function (err) {
        if (err) return next(err);
        res.json({});
    })
}

