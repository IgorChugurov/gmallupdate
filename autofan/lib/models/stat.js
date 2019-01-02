'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */
var StatSchema = new Schema({
    name:String,
    desc0 : {
        ua:{type : String, default : ''},
        ru:{type : String, default : ''},
        en:{type : String, default : ''}
    },
    desc1 : {
        ua:{type : String, default : ''},
        ru:{type : String, default : ''},
        en:{type : String, default : ''}
    },
    desc2 : {
        ua:{type : String, default : ''},
        ru:{type : String, default : ''},
        en:{type : String, default : ''}
    },
    desc3 : {
        ua:{type : String, default : ''},
        ru:{type : String, default : ''},
        en:{type : String, default : ''}
    },
    desc4 : {
        ua:{type : String, default : ''},
        ru:{type : String, default : ''},
        en:{type : String, default : ''}
    },
    desc5 : {
        ua:{type : String, default : ''},
        ru:{type : String, default : ''},
        en:{type : String, default : ''}
    },
    gallery:[{thumb:String,img:String,index: Number}]
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

StatSchema.statics = {

    /**
     * Find article by id
     *
     * @param {ObjectId} id
     * @param {Function} cb
     * @api private
     */

    load: function (id, cb) {
        this.findOne({ _id : id })
            //.populate('comments', 'author date text')
            //.populate('category','name filters mainFilter')
            //.populate('brand','name')
            //.populate('brandTag','name')
            //.populate('author','name')
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
        var criteria = options.query|| {}

        this.find(criteria)
            //.populate('author','name')
            .select('name')
            //.sort({'date': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .exec(cb)
    }

}

StatSchema.methods = {
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

mongoose.model('Stat', StatSchema);



