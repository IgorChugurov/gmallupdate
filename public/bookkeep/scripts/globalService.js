'use strict';
(function(){
    angular.module('gmall.services')
        .service('GlobalService', GlobalService)

    GlobalService.$inject=['$resource','$uibModal','$q'];
    function GlobalService($resource,$uibModal,$q){
        return {
            getDocs:getDocs
        }
        function getDocs(type,id,virtualAccount) {
            var options={
                animation: true,
                restrict:"E",
                templateUrl: 'bookkeep/components/warehouse/getDetail.html',
                resolve :{
                    id:function () {
                        return id
                    },
                    type:function () {
                        return type
                    },
                    virtualAccount:function () {
                        return virtualAccount
                    }
                },
                controller: function($uibModalInstance,$state,$q,$http,global,id,type,virtualAccount){
                    var self=this;
                    self.items=[]
                    self.fieldName=(type==='Material')?'Количество':'Сумма';
                    self.virtualAccounts=global.get('virtualAccounts').val;
                    if(self.virtualAccounts && self.virtualAccounts.length){
                        if(!virtualAccount){
                            self.virtualAccount=self.virtualAccounts[0]._id;
                        }else{
                            var d = self.virtualAccounts.getOFA('_id',virtualAccount)
                            if(d){
                                self.virtualAccount=d._id
                            }

                        }

                    }
                    self.ok=ok;
                    self.goToDoc=goToDoc;
                    self.changeVirtualAccount=changeVirtualAccount;

                    activate()

                    function activate() {
                        $q.when()
                            .then(function () {
                                var url = '/api/bookkeep/getDocs/'+type+'/'+id+'?virtualAccount='+self.virtualAccount;
                                return $http.get(url)
                            })
                            .then(function (res) {
                                //console.log(res)
                                if(res && res.data){
                                    res.data.forEach(function (d) {
                                        d.date=moment(d.date).format('LLL')
                                        if(d.ed=='mo'){
                                            d.ed = reestrEDWithNAme[d.ed][d.type].name
                                        }else{
                                            d.ed = (reestrEDWithNAme[d.ed])?reestrEDWithNAme[d.ed].name:d.ed
                                        }

                                    })
                                    self.items=res.data;
                                }
                            })

                    }

                    function goToDoc(doc) {
                        $uibModalInstance.close();
                        var url = $state.href(doc.sref,{id:doc._id});
                        window.open(url,'_blank');
                    }

                    self.cancel = function () {
                        $uibModalInstance.dismiss();
                    };
                    function ok(){
                        $uibModalInstance.close();
                    }
                    function changeVirtualAccount() {
                        activate()
                    }
                },
                controllerAs:'$ctrl',
            }
            $uibModal.open(options)
        }
    }
})()

