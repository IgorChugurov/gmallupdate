'use strict';


var mongoose = require('mongoose'),
    nodemailer = require("nodemailer"),
    User = mongoose.model('User'),
    moment = require('moment'),
    _=require('underscore'),
    Order = mongoose.model('Order'),
    OrderArch = mongoose.model('OrderArch');

/**
 * Get awesome things
 */
exports.list= function(req, res) {
    var query = (req.query.user)?{'user':req.query.user}:null;
   // console.log(req.query.user);
    Order.find(query)
       .sort('num')
        //.select('name index country region')
        .exec(function (err, result){
            if (err)
                return res.json(err);
            else {

                return res.json(result);
            }
        })
}


exports.get= function(req, res) {
    //console.log(req.body);
    Order.findById(req.params.id)

        .exec(function (err, result) {

        if (err) return res.json(err);

        res.json(result);})


}

exports.delete = function(req,res){
    Order.findByIdAndRemove(req.params.id, function (err,doc) {
        if (err) {console.log(err);return res.json(err);}

        res.json({});
    })
}


exports.add= function(req, res) {
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    console.log(req.body);
    var order = new Order(req.body);
    var upsertData = order.toObject();
    delete upsertData._id;
    //console.log(upsertData);

    Order.getLastNumberOrder(function(err,lastOrder){
        //console.log(lastOrder);
        //res.json({});
        if(!lastOrder[0] || !lastOrder[0].num){
            if (!upsertData.num){
                upsertData.num=2455;
            }
        }else {
            if (!upsertData.num){
                upsertData.num=++lastOrder[0].num;
            }
        }

        if (upsertData.status==5 && !upsertData.date4){
            upsertData.date4=Date.now();
            var orderArch = new OrderArch(upsertData);
            orderArch.save(function (err) {
                if (err) return res.json(err);
                // saved!
                Order.findByIdAndRemove(order.id,function(err,order){
                    console.log('aaaa'+order);
                    res.json({});
                })
            })


        } else {
            if (upsertData.status==2 && !upsertData.date1){
                upsertData.date1=Date.now();
            }
            if (upsertData.status==3 && !upsertData.date2){
                upsertData.date2=Date.now();
            }
            if (upsertData.status==4 && !upsertData.date3){
                upsertData.date3=Date.now();
            }
            Order.update({_id: order.id}, upsertData, {upsert: true}, function (err) {
                if (err) {console.log(err);return res.json(err);}
                if (!req.body._id){
                    createMail()
                } else {
                    res.json({});
                }

            })
        }

    });

    //*******************************mail


    function createMail(){
        var dateForTable=upsertData.date;
        var smtpTransport = nodemailer.createTransport("SMTP",{
            service: "Mailgun",
            auth: {
                user: "postmaster@sandbox86422.mailgun.org",
                pass: "9zsllp27ndo6"
            }
        });
        var mailOptions = {
            from: "noreply ✔ <noreplay@autofan.kharkov.ua>", // sender address
            //to: req.body.useremail, // list of receivers
            subject: "order ✔", // Subject line
            //text: "Hello world ✔", // plaintext body
            html:""
        }
        //onsole.log(order.user);
       User.findById(order.user)
           .exec(function(err,user){
          // console.log(user);
              var  message =

                   '<table width="100%" border="1px" style="border-color: #ccc;">'+
                       ' <tbody>'+
                       '  <tr>'+
                       '   <td style="background-color: #999;">#</td><td style="background-color: #999">Название</td><td style="background-color: #999">Артикул</td><td style="background-color: #999">Модель</td><td style="background-color: #999">Цена</td><td style="background-color: #999">Кол-во</td><td style="background-color: #999">Сумма</td>'+
                       '  </tr>'+
                       ' </tbody>'+
                       ' <tbody>';
               upsertData['cart'].forEach(function(good,index){
                   var tags='';
                   for (var i=0;i<good.tags.length;i++){
                       tags +=good.tags[i]+'</br>';
                   }
                   message +=
                       '<tr>'+
                           '<td>'+(++index)+'</td><td>'+good.name+'</td><td>'+good.artikul+'</td><td>'+tags+'</td>';
                   var sum = good.price;
                   message +=
                       '<td>'+(upsertData.kurs* sum).toFixed(2)+' '+upsertData.currency+'</td><td>'+good['quantity']+'</td>';
                    message +=
                       '<td>'+(upsertData.kurs* sum*good['quantity']).toFixed(2)+' '+upsertData.currency+'</td>'+
                           '</tr>';
               })
               //sumAll.toFixed(2);
               message +=
                   '</tbody>'+
                       '<tbody>'+
                       '<tr>'+
                       '<td></td>'+
                       '<td>Итого</td>'+
                       '<td></td>'+
                       '<td></td>'+
                       '<td></td>'+
                       '<td>'+upsertData.quantity+'</td>'+
                       '<td>'+(upsertData.sum*upsertData.kurs).toFixed(2)+' '+upsertData.currency+'</td>'+
                       '</tr>'+
                       '</tbody></table>'+
                       '<table width="100%">'+
                       '<tr>'+
                       '<td>'+
                       '<h5>Данные для доставки</h5>'+
                       'ФИО : '+user['profile']['fio']+'<br>'+
                       'индекс : '+user['profile']['zip']+'<br>'+
                       'cтрана : '+user['profile']['country']+'<br>'+
                       'регион : '+user['profile']['region']+'<br>'+
                       'город : '+user['profile']['city']+'<br>'+
                       'адрес : '+user['profile']['address']+
                       '</td>'+
                       '<td>'+
                       '<h5>Контактная информация</h5>'+
                       'телефон : '+user['profile']['phone']+'<br>'+
                       'e-mail  : '+user['email']+'<br>'+
                       'комментарий  : '+upsertData['comment']+'<br>'+
                       '</td>'+
                       '</tr>'+
                       '<tr>'+
                       '<td colspan="2" style="background-color:#999"></td>'+
                       '</tr>'+
                       '</table>';
               var end1 =
                   '</body>'+
                       '</html>';

               var end2=
                   'Менеджер свяжется с Вами в ближайшее время.'+
                       '</body>'+
                       '</html>';
               var messageBegin1=
                   '<html>'+
                       '<body bgcolor="#D4D4D4" topmargin="25">'+
                       '<h3>Здравствуйте</h3>'+
                       '<p>Поступил следующий заказ с сайта <a href="http://autofan.kharkov.ua">autofan.kharkov.ua</a></p>'+
                       '<p>Номер заказа: '+upsertData.num+'</p>'+
                       'Дата : '+moment(upsertData.date).format('LLL')+'<br>';

               var messageBegin2=
                   '<html>'+
                       '<body bgcolor="#D4D4D4" topmargin="25">'+
                       '<h3>Здравствуйте!</h3>'+
                       '<p>С Вашего адреса на <a href="http://autofan.kharkov.ua">сайте autofan.kharkov.ua</a> оформлен следующий заказ:</p>'+
                       '<p>Номер заказа: '+upsertData.num+'</p>'+
                       'Дата : '+moment(upsertData.date).format('LLL')+'<br>';
               mailOptions.html=messageBegin2+message+end2;
               mailOptions.to=user.email;
               smtpTransport.sendMail(mailOptions, function(error, response){
                   if(error){
                       console.log(error);
                   }else{
                       console.log("Message sent: " + response.message);
                   }
                   mailOptions.html=messageBegin1+message+end1;
                   console.log('2');
                   //mailOptions.to='jadoneopt@gmail.com';

                   mailOptions.to='ig19chin@gmail.com';
                   smtpTransport.sendMail(mailOptions, function(error, response){
                       console.log('3');
                       if(error){
                           console.log(error);
                       }else{
                           console.log("Message sent: " + response.message);
                       }
                       res.json({});

                       // if you don't want to use this transport object anymore, uncomment following line
                       smtpTransport.close(); // shut down the connection pool, no more messages
                   });

               });




       })
    }

}



/*535ea88fb4ee684c1085c4ce

exports.delete = function(req,res){
    Comment.findById(req.params.id, function (err,doc) {
        Stuff.findById(doc.stuff,function(err,stuff){
            */
/*console.log(stuff.comments);
            console.log(comment.id);*//*

            //console.log(stuff.comments.indexOf(comment.id));
            //var i = stuff.comments.indexOf(req.params.id);
            var i=stuff.comments.indexOf(req.params.id);
            if (i>-1){
                stuff.comments.splice(i,1)
               // console.log(stuff.comments);
                stuff.save();
            }
            doc.remove();
            res.json({});
        })
        */
/*if (err) return res.json(err);
        // saved!
        res.json({});*//*

    })

}
*/




