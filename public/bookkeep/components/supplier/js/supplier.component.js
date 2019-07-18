'use strict';
(function(){
    angular.module('gmall.directives')
        .directive('suppliers',suppliersDirective)
        .directive('supplier',supplierDirective)
        .directive('agentStockadjustments',stockAdjustments)
        .directive('agentStockadjustmentsItem',stockAdjustment)

    function suppliersDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemsCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/supplier/suppliers.html',
        }
    }
    function supplierDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/supplier/supplier.html',
        }
    }
    function stockAdjustments(){
        return {
            rectrict:'E',
            scope: {
                type:'@'
            },
            bindToController: true,
            controller: stockAdjustmentsCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/supplier/stockAdjustments.html',
        }
    };
    function stockAdjustment(){
        return {
            rectrict:'E',
            scope: {
                type:'@'
            },
            bindToController: true,
            controller: stockAdjustmentCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/supplier/stockAdjustment.html',
        }
    };
    itemsCtrl.$inject=['Supplier','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','$state','GlobalService','$http','exception']
    function itemsCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,$state,GlobalService,$http,exception){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.$state = $state;
        self.query = {};
        self.mainCurrency = global.get('store').val.mainCurrency

        self.paginate = {page: 0, rows: 20, items: 0}
        var currency = global.get('store').val.currency;
        var currencyArr = global.get('store').val.currencyArr;
        //console.log(currency)
        self.virtualAccounts=global.get('virtualAccounts').val.filter(function (a) {
            return a.actived
        }).reduce(function (o,item) {
            o[item._id]=item
            return o;
        },{});

        self.getList = getList;
        $scope.getList=getList;
        self.searchItems = searchItem;
        self.createItem=createItem;
        self.saveField = saveField;
        self.deleteItem=deleteItem;
        self.getDetail=getDetail;
        self.makeBalances=makeBalances;
        function getDetail(id,virtualAccount) {
            GlobalService.getDocs('Supplier',id,virtualAccount)

        }

        function createItem() {
            //console.log('kdkd')
            $state.go('frame.Supplier.item',{id:'new'})
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
                                /*if(p[key] && (p[key].debet || p[key].credit)){
                                    var o ={
                                        virtualAccount:(p.virtualAccount)?p.virtualAccount.name:'??????',
                                        virtualAccount_id:p.virtualAccount._id,
                                        currency:key,
                                        debet:(p[key].debet).toFixed(2),
                                        credit:(p[key].credit).toFixed(2),
                                    }
                                    arr.push(o)
                                }*/
                                if(!p[key]){
                                    p[key]={
                                        debet:0,
                                        credit:0
                                    }
                                }
                                var o ={
                                    virtualAccount:(p.virtualAccount)?p.virtualAccount.name:'??????',
                                    virtualAccount_id:p.virtualAccount._id,
                                    currency:key,
                                    debet:(p[key].debet).toFixed(2),
                                    credit:(p[key].credit).toFixed(2),
                                }
                                arr.push(o)
                            })
                            return (arr.length)?arr:null;
                        }).filter(function (d) {
                            return d
                        })
                        //console.log(d.data)
                        if(d.data && typeof d.data =='object'){
                            for(var key in d.data){
                                if(currency[key] && currency[key][0]){
                                   if(d.data[key].debet){
                                       d.debet+=Number((d.data[key].debet/currency[key][0]).toFixed(2))
                                       if(d.debetStr){d.debetStr+='\n'}
                                       d.debetStr+=key+'-'+(d.data[key].debet).toFixed(2)
                                   }
                                   if(d.data[key].credit){
                                       d.credit+=Number((d.data[key].credit/currency[key][0]).toFixed(2))
                                       if(d.creditStr){d.creditStr+='\n'}
                                       d.creditStr+=key+'-'+(d.data[key].credit).toFixed(2)
                                   }
                                }
                            }
                        }
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
                    var url = '/api/bookkeep/asa/makeBalances/Supplier'
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
    itemCtrl.$inject=['Supplier','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','exception','$state']
    function itemCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,exception,$state){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.item={}

        self.createItem=createItem;
        self.saveField=saveField;
        self.clearItem=clearItem;
        self.refreshData=refreshData;
        function refreshData(searchStr) {
            var q= {search:searchStr}
            if(!searchStr){
                self.items=null
                return
            }
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
            if(self.item._id){return}
            $q.when()
                .then(function () {
                    return Items.save(self.item).$promise
                })
                .then(function () {
                    $state.go('frame.Supplier', undefined, { reload: true })
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
        function clearItem(item) {
            //console.log(item)

            Confirm('Очистить?')
                .then(function(){
                    self.item.data=[];
                    return saveField('data')
                })
                .then(function(){
                    $scope.$parent.getList()
                })
                .catch(function(err){
                    console.log(err)
                    exception.catcher('Очистка')(err)
                })

        }
    }



    stockAdjustmentsCtrl.$inject=['$scope','AgetnStockAdjustment','$state','global','$timeout','$anchorScroll','Confirm','$q','exception','$attrs'];
    function stockAdjustmentsCtrl($scope,Items,$state,global,$timeout,$anchorScroll,Confirm,$q,exception,$attrs) {
        var self = this;
        self.type=$attrs.type
        var typeName= typeOfContrAgents.getOFA('type',self.type)
        self.typeName=(typeName)?typeName.name:'Деньги';
        self.nameModel =(modelsForBD && modelsForBD[$attrs.type])?modelsForBD[$attrs.type]:''
        self.currentASAState='frame.'+self.type+'.stockadjustments'
        self.currentListState='frame.'+self.type;

        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.$state = $state;
        self.query = {type:self.type};
        self.paginate = {page: 0, rows: 50, items: 0}

        self.getList = getList;
        self.searchItems = searchItem;
        self.createItem=createItem;
        self.deleteItem=deleteItem;
        $scope.getList=getList;
        self.goToEdit=goToEdit;
        self.back=back;

        function back() {
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

        //$scope.getParentList=$scope.$parent.getList
        //console.log($scope.getParentList)

        function goToEdit(item) {
            var sref='frame.'+self.type+'.stockadjustments.item';
            $state.go(sref,{id:item._id})
        }

        var delay;
        function createItem() {
            if(delay){return}
            delay=true
            $q.when()
                .then(function () {
                    return Items.createItem()
                })
                .then(function (va) {
                    var date = new Date();
                    date.setHours(0,0,0,0);
                    self.item={name:'Инвентаризация '+self.nameModel+' '+va.name+' - ',num:1,type:self.type,virtualAccount:va._id,date:date}
                    return Items.save(self.item).$promise
                })
                .then(function (res) {
                    console.log(res)
                    delay=false;
                    goToEdit({_id:res.id})
                })
                /*.then(function () {
                    return Items.createItem()
                })
                .then(function (res) {
                    delay=false;
                    $state.go('frame.warehouse.stockadjustments.item',{id:res._id})
                })*/
                .then(function (res) {
                    getList()
                })
                .catch(function(err){
                    delay=false;
                    exception.catcher('Создание инвентаризации')(err)
                })

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
                        /*if(!d.diff){d.diff={};d.diff.credit='0.00';d.diff.debet='0.00'}else{
                            d.diff.debet=(d.diff.debet).toFixed(2)
                            d.diff.credit=(d.diff.credit).toFixed(2)
                        }*/
                    })
                    self.items = data;
                    //console.log(self.items)
                });
        }


        function searchItem(searchStr) {
            if (searchStr) {
                self.paginate.search = earchStr.substring(0, 50)
            } else {

            }
            self.query = {};

            self.paginate.page = 0;
            return getList().then(function () {
                delete self.paginate.search
                console.log('Activated sa list View');
            });
        }
        function deleteItem(item) {
            //console.log(item)

            Confirm('Удалить?')
                .then(function(){
                    if(item.actived){
                        throw 'Инвентаризация проведена'
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

    }


    stockAdjustmentCtrl.$inject=['$scope','AgetnStockAdjustment','$stateParams','global','$q','$uibModal','$timeout','Confirm','exception','$state','Supplier','Customer','Worker','Founder','Contragent','Money','$attrs','$window','$http']
    function stockAdjustmentCtrl($scope,Items,$stateParams,global,$q,$uibModal,$timeout,Confirm,exception,$state,Supplier,Customer,Worker,Founder,Contragent,Money,$attrs,$window,$http){
        var self = this;
        self.type=$attrs.type;
        var typeName= typeOfContrAgents.getOFA('type',self.type)
        self.typeName=(typeName)?typeName.name:'Деньги';
        var Models={
            Supplier:Supplier,
            Customer:Customer,
            Worker:Worker,
            Founder:Founder,
            ContragentL:Contragent,
            Money:Money
        }
        var Agent=Models[self.type]
        if(self.type=='Money'){
            self.agenName='Денежные средства'
        }else{
            self.agenName=typeOfContrAgents.getOFA('type',self.type).name
        }

        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        var date = new Date();
        date.setHours(0,0,0,0);
        self.item={date:date,materials:[{item:null,qty:0,price:0}]}
        self.currencyArr=global.get('store').val.currencyArr;
        self.currency = global.get('store').val.mainCurrency;

        self.virtualAccounts=global.get('virtualAccounts').val.reduce(function (o,item) {
            o[item._id]=item
            return o;
        },{});


        $scope.getParentList=$scope.$parent.getList
        $scope.dateOptions = {
            startingDay: 1
        };


        self.saveField=saveField;
        //self.deleteItem=deleteItem;
        self.getQty=getQty;
        self.getSum=getSum;
        self.editData=editData;
        self.activeSA=activeSA;
        self.getDiff=getDiff;
        self.back=back;
        self.makeBalances=makeBalances;


        function back() {
            switch ($attrs.type) {
                case 'Supplier': self.backLink='frame.Supplier.stockadjustments';break;
                case 'Worker':self.backLink='frame.Worker.stockadjustments';break;
                case 'Founder':self.backLink='frame.Founder.stockadjustments';break;
                case 'Contragent':self.backLink='frame.Contragent.stockadjustments';break;
                case 'Customer':self.backLink='frame.Customer.stockadjustments';break;
                case 'Money':self.backLink='frame.Money.stockadjustments';break;
            }
            $state.go(self.backLink, undefined)
        }


        activate()

        function activate() {
            $q.when()
                .then(function () {

                    //return Agent.getList({rows:1000,page:0,totalItems: 0},{})

                })
                .then(function (agents) {
                   /* self.agents=agents.reduce(function (o,item) {
                        o[item._id]=item
                       return o
                    },{})*/
                    if($stateParams.id!='new'){
                        return getItem($stateParams.id)
                    }
                })
                .catch(function(err){
                    err = err.data||err
                    exception.catcher('получение инвентаризации')(err)
                });


        }
        function getItem(id) {
            return self.Items.getItem(id)
            //console.log(id)
                .then(function(data) {
                    //console.log(data)
                    data.date= new Date(data.date)
                    data.items.forEach(function (d) {
                        //d.item=self.agents[d.item]
                        //console.log(d)
                    })
                   /* if(typeof data.diff=='undefined'){
                        data.diff=0;
                    }*/
                    self.item=data;
                    //self.item.actived=true;
                } ).catch(function(err){
                    console.log(err)
                    return $q.reject(err)
                });
        }



        function saveField(field,value){
            if(!self.item._id){return}
            var o={_id:self.item._id};
            if(field=='items'){
                o[field]=self.item[field].filter(function (m) {
                    return m.item && m.item._id
                }).map(function (m) {
                    console.log(m)
                    return {item:m.item._id,data:m.data}
                })
            }else{
                if(value){
                    o[field]=value
                }else{
                    o[field]=self.item[field]
                }

            }
            return $q.when()
                .then(function () {
                    if(field=='date'){
                        var d = new Date(self.item[field]);
                        d.setHours(0,0,0,0);
                        o[field]=d;
                        var query = {actived:true,date:{$gt:d},virtualAccount:self.item.virtualAccount,type:self.item.type}
                        return self.Items.getList({page:0,rows:1},query)
                    }

                })
                .then(function (asas) {
                    if(asas && asas.length){
                        throw 'есть проведенная инвентаризация с более позденей датой. Дата не изменена'
                    }
                    return self.Items.save({update:field},o ).$promise
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

        var delay;
        function activeSA() {
            if(delay || !self.item.items.length){return}
            self.item.actived=!self.item.actived;
            /*if(self.item.actived){
                if(!self.item.materials.length || self.item.materials.some(function(m){return !m.item || (m.qty && !Number(m.sum)) && (m.newQty && !Number(m.newSum)) })){
                    throw 'недопустимые значения';
                }
            }*/
            return $q.when()
                .then(function () {
                    return Items.activeSA(self.item)
                })
                .then(function (res) {
                    console.log(res)
                    if(res && res.data && res.data.diff){
                        self.item.diff=res.data.diff
                    }
                    //saveField('actived')
                    $scope.$parent.getList()



                })
                .catch(function (err) {
                    self.item.actived=!self.item.actived;
                    console.log(err)
                    exception.catcher('проведение инвентаризации')(err)
                })


        }
        function getDiff() {
            return $q.when()
                .then(function () {
                    return self.Items.getDiff(self.item)
                })
                .then(function (res) {
                    console.log(res)
                    if(res && res.data){
                        self.item.diff=res.data
                    }

                })
                .catch(function(err){
                    err = err.data||err
                    exception.catcher('расчет разницы')(err)
                });
        }


        function getQty(data,field) {
            //console.log(data)
            if(!data || !data.length){return 0}
            return data.reduce(function (o,item) {
                return o+=item[field]
            },0)
        }
        function getSum(data,field) {
            var qty=(field=='price')?'qty':'newQty';

            //console.log(data)
            if(!data || !data.length){return 0}
            var sum = data.reduce(function (o,item) {
                return o+=item[field]*item[qty]
            },0)
            return (sum).toFixed(2)
        }


        function editData(idx) {
            //console.log(self.item.items[idx])
            return $q(function(resolve,reject){
                var options={
                    animation: true,
                    restrict:"E",
                    resolve:{
                        item:function () {
                            return self.item.items[idx]
                        },
                    },
                    templateUrl: 'bookkeep/components/supplier/editSAData.html',
                    controller: function($uibModalInstance,global,item){
                        var self=this;
                        self.item=angular.copy(item);
                        self.ok=ok;
                        self.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                        self.currencyArr= global.get('store').val.currencyArr;
                        //console.log(global.get('store').val)
                        self.addRow=addRow;
                        function ok(){
                            /*var neNorm = self.item.data.some(function (d) {
                                return isNaN(Number(d.newPrice)) || isNaN(Number(d.newPriceForSale)) || isNaN(Number(d.newQty)) || (Number(d.newQty)!=0 && (Number(d.newPrice)==0 || Number(d.newPriceForSale)==0))
                            })
                            if(neNorm){
                                return exception.catcher('сохранение данных')('недопустимые значения')
                            }*/
                            for(var c in self.item.data){
                                self.item.data[c].debet=(isNaN(Number(self.item.data[c].debet)))?0:Number(self.item.data[c].debet);
                                self.item.data[c].newDebet=(isNaN(Number(self.item.data[c].newDebet)))?0:Number(self.item.data[c].newDebet);
                                self.item.data[c].credit=(isNaN(Number(self.item.data[c].credit)))?0:Number(self.item.data[c].credit);
                                self.item.data[c].newCredit=(isNaN(Number(self.item.data[c].newCredit)))?0:Number(self.item.data[c].newCredit);
                            }
                            $uibModalInstance.close(self.item);
                        }
                        function addRow() {
                            var curs=Object.keys(self.item.data)

                            if(self.currency && curs.indexOf(self.currency)<0 && !isNaN(Number(self.debet))&& !isNaN(Number(self.credit)) && !(Number(self.debet)==0&&Number(self.credit)==0)){
                                console.log((Number(self.debet)==0&&Number(self.credit)==0))
                                self.item.data[self.currency]={
                                    debet:0,
                                    credit:0,
                                    newDebet:Number(self.debet),
                                    newCredit:Number(self.credit)
                                }
                                console.log(self.item.data)
                                self.currency=null;
                                self.debet=0;
                                self.credit=0;
                            } else {
                                exception.catcher('добавление данных')('проверьте значения')
                            }
                        }
                    },
                    controllerAs:'$ctrl',
                }
                $uibModal.open(options).result.then(function (item) {
                    if(item){
                        resolve(item)
                    }else{
                        reject('empty')
                    }

                }, function (err) {
                    reject(err)
                });
            })
                .then(function (item) {
                    console.log(item)
                    var field='items.'+idx+'.data';
                    var value = item.data
                    self.item.items[idx]=item;
                    console.log(value)
                    saveField(field,value)

                })

        }

        function makeBalances() {
            $q.when()
                .then(function () {
                    var url = '/api/bookkeep/asa/makeBalances/'+self.item._id;
                    return $http.get(url)
                })
                .then(function () {
                    //console.log('$scope.$parent.getParentList',$scope.$parent.getParentList)
                    if($scope.$parent.getParentList){
                        $scope.$parent.getParentList()
                    }
                    exception.showToaster('info','формирование остатков','обновлено')
                    return getItem($stateParams.id);

                })
                .catch(function(err){
                    err = err.data||err
                    exception.catcher('формирование остатков')(err)
                });
        }



    }












    angular.module('gmall.services')
        .service('Supplier', supplierService)
        .service('AgetnStockAdjustment', StockAdjustmentService);
    supplierService.$inject=['$resource','$uibModal','$q'];
    function supplierService($resource,$uibModal,$q){
        var Items= $resource('/api/collections/Supplier/:_id',{_id:'@_id'});
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
                    //console.log(paginate)
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

    StockAdjustmentService.$inject=['$resource','$uibModal','$q','$http'];
    function StockAdjustmentService($resource,$uibModal,$q,$http){
        var Items= $resource('/api/collections/AgentStockAdjustment/:_id',{_id:'@_id'});
        return {
            getList:getList,
            getItem:getItem,
            save:Items.save,
            delete:Items.delete,
            query:Items.query,
            get:Items.get,
            activeSA:activeSA,
            getDiff:getDiff,
            createItem:createItem
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

        function activeSA(sa) {
            console.log(sa)
            var status = (sa.actived)?'hold':'cancel';
            //status='hold'
            var url = '/api/bookkeep/asa/'+status+'/'+sa._id;
            return $http.get(url)
        }
        function getDiff(sa) {
            return $q.when().then(function () {
                var url = '/api/bookkeep/asa/diff/'+sa._id;
                return $http.get(url)
            })


        }
        function createItem() {
            return $q(function(resolve,reject){
                var options={
                    animation: true,
                    restrict:"E",
                    templateUrl: 'bookkeep/components/supplier/createSA.html',
                    controller: function($uibModalInstance,global){
                        var self=this;
                        self.virtualAccounts=global.get('virtualAccounts').val
                        self.ok=ok;
                        self.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                        function ok(){
                            $uibModalInstance.close(self.item);
                        }
                    },
                    controllerAs:'$ctrl',
                }
                $uibModal.open(options).result.then(function (item) {
                    if(item){
                        resolve(item)
                    }else{
                        reject('empty')
                    }

                }, function (err) {
                    reject(err)
                });
            })
                /*.then(function (va) {
                    self.item={name:'Инвентаризация',num:1,materials:[],account:va._id}
                    return Items.save(self.item).$promise
                })*/
        }
    }
})()
