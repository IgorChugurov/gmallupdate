'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */
var CitySchema = new Schema({
  name: {
      ua:{type : String, default : '', trim : true},
      ru:{type : String, default : '', trim : true},
      en:{type : String, default : '', trim : true}

  },

  country: {type : Schema.ObjectId, ref : 'Country'},
  region: {type : Schema.ObjectId, ref : 'Region'},
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
CitySchema.methods = {
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

mongoose.model('City', CitySchema);



