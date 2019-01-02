'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    nodemailer = require("nodemailer"),
    passport = require('passport');










/**
 * Create user
 */
exports.create = function (req, res, next) {
    /*if (req.body.profile){
        req.body.profile=JSON.stringify(req.body.profile);
        console.log(req.body);
    }*/
    console.log(req.body);
  var newUser = new User(req.body);
  newUser.provider = 'local';

  newUser.save(function(err) {
    if (err) {
      // Manually provide our own message for 'unique' validation errors, can't do it from schema
      if(err.errors.email.type === 'Value is not unique.') {
        err.errors.email.type = 'The specified email address is already in use.';
      }
      return res.json(400, err);
    }

    req.logIn(newUser, function(err) {
      if (err) return next(err);
      
      return res.json(req.user.userInfo);
    });
  });
};

/**
 *  Get profile of specified user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(new Error('Failed to load User'));
  
    if (user) {
      res.send({ profile: user.profile });
    } else {
      res.send(404, 'USER_NOT_FOUND');
    }
  });
};

exports.list = function (req, res, next) {
    User.find( function (err, users) {
        if (err) return next(new Error('Failed to load Users'));
        res.json(users);
    });
};

exports.delete = function (req, res, next) {
    User.findByIdAndRemove(req.params.id ,function (err, user) {
        if (err) return next(new Error('Failed to load User'));
        res.json(user);
    });
};


/**
 * Change password
 */
exports.changePassword= function(req, res, next) {
    console.log('aaaa');
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {

      user.password = newPass;
      user.save(function(err) {
        if (err) {
          res.send(500, err);
        } else {
          res.send(200);
        }
      });
    } else {
      res.send(400);
    }
  });
};
function shuffle(len) {
    var string=
        //'abcdefghijklmnopqrstuvwxyzQAZWSXEDCRFVTGBYHNUJMIKOLP1234567890';
        '12345678901234567892101234567890123456789012345678901234567890';
    var parts = string.split('');
    for (var i = parts.length; i > 0;) {
        var random = parseInt(Math.random() * i);
        var temp = parts[--i];
        parts[i] = parts[random];
        parts[random] = temp;
    }
    return parts.join('').substring(0,len);
}



exports.resetPassword = function(req, res, next) {
    var email = req.body.email;

    //var newPass = String(req.body.newPassword);

    User.findOne({email:email}, function (err, user) {
        if(user) {
           // console.log(user);

            var password=shuffle(7);
            var smtpTransport = nodemailer.createTransport("SMTP",{
                service: "Mailgun",
                auth: {
                    user: "postmaster@sandbox86422.mailgun.org",
                    pass: "9zsllp27ndo6"
                }
            });
            var mailOptions = {
                from: "noreplay ✔ <noreplay@jadone.biz>", // sender address
                to: email, // list of receivers
                subject: "Reset password ✔", // Subject line
                //text: "Hello world ✔", // plaintext body
                html: "<div>Уважаемый пользователь.<br />Вами был запрошен сброс пароля на сайте http://autofan.kharkov.ua/"+
                    ".<br />Логин - "+user.name+
                    ".<br />почта - "+email+
                    "<br />Новый пароль - "+password+
                    "<br /> Изменить пароль на свой Вы можете в своей учетной записи.</div>"
            }

            smtpTransport.sendMail(mailOptions, function(error, response){
                if(error){
                    console.log(error);
                }else{
                    console.log("Message sent: " + response.message);
                }

                // if you don't want to use this transport object anymore, uncomment following line
                smtpTransport.close(); // shut down the connection pool, no more messages
            });



            user.password = password;
            user.save(function(err) {
                if (err) {
                    res.send(500, err);
                } else {
                    res.send(200);
                }
            });
        } else {
            res.send(400);
        }
    });
};


exports.changeProfile = function(req, res, next) {
    //console.log(req.body.profile);
    User.findById(req.body._id, function (err, user) {
        user.profile=req.body.profile;
        if (req.body.role && req.body.role!=user.role){
            user.role=req.body.role;
        }
            user.save(function(err) {
                if (err) {
                    res.send(500, err);
                } else {
                    res.send(200);
                }
            });
    });
};



/**
 * Get current user
 */
exports.me = function(req, res) {
    //console.log(req.user);
  res.json(req.user || null);
};