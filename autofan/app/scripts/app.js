'use strict';
String.prototype.insert = function (index, string) {
    //console.log(string);
    if (index > 0)
        return this.substring(0, index) + string + this.substring(index, this.length);
    else
        return string + this;
};
if (!Array.prototype.indexOf)
{
    /**
     * Add array.indexOf() functionality (exists in >FF 1.5 but not in IE)
     *
     * @param {Object} elem Element to find.
     * @param {Number} [from] Position in array to look from.
     */
    Array.prototype.indexOf = function(elem /*, from*/) {
        var len = this.length;

        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0) {
            from += len;
        }

        for (; from < len; from++) {
            if (from in this && this[from] === elem) {
                return from;
            }
        }

        return -1;
    };
}
if (!Array.prototype.remove)
{
    /**
     * Add array.remove() convenience method to remove element from array.
     *
     * @param {Object} elem Element to remove.
     */
    Array.prototype.remove = function(elem) {
        var index = this.indexOf(elem);
        alert(index);
        if (index !== -1) {
            this.splice(index, 1);
        }
    };
}
function getCookie(name) {
    var parts = document.cookie.split(name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

var myApp= angular.module('myApp', [
        'ngRoute','ui.router','ngResource','ngCookies','ui.bootstrap','caco.ClientPaginate',
        //'ui.bootstrap.collapse', 'ui.bootstrap.dropdownToggle',
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives'
])
.run(['$rootScope', '$state', '$stateParams','Config','$cookieStore','$resource','User',
        function ($rootScope,   $state,   $stateParams,Config,$cookieStore,$resource,User){

       /* var myip;
        function ip_callback(o) {
             return myip = o.host;
        }
        var Something = $resource("https://smart-ip.net/geoip-json");
        $rootScope.something = Something.get({'callback':'ip_callback'});
        console.log($rootScope.something);
*/
            $rootScope.lang=getCookie('lan');
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            $rootScope.user=User.get(function(){
                //console.log($rootScope.user);
            });


            $rootScope.fromCart=false;
            $rootScope.titles={};
            $rootScope.titles.pageTitle='autofan Харьков';
            $rootScope.titles.pageKeyWords='';
            $rootScope.titles.pageDescription='';
            $rootScope.commonFilter={"tags":['xx','xx','xx']};
            $rootScope.config=Config.get(function(res){
                    $rootScope.commonFilter.tags=res.tags;
                $rootScope.currencyIndex=1;
                    //console.log($rootScope.commonFilter);

            });


        //console.log( $rootScope.config);

   /* $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if(toParams.lang!=$rootScope.lang){
            $rootScope.lang=toParams.lang;
        }

    })*/
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
       /* console.log(fromState);
        console.log(toState);*/
           if(fromState.name=='language.cart' && toState.name=='language.login'){
               $rootScope.fromCart=true;
           }
            //event.preventDefault();

    })

}])

