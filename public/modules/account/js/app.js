if (matchMedia) {
    const mq = window.matchMedia("(min-width: 1000px)");
    mq.addListener(WidthChange);
    WidthChange(mq);
}

// media query change
function WidthChange(mq) {
    if (mq.matches) {
        console.log(" window width is at least 500px")
    } else {
        console.log("window width is less than 500px")
    }

}


var myApp= angular.module('gmall', [
    'ngRoute','ui.router','ngResource','ngCookies',
    'ui.bootstrap',
    'ngAnimate',
    'gmall.controllers',
    'gmall.services',
    'gmall.directives',
    'gmall.filters',
    'ui.select',
    'dndLists',
    'daterangepicker',
    'toaster',
    //'textAngular',
    'gmall.exception',
    'satellizer',
    'ngMessages',
    'pageslide-directive',
    'angular-click-outside',
    'rzModule',
    'ui.mask',
    'colorpicker.module',
    'ui.tinymce'
])


myApp.run(['$rootScope', '$state', '$stateParams','globalSrv','global','$timeout','$window','$location','$templateCache','$q','$filter','$route', function ($rootScope,$state,$stateParams,globalSrv,global,$timeout,$window,$location,$templateCache,$q,$filter,$route) {
    global.set('store', storeTemp);
    //console.log(storeTemp)
    if (mobileFromServer) {
        global.set('mobile', mobileFromServer);

    }
    if (dataFromServer) {
        //console.log(dataFromServer.virtualAccounts)
       // console.log(dataFromServer)
        global.set('virtualAccounts', dataFromServer.virtualAccounts);
        global.set('accounts', dataFromServer.accounts);
        global.set('workingHour', workingHour);
    }

    if( typeof unitOfMeasure !='undefined'){
        global.set('unitOfMeasure', unitOfMeasure);
    }
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
        console.log(global.get('user').val)
        if(!global.get('user').val){
            console.log(global.get('user').val)
            event.preventDefault();
            $state.go('frame')
            return;
        }
    })

    moment.locale('ru')
    $rootScope.moment=moment;
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.global=global;


    var lang,langError,langOrder,langForm,langNote;
    globalSrv.getData('lang').then(function(response){
        var d = {}
        //console.log(response.data[1].tags)
        if(response.data && response.data.length && response.data[1].tags){
            lang=response.data[1].tags;
            for(var k in response.data[1].tags){
                d[k]=response.data[1].tags[k][global.get('store').val.lang]
            }
        }
        global.set('lang',d);
        //console.log(global.get('lang').val);
        //console.log(global.get('langError'))
        //console.log(global.get('store').val,global.get('langError'))
        //return response.data
    })
    globalSrv.getData('langError').then(function(response){
        var d = {}
        //console.log(response.data[1].tags)
        if(response.data && response.data.length && response.data[1].tags){
            langError=response.data[1].tags;
            for(var k in response.data[1].tags){
                d[k]=response.data[1].tags[k][global.get('store').val.lang]
            }
        }
        global.set('langError',d);
        //console.log(global.get('langError'))
        //console.log(global.get('store').val,global.get('langError'))
        //return response.data
    })
    globalSrv.getData('langNote').then(function(response){
        var d = {}
        //console.log(response.data[1].tags)
        if(response.data && response.data.length && response.data[1].tags){
            langNote=response.data[1].tags;
            for(var k in response.data[1].tags){
                d[k]=response.data[1].tags[k][global.get('store').val.lang]
            }
        }
        global.set('langNote',d);
        //console.log(global.get('langNote'))
        //console.log(global.get('store').val,global.get('langNote'))
        //return response.data
    })
    globalSrv.getData('langOrder').then(function(response){
        var d = {}
        //console.log(response.data[1].tags)
        if(response.data && response.data.length && response.data[1].tags){
            langOrder=response.data[1].tags;
            for(var k in response.data[1].tags){
                d[k]=response.data[1].tags[k][global.get('store').val.lang]
            }
        }
        global.set('langOrder',d);
        //console.log(global.get('langOrder'))
    })
    globalSrv.getData('langForm').then(function(response){
        var d = {}
        //console.log(response.data[1].tags)
        if(response.data && response.data.length && response.data[1].tags){
            langForm=response.data[1].tags;
            for(var k in response.data[1].tags){
                d[k]=response.data[1].tags[k][global.get('store').val.lang]
            }
        }
        global.set('langForm',d);
        //console.log(global.get('langForm'))
    })

}])

