'use strict';
function getCookie(name) {
    var parts = document.cookie.split(name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}


// Declare app level module which depends on filters, and services

var myApp= angular.module('myApp', [
        'ngRoute','ui.router','ngResource','ngCookies','ui.select2','ui.bootstrap','ngAnimate', 'fx.animations',
        'angularFileUpload',
        'i.mongoPaginate',
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives'
])
.run(['$rootScope', '$state', '$stateParams','Config','User',function ($rootScope,   $state,   $stateParams,Config,User) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.titles={};
    $rootScope.titles.pageTitle='';
    $rootScope.titles.pageKeyWords='';
    $rootScope.titles.pageDescription='';

        $rootScope.user=User.get();


    $rootScope.activeG = null;
        $rootScope.activeM=null;
        $rootScope.config=Config.get();
        $rootScope.changeStuff=false;
        $rootScope.changeCategory=false;
        $rootScope.changeBrand=false;
        $rootScope.changeNews=false;
        $rootScope.changeCollection=false;
        $rootScope.changeStat=false;


        //http://pastebin.com/czJk3pmks
        $rootScope.$on('$stateChangeStart', function (ev, to, toParams, from, fromParams) {

        if(from.name=='mainFrame.stuff.editStuffGallery' || from.name=='mainFrame.stuff.edit'){
            $rootScope.changeStuff=true;
        }
        /*if(from.name=='mainFrame.category.edit'){
            console.log('gfd');
            $rootScope.changeCtegory=true;
            console.log($rootScope.changeCtegory);
        }*/
    })
        $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {

            if(to.name=='mainFrame.stuff' && (from.name=='mainFrame.stuff.editStuffGallery' || from.name=='mainFrame.stuff.edit')){
                $rootScope.changeStuff=true;
            }
            if(to.name=='mainFrame.category' && from.name=='mainFrame.category.edit'){
                $rootScope.changeCategory=true;
            }
            if(to.name=='mainFrame.brands'&& from.name=='mainFrame.brands.edit'){
                $rootScope.changeBrand=true;
            }
            if(to.name=='mainFrame.collection' && from.name=='mainFrame.collection.edit'){
                $rootScope.changeCollection=true;
            }
            if(to.name=='mainFrame.news' &&( from.name=='mainFrame.news.editNewsGallery' || from.name=='mainFrame.news.edit')){
                $rootScope.changeNews=true;
            }
            if(to.name=='mainFrame.stat'){
                $rootScope.changeStat=true;
            }
        })
    }])

