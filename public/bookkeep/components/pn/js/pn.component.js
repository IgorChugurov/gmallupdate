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
    itemsCtrl.$inject=['Pn','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','$state','exception']
    function itemsCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,$state,exception){
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

        function createItem() {
            $state.go('frame.pns.pn',{id:'new_'+self.virtualAccount})
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
                delete self.paginate.search
                console.log('Activated pns list View');
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



    }
    itemCtrl.$inject=['Pn','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','exception','$state','Supplier','Material','Worker','Founder','Contragent','Customer']
    function itemCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,exception,$state,Supplier,Material,Worker,Founder,Contragent,Customer){
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
        console.log(global.get('store').val)
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
                    data.materials=data.materials.map(function (m) {
                        if(m.item && m.item.sku2 && m.item.sku2.length){m.item.sku2=m.item.sku2[0]}else{if(typeof m.item!='object'){m.item={}};m.item.sku2=''}
                        return m
                    })
                    if(!data.typeOfContrAgent){
                        data.typeOfContrAgent='Supplier'
                    }
                    self.item=data;
                    if(!self.contrAgents.length){
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

        function saveField(field){
            if(field=='typeOfContrAgent'){
                getContrAgents(self.item[field])
                self.item.contrAgent=null;
            }
            if(!self.item._id){return}

            if(!self.item._id){return}
            var o={_id:self.item._id};
            if(field=='materials'){
                o[field]=self.item[field].filter(function (m) {
                    return m.item && m.item._id
                }).map(function (m) {
                    console.log(m)
                    console.log({item:m.item._id,qty:m.qty,price:m.price})
                    return {item:m.item._id,qty:m.qty,price:m.price}
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
        function deleteItem(idx) {
            self.item.materials.splice(idx,1);
            saveField('materials')
        }
        function changeMaterial(item,idx) {
            //console.log(item)
            if(self.item.materials.some(function (m,i) {
                    return m.item && m.item._id==item._id && i!=idx
                })){
                exception.showToaster('error','статус','такая позиция есть в накладной')
                self.item.materials[idx].item=null;
            }else{
                console.log(item)
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