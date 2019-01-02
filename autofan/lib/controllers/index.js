'use strict';

var path = require('path'),
mongoose = require('mongoose'),
Slide=mongoose.model('Slide');

/**
 * Send partial, or 404 if it doesn't exist
 */
exports.partials = function(req, res) {
  var stripped = req.url.split('.')[0];
  //console.log(stripped)
  var requestedView = path.join('./', stripped);
  res.render(requestedView, function(err, html) {
    if(err) {
      res.send(404);
    } else {
      res.send(html);
    }
  });
};

/**
 * Send our single page app
 */
exports.index = function(req, res) {
  //return res.render('index',{slides:[]});
  //console.log(Slide)
  /*console.log('wwwww')
  res.render('index',{slides:[]});*/
  Slide.find().sort({'index': 1}).exec(function(err,slides){
    //console.log(slides)
    res.render('index',{slides:slides});
  })
  
};
