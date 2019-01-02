var globalFunction=require('./public/scripts/myPrototype.js')

var fs = require('fs');
var path = require('path');
var mongoose=require('mongoose');
mongoose.Promise = global.Promise;
var db = mongoose.connect('mongodb://localhost/invoice',{useMongoClient:true});
// Bootstrap models
var modelsPath = path.join( __dirname, 'invoice/models' );
fs.readdirSync( modelsPath ).forEach( function (file) {
    require( modelsPath + '/' + file );
} );


var express = require('express');
var useragent = require('express-useragent');
var multer  = require('multer');
var cookieParser = require('cookie-parser');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');


var server = require('http').createServer(app);



/*todo get away this comment slashes*/
//app.set('env','production')

app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 1000000
}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(methodOverride());
app.use(multer({dest:'./public/uploads',limits: { fileSize: 20 * 1024 * 1024 }}).single('file'));
app.use(cookieParser());
app.use(useragent.express());
app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(cors({
    origin: true,
    credentials: true
}));

// Routing
var routerCollection = express.Router();
routerCollection.param( 'collectionName', function (req, res, next, name) {
    console.log(req.url)
    if(mongoose.model( name )){
        req.collection = mongoose.model( name );
        req.collectionName = name;
        console.log(req.collectionName)
        next();
    }else{
        next(new Error("collection doesn't exist"));
    }
} );
require( './invoice/routes/routerCollection' )( routerCollection );
app.use( '/api/collections', routerCollection );
var router = express.Router();
require( './invoice/routes/router' )( router );
app.use( '/', router );
/**
 * error handler
 */
app.use( function (error, req, res, next) {
    console.log(error)
    // send back a 500 with a generic message
    res.status( 500 );
    res.send( {'message': error.message || error} );
    var date = new Date().toISOString().replace( /T/, ' ' ).replace( /\..+/, '' );
    var collection = (req.collectionName) ? req.collectionName : '';
    var s = collection +" " +date + ' ' + error.stack + "\n" + 'path - ' + decodeURIComponent( req.url ) + "\n";
    fs.appendFile( './invoice/errors.invoice.log', s, function (err, data) {
        if (err) throw error;
    } );
} );



server.listen(3339,function(){
    console.log('Server running at http://127.0.0.1:3339/ for invoice');
});















