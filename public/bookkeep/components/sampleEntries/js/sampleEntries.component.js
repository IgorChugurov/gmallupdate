'use strict';
(function(){
    angular.module('gmall.directives')
        .directive('sampleEntries',itemsDirective)
        .directive('sampleEntriesItem',itemDirective)

    function itemsDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemsCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/sampleEntries/sampleEntries.html',
        }
    }
    function itemDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/sampleEntries/sampleEntriesItem.html',
        }
    }
    itemsCtrl.$inject=['SampleEntries','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','$state']
    function itemsCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,$state){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.$state = $state;
        self.query = {};
        self.paginate = {page: 0, rows: 20, totalItems: 0}

        self.getList = getList;
        self.saveField = saveField;


        activate();

        function activate() {
            return getList().then(function (data) {
            }).then(function () {
            });
        }

        function getList() {
            return Items.getList(self.paginate, self.query)
                .then(function (data) {
                    /*console.log(data)
                    console.log(reestrED)*/
                    if(reestrED.length && reestrED.length!=data.length){
                        var newList=[];
                        reestrED.forEach(function (ed) {
                            var is=false;
                            data.forEach(function (item) {
                                if(item.type==ed){is=true}
                            })
                            if(!is){
                                newList.push(ed)
                            }
                        })
                        //console.log(newList)
                        newList = newList.map(function (ed) {
                            var item ={name:ed,type:ed}
                            return Items.save(item).$promise
                        })
                        return $q.all(newList)
                    }

                    self.items = data;
                    //console.log(self.items)
                })
                .then(function (data) {
                    if(data){
                        getList()
                    }
                })
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


    itemCtrl.$inject=['SampleEntries','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','exception','$state','AccountList']
    function itemCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,exception,$state,AccountList){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.item={}
        self.sums=[{_id:'sum',name:'сумма документа'},{_id:'diff',name:'разница сумм'}]


        self.saveField=saveField;
        self.addEntry=addEntry;
        self.deleteEntry=deleteEntry;
        self.getSumName=getSumName;

        if($stateParams.id!='new'){activate()}

        function activate() {
            $q.when()
                .then(function () {
                    return AccountList.getList({rows:1000,page:0},{root:null})
                })
                .then(function (result) {
                    //console.log(result)
                    self.accaunts=result;
                    return getItem($stateParams.id)
                })
                .then(function() {} )
                .catch(function(err){
                    err = err.data||err
                    exception.catcher('получение шаблона')(err)
                });
        }
        function getItem(id) {
            //console.log(id)
            return self.Items.getItem(id)
            //console.log(id)
                .then(function(data) {
                    //console.log(data)
                    if(data.entries && data.entries.length){
                        data.entries.forEach(function (e) {
                            var n = self.accaunts.getOFA('_id',e.debet)
                            if(n){
                                e.debet=n
                            }
                            n = self.accaunts.getOFA('_id',e.credit)
                            if(n){
                                e.credit=n
                            }
                        })
                    }
                    self.item=data;
                } ).catch(function(err){
                    console.log(err)
                    return $q.reject(err)
                });
        }


        function saveField(field){
            var o={_id:self.item._id};
            if(field=='entries'){
                o[field]=self.item[field].filter(function (e) {
                    return e.debet && e.debet._id && e.credit && e.credit._id && e.sum
                }).map(function (e) {
                    return {debet:e.debet._id,credit:e.credit._id,sum:e.sum}
                })
            }else{
                o[field]=self.item[field]
            }

            return self.Items.save({update:field},o ).$promise.then(function(){
                global.set('saving',true);
                $timeout(function(){
                    global.set('saving',false);
                },1500)
            },function(err){console.log(err)});
        };
        function addEntry() {
            console.log(self.debet,self.credit,self.sum)
            if(!self.credit || !self.debet || !self.sum){
                return
            }
            self.item.entries.push({credit:self.credit,debet:self.debet,sum:self.sum})
            saveField('entries')
            self.debet=null;
            self.credit=null;
            self.sum=null;
        }
        function deleteEntry(i) {
            self.item.entries.splice(i,1)
            saveField('entries')
        }
        function getSumName(sum) {
            var s = self.sums.getOFA('_id',sum)
            if(s){return s.name}else{return '???'}
        }
    }




    angular.module('gmall.services')
        .service('SampleEntries', sampleEntriesService);
    sampleEntriesService.$inject=['$resource','$uibModal','$q'];
    function sampleEntriesService($resource,$uibModal,$q){
        var Items= $resource('/api/collections/SampleEntries/:_id',{_id:'@_id'});
        return {
            getList:getList,
            getItem:getItem,
            save:Items.save,
            delete:Items.delete,
            query:Items.query,
            get:Items.get,
        }
        function getList(paginate,query){
            return Items.query({perPage:paginate.rows ,page:paginate.page,query:query} ).$promise
                .then(getListComplete)
                .catch(getListFailed);
            function getListComplete(response) {
                if(paginate.page==0){
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
