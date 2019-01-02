'use strict';
(function(){
    angular.module('gmall.directives')
        .directive('closePeriod',directiveItems)
        .directive('closePeriodItem',directiveItem)


    function directiveItems(){
        return {
            scope: {},
            bindToController: true,
            controller: itemsCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/closePeriod/closePeriod.html',
        }
    }
    function directiveItem(){
        return {
            scope: {},
            bindToController: true,
            controller: itemCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/closePeriod/closePeriodItem.html',
        }
    }

    itemsCtrl.$inject=['ClosePeriod','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','$state']
    function itemsCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,$state){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.$state = $state;
        self.query = {};
        self.paginate = {page: 0, rows: 50, totalItems: 0}
        var currency = global.get('store').val.mainCurrency

        self.getList = getList;
        self.searchItems = searchItem;
        self.saveField = saveField;

        function createItem() {
            $state.go('frame.suppliers.supplier',{id:'new'})
        }

        activate();

        function activate() {
            return getList().then(function () {
            }).then(function () {
            });
        }

        function getList() {
            return Items.getList(self.paginate, self.query)
                .then(function (data) {
                    data.forEach(function (d) {
                        d.date=moment(d.date).format('LLL')
                        /*console.log(d)
                        d.date=moment(d.date).format('LLL')
                        d.debet=(d.debet).toFixed(2)
                        d.credit=(d.credit).toFixed(2)*/
                    })
                    self.items = data;
                    //console.log(self.items)
                });
        }


        function searchItem(searchStr) {
            if (searchStr) {
                self.paginate.search = searchStr.substring(0, 50)
            } else {

            }
            self.query = {};

            self.paginate.page = 0;
            return getList().then(function () {
                delete self.paginate.search
                console.log('Activated suppliers list View');
            });
        }

        function saveField(item,field){
            var o={_id:item._id};
            o[field]=item[field]
            return self.Items.save({update:field},o ).$promise.then(function(){
                global.set('saving',true);
                $timeout(function(){
                    global.set('saving',false);
                },1500)
            },function(err){console.log(err)});
        };


    }

    itemCtrl.$inject=['ClosePeriod','$stateParams','global','$q','$state','exception']
    function itemCtrl(Items,$stateParams,global,$q,$state,exception){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.$state = $state;
        self.query = {};
        self.currency = global.get('store').val.mainCurrency



        activate()

        function activate() {

            $q.when()
                .then(function (result) {
                    return getItem($stateParams.id)
                })
                .catch(function(err){
                    err = err.data||err
                    exception.catcher('получение данных')(err)
                });


        }
        function getItem(id) {
            return self.Items.getItem(id)
            //console.log(id)
                .then(function(data) {
                    console.log(data)
                    data.date= moment(data.date).format('LLL')
                    self.currencyArr=[];
                    for(var c in data.debet){
                        if(self.currencyArr.indexOf(c)<0){
                            self.currencyArr.push(c)
                        }
                    }
                    for(var c in data.credit){
                        if(self.currencyArr.indexOf(c)<0){
                            self.currencyArr.push(c)
                        }
                    }
                    self.currencyArr.sort()
                    self.currencyWidth=100/self.currencyArr.length


                    /*data.date= moment(data.date).format('LLL')
                    data.debet=(data.debet).toFixed(2)
                    data.credit=(data.credit).toFixed(2)
                    data.data.forEach(function (account) {
                        account.debet=(account.debet).toFixed(2)
                        account.credit=(account.credit).toFixed(2)
                        account.va.forEach(function (va) {
                            if(self.virtualAccounts[va._id]){
                                va.name=self.virtualAccounts[va._id].name
                                va.debet=(va.debet).toFixed(2)
                                va.credit=(va.credit).toFixed(2)
                            }

                        })

                    })*/
                    self.item=data;
                } ).catch(function(err){
                    console.log(err)
                    exception.catcher('получение данных')(err)
                });
        }

    }

    angular.module('gmall.services')
        .service('ClosePeriod', service);
    service.$inject=['$resource','$uibModal','$q','exception'];
    function service($resource,$uibModal,$q,exception){
        var Items= $resource('/api/collections/ClosePeriod/:_id',{_id:'@_id'});
        return {
            getList:getList,
            getItem:getItem,
            save:Items.save,
            delete:Items.delete,
            query:Items.query,
            get:Items.get,
        }
        function getList(paginate,query){
            return Items.query({perPage:paginate.rows ,page:paginate.page,query:query,search:paginate.search} ).$promise
                .then(getListComplete)
                .catch(getListFailed);
            function getListComplete(response) {
                if(paginate.page==0 && !paginate.search){
                    if(response && response.length){
                        paginate.items=response.shift().index;
                    }else{
                        paginate.items=0;
                    }
                }
                return response;
            }

            function getListFailed(error) {
                console.log('XHR Failed for getNews.' + error);
                return $q.reject(error);
            }
        }
        function getItem(id){
            return Items.get({_id:id} ).$promise
                .then(getItemComplete)
                .catch(getItemFailed);
            function getItemComplete(response) {
                return response;
            }
            function getItemFailed(error) {
                return $q.reject(error);
            }
        }
    }
})()
