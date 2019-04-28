var mongoose=require('mongoose');
var path = require('path');
var fs = require('fs');
var db  = mongoose.connect('mongodb://localhost/gmall-account',{useMongoClient:true});
//var gmall_account = mongoose.connect('mongodb://localhost/gmall-account',{useMongoClient:true});
var csvWriter = require('csv-write-stream')


// stored in 'testA' database

var modelsPath = path.join( __dirname, 'account/models' );
require( modelsPath + '/material.js' );
require( modelsPath + '/producer.js' );
var Material    = mongoose.model('Material');
var Producer    = mongoose.model('Producer');
//var Material    = gmall_stuff.model('Material');
let producers={};
run();

async function run() {
    try{
        var parse = require('csv-parse');


        var inputFile='out.csv';

        var parser = parse({delimiter: ','}, async function (err, data) {
            let i=0;
            let header;
            for(let line of data){
                if(!i){
                    header= line;
                    //console.log(line)
                }else{

                    let qq = {
                        store:'5867d1b3163808c33b590c12',
                        stuff:line[3],
                        sort:line[4]
                    }
                    let material = await Material.findOne(qq).lean().exec();
                    console.log('material',material)
                    if(!material){
                        if(!producers[line[2]]){
                            let q ={store:'5867d1b3163808c33b590c12',name:line[2]};
                            let pr = await Producer.findOne(q).lean().exec();
                            //console.log('pr',pr)
                            if(!pr){
                                q.actived=true;
                                pr = new Producer(q)
                                await pr.save()
                                producers[line[2]]=pr._id.toString();
                            }
                        }
                        let m ={
                            store:"5867d1b3163808c33b590c12",
                            index:i,
                            name : line[0],
                            sku:line[1],
                            producer:producers[line[2]],
                            stuff:line[3],
                            sort:line[4]
                        }

                        material = new Material(m);
                        console.log('material',material)
                        let r = await material.save()
                        console.log(r)
                    }

                }
                i++;
            }
            console.log('done')

            /*async.eachSeries(data, function (line, callback) {
                // do something with the line
                doSomething(line).then(function() {
                    // when processing finishes invoke the callback to move to the next one
                    callback();
                });
            })*/
        });
        fs.createReadStream(inputFile).pipe(parser);

        /*


        var writer = csvWriter({ headers: ["name", "sku",'producer','stuff','sort']})
        writer.pipe(fs.createWriteStream('out.csv'))


        const stuffs = await Stuff.find({store:'5867d1b3163808c33b590c12'}).populate('brand','name').lean().exec();
        for(s of stuffs){
            let name=(s.nameL && s.nameL['ru'])?s.nameL['ru']:s.name;
            name = name.replace(/"/g,"")

            let sku=(s.artikulL && s.artikulL['ru'])?s.artikulL['ru']:s.artikul;
            let producer = (s.brand)?s.brand.name:'Tatiana';
            let  ks = Object.keys(s.stock);
            if(ks.length){
                for(k of ks){
                    await writer.write([name, sku,producer,s._id,k])
                }
            }
        }
        writer.end()*/

    }catch (err){
        console.log(err)
    }


}


