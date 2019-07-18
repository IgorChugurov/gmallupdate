'use strict';
(function(){
    angular.module('gmall.directives')
        .directive('rns',rnsDirective)
        .directive('rn',rnDirective)

    function rnsDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemsCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/rn/rns.html',
        }
    }
    function rnDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/rn/rn.html',
        }
    }
    itemsCtrl.$inject=['Rn','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','$state','exception','Material']
    function itemsCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,$state,exception,Material){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.$state = $state;
        self.typesOfZakaz=typesOfZakaz;

        self.paginate = {page: 0, rows: 100, totalItems: 0}

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
        self.changeTypeOfZakaz=changeTypeOfZakaz;
        self.changeDate=changeDate;
        self.clearSearch=clearSearch;

        self.getVirtualAccountName=getVirtualAccountName;
        function getVirtualAccountName() {
            var s = self.virtualAccounts.getOFA('_id',self.virtualAccount)
            return (s)?s.name:'по всем подразделениям'
        }
        function clearSearch() {
            self.searchStr=null;
            searchItems(self.searchStr)

        }

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

        function createItem(type) {
            $state.go('frame.Rn.item',{id:'new_'+self.virtualAccount,type:type})
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
                        if(d.zakaz){
                            var typeOfZakaz = typesOfZakaz.getOFA('type',d.zakaz.type)
                            if(typeOfZakaz){
                                d.zakaz.typeName=typeOfZakaz.name;
                            }
                        }
                        d.nameOfType=$scope.getNameTypeOfContrAgent(d.typeOfContrAgent)
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
            /*self.query = {};
            self.virtualAccount=null;
            self.paginate.page = 0;*/
            self.paginate.page = 0;
            /*return getList().then(function () {
                delete self.paginate.search
                console.log('Activated rns list View');
            });*/
            return getList().then(function () {

                console.log('Activated pns list View');
                if(!self.items.length){
                    return Material.getList({page:0,rows:100,search:self.paginate.search}, {})
                        .then(function (data) {
                            delete self.paginate.search;
                            if(data && data.length){
                                var ids =data.map(function(m){return m._id})
                                var query = {'materials.item' :{$in:ids}}
                                return Items.getList(self.paginate, query)
                            }else{
                                return []
                            }



                        }).then(function (data) {
                            console.log(data)
                            data.forEach(function (d) {
                                d.nameOfTypeOfConrtAgent=$scope.getNameTypeOfContrAgent(d.typeOfContrAgent)
                            })
                            self.items = data;
                            $scope.items=data
                            //console.log(self.items)
                        });
                }

            })


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
            self.menuSlide2=false
            activate()
        }
        function changeTypeOfZakaz() {
            self.paginate.page=0;
            if(self.typeOfZakaz){
                self.query.typeOfZakaz= self.typeOfZakaz
            }else{
                delete self.query.typeOfZakaz
            }
            self.menuSlide3=false
            getList()
        }


    }
    itemCtrl.$inject=['Rn','Zakaz','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','exception','$state','Supplier','Material','Worker','Founder','Contragent','Customer']
    function itemCtrl(Items,Zakaz,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,exception,$state,Supplier,Material,Worker,Founder,Contragent,Customer){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.item={date:new Date(),materials:[],store:global.get('store').val._id,currency:'UAH',name:'Расходная накладная'}
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

        self.createItem=createItem;
        self.saveField=saveField;
        self.addRow=addRow;
        self.addMaterial=addMaterial;
        self.refreshMaterials=refreshMaterials;
        self.deleteItem=deleteItem;
        self.changeMaterial=changeMaterial;
        self.getTotalSum=getTotalSum;
        self.activeRN=activeRN;
        self.changeTypeOfZakaz=changeTypeOfZakaz;
        self.refreshDocuments=refreshDocuments;
        self.changeVirtualAccount=changeVirtualAccount;
        self.setDocument=setDocument;
        self.getPrice=getPrice;
        self.getPriceForSale=getPriceForSale;
        self.setPriceForSaleBookkeep=setPriceForSaleBookkeep;
        self.getSum=getSum;
        self.changeQty=changeQty
        self.reserveRN=reserveRN




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
                    }else{
                        if($stateParams.type && $stateParams.type=='return'){
                            self.item.typeOfZakaz='return';
                            self.item.typeOfContrAgent='Supplier';
                            //getContrAgents(self.item[field])

                        }
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
                    data.materials=data.materials.map(function (m) {
                        if(m.item && m.item.sku2 && m.item.sku2.length){m.item.sku2=m.item.sku2[0]}else{m.item.sku2=''}

                        //m.priceForSaleRate=m.priceForSale;
                        if(data.currency==m.item.currency){
                            m.priceForSaleRate=m.priceForSale;
                        }else{
                            var rnCurrency=(data.currency)?data.currency:'UAH';
                            var rnCurrencyRate=(currency[rnCurrency]&& currency[rnCurrency][0])?currency[rnCurrency][0]:1;
                            var materialCurrency = (m.item.currency)?m.item.currency:'UAH';
                            let materialCurrencyRate =(currency[materialCurrency]&& currency[materialCurrency][0])?currency[materialCurrency][0]:1;
                            let rate =materialCurrencyRate/rnCurrencyRate;
                            m.priceForSaleRate = Math.round((m.priceForSale/rate)*100)/100
                        }
                        m.priceForSaleRateBookkeep=m.priceForSaleRate
                        return m
                    })

                    self.item=data;
                    if(data.typeOfZakaz && data.typeOfZakaz=='manufacture'){
                        self.documents=[self.item.zakaz]
                        /*var typeOfZakaz = typesOfZakaz.getOFA('type',self.item.zakaz.type)
                        if(typeOfZakaz){
                            self.item.typeOfZakaz=typeOfZakaz.type;
                        }*/
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
                return exception.catcher('создание накладной')('нет названия')
            }
            if(!self.item.typeOfZakaz){
                return exception.catcher('создание накладной')('нет вида расхода')
            }
            if(self.item.typeOfZakaz=='manufacture'  && !self.item.zakaz){
                return exception.catcher('создание накладной')('нет наряд-заказа')
            }
            if(!self.item.currency){
                return exception.catcher('создание накладной')('нет валюты ')
            }
            if((self.item.typeOfZakaz=='order'|| self.item.typeOfZakaz=='return') && !self.item.contrAgent){
                return exception.catcher('создание накладной')('нет контрагента')
            }


            var materials = self.item.materials.filter(function (m) {
                return m.item && m.item._id && !isNaN(Number(m.qty)) && !isNaN(Number(m.price))
            }).map(function (m) {
                var m1 = m;
                m1.item=m.item._id;
                return m1;
            })
            //console.log(materials)
            if(!materials.length){
                return exception.catcher('создание накладной')('нет позиций с количеством или ценой')
            }


            self.item.materials=materials
            $q.when()
                .then(function () {
                    return Items.save(self.item).$promise
                })
                .then(function (res) {
                    console.log(res)
                    self.item._id=res._id;
                    if(self.document && self.item._id){
                        self.document.rns.push(self.item._id);
                        var o = {
                            _id:self.document._id,
                            rns:self.document.rns
                        }
                        return Zakaz.save({update:'rns'},o ).$promise
                    }

                })
                .then(function () {
                    if(hold){
                        return activeRN()
                    }
                })
                .then(function () {
                    $state.go('frame.Rn', {va:self.item.virtualAccount}, { reload: true })
                })
                .catch(function (err) {
                    exception.catcher('error',err)
                })
        }

        function saveField(field){
            console.log(field)
            if(field=='typeOfContrAgent'){
                getContrAgents(self.item[field])
                self.item.contrAgent=null;
            }
            if(field=='contrAgent' && self.item.typeOfZakaz=='return'){
                self.item.materials=[];
            }
            if(!self.item._id){return}
            var o={_id:self.item._id};
            if(field=='materials'){
                o[field]=self.item[field].filter(function (m) {
                    return m.item && m.item._id
                }).map(function (m) {
                    //console.log(m)
                    //console.log({item:m.item._id,qty:m.qty,price:m.price})
                    return {item:m.item._id,
                        qty:m.qty,
                        price:m.price,
                        priceForSale:m.priceForSale,
                        supplier:m.supplier,
                        sum:m.sum,
                        priceRate:m.priceRate,
                        priceForSaleRate:m.priceForSaleRate,
                        supplierType:m.supplierType}
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
        function addMaterial() {
            if(!self.item.materials){self.item.materials=[]}
            if(self.item.materials.some(function (m,i) {
                    return m.item._id==self.newMaterial._id && m.price==self.newMaterial.price
                })){
                exception.showToaster('error','статус','такая позиция есть в накладной')
            }else{

                if(self.item.currency==self.newMaterial.currency){
                    self.newMaterial.priceForSaleRate=self.newMaterial.priceForSale;
                }else{
                    var rnCurrency=(self.item.currency)?self.item.currency:'UAH';
                    var rnCurrencyRate=(currency[rnCurrency]&& currency[rnCurrency][0])?currency[rnCurrency][0]:1;
                    var materialCurrency = (self.newMaterial.currency)?self.newMaterial.currency:'UAH';
                    let materialCurrencyRate =(currency[materialCurrency]&& currency[materialCurrency][0])?currency[materialCurrency][0]:1;
                    let rate =materialCurrencyRate/rnCurrencyRate;
                    self.newMaterial.priceForSaleRate = Math.round((self.newMaterial.priceForSale/rate)*100)/100
                }
                //self.newMaterial.priceForSaleRateBookkeep=self.newMaterial.priceForSaleRate
                var o = {
                    item:{_id:self.newMaterial._id,name:self.newMaterial.name,sku:self.newMaterial.sku,sku2:self.newMaterial.sku2,producer:self.newMaterial.producer,currency:self.newMaterial.currency},
                    supplier:self.newMaterial.supplier._id,
                    supplierType:self.newMaterial.supplierType,
                    price:self.newMaterial.price,
                    priceForSale:self.newMaterial.priceForSale,
                    priceForSaleRate:self.newMaterial.priceForSaleRate,
                    priceForSaleRateBookkeep:self.newMaterial.priceForSaleRate,
                    qty:1,
                }

                console.log(o)



                if(self.item.typeOfZakaz=='return'){
                    o.priceForSale=o.price;
                }

                self.item.materials.push(o)
                self.newMaterial=null;
            }
            if(self.item._id){
                saveField('materials')
            }
            console.log(self.item.materials)



        }
        function refreshMaterials(searchStr) {
            if(!searchStr){return}
            if(self.item.typeOfZakaz=='return' && !self.item.contrAgent){
                exception.catcher('поиск материалов')('выберите контрагента')
                return;
            }
            var query={actived:true,'data.virtualAccount':self.item.virtualAccount,'data.qty':{$gt:0}}
            if(self.item.typeOfZakaz=='return'){
                query['data.supplierType']='Supplier';
                query['data.supplier']=self.item.contrAgent;
            }
            var q= {search:searchStr,query:query}
            Material.query(q,function (res) {

                self.materials=res.reduce(function (acc,item) {
                    if(item.data && item.data.length){
                        item.data.forEach(function (d) {
                            if(d.virtualAccount==self.item.virtualAccount){
                                if(self.item.typeOfZakaz=='return'){
                                    console.log(self.item.contrAgent,d.supplier)
                                    if(self.item.contrAgent!==d.supplier._id || d.supplierType!=='Supplier'){
                                        return;
                                    }
                                }
                                var o=angular.copy(item)
                                delete o.data;
                                o.supplier=d.supplier
                                o.supplierType=d.supplierType
                                o.qty=d.qty
                                o.price=d.price
                                o.priceForSale=d.priceForSale
                                o.currency=item.currency
                                acc.push(o)
                            }
                        })
                    }
                    return acc;
                },[]).map(function (m) {
                    if(m.sku2 && m.sku2.length){
                        m.sku2=m.sku2[0]
                    }else{
                        m.sku2=''
                    }
                    return m
                });
                console.log(self.materials)
            })


        }
        function deleteItem(idx) {
            self.item.materials.splice(idx,1);
            saveField('materials')
        }
        function changeMaterial(item,idx) {
            //console.log(item)
            if(self.item.materials.some(function (m,i) {
                    //console.log(m.item._id==item._id && i!=idx)
                    return m.item._id==item._id && i!=idx
                })){
                exception.showToaster('error','статус','такая позиция есть в накладной')
                self.item.materials[idx].item=null;
            }else{
                self.item.materials[idx].qty=item.qty;
                self.item.materials[idx].price=item.price;
                self.item.materials[idx].priceForSale=item.priceForSale;
                self.item.materials[idx].supplier=item.supplier._id;
                self.item.materials[idx].supplierType=item.supplierType;

                if(self.item.currency==self.item.materials[idx].currency){
                    self.item.materials[idx].priceForSaleRate=self.item.materials[idx].priceForSale;
                }else{
                    var rnCurrency=(self.item.currency)?self.item.currency:'UAH';
                    var rnCurrencyRate=(currency[rnCurrency]&& currency[rnCurrency][0])?currency[rnCurrency][0]:1;
                    var materialCurrency = (self.item.materials[idx].currency)?self.item.materials[idx].currency:'UAH';
                    let materialCurrencyRate =(currency[materialCurrency]&& currency[materialCurrency][0])?currency[materialCurrency][0]:1;
                    let rate =materialCurrencyRate/rnCurrencyRate;
                    self.item.materials[idx].priceForSaleRate = Math.round((self.item.materials[idx].priceForSale/rate)*100)/100
                }
                self.item.materials[idx].priceForSaleRateBookkeep=self.item.materials[idx].priceForSaleRate


                saveField('materials')
            }
        }


        var delay
        function activeRN() {
            if(delay || (!self.item.materials.length && !self.item.actived)){return}
            //self.item.actived=true
            if(!self.item.actived){
                if(!self.item.materials.length || self.item.materials.some(function(m){return !m.item || !m.qty || !m.price ||  isNaN(Number(m.qty)) ||isNaN(Number(m.price))})){
                    return exception.catcher('проведение накладной')('недопустимые значения')
                }
            }
            if(!self.item.virtualAccount){
                return exception.catcher('проведение накладной')('не выбрано подразделение')
            }

            return $q.when()
                .then(function () {
                    return Items.activeRN(self.item)
                })
                .then(function (data) {
                    console.log(data)
                    self.item.actived=!self.item.actived;
                    if(self.item.actived){
                        self.item.reserve=false;
                    }
                    if(self.item.actived){
                        exception.showToaster('info','документ проведен')
                    }else{
                        exception.showToaster('info','отменено проведение документа')
                    }

                    //saveField('actived')
                    //saveField('sum')
                })
                .catch(function (err) {
                    exception.catcher('проведение накладной')(err)
                })


        }
        function reserveRN() {
            if(delay || !self.item.materials.length){return}
            //self.item.actived=true
            if(!self.item.actived){
                if(!self.item.materials.length || self.item.materials.some(function(m){return !m.item || !m.qty || !m.price ||  isNaN(Number(m.qty)) ||isNaN(Number(m.price))})){
                    return exception.catcher('резервирование')('недопустимые значения')
                }
            }
            if(!self.item.virtualAccount){
                return exception.catcher('резервирование')('не выбрано подразделение')
            }

            return $q.when()
                .then(function () {
                    return Items.reserveRN(self.item)
                })
                .then(function (data) {
                    console.log(data)
                    self.item.reserve=!self.item.reserve;

                    saveField('reserve')
                    saveField('sum')
                })
                .catch(function (err) {
                    exception.catcher('резервирование')(err)
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
            self.item.materials=[];
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
            //console.log(m)

            if(self.item.currency==m.item.currency){
                m.priceRate=m.price
            }else{
                var rnCurrency=(self.item.currency)?self.item.currency:'UAH';
                var rnCurrencyRate=(currency[rnCurrency]&& currency[rnCurrency][0])?currency[rnCurrency][0]:1;
                var materialCurrency = (m.item.currency)?m.item.currency:'UAH';
                let materialCurrencyRate =(currency[materialCurrency]&& currency[materialCurrency][0])?currency[materialCurrency][0]:1;
                let rate =materialCurrencyRate/rnCurrencyRate;
                m.priceRate=Math.round((m.price/rate)*100)/100
            }


            //console.log(m.priceRate)
            return (m.priceRate).toFixed(2)
        }

        function getPriceForSale(m) {
            if(self.item.currency==m.item.currency){
                m.priceForSaleRate=m.priceForSale;
            }else{
                var rnCurrency=(self.item.currency)?self.item.currency:'UAH';
                var rnCurrencyRate=(currency[rnCurrency]&& currency[rnCurrency][0])?currency[rnCurrency][0]:1;
                var materialCurrency = (m.item.currency)?m.item.currency:'UAH';
                let materialCurrencyRate =(currency[materialCurrency]&& currency[materialCurrency][0])?currency[materialCurrency][0]:1;
                let rate =materialCurrencyRate/rnCurrencyRate;
                m.priceForSaleRate = Math.round((m.priceForSale/rate)*100)/100
            }
            //console.log(m.priceForSaleRate)
            return (m.priceForSaleRate).toFixed(2)
        }
        function setPriceForSaleBookkeep(m) {
            //console.log('b',m.priceForSale)
            m.priceForSaleRate=m.priceForSaleRateBookkeep;
            if(self.item.currency==m.item.currency){
                m.priceForSale=m.priceForSaleRateBookkeep;
            }else{
                var rnCurrency=(self.item.currency)?self.item.currency:'UAH';
                var rnCurrencyRate=(currency[rnCurrency]&& currency[rnCurrency][0])?currency[rnCurrency][0]:1;
                var materialCurrency = (m.item.currency)?m.item.currency:'UAH';
                let materialCurrencyRate =(currency[materialCurrency]&& currency[materialCurrency][0])?currency[materialCurrency][0]:1;
                let rate =materialCurrencyRate/rnCurrencyRate;
                m.priceForSale = Math.round((m.priceForSaleRateBookkeep*rate)*100)/100
            }
            //console.log('a',m.priceForSale)
            saveField('materials')
        }



        function getSum(m) {
            m.sum = Math.round((m.priceForSaleRate*m.qty)*100)/100
            return (m.sum).toFixed(2)
        }
        function getTotalSum() {
            var sum=self.item.materials.reduce(function(s,m){
                return s+m.sum
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
                        return Confirm('Количество товара меньше 1. Удалить позицию из накладной?').then(function () {
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
        .service('Rn', rnService);
    rnService.$inject=['$resource','$uibModal','$q','$http'];
    function rnService($resource,$uibModal,$q,$http){
        var Items= $resource('/api/collections/Rn/:_id',{_id:'@_id'});
        return {
            getList:getList,
            getItem:getItem,
            save:Items.save,
            delete:Items.delete,
            query:Items.query,
            get:Items.get,
            activeRN:activeRN,
            reserveRN:reserveRN
        }
        function getList(paginate,query,populate){
            var q = {perPage:paginate.rows ,page:paginate.page,query:query,search:paginate.search};
            if(populate){
                q.populate=populate;
            }
            return Items.query( q).$promise
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

        function activeRN(rn) {
            console.log(rn)
            var status = (!rn.actived)?'hold':'cancel';
            //status='hold'
            var url = '/api/bookkeep/rn/'+status+'/'+rn._id;
            return $http.get(url)
        }
        function reserveRN(rn) {
            console.log(rn)
            var status = (!rn.reserve)?'reserveHold':'reserveCancel';
            //status='hold'
            var url = '/api/bookkeep/rn/'+status+'/'+rn._id;
            return $http.get(url)
        }
    }
})()