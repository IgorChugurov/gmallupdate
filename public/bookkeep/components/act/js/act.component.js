'use strict';
(function(){
    angular.module('gmall.directives')
        .directive('acts',actsDirective)
        .directive('act',actDirective)

    function actsDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemsCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/act/acts.html',
        }
    }
    function actDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/act/act.html',
        }
    }
    itemsCtrl.$inject=['Act','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','$state','exception']
    function itemsCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,$state,exception){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.$state = $state;


        self.paginate = {page: 0, rows: 20, totalItems: 0}

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
        self.query = {virtualAccount:self.virtualAccount};
        if($stateParams.va){
            self.query.virtualAccount=$stateParams.va;
            self.virtualAccount=$stateParams.va
        }


        self.getList = getList;
        self.searchItems = searchItems;
        self.createItem=createItem;
        self.deleteItem=deleteItem;
        self.changeVirtualAccount=changeVirtualAccount;

        function createItem() {
            $state.go('frame.Act.item',{id:'new_'+self.virtualAccount})
        }

        activate();

        function activate() {
            self.paginate.page=0;
            self.query = {virtualAccount:self.virtualAccount};
            return getList().then(function () {
            }).then(function () {
            });
        }

        function getList() {
            return Items.getList(self.paginate, self.query)
                .then(function (data) {
                    data.forEach(function (d) {
                        /*if(d.zakaz){
                            var typeOfZakaz = typesOfZakaz.getOFA('type',d.zakaz.type)
                            if(typeOfZakaz){
                                d.zakaz.typeName=typeOfZakaz.name;
                            }
                        }
                        d.nameOfType=$scope.getNameTypeOfContrAgent(d.typeOfContrAgent)*/
                    })
                    self.items = data;
                    $scope.items=data
                    //console.log(self.items)
                });
        }


        function searchItems(searchStr) {
            if (searchStr) {
                self.paginate.search = searchStr.substring(0, 50)
            } else {

            }
            self.query = {};
            self.virtualAccount=null;
            self.paginate.page = 0;
            self.paginate.page = 0;
            return getList().then(function () {
                delete self.paginate.search
                console.log('Activated acts list View');
            });
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

        $scope.getNameTypeOfContrAgent = function (typeOCA) {
            //console.log(typeOCA)
            var t = typeOfContrAgents.getOFA('type',typeOCA)
            return (t)?t.name:'???'
        }
        function changeVirtualAccount() {
            self.query.virtualAccount=self.virtualAccount;
            activate()
        }


    }
    itemCtrl.$inject=['Act','Zakaz','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','exception','$state','Supplier','Work','Worker','Founder','Contragent','Customer']
    function itemCtrl(Items,Zakaz,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,exception,$state,Supplier,Work,Worker,Founder,Contragent,Customer){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.item={date:new Date(),works:[],store:global.get('store').val._id,currency:'UAH',typeOfZakaz:'manufacture'}
        self.currencyArr=global.get('store').val.currencyArr
        var currency=global.get('store').val.currency
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
        self.documents=[{_id:'new',name:'Новый'}]

        self.typesOfZakaz=typesOfZakaz;
        self.workers=[];
        workingHour = global.get('workingHour').val;

        self.createItem=createItem;
        self.saveField=saveField;
        self.addRow=addRow;
        self.refreshWorks=refreshWorks;
        self.addWork=addWork;
        self.deleteItem=deleteItem;

        self.getTotalSum=getTotalSum;
        self.activeAct=activeAct;
        self.changeTypeOfZakaz=changeTypeOfZakaz;
        self.refreshDocuments=refreshDocuments;
        self.changeVirtualAccount=changeVirtualAccount;
        self.setDocument=setDocument;
        self.getPrice=getPrice;
        self.getPriceForSale=getPriceForSale;
        self.getSum=getSum;
        self.changeQty=changeQty




        activate()
        $scope.$on('$destroy', function() {
            setDataToList()
        });


        function setDataToList() {
            //console.log($scope.$parent.items)
            for(let i=0;i<$scope.$parent.items.length;i++){
                if($scope.$parent.items[i]._id==self.item._id){
                    console.log(self.item._id)
                    $scope.$parent.items[i].name=self.item.name;
                    $scope.$parent.items[i].actived=self.item.actived;
                    $scope.$parent.items[i].date=self.item.date;
                    break;
                }
            }
        }

        function activate() {
            $q.when()
                .then(function () {
                    if(self.$stateParams[0]=='new'){
                        return Supplier.getList({page: 0, rows: 1000, totalItems: 0},{})
                    }

                })
                .then(function (result) {
                    if(result){
                        self.contrAgents=result;
                    }

                    if(self.$stateParams[0]!='new'){
                        return getItem($stateParams.id)
                    }
                })
                .then(function () {
                    return Worker.getList({page:0,rows:500},{actived:true})
                })
                .then(function (workers) {
                    self.workers=workers
                })
                .catch(function(err){
                    err = err.data||err
                    exception.catcher('получение накладной')(err)
                });


        }
        function getItem(id) {
            //console.log(id)
            return self.Items.getItem(id)
            //console.log(id)
                .then(function(data) {
                    //console.log(data)
                    //data.actived=true
                    data.date= new Date(data.date)


                    self.item=data;
                    if(data.typeOfZakaz && data.typeOfZakaz=='manufacture'){
                        self.documents=[self.item.zakaz]
                    }
                    if(data.typeOfContrAgent){
                        getContrAgents(data.typeOfContrAgent)
                    }

                } )

                .catch(function(err){
                    console.log(err)
                    return $q.reject(err)
                });
        }
        function getContrAgents(type) {
            return $q.when()
                .then(function () {
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

        function createItem(hold){
            if(self.item._id){return}
            if(!self.item.name){
                return exception.catcher('создание акта')('нет названия')
            }
            if(!self.item.typeOfZakaz){
                return exception.catcher('создание акта')('нет вида расхода')
            }
            if(self.item.typeOfZakaz=='manufacture'  && !self.item.zakaz){
                return exception.catcher('создание накладной')('нет наряд-заказа')
            }
            if(self.item.zakaz=='new' && !self.item.contrAgent){
                return exception.catcher('создание акта')('нет контрагента ')
            }
            if(!self.item.currency){
                return exception.catcher('создание акта')('нет валюты ')
            }
            if((self.item.typeOfZakaz=='order'|| self.item.typeOfZakaz=='return') && !self.item.contrAgent){
                return exception.catcher('создание акта')('нет контрагента')
            }


            var works = self.item.works.filter(function (m) {
                return m.item && m.item._id && !isNaN(Number(m.qty)) && !isNaN(Number(m.price))
            }).map(function (m) {
                var m1 = m;
                m1.item=m.item._id;
                return m1;
            })
            //console.log(materials)
            if(!works.length){
                return exception.catcher('создание акта')('нет позиций с количеством или ценой')
            }


            self.item.works=works
            $q.when()
                .then(function () {
                    return Items.save(self.item).$promise
                })
                .then(function (res) {
                    console.log(res)
                    self.item._id=res._id;
                })
                .then(function () {
                    if(hold){
                        return activeAct()
                    }
                })
                .then(function () {
                    $state.go('frame.Act', {va:self.item.virtualAccount}, { reload: true })
                })
                .catch(function (err) {
                    exception.catcher('error',err)
                })
        }

        function saveField(field){
            if(field=='typeOfContrAgent'){
                getContrAgents(self.item[field])
                self.item.contrAgent=null;
            }
            if(!self.item._id){return}
            var o={_id:self.item._id};
            if(field=='works'){
                o[field]=self.item[field].filter(function (m) {
                    return m.item && m.item._id
                }).map(function (m) {
                    console.log(m)
                    console.log({item:m.item._id,qty:m.qty,price:m.price,worker:m.worker})
                    return {item:m.item._id,qty:m.qty,price:m.price,worker:m.worker}
                })
                field+=' sum'
                o.sum=self.item.sum
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
        function addRow() {
            if(!self.item.materials){self.item.materials=[]}
            var o={
                item:null,qty:0,price:0
            }
            self.item.materials.push(o)
        }
        function addWork() {
            if(!self.item.works){self.item.works=[]}
            if(self.item.works.some(function (m,i) {
                    return m.item._id==self.newWork._id
                })){
                exception.showToaster('error','статус','такая позиция есть в акте')
            }else{
                var o = {
                    item:{_id:self.newWork._id,name:self.newWork.name},
                    price: workingHour[self.item.currency]*self.newWork.workingHour,
                    qty:self.newWork.workingHour
                }

                self.item.works.push(o)
                self.newWork=null;
            }
            if(self.item._id){
                saveField('works')
            }
            console.log(self.item.works)



        }
        function refreshWorks(searchStr) {
            if(!searchStr){return}
            var q= {search:searchStr}
            Work.query(q,function (res) {
                self.works=res
            })


        }
        function deleteItem(idx) {
            self.item.works.splice(idx,1);
            saveField('works')
        }


        var delay
        function activeAct() {
            console.log(delay)
            if(delay ){return}
            delay=true
            //self.item.actived=true
            if(!self.item.works.length && !self.item.actived){
                return exception.catcher('проведение акта')('не выбрано ни одной работы')
            }
            if(!self.item.actived && (!self.item.works.length || self.item.works.some(function(m){return !m.item || !m.qty || !m.price ||  isNaN(Number(m.qty)) ||isNaN(Number(m.price))}))){
                return exception.catcher('проведение акта')('недопустимые значения')
            }
            if(!self.item.virtualAccount){
                return exception.catcher('проведение акта')('не выбрано подразделение')
            }

            if(self.item.works.some(function(m){return !m.worker})){
                return exception.catcher('проведение акта')('не выбран сотрудник')
            }

            return $q.when()
                .then(function () {
                    return Items.activeAct(self.item)
                })
                .then(function (data) {
                    console.log(data)
                    self.item.actived=!self.item.actived
                    delay=false

                })
                .catch(function (err) {
                    delay=false
                    exception.catcher('проведение акта')(err)
                })


        }


        function changeTypeOfZakaz() {
            //self.item.typeOfZakaz=null;
            self.documents=[{_id:'new',name:'Новый'}]
        }
        function refreshDocuments(searchStr) {
            if(!searchStr){return}
            if(!self.item.typeOfZakaz){
                return exception.catcher('ошибка')('не выбран тип расхода')
            }
            var query={actived:false,type:self.item.typeOfZakaz}
            var q= {search:searchStr,query:query}
            Zakaz.query(q,function (res) {
                var documents=res.map(function (m) {
                    return m
                });
                documents.unshift({_id:'new',name:'Новый'})
                self.documents=documents
                //console.log(self.documents)
            })


        }

        function changeVirtualAccount() {
            self.item.works=[];
        }

        function setDocument() {
            if(self.item.zakaz!='new'){
                self.document=self.documents.getOFA('_id',self.item.zakaz)
                self.item.currency=self.document.currency;
            }else{
                self.document=null;
            }
            console.log(self.document)
        }

        function getPrice(m) {
            //console.log(self.item.currency,m)
            if(self.item.currency==m.item.currency){
                return (m.price).toFixed(2)
            }
            var rnCurrency=(self.item.currency)?self.item.currency:'UAH';
            var rnCurrencyRate=(currency[rnCurrency]&& currency[rnCurrency][0])?currency[rnCurrency][0]:1;
            var materialCurrency = (m.item.currency)?m.item.currency:'UAH';
            let materialCurrencyRate =(currency[materialCurrency]&& currency[materialCurrency][0])?currency[materialCurrency][0]:1;
            let rate =materialCurrencyRate/rnCurrencyRate;
            return (Math.round((m.price/rate)*100)/100).toFixed(2)
        }
        function getPriceForSale(m) {
            if(self.item.currency==m.item.currency){
                m.priceForSaleRate=m.priceForSale;
                return (m.priceForSale).toFixed(2)
            }
            var rnCurrency=(self.item.currency)?self.item.currency:'UAH';
            var rnCurrencyRate=(currency[rnCurrency]&& currency[rnCurrency][0])?currency[rnCurrency][0]:1;
            var materialCurrency = (m.item.currency)?m.item.currency:'UAH';
            let materialCurrencyRate =(currency[materialCurrency]&& currency[materialCurrency][0])?currency[materialCurrency][0]:1;
            let rate =materialCurrencyRate/rnCurrencyRate;
            m.priceForSaleRate = Math.round((m.priceForSale/rate)*100)/100
            return (m.priceForSaleRate).toFixed(2)
        }
        function getSum(m) {
            m.price = workingHour[self.item.currency]*m.qty;
            return m.price
        }
        function getTotalSum() {

            var sum=self.item.works.reduce(function(s,m){
                return s+m.price
            },0)
            self.item.sum = sum;
            return (sum).toFixed(2);
        }
        var delayChangeQty
        function changeQty(m) {
            if(delayChangeQty){return}
            delayChangeQty=true;
            $q.when()
                .then(function () {
                    if(m.qty<=0){
                        return Confirm('количество меньше 1, удалить позицию из накладной?').then(function () {
                            throw 'позиция удалена'
                        })
                    }

                })
                .then(function () {
                    if(m.qty<1){
                        m.qty=1;
                    }
                    return Material.getItem(m.item._id)
                })
                .then(function (material) {
                    //console.log(material)
                    var data;
                    for(var i =0;i<material.data.length;i++){
                        if(material.data[i].virtualAccount==self.item.virtualAccount && m.supplier==material.data[i].supplier){
                            data=material.data[i];
                            break
                        }
                    }
                    if(data){
                        if(data.qty<m.qty){
                            exception.catcher('ошибка')('количество материала на складе '+data.qty)
                            m.qty=data.qty;
                        }else{
                            saveField('materials')
                        }
                    }
                    delayChangeQty=false;
                })
                .catch(function (err) {
                    delayChangeQty=false;
                    console.log(err)
                })
        }

    }



    angular.module('gmall.services')
        .service('Act', rnService);
    rnService.$inject=['$resource','$uibModal','$q','$http'];
    function rnService($resource,$uibModal,$q,$http){
        var Items= $resource('/api/collections/Act/:_id',{_id:'@_id'});
        return {
            getList:getList,
            getItem:getItem,
            save:Items.save,
            delete:Items.delete,
            query:Items.query,
            get:Items.get,
            activeAct:activeAct,
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

        function activeAct(act) {
            var status = (!act.actived)?'hold':'cancel';
            var url = '/api/bookkeep/act/'+status+'/'+act._id;
            return $http.get(url)
        }
    }
})()