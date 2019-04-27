'use strict';
(function(){
    angular.module('gmall.services')
        .directive('schedulePlaceFromServer',schedulePlaceFromServerDirective)
        .directive('ngRepeatEndWatch', function () {
            return {
                restrict: 'A',
                scope: {},
                link: function (scope, element, attrs) {
                    if (attrs.ngRepeat) {
                        if (scope.$parent.$last) {
                            if (attrs.ngRepeatEndWatch !== '') {
                                if (typeof scope.$parent.$parent[attrs.ngRepeatEndWatch] === 'function') {
                                    // Executes defined function
                                    scope.$parent.$parent[attrs.ngRepeatEndWatch]();
                                } else {
                                    // For watcher, if you prefer
                                    scope.$parent.$parent[attrs.ngRepeatEndWatch] = true;
                                }
                            } else {
                                // If no value was provided than we will provide one on you controller scope, that you can watch
                                // WARNING: Multiple instances of this directive could yeild unwanted results.
                                scope.$parent.$parent.ngRepeatEnd = true;
                            }
                        }
                    } else {
                        throw 'ngRepeatEndWatch: `ngRepeat` Directive required to use this Directive';
                    }
                }
            };
        })
        .directive('setClassWhenAtTop', function ($window,$timeout) {
            var $win = angular.element($window); // wrap window object as jQuery object
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var topClass = attrs.setClassWhenAtTop, // get CSS class from directive's attribute value
                        offsetTop = element.offset().top-60; // get element's top relative to the document

                    scope.mastersRepeatDone=mastersRepeatDone;
                    var first,delay=1000;
                    function mastersRepeatDone() {
                        if(first){delay=500}else{first=true;}
                        $timeout(function(){
                            init()
                        },delay)

                    }

                    var scrollHandler =function (e) {
                        if ($win.scrollTop() >= offsetTop) {
                            element.addClass(topClass);
                        } else {
                            element.removeClass(topClass);
                        }
                    }

                    function init() {
                        var w=0,outerW=1;
                        try{
                            w =element.width();
                            outerW = element.parent().parent().width()
                        }catch(err){}
                        if(outerW>=w){
                            $(window).scroll(scrollHandler);
                        }else{
                            $(window).off("scroll", scrollHandler);
                        }

                    }

                }
            };
        })


    function schedulePlaceFromServerDirective(global){
        return {
            /*scope: {
                stuff:'@'
            },*/
            scope:true,
            bindToController: true,
            controller: schedulePlaceFromServerCtrl,
            controllerAs: '$ctrl',
            replace: false,
            /*transclude: true,
            template: '<div ng-transclude></div>'*/
        }
    };
    schedulePlaceFromServerCtrl.$inject=['$rootScope','Booking','$scope','$http','global','$q','$compile','$attrs','$uibModal','$state','$timeout']
    function schedulePlaceFromServerCtrl($rootScope,Booking,$scope,$http,global,$q,$compile,$attrs,$uibModal,$state,$timeout) {
        var self = this;
        self.moment=moment;
        self.mobile=global.get('mobile' ).val;
        self.global=global;
        self.changeWeek=changeWeek;
        self.chancheActiveSlide=chancheActiveSlide;
        self.changeService=changeService;
        self.setDataForEntry=setDataForEntry;



        self.week=0;
        var delay;
        self.services=null;
        if($attrs.services){
            try{
                var services = JSON.parse($attrs.services);
                //console.log(global.get('services').val)
            }catch(err){
                console.log(err)
            }
        }
        if($attrs.stuff){
            self.stuff=$attrs.stuff;
        }
        self.$onInit=function () {
            //console.log($attrs)
            //console.log(self.stuff)
        }
        $scope.$watch(function () {
            return self.week
        },function (n,o) {
            if(n!=o){
                self.changeWeek(n)
            }
        })
        function changeWeek(week,service) {
            //console.log(week)
            self.week=week
            if(!service){service=$attrs.stuff}
            //console.log(week)
            return $q.when()
                .then(function(){
                    var url='views/template/partials/scheduleplace/'+week
                    return $http.get(url.trim()+'.html',{params:{stuff:service,templ:$attrs.templ}})
                })
                .then(function(response){
                   // console.log(response)
                    if(!response){return;}
                    var addHtml=angular.element(response.data.html)
                    var atd1;
                    if(addHtml.find('#innerDivInschedule').html()){
                        atd1=$compile(addHtml.find('#innerDivInschedule').html())($scope)
                    }else{
                        atd1=$compile(addHtml)($scope)
                    }

                    var innerDivInschedule=$('#innerDivInschedule');
                    if(innerDivInschedule[0]){
                        innerDivInschedule.empty().append(atd1)
                    }

                })
                .catch(function (err) {
                    console.log(err)
                })
        }
        function chancheActiveSlide(direction) {
            if(delay){return}
            var week=self.week;
            if(direction=='right'){
                if(week>0){
                    week--;
                }else{
                    return;
                }
            }else{
                if(week<6){
                    week++;
                }else{
                    return
                }
            }
            delay=true;
            changeWeek(week).then(function () {
                delay=false;
            })


        }
        function changeService(s) {
            //console.log(delay,s)
            self.stuff=s
            if(delay){return}
            delay=true;
            changeWeek(self.week,s).then(function () {
                delay=false;
            })
        }
        function setDataForEntry(entry) {
            //console.log(global.get('seller').val)
            if(!global.get('seller').val){return}
            console.log(entry)
            //console.log('setDataForEntry')




            return $q(function(resolve,reject){
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'components/ORDERS/online/classInfo.html',
                    controller: classInfoCtrl,
                    controllerAs:'$ctrl',
                    //size: 'lg',
                    windowClass:'modalProject',
                    //windowTopClass:'modalTopProject',
                    backdropClass:'modalBackdropClass',
                    //openedClass:'modalOpenedClass'
                    resolve: {
                        entry :function () {
                            return entry;
                        }
                    }
                });
                $rootScope.$emit('modalOpened')
                modalInstance.result.then(function(entry){
                    $rootScope.$emit('modalClosed');
                    //console.log(item)
                    var o ={_id:entry._id}
                    var field ='masterReplace pays members'
                    o['masterReplace']=entry['masterReplace']
                    o['pays']=entry['pays']
                    o['members']=entry['members']
                    //console.logmembers
                    Booking.save({update:field},o,function(err){
                        global.set('saving',true);
                        $timeout(function(){
                            global.set('saving',false);
                            $state.reload();
                        },1500)


                    })
                    resolve(entry)
                },function(){$rootScope.$emit('modalClosed');reject()});
            })

        }
        classInfoCtrl.$inject=['$scope','$uibModalInstance','$rootScope','global','exception','Booking','entry']
        function classInfoCtrl($scope,$uibModalInstance,$rootScope,global,exception,Booking,entry) {

            var self = this;
            self.entry=entry;
            self.ok = function ok() {
                $uibModalInstance.close($scope.entry);
            }
            self.cancel = function cancel() {
                $uibModalInstance.dismiss();
            };
            $scope.entry=entry;
            var currentDate=Booking.getDateStringFromEntry(entry,true)
            self.dateEntry=moment(currentDate).format('LL')+','+moment(currentDate).format('dddd');
            $scope.dateEntry=self.dateEntry;
            $q.when()
                .then(function(){
                    return global.get('masters').val;
                })
                .then(function(data){
                    //console.log(data)
                    $scope.masters=data.map(function(m){
                        //m.stuffs=m.stuffs.map(function(s){return s._id})
                        return m
                    })
                    //.filter(function(m){return (m.stuffs && m.stuffs.length)});


                })
                .catch(function(err){
                    exception.catcher('получение списка мастеров')(err)
                });




        }
    }
})()
