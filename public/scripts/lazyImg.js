// http://kvasnicak.info/2014/08/04/lazy-loading-images-using-angularjs
angular.module('lazyImg', []).service(
    'scrollAndResizeListener', function($window, $document, $timeout) {
        var id = 0,
            listeners = {},
            scrollTimeoutId,
            resizeTimeoutId;

        function invokeListeners() {
            var clientHeight = $document[0].documentElement.clientHeight,
                clientWidth = $document[0].documentElement.clientWidth;

            for (var key in listeners) {
                if (listeners.hasOwnProperty(key)) {
                    listeners[key](clientHeight, clientWidth); // call listener with given arguments
                }
            }
        }


        $window.addEventListener('scroll', function() {
// cancel previous timeout (simulates stop event)
            $timeout.cancel(scrollTimeoutId);

// wait for 200ms and then invoke listeners (simulates stop event)
            scrollTimeoutId = $timeout(invokeListeners, 100);
        });


        $window.addEventListener('resize', function() {
            $timeout.cancel(resizeTimeoutId);
            resizeTimeoutId = $timeout(invokeListeners, 100);
        });


        return {
            bindListener: function(listener) {
                var index = ++id;

                listeners[id] = listener;

                return function() {
                    delete listeners[index];
                }
            }
        };
    }
);

angular.module('lazyImg').directive(
    'imageLazySrc', function ($document, scrollAndResizeListener,$timeout) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attributes) {
                var listenerRemover = scrollAndResizeListener.bindListener(isInView);
                var targetElement;
                angular.element($element).ready(function () {
                    //console.log("angular.element(elem).ready(function () {")
                    $timeout(function(){
                        targetElement=$( "[image-lazy-src='"+$attributes.imageLazySrc+"']" )
                        //console.log(targetElement)
                        isInView(
                            $document[0].documentElement.clientHeight,
                            $document[0].documentElement.clientWidth
                        );

                    },300)
                });

                //console.log($attributes.imageLazySrc)
                function isInView(clientHeight, clientWidth) {
                    if(targetElement && targetElement[0]){
                        var imageRect = targetElement[0].getBoundingClientRect();
                        // get element position
                        //var imageRect = $element[0].getBoundingClientRect();
                        if (imageRect.top >= 0 && imageRect.bottom <= (clientHeight+800)  && !$element[0].src) {
                            targetElement[0].src = $attributes.imageLazySrc; // set src attribute on element (it will load image)
                            listenerRemover();
                        }
                    }

                }

// bind listener


// unbind event listeners if element was destroyed
// it happens when you change view, etc
                $element.on('$destroy', function () {
                    listenerRemover();
                });


// explicitly call scroll listener (because, some images are in viewport already and we haven't scrolled yet)


            }
        };
    }
);