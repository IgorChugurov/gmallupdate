'use strict';
var jobTName= require('./controllers/jobname');

module.exports = function(router) {
    router.get('/',jobTName.list);
    router.get('/:id',jobTName.get);
    router.delete('/:id',jobTName.delete);
    router.post('/',jobTName.add);
    router.post('/:id',jobTName.add);
};