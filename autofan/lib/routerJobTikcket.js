'use strict';
var jobTicket= require('./controllers/jobTicket');

module.exports = function(router) {
    router.get('/convert/ticket',jobTicket.convert);
    router.get('/',jobTicket.list);
    router.get('/:id',jobTicket.get);
    router.delete('/:id',jobTicket.delete);
    router.post('/',jobTicket.add);
    router.post('/:id',jobTicket.add);
};