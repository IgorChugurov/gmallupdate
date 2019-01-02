'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */
var CountrySchema = new Schema({
  name: {
      ua:{type : String, default : '', trim : true},
      ru:{type : String, default : '', trim : true},
      en:{type : String, default : '', trim : true}

  },

 // categories: [{type : Schema.ObjectId, ref : 'Category'}],
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
CountrySchema.methods = {
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

mongoose.model('Country', CountrySchema);



