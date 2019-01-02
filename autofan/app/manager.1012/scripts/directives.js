'use strict';

/* Directives */

angular.module('myApp.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  })

 .directive('mongooseError', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            element.on('keydown', function() {
                return ngModel.$setValidity('mongoose', true);
            });
        }
    };
})
    .directive("fileRead", ['$parse',function ($parse) {
        return {
            restrict: 'A',
            /* scope: {
             fileread: "="
             },  */
            link: function (scope, element, attrs) {
                element.bind("change", function (changeEvent) {
                    var model = $parse(attrs.fileread);
                    var modelSetter = model.assign;
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            scope.myFileSrc = loadEvent.target.result;
                            scope.noLoad=false;
                            //smodelSetter(scope, loadEvent.target.result);
                            //console.log(loadEvent.target.result);
                        });
                    }
                    scope.myFile= changeEvent.target.files[0];
                    reader.readAsDataURL(changeEvent.target.files[0]);
                });
            }
        }
    }]);


Array.prototype.in_array = function(p_val) {
    for(var i = 0, l = this.length; i < l; i++)  {
        if(this[i] == p_val) {
    	    return true;
        }
    }
    return false;
}

angular.module('myApp').directive('focus',
    function() {
        return {
            link: function(scope, element, attrs) {
                element[0].focus();
            }
        };
    })
//How to set focus in AngularJS? http://stackoverflow.com/questions/14833326/how-to-set-focus-in-angularjs
.directive('focusMe1', function($timeout,$parse) {
    return {
        link: function(scope, element, attrs) {
            var model = $parse(attrs.focusMe);
            scope.$watch(model, function(value) {
                if(value === true) {
                    //nsole.log('value=',value);
                    $timeout(function() {
                    element[0].focus();
                    scope[attrs.focusMe] = false;
                    },50);
                }
            });
            element.bind('blur', function() {
                console.log('blur');
                scope.$apply(model.assign(scope, false));
            });
        }
    };
})

//http://stackoverflow.com/questions/16502559/angular-js-using-a-directive-inside-an-ng-repeat-and-a-mysterious-power-of-sco
    // Angular.js: Using a directive inside an ng-repeat, and a mysterious power of scope '@'
.directive('focusMe', function($timeout) {
    return {
        scope: { trigger: '=focusMe' },
        link: function(scope, element) {
            scope.$watch('trigger', function(value) {
                //console.log('dd');
                if(value === true) {
                    //console.log('trigger',value);
                    //$timeout(function() {
                    //console.log(element[0]);
                    $timeout(function(){element[0].focus()},50);
                    element[0].focus();
                    scope.trigger = false;
                    //});
                }
            });
        }
    };
})
    .directive('focusMeT', function($timeout) {
        return {
            scope: { trigger: '=focusMe' },
            link: function(scope, element) {
                scope.$watch('trigger', function(value) {
                    console.log('dd');
                    if(value === true) {
                        console.log('trigger',value);
                        //$timeout(function() {
                        element[0].focus();
                        scope.trigger = false;
                        //});
                    }
                });
            }
        };
    })


//http://habrahabr.ru/post/179473/
//Валидация форм в AngularJS http://habrahabr.ru/post/167793/
.directive('mimimi', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(mimimi) {
                if (/mimimi/.test(mimimi)) {
                    alert('mimimi');
                    ctrl.$setValidity('mimimi', true);
                    return mimimi.toUpperCase();
                } else {
                    ctrl.$setValidity('mimimi', false);
                    return undefined;
                }
            });
        }
    };
})


    .directive("spinner", function($compile){
        return {
            restrict: 'E',
            scope: {enable:"="},
            link: function(scope, element, attr) {

                var spinner =angular.element('<div class="spinner" id="spinner" ng-show="enable" ' +
                    'style="position: fixed; opacity: 0.6; bottom:0; z-index:2000;' +
                    'background: #CCC' +
                    /*'background: ' +
                     'url(../img/spinner.gif) no-repeat center center #d2e3c3' +*/
                    '"></div>');
                var img=angular.element('<img src="../img/spinner.gif" style="position: fixed; bottom:50%; left: 45%; ">');
                spinner.append(img);

                var el= $compile(spinner)(scope);
                $('body').append(spinner);

                scope.$on('$destroy', function() {
                    $('#spinner').remove();
                });
                scope.$watch('enable',function(n,o){
                    if (n){
                        //console.log('dd');
                        abso()
                    }
                });

                function abso() {
                    var height= ($("body").height()>$(window).height())?$("body").height():$(window).height();
                    $('#spinner').css({
                        position: 'fixed',
                        width: $(window).width(),
                        height: height
                    });
                }

                $(window).resize(function() {
                    //console.log('sssss');
                    abso();
                });
                /*$(window).scroll(function(){
                 if($(window).scrollTop() > elementPosition.top){
                 spinner.css('position','fixed').css('top','0');
                 } else {
                 $('#navigation').css('position','static');
                 }
                 });*/

                abso();

                /*scope.$watch('enable', function() {
                 //                element.html($parse(attr.content)(scope));
                 //                $compile(element.contents())(scope);
                 console.log(scope.enable);
                 }, true);*/
            }
        }
    })



    /*.directive("spinner", function($compile){
        return {
            restrict: 'E',
            scope: {enable:"="},
            link: function(scope, element, attr) {

                var spinner =angular.element('<div class="spinner" id="spinner" ng-show="enable" ' +
                    'style="position: fixed; opacity: 0.6; bottom:0; z-index:2000;' +
                    'background: #CCC' +
                '"></div>');
                var img=angular.element('<img src="../img/spinner.gif" style="position: fixed; bottom:50%; left: 45%; ">');
                spinner.append(img);

                var el= $compile(spinner)(scope);
                $('body').append(spinner);

                scope.$on('$destroy', function() {
                    $('#spinner').remove();
                });
                scope.$watch('enable',function(n,o){
                    if (n){
                        abso()
                    }
                });



                function abso() {
                    var height= ($("body").height()>$(window).height())?$("body").height():$(window).height();
                    $('#spinner').css({
                        position: 'fixed',
                        width: $(window).width(),
                        height: height
                    });
                }

                $(window).resize(function() {
                    abso();
                });
                *//*$(window).scroll(function(){
                 if($(window).scrollTop() > elementPosition.top){
                 spinner.css('position','fixed').css('top','0');
                 } else {
                 $('#navigation').css('position','static');
                 }
                 });*//*

                abso();

                *//*scope.$watch('enable', function() {
                 //                element.html($parse(attr.content)(scope));
                 //                $compile(element.contents())(scope);
                 console.log(scope.enable);
                 }, true);*//*
            }
        }
    })
*/
    .directive('keypressEvents',

    function ($document, $rootScope) {
        return {
            restrict: 'A',
            link: function () {
                //console.log('linked');
                $document.bind('keypress', function (e) {
                    $rootScope.$broadcast('keypress', e, String.fromCharCode(e.which));
                });
            }
        }
    });



