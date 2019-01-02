'use strict';
var async = require('async');
var fs = require('fs');
var rimraf = require('rimraf');
var im = require('imagemagick')
    ,mongoose = require('mongoose')
    ,extend = require('util')._extend
    ,Category = mongoose.model('Category')
    ,BrandTags = mongoose.model('BrandTags')
    ,Brand = mongoose.model('Brand');



/**
 * Get awesome things
 */
exports.list= function(req, res) {

    Brand.find()
       .sort('-index')
        .select('name index categories')
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
    //console.log(req.body);
    Brand.load(req.params.id,function (err, result) {
        if (err) return res.json(err);

        res.json(result);
    })

}

exports.add= function(req, res) {
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    console.log(req.body);
    var brand = new Brand(req.body);
    var upsertData = brand.toObject();
    delete upsertData._id;
    console.log(brand);
    Brand.update({_id: brand.id}, upsertData, {upsert: true}, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })

}

function deleteCategoriesFromBrand(brand){
    console.log(brand);
    if (!brand.categories || brand.categories.length<1) return;
    brand.categories.forEach(function(el){
        Category.findById(el,function (err, category) {
            if (err) console.log(err);
            if (category.brands && category.brands.length>0){
                var i =category.brands.indexOf(brand._id);
                if (i>-1){
                    category.brands.splice(i,1);
                    category.save();
                }
            }
        })
    })
}

exports.delete = function(req,res){
    var brand;
    async.series([
        function(callback){
            Brand.findById(req.params.id,function(err,result){
                if (err)
                    callback(err);
                else{
                    brand = result;
                    //console.log(cake);return;
                    callback(null);
                }
            })
        },

    ], function (err, results) {
            var folder =  './app/images/brand/' + req.params.id;
            if (fs.existsSync(folder)) {
                rimraf(folder, function(error) {console.log(error);});
                console.log('Yes')
            }
            else
                console.log('no');
            deleteCategoriesFromBrand(brand);
            brand.remove(function (err) {
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
    var brand;
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

                var folder =  './app/images/brand/' + req.body.id;
                var target_path = folder+'/' + req.files.file.name;

                var target_pathQ = '/images/brand/'+ req.body.id+'/' + req.files.file.name;

                async.series([
                    function(callback){
                        Brand.findById(req.body.id,function(err,result){
                            if (err)
                                callback(err);
                            else{
                                brand = result;
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
                        if (brand.img ){
                            fs.unlink('./app'+brand.img, function (err) {
                                                    if (err)
                                                        console.log(err)
                                                    else{
                                                        console.log('successfully deleted '+brand.img);

                                                    }
                                                    callback(null);
                                                });
                        } else
                            callback(null);

                    },function(cb){
                        brand.img=target_pathQ;
                        brand.save(function(err) {
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


exports.tag_get = function(req,res){
    console.log(req.params);
    BrandTags.findById(req.params.id,function (err, tag) {
        if (err) return res.json(err);
        //issue.articles.id(req.params.id);
        //console.log();
        res.json(tag);

        // res.json(result);
    })

}
exports.tag_list = function(req,res){
    //console.log(req.params.brand);
    BrandTags.find(
        {brand:req.params.brand},'name',
        {sort:{ 'index': -1}},
        function (err, tags) {
        if (err) return res.json(err);
        //issue.articles.id(req.params.id);
        //console.log();
        res.json(tags);

        // res.json(result);
    })

}

exports.tag_delete = function(req,res){
    //console.log(req.params);
    Brand.findById(req.params.brand)
        .select('tags')
        .exec(function (err, brand){
            var i = brand.tags.indexOf(req.params.id);
            if (i>-1){
                brand.tags.splice(i,1);
                brand.save();
            }
        })
    BrandTags.findByIdAndRemove(req.params.id,function (err) {
        if (err) return res.json(err);
        res.json({});
    })
}
exports.tag_add = function(req,res){
    console.log(req.body);

    var tag = new BrandTags(req.body);
    var upsertData = tag.toObject();
    delete upsertData._id;
    BrandTags.update({_id: tag.id}, upsertData, {upsert: true}, function (err) {
        //console.log(err);
        if (err) return res.json(err);
        // saved!
        res.json({});
    })
    Brand.findById(req.body.brand)
        .select('tags')
        .exec(function (err, brand){
            var i = brand.tags.indexOf(tag.id);
            if (i<=-1){
                brand.tags.push(tag.id);
                brand.save();
            }
        })


}
exports.fileUploadCollection = function(req, res){
    var brandTag;
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

                var folder =  './app/images/brandTag/' + req.body.id;
                var target_path = folder+'/' + req.files.file.name;

                var target_pathQ = '/images/brandTag/'+ req.body.id+'/' + req.files.file.name;

                async.series([
                    function(callback){
                        BrandTags.findById(req.body.id,function(err,result){
                            if (err)
                                callback(err);
                            else{
                                brandTag = result;
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
                        if (brandTag.img ){
                            fs.unlink('./app'+brandTag.img, function (err) {
                                if (err)
                                    console.log(err)
                                else{
                                    console.log('successfully deleted '+brandTag.img);

                                }
                                callback(null);
                            });
                        } else
                            callback(null);

                    },function(cb){
                        brandTag.img=target_pathQ;
                        brandTag.save(function(err) {
                            if (err) { cb(err); }
                            else
                                cb(null,brandTag)

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



