'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */
var OrderSchema = new Schema({
    num:Number,
    status:{ type: Number, default: 1 },
    user: {type : Schema.ObjectId, ref : 'User'},
    date: { type: Date, default: Date.now },// принят
    date1 :{type: Date}, // оплачен 2
    date2 :{type: Date}, // отправлен3
    date3 :{type: Date}, // доставлен4
    date4 :{type: Date}, // архив5
    lang:String,
    comment:String,
    sum:Number,
    quantity:Number,
    cart:[{
        stuff:{type : Schema.ObjectId, ref : 'Stuff'},
        color:{type : Schema.ObjectId, ref : 'FilterTags'},
        size:{type : Schema.ObjectId, ref : 'FilterTags'},
        category:{type : Schema.ObjectId, ref : 'Category'},
        section:{type : Schema.ObjectId, ref : 'Category'},
        artikul:String,
        tags:[String],
        name:String,
        sizeName:String,
        colorName:String,
        categoryName:String,
        img:String,
        quantity:Number,
        price:Number,
        retail:Number,
        kurs:Number,
        currency:String
    }]

});
OrderSchema.add({kurs:'Number'});
OrderSchema.add({tags:['String']});
OrderSchema.add({currency:'String'});
OrderSchema.add({artikul:'String'});
/**
 * Virtuals
 */

/**
 * Pre-save hook
 */
//middle ware in serial
OrderSchema.pre('update', function preSave(next){
    console.log('date1-'+order.date1);
    var order = this;
    if (order.status==2 && !order.date1){
        order.date1(Date.now());
    }
    console.log('date1-'+order.date1);
    next();
});


/*
OrderSchema

  .pre('update', function(next) {
        console.log('sss');
      next();
  });
*/

/**
 * Methods
 */

OrderSchema.statics = {
    getLastNumberOrder: function ( cb) {
        this.find()
            //.select('num')
            .limit(1)
            .sort('-num')
            .exec(cb)
    }



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

OrderSchema.methods = {
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

mongoose.model('Order', OrderSchema);
mongoose.model('OrderArch', OrderSchema);



