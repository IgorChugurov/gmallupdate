'use strict';

/* Controllers */

angular.module('myApp.controllers', [])



.controller('mainFrameCtrl',['$scope', '$location','Auth',"$stateParams" ,"$rootScope","$window","$http",'$sce','$filter','Category',"Filters","User","News",'Stuff',
        function ($scope, $location, Auth,$stateParams,$rootScope,$window,$http,$sce,$filter,Category,Filters,User,News,Stuff) {
            $scope.trustHtml = function(text,i){
                if(i){
                    text= $filter('cut')(text,true,i,"...");
                }
                return $sce.trustAsHtml(text)
            };

            if ($rootScope.lang!=$rootScope.$stateParams.lang) {
                $rootScope.lang=$rootScope.$stateParams.lang;
                document.cookie = "lan="+$rootScope.lang+";path=/";
            }
            $scope.lang=$rootScope.lang;

            $scope.goSearch = function(){
                //console.lo('sdfsdfsdf');
                //if (!str) return;

                //console.log(searchStr);


                $rootScope.$state.transitionTo('language.searchSpark',{lang:$stateParams.lang}
                    ,{ notify: true });

            }
            $scope.lastNews=[];
            News.list({page:1,main:'main'},function(tempArr){
                for (var i=0 ; i<=tempArr.length - 1; i++) {
                    // tempArr[i].filters=JSON.parse(tempArr[i].filters);

                    tempArr[i].desc=(tempArr[i].desc0[$scope.lang]=='')?tempArr[i].desc1:tempArr[i].desc0;
                    tempArr[i].desc[$scope.lang]= tempArr[i].desc[$scope.lang].substring(0,300);
                    //console.log(tempArr[i].desc);
                    /*if (!tempArr.desc0){

                     }*/
                    $scope.lastNews.push(tempArr[i]);
                }
            });
            $scope.displayDate= function(dateStr){
                dateStr = moment(dateStr).format('ll')
               return dateStr;
            }

            $scope.goToJobTicket= function(){
                window.location="/admin123/customerList";
            }


            $scope.futerList = Stuff.list({category:'5379d9cdc51cbc682a6b3031',brand:'section',page:1},function(tempArr){
                if ($scope.page==1 && tempArr.length>0){
                    $scope.totalItems=tempArr[0].index;
                }
                $scope.QU=$scope.futerList.length;
                $scope.PREF=$scope.QU%4;
                $scope.DU =Math.floor( $scope.QU/4);
                console.log($scope.QU+'  '+$scope.DU+'  '+$scope.PREF);
                $scope.rows=[[],[],[],[]];
                for (var i=0;i<$scope.futerList.length;i++){
                    if (i<($scope.DU+$scope.PREF)){
                        $scope.rows[0].push($scope.futerList[i]);
                    } else if(i<($scope.DU*2+$scope.PREF)){
                        $scope.rows[1].push($scope.futerList[i]);
                    }else if(i<($scope.DU*3+$scope.PREF)){
                        $scope.rows[2].push($scope.futerList[i]);
                    } else {
                        $scope.rows[3].push($scope.futerList[i]);
                    }

                }
                //$scope.row0

                //console.log($scope.futerList);

            });

            $scope.searchSpark = function(str){
                var searchStr = str.substring(0,20);
                $rootScope.$state.transitionTo('language.searchSpark',{lang:$rootScope.$stateParams.lang,code:searchStr}
                    ,{ notify: true });
            }


        $scope.logout = function() {
            Auth.logout()
                .then(function() {
                    $rootScope.user=User.get(function(){});
                    $location.path('/');
                });
        };
        $scope.isActive = function(route) {
            return route === $location.path();
        };

        $scope.lanImg="img/icon/"+$rootScope.lang+".png";
        if ($rootScope.lang=='ru')
            $scope.langName='рус';
        else
            $scope.langName='eng';

        $rootScope.currency='USD';
           $scope.changeCurrency= function(lan){
               $rootScope.currency=lan;
               //$scope.$apply();
           }
        $scope.changeLanguage= function(lan){
            if(lan==$rootScope.lang) return;

             var arr_path = $location.path().split('/')
             if (arr_path.length>=2){
                 arr_path[1]=lan;
                 var path_name = arr_path.join("/");
                 arr_path = arr_path.join("/");
             }
            document.cookie = "lan=" +lan+";path=/";
              window.location.href=arr_path;

        }

            $scope.goHome=function(){
                $rootScope.$state.transitionTo('language.home',{lang:$rootScope.$stateParams.lang});
                /*if ($rootScope.user && $rootScope.user.role && $rootScope.user.role=='admin'){
                    $location.path('/admin123')
                } else {
                    $rootScope.$state.transitionTo('language.home',{lang:$rootScope.$stateParams.lang});
                }*/

            }


        /*$scope.goToSearch=function(searchStr){
            console.log(searchStr);
            $rootScope.$state.transitionTo('language.search',{'searchStr':searchStr,'lang':$rootScope.lang});
        }*/

            /*$http.get('/api/mainmenuitems/'+$rootScope.$stateParams.lang).success(function(res){
                $scope.mainMenu=res;
            });
*/
            $scope.categories =Category.list();


        //$scope.currency=$roo


}])

    .controller('homeCtrl', ['$scope',function ($scope) {

        $scope.myInterval = 5000;
        $scope.slides = [
            {'image':'img/slide/4.jpg','text':'Чип-тюнинг мотора BMW'},
            {'image':'img/slide/1.jpg','text':'Комплексный ремонт BMW'},
            {'image':'img/slide/2.jpg','text':'Регламентное техобслуживание BMW'},
            {'image':'img/slide/3.jpg','text':'Комплексная диагностика BMW'},
            {'image':'img/slide/5.jpg','text':'Чистка и ремонт топливной системы  BMW'},
            {'image':'img/slide/6.jpg','text':'Русификация монитора BMW'},
            {'image':'img/slide/7.jpg','text':'Фирменные аксессуары BMW'},
            {'image':'img/slide/8.jpg','text':'Обслуживание систем климата BMW'},
            {'image':'img/slide/9.jpg','text':'Дооснащение навигацией BMW'}];

    }])

    .controller('stuffCtrl', ['$scope','Brands','$rootScope','Category','Filters','Stuff','$q','$timeout','BrandTags','$location','$anchorScroll',
        function ($scope,Brands,$rootScope,Category,Filters,Stuff,$q,$timeout,BrandTags,$location,$anchorScroll) {

            $scope.commonFilter=$rootScope.commonFilter;
            $scope.lang=$rootScope.$stateParams.lang;

            $scope.stuffList=[];
            //paginator
            $scope.page=1;
            $scope.totalItems=0;
            $scope.textList=''
            $scope.headerList='';
            $scope.displayFilter=[];
          // инициализация********************************
            $scope.rowsPerPage=($rootScope.config.perPage)?$rootScope.config.perPage:53;
            $scope.lang=$rootScope.$stateParams.lang;
            $scope.section=$rootScope.$stateParams.section;
            $scope.categories=[];
            $scope.filterDisplay=[];
            $scope.checkfilterList=[];
            Category.list(function(res){
                for (var i =0;i<res.length;i++){
                    if (res[i].section==$rootScope.$stateParams.section){
                        $scope.categories.push(res[i]);
                    }
                }
                $scope.selectedCategory=$rootScope.$stateParams.category;
            });


            //*********************************************
            $scope.$watch('selectedCategory',function(newValue, oldValue){
                if (typeof newValue == 'undefined' || newValue == oldValue) return;
                $scope.filters=[];
                $scope.getStuffList($scope.selectedCategory);
                var query;
                if ($scope.selectedCategory){
                    for(var i=0;i<$scope.categories.length;i++){
                        if ($scope.categories[i]._id==$scope.selectedCategory){
                            query={'filters':JSON.stringify($scope.categories[i].filters)};
                            $scope.textList=$scope.categories[i].desc[$scope.lang];
                            $scope.headerList=$scope.categories[i].name[$scope.lang];
                            /*console.log($scope.textList);
                            console.log($scope.headerList);*/
                            break;
                        }
                    }

                } else {
                    $scope.textList='';
                    $scope.headerList='';
                    var tagArr=[];
                    for(var i=0;i<$scope.categories.length;i++){
                        var arr=[];
                        for(var j=0;j<$scope.categories[i].filters.length;j++){
                            if (i==0){
                                //tagArr.push($scope.categories[i].filters[j]);
                                arr.push($scope.categories[i].filters[j]);
                            } else{
                                if(tagArr.indexOf($scope.categories[i].filters[j])>-1){
                                    arr.push($scope.categories[i].filters[j]);
                                }
                            }
                        }
                        tagArr=JSON.parse(JSON.stringify(arr));
                    }
                    if (tagArr.length>0){
                        query={'filters':JSON.stringify(tagArr)};
                    }
                }
                Filters.list(query,function(res){
                    for(var i=0;i<res.length;i++){
                        res[i].value='';
                        $scope.filters.push(res[i]);
                    }
                });
            });

            $scope.getStuffList = function(categoryId,page){
                if (!page){
                    $scope.page=1;
                    $scope.stuffList=[];
                }
                var  brandId;
                if (categoryId){
                    brandId=0;
                } else {
                    categoryId=$scope.section;
                    brandId='section';
                }

                $scope.stuffList = Stuff.list({category:categoryId,brand:brandId,page:$scope.page},function(tempArr){
                    if ($scope.page==1 && tempArr.length>0){
                        $scope.totalItems=tempArr[0].index;
                    }

                });
            }

            $scope.showItemFilter=function(id,index){
                //console.log(index);
                var i=$scope.checkfilterList.indexOf(id);
                if (i>-1){
                    $scope.displayFilter[index]=true;
                    return true;
                }
                return false;
            }

            $scope.filterLists =  function() {
                return function(item) {
                   if ($scope.collectionTag &&  $scope.collectionTag.val && item.brandTag!=$scope.collectionTag.val){
                        return false;
                    }
                    if (!$scope.filters || $scope.filters.length<=0){
                        return true;
                    }
                    for (var i=0 ; i<=$scope.filters.length - 1; i++) {
                        if ($scope.filters[i].value && item.tags.indexOf($scope.filters[i].value)<=-1){
                            return false;
                        }
                    }
                    return true;
                }
            }

            $scope.goToStuffDetail = function(item){
                $rootScope.$state.transitionTo('language.stuff.detail',{id:item.id,color:item.colorId});
            }


            $scope.setPage = function () {
                $scope.page++;
                $scope.getStuffList($scope.activeCategory,$scope.activeBrand,$scope.page);
                //console.log($scope.page);

            };

            //прокрутка вверх екрана
            $scope.scrollTo = function(id) {
                //console.log(id);
                $location.hash(id);
                $anchorScroll();
            }

            $scope.if3element = function(i){
                if(i%3==0){
                    return true;
                } else {
                    return false;
                }
            }

        }])
    .controller('stuffDetailCtrl',['$scope','Stuff','$rootScope','$timeout','CartLocal',function($scope,Stuff,$rootScope,$timeout,CartLocal){
        $scope.lang=$rootScope.$stateParams.lang;
        $scope.stuff=Stuff.full({id:$rootScope.$stateParams.id},function(res,err){
        });
   }])

    .controller('cartCtrl',['$scope','$rootScope','$timeout','CartLocal',function($scope,$rootScope,$timeout,CartLocal){
        $scope.comment='';
        $scope.sendDisabled=false;
        $timeout(function(){
            if($rootScope.config && $rootScope.config.currency){
                $scope.kurs = $rootScope.config.currency[$rootScope.currency][0];
            }
        },300);

        $rootScope.$watch('currency',function(o,n){
            if($rootScope.config && $rootScope.config.currency){
                $scope.kurs = $rootScope.config.currency[$rootScope.currency][0];
            }
        })

        $scope.cart=CartLocal;


        $scope.goToStuff=function(i){
           var stuff=  $scope.cart.getItem(i);
            $rootScope.$state.transitionTo('language.spark.detail',
                {'lang':$rootScope.$stateParams.lang,'section':stuff.section,'category':stuff.category,
                'id':stuff.stuff});
        }

        $scope.sendOrder=function(){
            $scope.sendDisabled=true;
            $scope.comment.substring(0,200);
            $scope.cart.send($rootScope.$stateParams.lang,$scope.comment,$scope.kurs,$rootScope.currency,function(err){
                $scope.sendDisabled=false;
                $scope.cart.clearCart();
                $rootScope.$state.transitionTo('language.customOrder',{'lang':$rootScope.$stateParams.lang});
            });
        }
    }])

