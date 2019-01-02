'use strict';


var mongoose = require('mongoose'),
    async = require('async')
    ,Shipper = mongoose.model('Shipper')
    ,Sparks = mongoose.model('Sparks');
var _ = require('underscore');

var XLS = require('xlsjs');
if(typeof require !== 'undefined') var XLSX = require('xlsx');
//var workbook = XLSX.readFile('test.xlsx');

var exec = require('child_process').exec,
    child;

var ObjectId = require('mongoose').Types.ObjectId;

exports.list= function(req, res,nex) {
    Shipper.find().exec(function(err, result) {
        if (err)  return next(err);
        return res.json(result)
    })
}
exports.get= function(req, res,next) {
    Shipper.findById(req.params.id,function (err, result) {
        if (err) return next(err);
            res.json(result);
    });

}

exports.add= function(req, res,next) {
    console.log(req.body);
    //req.body.filters=JSON.stringify(req.body.filters);
    //console.log(req.body.filters);
//http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//How do I update/upsert a document in Mongoose?
    var stuff = new Shipper(req.body);

    var upsertData = stuff.toObject();
    console.log(upsertData);
    delete upsertData._id;
    Shipper.update({_id: stuff.id}, upsertData, {upsert: true}, function (err) {
        if (err) return next(err);
        // saved!
        res.json({});
    })
}

exports.delete = function(req,res,next){
    Sparks.remove({shipper: new ObjectId(req.params.id)}).exec(function(e,r){
        if (e) next(e);
        console.log(r);
        Shipper.findByIdAndRemove(req.params.id, function (err) {
            if (err) return next(err);
            res.json({});
        })
    });

}


exports.uploadExel = function(req, res,next){
    /*Sparks.find({'code': '07119904102'}).exec(function(err,docs){
        console.log(docs);
    });
    return res.json({})*/
    var resArr =[];
    function saveSpark(item,callback){
        //console.log(item);
        var spark = new Sparks({code:item.code,shipper:item.shipper,stuff:item.stuff});
        //console.log(spark);
        spark.save().exec(function(e,r){
            callback();
        })

    }
    function gogo(){
        async.eachSeries(resArr, saveSpark, function(err){
            // if any of the saves produced an error, err would equal that error
            return res.json(resArr.length);
        });
    }


    var COL = ['A','B','C','D','E','F','G','H','I','J','K','L','N','M','O','P','Q']
    setTimeout(
        function () {
            res.setHeader('Content-Type', 'text/html');
            if (req.files.length == 0 || req.files.file.size == 0)
                res.send({ msg: 'No file uploaded at ' + new Date().toString() });
            else {
                console.log(req.files.file)
                if (req.files.file.mimetype=='application/vnd.ms-excel'){
                    var workbook = XLS.readFile(req.files.file.path);
                    var sheet_name_list = workbook.SheetNames;
                    var Sheet1 = workbook.Sheets[sheet_name_list[0]]
                    //var rowCol=Sheet1.split(':');
                    //var parsedSheet = XLSX.utils.sheet_to_row_object_array(Sheet1)
                    var parsedSheet = XLS.utils.sheet_to_json(Sheet1)
                } else if (req.files.file.mimetype=='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                    var workbook = XLSX.readFile(req.files.file.path);
                    var sheet_name_list = workbook.SheetNames;
                    var Sheet1 = workbook.Sheets[sheet_name_list[0]]
                    //var rowCol=Sheet1.split(':');
                    //var parsedSheet = XLSX.utils.sheet_to_row_object_array(Sheet1)
                    var parsedSheet = XLSX.utils.sheet_to_json(Sheet1)
                } else {
                    //console.log('[htym rfrfz-nj');
                    return next(new Error('не верный формат файла!'))
                }

                /*console.log(XLSX.utils);
                return res.json(parsedSheet1);*/
                var resArr=[];

                //return res.json(resArr);
                if (req.body.code=='1'){
                    for (var i= 0,li=parsedSheet.length;i<li;i++){
                        //if (i>50) break;
                        resArr[i]={}
                        var j=0;
                        _.each(parsedSheet[i],function(el){
                            if (j==0){
                                resArr[i].code= el;
                                resArr[i].shipper= req.body.shipper;
                                resArr[i].stuff=[];
                                j++;
                            } else {
                                resArr[i].stuff[resArr[i].stuff.length]=el;
                            }

                        })
                    }

                } else if(req.body.code=='2'){
                    for (var i= 0,li=parsedSheet.length;i<li;i++){
                        //if (i>50) break;
                        resArr[i]={}
                        var j=0;
                        _.each(parsedSheet[i],function(el){
                            if (j==0){
                                resArr[i].code= el;
                                resArr[i].shipper= req.body.shipper;
                                resArr[i].stuff=[];
                                j++;
                            } else {
                                resArr[i].stuff[resArr[i].stuff.length]=el;
                            }

                        })
                        // для харьковской баварии добавляем колонку цена
                        resArr[i].stuff[resArr[i].stuff.length]=0;
                        /*for (var j in parsedSheet[i]){
                         resArr[i][resArr[i].length]=parsedSheet[i][j];
                         }*/
                    }
                } else {
                    next(new Error('не известный код поставщика!'))
                }
                /*if (req.body.code=='1'){
                    for (var i=2,l=Sheet1['!range'].e.r;i<=l;i++){
                        //if (i>100) break;
                        resArr[resArr.length] ={code:'',stuff:[]}
                        for (var j=0,lj=Sheet1['!range'].e.c;j<lj;j++){
                            var index=COL[j]+i;
                            if (j==0){ // код запчасти
                                resArr[resArr.length-1].code= Sheet1[index].v;
                                resArr[resArr.length-1].shipper= req.body.shipper;
                            } else { //if(j!=2){
                                resArr[resArr.length-1].stuff[resArr[resArr.length-1].stuff.length]=Sheet1[index].v;
                            }
                        }
                    }

                } else if(req.body.code=='2'){

                    //res.json({})

                    for (var i=2,l=Sheet1['!range'].e.r;i<=l;i++){
                        //if (i>100) break;
                        resArr[resArr.length] ={code:'',stuff:[]}
                        for (var j=0,lj=Sheet1['!range'].e.c;j<lj;j++){
                            var index=COL[j]+i;
                            if (j==0){ // код запчасти
                                resArr[resArr.length-1].code= Sheet1[index].v;
                                resArr[resArr.length-1].shipper= req.body.shipper;
                            } else { //if(j!=2){
                                resArr[resArr.length-1].stuff[resArr[resArr.length-1].stuff.length]=Sheet1[index].v;
                            }
                        }
                        // для харьковской баварии добавляем колонку цена
                        resArr[resArr.length-1].stuff[resArr[resArr.length-1].stuff.length]=0;


                    }


                }else {
                    res.json({})
                }
*/                // сохранение в БД
                Sparks.remove({shipper: new ObjectId(req.body.shipper)}).exec(function(e,r){
                    //console.log(r);
                    if (e) next(e);
                    Sparks.create(resArr,function(e,r){
                        if (e) next(e);
                        //console.log(r);
                        res.json({})
                    });
                    //gogo();
                });


            }
        },
        (req.param('delay', 'yes') == 'yes') ? 200 : -1
    );

}




