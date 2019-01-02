'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * User Schema
 */
var FiltersSchema = new Schema({
    name:{
        ua:{type : String, default : '', trim : true},
        ru:{type : String, default : '', trim : true},
        en:{type : String, default : '', trim : true}
    },
    tags:[
        {
            name:{
                ua:{type : String, default : '', trim : true},
                ru:{type : String, default : '', trim : true},
                en:{type : String, default : '', trim : true}
                },
            index:Number

        }
    ],
    type : Number,// если 1 единичный если два и более то множественный
    index: Number


    /*name: {type : String, default : '', trim : true},
    desc: {type : String, default : '', trim : true},
    group: [{type : Schema.ObjectId, ref : 'Groups'}],
    gallery:[{thumb:String,img:String}],
    img:String,
    index: Number*/

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
FiltersSchema.methods = {
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

mongoose.model('Filters111', FiltersSchema);



