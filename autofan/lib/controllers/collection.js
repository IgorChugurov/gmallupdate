'use strict';
var mongoose = require('mongoose');
var domain = require('domain');
var ObjectID = mongoose.Types.ObjectId;
var rimraf = require('rimraf');
var im = require('imagemagick');
var async = require('async');
var fs = require('fs')
, util = require('util');
//var multiparty = require('multiparty');
/*var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({defer: true})*/
var Busboy = require('busboy'),
inspect = require('util').inspect;
//var fs = require('fs');
//var gm = require('gm');
var exec = require('child_process').exec;


exports.list = function(req, res, next) {
    var d = domain.create();
    d.on('error', function(error) {
        error.collectionName=req.collectionName;
        next(error)
    });
    d.run(function () {
        var page = (req.query['page'] > 0 ? req.query['page'] : 0);
        var perPage = (req.query.perPage && parseInt(req.query.perPage)>0)?parseInt(req.query.perPage):150;
        var options = {
            perPage: perPage,
            page: page,
            criteria:null
        }

        if (req.query.query) {
            //console.log(req.query);
            if (typeof req.query.query == "string"){
                options.criteria=JSON.parse(req.query.query);
            }
            if (options.criteria['$and']){
                for (var i= 0,l=options.criteria['$and'].length;i<l;i++){
                    for (var key in options.criteria['$and'][i]){
                        if (key=='artikul'){
                            options.criteria['$and'][i][key]=RegExp(options.criteria['$and'][i][key] , "i")
                        }
                    }
                }

            } else if (options.criteria.artikul) {
                options.criteria.artikul = RegExp(options.criteria.artikul , "i")
            }



           //console.log('aaa',options.criteria);
        }

    // даты
        if (req.query && req.query.dtfrom && req.query.dtto){
            var start=new Date(req.query.dtfrom);
            var  end =new Date(req.query.dtto);
            var queryDate = {date: {
                $gte:start,
                $lte: end
            }};
        } else {
            var date = new Date();
            date.setDate(date.getDate() - 1);
            var from = date.setHours(0,0,0);
            var to   = date.setHours(23,59,59);
            /*var start=new Date(from);
             var  end =new Date(to);*/
            var queryDate = {date: {
                $gte:from,
                $lte: to
            }};
        }
        if (queryDate){
            options.dateRange=queryDate;
        }
            //if (req.query && req.query.searchStr) {

        // для поиска
        /*if (req.query && req.query.query){

        }*/

        //}    //console.log('options.criteria - ',options.criteria);
        req.collection.list(options,function(e, results){
           // console.log(e);
            // console.log(results);
            if (e) return next(e)
            if (page==0){
                req.collection.count(options.criteria).exec(function (err, count) {
                    //console.log(count);
                    if (results.length>0){
                        results.unshift({'index':count});
                    }
                    return res.json(results)
                })
            } else {
                return res.json(results)
            }
        },req)
    })
}

