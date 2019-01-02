'use strict';


var mongoose = require('mongoose'),
    Stuff = mongoose.model('Stuff'),
    _=require('underscore'),
    Comment = mongoose.model('Comment');

/**
 * Get awesome things
 */
exports.list= function(req, res) {

   /* City.find({region:req.params.region})
       .sort('-index')
        .select('name index country region')
        .exec(function (err, result){
            if (err)
                return res.json(err);
            else {

                return res.json(result);
            }
        })*/
}


exports.get= function(req, res) {
    //console.log(req.body);
    Comment.findById(req.params.id)
        .populate('author','name')
        .exec(function (err, result) {

        if (err) return res.json(err);

        res.json(result);})


}

exports.add= function(req, res) {
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    console.log(req.body);
    var comment = new Comment(req.body);
    var upsertData = comment.toObject();
    delete upsertData._id;
    console.log(comment);

    Comment.update({_id: comment.id}, upsertData, {upsert: true}, function (err) {
        if (err) return res.json(err);
            Stuff.findById(comment.stuff,function(err,stuff){
                console.log(stuff.comments);
                console.log(comment.id);
                console.log(stuff.comments.indexOf(comment.id));
                if (stuff.comments.indexOf(comment.id)<=-1){
                    stuff.comments.push(comment.id);
                    stuff.save();
                }
                res.json({});
            })
    })

}


exports.delete = function(req,res){
    Comment.findById(req.params.id, function (err,doc) {
        Stuff.findById(doc.stuff,function(err,stuff){
            /*console.log(stuff.comments);
            console.log(comment.id);*/
            //console.log(stuff.comments.indexOf(comment.id));
            //var i = stuff.comments.indexOf(req.params.id);
            var i=stuff.comments.indexOf(req.params.id);
            if (i>-1){
                stuff.comments.splice(i,1)
               // console.log(stuff.comments);
                stuff.save();
            }
            doc.remove();
            res.json({});
        })
        /*if (err) return res.json(err);
        // saved!
        res.json({});*/
    })

}




