'use strict';
var async = require('async');
var fs = require('fs');
var rimraf = require('rimraf');
var im = require('imagemagick');
var request = require('request');
var  config = require('../../lib/controllers/config.js')

//config = require('../../data/config.json')
    , cheerio = require('cheerio');

var mongoose = require('mongoose')
    ,Shipper = mongoose.model('Shipper')
    ,Sparks = mongoose.model('Sparks');


var http = require('http');
var iconv = require('iconv-lite');


/*var loadTime = new Date().getTime();

fs.watchFile(config, function(curr, prev) {
    if (curr.mtime.getTime() > loadTime) {
        delete require.cache[require.resolve('../../data/config.json')];
        config = require('../../data/config.json');
    } else {
        // return the cached file
    }
});*/




/*
var Iconv = require('iconv').Iconv;
var fromEnc = 'cp1251';
var toEnc = 'utf-8';
var translator = new Iconv(fromEnc,toEnc);
*/

/**
 * Get awesome things
 */

function get_numbers(input) {
    return input.match(/[0-9]+/g);
}


function printTableA_Z($arr,$numtable,$newpricezak,order){
    //order=true;
    var $printstr='<h3 class="hpars">На складе 1</h3>',
    $is = false;


    switch ($numtable){
        case 1 :

            $printstr +='<table class="table pars">'+
                '<tr>'+
                '<th>магазин</th>'+
                '<th>код запчасти</th>'+
                '<th>производитель</th>'+
                '<th>наличие</th>'+
                '<th>ед. изм.</th>'+
                '<th>розничная цена</th>'+
                '<th>отпускная цена</th>';

            if (order){
                $printstr += '<th>в наряд</th>'
            }
            $printstr +=   '<tr>';
            if ($arr.length>0){
                var $i=1;
                for (var ii=0;ii<$arr.length;ii++){
                    var $item = $arr[ii];
                    var $val=$item;
                    if ($val =='A-Zauto')
                        $val='Cклад 1';
                    if ($val =='A4-E40')
                        $val='Cклад 1a';

                    // наличие

                    if (($i<6 &&$i%4==0) || ($i>6 &&($i-4)%6==0)){
                        if ($val=='+')
                            $is=true;
                    }


                    $printstr +="<td>"+$val+"</td>";
                    if ($i%6==0){
                        //var_dump($iss);
                        if ($is){
                            /*console.log($item);
                            console.log($newprice);*/

                            $val= (parseFloat($item)*$newpricezak).toFixed(2);
                            $is = false;
                        } else {
                            $val = '0';
                        }
                        $printstr +="<td>"+$val+"</td>";
                        if (order){
                            $printstr +='<td><a class="pars_a"  ng-click="toggle(\''+$val+'\')">В наряд</a></td>';
                        }
                        $printstr +="</tr><tr>";
                    }
                    $i++;
                }
            } else {
                var colspan=7;
                if (order){colspan=8}
                $printstr += '<td colspan="'+colspan+'" align="center"><h4>Нет совпадений</h4></td></tr>';
            }

            $printstr += '</table>';
            return  $printstr; break;


case 2 :
    $printstr='<h3 class="hpars">Под заказ</h3>'+
        '<table class="table  pars">'+
        '<tr>'+
            '<th>производитель</th>'+
            '<th>код запчасти</th>'+
            '<th>название</th>'+
            '<th class="cena">розничная цена</th>'+
            '<th class="cena">отпускная цена</th>'+
        '</tr>'+
        '<tr>';

    if ($arr.length>0){
        $i=1;
        for (var ii=0;ii<$arr.length;ii++){
            var $item = $arr[ii];
            $val=$item;
            $printstr +="<td>"+$val+"</td>";
            if ($i%4==0){
                $val= (parseFloat($item)*$newpricezak).toFixed(2);
                $printstr +="<td>"+$val+"</td></tr><tr>";
            }
            $i++;
        }
    } else {
        $printstr += '<td colspan="7" align="center"><h4>Нет ничего</h4></td></tr>';
    }

    $printstr += '</table>';
    return  $printstr; break;


case 3 :
    $printstr='<h3 class="hpars">Доставка под заказ со склада 1</h3>'+
    '<table class="table pars">'+
    '<tr>'+
        '<th>дата</th>'+
        '<th>фирма</th>'+
        '<th>код запчасти</th>'+
        '<th>описание</th>'+
        '<th>к-во</th>'+
        '<th>дост. дней</th>'+
        '<th class="cena">цена под заказ</th>'+
        '<th class="cena">отпускная цена</th>'+
    '</tr>'+
    '<tr>';

    if ($arr.length>0){
        $i=1;
        for (var ii=0;ii<$arr.length;ii++){
            var $item = $arr[ii];
            $val=$item;
            $printstr +="<td>"+$val+"</td>";
            if ($i%7==0){
                $val= (parseFloat($item)*$newpricezak).toFixed(2);
                $printstr +="<td>"+$val+"</td></tr><tr>";
            }
            $i++;
        }
    } else {
        $printstr += '<td colspan="7" align="center"><h4>Нет ни совпадений</h4></td></tr>';
    }

    $printstr += '</table>';
    return  $printstr; break;
default  : return 'Еще одна табличка нарисовалась';
}
return  $printstr;

}




