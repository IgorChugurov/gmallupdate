'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/**
 * User Schema
 */
var ShipperSchema = new Schema({
    name: String,
    code:Number,
    ratio:Number,
    ratioEnter:Number,
    currency:String
});


mongoose.model('Shipper', ShipperSchema);


var SparkSchema = new Schema({
        code:String,
        shipper: {type : Schema.ObjectId, ref : 'Shipper'},
        stuff:[]
});


mongoose.model('Sparks', SparkSchema);