.config(['$stateProvider', '$urlRouterProvider','$locationProvider',function ($stateProvider,$urlRouterProvider,$locationProvider){

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
    $urlRouterProvider
        .when('/', '/admin123')
        .otherwise('/');

    $stateProvider
        .state("mainFrame", {
            url: "/admin123",
            abstract:true,
            templateUrl: function(){ return 'manager/views/partials/mainFrame.html' },
            controller: 'mainFrameCtrl'
        })
        .state("mainFrame.home", {
            url: "",
            templateUrl: function(){ return 'manager/views/partials//home.html' },
            controller: 'homeCtrl'
        })
        .state("mainFrame.goods", {
            url: "/goods/:id",
            templateUrl: function(){ return 'manager/views/partials/goods.html' },
            controller: 'goodsCtrl'
        })
        .state("mainFrame.comments", {
            url: "/comments/:id",
            templateUrl: function(){ return 'manager/views/partials/comments.html' },
            controller: 'commentsCtrl'
        })
        .state("mainFrame.uploadFile", {
            url: "/uploadFile",
            templateUrl: function(){ return 'manager/views/partials/uploadfile.html' },
            controller: 'uploadFileCtrl'
        })


        .state("mainFrame.filters", {
            url: "/filters",
            templateUrl: function(){ return 'manager/views/partials/filters.html' },
            controller: 'filtersCtrl'
        })
        .state("mainFrame.brands", {
            url: "/brands",
            templateUrl: function(){ return 'manager/views/partials/brands.html' },
            controller: 'brandsCtrl'
        })
        .state("mainFrame.brands.edit", {
            url: "/edit/:id",
            templateUrl: function(){ return 'manager/views/partials/brands.edit.html' },
            controller: 'brandsEditCtrl'
        })

        .state("mainFrame.category", {
            url: "/categories",
            templateUrl: function(){ return 'manager/views/partials/category.html' },
            controller: 'categoryCtrl'
        })
        .state("mainFrame.category.edit", {
            url: "/edit/:id",
            templateUrl: function(){ return 'manager/views/partials/category.edit.html' },
            controller: 'categoryEditCtrl'
        })

        .state("mainFrame.stuff", {
            url: "/stuff",
            templateUrl: function(){ return 'manager/views/partials/stuff.html' },
            controller: 'stuffCtrl'
        })
        .state("mainFrame.stuff.edit", {
            url: "/edit/:id",
            templateUrl: function(){ return 'manager/views/partials/editstuff.html' },
            controller: 'editStuffCtrl'
        })
        .state("mainFrame.news", {
            url: "/news",
            templateUrl: function(){ return 'manager/views/partials/news.html' },
            controller: 'newsCtrl'
        })
        .state("mainFrame.news.edit", {
            url: "/edit/:id",
            templateUrl: function(){ return 'manager/views/partials/news.edit.html' },
            controller: 'editNewsCtrl'
        })
        .state("mainFrame.news.editNewsGallery", {
            url: "/gallery/:id",
            templateUrl: function(){ return 'manager/views/partials/news.gallery.html' },
            controller: 'editNewsGalleryCtrl'
        })

        .state("mainFrame.stuff.commentStuff", {
            url: "/comment/:id",
            templateUrl: function(){ return 'manager/views/partials/commentstuff.html' },
            controller: 'commentStuffCtrl'
        })

        .state("mainFrame.stuff.editStuffGallery", {
            url: "/gallery/:id",
            templateUrl: function(){ return 'manager/views/partials/stuff.gallery.html' },
            controller: 'editStuffGalleryCtrl'
        })
        .state("mainFrame.places", {
            url: "/places",
            templateUrl: function(){ return 'manager/views/partials/place.html' },
            controller: 'placesCtrl'
        })

        .state("mainFrame.collection", {
            url: "/collection",
            templateUrl: function(){ return 'manager/views/partials/collection.html' },
            controller: 'collectionCtrl'
        })
        .state("mainFrame.collection.edit", {
            url: "/:brand/:id",
            templateUrl: function(){ return 'manager/views/partials/collection.edit.html' },
            controller: 'editCollectionCtrl'
        })

        .state("mainFrame.currency", {
            url: "/currency",
            templateUrl: function(){ return 'manager/views/partials/currency.html'},
            controller: 'currencyCtrl'
        })

        .state("mainFrame.orders", {
            url: "/orders",
            templateUrl: function(){ return 'manager/views/partials/orders.html' },
            controller: 'ordersCtrl'
        })
        .state("mainFrame.stat", {
            url: "/stat",
            templateUrl: function(){ return 'manager/views/partials/stat.html' },
            controller: 'statCtrl'
        })

        .state("mainFrame.stat.edit", {
            url: "/edit/:id",
            templateUrl: function(){ return 'manager/views/partials/stat.edit.html' },
            controller: 'editStatCtrl'
        })
        .state("mainFrame.stat.editStatGallery", {
            url: "/gallery/:id",
            templateUrl: function(){ return 'manager/views/partials/stat.gallery.html' },
            controller: 'editStatGalleryCtrl'
        })

        .state("mainFrame.users", {
            url: "/users",
            templateUrl: function(){ return 'manager/views/partials/users.html' },
            controller: 'usersCtrl'
        })
        .state("mainFrame.editGroup", {
            url: "/editgroup/:id",
            templateUrl: function(){ return 'manager/views/partials/editgroup.html' },
            controller: 'editGroupCtrl'
        })
        .state("mainFrame.editCakeGallery", {
            url: "/editcakegallery/:id",
            templateUrl: function(){ return 'manager/views/partials/cake.gallery.html' },
            controller: 'editCakeGalleryCtrl'
        })
        .state("mainFrame.importExel", {
            url: "/importExel",
            templateUrl: function(){ return 'manager/views/partials/importExel.html' },
            controller: 'importExelCtrl'
        })
        .state("mainFrame.customerList", {
            url: "/customerList",
            templateUrl: function(){ return 'manager/views/partials/customerList.html' },
            controller: 'customerListCtrl'
        })
        .state("mainFrame.customerList.custom", {
            url: "/custom/:id?clone",
            templateUrl: function(){ return 'manager/views/partials/custom.html' },
            controller: 'customCtrl'
        })
        .state("mainFrame.jobTicketArch", {
            url: "/jobTicketArch",
            templateUrl: function(){ return 'manager/views/partials/jobTicketArch.html' },
            controller: 'jobTicketArchCtrl'
        })
        .state("mainFrame.jobTicketArch.view", {
            url: "/view/:id",
            templateUrl: function(){ return 'manager/views/partials/jobTicketArchView.html' },
            controller: 'jobTicketArchViewCtrl'
        })
        .state("mainFrame.workers", {
            url: "/workers",
            templateUrl: function(){ return 'manager/views/partials/workers.html' },
            controller: 'workersCtrl'
        })
        .state("mainFrame.summary", {
            url: "/summary",
            templateUrl: function(){ return 'manager/views/partials/summary.html' },
            controller: 'summaryCtrl'
        })


    }])



