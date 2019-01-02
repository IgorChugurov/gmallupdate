'use strict';

var mongoose = require('mongoose'),
    async = require('async'),
    nodemailer = require("nodemailer"),
    categories = require('../../data/categories.json'),
   // Groups = mongoose.model('Groups'),
    fs=require('fs');
    //Stuff = mongoose.model('Stuff');
//var ip2cc = require('ip2cc');
//var xlsx = require('node-xlsx');
//var excelParser = require('excel-parser');


//var XLS = require('xlsjs');

/**
 * Get awesome things
 */
/*exports.menuItem = function(req, res) {
    async.series([
        function(callback){
            Groups.find(function (err, result){
                if (err) {
                    console.log(error);
                    callback(err);
                } else {
                    //console.log(result);
                    callback(null,result);
                }
            })
        },
        function(callback){
            Stuff.find(function (err, result){
                if (err) {
                    console.log(error);
                    callback(err);
                } else {
                    //console.log(result);
                    callback(null,result);
                }
            })
        }
    ], function (err, results) {
        //console.log(results);

        if (err)
            return res.json(err);
        else {
            return res.json(results);
        }
    })

//      return res.send(err);
};*/
exports.categories_list= function(req, res) {
    return res.json(categories);
};



exports.categories_get= function(req, res) {
    return res.json(categories[parseInt(req.params.id)]);
};
exports.fileUpload = function(req, res){
    //console.log(req.files);return
    if (req.files.length == 0 || req.files.file.size == 0)
          res.send({ msg: 'No file uploaded at ' + new Date().toString() });
    else{
        var tmp_path = req.files.file.path;
        var target_path =  './app/price.pdf';
        fs.rename(tmp_path, target_path, function(err) {
            res.json(err);
        });

        /*fs.readFile(req.files.displayImage.path, function (err, data) {
            // ...Really simple file uploads with Express  http://howtonode.org/really-simple-file-uploads
            var newPath = __dirname + "/uploads/uploadedFileName";
            fs.writeFile(newPath, data, function (err) {
                res.redirect("back");
            });
        });*/


    }


}

exports.fileDownload = function(req, res){
    //res.download('app/price.pdf');
    fs.readFile('app/price.pdf',function(error,data){
     if(error){
     res.json({'status':'error',msg:err});
     }else{
     res.type('application/pdf');
     res.end(data, 'binary');
     //            res.writeHead(200, {"Content-Type": "application/pdf"});
     //            res.write(data);
     //            res.end();
     }
     });

}

/*exports.feedback= function(req, res, next) {
    //console.log(req.body);  return;
    var data ={},
        smtpTransport = nodemailer.createTransport("SMTP",{
            service: "Mailgun",
            auth: {
                user: "postmaster@sandbox86422.mailgun.org",
                pass: "9zsllp27ndo6"
            }
        });

    var mailOptions = {
        from: "noreplay ✔ <noreplay@ri.biz>", // sender address
        to: 'igorchugurov@gmail.com', // list of receivers
        //to: 'ri@kture.kharkov.ua', // list of receivers
        subject: "feedback ✔", // Subject line
        text:"Cообщение из формы обратной связи."+'\n'+
            "Имя :"+req.body.name+'\n'+
            "email :"+req.body.email+'\n'+
            "text :"+req.body.text// plaintext body
    }
    //console.log(mailOptions);
    data.done = false;
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
            data.done = true;
        }
        smtpTransport.close(); // shut down the connection pool, no more messages
        res.json(data);
    });
}*/


exports.parse_xlsx= function(req, res) {
    /*excelParser.worksheets({
        inFile: 'pricedst.xls'
    }, function(err, worksheets){
        if(err) console.error(err);
        return res.json(worksheets);
    });
    xlsx.parse('price.xls',function(err,data){
        console.log(err);
        console.log(data);
    });*/


    /*var xls = XLS.readFile('price.xls');
    return res.json(xls);*/
    var ip = req.headers['x-real-ip'];
    //console.log(ip);
// Download IP database (48 hours for expiration)
    /*if(mIP2CO.dbCSVCheckExp(48)) {
        mIP2CO.dbGet().then(function() {
            console.log('done!');
        }, function(err) {
            console.log(err);
        });
    }*/
// done!

// Search IP addresses
   /* mIP2CO.ipSearch(['37.57.5.247']).then(function(res) {
        console.log(res);
    }, function(err) {
        console.log(err);
    });*/

    /*ip2cc.lookUp('92.0.0.95.255.255', function(ipaddress, country) {
        if (country) {
            console.log(ipaddress+': '+country);
        } else {
            console.log(ipaddress+' not found');
        }
    });*/

    //console.log('IP 174.96.192.67 is located in '+ip2cc.lookUp('174.96.192.67'));


    //console.log(req.connection.remoteAddress);
    //console.log(req.socket.remoteAddress);
    return res.json({'ip':ip});
};


exports.feedback= function(req, res, next) {
    //console.log(req.body);  return;
    var data ={},
        smtpTransport = nodemailer.createTransport("SMTP",{
            service: "Mailgun",
            auth: {
                user: "postmaster@sandbox86422.mailgun.org",
                pass: "9zsllp27ndo6"
            }
        });

    var mailOptions = {
        from: "noreplay ✔ <noreplay@autofan.kharkiv.ua>", // sender address
        to: 'saharozo@mail.ru', // list of receivers
        //to: 'ri@kture.kharkov.ua', // list of receivers
        subject: "feedback ✔", // Subject line
        text:"Cообщение из формы обратной связи."+'\n'+
            "Имя :"+req.body.name+'\n'+
            "email :"+req.body.email+'\n'+
            "text :"+req.body.text// plaintext body
    }
    //console.log(mailOptions);
    data.done = false;
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
            data.done = true;
        }
        smtpTransport.close(); // shut down the connection pool, no more messages
        res.json(data);
    });
}

exports.mailJobTicket= function(req, res, next) {
   // console.log(req.body.to)
    /*var smtpTransport = nodemailer.createTransport("SMTP",{
        service: "Mailgun",
        auth: {
            user: "postmaster@sandbox86422.mailgun.org",
            pass: "9zsllp27ndo6"
        }
    });
    var mailOptions = {
        from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
        to: 'igorchugurov@gmail.com', // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello world 🐴', // plaintext body
        html: '<b>Hello world 🐴</b>' // html body
    };

    smtpTransport.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });


    return;*/


    try{
       // console.log(1)
        var data ={},
            smtpTransport = nodemailer.createTransport("SMTP",{
                service: "Mailgun",
                auth: {
                    user: "postmaster@autofan.kharkov.ua",
                    pass: "2ead0145eeab971195800383bb787f44"
                }
            });

        /*console.log(smtpTransport)
         return*/
        //console.log(2)
        var mailOptions = {
            from: "autofan ✔ <noreply@autofan.kharkiv.ua>", // sender address
            to: req.body.email, // list of receivers
            //to: 'ri@kture.kharkov.ua', // list of receivers
            subject: "наряд-заказ ✔", // Subject line
            html:req.body.body}
        //console.log(mailOptions);
        //console.log(3)
        smtpTransport.sendMail(mailOptions, function(error, response){
            //console.log(3)
            smtpTransport.close(); // shut down the connection pool, no more messages
            //console.log(error)
            if(error){
                return next(error);
            }

            //    console.log("Message sent: " + response.message);



            res.json({});
        });
        //antsazonov@mail.ru
    }catch(err){
        return next(err);
    }



    //res.json({})
}