exports.save = function(req, res, next) {

    if (!req.user || (req.user.role!='admin' && req.user.role!='brandAdmin')){
        console.log('че за хрень',req.user.role);

        return next(new Error('нет прав'))
    }
    if (req.user.role=='brandAdmin' && req.collectionName!='Stuff'){
        return next(new Error('недостаточно прав'))
    }
    if (req.user.role=='brandAdmin' && req.collectionName=='Stuff' && req.body.brand && req.user.brand!==req.body.brand){
        return next(new Error('недостаточно прав.'))
    }
   // console.log('query - ',req.query)
   /*console.log(req.body);
    console.log('query - ',req.query)
    return;*/
    //console.log(req.body);
    var d = domain.create();
    d.on('error', function(error) {
        error.collectionName=req.collectionName;
        return next(error)
    });
    d.run(function () {
       // console.log(req.query); return next();

        function insert(){
            var stuff,upsertData;
            stuff = new req.collection(req.body);
            upsertData = stuff.toObject();
            delete upsertData._id;
            console.log(upsertData);
            req.collection.update({_id: stuff.id}, upsertData, {upsert: true}, function (err,result) {
                if (err) return  next(err)
                //если комментарий то вставляем ссылку на id thread parent-а
                if (req.collection.postUpdate && typeof req.collection.postUpdate === 'function'){
                    req.collection.postUpdate(stuff);
                }
                res.json({id:stuff.id});
            })
        }
        // todo убрать в модель комментариев
        if (req.collectionName=="Comment" && req.body.text){
            req.body.text=req.body.text.substring(0,500);
        }

        function updateStuff(id,newVal,cb){
            req.collection.update({_id:id},{$set:newVal}, function (err,result) {
                if (err) return  next(err)
               // console.log(result);
                cb(null,{id:req.body._id})
            })
        }


        if (req.query.update){
            //console.log('query - ',req.query)
            var arr = req.query.update.split(' ');
            //console.log(req.query.retail,req.query.price);

            if (req.query.retail || req.query.price){

                var newPr={};
                var plus= JSON.parse(req.query.plus)
                var sum= JSON.parse(req.query.sum);
                //console.log(plus);
                newPr['retail'] = parseFloat(req.query.retail);
                newPr['price'] = parseFloat(req.query.price);
                // работа с группой товаров
                //console.log('работа с группой товаров');
                req.collection.find({_id:{$in:req.body}})
                    .exec(function(err,docs){
                        //console.log(docs);
                        if (err) return next(err);
                        async.each(docs,function(el,callback){
                            //console.log(el.brand,req.user.brand);
                            if (req.user.role=='brandAdmin' && String(el.brand)!=String(req.user.brand)){
                                console.log(el.brand,req.user.brand);
                                return callback();
                            }
                            //console.log(el);
                            newVal={};
                            for (var i= 0,l=arr.length;i<l;i++){
                                if (el[arr[i]]) {
                                    if (sum){
                                        if (plus){
                                            newVal[arr[i]]= el[arr[i]]+newPr[arr[i]];
                                        } else {
                                            newVal[arr[i]]= el[arr[i]]-newPr[arr[i]];
                                        }
                                    } else {
                                        if (plus){
                                            //console.log(Math.round((el[arr[i]]*newPr[arr[i]])/100));
                                            newVal[arr[i]]= el[arr[i]]+Math.round((el[arr[i]]*newPr[arr[i]])/100);
                                        } else {
                                            newVal[arr[i]]= el[arr[i]]-Math.round((el[arr[i]]*newPr[arr[i]])/100);
                                        }
                                    }


                                }
                            }

                            updateStuff(el._id,newVal,function(){
                               // console.log(newVal);
                                callback();
                            });
                        },function(err){
                            res.json({msg:'ok'})
                        })
                        //console.log(res);
                    })
            } else {
                var newVal ={};
                for (var i= 0,l=arr.length;i<l;i++){
                    if (req.body[arr[i]]){newVal[arr[i]]= req.body[arr[i]];} else {console.log('нет - ',arr[i])}
                }
                updateStuff(req.body._id,newVal,function(err,mess){
                    res.json(mess);
                });
            }

            /*console.log(newVal,req.body._id);
            return res.json(arr);*/



        } else {

            if (req.collection.preUpdate && typeof req.collection.preUpdate === 'function'){
                req.collection.preUpdate(req.body,function(err,res){
                    if (err) return next(err);
                    insert();
                },req);
            } else {
                insert();
            }
        }


    })
}

exports.get = function(req, res, next) {
    var d = domain.create();
    d.on('error', function(error) {
        error.collectionName=req.collectionName;
        return next(error)
    });

    d.run(function () {
        if (!req.params.id) next();
        var id = new ObjectID(req.params.id);
        req.collection.load(id, function(e, result){
            //console.log(res.st);
            if (e) return next(e)
            res.send(result)
        })
    })
}

/*exports.update = function(req, res, next) {
    var d = domain.create();
    d.on('error', function(error) {
        error.collectionName=req.collectionName;
        return next(error)
    });
    d.run(function () {

        req.collection.update({_id: new ObjectID(req.params.id)},
            {$set: req.body},
            {safe: true, multi: false}, function(e, result){
                if (e) return next(e)
                res.send((result === 1) ? {msg:'success'} : {msg:'error'})
            })
    })
}*/

