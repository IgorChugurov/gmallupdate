'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var FilterSchema = new Schema({
    name:{
        ua:{type : String, default : '', trim : true},
        ru:{type : String, default : '', trim : true},
        en:{type : String, default : '', trim : true}
    },
    tags:[ {type : Schema.ObjectId, ref : 'FilterTags'}],
    type : Number,// если 1 единичный если два и более то множественный
    index: Number
});

var FilterTagsSchema = new Schema({
    name:{
        ua:{type : String, default : '', trim : true},
        ru:{type : String, default : '', trim : true},
        en:{type : String, default : '', trim : true}
    },
    filter:[ {type : Schema.ObjectId, ref : 'FilterNew'}],
    index: Number

});

var BrandTagsSchema = new Schema({
    name:{
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
    brand:[ {type : Schema.ObjectId, ref : 'Brand'}],
    index: Number

});



FilterSchema.statics = {

    /**
     * Find filter by id
     *
     * @param {ObjectId} id
     * @param {Function} cb
     * @api private
     */

    load: function (id, cb) {
        this.findOne({ _id : id })
            .populate('tags','name index')
            .exec(cb)
    },

    /**
     * List filters
     *
     * @param {Object} options
     * @param {Function} cb
     * @api private
     */

    list: function (options, cb) {
        var criteria = options || {}

        this.find(criteria)
            .populate('tags','name index')
            .sort('index')
            .select("name index type tags")
            .exec(cb)
    }

}

mongoose.model('BrandTags', BrandTagsSchema);
mongoose.model('FilterTags', FilterTagsSchema);
mongoose.model('FilterNew', FilterSchema);







