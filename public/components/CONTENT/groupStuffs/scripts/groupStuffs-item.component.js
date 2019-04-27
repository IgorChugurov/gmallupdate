'use strict';
(function(){

    angular.module('gmall.directives')
        .directive('groupStuffsItem',groupStuffsItemDirective)
    function groupStuffsItemDirective(){
        return {
            scope: {},
            restrict:"E",
            bindToController: true,
            controller: groupStuffsItemCtrl,
            controllerAs: '$ctrl',
            templateUrl: 'components/CONTENT/groupStuffs/groupStuffsItem.html',
        }
    }
    groupStuffsItemCtrl.$inject=['GroupStuffs','$stateParams','$q','$uibModal','global','exception','Stuff','Photo','$scope','$timeout','Confirm','Category','Master','$fileUpload'];
    function groupStuffsItemCtrl(GroupStuffs,$stateParams,$q,$uibModal,global,exception,Stuff,Photo,$scope,$timeout,Confirm,Category,Master,$fileUpload){
        var self = this;
        self.Items=GroupStuffs;
        self.type='GroupStuffs'
        self.item={};
        self.mobile=global.get('mobile' ).val;
        self.global=global;
        self.moment=moment;
        self.block='desc';
        self.filters=[];
        self.saveField=saveField;


        self.addItemInBlock=addItemInBlock;
        self.movedItem=movedItem;
        self.deleteItemFromBlock=deleteItemFromBlock;
        self.changeItem=changeItem;
        self.changeCategory=changeCategory;
        self.deleteCategory=deleteCategory;
        self.changeBlock=function (block) {
            console.log(block)
            self.block=block;
        }
        self.selectFilter=selectFilter;
        self.loadVideo=loadVideo;
        self.deleteVideo=deleteVideo;


        //********************activate***************************
        activate();
        //*******************************************************
        function activate() {
            $q.when()
                .then(function () {
                    return Master.getList()
                })
                .then(function (ms) {
                    self.masters=ms
                    //console.log(self.masters)
                })
                .then(function() {
                    return getItem($stateParams.id)
                })
                .catch(function(err){
                    err = err.data||err
                    exception.catcher('получение объекта')(err)
                });
        }
        $scope.$on('changeLang',function(){
            activate();
        })

        function clearTagsInFilters(){
            global.get('filters').val.forEach(function (f) {
                f.tags.forEach(function (t) {
                    t.set=false;
                })
            })
        }
        function getItem(id) {
            //console.log(id)
            return self.Items.getItem(id)
                //console.log(id)
                .then(function(data) {
                    if(data.tags && data.tags.length){
                        data.tags=data.tags.map(function (t) {
                            return t._id;
                        })
                    }
                    if(data.category && global.get('categoriesO').val[data.category]){
                        data.category=global.get('categoriesO').val[data.category];
                    }
                    //console.log(data.category)
                    clearTagsInFilters();
                    if(data.category && data.category.filters && data.category.filters.length){
                        data.category.filters.forEach(function (f) {
                            var _f = global.get('filters').val.getOFA('_id',f)
                            if(_f){
                                _f.tags.forEach(function (t) {
                                    if(data.tags.indexOf(t._id)>-1){
                                        t.set=true;
                                    }
                                })
                                self.filters.push(_f)
                            }
                        })

                    }

                    //console.log(self.filters)
                    self.item=data;
                    return self.item;
                } ).catch(function(err){
                    console.log(err)
                    return $q.reject(err)
                });
        }
        function saveField(field,defer){
            console.log(field)
            defer =(defer)?defer:100;
            setTimeout(function(){
                var o={_id:self.item._id};
                if(field=='stuffs'){
                    var value = self.item['stuffs'].map(function (s) {
                        return s._id
                    })
                }else if(field=='category'){
                    if(self.item.category &&self.item.category._id){
                        var value =self.item.category._id;
                    }else{
                        var value =  null
                    }
                }else{
                    var value =  self.item[field]
                }
                o[field]=value;
                var query={update:field};

                self.Items.save(query,o,function () {
                    global.set('saving',true)
                    $timeout(function () {
                        global.set('saving',false);
                    },1500)
                });
            },defer)
        };
        function saveFieldStuff(stuff,field){
            setTimeout(function(){
                var o={_id:stuff._id};
                var value =  stuff[field]
                o[field]=value;
                var query={update:field};
                Stuff.save(query,o,function () {
                    global.set('saving',true)
                    $timeout(function () {
                        global.set('saving',false);
                    },1500)
                });
            },100)
        };


        function addItemInBlock(index) {
            var model=Stuff
            $q.when()
                .then(function () {
                    return model.select()
                })
                .then(function (item) {
                    /*if(item.groupStuffs){
                        throw ('товар уже входит в группу '+item.groupStuffs)
                    }*/
                    item.img=(item.gallery[0] && item.gallery[0].thumb)?item.gallery[0].thumb:null;
                    if(!self.item.stuffs){
                        self.item.stuffs=[];
                    }

                    if(typeof index=='undefined'){
                        self.item.stuffs.push(item)
                    }else{
                        self.item.stuffs[index].groupStuffs=null;
                        saveFieldStuff(self.item.stuffs[index],'groupStuffs');
                        self.item.stuffs[index]=item
                    }

                    item.groupStuffs=self.item._id;
                    saveFieldStuff(item,'groupStuffs');

                    saveField('stuffs')
                })
                .catch(function (err) {
                    if(err){
                        exception.catcher('выбор товара')(err)
                    }
                })
        }
        function movedItem(item) {
            $timeout(function(){
                saveField('stuffs')
            },100)
            return item;
        }
        function deleteItemFromBlock($index) {
            Confirm('удалить?').then(function () {
                self.item.stuffs[$index].groupStuffs=null;
                saveFieldStuff(self.item.stuffs[$index],'groupStuffs');
                self.item.stuffs.splice($index,1);
                saveField('stuffs')
            })
        }
        function changeItem($index) {
            addItemInBlock($index)
        }

        function changeCategory() {
            $q.when()
                .then(function(){
                    var categoryId=(self.item.category && self.item.category._id)?self.item.category._id:null
                    return Category.select(categoryId,null,null,'groupStuffs');
                })
                .then(function(selectedCategory){
                    console.log(selectedCategory)
                    self.item.link=selectedCategory.linkData.groupUrl+'/'+selectedCategory.linkData.categoryUrl+'/'+self.item.url;
                    saveField('link')
                    self.item.category=selectedCategory;
                    saveField('category')
                    self.item.tags=[];
                    self.filters=[];
                    saveField('tags')
                    clearTagsInFilters();
                    if(self.item.category.filters && self.item.category.filters.length){
                        self.item.category.filters.forEach(function (f) {
                            var _f = global.get('filters').val.getOFA('_id',f)
                            if(_f){
                                self.filters.push(_f)
                            }
                        })

                    }

                })
                .catch(function(err){
                    if(err){
                        exception.catcher('выбор категории')(err)
                    }
                })
        }
        function deleteCategory() {
            self.item.category=null;
            saveField('category')
            self.item.tags=[];
            self.filters=[];
            saveField('tags')
            clearTagsInFilters();
        }
        function selectFilter(filter) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'components/selectCategoryModal/selectFilterModal.html',
                controller: function ($scope, $uibModalInstance,filter) {
                    $scope.filter=filter;
                    $scope.allTags=false;
                    $scope.changeAllTags=function(criteria){
                        filter.tags.forEach(function(tag){
                            tag.set=criteria;
                        })
                    }
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss();
                    };
                },
                size: 'sm',
                //appendTo:editBody,
                resolve: {
                    filter: function () {
                        return filter;
                    },
                }
            });
            modalInstance.result.then(function (selectedTags) {
                //console.log(selectedTags)


            }, function () {
                self.item.tags=[];
                if (self.filters.length){
                    self.filters.forEach(function(filter){
                        filter.tags.forEach(function(tag){
                            if(tag.set){
                                self.item.tags.push(tag._id)
                            }
                        })
                    })
                }
                saveField('tags');
            });
        }
        function loadVideo(field){
            if(!self.item[field]){
                self.item[field]={link:''}
            }
            $q.when()
                .then(function () {
                    self.uploadVideoUrl="/api/collections/GroupStuffs/uploadVideoFile?collectionName=GroupStuffs"
                    return $fileUpload.fileUpload(self.uploadVideoUrl,field+'.link',self.item.url)
                })
                .then(function (res) {
                    console.log(res)
                    if(res && res.length){
                        var a=[];
                        if((field=='video1' || field=='video') && res[0].data && res[0].data.img){
                            if(self.item[field] && self.item[field].link){
                                a.push(self.item[field].link)
                            }
                            self.item[field].link=res[0].data.img;
                            //console.log(field)
                            saveField(field)
                        }
                        if(a.length){
                            Photo.deleteFiles(self.type,a)
                        }

                    }

                    //console.log(res)
                })
                .catch(function (err) {
                    console.log(err)
                })
        }
        function deleteVideo(field) {
            Confirm('Удалить?')
                .then(function () {
                    return Photo.deleteFiles(self.type,[self.item[field].link])
                })
                .then(function(response) {
                    self.item[field]=null;
                    saveField(filed)
                },function(err) {console.log(err)});
        }
    }
})()
