'use strict';
(function(){
    angular.module('gmall.directives')
        .directive('pns',pnsDirective)
        .directive('pn',pnDirective)

    function pnsDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemsCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/pn/pns.html',
        }
    }
    function pnDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/pn/pn.html',
        }
    }
    itemsCtrl.$inject=['Pn','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','$state','exception','Material']
    function itemsCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,$state,exception,Material){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.$state = $state;
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
        self.changeDate=changeDate;
        self.reHoldAllDocs=reHoldAllDocs;
        self.getVirtualAccountName=getVirtualAccountName;
        function getVirtualAccountName() {
            var s = self.virtualAccounts.getOFA('_id',self.virtualAccount)
            return (s)?s.name:'по всем подразделениям'
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
        function changeVirtualAccount() {
            self.query.virtualAccount=self.virtualAccount;
            self.menuSlide2=false;
            activate()
        }
        self.clearSearch=clearSearch;
        function clearSearch() {
            self.searchStr=null;
            searchItems(self.searchStr)

        }

        function createItem(type) {
            $state.go('frame.pns.pn',{id:'new_'+self.virtualAccount,type:type})
        }

        activate();

        function activate() {
            self.paginate.page=0;
            self.query = {virtualAccount:self.virtualAccount};
            return getList().then(function () {
            }).then(function () {
            });
        }
        function reHoldAllDocs() {
            console.log(global.get('user').val)
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
                                        return Items.activePN(pn)

                                    })
                                    .then(function () {
                                        console.log(pn.name, 'cancel')
                                        return Items.activePN(pn)
                                    })
                                    .then(function () {
                                        console.log(pn.name, 'hold')
                                    })
                                    .catch(function (err) {
                                        exception.catcher(pn.name)(err)
                                    })
                            },i * 200)

                        }
                    })
                })
        }

        function getList() {
            return Items.getList(self.paginate, self.query)
                .then(function (data) {
                    data.forEach(function (d) {
                        d.nameOfTypeOfConrtAgent=$scope.getNameTypeOfContrAgent(d.typeOfContrAgent)
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
            //self.query = {};
            //self.virtualAccount=null;
            self.paginate.page = 0;
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



    }
    itemCtrl.$inject=['Pn','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','exception','$state','Supplier','Material','Worker','Founder','Contragent','Customer','Rn']
    function itemCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,exception,$state,Supplier,Material,Worker,Founder,Contragent,Customer,Rn){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.item={date:new Date(),materials:[{item:null,qty:0,price:0}],typeOfContrAgent:'Supplier',name:'Приходная накладная '}
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
        self.contrAgent=self.typeOfContrAgents.getOFA('type','Supplier')


        self.virtualAccounts=global.get('virtualAccounts').val.filter(function (a) {
            return a.actived
        })
        self.currencyRate={}
        //console.log(global.get('store').val)
        for(var key in global.get('store').val.currency){
            if(key!=global.get('store').val.mainCurrency){
                self.currencyRate[key]=Math.round((1/global.get('store').val.currency[key][0])*100)/100
            }
        }



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
        self.addRow=addRow;
        self.refreshMaterials=refreshMaterials;
        self.deleteItem=deleteItem;
        self.changeMaterial=changeMaterial;
        self.getTotalSum=getTotalSum;
        self.activePN=activePN;
        self.tagTransformForMaterial=tagTransformForMaterial;
        self.changeContrAgent=changeContrAgent;
        self.changeCurrency=changeCurrency;
        self.refreshMaterialsForReturn=refreshMaterialsForReturn;


        function tagTransformForMaterial(newTag) {
            var item = {
                name: newTag,
                _id:'new'
            };
            return item;
        };




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
                    $scope.$parent.items[i].typeOfContrAgent=self.item.typeOfContrAgent;
                    $scope.$parent.items[i].date=self.item.date;
                    console.log(self.item.contrAgent)
                    var ca = self.contrAgents.getOFA('_id',self.item.contrAgent)
                    console.log(ca)
                    $scope.$parent.items[i].nameOfTypeOfConrtAgent =$scope.$parent.getNameTypeOfContrAgent(self.item.typeOfContrAgent)
                    if(ca){
                        $scope.$parent.items[i].contrAgent=ca;
                    }
                    break;
                }
            }
        }

        function activate() {
            $q.when()
                .then(function () {})
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
                            self.item.type='return';
                            self.item.typeOfContrAgent='Customer';
                            getContrAgents(self.item.typeOfContrAgent)
                            //getContrAgents(self.item[field])

                        }
                    }
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
                    data.date= new Date(data.date)
                    data.materials=data.materials.filter(function (m) {
                        return m.item;
                    })
                    data.materials=data.materials.map(function (m) {
                        if(m.item && m.item.sku2 && m.item.sku2.length){m.item.sku2=m.item.sku2[0]}else{if(typeof m.item!='object'){m.item={}};m.item.sku2=''}
                        return m
                    })
                    if(!data.typeOfContrAgent){
                        data.typeOfContrAgent='Supplier'
                    }
                    self.item=data;
                    if(!self.contrAgents.length || data.typeOfContrAgent!='Supplier'){
                        return getContrAgents(data.typeOfContrAgent)
                    }
                    if(data.actived){
                        for(var key in data.currencyData){
                            if(key!=global.get('store').val.mainCurrency){
                                self.currencyRate[key]=Math.round((1/data.currencyData[key][0])*100)/100
                            }
                        }
                    }

                    //self.item.actived=true;
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
            if(!self.item.contrAgent){
                return exception.catcher('создание накладной')('нет поставщика')
            }
            if(!self.item.currency){
                return exception.catcher('создание накладной')('нет валюты поставщика')
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
                    self.item._id=res._id
                    if(hold){
                        return activePN()
                    }
                })
                .then(function () {
                    $state.go('frame.pns', {va:self.item.virtualAccount}, { reload: true })
                })
        }

        function changeContrAgent() {
            if(self.item.type=='return'){
                if(self.item.materials.length){
                    self.item.currency=null;
                    self.item.materials=[];
                }

                if(!self.item._id){return}
                saveField('contrAgent');
                if(self.item.materials.length){
                    saveField('currency');
                    saveField('materials');
                }



            }else{
                saveField('contrAgent');
            }


        }
        function changeCurrency() {
            if(self.item.type=='return'){
                if(self.item.materials.length){
                    self.item.contrAgent=null;
                    self.item.materials=[];
                }


                if(!self.item._id){return}
                saveField('currency');
                if(self.item.materials.length){
                    saveField('materials');
                    saveField('contrAgent');
                }


            }else{
                saveField('currency');
            }
        }

        function saveField(field){
            if(field=='typeOfContrAgent'){
                self.item.contrAgent=null;
                getContrAgents(self.item[field])

            }
            if(!self.item._id){return}
            var o={_id:self.item._id};
            if(field=='materials'){
                o[field]=self.item[field].filter(function (m) {
                    return m.item && m.item._id
                }).map(function (m) {
                    /*console.log(m)
                    console.log({item:m.item._id,qty:m.qty,price:m.price})*/
                    var o = {item:m.item._id,qty:m.qty,price:m.price};
                    if(m.priceReturn){
                        o.priceReturn=m.priceReturn;
                    }
                    if(m.supplier){
                        o.supplier=m.supplier;
                    }
                    if(m.supplierType){
                        o.supplierType=m.supplierType;
                    }
                    return o;
                })
            }else if(field=='typeOfContrAgent'){
                o[field]=self.item[field]
                $timeout(function(){
                    saveField('contrAgent')
                },200)
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
        function refreshMaterials(searchStr) {
            if(!searchStr){return}
            var q= {search:searchStr}
            Material.query(q,function (res) {
                self.materials=res.map(function (m) {
                    if(m.sku2 && m.sku2.length){
                        m.sku2=m.sku2[0]
                    }else{
                        m.sku2=''
                    }
                    return m
                });
                //console.log(self.materials)
            })



        }
        self.lastYearDate= new Date()
        self.lastYearDate.setDate(-365);
        self.lastQuery={};
        self.materials=[];
        function refreshMaterialsForReturn(searchStr) {
            if(self.item.type=='return' && !self.item.contrAgent){
                exception.catcher('поиск материалов')('выберите контрагента')
                self.materials=[];
                return;
            }
            if(self.item.type=='return' && !self.item.currency){
                exception.catcher('поиск материалов')('выберите валюту')
                self.materials=[];
                return;
            }
            var populate = {
                path:'materials.item',
                select:'name sku'
            }
            var query={actived:true,'virtualAccount':self.item.virtualAccount,date:{'$gt':self.lastYearDate.getTime()},contrAgent:self.item.contrAgent,currency:self.item.currency}
            /*console.log(self.lastQuery.contrAgent!=query.contrAgent)
            console.log(self.lastQuery.currency!=query.currency)
            console.log(self.lastQuery.virtualAccount!=query.virtualAccount)*/
            if(self.lastQuery.contrAgent==query.contrAgent &&  self.lastQuery.currency==query.currency && self.lastQuery.virtualAccount==query.virtualAccount){return}
            Rn.getList({page:0},query,populate)
                .then(function (res) {
                    self.lastQuery = query;
                    //console.log(res);

                    if(res.length){
                        var arr =[];
                        res.forEach(function (rn) {
                            rn.materials.forEach(function (m) {
                                var mm={
                                    _id:m.item._id,
                                    name:m.item.name,
                                    sku:m.item.sku,
                                    price:m.priceForSale,
                                    priceReturn: m.price,
                                    supplier: m.supplier,
                                    supplierType: m.supplierType
                                }
                                arr.push(mm)
                            })
                        })
                        self.materials=arr;
                    }else{
                        self.materials=[];
                    }
                })
                .catch(function (err) {
                    exception.catcher('получение списка товаров',err)
                })

        }
        function deleteItem(idx) {
            self.item.materials.splice(idx,1);
            saveField('materials')
        }
        function changeMaterial(item,idx) {
            console.log(item)

            if(self.item.materials.some(function (m,i) {
                    return m.item && m.item._id==item._id && i!=idx
                })){
                exception.showToaster('error','статус','такая позиция есть в накладной')
                self.item.materials[idx].item=null;
            }else{
                console.log(item)
                if(self.item.type=='return'){
                    self.item.materials[idx].price=self.item.materials[idx].item.price;
                    self.item.materials[idx].priceReturn=self.item.materials[idx].item.priceReturn;
                    self.item.materials[idx].supplier=self.item.materials[idx].item.supplier;
                    self.item.materials[idx].supplierType=self.item.materials[idx].item.supplierType;
                }
                if(item._id=='new'){
                    $q.when()
                        .then(function () {
                            return Material.create(item.name)
                        })
                        .then(function (m) {
                            self.item.materials[idx].item=m;
                            saveField('materials');
                        })
                }else{
                    saveField('materials')
                }
            }
            console.log(self.item.materials)
        }

        function getTotalSum() {
            var sum=self.item.materials.reduce(function(s,m){
                var p = (m.qty*m.price).toFixed(2)
                return s+Number(p)
            },0)
            return (sum).toFixed(2);
        }
        var delay
        function activePN() {
            if(delay || !self.item.materials.length){return}
            //self.item.actived=true
            if(!self.item.actived){
                if(!self.item.materials.length || self.item.materials.some(function(m){return !m.item || !m.qty || !m.price ||  isNaN(Number(m.qty)) ||isNaN(Number(m.price))})){
                    return exception.catcher('проведение накладной')('недопустимые значения')
                }
            }
            if(!self.item.virtualAccount){
                return exception.catcher('проведение накладной')('не выбрано подразделение')
            }
            if(!self.item.contrAgent){
                return exception.catcher('проведение накладной')('не выбран контрагент')
            }
            return $q.when()
                .then(function () {
                    return Items.activePN(self.item)
                })
                .then(function (data) {
                    console.log(data)
                    self.item.actived=!self.item.actived;
                    //saveField('actived')
                })
                .catch(function (err) {
                    exception.catcher('проведение накладной')(err)
                })


        }



    }
})()