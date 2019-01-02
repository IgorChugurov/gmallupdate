'use strict';
(function(){
    angular.module('gmall.directives')
        .directive('contragents',itemsDirective)
        .directive('contragent',itemDirective)

    function itemsDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemsCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/contragent/items.html',
        }
    }
    function itemDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/contragent/item.html',
        }
    }
    itemsCtrl.$inject=['Contragent','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','$state','GlobalService','$http','exception']
    function itemsCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,$state,GlobalService,$http,exception){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.$state = $state;
        self.query = {};
        self.paginate = {page: 0, rows: 50, totalItems: 0}
        var currency = global.get('store').val.currency
        var currencyArr = global.get('store').val.currencyArr
        self.virtualAccounts=global.get('virtualAccounts').val.filter(function (a) {
            return a.actived
        }).reduce(function (o,item) {
            o[item._id]=item
            return o;
        },{});

        self.getList = getList;
        self.searchItems = searchItem;
        self.createItem=createItem;
        self.saveField = saveField;
        self.deleteItem=deleteItem;
        self.getDetail=getDetail;
        self.makeBalances=makeBalances;
        function getDetail(id,virtualAccount) {
            console.log(id)
            GlobalService.getDocs('Contragent',id,virtualAccount)
        }

        function createItem() {
            $state.go('frame.Contragent.item',{id:'new'})
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
                        //console.log(d.data)
                        d.debet=0;
                        d.credit=0;
                        d.debetStr=''
                        d.creditStr='';
                        d.data= d.data.map(function (p) {
                            p.virtualAccount = self.virtualAccounts[p.virtualAccount]
                            //console.log(p)
                            var arr =[]
                            currencyArr.forEach(function (key) {
                                if(p[key] && p[key].debet){
                                    d.debet+=p[key].debet/currency[key][0]
                                }
                                if(p[key] && p[key].credit){
                                    d.credit+=p[key].credit/currency[key][0]
                                }
                                if(p[key] && (p[key].debet || p[key].credit)){
                                    var o ={
                                        virtualAccount:(p.virtualAccount)?p.virtualAccount.name:'??????',
                                        virtualAccount_id:p.virtualAccount._id,
                                        currency:key,
                                        debet:(p[key].debet).toFixed(2),
                                        credit:(p[key].credit).toFixed(2),
                                    }
                                    arr.push(o)
                                }
                            })
                            return (arr.length)?arr:null;
                        }).filter(function (d) {
                            return d
                        })
                        d.debet=(d.debet).toFixed(2)
                        d.credit=(d.credit).toFixed(2)
                        //console.log(d.debet,d.credit)

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
                console.log('Activated  list View');
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
        function deleteItem(item) {
            //console.log(item)

            Confirm('Удалить?')
                .then(function(){
                    if(item.actived){
                        throw 'объект задействован'
                    }
                    return Items.delete({_id:item._id}).$promise
                })
                .then(function(){
                    getList()
                })
                .catch(function(err){
                    console.log(err)
                    exception.catcher('Удаление')(err)
                })

        }
        function makeBalances() {
            $q.when()
                .then(function () {
                    var url = '/api/bookkeep/asa/makeBalances/Contragent'
                    return $http.get(url)
                })
                .then(function () {
                    exception.showToaster('info','формирование остатков','обновлено')
                    return getList()


                })
                .catch(function(err){
                    err = err.data||err
                    exception.catcher('формирование остатков')(err)
                });
        }


    }
    itemCtrl.$inject=['Contragent','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','exception','$state']
    function itemCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,exception,$state){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.item={}

        self.createItem=createItem;
        self.saveField=saveField;
        self.refreshData=refreshData;
        function refreshData(searchStr) {
            var q= {search:searchStr}
            Items.query(q,function (res) {
                self.items=res
            })
        }


        if($stateParams.id!='new'){activate()}

        function activate() {
            return getItem($stateParams.id).then(function() {
            } ).catch(function(err){
                err = err.data||err
                exception.catcher('получение поставщика')(err)
            });
        }
        function getItem(id) {
            //console.log(id)
            return self.Items.getItem(id)
            //console.log(id)
                .then(function(data) {
                    console.log(data)
                    self.item=data;
                } ).catch(function(err){
                    console.log(err)
                    return $q.reject(err)
                });
        }

        function createItem() {
            if(self.item._id || !self.item.name){return}
            $q.when()
                .then(function () {
                    return Items.save(self.item).$promise
                })
                .then(function () {
                    $state.go('frame.Contragent', undefined, { reload: true })
                })
        }
        function saveField(field){
            if(!self.item._id){return;}
            var o={_id:self.item._id};
            o[field]=self.item[field]
            return self.Items.save({update:field},o ).$promise.then(function(){
                global.set('saving',true);
                $timeout(function(){
                    global.set('saving',false);
                },1500)
            },function(err){console.log(err)});
        };
    }



    angular.module('gmall.services')
        .service('Contragent', itemsService)
    itemsService.$inject=['$resource','$uibModal','$q'];
    function itemsService($resource,$uibModal,$q){
        var Items= $resource('/api/collections/Contragent/:_id',{_id:'@_id'});
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
