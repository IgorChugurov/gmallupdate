'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
     value('version', '0.1')
    .factory('User', function ($resource) {
        return $resource('/api/users/:id', {
            id: '@id'
        }, { //parameters default
            update: {
                method: 'PUT',
                params: {
                    id:'profile',
                    email:''
                }
            },

            get: {
                method: 'GET',
                params: {
                    id:'me'
                }
            },
            list: {method:'GET', isArray: true, params:{id:''}},
            delete: {method:'DELETE',params: {id: '@_id'}}
        });
    })
    .factory('Session',['$resource', function ($resource) {
        return $resource('/api/session/');
    }])
    .factory('Config',['$resource', function ($resource) {
        return $resource('/api/config');
    }])

    .factory('Filters',['$resource', function($resource){
        return $resource('/api/filters/:id', {}, {
            list: {method:'GET', isArray: true, params:{id:''}},
            add: {method:'POST',params:{id:''}},
            update: {method:'PUT',params: {id: ''}},
            delete: {method:'DELETE',params: {id: '@_id'}},
            get:{method:'GET', params: {id: '@id'}}
        });
    }])
    .factory('Tags',['$resource', function($resource){
        return $resource('/api/tag/:filter/:id', {}, {
            list: {method:'GET', isArray: true, params:{filter:'@filter',id:''}},
            add: {method:'POST',params:{filter:'@filter',id:''}},
            update: {method:'PUT',params: {filter:'@filter',id: ''}},
            delete: {method:'DELETE',params: {filter:'@filter',id: '@_id'}},
            get:{method:'GET', params: {filter:'filter',id: '@id'}}
        });
    }])

    .factory('BrandTags',['$resource', function($resource){
        return $resource('/api/brandtags/:brand/:id', {}, {
            list: {method:'GET', isArray: true, params:{brand:'@brand',id:''}},
            add: {method:'POST',params:{brand:'',id:''}},
            update: {method:'PUT',params: {brand:'',id: ''}},
            delete: {method:'DELETE',params: {brand:'@brand',id: '@_id'}},
            get:{method:'GET', params: {brand:'brand',id: '@_id'}}
        });
    }])

    .factory('Brands',['$resource', function($resource){
        return $resource('/api/brand/:_id', {}, {
            list: {method:'GET', isArray: true, params:{_id:''}},
            add: {method:'POST',params:{_id:''}},
            update: {method:'PUT',params: {_id: ''}},
            delete: {method:'DELETE',params: {_id: '@_id'}},
            get:{method:'GET', params: {_id: '@_id'}}
        });
    }])
    .factory('Category',['$resource', function($resource){
        return $resource('/api/category/:_id', {}, {
            list: {method:'GET', isArray: true, params:{_id:''}},
            add: {method:'POST',params:{_id:''}},
            update: {method:'PUT',params: {_id: ''}},
            delete: {method:'DELETE',params: {_id: '@_id'}},
            get:{method:'GET', params: {_id: '@_id'}}
        });
    }])

    .factory('Comment',['$resource', function($resource){
        return $resource('/api/commentStuff/:_id', {}, {
            list: {method:'GET', isArray: true, params:{_id:''}},
            add: {method:'POST',params:{_id:''}},
            update: {method:'PUT',params: {_id: ''}},
            delete: {method:'DELETE',params: {_id: '@_id'}},
            get:{method:'GET', params: {_id: '@_id'}}
        });
    }])

    .factory('Stuff',['$resource', function($resource){
        return $resource('/api/stuff/:category/:brand/:id', {}, {
            list: {method:'GET', isArray: true, params:{category:'@category',brand:'@brand',id:''}},
            add: {method:'POST',params:{category:'category',brand:'brand',id:''}},
            update: {method:'PUT',params: {category:'category',brand:'brand',id:''}},
            updateGallery: {method:'PUT',params: {category:'category',brand:'brand',id:'gallery'}},
            delete: {method:'DELETE',params: {category:'category',brand:'brand',id:'@_id'}},
            get:{method:'GET', params: {category:'category',brand:'brand',id:'@_id'}},
            full:{method:'GET', params: {category:'category',brand:'brand',id:'@_id'}}
        });
    }])

    .factory('News',['$resource', function($resource){
        return $resource('/api/news/:id', {}, {
            list: {method:'GET', isArray: true, params:{id:''}},
            add: {method:'POST',params:{id:''}},
            update: {method:'PUT',params: {id:''}},
            updateGallery: {method:'PUT',params: {id:'gallery'}},
            delete: {method:'DELETE',params: {id:'@_id'}},
            get:{method:'GET', params: {id:'@_id'}}
            //full:{method:'GET', params: {id:'@_id'}},
        });
    }])


    .factory('Stat',['$resource', function($resource){
        return $resource('/api/stat/:id', {}, {
            list: {method:'GET', isArray: true, params:{id:''}},
            add: {method:'POST',params:{id:''}},
            update: {method:'PUT',params: {id:''}},
            delete: {method:'DELETE',params: {id:'@_id'}},
            get:{method:'GET', params: {id:'@_id'}},
        });
    }])

    .factory('Country',['$resource', function($resource){
        return $resource('/api/country/:id', {}, {
            list: {method:'GET', isArray: true, params:{id:''}},
            add: {method:'POST',params:{id:''}},
            update: {method:'PUT',params: {id: ''}},
            delete: {method:'DELETE',params: {id: '@_id'}},
            get:{method:'GET', params: {id: '@_id'}}
        });
    }])
    .factory('Region',['$resource', function($resource){
        return $resource('/api/region/:country/:id', {}, {
            list: {method:'GET', isArray: true, params:{country:'@country',id:''}},
            add: {method:'POST',params:{country:'country',id:''}},
            update: {method:'PUT',params: {country:'country',id: ''}},
            delete: {method:'DELETE',params: {country:'country',id: '@_id'}},
            get:{method:'GET', params: {country:'country',id: '@_id'}}
        });
    }])
    .factory('City',['$resource', function($resource){
        return $resource('/api/city/:region/:id', {}, {
            list: {method:'GET', isArray: true, params:{region:'@region',id:''}},
            add: {method:'POST',params:{region:'region',id:''}},
            update: {method:'PUT',params: {region:'region',id: ''}},
            delete: {method:'DELETE',params: {region:'region',id: '@_id'}},
            get:{method:'GET', params: {region:'region',id: '@_id'}}
        });
    }])

    .factory('Cakes',['$resource', function($resource){
        return $resource('/api/cakes/:section/:id', {}, {
            list: {method:'GET', isArray: true, params:{section:'section',id:''}},
            add: {method:'POST',params:{section:'',id:''}},
            update: {method:'PUT',params: {section:'',id: ''}},
            delete: {method:'DELETE',params: {section:'section',id: '@_id'}},
            get:{method:'GET', params: {section:'section',id: '@id'}}
        });
    }])

    .factory('Groups',['$resource', function($resource){
        return $resource('/api/groups/:id', {}, {
            list: {method:'GET', isArray: true, params:{id:''}},
            add: {method:'POST',params:{id:''}},
            update: {method:'PUT',params: {id: ''}},
            delete: {method:'DELETE',params: {id: '@_id'}},
            get:{method:'GET', params: {id: '@id'}}
        });
    }])

    .factory('Goods',['$resource', function($resource){
        return $resource('/api/goods/:idc/:id', {}, {
            list: {method:'GET', isArray: true, params:{sidc:'@id',id:''}},
            add: {method:'POST',params:{idc:'',id:''}},
            update: {method:'PUT',params: {idc:'',id: ''}},
            delete: {method:'DELETE',params: {idc:'type',id: '@_id'}},
            get:{method:'GET', params: {idc:'type',id: '@_id'}}
        });
    }])
    .factory('Categories',['$resource', function($resource){
        return $resource('/api/categories/:id', {}, {
            list: {method:'GET', isArray: true, params:{id:''}},
            add: {method:'POST',params:{id:''}},
            update: {method:'PUT',params: {id: ''}},
            delete: {method:'DELETE',params: {id: '@_id'}},
            get:{method:'GET', params: {id: '@id'}}
        });
    }])


    .factory('Comments',['$resource', function($resource){
        return $resource('/api/goods/comments/:id/:idC', {}, {
            list: {method:'GET', isArray: true, params:{id:'@id',idC:''}},
            add: {method:'POST',params:{id:'',idC:''}},
            update: {method:'PUT',params: {id:'',idC: ''}},
            delete: {method:'DELETE',params: {id:'@idGood',idC: '@_id'}},
            get:{method:'GET', params: {id:'@id',idC: '@idC'}}
        });
    }])

    .factory('Orders',['$resource', function($resource){
        return $resource('/api/order/:id', {}, {
            list: {method:'GET', isArray: true, params:{id:''}},
            add: {method:'POST',params:{id:''}},
            update: {method:'PUT',params: {id: ''}},
            delete: {method:'DELETE',params: {id: '@_id'}},
            get:{method:'GET', params: {id: '@_id'}}
        });
    }])

