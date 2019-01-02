'use strict';


var mongoose = require('mongoose'),
    City = mongoose.model('City');

/**
 * Get awesome things
 */
exports.list= function(req, res) {

    City.find({region:req.params.region})
       .sort('-index')
        .select('name index country region')
        .exec(function (err, result){
            if (err)
                return res.json(err);
            else {

                return res.json(result);
            }
        })
}


exports.get= function(req, res) {
    //console.log(req.body);
    City.findById(req.params.id,function (err, result) {
        if (err) return res.json(err);

        res.json(result);
    })

}

exports.add= function(req, res) {
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    console.log(req.body);
    var city = new City(req.body);
    var upsertData = city.toObject();
    delete upsertData._id;
    //console.log(brand);
    City.update({_id: city.id}, upsertData, {upsert: true}, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })

}


exports.delete = function(req,res){
    City.findByIdAndRemove(req.params.id, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })

}




