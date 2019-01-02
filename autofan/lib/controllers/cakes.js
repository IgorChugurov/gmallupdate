'use strict';
var async = require('async');
var fs = require('fs');
var rimraf = require('rimraf');
var im = require('imagemagick');

var mongoose = require('mongoose'),
    async = require('async')
    , extend = require('util')._extend
    ,Cakes = mongoose.model('Cakes');



/**
 * Get awesome things
 */
exports.list= function(req, res) {
    //console.log(req.params);
    var option={};
    if (req.params.section!='allcakes')
        option={group : req.params.section }
    Cakes.find(option)
        .sort('-index')
        .select('name')
        .exec(function (err, result){
            if (err)
                return res.json(err);
            else {
                return res.json(result);
            }
        })

      /*Cakes.find({group : req.params.section },{
             index: 1 //Sort by index DESC
         },function (err, result){
          if (err)
              return res.json(err);
          else {
              return res.json(result);
          }
      })*/

}


exports.get= function(req, res) {
    //console.log(req.body);
    Cakes.findById(req.params.id,function (err, result) {
        if (err) return res.json(err);

        res.json(result);
    })

}

exports.add= function(req, res) {
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    var cake = new Cakes(req.body);
    var upsertData = cake.toObject();
    delete upsertData._id;
    Cakes.update({_id: cake.id}, upsertData, {upsert: true}, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })

}

exports.deleteCake = function(req,res){
    var cake;
    async.series([
        function(callback){
            Cakes.findById(req.params.id,function(err,result){
                if (err)
                    callback(err);
                else{
                    cake = result;
                    //console.log(cake);return;
                    callback(null);
                }
            })
        },
        function(callback){
           callback(null)
        }
    ], function (err, results) {
            var folder =  './app/images/cakes/' + req.params.id;
            if (fs.existsSync(folder)) {
                rimraf(folder, function(error) {console.log(error);});
                console.log('Yes')
            }
            else
                console.log('no');

            cake.remove(function (err) {
                if (err)
                    res.json(err)
                else
                    res.json({});
            })

        })
    /*Cakes.findByIdAndRemove(req.params.id, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })*/

}

exports.fileUpload = function(req, res){
    var cake;
    setTimeout(
        function () {

            res.setHeader('Content-Type', 'text/html');
            if (req.files.length == 0 || req.files.file.size == 0)
                res.send({ msg: 'No file uploaded at ' + new Date().toString() });
            else {
                //удаление файла есле есть
                var file = req.files.file;
                var tmp_path = req.files.file.path;
                // set where the file should actually exists - in this case it is in the "images" directory

                var folder =  './app/images/cakes/' + req.body.id;
                var target_path = folder+'/' + req.files.file.name;

                var target_pathQ = '/images/cakes/'+ req.body.id+'/' + req.files.file.name;

                async.series([
                    function(callback){
                        Cakes.findById(req.body.id,function(err,result){
                            if (err)
                                callback(err);
                            else{
                                cake = result;
                                //console.log(cake);return;
                                callback(null);
                            }
                        })

                    },
                    function(callback){
                        if (!fs.existsSync(folder)) {
                            fs.mkdir(folder, function(error) {
                                if (error)
                                    callback(error);
                                else
                                    callback(null);
                            });
                        } else
                            callback(null);
                    },
                    function(callback){
                        fs.rename(tmp_path, target_path, function(err) {
                            if (err)
                                callback(err);
                            im.resize({
                                srcPath: target_path,
                                dstPath: target_path,
                                width:   450
                            }, function(err, stdout, stderr){
                                if (err)
                                    callback(err);
                                else
                                    callback(null);
                            });

                        });

                    },
                    function(callback){
                        //console.log(cake);
                        if (cake.img ){
                            fs.unlink('./app'+cake.img, function (err) {
                                                    if (err)
                                                        console.log(err)
                                                    else{
                                                        console.log('successfully deleted '+cake.img);

                                                    }
                                                    callback(null);
                                                });
                        } else
                            callback(null);

                    },function(cb){
                        cake.img=target_pathQ;
                        cake.save(function(err) {
                            if (err) { cb(err); }
                            else
                                cb(null)

                        });
                   }
                ], function (err, results) {

                    if (err)
                        res.json(err);
                    else
                        res.json(results);
                })



            }
        },
        (req.param('delay', 'yes') == 'yes') ? 200 : -1
    );

}


exports.fileUploadGallery = function(req, res){
    var cake;
    setTimeout(
        function () {
            res.setHeader('Content-Type', 'text/html');
            if (req.files.length == 0 || req.files.file.size == 0)
                res.send({ msg: 'No file uploaded at ' + new Date().toString() });
            else {
                var file = req.files.file;
                var tmp_path = req.files.file.path;
                // set where the file should actually exists - in this case it is in the "images" directory

                var folder =  './app/images/cakes/' + req.body.id;

                var target_path = folder+'/'  + 'img'+ req.files.file.name;
                var thumb_target_path = folder+'/' +'thumb'+ req.files.file.name;

                var target_pathQ = '/images/cakes/'+ req.body.id+'/' + 'img' +req.files.file.name;
                var thumb_target_pathQ = '/images/cakes/'+req.body.id+'/'+'thumb'+  req.files.file.name;

                if (!fs.existsSync(folder)) {
                    fs.mkdir(folder, function(error) {
                        console.log(error);
                    });
                }
                fs.rename(tmp_path, target_path, function(err) {
                    im.resize({
                        srcPath: target_path,
                        dstPath: target_path,
                        width:   850
                    }, function(err, stdout, stderr){
                        if (err) throw err;
                        im.resize({
                            srcPath: target_path,
                            dstPath: thumb_target_path,
                            width:   440
                        }, function(err, stdout, stderr){
                            if (err) throw err;
                            //запись в бд
                            var gallery={
                                thumb:thumb_target_pathQ,
                                img:  target_pathQ,
                            };
                            //gallery = JSON.stringify(gallery);
                            Cakes.findById(req.body.id,function(err,cake){
                                if (err) console.log(err);
                                if(!cake.gallery) cake.gallery=[];
                                cake.gallery.push(gallery);
                                cake.save(function(err) {res.json(err)})
                            })
                        });
                    });

                });
            }
        },
        (req.param('delay', 'yes') == 'yes') ? 200 : -1
    );

}

exports.fileGalleryDelete = function(req, res){

    var id = req.params.id;
    var photo,
        photoId = parseInt(req.params.index);

                    Cakes.findById(id,function(err,cake){
                        if (err) { res.json(err);}
                        //console.log(cake);
                        if(cake.gallery) {
                            photo = cake.gallery[photoId];
                            //console.log(photo);
                            var thumbfile = './app'+photo.thumb;
                            var imgfile =  './app'+photo.img;

                            fs.unlink(thumbfile, function (err) {
                                if (err)
                                    console.log(err)
                                else
                                    console.log('successfully deleted '+photo.thumb);
                            });
                            fs.unlink(imgfile, function (err) {
                                if (err)
                                    console.log(err)
                                else
                                    console.log('successfully deleted '+photo.img);
                            });
                            cake.gallery.splice(photoId,1);
                            cake.save(function(err) {res.json(err)})
                        } else
                            res.json({});

                    })


}


