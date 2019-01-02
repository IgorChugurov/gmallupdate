var mongoose=require('mongoose');
var path = require('path');
var fs = require('fs');
var gmall_stuff = mongoose.connect('mongodb://localhost/gmall-stuff',{useMongoClient:true});
//var gmall_account = mongoose.connect('mongodb://localhost/gmall-account',{useMongoClient:true});
var csvWriter = require('csv-write-stream')


// stored in 'testA' database

var modelsPath = path.join( __dirname, 'stuff/models' );
require( modelsPath + '/stuff.js' );
require( modelsPath + '/brand.js' );
require( modelsPath + '/filter.js' );
var Stuff    = gmall_stuff.model('Stuff');
var FilterTags    = gmall_stuff.model('FilterTags');
//var Material    = gmall_stuff.model('Material');

run();

async function run() {
    try{
        var writer = csvWriter({ headers: ["name", "sku",'producer','stuff','sort']})
        writer.pipe(fs.createWriteStream('out.csv'))

        const tags = await FilterTags.find({store:'5867d1b3163808c33b590c12'}).lean().exec();
        const stuffs = await Stuff.find({store:'5867d1b3163808c33b590c12'}).populate('brand','nameL name').populate('tags','nameL name').lean().exec();
        for(s of stuffs){
            let name=(s.nameL && s.nameL['ru'])?s.nameL['ru']:s.name;
            name = name.replace(/"/g,"")

            let sku=(s.artikulL && s.artikulL['ru'])?s.artikulL['ru']:s.artikul;
            let producer = (s.brand && s.brand.nameL)?s.brand.nameL['ru']:'Tatiana';
            let  ks = Object.keys(s.stock);
            if(ks.length){
                for(k of ks){
                    let skuToFile = sku;
                    if(k!=='notag'){
                        let t = tags.find(tt=>tt._id.toString()===k)
                        if(t){
                            let tagName = (t.nameL && t.nameL.ru)?t.nameL.ru:t.name;
                            skuToFile +=' '+tagName;
                        }
                    }

                    await writer.write([name, skuToFile,producer,s._id,k])
                }
            }
        }
        writer.end()

    }catch (err){
        console.log(err)
    }


}


