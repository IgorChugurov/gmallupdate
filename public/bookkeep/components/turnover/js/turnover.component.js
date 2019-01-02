'use strict';
(function(){
    angular.module('gmall.directives')
        .directive('turnover',turnoverDirective)
        .directive('synopsis',synopsisDirective)

    function turnoverDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemsCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/turnover/turnover.html',
        }
    }
    function synopsisDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: synopsisCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/turnover/synopsis.html',
        }
    }

    itemsCtrl.$inject=['$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','$state','exception','$http','$attrs','Supplier','Money','Worker','Founder','Contragent','Customer']
    function itemsCtrl($stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,$state,exception,$http,$attrs,Supplier,Money,Worker,Founder,Contragent,Customer){
        var self = this;
        self.type=$attrs.type;
        var typeName= typeOfContrAgents.getOFA('type',self.type)
        self.typeName=(typeName)?typeName.name:'Деньги';
        self.mobile = global.get('mobile').val;
        self.currencyArr = global.get('store').val.currencyArr;
        self.global = global;
        self.moment = moment;
        self.$state = $state;
        self.dateStart=new Date();
        self.dateStart.setHours(0,0,0,0);
        self.dateEnd=new Date();
        self.dateEnd.setHours(23,59,59,999);
        self.dateOptions = {
            startingDay: 1
        };
        //console.log(virtualAccounts)
        self.virtualAccounts=global.get('virtualAccounts').val.filter(function (a) {
            return a.actived
        })
        if(self.virtualAccounts.length==1){
            self.virtualAccount=self.virtualAccounts[0]._id
        }

        self.models={
            Supplier:Supplier,
            Worker:Worker,
            Founder:Founder,
            Contragent:Contragent,
            Customer:Customer,
            Money:Money
        }


        self.createItem=createItem;
        self.getDetail=getDetail;
        self.back=function () {
            switch ($attrs.type) {
                case 'Supplier': self.backLink='frame.Supplier';break;
                case 'Worker':self.backLink='frame.Worker';break;
                case 'Founder':self.backLink='frame.Founder';break;
                case 'Contragent':self.backLink='frame.Contragent';break;
                case 'Customer':self.backLink='frame.Customer';break;
                case 'Money':self.backLink='frame.Money';break;
            }
            $state.go(self.backLink, undefined)
        }
        if($stateParams.id){
            self.contrAgent=$stateParams.id;
            var q= {_id:self.contrAgent}
            self.models[self.type].get(q,function (res) {
                self.contrAgents=[res]
                console.log(self.contrAgents)
            })
        }
        self.refreshContrAgents=refreshContrAgents;


        self.getVirtualAccountName=getVirtualAccountName;
        function getVirtualAccountName() {
            var s = self.virtualAccounts.getOFA('_id',self.virtualAccount)
            return (s)?s.name:'по всем подразделениям'
        }


        activate();

        function activate() {
        }

        function createItem() {
            if(!self.virtualAccount){
                return exception.catcher('формирование оборотной ведомости')('не выбрано подразделение')
            }
            $q.when()
                .then(function () {
                    var contrAgent=(self.contrAgent)?self.contrAgent:'forAllContrAgents'
                    var dateStart = new Date(self.dateStart);
                    dateStart.setHours(0,0,0,0)
                    var dateEnd = new Date(self.dateEnd);
                    dateEnd.setHours(23,59,59,999);
                    var url = '/api/bookkeep/turnover/'+self.type+'/'+contrAgent+'/'+dateStart.getTime()+'/'+dateEnd.getTime()+'/'+self.virtualAccount;
                    console.log(url)
                    return $http.get(url)
                })
                .then(function (res) {
                    console.log(res)
                    if(res && res.data){
                        self.items=res.data.items;
                        self.itogo=res.data.itogo;
                    }
                    return;
                })
                .catch(function (err) {
                    console.log(err)
                    exception.catcher('формирование оборотной ведомости')(err)
                })
        }
        var delay;

        function getDetail(data) {
            console.log(data)
            return $q(function(resolve,reject){
                var options={
                    animation: true,
                    restrict:"E",
                    templateUrl: 'bookkeep/components/turnover/getDetail.html',
                    resolve :{
                        data:function () {
                            return angular.copy(data);
                        }
                    },
                    controller: function($uibModalInstance,$state,data){
                        var self=this;
                        data.forEach(function (d) {
                            d.edName=reestrEDWithNAme[d.type].name
                            d.date=moment(d.date).format('LLL')
                        })
                        self.items=data
                        self.ok=ok;
                        self.goToDoc=goToDoc;

                        function goToDoc(doc) {
                            var url = $state.href(doc.sref,{id:doc._id});
                            window.open(url,'_blank');

                            //$uibModalInstance.close(doc);
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
                    var url = $state.href(doc.ed.doc.sref,{id:doc.ed._id});
                    window.open(url,'_blank');
                    resolve()
                }, function (err) {reject(err)});
            })
                .then(function (va) {

                })
        }


        function refreshContrAgents(searchStr) {
            if(!searchStr){return}
            var q= {search:searchStr}
            self.models[self.type].query(q,function (res) {
                self.contrAgents=res
                console.log(self.contrAgents)
            })
        }
    }


    synopsisCtrl.$inject=['$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','$state','exception','$http','$attrs','Zakaz','Supplier','Money','Worker','Founder','Contragent','Customer']
    function synopsisCtrl($stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,$state,exception,$http,$attrs,Zakaz,Supplier,Money,Worker,Founder,Contragent,Customer){
        var self = this;
        self.type=$attrs.type;
        var typeName= typeOfContrAgents.getOFA('type',self.type)
        self.typeName=(typeName)?typeName.name:'Деньги';
        self.mobile = global.get('mobile').val;
        self.currencyArr = global.get('store').val.currencyArr;
        self.global = global;
        self.moment = moment;
        self.$state = $state;
        self.dateStart=new Date();
        self.dateStart.setHours(0,0,0,0);
        self.dateEnd=new Date();
        self.dateEnd.setHours(23,59,59,999);
        self.dateOptions = {
            startingDay: 1
        };
        //console.log(virtualAccounts)
        self.virtualAccounts=global.get('virtualAccounts').val.filter(function (a) {
            return a.actived
        })
        if(self.virtualAccounts.length==1){
            self.virtualAccount=self.virtualAccounts[0]._id
        }

        self.models={
            Supplier:Supplier,
            Worker:Worker,
            Founder:Founder,
            Contragent:Contragent,
            Customer:Customer,
            Money:Money
        }


        self.createItem=createItem;
        self.getDetail=getDetail;
        self.back=function () {
            switch ($attrs.type) {
                case 'Supplier': self.backLink='frame.Supplier';break;
                case 'Worker':self.backLink='frame.Worker';break;
                case 'Founder':self.backLink='frame.Founder';break;
                case 'Contragent':self.backLink='frame.Contragent';break;
                case 'Customer':self.backLink='frame.Customer';break;
                case 'Money':self.backLink='frame.Money';break;
            }
            $state.go(self.backLink, undefined)
        }
        if($stateParams.id){
            self.contrAgent=$stateParams.id;
            var q= {_id:self.contrAgent}
            self.models[self.type].get(q,function (res) {
                self.contrAgents=[res]
                console.log(self.contrAgents)
            })
        }
        self.refreshContrAgents=refreshContrAgents;


        self.getVirtualAccountName=getVirtualAccountName;
        function getVirtualAccountName() {
            var s = self.virtualAccounts.getOFA('_id',self.virtualAccount)
            return (s)?s.name:'по всем подразделениям'
        }


        activate();

        function activate() {
        }

        function createItem() {
            if(!self.virtualAccount){
                return exception.catcher('формирование оборотной ведомости')('не выбрано подразделение')
            }
            $q.when()
                .then(function () {
                    var contrAgent=(self.contrAgent)?self.contrAgent:'forAllContrAgents'
                    var dateStart = new Date(self.dateStart);
                    dateStart.setHours(0,0,0,0)
                    var dateEnd = new Date(self.dateEnd);
                    dateEnd.setHours(23,59,59,999);
                    /*var url = '/api/bookkeep/turnover/'+self.type+'/'+contrAgent+'/'+dateStart.getTime()+'/'+dateEnd.getTime()+'/'+self.virtualAccount;
                    console.log(url)
                    return $http.get(url)*/
                    var query={date:{$gte:dateStart.getTime(),$lt:dateEnd.getTime()}}
                    return Zakaz.getList({page:0,rows:1000},query)
                })
                .then(function (res) {
                    console.log(res)

                    return;
                })
                .catch(function (err) {
                    console.log(err)
                    exception.catcher('формирование сводной ведомости')(err)
                })
        }
        var delay;

        function getDetail(data) {
            console.log(data)
            return $q(function(resolve,reject){
                var options={
                    animation: true,
                    restrict:"E",
                    templateUrl: 'bookkeep/components/turnover/getDetail.html',
                    resolve :{
                        data:function () {
                            return angular.copy(data);
                        }
                    },
                    controller: function($uibModalInstance,$state,data){
                        var self=this;
                        data.forEach(function (d) {
                            d.edName=reestrEDWithNAme[d.type].name
                            d.date=moment(d.date).format('LLL')
                        })
                        self.items=data
                        self.ok=ok;
                        self.goToDoc=goToDoc;

                        function goToDoc(doc) {
                            var url = $state.href(doc.sref,{id:doc._id});
                            window.open(url,'_blank');

                            //$uibModalInstance.close(doc);
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
                    var url = $state.href(doc.ed.doc.sref,{id:doc.ed._id});
                    window.open(url,'_blank');
                    resolve()
                }, function (err) {reject(err)});
            })
                .then(function (va) {

                })
        }


        function refreshContrAgents(searchStr) {
            if(!searchStr){return}
            var q= {search:searchStr}
            self.models[self.type].query(q,function (res) {
                self.contrAgents=res
                console.log(self.contrAgents)
            })
        }
    }

})()
