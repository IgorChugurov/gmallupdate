'use strict';

/* Directives */

angular.module('myApp.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  })

.directive('disableAnimation', function($animate){
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs){
            $attrs.$observe('disableAnimation', function(value){
                $animate.enabled(!value, $element);
            });
        }
    }
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

.directive("uiSrefParams", function($state) {
    return {
        link: function(scope, elm, attrs) {
            var params;
            params = scope.$eval(attrs.uiSrefParams);
            //console.log(params);
            return elm.bind("click", function(e) {
                var button;
                console.log(params);
                if (!angular.equals($state.params, params)) {
                    button = e.which || e.button;
                    if ((button === 0 || button === 1) && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                        scope.$evalAsync(function() {
                            return $state.go(".", params);
                        });
                        return e.preventDefault();
                    }
                }
            });
        }
    };
})
    //http://www.befundoo.com/university/tutorials/angularjs-directives-tutorial/
    .directive('galleryForZoom', function($compile) {
        return {
            restrict: 'A',
            scope:{
                galleryForZoom:'=',
                onPhotoSelected: '&'},
            link: function(scope, element, attrs) {
                scope.$watch('galleryForZoom',function(oldVal,newVal){
                    if (oldVal==newVal) return;
                    linkElastislide(oldVal);
                })

                function linkElastislide(galArr){
                    var galul =angular.element('<ul id="carousel2"  class="elastislide-list"></ul>');
                    for(var i=0;i<galArr.length;i++){
                        galul.append("<li><a  ng-click='toggle("+i+")' data-image='"+galArr[i].thumb+"'  data-zoom-image='"
                            +galArr[i].img+"'><img id='img_"+i+"'  src='"+galArr[i].thumb+"' /></a></li>");
                    }
                    var el= $compile(galul)(scope);
                    element.parent().append(el);
                    $('#carousel2').elastislide();
                }
                scope.toggle = function(index) {
                    //console.log('index -'+index);
                   /* var a =$(element);
                    a.parent().find('a').removeClass('active');*/
                    //var a =$(element);
                    //$(element).addClass('active');

                    $('#carousel2 a').removeClass('active').eq(index).addClass('active');
                    scope.onPhotoSelected({newIndex: index});
                };
            }
        }
    })


.directive('ngElevateZoom', function($compile) {
    return {
        restrict: 'A',
        scope: {
            galleryZoom: '='
        },
        link: function(scope, element, attrs) {

            scope.$watch('galleryZoom',function(oldVal,newVal){
                if (oldVal==newVal) return;
                linkElevateZoom(oldVal);
            })
            /*attrs.$observe('src',function(srcAttribute){
                console.log("$observe : " +srcAttribute);
            })*/
            function linkElevateZoom(galArr){
                if (!attrs.zoomImage || !attrs.galleryZoom ) return;
                element.attr('data-zoom-image',attrs.zoomImage);
                var galDiv = angular.element("<div id='gallery_022'></div>");
                for(var i=0;i<galArr.length;i++){
                    galDiv.append("<a  data-image='"+galArr[i].thumb+"' data-zoom-image='"
                        +galArr[i].img+"'></li>");
                }
                element.parent().append(galDiv);
                $(element).elevateZoom({
                    gallery:'gallery_022',
                    zoomType : "inner",
                    //cursor: "crosshair",
                    //easing : true,
                    cursor: 'pointer',
                    //galleryActiveClass: 'active',
                    imageCrossfade: true,
                    //loadingIcon: 'http://www.elevateweb.co.uk/spinner.gif',
                    zoomWindowWidth:500,
                    zoomWindowHeight:652,
                    responsive:true
                });

            }
       }
    };
})

.directive('myslider', function($timeout) {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            images: '='
        },
        link: function(scope, elem, attrs) {
            //console.log(scope.images);
            scope.$watch('currentIndex', function() {
                scope.images.forEach(function(image) {
                    image.visible = false; // make every image invisible
                });

                scope.images[scope.currentIndex].visible = true; // make the current image visible
            });

            scope.currentIndex = 0; // Initially the index is at the first image

            scope.next = function() {
                scope.currentIndex < scope.images.length - 1 ? scope.currentIndex++ : scope.currentIndex = 0;
            };

            scope.prev = function() {
                scope.currentIndex > 0 ? scope.currentIndex-- : scope.currentIndex = scope.images.length - 1;
            };

            var timer;
            var sliderFunc = function() {
                timer = $timeout(function() {
                    scope.next();
                    timer = $timeout(sliderFunc, 3000);
                }, 3000);
            };

            sliderFunc();

            scope.$on('$destroy', function() {
                $timeout.cancel(timer); // when the scope is getting destroyed, cancel the timer
            });
        },
        templateUrl: 'views/templates/slides.html'
    };
})

    .directive('gallery1ForZoom', function($compile) {
        return {
            restrict: 'A',
            scope:{
                gallery1ForZoom:'=',
                onSelected: '&'},
            link: function(scope, element, attrs) {
                scope.$watch('gallery1ForZoom',function(oldVal,newVal){
                    if (oldVal==newVal) return;
                    putHTML(oldVal);
                })

                function putHTML(html){
                    element.html(html);
                    $compile(element)(scope);
                }
                scope.toggle = function(url) {
                    //console.log(url);
                    scope.onSelected({url: url});
                };
            }
        }
    })



    .directive('setModel', function($timeout) {
        return {
            restrict : 'A', // only activate on element attribute
            require : '?ngModel', // get a hold of NgModelController
            scope: {
                model: '=ngModel'
            },

            link: function(scope, element,attrs) {
                console.log('ddddd');
                $timeout(function(){
                    console.log(element[0].value);
                    scope.model=element[0].value;
                },500);
            }
        };
    })

