'use strict';
module.exports = handleLanguageStore;

function handleLanguageStore(store,lang){
    //console.log(store.lang)
    if(!store.lang){
        store.lang='ru'
    }
    if(lang && store.langArr && store.langArr.length && store.langArr.indexOf(lang)>-1){
        store.lang=lang;
    }
    if(store.locationL && store.locationL[store.lang]){
        store.location=store.locationL[store.lang];
        store.locationL=null
    }else{
        store.location
    }
    //console.log(store.nameListsL[store.lang])
    if(store.nameListsL && store.nameListsL[store.lang]){
        store.nameLists=store.nameListsL[store.lang];
        store.nameListsL=null
    }
    if(store.template && store.template.menu1 && store.template.menu1.descL && store.template.menu1.descL[store.lang]){
        store.template.menu1.desc=store.template.menu1.descL[store.lang]
        store.template.menu1.descL=null
    }
    if(store.template && store.template.menu2 && store.template.menu2.descL && store.template.menu2.descL[store.lang]){
        store.template.menu2.desc=store.template.menu2.descL[store.lang]
        store.template.menu2.descL=null
    }
    if(store.template && store.template.menuTablet && store.template.menuTablet.menu1 && store.template.menuTablet.menu1.descL && store.template.menuTablet.menu1.descL[store.lang]){
        store.template.menuTablet.menu1.desc=store.template.menuTablet.menu1.descL[store.lang]
        store.template.menuTablet.menu1.descL=null
    }
    if(store.template && store.template.menuTablet && store.template.menuTablet.menu2 && store.template.menuTablet.menu2.descL && store.template.menuTablet.menu2.descL[store.lang]){
        store.template.menuTablet.menu2.desc=store.template.menuTablet.menu2.descL[store.lang]
        store.template.menuTablet.menu2.descL=null
    }
    if(store.template && store.template.menuMobile && store.template.menuMobile.menu1 && store.template.menuMobile.menu1.descL && store.template.menuMobile.menu1.descL[store.lang]){
        store.template.menuMobile.menu1.desc=store.template.menuMobile.menu1.descL[store.lang]
        store.template.menuMobile.menu1.descL=null
    }
    if(store.template && store.template.menuMobile && store.template.menuMobile.menu2 && store.template.menuMobile.menu2.descL && store.template.menuMobile.menu2.descL[store.lang]){
        store.template.menuMobile.menu2.desc=store.template.menuMobile.menu2.descL[store.lang]
        store.template.menuMobile.menu2.descL=null
    }

    if(store.nameL && store.nameL[store.lang]){
        store.name=store.nameL[store.lang];
        store.nameL=null
    }


    if(store.unitOfMeasureL && store.unitOfMeasureL[store.lang]){
        store.unitOfMeasure=store.unitOfMeasureL[store.lang];
        store.unitOfMeasureL=null
    }
    /*if(store.subDomain=='tatiana'){
        console.log('1',store.footer)
    }*/

    if(store.footer){
        store.footer.text=''
        if(store.footer.textL && store.footer.textL[store.lang]){
            store.footer.text=store.footer.textL[store.lang];
            store.footer.textL=null
        }else {
            store.footer.text=''
        }
        if(store.footer.text1L && store.footer.text1L[store.lang]){
            store.footer.text1=store.footer.text1L[store.lang];
            store.footer.text1L=null
        }else {
            store.footer.text1=''
        }
    }
    /*if(store.subDomain=='tatiana'){
        console.log('2',store.footer)
    }*/
    //console.log(store.footer)
    //console.log('store.footerTablet',store.footerTablet)
    if(store.footerTablet){
        if(store.footerTablet.textL && store.footerTablet.textL[store.lang]){
            store.footerTablet.text=store.footerTablet.textL[store.lang];
            store.footerTablet.textL=null
        }else {
            store.footerTablet.text=''
        }
        if(store.footerTablet.text1L && store.footerTablet.text1L[store.lang]){
            store.footerTablet.text1=store.footerTablet.text1L[store.lang];
            store.footerTablet.text1L=null
        }else {
            store.footerTablet.text1=''
        }
    }
    if(store.footerMobile){
        if(store.footerMobile.textL && store.footerMobile.textL[store.lang]){
            store.footerMobile.text=store.footerMobile.textL[store.lang];
            store.footerMobile.textL=null
        }else {
            store.footerMobile.text=''
        }
        if(store.footerMobile.text1L && store.footerMobile.text1L[store.lang]){
            store.footerMobile.text1=store.footerMobile.text1L[store.lang];
            store.footerMobile.text1L=null
        }else {
            store.footerMobile.text1=''
        }
    }

    if(store.humburgerL && store.humburgerL[store.lang]){
        store.humburger=store.humburgerL[store.lang];
        store.humburgerL=null
    }else{
        store.humburger=''
    }
    if(store.bonusButtonTextL && store.bonusButtonTextL[store.lang]){
        store.bonusButtonText=store.bonusButtonTextL[store.lang];
        store.bonusButtonTextL=null
    }else{
        store.bonusButtonText=''
    }
    if(store.seoL && store.seoL[store.lang]){
        store.seo=store.seoL[store.lang];
        store.seoL=null
    }
    if(store.textConditionL && store.textConditionL[store.lang]){
        store.textCondition=store.textConditionL[store.lang];
        store.textConditionL=null
        //console.log(store.textCondition)
    }else{
        store.textCondition=''
    }

    if(store.seller && store.seller.payInfoL && store.seller.payInfoL[store.lang]){
        store.seller.payInfo=store.seller.payInfoL[store.lang];
        store.seller.payInfoL=null
    }else if(store.seller && store.seller.payInfo){
        store.seller.payInfo=''
    }

    if(store.addcomponents && typeof store.addcomponents=='object'){
        for(let key in store.addcomponents){
            if(store.addcomponents[key] && store.addcomponents[key].nameL && store.addcomponents[key].nameL[store.lang]){
                store.addcomponents[key].name=store.addcomponents[key].nameL[store.lang];
                store.addcomponents[key].nameL[store.lang]=null;
            }
            if(store.addcomponents[key] && store.addcomponents[key].descL && store.addcomponents[key].descL[store.lang]){
                store.addcomponents[key].desc=store.addcomponents[key].descL[store.lang];
                store.addcomponents[key].descL[store.lang]=null;
            }
        }
    }
    //console.log(store.lang,store.location)

}