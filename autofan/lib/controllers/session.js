'use strict';

var mongoose = require('mongoose'),
    passport = require('passport');

/**
 * Logout
 */
exports.logout = function (req, res) {
  req.logout();
  //res.redirect('/');
  res.send(200);

};

/**
 * Login
 */
exports.login = function (req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    var error = err || info;
      console.log(error);
    if (error) return res.json(401, error);

    req.logIn(user, function(err) {
      //console.log(user);
       // req.user.userInfo.userid=user._id;
      //console.log(req.user.userInfo);
      if (err) return res.send(err);
      res.json(req.user.userInfo);
    });
  })(req, res, next);
};