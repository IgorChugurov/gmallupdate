'use strict';
(function(){
    angular.module('gmall.services')
        .service('Material', accountService)
        .service('Work', workService);
    accountService.$inject=['$resource','$uibModal','$q','$http'];
    function accountService($resource,$uibModal,$q,$http){
        var Items= $resource('/api/collections/Material/:_id',{_id:'@_id'});
        return {
            getList:getList,
            getItem:getItem,
            save:Items.save,
            delete:Items.delete,
            query:Items.query,
            get:Items.get,
            create:create,
            selectItem:selectItem,

        }
        function getList(paginate,query){
            return Items.query({perPage:paginate.rows ,page:paginate.page,query:query,search:paginate.search} ).$promise
                .then(getListComplete)
                .catch(getListFailed);
            function getListComplete(response) {
                //console.log(JSON.parse(JSON.stringify(response)))
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
        function create(sku){
            return $q(function(resolve,reject){
                var options={
                    animation: true,
                    restrict:"E",
                    templateUrl: 'bookkeep/components/material/createItem.html',
                    controller: function($uibModalInstance,global,Material,exception,Producer,sku){
                        console.log(sku)
                        var self=this;
                        self.global=global;
                        self.item={sku:sku}
                        self.unitOfMeasure=global.get('unitOfMeasure').val
                        self.currencyArr=global.get('store').val.currencyArr
                        if(self.unitOfMeasure && self.unitOfMeasure.length){
                            self.item.unitOfMeasure=self.unitOfMeasure[0]
                        }
                        activate()
                        // console.log(global.get('store').val)
                        function activate() {
                            $q.when()
                                .then(function () {
                                    return Producer.getList({page: 0, rows: 500}, {actived: true})
                                })
                                .then(function (producers) {
                                    self.producers = producers;
                                })
                        }
                        //self.refreshData=refreshData;

                        self.ok=function(form){
                            console.log(form)
                            if(!form.$valid){return}
                            if(!self.item.producer){
                                return exception.catcher('создание материала')('установите производителя')
                            }
                            if(!self.item.currency){
                                return exception.catcher('создание материала')('установите валюту учета')
                            }
                            if(!self.item.unitOfMeasure){
                                return exception.catcher('создание материала')('установите еденицы измерения')
                            }
                            $q.when()
                                .then(function(){
                                    if(self.item.sku2){
                                        self.item.sku2=[self.item.sku2]
                                    }
                                    return Material.save(self.item).$promise
                                } )
                                .then(function(res){
                                    self.item._id=res.id;
                                    if(self.item.sku2 && self.item.sku2.length){
                                        self.item.sku2=self.item.sku2[0]
                                    }
                                    for(var i=0;i<self.producers.length;i++){
                                        if(self.producers[i]._id==self.item.producer){
                                            self.item.producer=self.producers[i];
                                            break;
                                        }
                                    }
                                    $uibModalInstance.close(self.item);
                                })
                                .catch(function(err){
                                    exception.catcher('создание материала')(err)
                                })








                        }
                        self.cancel = function () {
                            $uibModalInstance.dismiss();
                        };


                    },
                    controllerAs:'$ctrl',
                    resolve : {
                        sku: function () {
                            return sku;
                        }
                    }
                }
                $uibModal.open(options).result.then(function (item) {
                    resolve(item)
                }, function (err) {
                    reject(err)
                });
            })

        }
        function selectItem(){
            return $q(function(resolve,reject){
                var options={
                    animation: true,
                    templateUrl: 'account/components/account/selectItem.html',
                    controller: selectItemCtrl,
                    controllerAs:'$ctrl',
                }
                var modalInstance = $uibModal.open(options);
                modalInstance.result.then(function (selectedFilterTag) {
                    resolve(selectedFilterTag)
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                    reject()
                });
            })
        }
        selectItemCtrl.$inject=['Additional','$uibModalInstance','$q'];
        function selectItemCtrl(Additional,$uibModalInstance,$q){
            var self=this;
            $q.when()
                .then(function(){
                    return Additional.getList({rows:100,page:0});
                } )
                .then(function(items){
                    self.items=items;
                })
            self.cancel = function () {
                $uibModalInstance.dismiss();
            };
            self.ok = function (item) {
                $uibModalInstance.close(item);
            };
        }



    }
    workService.$inject=['$resource','$uibModal','$q','$http'];
    function workService($resource,$uibModal,$q,$http){
        var Items= $resource('/api/collections/Work/:_id',{_id:'@_id'});
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
