'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */
var NewsSchema = new Schema({
    name: {
        ua:{type : String, default : '', trim : true},
        ru:{type : String, default : '', trim : true},
        en:{type : String, default : '', trim : true}
    },
    img : String,
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
    style:Number,
    author: {type : Schema.ObjectId, ref : 'User'},
    date: { type: Date, default: Date.now },
    gallery:[{thumb:String,img:String,index: Number}],
    index: Number
});

NewsSchema.add({style:'Number'});
NewsSchema.add({desc4 : {
    ua:{type : String, default : ''},
    ru:{type : String, default : ''},
    en:{type : String, default : ''}
}});
NewsSchema.add({desc5 : {
    ua:{type : String, default : ''},
    ru:{type : String, default : ''},
    en:{type : String, default : ''}
}});


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

NewsSchema.statics = {

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
            .populate('author','name')
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
        var criteria = options.criteria || {}

        this.find(criteria)
            .populate('author','name')
            .select('name img desc0 desc1 author date')
            .sort({'date': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .exec(cb)
    }

}

NewsSchema.methods = {
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

mongoose.model('News', NewsSchema);



