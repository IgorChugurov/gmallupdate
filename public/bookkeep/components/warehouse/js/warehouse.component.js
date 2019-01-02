(function(){
    angular.module('gmall.directives')
        .directive('warehouse',warehouseDirective)
        .directive('materials',materialsDirective)
        .directive('stockAdjustments',stockAdjustments)
        .directive('stockAdjustment',stockAdjustment)

    function warehouseDirective(){
        return {
            rectrict:'E',
            scope: {},
            bindToController: true,
            controller: warehouseCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/warehouse/warehouse.html',
        }
    };
    function materialsDirective(){
        return {
            rectrict:'E',
            scope: {},
            bindToController: true,
            controller: materialsCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/warehouse/materials.html',
        }
    };
    function stockAdjustments(){
        return {
            rectrict:'E',
            scope: {},
            bindToController: true,
            controller: stockAdjustmentsCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/warehouse/stockAdjustments.html',
        }
    };
    function stockAdjustment(){
        return {
            rectrict:'E',
            scope: {},
            bindToController: true,
            controller: stockAdjustmentCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/warehouse/stockAdjustment.html',
        }
    };

    warehouseCtrl.$inject=['$scope','Material','$state','global','$timeout','$anchorScroll','Confirm','$q','$uibModal','GlobalService','$http','exception'];
    function warehouseCtrl($scope,Items,$state,global,$timeout,$anchorScroll,Confirm,$q,$uibModal,GlobalService,$http,exception) {
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.$state = $state;
        self.Items = Items;
        self.moment = moment;
        self.query = {};
        self.paginate = {page: 0, rows: 100, totalItems: 0}
        self.typeOfContrAgents=typeOfContrAgents;
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
        self.where ='warehouse'
        //console.log(self.virtualAccount)

        self.getList = getList;
        $scope.getList=getList;

        self.searchItems = searchItems;

        self.getcontrAgentTypeName=getcontrAgentTypeName;
        self.filterItems=filterItems;
        self.getDetail=getDetail;
        self.setWhere=setWhere;
        self.makeBalances=makeBalances;
        self.changeVirtualAccount=changeVirtualAccount;
        self.refreshList=refreshList;
        self.saveField=saveField;

        function saveField(item,field) {
            if(!item._id){return}
            var o={_id:item._id};
            if(field=='sku2'){
                o['sku2.0']=item.sku2[0]
            }else{
                o[field]=item[field]
            }


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

        function changeVirtualAccount() {
            if(self.virtualAccount){
                self.query['data.virtualAccount']=self.virtualAccount;
            }else{
                delete self.query['data.virtualAccount']
            }
            activate()
        }


        self.clearSearch=function () {
            console.log('dddd')
            self.searchStr=''
        }

        //*******************************************************
        activate();

        function activate() {

            return getList().then(function () {
            }).then(function () {
            });
        }

        function getList() {
            return Items.getList(self.paginate, self.query)
                .then(function (results) {
                    //console.log(JSON.parse(JSON.stringify(results)))
                    results.forEach(function (m) {
                        //console.log(m)
                        /*if(!m.qty){m.qty=0;}
                        if(!m.price){m.price=0;}
                        if(!m.priceForSale){m.priceForSale=0;}
                        m.sum=(m.qty*m.price).toFixed(2)
                        m.price=(Number(m.price)).toFixed(2)
                        m.priceForSale=(Number(m.priceForSale)).toFixed(2)*/
                        m.qty=0
                        m.price=0
                        m.sum=0;
                        m.priceForSale=0
                        m.sumForSale=0
                        m.reserveQty=0;
                        m.manufactureQty=0;

                        //console.log(self.virtualAccount,m.data)
                        if(self.virtualAccount){
                            m.data=m.data.filter(function (d) {
                                return ((d.virtualAccount && d.virtualAccount._id)?d.virtualAccount._id:d.virtualAccount)==self.virtualAccount
                            })
                        }

                        m.data.forEach(function (d) {
                            d.qty=Math.round(d.qty*10000)/10000;
                            d.sum=(d.qty*d.price).toFixed(2)
                            //d.virtualAccount=self.virtualAccounts[d.virtualAccount]
                            if(d.reserve && d.reserve.length){
                                d.reserveQty=d.reserve.reduce(function (qty,item) {
                                   return qty+Math.round(item.qty*100)/100;
                                },0)
                            }else{
                                d.reserveQty=0;
                            }
                            if(d.manufacture && d.manufacture.length){
                                d.manufactureQty=d.manufacture.reduce(function (qty,item) {
                                    return qty+Math.round(item.qty*100)/100;
                                },0)
                            }else{
                                d.manufactureQty=0;
                            }
                            m.qty+=d.qty;
                            m.sum+=Math.round((d.qty*d.price)*100)/100
                            m.sumForSale+=Math.round((d.qty*d.priceForSale)*100)/100
                            m.reserveQty+=d.reserveQty;
                            m.manufactureQty+=d.manufactureQty;
                        })
                        if(m.qty){
                            m.price = Math.round((m.sum/m.qty)*100)/100
                            m.priceForSale = Math.round((m.sumForSale/m.qty)*100)/100
                        }
                        m.sum = Math.round(m.sum*100)/100;
                        //console.log(m)


                    })
                    self.items = results/*.filter(function (m) {
                        return m.qty
                    });*/
                    self.paginate.totalItems=self.items.length;
                    //console.log(self.items)
                });
        }


        function searchItems(searchStr) {
            if (searchStr) {
                self.paginate.search=searchStr.substring(0, 50)
                //self.query = {search: searchStr.substring(0, 50)};
            }
            self.query = {};

            self.paginate.page = 0;
            return getList().then(function () {
                delete self.paginate.search
                console.log('Activated search list View');
            });
        }
        function getcontrAgentTypeName(type) {
            if(type){
                var a = self.typeOfContrAgents.getOFA('type',type)
                if(a){
                    return a.name
                }
            }
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
        function getDetail(id,virtualAccount) {
            console.log(id)
            GlobalService.getDocs('Material',id,virtualAccount)

        }
        function setWhere(data) {
            self.where=data;

        }
        function makeBalances() {
            $q.when()
                .then(function () {
                    var va =(self.virtualAccount)?self.virtualAccount:'allVirtualAccounts';
                    var url = '/api/bookkeep/sa/makeBalances/'+va;
                    return $http.get(url)
                })
                .then(function () {
                    //console.log('$scope.$parent.getParentList',$scope.$parent.getParentList)
                    exception.showToaster('info','формирование остатков','обновлено')
                    getList()
                })
                .catch(function(err){
                    err = err.data||err
                    exception.catcher('формирование остатков')(err)
                });
        }
        function refreshList() {
            activate()
        }
    }

    materialsCtrl.$inject=['$scope','Material','$state','global','$timeout','$anchorScroll','Confirm','$q','$uibModal','GlobalService','$http','exception','Producer'];
    function materialsCtrl($scope,Items,$state,global,$timeout,$anchorScroll,Confirm,$q,$uibModal,GlobalService,$http,exception,Producer) {
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
            //console.log(item)
            if(!item._id){return}
            var o={_id:item._id};
            if(field=='sku2'){
                var arr=[item.sku22];
                if(item.sku2 && item.sku2.length && typeof item.sku2=='object'){
                    arr=item.sku2;
                    arr[0]=item.sku22
                }
                o['sku2']=arr;
            }else{
                o[field]=item[field]
            }

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


    stockAdjustmentsCtrl.$inject=['$scope','StockAdjustment','$state','global','$timeout','$anchorScroll','Confirm','$q','exception'];
    function stockAdjustmentsCtrl($scope,Items,$state,global,$timeout,$anchorScroll,Confirm,$q,exception) {
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.$state = $state;
        self.query = {};
        self.paginate = {page: 0, rows: 20, totalItems: 0}

        self.getList = getList;
        $scope.getList=getList;
        $scope.getParentList=$scope.$parent.getList;
        self.searchItems = searchItem;
        self.createItem=createItem;
        self.deleteItem=deleteItem;
        $scope.getList=getList;


        var delay;
        function createItem() {
            if(delay){return}
            delay=true
            $q.when()
                .then(function () {
                    return Items.createItem()
                })
                .then(function (res) {
                    delay=false;
                    $state.go('frame.warehouse.stockadjustments.item',{id:res._id})
                })
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
                        //if(!d.diff && d.diff!=0){d.diff='0.00'}else{d.diff=(d.diff).toFixed(2)}
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


    stockAdjustmentCtrl.$inject=['$scope','StockAdjustment','$stateParams','global','$q','$uibModal','$timeout','Confirm','exception','$state','Supplier','$http','Material','Worker','Founder','Contragent','Customer']
    function stockAdjustmentCtrl($scope,Items,$stateParams,global,$q,$uibModal,$timeout,Confirm,exception,$state,Supplier,$http,Material,Worker,Founder,Contragent,Customer){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.item={date:new Date(),materials:[{item:null,qty:0,price:0}]}
        self.currencyArr=global.get('store').val.currencyArr;
        self.currency = global.get('store').val.mainCurrency;

        self.models={
            Supplier:Supplier,
            Worker:Worker,
            Founder:Founder,
            Contragent:Contragent,
            Customer:Customer
        }

        self.virtualAccounts=global.get('virtualAccounts').val.reduce(function (o,item) {
            o[item._id]=item
            return o;
        },{});



        $scope.dateOptions = {
            startingDay: 1
        };
        self.newMaterial={}
        self.qty=1;
        self.price=1;
        self.priceForSale=1;

        self.saveField=saveField;
        //self.deleteItem=deleteItem;
        self.getQty=getQty;
        self.getSum=getSum;
        self.editData=editData;
        self.activeSA=activeSA;
        self.getDiff=getDiff;
        self.typeOfContrAgents=typeOfContrAgents;
        self.getcontrAgentTypeName=getcontrAgentTypeName;
        self.makeBalances=makeBalances;
        self.getContrAgents=getContrAgents;
        self.createItem=createItem;
        self.changeNewMaterial=changeNewMaterial;

        self.refreshData=refreshData;

        self.getDiffForMaterial=getDiffForMaterial;
        self.clearMaterials=clearMaterials;

        function getDiffForMaterial(m) {
            if(!m || !m.data || !m.data.length){return}
            var diff=0,qty=0,sum=0,newQty=0;
            m.data.forEach(function (d) {
                d.man= {qty:0,newQty:0,newSum:0};
                if(d.manufacture && d.manufacture.length){
                    d.manufacture.forEach(function (man) {
                        d.man.qty+=man.qty
                        d.man.newQty+=man.newQty
                        man.sum = d.price*man.qty
                        man.newSum = Math.round((d.price*man.newQty)*100)/100;
                        d.man.newSum=man.newSum;
                    })
                }


                d.sum=Math.round((d.qty*d.price)*100)/100
                d.newSum=Math.round((d.newQty*d.newPrice)*100)/100
                d.diff=Math.round((d.newSum-d.sum)*100)/100
                diff+=d.diff;
                sum+=d.sum+d.man.newSum;
                newQty+=d.newQty+d.man.newQty
                qty+=d.qty+d.man.qty
                //d.virtualAccount=self.virtualAccounts[d.virtualAccount]
                //console.log(d)
            })
            m.diff=diff;
            m.sum=sum;
            m.qty=qty;
            m.newQty=newQty;
            return m.diff
        }

        function changeNewMaterial(m) {
            //console.log(m)
            self.newMaterial=m;
            self.price=m.price;
            self.priceForSale=m.priceForSale;

            //self.materials=null
        }
        function clearMaterials() {
            self.materials=null
        }

        function refreshData(searchStr) {
            var q= {search:searchStr}
            if(!searchStr){
                self.materials=null
                return
            }
            delete self.newMaterial._id
            Material.query(q,function (res) {

                self.materials=res.map(function (m) {
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


        function getcontrAgentTypeName(type) {
            if(type){
                var a = self.typeOfContrAgents.getOFA('type',type)
                if(a){
                    return a.name
                }
            }
        }



        activate()

        function activate() {
            $q.when()
                .then(function (result) {
                    if($stateParams.id!='new'){
                        return getItem($stateParams.id)
                    }
                })
                .then(function (result) {
                    //console.log(result)
                    self.typeOfContrAgent='Supplier';
                    getContrAgents(self.typeOfContrAgent)

                })

                .then(function () {})
                .catch(function(err){
                    err = err.data||err
                    exception.catcher('получение инвентаризации')(err)
                });


        }
        function getItem(id) {
            //console.log(id)
            return self.Items.getItem(id)
            //console.log(id)
                .then(function(data) {
                    console.log(data)
                    data.date= new Date(data.date)
                    data.materials=data.materials.filter(function (m) {
                        m.diff=0;
                        m.sum = 0
                        m.data.forEach(function (d) {
                            d.man= {qty:0,newQty:0};
                            if(d.manufacture && d.manufacture.length){
                                d.manufacture.forEach(function (man) {
                                    d.man.qty+=man.qty
                                    d.man.newQty+=man.newQty
                                    man.sum = (d.price*man.qty).toFixed(2)
                                    man.newSum = (d.price*man.newQty).toFixed(2)
                                })
                            }
                            d.sum=Math.round((d.qty*d.price)*100)/100
                            d.newSum=Math.round((d.newQty*d.newPrice)*100)/100
                            d.diff=Math.round((d.newSum-d.sum)*100)/100
                            m.diff+=d.diff;
                            m.sum+=d.sum;
                        })
                        //console.log(m)
                        return m
                    })
                    if(typeof data.diff=='undefined'){
                        data.diff=0;
                    }
                    self.item=data;
                    //self.item.actived=true;
                } ).catch(function(err){
                    console.log(err)
                });
        }



        function saveField(field,value){
            if(!self.item._id){return}
            var o={_id:self.item._id};
            if(field=='materials'){
                return;
                o[field]=self.item[field].filter(function (m) {
                    return m.item && m.item._id
                }).map(function (m) {
                    console.log(m)
                    console.log({item:m.item._id,qty:m.qty,price:m.price})
                    return {item:m.item._id,qty:m.qty,price:m.price}
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
                        var query = {actived:true,date:{$gt:d},virtualAccount:self.item.virtualAccount}
                        return self.Items.getList({page:0,rows:1},query)
                    }

                })
                .then(function (sas) {
                    if(sas && sas.length){
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

        function setEmpty(){
            return $q.when()
                .then(function () {
                    return Items.activeSA(self.item)
                })
                .then(function (res) {
                    console.log(res)
                    if(res && res.data){
                        self.item.diff=res.data.diff
                    }
                    self.item.actived=!self.item.actived;
                    $scope.$parent.getList()
                    if($scope.$parent.getParentList){
                        $scope.$parent.getParentList()
                    }
                })
                .catch(function (err) {
                    console.log(err)
                    exception.catcher('проведение инвентаризации')(err)
                })

        }

        var delay;
        function activeSA() {
            if(delay){return}

            return $q.when()
                .then(function () {
                    return Items.activeSA(self.item)
                })
                .then(function (res) {
                    console.log(res)
                    if(res && res.data){
                        self.item.diff=res.data.diff
                    }
                    self.item.actived=!self.item.actived;
                    $scope.$parent.getList()
                    if($scope.$parent.getParentList){
                        $scope.$parent.getParentList()
                    }
                })
                .catch(function (err) {
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

                    if(res && res.data){
                        self.item.diff=res.data.diff
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
                //console.log(item.man[field])
               return o+=(item[field]+item.man[field])
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
            console.log(self.item.materials[idx])
            return $q(function(resolve,reject){
                var options={
                    animation: true,
                    restrict:"E",
                    resolve:{
                        item:function () {
                            return self.item.materials[idx]
                        },
                        account :function () {
                            return self.item.virtualAccount;
                        },
                    },
                    templateUrl: 'bookkeep/components/warehouse/editSAData.html',
                    controller: function($uibModalInstance,global,Supplier,Customer,Founder,Worker,Contragent,item,account){
                        //console.log(account)

                        var self=this;
                        self.models={
                            Supplier:Supplier,
                            Customer,Customer,
                            Founder:Founder,
                            Worker:Worker,
                            Contragent:Contragent
                        }
                        self.item=angular.copy(item);
                        self.currency=self.item.item.currency
                        self.virtualAccounts=global.get('virtualAccounts').val
                        self.typeOfContrAgent='Supplier';
                        self.contrAgents=[];

                        self.changeContrAgetnType=changeContrAgetnType;
                        account = self.virtualAccounts.getOFA('_id',account)
                        self.ok=ok;
                        self.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                        activate()

                        function activate() {
                            changeContrAgetnType(self.typeOfContrAgent)
                        }

                        self.addRow=addRow;
                        self.typeOfContrAgents=typeOfContrAgents;
                        self.getcontrAgentTypeName=getcontrAgentTypeName;
                        function getcontrAgentTypeName(type) {
                            if(type){
                                var a = self.typeOfContrAgents.getOFA('type',type)
                                if(a){
                                    return a.name
                                }
                            }
                        }

                        function ok(){
                            var neNorm = self.item.data.some(function (d) {
                                return isNaN(Number(d.newPrice)) || isNaN(Number(d.newPriceForSale)) || isNaN(Number(d.newQty)) || (Number(d.newQty)!=0 && (Number(d.newPrice)==0 || Number(d.newPriceForSale)==0))
                            })
                            if(neNorm){
                                return exception.catcher('сохранение данных')('недопустимые значения')
                            }

                            self.item.data.forEach(function (d) {
                                //console.log(d)
                                d.newPrice=(isNaN(Number(d.newPrice)))?0:Number(d.newPrice);
                                d.newPriceForSale=(isNaN(Number(d.newPriceForSale)))?0:Number(d.newPriceForSale);
                                d.newQty=(isNaN(Number(d.newQty)))?0:Number(d.newQty);
                            })

                            $uibModalInstance.close(self.item);
                        }
                        function changeContrAgetnType(type) {
                            return $q.when()
                                .then(function () {
                                    if(self.models[type]){
                                        return self.models[type].getList({page: 0, rows: 1000, totalItems: 0},{})
                                    }
                                })
                                .then(function (agents) {
                                    if(agents){
                                        self.contrAgents=agents
                                    }
                                })
                        }
                        function addRow() {
                            //console.log(self.qty,self.supplier)
                            if(self.qty  && self.supplier && !self.item.data.some(function (d) {return d.supplier._id==self.supplier._id})){
                                var o={
                                    qty:0,
                                    newQty:self.qty,
                                    supplier:self.supplier,
                                    supplierType:self.typeOfContrAgent,
                                    price:0,
                                    newPrice:0,
                                    priceForSale:0,
                                    newPriceForSale:0
                                }
                                self.item.data.push(o)
                                console.log(self.item.data)
                                self.supplier=null;
                                self.qty=0;
                            } else {
                                exception.catcher('добавление данных')('проверьте значения')
                            }
                        }
                    },
                    controllerAs:'$ctrl',
                }
                    $uibModal.open(options).result
                    .then(function (item) {
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

                        //console.log(item)
                        var field='materials.'+idx+'.data';
                        var value = item.data.map(function (d) {
                            var manufacture=[];
                            if(d.manufacture && d.manufacture.length){
                                manufacture = d.manufacture.map(function (man) {
                                    return {
                                        rn:man.rn._id,
                                        qty:man.qty,
                                        newQty:man.newQty
                                    }
                                })
                            }
                            return {
                                supplier:d.supplier._id,
                                supplierType:d.supplierType,
                                price:d.price,
                                newPrice:d.newPrice,
                                qty:d.qty,
                                newQty:d.newQty,
                                priceForSale:d.priceForSale,
                                newPriceForSale:d.newPriceForSale,
                                sum:d.sum,
                                newSum:d.newSum,
                                manufacture:manufacture
                            }
                        })
                        self.item.materials[idx]=item;
                        console.log(value)
                        saveField(field,value)

                    })

        }

        function makeBalances() {
            $q.when()
                .then(function () {
                    var url = '/api/bookkeep/sa/makeBalances/'+self.item.virtualAccount._id+'?sa='+self.item._id;
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

        function getContrAgents(type) {
            return $q.when()
                .then(function () {
                    if(self.models[type]){
                        return self.models[type].getList({page: 0, rows: 1000, totalItems: 0},{})
                    }
                })
                .then(function (agents) {
                    if(agents){

                        self.contrAgents=agents
                        self.contrAgent = self.contrAgents[0];
                    }
                })
        }
        function createItem() {
            if(!self.newMaterial._id){
                return exception.catcher('добавление материала')('не выбран материал')
            }
            if(!self.contrAgent){
                return exception.catcher('добавление материала')('контрагент')
            }
            /*console.log(self.typeOfContrAgent)
            console.log(self.contrAgent)
            console.log(self.newMaterial)*/
            if(self.item.materials.some(function (m) {
                    return m.data.some(function (d) {
                        return m.item._id===self.newMaterial._id&&d.supplierType===self.typeOfContrAgent&&d.supplier._id==self.contrAgent._id
                    })
                })){
                return exception.catcher('добавление материала')('такой материал есть в инвентаризации')
            }
            var m,newMaterial,idx;
            for(var i=0;i<self.item.materials.length;i++){
                if(self.item.materials[i].item._id===self.newMaterial._id){
                    m=self.item.materials[i]
                    idx=i;
                    break;
                }
            }
            //console.log(m)
            if(!m){
                newMaterial=true;
                m={
                    item:self.newMaterial,
                    data:[]
                }
                self.item.materials.push(m)
            }
            var o={
                qty:0,
                price:0,
                priceForSale:0,
                newQty:self.qty,
                newPrice:self.price,
                newPriceForSale:self.priceForSale,
                supplier:self.contrAgent,
                supplierType:self.typeOfContrAgent,
                manufacture: []
            }
           // console.log(o)
            m.data.push(o)
            //self.contrAgent=null
            //exception.showToaster('info','позиция добавлена и будет сохранена после внесения количества')
            /*self.newMaterial={}
            self.contrAgent=null;*/
            self.newMaterial={}
            self.qty=1;
            self.price=1;
            self.priceForSale=1;

            if(newMaterial){
                var field='materials.'+(self.item.materials.length-1)
                var value = m.data.map(function (d) {
                    return {
                        supplier:d.supplier._id,
                        supplierType:d.supplierType,
                        price:d.price,
                        newPrice:d.newPrice,
                        qty:d.qty,
                        newQty:d.newQty,
                        priceForSale:d.priceForSale,
                        newPriceForSale:d.newPriceForSale,
                        manufacture:[]
                    }
                })
                value={item:m.item._id,data:value}
            }else{
                var field='materials.'+idx+'.data';
                var value = m.data.map(function (d) {
                    var manufacture=[];
                    if(d.manufacture && d.manufacture.length){
                        manufacture = d.manufacture.map(function (man) {
                            return {
                                rn:man.rn._id,
                                qty:man.qty,
                                newQty:man.newQty
                            }
                        })
                    }
                    return {
                        supplier:d.supplier._id,
                        supplierType:d.supplierType,
                        price:d.price,
                        newPrice:d.newPrice,
                        qty:d.qty,
                        newQty:d.newQty,
                        priceForSale:d.priceForSale,
                        newPriceForSale:d.newPriceForSale,
                        manufacture:manufacture
                    }
                })
            }


            //console.log(field,value)
            saveField(field,value)



        }



    }



    angular.module('gmall.services')
        .service('StockAdjustment', StockAdjustmentService);
    StockAdjustmentService.$inject=['$resource','$uibModal','$q','$http'];
    function StockAdjustmentService($resource,$uibModal,$q,$http){
        var Items= $resource('/api/collections/StockAdjustment/:_id',{_id:'@_id'});
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
            var status = (!sa.actived)?'hold':'cancel';
            //status='hold'
            var url = '/api/bookkeep/sa/'+status+'/'+sa._id;
            return $http.get(url)
        }
        function getDiff(sa) {
            return $q.when().then(function () {
                var url = '/api/bookkeep/sa/diff/'+sa._id;
                return $http.get(url)
            })


        }
        function createItem() {
            return $q(function(resolve,reject){
                var options={
                    animation: true,
                    restrict:"E",
                    templateUrl: 'bookkeep/components/warehouse/createSA.html',
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
                .then(function (va) {
                    self.item={name:'Инвентаризация ',num:1,materials:[],virtualAccount:va._id}
                    return Items.save(self.item).$promise
                })
        }
    }

})()