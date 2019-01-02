'use strict';



var mongoose = require('mongoose'),
    async = require('async')
    ,Worker = mongoose.model('Worker');

var _ = require('underscore');

var ObjectId = require('mongoose').Types.ObjectId;

exports.list= function(req, res,nex) {

    var query =  (req.query && req.query.jobType)?{jobType:ObjectId(req.query.jobType)}:null;
    console.log(req.query.jobType);
    //console.log(query);
    Worker.find(query).exec(function(err, result) {
        if (err)  return next(err);
        return res.json(result)
    })
}
exports.get= function(req, res,next) {
    Worker.findById(req.params.id,function (err, result) {
        if (err) return next(err);
        res.json(result);
    });

}

exports.add= function(req, res,next) {
    console.log(req.body);
    //req.body.filters=JSON.stringify(req.body.filters);
    //console.log(req.body.filters);
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    var stuff = new Worker(req.body);

    var upsertData = stuff.toObject();
    console.log(upsertData);
    delete upsertData._id;
    Worker.update({_id: stuff.id}, upsertData, {upsert: true}, function (err) {
        if (err) return next(err);
        // saved!
        res.json({});
    })
}

exports.delete = function(req,res,next){
    Worker.findByIdAndRemove(req.params.id, function (err) {
        if (err) return next(err);
        res.json({});
    })
}

