'use strict';
var async = require('async');
var fs = require('fs');
var rimraf = require('rimraf');
var im = require('imagemagick');

var mongoose = require('mongoose'),
    async = require('async')
    ,extend = require('util')._extend
    ,Category = mongoose.model('Category')
    ,Brand = mongoose.model('Brand');

exports.list= function(req, res) {

    Category.find()
       .sort('index')
        .select('name index section brands filters desc')
        .exec(function (err, result){
            //console.log(result);
            if (err)
                return res.json(err);
            else {

                return res.json(result);
            }
        })
}


exports.get= function(req, res) {
    console.log(req.params);
    Category.findById(req.params.id,function (err, result) {
        if (err) return res.json(err);
        console.log(result);
        res.json(result);
    })

}

function brandUpdate(category){
    //console.log(category);
    //if (!category.brands || category.brands.length<1) return;
    // 1.перебераем все бренды.
    // 2 .если id бренда есть в массиве брендов категории то
    // в массиве категорий бренда должен быть его id категории если нет то
    // он там должен отсутсвовать
    Brand.find()
        .sort('-index')
        .select('categories')
        .exec(function (err, brands){
            //console.log(result);
            if (err){
                console.log(err);
                return false;
            }
            else {
                var change;
                brands.forEach(function(el){
                    change=false;
                    var index =el.categories.indexOf(category._id);
                    if (category.brands.indexOf(el._id)>-1){
                        if (index<=-1){
                            el.categories.push(category._id);
                            change=true;
                        }
                    } else {
                        if (index>-1){
                           el.categories.splice(index,1);
                           change=true;
                        }
                    }
                    if (change)
                        el.save();
                })
                return true;
            }
        })

}

exports.add= function(req, res) {
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    //console.log(req.body);
    var category = new Category(req.body);
    var upsertData = category.toObject();
    delete upsertData._id;
    //console.log(category);
    brandUpdate(category);
    Category.update({_id: category.id}, upsertData, {upsert: true}, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })

}

function deleteBrandsFromCategories(category){
    if (!category.brands || category.brands.length<1) return;
    category.brands.forEach(function(el){
            Brand.findById(el,function (error, brand) {
                if (error) {
                    console.log(error);
                    res.send(null, 500);
                } else if (brand){
                    if (brand.categories && brand.categories.length>0){
                        var i =brand.categories.indexOf(category._id);
                        if (i>-1){
                            brand.categories.splice(i,1);
                            brand.save(function(error) {
                                if (error) {
                                    console.log(error);
                                    //res.send(null, 500);
                                } else {
                                    // send the records
                                    //res.send(records);
                                }
                            });
                            // stop here, otherwise 404
                            return;
                        }
                    }
                }
                // send 404 not found
               // res.send(null, 404);
                return;
            })
    })
}


exports.delete = function(req,res){
    var category;
    async.series([
        function(callback){
            Category.findById(req.params.id,function(err,result){
                if (err)
                    callback(err);
                else{
                    category = result;
                    callback(null);
                }
            })
        }

    ], function (err, results) {
            var folder =  './app/images/category/' + req.params.id;
            if (fs.existsSync(folder)) {
                rimraf(folder, function(error) {console.log(error);});
                console.log('Yes')
            }
            else
                console.log('no');
            deleteBrandsFromCategories(category);
            category.remove(function (err) {
                if (err)
                    res.json(err)
                else
                    res.json({});
            })

        })
}

exports.fileUpload = function(req, res){
    var category;
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

                var folder =  './app/images/category/' + req.body.id;
                var target_path = folder+'/' + req.files.file.name;

                var target_pathQ = '/images/category/'+ req.body.id+'/' + req.files.file.name;

                async.series([
                    function(callback){
                        Category.findById(req.body.id,function(err,result){
                            if (err)
                                callback(err);
                            else{
                                category = result;
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
                        if (category.img ){
                            fs.unlink('./app'+Category.img, function (err) {
                                                    if (err)
                                                        console.log(err)
                                                    else{
                                                        console.log('successfully deleted '+category.img);

                                                    }
                                                    callback(null);
                                                });
                        } else
                            callback(null);

                    },function(cb){
                        category.img=target_pathQ;
                        category.save(function(err) {
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


