'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */
var CommentSchema = new Schema({
    text: String,
    stuff: {type : Schema.ObjectId, ref : 'Stuff'},
    author: {type : Schema.ObjectId, ref : 'User'},
    date: { type: Date, default: Date.now }

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

CommentSchema.statics = {

    /**
     * Find article by id
     *
     * @param {ObjectId} id
     * @param {Function} cb
     * @api private
     */

    /*load: function (id, cb) {
        this.findOne({ _id : id })
            .populate('comments', 'author date text')
            .populate('comments.author')
            .exec(cb)
    },*/

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
            .select('name filters gallery')
            .sort({'index': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .exec(cb)
    }*/

}

CommentSchema.methods = {
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

mongoose.model('Comment', CommentSchema);



