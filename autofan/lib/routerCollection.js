'use strict';
var collection = require('./controllers/collection');
/*var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({defer: true});*/

module.exports = function(router) {
    router.get('/:collectionName', collection.list)
    router.post('/:collectionName',collection.save)
    router.get('/:collectionName/fileGalleryDelete/:id/:index', collection.fileGalleryDelete);
    router.post('/:collectionName/fileGalleryUpdate/:id', collection.updateGallery);
    router.get('/:collectionName/:id',collection.get);
    router.post('/:collectionName/fileUpload', collection.fileUpload);
    router.post('/:collectionName/fileUploadGallery', collection.fileUploadGallery);
    router.post('/:collectionName/fileUploadBig', collection.fileUploadBig);
    router.post('/:collectionName/fileUploadFullImg', collection.fileUploadFullImg);
    router.post('/:collectionName/:id', collection.save);
    router.delete('/:collectionName/:id', collection.delete);
};