.controller('loginCtrl',['$scope', '$location','Auth','$rootScope', function ($scope, $location, Auth,$rootScope) {
        $scope.user = {};
        $scope.errors = {};

        $scope.resetPswd = function(form) {
            if(form.$valid) {
                Auth.resetPswd({
                    email: $scope.reseteEmail

                })
                    .then( function(data) {
                        console.log(data);
                        $scope.reseteEmail='на почту отправлено письмо';
                    })
                    .catch( function(err) {
                        console.log(err);
                        err = err.data;
                        $scope.errors.other = err.message;
                    });
            }
        }

        $scope.login = function(form) {
            $scope.submitted = true;

            if(form.$valid) {
                Auth.login({
                    email: $scope.user.email,
                    password: $scope.user.password
                })
                    .then( function(data) {
                        //console.log(data);userid.
                        document.cookie = "userid="+data.userid+";path=/";
                        //$rootScope.user=User.get(function(){});
                        // Logged in, redirect to home
                        if ($rootScope.fromCart){
                            $rootScope.$state.transitionTo('language.cart',{lang:$scope.lang});
                            $rootScope.fromCart=false;
                        } else {
                            $location.path('/');
                        }

                    })
                    .catch( function(err) {
                        err = err.data;
                        $scope.errors.other = err.message;
                    });
            }
        };



    }])
    .controller('signupCtrl',['$scope', 'Auth',"$location",'$rootScope', '$modal','User',function ($scope, Auth,$location,$rootScope,$modal,User) {
        $scope.user = {};
        $scope.errors = {};

        $scope.register = function(form) {
            //console.log('asasd');
            $scope.submitted = true;

            if(form.$valid) {
                Auth.createUser({
                    name: $scope.user.name,
                    email: $scope.user.email,
                    password: $scope.user.password,
                    profile: $scope.user.profile
                })
                    .then( function() {
                        // Account created, redirect to home
                        $rootScope.user=User.get(function(){});
                        //$rootScope.$state.transitionTo('language.home');
                        $scope.open();
                        /*if ($rootScope.fromCart){
                         $rootScope.$state.transitionTo('language.cart',{lang:$scope.lang});
                         $rootScope.fromCart=false;
                         } else {
                         $location.path('/');
                         }*/

                        //$location.path('/');
                    })
                    .catch( function(err) {
                        err = err.data;
                        $scope.errors = {};
                        console.log(err);
                        // Update validity of form fields that match the mongoose errors
                        angular.forEach(err.errors, function(error, field) {
                            form[field].$setValidity('mongoose', false);
                            $scope.errors[field] = error.type;
                        });
                    });
            }
        };

        $scope.open = function (size) {

            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: ModalInstanceCtrl,
                size: size,
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
                console.log( $scope.selected);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
        var ModalInstanceCtrl = function ($scope, $modalInstance,items) {

            /*$scope.items = items;
             $scope.selected = {
             item: $scope.items[0]
             };*/

            $scope.toHome = function () {

                $modalInstance.close('dddddd');
                $rootScope.$state.transitionTo('language.home',{lang:$rootScope.lang});
            };

            $scope.toCart = function () {
                $modalInstance.dismiss('cancel');
                $rootScope.$state.transitionTo('language.cart',{lang:$rootScope.lang});

            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
                ;

            };
        };
        // $scope.open();
    }])
.controller('settingsCtrl',  ['$scope', 'User', 'Auth',function ($scope, User, Auth) {
        $scope.errors = {};

        $scope.changePassword = function(form) {
            $scope.submitted = true;

            if(form.$valid) {
                Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
                    .then( function() {
                        $scope.message = 'Password successfully changed.';
                    })
                    .catch( function() {
                        form.password.$setValidity('mongoose', false);
                        $scope.errors.other = 'Incorrect password';
                    });
            }
        };
}])

    .controller('contactsCtrl',['$scope','$rootScope','$location','$http','$timeout','Stat',	function($scope,$rootScope,$location,$http,$timeout,Stat){

        $rootScope.titles.pageTitle='';
        $rootScope.titles.pageKeyWords='';
        $rootScope.titles.pageDescription='';

        var page =$rootScope.$state.current.url;

        //console.log(page.substring(1));
        $scope.stuff=Stat.get({name:page.substring(1),id:'qqq'});


        $scope.feedbackError=false;
        $scope.feedbackSent = false;

        $scope.errorText=false;
        $scope.SuccessFeedBack=false;
        $scope.feedbackDisabled=false;


        $scope.feedback={};

        $scope.feedback.email ='';
        $scope.feedback.name = '';
        $scope.feedback.text = '';

        if ($rootScope.user){
            if ($rootScope.user.email){
               // console.log($rootScope.user.email);
                $scope.feedback.email=$rootScope.user.email;
            }
            if ($rootScope.user.name)
                $scope.feedback.name=$rootScope.user.name;
        }
        $rootScope.$watch('user',function(){
            if ($rootScope.user){
                if ($rootScope.user.email){
                    console.log($rootScope.user.email);
                    $scope.feedback.email=$rootScope.user.email;
                }
                if ($rootScope.user.name)
                    $scope.feedback.name=$rootScope.user.name;
            }
        });


        $scope.feedbackMassage = function(){
            return 	$scope.feedbackError|| $scope.feedbackSent;
        }


        $scope.send = function(form){
            console.log($scope.feedback);
            if ($scope.feedback.text.length<10){
                $scope.errorText = true;
                $timeout(function(){$scope.errorText = false}, 3000);
            }
            else{
                $scope.feedback.text=$scope.feedback.text.substring(0,700);
                $scope.feedbackDisabled=true;
                $http.post('/api/feedback',$scope.feedback).
                    success(function(data, status) {
                        $scope.data = data;
                        if ($scope.data.done){
                            $scope.SuccessFeedBack = true;
                            $scope.feedback.text='';
                            $timeout(function(){
                                $scope.SuccessFeedBack = false;
                                $scope.feedbackDisabled=false;
                            }, 10000);
                        }else{
                            $scope.feedbackError = true;
                            $timeout(function()
                            {$scope.feedbackError=false;
                                $scope.feedbackDisabled=false;
                            }, 10000);
                        }
                    }).
                    error(function(data, status) {
                        console.log(status);
                        console.log(data);
                        $scope.feedbackError = true;
                        $timeout(function(){$scope.feedbackError=false}, 3000);
                    });
            }

        };

    }])

    .controller('searchSparkCtrl', ['$scope','$http','$rootScope','$timeout',function ($scope,$http,$rootScope,$timeout) {
        // write Ctrl here
        $scope.loadedS_cars=true;
        $scope.loadedA_Z=true;


        $scope.searchStr = ($rootScope.$stateParams.code)?$rootScope.$stateParams.code:'';

        $scope.getResults = function (){
            if (!$scope.searchStr) return;
            $scope.loadedA_Z=false;
            $scope.loadedS_cars=false;
            $scope.loadedShippers=false;

            $scope.searchStr= $scope.searchStr.substring(0,30).toLowerCase();
            $http.get('/api/search/sparkA-Z/'+$scope.searchStr).success(function (data, status, headers, config) {
                $scope.resultsA_Z=data.res;
                //console.log($scope.resultsA_Z)
                $scope.loadedA_Z=true;
                $scope.showResult=true;

            }).error(function (data, status, headers, config) { })
            $scope.searchStr= $scope.searchStr.substring(0,30).toLowerCase();
            $http.get('/api/search/sparkS-cars/'+$scope.searchStr).success(function (data, status, headers, config) {
                $scope.HtmlS_cars=data.res;
                //console.log($scope.resultsA_Z)
                $scope.loadedS_cars=true;
                $scope.showResult=true;
                $timeout(function(){$scope.$apply()},200);

            }).error(function (data, status, headers, config) { })
            $http.get('/api/search/shippers/'+$scope.searchStr).success(function (data, status, headers, config) {
                $scope.shippers=data;
                console.log($scope.shippers)
                $scope.loadedShippers=true;

                //$timeout(function(){$scope.$apply()},200);

            }).error(function (data, status, headers, config) { })

        }

        $scope.searchS_cars2 = function(str){
            //console.log(str);
            $scope.HtmlS_cars='';
            $scope.loadedS_cars=false;
            $http.get('/api/search/sparkS-cars/'+str).success(function (data, status, headers, config) {
                $scope.HtmlS_cars=data.res;
                //console.log($scope.resultsA_Z)
                $scope.loadedS_cars=true;
                $scope.showResult=true;
                $timeout(function(){$scope.$apply()},200);

            }).error(function (data, status, headers, config) { })


        }



        $scope.getResults();



        //$scope.categories=$rootScope.categories;


    }])


    .controller('customOrderCtrl',['$scope','$rootScope','$stateParams','$http','$timeout','$sce','Orders',
        function($scope,$rootScope,$stateParams,$http,$timeout,$sce,Orders){

            //***********************************
            // управление ордерами
            //************************************



            /*$scope.orders=Orders.list({'user':$rootScope.user._id},function(res){
                console.log(res);
            });*/

            $scope.filterStatus='';
            $scope.filterNumber='';



            $scope.afterSave = function(){
                $scope.orders=Orders.list({'user':$rootScope.user._id},function(res){
                    //console.log(res);
                });
            };

            $scope.updateOrder =  function(order){

                order.$update(function(err){
                    if (err) console.log(err);
                    $scope.afterSave();
                });
            }

            $scope.deleteOrder= function(order){
                if (confirm("Удалить?")){
                    order.$delete(function(){
                        $scope.afterSave();
                    });
                }
            }

            $scope.dateConvert = function(date){
                if (date) {
                    return moment(date).format('lll');
                } else {
                    return '';
                }

            }
            $scope.goToStuff=function(spark){
                //var stuff=  $scope.cart.getItem(i);
                $rootScope.$state.transitionTo('language.spark.detail',
                    {'lang':$rootScope.$stateParams.lang,'section':spark.section,'category':spark.category,
                        'id':spark.stuff});
            }

            /*$scope.goToStuff=function(stuff){
                console.log(stuff);
                $rootScope.$state.transitionTo('language.stuff.detail',
                    {'lang':$rootScope.$stateParams.lang,'section':stuff.section,'category':stuff.category,
                        'id':stuff.stuff,'color':stuff.color,'size':stuff.size});
            }*/

            $scope.afterSave();

        }])

.controller('profileCtrl',['$scope','$rootScope','$stateParams','$http','$timeout','User','Auth',function($scope,$rootScope,$stateParams,$http,$timeout,User,Auth){
   /* if (!$rootScope.Signed) $rootScope.$state.go('language.home');*/
    //***********************************
    // редактирование профиля
    //************************************

    // смена пароля
    $scope.profile={};
    //$scope.profile.changePswdNameBtn = 'Сменить пароль';
    $scope.profile.showChangePswd =  false;
    $scope.oldPassword='';
    $scope.newPassword='';
    $scope.newPassword1='';
    $scope.changePswdSuccess = false;
    $scope.changePswdError = false;
        $scope.changePswdMatch = false;
        //$scope.changePswdMatch

    $scope.profile.changePswdF = function(){
        // console.log('info');
        if (!$scope.profile.showChangePswd)
            $scope.profile.showChangePswd = true;
        $scope.oldPassword='';
        $scope.newPassword='';
        $scope.newPassword1='';

        //$scope.profile.changePswdNameBtn = 'Отправить';
    }

        $scope.errors = {};

        $scope.changePassword = function(form) {

            if ($scope.newPassword != $scope.newPassword1){
                $scope.changePswdMatch=true;
                $timeout(function(){$scope.changePswdMatch=false},3000);
                return;
            }

            $scope.submitted = true;

            //if(form.$valid) {
            //$http.get('/api/change');//,{oldPassword:$scope.oldPassword,newPassword: $scope.newPassword });
            //$rootScope.user.$updatePswd();
                Auth.changePassword( $scope.oldPassword, $scope.newPassword )
                    .then( function() {
                        console.log('ssss');
                        $scope.profile.showChangePswd = false;
                        $scope.oldPassword='';
                        $scope.newPassword='';
                        $scope.newPassword1='';
                        $scope.changePswdSuccess=true;
                        $timeout(function(){$scope.changePswdSuccess=false},3000);

                    })
                    .catch( function(err) {
                        err = err.data;
                        //s$scope.errors.other = err.message;
                        $scope.changePswdError=true;
                        $timeout(function(){$scope.changePswdError=false},3000);
                        $scope.errors.other = 'Incorrect password';
                    });
            //}
        };

    /*$scope.profile.changePswdServer = function(){
        var  pswd = {};
        pswd.email = $rootScope.uuser;
        pswd.pswd  =$scope.profile.psdw;
        pswd.pswd1 =$scope.profile.psdw1;
        pswd.pswd2 =$scope.profile.psdw2;

        $http.post('/login/changepswd',{data:pswd}).
            success(function(data, status) {
                $scope.data = data;
                //console.log(data);
                if (!$scope.data.done){
                    $scope.profile.changePswdError = true
                    $timeout(function(){$scope.profile.changePswdError = false;}, 3000);
                }else{
                    $scope.profile.changePswdSuccess = true;
                    $timeout(function(){$scope.profile.changePswdSuccess = false; $scope.profile.showChangePswd = false;}, 2000)
                }
            }).
            error(function(data, status) {
                console.log(status);
                console.log(data);
                $scope.profile.changePswdError = true
                $timeout(function(){$scope.profile.changePswdError = false;}, 3000);
            });
    }*/
    // update profile


    $scope.disableButtonSave = false;
    $scope.showUpdateError = false;
    $scope.showUpdateSuccess = false;

    $scope.profileSave= function() {
        $scope.disableButtonSave = true;
        $rootScope.user.$update(function(){
            $scope.showUpdateSuccess = true;
            $timeout(function(){$scope.showUpdateSuccess=false;$scope.disableButtonSave = false;}, 2000);
            $rootScope.user=User.get();
        });

    };

}])

.controller('sparkCtrl', ['$scope','Brands','$rootScope','Category','Filters','Stuff','$q','$timeout','BrandTags','CartLocal','$location','$anchorScroll',
    function ($scope,Brands,$rootScope,Category,Filters,Stuff,$q,$timeout,BrandTags,CartLocal,$location,$anchorScroll) {

        $scope.stuffList=[];
        //paginator
        $scope.page=1;
        $scope.totalItems=0;
        $scope.textList=''
        $scope.headerList='';
        $scope.displayFilter=[];
        //console.log( $scope.filterList);
        //$scope.filters=Filters.list();

        // инициализация********************************
        $scope.rowsPerPage=($rootScope.config.perPage)?$rootScope.config.perPage:53;
        $scope.lang=$rootScope.$stateParams.lang;
        $scope.section=$rootScope.$stateParams.section;
        $scope.categories=[];
        $scope.filterDisplay=[];
        $scope.checkfilterList=[];
        Category.list(function(res){
            for (var i =0;i<res.length;i++){
                if (res[i].section==$rootScope.$stateParams.section){
                    $scope.categories.push(res[i]);
                }
            }
            $scope.selectedCategory=$rootScope.$stateParams.category;
        });


        //*********************************************
        $scope.$watch('selectedCategory',function(newValue, oldValue){
            if (typeof newValue == 'undefined' || newValue == oldValue) return;
            $scope.filters=[];
            $scope.getStuffList($scope.selectedCategory);
            var query;
            if ($scope.selectedCategory){
                for(var i=0;i<$scope.categories.length;i++){
                    if ($scope.categories[i]._id==$scope.selectedCategory){
                        query={'filters':JSON.stringify($scope.categories[i].filters)};
                        $scope.textList=$scope.categories[i].desc[$scope.lang];
                        $scope.headerList=$scope.categories[i].name[$scope.lang];
                        /*console.log($scope.textList);
                         console.log($scope.headerList);*/
                        break;
                    }
                }

            } else {
                $scope.textList='';
                $scope.headerList='';
                var tagArr=[];
                for(var i=0;i<$scope.categories.length;i++){
                    var arr=[];
                    for(var j=0;j<$scope.categories[i].filters.length;j++){
                        if (i==0){
                            //tagArr.push($scope.categories[i].filters[j]);
                            arr.push($scope.categories[i].filters[j]);
                        } else{
                            if(tagArr.indexOf($scope.categories[i].filters[j])>-1){
                                arr.push($scope.categories[i].filters[j]);
                            }
                        }
                    }
                    tagArr=JSON.parse(JSON.stringify(arr));
                }
                if (tagArr.length>0){
                    query={'filters':JSON.stringify(tagArr)};
                }
            }
            Filters.list(query,function(res){
                for(var i=0;i<res.length;i++){
                    res[i].value='';
                    $scope.filters.push(res[i]);
                }
            });
        });

        $scope.getStuffList = function(categoryId,page){
            if (!page){
                $scope.page=1;
                $scope.stuffList=[];
            }
            var  brandId;
            if (categoryId){
                brandId=0;
            } else {
                categoryId=$scope.section;
                brandId='section';
            }

            $scope.stuffList = Stuff.list({category:categoryId,brand:brandId,page:$scope.page},function(tempArr){
                if ($scope.page==1 && tempArr.length>0){
                    $scope.totalItems=tempArr[0].index;
                }
                for (var i=0 ; i<=tempArr.length - 1; i++) {
                    for (var j=0 ; j<=tempArr[i].tags.length - 1; j++) {
                        if ($scope.checkfilterList.indexOf(tempArr[i].tags[j])<0){
                            $scope.checkfilterList.push(tempArr[i].tags[j]);
                        }
                    }
                }
                //console.log($scope.checkfilterList);
            });
        }

        $scope.showItemFilter=function(id,index){
            //console.log(index);
            var i=$scope.checkfilterList.indexOf(id);
            if (i>-1){
                $scope.displayFilter[index]=true;
                return true;
            }
            return false;
        }

        $scope.filterLists =  function() {
            return function(item) {

                if (!$scope.filters || $scope.filters.length<=0){
                    return true;
                }
                for (var i=0 ; i<=$scope.filters.length - 1; i++) {
                    if ($scope.filters[i].value && item.tags.indexOf($scope.filters[i].value)<=-1){
                        return false;
                    }
                }
                return true;
            }
        }

        $scope.goToStuffDetail = function(item){
            $rootScope.$state.transitionTo('language.stuff.detail',{id:item._id});
        }


        $scope.setPage = function () {
            $scope.page++;
            $scope.getStuffList($scope.activeCategory,$scope.activeBrand,$scope.page);
            //console.log($scope.page);

        };

        function getCategoryName(id){
            for (var i=0;i<$scope.categories.length;i++){
                if($scope.categories[i]._id==id){
                    return $scope.categories[i].name[$scope.lang];
                }
            }
        }

        function getTagName(id){
            for (var i=0;i<$scope.filters.length;i++){
                for (var j=0;j<$scope.filters[i].tags.length;j++){
                    if($scope.filters[i].tags[j]._id==id){
                        return $scope.filters[i].tags[j].name[$scope.lang];
                    }
                }
            }
        }

        $scope.addToCart= function(res){
            $scope.itemToCart={'stuff':'','status':1,'name':'','artikul':'','quantity':1,'price':1,
                'category':$rootScope.$stateParams.category,'section':$rootScope.$stateParams.section,'categoryName':'','img':'','tags':[]};
            $scope.itemToCart.stuff=res._id;
            $scope.itemToCart.name=res.name[$scope.lang];
            $scope.itemToCart.categoryName=getCategoryName(res.category);
            $scope.itemToCart.price=(res.priceSale)?res.priceSale:res.price;
            $scope.itemToCart.artikul=res.artikul;
            $scope.itemToCart.img=res.img;
            for(var i=0;i<res.tags.length;i++){
                $scope.itemToCart.tags.push(getTagName(res.tags[i]));
            }
            CartLocal.addToCart( $scope.itemToCart);
        }



        //прокрутка вверх екрана
        $scope.scrollTo = function(id) {
            //console.log(id);
            $location.hash(id);
            $anchorScroll();
        }



    }])
    .controller('sparkDetailCtrl',['$scope','Stuff','$rootScope','$timeout','CartLocal',function($scope,Stuff,$rootScope,$timeout,CartLocal){
        $scope.lang=$rootScope.$stateParams.lang;
        $scope.cart=CartLocal.list();
        $scope.itemToCart={'stuff':'','status':1,'name':'','artikul':'','quantity':1,'price':1,
         'category':$rootScope.$stateParams.category,'section':$rootScope.$stateParams.section,'categoryName':'','img':'','tags':[]};

        $scope.addToCart= function(){
            //$scope.itemToCart.quantity=parseInt($scope.currentQuantity);
            //console.log('sss');

            CartLocal.addToCart( $scope.itemToCart);
        }

        $scope.spark=Stuff.full({id:$rootScope.$stateParams.id,page:'page'},function(res,err){
            //console.log('gfdfdfd');
             $scope.itemToCart.stuff=res._id;
             $scope.itemToCart.name=res.name[$scope.lang];
             $scope.itemToCart.categoryName=res.category.name[$scope.lang];
             $scope.itemToCart.price=(res.priceSale)?res.priceSale:res.price;
             $scope.itemToCart.artikul=res.artikul;
            $scope.itemToCart.img=res.img;
            for(var i=0;i<res.tags.length;i++){
                $scope.itemToCart.tags.push(res.tags[i].name[$scope.lang]);
            }
            //console.log($scope.itemToCart);

        });

//*****************************************photo**************************************************
        /*$scope.$watch('activePhoto',function(){
         if (!$scope.activePhoto) return;
         $scope.itemToCart.color=$scope.activePhoto.tag;
         if (!$scope.activePhoto.name) {
         var tags=$scope.stuff.category.mainFilter.tags;
         for (var i=0;i<tags.length;i++){
         if (tags[i]._id==$scope.activePhoto.tag){
         $scope.activePhoto.name=tags[i].name[$scope.lang];
         }
         }
         }
         if ($scope.color){
         $scope.color=$scope.activePhoto.tag
         } else {
         $timeout(function(){$scope.color=$scope.activePhoto.tag;},300)
         }
         $scope.itemToCart.img=$scope.activePhoto.thumb;
         $scope.itemToCart.color=$scope.activePhoto.tag;
         $scope.itemToCart.colorName=$scope.activePhoto.name;
         if ($scope.itemToCart.size) {
         $scope.currentQuantity=CartLocal.getCount($scope.itemToCart);
         }

         })

         $scope.changeColor = function(tag){
         var j=0;
         for (var i=0;i<$scope.stuff.gallery.length;i++){
         if (tag==$scope.stuff.gallery[i].tag){
         if ($scope.activePhoto.tag!=$scope.stuff.gallery[i].tag){
         j=i;
         //$scope.activePhoto=$scope.stuff.gallery[i];
         } else if ($scope.activePhoto.index>$scope.stuff.gallery[i].index){
         j=i;
         //$scope.activePhoto=$scope.stuff.gallery[i];
         }
         }
         }
         $scope.changePhoto(j);
         }

         $scope.changePhoto= function(index){
         if (!$scope.ez){
         $scope.ez =$('#img_001').data('elevateZoom');
         }
         $scope.ez.swaptheimage($scope.stuff.gallery[index].thumb, $scope.stuff.gallery[index].img);
         $scope.activePhoto=$scope.stuff.gallery[index];
         *//*$scope.itemToCart.color=$scope.activePhoto.tag;
         $scope.currentQuantity=CartLocal.getCount($scope.itemToCart);*//*
         };
         var jj=0;
         $scope.showOptionColor= function(id){
         //console.log('jj - '+jj++);
         if (!$scope.stuff || !$scope.stuff.gallery) return;
         for (var i=0;i<$scope.stuff.gallery.length;i++){
         if ($scope.stuff.gallery[i].tag==id) {
         return true;
         }
         }
         return false;
         }

         /*//*********************************************size***********************************************
         function getSizeName(tags){
            for (var i=0;i<tags.length;i++){
                if (tags[i]._id==$scope.itemToCart.size) {
                    $scope.itemToCart.sizeName=tags[i].name[$scope.lang];
                }
            }
        };
         $scope.filterSize=[];
         function getCurrentSize(filters,tags){
            var tempArr=[];
            for (var i=0;i<filters.length;i++){
                //if (is) break;
                if (filters[i].name['en'].toLowerCase()=='size'){
                    for (var j=0;j<filters[i].tags.length;j++){
                        //console.log(filters[i].tags[j]);
                        for (var l=0;l<tags.length;l++){
                            if (filters[i].tags[j]==tags[l]._id) {
                                tempArr.push(tags[l]);
                                if (!$scope.itemToCart.size){
                                    $scope.itemToCart.size=tags[l]._id;
                                    $scope.itemToCart.sizeName=tags[l].name[$scope.lang];
                                } else {
                                    if($scope.itemToCart.size==tags[l]._id) {
                                        $scope.itemToCart.sizeName=tags[l].name[$scope.lang];
                                    }
                                }
                          }
                        }
                    }
                }
            }
            $scope.filterSize=tempArr;
        }
         $scope.changeSize = function(){
            getSizeName($scope.stuff.tags);
            $scope.currentQuantity=CartLocal.getCount($scope.itemToCart);
        }
         /*//***************************************** end size ******************************************
         $scope.disabledToCart=function(){
            console.log(new Date().getTime());

            if ($scope.stuff.stock){
                console.log($scope.stuff.stock[$scope.itemToCart.color][$scope.itemToCart.size]);
                console.log($scope.stuff.stock[$scope.itemToCart.color]);
                console.log($scope.stuff.stock[$scope.itemToCart.color][$scope.itemToCart.size]);
                if ($scope.stuff.stock[$scope.itemToCart.color] && $scope.stuff.stock[$scope.itemToCart.color][$scope.itemToCart.size]
                    && $scope.stuff.stock[$scope.itemToCart.color][$scope.itemToCart.size]==1){
                    return true;
                }


            }
            var disabled = false;
            var noColor=true;
            if (!$scope.stuff || !$scope.stuff.tags) return;
            for (var i=0;i<$scope.stuff.tags.length;i++){
               *//* console.log($scope.activePhoto._id);
         console.log($scope.stuff.tags[i]._id);*//*
         if ($scope.stuff.tags[i]._id==$scope.activePhoto.tag){
         noColor=false;
         }
         if  ($scope.stuff.tags[i]._id==$scope.commonFilter.tags[2]){
         disabled=true;
         break;
         }
         }

         return disabled || noColor;
         }

         $scope.addToCart= function(){
         //console.log($scope.itemToCart);
         $scope.itemToCart.quantity=parseInt($scope.currentQuantity);
         CartLocal.addToCart($scope.itemToCart);
         }*/
    }])

    .controller('newsCtrl', ['$scope','$rootScope','News','$q','$timeout','$location','$anchorScroll',
        function ($scope,$rootScope,News,$q,$timeout,$location,$anchorScroll) {
           $scope.newsList=[];
            //paginator
            $scope.page=1;
            //$scope.numPages=2;
            $scope.totalItems=0;
            //$scope.maxSize = 5;
            //$scope.perPage =3;
            var defer = $q.defer();
            var promises = [];
           $scope.getNewsList = function(page){
                if (!page){
                    $scope.page=1;
                    $scope.newsList=[];
                }

                News.list({page:$scope.page},function(tempArr){
                    if ($scope.page==1 && tempArr.length>0){
                        $scope.totalItems=tempArr[0].index;
                    }
                    for (var i=0 ; i<=tempArr.length - 1; i++) {
                        // tempArr[i].filters=JSON.parse(tempArr[i].filters);

                        tempArr[i].desc=(tempArr[i].desc0[$scope.lang]=='')?tempArr[i].desc1:tempArr[i].desc0;
                        tempArr[i].desc[$scope.lang]= tempArr[i].desc[$scope.lang].substring(0,300);
                        //console.log(tempArr[i].desc);
                        /*if (!tempArr.desc0){

                        }*/
                        $scope.newsList.push(tempArr[i]);
                    }
                });
            }
            //Angularjs promise chain when working with a paginated collection
            //http://stackoverflow.com/questions/20171928/angularjs-promise-chain-when-working-with-a-paginated-collection
            $scope.loadData = function(numPage) {
                //console.log(numPage);
                if (!numPage) numPage=1;
                var deferred = $q.defer();
                var i=1;
                $scope.newsList=[];
                function loadAll() {
                    News.list({page:i},function(news){
                        //console.log(stuffs);
                        if ($scope.newsList.length<=0 && news.length>0){
                            $scope.totalItems=news[0].index;
                        }
                        for(var ii=0; ii<=news.length-1;ii++){
                            news[ii].desc=(news[ii].desc0[$scope.lang]=='')?news[ii].desc1:news[ii].desc0;
                            news[ii].desc[$scope.lang]= news[ii].desc[$scope.lang].substring(0,300);
                            $scope.newsList.push(news[ii]);
                        }
                        if(i<numPage) {
                            i++;
                            loadAll();
                        }
                        else {
                            deferred.resolve();
                        }
                    })
                }
                loadAll();
                return deferred.promise;
            };




            $scope.goToNews = function(news){
                //console.log('dd');
                var id =(news)?news._id:'';
                $rootScope.$state.transitionTo('mainFrame.news.detail',{'id':id});

            }



            $scope.setPage = function () {
                $scope.page++;
                $scope.getNewsList($scope.page);
                //console.log($scope.page);

            };

            //прокрутка вверх екрана
            $scope.scrollTo = function(id) {
                //console.log(id);
                $location.hash(id);
                $anchorScroll();
            }

            $scope.getNewsList();

        }])
    .controller('newsDetailCtrl',['$scope','News','$rootScope','$timeout',function($scope,News,$rootScope,$timeout){
        $scope.lang=$rootScope.$stateParams.lang;

        $scope.news=News.get({id:$rootScope.$stateParams.id},function(res,err){
           // console.log('gfdfdfd');


        });

    }])