exports.delete = function(req, res, next) {
    if (!req.user || req.user.role!='admin'){

        next(new Error('нет прав'))
    }
    var d = domain.create();
    d.on('error', function(error) {
        error.collectionName=req.collectionName;
        return next(error)
    });
    d.run(function () {
        req.collection.findById(req.params.id,function(err,result){
            if (err) return next(err)
            if (req.query.file){
                if (req.query.file=='file'){
                    if (result.img  && fs.existsSync('./app/'+result.img)){
                        fs.unlink('./app/'+result.img, function (err) {
                            if (err)
                                console.log(err)
                            else{
                                console.log('successfully deleted '+result.img);
                            }
                        });
                    }
                    result.img='';

                } else {

                    if (result[req.query.file]  && fs.existsSync('./app/'+result[req.query.file])){
                        fs.unlink('./app/'+result[req.query.file], function (err) {
                            if (err)
                                console.log(err)
                            else{
                                console.log('successfully deleted '+result[req.query.file]);
                            }
                        });
                    }
                    result[req.query.file]='';
                }
                result.save(function(err,result){
                    if (err) return next(err)
                    res.json({msg:'deleted file success'});
                })
            } else {
                var folder =  './app/images/'+req.collectionName+'/' + req.params.id;
                if (fs.existsSync(folder)) {
                    rimraf(folder, function(error) {
                        if (error) return next(error);
                        // console.log('Yes')
                    });

                }
                req.collection.remove({_id: new ObjectID(req.params.id)}, function(e, resultDelete){
                    if (e) return next(e)

                    if (req.collection.postDelete && typeof req.collection.postDelete === 'function'){
                        req.collection.postDelete(result);
                    }
                    res.json((resultDelete === 1) ? {msg:'success'} : {msg:'error'})
                })
            }






        });

    })

}

