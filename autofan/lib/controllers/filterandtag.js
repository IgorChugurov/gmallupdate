'use strict';
var mongoose = require('mongoose'),
    async = require('async')
    //, extend = require('util')._extend
    ,Category = mongoose.model('Category')
    ,FilterTags = mongoose.model('FilterTags')
    ,Filter = mongoose.model('FilterNew');


exports.list= function(req, res) {
    console.log('ddd!!!');
    var query=null;
    if (req.params.filters){
        query=  {" _id" : { $in: JSON.parse(req.params.filters)}}
    }
    Filter.find(query)
        //.populate('tags','name index')
        .sort('-index')
        .select("name index type")
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
    Filter.findById(req.params.id)
        .populate('tags','name index')
        .exec(function (err, result) {
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
    Category.find({ 'filters.type':id})
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

    function deleteTags(id){
        FilterTags.find({filter:id})
            .exec(function(err,tags){
                var i;
                for (i=0;i<=tags.length-1;i++){
                    tags[i].remove();
                }
            });
    }


exports.delete = function(req,res){

    Filter.findById(req.params.id,function(err,filter){
        deleteFilterFromCategory(filter._id)
        deleteTags(filter._id);
        filter.remove(function (err) {
            if (err)
                res.json(err)
            else
                res.json({});
        })
    });
}

exports.tag_get = function(req,res){
    FilterTags.findById(req.params.tag,function (err, tag) {
        if (err) return res.json(err);
        //issue.articles.id(req.params.id);
        //console.log();
        res.json(tag);

        // res.json(result);
    })

}
exports.tag_list = function(req,res){
    FilterTags.find({filter:req.params.filter},function (err, tags) {
        if (err) return res.json(err);
        //issue.articles.id(req.params.id);
        //console.log();
        res.json(tags);

        // res.json(result);
    })

}

exports.tag_delete = function(req,res){
    Filter.findById(req.params.filter,function(err,filter){
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
    var tag = new FilterTags(req.body);
    var upsertData = tad.toObject();
    delete upsertData._id;
    FilterTags.update({_id: tag.id}, upsertData, {upsert: true}, function (err) {
        //console.log(err);
        if (err) return res.json(err);
        // saved!
        res.json({});
    })


    if (!req.body._id){
        Filter.findById(req.params.filter,function(err,filter){
            filter.tags.push(tag.id);
            filter.save();
        })
    }


}