myApp.config(['$stateProvider', '$urlRouterProvider','$locationProvider','globalProvider','$authProvider','$httpProvider',function ($stateProvider,$urlRouterProvider,$locationProvider,globalProvider,$authProvider,$httpProvider){

    $httpProvider.interceptors.push('myInterceptorService');
    $authProvider.baseUrl=userHost;
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
    globalProvider.setUrl( {
        lang:'/api/collections/Lang?query={"name":"gmall.home"}',
        langError:'/api/collections/Lang?query={"name":"index.error"}',
        langNote:'/api/collections/Lang?query={"name":"index.note"}',
        langOrder:'/api/collections/Lang?query={"name":"index.order"}',
        langForm:'/api/collections/Lang?query={"name":"index.form"}',

    });
    // инициализация глобальных переменных
    globalProvider.set('store');
    globalProvider.set('accounts');
    globalProvider.set('virtualAccounts');
    globalProvider.set('workingHour');
    globalProvider.set('user');
    globalProvider.set('admin');
    globalProvider.set('mobile');
    globalProvider.set('unitOfMeasure');
    globalProvider.set('nostore');
    globalProvider.set('sellers');
    globalProvider.set('seller');
    globalProvider.set('functions');
    globalProvider.set('lang')
    globalProvider.set('langError')
    globalProvider.set('langNote')
    globalProvider.set('langOrder')
    globalProvider.set('langForm')

    /*$urlRouterProvider
        .when('/account/','/account')*/

    $stateProvider
        .state("frame", {
            url: "/bookkeep?token",
            controller: 'mainFrameCtrl',
            templateUrl:"modules/account/views/index.html"
        })

        .state("frame.account", {
            url: "/account",
            template :'<account></account>'
        })
        .state("frame.Rate", {
            url: "/Rate",
            template :'<rate></rate>'
        })
        .state("frame.virtualAccount", {
            url: "/virtualAaccount",
            template :'<virtualaccount></virtualaccount>'
        })
        .state("frame.producer", {
            url: "/producer",
            template :'<producer></producer>'
        })
        .state("frame.sampleEntries", {
            url: "/sampleEntries",
            template :'<sample-entries></sample-entries>'
        })
        .state("frame.sampleEntries.item", {
            url: "/:id",
            template :'<sample-entries-item></sample-entries-item>'
        })
        .state("frame.materials", {
            url: "/materials",
            template :'<materials></materials>'
        })
        .state("frame.materials.material", {
            url: "/:id",
            template :'<material></material>'
        })

        .state("frame.warehouse", {
            url: "/warehouse?va",
            template :'<warehouse></warehouse>'
        })
        .state("frame.warehouse.stockadjustments", {
            url: "/stockadjustments",
            template :'<stock-adjustments></stock-adjustments>'
        })
        .state("frame.warehouse.stockadjustments.item", {
            url: "/:id",
            template :'<stock-adjustment></stock-adjustment>'
        })
        .state("frame.warehouse.material", {
            url: "/:id",
            template :'<material></material>'
        })
        .state("frame.synopsis", {
            url: "/synopsis",
            template :'<synopsis></synopsis>'
        })
        .state("frame.material", {
            url: "/material?name&sku&producer&currency?sku2",
            template :'<material></material>'
        })
        .state("frame.work", {
            url: "/work",
            template :'<work></work>'
        })
        .state("frame.works", {
            url: "/works",
            template :'<works></works>'
        })

        .state("frame.pns", {
            url: "/pns?va",
            template :'<pns></pns>'
        })
        .state("frame.pns.pn", {
            url: "/:id?type",
            template :'<pn></pn>'
        })
        .state("frame.Rn", {
            url: "/rns?va",
            template :'<rns></rns>'
        })
        .state("frame.Rn.item", {
            url: "/:id?type",
            template :'<rn></rn>'
        })
        .state("frame.Act", {
            url: "/Act?va",
            template :'<acts></zakazs>'
        })
        .state("frame.Act.item", {
            url: "/:id",
            template :'<act></zakaz>'
        })
        .state("frame.ZakazManufacture", {
            url: "/ZakazManufacture?va",
            template :'<zakazs type="manufacture"></zakazs>'
        })
        .state("frame.ZakazManufacture.item", {
            url: "/:id",
            template :'<zakaz type="manufacture"></zakaz>'
        })



        .state("frame.Money", {
            url: "/money",
            template :'<money></money>'
        })
        .state("frame.Money.turnover", {
            url: "/turnover?id",
            template :'<turnover type="Money"></turnover>'
        })
        .state("frame.Money.stockadjustments", {
            url: "/stockadjustments",
            template :'<agent-stockadjustments type="Money"></agent-stockadjustments>'
        })
        .state("frame.Money.stockadjustments.item", {
            url: "/:id",
            template :'<agent-stockadjustments-item type="Money"></agent-stockadjustments-item>'
        })
        .state("frame.MoneyOrderCashDebet", {
            url: "/MoneyOrderCashDebet?va",
            template :'<money-orders type="Cash_debet"></money-orders>'
        })
        .state("frame.MoneyOrderCashDebet.item", {
            url: "/:id",
            template :'<money-order type="Cash_debet"></money-order>'
        })
        .state("frame.MoneyOrderCashCredit", {
            url: "/MoneyOrderCashCredit?va",
            template :'<money-orders type="Cash_credit"></money-orders>'
        })
        .state("frame.MoneyOrderCashCredit.item", {
            url: "/:id",
            template :'<money-order type="Cash_credit"></money-order>'
        })
        .state("frame.MoneyOrderBankDebet", {
            url: "/MoneyOrderBankDebet?va",
            template :'<money-orders type="Bank_debet"></money-orders>'
        })
        .state("frame.MoneyOrderBankDebet.item", {
            url: "/:id",
            template :'<money-order type="Bank_debet"></money-order>'
        })
        .state("frame.MoneyOrderBankCredit", {
            url: "/MoneyOrderBankCredit?va",
            template :'<money-orders type="Bank_credit"></money-orders>'
        })
        .state("frame.MoneyOrderBankCredit.item", {
            url: "/:id",
            template :'<money-order type="Bank_credit"></money-order>'
        })
        .state("frame.MoneyOrderCashExchange", {
            url: "/MoneyOrderCashExchange?va",
            template :'<money-orders type="Cash_exchange"></money-orders>'
        })
        .state("frame.MoneyOrderCashExchange.item", {
            url: "/:id",
            template :'<money-order type="Cash_exchange"></money-order>'
        })
        .state("frame.MoneyOrderBankExchange", {
            url: "/MoneyOrderBankExchange?va",
            template :'<money-orders type="Bank_exchange"></money-orders>'
        })
        .state("frame.MoneyOrderBankExchange.item", {
            url: "/:id",
            template :'<money-orders type="Bank_exchange"></money-orders>'
        })

        .state("frame.Supplier", {
            url: "/Supplier",
            template :'<suppliers></suppliers>'
        })
        .state("frame.Supplier.turnover", {
            url: "/turnover?id",
            template :'<turnover type="Supplier"></turnover>'
        })
        .state("frame.Supplier.item", {
            url: "/:id",
            template :'<supplier></supplier>'
        })
        .state("frame.Supplier.stockadjustments", {
            url: "/stockadjustments",
            template :'<agent-stockadjustments type="Supplier"></agent-stockadjustments>'
        })
        .state("frame.Supplier.stockadjustments.item", {
            url: "/:id",
            template :'<agent-stockadjustments-item type="Supplier"></agent-stockadjustments-item>'
        })



        .state("frame.Customer", {
            url: "/Customer",
            template :'<customers></customers>'
        })
        .state("frame.Customer.turnover", {
            url: "/turnover?id",
            template :'<turnover type="Customer"></turnover>'
        })
        .state("frame.Customer.item", {
            url: "/:id",
            template :'<customer></customer>'
        })
        .state("frame.Customer.stockadjustments", {
            url: "/stockadjustments",
            template :'<agent-stockadjustments type="Customer"></agent-stockadjustments>'
        })
        .state("frame.Customer.stockadjustments.item", {
            url: "/:id",
            template :'<agent-stockadjustments-item type="Customer"></agent-stockadjustments-item>'
        })

        .state("frame.Founder", {
            url: "/Founder",
            template :'<founders></founders>'
        })
        .state("frame.Founder.turnover", {
            url: "/turnover?id",
            template :'<turnover type="Founder"></turnover>'
        })
        .state("frame.Founder.item", {
            url: "/:id",
            template :'<founder></founder>'
        })
        .state("frame.Founder.stockadjustments", {
            url: "/stockadjustments",
            template :'<agent-stockadjustments type="Founder"></agent-stockadjustments>'
        })
        .state("frame.Founder.stockadjustments.item", {
            url: "/:id",
            template :'<agent-stockadjustments-item type="Founder"></agent-stockadjustments-item>'
        })

        .state("frame.Worker", {
            url: "/Worker",
            template :'<workers></workers>'
        })
        .state("frame.Worker.turnover", {
            url: "/turnover?id",
            template :'<turnover type="Worker"></turnover>'
        })
        .state("frame.Worker.item", {
            url: "/:id",
            template :'<worker></worker>'
        })
        .state("frame.Worker.stockadjustments", {
            url: "/stockadjustments",
            template :'<agent-stockadjustments type="Worker"></agent-stockadjustments>'
        })
        .state("frame.Worker.stockadjustments.item", {
            url: "/:id",
            template :'<agent-stockadjustments-item type="Worker"></agent-stockadjustments-item>'
        })

        .state("frame.Contragent", {
            url: "/Contragent",
            template :'<contragents></contragents>'
        })
        .state("frame.Contragent.turnover", {
            url: "/turnover?id",
            template :'<turnover type="Contragent"></turnover>'
        })
        .state("frame.Contragent.item", {
            url: "/:id",
            template :'<contragent></contragent>'
        })
        .state("frame.Contragent.stockadjustments", {
            url: "/stockadjustments",
            template :'<agent-stockadjustments type="Contragent"></agent-stockadjustments>'
        })
        .state("frame.Contragent.stockadjustments.item", {
            url: "/:id",
            template :'<agent-stockadjustments-item type="Contragent"></agent-stockadjustments-item>'
        })





        .state("frame.balance", {
            url: "/balance",
            template :'<balance></balance>'
        })
        .state("frame.closePeriod", {
            url: "/closePeriod",
            template :'<close-period></close-period>'
        })
        .state("frame.closePeriod.item", {
            url: "/:id",
            template :'<close-period-item></close-period-item>'
        })
        /*.state("frame.acclist.item", {
            url: "/:id",
            template :'<account-item></account-item>'
        })*/

}])
