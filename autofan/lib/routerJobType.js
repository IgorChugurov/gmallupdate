'use strict';
var jobType= require('./controllers/jobtype');

module.exports = function(router) {
    router.get('/',jobType.list);
    router.get('/:id',jobType.get);
    router.delete('/:id',jobType.delete);
    router.post('/',jobType.add);
    router.post('/:id',jobType.add);
};