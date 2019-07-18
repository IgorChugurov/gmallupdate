'use strict';
var StuffClass=require('../../../public/scripts/stuffClass.js')
var getUrl = require('../getUniqueUrl.js')
var myUtil=require('../myUtil.js');
var getUniqueUrl=require('../getUniqueUrl.js');
var storeAPI = require('../../../modules/store-api');
var forEach = myUtil.forEachForGenerators;

const util = require('util')
var Excel = require('exceljs');
var xml2js = require('xml2js');
var archiver = require('archiver');
//https://github.com/oozcitak/xmlbuilder-js
var xmlbuilder = require('xmlbuilder');


var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var domain = require('domain');
var ObjectID = mongoose.Types.ObjectId;
var fs = require('fs');
var mkdirp = require('mkdirp');

const writeFileAsync = util.promisify(fs.writeFile)




fs.mkdirParentPromise = function(dirPath) {
    return new Promise(function (rs,rj) {
        mkdirp(dirPath, function (err) {
            if (err) {rj(err)}
            else {rs()}
        });
    })



    /*fs.mkdir(dirPath, function(error) {
     //When it fail in this way, do the custom steps

     if (error ) { //&& error.errno === 34
     //Create all the parents recursively

     fs.mkdirParent(path.dirname(dirPath), callback);
     //And then the directory
     fs.mkdirParent(dirPath, callback);
     } else {
     //Manually run the callback since we used our own callback to do all these
     callback && callback(error);
     }
     });*/
};

var co = require('co');
var path = require('path');
let async=require('async')
var request=require('request')
//https://github.com/Leonidas-from-XIV/node-xml2js
var xml2js = require('xml2js');

var Group=mongoose.model('Group');
var Category=mongoose.model('Category');
var Brand=mongoose.model('Brand');
var BrandTags=mongoose.model('BrandTags');
var Stat=mongoose.model('Stat');
var Paps=mongoose.model('Paps');
var Coupon=mongoose.model('Coupon');
var Witget=mongoose.model('Witget');
var Master=mongoose.model('Master');
var Keywords=mongoose.model('Keywords');
var Seopage=mongoose.model('Seopage');
var HomePage=mongoose.model('HomePage');
var Campaign=mongoose.model('Campaign');

var SortsOfStuff=mongoose.model('SortsOfStuff')


var Stuff=mongoose.model('Stuff');
var Link=mongoose.model('Link');
var News=mongoose.model('News');
var Filter=mongoose.model('Filter');
var FilterTags=mongoose.model('FilterTags');
var Info=mongoose.model('Info');


function prepareQuery(data,query,field,prop,pref,operator){
    //console.log(operator)
    try{
        if(data[field] && data[field].length){
            if(!query[pref]){query[pref]=[]}
            let q = {};
            q[prop]={};
            q[prop][operator]=data[field]
            query[pref].push(q)
        }
    }catch (err) {
        console.log(err)
    }

}
exports.getFile=async function(req,res,next){
    //console.log(req.params.url,req.store);
    try{
        let q={url:req.params.url,store:req.store._id}
        //console.log(q)
        let data = await Link.findOne(q).exec()
        //console.log(data)
        if(!data){
            let err = new Error('file not found')
            return next(err)
        }


        let query= {store:req.store._id};
        let pref='$or';
        let operator = '$in';
        if(data.revers){
            pref='$and';
            operator = '$nin';
        }
        prepareQuery(data,query,'categories','category',pref,operator);
        prepareQuery(data,query,'stuffs','_id',pref,operator);
        prepareQuery(data,query,'brands','brand',pref,operator);
        prepareQuery(data,query,'brandTags','brandTag',pref,operator);
        prepareQuery(data,query,'tags','tags',pref,operator);
        if(!data.allQtyIn){
            query.actived=true;
        }
        let stuffs = await Stuff.find(query).lean().populate('category','name nameL').populate('brand','name nameL').populate('brandTag','name nameL')
            .populate('tags','name nameL filter')
            .sort(({'index': -1})).exec();
        let filePath='./public/stores/'+ req.store.subDomain+'/'+ data.url;
        if(data.type=='excel'){
            filePath+='.xlsx'
        }else if(data.type=='xml'){
            filePath+='.xml'
        }
        let term = 24 * 60 * 60 * 1000;// сутки
        if(data.term){
            term = data.term * 60 * 60 * 1000
        }
        if(fs.existsSync(filePath)){
            let update = await needToUpdagte(filePath, term)
            console.log('next ',update)
            if(update){
                await getExcelFile(data,req.store,stuffs,filePath);
            }
        }else{
            await getExcelFile(data,req.store,stuffs,filePath);
        }

        let  sendPath = path.join( __dirname, '../../..',filePath );
        if (fs.existsSync(filePath)) {
            res.sendFile(sendPath);
        } else {
            res.statusCode = 404;
            res.write('404 sorry not found');
            res.end();
        }



        //res.send(file);

    }catch(err){
        return next(err)
    }

}