exports.parseSparkA_Z= function(req, res) {
    var order=(req.query && req.query.order && req.query.order=='order')?true:false;

    config.init('./data/config.json', function(resp) {
        var config=resp;
        var $newpricezak= config.parse.az||0.85;

        //console.log(req.params);
        var code = req.params.searchStr,printStr='';


        var postData={
            searchStr:code
        };

        require('request').post({
            uri:"http://www.azauto.com.ua/",
            headers:{'content-type': 'application/x-www-form-urlencoded'},
            body: "searchStr="+code
            //body:require('querystring').stringify(postData)
        },function(err,res1,body){
            // console.log(res1);
            var $ = cheerio.load(body);

            var $i= 1,
                $numtable= 1,
                tables=$('table.results');
            var resultArray={};

            $(tables).each(function(i, table){
                // определяю что это третья таблица
                var $arrth=[];
                $(table).find('th.C').each(function(j,$th){
                    $arrth.push($($th).text());
                })
                if ($arrth && $arrth[0]=='Доставка со складов Украины'){
                    $numtable=3;
                    $newpricezak= config.parse.azzakaz||1;
                }
                //********************************


                //console.log(table);
                // получаем контент их всех ячеек
                var $es= $(table).find('tr.theRow td');
                //************************ test
                // получаем контент построчно
                var rows =$(table).find('tr.theRow');
                var jo=0;
                var rowsRes=[];
                $(rows).each(function(){
                    //rowsRes[jo]=[];
                    var cols=$(this).find('td');
                    if (cols.length>0){
                        rowsRes[rowsRes.length]=[];
                    }
                    cols.each(function(){
                        rowsRes[rowsRes.length-1].push($(this).text().replace(/^\s+|\s+$/g, ''));
                    })
                    jo++;
                });

                resultArray[$numtable]=rowsRes;
                //******************* end test


                var $arr = [];
                for(var ii=0;ii<$es.length;ii++){
                    $arr.push($($es[ii]).text().replace(/^\s+|\s+$/g, ''));
                }
                if ($numtable==2){
                    $newpricezak= config.parse.azzakaz||1;
                }



                var $str= printTableA_Z($arr,$numtable,$newpricezak);
                printStr +=$str;
                $numtable++;

            });
            //console.log(resultArray);
            if (order){
                res.json(resultArray) ;
            } else {
                res.json({res:printStr}) ;
            }

        });


    });


}


