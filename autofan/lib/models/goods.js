'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GoodSchema;
GoodSchema = new Schema({
    type: Number,
    name: {
        ua: {type: String,
            unique: true},
        ru: {type: String,
            unique: true}
    },
    img: String,
    desc: {
        ua: String,
        ru: String
    },
    category: Number,
    index: Number,
    date: { type: Date, default: Date.now },
    comments:[{
        author:String,
        date:Number,
        body:String,
        modified: { type: Date, default: Date.now }
    }]
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
GoodSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @r
   * eturn {Boolean}
   * @api public
   */
  test: function(plainText) {
    return plainText;
  }

};

mongoose.model('Goods', GoodSchema);