async function getExcelFile(data,store,items,filePath) {
   //console.log(stuffs.length);
    let lang=(data.lang)?data.lang:'ru'
    let currency=(data.currency)?data.currency:'UAH';
    var rate=(store.currency[currency.toUpperCase()])?store.currency[currency.toUpperCase()][0]:store.currency[store.mainCurrency][0]
    let stuffIdForXML=1,stuffUpdate={},groupsForUpdate={},categoriesForUpdate={},categoriesToXMLid={};
    var categoriesWithId={}
    let filterTagsO={};
    let filtersO={};
    if(items.length){
        myUtil.setLangField(items,lang)
        items.forEach(function(s){
            if(s.idForXML && s.idForXML>=stuffIdForXML && s.idForXML<100000){
                stuffIdForXML++;
            }
        })
        items.forEach(function(s){
            if(!s.idForXML){
                s.idForXML=stuffIdForXML;
                stuffIdForXML++;
                stuffUpdate[s._id]={'idForXML':s.idForXML}
            }
        })
        items.forEach(function(s){
            if(s.idForXML<100000){
                let st;
                while (st = items.find(function(stt){
                    return (stt.idForXML==s.idForXML && s.id!=stt.id)
                })){
                    stuffIdForXML+=1;
                    s.idForXML=stuffIdForXML;
                    stuffUpdate[s._id]={'idForXML':s.idForXML}
                }
            }
        })
        let filters = await Filter.find({store:store._id}).lean().exec()
        let filterTags = await FilterTags.find({store:store._id}).lean().exec()
        filterTags.forEach(t=>{
            t._id=t._id.toString();
            filterTagsO[t._id]=t;
        })
        myUtil.setLangField(filters,lang);
        //console.log(filters)

        filters.forEach(f=>{
            f.tags=f.tags.map(t=>t.toString())
            filtersO[f._id.toString()]=f;
        })
        let d = new Date();
        var configIP=require('../../config/config.js')
        var photoHost="http://"+configIP.photoDownload;
        if(data.type=='excel'){
            var workbook = new Excel.Workbook();
            var sheetStuff = workbook.addWorksheet('Export Products Sheet');
            let columns = [];
            data.rows.forEach(function (r,i) {
                let o ={
                    header:r.name,
                    key:'a'+i
                }
                //d['a'+i]=i;
                columns.push(o)
            })
            sheetStuff.columns=columns;
        }else if(data.type=='xml'){
            try {
                let groups = await Group.find({store:store._id}).populate('categories').lean().exec();
                myUtil.setLangField(groups,lang)
                let sections=[];
                groups.forEach(function(sec,ii){
                    sec.categories=sec.categories.filter(function(el){return el && el._id} )
                    sec.categories.forEach((el,i)=>{
                        myUtil.setLangField(el,lang);
                        el.index=i
                        el.section=sec.url;
                    })
                })
                groups.forEach((sec,ii)=>{
                    if(sec.level===0){
                        sec.child.filter(function(el){return el}).forEach(function (subsec,j) {
                            if(subsec){
                                for(let i=0;i<groups.length;i++){
                                    if(groups[i]._id.toString()==subsec.toString()){
                                        sec.child[j]=(groups[i].toObject)?groups[i].toObject():groups[i];
                                        sec.child[j].parent=sec._id;
                                        sec.child[j].section=sec.url;
                                        break;
                                    }
                                }
                            }

                        })
                        sec.child = sec.child.filter(function(el){return el && el.parent})
                        if(sec.child.length || sec.categories.length){
                            sections.push(sec);
                        }

                    }
                })
                let idForXMLGroup=1000;
                let idForXML=1;
                sections.forEach(function(s){
                    if(s.idForXML && s.idForXML>=idForXMLGroup && s.idForXML<100000){
                        idForXMLGroup++;
                    }
                    s.categories.forEach(function(c){
                        if(c.idForXML && c.idForXML>=idForXML && c.idForXML<100000){
                            idForXML++;
                        }
                    })
                    s.child.forEach(function (ss) {
                        if(ss.idForXML && ss.idForXML>=idForXMLGroup && ss.idForXML<100000){
                            idForXMLGroup++;
                        }
                        ss.categories.forEach(function(c){
                            if(c.idForXML && c.idForXML>=idForXML && c.idForXML<100000){
                                idForXML++;
                            }
                        })
                    })
                })
                sections.forEach(function(s){
                    if(!s.idForXML){
                        s.idForXML=idForXMLGroup;
                        idForXMLGroup++;
                        groupsForUpdate[s._id]={'idForXML':s.idForXML}
                    }
                    s.categories.forEach(function(c){
                        if(!c.idForXML){
                            c.idForXML=idForXML;
                            idForXML++;
                            categoriesForUpdate[c._id]={'idForXML':c.idForXML}
                        }
                        categoriesWithId[c._id.toString()]=c.idForXML
                    })
                    s.child.forEach(function (ss) {
                        if(!ss.idForXML){
                            ss.idForXML=idForXMLGroup;
                            idForXMLGroup++;
                            groupsForUpdate[ss._id]={'idForXML':ss.idForXML}
                        }
                        ss.categories.forEach(function(c){
                            if(!c.idForXML){
                                c.idForXML=idForXML;
                                idForXML++;
                                categoriesForUpdate[c._id]={'idForXML':c.idForXML}
                            }
                            categoriesWithId[c._id.toString()]=c.idForXML
                            //categoriesToXMLid[c._id]=c.idForXML;
                        })
                    })
                })

                let nameXml = (store.nameXml)?store.nameXml:store.name;
                //console.log("nameXML",nameXML)
                var feed = xmlbuilder.create('yml_catalog', { encoding: 'utf-8' }).att('date', d.toLocaleString())
                    .ele('shop')
                    .ele('name',nameXml).up()
                    .ele('company',store.name).up()
                    .ele('url',store.link).up()
                let currencies=feed.ele('currencies');
                for(let key in store.currency){
                    currencies.ele('currency',{id: key, rate:store.currency[key][0]}).up()
                }
                feed.up();
                let categories=feed.ele('categories');
                createCategories(categories,store,sections)


                var offers =feed.ele('offers')
            }catch(err){
                console.error(err);
            }
        }









        let dateNow = Date.now();
        let thirty_day=1000*60*60*24*30;
        let idx=-1;

        for(let stuff of items){
            let keys=[];
            if(stuff.stock){
                keys= Object.keys(stuff.stock).filter(function (t) {return t &&  t!='null'});
            }
            //console.log(data.allQtyIn)
            try{
                if(!data.allQtyIn){
                    if(!stuff.actived){
                        continue;
                    }
                    let is;
                    for(let jj =0;jj<keys.length;jj++){
                        if(is){break}
                        if(stuff.stock[keys[jj]].quantity && Number(stuff.stock[keys[jj]].quantity)>0){
                            is=true;
                        }
                    }
                    if(!is){
                        continue;
                    }
                }
            }catch(err){
                console.log(err)
            }

            stuff.currency=currency;
            myUtil.setLangField(stuff.brand,lang)
            myUtil.setLangField(stuff.category,lang)
            myUtil.setLangField(stuff.tags,lang)
            myUtil.setLangField(stuff.brandTag,lang)
            //console.log(stuff.name)
            try{
                idx++;
                if(stuff.archived){
                    continue;
                    let d = new Date(stuff.archivedDate).getTime()
                    let difference = Math.round((dateNow-d)/thirty_day);
                    if(stuff.artikul=="ЮЛИЯ голубая"){
                        console.log('difference',difference)
                    }
                }




                if(!stuff.currency){stuff.currency=store.mainCurrency}
                StuffClass.setPrice(stuff,store,currency.toUpperCase());
                StuffClass.setRate(stuff,rate);
                stuff.gallery.sort(function(a,b){return a.index-b.index});
                stuff.galleryArch=[];
                /* изображения*/
                stuff.imgs = stuff.gallery.reduce(function (imgs,img) {
                    if(img && img.img){
                        if( img.img.charAt(0) === '/' && img.img.charAt(1) === '/'){
                            img.img=img.img.substr(1)
                        }else if(img.img.charAt(0) !== '/'){
                            img.img='/'+img.img;
                        }
                        stuff.galleryArch.push(img.img)
                        if(imgs){imgs+=','}
                        //imgs+=photoHost+img.img
                        imgs+=store.link+img.img
                        return imgs;
                    }else{
                        return imgs
                    }
                },'');
                if(data.type==='xml'){
                    stuff.imgs=stuff.imgs.split(',');
                }
                //console.log(stuff.imgs)
                let pathForImgsArchFolder = "./public/images/"+store.subDomain+'/Stuff/'+stuff.url;
                await fs.mkdirParentPromise(pathForImgsArchFolder);
                stuff.pathForImgsArch=pathForImgsArchFolder+'/'+stuff.url+'.zip'
                stuff.pathForImgsArchWithDomain = store.link + "/images/"+store.subDomain+'/Stuff/'+stuff.url+'/'+stuff.url+'.zip';
                if(!fs.existsSync(stuff.pathForImgsArch)) {
                    await createZipWithImgs(stuff.galleryArch, stuff.pathForImgsArch)
                }
                stuff.zipImg=stuff.pathForImgsArchWithDomain;
                //let separator =(data.separator)?data.separator:' ';
                //if(separator===','){separator+=' '};
                if(stuff.stock){

                    let keys= Object.keys(stuff.stock).filter(function (t) {return t &&  t!='null'}).sort();


                    keys.forEach((key,i)=>{
                        stuff.stock[key].index=i+1;
                    })
                    //let idForXML =stuff.idForXML*100000;
                    for(let sortTag in stuff.stock){
                        stuff.linkWithSort=stuff.link+((sortTag!=='notag')?'?sort='+sortTag:'');
                        if(!stuff.stock[sortTag]){continue}
                        if(!data.allQtyIn && (!stuff.stock[sortTag] || Number(stuff.stock[sortTag].quantity)<1)){
                            continue
                        }
                        let  idForXML = stuff.idForXML*100000+stuff.stock[sortTag].index;
                        //console.log(stuff.idForXML,idForXML)
                        let ooo = {id: idForXML,available:true};

                        let offer;
                        if(offers){
                            offer = offers.ele('offer',ooo)
                        }

                        //let o = {id: stuff.idForXML,available:true}

                        let keywords=[];
                        try{
                            let o ={};
                            let aXML=[]
                            data.rows.forEach(function (r,i) {
                                let separator ='';
                                if(r.separator && r.separator.length){
                                    r.separator.forEach(s=>{
                                        separator +=s;
                                    })
                                }
                                o['a'+i]={v:''};

                                if(r.value && r.value.length){
                                    r.value.forEach(v=>{
                                        if(o['a'+i].v){o['a'+i].v+=separator;}
                                        let s = getStuffValue(stuff,sortTag,v);

                                        if(v==='quantity'){
                                            let q = Number(s);
                                            if(!data.allQty){
                                                if(q){
                                                   o['a'+i].v= '1';
                                               }else{
                                                   o['a'+i].v= '0';
                                               }
                                            }else{
                                                if(q){
                                                   if(data.maxQty){
                                                       if(q<data.maxQty){
                                                           o['a'+i].v = q;
                                                       }else{
                                                           o['a'+i].v= data.maxQty;
                                                       }
                                                   }else{
                                                       o['a'+i].v= q;
                                                   }
                                                }else{
                                                   o['a'+i].v= '0';
                                                }
                                            }
                                        }else{
                                            if(!o['a'+i].v){
                                                o['a'+i].v= s;
                                            }else{
                                                o['a'+i].v+= s;
                                            }

                                        }
                                    })
                                }else if(r.filter && r.filter.length){

                                    let filtersArr = [];
                                    let filtersArrO = {};
                                    r.filter.forEach(ff=>{
                                        //let filterForArr = filters.find(f=>f._id.toString()===ff);
                                        let filterForArr = filtersO[ff];
                                        if(filterForArr){
                                            filtersArr.push(filterForArr);
                                            filtersArrO[filterForArr._id.toString()]=filterForArr
                                        }
                                    })
                                    /*если один из фильтров является фильтром разновидности, то используем только тег из сорта*/
                                    let filterSort;
                                    if(stuff.stock && !stuff.stock['notag']){
                                        for(let k of keys){
                                            if(filterSort){break}
                                            for(let j = 0;j<filtersArr.length;j++){
                                                if(filtersArr[j].tags.indexOf(k)>-1){
                                                    filterSort=true;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    if(filterSort){
                                        let t = filterTagsO[sortTag];
                                        if(t){
                                            o['a'+i].v=t.name;
                                        }
                                    }else{
                                        stuff.tags.forEach(t=> {
                                            if(filtersArrO[t.filter.toString()]){
                                                let n =filtersArrO[t.filter.toString()].tags.indexOf(t._id.toString())
                                                if(n>-1){
                                                    if(o['a'+i].v){o['a'+i].v+=separator;}
                                                    o['a'+i].v+= t.name;;
                                                }
                                            }

                                        })
                                    }
                                }
                                let ar = r.name.split(' ');
                                let name = ar[0];
                                if(ar[1]){
                                    let ar1 = ar[1].split('=');
                                    if(ar1[0] && ar1[1]){
                                        let o2 ={};
                                        o2[ar1[0]]=ar1[1];
                                        o['a'+i].attrs =o2;
                                    }

                                }
                                let kk = getUniqueUrl.url_slug(name);
                                let oXML = {};
                                if(o['a'+i].attrs){
                                    oXML[kk]=[{v:o['a'+i].v,attrs:o['a'+i].attrs}];
                                }else{
                                    oXML[kk]=o['a'+i].v;
                                }
                                aXML.push(oXML);

                            })

                            //let offer = offers.ele('offer',o)
                            //console.log(aXML)
                            if(offer){
                                for(let oXML of aXML){
                                    for(let tag in oXML){
                                        if(Array.isArray(oXML[tag])){
                                            oXML[tag].forEach(d=>{
                                                if(typeof d==='object'){
                                                    offer.ele(tag,d.attrs,d.v).up()
                                                }else{
                                                    offer.ele(tag,d).up()
                                                }

                                            })
                                        }else{
                                            offer.ele(tag,oXML[tag]).up()
                                        }

                                    }
                                }
                            }

                            let oo={}
                            for(let k in o){
                                if(Array.isArray(o[k].v)){
                                    let result  = o[k].v.reduce((a,i)=>{
                                        if(typeof i==='object'){
                                            if(a){a+=','}
                                            a+=i.v;
                                        }else{
                                            if(a){a+=','}
                                            a+=i;
                                        }
                                        return a;
                                    },'')
                                    oo[k]=result;
                                }else{
                                    oo[k]=o[k].v
                                }

                            }
                            if(sheetStuff){
                                sheetStuff.addRow(oo)
                            }


                        }catch(err){console.log(err)}



                    }
                }

            }catch (e) {
                console.log(e)
                break

            }



        }
        //console.log(data.type)
        if(data.type=='excel'){
            await workbook.xlsx.writeFile(filePath);
        }else if(data.type=='xml'){
            try {
                const res = await writeFileAsync(filePath, feed.end({ pretty: true }))
                console.log(res)

                /*fs.writeFile(filePath, feed.end({ pretty: true }), (err) => {
                    if (err) throw err;
                    console.log('It\'s saved!!!!!');
                });*/
            }catch(err){
                console.error(err);
            }
        }
        return filePath;

    }
    function getStuffValue(stuff,sort,v) {
        if(v==='name' || v==='artikul' || v==='desc'|| v==='imgs' || v==='zipImg' || v==='currency'){
            return stuff[v];
        }else if(v==='price' || v==='retail' || v==='priceSale' || v==='quantity'){
            return stuff.stock[sort][v];
        }else if(v==='brand' || v==='brandTag'){
            return ((stuff[v] && stuff[v].name)?stuff[v].name:'');
        }else if(v==='category'){
            if(stuff.category.length){
                let c='';
                stuff.category.forEach(cc=>{
                    if(c){c+=','};
                    c+=cc.name;
                })
                return c;
            }else{
                return stuff[v].name;
            }

        }else if(v==='categoryId'){
            let c;
            if(stuff.category.length){
                c =stuff.category[0]._id.toString();
            }else{
                c =stuff.category._id.toString();
            }
            if(c){
                return categoriesWithId[c]
            }


        } else if(v==='url'){
            return store.link+stuff.linkWithSort
        } else if(v==='currencyId'){
            return stuff.currency
        }else if(v==='sort'){
            if(sort!='notag' && filterTagsO[sort]){
                return filterTagsO[sort].name;
            }else{
                return ''
            }


        } else if(v==='tags'){
            if(stuff.tags && stuff.tags.length){
                let filterForSort;
                if(sort!='notag'){
                    if(filterTagsO[sort]){
                        filterForSort = filterTagsO[sort].filter.toString()
                    }
                }
                let result = stuff.tags.reduce((accumulator, currentValue)=>{
                    let tag =currentValue._id.toString();
                    let filter =currentValue.filter.toString();
                    if(filterForSort && filterForSort===filter && tag!==sort){
                        /*пропускаем теги разновидности*/
                        //console.log("пропускаем теги разновидности")
                        return accumulator
                    }
                    let o={attrs:{},v:''}
                    if(filterTagsO[tag]){
                        o.attrs.name=filtersO[filter].name;
                        o.v=filterTagsO[tag].name;
                        accumulator.push(o)
                    }
                    return accumulator;
                },[])
                    //console.log(result)
                return result
            }else{
                return ''
            }
        }
    }
    function createCategories(categories,store,groups) {
        //console.log('razdel',razdel)
        /* создание списка категорий 1. корневой раздел не учитывается.*/
        /* для прома длобавляем две новых категории если они есть в настройках магазина*/
        let upCategory;

        if(upCategory){
            let o = {id: upCategory.idForXML}
            categories.ele('category',o,upCategory.name).up()
        }

        groups.forEach(function(section){
            //console.log('section.idForXML',section.idForXML)
            //categories.ele('category',{id: section.idForXML},section.name).up()
            if(upCategory){
                section.idForXML +=upCategory.idForXML;
            }
            let o = {id:section.idForXML}
            if(upCategory){
                o.parentId=upCategory.idForXML;
            }
            categories.ele('category',o,section.name).up()


            section.categories.forEach(function(category){
                //console.log('category.idForXML',category.idForXML)
                if(upCategory){
                    category.idForXML +=upCategory.idForXML;
                }
                let o = {id: category.idForXML}
                o.parentId=section.idForXML;
                categories.ele('category',o,category.name).up()

                categoriesToXMLid[category._id]=category.idForXML;
            })
            section.child.forEach(function(child){
                if(upCategory){
                    child.idForXML +=upCategory.idForXML;
                }
                let o = {id: child.idForXML}
                o.parentId=section.idForXML;
                categories.ele('category',o,child.name).up()
                child.categories.forEach(function(category){
                    categories.ele('category',{id: category.idForXML, parentId:child.idForXML},category.name).up()
                    categoriesToXMLid[category._id]=category.idForXML;
                })
            })
        })
    }
}



function needToUpdagte(filePath,term){
    return new Promise(function (rs,rj) {
        fs.stat(filePath,function(err,stat){
            if(err){return rs(false)}
            /*console.log(err,stat)
            console.log(stat.birthtime)*/
            var birthtime = new Date(stat.birthtime);
            var nowTime=new Date();
            //console.log(birthtime,nowTime)
            let timeDiff = Math.abs(nowTime.getTime() - birthtime.getTime());
            //console.log(timeDiff,term)
            if(timeDiff>term){
                rs(true)
            }else{
                rs(false)
            }

            //stat.birthtime
        })
    })
}

exports.downloadCatalog=function(req,res,next){
    /*console.log(req.params)
    console.log(req.query)*/
    //let store = req.store._id;
    var configIP=require('../../config/config.js')
    var photoHost="http://"+configIP.photoUpload;
    var filePath='./public/downloads/'+
        req.params.subDomain+'/'+
        req.params.lang+'/'+
        req.params.currency+'/'+
        req.params.brand+'/'+
        req.params.file;
    //let createUpFolder;
    //console.log(filePath)



    Promise.resolve()
        .then(function(){
            let folder='./public/downloads/'+
                req.params.subDomain+'/'+
                req.params.lang+'/'+
                req.params.currency+'/'+
                req.params.brand;
            //console.log(folder)
            return fs.mkdirParentPromise(folder)
        })
        .then(function () {
            //console.log('working')

            if (fs.existsSync(filePath)) {
                co(function* () {
                    let term = 24 * 60 * 60 * 1000;
                    term = 1 * 1000;// minute
                    let update = yield needToUpdagte(filePath, term)
                    console.log('next ',update)
                    if(update){
                        yield updateFileCatalog(filePath,req)
                        //console.log('OK update')
                        next()
                    }else{
                        next()
                    }

                }).catch(function(err){
                    console.log('co catch err - ',err)
                    res.writeHead(400, {"Content-Type": "text/plain"});
                    res.end("ERROR File does NOT Exists");
                })
            }else{
                updateFileCatalog(filePath,req).then(function(){
                    console.log('OK not exist')
                    next()
                }).catch(function (err) {
                    console.log(err)
                    res.writeHead(400, {"Content-Type": "text/plain"});
                    res.end("ERROR File does NOT Exists");
                })
            }
            return;

            fs.exists(filePath, function(exists){
                //http://stackoverflow.com/questions/10046039/nodejs-send-file-in-response
                if (exists && false) {


                } else {


                }
            });

        })
        .catch(function (err) {
            console.log(err)
        })



    return;
    // Check if file specified by the filePath exists




}
function updateFileCatalog(filePath,req){
    return new Promise(function (rs,rj) {
        storeAPI.getStoreSubDomain(req,null,function(err){
            if(err){return rj(err)}
            //console.log(err)
            //console.log(req.store.domain)
            //console.log(typeFile)
            // create xml file!!!!!!
            createFile(filePath,req).then(function () {
                rs()
            }).catch(function (err) {
                rj(err)
            })
        })
    })
}




function createFile(filePath,req) {
    let typeFile;
    let typeCatelog;
    let razdel;
    let{subDomain,lang,currency} = req.params;
    let store=req.store;
    var rate=(store.currency[currency.toUpperCase()])?store.currency[currency.toUpperCase()][0]:store.currency[store.mainCurrency][0]
    //console.log(store.currency[currency.toUpperCase()])
    let brands,categories,brandTags,filters,filterTags,filterTagsO,groups,sortFilter,stuffs,sortsOfStuff;
    let sortsOfStuffUpdate={},stuffUpdate={};
    let brandsForUpdate={},categoriesForUpdate={},brandTagsForUpdate={},filterTagsForUpdate={},groupsForUpdate={};
    let stuffIdForXML=1;
    let sortIdForXML=1;
    let categoriesToXMLid={};

    return new Promise(function (rs,rj) {
        Promise.resolve()
            .then(function(){
                try{
                    typeFile=req.params.file.split('.');
                    let typeCatelogArr=typeFile[0].split('_');
                    typeCatelog=typeCatelogArr[typeCatelogArr.length-1].toLowerCase()
                    if(typeCatelogArr.length>2 && typeCatelogArr[typeCatelogArr.length-2].toLowerCase()=='razdel'){
                        razdel=true;
                    }

                    typeFile=typeFile[typeFile.length-1].toLowerCase()
                    /*console.log('razdel',razdel)
                    console.log('typeCatelog',typeCatelog)
                    console.log('typeFile',typeFile)*/
                }catch(err){throw err}

            })
            .then(function () {
                return new Promise(function (rs,rj) {
                    Brand.find({store:req.store._id}).populate('tags').exec(function(err,items){
                        if(err){rj(err)}
                        //console.log(1)
                        myUtil.setLangField(items,lang)
                        brands=items
                        let brandIdForXML=1;
                        items.forEach(function(s){
                            //console.log(s.name,s.idForXML)
                            if(s.idForXML && s.idForXML>=brandIdForXML && s.idForXML<100000){
                                brandIdForXML++;
                            }
                        })
                        items.forEach(function(s){
                            //console.log(s._id)
                            if(s.idForXML<100000 || !s.idForXML){
                                //console.log(s.idForXML)
                                if(!s.idForXML){
                                    brandIdForXML+=1;
                                    s.idForXML=brandIdForXML;
                                    brandsForUpdate[s._id]={'idForXML':s.idForXML}
                                }
                                //console.log(s.name,s.idForXML)
                                let st;
                                while (st = items.find(function(stt){
                                    return (stt.idForXML==s.idForXML && s.id!=stt.id)
                                })){
                                    /*console.log(s.id,st.id)
                                     console.log('st.idForXML ',st.idForXML)*/
                                    brandIdForXML+=1;
                                    st.idForXML=brandIdForXML;
                                    //console.log('s.idForXML после ',s.idForXML,s.name,s._id)
                                    brandsForUpdate[s._id]={'idForXML':s.idForXML}
                                }
                            }
                        })
                        //console.log(brandsForUpdate)
                        rs()
                    })
                })

            })
            .then(function () {
                return new Promise(function (rs,rj) {
                    Group.list({criteria:{store:req.store._id},perPage:100,page:0,req:req},function(err,items){
                        if(err){rj(err)}
                        //console.log(2)
                        myUtil.setLangField(items,lang)
                        //console.log(items[0].categories[0])
                        groups=items
                        //console.log(groups)
                        let idForXMLGroup=1000;
                        let idForXML=1;
                        items.forEach(function(s){
                            if(s.idForXML && s.idForXML>=idForXMLGroup && s.idForXML<100000){
                                idForXMLGroup++;
                            }
                            s.categories.forEach(function(c){
                                if(c.idForXML && c.idForXML>=idForXML && c.idForXML<100000){
                                    idForXML++;
                                }
                            })
                            s.child.forEach(function (ss) {
                                if(ss.idForXML && ss.idForXML>=idForXMLGroup && ss.idForXML<100000){
                                    idForXMLGroup++;
                                }
                                ss.categories.forEach(function(c){
                                    if(c.idForXML && c.idForXML>=idForXML && c.idForXML<100000){
                                        idForXML++;
                                    }
                                })
                            })
                        })
                        items.forEach(function(s){
                            if(!s.idForXML){
                                s.idForXML=idForXMLGroup;
                                idForXMLGroup++;
                                groupsForUpdate[s._id]={'idForXML':s.idForXML}
                            }
                            s.categories.forEach(function(c){
                                if(!c.idForXML){
                                    c.idForXML=idForXML;
                                    idForXML++;
                                    categoriesForUpdate[c._id]={'idForXML':c.idForXML}
                                }
                                //categoriesToXMLid[c._id]=c.idForXML;
                            })
                            s.child.forEach(function (ss) {
                                if(!ss.idForXML){
                                    ss.idForXML=idForXMLGroup;
                                    idForXMLGroup++;
                                    groupsForUpdate[ss._id]={'idForXML':ss.idForXML}
                                }
                                ss.categories.forEach(function(c){
                                    if(!c.idForXML){
                                        c.idForXML=idForXML;
                                        idForXML++;
                                        categoriesForUpdate[c._id]={'idForXML':c.idForXML}
                                    }
                                    //categoriesToXMLid[c._id]=c.idForXML;
                                })
                            })
                        })
                        rs()
                    })
                })

            })
            .then(function () {
                return new Promise(function (rs,rj) {
                    FilterTags.find({store:req.store._id}).lean().exec(function(err,items){
                        if(err){rj(err)}
                        //console.log(3)
                        myUtil.setLangField(items,lang)
                        filterTags=items
                        filterTagsO==items.reduce(function (o,i) {
                           return o[i._id]=i;
                        },{})

                        //console.log(groups)
                        rs()
                    })
                })

            })
            .then(function () {
                return new Promise(function (rs,rj) {
                    Filter.find({store:req.store._id}).populate('tags').lean().exec(function(err,items){
                        if(err){rj(err)}
                        //console.log(4)
                        myUtil.setLangField(items,lang)
                        filters=items;
                        if(typeCatelog=='prom'){
                            if(store.saleTag){
                                store.saleTag=filterTags.find(function (t) {
                                    return t.url==store.saleTag;
                                })
                                if(store.saleTag){
                                    /* store.saleTag.filter=filters.find(function(f){
                                     return f._id.toString()==store.saleTag.filter.toString()
                                     })*/
                                    categoriesToXMLid[store.saleTag._id]=1000001;
                                }
                            }
                            if(store.newTag){
                                store.newTag=filterTags.find(function (t) {
                                    return t.url==store.newTag;
                                })
                                if(store.newTag){
                                    /*store.newTag.filter=filters.find(function(f){
                                     return f._id.toString()==store.newTag.filter.toString()
                                     })*/
                                    categoriesToXMLid[store.newTag._id]=1000002;
                                }
                            }

                            //console.log(categoriesToXMLid)
                            //console.log(store.saleTag,store.newTag)
                        }
                        filterTags.forEach(function(tag){
                            let filter=filters.find(function (f) {
                                return f._id.toString()==tag.filter.toString()
                            })
                            tag.filter=filter;

                        })
                        rs()
                    })
                })
            })
            .then(function () {
                return new Promise(function (rs,rj) {
                    let idForXML=1;
                    BrandTags.find({store:req.store._id}).exec(function(err,items){
                        if(err){rj(err)}
                        //console.log(5)
                        myUtil.setLangField(items,lang)
                        brandTags=items

                        rs()
                    })
                })
            })
            .then(function () {
                return new Promise(function (rs,rj) {
                    //{store:"578f5d1598238914569a1d39"}
                    /*console.log('578f5d1598238914569a1d39')
                     console.log(req.store._id)*/
                    let storeId = req.store._id.toString();
                    //console.log(storeId)
                    //{store:'578f5d1598238914569a1d39'}
                    /*{store:req.store._id}*/
                    SortsOfStuff.find().exec(function(err,items){
                        //console.log(items.filter(function(s){return s.store=='578f5d1598238914569a1d39'}))
                        if(err){rj(err)}
                        sortsOfStuff=items.filter(function(s){return s.store==storeId})
                        //console.log(sortsOfStuff.length)
                        items.forEach(function(s){
                            if(s.idForXML && s.idForXML>=sortIdForXML && s.idForXML<100000){
                                sortIdForXML++;
                            }
                            s.stuffs=s.stuffs.filter(function (s) {
                                return((s)?s.toString():null)
                            })
                        })
                        items.forEach(function(s){
                            if(!s.idForXML){
                                s.idForXML=sortIdForXML;
                                sortIdForXML++;
                                sortsOfStuffUpdate[s._id]={'idForXML':s.idForXML}
                            }
                        })
                        rs()
                    })
                })
            })
            .then(function () {
                return new Promise(function (rs,rj) {

                    let o={store:req.store._id}

                    Stuff.find(o).lean().populate('brand').populate('brandTag').sort(({'index': -1})).exec(function(err,items){
                        myUtil.setLangField(items,lang)
                        if(err){rj(err)}
                        items.forEach(function(s){
                            if(s.idForXML && s.idForXML>=stuffIdForXML && s.idForXML<100000){
                                stuffIdForXML++;
                            }
                        })

                        items.forEach(function(s){
                            //console.log('s.sortsOfStuff',s.sortsOfStuff,s.stock)
                            /*if(s.artikul=='KIM электрик'){
                             console.log('s.sortsOfStuff',s.sortsOfStuff,s.stock)
                             }*/
                            if(s.sortsOfStuff){
                                s.sortsOfStuff=sortsOfStuff.getOFA('_id',s.sortsOfStuff.toString())
                                //console.log(s.sortsOfStuff.idForXML)
                            }
                            //s.category=categories.getOFA('_id',s.category.toString())
                            if(!s.idForXML){
                                s.idForXML=stuffIdForXML;
                                stuffIdForXML++;
                                stuffUpdate[s._id]={'idForXML':s.idForXML}
                            }
                            /*if(s.idForXML<100){
                             console.log('s.idForXML',s.idForXML)
                             }*/

                        })

                        items.forEach(function(s){


                            if(s.idForXML<100000){
                                //console.log(s.idForXML)
                                let st;
                                while (st = items.find(function(stt){
                                    return (stt.idForXML==s.idForXML && s.id!=stt.id)
                                })){
                                    /*console.log(s.id,st.id)
                                     console.log('st.idForXML ',st.idForXML)*/
                                    stuffIdForXML+=1;
                                    s.idForXML=stuffIdForXML;
                                    //console.log('st.idForXML после ',st.idForXML)
                                    stuffUpdate[s._id]={'idForXML':s.idForXML}
                                }
                            }
                        })
                        if(req.params.brand!='all'){
                            let b = brands.find(function(bb){return bb.url==req.params.brand})
                            if(b){
                                stuffs=items.filter(function(item){return item.brand && item.brand._id && item.brand._id.toString()==b._id.toString()})
                            }
                        }else{
                            stuffs=items;
                        }
                        rs()
                    })
                })
            })
            .then(function () {
                if(typeFile=='xml'){
                    createXMLFile()
                }else if(typeFile=='xlsx'){
                    createXLSXFile()
                }else{
                    rj(err)
                }
            })
            .then(function (sortsOfStuffUpdate) {
                //console.log('sortsOfStuffUpdate',sortsOfStuffUpdate)
                return myUtil.getPromiseForUpdateInDB(sortsOfStuffUpdate,SortsOfStuff);
            })
            .then(function (sortsOfStuffUpdate) {
                //console.log('stuffUpdate',stuffUpdate)
                return myUtil.getPromiseForUpdateInDB(stuffUpdate,Stuff);
            })
            .then(function (sortsOfStuffUpdate) {
                //console.log('stuffUpdate',stuffUpdate)
                return myUtil.getPromiseForUpdateInDB(categoriesForUpdate,Category);
            })
            .then(function (sortsOfStuffUpdate) {
                //console.log('stuffUpdate',stuffUpdate)
                return myUtil.getPromiseForUpdateInDB(groupsForUpdate,Group);
            })
            .then(function () {
                //console.log('stuffUpdate',stuffUpdate)
                return myUtil.getPromiseForUpdateInDB(brandsForUpdate,Brand);
            })
            .then(function () {
                //console.log('done update')
            })
            .catch(function (err) {
                rj(err)
            })

        async function createXLSXFile() {
            var d = new Date("2015-03-25");
            var configIP=require('../../config/config.js')
            var photoHost="http://"+configIP.photoDownload;
            let filterSort,brandOffer;
            //let idForXML=Date.now();
            let tagsObject={};
            var workbook = new Excel.Workbook();
            var sheetStuff = workbook.addWorksheet('Export Products Sheet');
            var sheetCategories = workbook.addWorksheet('Export Groups Sheet');
            sheetCategories.columns = [
                { header: 'Номер_группы', key: 'vvv'},
                { header: 'Название_группы', key: 'name'},
                { header: 'Идентификатор_группы', key: 'id'},
                { header: 'Номер_родителя', key: 'vvv1'},
                { header: 'Идентификатор_родителя', key: 'parentId'},
            ]
            sheetStuff.columns = [
                { header: 'Код_товара', key: 'artikul'},
                { header: 'Название_позиции', key: 'name'},
                { header: 'Ключевые_слова', key: 'keywords'},
                { header: 'Описание', key: 'desc'},
                { header: 'Тип_товара', key: 'selling_type'},
                { header: 'Цена', key: 'price'},
                { header: 'Валюта', key: 'currency'},
                { header: 'Единица_измерения', key: 'unitOfMeasure'},
                { header: 'Минимальный_объем_заказа', key: 'minQty'},
                { header: 'Оптовая_цена', key: 'price11'},
                { header: 'Минимальный_заказ_опт', key: 'minOptQty'},
                { header: 'Ссылка_изображения', key: 'imgs'},
                { header: 'Наличие', key: 'available'},
                { header: 'Количество', key: 'quantity'},
                { header: 'Номер_группы', key: 'vvv'},
                { header: 'Название_группы', key: 'group_name'},
                { header: 'Адрес_подраздела', key: 'vvv1'},
                { header: 'Возможность_поставки', key: 'vvv2'},
                { header: 'Срок_поставки', key: 'vvv3'},
                { header: 'Способ_упаковки', key: 'vvv4'},
                { header: 'Уникальный_идентификатор', key: 'vvv5'},
                { header: 'Идентификатор_товара', key: 'idForXML'},
                { header: 'Идентификатор_подраздела', key: 'categoryId'},
                { header: 'Идентификатор_группы', key: 'vvv6'},

                { header: 'Производитель', key: 'vendor'},
                { header: 'Гарантийный_срок', key: 'garanty_time'},
                { header: 'Страна_производитель', key: 'country'},
                { header: 'Скидка', key: 'discount'},
                { header: 'ID_группы_разновидностей', key: 'group_id'},
                { header: 'Название_Характеристики', key: 'tags0Filter'},
                { header: 'Измерение_Характеристики', key: 'tags0UoM'},
                { header: 'Значение_Характеристики', key: 'tags0Name'},
                { header: 'Название_Характеристики', key: 'tags1Filter'},
                { header: 'Измерение_Характеристики', key: 'tags1UoM'},
                { header: 'Значение_Характеристики', key: 'tags1Name'},
                { header: 'Название_Характеристики', key: 'tags2Filter'},
                { header: 'Измерение_Характеристики', key: 'tags2UoM'},
                { header: 'Значение_Характеристики', key: 'tags2Name'},
                { header: 'Название_Характеристики', key: 'tags3Filter'},
                { header: 'Измерение_Характеристики', key: 'tags3UoM'},
                { header: 'Значение_Характеристики', key: 'tags3Name'},
                { header: 'Название_Характеристики', key: 'tags4Filter'},
                { header: 'Измерение_Характеристики', key: 'tags4UoM'},
                { header: 'Значение_Характеристики', key: 'tags4Name'},
                { header: 'Название_Характеристики', key: 'tags5Filter'},
                { header: 'Измерение_Характеристики', key: 'tags5UoM'},
                { header: 'Значение_Характеристики', key: 'tags5Name'},
                { header: 'Название_Характеристики', key: 'tags6Filter'},
                { header: 'Измерение_Характеристики', key: 'tags6UoM'},
                { header: 'Значение_Характеристики', key: 'tags6Name'},
                { header: 'Название_Характеристики', key: 'tags7Filter'},
                { header: 'Измерение_Характеристики', key: 'tags7UoM'},
                { header: 'Значение_Характеристики', key: 'tags7Name'},
                { header: 'Название_Характеристики', key: 'tags8Filter'},
                { header: 'Измерение_Характеристики', key: 'tags8UoM'},
                { header: 'Значение_Характеристики', key: 'tags8Name'},
                { header: 'zip', key: 'zipImg'},
            ];
            createCategories(sheetCategories,store,groups)
            //console.log('categoriesToXMLid',categoriesToXMLid)
            let dateNow = Date.now();
            let thirty_day=1000*60*60*24*30;
            let idx=-1;
            for(let stuff of stuffs){
                /*if(s._id.toString()=='5b080a2464f02064abf47811'){
                    console.log(s.name,s.id)
                }*/

                idx++;

                if(stuff.archived){
                    let d = new Date(stuff.archivedDate).getTime()
                    let difference = Math.round((dateNow-d)/thirty_day);
                    //console.log('difference',difference)
                    if(difference){
                        continue;
                    }
                }
                //if(idx>10){return}
                if(!stuff.currency){stuff.currency=store.mainCurrency}
                StuffClass.setPrice(stuff,store,currency.toUpperCase());
                StuffClass.setRate(stuff,rate);
                if(typeCatelog=='prom'){
                    /* для прома меняем категорю товара на новую категорию новинки или сейл. если они присутствуют*/
                    if(store.saleTag && stuff.tags.some(function(t){return store.saleTag._id.toString()==t.toString()})){
                        stuff.category=store.saleTag._id;
                    }else if(store.newTag && stuff.tags.some(function(t){return store.newTag._id.toString()==t.toString()})){
                        stuff.category=store.newTag._id;
                    }
                }
                if(stuff.sortsOfStuff && stuff.sortsOfStuff.filter){

                    if(!filterSort || filterSort._id.toString()!=stuff.sortsOfStuff.filter.toString()){
                        filterSort = filters.getOFA('_id',stuff.sortsOfStuff.filter.toString())
                    }
                    /*if(stuff.artikul=='FILM красная'){
                        console.log('filterSort',filterSort)
                    }*/


                    if(filterSort || true){

                        // с разновидностями
                        if(stuff.stock && !stuff.stock['notag']){
                            let keys= Object.keys(stuff.stock).filter(function (t) {return t &&  t!='null'});
                            let tags = stuff.tags.filter(function(t){return t}).map(function(t){return t.toString()});
                            // убираем теги разновидностей
                            for(let iii=0;iii<keys.length;iii++){
                                let a = tags.indexOf(keys[iii]);
                                if(a>-1){
                                    tags.splice(a,1)
                                }
                            }


                            let qty=0;
                            // количество для оболочки
                            keys.forEach(function(k){
                                if(stuff.stock[k] && Number(stuff.stock[k].quantity)){
                                    qty=1;
                                }
                            })
                            let tagsForGroup=[];
                            tagsForGroup=tags;
                            if(typeCatelog=='gmall'){
                                // товар с разновидностями выводится в одну строчку
                                tagsForGroup=keys;
                            }
                            /*if(stuff._id.toString()=='5b080a2464f02064abf47811'){
                                console.log(stuff.artikul)
                                console.log(stuff.artikulL)
                            }*/
                            await createRow(sheetStuff,stuff,tagsForGroup,{price:stuff.price,priceSale:stuff.priceSale,quantity:qty},true);

                            if(typeCatelog=='prom'){
                                for(let tag of keys){
                                    stuff.idForXML+=1000000;
                                    if(tag){
                                        await  createRow(sheetStuff,stuff,[tag],stuff.stock[tag]);
                                    }
                                }

                            }

                        }
                    }else{
                        console.log('нет такого фильтара разновидностей')
                    }
                }else{
                    //без разновидностей
                    //console.log('без разновидностей')
                    await createRow(sheetStuff,stuff,stuff.tags,stuff.stock['notag'],true);
                }
            }



            //console.log('saving')
            workbook.xlsx.writeFile(filePath)
                .then(function() {
                    console.log('done xlsx')
                    rs()
                })
                .catch(rj);

            async function createRow(sheetStuff,stuff,tags,prices,wrapper) {
                //if(!prices){console.log(stuff.name,stuff.artikul)}
                let available= (prices && prices.quantity && stuff.actived && !stuff.archived)?'+':'-';
                if(typeCatelog!='prom' && !available){available='-'}
                if(stuff.service){
                    stuff.selling_type="s"
                }
                if(req.store.seller.opt){
                    stuff.selling_type="u"
                }else{
                    stuff.selling_type="r"
                }
                stuff.group_id=null;
                if(stuff.sortsOfStuff && stuff.sortsOfStuff._id){
                    if(typeCatelog=='prom'){
                        let ii = stuff.sortsOfStuff.stuffs.indexOf(stuff._id.toString())
                        if(ii<0){
                            ii=0;
                        }
                        stuff.group_id=ii*1000000+stuff.sortsOfStuff.idForXML;
                    }else{
                        stuff.group_id=stuff.sortsOfStuff.idForXML;
                    }
                }

                if(prices && prices.price){
                    if(prices.priceSale){
                        //offer.ele('price',prices.priceSale).up()
                        //offer.ele('oldprice',prices.price).up()
                    }else{
                        //offer.ele('price',prices.price).up()
                    }

                }
                let categoryId=(categoriesToXMLid[stuff.category])?categoriesToXMLid[stuff.category]:null;
                let vendor=(stuff.brand && stuff.brand.name)?stuff.brand.name:null;

                if(stuff.brand){
                    if(stuff.brandTag){
                        //offer.ele('collection',stuff.brandTag.name).up();
                    }
                }
                let keywords=[];
                let sort=0;
                //console.log('tags',tags)
                let oo={};
                //console.log(stuff.artikul,tags)
                stuff.tags0Filter=null
                stuff.tags0Name=null;
                stuff.tags1Filter=null
                stuff.tags1Name=null;
                stuff.tags2Filter=null
                stuff.tags2Name=null;
                stuff.tags3Filter=null
                stuff.tags3Name=null;
                stuff.tags4Filter=null
                stuff.tags4Name=null;
                stuff.tags5Filter=null
                stuff.tags5Name=null;
                stuff.tags6Filter=null
                stuff.tags6Name=null;
                stuff.tags7Filter=null
                stuff.tags7Name=null;
                stuff.tags8Filter=null
                stuff.tags8Name=null;

                if(typeCatelog=='gmall'){
                    tags.forEach(function (t,i) {
                        let tag;
                        let tt = (t.toString)?t.toString():t;
                        if(!tagsObject[tt]){
                            tag = filterTags.getOFA('_id',tt)
                            //tag = filterTagsO[tt]
                            if(tag){
                                tagsObject[tt]=tag;
                            }
                        }else{
                            tag=tagsObject[tt];
                        }
                        if(tag && stuff.stock[tt] && stuff.stock[tt].quantity){
                            if(!tag.filter.name){stuff['tags0Filter']=tag.filter.name}
                            if(stuff['tags0Name']){stuff['tags0Name']+=','}else{stuff['tags0Name']=''}
                            stuff['tags0Name']+=tag.name
                        }
                    })
                }else{
                    tags.forEach(function (t,i) {
                        let tag;
                        let tt = (t.toString)?t.toString():t;
                        if(!tagsObject[tt]){
                            tag = filterTags.getOFA('_id',tt)
                            //tag = filterTagsO[tt]
                            if(tag){
                                tagsObject[tt]=tag;
                            }
                        }else{
                            tag=tagsObject[tt];
                        }

                        if(tag){
                            keywords.push(tag.name)
                            if(i<9){
                                stuff['tags'+i+'Filter']=tag.filter.name
                                stuff['tags'+i+'Name']=tag.name
                            }
                            /*if(!i){
                             // offer.ele('param',{name:tag.filter.name},tag.name).up();
                             stuff.tags0Filter=tag.filter.name
                             stuff.tags0Name=tag.name


                             }else if (typeCatelog!='prom'){
                             if(i<9){
                             stuff['tags'+i+'Filter']=tag.filter.name
                             stuff['tags'+i+'Name']=tag.name
                             }
                             //offer.ele('param',{name:tag.filter.name},tag.name).up();
                             }else if(!o.group_id){
                             // offer.ele('param',{name:tag.filter.name},tag.name).up();
                             }else if(wrapper){
                             if(i<9){
                             stuff['tags'+i+'Filter']=tag.filter.name
                             stuff['tags'+i+'Name']=tag.name
                             }
                             stuff.tags0Filter=tag.filter.name
                             stuff.tags0Name=tag.name
                             //offer.ele('param',{name:tag.filter.name},tag.name).up();
                             } else{
                             keywords.push(tag.name)
                             }
                             if (typeCatelog=='prom' && store.newTag){

                             }*/
                        }
                    })
                }




                //*************************************************************************************************
                //*************************************************************************************************
                //*************************************************************************************************
                stuff.gallery.sort(function(a,b){return a.index-b.index});
                stuff.galleryArch=[];
                let imgs = stuff.gallery.reduce(function (imgs,img) {
                    if(img && img.img){
                        if( img.img.charAt(0) === '/' && img.img.charAt(1) === '/'){
                            img.img=img.img.substr(1)
                        }else if(img.img.charAt(0) !== '/'){
                            img.img='/'+img.img;
                        }
                        stuff.galleryArch.push(img.img)
                        if(imgs){imgs+=','}
                        //imgs+=photoHost+img.img
                        imgs+=req.store.link+img.img
                        return imgs;
                    }else{
                        return imgs
                    }
                },'')
                let is;
                for(let sort in stuff.stock){
                    if(stuff.stock[sort].quantity && Number(stuff.stock[sort].quantity)>0){
                        is=true;
                    }
                }
                //console.log('is',is,available)



                try{

                    if(is){
                        let pathForImgsArchFolder = "./public/images/"+req.store.subDomain+'/Stuff/'+stuff.url;
                        await fs.mkdirParentPromise(pathForImgsArchFolder);
                        stuff.pathForImgsArch=pathForImgsArchFolder+'/'+stuff.url+'.zip'
                        stuff.pathForImgsArchWithDomain = req.store.link + "/images/"+req.store.subDomain+'/Stuff/'+stuff.url+'/'+stuff.url+'.zip';
                        //console.log("fs.existsSync(stuff.pathForImgsArch)",fs.existsSync(stuff.pathForImgsArch))
                        if(!fs.existsSync(stuff.pathForImgsArch)) {
                            /*console.log(stuff.pathForImgsArch);
                            console.log(stuff.galleryArch);*/
                            await createZipWithImgs(stuff.galleryArch, stuff.pathForImgsArch)
                        }
                    }
                    let o ={
                        artikul:(stuff.artikul)?stuff.artikul:null,
                        name:stuff.name,
                        desc:(stuff.desc)?stuff.desc: null,
                        price:(prices && prices.price)?prices.price:null,
                        currency:(stuff.currency)?stuff.currency:null,
                        unitOfMesure:(stuff.unitOfMesure)?stuff.unitofMesure:null,
                        imgs:(imgs)?imgs:null,
                        group_id:stuff.group_id,
                        quantity:(prices && prices.quantity)?prices.quantity:0,
                        categoryId:categoryId,
                        vendor:vendor,
                        available:available,
                        keywords:(keywords.length)?keywords.length:null,
                        tags0Filter:stuff.tags0Filter,
                        tags0Name:stuff.tags0Name,
                        tags1Filter:stuff.tags1Filter,
                        tags1Name:stuff.tags1Name,
                        tags2Filter:stuff.tags2Filter,
                        tags2Name:stuff.tags2Name,
                        tags3Filter:stuff.tags3Filter,
                        tags3Name:stuff.tags3Name,
                        tags4Filter:stuff.tags4Filter,
                        tags4Name:stuff.tags4Name,
                        tags5Filter:stuff.tags5Filter,
                        tags5Name:stuff.tags5Name,
                        tags6Filter:stuff.tags6Filter,
                        tags6Name:stuff.tags6Name,
                        tags7Filter:stuff.tags7Filter,
                        tags7Name:stuff.tags7Name,
                        tags8Filter:stuff.tags8Filter,
                        tags8Name:stuff.tags8Name,
                        zipImg:((stuff.pathForImgsArchWithDomain)?stuff.pathForImgsArchWithDomain:null)
                    }
                    /*if(!o.zipImg){
                        console.log('not',o.name)
                    }else{
                        console.log('yes',o.name)
                        //console.log(o)
                    }*/

                    sheetStuff.addRow(o)
                    //console.log('sheetStuff.addRow',idx)

                }catch(err){console.log(err)}

                /*if(stuff.pathForImgsArchWithDomain){
                    delete o.imgs;
                    o.imgs = stuff.pathForImgsArchWithDomain;
                    console.log(o.imgs)
                }*/

                //console.log(o.zipImg)

            }
            function createCategories(sheetCategories,store,groups) {
                /* создание списка категорий 1. корневой раздел не учитывается.*/
                /* для прома длобавляем две новых категории если они есть в настройках магазина*/
                let upCategory;
                if(razdel){
                    if(req.params.brand && req.params.brand!='all'){
                        let br=brands.find(function(b){return b.url==req.params.brand})
                        //console.log('br',br)
                        if(br){
                            upCategory ={
                                name :br.name,
                                idForXML : (1000003+br.idForXML)*1000
                            }
                            //console.log('upCategory ',upCategory)
                        }
                    }else{
                        upCategory=(groups[0])?groups[0]:null;
                    }
                }
                if(typeCatelog=='prom'){
                    if(store.newTag){
                        let o={id: 1000002}
                        if(upCategory){
                            o.parentId=upCategory.idForXML;
                        }
                        o.name=store.newTag.name;
                        sheetCategories.addRow(o)
                    }
                    if(store.saleTag){
                        let o={id: 1000001}
                        if(upCategory){
                            o.parentId=upCategory.idForXML;
                        }
                        o.name=store.saleTag.name;
                        sheetCategories.addRow(o)
                    }
                }
                if(upCategory){
                    let o = {id: upCategory.idForXML,name:upCategory.name}
                    sheetCategories.addRow(o)
                }

                groups.forEach(function(section){
                    //console.log('section.idForXML',section.idForXML)
                    //categories.ele('category',{id: section.idForXML},section.name).up()
                    if(upCategory){
                        section.idForXML +=upCategory.idForXML;
                    }
                    if(groups.length>1){
                        let o = {id:section.idForXML}
                        if(upCategory){
                            o.parentId=upCategory.idForXML;
                        }
                        o.name=section.name;
                        sheetCategories.addRow(o)
                    }


                    section.categories.forEach(function(category){
                        //console.log('category.idForXML',category.idForXML)
                        if(upCategory){
                            category.idForXML +=upCategory.idForXML;
                        }
                        let o = {id: category.idForXML}
                        if(groups.length>1){
                            o.parentId=section.idForXML;
                        }else if(upCategory){
                            o.parentId=upCategory.idForXML;
                        }
                        o.name=category.name;
                        sheetCategories.addRow(o)
                        categoriesToXMLid[category._id]=category.idForXML;
                    })
                    section.child.forEach(function(child){
                        if(upCategory){
                            child.idForXML +=upCategory.idForXML;
                        }
                        let o = {id: child.idForXML}
                        if(groups.length>1){
                            o.parentId=section.idForXML;
                        }else if(upCategory){
                            o.parentId=upCategory.idForXML;
                        }
                        o.name=child.name;
                        sheetCategories.addRow(o)
                        child.categories.forEach(function(category){
                            let o ={id: category.idForXML, parentId:child.idForXML,name:category.name}
                            sheetCategories.addRow(o)
                            categoriesToXMLid[category._id]=category.idForXML;
                        })
                    })
                })
            }



        }
        function createXMLFile(){
            var d = new Date("2015-03-25");
            var configIP=require('../../config/config.js')
            var photoHost="http://"+configIP.photoDownload;
            let filterSort,brandOffer;
            //let idForXML=Date.now();
            let tagsObject={};

            var feed = xmlbuilder.create('yml_catalog', { encoding: 'utf-8' }).att('date', d)
                .ele('shop')
                .ele('name',store.name).up()
                .ele('company',store.name).up()
                .ele('url',store.link).up()
            let currencies=feed.ele('currencies');
            for(let key in store.currency){
                currencies.ele('currency',{id: key, rate:store.currency[key][0]}).up()
            }
            feed.up();
            let categories=feed.ele('categories');
            createCategories(categories,store,groups)

            var offers =feed.ele('offers')
            let dateNow = Date.now();
            let thirty_day=1000*60*60*24*30;

            stuffs.forEach(function(stuff,idx){
                myUtil.setLangField(stuff,lang)
                // если товар отправлен в архих более месяца назад то его не помещаем в выгружаемый файл
                if(stuff.archived){
                    let d = new Date(stuff.archivedDate).getTime()
                    let difference = Math.round((dateNow-d)/thirty_day);
                    //console.log('difference',difference)
                    if(difference){
                        return;
                    }
                }
                //if(idx>10){return}
                if(!stuff.currency){stuff.currency=store.mainCurrency}
                StuffClass.setPrice(stuff,store,currency.toUpperCase());
                StuffClass.setRate(stuff,rate);
                if(typeCatelog=='prom'){
                    /* для прома меняем категорю товара на новую категорию новинки или сейл. если они присутствуют*/
                    if(store.saleTag && stuff.tags.some(function(t){return store.saleTag._id.toString()==t.toString()})){
                        stuff.category=store.saleTag._id;
                    }else if(store.newTag && stuff.tags.some(function(t){return store.newTag._id.toString()==t.toString()})){
                        stuff.category=store.newTag._id;
                    }
                }

                if(stuff.sortsOfStuff && stuff.sortsOfStuff.filter){
                    if(!filterSort || filterSort._id.toString()!=stuff.sortsOfStuff.filter.toString()){
                        filterSort = filters.getOFA('_id',stuff.sortsOfStuff.filter.toString())
                    }

                    if(filterSort || true){
                        // с разновидностями
                        if(stuff.stock && !stuff.stock['notag']){
                            let keys= Object.keys(stuff.stock).filter(function (t) {return t &&  t!='null'});
                            let tags = stuff.tags.filter(function(t){return t}).map(function(t){return t.toString()});
                            // убираем теги разновидностей
                            for(let iii=0;iii<keys.length;iii++){
                                let a = tags.indexOf(keys[iii]);
                                if(a>-1){
                                    tags.splice(a,1)
                                }
                            }

                            let qty=0;
                            // количество для оболочки
                            keys.forEach(function(k){
                                if(stuff.stock[k] && Number(stuff.stock[k].quantity)){
                                    qty=1;
                                }
                            })
                            let tagsForGroup=[];
                            if(typeCatelog=='prom'){
                                tagsForGroup=tags;
                            }
                            let priceObj={price:stuff.price,priceSale:stuff.priceSale,quantity:qty};
                            //console.log(priceObj)
                            createOffer(offers,stuff,tagsForGroup,priceObj,true);
                            keys.forEach(function (tag) {
                                stuff.idForXML+=1000000;
                                if(tag){
                                    //createOffer(offers,stuff,[tag],stuff.stock[tag]);
                                    createOffer(offers,stuff,[tag].concat(tags),stuff.stock[tag]);
                                }
                            })
                        }
                    }else{
                        console.log('нет такого фильтара разновидностей')
                    }
                }else if(stuff.stock['notag']){
                    //без разновидностей
                    //console.log('без разновидностей')
                    createOffer(offers,stuff,stuff.tags,stuff.stock['notag'],true);
                }
            })
            try {
                fs.writeFile(filePath, feed.end({ pretty: true }), (err) => {
                    if (err) throw err;
                    console.log('It\'s saved!');
                    //console.log(xmlDoc);
                    rs()
                });
            }catch(err){
                console.error(err);
                rj(err)
            }
            return sortsOfStuffUpdate;
            function createOffer(offers,stuff,tags,prices,wrapper){
                /*console.log(stuff.name,prices)
                if(!prices){
                    console.log(stuff)
                    console.log(wrapper)
                }*/
                //console.log(tags)
                //console.log(stuff,prices)
                let available= (prices.quantity && stuff.actived && !stuff.archived)?true:'';
                if(typeCatelog!='prom' && !available){available=false}
                let o = {id: stuff.idForXML,available:available}
                //console.log(o)
                if(stuff.service){
                    o.selling_type="s"
                }
                if(req.store.seller.opt){
                    o.selling_type="u"
                }else{
                    o.selling_type="r"
                }
                if(stuff.sortsOfStuff && stuff.sortsOfStuff._id){
                    //console.log(stuff.sortsOfStuff.idForXML)
                    /*создание id группы. так как разные товары могут быть в одной
                     * и они не являются разновидностями друг друга*/

                    /*let ii = stuff.sortsOfStuff.stuffs.indexOf(stuff._id.toString())
                    if(ii<0){
                        ii=0;
                    }
                    o.group_id=ii*1000000+stuff.sortsOfStuff.idForXML;*/
                    if(typeCatelog=='prom'){
                        let ii = stuff.sortsOfStuff.stuffs.indexOf(stuff._id.toString())
                        if(ii<0){
                            ii=0;
                        }
                        o.group_id=ii*1000000+stuff.sortsOfStuff.idForXML;
                        //console.log(ii)
                    }else{
                        o.group_id=stuff.sortsOfStuff.idForXML;
                    }


                    //o.group_id=stuff.sortsOfStuff._id.toString()
                }
                let offer = offers.ele('offer',o)

                let name = stuff.name;

                if(typeCatelog=='prom'){
                    name+=' '+stuff.artikul;
                }


                offer.ele('name',name).up()
                if(stuff.artikul){
                    offer.ele('vendorCode',stuff.artikul).up()
                }
                let qqq = (prices.quantity)?1:0;
                offer.ele('quantity',qqq).up();
                //offer.ele('url',url).up()
                if(prices.price){
                    if(prices.priceSale){
                        offer.ele('price',prices.priceSale).up()
                        offer.ele('oldprice',prices.price).up()
                    }else{
                        offer.ele('price',prices.price).up()
                    }

                }

                offer.ele('currencyId',currency.toUpperCase()).up()
                //console.log(stuff.category)
                offer.ele('categoryId',categoriesToXMLid[stuff.category]).up()
                if(stuff.brand){
                    offer.ele('vendor',stuff.brand.name).up();

                    if(stuff.brandTag){
                        offer.ele('collection',stuff.brandTag.name).up();
                    }
                }

                /*let price = stuff.stock[Object.keys(stuff.stock)[0]].price
                 offer.ele('price',price).up()*/
                let keywords=[];
                let sort=0;
                //console.log('tags',tags)
                let oo={};
                //console.log(stuff.artikul,tags)
                tags.forEach(function (t,i) {
                    let tag;
                    let tt = (t.toString)?t.toString():t;
                    if(!tagsObject[tt]){
                        tag = filterTags.getOFA('_id',tt)
                        if(tag){
                            tagsObject[tt]=tag;
                        }
                    }else{
                        tag=tagsObject[tt];
                    }
                    if(tag){
                        if(!i){
                            offer.ele('param',{name:tag.filter.name},tag.name).up();
                        }else if (typeCatelog!='prom'){
                            offer.ele('param',{name:tag.filter.name},tag.name).up();
                        }else if(!o.group_id){
                            offer.ele('param',{name:tag.filter.name},tag.name).up();
                        }else if(wrapper){
                            offer.ele('param',{name:tag.filter.name},tag.name).up();
                        } else{
                            keywords.push(tag.name)
                        }
                        if (typeCatelog=='prom' && store.newTag){

                        }
                    }
                })
                /*if(keywords.length){
                    offer.ele('keywords',{},keywords.join(',')).up();
                }*/
                if(stuff.keywords && stuff.keywords[lang]){
                    offer.ele('keywords',{},stuff.keywords[lang]).up();
                }

                offer.ele('description',(stuff.desc)?stuff.desc:'').up()
                //offer.ele('description',(stuff.desc)?stuff.desc.clearTag():'').up()
                stuff.gallery.sort(function(a,b){return a.index-b.index}).forEach(function(img,i){
                    if(img && img.img){
                        if( img.img.charAt(0) === '/' && img.img.charAt(1) === '/'){
                            img.img=img.img.substr(1)
                        }else if(img.img.charAt(0) !== '/'){
                            img.img='/'+img.img;
                        }
                        //offer.ele('picture',photoHost+img.img).up();
                        offer.ele('picture',req.store.link+img.img).up();
                    }
                })

                offers.up()
            }
            function createCategories(categories,store,groups) {
                //console.log('razdel',razdel)
                /* создание списка категорий 1. корневой раздел не учитывается.*/
                /* для прома длобавляем две новых категории если они есть в настройках магазина*/
                let upCategory;
                if(razdel){
                    if(req.params.brand && req.params.brand!='all'){
                        let br=brands.find(function(b){return b.url==req.params.brand})
                        //console.log('br',br)
                        if(br){
                            upCategory ={
                                name :br.name,
                                idForXML : (1000003+br.idForXML)*1000
                            }
                            //console.log('upCategory ',upCategory)
                        }
                    }else{
                        upCategory=(groups[0])?groups[0]:null;
                    }
                }
                if(typeCatelog=='prom'){
                    if(store.newTag){
                        let o={id: 1000002}
                        if(upCategory){
                            o.parentId=upCategory.idForXML;
                        }
                        categories.ele('category',o,store.newTag.name).up()
                    }
                    if(store.saleTag){
                        let o={id: 1000001}
                        if(upCategory){
                            o.parentId=upCategory.idForXML;
                        }
                        categories.ele('category',o,store.saleTag.name).up()
                    }
                }
                if(upCategory){
                    let o = {id: upCategory.idForXML}
                    categories.ele('category',o,upCategory.name).up()
                }

                groups.forEach(function(section){
                    //console.log('section.idForXML',section.idForXML)
                    //categories.ele('category',{id: section.idForXML},section.name).up()
                    if(upCategory){
                        section.idForXML +=upCategory.idForXML;
                    }
                    if(groups.length>1){
                        let o = {id:section.idForXML}
                        if(upCategory){
                            o.parentId=upCategory.idForXML;
                        }
                        categories.ele('category',o,section.name).up()
                    }


                    section.categories.forEach(function(category){
                        //console.log('category.idForXML',category.idForXML)
                        if(upCategory){
                            category.idForXML +=upCategory.idForXML;
                        }
                        let o = {id: category.idForXML}
                        if(groups.length>1){
                            o.parentId=section.idForXML;
                        }else if(upCategory){
                            o.parentId=upCategory.idForXML;
                        }
                        categories.ele('category',o,category.name).up()

                        categoriesToXMLid[category._id]=category.idForXML;
                    })
                    section.child.forEach(function(child){
                        if(upCategory){
                            child.idForXML +=upCategory.idForXML;
                        }
                        let o = {id: child.idForXML}
                        if(groups.length>1){
                            o.parentId=section.idForXML;
                        }else if(upCategory){
                            o.parentId=upCategory.idForXML;
                        }
                        categories.ele('category',o,child.name).up()
                        child.categories.forEach(function(category){
                            categories.ele('category',{id: category.idForXML, parentId:child.idForXML},category.name).up()
                            categoriesToXMLid[category._id]=category.idForXML;
                        })
                    })
                })
            }
        }


    })


}


function createXMLFile222(filePath,typeCatelog,req) {
    let{subDomain,lang,currency} = req.params;
    let store=req.store;
    var rate=(store.currency[currency.toUpperCase()])?store.currency[currency.toUpperCase()][0]:store.currency[store.mainCurrency][0]
    //console.log(store.currency[currency.toUpperCase()])
    let brands,categories,brandTags,filters,filterTags,groups,sortFilter,stuffs,sortsOfStuff;
    let sortsOfStuffUpdate={},stuffUpdate={};
    let brandsForUpdate={},categoriesForUpdate={},brandTagsForUpdate={},filterTagsForUpdate={},groupsForUpdate={};
    let stuffIdForXML=1;
    let sortIdForXML=1;
    let categoriesToXMLid={};


    return new Promise(function (rs,rj) {
        Promise.resolve()
            .then(function () {
                return new Promise(function (rs,rj) {
                    Brand.find({store:req.store._id}).populate('tags').exec(function(err,items){
                        if(err){rj(err)}
                        //console.log(1)
                        myUtil.setLangField(items,lang)
                        brands=items
                        rs()
                    })
                })

            })
            .then(function () {
                return new Promise(function (rs,rj) {
                    Group.list({criteria:{store:req.store._id},perPage:100,page:0,req:req},function(err,items){
                        if(err){rj(err)}
                        //console.log(2)
                        myUtil.setLangField(items,lang)
                        //console.log(items[0].categories[0])
                        groups=items
                        //console.log(groups)
                        let idForXMLGroup=1000;
                        let idForXML=1;
                        items.forEach(function(s){
                            if(s.idForXML && s.idForXML>=idForXMLGroup && s.idForXML<100000){
                                idForXMLGroup++;
                            }
                            s.categories.forEach(function(c){
                                if(c.idForXML && c.idForXML>=idForXML && c.idForXML<100000){
                                    idForXML++;
                                }
                            })
                            s.child.forEach(function (ss) {
                                if(ss.idForXML && ss.idForXML>=idForXMLGroup && ss.idForXML<100000){
                                    idForXMLGroup++;
                                }
                                ss.categories.forEach(function(c){
                                    if(c.idForXML && c.idForXML>=idForXML && c.idForXML<100000){
                                        idForXML++;
                                    }
                                })
                            })
                        })
                        items.forEach(function(s){
                            if(!s.idForXML){
                                s.idForXML=idForXMLGroup;
                                idForXMLGroup++;
                                groupsForUpdate[s._id]={'idForXML':s.idForXML}
                            }
                            s.categories.forEach(function(c){
                                if(!c.idForXML){
                                    c.idForXML=idForXML;
                                    idForXML++;
                                    categoriesForUpdate[c._id]={'idForXML':c.idForXML}
                                }
                                categoriesToXMLid[c._id]=c.idForXML;
                            })
                            s.child.forEach(function (ss) {
                                if(!ss.idForXML){
                                    ss.idForXML=idForXMLGroup;
                                    idForXMLGroup++;
                                    groupsForUpdate[ss._id]={'idForXML':ss.idForXML}
                                }
                                ss.categories.forEach(function(c){
                                    if(!c.idForXML){
                                        c.idForXML=idForXML;
                                        idForXML++;
                                        categoriesForUpdate[c._id]={'idForXML':c.idForXML}
                                    }
                                    categoriesToXMLid[c._id]=c.idForXML;
                                })
                            })
                        })
                        rs()
                    })
                })

            })
            .then(function () {
                return new Promise(function (rs,rj) {
                    FilterTags.find({store:req.store._id}).lean().exec(function(err,items){
                        if(err){rj(err)}
                        //console.log(3)
                        myUtil.setLangField(items,lang)
                        filterTags=items
                        //console.log(groups)
                        rs()
                    })
                })

            })
            .then(function () {
                return new Promise(function (rs,rj) {
                    Filter.find({store:req.store._id}).populate('tags').lean().exec(function(err,items){
                        if(err){rj(err)}
                        //console.log(4)
                        myUtil.setLangField(items,lang)
                        filters=items;
                        if(typeCatelog=='prom'){
                            if(store.saleTag){
                                store.saleTag=filterTags.find(function (t) {
                                    return t.url==store.saleTag;
                                })
                                if(store.saleTag){
                                   /* store.saleTag.filter=filters.find(function(f){
                                        return f._id.toString()==store.saleTag.filter.toString()
                                    })*/
                                    categoriesToXMLid[store.saleTag._id]=1000001;
                                }
                            }
                            if(store.newTag){
                                store.newTag=filterTags.find(function (t) {
                                    return t.url==store.newTag;
                                })
                                if(store.newTag){
                                    /*store.newTag.filter=filters.find(function(f){
                                        return f._id.toString()==store.newTag.filter.toString()
                                    })*/
                                    categoriesToXMLid[store.newTag._id]=1000002;
                                }
                            }

                            //console.log(categoriesToXMLid)
                            //console.log(store.saleTag,store.newTag)
                        }
                        filterTags.forEach(function(tag){
                            let filter=filters.find(function (f) {
                                return f._id.toString()==tag.filter.toString()
                            })
                            tag.filter=filter;

                        })
                        rs()
                    })
                })
            })
            .then(function () {
                return new Promise(function (rs,rj) {
                    let idForXML=1;
                    BrandTags.find({store:req.store._id}).exec(function(err,items){
                        if(err){rj(err)}
                        //console.log(5)
                        myUtil.setLangField(items,lang)
                        brandTags=items

                        rs()
                    })
                })
            })
            .then(function () {
                return new Promise(function (rs,rj) {
                    let storeId = req.store._id.toString();
                    SortsOfStuff.find().exec(function(err,items){
                        if(err){rj(err)}
                        sortsOfStuff=items.filter(function(s){return s.store==storeId})
                       // console.log(sortsOfStuff.length)
                        items.forEach(function(s){
                            if(s.idForXML && s.idForXML>=sortIdForXML && s.idForXML<100000){
                                sortIdForXML++;
                            }
                            s.stuffs=s.stuffs.filter(function (s) {
                                return((s)?s.toString():null)
                            })
                        })
                        items.forEach(function(s){
                            if(!s.idForXML){
                                s.idForXML=sortIdForXML;
                                sortIdForXML++;
                                sortsOfStuffUpdate[s._id]={'idForXML':s.idForXML}
                            }
                        })
                        rs()
                    })
                })
            })
            .then(function () {
                return new Promise(function (rs,rj) {

                    let o={store:req.store._id,actived:true}

                    Stuff.find(o).lean().populate('brand').populate('brandTag').sort(({'index': -1})).exec(function(err,items){
                        if(err){rj(err)}
                        items.forEach(function(s){
                            if(s.idForXML && s.idForXML>=stuffIdForXML && s.idForXML<100000){
                                stuffIdForXML++;
                            }
                        })

                        items.forEach(function(s){
                            if(s.sortsOfStuff){
                                s.sortsOfStuff=sortsOfStuff.getOFA('_id',s.sortsOfStuff.toString())
                                //console.log(s.sortsOfStuff.idForXML)
                            }
                            if(!s.idForXML){
                                s.idForXML=stuffIdForXML;
                                stuffIdForXML++;
                                stuffUpdate[s._id]={'idForXML':s.idForXML}
                            }
                        })

                        items.forEach(function(s){
                            if(s.idForXML<100000){
                                //console.log(s.idForXML)
                                let st;
                                while (st = items.find(function(stt){
                                    return (stt.idForXML==s.idForXML && s.id!=stt.id)
                                })){
                                    /*console.log(s.id,st.id)
                                    console.log('st.idForXML ',st.idForXML)*/
                                    stuffIdForXML+=1;
                                    st.idForXML=stuffIdForXML;
                                    //console.log('st.idForXML после ',st.idForXML)
                                    stuffUpdate[st._id]={'idForXML':st.idForXML}
                                }
                            }
                        })
                        if(req.params.brand!='all'){
                            let b = brands.find(function(bb){return bb.url==req.params.brand})
                            if(b){
                                stuffs=items.filter(function(item){return item.brand._id.toString()==b._id.toString()})
                            }
                        }else{
                            stuffs=items;
                        }
                        rs()
                    })
                })
            })
            .then(function () {
                var d = new Date("2015-03-25");
                var configIP=require('../../config/config.js')
                var photoHost="http://"+configIP.photoDownload+'/';
                let filterSort,brandOffer;
                //let idForXML=Date.now();
                let tagsObject={};

                var feed = xmlbuilder.create('yml_catalog', { encoding: 'utf-8' }).att('date', d)
                    .ele('shop')
                    .ele('name',store.name).up()
                    .ele('company',store.name).up()
                    .ele('url',store.link).up()
                let currencies=feed.ele('currencies');
                for(let key in store.currency){
                    currencies.ele('currency',{id: key, rate:store.currency[key][0]}).up()
                }
                feed.up();
                let categories=feed.ele('categories');
                createCategories(categories,store,groups)

                var offers =feed.ele('offers')
                stuffs.forEach(function(stuff,idx){
                    //if(idx>10){return}
                    if(!stuff.currency){stuff.currency=store.mainCurrency}
                    StuffClass.setPrice(stuff,store,currency.toUpperCase());
                    StuffClass.setRate(stuff,rate);
                    if(typeCatelog=='prom'){
                        /* для прома меняем категорю товара на новую категорию новинки или сейл. если они присутствуют*/
                        if(store.saleTag && stuff.tags.some(function(t){return store.saleTag._id.toString()==t.toString()})){
                            stuff.category=store.saleTag._id;
                        }else if(store.newTag && stuff.tags.some(function(t){return store.newTag._id.toString()==t.toString()})){
                            stuff.category=store.newTag._id;
                        }
                    }
                    if(stuff.sortsOfStuff && stuff.sortsOfStuff.filter){
                        if(!filterSort || filterSort._id.toString()!=stuff.sortsOfStuff.filter.toString()){
                            filterSort = filters.getOFA('_id',stuff.sortsOfStuff.filter.toString())
                        }
                        if(filterSort){
                            // с разновидностями
                            if(stuff.stock && !stuff.stock['notag']){
                                let keys= Object.keys(stuff.stock).filter(function (t) {return t &&  t!='null'});
                                let tags = stuff.tags.filter(function(t){return t}).map(function(t){return t.toString()});
                                // убираем теги разновидностей
                                for(let iii=0;iii<keys.length;iii++){
                                    let a = tags.indexOf(keys[iii]);
                                    if(a>-1){
                                        tags.splice(a,1)
                                    }
                                }

                                let qty=0;
                                // количество для оболочки
                                keys.forEach(function(k){
                                    if(stuff.stock[k] && Number(stuff.stock[k].quantity)){
                                        qty=1;
                                    }
                                })
                                let tagsForGroup=[];
                                if(typeCatelog=='prom'){
                                    tagsForGroup=tags;
                                }
                                /*if(stuff.url=='new-good-123'){
                                    console.log({price:stuff.price,priceSale:stuff.priceSale,quantity:qty})
                                }*/
                                createOffer(offers,stuff,tagsForGroup,{price:stuff.price,priceSale:stuff.priceSale,quantity:qty},true);
                                keys.forEach(function (tag) {
                                    stuff.idForXML+=1000000;
                                    if(tag){
                                        //createOffer(offers,stuff,[tag],stuff.stock[tag]);
                                        createOffer(offers,stuff,[tag].concat(tags),stuff.stock[tag]);
                                    }
                                })
                            }
                        }else{
                            console.log('нет такого фильтара разновидностей')
                        }
                    }else{
                        //без разновидностей
                        //console.log('без разновидностей')
                        createOffer(offers,stuff,stuff.tags,stuff.stock['notag']);
                    }
                })
                try {
                    fs.writeFile(filePath, feed.end({ pretty: true }), (err) => {
                        if (err) throw err;
                        //console.log('It\'s saved!');
                        //console.log(xmlDoc);
                        rs()
                    });
                }catch(err){
                    console.error(err);
                    rj(err)
                }
                return sortsOfStuffUpdate;
                function createOffer(offers,stuff,tags,prices,wrapper){
                    //console.log(tags)
                    let available= (prices.quantity && stuff.actived)?true:'';
                    let o = {id: stuff.idForXML,available:available}
                    //console.log(o)
                    if(stuff.service){
                        o.selling_type="s"
                    }
                    if(req.store.seller.opt){
                        o.selling_type="u"
                    }else{
                        o.selling_type="r"
                    }
                    if(stuff.sortsOfStuff && stuff.sortsOfStuff._id){
                        //console.log(stuff.sortsOfStuff.idForXML)
                        /*создание id группы для прома. так как разные товары могут быть в одной
                         * и они не являются разновидностями друг друга*/
                        if(typeCatelog=='prom'){
                            let ii = stuff.sortsOfStuff.stuffs.indexOf(stuff._id.toString())
                            if(ii<0){
                                ii=0;
                            }
                            o.group_id=ii*1000000+stuff.sortsOfStuff.idForXML;
                            //console.log(ii)
                        }else{
                            o.group_id=stuff.sortsOfStuff.idForXML;
                        }


                        //o.group_id=stuff.sortsOfStuff._id.toString()
                    }
                    let offer = offers.ele('offer',o)

                    let name = stuff.name;

                    if(typeCatelog=='prom'){
                        name+=' '+stuff.artikul;
                    }


                    offer.ele('name',name).up()
                    if(stuff.artikul){
                        offer.ele('vendorCode',stuff.artikul).up()
                    }
                    offer.ele('quantity',prices.quantity).up();
                    //offer.ele('url',url).up()
                    if(prices.price){
                        if(prices.priceSale){
                            offer.ele('price',prices.priceSale).up()
                            offer.ele('oldprice',prices.price).up()
                        }else{
                            offer.ele('price',prices.price).up()
                        }

                    }

                    offer.ele('currencyId',currency.toUpperCase()).up()
                    //console.log(stuff.category)
                    offer.ele('categoryId',categoriesToXMLid[stuff.category]).up()
                    if(stuff.brand){
                        offer.ele('vendor',stuff.brand.name).up();

                        if(stuff.brandTag){
                            offer.ele('collection',stuff.brandTag.name).up();
                        }
                    }

                    /*let price = stuff.stock[Object.keys(stuff.stock)[0]].price
                     offer.ele('price',price).up()*/
                    let keywords=[];
                    let sort=0;
                    //console.log('tags',tags)
                    let oo={};
                    //console.log(stuff.artikul,tags)
                    tags.forEach(function (t,i) {
                        let tag;
                        let tt = (t.toString)?t.toString():t;
                        if(!tagsObject[tt]){
                            tag = filterTags.getOFA('_id',tt)
                            if(tag){
                                tagsObject[tt]=tag;
                            }
                        }else{
                            tag=tagsObject[tt];
                        }
                        if(tag){
                            //console.log(tag.name)
                            /*if(tag.name=='new'){
                             console.log(tag)
                             }*/

                            if(!i){
                                offer.ele('param',{name:tag.filter.name},tag.name).up();
                            }else if (typeCatelog!='prom'){
                                offer.ele('param',{name:tag.filter.name},tag.name).up();
                            }else if(!o.group_id){
                                offer.ele('param',{name:tag.filter.name},tag.name).up();
                            }else if(wrapper){
                                offer.ele('param',{name:tag.filter.name},tag.name).up();
                            } else{
                                keywords.push(tag.name)
                            }
                            if (typeCatelog=='prom' && store.newTag){

                            }
                        }
                    })
                    if(keywords.length){
                        offer.ele('keywords',{},keywords.join(',')).up();
                    }

                    offer.ele('description',(stuff.desc)?stuff.desc:'').up()
                    //offer.ele('description',(stuff.desc)?stuff.desc.clearTag():'').up()
                    stuff.gallery.sort(function(a,b){return a.index-b.index}).forEach(function(img,i){
                        /* if(!i){
                         offer.ele('picture',photoHost+img.img).up();
                         }*/
                        offer.ele('picture',photoHost+img.img).up();
                    })

                    offers.up()
                }
                function createCategories(categories,store,groups) {
                    /* создание списка категорий 1. корневой раздел не учитывается.*/
                    /* для прома длобавляем две новых категории если они есть в настройках магазина*/
                    if(typeCatelog=='prom'){
                        if(store.newTag){
                            categories.ele('category',{id: 1000002},store.newTag.name).up()
                        }
                        if(store.saleTag){
                            categories.ele('category',{id: 1000001},store.saleTag.name).up()
                        }
                    }
                    groups.forEach(function(section){
                        //console.log('section.idForXML',section.idForXML)
                        //categories.ele('category',{id: section.idForXML},section.name).up()
                        section.categories.forEach(function(category){
                            //console.log('category.idForXML',category.idForXML)
                            categories.ele('category',{id: category.idForXML},category.name).up()
                        })
                        section.child.forEach(function(child){
                            categories.ele('category',{id: child.idForXML},child.name).up()
                            child.categories.forEach(function(category){
                                categories.ele('category',{id: category.idForXML, parentId:child.idForXML},category.name).up()
                            })
                        })
                    })
                }

            })
            .then(function (sortsOfStuffUpdate) {
                //console.log('sortsOfStuffUpdate',sortsOfStuffUpdate)
                return myUtil.getPromiseForUpdateInDB(sortsOfStuffUpdate,SortsOfStuff);
            })
            .then(function (sortsOfStuffUpdate) {
                //console.log('stuffUpdate',stuffUpdate)
                return myUtil.getPromiseForUpdateInDB(stuffUpdate,Stuff);
            })
            .then(function (sortsOfStuffUpdate) {
                //console.log('stuffUpdate',stuffUpdate)
                return myUtil.getPromiseForUpdateInDB(categoriesForUpdate,Category);
            })
            .then(function (sortsOfStuffUpdate) {
                //console.log('stuffUpdate',stuffUpdate)
                return myUtil.getPromiseForUpdateInDB(groupsForUpdate,Group);
            })
            .then(function () {
                //console.log('done update')
            })
            .catch(function (err) {
                rj(err)
            })
    })
}

function createZipWithImgs(files,zipFile) {

    return new Promise(function (rs,rj) {
        var output = fs.createWriteStream(zipFile);
        var archive = archiver('zip', {
            zlib: { level: 6 } // Sets the compression level.
        });
        output.on('close', function() {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
        });
        archive.on('error', function(err) {
            rj(err);
        });


        archive.pipe(output);


        files.forEach(function (file) {

            if(!fs.existsSync(file)){
                return
            }

            let fileName = file.split('/')
            fileName=fileName[fileName.length-1]
            var file1 =  './public'+file;
            archive.append(fs.createReadStream(file1), { name: fileName });
        })



        archive.finalize();
        console.log('готово')
        rs();

    })


}











