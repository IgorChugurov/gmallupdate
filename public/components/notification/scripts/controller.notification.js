'use strict';
angular.module('gmall.controllers')
.controller('notificationCtrl',['$scope','$rootScope','global','$anchorScroll','Helper','$notification','$sce','exception','$location',function($scope,$rootScope,global,$anchorScroll,Helper,$notification,$sce,exception,$location){
    var self={};
    $scope.$ctrl=self;
    // установка диапазона дат для получения списка
    self.dt  = new Date();
    self.today = function(t) {
        if(t){return new Date(self.dt.setHours(0,0,0));}else {return new Date(self.dt.setHours(23,59,59));}
    };
    self.maxDate=self.today(true)
    var dtto = self.today();
    var dtfrom=self.today(true);
    dtfrom.setDate(dtfrom.getDate() - 30);
    self.dtto=dtto;
    self.dtfrom=dtfrom;
    var now = new Date();
    var yesterday=new Date(new Date(self.today(true)).setDate(now.getDate() - 1));
    var nextWeek = new Date(new Date(self.today(true)).setDate(now.getDate() - 7));
    var nextMonth = new Date(new Date(self.today(true)).setMonth(now.getMonth() - 1));
    var y = dtto.getFullYear(), m = dtto.getMonth();
    var thisMonth = new Date(y, m, 1);
    var last30day = new Date(new Date(self.today(true)).setDate(now.getDate() - 30));

    self.datePicker={};
    self.options={
        "ranges": {
            "сегодня": [
                self.today(true),
                dtto
            ],
            "вчера": [
                yesterday,
                self.today(true)
            ],
            "последние 7 дней": [
                nextWeek,
                dtto
            ],
            "последние 30 дней": [
                last30day,
                dtto
            ],
            "текущий месяц": [
                thisMonth,
                dtto
            ],
            "прошлый месяц": [
                nextMonth,
                dtto
            ]
        },
        locale: {
            applyClass: 'btn-green',
            applyLabel: "Выбрать",
            fromLabel: "от",
            toLabel: "до",
            cancelLabel: 'Отменить',
            customRangeLabel: 'прозвольный диапазон',
            format:"DD.MM.YY",
            daysOfWeek: ['Пн', 'Вт', 'Ср', 'Чт', 'Пн', 'Сб', 'Вс'],
            firstDay: 1,
            monthNames: ['Январь', 'Февраль', 'Март', 'Апрель','Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь',
                'Ноябрь', 'Декабрь'
            ]
        }
    }
    self.datePicker.date = {
        startDate: dtfrom,
        endDate: dtto
    };
    moment.locale("ru");
    self.moment=moment;

    //**********************************************************************************************
    //*********************************************************************************************
    $anchorScroll();
    $scope.notificationCtrl=this;
    $scope.notificationCtrl.typeNote=$rootScope.$stateParams.type;
    $scope.notificationCtrl.lang= global.get('store').val.lang
    $scope.notificationCtrl.notificationsTypeLang=notificationsTypeLang;
    console.log($scope.notificationCtrl.notificationsTypeLang)
    //console.log(global.get('notifications'))
    $scope.notificationCtrl.notifications=global.get('notifications');
    $scope.notificationCtrl.type=$rootScope.$stateParams.type;
    $scope.notificationCtrl.trustHtml = function(text){
        var trustedHtml = $sce.trustAsHtml(text);
        //console.log(text)
        return trustedHtml;
    };
    $scope.notificationCtrl.allNote=function(){
        $location.search('type',null);
    }
    $scope.notificationCtrl.paginate={page:0,rows:20,items:0}
    $scope.notificationCtrl.items=[];
    //$scope.notificationCtrl.checkAll=false;
    $scope.notificationCtrl.setCheckAll=function(){
        $scope.notificationCtrl.items.forEach(function(el,i){
            $scope.notificationCtrl.items[i].check=$scope.notificationCtrl.checkAll;
        })
    }
    $scope.notificationCtrl.changeType = function(type){
        $scope.notificationCtrl.type=type;
        $scope.notificationCtrl.paginate.page=0;
        $scope.notificationCtrl.getList($scope.notificationCtrl.paginate.page,$scope.notificationCtrl.paginate.rows);
    }


    var query=null
    $scope.notificationCtrl.getList = function(){
        var pagin=$scope.notificationCtrl.paginate;
        $scope.notificationCtrl.checkAll=false;
        var user=(global.get('seller').val)?'seller':global.get('user').val._id;
        query={$and:[{type:$scope.notificationCtrl.type},{addressee:user}]}

        query.$and.push({date :{$gte:new Date(self.datePicker.date.startDate),$lte: new Date(self.datePicker.date.endDate)}})
        if(global.get('seller').val){
            query.$and.push({seller:global.get('seller').val})
        }
        $notification.query({perPage:pagin.rows , page:pagin.page,query:query},function(res){
            if (pagin.page==0 && res.length>0){
                $scope.notificationCtrl.paginate.items=res.shift().index;
            }
            $scope.notificationCtrl.items=res;
            var ids=res.filter(function(mes){
                return !mes.read;
            }).map(function(mes){return mes._id});
            //console.log(ids);
            if(ids.length){
                $notification.save({update:'read dateNote'},{_id:ids,dateNote:Date.now(),read:true},function(res){
                    //getChatUnReadMessages({dialog:self.dialog._id,count:ids.length})
                },function (err) {
                    if(err.data){err=err.data;}
                    exception.catcher('обновление статуса сообщений')(err)
                })
            }
            var notes=res.filter(function(mes){
                return !mes.read;
            }).reduce(function(o,item){
                if(!o[item.type]){o[item.type]=1}else{o[item.type]++}
                return o;
            },{})
            /*console.log(notes)
            console.log(global.get('notifications' ).val)*/
            for(var type in notes){
                if(global.get('notifications' ).val && global.get('notifications' ).val[type]){
                    global.get('notifications' ).val[type]-=notes[type];
                    $rootScope.notificationsCount-=notes[type];
                    if($rootScope.notificationsCount<0){$rootScope.notificationsCount=0;}
                    if(!global.get('notifications' ).val[type] || global.get('notifications' ).val[type]<0){
                        delete global.get('notifications' ).val[type];
                    }
                }
            }
            //console.log($scope.listCtrl.items,res);
        })
    };
    $scope.notificationCtrl.deleteItem = function(id){
        var items;
        if(id){
            items={id:id}
        }else{
            items=$scope.notificationCtrl.items.filter(function(el){return el.check} ).map(function(el){return el._id});
        }


        $notification.delete(items,function(res){
            //if (err) console.log(err);
            $scope.notificationCtrl.getList($scope.notificationCtrl.paginate.page,$scope.notificationCtrl.paginate.rows);
            //$rootScope.getNotifications();
            /*if (global.get('seller').val){
                $rootScope.getNotifications(global.get('seller' ).val);
            } else{
                $rootScope.getNotifications();
            }*/
        },function(err){
            if(err){
                exception.catcher(err)
            }
        });
    }
    $scope.notificationCtrl.deleteEnable=function(){
        if (!$scope.notificationCtrl.items.length)return false;
        return $scope.notificationCtrl.items.some(function(el){return el.check})
    }


    $scope.notificationCtrl.saveNote=function(note){
        //console.log(note)
        var field='note';
        var o={_id:note._id,note:note.note};
        if(!note.dateNote){
            note.dateNote=Date.now();
            field +=' dateNote';
            o.dateNote=note.dateNote;
        }
        $notification.save({update:field},o,function(res){
            //console.log(res)
        });
    }


    if(global.get('user').val){
        activate()
    } else{
        $rootScope.$on('logged',function(){
            activate()
        })
    }
    function activate(){
        $scope.notificationCtrl.getList($scope.notificationCtrl.paginate.page,$scope.notificationCtrl.paginate.rows);
    }

    self.reloadOrders=reloadOrders;
    function reloadOrders(){
        $scope.notificationCtrl.paginate.page=0;
        $scope.notificationCtrl.getList()
    }








}])/*notificationCtrl*/

angular.module('gmall.directives')
.directive('goToOrder',['$compile',function($compile){
    return{
        scope:{
            order:'=goToOrder',
        },

        link:function(scope,element){
            setTimeout(function () {
               //console.log(scope.order)
                if (scope.order){
                    var a = angular.element('<a ui-sref="frame.orders.order({id:order})"></a>')
                    var wrapper = $compile(a)(scope);
                    //
                    element.wrap(a);
                }
            }, 100);

        }
    }
}])