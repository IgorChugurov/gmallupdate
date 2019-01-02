'use strict';
String.prototype.insert = function (index, string) {
    //console.log(string);
    if (index > 0)
        return this.substring(0, index) + string + this.substring(index, this.length);
    else
        return string + this;
};
var mongoose = require('mongoose'),
    async = require('async'),
    //categories = require('../../data/categories.json'),
    rimraf = require('rimraf'),
    fs = require('fs'),
    im = require('imagemagick'),

    Goods = mongoose.model('Goods');

var moment = require('moment');


var path = "../../data/config.json";

/*if (require.cache[path]){
    console.log('delete');
    delete require.cache[path];
}*/
var  config = require(path);
//console.log(config);


/**
 * Get awesome things
 */
/*module.exports  = function(){
  function list(req, res) {
      Groups.find(function (err, result){
          if (err)
              return res.json(err);
          else {
              return res.json(result);
          }
      })
  }
  return {
      list:list
  }
}*/

exports.getConfig= function(req, res) {
    /*if (require.cache[path]){
        delete require.cache[path];
    }*/
    //var  config = require(path);
    return res.json(config);
};

exports.putConfig= function(req, res) {
    //console.log(req.body);
    fs.writeFile('./data/config.json', JSON.stringify(req.body), function (err,cfg) {
        if (err) return console.log(err);
        //config=req.body;
        if (require.cache['./data/config.json']){
            console.log('delete');
            delete require.cache[path];
        }
        config = require(path);
        /*delete require.cache[require.resolve('../../data/config.json')];
        config = require('../../data/config.json')*/
        return res.json(config);
    });

    //return res.json({});
};


exports.list  =
    function (req, res) {
        //console.log(config.perPage);
        Goods.find({'type':req.params.id})
            .sort('-date')
            .select('type name img desc index category date')
            .limit(config.perPage)
            .exec(function (err, result){
                if (err)
                    return res.json(err);
                else {
                    //console.log(result);
                    var goods = result.map(function(doc) {
                        return {'_id':doc._id,'type':doc.type,'name':doc.name,'img':doc.img,'desc':doc.desc,'index':doc.index,'category':doc.category,'date': moment(doc.modified).format('DD-MM-YYYY') }
                    });
                    return res.json(goods);
                }
            })

}

exports.get= function(req, res) {
    //console.log(req.params);
    Goods.findById(req.params.id)
        .select('type name img desc index category date comments')
        .exec(function (err, doc) {
            doc.com =doc.comments.map(function(doc) {
                return {'author':doc.author,'body':doc.body,'date': moment(doc.modified).format('DD-MM-YYYY') }
            });
            res.json({'_id':doc._id,'type':doc.type,'name':doc.name,'img':doc.img,'desc':doc.desc,'comments':doc.com,
                'index':doc.index,'category':doc.category,'date': moment(doc.modified).format('DD-MM-YYYY')});
        })
}

exports.add= function(req, res) {
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    //console.log(req.body);
    var good = new Goods(req.body);
    var upsertData = good.toObject();
    delete upsertData._id;
    Goods.update({_id: good.id}, upsertData, {upsert: true}, function (err) {
        if (err) return res.json(err);
        // saved!
        res.json({});
    })

}

exports.delete = function(req,res){
    Goods.findById(req.params.id,function(err,good){
        if (err) return res.json(err);
        var folder =  './app/images/goods/' + req.params.id;
        if (fs.existsSync(folder)) {
            rimraf(folder, function(error) {console.log(error);});
            //console.log('Yes')
        }
        /*else
            console.log('no');*/

        good.remove(function (err) {
            //console.log(err);
                res.json(err)
        })

    })
}

