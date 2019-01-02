'use strict';

var api = require('./controllers/api'),
    index = require('./controllers'),
    users = require('./controllers/users'),
    manager = require('./controllers/manager'),
    groups = require('./controllers/groups'),
    cakes = require('./controllers/cakes'),
    stuff = require('./controllers/stuff'),
    //articles = require('./controllers/articles'),
    //auth = require('./middlewares/authorization'),
    session = require('./controllers/session');


var middleware = require('./middleware');


/**
 * Application routes
 */
module.exports = function(app) {

  // Server API Routes
  app.get('/api/menuitem',api.menuItem);

  
  app.post('/api/users', users.create);
  app.put('/api/users', users.changePassword);
  app.get('/api/users/me', users.me);
  app.get('/api/users/:id', users.show);

  app.post('/api/session', session.login);
  app.delete('/api/session', session.logout);



  app.get('/admin123', middleware.auth, manager.index);

  app.get('/api/groups',groups.list);
  app.get('/api/groups/:id',groups.get);
  app.delete('/api/groups/:id',groups.delete);
  app.post('/api/groups',groups.add);
  app.put('/api/groups',groups.add);
  app.post('/api/groupsfile/fileUpload',groups.fileUpload);


  app.get('/api/stuff',stuff.list);
  app.get('/api/stuff/:id',stuff.get);
  app.delete('/api/stuff/:id',stuff.delete);
  app.post('/api/stuff',stuff.add);
  app.put('/api/stuff',stuff.add);
  app.post('/api/stufffile/fileUpload',stuff.fileUpload);

  app.get('/api/cakes/:section',cakes.list);
  app.get('/api/cakes/section/:id',cakes.get);

  app.delete('/api/cakes/section/:id',cakes.deleteCake);
  app.post('/api/cakesfile/fileUpload',cakes.fileUpload);
  app.post('/api/cakesfile/fileUploadGallery',cakes.fileUploadGallery);
  app.get('/api/cakesfile/fileGalleryDelete/:id/:index',cakes.fileGalleryDelete);
  app.put('/api/cakes',cakes.add);
  app.post('/api/cakes',cakes.add);


  // All other routes to use Angular routing in app/scripts/app.js
  //app.get('/partials/*', index.partials);
  app.get('/*', middleware.setUserCookie, index.index);
};