exports.fileUpload = function(req, res, next) {
    console.log(req.body);
    var d = domain.create();
    d.on('error', function(error) {
        error.collectionName=req.collectionName;
        return next(error)
    });
   d.run(function () {
        var stuff;
        setTimeout(
            function () {
                res.setHeader('Content-Type', 'text/html');
                //console.log(req.files);
                if (req.files.length == 0 || !req.files.file||req.files.file.size == 0) {
                    res.send({ msg: 'No file uploaded at ' + new Date().toString() });
                } else {

                    var file = req.files.file;
                    var tmp_path = req.files.file.path;
                    // set where the file should actually exists - in this case it is in the "images" directory
                    var folder =  './app/images/'+req.collectionName+'/' + req.body.id;
                    var target_path = folder+'/' + req.files.file.name;
                    // для записи в поле  IMG объекта
                    var target_pathQ = '/images/'+req.collectionName+'/'+ req.body.id+'/' + req.files.file.name;

                    async.series([
                        function(callback){
                            req.collection.findById(req.body.id,function(err,result){
                                if (err)
                                    callback(err);
                                else{
                                    stuff = result;
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
                            console.log(stuff);
                            if (stuff.img  && fs.existsSync('./app/'+stuff.img)){
                                fs.unlink('./app/'+stuff.img, function (err) {
                                    if (err)
                                        console.log(err)
                                    else{
                                        console.log('successfully deleted '+stuff.img);
                                    }
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
                        function(cb){
                            stuff.img=target_pathQ;
                            stuff.save(function(err) {
                                if (err) { cb(err); }
                                else
                                    cb(null)
                            });
                        }
                    ], function (err, results) {
                        if (err)
                            return next(err)
                        else
                            res.json({img:stuff.img});
                    })
                }
            },
            (req.param('delay', 'yes') == 'yes') ? 200 : -1
        );
   })


}
exports.fileUploadBig = function(req, res, next) {
    //console.log(req.body); return;
    var d = domain.create();
    d.on('error', function(error) {
        error.collectionName=req.collectionName;
        return next(error)
    });
    d.run(function () {
        var stuff;
        setTimeout(
            function () {
                res.setHeader('Content-Type', 'text/html');
                //console.log(req.files);
                if (req.files.length == 0 || !req.files.file||req.files.file.size == 0) {
                    res.send({ msg: 'No file uploaded at ' + new Date().toString() });
                } else {

                    var file = req.files.file;
                    var tmp_path = req.files.file.path;
                    // set where the file should actually exists - in this case it is in the "images" directory
                    var folder =  './app/images/'+req.collectionName+'/' + req.body.id;
                    var target_path = folder+'/' + req.files.file.name;
                    // для записи в поле  IMG объекта
                    var target_pathQ = '/images/'+req.collectionName+'/'+ req.body.id+'/' + req.files.file.name;

                    async.series([
                        function(callback){
                            req.collection.findById(req.body.id,function(err,result){
                                if (err)
                                    callback(err);
                                else{
                                    stuff = result;
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
                            console.log(stuff);
                            if (stuff.img  && fs.existsSync('./app/'+stuff.img)){
                                fs.unlink('./app/'+stuff.img, function (err) {
                                    if (err)
                                        console.log(err)
                                    else{
                                        console.log('successfully deleted '+stuff.img);
                                    }
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
                                    width:   1200
                                }, function(err, stdout, stderr){
                                    if (err)
                                        callback(err);
                                    else
                                        callback(null);
                                });

                            });

                        },
                        function(cb){
                            stuff.img=target_pathQ;
                            stuff.save(function(err) {
                                if (err) { cb(err); }
                                else
                                    cb(null)
                            });
                        }
                    ], function (err, results) {
                        if (err)
                            return next(err)
                        else
                            res.json({img:stuff.img});
                    })
                }
            },
            (req.param('delay', 'yes') == 'yes') ? 200 : -1
        );
    })


}

exports.fileUploadFullImg = function(req, res, next) {
    //console.log(req.body); return;
    var d = domain.create();
    d.on('error', function(error) {
        error.collectionName=req.collectionName;
        return next(error)
    });
    d.run(function () {
        var stuff;
        setTimeout(
            function () {
                res.setHeader('Content-Type', 'text/html');
                //console.log(req.files);
                if (req.files.length == 0 || !req.files.file||req.files.file.size == 0) {
                    res.send({ msg: 'No file uploaded at ' + new Date().toString() });
                } else {

                    var file = req.files.file;
                    var tmp_path = req.files.file.path;
                    // set where the file should actually exists - in this case it is in the "images" directory
                    var folder =  './app/images/'+req.collectionName+'/' + req.body.id;
                    var target_path = folder+'/' + req.files.file.name;
                    // для записи в поле  IMG объекта
                    var target_pathQ = '/images/'+req.collectionName+'/'+ req.body.id+'/' + req.files.file.name;

                    async.series([
                        function(callback){
                            req.collection.findById(req.body.id,function(err,result){
                                //console.log(result);
                                if (err)
                                    callback(err);
                                else{
                                    stuff = result;
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
                            //console.log(stuff);
                            if (stuff.img  && fs.existsSync('./app/'+stuff.img)){
                                fs.unlink('./app/'+stuff.img, function (err) {
                                    if (err)
                                        console.log(err)
                                    else{
                                        console.log('successfully deleted '+stuff.img);
                                    }
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
                                    width:   1920
                                }, function(err, stdout, stderr){
                                    if (err)
                                        callback(err);
                                    else
                                        callback(null);
                                });

                            });

                        },
                        function(cb){
                            stuff.img=target_pathQ;
                            stuff.save(function(err) {
                                if (err) { cb(err); }
                                else
                                    cb(null)
                            });
                        }
                    ], function (err, results) {
                        if (err)
                            return next(err)
                        else
                            res.json({img:stuff.img});
                    })
                }
            },
            (req.param('delay', 'yes') == 'yes') ? 200 : -1
        );
    })


}

exports.fileUploadGallery = function(req, res,next){
    //var form = new multiparty.Form({defer: true});
    //console.log('***********************************************')
    //console.log(req.body);
    //console.log('***********************************************')
    //res.send(200)
    var stuff;
    var upload=
        function () {
            res.setHeader('Content-Type', 'text/html');
            console.log(req.files);
            if (req.files.length == 0 || !req.files.file|| !req.files.file.size || req.files.file.size == 0)
                res.send({ msg: 'No file uploaded at ' + new Date().toString() });
            else {
                var file = req.files.file;
                //console.log(file);
                var tmp_path = req.files.file.path;
                // set where the file should actually exists - in this case it is in the "images" directory

                var folder =  './app/images/'+req.collectionName+'/' + req.body.id;

                var target_path = folder+'/'+ req.files.file.name;
                var target_pathDest=folder+'/'  + 'img'+ req.files.file.name;
                var thumb_target_path = folder+'/' +'thumb'+ req.files.file.name;
                var thumbSmall_target_path =folder+'/' +'thumbSmall'+ req.files.file.name;
                var target_pathQ = '/images/'+req.collectionName+'/'+ req.body.id+'/' + 'img' +req.files.file.name;
                var thumb_target_pathQ = '/images/'+req.collectionName+'/'+req.body.id+'/'+'thumb'+  req.files.file.name;
                var thumbSmall_target_pathQ = '/images/'+req.collectionName+'/'+req.body.id+'/'+'thumbSmall'+  req.files.file.name;

                async.series([
                    function(callback){
                        //console.log(1,req.body);
                        if (!fs.existsSync(folder)) {
                            fs.mkdir(folder, function(error) {
                                if (error) return next(error);
                                callback();
                            });
                        } else {
                            callback();
                        }
                    },
                    function(callback){
                        //console.log(2,req.body);
                        fs.rename(tmp_path, target_path, function(err) {
                            if (err) return next(err);
                            callback();
                        });
                    },
                    function(callback){
                        //console.log(44);
                        var cmd = 'convert '+target_path+' -resize 1400 '+target_pathDest;
                        console.log(cmd);
                        exec(cmd, {encoding: 'binary', maxBuffer: 5000*1024}, function(error, stdout) {
                            console.log('error - ',error)
                            if (error) return callback(error);
                            callback();
                            //fs.writeFileSync(target_pathDest, stdout, 'binary');
                        });
                        //console.log(thumb_target_path);
                        //console.log(target_path);
                        /*gm(target_path).resize(1000).write(writeStream, function (err) {
                         if (!err) console.log(' hooray! ');
                         });*/
                        /*im.resize({
                                srcPath: target_path,
                                //dstPath: target_pathDest,
                                width:   1200,
                                maxBuffer:5000*1024,
                                timeout:500
                            },
                            function(err, stdout, stderr){
                                console.log(err);
                                //console.log(stderr);
                                if (err) return next(err);
                                fs.writeFileSync(target_pathDest, stdout, 'binary');
                                console.log('resized kittens.jpg to fit within 256x256px')
                                callback();
                            })*/


                    },
                    function(callback){
                        //console.log(3,req.body);
                        if (req.body.index){
                            //console.log(thumbSmall_target_path);
                            //console.log(target_path);
                            im.resize({
                                    srcPath: target_path,
                                    dstPath: thumbSmall_target_path,
                                    width:   150
                                },
                                function(err, stdout, stderr){
                                    if (err) return next(err);
                                    callback();
                                })
                        } else {callback()}

                    },
                    function(callback){
                        //console.log(3);
                        //console.log(thumb_target_path);
                        //console.log(target_path);
                        im.resize({
                                srcPath: target_path,
                                dstPath: thumb_target_path,
                                width:   600

                            },
                            function(err, stdout, stderr){
                                if (err) return next(err);
                                callback();
                            })
                    },

                    function(callback){
                        function getIndex(index){
                            return index || 1;
                        }
                        //console.log(5);
                        var index =getIndex(req.body.index);
                        if (!index || index=='undefined'){
                            index=1;
                        }
                        index= getIndex(index);
                        //var small= (req.body.index==100)?thumbSmall_target_pathQ:'';
                        var small= thumbSmall_target_pathQ;
                        var link=(req.body.link)?req.body.link.substring(0,200):'';
                        var gallery={
                            thumb:thumb_target_pathQ,
                            thumbSmall:small,
                            img:  target_pathQ,
                            index:index,
                            link:link
                        };
                        //console.log(index);
                        req.collection.findById(req.body.id,function(err,stuff){
                            if (err) return next (err);
                            if(!stuff.gallery) stuff.gallery=[];
                            stuff.gallery.push(gallery);
                            //console.log(stuff.gallery);
                            stuff.save(function(err) {
                                if (err) return(err);
                                callback(null,stuff.gallery);
                            })
                        })
                    }
                ], function (err, results) {
                    //console.log(6);

                    if (err)
                        return next(err)
                    else
                    //console.log(results)
                        fs.unlink(target_path, function(error) {
                            if (error) return next(error);
                            res.json({msg:"загружено!",gallery:results[5]});
                        });
                        //res.json({msg:"загружено!",gallery:results[5]});

                })

            }
        }

    var size = '';
    var fileName = '';
    /*form.on('part', function(part){
        if(!part.filename) return;
        size = part.byteCount;
        fileName = part.filename;
    });
    form.on('file', function(name,file){
        console.log(file.path);
        console.log(__dirname);
        console.log('filename: ' + fileName);
        console.log('fileSize: '+ (size / 1024));
        var tmp_path = file.path
        var target_path = __dirname + './uploads/fullsize/' + fileName;
        //var thumbPath = __dirname + '/uploads/thumbs/';
        fs.renameSync(tmp_path, target_path, function(err) {
            if(err) console.error(err.stack);
        });
        res.redirect('/uploads/fullsize/' + fileName);
        console.log(target_path);
        //gm(tmp_path)
         //.resize(150, 150)
         //.noProfile()
         //.write(thumbPath + 'small.png', function(err) {
         //if(err) console.error(err.stack);
         //});
    });*/
    /*global.reqId = (global.reqId || 0) + 1
    var c = 0;
    console.log(global.reqId + ' h: ' + JSON.stringify(req.headers))
    req.on('data', function(chunk) {
        // you can write this to a file as well
        console.log(global.reqId + ' c' + (c++) + ': ' + chunk.toString('hex'))
    })*/
    //form.parse(req);
    /*form.parse(req, function(err, fields, files) {
        console.log(err);
        console.log(fields)
        console.log(files);

        //upload();

    });*/
    //upload();
    var up = function(){

        var busboy = new Busboy({ headers: req.headers });
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
            file.on('data', function(data) {
                console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
            });
            file.on('end', function() {
                console.log('File [' + fieldname + '] Finished');
            });
        });
        busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
            console.log('Field [' + fieldname + ']: value: ' + inspect(val));
        });
        busboy.on('finish', function() {

            upload();
            /*console.log('Done parsing form!');
            res.writeHead(303, { Connection: 'close', Location: '/' });
            res.end();*/
        });
        req.pipe(busboy)
    }

    up();

}

exports.fileGalleryDelete = function(req, res,next){
    //console.log(req.params);
    var id = req.params.id;
    var photo,
        photoId = req.params.index;

    req.collection.findById(id,function(err,stuff){
        if (err) { next(err);}
        //console.log(cake);
        if(stuff.gallery) {
            photo = stuff.gallery.id(photoId);
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
            stuff.gallery.id(photoId).remove();
            stuff.save(function(err) {
                if (err){ next(err)}
                res.json({msg:'удалено!',gallery:stuff.gallery});

            })
        } else
            res.json({msg:'нечего удалять!!'});

    })


}


exports.updateGallery = function(req, res,next) {
   //console.log(req.params);
    var id = req.params.id;
    var gallery = req.body.gallery;
    req.collection.findById(id,function(err,stuff){
        /*console.log(stuff);
        console.log(err)*/
        if (err) next(err);
        if (stuff){
            stuff.gallery=gallery;
            stuff.save(function(err){
                if (err) next(err);
                res.json({msg:'обновлено',gallery:gallery});
            });
            // stop here, otherwise 404
        } else {
            // send 404 not found
            res.json({msg:'нет объекта в базе'});
        }
    })
}