function printTableScars($arr,$numth,$myprice,$hrefs,$nametable){
    //console.log($hrefs);
    var $printstr;

    switch ($numth){
        case 5 : {
            $printstr='<h4>Неточное совпадение</h4>'+
                '<table class="table pars">'+
                '<tr>'+
                    '<th>код запчасти</th>'+
                    '<th>описание</th>'+
                    '<th>инфо</th>'+
                    '<th>производитель</th>'+
                    '<th>детализация</th>'+
                '</tr>'+
                '<tr>';

            if ($arr.length>0){
                var $i= 1,$j=0;
                for (var ii=0;ii<$arr.length;ii++){
                    var $item = $arr[ii];
                    var $val=$item;
                    if ($i%5==0){
                        $printstr +='<td><a class="pars_a"  ng-click="toggle(\''+$hrefs[$j++]+'\')">Далее... </a></td></tr><tr>';
                        /*$printstr +='<td><button onclick ="javascript:document.getElementById(\'searchScars\').click()" id="'+$hrefs[$j++]+'">Далее</button></td></tr><tr>';*/
                    } else
                        $printstr +="<td>"+$val+"</td>";
                    $i++;
                }
            } else {
                $printstr += '<td colspan="5" align="center"><h4>Нет совпадений</h4></td></tr>';
            }

            $printstr += '</table>';
            return  $printstr; break;
        }
        case 9 : {
            $printstr=$nametable+
            '<table class="table pars">'+
               '<tr>'+
                    '<th>код запчасти</th>'+
                    '<th>описание</th>'+
                    '<th>инфо</th>'+
                    '<th>производитель</th>'+
                    '<th>розничная цена</th>'+
                    '<th>отпускная цена</th>'+
                    '<th>наличие</th>'+
                    '<th>ожидание</th>'+
                    '<th>к-во</th>'+
                '</tr>'+
                '<tr>';


            if ($arr.length>0){
                //console.log($arr.length);
                var j=null;
                var i;
                for (i=0;i<=$arr.length-1;i++){
                    var $item = $arr[i];
                    var $val=$item;

                    if ((i+1)%9==0){
                        $printstr +="</tr><tr>";
                    } else {
                       /* var hj = ((i - (i%9)*9 )+1 ) %5;
                        console.log('i-'+i+'i%9-'+parseInt(i/9)+' hj - '+hj);
                        if(hj==0){
                            console.log(i);
                        }*/
                        if(  ( (i - (parseInt(i/9))*9 )+1 ) %5 ==0   ){
                            //console.log(i);
                            j=parseFloat(get_numbers($item))
                            if (!j){
                                j=''; $val='';
                            }else{
                                $val=(j*$myprice).toFixed();
                            }
                            $printstr +="<td>"+j+"</td>";
                            $printstr +="<td>"+$val+"</td>";

                        } else {
                            $printstr +="<td>"+$val+"</td>";
                       }
                   }
               }
                //if (i<10)$printstr +="<td></td>";
                $printstr +='</tr>';
            } else {
                $printstr += '<td colspan="9" align="center"><h4>Нет совпадений</h4></td></tr>';
            }
            $printstr += '</table>';
            return  $printstr; break;
        }
        default  :{ return 'Еще одна табличка нарисовалась';};
    }
}





