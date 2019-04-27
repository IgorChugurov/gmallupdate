var mongoose=require('mongoose');
var path = require('path');
var fs = require('fs');
var gmall_stuff = mongoose.connect('mongodb://localhost/gmall-stuff',{useMongoClient:true});

var modelsPath = path.join( __dirname, 'account/models' );
require( modelsPath + '/act.js' );
require( modelsPath + '/pn.js' );
require( modelsPath + '/rn.js' );
require( modelsPath + '/zakaz.js' );
require( modelsPath + '/money.js' );
var Act   = gmall_stuff.model('Act');
var Pn    = gmall_stuff.model('Pn');
var Rn    = gmall_stuff.model('Rn');
var Zakaz    = gmall_stuff.model('Zakaz');
var MoneyOrder    = gmall_stuff.model('MoneyOrder');


run();

async function run() {
    try{

        let r = await Act.remove({store:'5a3cc10e1626aa0566f7ea87'}).exec();
        console.log(r)
        r = await Pn.remove({store:'5a3cc10e1626aa0566f7ea87'}).exec();
        console.log(r)
        r = await Rn.remove({store:'5a3cc10e1626aa0566f7ea87'}).exec();
        console.log(r)
        r = await Zakaz.remove({store:'5a3cc10e1626aa0566f7ea87'}).exec();
        console.log(r)
        r = await MoneyOrder.remove({store:'5a3cc10e1626aa0566f7ea87'}).exec();
        console.log(r)
    }catch (err){
        console.log(err)
    }


}


