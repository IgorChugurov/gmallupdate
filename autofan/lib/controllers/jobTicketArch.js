'use strict';



var mongoose = require('mongoose'),
    async = require('async')
    ,JobTicket = mongoose.model('JobTicketArch');

var _ = require('underscore');

var ObjectId = require('mongoose').Types.ObjectId;

exports.list= function(req, res,next) {
    //console.log()
    var page =  (req.query && req.query.page && parseInt(req.query.page)>0)?parseInt(req.query.page):0;
    //var page = (req.params['page'] > 0 ? req.params['page'] : 1) - 1;
    var perPage = (req.query && req.query.perPage && parseInt(req.query.perPage)>0)?parseInt(req.query.perPage):20;
    var options = {
        perPage: perPage,
        page: page,
        criteria:null
    }
    // сводка формируетмя по ордерам по дате закрытия
    if (req.query && req.query.dtfrom && req.query.dtto){
        var start=new Date(req.query.dtfrom);
        var  end =new Date(req.query.dtto);
        if (end>=start){
            options.criteria = {dateClose: {
                $gte:start,
                $lte: end
            }};
        }

    }
    //console.log(options);
    var select='customer date dateClose resSum resPay';
    if (req.query && req.query.data && req.query.data=='all'){
        select='customer date dateClose jobs pay sparks';
    }
    JobTicket.find(options.criteria)
        .limit(options.perPage)
        .skip(options.perPage * options.page)
        .populate('customer')
        .select(select)
        .sort({'date': -1}) // sort by date
        .exec(function(err, docs) {
            /*docs.forEach(function (d) {
              console.log(d.dateClose)
            })*/
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
exports.get= function(req, res,next) {
    if (req.query && req.query.query && req.query.query=='balance'){
        JobTicket.findOne({customer:req.params.id})
            .select('balance resSum resPay')
            .sort({'date': -1})
            .exec(function (err, result) {
                if (err) return next(err);
                res.json(result);
            });
    } else {
        JobTicket.findById(req.params.id)
            .populate('customer')
            .exec(function (err, result) {
                if (err) return next(err);
                res.json(result);
            });
    }
}

exports.convert= function(req, res,next) {
    var  config = require('../../data/config.json');
    var rate = config.currency['EUR'][0];
    var num = 0;
    var convert = function(ticket,callback){
        ticket.rate=rate;
        var resSum= 0,resPay=0;
        num++
        //if (num==1) console.log(ticket)
        ticket.sparks.forEach(function(el){
            /*console.log(typeof el.price)
             console.log(el);*/
            if (typeof el.price=='number'){
                el.price=parseFloat((el.price/rate).toFixed(2));
                resSum += el.price*el.q;
            } else {
                el.price=1;
            }

        })
        console.log('ressum1 ',resSum)
        ticket.jobs.forEach(function(el){
            resSum += (el.sum)?parseFloat((el.sum/rate).toFixed(2)):parseFloat(((200*el.norma*el.q/rate)).toFixed(2));
        })
        console.log('ressum2 ',resSum)
        ticket.pay.forEach(function(el){

            el.val=parseFloat((el.val/rate).toFixed(2));
            resPay += el.val;
        })
        console.log('resPay-',resPay);
        console.log( typeof ticket.balance)
        console.log('ticket.balance befor-',ticket.balance);
        if (  typeof ticket.balance=='number'){
            ticket.balance=parseFloat((ticket.balance/rate).toFixed(2));
            if (ticket.balance>10000  || ticket.balance<-10000){
                console.log(ticket.balance);
                ticket.balance=0;
            }

        } else {
            ticket.balance=0;
        }
        if (ticket.balance<1 && ticket.balance>-1){ticket.balance=0;}
        console.log('ticket.balance after-',ticket.balance);

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