exports.parseSparkS_cars= function(req, res) {
    var order=(req.query && req.query.order && req.query.order=='order')?true:false;

    config.init('./data/config.json', function(resp) {
        var config=resp;
        console.log(config);
        var $newpriceScars=config.parse.scars||1;
        //console.log($newpriceScars);
        var code = req.params.searchStr,
            printStr='<h3 class="hpars">Склад 2</h3>',
            $is=false;
//console.log(order);



        /*var req = http.get("http://www.s-car.com.ua/Search.aspx?Parameter="+code,function(res) {
         console.log('STATUS: ' + res.statusCode);
         console.log('HEADERS: ' + JSON.stringify(res.headers));

         // Buffer the body entirely for processing as a whole.
         var bodyChunks = [];
         res.on('data', function(chunk) {
         // You can process streamed parts here...
         bodyChunks.push(chunk);
         }).on('end', function() {
         var body = Buffer.concat(bodyChunks);
         console.log('BODY: ' + body);
         // ...and/or process the entire body here.
         })
         });*/

        var url ="http://www.s-car.com.ua/Search.aspx?Parameter="+code;
        if(code=='SearchStep2.aspx'){
            url="http://www.s-car.com.ua/"+code+'?KeyValue='+req.query.KeyValue+'&Parametr='+req.query.Parametr;
        }
        console.log(code);
         console.log(url);
        console.log(order)

        require('request').get({
            url : url,
            headers:{'content-type': 'charset=utf-8'},
            encoding:'binary'

            //body: "searchStr="+code
            //body:require('querystring').stringify(postData)
        },function(err,res1,buffer){
            var decoder = new (require('string_decoder').StringDecoder)('utf-8');
            //var body = decoder.write(buffer);
            var body = iconv.decode(buffer, 'win1251');
            //var body2= translator.convert(body).toString());
            //console.log(res1);
            var $ = cheerio.load(body);
            console.log(body);

            var $i= 1,
                $numtable= 1,
                $tables=$('table#ctl00_ContentPlaceHolder1_Grid');

            var  resultArray={};
            $($tables).each(function(i, $table){
                $is=true;
                //		определяем какая таблица. общая - 5 позиций. по детали 9 пунктов
                var $ths=$($table).find('tr.gridHeader td').length;
                //console.log($ths);
                //************************************************************************
                // выбираем ссылки - надо сделать через if
                var $hrefs=[];
                if($ths==5){
                    var $as=$($table).find('a[title]');
                    $($as).each (function(ii,$a){
                        if ($($a).attr('href'))
                            $hrefs.push($($a).attr('href'));
                    })
                }

                // выбираем все ячейки из строк со значениями
                var $tds=$($table).find("tr[class=gridItem] td,tr.gridItem td"); //было 'tr[class = gridItem gridSelectedItem] td,tr.gridItem td'
                var $arr=[];
                for(var ii=0;ii<$tds.leng53a2becd89ed366e72bf8926th;ii++){
                    $arr.push($($tds[ii]).text().replace(/^\s+|\s+$/g, ''));
                }
                //console.log($arr);
                var $str= printTableScars($arr,$ths,$newpriceScars,$hrefs,'<h4>Запрошенный артикул</h4>');
                printStr += $str;
                //************************ order
                // получаем контент построчно
                var rows =$($table).find('tr[class=gridItem] td,tr.gridItem');
                var jo=0;
                var rowsRes=[];
                $(rows).each(function(){

                    var cols=$(this).find('td');
                    if (cols.length>0){
                        rowsRes[rowsRes.length]=[];
                    }
                    cols.each(function(){
                        var $as=$(this).find('a[title]');
                        var a=null;


                        if ($as && $as.length){
                            a=$($as[0]).attr('href')
                        }
                        if (a){ //последняя колонка со ссылкой
                            rowsRes[rowsRes.length-1].push({
                                text:$(this).text().replace(/^\s+|\s+$/g, ''),
                                href:a
                            });
                        } else {
                            rowsRes[rowsRes.length-1].push($(this).text().replace(/^\s+|\s+$/g, ''));
                        }

                    })
                    jo++;
                });

                resultArray[$ths]=rowsRes;
                //console.log(resultArray[$ths]);
                //******************* end order

            });


            $tables=$('td[id=ContextRightPanelBottom] table[id=ctl00_ContentPlaceHolder1_DirectAnalogsGrid]');
            $($tables).each(function(i, $table){
                $is=true;
                // выбираем все ячейки из строк со значениями
                var $tds=$($table).find('tr[class = gridItem] td,tr.gridItem td');

                var $arr=[];
                var $hrefs=[];

                for(var ii=0;ii<$tds.length;ii++){
                    $arr.push($($tds[ii]).text().replace(/^\s+|\s+$/g, ''));
                }
                //console.log($arr);
                var $str= printTableScars($arr,9,$newpriceScars,$hrefs,'<h4>Аналоги (заменители) для данного артикула</h4>');
                printStr += $str;
                //*********************order
                var rows =$($table).find('tr[class=gridItem] td,tr.gridItem');
                var jo=0;
                var rowsRes=[];
                $(rows).each(function(){

                    var cols=$(this).find('td');
                    if (cols.length>0){
                        rowsRes[rowsRes.length]=[];
                    }
                    cols.each(function(){
                        rowsRes[rowsRes.length-1].push($(this).text().replace(/^\s+|\s+$/g, ''));
                    })
                    jo++;
                });
                resultArray['91']=rowsRes;
                //console.log(resultArray['91']);
                //******************end order
            })



//***************************************************************************************
//**************************новый блок***************************************************
            // ссылка на вложеннцю таблицу

            var $a_table=$('a[id=ctl00_ContentPlaceHolder1_SearchFooterHyperLink]');
            if ($($a_table).length>0 && code!='SearchStep2.aspx'){
                //console.log(code)
                //console.log($($a_table['0']).attr('href'));
                var $url = "http://www.s-car.com.ua/"+$($a_table['0']).attr('href');
                //console.log($url);
                require('request').get({
                    url : $url,
                    headers:{'content-type': 'text/html; charset=utf-8'},
                    //headers:{'content-type': 'application/x-www-form-urlencoded'}
                    //body: "searchStr="+code
                    //body:require('querystring').stringify(postData)
                    encoding:'binary'

                    //body: "searchStr="+code
                    //body:require('querystring').stringify(postData)
                },function(err,res1,buffer){
                    var decoder = new (require('string_decoder').StringDecoder)('utf-8');
                    //var body = decoder.write(buffer);
                    var body = iconv.decode(buffer, 'win1251');
                    var $ = cheerio.load(body);
                    var $tables_add = $('#ctl00_ContentPlaceHolder1_Grid');



                    if ($($tables_add).length>0){
                        //console.log($($tables_add).length);
                        $is=true;
                        printStr +='<h3 class="hpars">Склад 2 дополнение 1</h3>';
                        $($tables_add).each(function(i, $table){
                            $is=true;
                            var $hrefs = [];
                            //console.log($($table).find('tr').length);
                            var $tds=$($table).find('tr[class = gridItem] td,tr.gridItem td'); //gridSelectedItem
                            var $arr=[];
                            $i=1;
                            for(var ii=0;ii<$tds.length;ii++){
                                if (!($i%10==0)) {
                                    $arr.push($($tds[ii]).text().replace(/^\s+|\s+$/g, ''));
                                }
                                $i++;
                            }
                            //console.log($arr);
                            var $str= printTableScars($arr,9,$newpriceScars,$hrefs,'<h4>Аналоги (заменители) для данного артикула</h4>');
                            printStr += $str;
                            //*********************order
                            var rows =$($table).find('tr[class=gridItem] td,tr.gridItem');
                            var jo=0;
                            var rowsRes=[];
                            $(rows).each(function(){

                                var cols=$(this).find('td');
                                if (cols.length>0){
                                    rowsRes[rowsRes.length]=[];
                                }
                                cols.each(function(){
                                    rowsRes[rowsRes.length-1].push($(this).text().replace(/^\s+|\s+$/g, ''));
                                })
                                jo++;
                            });
                            resultArray['92']=rowsRes;
                            //console.log(resultArray['91']);
                            //******************end order

                        })

                    }

                    $tables_add = $("table[id=ctl00_ContentPlaceHolder1_DirectAnalogsGrid]");

                    if ($($tables_add).length>0){
                        $is=true;
                        printStr +='<h3 class="hpars">Склад 2 дополнение 2</h3>';
                        $($tables_add).each(function(i, $table){
                            var $hrefs = [];
                            var $tds=$($table).find('tr[class = gridItem] td,tr.gridItem td'); // gridSelectedItem
                            var $arr=[];
                            var $i=1;
                            for(var ii=0;ii<$tds.length;ii++){
                                if (!($i%10==0)) {
                                    $arr.push($($tds[ii]).text().replace(/^\s+|\s+$/g, ''));
                                }
                                $i++;
                            }
                            var $str= printTableScars($arr,9,$newpriceScars,$hrefs,'<h4 class="hpars">Запрошенный артикул</h4>');
                            printStr += $str;
                            //*********************order
                            var rows =$($table).find('tr[class=gridItem] td,tr.gridItem');
                            var jo=0;
                            var rowsRes=[];
                            $(rows).each(function(){

                                var cols=$(this).find('td');
                                if (cols.length>0){
                                    rowsRes[rowsRes.length]=[];
                                }
                                cols.each(function(){
                                    rowsRes[rowsRes.length-1].push($(this).text().replace(/^\s+|\s+$/g, ''));
                                })
                                jo++;
                            });
                            resultArray['93']=rowsRes;
                            //console.log(resultArray['91']);
                            //******************end order
                        })
                    }
                    if (order){
                        res.json(resultArray) ;
                    } else {
                        res.json({res:printStr}) ;
                    }
                })
            } else
//***************************************************************************************
//**************************новый блок end***************************************************
//***************************************************************************************
            {
                //console.log(order);
                if (order){
                    res.json(resultArray) ;
                } else {
                    res.json({res:printStr}) ;
                }
                //res.json({res:printStr}) ;
            }
            //res.json({res:printStr}) ;// Print the google web page.
            //res.end();
        });
    })


}


exports.parseShippers= function(req, res){
    var code = req.params.searchStr
    ,resDoc=[];
    //console.log(code);
    var query = RegExp(code, "i");

    Shipper.find().exec(function(err,docs){
        async.eachSeries(docs,function(item,cb){
            //console.log(item)
            //console.log(item.id)
            Sparks.find({$and:[{'code': query},{shipper:item.id}]}).exec(function(err,sparks){
                //console.log(sparks);
                if (sparks.length>0){
                    resDoc[resDoc.length]={
                        shipper:item.name,
                        ratio:item.ratio,
                        ratioEnter:item.ratioEnter,
                        currency:item.currency,
                        sparks:sparks}
                }

                cb();
            });
        },function(e,r){
            res.json(resDoc);
        });
    });

}