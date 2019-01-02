'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var ObjectID = mongoose.Types.ObjectId;
/**
 * User Schema
 */
var SlideSchema = new Schema({
  name: {type : String, default : '', trim : true},
  img : String,
  desc : {type : String, default : ''},
  link: {type : String, default : '', trim : true},
  index:Number,
    class1:String,class2:String,class3:String
});

SlideSchema.statics = {
   load: function (id, cb) {
        this.findOne({ _id : id })
            .populate('categories', 'name')
            .populate('tags')
            .exec(cb)
    },
    list: function (options, cb) {
        var criteria = options.criteria || {}
        this.find(criteria)
            .sort({'index': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .exec(cb)
    }
}


mongoose.model('Slide', SlideSchema);





