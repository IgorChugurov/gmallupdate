'use strict';
const fs=require('fs');
const path=require('path');
const request=require('request');
const globalVar=require('../../public/scripts/globalVariable.js')
const pugCache=require('../pugCache');
const getItemPage=require('../modules/getItemPage');
const cache=require('../cache')
const hangleBlocksForPugCompile = require('../modules/hangleBlocksForPugCompile');
const setMobileOrTabletStyle=require('../setMobileOrTabletStyle');
const getPartWithKey = require('../modules/getPartWithKey');
const getCSSForBlock = require('../modules/getCSSForBlock');
const moment = require('moment');
let data404=require('../data404');
var zlib = require('zlib');
const isWin = /^win/.test(process.platform);
var mkdirp = require('mkdirp');
fs.mkdirParentPromise = function(dirPath) {
    return new Promise(function (rs, rj) {
        mkdirp(dirPath, function (err) {
            if (err) {
                rj(err)
            }
            else {
                rs()
            }
        });
    })
}

let maskValue ={
    siteName:'',
    domainName:'',
    groupName:'',
    categoryName:'',
    brandName:'',
    collectionName:'',
    name:'',
    artikul:'',
    price:'',
    'maskDelimiter_|':' | ',
    'maskDelimiter_,':', ',
    'maskDelimiter_ ':' ',
    'maskDelimiter_.':'. ',
    'maskDelimiter_!':'! ',
    'maskDelimiter_-':' - '
}


