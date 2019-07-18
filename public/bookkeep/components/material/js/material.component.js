'use strict';
(function(){
    angular.module('gmall.directives')
        .directive('material',materialDirective)
        .directive('work',workDirective)
        .directive('works',worksDirective)
    function materialDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/material/material.html',
        }
    }
    function workDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: workCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/material/work.html',
        }
    }
    function worksDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: worksCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/material/works.html',
        }
    }
    itemCtrl.$inject=['Material','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','exception','$state','Producer']
    function itemCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,exception,$state,Producer){
        var self = this;
        self.Items=Items;
        self.global=global;
        self.item={}
        self.unitOfMeasure=global.get('unitOfMeasure').val
        self.currencyArr=global.get('store').val.currencyArr
        if(self.unitOfMeasure && self.unitOfMeasure.length){
            self.item.unitOfMeasure=self.unitOfMeasure[0]
        }
        if(global.get('store').val.subDomain=='autofan'){
            self.item.currency='EUR'
        }

        self.create     =create;
        self.addsku2    =addsku2;
        self.deleteSku2 =deleteSku2;
        self.deleteItem =deleteItem;
        self.clearItem  =clearItem;
        self.refreshData=refreshData;
        self.back       =back;

        function back() {
            if($state.current.name=='frame.warehouse.material'){
                $state.go('frame.warehouse')
            }else if($state.current.name=='frame.materials.material'){
                $state.go('frame.materials')

            }
        }

        function refreshData(searchStr) {
            var q= {search:searchStr}
            if(!searchStr){
                self.items=null
                return
            }
            Items.query(q,function (res) {
                self.materials=res.map(function (m) {
                    if(m.sku2 && m.sku2.length){
                        m.sku2=m.sku2[0]
                    }else{
                        m.sku2=''
                    }
                    return m
                });
            })
        }

        activate()
        // console.log(global.get('store').val)
        function activate() {
            $q.when()
                .then(function () {
                    return Producer.getList({page:0,rows:500},{actived:true})
                })
                .then(function (producers) {
                    self.producers =producers;
                    if($stateParams.id && $stateParams.id!='new'){
                        self.Items.getItem($stateParams.id).then(function (data) {
                            self.savedData=JSON.parse(JSON.stringify(data));
                            self.item=data;
                        })
                    }else{
                        console.log($stateParams)
                        if($stateParams.name){
                            self.item.name=$stateParams.name;

                        }
                        if($stateParams.sku&& $stateParams.sku!='undefined'){
                            self.item.sku=$stateParams.sku;

                        }
                        if($stateParams.sku2 && $stateParams.sku2!='undefined'){
                            self.item.sku2=[$stateParams.sku2];

                        }
                        if($stateParams.currency){
                            self.item.currency=$stateParams.currency;

                        }
                        if($stateParams.producer){
                            for(var i=0;i<self.producers.length;i++){
                                if(self.producers[i].name==$stateParams.producer){
                                    self.item.producer=self.producers[i]._id;
                                    break
                                }
                            }

                        }
                    }
                })


        }



        function create(form) {
            console.log(form)
            if(!form.$valid){return}
            if(self.item._id){
                if(self.savedData.name!=self.item.name){
                    saveField('name')
                }
                if(self.savedData.sku!=self.item.sku){
                    saveField('sku')
                }
                if((!self.savedData.sku2 && self.item.sku2) || self.savedData.sku2.length!=self.item.sku2.length || self.savedData.sku2[0]!=self.item.sku2[0]){
                    saveField('sku2')
                }
                if(self.savedData.currency!=self.item.currency && !self.savedData.qty){
                    saveField('currency')
                }
                if(self.savedData.unitOfMeasure=self.item.unitOfMeasure){
                    saveField('unitOfMeasure')
                }
                if(self.savedData.unitOfMeasure=self.item.unitOfMeasure){
                    saveField('producer')
                }
                if($state.current.name=='frame.warehouse.material'){
                    $state.go('frame.warehouse',{},{reload:true})
                }
            }else{
                $q.when()
                    .then(function(){
                        return self.Items.save(self.item).$promise
                    } )
                    .then(function(res){
                        self.item={}
                    })
                    .then(function(){
                        //$state.go('frame.accList.item',{id:self.newItem._id})
                        global.set('saving',true);
                        $timeout(function(){
                            global.set('saving',false);
                        },1500)
                        if($state.current.name=='frame.warehouse.material'){
                            $state.go('frame.warehouse',{},{reload:true})
                        }
                    })
                    .catch(function(err){
                        exception.catcher('создание материала')(err)
                    })
            }

        }
        function addsku2() {
            if(!self.sku2){return}
            if(!self.item.sku2){
                self.item.sku2=[]
            }
            self.item.sku2.unshift(self.sku2.substring(0,100))
            self.sku2=''
        }
        function deleteSku2(i) {
            self.item.sku2.splice(i,1)
        }
        function saveField(field,value){
            var o={_id:self.item._id};
            if(typeof value!='undefined'){
                o[field]=value
            }else{
                o[field]=self.item[field]
            }
            var query={update:field}
            self.Items.save(query,o,function () {
                global.set('saving',true)
                $timeout(function () {
                    global.set('saving',false);
                },1500)
            });
        };
        function deleteItem() {
            Confirm('Удалить?')
                .then(function () {
                    return self.Items.delete({_id:self.item._id}).$promise
                })
                .then(function () {
                    console.log('????')
                    $state.go('frame.warehouse',{},{reload:true})
                })
                .catch(function (err) {
                    console.log(err)
                    if(err && err.data){
                        err.data.message = 'Материал используется в документе ' + err.data.message.ed+' название '+err.data.message.name
                    }
                    exception.catcher('удаление материала')(err)
                })
        }
        function clearItem() {
            Confirm('Очистить данные??')
                .then(function () {
                    var o={_id:self.item._id,data:[],price:0,qty:0,priceForSale:0};

                    var query={update:'data price qty priceForSale'}
                    self.Items.save(query,o,function () {
                        global.set('saving',true)
                        $timeout(function () {
                            global.set('saving',false);
                        },1500)
                    });
                })
        }


    }
    workCtrl.$inject=['Work','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','exception','$state']
    function workCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,exception,$state){
        var self = this;
        self.Items=Items;
        self.global=global;
        self.item={}


        self.create=create;
        self.saveField=saveField;
        self.refreshData=refreshData;
        self.editWork=editWork;


        function refreshData(searchStr) {
            console.log(searchStr,self.item.name)
            if(self.item._id){
                saveField('name')
            }else{
                var q= {search:searchStr}
                if(!searchStr){
                    self.items=null
                    return
                }
                Items.query(q,function (res) {
                    self.works=res
                })
            }

        }
        function editWork(w) {
            console.log(w)
            self.item=w;
            self.works=null

        }


        activate()
        // console.log(global.get('store').val)
        function activate() {
            if($stateParams.id && $stateParams.id!='new'){
                self.Items.getItem($stateParams.id).then(function (data) {
                    self.savedData=JSON.parse(JSON.stringify(data));
                    self.item=data;
                })
            }

        }



        function create(form) {
            if(self.item._id){
                self.item={}
                self.works=null
                return
            }
            if(!form.$valid){return}
            if(!self.item.workingHour){
                return exception.catcher('создание работы')('задайте нормочас')
            }
            $q.when()
                .then(function(){
                    return self.Items.save(self.item).$promise
                } )
                .then(function(res){
                    self.item={}
                })
                .then(function(){
                    global.set('saving',true);
                    $timeout(function(){
                        global.set('saving',false);
                    },1500)
                })
                .catch(function(err){
                    exception.catcher('создание работы')(err)
                })
        }

        function saveField(field,value){
            if(!self.item._id){return}
            var o={_id:self.item._id};
            if(typeof value!='undefined'){
                o[field]=value
            }else{
                o[field]=self.item[field]
            }
            var query={update:field}
            self.Items.save(query,o,function () {
                global.set('saving',true)
                $timeout(function () {
                    global.set('saving',false);
                },1500)
            });
        };
        function deleteItem() {
            Confirm('Удалить?')
                .then(function () {
                    return self.Items.delete({_id:self.item._id}).$promise
                })
                .then(function () {

                })
                .catch(function (err) {
                    console.log(err)
                    if(err && err.data){
                        err.data.message = 'Материал используется в документе ' + err.data.message.ed+' название '+err.data.message.name
                    }
                    exception.catcher('удаление материала')(err)
                })
        }



    }

    worksCtrl.$inject=['$scope','Work','$state','global','$timeout','$anchorScroll','Confirm','$q','$uibModal','GlobalService','$http','exception','Producer'];
    function worksCtrl($scope,Items,$state,global,$timeout,$anchorScroll,Confirm,$q,$uibModal,GlobalService,$http,exception,Producer) {
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.$state = $state;
        self.Items = Items;
        self.moment = moment;
        self.query = {};
        self.paginate = {page: 0, rows: 100, totalItems: 0}

        self.where ='materials'
        self.unitOfMeasure=global.get('unitOfMeasure').val
        self.currencyArr=global.get('store').val.currencyArr
        //console.log(self.virtualAccount)

        self.getList = getList;
        $scope.getList=getList;

        self.searchItems = searchItems;
        self.setWhere=setWhere;

        self.refreshList=refreshList;
        self.saveField=saveField;

        function saveField(item,field) {
            console.log(item)
            if(!item._id){return}
            var o={_id:item._id};
            if(field=='sku2'){
                o['sku2']=[item.sku22]
            }else{
                o[field]=item[field]
            }

            o[field]=item[field]
            return $q.when()
                .then(function (sas) {
                    return Items.save({update:field},o ).$promise
                })
                .then(function () {
                    global.set('saving',true);
                    $timeout(function(){
                        global.set('saving',false);
                    },1500)
                })
                .catch(function (err) {
                    console.log(err)
                    exception.catcher('сохранение')(err)
                })
        };




        self.clearSearch=function () {
            console.log('dddd')
            self.searchStr=''
        }

        //*******************************************************
        activate();

        function activate() {
            Producer.getList({page:0,rows:500},{actived:true}).then(
                function (producers) {
                    //console.log(producers)
                    self.producers =producers
                }
            )

            return getList().then(function () {

            }).then(function () {
            });
        }

        function getList() {
            return Items.getList(self.paginate, self.query)
                .then(function (results) {
                    results.forEach(function (m) {
                        m.sku22 = (m.sku2 && m.sku2[0])?m.sku2[0]:''
                    })
                    self.items = results

                });
        }

        function searchItems(searchStr) {
            if (searchStr) {
                self.paginate.search=searchStr.substring(0, 50)
                //self.query = {search: searchStr.substring(0, 50)};
            }else{
                delete self.paginate.search
            }
            self.query = {};

            self.paginate.page = 0;
            return getList().then(function () {
                delete self.paginate.search
                console.log('Activated search list View');
            });
        }

        function filterItems(item) {
            if(self.producer){
                if(item.producer && item.producer.name){
                    if(item.producer.name.toLowerCase().indexOf(self.producer.toLowerCase())>-1){
                        return item;
                    }
                }
            }else{
                return item;
            }

        }

        function setWhere(data) {
            self.where=data;

        }

        function refreshList() {
            activate()
        }
    }


})()