exports.fileUpload = function(req, res){
    var goods;
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

                var folder =  './app/images/goods/' + req.body.id;
                var target_path = folder+'/' + req.files.file.name;

                var target_pathQ = '/images/goods/'+ req.body.id+'/' + req.files.file.name;

                async.series([
                    function(callback){
                        Goods.findById(req.body.id,function(err,result){
                            if (err)
                                callback(err);
                            else{
                                goods = result;
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
                                width:   400
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
                        if (goods.img ){
                            fs.unlink('./app'+goods.img, function (err) {
                                if (err)
                                    console.log(err)
                                else{
                                    console.log('successfully deleted '+goods.img);

                                }
                                callback(null);
                            });
                        } else
                            callback(null);

                    },function(cb){
                        goods.img=target_pathQ;
                        goods.save(function(err) {
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

exports.getComments= function(req, res) {
    //console.log(req.params);
    Goods.findById(req.params.id)
        .select('comments').exec(function (err, result) {
            //console.log(result);
            if (err) return res.json(err);
            result.comments.forEach(function(el,i){
                if (el._id==req.params.idC){

                    res.json(result.comments[i]);
                }
            })

        })
}

exports.listComments= function(req, res) {
    //console.log(req.params);
    Goods.findById(req.params.id)
        .select('comments')
        .exec(function (err, result) {
            //console.log(result);
            if (err) return res.json(err);
            var comments = result.comments.map(function(doc) {
                return {'_id':doc._id,'author':doc.author,'date': moment(doc.modified).format('DD-MM-YYYY') }
            });
            res.json(comments);
        })
}

exports.addComments= function(req, res) {
    Goods.findById(req.body.id,function (err, good) {
        //console.log(req.body);
        if (err) return res.json(err);
        if (req.body._id){
            for (var i=0; i <good.comments.length; i++){
                if (good.comments[i]._id == req.body._id){
                    good.comments[i].author = req.body.author,
                    good.comments[i].body = req.body.body
                }
            }
        } else {
            var d = new Date().getTime();
            good.comments.push({
                author : req.body.author,
                body : req.body.body,
                date:d
            });
        }
        good.save(function (err) {
            if (err) return res.json(err);
            res.json({});
        });
    })
}


exports.deleteComments = function(req,res){
    Goods.findById(req.params.id,function(err,good){
        if (err) return res.json(err);

        good.comments.id(req.params.idC).remove();
        good.save(function (err) {
            if (err) return res.json(err);
            res.json({});
        });
    })
}


exports.lastNews= function(req, res) {
    var _self = {};
    _self.l=[];

    var foundFour = function(err, t){
        var i = t[0];
        if(i){
           _self.l.push({'name': i.name,'date': moment(i['date']).format('DD-MM-YYYY'),'id': i._id,'img': i.img,'desc': i.desc,'type': i.type});
        }
        Goods.find({'type':0,'index':100},'name desc img type',{sort: {'date': -1},limit:1}).exec(

        function (err, t){
            if (err)
                return res.json(err);
            else {
                //console.log(t);
                var i = t[0];
                if(i){
                    _self['g']={'name': i.name,'date': moment(i['date']).format('DD-MM-YYYY'),'id': i._id,'img': i.img,'desc': i.desc,'type': i.type};
                }
                //console.log(_self);
                return res.json(_self);
            }
        }

        )
    };

    var foundThree = function(err, t){
        var i = t[0];
        if(i){
            _self.l.push({'name': i.name,'date': moment(i['date']).format('DD-MM-YYYY'),'id': i._id,'img': i.img,'desc': i.desc,'type': i.type});
        }
        Goods.find({'type':1,'category':3},'name desc img type',{sort: {'date': -1},limit:1}).exec(foundFour);
    };


    var foundTwo = function(err, t){
        var i = t[0];
        if(i){
            _self.l.push({'name': i.name,'date': moment(i['date']).format('DD-MM-YYYY'),'id': i._id,'img': i.img,'desc': i.desc,'type': i.type});
        }
        Goods.find({'type':1,'category':2},'name desc img type',{sort: {'date': -1},limit:1}).exec(foundThree);
    };

    Goods.find({'type':1,'category':1},'name desc img type',{sort: {'date': -1},limit:1})

        //.sort('-date')
        //.limit(1)
        //.or([{'category':2}])
        //.sort('-index')
        //.select('type name img desc index category')
        .exec(foundTwo)
}

exports.search = function(req,res){
    //console.log(req.params);
    var lang=req.params.lang;
    var str = new RegExp(req.params.searchStr,'i');
    //console.log(str);

    var findDesc= function(err,t){
        if (err) return res.json(err);
        //console.log(t);
        var goods = {'name':t};
        Goods.find().or([{"desc.ua":str},{"desc.ru":str}])
            .select('type name img desc index category')
            .sort('type')
            .exec(function(err,t){
                if (err) return res.json(err);
                goods.desc=t.map(function(doc){
                    var text = doc.desc[lang];
                    var lb='<span style="color: #ff2a27">';
                    var le ='</span>';
                    var pos = text.toLowerCase().indexOf(req.params.searchStr);
                    var begin=0;end=100;
                    if (pos>50){
                        var begin =pos-50;
                        var end =pos+50
                    }
                    doc.text=text.insert(pos,lb)
                        .insert(pos+lb.length+req.params.searchStr.length,le)
                        .slice(begin,end+lb.length+req.params.searchStr.length+le.length);
                    return {'text':doc.text,'name':doc.name,'type':doc.type,'category':doc.category,'_id':doc._id};
                })
                goods.quantity=goods.desc.length + goods.name.length;
                res.json(goods);
            }
        );

    }
    Goods.find().or([{"name.ua":str},{"name.ru":str}])
        .select('type name img desc index category')
        .sort('type')
        .exec(findDesc);

    /*Goods.find(req.params.id,function(err,good){
        if (err) return res.json(err);

        good.comments.id(req.params.idC).remove();
        good.save(function (err) {
            if (err) return res.json(err);
            res.json({});
        });
    })*/
}