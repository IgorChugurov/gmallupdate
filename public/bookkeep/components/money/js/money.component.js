'use strict';
(function(){
    angular.module('gmall.directives')
        .directive('money',itemsDirective)
        .directive('moneyOrders',moneyOrdersDirective)
        .directive('moneyOrder',moneyOrderDirective)
        .directive('rate',rateDirective)


    function rateDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: rateCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/money/rate.html',
        }
    }
    function itemsDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemsCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/money/items.html',
        }
    }
    function moneyOrderDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: moneyOrderCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/money/moneyOrder.html',
        }
    }
    function moneyOrdersDirective(){
        return {
            scope: {
                type:'@'
            },
            bindToController: true,
            controller: moneyOrdersCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/money/moneyOrders.html',
        }
    }


    moneyOrdersCtrl.$inject=['MoneyOrder','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','$state','$attrs','Supplier','Material','Worker','Founder','Contragent','Customer','exception','$http']
    function moneyOrdersCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,$state,$attrs,Supplier,Material,Worker,Founder,Contragent,Customer,exception,$http){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.$state = $state;
        self.query = {
            type:$attrs.type
        };
        $scope.type=$attrs.type;

        switch($attrs.type){
            case 'Cash_debet':self.linkFoward='frame.MoneyOrderCashDebet.item';self.typeName='Наличные приход';break;
            case 'Cash_credit':self.linkFoward='frame.MoneyOrderCashCredit.item';self.typeName='Наличные расход';break;
            case 'Cash_exchange':self.linkFoward='frame.MoneyOrderCashExchange.item';self.typeName='Наличные обмен';break;
            case 'Bank_debet':self.linkFoward='frame.MoneyOrderBankDebet.item';self.typeName='Банк приход';break;
            case 'Bank_credit':self.linkFoward='frame.MoneyOrderBankCredit.item';self.typeName='Банк расход';break;
            case 'Bank_exchange':self.linkFoward='frame.MoneyOrderBankExchange.item';self.typeName='Банк обмен';break;
        }


        self.paginate = {page: 0, rows: 100, totalItems: 0}
        var currency = global.get('store').val.currency
        var currencyArr = global.get('store').val.currencyArr
        /*self.virtualAccounts=global.get('virtualAccounts').val.filter(function (a) {
            return a.actived
        }).reduce(function (o,item) {
            o[item._id]=item
            return o;
        },{});*/

        self.virtualAccounts=global.get('virtualAccounts').val;
        if(self.virtualAccounts && self.virtualAccounts.length){
            self.virtualAccounts=self.virtualAccounts.filter(function (a) {
                return a.actived;
            })
            if(!self.virtualAccounts.length){
                self.virtualAccounts=[global.get('virtualAccounts').val[0]]
            }else{
                self.virtualAccount=self.virtualAccounts[0]._id;
            }

        }
        self.query.virtualAccount=self.virtualAccount;
        if($stateParams.va){
            self.query.virtualAccount=$stateParams.va;
            self.virtualAccount=$stateParams.va
        }




        self.getList = getList;
        $scope.getList=getList;
        self.searchItems = searchItem;
        self.createItem=createItem;
        self.saveField = saveField;
        self.deleteItem=deleteItem;
        self.goToEdit=goToEdit;
        self.getStateInfo=getStateInfo;
        self.clearSearch=clearSearch;
        self.getVirtualAccountName=getVirtualAccountName;
        function getVirtualAccountName() {
            var s = self.virtualAccounts.getOFA('_id',self.virtualAccount)
            return (s)?s.name:'по всем подразделениям'
        }

        function clearSearch() {
            self.searchStr=null;
            searchItem(self.searchStr)

        }

        self.models={
            Supplier:Supplier,
            Worker:Worker,
            Founder:Founder,
            Contragent:Contragent,
            Customer:Customer
        }
        self.contrAgents=[];
        self.typeOfContrAgents=typeOfContrAgents
        self.changeDate=changeDate;
        self.changeTypeContrAgent=changeTypeContrAgent;
        self.changeContrAgent=changeContrAgent;
        self.refreshContrAgents=refreshContrAgents;
        self.reHoldAllDocs=reHoldAllDocs;
        self.changeVirtualAccount=changeVirtualAccount;




        function changeDate() {
            if(self.date){
                var dateStart = new Date(self.date);
                dateStart.setHours(0,0,0,0)
                var dateEnd = new Date(self.date);
                dateEnd.setHours(23,59,59,999);
                self.query.date=  {"$gte": dateStart, "$lt":dateEnd}
            }else{
                delete self.query.date
            }
            self.paginate.page=0;
            getList()
        }
        function changeVirtualAccount() {
            self.query.virtualAccount=self.virtualAccount;
            self.menuSlide2=false;
            activate()
        }
        function changeTypeContrAgent() {
            self.menuSlide4=false;
            self.contrAgents=[]
        }
        function changeContrAgent(contrAgent) {
            if(contrAgent){
                self.query.contrAgent=self.contrAgent._id
            }else{
                self.contrAgent=null;
                delete self.query.contrAgent;
            }
            self.menuSlide3=false;
            self.paginate.page=0;
            getList()
        }



        function createItem() {
            console.log(self.linkFoward)
            $state.go(self.linkFoward,{id:'new_'+self.virtualAccount})
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
                        //console.log(d)
                        d.nameOfTypeOfConrtAgent=$scope.getNameTypeOfContrAgent(d.typeOfContrAgent)
                    })

                    self.items = data;
                    $scope.items=data
                    self.items = data;
                });
        }


        function searchItem(searchStr) {
            if (searchStr) {
                self.paginate.search = searchStr.substring(0, 50)
            } else {

            }
            //self.query = {type:$attrs.type};
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

        $scope.getNameTypeOfContrAgent = function (typeOCA) {
            var t = typeOfContrAgents.getOFA('type',typeOCA)
            return (t)?t.name:'???'
        }
        function deleteItem(item) {
            if(!item.actived){
                Confirm('Удалить?')
                    .then(function(){
                        return Items.delete({_id:item._id}).$promise
                    })
                    .then(function(){
                        getList()
                    })
                    .catch(function(err){
                        err=err.data||err;
                        exception.catcher('Удаление')(err)
                    })
            }
        }
        function goToEdit(id) {
            $state.go(self.linkFoward,{id:id})
        }
        function getStateInfo() {
            return $state.current.name!='frame.MoneyOrderCashDebet' && $state.current.name!='frame.MoneyOrderCashCredit'
                &&$state.current.name!='frame.MoneyOrderBankDebet' && $state.current.name!='frame.MoneyOrderBankCredit'
                &&$state.current.name!='frame.MoneyOrderCashExchange' && $state.current.name!='frame.MoneyOrderBankExchange'
        }

        function refreshContrAgents(searchStr) {
            if(!searchStr){return}
            var q= {search:searchStr}
            self.models[self.typeOfContrAgent].query(q,function (res) {
                self.contrAgents=res
            })
        }
        function reHoldAllDocs() {
            if(global.get('user').val.email!='igorchugurov@gmail.com'){return}
            $q.when()
                .then(function () {
                    return Items.query({perPage:1000 ,page:0,query:self.query} ).$promise
                })
                .then(function (data) {
                    //console.log(data)
                    data.shift()
                    data.forEach(function (d,i) {
                        var pn = d;
                        if(pn.actived){
                            $timeout(function(){
                                $q.when()
                                    .then(function () {
                                        var url = '/api/bookkeep/MoneyOrder/cancel/'+pn._id;
                                        return $http.get(url)
                                    })
                                    .then(function () {
                                        console.log(pn.name, 'cancel')
                                        var url = '/api/bookkeep/MoneyOrder/hold/'+pn._id;
                                        return $http.get(url)
                                    })
                                    .then(function () {
                                        console.log(pn.name, 'hold')
                                    })
                                    .catch(function (err) {
                                        exception.catcher(pn.name)(err)
                                    })
                            },i * 500)

                        }
                    })
                })
        }
    }

    moneyOrderCtrl.$inject=['MoneyOrder','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','exception','$state','$attrs','Supplier','Worker','Founder','Customer','Contragent','$http']
    function moneyOrderCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,exception,$state,$attrs,Supplier,Worker,Founder,Customer,Contragent,$http){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.item={date:new Date(),type:$attrs.type,typeOfContrAgent:'Customer',sum:0,currency:"UAH"}
        //console.log($attrs)

        switch ($attrs.type) {
            case 'Cash_debet': self.item.name="ПКО";self.backLink='frame.MoneyOrderCashDebet';self.textType="Касса приход";self.typeOperation='Cash_debet';break;
            case 'Cash_credit':self.item.name="РКО";self.backLink='frame.MoneyOrderCashCredit';self.textType="Касса расход";self.typeOperation='Cash_credit';break;
            case 'Cash_exchange':self.item.name="КОбмен";self.backLink='frame.MoneyOrderCashExchange';self.textType="Касса обмен";self.exchange=true;self.typeOperation='Cash_exchange';break;
            case 'Bank_debet':self.item.name="БПО";self.backLink='frame.MoneyOrderBankDebet';self.textType="Банк приход";self.typeOperation='Bank_debet';break;
            case 'Bank_credit':self.item.name="БРО";self.backLink='frame.MoneyOrderBankCredit';self.textType="Банк расход";self.typeOperation='Bank_credit';break;
            case 'Bank_exchange':self.item.name="БОбмен";self.backLink='frame.MoneyOrderBankExchange';self.exchange=true;self.textType="Банк обмен";self.typeOperation='Bank_exchange';break;

        }
        self.typeOperations=[
            {_id:'Cash_debet',name:'Касса приход'},
            {_id:'Cash_credit',name:'Касса расход'},
            {_id:'Cash_exchange',name:'Касса обмен'},
            {_id:'Bank_debet',name:'Банк приход'},
            {_id:'Bank_credit',name:'Банк расход'},
            {_id:'Bank_exchange',name:'Банк обмен'},
        ]
        self.changeTypeOperation=changeTypeOperation;
        function changeTypeOperation() {
            self.item.type=self.typeOperation;
            $q.when()
                .then(function () {
                    return saveField('type')
                })
                .then(function () {
                    var dd = self.item.type.split('_')
                    //console.log(dd)
                    var dd1 =dd[1].charAt(0).toUpperCase() + dd[1].slice(1);
                    var sref = 'frame.MoneyOrder'+dd[0]+dd1+'.item'
                    //console.log(sref)
                    $state.go(sref,{id:self.item._id})
                })
                .catch(function (err) {
                    exception.catcher('Смена вида операции')(err)
                })
        }





        self.currencyArr=global.get('store').val.currencyArr
        if(self.currencyArr.length==1){
            self.item.currency=self.currencyArr[0];
        }
        self.models={
            Supplier:Supplier,
            Worker:Worker,
            Founder:Founder,
            Contragent:Contragent,
            Customer:Customer
        }

        self.contrAgents=[];
        self.typeOfContrAgents=typeOfContrAgents/*.reduce(function (o,item) {
         o[item.type]=item;
         return o;
         },{})*/
        self.contrAgent=self.typeOfContrAgents.getOFA('type','Customer')

        console.log(self.contrAgent)
        self.virtualAccounts=global.get('virtualAccounts').val.filter(function (a) {
            return a.actived
        })


        self.$stateParams=$stateParams.id.split('_')
        if(self.virtualAccounts.length==1){
            self.item.virtualAccount=self.virtualAccounts[0]._id
        }else if(self.$stateParams[1]){
            self.item.virtualAccount=self.$stateParams[1];
        }

        self.materials=[]

        self.dateOptions = {
            startingDay: 1
        };



        self.createItem=createItem;
        self.saveField=saveField;
        self.back=back;
        self.activeMoneyOrder=activeMoneyOrder;


        activate();

        function activate() {

            if(self.$stateParams[0]!='new'){
                return getItem($stateParams.id).then(function() {
                } ).catch(function(err){
                    err = err.data||err
                    exception.catcher('получение поставщика')(err)
                });
            }else {
                getContrAgents(self.contrAgent.type)
            }

        }
        function getItem(id) {
            //console.log(id)
            return self.Items.getItem(id)
            //console.log(id)
                .then(function(data) {
                    console.log(data)
                    data.date=new Date(data.date)
                    self.item=data;
                    getContrAgents(data.typeOfContrAgent)
                    //self.item.actived=true

                } ).catch(function(err){
                    console.log(err)
                    return $q.reject(err)
                });
        }
        function getContrAgents(type) {
            return $q.when()
                .then(function () {
                    console.log(type)
                    if(self.models[type]){
                        return self.models[type].getList({page: 0, rows: 1000, totalItems: 0},{})
                    }
                })
                .then(function (agents) {
                    if(agents){
                        self.contrAgent = self.typeOfContrAgents.getOFA('type',self.item.typeOfContrAgent)
                        self.contrAgents=agents
                    }
                })
        }

        function createItem(active) {
            if(self.item._id){return}
            if(!self.item.name){
                return exception.catcher('создание документа')('нет названия')
            }
            if(!self.item.virtualAccount){
                return exception.catcher('создание документа')('не выбрано подразделение')
            }
            if(!self.item.contrAgent){
                return exception.catcher('создание документа')('не выбран контрагент')
            }
            if(!self.exchange){
                if(!self.item.sum || isNaN(Number(self.item.sum))){
                    return exception.catcher('создание документа')('не корректная сумма')
                }
                if(!self.item.currency){
                    return exception.catcher('создание документа')('не установлена валюта документа')
                }
            }else{
                if(!self.item.debet || isNaN(Number(self.item.debet))){
                    return exception.catcher('создание документа')('не корректная сумма поступления')
                }
                if(!self.item.currencyDebet){
                    return exception.catcher('создание документа')('не установлена валюта поступления')
                }
                if(!self.item.credit || isNaN(Number(self.item.credit))){
                    return exception.catcher('создание документа')('не корректная сумма расхода')
                }
                if(!self.item.currencyCredit){
                    return exception.catcher('создание документа')('не установлена валюта расхода')
                }
            }


            $q.when()
                .then(function () {
                    return Items.save(self.item).$promise
                })
                .then(function (res) {
                    self.item._id=res.id;
                    if(active){
                        return activeMoneyOrder()
                    }
                })
                .then(function () {
                    $state.go(self.backLink,{va:self.item.virtualAccount}, { reload: true })
                })
        }
        function saveField(field){

            if(field=='typeOfContrAgent'){
                getContrAgents(self.item[field])
                self.item.contrAgent=null;
            }
            if(!self.item._id){return}
            var o={_id:self.item._id};
            o[field]=self.item[field]
            return self.Items.save({update:field},o ).$promise.then(function(){
                global.set('saving',true);
                $timeout(function(){
                    global.set('saving',false);
                },1500)
            },function(err){console.log(err)});
        };
        function back() {
            console.log(self.backLink)
            $state.go(self.backLink)
        }
        var delay;
        function activeMoneyOrder() {
            if(delay){return}
            delay=true;
            if(!self.item.name){
                return exception.catcher('проведение документа')('нет названия')
            }
            if(!self.item.virtualAccount){
                return exception.catcher('проведение документа')('не выбрано подразделение')
            }
            if(!self.item.contrAgent){
                return exception.catcher('проведение документа')('не выбран контрагент')
            }


            if(!self.exchange){
                if(!self.item.sum || isNaN(Number(self.item.sum))){
                    return exception.catcher('проведение документа')('не корректная сумма')
                }
                if(!self.item.currency){
                    return exception.catcher('проведение документа')('не установлена валюта документа')
                }
            }else{
                if(!self.item.debet || isNaN(Number(self.item.debet))){
                    return exception.catcher('проведение документа')('не корректная сумма поступления')
                }
                if(!self.item.currencyDebet){
                    return exception.catcher('проведение документа')('не установлена валюта поступления')
                }
                if(!self.item.credit || isNaN(Number(self.item.credit))){
                    return exception.catcher('проведение документа')('не корректная сумма расхода')
                }
                if(!self.item.currencyCredit){
                    return exception.catcher('проведение документа')('не установлена валюта расхода')
                }
            }


            self.item.actived=!self.item.actived;
            return $q.when()
                .then(function () {
                    var status = (self.item.actived)?'hold':'cancel';
                    //status='hold'
                    var url = '/api/bookkeep/MoneyOrder/'+status+'/'+self.item._id;
                    return $http.get(url)
                })
                .then(function (res) {
                    console.log(res)
                    if(res && res.data){
                        self.item.diff=res.data.diff
                    }
                    //saveField('actived')
                    delay=false;
                    $scope.$parent.getList()
                })
                .catch(function (err) {
                    delay=false;
                    self.item.actived=!self.item.actived;
                    console.log(err)
                    exception.catcher('проведение документа')(err)
                })


        }
    }




    itemsCtrl.$inject=['Money','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','$state','GlobalService','$http','exception']
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
        $scope.getList=getList;
        self.searchItems = searchItem;
        self.createItem=createItem;
        self.saveField = saveField;
        self.getDetail=getDetail;
        self.clearData=clearData;
        self.goToExchange=goToExchange;
        self.makeBalances=makeBalances;
        function getDetail(id,virtualAccount) {
            console.log(id,virtualAccount)
            GlobalService.getDocs('Money',id,virtualAccount)

        }


        function createItem() {
            $state.go('frame.Money.item',{id:'new'})
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
        function clearData(item) {
            Confirm('уверены в дествии???')
                .then(function () {
                    item.data=[];
                    saveField(item,'data')
                    item.debet=0;
                    item.credit=0;
                    saveField(item,'debet')
                    saveField(item,'credit')

                })
        }
        function goToExchange(type) {
            $state.go('frame.MoneyOrder'+type+'Exchange');
        }
        function makeBalances() {
            $q.when()
                .then(function () {
                    var url = '/api/bookkeep/asa/makeBalances/Money'
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
    itemCtrl.$inject=['Money','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','exception','$state']
    function itemCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,exception,$state){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.item={}

        self.createItem=createItem;
        self.saveField=saveField;

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
                    $state.go('frame.Money', {va:self.item.virtualAccount}, { reload: true })
                })
        }
        function saveField(field){
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


    rateCtrl.$inject=['Rate','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','$state','GlobalService','$http','exception','$resource']
    function rateCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,$state,GlobalService,$http,exception,$resource){
        var self = this;
        var Store  = $resource('/api/collections/Store/:_id',{_id:'@_id'});
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.$state = $state;
        self.query = {};
        var currency = global.get('store').val.currency;
        self.paginate = {page: 0, rows: 50, totalItems: 0}

        self.getList = getList;
        $scope.getList=getList;
        self.createItem=createItem;


        function createItem() {

            $q.when()
                .then(function () {
                    return self.Items.create()
                })
                .then(function (c) {
                    global.get('store').val.currency=c;
                    currency=c;
                    return self.Items.save({currency:c}).$promise

                })
                .then(function () {
                    var o ={_id:global.get('store' ).val._id}
                    for(var key in currency){
                        if(currency[key][2]){
                            currency[key][2]=currency[key][2].substring(0,5);
                        }
                    }
                    o.currency=currency
                    Store.save({update:'currency'},o)
                    return getList();
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
                    console.log(data)
                    data.forEach(function (d) {
                        d.date = moment(d.date).format('LLL');
                        d.currencyStr = '';
                        for(var c in d.currency){
                            var m = (d.currency[c][0]!==1)?'('+Math.round((1/d.currency[c][0])*1000)/1000+')':null;
                            d.currencyStr+=c+' - '+d.currency[c][0];
                            if(m){
                                d.currencyStr+=m;
                            }
                            d.currencyStr+=', '
                        }
                        d.currencyStr = d.currencyStr.substring(0, d.currencyStr.length - 2);
                    })
                    self.items = data;
                });
        }
    }



    angular.module('gmall.services')
        .service('Money', itemsService)
        .service('MoneyOrder', MoneyOrderService)
        .service('Rate', rateService)

    itemsService.$inject=['$resource','$uibModal','$q'];
    function itemsService($resource,$uibModal,$q){
        var Items= $resource('/api/collections/Money/:_id',{_id:'@_id'});
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

    MoneyOrderService.$inject=['$resource','$uibModal','$q'];
    function MoneyOrderService($resource,$uibModal,$q){
        var Items= $resource('/api/collections/MoneyOrder/:_id',{_id:'@_id'});
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

    rateService.$inject=['$resource','$uibModal','$q'];
    function rateService($resource,$uibModal,$q){
        var Items= $resource('/api/collections/Rate/:_id',{_id:'@_id'});
        return {
            getList:getList,
            getItem:getItem,
            save:Items.save,
            delete:Items.delete,
            query:Items.query,
            get:Items.get,
            create:create
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
        
        function create() {
            return $q(function(resolve,reject){
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'bookkeep/components/money/createRate.html',
                    controller: function($uibModalInstance,global){
                        var self=this;
                        self.item={};
                        self.item.currency = global.get('store').val.currency;
                        self.item.mainCurrency = global.get('store').val.mainCurrency;

                        self.ok=function(){
                            $uibModalInstance.close(self.item.currency);
                        }
                        self.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    },
                    controllerAs:'$ctrl',
                });
                modalInstance.result.then(function (currency) {
                    resolve(currency)

                }, function (err) {
                    reject(err)
                });
            })
        }
    }




})()
