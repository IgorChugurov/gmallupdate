'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */
var SfuffSchema = new Schema({
    name: {
        ua:{type : String, default : '', trim : true},
        ru:{type : String, default : '', trim : true},
        en:{type : String, default : '', trim : true}

    },
    img : String,
    desc : {
        ua:{type : String, default : ''},
        ru:{type : String, default : ''},
        en:{type : String, default : ''}
    },
    tags:[ {type : Schema.ObjectId, ref : 'FilterTags'}],
    photoTag:[String],
    brandTag:{type : Schema.ObjectId, ref : 'BrandTags'},

    brand: {type : Schema.ObjectId, ref : 'Brand'},
    filters: {type : String, default : ''},
    category: {type : Schema.ObjectId, ref : 'Category'},
    comments: [{type : Schema.ObjectId, ref : 'Comment'}],
    gallery:[{thumb:String,img:String,tag: {type : Schema.ObjectId, ref : 'FilterTags'},index: Number}],
    stock:String,
    price:Number,
    priceSale:Number,
    retail:Number,
    retailSale:Number,
    artikul:String,
    index: Number
});
SfuffSchema.add({stock:'String'});

SfuffSchema.add({artikul:'String'});
/**
 * Virtuals
 */

/**
 * Pre-save hook
 */
/*
GroupsSchema

  .pre('save', function(next) {

      next();
  });
*/

/**
 * Methods
 */

SfuffSchema.statics = {

    /**
     * Find article by id
     *
     * @param {ObjectId} id
     * @param {Function} cb
     * @api private
     */

    load: function (id, cb) {
        this.findOne({ _id : id })
            .populate('comments', 'author date text')
            .populate('category','name filters mainFilter')
            .populate('brand','name')
            .populate('brandTag','name')
            .populate('tags','name')
            //.populate('category.mainFilter')
            .exec(cb)
    },

    /**
     * List articles
     *
     * @param {Object} options
     * @param {Function} cb
     * @api private
     */

    list: function (options, cb) {
        var criteria = options.criteria || {}

        this.find(criteria)
            .populate('gallery.tag', 'name')
            .select('name filters tags brandTag price priceSale retail retailSale img desc artikul category')
            .sort({'index': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .exec(cb)
    }

}

SfuffSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  test: function(plainText) {
    return plainText;
  }

};

mongoose.model('Stuff', SfuffSchema);



