'use strict';
(function(){
    angular.module('gmall.directives')
        .directive('zakazs',zakazsDirective)
        .directive('zakaz',zakazDirective)

    function zakazsDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemsCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/zakaz/zakazs.html',
        }
    }
    function zakazDirective(){
        return {
            scope: {},
            bindToController: true,
            controller: itemCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'bookkeep/components/zakaz/zakaz.html',
        }
    }
    itemsCtrl.$inject=['Zakaz','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','$state','exception','$attrs']
    function itemsCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,$state,exception,$attrs){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.$state = $state;
        self.query = {};
        self.paginate = {page: 0, rows: 20, totalItems: 0}

        if($attrs.type=='order'){
            self.typeOfZakaz = 'ZakazOrder'
        }else if($attrs.type=='manufacture'){
            self.typeOfZakaz = 'ZakazManufacture'
        }

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
        self.query = {virtualAccount:self.virtualAccount,type:$attrs.type};
        if($stateParams.va){
            self.query.virtualAccount=$stateParams.va;
            self.virtualAccount=$stateParams.va
        }
        self.getList = getList;
        self.searchItems = searchItems;
        self.createItem=createItem;
        self.deleteItem=deleteItem;
        self.changeVirtualAccount=changeVirtualAccount;
        self.goToZakaz=goToZakaz;
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

        function createItem() {
            $state.go('frame.'+self.typeOfZakaz+'.item',{id:'new_'+self.virtualAccount})
        }

        activate();

        function activate() {
            self.paginate.page=0;
            self.query = {virtualAccount:self.virtualAccount,type:$attrs.type};
            return getList().then(function () {
            }).then(function () {
            });
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
                delete self.paginate.search
            }
            /*self.query = {};
            self.virtualAccount=null;
            self.paginate.page = 0;*/
            self.paginate.page = 0;
            return getList().then(function () {
                delete self.paginate.search
                console.log('Activated Zakazs list View');
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
            self.menuSlide2=false;
            self.query.virtualAccount=self.virtualAccount;
            activate()
        }
        function goToZakaz(item) {
            $state.go('frame.'+self.typeOfZakaz+'.item',{id:item._id})
        }


    }
    itemCtrl.$inject=['Zakaz','$stateParams','global','$q','$uibModal','$timeout','$scope','Confirm','exception','$state','Supplier','Material','Worker','Founder','Contragent','Customer','$attrs']
    function itemCtrl(Items,$stateParams,global,$q,$uibModal,$timeout,$scope,Confirm,exception,$state,Supplier,Material,Worker,Founder,Contragent,Customer,$attrs){
        var self = this;
        self.mobile = global.get('mobile').val;
        self.global = global;
        self.Items = Items;
        self.moment = moment;
        self.item={date:new Date(),materials:[{item:null,qty:0,price:0}],typeOfContrAgent:'Customer',type:$attrs.type}
        self.currencyArr=global.get('store').val.currencyArr
        self.item.currency=self.currencyArr[0];
        self.sumsW={}
        self.sumsM={}
        self.sumsMIncome={}
        self.totalSums={}
        self.currencyArr.forEach(function (c) {
            self.sumsW[c]=0;
            self.sumsM[c]=0;
            self.sumsMIncome[c]=0;
            self.totalSums[c]=0;
        })
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
        self.typesOfZakaz=typesOfZakaz;

        self.dateOptions = {
            startingDay: 1
        };
        self.workers=[];


        self.createItem=createItem;
        self.saveField=saveField;
        self.addRow=addRow;
        self.refreshMaterials=refreshMaterials;
        self.deleteItem=deleteItem;
        self.changeMaterial=changeMaterial;
        self.getTotalSum=getTotalSum;
        self.activeZakaz=activeZakaz;
        self.back=back;
        function back() {
            var sref = ($attrs.type=='order')?frame.ZakazOrder:'frame.ZakazManufacture'
            $state.go(sref)
        }




        activate()
        $scope.$on('$destroy', function() {
            setDataToList()
        });
        function setDataToList() {
            //console.log($scope.$parent.items)
            for(let i=0;i<$scope.$parent.items.length;i++){
                if($scope.$parent.items[i]._id==self.item._id){
                    //console.log(self.item._id)
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
            //console.log(111)
            $q.when()
                .then(function () {})
                .then(function () {
                    if(self.$stateParams[0]=='new'){
                        return Customer.getList({page: 0, rows: 1000, totalItems: 0},{})
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
                    exception.catcher('иницализация')(err)
                });


        }
        function getItem(id) {
            //console.log(id)
            return self.Items.getItem(id)
            //console.log(id)
                .then(function(data) {
                    //console.log(data)
                    data.date= new Date(data.date)
                    if(data.rns && data.rns.length){
                        data.materials = data.rns.reduce(function (materials,rn) {
                            if(rn && rn.materials && rn.materials.length){
                                rn.materials.forEach(function (m) {

                                    m.linkData={
                                        name:rn.name+ " ("+((rn.actived)?'проведена':'не проведена')+")",
                                        uisref:'frame.Rn.item',
                                        id:rn._id
                                    }
                                    m.item.sku2 = (m.item.sku2 && m.item.sku2.length)?m.item.sku2[0]:''
                                    self.sumsM[rn.currency]+=m.sum;
                                    self.sumsM[rn.currency]=Math.round(self.sumsM[rn.currency]*100)/100
                                    //m.sum=(m.sum).toFixed(2)
                                    m.currency=rn.currency
                                    materials.push(m);

                                })
                            }
                            return materials;
                        },[])
                    }
                    if(data.pns && data.pns.length){
                        data.materialsIncome = data.pns.reduce(function (materials,pn) {
                            if(pn && pn.materials && pn.materials.length){
                                pn.materials.forEach(function (m) {

                                    m.linkData={
                                        name:pn.name+ " ("+((pn.actived)?'проведена':'не проведена')+")",
                                        uisref:'frame.pns.pn',
                                        id:pn._id
                                    }
                                    m.item.sku2 = (m.item.sku2 && m.item.sku2.length)?m.item.sku2[0]:''
                                    m.sum = Math.round((m.qty*m.price)*100)/100;
                                    self.sumsMIncome[pn.currency]+=m.sum;
                                    //self.sumsMIncome[pn.currency]=Math.round(self.sumsM[pn.currency]*100)/100
                                    //m.sum=(m.sum).toFixed(2)
                                    m.currency=pn.currency
                                    materials.push(m);

                                })
                            }
                            return materials;
                        },[])
                    }
                    self.totalSumWork=0;
                    if(data.acts && data.acts.length){
                        data.works = data.acts.reduce(function (works,act) {
                            if(act && act.works && act.works.length){
                                act.works.forEach(function (m) {
                                    console.log(m.item)
                                    m.linkData={
                                        name:act.name+ " ("+((act.actived)?'проведена':'не проведена')+")",
                                        uisref:'frame.Act.item',
                                        id:act._id
                                    }
                                    self.sumsW[act.currency]+=m.price;
                                    self.sumsW[act.currency]=Math.round(self.sumsW[act.currency]*100)/100
                                    m.currency=act.currency
                                    m.price=(m.price).toFixed(2)
                                    works.push(m)
                                })
                            }
                            return works;
                        },[])
                    }
                    /*data.materials=data.materials.map(function (m) {
                        if(m.item && m.item.sku2 && m.item.sku2.length){m.item.sku2=m.item.sku2[0]}else{m.item={};m.item.sku2=''}
                        return m
                    })*/
                    if(!data.typeOfContrAgent){
                        data.typeOfContrAgent='Supplier'
                    }
                    self.item=data;
                    self.currencyArr.forEach(function (c) {
                        self.totalSums[c]=self.sumsW[c]+self.sumsM[c];
                    })
                    //console.log('self.item.currency',data.currency)
                    if(!self.contrAgents.length){
                        return getContrAgents(data.typeOfContrAgent)
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
                return exception.catcher('создание ордера')('нет названия')
            }
            if(!self.item.contrAgent){
                return exception.catcher('создание ордера')('нет контрагента')
            }
            if(!self.item.currency){
                return exception.catcher('создание накладной')('нет валюты')
            }

            if(!self.item.worker){
                return exception.catcher('создание накладной')('нет сотрудника')
            }
            $q.when()
                .then(function () {
                    return Items.save(self.item).$promise
                })
                .then(function (res) {
                    console.log(res)
                    self.item._id=res._id
                    if(hold){
                        return activeR()
                    }
                })
                .then(function () {
                    $state.go('frame.Zakaz', {va:self.item.virtualAccount}, { reload: true })
                })
        }

        function saveField(field){
            if(field=='typeOfContrAgent'){
                getContrAgents(self.item[field])
                self.item.contrAgent=null;
            }
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
                saveField('materials')
            }
        }

        function getTotalSum() {
            if(!self.item.materials || self.item.materials.lentth){return}
            var sum=self.item.materials.reduce(function(s,m){
                var p = (m.qty*m.price).toFixed(2)
                return s+Number(p)
            },0)
            return (sum).toFixed(2);
        }
        var delay
        function activeZakaz() {
            //self.item.actived=true
            if(!self.item.virtualAccount){
                return exception.catcher('проведение наряда')('не выбрано подразделение')
            }
            if(!self.item.contrAgent){
                return exception.catcher('проведение наряда')('не выбран контрагент')
            }
            if(!self.item.currency){
                return exception.catcher('проведение наряда')('не выбрана валюта')
            }
            return $q.when()
                .then(function () {
                    return Items.activeZakaz(self.item)
                })
                .then(function (data) {
                    self.item.actived=!self.item.actived;
                    console.log(data)
                    if(self.item.actived){
                        exception.showToaster('info','документ проведен')
                    }else{
                        exception.showToaster('info','отменено проведение документа')
                    }
                })
                .catch(function (err) {
                    exception.catcher('проведение заказа')(err)
                })


        }



    }



    angular.module('gmall.services')
        .service('Zakaz', ZakazService);
    ZakazService.$inject=['$resource','$uibModal','$q','$http'];
    function ZakazService($resource,$uibModal,$q,$http){
        var Items= $resource('/api/collections/Zakaz/:_id',{_id:'@_id'});
        return {
            getList:getList,
            getItem:getItem,
            save:Items.save,
            delete:Items.delete,
            query:Items.query,
            get:Items.get,
            activeZakaz:activeZakaz
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

        function activeZakaz(zakaz) {
            console.log(zakaz)
            var status = (!zakaz.actived)?'hold':'cancel';
            //status='hold'
            var url = '/api/bookkeep/Zakaz/'+status+'/'+zakaz._id;
            return $http.get(url)
        }
    }
})()