angular.module('i.mongoPaginate', [])
    .filter('forLoop', function() {
        return function(input, start, end) {
            input = new Array(end - start);
            for (var i = 0; start < end; start++, i++) {
                input[i] = start;
            }

            return input;
        }
    })

    .directive('mongoPaginatorAll', function () {
        return {
            restrict:'E',
            scope :{
                page:'=',
                row:'=',
                rowsPerPage :'@',
                totalItems:'='
            },
            link: function (scope, element, attrs, controller) {
                scope.paginator={};
                scope.paginator.page=0;
                scope.paginator.itemCount=0;
                scope.row=scope.paginator.rowsPerPage=scope.rowsPerPage;


                scope.paginator.setPage = function (page) {
                    if (page > scope.paginator.pageCount()) {
                        return;
                    }
                    scope.paginator.page = page;
                };
                scope.paginator.nextPage = function () {
                    if (scope.paginator.isLastPage()) {
                        return;
                    }
                    scope.paginator.page++;
                };
                scope.paginator.perviousPage = function () {
                    if (scope.paginator.isFirstPage()) {
                        return;
                    }
                    scope.paginator.page--;
                };
                scope.paginator.firstPage = function() {
                    scope.paginator.page = 0;
                };
                scope.paginator.lastPage = function () {
                    scope.paginator.page = scope.paginator.pageCount() - 1;
                };
                scope.paginator.isFirstPage = function () {
                    return scope.paginator.page == 0;
                };
                scope.paginator.isLastPage = function () {
                    return scope.paginator.page == scope.paginator.pageCount() - 1;
                };
                scope.paginator.pageCount = function () {
                    var count = Math.ceil(parseInt(scope.paginator.itemCount, 10) / parseInt(scope.paginator.rowsPerPage, 10)); if (count === 1) { scope.paginator.page = 0; }
                    //console.log( count);
                    return count;
                };
                scope.$watch('totalItems',function(n,o){
                    scope.paginator.itemCount=scope.totalItems;
                })
                scope.$watch("paginator.page",function(n,o){
                    scope.page=scope.paginator.page;
                })
            },
            templateUrl: 'manager/views/templates/mongoPaginationControlAll.html'
        };
    })