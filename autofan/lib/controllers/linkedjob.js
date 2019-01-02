'use strict';

var mongoose = require('mongoose'),
    async = require('async')

    ,LinkedJob = mongoose.model('LinkedJob');
var _ = require('underscore');

var ObjectId = require('mongoose').Types.ObjectId;

exports.list= function(req, res,nex) {
    LinkedJob.find().exec(function(err, result) {
        if (err)  return next(err);
        return res.json(result)
    })
}
exports.listForSpark= function(req, res,next) {
    LinkedJob.findOne({spark:req.params.spark})
        .populate('jobs.job')
        .populate('jobs.category')
        .exec(function (err, result) {
        if (err) return next(err);
        res.json(result);
    });

}

exports.add= function(req, res,next) {
    //console.log(req.body);

    LinkedJob.findOne({spark:req.body.spark},function (err, spark) {
        if (err) return next(err);
        //console.log(spark);
        if (!spark){
            var linkedJob = new LinkedJob({spark:req.body.spark,jobs:[{job:req.body.job,category:req.body.category}]})
            linkedJob.save(function(err){
                if (err) return next(err);
                else  res.json({message:'Ok new'});
            })
        } else {
            var is;
            for (var i= 0,l=spark.jobs.length;i<l;i++){
                if (spark.jobs[i].job==req.body.job){
                    is=true;
                    break;
                }
            }
            if(!is){
                spark.jobs.push({job:req.body.job,category:req.body.category});
                spark.save(function(err){
                    if (err) return next(err);
                    else  res.json({message:'Ok update'});
                })
            } else {
                res.json({message:'already is'});
            }
        }

    });
}

exports.delete = function(req,res,next){
    LinkedJob.findOne({spark:req.params.spark},function (err, spark) {
        if (err) return next(err);
        if (spark){
            for (var i= 0,l=spark.jobs.length;i<l;i++){
                if (spark.jobs[i].job==req.params.job){
                    spark.jobs.splice(i,1);
                    break;
                }
            }
            spark.save();
            res.json({message:'deleted'});
        } else {
            res.json({message:'deleted'});
        }


    });

}