'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */
var CategorySchema = new Schema({
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
    brands: [{type : Schema.ObjectId, ref : 'Brand'}],
    filters: [{type : Schema.ObjectId, ref : 'FilterNew'}],
    mainFilter:{type : Schema.ObjectId, ref : 'FilterNew'},
    section: {type : Schema.ObjectId, ref : 'Category'},
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

/**
 * Methods
 */
CategorySchema.methods = {
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

mongoose.model('Category', CategorySchema);



