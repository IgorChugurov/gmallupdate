'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
     value('version', '0.1')
.factory('User', function ($resource) {
        return $resource('/api/users/:id/:email', {
            id: '@id'
        }, { //parameters default
            update: {
                method: 'PUT',
                params: {
                    id:'profile',
                    email:''
                }
            },
            updatePswd: {
                method: 'PUT',
                params: {
                   // id:'profile'
                   id:'changepswd',
                    email:''
                }
            },
            resetPswd: {
                method: 'POST',
                params: {
                    id:'resetpswd',
                    email:'@email'
                }
            },
            get: {
                method: 'GET',
                params: {
                    id:'me',
                    email:''
                }
            }
        });
    })
.factory('Session',['$resource', function ($resource) {
        return $resource('/api/session/');
    }])

.factory('Auth',['$location', '$rootScope', 'Session', 'User', '$cookieStore', function Auth($location, $rootScope, Session, User, $cookieStore) {

        // Get currentUser from cookie
        $rootScope.currentUser = $cookieStore.get('user') || null;
        $cookieStore.remove('user');
        //console.log($rootScope.currentUser);

        return {

            /**
             * Authenticate user
             *
             * @param  {Object}   user     - login info
             * @param  {Function} callback - optional
             * @return {Promise}
             */
            login: function(user, callback) {
                var cb = callback || angular.noop;

                return Session.save({
                    email: user.email,
                    password: user.password
                }, function(user) {
                    $rootScope.user = User.get();
                    return cb();
                }, function(err) {
                    return cb(err);
                }).$promise;
            },

            /**
             * Unauthenticate user
             *
             * @param  {Function} callback - optional
             * @return {Promise}
             */
            logout: function(callback) {
                var cb = callback || angular.noop;

                return Session.delete(function() {
                        $rootScope.user = null;
                        return cb();
                    },
                    function(err) {
                        return cb(err);
                    }).$promise;
            },

            /**
             * Create a new user
             *
             * @param  {Object}   user     - user info
             * @param  {Function} callback - optional
             * @return {Promise}
             */
            createUser: function(user, callback) {
                var cb = callback || angular.noop;


                return User.save(user,
                    function(user) {
                        $rootScope.user = User.get();
                        // авторизация сразу после регистрации
                        //console.log($rootScope.currentUser);
                        return cb(user);
                    },
                    function(err) {
                        return cb(err);
                    }).$promise;
            },

            /**
             * Change password
             *
             * @param  {String}   oldPassword
             * @param  {String}   newPassword
             * @param  {Function} callback    - optional
             * @return {Promise}
             */
            changePassword: function(oldPassword, newPassword, callback) {
                var cb = callback || angular.noop;

                return User.updatePswd({
                    oldPassword: oldPassword,
                    newPassword: newPassword
                }, function(user) {
                    return cb(user);
                }, function(err) {
                    return cb(err);
                }).$promise;
            },
            resetPswd: function( email,callback) {
                var cb = callback || angular.noop;
                return User.resetPswd(email, function(user) {
                    return cb(user);
                }, function(err) {
                    return cb(err);
                }).$promise;
            },

            /**
             * Gets all available info on authenticated user
             *
             * @return {Object} user
             */
            currentUser: function() {
                return User.get();
            },

            /**
             * Simple check to see if a user is logged in
             *
             * @return {Boolean}
             */
            isLoggedIn: function() {
                var user = $rootScope.user;
                return !!user;
            },
        };
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

    .factory('Orders',['$resource', function($resource){
        return $resource('/api/order/:id', {}, {
            list: {method:'GET', isArray: true, params:{id:''}},
            add: {method:'POST',params:{id:''}},
            update: {method:'PUT',params: {id: ''}},
            delete: {method:'DELETE',params: {id: '@_id'}},
            get:{method:'GET', params: {id: '@_id'}}
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

    .factory('CartLocal',['localStorage','$http','$rootScope','$filter','$timeout','$location', function(localStorage,$http,$rootScope,$filter,$timeout,$location){
        var self = this;
        self.sum;
        self.quantity;
        //console.log('dddd');
        var cartItems = [];
        var cartItems = localStorage.get('cart');


        var cartComment='';

        var sendOrder= true;
        var items = cartCount();
        //console.log(items);

        var divider = 1;

        function list(){
            return cartItems;
        }
        function cartCount(){
            var i=0;
            cartItems.forEach(function(item){
                //console.log(item.quantity);
                if(item.quantity)
                    i +=Number(item.quantity);
            })
            return i;
        }

        function getCount(itemTo){
            //console.log('ss');
            var count = 1;
            cartItems.forEach(function(current){
                if (current.stuff == itemTo.stuf){
                    count = current.quantity;
                }
            })
            return count;
        }

        function addToCart(itemTo){
            //console.log(itemTo);
            var itemFound = false;

            cartItems.forEach(function(current){
                //console.log(current);

                if (current.stuff == itemTo.stuff){
                    current.quantity = itemTo.quantity;
                    //console.log(current.quantity);
                    itemFound=true;
                }
            });

            if (!itemFound){
                //item.quantity;
                var itemToCart= new Object;
                itemToCart = JSON.parse(JSON.stringify(itemTo));

                cartItems.push(itemToCart);
            }

            localStorage.set('cart', cartItems);
            localStorage.set('cart-count',items);
            //$rootScope.itemsOnCart = items;
        };

        function getItem(i){
            return cartItems[i];
        }

        function save(){
            localStorage.set('cart', cartItems);
        }


        function getTotalSum(){

            var sum=0;
            var i = cartCount();
            cartItems.forEach(function(c){
                var q = c.price
                sum += q * c.quantity;
            });
            //console.log(grandTotal);
            return sum;

        }

        /*function getSum(current){

            var i;

            if  (current.price){
                i=Number(current.new_price);
            } else{
                i=Number(current.price);
            }

            return i * Number(current.quantity);

        }*/


        function clearCart(){
            //console.log('ssss');
            cartItems = [];
            save();


        }


        function removeItem(i){
            cartItems.splice(i,1);
            save();
        }


        function send(lang,comment,kurs,currency,callback){
           /* self.quantity=cartCount();
            self.sum:*/
            var order={'cart':cartItems,'comment':comment,'lang':lang,'user':$rootScope.user._id,'quantity':cartCount(),'sum':getTotalSum(),'kurs':kurs,'currency':currency}
            $http.post('/api/order',order).then(function (resp) {
                    console.log(resp.data);
                    if (resp.data.done){
                        cartItems = [];
                        save();
                        callback(false);
                    } else {
                        callback(resp.data.err);
                    }
                })

        };




        return{
            addToCart:addToCart,
            list:list,
            cartCount:cartCount,
            getCount : getCount,
            getItem:getItem,
            getTotalSum:getTotalSum,
            save:save,
            clearCart:clearCart,
            removeItem:removeItem,
            send:send
        }
    }])

    .factory('localStorage', function(){
        var APP_ID =  'fraim-local-storage';

        // api exposure
        return {
            // return item value
            getB: function(item){

                return JSON.parse(localStorage.getItem(item) || 'false');
            },
            // return item value
            getN: function(item){
                var i = localStorage.getItem(item);
                if (i!='undefined'){
                    return JSON.parse(i)
                }
                else
                    return '';
            },
            // return item value
            get: function(item){
                return JSON.parse(localStorage.getItem(item) || '[]');
            },
            set: function(item, value){
                // set item value
                localStorage.setItem(item, JSON.stringify(value));
            }

        };

    });