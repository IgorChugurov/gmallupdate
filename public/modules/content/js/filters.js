'use strict';

angular.module('gmall.filters', [] )
.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
})
    .filter("trustUrl", ['$sce', function ($sce) {
        return function (recordingUrl) {
            return $sce.trustAsResourceUrl(recordingUrl);
        };
    }])
    .filter('htmlToPlaintext', function() {
        return function(text) {
            if(text){
                var s = text.replace(/(<[^>]+) style=".*?"/i, '');
                return  s ? String(s).replace(/<[^>]+>/gm, '') : '';
            }

        };
    })
    .filter('htmlToPlaintextWithBr', function() {
        var walk_the_DOM = function walk(node, func) {
            func(node);
            node = node.firstChild;
            while (node) {
                walk(node, func);
                node = node.nextSibling;
            }
        };
        return function(markup) {
            var wrapper = document.createElement('div');
            wrapper.innerHTML= markup;
            walk_the_DOM(wrapper, function(el) {
                if(el.removeAttribute) {
                    el.removeAttribute('id');
                    el.removeAttribute('style');
                    el.removeAttribute('class');
                }
            });
            var result = wrapper.innerHTML;
            var arr = result.split('<br>')
            arr.forEach(function(s,i){
                //console.log(s)
                arr[i]=s.replace(/<[^>]+>/gm, '')
            })
            //console.log(arr.join('<br>'))
            //console.log($(wrapper).find(':not(br)').contents().unwrap())
            return result
        };
    })
    .filter('propsFilter', function() {
        return function(items, props) {
            var out = [];

            if (angular.isArray(items)) {
                var keys = Object.keys(props);

                items.forEach(function(item) {
                    var itemMatches = false;

                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        };
    })



 
