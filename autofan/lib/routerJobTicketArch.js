'use strict';
var jobTicketArch= require('./controllers/jobTicketArch');

module.exports = function(router) {
    router.get('/convert/arch',jobTicketArch.convert);
    router.get('/',jobTicketArch.list);
    router.get('/:id',jobTicketArch.get);
    router.delete('/:id',jobTicketArch.delete);
    router.post('/',jobTicketArch.add);
    router.post('/:id',jobTicketArch.add);
};

