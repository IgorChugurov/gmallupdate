'use strict';
(function(){
    angular.module('gmall.services')
        .service('GroupStuffs', serviceFoo);
    serviceFoo.$inject=['$resource','$uibModal','$q','global'];
    function serviceFoo($resource,$uibModal,$q,global){
        var Items= $resource('/api/collections/GroupStuffs/:_id',{_id:'@_id'});
        return {
            getList:getList,
            getItem:getItem,
            query:Items.query,
            get:Items.get,
            save:Items.save,
            delete:Items.delete,
            create:create,
            select:selectItem,
            search:search
        }
        function getList(paginate,query){
           if(!paginate){
               paginate={page:0}
           }
            var data ={perPage:paginate.rows ,page:paginate.page,query:query};
            if(global.get('crawler') && global.get('crawler').val){
                data.subDomain=global.get('store').val.subDomain;
            }
            return Items.query(data).$promise
                .then(getListComplete)
                //.catch(getListFailed);
            function getListComplete(response) {
                if(paginate.page==0){
                    if(response && response.length){
                        paginate.items=response.shift().index;
                    }else{
                        paginate.items=0;
                    }
                }
                //console.log(response)
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
                //.catch(getItemFailed);
            function getItemComplete(response) {
                if(response && response.stuffs && response.stuffs.length){
                    response.stuffs.forEach(function (s) {
                        if(s.gallery && s.gallery.length && s.gallery[0].img){
                            s.img=s.gallery[0].img;
                        }
                    })
                }
                return response;
            }
            function getItemFailed(error) {
                return $q.reject(error);
            }
        }
        function create(){
            return $q(function(resolve,reject){
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'components/CONTENT/groupStuffs/createItem.html',
                    controller: function($uibModalInstance){
                        var self=this;
                        self.name=''
                        self.ok=function(){
                            $uibModalInstance.close(self.name);
                        }
                        self.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    },
                    controllerAs:'$ctrl',
                });
                modalInstance.result.then(function (name) {
                    if(name){
                        resolve(name.substring(0,50))
                    }else{
                        reject()
                    }

                }, function (err) {
                    reject(err)
                });
            })

        }

        function search(search,setData){
            // setData - если ищем товар в админке для дальнейшего использования необходимо получить с сервера все данные
            var data ={search:search,setData:setData};
            return Items.query(data).$promise
                .then(getListComplete)
                .catch(getListFailed);
            function getListComplete(response) {
                //response.shift()

                return response;
            }

            function getListFailed(error) {
                console.log('XHR Failed for getNews.' + error);
                return $q.reject(error);
            }
        }
        function selectItem(){
            return $q(function(resolve,reject){
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'components/CONTENT/groupStuffs/selectItem.html',
                    controller: function(GroupStuffs,$uibModalInstance,$q){
                        var self=this;
                        self.stuffs=[];
                        self.name='';
                        var query;
                        var paginate={page:0,rows:30,items:0}
                        self.search = function(name){
                            if (name.length<3){return}
                            query={name:name}



                            GroupStuffs.search(name,true)
                                .then(function(res){
                                    self.items=res;
                                    //console.log(self.items)
                                })


                            /*News.getList(paginate,query).then(function(res){
                             self.items=res;
                             })*/
                        }
                        self.selectItem=function(item){
                            $uibModalInstance.close(item);
                        }
                        self.cancel = function () {
                            $uibModalInstance.dismiss('cancel');
                        };
                    },
                    controllerAs:'$ctrl',
                    size: 'lg',
                });

                modalInstance.result.then(function (stuff) {
                    resolve(stuff)
                },function(){
                    reject()
                });
            })

        }
    }
})()
