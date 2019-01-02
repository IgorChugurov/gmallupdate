'use strict';
var worker= require('./controllers/worker');

module.exports = function(router) {
    router.get('/',worker.list);
    router.get('/:id',worker.get);
    router.delete('/:id',worker.delete);
    router.post('/',worker.add);
    router.post('/:id',worker.add);
};