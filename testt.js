'use strict';
const cluster = require('cluster');

if (cluster.isMaster) {
    var numCPUs =require('os').cpus().length;
    console.log (' Fork %s worker(s) from master', numCPUs);
    for (var i = 0; i < numCPUs; i++) {
        //http://www.acuriousanimal.com/2017/08/12/understanding-the-nodejs-cluster-module.html
        const worker = cluster.fork();
        worker.send('hi there '+worker.id);
        worker.on('message', msg => {
            console.log(`msg: ${msg} from worker#${worker.id}`);
        });
    }



} else if (cluster.isWorker) {
    process.on('message', (msg) => {
        console.log('get msg',msg,process.id)
        //process.send(msg);
    });
}