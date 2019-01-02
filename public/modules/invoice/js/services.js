'use strict';
angular.module('gmall.services', [])
.factory('socket', function (socketFactory) {
    return socketFactory();
})
    .factory('$addNewWork', addNewWork)
    .factory('$addNewSpark', addNewSpark);

addNewSpark.$inject = ['$q','$uibModal'];
addNewWork.$inject = ['$q','$uibModal'];

function addNewSpark($q,$uibModal) {
    return service;
    function service(item){
        return $q(function(resolve,reject){
            var options={
                animation: true,
                templateUrl : 'invoice/components/invoice/newSpark.html',
                controller: function($uibModalInstance,exception,$resource,Confirm,item){
                    var self=this;
                    var Producer = $resource('/api/collections/Producer/:id',{id:'@_id',store:'5a3cc10e1626aa0566f7ea87'});
                    //var Producer = $resource('http://46.101.131.133:7700/api/collections/Producer/:id',{id:'@_id',store:'5a3cc10e1626aa0566f7ea87'});
                    //var Producer = $resource('http://139.162.161.36:7700/api/collections/Producer/:id',{id:'@_id',store:'5a3cc10e1626aa0566f7ea87'});
                    self.item=item;
                    self.producers=[];
                    self.unitOfMeasure=['шт','л','кг'];
                    self.currencyArr=['EUR','UAH','USD'];

                    self.tagTransform=tagTransform;
                    self.refreshProducer=refreshProducer;
                    self.create=function(form){
                        //if(!form.$valid){return}
                        if(!self.item.name){
                            return exception.catcher('ошибка')('выберите наименование');
                        }
                        if(!self.item.producer){
                            return exception.catcher('ошибка')('выберите производителя');
                        }
                        if(!self.item.unitOfMeasure){
                            return exception.catcher('ошибка')('выберите еденицу измерения');
                        }
                        if(!self.item.currency){
                            return exception.catcher('ошибка')('выберите валюту учета');
                        }
                        self.item.name = self.item.name.substring(0,100);
                        if(self.item.sku2){
                            self.item.sku2 = self.item.sku2.substring(0,100);
                        }
                        //console.log(self.item)

                        $uibModalInstance.close(self.item);
                    };
                    self.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                    function refreshProducer(searchStr) {
                        if(!searchStr){return;};
                        $q.when()
                            .then(function(){

                                var q= {search:searchStr,lang:'ru'};
                                return Producer.query(q).$promise;
                            })
                            .then(function (res) {
                                self.producers=res;
                            })
                            .catch(function (err) {
                                console.log(err);
                            });
                    };
                    function tagTransform(name) {
                        //console.log(name);
                        var item = {
                            name: name,
                            _id:'new'
                        };
                        Confirm('создать производителя - '+name+'?')
                            .then(function () {
                                return Producer.save({name:name}).$promise;
                            })
                            .then(function (res) {
                                console.log(res);
                                console.log(self.item.producer);
                            })
                            .catch(function (err) {
                                console.log(err);
                                self.item.producer=null;
                            });
                        return item;
                    };
                },
                controllerAs:'$ctrl',
                size: 'sm',
                resolve:{
                    item: function(){return item;},
                }
            };
            $uibModal.open(options).result.then(function () {resolve(item);},function () {reject();});
        });


    }
}

function addNewWork($q,$uibModal) {
    return service;
    function service(item){
        return $q(function(resolve,reject){
            var options={
                animation: true,
                templateUrl : 'invoice/components/invoice/newWork.html',
                controller: function($uibModalInstance,exception,item){
                    var self=this;
                    self.item=item;
                    self.ok=function(){
                        $uibModalInstance.close(self.item);
                    };
                    self.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                controllerAs:'$ctrl',
                size: 'sm',
                resolve:{
                    item: function(){return item;},
                }
            };
            $uibModal.open(options).result.then(function () {resolve(item);},function () {reject();});
        });


    }
}