.config(['$stateProvider', '$urlRouterProvider','$locationProvider',function ($stateProvider,$urlRouterProvider,$locationProvider){

        var lang=getCookie('lan');
        if (!lang || (lang!='en'&& lang!='ru')) {
            lang='ru';
            document.cookie = "lan=ru;path=/";
        }



        $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
    $urlRouterProvider
        .when('/', '/'+lang+'/home')
        .otherwise('/');


    $stateProvider
        .state("language", {
            url: "/:lang",
            abstract:true,
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

        .state("language.customOrder", {
            url: "/customorder",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/customorder.html' },
            controller:'customOrderCtrl'
        })
        .state("language.profile", {
            url: "/profile",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/profile.html' },
            controller:'profileCtrl'
        })

        .state("language.settings", {
            url: "/settings",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/settings.html' },
            controller: 'settingsCtrl'
        })
        .state("language.contacts", {
            url: "/contacts",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/contacts.html' },
            controller: 'contactsCtrl'
        })
        /*.state("language.goods", {
            url: "/goods?id",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/goods.html' },
            controller: 'goodsCtrl'
        })*/
        /*.state("language.goodDetail", {
            url: "/gooddetail/:id",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/gooddetail.html' },
            controller: 'goodDetailCtrl'
        })*/
        /*.state("language.news", {
            url: "/news?id",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/goods.html' },
            controller: 'goodsCtrl'
        })*/
        /*.state("language.newsDetail", {
            url: "/newsdetail/:id",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/newsdetail.html' },
            controller: 'goodDetailCtrl'
        })
        .state("language.recipeDetail", {
            url: "/recipedetail/:id",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/recipedetail.html' },
            controller: 'goodDetailCtrl'
        })*/
        .state("language.stuff.detail", {
            url: "/stuffdetail/:id",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/stuff.detail.html' },
            controller: 'stuffDetailCtrl'
        })

        .state("language.stuff", {
            url: "/stuff/:section/:category",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/stuff.html' },
            controller: 'stuffCtrl'
        })
        .state("language.spark.detail", {
            url: "/sparkdetail/:id",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/spark.detail.html' },
            controller: 'sparkDetailCtrl'
        })

        .state("language.spark", {
            url: "/spark/:section/:category",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/spark.html' },
            controller: 'sparkCtrl'
        })

        .state("language.news.detail", {
            url: "/newsdetail/:id",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/news.detail.html' },
            controller: 'newsDetailCtrl'
        })

        .state("language.news", {
            url: "/news",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/news.html' },
            controller: 'newsCtrl'
        })

        .state("language.cart", {
            url: "/cart",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/cart.html' },
            controller: 'cartCtrl'
        })
        .state("language.searchSpark", {
            url: "/searchSpark/:code",
            templateUrl: function(stateParams){ return 'views/partials/'+stateParams.lang+'/search.spark.html' },
            controller: 'searchSparkCtrl'
        })




}])


angular.module('caco.ClientPaginate', [])

    .filter('paginate', function(Paginator) {
        return function(input, rowsPerPage) {
            /*console.log(input);
             console.log(input.length);*/
            if (!input)
                return;
            if (!input.length) {
                return input;
            }

            if (rowsPerPage) {
                Paginator.rowsPerPage = rowsPerPage;
            }

            Paginator.itemCount = input.length;

            return input.slice(parseInt(Paginator.page * Paginator.rowsPerPage), parseInt((Paginator.page + 1) * Paginator.rowsPerPage + 1) - 1);
        }
    })

    .filter('forLoop', function() {
        return function(input, start, end) {
            input = new Array(end - start);
            for (var i = 0; start < end; start++, i++) {
                input[i] = start;
            }

            return input;
        }
    })

    .service('Paginator', function ($rootScope) {
        this.page = 0;
        this.rowsPerPage = 54;
        this.itemCount = 0;

        this.setPage = function (page) {
            if (page > this.pageCount()) {
                return;
            }

            this.page = page;
        };

        this.nextPage = function () {
            if (this.isLastPage()) {
                return;
            }

            this.page++;
        };

        this.perviousPage = function () {
            if (this.isFirstPage()) {
                return;
            }

            this.page--;
        };

        this.firstPage = function () {
            this.page = 0;
        };

        this.lastPage = function () {
            this.page = this.pageCount() - 1;
        };

        this.isFirstPage = function () {
            return this.page == 0;
        };

        this.isLastPage = function () {
            return this.page == this.pageCount() - 1;
        };

        this.pageCount = function () { var count = Math.ceil(parseInt(this.itemCount, 10) / parseInt(this.rowsPerPage, 10)); if (count === 1) { this.page = 0; } return count;
        };
        /*this.pageCount = function () {
         return Math.ceil(parseInt(this.itemCount) / parseInt(this.rowsPerPage));
         };*/
    })

    .directive('paginator', function factory() {
        return {
            restrict:'E',
            controller: function ($scope, Paginator) {
                $scope.paginator = Paginator;
            },
            templateUrl: 'paginationControl.html'
        };
    });