module.exports = async function getStuffDetailPageHTML(req) {

    let home='home';
    let type='stuffDetail'
    let jadeData={dj:{}},cssData={css:''};
    var homePath = path.join( __dirname, '../../public/views/template/partials/home/' );
    var itemPath = path.join( __dirname, '../../public/views/template/partials/stuffDetail/' );
    var stuffHost = req.stuffHost;
    var photoHost = req.photoHost;
    jadeData.mobile=req.mobile;
    jadeData.tablet=req.tablet;
    jadeData.photoHost=photoHost;
    let sections;

    var typeList='good';
    if(req.params.type){typeList=req.params.type}else if(req.allData){
        sections=req.allData.group;
    }
    let parts={right:'',left:'',bottom:'',top:''}
    //console.log(sections)
    /*console.log(req.params)
    console.log(req.query)*/
    let sectionForGroupStuff;
    if(req.query.group){
        if(cache.storeList && cache.storeList[req.store.subDomain] && cache.storeList[req.store.subDomain].groups && cache.storeList[req.store.subDomain].groups[req.query.group]) {
            if(cache.storeList[req.store.subDomain].groups[req.query.group] && cache.storeList[req.store.subDomain].groups[req.query.group].groupStuffs){
                sectionForGroupStuff = cache.storeList[req.store.subDomain].groups[req.query.group];
            }
        }else{
            let data={
                lang:req.store.lang,
                model:'Group',
                url:req.query.group
            }
            //console.log(data)
            let gg = await getItemPage(req.store._id,req.stuffHost,data);
            if(gg && gg.groupStuffs){
                sectionForGroupStuff = gg;
            }
            if(cache.storeList && cache.storeList[req.store.subDomain]){
                if(!cache.storeList[req.store.subDomain].groups){cache.storeList[req.store.subDomain].groups={}}
                cache.storeList[req.store.subDomain].groups[req.query.group]=gg;
            }
        }
        //console.log(sectionForGroupStuff)
    }else if(req.params.group){
        if(cache.storeList && cache.storeList[req.store.subDomain] && cache.storeList[req.store.subDomain].groups && cache.storeList[req.store.subDomain].groups[req.params.group]) {
            if(cache.storeList[req.store.subDomain].groups[req.params.group] && cache.storeList[req.store.subDomain].groups[req.params.group].groupStuffs){
                sectionForGroupStuff = cache.storeList[req.store.subDomain].groups[req.params.group];
            }
        }else{
            let data={
                lang:req.store.lang,
                model:'Group',
                url:req.params.group
            }
            //console.log(data)
            let gg = await getItemPage(req.store._id,req.stuffHost,data);
            if(gg && gg.groupStuffs){
                sectionForGroupStuff = gg;
            }
            if(cache.storeList && cache.storeList[req.store.subDomain]){
                if(!cache.storeList[req.store.subDomain].groups){cache.storeList[req.store.subDomain].groups={}}
                cache.storeList[req.store.subDomain].groups[req.params.group]=gg;
            }
        }
        //console.log(sectionForGroupStuff)
    }
    //console.log(sectionForGroupStuff)

    return new Promise(async function (resolve,reject) {
        Promise.resolve()
            .then(function () {

                if(sectionForGroupStuff){
                    let data={
                        lang:req.store.lang,
                        model:'GroupStuffs',
                        url:req.query.group
                    }
                    if(req.params.url){
                       data.url = req.params.url;
                    }else if(req.params.stuff){
                        data.url = req.params.stuff;
                    }
                    //console.log(data)
                    return  getItemPage(req.store._id,req.stuffHost,data);
                }


                if(req.params.url){
                    return getStuff(req.store._id,stuffHost,req.params.url,req.store.lang)
                }else if(req.params.stuff){
                    return getStuff(req.store._id,stuffHost,req.params.stuff,req.store.lang)
                }else{
                    throw 404
                }
            })
            .then(async function(item){
                //console.log(item.groupStuffs.masters)
                //console.log(item.tags)
                if(item.addInfo && item.addInfo.nameL &&  item.addInfo.nameL[req.store.lang]){
                    item.addInfo.name=item.addInfo.nameL[req.store.lang];
                }
                //console.log(item.addInfo,req.store.lang)
                //console.log(item.sortsOfStuff.stuffs)
                if(item.sortsOfStuff && item.sortsOfStuff.stuffs){
                    for(let i=0;i<item.sortsOfStuff.stuffs.length;i++){
                        /*for(let k in item.sortsOfStuff.stuffs[i].stock){
                            if(item.sortsOfStuff.stuffs[i].stock[k].quantity){
                                item.sortsOfStuff.stuffs[i].stock[k].quantity=Number(item.sortsOfStuff.stuffs[i].stock[k].quantity)
                            }
                        }*/

                        if(item.sortsOfStuff.stuffs[i]._id!=item._id && item.sortsOfStuff.stuffs[i].archived){
                            item.sortsOfStuff.stuffs.splice(i,1);
                            i--;
                        }else if(item.sortsOfStuff.stuffs[i].stock && typeof item.sortsOfStuff.stuffs[i].stock =='object'){
                            for(let k in item.sortsOfStuff.stuffs[i].stock){
                                if(item.sortsOfStuff.stuffs[i].stock[k].quantity){
                                    item.sortsOfStuff.stuffs[i].stock[k].quantity=Number(item.sortsOfStuff.stuffs[i].stock[k].quantity)
                                }
                            }
                        }
                    }
                }
                if(item.stock && typeof item.stock =='object'){
                    for(let k in item.stock){
                        if(item.stock[k].quantity){
                            item.stock[k].quantity=Number(item.stock[k].quantity)
                        }
                    }
                }
                let groupUrl;
                if(item.link && item.link.split){
                    groupUrl= item.link.split('/')[1]
                }

                let mask,group;
                //console.log('req.user',req.user);
                //console.log('req.store',req.store);
                //console.log(req.store.langData)
                if(sectionForGroupStuff){
                    //console.log(sectionForGroupStuff)
                    item.videoTime=0;
                    if(item.stuffs && item.stuffs.forEach){
                        item.stuffs.forEach(s=>{
                           /* if(!s.access || !req.user){
                                s.video='images/'+req.store.subDomain+'/Stuff/'+s.url+'/'+s.url+'.mp4'
                            }else{
                                s.video=null;
                            }*/
                            //Поза бабочки (Баддха Конасана )

                            //console.log(s.video)

                            if(s.accessLevel){
                                if(req.user && req.user.accessPermision && req.user.accessPermision.level && req.user.accessPermision.level>=s.accessLevel){
                                    let dEnd = new Date(req.user.accessPermision.dateBefor);
                                    let now = new Date()
                                    if(dEnd>now){
                                        if(s.media){
                                            s.videoLink= "https://vimeo.com/"+s.media;
                                           /* s.videoLink='images/'+req.store.subDomain+'/Stuff/'+s.url+'/'+s.media;
                                            s.videoLink = req.photoHost + ((req.photoHost) ? '/' : '') + s.videoLink
                                            if(s.media2){
                                                s.videoLink2='images/'+req.store.subDomain+'/Stuff/'+s.url+'/'+s.media2;
                                                s.videoLink2= req.photoHost + ((req.photoHost) ? '/' : '') + s.videoLink2
                                            }*/
                                        }
                                    }
                                    //console.log(s.videoLink1,s.mediaSD)

                                }
                                //console.log('item.videoLink',item.videoLink)
                            }else{
                                if(s.media){
                                    s.videoLink= "https://vimeo.com/"+s.media
                                    //s.videoLink='images/'+req.store.subDomain+'/Stuff/'+s.url+'/'+s.media
                                }
                            }
                            //console.log(1,s.desc)
                            if(s.descL && s.descL[req.store.lang]){
                                let qty =(sectionForGroupStuff.charsQty)?sectionForGroupStuff.charsQty:150;
                                s.desc= s.descL[req.store.lang].clearTag().myTrim().substring(0,qty);
                                if(s.desc){
                                    s.desc=s.desc.substr(0, Math.min(s.desc.length, s.desc.lastIndexOf(" ")))+' ...';
                                }
                            }

                            //console.log(2,s.desc)

                            if(s.videoTime){
                                var h = s.videoTime / 60 | 0,
                                    m = s.videoTime % 60 | 0;
                                s.duration='';
                                if(h){
                                    s.duration=  h + ' '+ gethumanizeHour(h,req.store.langData)+' ';
                                }
                                s.duration +=m+" "+gethumanizeMin(m,req.store.langData)//moment.utc().hours(h).minutes(m).format("hh:mm");
                                item.videoTime +=s.videoTime
                            }

                            //console.log("s.duration",s.duration)
                        })
                        if(item.videoTime){
                            var h = item.videoTime / 60 | 0,
                                m = item.videoTime % 60 | 0;
                            item.duration='';
                            if(h){
                                item.duration=  h + ' '+ gethumanizeHour(h,req.store.langData)+' ';
                            }
                            item.duration +=m+" "+gethumanizeMin(m,req.store.langData)//moment.utc().hours(h).minutes(m).format("hh:mm");
                        }
                    }
                    if(item.tags && item.tags.length){
                        let filters={}
                        let durationIs;
                        item.tags.forEach(t=>{
                            if(item.duration && t.filter.name.toLowerCase()==req.store.langData.duration.toLowerCase()){
                                /* это для того что бы не показывать значение фильтра длительность а показывать значение из поля длятельность*/
                                filters[t.filter._id]={tags:[{name:item.duration}],name:t.filter.name}
                                durationIs = true;
                                return
                            }
                            if(!filters[t.filter._id]){
                                filters[t.filter._id]={tags:[t],name:t.filter.name}
                            }else{
                                filters[t.filter._id].tags.push(t)
                            }
                        })
                        item.filters=[];
                        if(item.duration && !durationIs){
                            let o = {
                                tags:[{name:item.duration}],name:req.store.langData.duration.toLowerCase()
                            }
                            item.filters.push(o);
                        }
                        for(let k  in filters){
                            item.filters.push(filters[k])
                        }
                        item.filters.sort((a,b)=>{
                            var textA = a.name.toUpperCase();
                            var textB = b.name.toUpperCase();
                            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                        })
                        //console.log(item.filters,durationIs)
                    }


                    group=sectionForGroupStuff;
                    typeList=(group.type)?group.type:'good';

                    if(item.videoPoster && item.video){
                        item.video.poster=item.videoPoster;
                        if(item.video.poster){
                            item.video.poster = req.photoHost + ((req.photoHost) ? '/' : '')+item.video.poster
                        }
                    }
                    if(item.video1Poster && item.video1){
                        item.video1.poster=item.video1Poster;
                        if(item.video1.poster){
                            item.video1.poster = req.photoHost + ((req.photoHost) ? '/' : '')+item.video1.poster
                        }
                    }
                    //console.log(item.video)
                }else{



                    if(item.accessLevel){
                        if(req.user && req.user.accessPermision && req.user.accessPermision.level && req.user.accessPermision.level>=item.accessLevel){
                            let dEnd = new Date(req.user.accessPermision.dateBefor);
                            let now = new Date()
                            if(dEnd>now){
                                if(item.media){
                                    item.videoLink="https://vimeo.com/"+item.media;
                                    //item.videoLink='images/'+req.store.subDomain+'/Stuff/'+item.url+'/'+item.media;
                                    /*item.videoLink = req.photoHost + ((req.photoHost) ? '/' : '') + item.videoLink
                                    if(item.media2){
                                        item.videoLink2='images/'+req.store.subDomain+'/Stuff/'+item.url+'/'+item.media2;
                                        item.videoLink2= req.photoHost + ((req.photoHost) ? '/' : '') + item.videoLink2
                                    }*/


                                }
                            }
                            //console.log(dEnd,now)

                        }
                        /*console.log('item.videoLink',item.videoLink)
                        console.log('item.videoLink2',item.videoLink2)*/
                    }else{
                        if(item.media){
                            //item.videoLink='images/'+req.store.subDomain+'/Stuff/'+item.url+'/'+item.media
                            item.videoLink="https://vimeo.com/"+item.media
                        }
                    }

                    if(item.videoTime){
                        var h = item.videoTime / 60 | 0,
                            m = item.videoTime % 60 | 0;
                        item.duration='';
                        if(h){
                            item.duration=  h + ' '+ gethumanizeHour(h,req.store.langData)+' ';
                        }
                        item.duration +=m+" "+gethumanizeMin(m,req.store.langData)
                    }

                    //console.log('item',item)
                    if(item.tags && item.tags.length){
                        let filters={};
                        let durationIs;
                        item.tags.forEach(t=>{
                            let tag,filter;
                            if(!req.allData || !req.allData.filters){return};

                            filter = req.allData.filters.find(f=>{
                                return f.tags.find(tt=>{
                                    if(tt._id==t){
                                        tag=tt;
                                    }
                                    return tt._id==t;
                                })
                            })



                            /* console.log(filter)
                             console.log(tag)*/
                            if(!filter || !tag){return}
                            /*console.log("item.duration && filter.name.toLowerCase()==req.store.langData.duration.toLowerCase()",item.duration && filter.name.toLowerCase()==req.store.langData.duration.toLowerCase())
                            console.log(filter.name)*/
                            if(item.duration && filter.name.toLowerCase()==req.store.langData.duration.toLowerCase()){
                                /* это для того что бы не показывать значение фильтра длительность а показывать значение из поля длятельность*/
                                filters[filter._id]={tags:[{name:item.duration}],name:filter.name}
                                durationIs = true;
                                return
                            }
                            if(!filters[filter._id]){
                                filters[filter._id]={tags:[tag],name:filter.name}
                            }else{
                                filters[filter._id].tags.push(tag)
                            }
                        })

                        item.filters=[];
                        if(item.duration && !durationIs){
                            let o = {
                                tags:[{name:item.duration}],name:req.store.langData.duration.toLowerCase()
                            }
                            item.filters.push(o);
                        }
                        for(let k  in filters){
                            item.filters.push(filters[k])
                        }
                        item.filters.sort((a,b)=>{
                            var textA = a.name.toUpperCase();
                            var textB = b.name.toUpperCase();
                            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                        })
                        //console.log(filters)
                    }

                }
                //console.log(item.filters)
                //console.log(item.masters)

                /*console.log("item.tags",item.tags)
                console.log(req.allData.filters)*/

                //console.log('item.filters',item.filters)



                //console.log('item.videoLink', item.videoLink)
                if(item.video){
                    if(item.gallery && item.gallery[1]){
                        item.video.poster=(item.gallery[1].img)?item.gallery[1].img:item.gallery[1].thumb;
                        if(item.video.poster){
                            item.video.poster = req.photoHost + ((req.photoHost) ? '/' : '')+item.video.poster
                        }
                    }
                    item.video.link= req.photoHost + ((req.photoHost) ? '/' : '') + item.video.link
                }
                if(item.video1){
                    if(item.gallery && item.gallery[2]){
                        item.video1.poster=(item.gallery[2].img)?item.gallery[2].img:item.gallery[2].thumb;
                        if(item.video1.poster){
                            item.video1.poster = req.photoHost + ((req.photoHost) ? '/' : '')+item.video1.poster
                        }
                    }
                    item.video1.link= req.photoHost + ((req.photoHost) ? '/' : '') + item.video1.link
                }
                //console.log('item.video',item.video)

                if(groupUrl){
                   if(cache.storeList && cache.storeList[req.store.subDomain] && cache.storeList[req.store.subDomain].groups && cache.storeList[req.store.subDomain].groups[groupUrl]) {
                       group = cache.storeList[req.store.subDomain].groups[groupUrl];
                       mask = (group)?group.mask:null;
                   }else{
                       let data={
                           lang:req.store.lang,
                           model:'Group',
                           url:groupUrl
                       }
                       //console.log(data)
                       group = await getItemPage(req.store._id,req.stuffHost,data);
                       mask = (group)?group.mask:null;
                       if(cache.storeList && cache.storeList[req.store.subDomain]){
                           if(!cache.storeList[req.store.subDomain].groups){cache.storeList[req.store.subDomain].groups={}}
                           cache.storeList[req.store.subDomain].groups[groupUrl]=group;
                       }
                   }
                }
                //console.log(group.name,mask)
                maskValue.siteName=req.store.name
                maskValue.domainName=req.store.domain;

                if(group){
                    maskValue.groupName=group.name
                }else{
                    maskValue.groupName=''
                }
                if(item.brand && item.brand.nameL){
                    maskValue.brandName=item.brand.nameL[req.store.lang]
                }else{
                    maskValue.brandName=''
                }
                if(item.category &&item.category[0] && item.category[0].nameL){
                    maskValue.categoryName=item.category[0].nameL[req.store.lang]
                }else{
                    maskValue.categoryName=''
                }
                maskValue.name=item.name;
                maskValue.artikul=(item.artikul)?item.artikul:'';
                /*console.log('maskValue',maskValue)
                console.log('protocol',req.store.protocol)*/



                //console.log(item.stock)
                let formatPrice=(req.store.formatPrice)?-Number(req.store.formatPrice):0;
                let mainCurrency = req.store.mainCurrency;

                try{
                    //StuffClass.setPrice(item,req.store,mainCurrency,formatPrice)
                    //console.log(item.stock)
                }catch(err){console.log(" StuffClass.setPrice(item,req",err)}

                if(!item) {
                    throw '404'
                }
                if(sections && item.link){
                    let arr = item.link.split('/');
                    let urlSection= (arr[0])?arr[0]:arr[1]
                    if(urlSection){
                        let section = sections.find(function (s) {
                            return s.url==urlSection;
                        })
                        if(section && section.type && section.type!=typeList){
                            typeList=section.type;
                        }
                    }

                }
                item.altImg=item.name+' '+((item.artikul)?item.artikul:'')

                let addVar=req.addVar;

                try{
                    /*  обертка для страницы товара*/
                    let key ='wrap-stuffDetail-1';
                    let sd  =req.store.template.stuffDetailType[typeList];
                    sd.type='stuffDetail';
                    sd.wrapclass=key;
                    sd.i=1;
                    jadeData.dj[key]=sd;


                    if(typeof item.grid !='undefined'){
                        if(item.grid>5){
                            jadeData.dj[key].leftClass=globalVar.ratioClassStuffDetail[0]['left']
                            jadeData.dj[key].rightClass=globalVar.ratioClassStuffDetail[0]['right']
                        }else{
                            jadeData.dj[key].leftClass=globalVar.ratioClassStuffDetail[item.grid]['left']
                            jadeData.dj[key].rightClass=globalVar.ratioClassStuffDetail[item.grid]['right']
                        }
                    }else{
                        if(!req.store.template.stuffDetailType[typeList].ratio || req.store.template.stuffDetailType[typeList].ratio>5){
                            jadeData.dj[key].leftClass=globalVar.ratioClassStuffDetail[0]['left']
                            jadeData.dj[key].rightClass=globalVar.ratioClassStuffDetail[0]['right']
                        }else{
                            jadeData.dj[key].leftClass=globalVar.ratioClassStuffDetail[req.store.template.stuffDetailType[typeList].ratio]['left']
                            jadeData.dj[key].rightClass=globalVar.ratioClassStuffDetail[req.store.template.stuffDetailType[typeList].ratio]['right']
                        }
                    }
                    //console.log("req.store.template.stuffDetailType[typeList].ratio",req.store.template.stuffDetailType[typeList].ratio,typeList)

                    setMobileOrTabletStyle(req,sd)
                    getCSSForBlock(itemPath,sd,'stuffDetail',cssData)
                    let f="- var key='"+key+"'"+"\r\n";
                    //  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    //console.log(pugCache['stuffDetail-'+typeList])
                    if(pugCache['stuffDetail-'+typeList]){
                        //console.log('stuffDetail-'+typeList)
                        f+=pugCache['stuffDetail-'+typeList]
                    }else{
                        f+=fs.readFileSync(itemPath+'stuffDetail/stuffDetail-'+typeList+'.jade', "utf8")
                    }

                    let fa = f.split("\n")
                    //console.log(fa)
                    /* конец  обертки*/
                    //req.store.template.stuffDetailType[typeList].parts.length;
                    let i=-1;
                    for(let d of req.store.template.stuffDetailType[typeList].parts){
                        if(d.nameBlockL && d.nameBlockL[req.store.lang]){
                            d.nameBlock=d.nameBlockL[req.store.lang];
                        }else{
                            d.nameBlock=null;
                        }
                        //console.log('d.nameBlock',d.nameBlock,d.type,typeList)
                        i++
                        if(d.is && d.is!='false'){
                            if(!d.type){d.type=d.name}
                            d.i=i;
                            if(d.type=='blocks' && item.blocks){
                                let image,desc;// for titles
                                let data={}
                                if(item.img && typeof item.img!='string'){
                                    delete item.img
                                }
                                parts[d.position]+=await hangleBlocksForPugCompile(item.blocks,req,jadeData,cssData,item);
                            }else{
                                d.i=d.type+item._id+i;
                                parts[d.position]+='\n'+getPartWithKey(d,'stuffDetail',itemPath)
                                jadeData.dj[d.wrapclass]=d;

                                setMobileOrTabletStyle(req,d)
                                getCSSForBlock(itemPath,d,'stuffDetail',cssData,addVar)
                                let addCSS=''
                                if(d.type=='gallery'){
                                    if(req.store.template.index.icons.prevgallery && req.store.template.index.icons.prevgallery.img){
                                        //addCSS+='.gallery .carousel-control.left {background-image: none;transition: all 0.5s ease-in-out;}'
                                        addCSS+='.gallery  .carousel-control.left {background: url("'+req.store.template.index.icons.prevgallery.img+'") no-repeat;background-position: center;width: 30px;}';
                                        addCSS+="\n"
                                    }
                                    if(req.store.template.index.icons.nextgallery && req.store.template.index.icons.nextgallery.img){
                                        addCSS+='.gallery  .carousel-control.right {background: url("'+req.store.template.index.icons.nextgallery.img+'") no-repeat;background-position: center;width: 30px;}';
                                        addCSS+="\n"
                                    }
                                    if(addCSS){
                                        cssData.css+=addCSS;
                                    }
                                }
                            }
                        }
                    }

                    let tab='          ';
                    let r = parts.right.split("\n").map(function (l) {return tab+l})
                    let b = parts.bottom.split("\n").map(function (l) {return tab+l})
                    //console.log(b)
                    let l = parts.left.split("\n").map(function (l) {return tab+l})
                    let t = parts.top.split("\n").map(function (l) {return tab+l})
                    fa.splice.apply(fa,[11,1].concat(b))
                    fa.splice.apply(fa,[9,1].concat(r))
                    fa.splice.apply(fa,[7,1].concat(l))
                    fa.splice.apply(fa,[5,1].concat(t))
                    let jadeSD = fa.join("\n")
                    //console.log(mask)


                    let titles={title:' '+item.name+' '+((item.artikul)?item.artikul:'')};

                    if(mask && mask.length){
                        let tit='';
                        //console.log(item.price+' '+item.currency)
                        mask.forEach(function (el) {
                            //console.log(el)
                            if(el=='price'){
                                //console.log(item.price)
                                tit+=(item.price)?item.price+' '+item.currency:'';
                            }else{
                                tit+=(maskValue[el])?maskValue[el]:'';
                            }
                        })
                        titles.title=tit;
                    }

                    //console.log(item)
                    if(item.img && typeof item.img=='object'){delete item.img}
                    if(!item.img && item.gallery  && item.gallery[0] && item.gallery[0].img){
                        item.img=item.gallery[0].img;
                    }
                    if(!item.gallery  ||  !item.gallery.length){
                        item.gallery=[{img:null,thumb:null,thumbSmall:null}]
                    }
                    let preffixForPhoto = (req.store.photoHost)?req.store.photoHost:'';
                    item.gallery.forEach(function (el) {
                        if(el.img){
                            el.img=((el.img[0]!='/')?preffixForPhoto+'/':preffixForPhoto)+el.img;
                        }
                        if(el.thumb){
                            el.thumb=((el.thumb[0]!='/')?preffixForPhoto+'/':preffixForPhoto)+el.thumb;
                        }
                        if(el.thumbSmall){
                            el.thumbSmall=((el.thumbSmall[0]!='/')?preffixForPhoto+'/':preffixForPhoto)+el.thumbSmall;
                        }
                    })
                    //console.log(item.gallery)
                    if(item.img){titles.image=photoHost+ '/'+ item.img}
                    if(item.desc){titles.description=item.desc.clearTag(250)}
                    titles.canonical=req.store.link+item.link

                    item.titles=titles;

                    jadeData.item=item
                    let itemToStr;
                    if(item.blocks && item.blocks.length){
                        itemToStr = JSON.parse(JSON.stringify(item));
                        delete itemToStr.blocks;
                    }else{
                        itemToStr = item;
                    }
                    item.stuffInList=JSON.stringify(itemToStr)


                    /*fs.mkdirParentPromise('public/views/'+req.store.subDomain).then(function () {
                        fs.writeFile( 'public/views/'+req.store.subDomain+'/stuffDetail'+req.store.subDomain+'.css', cssData.css, function (err, data) {
                            if (err) console.log(err);
                        } );
                        fs.writeFile( 'public/views/'+req.store.subDomain+'/stuffDetail_'+req.store.subDomain+'.pug', jadeSD, function (err, data) {
                            if (err) console.log(err);
                        } );
                    })*/
                    //console.log(titles)
                    let o={
                        jadeItem:jadeSD,
                        jadeData:jadeData,
                        cssData:cssData,
                        titles:titles,
                    }
                    resolve(o)
                }catch(e){
                    console.log('getStuffDetail ',e)
                    return '';

                }
            },function(err){
                console.log('eror 2 promise ',req.store.subDomain,JSON.stringify(req.params),err);
                let titles={title:' 404'};
                let jadeHTML='';
                let parts=[];
                let tab = '    ';

                let key ="404"
                parts.push("- var key = '"+key+"'")
                parts.push("div(class=dj[key].wrapclass)")
                parts.push("  div(class=mobileWrapper)")
                data404.homeHref=req.store.link;
                jadeData.dj[key]=data404;
                let fileName = path.join( __dirname, '../../public/views/404include.jade' );
                jadeHTML=fs.readFileSync(fileName, "utf8")
                parts.splice.apply(parts,[3,0].concat(jadeHTML.split('\n').filter(function(e){return e;}).map(function (l) {return tab+l})))
                let jadeItem =parts.join("\n")
                fileName = path.join( __dirname, '../../public/styles/404.css' );
                cssData.css=fs.readFileSync(fileName, "utf8")

                let o={
                    jadeItem:jadeItem,
                    jadeData:jadeData,
                    cssData:cssData,
                    titles:titles,
                    item:404
                }
                //console.log(o)
                return resolve(o)


            })
            .catch(function (err) {
                if(err!=404){reject(err)}
                //throw err;
                let titles={title:' 404'};
                let jadeHTML='';
                let parts=[];
                let tab = '    ';

                let key ="404"
                parts.push("- var key = '"+key+"'")
                parts.push("div(class=dj[key].wrapclass)")
                parts.push("  div(class=mobileWrapper)")
                data404.homeHref=req.store.link;
                jadeData.dj[key]=data404;
                let fileName = path.join( __dirname, '../../public/views/404include.jade' );
                jadeHTML=fs.readFileSync(fileName, "utf8")
                parts.splice.apply(parts,[3,0].concat(jadeHTML.split('\n').filter(function(e){return e;}).map(function (l) {return tab+l})))
                let jadeItem =parts.join("\n")
                fileName = path.join( __dirname, '../../public/styles/404.css' );
                cssData.css=fs.readFileSync(fileName, "utf8")

                let o={
                    jadeItem:jadeItem,
                    jadeData:jadeData,
                    cssData:cssData,
                    titles:titles,
                    item:404
                }
                //console.log(o)
                return resolve(o)
            })
    })
} //stuffdetail

