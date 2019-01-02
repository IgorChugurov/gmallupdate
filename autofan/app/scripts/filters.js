'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('interpolate', function (version) {
    return function (text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  })

.filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || '');
    };
})
.filter('filterSection', function (version) {
    return function(input,sectionId) {
        if (sectionId==0)
            return input
        else {
            var temp=[];
            angular.forEach(input, function (item) {
                if (item.category== sectionId) {
                    temp.push(item);
                }
            });
            return temp;
        }
    };
});
