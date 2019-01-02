'use strict';
var custom= require('./controllers/custom');

module.exports = function(router) {
    router.get('/',custom.list);
    router.get('/:id',custom.get);
    router.delete('/:id',custom.delete);
    router.post('/',custom.add);
    router.post('/:id',custom.add);
};