function getStuff(storeId,stuffHost,stuffUrl,lang){
    if(!isWin){
        stuffHost='http://127.0.0.1:'+stuffHost.split(':')[2]
    }
    //console.log(stuffHost)
    let url = stuffHost+"/api/collections/Stuff/"+stuffUrl+"?store="+storeId+'&lang='+lang;
    //let url = stuffHost+"/api/collections/"+model+"?store="+storeId+'&'+query+lang;


    let headers = {
        "accept-charset" : "ISO-8859-1,utf-8;q=0.7,*;q=0.3",
        "accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8;application/json;charset=utf-8,*/*",
        "user-agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
        "accept-encoding" : "gzip",
        'Accept-Encoding': 'gzip',
    };
    let options = {
        uri: url,
        json: true,
        method: 'GET',
        timeout: 1500,
        headers:headers
        /* href: '',
         pathname: '/'*/
    };
    let req = request(options);
    return new Promise(function(resolve,reject){
        req.on('response', function(res) {
            var chunks = [];
            res.on('data', function(chunk) {
                //console.log(chunk)
                chunks.push(chunk);
            });

            res.on('end', function() {
                var buffer = Buffer.concat(chunks);
                //console.log(buffer)
                if(buffer.byteLength==2){return resolve([])}// нет ничего пустой массив
                var encoding = res.headers['content-encoding'];

                zlib.unzip(buffer, function(err, unzipbuffer) {
                    if (!err) {
                        try{
                            let results =JSON.parse(unzipbuffer.toString('utf8'));
                            //console.log(results)
                            return resolve(results);
                        }catch(err){
                            console.log('error in try',err)
                            return reject(err)
                        }
                    }else{
                        //console.log('err',err)
                        //console.log(buffer.toString())
                        if(buffer.toString){
                            try{
                                let data = JSON.parse(buffer.toString())
                                return resolve(data)
                            }catch(err){}

                        }
                        reject(err)

                    }
                });
            });
            res.on('error', function(err) {
                console.log('msg',err)
                reject(err)
            })
        });
    })



    return new Promise(function(resolve,reject){
        let url = stuffHost+"/api/collections/Stuff/"+stuffUrl+"?store="+storeId;
        const options = {
            url: url,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Accept-Charset': 'utf-8',
                //'User-Agent': 'my-reddit-client'
            }
        };
        request(options, function(err,response){
            /*console.log(response.body)
            console.log(response.statusCode)*/
            if(err){return reject(err)}
            if(response.statusCode!=200){
                let error = new Error(404)
                return reject(error)
            }
            console.log(response.body)
            try{
                var item=JSON.parse(response.body);
            }catch(err){
                console.log('err getStuff',url)
                return reject(err)
            }
            return resolve(item);
        })
    })
}

function gethumanizeHour(h,landData){
    if(h==1 || h==21){
        return landData.hour}
    else if((h>1&&h<5)||(h>21 && h<25)){
        return landData.hours
    }else if(h==0 ||h<21){
        return landData.hourss }
}
function gethumanizeMin(h,landData){
    if(h==1 || h==21|| h==31|| h==41|| h==51){
        return landData.minute_a}
    else if((h>1&&h<5)||(h>21 && h<25)||(h>31 && h<35)||(h>41 && h<45)||(h>51 && h<55)){
        return landData.minutes
    }else if(h==0||h<21 || (h>24 && h<31)|| (h>34 && h<41)|| (h>44 && h<51)|| (h>54 && h<61)){
        return landData.minutess }
}




