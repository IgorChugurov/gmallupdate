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
    /*if (dataFromServer) {
        //console.log(dataFromServer.virtualAccounts)
       // console.log(dataFromServer)
        global.set('virtualAccounts', dataFromServer.virtualAccounts);
        global.set('accounts', dataFromServer.accounts);
        global.set('workingHour', workingHour);
    }
*/
    if( typeof unitOfMeasure !='undefined'){
        global.set('unitOfMeasure', unitOfMeasure);
    }
    moment.locale('ru')
    $rootScope.moment=moment;
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.global=global;
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
        console.log(toState,toParams)
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
            url: "/invoice?token",
            controller: 'mainFrameCtrl',
            templateUrl:"modules/invoice/views/index.html"
        })

        .state("frame.invoices", {
            url: "/invoices",
            template :'<invoices></invoices>'
        })
        .state("frame.invoices.item", {
            url: "/:id",
            template :'<invoice></invoice>'
        })


}])
