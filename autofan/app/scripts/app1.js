'use strict';
var lang;//='ua';

function getCookie(name) {
    var parts = document.cookie.split(name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}
//console.log(language);
/*
var cookielan = getCookie('lan');
if (!cookielan){
    document.cookie = 'lan'+ "=" +language+";path=/";
} else
    language= cookielan;
*/

/*
var cookielan = getCookie('lan');
if (!cookielan){
    document.cookie = 'lan'+ "=" +language+";path=/";
} else
    language= cookielan;
*/

// Declare app level module which depends on filters, and services



var myApp= angular.module('myApp', [
        'ngRoute','ui.router','ngResource','ngCookies',
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives'
])
.run(['$rootScope', '$state', '$stateParams','$cookieStore',function ($rootScope,   $state,   $stateParams,$cookieStore){

    $rootScope.lang=getCookie('lan');
        console.log($rootScope.lang);
    if (!$rootScope.lang){
        $rootScope.lang='ua';
        document.cookie = 'lan'+ "=" +$rootScope.lang+";path=/";
    }
    lang=$rootScope.lang;
       /* $rootScope.lang=$cookieStore.get('lan');
        console.log($rootScope.lang);
        if (!$rootScope.lang){
            $rootScope.lang='ua';
            $cookieStore.set('lan','ua');
        }*/





    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.titles={};
    $rootScope.titles.pageTitle='';
    $rootScope.titles.pageKeyWords='';
    $rootScope.titles.pageDescription='';

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        //event.preventDefault();
        console.log(toParams);
        console.log(toState);
        console.log(fromState);
        if(toParams.lang!=$rootScope.lang){
            $rootScope.lang=toParams.lang;
            document.cookie = 'lan'+ "=" +$rootScope.lang+";path=/";
        }
        //$rootScope.$state.transitionTo('language.home',{lang:language});
        /*console.log(toParams);
        if (toParams.length==1){
            ev.preventDefault();
            alert('ssss');
            $rootScope.$state.transitionTo('language.home',{lang:language});

        };*/
    })
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
            event.preventDefault();
            console.log(toParams);

        })

    }])

.config(['$stateProvider', '$urlRouterProvider','$locationProvider',
        function ($stateProvider,$urlRouterProvider,$locationProvider){

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
    $urlRouterProvider
        /*.when('', '/'+lang+'/home')
        .when('/', '/'+lang+'/home')*/
        .when('', '/'+lang)
        .when('/', '/'+lang)
        //.when('/manager', '/manager')
        .otherwise('/');

    $stateProvider
        /*.state("language", {
            url: "/:lang",
            abstract:true,
            templateUrl: function(stateParams){ return 'partials/'+stateParams.lang+'/main.fraim.html' },
            controller: 'mainFraimCtrl'
        })*/
        .state("language", {
            url: "/:lang",
            //abstract:true,
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/mainFrame.html' },
            controller: 'mainFrameCtrl'
        })
        .state("language.home", {
            url: "/home",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/home.html' },
            controller: 'homeCtrl'
        })
        .state("language.login", {
            url: "/login",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/login.html' },
            controller: 'loginCtrl'
        })
        .state("language.signup", {
            url: "/signup",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/signup.html' },
            controller: 'signupCtrl'
        })

        .state("language.settings", {
            url: "/settings",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/settings.html' },
            controller: 'settingsCtrl'
        })


    }])
