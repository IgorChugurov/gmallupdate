'use strict';
var mongoose = require('mongoose'),
    async = require('async')
    //, extend = require('util')._extend
    ,Category = mongoose.model('Category')
    ,FilterTags = mongoose.model('FilterTags')
    ,Filter = mongoose.model('FilterNew');


exports.list= function(req, res) {
   /// console.log('ddd');
    var query=null;
    //console.log(req.query);
    if (req.query.filters){
        query=  {"_id" : { $in: JSON.parse(req.query.filters)}}
    }
    //console.log(query);
    Filter.list(query,function (err, result){
        if (err)
            return res.json(err);
        else {
            for(var i=0;i<=result.length-1;i++){
                result[i].value=[];
            }
            return res.json(result);
        }
        })

}


exports.get= function(req, res) {
    //console.log(req.body);
    Filter.load(req.params.id,function (err, result) {
        //console.log(result);
        if (err) return res.json(err);
        res.json(result);
    })

}

exports.add= function(req, res) {
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    //console.log(req.body);
    var temp=[];
    if (req.body.tags &&  req.body.tags.length>0 && req.body.tags[0]._id){
        for (var i=0;i<req.body.tags.length;i++){
           temp.push(req.body.tags[i]._id);
        }
        req.body.tags=temp;
    }
    var filter = new Filter(req.body);
    //console.log(filter);
    var upsertData = filter.toObject();
    delete upsertData._id;
    Filter.update({_id: filter.id}, upsertData, {upsert: true}, function (err) {
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
    Category.find({ 'filters':id})
        .select('filters')
        .exec(function (err, categories){
            console.log(categories);
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
                for (var i=0;i<=tags.length-1;i++){
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
        /*console.log(typeof (filter.tags));
        console.log(filter.tags);
        for( var key in filter.tags){
            console.log(key);
            console.log(filter.tags[key]);
        }*/
        //console.log(issue.articles);
        //console.log(req.params.id);
        if (err) return res.json(err);
        var i = filter.tags.indexOf(req.params.id);
        if (i>-1){
            filter.tags.splice(i,1);
            filter.save();
        }
        FilterTags.findByIdAndRemove(req.params.id,function (err) {
            if (err) return res.json(err);
            res.json({});
        })


    })

}
exports.tag_add = function(req,res){

    console.log(req.body);
    var tag = new FilterTags(req.body);
    var upsertData = tag.toObject();
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