/*.factory('Currency',['$http' , function($http){
    var currency = {arr:null};
    function get(){
        return $http.get('/getconfig');
        *//*$http.get('/getconfig').success(function(data) {
            console.log(data);
            currency.arr=data;
        });
        return currency;*//*
    }

    function put(cur){
        return $http.post('/putconfig',cur);
    }

    return {get :get,
        put:put};

}])*/


.service('$fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl,id,params){

        var fd = new FormData();
        fd.append('file', file);
        fd.append('id', id);
       // console.log(params);
        if (params && (typeof params == "object")){
            for (var key in params) {
                fd.append(key, params[key]);
            }
        }

       /* if (gallery)
            fd.append('gallery', angular.toJson(gallery));
        if (oldFile)
            fd.append('oldFile', oldFile);*/

        var promise = $http.post(uploadUrl, fd, {
            withCredentials: true,
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then(function (res) {
                return{
                    status: function () {
                        return res.status;
                    },
                    data: function () {
                        return res.data;
                    }
                };
            });
        return promise;
    }
}])

.service('$fileUploadNew', ['$http', function ($http) {
        this.uploadFileToUrl = function(file, uploadUrl,id,params){
           // console.log(file);
            var fd = new FormData();
            fd.append('file', file);
            fd.append('id', id);
            // console.log(params);
            if (params && (typeof params == "object")){
                for (var key in params) {
                    fd.append(key, params[key]);
                }
            }

            /*if (gallery)
             fd.append('gallery', angular.toJson(gallery));
             if (oldFile)
             fd.append('oldFile', oldFile);*/

           return $http.post(uploadUrl, fd, {
                withCredentials: true,
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
        }
    }])

