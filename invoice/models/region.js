'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */
var RegionSchema = new Schema({
  name: {
      ua:{type : String, default : '', trim : true},
      ru:{type : String, default : '', trim : true},
      en:{type : String, default : '', trim : true}

  },

  country: {type : Schema.ObjectId, ref : 'Country'},
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
RegionSchema.methods = {
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

mongoose.model('Region', RegionSchema);



