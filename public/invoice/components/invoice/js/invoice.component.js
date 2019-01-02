(function() {
    angular.module('gmall.directives')
        .directive('invoices', invoiceItems)
        .directive('invoice', invoiceItem);

    function invoiceItems() {
        return {
            bindToController: true,
            scope: {},
            controllerAs: '$ctrl',
            controller: itemsCtrl,
            templateUrl: function () {
                return 'invoice/components/invoice/invoices.html';
            }
        };
        itemsCtrl.$inject = ['Invoice','$scope', '$state','$rootScope', '$resource', '$uibModal', '$http', '$q', '$timeout','global',  'exception', 'Confirm'];
        function itemsCtrl(Invoice,$scope,$state, $rootScope, $resource, $uibModal, $http, $q, $timeout,global, exception, Confirm) {
            var self = this;
            self.mobile = global.get('mobile').val;
            self.global = global;
            self.$state = $state;
            self.Items = Invoice;
            self.moment = moment;
            self.query = {};
            self.paginate = {page: 0, rows: 100, totalItems: 0}


            self.unitOfMeasure=global.get('unitOfMeasure').val
            self.currencyArr=global.get('store').val.currencyArr
            //console.log(self.virtualAccount)

            self.getList = getList;
            $scope.getList=getList;

            self.searchItems = searchItems;


            self.refreshList=refreshList;
            self.saveField=saveField;
            self.editJobTicket=editJobTicket;

            function saveField(item,field) {
                console.log(item)
                if(!item._id){return}
                var o={_id:item._id};
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
                return self.Items.getList(self.paginate, self.query)
                    .then(function (results) {
                        //console.log(results)
                        results.forEach(function (r) {
                            r.date = moment(r.date).format('LLL')
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
                if(self.vin){
                    if(item.vin.toLowerCase().indexOf(self.vin.toLowerCase())>-1){
                        return item;
                    }
                }else{
                    return item;
                }

            }
            function refreshList() {
                activate()
            }
            function editJobTicket(jobTicket){
                //console.log('dd');
                var id =(jobTicket)?jobTicket._id:'';
                $rootScope.$state.transitionTo('frame.invoices.item',{'id':id});

            }











            $scope.deleteJobTicket = function(jobTicket){
                var modalInstance = $modal.open({templateUrl: 'myModalContentD.html',controller: ModalInstanceCtrlD,size: 'sm'});

                modalInstance.result.then(function (pswd) {
                    if (pswd=='2911'){
                        jobTicket.$delete(function(err){
                            //if (err) console.log(err);
                            $scope.afterSave();
                        });
                    }
                }, function () {
                    console.log('Modal dismissed at: ' +  Date.now());
                });
            }
            var ModalInstanceCtrlD = function ($scope, $uibModalInstance) {
                $scope.pswd = '2';
                $scope.ok = function (pswd) {
                    $uibModalInstance.close(pswd);
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            }

            $scope.recalculateJobTicket = function(jobTicket){
                if (confirm("Уверен?")){
                    Convert.get({type:'ticket',id:jobTicket._id},function(res){
                        $scope.afterSave();
                        alert(res.msg)
                    });
                }
            }

            $scope.getTotalJobs = function(item){

                //console.log(jobs);
                var sum = 0;
                if (item && item.jobs && item.jobs.length){
                    for(var i= 0,l=item.jobs.length;i<l;i++){
                        var j = item.jobs[i];
                        sum += Math.round(j.sum*100)/100 || Math.round(j.norma*j.q*$scope.normaHour*100)/100;
                    }
                }

                //console.log(sum);
                item.sumJob = sum;
                return sum;
            }
            $scope.getTotalSparks = function(item){
                var sparks = item.sparks;
                console.log(sparks);
                var sum = 0;
                if (sparks && sparks.length){
                    for(var i= 0,l=sparks.length;i<l;i++){
                        sum +=Math.round(sparks[i].price*100)/100
                    }
                }
                item.sumSpark = sum;
                return sum
            }
            $scope.getTotalPay = function(item){
                var pay =item.pay;
                var sum = 0;
                if (pay && pay.length){
                    for(var i= 0,l=pay.length;i<l;i++){
                        sum +=pay[i].val
                    }
                }

                return sum
            }

        }
    }

    function invoiceItem() {
        return {
            bindToController: true,
            scope: {},
            controllerAs: '$ctrl',
            controller: itemCtrl,
            templateUrl: function () {
                return 'invoice/components/invoice/invoice.html';
            }
        };
        itemCtrl.$inject = ['Invoice','$scope','$rootScope','$resource','$uibModal','$http','$q','$timeout','$checkBeforClose','exception','Confirm','global','$addNewWork','$addNewSpark'];
        function itemCtrl (Invoice,$scope,$rootScope,$resource,$uibModal,$http,$q,$timeout,$checkBeforClose,exception,Confirm,global,$addNewWork,$addNewSpark) {
            var self = this;
            self.Items = Invoice;
            $scope.moment=moment;
            $scope.config=$rootScope.config;
            self.config = $rootScope.config;
            var workingHour= {
                'UAH':400,
                'USD':12,
                'EUR':10
            }
            $scope.normaHour = workingHour['UAH'];
            var Customer= $resource('api/collections/Custom/:id',{id:'@_id'});
            var JobTicket = $resource('api/collections/Jobticket/:id',{id:'@_id'});
            var JobTicketArch = $resource('api/collections/Jobticketarch/:id',{id:'@_id'});
            var JobName = $resource('api/collections/Jobname/:id',{id:'@_id'});
            var JobType = $resource('api/collections/Jobtype/:id',{id:'@_id'});
            var LinkedJob = $resource('/api/linkedjob/:spark/:job',{spark:'@spark',job:'@job'});
            var Producer = $resource('http://46.101.131.133:7700/api/collections/Producer/:id',{id:'@_id',store:'5a3cc10e1626aa0566f7ea87'});
            var Work = $resource('http://46.101.131.133:7700/api/collections/Work/:_id',{_id:'@_id',store:'5a3cc10e1626aa0566f7ea87'});
            //var Material = $resource('http://46.101.131.133:7700/api/collections/Material/:_id',{_id:'@_id',store:'5a3cc10e1626aa0566f7ea87'});

            var Worker = $resource('http://46.101.131.133:7700/api/collections/Worker/:_id',{_id:'@_id',store:'5a3cc10e1626aa0566f7ea87'});
            var Supplier = $resource('http://46.101.131.133:7700/api/collections/Supplier/:_id',{_id:'@_id',store:'5a3cc10e1626aa0566f7ea87'});
            var Shipper = $resource('api/collections/Shipper/:id',{id:'@_id'});
            //var OldWorker = $resource('api/collections/Worker/:id',{id:'@_id'});

            var Material = $resource('/api/collections/Material/:_id',{_id:'@_id'});

            self.workers=[];
            self.producers=[];
            self.suppliers=[];
            self.currentTabIndex=1;
            self.sparks=[];
            self.works=[];
            self.work=[];
            self.currency=global.get('store').val.currency;
            self.mainCurrency=global.get('store').val.mainCurrency;


            self.getRatePriceForSpark = getRatePriceForSpark;
            self.getTotalSumForSparks = getTotalSumForSparks;
            self.saveField=saveField;
            self.deleteSpark=deleteSpark;
            function getRatePriceForSpark(m) {
                var rate = 1;
                if(m.currency!==self.mainCurrency){
                    for(var c in self.currency){
                        if(c===m.currency){
                            rate = self.currency[c][0];
                        }
                    }

                }
                var sum = Math.round(((m.price*m.q)/rate)*100)/100;
                m.sumRate = sum;
                return sum;
            }
            function getTotalSumForSparks() {
                if(!self.item || !self.item.sparks){ return {}}
                var sparks = self.item.sparks;
                var sum = {};

                if (sparks && sparks.length){
                    for(var i= 0,l=sparks.length;i<l;i++){
                        if(!sum[sparks[i].currency]){sum[sparks[i].currency]=0;}
                        sum[sparks[i].currency] +=Math.round(sparks[i].price*100)/100
                    }
                }

                self.item.tatalSum.sparks=sum;
                return sum
            }
            function saveField(field,value) {
                console.log(self.item)
                if(!self.item._id){return}
                var o={_id:self.item._id};
                if(value){
                    o[field]=value;
                }else{
                    o[field]=self.item[field]
                }
                return $q.when()
                    .then(function (sas) {
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
            function deleteSpark(i){
                console.log(i);
                Confirm('Удалать?')
                    .then(function () {
                        if ($scope.jobTicket.sparks.length>i){
                            $scope.jobTicket.sparks.splice(i,1);
                        }
                        saveField('sparks.',$scope.jobTicket.sparks)
                    })
            }
            activate();
            function  activate(){
                //console.log($rootScope.$stateParams)


                $scope.usedCustomer=[];
               /* JobTicket.query({query:"customer"},function(res){
                    //console.log(res);
                    for (var i= 0,l=res.length;i<l;i++){
                        $scope.usedCustomer[$scope.usedCustomer.length]=res[i].customer;
                    }
                    if (!$rootScope.$stateParams.id || $rootScope.$stateParams.clone){
                        afterChangeCustomer();
                    }
                });*/

                $q.when()
                    .then(function () {
                        if ($rootScope.$stateParams.id){
                            if ($rootScope.$stateParams.clone){
                                JobTicketArch.get({id:$rootScope.$stateParams.id},function(res){
                                    //console.log(res);
                                    $scope.jobTicket = res;
                                    delete $scope.jobTicket._id;
                                    $scope.jobTicket.date= Date.now();
                                    $scope.jobTicket.dateClose='';
                                    $scope.jobTicket.mile='';
                                    $scope.jobTicket.resSum=0;
                                    $scope.jobTicket.resPay=0;
                                    $scope.jobTicket.balance=0;
                                    scope.jobTicket.text=''

                                    $scope.jobTicket.jobs.forEach(function(item){
                                        item.sum='';
                                        item.worker='';
                                        item.date='';
                                        item.forSave=true;
                                    })
                                    $scope.jobTicket.sparks.forEach(function(item){
                                        item.shipPrice='';
                                        item.date='';
                                        item.forSave=true;
                                        delete item.supplier;
                                        delete item.invoice;
                                    })
                                    $scope.jobTicket.pay=[];
                                    console.log($scope.jobTicket)
                                    //$scope.customer=$scope.jobTicket.customer;
                                });
                            } else {
                                return Invoice.getItem($rootScope.$stateParams.id)
                            }
                        }



                    })
                    .then(function (item) {
                        self.item=item;
                        if(!self.item.tatalSum){
                            self.item.tatalSum={}
                        }
                        $scope.jobTicket = item;


                        $scope.jobTicket.jobs.forEach(function(item){
                            if(item.supplierType){
                                item.suppliers=[item.supplier]
                            }

                            item.forSave=true;
                        })
                        $scope.jobTicket.sparks.forEach(function(item){
                            item.price=Math.round(item.price*100)/100
                            item.forSave=true;
                        })
                        //console.log($scope.jobTicket);
                        $scope.customer=$scope.jobTicket.customer;
                        //console.log($scope.jobTicket.customer)
                        // для печати
                        $scope.style = ($scope.jobTicket.balance>0)?"color:red":'';
                        // console.log($scope.jobTicket.balance)
                       // return OldWorker.query().$promise;
                    })
                    .then(function (res) {
                        //self.oldWorkers=res;
                        //return Producer.query({perPage:500 ,page:0,lang:'ru'} ).$promise;
                    })
                    /*.then(function (producers) {
                        producers.shift();
                        self.producers=producers;
                        //console.log(producers);
                    })
                    .then(function () {
                        return Worker.query({perPage:500 ,page:0,lang:'ru'} ).$promise;
                    })
                    .then(function (workers) {
                        workers.shift();
                        self.workers=workers;
                        //console.log(self.workers)
                    })
                    .then(function () {
                        return Supplier.query({perPage:500 ,page:0,lang:'ru'} ).$promise;
                    })
                    .then(function (suppliers) {
                        suppliers.shift();
                        self.suppliers=suppliers;
                        //console.log(self.suppliers)
                    });*/
            }


            self.refreshSuppliers=function (searchStr,j) {
                if(!searchStr){return}
                $q.when()
                    .then(function(){
                        var q= {search:searchStr,lang:'ru'};
                        return Supplier.query(q).$promise;
                    })
                    .then(function (res) {
                        res.shift();
                        j.suppliers=res;
                    })
                    .catch(function (err) {
                        console.log(err)
                    })
            };
            self.refreshWorkers=function (searchStr,j) {
                console.log(searchStr)
                if(!searchStr){return}
                $q.when()
                    .then(function(){
                        var q= {search:searchStr,lang:'ru'};
                        return Worker.query(q).$promise;
                    })
                    .then(function (res) {
                        res.shift();
                        j.workers=res;
                    })
                    .catch(function (err) {
                        console.log(err)
                    })
            };


            self.refreshWorks=function (searchStr) {
                if(!searchStr){return}
                $q.when()
                    .then(function(){

                        var q= {search:searchStr,lang:'ru'};
                        return Work.query(q).$promise;
                    })
                    .then(function (res) {
                        //res.shift();
                        self.works=res;
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            };
            self.tagTransform = function (newTag) {
                var item = {
                    name: newTag,
                    workingHour:'new'
                };
                return item;
            };
            self.changeWorks=function () {
                if (self.work && self.work.length){
                    var j = self.work[0];
                    self.work=null;
                    if(j.workingHour=='new'){
                        j.workingHour=1;
                        console.log(j)
                        $q.when()
                            .then(function(){
                                return $addNewWork(j)
                            })
                            .then(function () {
                                delete j.isTag
                                return Work.save(j).$promise;
                            })
                            .then(function () {
                                var o = {
                                    name:j.name,
                                    norma:j.workingHour,q:1,date:null,sum:null,master:null,jobType:null,
                                    forSave:true
                                }
                                $scope.jobTicket.jobs.unshift(o);
                                saveField('jobs',self.item.jobs)
                            })
                            .catch(function (err) {
                                if(err){
                                    exception.catcher('добавление новой работы')(err)
                                }

                            });

                    }else{
                        var o={
                            name:j.name,
                            norma:j.workingHour,q:1,date:null,sum:null,master:null,jobType:null,
                            forSave:true
                        }
                        $scope.jobTicket.jobs.unshift(o);
                        saveField('jobs',self.item.jobs)
                        self.work=null;
                    }

                }
            };
            self.deleteWork=function(i){
                console.log(i);
                if ($scope.jobTicket.jobs.length>i){
                    $scope.jobTicket.jobs.splice(i,1);
                }
                saveField('jobs',self.item.jobs)

            }
            self.materials=[];
            self.suppliers=[];
            self.workers=[];
            self.refreshSparks=function (searchStr,forSku) {
                if(!searchStr){return};
                $q.when()
                    .then(function(){

                        var q= {search:searchStr,lang:'ru'};
                        return Material.query(q).$promise;
                    })
                    .then(function (res) {
                        //res.shift();
                        if(typeof forSku!='undefined'){
                            self.materials[forSku]=res;
                        }else{
                            self.sparks=res;
                        }

                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            };
            self.refreshSparksBySku=function (searchStr,forSku) {
                if(!searchStr){return};
                $q.when()
                    .then(function(){

                        var q= {search:searchStr,lang:'ru'};
                        return Material.query(q).$promise;
                    })
                    .then(function (res) {
                        //res.shift();
                        if(typeof forSku!='undefined'){
                            self.materials[forSku]=res;
                        }else{
                            self.sparks=res;
                        }

                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            };

            self.tagTransformForSpark = function (newTag) {
                //console.log(newTag)
                var item = {
                    name: newTag,
                    _id:'new'
                };
                return item;
            };
            self.changeSparkFromExist=function (spark,idx) {
                $scope.jobTicket.sparks[idx].sku=spark.sku;
                $scope.jobTicket.sparks[idx].name=spark.name;
                if(spark.sku2[0]){
                    $scope.jobTicket.sparks[idx].code=spark.sku2[0];
                }
                $scope.jobTicket.sparks[idx].currency = spark.currency;
                //console.log(idx,self.materials)
                self.materials[idx].length=0;
                //console.log($scope.jobTicket.sparks[idx])
                saveField('sparks.'+idx,$scope.jobTicket.sparks[idx])
            };
            self.changeSparkBySku=function (sku,sku2,name,idx) {
                var producerName;
                var spark={
                    sku:sku,
                    sku2:sku2,
                    name:name
                };
                $q.when()
                    .then(function(){
                        return $addNewSpark(spark,self.producers);
                    })
                    .then(function () {
                        if(spark.sku2){
                            spark.sku2=[spark.sku2];
                        }
                        if(spark.producer){
                            producerName = spark.producer.name;
                            spark.producer = spark.producer._id;
                        }
                        console.log(spark);;
                        return Material.save(spark).$promise;
                    })
                    .then(function () {
                        $scope.jobTicket.sparks[idx].name=spark.name;
                        $scope.jobTicket.sparks[idx].producer=producerName;
                        $scope.jobTicket.sparks[idx].currency=spark.currency;
                        if(spark.sku2 && spark.sku2[0]){
                            $scope.jobTicket.sparks[idx].code=spark.sku2[0];
                        }
                        self.materials[idx].length=0;
                    })
                    .catch(function (err) {
                        if(err){
                            exception.catcher('добавление новой запчасти')(err);
                        }

                    });
            };

            self.changeSpark=function () {
                exception.catcher('добавление новой запчасти');
                console.log(self.spark);
                if (self.spark){
                    var spark = self.spark;
                    var producerName;
                    if(spark._id!='new'){
                        console.log(1)
                        try{
                            if(!spark.producer){
                                self.spark=null;
                                console.log('????')
                                exception.catcher('добавление новой запчасти')('у детали нет производителя');
                                return
                            }
                            console.log(1)

                            var o ={
                                name:spark.name,
                                price:spark.priceForSale || 0,
                                incomePrice:0,
                                producer:spark.producer.name,
                                q:1,
                                forSave:true,
                                currency:spark.currency,
                            };

                            if(spark.sku2 && spark.sku2[0]){
                                o.code=spark.sku2[0];
                                o.sku=spark.sku;
                            }else{
                                o.code=spark.sku;
                            }

                            console.log(o);
                            $scope.jobTicket.sparks.unshift(o);
                            console.log(1)
                            self.spark=null;
                            saveField('sparks',self.item.sparks)
                        }catch(err){
                            return exception.catcher('ошибка')(err);
                        }

                    }else{
                        delete spark._id;
                        self.spark=null;
                        $q.when()
                            .then(function(){
                                spark.sku=spark.name;
                                spark.name='';
                                return $addNewSpark(spark);
                            })
                            .then(function () {
                                delete spark.isTag;
                                if(spark.sku2){
                                    spark.sku2=[spark.sku2];
                                }
                                if(spark.producer){
                                    producerName = spark.producer.name;
                                    spark.producer = spark.producer._id;
                                }
                                console.log(spark);
                                return Material.save(spark).$promise;
                            })
                            .then(function () {
                                var o ={
                                    name:spark.name,
                                    price:0,
                                    incomePrice:0,
                                    producer:producerName,
                                    q:1,
                                    forSave:true,
                                    currency:spark.currency,
                                };
                                if(spark.sku2 && spark.sku2[0]){
                                    o.code=spark.sku2[0];
                                    o.sku=spark.sku;
                                }else{
                                    o.code=spark.sku;
                                }


                                //console.log(o);
                                $scope.jobTicket.sparks.unshift(o);
                                self.spark=null;
                                saveField('sparks',$scope.jobTicket.sparks)
                            })
                            .catch(function (err) {
                                if(err){
                                    exception.catcher('добавление новой запчасти')(err);
                                }

                            });

                    }

                }
            };






            $scope.convertToNumber = function(n){
                var i=parseFloat(n);
                //console.log(i)
                return (i)?i:0;
            }

            // смена валюты
            $scope.rate=1;

            $scope.parse={};


//*****************************customer*********************************
            function afterChangeCustomer(){
                $scope.customers=[];
                console.log('ss')
                Customer.query(function(res){
                    //console.log($scope.usedCustomer);
                    // если нет открытого ордера с этим клиенто то добовляем его в список

                    /*for (var i= 0,l=res.length;i<l;i++){
                     if ($scope.usedCustomer.indexOf(res[i]._id)<0){
                     $scope.customers[$scope.customers.length]=res[i];
                     }
                     }*/
                    // теперь проверяем это в $scope.changeCustomer()
                    $scope.customers=res;

                });
                $scope.customer={vin:'',name:'',email:'',phone:'',notes:'',model:''};
            }
            //afterChangeCustomer()


            $scope.saveCustomer=function(form){
                if ($scope.customer.vin && $scope.customer.phone && $scope.customer.name){
                    Customer.save($scope.customer,function(){if (!$scope.jobTicket._id) afterChangeCustomer()})
                }

            }


            $scope.changeCustomer=function(id){
                if (!id){
                    $scope.customer={vin:'',name:'',email:'',phone:'',notes:''};
                } else {
                    //если есть открытый наряд то сообщаем об этом
                    //console.log($scope.usedCustomer);
                    //console.log(id);
                    if  ($scope.usedCustomer.some(function(el){return el==id})){
                        alert ('Есть открытый наряд!')
                        return;
                    }
                    /*for (var i= 0,l=res.length;i<l;i++){
                     if ($scope.usedCustomer.indexOf(res[i]._id)<0){
                     $scope.customers[$scope.customers.length]=res[i];
                     }
                     }*/

                    for(var i= 0,l=$scope.customers.length;i<l;i++){
                        if($scope.customers[i]._id==id){
                            //console.log($scope.customers[i]);
                            $scope.customer=$scope.customers[i];
                            $scope.customer.id=id;
                            break;
                        }
                    }
                    // получение балланса по данному заказчику
                    JobTicketArch.get({id:id,query:'balance'},function(res){
                        //console.log(res);
                        if (!res.balance) res.balance=0;
                        if (!res.resSum) res.resSum=0;
                        if (!res.resPay) res.resPay=0;
                        $scope.jobTicket.balance=res.resPay;
                        //console.log($scope.jobTicket.balance)
                        $scope.style = ($scope.jobTicket.balance>0)?"color:red":'';
                    });
                }
            }
            $scope.deleteCustomer=function(){
                if ($scope.customer._id){
                    if (confirm("Удалить?")){
                        $scope.customer.$delete(function(e){
                            console.log('ss');
                            afterChangeCustomer()
                        });
                    }
                }
            }



            //************************* наряд ****************************
            $scope.showElements={}
            $scope.quantityArr=[1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9,9.5,10,11,12,13,14,15,16,17,19,20,21,22,23,24,25]
            /*$scope.quantityArr=[1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9,9.5,10,
             10,10.5,11,11.5,12,12.5,13,13.5,14,14.5,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];*/
            $scope.jobTicket={jobs:[],sparks:[],pay:[],customer:{}}


            $scope.saveJobTicket = function(){
                if (!$scope.customer._id) {
                    alert('А где клиент?');
                    return;
                }
                $scope.jobTicket.customer=$scope.customer._id;
                $scope.jobTicket.resSum= $scope.getTotalJobs()/$rootScope.config.currency['EUR'][0]+$scope.getTotalSpark();
                $scope.jobTicket.resPay= $scope.jobTicket.balance+$scope.jobTicket.resSum -$scope.getTotalPay();
                //console.log($scope.jobTicket.ballance,$scope.jobTicket.resPay);
                $scope.buttonDisabled=true;
                //console.log($scope.jobTicket.sparks)




                JobTicket.save($scope.jobTicket,function(res){
                    $scope.$emit('saved');
                    $rootScope.$state.transitionTo('mainFrame.customerList');

                });
            }



            $scope.$on('printTicket',function(){
                var order=$scope.jobTicket;
                //console.log(order);
                var popupWin=window.open();
                var rest = $scope.jobTicket.balance+$scope.getTotalJobs()/$scope.rate+$scope.getTotalSpark()-$scope.getTotalPay();
                //console.log(rest);
                var style = (rest>0)?'color:red':'';

                var s='';
                s +='<div class="container" style="font-size: 10px;"><div class="row"><div class="col-lg-8">'+
                    '<h3 style="font-weight: bold; font-size: 26px; margin-top: 10px;">AUTOFAN <span style="font-size: 18px; font-weight: normal">харьков</span></h3>'+
                    '<h3 style="font-size: 16px;">Предварительная калькудяция для наряд-заказа от  '+moment(order.date).format('lll')+' курс EUR '+$scope.rate.toFixed(2)+'</h3> ';


                s +='<table width="100%" cellspacing="0" cellpadding="5">'+
                    '<tr><td>vin</td><td>'+order.customer.vin+'</td><td>model</td><td>'+order.customer.model+'</td></tr>' +
                    '<tr><td>имя</td><td>'+order.customer.name+'</td><td>телефон</td><td>'+order.customer.phone+'</td></tr>' +
                    '<tr><td>e-mail</td><td>'+order.customer.email+'</td><td>пробег</td><td>'+order.mile+'</td></tr>' +
                    '</table><hr style="margin-top: 0; margin-bottom: 0; border-color: #666">';
                //console.log(s);
                var balance=(order.balance)?order.balance:0;
                s +='<table width="100%" cellspacing="0" cellpadding="5">' +
                    '<tr><td><b style="'+$scope.style+'">Долг '+(balance).toFixed(2)+' €</b></td>' +
                    '<tr><td><b>Всего по наряду '+($scope.getTotalSpark()+$scope.getTotalJobs()/$scope.rate).toFixed(2)+' €</b></td>' +
                    '<td><b>Всего оплачено  '+($scope.getTotalPay()).toFixed(2)+' €</b></td>' +
                    '<td><b style="'+style+'">Остаток суммы '+(rest).toFixed(2)+' €</b></td></tr>'+
                    '</table><hr style="margin-top: 0; margin-bottom: 0; border-color: #666">';

                s += '<p style="text-align: center; margin-top: 10px; margin-bottom: 5px; ">Стоимость работ по ремонту и обслуживанию</p>' +
                    '<table width="100%" cellspacing="0" cellpadding="5" border="1px">'+
                    '<thead><tr><th>#</th><th>Наименование</th><th>К-во</th><th>Сумма</th></tr></thead>';
                for (var i= 0,l=order.jobs.length;i<l;i++){
                    var j=order.jobs[i];
                    var ss = (j.sum)?j.sum:j.norma*j.q*$scope.normaHour*$scope.getTypeRatio(j.jobType);
                    //console.log()
                    s +='<tr><td> '+(i+1)+'</td><td>'+j.name+'</td><td>'+j.q+'</td><td>'+(ss*1.0000001).toFixed(2)+' грн.</td></tr>';
                }
                s+='<tr><th></th><th colspan="2">Итого</th><th>'+$scope.getTotalJobs().toFixed(2)+' грн</th></tr></table>';

                s += '<p style="text-align: center; margin-top: 10px; margin-bottom: 5px;">Стоимость запчастей</p>' +
                    '<table width="100%" cellspacing="0" cellpadding="5" border="1px">'+
                    '<thead><tr><th>#</th><th>Код</th><th>Наименование</th><th>К-во</th><th>Цена</th><th>Сумма</th></tr></thead>';
                for (var i= 0,l=order.sparks.length;i<l;i++){
                    var j=order.sparks[i];
                    s +='<tr><td> '+(i+1)+'</td><td>'+j.code+'</td><td>'+j.name+'</td><td>'+j.q+'</td><td>'+j.price.toFixed(2)+'</td><td>'+(j.price*1.0000001).toFixed(2)+' €.</td></tr>';
                }
                s+='<tr><th></th><th colspan="4">Итого</th><th>'+$scope.getTotalSpark().toFixed(2)+' €</th></tr></table>';


                s += '<p style="text-align: center; margin-top: 10px; margin-bottom: 5px;">Платежная ведомость</p>' +
                    '<table width="100%" cellspacing="0" cellpadding="5" border="1px">'+
                    '<thead><tr><th>#</th><th>Дата</th><th>Сумма EUR</th><th>Сумма ГРН</th></tr></thead>';
                for (var i= 0,l=order.pay.length;i<l;i++){
                    var j=order.pay[i];
                    s +='<tr><td> '+(i+1)+'</td><td>'+moment(j.date).format('lll')+'</td><td>'+(j.val*1.0000001).toFixed(2)+' €</td><td></td></tr>';
                }

                if (order.payGrn){
                    var oldIndex=i;
                    for (var i= 0,l=order.payGrn.length;i<l;i++){
                        var j=order.payGrn[i];
                        s +='<tr><td> '+(i+oldIndex+1)+'</td><td>'+moment(j.date).format('lll')+'</td><td></td><td>'+(j.val*1.0000001).toFixed(2)+' грн</td></tr>';
                    }
                }
                s+='<tr><th></th><th>Итого</th><th>'+$scope.getTotalPay('EUR').toFixed(2)+' €</th><th>'+$scope.getTotalPay('GRN').toFixed(2)+' грн</th></tr></table><br>';

                s += '<table width="100%" cellspacing="0" cellpadding="5"">' +
                    '<tr><td>Подпись исполнителя</td><td>______________________</td><td>Подпись заказчика</td><td>________________________</td></tr>'
                s +='';
                var k=0;
                s += '<tr><td colspan="5"><p style="text-align: center; margin-top: 10px; margin-bottom: 5px;">Комментарии</p>' +
                    '<table width="100%" cellspacing="0" cellpadding="5" border="1px">'+
                    '<thead><tr><th>'+((order.text)?order.text:'')+'</th></tr></thead></table></td></tr>';

                /* s += '<p style="text-align: center; margin-top: 20px;">Комментарии</p>' ;
                 s += '<p>'+ order.text+'</p>';*/

                var printContents = s;
                popupWin.document.write('<!DOCTYPE html><html><head>' +
                    '<link rel="stylesheet" type="text/css" href="bower_components/bootstrap/dist/css/bootstrap.css" />' +
                    '</head><body onload="window.print()"><div class="reward-body">' + printContents + '</div>' +
                    //'<script>setTimeout(function(){ window.parent.focus(); window.close() }, 100)</script>' +
                    '</html>');




                $timeout(function () {
                    popupWin.print();
                    popupWin.window.focus();

                },200);
            })

            $scope.sendEmail = function(){
                //console.log('send email')
                function createBody(order){
                    var rest = $scope.jobTicket.balance+$scope.getTotalJobs()/$scope.rate+$scope.getTotalSpark()-$scope.getTotalPay();
                    //console.log(rest);
                    var style = (rest>0)?'color:red':'';
                    var s='';
                    //console.log(order);return;

                    s +='<div class="container"><div class="row"><div class="col-lg-8">'+
                        '<h3>Наряд-заказ от  '+moment(order.date).format('lll')+' курс EUR '+$scope.rate.toFixed(2)+'</h3> ';

                    s +='<table width="100%" cellspacing="0" cellpadding="5">'+
                        '<tr><td>vin</td><td>'+$scope.customer.vin+'</td><td>model</td><td>'+$scope.customer.model+'</td></tr>' +
                        '<tr><td>имя</td><td>'+$scope.customer.name+'</td><td>телефон</td><td>'+$scope.customer.phone+'</td></tr>' +
                        '<tr><td>e-mail</td><td>'+$scope.customer.email+'</td><td>пробег</td><td>'+order.mile+'</td></tr>' +
                        '</table><hr>';
                    //console.log(s);
                    var balance=(order.balance)?order.balance:0;
                    s +='<table width="100%" cellspacing="0" cellpadding="5">' +
                        '<tr><td><b style="'+$scope.style+'">Долг '+(balance).toFixed(2)+' €</b></td>' +
                        '<tr><td><b>Всего по наряду '+($scope.getTotalSpark()+$scope.getTotalJobs()/$scope.rate).toFixed(2)+' €</b></td>' +
                        '<td><b>Всего оплачено  '+($scope.getTotalPay()).toFixed(2)+' €</b></td>' +
                        '<td><b style="'+style+'">Остаток суммы '+(rest).toFixed(2)+' €</b></td></tr>'+
                        '</table><hr>';

                    s += '<p style="text-align: center; margin-top: 20px;">Стоимость работ по ремонту и обслуживанию</p>' +
                        '<table width="100%" cellspacing="0" cellpadding="5" border="1px">'+
                        '<thead><tr><th>#</th><th>Наименование</th><th>К-во</th><th>Цена</th></tr></thead>';
                    for (var i= 0,l=order.jobs.length;i<l;i++){
                        var j=order.jobs[i];
                        //console.log(j);
                        s +='<tr><td> '+(i+1)+'</td><td>'+j.name+'</td><td>'+j.q+'</td><td>'+(j.norma*$scope.normaHour).toFixed(2)+' грн.</td></tr>';
                    }
                    s+='<tr><th></th><th colspan="2">Итого</th><th>'+$scope.getTotalJobs().toFixed(2)+' грн</th></tr></table>';

                    s += '<p style="text-align: center; margin-top: 20px;">Стоимость запчастей</p>' +
                        '<table width="100%" cellspacing="0" cellpadding="5" border="1px">'+
                        '<thead><tr><th>#</th><th>Код</th><th>Наименование</th><th>К-во</th><th>Цена</th></tr></thead>';
                    for (var i= 0,l=order.sparks.length;i<l;i++){
                        var j=order.sparks[i];
                        s +='<tr><td> '+(i+1)+'</td><td>'+j.code+'</td><td>'+j.name+'</td><td>'+j.q+'</td><td>'+(j.price*1.0000001).toFixed(2)+' €</td></tr>';
                    }
                    s+='<tr><th></th><th colspan="3">Итого</th><th>'+$scope.getTotalSpark().toFixed(2)+' €</th></tr></table>';


                    s += '<p style="text-align: center; margin-top: 20px;">Платежная ведомость</p>' +
                        '<table width="100%" cellspacing="0" cellpadding="5" border="1px">'+
                        '<thead><tr><th>#</th><th>Дата</th><th>Сумма EUR</th><th>Сумма ГРН</th></tr></thead>';
                    for (var i= 0,l=order.pay.length;i<l;i++){
                        var j=order.pay[i];
                        s +='<tr><td> '+(i+1)+'</td><td>'+moment(j.date).format('lll')+'</td><td>'+(j.val*1.0000001).toFixed(2)+' €</td><td></td></tr>';
                    }


                    if (order.payGrn){
                        var oldIndex=i;
                        for (var i= 0,l=order.payGrn.length;i<l;i++){
                            var j=order.payGrn[i];
                            s +='<tr><td> '+(i+oldIndex+1)+'</td><td>'+moment(j.date).format('lll')+'</td><td></td><td>'+(j.val*1.0000001).toFixed(2)+' грн</td></tr>';
                        }
                    }
                    s+='<tr><th></th><th>Итого</th><th>'+$scope.getTotalPay('EUR').toFixed(2)+' €</th><th>'+$scope.getTotalPay('GRN').toFixed(2)+' грн</th></tr></table><br>';


                    /*s+='<tr><th></th><th>Итого</th><th>'+$scope.getTotalPay().toFixed(2)+' €</th></tr></table><br>';*/
                    s += '<p style="text-align: center; margin-top: 20px;">Комментарии</p>' ;
                    s += '<p>'+((order.text)?order.text:'')+'</p>';
                    var printContents = '<!DOCTYPE html><html><head>' +
                        '</head><body><div>' + s + '</div>' +
                        //'<script>setTimeout(function(){ window.parent.focus(); window.close() }, 100)</script>' +
                        '</html>';
                    return printContents;

                }


                if (!$scope.customer._id) {
                    alert('А где клиент?');
                    return;
                }
                if (!$scope.customer.email) {
                    alert('А где я возьму email клиента?придумаю?или в рельсу?');
                    return;
                }
                $scope.jobTicket.customer=$scope.customer._id;
                $scope.jobTicket.resSum= $scope.getTotalJobs()/$rootScope.config.currency['EUR'][0]+$scope.getTotalSpark();
                $scope.jobTicket.resPay= $scope.jobTicket.balance+$scope.jobTicket.resSum -$scope.getTotalPay();
                $scope.buttonDisabled=true;
                /*JobTicket.save($scope.jobTicket,function(res){
                 $scope.$emit('saved');
                 //$rootScope.$state.transitionTo('mainFrame.customerList');

                 });*/
                var s=createBody($scope.jobTicket);

                $resource('/api/sendEmailCustomer').save({body:s,name:$scope.customer.name,email:$scope.customer.email},function(res){
                    $scope.buttonDisabled=false;
                    //console.log(res);
                    alert('вроде ушло')

                },function(err){
                    $scope.buttonDisabled=false;
                    alert('какая-то ошибка!')
                })
            }

            $scope.closeJobTicket = function(){
                var jobs=[],sparks=[];
                Confirm('Закрыть наряд-заказ?')
                    .then(function(){

                        // объекты для хранения не переносимых з п и работ


                        //console.log();
                        for (var i= 0,l=$scope.jobTicket.jobs.length;i<l;i++){

                            if (!$scope.jobTicket.jobs[i].sum){
                                throw 'Не все работы выполнены!!! Введите исполнителей на работы из списка!'
                            }
                            if (!$scope.jobTicket.jobs[i].forSave){
                                jobs.push($scope.jobTicket.jobs[i]);
                                $scope.jobTicket.jobs.splice(i,1);
                                i=i-1;
                                l--;
                            }else{
                                if($scope.jobTicket.jobs[i].supplierType && !$scope.jobTicket.jobs[i].incomeSum){
                                    throw 'не установлена входная цена на работу '+$scope.jobTicket.jobs[i].name;
                                }
                                $scope.jobTicket.jobs[i].q= $scope.jobTicket.jobs[i].sum/$scope.normaHour;
                            }
                            //console.log($scope.jobTicket.jobs[i])

                        }
                        for (var i= 0,l=$scope.jobTicket.sparks.length;i<l;i++){
                            if (!$scope.jobTicket.sparks[i].forSave){
                                sparks.push($scope.jobTicket.sparks[i]);
                                $scope.jobTicket.sparks.splice(i,1);
                                i=i-1;l--;
                            }else{

                                if(!$scope.jobTicket.sparks[i].producer){
                                    throw  'для запчасти '+$scope.jobTicket.sparks[i].name+'('+$scope.jobTicket.sparks[i].code+')'+'не установлен производитель'
                                }
                            }

                        }
                        if(!$scope.jobTicket.mile){
                            throw 'не установлен пробег автомобиля'
                        }

                        if($scope.jobTicket.sparks && $scope.jobTicket.sparks.length && !$scope.jobTicket.worker){
                            throw 'не установлен запчастист'
                        }



                        $scope.jobTicket.resSum= $scope.getTotalJobs()/$rootScope.config.currency['EUR'][0]+$scope.getTotalSpark();
                        $scope.jobTicket.resPay=$scope.jobTicket.balance+$scope.jobTicket.resSum-$scope.getTotalPay();
                        //$scope.buttonDisabled=true;
                        $scope.jobTicket.rate=$scope.rate;
                        delete $scope.jobTicket.__v;
                    })
                    .then(function () {
                        /*if($scope.jobTicket.sparks && $scope.jobTicket.sparks.length){

                         }*/
                        return $checkBeforClose.doCheck($scope.jobTicket,self.suppliers,self.producers,self.workers)
                    })
                    .then(function (res) {
                        /*1. Вернуть при отказе в закрытие наряда обратно убранные работы и материалы(с которых была снята галочка).
                         2. Так же вернуть данные по клиенту.
                         3. Проверить закрытие наряда без продавца-запчастиста(не может быть закрыт).
                         4. Сделать обновление при создании карточки товара данных по наличию такого товара на складе (кнопку в модальном окне, рядом со ссылкой - создать).
                         5. Синхронизировать данные из актуально закрытых нарядов (из сводки) с бухгалтерией - должны данные совпадать.
                         * */
                        //return;
                        // сохранение дополнительного ордера если есть несохраняемые позиции
                        $scope.jobTicket.customer=$scope.customer._id;
                        if (sparks.length || jobs.length){
                            var jobTicket={};
                            jobTicket.sparks=sparks;
                            jobTicket.jobs=jobs;
                            jobTicket.customer=$scope.customer._id;
                            jobTicket.balance=$scope.jobTicket.resPay;
                            jobTicket.resSum= $scope.getTotalJobs(jobs)/$rootScope.config.currency['EUR'][0]+$scope.getTotalSpark(sparks);
                            jobTicket.resPay= -jobTicket.balance+$scope.jobTicket.resSum;
                            JobTicket.save(jobTicket,function(res){
                                $scope.$emit('saved');
                                //$rootScope.$state.transitionTo('mainFrame.customerList');
                            });
                        }
                    })
                    .then(function(){
                        //return
                        JobTicketArch.save($scope.jobTicket,function(res){
                            $scope.jobTicket.$delete(function(err){
                                if (err) console.log(err);
                                //$scope.afterSave();
                            });
                            //$scope.$emit('saved');
                            $rootScope.$state.transitionTo('mainFrame.jobTicketArch');
                        });
                    })
                    .catch(function (err) {
                        if(sparks && sparks.length){
                            $scope.jobTicket.sparks=$scope.jobTicket.sparks.concat(sparks)
                        }
                        if(jobs && jobs.length){
                            $scope.jobTicket.jobs=$scope.jobTicket.jobs.concat(jobs)
                        }

                        console.log(err)
                        if(err && err!='backdrop click'){
                            exception.catcher('закрытие заказа')(err)
                        }
                    })

            }



            //***** jobs
            /*$scope.addJob = function(){
                console.log($scope.jobName);
                if ($scope.jobName._id && $scope.jobType._id){
                    $scope.jobTicket.jobs[$scope.jobTicket.jobs.length]={name:$scope.jobName.name,
                        norma:$scope.jobName.norma,q:1,date:null,sum:null,master:null,jobType:$scope.jobType._id,
                        forSave:true
                    }
                }
            }*/
            $scope.getTotalJobs = function(jobs){
                if (!jobs){jobs=$scope.jobTicket.jobs;}
                var sum = {};
                //  console.log(jobs);
                if (jobs && jobs.length){
                    for(var i= 0,l=jobs.length;i<l;i++){
                        var j = jobs[i];
                        if (j.forSave){
                            if(typeof sum[j.currency]=='undefined'){
                                sum[j.currency]=0;
                            }
                            sum += Number(j.sum) || Math.round((j.norma*j.q*$scope.normaHour)*100)/100;
                        }

                    }
                }
                //console.log(sum);
                return sum;
            }

            self.changeWorker = function(j,worker,idx){
                if (worker && !j.sum) {
                    j.sum=Math.round(j.norma*j.q*$scope.normaHour*100)/100;
                }
                saveField('jobs.'+idx,self.item.jobs)
            }
            self.changeSupplier = function(j,supplier,idx){
                if (!j.sum) {
                    j.sum=Math.round(j.norma*j.q*$scope.normaHour*100)/100;
                }
                saveField('jobs.'+idx,self.item.jobs)
            }

            //***** sparks
            $scope.findSpark=function(){
                console.log('ddd');
                $scope.openModal();
            }
            $scope.setIncomePrice=setIncomePrice;
            $scope.getTotalSpark = function(sparks){
                if (!sparks){sparks=$scope.jobTicket.sparks;}
                var sum = 0;
                //console.log(sparks);
                if (sparks && sparks.length){
                    for(var i= 0,l=sparks.length;i<l;i++){
                        if (sparks[i].forSave){
                            sum +=sparks[i].price*sparks[i].q;
                        }

                    }
                }

                //console.log(sum)
                return sum;
            }

            $scope.handleSpark={};
            $scope.addSpark = function (spark){
                //todo && angular.isNumber(spark.price)
                if (spark && spark.code && spark.name && spark.price ){
                    var o ={name:spark.name,
                        code:spark.code,price:spark.price,q:1,shipPrice:null,date:null,forSave:true
                    }
                    console.log(spark)
                    if(spark.sku){
                        o.sku=spark.sku;
                    }
                    $scope.jobTicket.sparks.unshift(o)
                    //console.log()
                    spark.code=''; spark.name=''; spark.price='';spark.sku2=''
                } else {
                    alert('Не все поля заполнены или цена не число!');
                }
            }
            $scope.linkSpark= function(jobId,categoryId,spark){
                LinkedJob.save({spark:spark,job:jobId,category:categoryId},function(res){
                    console.log(res);
                });

            }
            $scope.addLinkedJob = function(spark){
                LinkedJob.get({spark:spark},function(res){
                    if (res.jobs.length>0){
                        console.log(res);
                        openModalForLinkedJob(res)
                    } else {
                        alert('Нет связаннх работ!');
                    }

                })
            }

            // для отслеживания изменения гривневой цены
            // eP цена в евро
            // uP цена в гривнах
            $scope.watchPriceArr=[];
            $scope.watchPrice= function(eP,q,i,ratio){
                $scope.jobTicket.sparks[i].price=Math.ceil(($scope.watchPriceArr[i]/ratio)/q);
                /*$scope.$watch('watchPriceArr['+i+']',function(n,o){
                 *//*console.log(uP)*//*
                 $timeout(function(){
                 var newN=(n)?n:0;
                 console.log($scope.jobTicket.sparks[i].price*q*ratio,$scope.jobTicket.sparks[i].price);
                 if (Math.round($scope.jobTicket.sparks[i].price*q*ratio)!=newN){


                 $scope.jobTicket.sparks[i].price=Math.ceil((newN/ratio)/q);
                 console.log($scope.jobTicket.sparks[i].price);

                 }
                 })
                 console.log(n,o);
                 })*/
            };

            $scope.pay={};
            $scope.pay.val='';
            $scope.getTotalPay = function(c){
                var sum = 0;
                if (!c){
                    if ($scope.jobTicket.pay && $scope.jobTicket.pay.length){
                        for(var i= 0,l=$scope.jobTicket.pay.length;i<l;i++){
                            sum +=$scope.jobTicket.pay[i].val;
                        }
                    }
                    //console.log($scope.jobTicket.payGnr);
                    if ($scope.jobTicket.payGrn){
                        for(var i= 0,l=$scope.jobTicket.payGrn.length;i<l;i++){
                            sum +=parseFloat(($scope.jobTicket.payGrn[i].val/$rootScope.config.currency['EUR'][0]).toFixed(2));
                        }
                    }
                } else if (c=="EUR"){
                    if ($scope.jobTicket.pay && $scope.jobTicket.pay.length){
                        for(var i= 0,l=$scope.jobTicket.pay.length;i<l;i++){
                            sum +=$scope.jobTicket.pay[i].val;
                        }
                    }
                } else if(c=="GRN"){
                    if ($scope.jobTicket.payGrn){
                        for(var i= 0,l=$scope.jobTicket.payGrn.length;i<l;i++){
                            sum +=$scope.jobTicket.payGrn[i].val;
                        }
                    }
                }

                //console.log(sum)
                return parseFloat(sum);
            }

            $scope.deletePay=function(i){
                //console.log(i);
                if ($scope.jobTicket.pay.length>i){
                    $scope.jobTicket.pay.splice(i,1);
                }

            }
            $scope.deletePayGrn=function(i){
                //console.log(i);
                if ($scope.jobTicket.payGrn.length>i){
                    $scope.jobTicket.payGrn.splice(i,1);
                }

            }
            $scope.addPay = function(grn){
                var val = parseFloat($scope.pay.val);
                if (!val){
                    alert('Б..., введин нах нормальное число. А не эту х...!!!');
                    return;
                }
                //console.log($scope.pay);

                if (val){
                    if (grn){
                        if (!$scope.jobTicket.payGrn) {$scope.jobTicket.payGrn=[]}
                        $scope.jobTicket.payGrn[$scope.jobTicket.payGrn.length]={date: new Date(),val : val}
                        $scope.pay.val='';
                    }else {
                        $scope.jobTicket.pay[$scope.jobTicket.pay.length]={date: new Date(),val : val}
                        $scope.pay.val='';
                    }

                }
            }
            $scope.cloneCurrentOrder=cloneCurrentOrder;
            function cloneCurrentOrder() {
                $uibModal.open({
                    templateUrl: 'manager/views/partials/modal/cloneOrder.html',
                    controller: function ($scope,$uibModalInstance,customers) {
                        //console.log(customers)
                        $scope.customers=customers;
                        $scope.ok=function(customer){
                            $uibModalInstance.close(customer);
                        }
                        $scope.cancel=function(){
                            $uibModalInstance.close();
                        }
                    },
                    resolve: {
                        customers: function () {
                            return ($scope.customers)?$scope.customers: Customer.query();
                        }
                    }
                }).result.then(function (customer) {
                    //console.log(customer,$scope.customer);
                    if(!customer || $scope.customer._id==customer){return}

                    $q.when()
                        .then(function () {
                            var query=JSON.stringify({customer:customer})
                            return JobTicket.query({query:query}).$promise
                        })
                        .then(function(orders){
                            console.log(orders);
                            if(orders && orders.length){
                                console.log({_id:orders[1]._id})
                                return JobTicket.get({id:orders[1]._id}).$promise
                            }else{
                                return null;
                            }
                        })
                        .then(function (order) {
                            console.log(order)
                            if(order){
                                //добавление данных и переход
                                $scope.jobTicket.jobs.forEach(function(i){
                                    var item = angular.copy(i)
                                    item.sum='';
                                    item.worker='';
                                    item.date='';
                                    item.forSave=true;
                                    if(!order.jobTicket){order.jobTicket=[]}
                                    order.jobTicket.push(item)
                                })
                                $scope.jobTicket.sparks.forEach(function(i){
                                    var item = angular.copy(i)
                                    item.shipPrice='';
                                    item.date='';
                                    item.forSave=true;
                                    if(!order.sparks){order.sparks=[]}
                                    order.sparks.push(item)
                                })
                                order.customer=order.customer._id;
                                JobTicket.save(order,function(){
                                    $rootScope.$state.go('mainFrame.customerList.custom',{id:order._id},{reload:true})
                                })
                                return;
                            }else{
                                // получение балланса
                                return JobTicketArch.get({id:customer,query:'balance'}).$promise
                            }

                        })
                        .then(function(res){
                            if(!res){return}
                            //console.log(res)
                            var jobTicket=angular.copy($scope.jobTicket);
                            delete jobTicket.customer;
                            delete jobTicket._id;
                            jobTicket.customer=customer;
                            jobTicket.date= new Date();
                            jobTicket.dateClose='';
                            jobTicket.mile='';
                            jobTicket.resSum=0;
                            jobTicket.resPay=0;
                            jobTicket.balance=0;

                            if(res){
                                if (!res.balance) res.balance=0;
                                if (!res.resSum) res.resSum=0;
                                if (!res.resPay) res.resPay=0;
                                jobTicket.balance=res.resPay;
                            }
                            jobTicket.jobs.forEach(function(item){
                                item.sum='';
                                item.worker='';
                                item.date='';
                                item.forSave=true;
                            })
                            jobTicket.sparks.forEach(function(item){
                                item.shipPrice='';
                                item.date='';
                                item.forSave=true;
                            })
                            jobTicket.pay=[];
                            jobTicket.payGrn=[];

                            //console.log(jobTicket);
                            return JobTicket.save(jobTicket).$promise;
                        })
                        .then(function(res){
                            if(!res){return}
                            console.log(res)
                            $rootScope.$state.go('mainFrame.customerList.custom',{id:res.id},{reload:true})
                        })

                })
            }
            $scope.sparkCode={val:''};
            function openModalForLinkedJob(jobs){
                var modalInstance = $uibModal.open({
                    templateUrl: 'myModalContentForLinkedJob.html',
                    controller: ModalInstanceLinkedJobCtrl,
                    resolve: {
                        jobs: function () {
                            return jobs;
                        }
                    }
                });
                modalInstance.result.then(function (el) {
                    if (el.type=='add'){
                        $scope.jobName._id=el.job._id;
                        $scope.jobName.name=el.job.name;
                        $scope.jobName.norma=el.job.norma;
                        $scope.jobType._id=el.job.jobType;
                        $scope.addJob();
                    } else if (el.type=='delete') {
                        LinkedJob.delete({spark:jobs.spark , job:el.job._id},function(res){
                            console.log(res);
                            alert('Cвязанная работа удалена!');
                        })
                    }
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            }
            var ModalInstanceLinkedJobCtrl = function ($scope,$uibModalInstance,jobs){
                $scope.jobs=jobs;
                $scope.toOrder = function (job,type) {
                    job.type=type;
                    $uibModalInstance.close(job);
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            }


            $scope.openModal = function (size) {
                //console.log($scope.sparkCode);
                if (!$scope.sparkCode.val) return;
                $scope.sparkCode.val=$scope.sparkCode.val.substring(0,30)
                var modalInstance = $uibModal.open({
                    templateUrl: 'myModalContent.html',
                    controller: ModalInstanceCtrl,
                    windowClass:'full',
                    //size:'lg',
                    resolve: {
                        searchStr: function () {
                            return $scope.sparkCode.val;
                        },
                        parse: function(){return $scope.parse}
                    }
                });

                modalInstance.result.then(function (selectedItem) {
                    //console.log(selectedItem);
                    $scope.addSpark(selectedItem);

                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            };
            var ModalInstanceCtrl = function ($scope, $http,$uibModalInstance,searchStr,parse) {

                $scope.ratioA_Z=0.85;
                $scope.ratioS_cars=0.85;
                $scope.parse=parse;



                $scope.loadedA_Z=false;
                $scope.loadedS_cars=false;
                $scope.loadedShippers=false;

                if (!searchStr) return;

                $scope.searchStr= searchStr.substring(0,30).toLowerCase();
                $http.get('/api/search/shippers/'+$scope.searchStr).success(function (data, status, headers, config) {
                    $scope.shippers=data;
                    //console.log($scope.shippers)
                    $scope.loadedShippers=true;

                }).error(function (data, status, headers, config) { })

                $http.get('/api/search/sparkA-Z/'+$scope.searchStr+'?order=order').success(function (data, status, headers, config) {
                    $scope.resultsA_Z=data;
                    //console.log($scope.resultsA_Z)
                    for (var key in $scope.resultsA_Z){
                        if (key=='1'){
                            for(var i= 0,l=$scope.resultsA_Z[key].length;i<l;i++){
                                //console.log($scope.resultsA_Z[key][i]);
                                for(var j= 0,lj=$scope.resultsA_Z[key][i].length;j<lj;j++){
                                    if ($scope.resultsA_Z[key][i][j] =='A-Zauto'){
                                        $scope.resultsA_Z[key][i][j]='Cклад 1';
                                    } else if ($scope.resultsA_Z[key][i][j] =='A4-E40'){
                                        $scope.resultsA_Z[key][i][j]='Cклад 1a';
                                    }
                                }

                            }
                        }
                        //console.log($scope.resultsA_Z[key])
                    }

                    $scope.loadedA_Z=true;
                    $scope.showResult=true;

                }).error(function (data, status, headers, config) { })
                //$scope.searchStr= $scope.searchStr.substring(0,30).toLowerCase();
                $http.get('/api/search/sparkS-cars/'+$scope.searchStr+'?order=order').success(function (data, status, headers, config) {
                    $scope.HtmlS_cars=data;
                    console.log($scope.HtmlS_cars)
                    $scope.loadedS_cars=true;
                    $scope.showResult=true;
                    //$timeout(function(){$scope.$apply()},200);

                }).error(function (data, status, headers, config) { })

                $scope.getAdditionTable =function(url){
                    //console.log(url);
                    //console.log(str);
                    $scope.HtmlS_cars='';
                    $scope.loadedS_cars=false;
                    $http.get('/api/search/sparkS-cars/'+url+'&order=order').success(function (data, status, headers, config) {
                        $scope.HtmlS_cars=data;
                        //console.log($scope.HtmlS_cars)

                        $scope.loadedS_cars=true;
                        $scope.showResult=true;


                    }).error(function (data, status, headers, config) { })
                }

                $scope.getNewPriceA_Z = function(n,zakaz){
                    //console.log(n,zakaz);
                    if (n){
                        if (zakaz){
                            var a = (parseFloat(n)*parseFloat($scope.parse.azzakaz)).toFixed(2);
                            //console.log(a);
                        } else {
                            var a = (parseFloat(n)*parseFloat($scope.parse.az)).toFixed(2);
                        }

                        if (a=='NaN'){a='0.00'}
                        return a;
                    } else {
                        return '0.00';
                    }

                }

                $scope.getNewPriceS_cars = function(n,zakaz){
                    if (n){
                        if (zakaz){
                            var a = (parseFloat(n)*parseFloat($scope.parse.scarsZakaz)).toFixed(2);
                        } else {
                            var a = (parseFloat(n)*parseFloat($scope.parse.scars)).toFixed(2);
                        }
                        if (a=='NaN'){a='0.00'}
                        return a;
                    } else {
                        return '0.00';
                    }

                }
                $scope.toOrder = function (code,name,price) {
                    // перевод цены в евро
                    //console.log($rootScope.config.currency['EUR'][0]);
                    price = (price/$rootScope.config.currency['EUR'][0]).toFixed(2);
                    $uibModalInstance.close({code:code,name:name,price:price});
                    //console.log('in order');

                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };
            function setIncomePrice(){
                var options ={
                    templateUrl: 'invoice/components/invoice/setIncomePrice.html',
                    controller: setIncomePriceCtrl,
                    windowClass:'full',
                    //size:'lg',
                    animation: true,
                    controllerAs:'$ctrl',
                    resolve: {
                        sparks: function(){return $scope.jobTicket.sparks},
                        jobs: function(){return $scope.jobTicket.jobs},
                        producers: function(){return self.producers},
                        suppliers: function(){return self.suppliers}
                    }
                }
                $uibModal.open(options).result.then(function () {
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            }
            function setIncomePriceCtrl($scope,$uibModalInstance,sparks,jobs,producers,suppliers){
                var self = this;
                $scope.suppliers=suppliers;
                //console.log($scope.suppliers)
                $scope.producers=producers;
                $scope.cancel = cancel;
                $scope.sparks=sparks;
                jobs.forEach(function (j) {
                    if(j.supplierType && !j.currency){
                        j.currency='UAH'
                    }
                })
                $scope.jobs=jobs;
                $scope.getTotalSpark=getTotalSpark;
                $scope.recalcOncomePrice=recalcOncomePrice;




                $scope.ok=ok;

                function getTotalSpark(){
                    var sum=0
                    sparks.forEach(function(s){
                        if(s.incomeSum){
                            sum += s.incomeSum*1;
                        }
                    })
                    return sum;
                }
                function recalcOncomePrice(p){
                    //console.log(p)
                    return Number((p/$rootScope.config.currency['EUR'][0]).toFixed(2))
                }
                function cancel() {
                    $uibModalInstance.dismiss('cancel');
                };
                function ok() {
                    $uibModalInstance.dismiss('cancel');
                };
            }
        }
    }

})();