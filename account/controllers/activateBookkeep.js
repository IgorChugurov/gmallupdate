/**
 * Created by Игорь on 14.09.2018.
 */
var cache=require('../../lib/cache');
var request=require('request');
var moment=require('moment')
var path=require('path');
var zlib = require('zlib');
var isWin = /^win/.test(process.platform);
/*if(!isWin){
    var mongoose = require('mongoose');
    var Account=mongoose.model('Account');
    var VirtualAccount=mongoose.model('VirtualAccount');
}*/
function activateBookkeep(store) {
    return new Promise(async function(resolve,reject){
        if(false){
            if(cache.stores[store._id] && cache.stores[store._id].dbDataBookkeep && cache.stores[store._id].dbDataBookkeep.exp && moment().unix()< cache.stores[store._id].dbData.exp){
                zlib.unzip(cache.stores[store._id].dbDataBookkeep.data, function(err, buffer) {
                    console.log('from buffer cached dbDataBookkeep')
                    if (!err) {
                        try{
                            return resolve(JSON.parse(buffer))
                        }catch(err){reject(err)}
                    }else{
                        reject(err)
                    }
                });
                return;

            }


            try{
                let  data = await getAccounts(store)
                let o={
                    accounts:data[0],
                    virtualAccounts:data[1]
                }
                zlib.deflate(JSON.stringify(o), function(err, buffer) {
                    if (!err) {
                        if(!cache.stores){cache.stores={}}
                        if(!cache.stores[store._id]){cache.stores[store._id]={}}
                        if(!cache.stores[store._id].dbDataBookkeep){cache.stores[store._id].dbDataBookkeep={}}

                        cache.stores[store._id].dbDataBookkeep.data=buffer;
                        let seconds = (store.cache && store.cache.dbDataBookkeep)?store.cache.dbDataBookkeep:100000;
                        console.log('seconds',seconds)
                        cache.stores[store._id].dbDataBookkeep.exp=moment().add(seconds, 'seconds').unix()
                    }else {
                        console.log(err)
                    }
                });

            }catch(err){
                return reject(err)
            }

            return resolve(o);
        }else{

            if(cache.stores[store._id] && cache.stores[store._id].dbDataBookkeep && cache.stores[store._id].dbDataBookkeep.exp && moment().unix()< cache.stores[store._id].dbDataBookkeep.exp){
                zlib.unzip(cache.stores[store._id].dbDataBookkeep.data, function(err, buffer) {
                    console.log('from buffer cached dbDataBookkeep')
                    if (!err) {
                        try{
                            return resolve(JSON.parse(buffer))
                        }catch(err){reject(err)}

                    }else{
                        return reject(err)
                    }
                });
                return

            }

            let url =store.bookkeepHost+"/api/bookkeep/getAccounts?store="+store._id+"&subDomain="+store.subDomain+"&lang="+store.lang;
            console.log(url)

            let headers = {
                "accept-charset" : "ISO-8859-1,utf-8;q=0.7,*;q=0.3",
                "accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8;application/json;charset=utf-8,*/*",
                "user-agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
                "accept-encoding" : "gzip",
                'Accept-Encoding': 'gzip',
            };
            let options = {
                uri: url,
                json: true,
                method: 'GET',
                timeout: 1500,
                headers:headers
                /* href: '',
                 pathname: '/'*/
            };

            let req = request.get(options);
            req.on('response', function(res) {
                var chunks = [];
                res.on('data', function(chunk) {
                    chunks.push(chunk);
                });

                res.on('end', function() {

                    var buffer = Buffer.concat(chunks);
                    var encoding = res.headers['content-encoding'];
                    //console.log(buffer.toString())
                    zlib.unzip(buffer, function(err, unzipbuffer) {
                        if (!err) {
                            try{
                                let results =JSON.parse(unzipbuffer.toString('utf8'));
                                var o={
                                    accounts:results[0],
                                    virtualAccounts:results[1],

                                }
                                zlib.deflate(JSON.stringify(o), function(err, buffer) {
                                    if (!err) {
                                        if(!cache.stores){cache.stores={}}
                                        if(!cache.stores[store._id]){cache.stores[store._id]={}}
                                        if(!cache.stores[store._id].dbDataBookkeep){cache.stores[store._id].dbDataBookkeep={}}

                                        cache.stores[store._id].dbDataBookkeep.data=buffer;
                                        let seconds = (store.cache && store.cache.dbDataBookkeep)?store.cache.dbDataBookkeep:100000;
                                        console.log('seconds',seconds)
                                        cache.stores[store._id].dbDataBookkeep.exp=moment().add(seconds, 'seconds').unix()
                                    }else {
                                        console.log(err)
                                    }
                                });

                                return resolve(o);
                            }catch(err){
                                console.log('error in try',err)
                                return reject(err)
                            }



                        }else{
                            console.log('err',err)
                            reject(err)
                        }
                    });
                });
                res.on('error', function(err) {
                    console.log('msg',err)
                    //reject(err)
                })
            });
        }

    })

}

module.exports = activateBookkeep;

