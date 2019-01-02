'use strict';
(function(){
    angular.module('gmall.directives')
        .directive('balance',balanceDirective)

    function balanceDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemsCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/balance/balance.html',
        }
    }

    itemsCtrl.$inject=['$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','$state','exception','$http','AccountList']
    function itemsCtrl($stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,$state,exception,$http,AccountList){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.moment = moment;
        self.$state = $state;
        self.date=new Date();
        self.date.setHours(0,0,0,0);
        self.dateOptions = {
            startingDay: 1
        };
        //console.log(virtualAccounts)
        self.currencyArr=global.get('store').val.currencyArr;

        self.virtualAccounts=global.get('virtualAccounts').val;
        if(self.virtualAccounts && self.virtualAccounts.length){
            self.virtualAccounts=self.virtualAccounts.filter(function (a) {
                return a.actived;
            })
            if(!self.virtualAccounts.length){
                self.virtualAccounts=[global.get('virtualAccounts').val[0]]
            }else{
                self.virtualAccount=self.virtualAccounts[0]._id;
            }

        }

        self.createItem=createItem;
        self.closePeriod=closePeriod;
        self.getDetail=getDetail;
        self.getVirtualAccountName=getVirtualAccountName;
        function getVirtualAccountName() {
            var s = self.virtualAccounts.getOFA('_id',self.virtualAccount)
            return (s)?s.name:'по всем подразделениям'
        }
        activate();

        function activate() {
            $q.when()
                .then(function () {
                    return AccountList.getList({row:500,page:0},{root:null})
                })
                .then(function (accounts) {
                    self.accounts=accounts;

                })
        }

        function createItem() {
            $q.when()
                .then(function () {

                    var date = new Date(self.date);
                    date.setHours(23,59,59,999)
                    var va = (self.virtualAccount)?'/'+self.virtualAccount:'/allVirtualAccounts'
                    var url = '/api/bookkeep/balance/'+date.getTime()+va;
                    //console.log(url)

                    return $http.get(url)
                })
                .then(function (res) {
                    console.log(res)
                    if(res && res.data){
                        self.items=res.data.accounts;
                        self.itogo=res.data.itogo;
                    }
                    return;
                    if(res && res.data){
                        var data = res.data.data;
                        self.itogo={};
                        self.itogo.s={d:0,c:0}
                        self.itogo.o={d:0,c:0}
                        self.itogo.e={d:0,c:0}
                        self.accounts.forEach(function (a) {
                            a.s={d:0,c:0}
                            a.o={d:0,c:0}
                            a.e={d:0,c:0}
                            a.va=angular.copy(virtualAccounts);
                            a.va.forEach(function (va) {
                                va.s={d:0,c:0}
                                va.o={d:{s:0,data:null},c:{s:0,data:null}}
                                va.e={d:0,c:0}
                                if(data[a._id] && data[a._id][va._id] && data[a._id][va._id].debet){
                                    va.o.d.data=data[a._id][va._id].debet;
                                    data[a._id][va._id].debet.forEach(function (d) {
                                        va.o.d.s+=d.sum
                                    })
                                }
                                if(data[a._id] && data[a._id][va._id] && data[a._id][va._id].credit){
                                    va.o.c.data=data[a._id][va._id].credit;
                                    data[a._id][va._id].credit.forEach(function (d) {
                                        va.o.c.s+=d.sum
                                    })
                                }
                                a.o.d+=va.o.d.s
                                a.o.c+=va.o.c.s
                                var d = va.s.d+va.o.d.s
                                var c = va.s.c+va.o.c.s
                                var delta = d-c;
                                if(delta>0){
                                    va.e.d=delta
                                }else if(delta<0){
                                    va.e.c=delta*-1
                                }
                            })
                            var d = a.s.d+a.o.d
                            var c = a.s.c+a.o.c
                            var delta = d-c;
                            if(delta>0){
                                a.e.d=delta
                            }else if(delta<0){
                                a.e.c=delta*-1
                            }
                            self.itogo.o.d+=a.o.d
                            self.itogo.o.c+=a.o.c
                            self.itogo.e.d+=a.e.d
                            self.itogo.e.c+=a.e.c
                        })
                        /*var d = self.itogo.s.d+self.itogo.o.d
                        var c = self.itogo.s.c+self.itogo.o.c
                        var delta = d-c;
                        if(delta>0){
                            self.itogo.e.d=delta
                        }else if(delta<0){
                            self.itogo.e.c=delta*-1
                        }*/
                        self.items=self.accounts
                        console.log('accounts',self.accounts)
                    }
                })
                .catch(function (err) {
                    console.log(err)
                    exception.catcher('формирование баланса')(err)
                })
        }
        var delay;
        function closePeriod() {
            if(!self.virtualAccount){
                return exception.catcher('закрытие периода')('не выбрано подразделение')
            }
            if(delay){return}
            delay=true;
            var date = new Date(self.date);
            date.setHours(0,0,0,0)
            //console.log(date.toString())
            Confirm('Закрыть период на '+moment(date).format('LLL'))
                .then(function () {
                    var va = (self.virtualAccount)?'/'+self.virtualAccount:'/allVirtualAccounts'
                    var url = '/api/bookkeep/closePeriod/'+date.getTime()+va;
                    console.log(url)
                    return $http.get(url)
                })
                .then(function (res) {
                    console.log(res)
                    delay=false;
                    $state.go('frame.closePeriod',{id:res._id})
                })
                .catch(function (err) {
                    delay=false;
                    console.log(err)
                    exception.catcher('закрытие периода')(err)
                })
        }
        function getDetail(data) {
            //console.log(data)
            return $q(function(resolve,reject){
                var options={
                    animation: true,
                    restrict:"E",
                    templateUrl: 'bookkeep/components/balance/getDetail.html',
                    resolve :{
                        data:function () {
                            return angular.copy(data);
                        }
                    },
                    controller: function($uibModalInstance,$state,data){
                        var self=this;
                        data.data.sort(function (a,b) {
                            var ad = new Date(a.ed.date).getTime()
                            var bd = new Date(b.ed.date).getTime()
                            return bd-ad
                        })
                        data.data.forEach(function (d) {

                            d.ed.doc=reestrEDWithNAme[d.ed.type]
                            d.ed.date=moment(d.ed.date).format('LLL')

                            //console.log(d.ed)
                        })
                        self.items=data.data;

                        self.sum = data.s;
                        self.ok=ok;
                        self.goToDoc=goToDoc;

                        function goToDoc(doc,zakaz) {
                            doc.zakaz=zakaz
                            $uibModalInstance.close(doc);
                        }
                        self.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                        function ok(){
                            $uibModalInstance.close();
                        }
                    },
                    controllerAs:'$ctrl',
                }
                $uibModal.open(options).result.then(function (doc) {

                    //$state.go(doc.ed.doc.sref,{id:doc.ed._id})
                    if(doc.zakaz){
                        var url = $state.href('frame.ZakazManufacture.item',{id:doc.ed.zakazId});
                    }else{
                        var url = $state.href(doc.ed.doc.sref,{id:doc.ed._id});
                    }

                    window.open(url,'_blank');

                    resolve()
                }, function (err) {reject(err)});
            })
                .then(function (va) {

                })
        }
    }
})()
