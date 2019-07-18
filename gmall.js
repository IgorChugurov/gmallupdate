var globalFunction=require('./public/scripts/myPrototype.js')
var express = require('express');
var fs=require('fs');
//var workers=require('./workers')

var ip=require('./modules/ip/ip');


var path = require('path');
if(!ip.local){
    var mongoose=require('mongoose');
    var db = mongoose.connect('mongodb://localhost/gmall-stuff',{useMongoClient:true});
// Bootstrap models
    var modelsPath = path.join( __dirname, 'stuff/models' );
    fs.readdirSync( modelsPath ).forEach( function (file) {
        require( modelsPath + '/' + file );
    } );

}

var cluster = require('cluster');

if (cluster.isMaster) {
    const workers=[]
    var numCPUs =1;// require('os').cpus().length;
    console.log (' Fork %s worker(s) from master', numCPUs);
    for (var i = 0; i < numCPUs; i++) {
        //http://www.acuriousanimal.com/2017/08/12/understanding-the-nodejs-cluster-module.html
        const worker = cluster.fork();

        /*worker.on('message', function(msg) {
            console.log('Master ' + process.pid + ' received message from worker ' + this.pid + '.', msg);
        });*/



        workers.push(worker);
        worker.on('message', function(message) {
            if(message.msg =='clearCache'){
                console.log(`Master ${process.pid} recevies message '${JSON.stringify(message.msg)}' from worker ${worker.process.pid}`);
                //worker.send({msgFromMaster: 'This is from master ' + process.pid + ' to worker ' + worker.pid + '.'});
                workers.forEach(function(wk) {
                    if(wk.process.pid!=message.pid){
                        wk.send({ msg: 'clearCache',store:message.store });
                    }

                })
            }

        });
    }
    Object.values(cluster.workers).forEach(worker => {
        worker.on('message', message => {
            //console.log(cluster.workers.length)
            console.log("from ",message.pid);
        });
    });
    cluster.on('online', function(worker) {
         console.log ('worker is running on %s pid', worker.process.pid);
    });
    cluster.on('exit', function(worker, code, signal) {
        console.log('worker with %s is closed', worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else if (cluster.isWorker) {

    /*process.on('message', function(msg) {
        console.log('Worker ' + process.pid + ' received message from master.', msg.msg);
    });*/
    /*var cache2=require('./lib/cache');
    if(!cache2.num){
        cache2.num=1
    }else{
        cache2.num++
    }*/

    process.on('message', function(message) {
        if(message.msg =='clearCache'){

            var cache=require('./lib/cache');
            var cachePugFunctions=require('./lib/cachePugFunctions');

            /*console.log(process.pid,message.msg);
            console.log(cache.storeList['process']);*/

            //console.log('cashe.num',cache.num)
            //console.log(message.store.subDomain)
            //console.log("cache.storeList['process']",cache.storeList['process'])
            /*for(let store in cache.storeList){
                console.log(process.pid,cache.storeList[store].subDomain)
            }*/
            if(cache && cache.storeList && cache.storeList[message.store.subDomain]){
                console.log('cache.storeList[message.store.subDomain] done')
                delete cache.storeList[message.store.subDomain]
                //cache.storeList[message.store.subDomain]=message.store
            }

            if(cache.stores && cache.stores[message.store._id]){
                console.log('clear cache.stores for all data')
                delete cache.stores[message.store._id]
            }
            if(cachePugFunctions &&  cachePugFunctions[message.store._id]){
                console.log('clear cachePugFunctions')
                delete cachePugFunctions[message.store._id]
            }
        }
    });

    var app = express();

    var server = require( 'http' ).createServer( app );

    // Application Config

    //***********************************************************************************
    //*************************************** production ***********************************
    app.set('env','production')
    process.env.NODE_ENV = app.get( 'env' ) || 'development';
    var config = require( './lib/config/config' );
    /*app.use(function (req, res, next) {
       console.log('req.url from gmall',req.url)
        next()

    })*/
    app.set( 'port', process.env.PORT || 8909 );
    // Express settings
    require( './lib/config/express' )( app );
    var router = express.Router();
    require( './lib/routes/index' )( router );
    app.use( '/', router );
    /**
     * error handler
     */
    app.use( function (error, req, res, next) {
        res.status( 500 );
        res.send( {'message': error.message || error} );
        var date = new Date().toISOString().replace( /T/, ' ' ).replace( /\..+/, '' );
        //var collection = (error.collectionName) ? error.collectionName : '';
        try{
            var uri=decodeURIComponent(req.url);
        }catch(err){
            var uri=req.url;
        }


        var s = date + ' ' + error.stack + "\n" + 'path - ' + uri + "\n"+ "\n"+ 'subDomain - ' + ((req.store)?req.store.subDomain:'??') + "\n";
        fs.appendFile( 'errors.gmall.log', s, function (err, data) {
            if (err) throw error;
        } );
    } );
    // boots app
    server.listen( app.get( 'port' ), function () {
        console.log( 'Express server listening on port ' + app.get( 'port' ) );
    } );
} //worker









