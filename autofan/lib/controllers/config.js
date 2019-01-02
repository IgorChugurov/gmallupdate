'use strict';
var fs = require('fs');

var config = function() {
    // constructor
}

config.prototype.init = function(file, cb) {
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            console.log(err);
            cb(-1);
        } else {
            var json = JSON.parse(data);
           /* for (var o in json) {
                //console.log(json[o]);
                config.prototype[o] = json[o];
            }*/
            cb(json); // no error
        }
    });
}

module.exports = new config();