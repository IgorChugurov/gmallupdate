'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */
var BrandSchema = new Schema({
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
    tags: [{type : Schema.ObjectId, ref : 'BrandTags'}],
  country: {type : Schema.ObjectId, ref : 'Country'},
    region: {type : Schema.ObjectId, ref : 'Region'},
    city: {type : Schema.ObjectId, ref : 'City'},
    categories: [{type : Schema.ObjectId, ref : 'Category'}],
  index: Number
});

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

BrandSchema.statics = {

    /**
     * Find article by id
     *
     * @param {ObjectId} id
     * @param {Function} cb
     * @api private
     */

    load: function (id, cb) {
        this.findOne({ _id : id })
            .populate('categories', 'name')
            .populate('tags')
            .exec(cb)
    },

    /**
     * List articles
     *
     * @param {Object} options
     * @param {Function} cb
     * @api private
     */

    /*list: function (options, cb) {
        var criteria = options.criteria || {}

        this.find(criteria)
            //.populate('brand', 'name desc')
            .select('name filters gallery tags')
            .sort({'index': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .exec(cb)
    }*/

}

/**
 * Methods
 */
BrandSchema.methods = {
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

mongoose.model('Brand', BrandSchema);



