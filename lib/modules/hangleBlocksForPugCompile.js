'use strict';
const path=require('path');
const getPartWithKey = require('../modules/getPartWithKey');
const getCSSForBlock = require('../modules/getCSSForBlock');
const getItemsForPage = require('../modules/getItemsForPage');
const setMobileOrTabletStyle=require('../setMobileOrTabletStyle');
const bookingClass=require('../../public/scripts/BookingClass.js')
const moment = require('moment');
const string= 'abcdefghijklmnopqrstuvwxyzQAZWSXEDCRFVTGBYHNUJMIKOLP1234567890';
function shuffle(len) {
    var parts = string.split('');
    for (var i = parts.length; i > 0;) {
        var random = parseInt(Math.random() * i);
        var temp = parts[--i];
        parts[i] = parts[random];
        parts[random] = temp;
    }
    return parts.join('').substring(0,len);
}

const hangleBlocksForPugCompile= async function (blocks,req,jadeData,cssData,item){
    try{
        //console.log('hangleBlocksForPugCompile',req.url,req.store.subDomain,blocks.length)
        let homePath = path.join( __dirname, '../../public/views/template/partials/home/' );
        let photoHost=req.photoHost;
        let stuffHost=req.stuffHost;
        let addVar=req.addVar;
        let str='';
        let idx=0;
        let index=-1;

        /*const waitFor = (ms) => new Promise(r => setTimeout(r, ms))
         async function asyncForEach(array, callback) {
         for (let index = 0; index < array.length; index++) {
         await callback(array[index], index, array)
         }
         }
         const start = async () => {
         await asyncForEach([1, 2, 3], async (num) => {
         await waitFor(50)
         console.log(num)
         })
         console.log('Done')
         }
         await start()
         run()*/
        /*async function run() {
         console.log('???????????')

         }*/
        for(let d of blocks){
            //console.log(d.type)
           /* if(d.type=='groupStuffs'){
                console.log(d)
            }*/
            index++;
            if(blocks[index-1] && blocks[index-1].img){
                addVar.$imgPrevBlock='"'+blocks[index-1].img+'"';'"'+req.photoHost+'/'+blocks[index-1].img+'"';
            }else if(addVar.$imgPrevBlock){
                addVar.$imgPrevBlock='"'+req.store.backgroundImg+'"';'"'+req.photoHost+'/'+req.store.backgroundImg+'"';
            }

            if(blocks[index].img){
                blocks[index].alt=blocks[index].name||blocks[index].type
            }
            if(blocks[index].imgs && blocks[index].imgs.lrngth){
                blocks[index].imgs.forEach(function(img){
                    img.alt=img.name||blocks[index].type
                })
            }
            if(blocks[index][blocks[index].type] && blocks[index][blocks[index].type].forEach){
                blocks[index][blocks[index].type].forEach(function(img){
                    if(img && typeof img=='object'){
                        img.alt=img.name
                    }
                })
            }
            // для банннера
            d.element='div';
            d.elementFull='div';
            if(d.link){
                if(d.link == 'subscription' || d.link == 'subscriptionAdd' || d.link == 'feedback' || d.link == 'dateTime' || d.link == 'allBonus' || d.link == 'call'){
                    d.ngClick="global.get('functions').val.action('"+d.link+"')"
                } else {
                    d.href = d.link;
                }
                d.element='a';
                d.elementFull='a';
                if(d.ngClick){
                    d.elementFull+='(ng-click="'+d.ngClick+'")'
                }else{
                    d.elementFull+='(href="'+d.href+'")';
                }
            }else{
                d.element='div'
            }
            //console.log(d.elementFull)

            if(d.button && d.button.link){
                if(d.button.link == 'subscription' || d.button.link == 'subscriptionAdd' || d.button.link == 'feedback' || d.button.link == 'dateTime' || d.button.link == 'allBonus' || d.button.link == 'call'){
                    d.button.ngClick="global.get('functions').val.action('"+d.button.link+"')"
                }else{
                    d.button.href = d.button.link;
                }
            }
            if(d.button1 && d.button1.link){
                if(d.button1.link == 'subscription' || d.button1.link == 'subscriptionAdd' || d.button1.link == 'feedback' || d.button1.link == 'dateTime' || d.button1.link == 'allBonus' || d.button1.link == 'call'){
                    d.button1.ngClick="global.get('functions').val.action('"+d.button1.link+"')"
                }else{
                    d.button1.href = d.button1.link;
                }
            }


            /*********************/
            if(d.type && d.is && d.is!='false'){
                //console.log(d.type)
                idx++;
                if(req.mobile){
                    d.animate=null;
                }
                switch (d.type[d.type.length-1]){
                    case '1':{d.type=d.type.substring(0,d.type.length-1)+'One';break;}
                    case '2':{d.type=d.type.substring(0,d.type.length-1)+'Two';break;}
                    case '3':{d.type=d.type.substring(0,d.type.length-1)+'Three';break;}
                }
                if(d._id){

                    d.i=d._id
                }else if(item && item._id){
                    d.i=item._id
                }else{
                    d.i=shuffle(4)
                }

                /*if(item && item._id){
                 d.i=item._id
                 }else{
                 d.i=shuffle(4)
                 }*/

                d.i+=index
                let templ;
                if(d.type=='info' && d.templ){
                    templ=d.templ
                }

                if(item && !item.img && (d.type=='banner'||d.type=='bannerOne') && d.useImg){
                    if(d.img){
                        item.img=d.img;
                    }

                }
                if(item && !item.desc && (d.type=='banner'||d.type=='bannerOne' || d.type=='text' || d.type=='text2') && d.useDesc){
                    if(d.desc){
                        item.desc=(d.desc.clearTag)?d.desc.clearTag():d.desc.clearTag;
                    }
                }
                if(d.type=='name' && item){
                    d.name=item.name;
                }
                if(d.type=='position' && item){
                    d.position=item.position;
                }
                if(d.type=='date' && item){
                    moment.locale(req.store.lang)
                    d.date=moment(item.date).format('LL');
                }
                if(item && !item.img &&(d.type=='slider' ||d.type=='stuffs' || d.type=="campaign" || d.type=="filterTags"||
                    d.type=="brandTags"|| d.type=="brands"|| d.type=="categories") && d[d.type]&& d[d.type][0]&& d[d.type][0].img){
                    item.img=d[d.type][0].img;
                }
                if(d.button && typeof d.button=='object'){
                    if(d.button && d.button.textL && d.button.textL[req.store.lang]){
                        d.button.text =d.button.textL[req.store.lang];
                    }
                    //d.button.text =(d.button && d.button.textL && d.button.textL[req.store.lang])?d.button.textL[req.store.lang]:''
                }

                if(d.button1 && typeof d.button1=='object'){
                    if(d.button1 && d.button1.textL && d.button1.textL[req.store.lang]){
                        d.button1.text =d.button1.textL[req.store.lang];
                    }
                    //d.button1.text =(d.button1 && d.button1.textL && d.button1.textL[req.store.lang])?d.button1.textL[req.store.lang]:''
                }

                /*if(d.type=='groupStuffs'){
                    //console.log(getPartWithKey(d,'home',homePath))
                    console.log(d.groupStuffs)
                }*/

                str += getPartWithKey(d,'home',homePath);



                jadeData.dj[d.wrapclass]=d;

                /*if(d.type=='schedule' && item){
                 jadeData.dj[d.wrapclass]._id=item._id
                 }*/
                setMobileOrTabletStyle(req,d)
                /*if(d.type=='filters'){
                 console.log('d.filters',d.filters[0].tags[1])
                 }*/
                let masters;
                let dataM={query:null,model:'Master',lang:req.store.lang}
                if(d.type=='scheduleplace'){

                    //console.log(req.allData.workplaces)

                    if(item && d.stuffs && d.stuffs[0] && d.stuffs[0]._id){
                        d.scheduleStuff=d.stuffs[0]._id;
                    }
                    //console.time('scheduleplace0')
                    let dateWeek;
                    if(d.week){
                        dateWeek= new Date()
                        dateWeek.setTime(dateWeek.getTime() + (d.week*7)*86400000);
                        dateWeek.setHours(0)
                    }

                    const BookingClass=new bookingClass.init(req.store,dateWeek);

                    //console.timeEnd('scheduleplace0')
                    //console.time('scheduleplace')

                    /*if(d.scheduleStuff){
                     BookingClass.query['service._id']=d.scheduleStuff
                     }*/
                    //console.log(BookingClass.query)
                    let data={query:'query='+JSON.stringify(BookingClass.query),model:'Booking',lang:req.store.lang}
                    let entries =  await getItemsForPage(req.store._id,req.orderHost,data)
                    entries.shift();
                    //console.log('masters',masters)
                    if(!masters)
                        masters =  await getItemsForPage(req.store._id,req.stuffHost,dataM)
                    let services = {}
                    d.service={name:''}
                    entries.forEach(function (e) {
                        if(e.service && e.service._id){
                            if(e.service.nameL && e.service.nameL[req.store.lang]){
                                e.service.name=e.service.nameL[req.store.lang];
                            }
                            if(!services[e.service._id]){
                                services[e.service._id]=e.service
                            }
                        }

                        //console.log(e.masters && e.masters.length)
                        if(e.masters && e.masters.length){
                            e.masters=e.masters.map(m=>masters.find(m1=>m1._id==m))
                            //console.log(e.usedTime)
                        }

                    })
                    if(d.scheduleStuff){
                        entries=entries.filter(e=>e.service && e.service._id==d.scheduleStuff)
                        if(services[d.scheduleStuff]){
                            services[d.scheduleStuff].class='active'
                            d.service=services[d.scheduleStuff]
                        }
                    }

                    d.services = services
                    d.servicesStringify = JSON.stringify(services)
                    //console.log(d.services)

                    //console.log(entries.length)
                    //console.timeEnd('scheduleplace')
                    /*let stuffs = entries.map(e=>e.service._id)
                     let uniq = [...new Set(stuffs)];
                     console.log(stuffs)
                     console.log(uniq)
                     data={query:{_id:{$in:uniq}},model:'Stuff',lang:req.store.lang}
                     let services =  await getItemsForPage(req.store._id,req.stuffHost,data)*/
                    //console.time('scheduleplace1')

                    d.datesOfWeeks=BookingClass.datesOfWeeks;
                    d.currentMonth=BookingClass.currentMonth;
                    //console.log(entries)
                    let workplaces = (req.allData &&req.allData.workplaces)?req.allData.workplaces:[];
                    //console.log(workplaces)
                    d.weekDataFull=BookingClass.getBookingWeekScheldule(entries,req.store.lang,workplaces)
                    //console.log(d.weekDataFull)
                    d.weekData={}
                    d.noSchedule=true;
                    for(var dayD in d.weekDataFull){
                        //console.log(d.weekDataFull[dayD])
                        d.weekData[dayD]={}
                        d.weekData[dayD].entryTimeTable=d.weekDataFull[dayD].entryTimeTable.filter(function (part) {
                            return part.usedTime
                        })
                        if(d.weekDataFull[dayD].entryTimeTableW){
                            d.weekData[dayD].entryTimeTableW={}
                            d.weekData[dayD].entryTimeTableMobile={};
                            d.weekData[dayD].entryTimeTableMobile=[];

                            for(let k in d.weekDataFull[dayD].entryTimeTableW){
                                d.weekData[dayD].entryTimeTableW[k]=d.weekDataFull[dayD].entryTimeTableW[k].filter(function (part) {
                                    return part.usedTime
                                })
                                d.weekData[dayD].entryTimeTableMobile=d.weekData[dayD].entryTimeTableMobile.concat(d.weekData[dayD].entryTimeTableW[k])
                                //console.log(d.weekData[dayD].entryTimeTableW[k])
                            }
                        }
                        if(!d.weekData[dayD].entryTimeTableMobile){
                            d.weekData[dayD].entryTimeTableMobile=d.weekData[dayD].entryTimeTable;
                        }
                        d.weekData[dayD].entryTimeTableMobile.sort(function (a,b) {
                            return a.i-b.i
                        })

                        //console.log(d.weekData[dayD].entryTimeTableMobile)

                        if(!d.weekData[dayD].entryTimeTable.length){
                            delete d.weekData[dayD];
                        }else if(d.noSchedule){
                            d.noSchedule=false;
                        }
                    }
                    //console.log(req.allData)
                    if(req.allData.workplaces){
                        d.workplaces=req.allData.workplaces.map(w=>{
                            let o={
                                _id:w._id,
                                name:((w.nameL && w.nameL[req.store.lang])?w.nameL[req.store.lang]:'????wp')
                            }
                            return o})
                    }
                    //console.log( d.workplaces)

                    d.weeksRange=BookingClass.weeksRange;
                    d.timePartsForTable=BookingClass.getTimePartsForTable();

                    //console.timeEnd('scheduleplace1')
                    //console.log(d.datesOfWeeks)
                    //console.log(d.weekData.date20180223.entryTimeTable)


                }

                //console.log(index,'-',d.type)
                jadeData.dj[d.wrapclass]=d;
                try{
                    getCSSForBlock(homePath,d,'home',cssData,addVar)
                }catch(err){
                    console.log(err)
                }

                /*if(d.type=='slider' && d.index==7){
                 let sss ={css:null}
                 getCSSForBlock(homePath,d,'home',sss,addVar)
                 console.log(sss.css)
                 }*/
                d.additionalClass=(d.animate)?' pre-animate-opacity':'';

                if(d.img) {
                    jadeData.dj[d.wrapclass].backgroundStyle = "background-image:url(" + photoHost + '/' + d.img + ");"
                    d.img=photoHost+'/'+d.img
                }

                if(idx==1 &&(d.type=='slider' || d.type=='banner' || d.type=='bannerOne' ||d.type=='video')){
                    d.id='arrowDownDiv'
                    d.arrowDownDiv='arrowDownDiv'
                }else{
                    d.id=d._id;
                }
                if(d.type=='schedule' && item){
                    d._id=item._id
                    //console.log(d._id)
                }
                if(d.type=='stuffs' && d.stuffs && d.stuffs.length){
                    if(!masters)
                        masters =  await getItemsForPage(req.store._id,req.stuffHost,dataM)
                    for(let s of d.stuffs){
                        if(s.desc){
                            s.desc=s.desc.clearTag().substring(0,150)
                            s.desc= s.desc.substr(0, Math.min(s.desc.length, s.desc.lastIndexOf(" ")))+' ...'
                            //s.substr(0, Math.min(s.length, s.lastIndexOf(" ")))+' ...'
                        }
                        if(photoHost){
                            s.img=photoHost + '/' + s.img;
                            if(s.gallery && s.gallery[0]){
                                if(s.gallery[0].img){
                                    s.gallery[0].img=photoHost + '/' + s.gallery[0].img;
                                }
                                if(s.gallery[0].thumb){
                                    s.gallery[0].thumb=photoHost + '/' + s.gallery[0].thumb;
                                }
                                if(s.gallery[0].thumbSmall){
                                    s.gallery[0].thumbSmall=photoHost + '/' + s.gallery[0].thumbSmall;
                                }
                            }
                        }else{
                            if(s.img && s.img.length && typeof s.img=='object'){
                                s.img=s.img[0];
                            }
                        }
                        //console.log(masters)

                        s.masters=[]
                        if(masters && masters.length){
                            masters.forEach(function (m) {
                                if(m.stuffs && m.stuffs.length){
                                    if(m.stuffs.indexOf(s._id)>-1){
                                        var o ={
                                            name:m.nameL[req.store.lang],
                                            url:m.url,
                                        }
                                        s.masters.push(o)
                                    }
                                }
                            })
                        }
                        //console.log(s.masters)


                    }
                }
                if(d.type=='groupStuffs' && d.groupStuffs && d.groupStuffs.length){
                    d.groupStuffs.forEach(s=>{

                        if(s.desc){
                            s.desc=s.desc.clearTag().substring(0,150)
                            s.desc= s.desc.substr(0, Math.min(s.desc.length, s.desc.lastIndexOf(" ")))+' ...'
                            //s.substr(0, Math.min(s.length, s.lastIndexOf(" ")))+' ...'
                        }
                        if(photoHost){
                            s.img=photoHost + '/' + s.img;
                        }else{
                            if(s.img && s.img.length && typeof s.img=='object'){
                                s.img=s.img[0];
                            }
                        }
                    })
                }
                //if(d.desc){d.desc.trim()}
                if(d.type=='slider'){
                    jadeData.dj[d.wrapclass].delta=3;
                    jadeData.dj[d.wrapclass].className  ="col-lg-4 col-md-4 col-sm-4 col-xs-4 home-section"
                    if(req.tablet){
                        jadeData.dj[d.wrapclass].delta=2;
                        jadeData.dj[d.wrapclass].className  ="col-lg-6 col-md-6 col-sm-6 col-xs-6 home-section"
                    }else if(req.mobile){
                        jadeData.dj[d.wrapclass].className  ="col-lg-12 col-md-12 col-sm-12 col-xs-12 home-section"
                        jadeData.dj[d.wrapclass].delta=1;
                    }
                    if(d.imgs && d.imgs.length){
                        d.imgs=d.imgs.filter(function(i){
                            return i.actived
                        })
                        d.imgs.forEach(function (slide) {
                            if(slide.button && typeof slide.button=='object'){
                                if(slide.button.is){
                                    if(slide.button.is=='false'){slide.button.is=false}else if(slide.button.is=='true'){slide.button.is=true}
                                }
                            }
                            if(slide.link && (slide.link.indexOf('://')>-1||slide.link.indexOf('www')>-1)){slide.target='_blank'}
                            if(slide.link == 'subscription' || slide.link == 'subscriptionAdd' || slide.link == 'feedback' ||slide.link == 'dateTime'
                                || slide.link == 'allBonus' || slide.link == 'call'){
                                slide.ngClick="global.get('functions').val.action('"+slide.link+"')"
                            } else {
                                slide.href = slide.link;
                            }


                            if(slide.button && slide.button.is){
                                if(slide.button.link=='dateTime'){
                                    slide.button.link=null;
                                    slide.button.ngClick="$ctrl.global.get('functions').val.witget('dateTime')"
                                }else if(slide.button.link=='feedback'){
                                    slide.button.link=null;
                                    slide.button.ngClick="$ctrl.global.get('functions').val.witget('feedback')"
                                }else if(slide.button.link=='orderStuffFromHP'){
                                    slide.button.link=null;
                                    slide.button.ngClick="global.get('functions').val.orderStuffFromHP('"+slide.button.stuffUrl+"')"
                                }else if(slide.button.link=='subscription'){
                                    slide.button.link=null;
                                    slide.button.ngClick="$ctrl.global.get('functions').val.witget('subscription')"
                                }else if(slide.button.link=='call'){
                                    slide.button.link=null;
                                    slide.button.ngClick="$ctrl.global.get('functions').val.witget('call')"
                                }else if(slide.button.link=='subscriptionAdd'){
                                    slide.button.link=null;
                                    slide.button.ngClick="$ctrl.global.get('functions').val.witget('subscriptionAdd')"
                                }else if(slide.button.link=='allBonus'){
                                    slide.button.link=null;
                                    slide.button.ngClick="$ctrl.global.get('functions').val.witget('allBonus')"
                                }else{
                                    slide.button.href=slide.button.link;
                                }
                            }
                        })
                    }
                }/*else if(d.type=='info' && templ){
                 jadeData.dj[d.wrapclass].templ=templ
                 }*/


            }
        }
        return str+"\n";
    }catch(err){
        console.log(err)
    }

}
module.exports = hangleBlocksForPugCompile ;
/*
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}
*/
