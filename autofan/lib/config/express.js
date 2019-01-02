'use strict';

var //express = require('express'),
    path = require('path'),
    config = require('./config'),
    passport = require('passport'),
    flash 	 = require('connect-flash');

   // useragent = require('express-useragent');

var cookieSession = require('cookie-session');
//var logger = require('logger');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var session= require('express-session');
var favicon= require('serve-favicon');
var statick= require('serve-static');
var multer  = require('multer'),

    mongoStore = require('connect-mongo')(session);






/**
 * Express configuration
 */
module.exports = function(app) {

// In our app.js configuration



    if (app.get('env') === 'development') {
        //console.log('development');
        //if (process.env.NODE_ENV === 'name')
        //app.use(require('connect-livereload')());

        // Disable caching of scripts for easier testing
        app.use(function noCache(req, res, next) {
            if (req.url.indexOf('/scripts/') === 0) {
                //res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.header('Pragma', 'no-cache');
                res.header('Expires', 0);
            }
            next();
        });

        //app.use(statick(path.join(config.root, '.tmp')));
        app.use(statick(path.join(config.root, 'app')));
        app.use(errorHandler());
        app.set('views', config.root + '/app/views');
        //app.use(logger);
    };

    app.set('trust proxy', true);
    /*app.use('/', function(req, res, next) {
     console.log('%s %s — %s and ip - %s', (new Date).toString(), req.method, req.url,req.ip);
     return next();
     });
     */


    if (app.get('env') === 'production') {
        console.log('production');
        app.use(favicon(path.join(config.root, 'app', 'favicon.ico')));
        app.use(statick(path.join(config.root, 'app')));
        app.set('views', config.root + '/views');
    };


    //app.engine('pdf', require('ejs').renderFile);
    app.set('view engine', 'jade');
    app.use(bodyParser({limit: '50mb'}));
    app.use(multer({ dest: './uploads/'}))
    app.use(methodOverride());
    app.use(cookieParser());
    //app.use(useragent.express());

    /*app.use(session({
     //key: "mysite.sid.uid.whatever",
     secret: 'mysite.sid.uid.whatever'
     *//*cookie: {
     maxAge: 26784000000 // 31 days
     }*//*
     }));*/

    // Persist sessions with mongoStore
  console.log(session({
    secret: 'angular-fullstack secret',
    store: new mongoStore({
      url: config.mongo.uri,
      ttl: 60 * 24 * 60 * 60 ,// 60 days
      collection: 'sessions'
    })
  }))
    app.use(session({
        secret: 'angular-fullstack secret',
        store: new mongoStore({
            url: config.mongo.uri,
            collection: 'sessions'
        })
    }));

    //use passport session
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash()); // use connect-flash for flash messages stored in session


    // Router needs to be last
    // app.use(app.router);

};