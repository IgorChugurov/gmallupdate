'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * User Schema
 */
var CakesSchema = new Schema({
    name: {type : String, default : '', trim : true},
    desc: {type : String, default : '', trim : true},
    group: [{type : Schema.ObjectId, ref : 'Groups'}],
    gallery:[{thumb:String,img:String}],
    img:String,
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
CakesSchema.methods = {
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

mongoose.model('Cakes', CakesSchema);



