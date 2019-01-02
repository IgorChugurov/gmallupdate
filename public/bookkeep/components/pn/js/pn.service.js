'use strict';
(function(){
    angular.module('gmall.services')
        .service('Pn', pnService);
    pnService.$inject=['$resource','$uibModal','$q','$http'];
    function pnService($resource,$uibModal,$q,$http){
        var Items= $resource('/api/collections/Pn/:_id',{_id:'@_id'});
        return {
            getList:getList,
            getItem:getItem,
            save:Items.save,
            delete:Items.delete,
            query:Items.query,
            get:Items.get,
            activePN:activePN
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

        function activePN(pn) {
            console.log(pn)
            var status = (!pn.actived)?'hold':'cancel';
            //status='hold'
            var url = '/api/bookkeep/pn/'+status+'/'+pn._id;
            return $http.get(url)
        }
    }
})()
