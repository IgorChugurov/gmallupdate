'use strict';
var mongoose = require('mongoose'),
    async = require('async')
    //, extend = require('util')._extend
    ,Category = mongoose.model('Category')
    ,Filters = mongoose.model('Filters');


exports.list= function(req, res) {
    Filters.find()
        .sort('-index')
        .select("name index type tags")
        .exec(function (err, result){
            if (err)
                return res.json(err);
            else {
                for(var i=0;i<=result.length-1;i++){
                    result[i].value='';
                }
                return res.json(result);
            }
        })
}


exports.get= function(req, res) {
    //console.log(req.body);
    Filters.findById(req.params.id,function (err, result) {
        //console.log(result);
        if (err) return res.json(err);
        res.json(result);
    })

}

exports.add= function(req, res) {
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    console.log(req.body);
    var filter = new Filters(req.body);
    var upsertData = filter.toObject();
    delete upsertData._id;
    Filters.update({_id: filter.id}, upsertData, {upsert: true}, function (err) {
        //console.log(err);
        if (err) return res.json(err);
        // saved!
        res.json({});
    })

}

function deleteFilterFromGoods(idFilter,idCategory){
    // получаем все товары привязанные к данной категории
    // из поля фильтр товара удаляем соответствующий idFilter объект
    return true;
}

function deleteFilterFromCategory(id){
    Category.find()
        .sort('-index')
        .select('filters')
        .exec(function (err, categories){
           if (categories && categories.length>0){
               categories.forEach(function(el){
                   if (el.filters && el.filters.length>0){
                       var i = el.filters.indexOf(id);
                       if (i>-1){
                           el.filters.splice(i,1);
                           el.save();
                           deleteFilterFromGoods(id,el._id);
                       }
                   }
               })
           }
        })
};

exports.delete = function(req,res){

    Filters.findById(req.params.id,function(err,filter){
        deleteFilterFromCategory(filter._id)
        filter.remove(function (err) {
            if (err)
                res.json(err)
            else
                res.json({});
        })
    });
}

exports.tag_get = function(req,res){
    Filters.findById(req.params.filter,function (err, filter) {
        if (err) return res.json(err);
        //issue.articles.id(req.params.id);
        //console.log();
        res.json(filter.tags.id(req.params.id));

        // res.json(result);
    })

}
exports.tag_list = function(req,res){
    Filters.findById(req.params.filter,function (err, filter) {
        if (err) return res.json(err);
        //issue.articles.id(req.params.id);
        //console.log();
        res.json(filter.tags);

        // res.json(result);
    })

}

exports.tag_delete = function(req,res){
    Filters.findById(req.params.filter,function(err,filter){
        //console.log(issue.articles);
        //console.log(req.params.id);
        if (err) return res.json(err);
        filter.tags.id(req.params.id).remove();
        filter.save(function (err) {
            if (err) return res.json(err);
            res.json({});
        });

    })

}
exports.tag_add = function(req,res){
    console.log(req.body);
    Filters.findById(req.params.filter,function(err,filter){
        if (req.body._id){
            for (var i=0; i <filter.tags.length; i++){
                if (filter.tags[i]._id == req.body._id){
                    filter.tags[i].name.ua =(req.body.name.ua)?req.body.name.ua:'';
                    filter.tags[i].name.ru =(req.body.name.ru)?req.body.name.ru:'';
                    filter.tags[i].name.en =(req.body.name.en)?req.body.name.en:'';
                    filter.tags[i].index=req.body.index;
                }
            }
        } else
            filter.tags.push(req.body);

        filter.save(function (err) {
            if (err) return res.json(err);
            res.json({});
        });
    })

}


