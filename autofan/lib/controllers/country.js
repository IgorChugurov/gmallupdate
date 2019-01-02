'use strict';


var mongoose = require('mongoose'),
    Country = mongoose.model('Country'),
    Region =mongoose.model('Region');


/**
 * Get awesome things
 */
exports.list= function(req, res) {

    Country.find()
       .sort('-index')
        .select('name index')
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
    Country.findById(req.params.id,function (err, result) {
        if (err) return res.json(err);

        res.json(result);
    })

}

exports.add= function(req, res) {
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    console.log(req.body);
    var country = new Country(req.body);
    var upsertData = country.toObject();
    delete upsertData._id;
    //console.log(brand);
    Country.update({_id: country.id}, upsertData, {upsert: true}, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })

}


exports.delete = function(req,res){
    Country.findById(req.params.id,function(err,country){
        if (err)  res.json(err);
        //console.log(country);
        Region.find({country:req.params.id})
            .exec(function (err, regions){
                if (err) return res.json(err);
                //console.log(regions);
                if (regions.length<=0){
                    country.remove(function (err) {
                        if (err)
                            res.json(err)
                        else
                            res.json({});
                    })
                } else {
                    res.json({'error':'There are regions for this country!'});
                }
            })

        country.remove(function (err) {
            if (err)
                res.json(err)
            else
                res.json({});
        })
    });

    /*Cakes.findByIdAndRemove(req.params.id, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })*/

}




