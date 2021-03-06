function template(a,b,c){"use strict";return a.replace(/\{([^\}]+)\}/g,function(a,d){return d in b?c?c(b[d]):b[d]:a})}var app=angular.module("ngSocial",[]);app.directive("ngSocialButtons",["$compile","$q","$parse","$http","$location",function(a,b,c,d,e){"use strict";return{restrict:"A",scope:{url:"=",title:"=",description:"=",image:"=",showcounts:"="},replace:!0,transclude:!0,template:'<div class="ng-social-container ng-cloak"><ul class="ng-social" ng-transclude></ul></div>',controller:["$scope","$q","$http",function(a,b,c){var d=function(){return a.url||e.absUrl()},f=this;return this.init=function(a,b,c){c.counter&&f.getCount(a.options).then(function(b){a.count=b})},this.link=function(b){b=b||{};var c=b.urlOptions||{};return c.url=d(),c.title||(c.title=a.title),c.image||(c.image=a.image),c.description||(c.description=a.description||""),f.makeUrl(b.clickUrl||b.popup.url,c)},this.clickShare=function(b,c){if(!b.shiftKey&&!b.ctrlKey){b.preventDefault(),c.track&&"undefined"!=typeof _gaq&&angular.isArray(_gaq)&&_gaq.push(["_trackSocial",c.track.name,c.track.action,a.url]);var d=!0;if(angular.isFunction(c.click)&&(d=c.click.call(this,c)),d){var e=f.link(c);f.openPopup(e,c.popup)}}},this.openPopup=function(a,b){var c=Math.round(screen.width/2-b.width/2),d=0;screen.height>b.height&&(d=Math.round(screen.height/3-b.height/2));var e=window.open(a,"sl_"+this.service,"left="+c+",top="+d+",width="+b.width+",height="+b.height+",personalbar=0,toolbar=0,scrollbars=1,resizable=1");e?e.focus():location.href=a},this.getCount=function(e){var g=b.defer(),h=e.urlOptions||{};h.url=d(),h.title||(h.title=a.title);var i=f.makeUrl(e.counter.url,h),j=angular.isUndefined(a.showcounts)?!0:a.showcounts;return j&&(e.counter.get?e.counter.get(i,g,c):c.jsonp(i).success(function(a){g.resolve(e.counter.getNumber?e.counter.getNumber(a):a)})),g.promise},this.makeUrl=function(a,b){return template(a,b,encodeURIComponent)},this}]}}]),app.directive("ngSocialFacebook",["$parse",function(a){"use strict";var b={counter:{url:"//graph.facebook.com/fql?q=SELECT+total_count+FROM+link_stat+WHERE+url%3D%22{url}%22&callback=JSON_CALLBACK",getNumber:function(a){return 0===a.data.length?0:a.data[0].total_count}},popup:{url:"http://www.facebook.com/sharer/sharer.php?u={url}",width:600,height:500},track:{name:"facebook",action:"send"}};return{restrict:"C",require:"^?ngSocialButtons",scope:!0,replace:!0,transclude:!0,template:'<li><a ng-href="{{ctrl.link(options)}}" target="_blank" ng-click="ctrl.clickShare($event, options)" class="ng-social-button"><span class="ng-social-icon"></span><span class="ng-social-text" ng-transclude></span></a><span ng-show="count" class="ng-social-counter">{{ count }}</span></li>',link:function(c,d,e,f){d.addClass("ng-social-facebook"),f&&(b.urlOptions={url:a(e.url)(c)},c.options=b,c.ctrl=f,f.init(c,d,b))}}}]),app.directive("ngSocialTwitter",["$parse",function(a){"use strict";var b={counter:{url:"//urls.api.twitter.com/1/urls/count.json?url={url}&callback=JSON_CALLBACK",getNumber:function(a){return a.count}},popup:{url:"http://twitter.com/intent/tweet?url={url}&text={title}",width:600,height:450},click:function(a){return/[\.:\-–—]\s*$/.test(a.pageTitle)||(a.pageTitle+=":"),!0},track:{name:"twitter",action:"tweet"}};return{restrict:"C",require:"^?ngSocialButtons",scope:!0,replace:!0,transclude:!0,template:'<li> \r\n                    <a ng-href="{{ctrl.link(options)}}" target="_blank" ng-click="ctrl.clickShare($event, options)" class="ng-social-button"> \r\n                        <span class="ng-social-icon"></span> \r\n                        <span class="ng-social-text" ng-transclude></span> \r\n                    </a> \r\n                    <span ng-show="count" class="ng-social-counter">{{ count }}</span> \r\n                   </li>',link:function(c,d,e,f){d.addClass("ng-social-twitter"),f&&(b.urlOptions={url:a(e.url)(c),title:a(e.title)(c)},c.options=b,c.ctrl=f,f.init(c,d,b))}}}]),app.directive("ngSocialGooglePlus",["$parse",function(a){"use strict";var b={counter:{url:"//share.yandex.ru/gpp.xml?url={url}",getNumber:function(a){return a.count},get:function(a,c,d){return b._?void c.reject():(window.services||(window.services={}),window.services.gplus={cb:function(a){b._.resolve(a)}},b._=c,void d.jsonp(a))}},popup:{url:"https://plus.google.com/share?url={url}",width:700,height:500},track:{name:"Google+",action:"share"}};return{restrict:"C",require:"^?ngSocialButtons",scope:!0,replace:!0,transclude:!0,template:'<li> \r\n                    <a ng-href="{{ctrl.link(options)}}" target="_blank" ng-click="ctrl.clickShare($event, options)" class="ng-social-button"> \r\n                        <span class="ng-social-icon"></span> \r\n                        <span class="ng-social-text" ng-transclude></span> \r\n                    </a> \r\n                    <span ng-show="count" class="ng-social-counter">{{ count }}</span> \r\n                   </li>',link:function(c,d,e,f){d.addClass("ng-social-google-plus"),f&&(b.urlOptions={url:a(e.url)(c)},c.options=b,c.ctrl=f,f.init(c,d,b))}}}]),app.directive("ngSocialVk",["$parse",function(a){"use strict";var b={counter:{url:"//vkontakte.ru/share.php?act=count&url={url}&index={index}",get:function(a,c,d){b._||(b._=[],window.VK||(window.VK={}),window.VK.Share={count:function(a,c){b._[a].resolve(c)}});var e=b._.length;b._.push(c),d.jsonp(a.replace("{index}",e))}},popup:{url:"http://vk.com/share.php?url={url}&title={title}&description={description}&image={image}",width:550,height:330},track:{name:"VKontakte",action:"share"}};return{restrict:"C",require:"^?ngSocialButtons",scope:!0,replace:!0,transclude:!0,template:'<li> \r\n                    <a ng-href="{{ctrl.link(options)}}" target="_blank" ng-click="ctrl.clickShare($event, options)" class="ng-social-button"> \r\n                        <span class="ng-social-icon"></span> \r\n                        <span class="ng-social-text" ng-transclude></span> \r\n                    </a> \r\n                    <span ng-show="count" class="ng-social-counter">{{ count }}</span> \r\n                   </li>',link:function(c,d,e,f){d.addClass("ng-social-vk"),f&&(b.urlOptions={url:a(e.url)(c),title:a(e.title)(c),description:a(e.description)(c),image:a(e.image)(c)},c.options=b,c.ctrl=f,f.init(c,d,b))}}}]),angular.module("ngSocial").directive("ngSocialOdnoklassniki",["$parse",function(a){var b={counter:{url:"http://connect.ok.ru/dk?st.cmd=extLike&ref={url}&uid={index}",get:function(a,c,d){b._||(b._=[],window.ODKL||(window.ODKL={}),window.ODKL.updateCount=function(a,c){b._[a].resolve(c)});var e=b._.length;b._.push(c),d.jsonp(a.replace("{index}",e))}},popup:{url:"http://connect.ok.ru/dk?st.cmd=WidgetSharePreview&service=odnoklassniki&st.shareUrl={url}",width:550,height:360},track:{name:"Odnoklassniki",action:"share"}};return{restrict:"C",require:"^?ngSocialButtons",scope:!0,replace:!0,transclude:!0,template:'<li> \r\n                    <a ng-href="{{ctrl.link(options)}}" target="_blank" ng-click="ctrl.clickShare($event, options)" class="ng-social-button"> \r\n                        <span class="ng-social-icon"></span> \r\n                        <span class="ng-social-text" ng-transclude></span> \r\n                    </a> \r\n                    <span ng-show="count" class="ng-social-counter">{{ count }}</span> \r\n                   </li>',link:function(c,d,e,f){d.addClass("ng-social-odnoklassniki"),f&&(b.urlOptions={url:a(e.url)(c)},c.options=b,c.ctrl=f,f.init(c,d,b))}}}]),angular.module("ngSocial").directive("ngSocialMailru",["$parse",function(a){var b={counter:{url:"//connect.mail.ru/share_count?url_list={url}&callback=1&func=JSON_CALLBACK",getNumber:function(a){for(var b in a)if(a.hasOwnProperty(b))return a[b].shares}},popup:{url:"http://connect.mail.ru/share?share_url={url}&title={title}",width:550,height:360}};return{restrict:"C",require:"^?ngSocialButtons",scope:!0,replace:!0,transclude:!0,template:'<li> \r\n                    <a ng-href="{{ctrl.link(options)}}" target="_blank" ng-click="ctrl.clickShare($event, options)" class="ng-social-button"> \r\n                        <span class="ng-social-icon"></span> \r\n                        <span class="ng-social-text" ng-transclude></span> \r\n                    </a> \r\n                    <span ng-show="count" class="ng-social-counter">{{ count }}</span> \r\n                   </li>',link:function(c,d,e,f){d.addClass("ng-social-mailru"),f&&(b.urlOptions={url:a(e.url)(c),title:a(e.title)(c)},c.options=b,c.ctrl=f,f.init(c,d,b))}}}]),angular.module("ngSocial").directive("ngSocialPinterest",["$parse",function(a){var b={counter:{url:"//api.pinterest.com/v1/urls/count.json?url={url}&callback=JSON_CALLBACK",getNumber:function(a){return a.count}},popup:{url:"http://pinterest.com/pin/create/button/?url={url}&description={title}&media={image}",width:630,height:270}};return{restrict:"C",require:"^?ngSocialButtons",scope:!0,replace:!0,transclude:!0,template:'<li> \r\n                    <a ng-href="{{ctrl.link(options)}}" target="_blank" ng-click="ctrl.clickShare($event, options)" class="ng-social-button"> \r\n                        <span class="ng-social-icon"></span> \r\n                        <span class="ng-social-text" ng-transclude></span> \r\n                    </a> \r\n                    <span ng-show="count" class="ng-social-counter">{{ count }}</span> \r\n                   </li>',link:function(c,d,e,f){d.addClass("ng-social-pinterest"),f&&(b.urlOptions={url:a(e.url)(c),title:a(e.title)(c),image:a(e.image)(c)},c.options=b,c.ctrl=f,f.init(c,d,b))}}}]),angular.module("ngSocial").directive("ngSocialGithubForks",function(){var a={counter:{url:"//api.github.com/repos/{user}/{repository}?callback=JSON_CALLBACK",getNumber:function(a){return a.data.forks_count}},clickUrl:"https://github.com/{user}/{repository}/"};return{restrict:"C",require:"^?ngSocialButtons",scope:!0,replace:!0,transclude:!0,template:'<li> \r\n                    <a ng-href="{{ctrl.link(options)}}" target="_blank" class="ng-social-button"> \r\n                        <span class="ng-social-icon"></span> \r\n                        <span class="ng-social-text" ng-transclude></span> \r\n                    </a> \r\n                    <span ng-show="count" class="ng-social-counter">{{ count }}</span> \r\n                   </li>',link:function(b,c,d,e){c.addClass("ng-social-github ng-social-github-forks"),e&&(a.urlOptions={user:d.user,repository:d.repository},b.options=a,b.ctrl=e,e.init(b,c,a))}}}),angular.module("ngSocial").directive("ngSocialGithub",function(){var a={counter:{url:"//api.github.com/repos/{user}/{repository}?callback=JSON_CALLBACK",getNumber:function(a){return a.data.watchers_count}},clickUrl:"https://github.com/{user}/{repository}/"};return{restrict:"C",require:"^?ngSocialButtons",scope:!0,replace:!0,transclude:!0,template:'<li> \r\n                    <a ng-href="{{ctrl.link(options)}}" target="_blank" class="ng-social-button"> \r\n                        <span class="ng-social-icon"></span> \r\n                        <span class="ng-social-text" ng-transclude></span> \r\n                    </a> \r\n                    <span ng-show="count" class="ng-social-counter">{{ count }}</span> \r\n                   </li>',link:function(b,c,d,e){c.addClass("ng-social-github"),e&&(a.urlOptions={user:d.user,repository:d.repository},b.options=a,b.ctrl=e,e.init(b,c,a))}}}),app.directive("ngSocialStumbleupon",["$parse",function(a){"use strict";var b={counter:{url:"{proxy}?url={url}&type=stumbleupon&callback=JSON_CALLBACK",getNumber:function(a){return a.count}},popup:{url:"http://www.stumbleupon.com/submit?url={url}&title={title}",width:800,height:600},track:{name:"StumbleUpon",action:"share"}};return{restrict:"C",require:"^?ngSocialButtons",scope:!0,replace:!0,transclude:!0,template:'<li> \r\n                    <a ng-href="{{ctrl.link(options)}}" target="_blank" ng-click="ctrl.clickShare($event, options)" class="ng-social-button"> \r\n                        <span class="ng-social-icon"></span> \r\n                        <span class="ng-social-text" ng-transclude></span> \r\n                    </a> \r\n                    <span ng-show="count" class="ng-social-counter">{{ count }}</span> \r\n                   </li>',link:function(c,d,e,f){if(d.addClass("ng-social-google-plus"),f){b.urlOptions={url:a(e.url)(c),title:a(e.title)(c)};var g=a(e.proxyUrl)(c)||"/proxy.php";b.counter.url=b.counter.url.replace("{proxy}",g),c.options=b,c.ctrl=f,f.init(c,d,b)}}}}]),app.directive("ngSocialMoiKrug",["$parse",function(a){"use strict";var b={popup:{url:"//share.yandex.ru/go.xml?service=moikrug&url={url}&title={title}",width:800,height:600},track:{name:"MoiKrug",action:"share"}};return{restrict:"C",require:"^?ngSocialButtons",scope:!0,replace:!0,transclude:!0,template:'<li> \r\n                    <a ng-href="{{ctrl.link(options)}}" target="_blank" ng-click="ctrl.clickShare($event, options)" class="ng-social-button"> \r\n                        <span class="ng-social-icon"></span> \r\n                        <span class="ng-social-text" ng-transclude></span> \r\n                    </a> \r\n                   </li>',link:function(c,d,e,f){d.addClass("ng-social-moi-krug"),f&&(b.urlOptions={url:a(e.url)(c),title:a(e.title)(c)},c.options=b,c.ctrl=f,f.init(c,d,b))}}}]),app.directive("ngSocialLinkedin",["$parse",function(a){"use strict";var b={counter:{url:"//www.linkedin.com/countserv/count/share?url={url}&format=jsonp&callback=JSON_CALLBACK",getNumber:function(a){return a.count}},popup:{url:"http://www.linkedin.com/shareArticle?mini=true&url={url}&title={title}&summary={description}",width:600,height:450},click:function(a){return/[\.:\-–—]\s*$/.test(a.pageTitle)||(a.pageTitle+=":"),!0},track:{name:"LinkedIn",action:"share"}};return{restrict:"C",require:"^?ngSocialButtons",scope:!0,replace:!0,transclude:!0,template:'<li> \r\n                    <a ng-href="{{ctrl.link(options)}}" target="_blank" ng-click="ctrl.clickShare($event, options)" class="ng-social-button"> \r\n                        <span class="ng-social-icon"></span> \r\n                        <span class="ng-social-text" ng-transclude></span> \r\n                    </a> \r\n                    <span ng-show="count" class="ng-social-counter">{{ count }}</span> \r\n                   </li>',link:function(c,d,e,f){d.addClass("ng-social-linkedin"),f&&(b.urlOptions={url:a(e.url)(c),title:a(e.title)(c),description:a(e.description)(c)},c.options=b,c.ctrl=f,f.init(c,d,b))}}}]),angular.module("ngSocial").run(["$templateCache",function(a){a.put("/views/buttons.html",'<div class="ng-social-container ng-cloak"><ul class="ng-social" ng-transclude></ul></div>')}]);

/*
 * @license
 * angular-socket-io v0.7.0
 * (c) 2014 Brian Ford http://briantford.com
 * License: MIT
 */

angular.module('btford.socket-io', []).
  provider('socketFactory', function () {

    'use strict';

    // when forwarding events, prefix the event name
    var defaultPrefix = 'socket:',
      ioSocket;

    // expose to provider
    this.$get = ['$rootScope', '$timeout', 'global',function ($rootScope, $timeout,global) {

      var asyncAngularify = function (socket, callback) {
        return callback ? function () {
          var args = arguments;
          $timeout(function () {
            callback.apply(socket, args);
          }, 0);
        } : angular.noop;
      };

      return function socketFactory (options) {
        //console.log(options)
        options = options || {};
        if(!options.host){
          options.host=socketHost
        }
        //console.log(options)
        var socket = options.ioSocket || io.connect(options.host);
        var prefix = options.prefix === undefined ? defaultPrefix : options.prefix ;
        var defaultScope = options.scope || $rootScope;

        var addListener = function (eventName, callback) {
          socket.on(eventName, callback.__ng = asyncAngularify(socket, callback));
        };

        var addOnceListener = function (eventName, callback) {
          socket.once(eventName, callback.__ng = asyncAngularify(socket, callback));
        };

        var wrappedSocket = {
          on: addListener,
          addListener: addListener,
          once: addOnceListener,

          emit: function (eventName, data, callback) {
            var lastIndex = arguments.length - 1;
            var callback = arguments[lastIndex];
            if(typeof callback == 'function') {
              callback = asyncAngularify(socket, callback);
              arguments[lastIndex] = callback;
            }
            return socket.emit.apply(socket, arguments);
          },

          removeListener: function (ev, fn) {
            if (fn && fn.__ng) {
              arguments[1] = fn.__ng;
            }
            return socket.removeListener.apply(socket, arguments);
          },

          removeAllListeners: function() {
            return socket.removeAllListeners.apply(socket, arguments);
          },

          disconnect: function (close) {
            return socket.disconnect(close);
          },

          connect: function() {
            return socket.connect();
          },

          // when socket.on('someEvent', fn (data) { ... }),
          // call scope.$broadcast('someEvent', data)
          forward: function (events, scope) {
            if (events instanceof Array === false) {
              events = [events];
            }
            if (!scope) {
              scope = defaultScope;
            }
            events.forEach(function (eventName) {
              var prefixedEvent = prefix + eventName;
              var forwardBroadcast = asyncAngularify(socket, function () {
                Array.prototype.unshift.call(arguments, prefixedEvent);
                scope.$broadcast.apply(scope, arguments);
              });
              scope.$on('$destroy', function () {
                socket.removeListener(eventName, forwardBroadcast);
              });
              socket.on(eventName, forwardBroadcast);
            });
          }
        };

        return wrappedSocket;
      };
    }];
  });

/*
 * AngularJS Toaster
 * Version: 0.4.16
 *
 * Copyright 2013-2015 Jiri Kavulak.
 * All Rights Reserved.
 * Use, reproduction, distribution, and modification of this code is subject to the terms and
 * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
 *
 * Author: Jiri Kavulak
 * Related to project of John Papa, Hans Fjällemark and Nguyễn Thiện Hùng (thienhung1989)
 */
!function(){"use strict";angular.module("toaster",[]).constant("toasterConfig",{limit:0,"tap-to-dismiss":!0,"close-button":!1,"newest-on-top":!0,"time-out":5e3,"icon-classes":{error:"toast-error",info:"toast-info",wait:"toast-wait",success:"toast-success",warning:"toast-warning"},"body-output-type":"","body-template":"toasterBodyTmpl.html","icon-class":"toast-info","position-class":"toast-top-right","title-class":"toast-title","message-class":"toast-message","prevent-duplicates":!1,"mouseover-timer-stop":!0}).service("toaster",["$rootScope","toasterConfig",function(t,e){function o(t){return function(e,o,s,i,a,n,r,c,l,u){angular.isString(e)?this.pop(t,e,o,s,i,a,n,r,c,l,u):this.pop(angular.extend(e,{type:t}))}}this.pop=function(e,o,s,i,a,n,r,c,l,u,d){if(angular.isObject(e)){var p=e;this.toast={type:p.type,title:p.title,body:p.body,timeout:p.timeout,bodyOutputType:p.bodyOutputType,clickHandler:p.clickHandler,showCloseButton:p.showCloseButton,uid:p.toastId,onHideCallback:p.onHideCallback,directiveData:p.directiveData},l=p.toastId,r=p.toasterId}else this.toast={type:e,title:o,body:s,timeout:i,bodyOutputType:a,clickHandler:n,showCloseButton:c,uid:l,onHideCallback:u,directiveData:d};t.$emit("toaster-newToast",r,l)},this.clear=function(e,o){t.$emit("toaster-clearToasts",e,o)};for(var s in e["icon-classes"])this[s]=o(s)}]).factory("toasterEventRegistry",["$rootScope",function(t){var e,o=null,s=null,i=[],a=[];return e={setup:function(){o||(o=t.$on("toaster-newToast",function(t,e,o){for(var s=0,a=i.length;a>s;s++)i[s](t,e,o)})),s||(s=t.$on("toaster-clearToasts",function(t,e,o){for(var s=0,i=a.length;i>s;s++)a[s](t,e,o)}))},subscribeToNewToastEvent:function(t){i.push(t)},subscribeToClearToastsEvent:function(t){a.push(t)},unsubscribeToNewToastEvent:function(t){var e=i.indexOf(t);e>=0&&i.splice(e,1),0===i.length&&(o(),o=null)},unsubscribeToClearToastsEvent:function(t){var e=a.indexOf(t);e>=0&&a.splice(e,1),0===a.length&&(s(),s=null)}},{setup:e.setup,subscribeToNewToastEvent:e.subscribeToNewToastEvent,subscribeToClearToastsEvent:e.subscribeToClearToastsEvent,unsubscribeToNewToastEvent:e.unsubscribeToNewToastEvent,unsubscribeToClearToastsEvent:e.unsubscribeToClearToastsEvent}}]).directive("directiveTemplate",["$compile","$injector",function(t,e){return{restrict:"A",scope:{directiveName:"@directiveName",directiveData:"@directiveData"},replace:!0,link:function(o,s,i){o.$watch("directiveName",function(a){if(angular.isUndefined(a)||a.length<=0)throw new Error("A valid directive name must be provided via the toast body argument when using bodyOutputType: directive");var n=e.has(i.$normalize(a)+"Directive");if(!n)throw new Error(a+" could not be found.");o.directiveData&&(o.directiveData=angular.fromJson(o.directiveData));var r=t("<div "+a+"></div>")(o);s.append(r)})}}}]).directive("toasterContainer",["$parse","$rootScope","$interval","$sce","toasterConfig","toaster","toasterEventRegistry",function(t,e,o,s,i,a,n){return{replace:!0,restrict:"EA",scope:!0,link:function(e,r,c){function l(t,s){t.timeoutPromise=o(function(){e.removeToast(t.id)},s,1)}function u(o,i){if(o.type=m["icon-classes"][o.type],o.type||(o.type=m["icon-class"]),m["prevent-duplicates"]===!0)if(v(i)){if(e.toasters.length>0&&e.toasters[e.toasters.length-1].body===o.body)return}else{var a,n;for(a=0,n=e.toasters.length;n>a;a++)e.toasters[a].uid===i&&(d(a),a--,n=e.toasters.length)}o.id=++f,v(i)||(o.uid=i);var r=m["close-button"];if("boolean"==typeof o.showCloseButton);else if("boolean"==typeof r)o.showCloseButton=r;else if("object"==typeof r){var c=r[o.type];"undefined"!=typeof c&&null!==c&&(o.showCloseButton=c)}else o.showCloseButton=!1;switch(o.bodyOutputType=o.bodyOutputType||m["body-output-type"],o.bodyOutputType){case"trustedHtml":o.html=s.trustAsHtml(o.body);break;case"template":o.bodyTemplate=o.body||m["body-template"];break;case"templateWithData":var l=t(o.body||m["body-template"]),u=l(e);o.bodyTemplate=u.template,o.data=u.data;break;case"directive":o.html=o.body}e.configureTimer(o),m["newest-on-top"]===!0?(e.toasters.unshift(o),m.limit>0&&e.toasters.length>m.limit&&e.toasters.pop()):(e.toasters.push(o),m.limit>0&&e.toasters.length>m.limit&&e.toasters.shift())}function d(t){var s=e.toasters[t];s&&(s.timeoutPromise&&o.cancel(s.timeoutPromise),e.toasters.splice(t,1),angular.isFunction(s.onHideCallback)&&s.onHideCallback())}function p(t){for(var o=e.toasters.length-1;o>=0;o--)v(t)?d(o):e.toasters[o].uid==t&&d(o)}function v(t){return angular.isUndefined(t)||null===t}var m,f=0;m=angular.extend({},i,e.$eval(c.toasterOptions)),e.config={toasterId:m["toaster-id"],position:m["position-class"],title:m["title-class"],message:m["message-class"],tap:m["tap-to-dismiss"],closeButton:m["close-button"],animation:m["animation-class"],mouseoverTimer:m["mouseover-timer-stop"]},e.$on("$destroy",function(){n.unsubscribeToNewToastEvent(e._onNewToast),n.unsubscribeToClearToastsEvent(e._onClearToasts)}),e.configureTimer=function(t){var e=angular.isNumber(t.timeout)?t.timeout:m["time-out"];"object"==typeof e&&(e=e[t.type]),e>0&&l(t,e)},e.removeToast=function(t){var o,s;for(o=0,s=e.toasters.length;s>o;o++)if(e.toasters[o].id===t){d(o);break}},e.toasters=[],e._onNewToast=function(t,o,s){(v(e.config.toasterId)&&v(o)||!v(e.config.toasterId)&&!v(o)&&e.config.toasterId==o)&&u(a.toast,s)},e._onClearToasts=function(t,o,s){("*"==o||v(e.config.toasterId)&&v(o)||!v(e.config.toasterId)&&!v(o)&&e.config.toasterId==o)&&p(s)},n.setup(),n.subscribeToNewToastEvent(e._onNewToast),n.subscribeToClearToastsEvent(e._onClearToasts)},controller:["$scope","$element","$attrs",function(t){t.stopTimer=function(e){t.config.mouseoverTimer===!0&&e.timeoutPromise&&(o.cancel(e.timeoutPromise),e.timeoutPromise=null)},t.restartTimer=function(e){t.config.mouseoverTimer===!0?e.timeoutPromise||t.configureTimer(e):null===e.timeoutPromise&&t.removeToast(e.id)},t.click=function(e,o){if(t.config.tap===!0||e.showCloseButton===!0&&o===!0){var s=!0;e.clickHandler&&(angular.isFunction(e.clickHandler)?s=e.clickHandler(e,o):angular.isFunction(t.$parent.$eval(e.clickHandler))?s=t.$parent.$eval(e.clickHandler)(e,o):console.log("TOAST-NOTE: Your click handler is not inside a parent scope of toaster-container.")),s&&t.removeToast(e.id)}}}],template:'<div id="toast-container" ng-class="[config.position, config.animation]"><div ng-repeat="toaster in toasters" class="toast" ng-class="toaster.type" ng-click="click(toaster)" ng-mouseover="stopTimer(toaster)" ng-mouseout="restartTimer(toaster)"><button type="button" class="toast-close-button" ng-show="toaster.showCloseButton" ng-click="click(toaster, true)">&times;</button><div ng-class="config.title">{{toaster.title}}</div><div ng-class="config.message" ng-switch on="toaster.bodyOutputType"><div ng-switch-when="trustedHtml" ng-bind-html="toaster.html"></div><div ng-switch-when="template"><div ng-include="toaster.bodyTemplate"></div></div><div ng-switch-when="templateWithData"><div ng-include="toaster.bodyTemplate"></div></div><div ng-switch-when="directive"><div directive-template directive-name="{{toaster.html}}" directive-data="{{toaster.directiveData}}"></div></div><div ng-switch-default >{{toaster.body}}</div></div></div></div>'}}])}(window,document);
angular.module('pageslide-directive', [])

.directive('pageslide', ['$document', '$timeout',
    function ($document, $timeout) {
        var defaults = {};
        return {
            restrict: 'EAC',
            transclude: false,
            scope: {
                psOpen: '=?',
                psAutoClose: '=?',
                psSide: '@',
                psSpeed: '@',
                psClass: '@',
                psSize: '@',
                psSqueeze: '@',
                psCloak: '@',
                psPush: '@',
                psContainer: '@',
                psKeyListener: '@',
                psBodyClass: '@'
            },
            link: function ($scope, el, attrs) {

                /* Inspect */

                //console.log($scope);
                //console.log(el);
                //console.log(attrs);

                var param = {};

                param.side = $scope.psSide || 'right';
                param.speed = $scope.psSpeed || '0.5';
                param.size = $scope.psSize || '300px';
                param.zindex = 1000; // Override with custom CSS
                param.className = $scope.psClass || 'ng-pageslide';
                param.cloak = $scope.psCloak && $scope.psCloak.toLowerCase() == 'false' ? false : true;
                param.squeeze = Boolean($scope.psSqueeze) || false;
                param.push = Boolean($scope.psPush) || false;
                param.container = $scope.psContainer || false;
                param.keyListener = Boolean($scope.psKeyListener) || false;
                param.bodyClass = $scope.psBodyClass || false;

                param.className=param.className.split(' ')
                param.className.forEach(function (cl) {
                    el.addClass(cl);
                })
                //el.addClass(param.className);

                /* DOM manipulation */

                var content = null;
                var slider = null;
                var body = param.container ? document.getElementById(param.container) : document.body;

                // TODO verify that we are meaning to use the param.className and not the param.bodyClass
                var scrolled=0;
                function setBodyClass(value){
                    //console.log('value',value)
                    /*if(value=='open'){
                        angular.element($document[0].body).css('overflow-y','hidden')
                        if(iPhone){
                            scrolled = window.pageYOffset || document.documentElement.scrollTop;
                            angular.element($document[0].body).css('position','fixed')
                            angular.element($document[0].body).css('top',-(scrolled+16))
                        }
                    }else if(value=='closed'){
                        angular.element($document[0].body).css('overflow-y','scroll')
                        if(iPhone){
                            angular.element($document[0].body).css('position','static');
                            window.scrollTo( 0, scrolled );
                        }
                    }*/

                    if (param.bodyClass) {
                        var bodyClass = param.className[param.className.length-1] + '-body';
                        var bodyClassRe = new RegExp(' ' + bodyClass + '-closed| ' + bodyClass + '-open'+'|' + bodyClass + '-closed|' + bodyClass + '-open'+'/g');
                        //console.log(bodyClassRe)
                        body.className = body.className.replace(bodyClassRe, '');
                        if(!body.className){
                            body.className += ' ' + bodyClass + '-' + value;
                        }else if(body.className.indexOf(bodyClass + '-' + value)<0){
                            body.className += ' ' + bodyClass + '-' + value;
                        }

                    }
                    //console.log('body.className',body.className)
                }

                setBodyClass('closed');

                slider = el[0];

                // Check for div tag
                if (slider.tagName.toLowerCase() !== 'div' &&
                    slider.tagName.toLowerCase() !== 'pageslide')
                    throw new Error('Pageslide can only be applied to <div> or <pageslide> elements');

                // Check for content
                if (slider.children.length === 0)
                    throw new Error('You have to content inside the <pageslide>');

                content = angular.element(slider.children);

                /* Append */
                body.appendChild(slider);

                /* Style setup */
                slider.style.zIndex = param.zindex;
                slider.style.position = param.container !== false ? 'absolute' : 'fixed';
                slider.style.width = 0;
                slider.style.height = 0;
                slider.style.overflow = 'auto';
                slider.style.transitionDuration = param.speed + 's';
                slider.style.webkitTransitionDuration = param.speed + 's';
                slider.style.transitionProperty = 'width, height';

                if (param.squeeze) {
                    body.style.position = 'absolute';
                    body.style.transitionDuration = param.speed + 's';
                    body.style.webkitTransitionDuration = param.speed + 's';
                    body.style.transitionProperty = 'top, bottom, left, right';
                }

                switch (param.side) {
                    case 'right':
                        slider.style.height = attrs.psCustomHeight || '100%';
                        slider.style.top = attrs.psCustomTop || '0px';
                        slider.style.bottom = attrs.psCustomBottom || '0px';
                        slider.style.right = attrs.psCustomRight || '0px';
                        break;
                    case 'left':
                        slider.style.height = attrs.psCustomHeight || '100%';
                        slider.style.top = attrs.psCustomTop || '0px';
                        slider.style.bottom = attrs.psCustomBottom || '0px';
                        slider.style.left = attrs.psCustomLeft || '0px';
                        break;
                    case 'top':
                        slider.style.width = attrs.psCustomWidth || '100%';
                        slider.style.left = attrs.psCustomLeft || '0px';
                        slider.style.top = attrs.psCustomTop || '0px';
                        slider.style.right = attrs.psCustomRight || '0px';
                        break;
                    case 'bottom':
                        slider.style.width = attrs.psCustomWidth || '100%';
                        slider.style.bottom = attrs.psCustomBottom || '0px';
                        slider.style.left = attrs.psCustomLeft || '0px';
                        slider.style.right = attrs.psCustomRight || '0px';
                        break;
                }


                /* Closed */
                function psClose(slider, param) {
                    if (slider && slider.style.width !== 0) {
                        if (param.cloak) content.css('display', 'none');
                        switch (param.side) {
                            case 'right':
                                slider.style.width = '0px';
                                if (param.squeeze) body.style.right = '0px';
                                if (param.push) {
                                    body.style.right = '0px';
                                    body.style.left = '0px';
                                }
                                break;
                            case 'left':
                                slider.style.width = '0px';
                                if (param.squeeze) body.style.left = '0px';
                                if (param.push) {
                                    body.style.left = '0px';
                                    body.style.right = '0px';
                                }
                                break;
                            case 'top':
                                slider.style.height = '0px';
                                if (param.squeeze) body.style.top = '0px';
                                if (param.push) {
                                    body.style.top = '0px';
                                    body.style.bottom = '0px';
                                }
                                break;
                            case 'bottom':
                                slider.style.height = '0px';
                                if (param.squeeze) body.style.bottom = '0px';
                                if (param.push) {
                                    body.style.bottom = '0px';
                                    body.style.top = '0px';
                                }
                                break;
                        }
                    }
                    $scope.psOpen = false;

                    if (param.keyListener) {
                        $document.off('keydown', keyListener);
                    }

                    setBodyClass('closed');
                }

                /* Open */
                function psOpen(slider, param) {
                    if (slider.style.width !== 0) {
                        switch (param.side) {
                            case 'right':
                                slider.style.width = param.size;
                                if (param.squeeze) body.style.right = param.size;
                                if (param.push) {
                                    body.style.right = param.size;
                                    body.style.left = '-' + param.size;
                                }
                                break;
                            case 'left':
                                slider.style.width = param.size;
                                if (param.squeeze) body.style.left = param.size;
                                if (param.push) {
                                    body.style.left = param.size;
                                    body.style.right = '-' + param.size;
                                }
                                break;
                            case 'top':
                                slider.style.height = param.size;
                                if (param.squeeze) body.style.top = param.size;
                                if (param.push) {
                                    body.style.top = param.size;
                                    body.style.bottom = '-' + param.size;
                                }
                                break;
                            case 'bottom':
                                slider.style.height = param.size;
                                if (param.squeeze) body.style.bottom = param.size;
                                if (param.push) {
                                    body.style.bottom = param.size;
                                    body.style.top = '-' + param.size;
                                }
                                break;
                        }

                        $timeout(function() {
                            if (param.cloak) content.css('display', 'block');
                        }, (param.speed * 1000));

                        $scope.psOpen = true;

                        if (param.keyListener) {
                            $document.on('keydown', keyListener);
                        }

                        setBodyClass('open');
                    }
                }

                function isFunction(functionToCheck) {
                    var getType = {};
                    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
                }

                /*
                * Close the sidebar if the 'esc' key is pressed
                * */

                function keyListener(e) {
                    var ESC_KEY = 27;
                    var key = e.keyCode || e.which;

                    if (key === ESC_KEY) {
                        psClose(slider, param);
                    }
                }

                /*
                * Watchers
                * */

                $scope.$watch('psOpen', function(value) {
                    if (!!value) {
                        psOpen(slider, param);
                    } else {
                        psClose(slider, param);
                    }
                });

                $scope.$watch('psSize', function(newValue, oldValue) {
                    if (oldValue !== newValue) {
                        param.size = newValue;
                        psOpen(slider, param);
                    }
                });

                /*
                * Events
                * */

                $scope.$on('$destroy', function () {
                    body.removeChild(slider);
                });

                if ($scope.psAutoClose) {
                    $scope.$on('$locationChangeStart', function() {
                        psClose(slider, param);
                    });
                    $scope.$on('$stateChangeStart', function() {
                        psClose(slider, param);
                    });

                }
            }
        };
    }
]);

/*global angular, navigator*/

(function() {
    'use strict';

    angular
        .module('angular-click-outside', [])
        .directive('clickOutside', [
            '$document', '$parse', '$timeout',
            clickOutside
        ]);
    
    /**
     * @ngdoc directive
     * @name angular-click-outside.directive:clickOutside
     * @description Directive to add click outside capabilities to DOM elements
     * @requires $document
     * @requires $parse
     * @requires $timeout
     **/
    function clickOutside($document, $parse, $timeout) {
        return {
            restrict: 'A',
            link: function($scope, elem, attr) {

                // postpone linking to next digest to allow for unique id generation
                $timeout(function() {
                    var classList = (attr.outsideIfNot !== undefined) ? attr.outsideIfNot.split(/[ ,]+/) : [],
                        fn;

                    function eventHandler(e) {
                        /*console.log(e.target.className)
                        console.log(e)*/
                        if(e && e.target && (e.target.className=='pac-matched' || e.target.className=='pac-item-query'  || e.target.className=='pac-item' || e.target.className=='pac-icon' || e.target.className=='pac-container'
                            || e.target.className=='pac-icon-marker'|| e.target.className=='pac-logo' || e.target.className=='pac-matched')){
                            //console.log(e.target.className)
                            event.stopPropagation()
                            return
                        }
                        var i,
                            element,
                            r,
                            id,
                            classNames,
                            l;

                        // check if our element already hidden and abort if so
                        if (angular.element(elem).hasClass("ng-hide")) {
                            return;
                        }

                        // if there is no click target, no point going on
                        if (!e || !e.target) {
                            return;
                        }

                        // loop through the available elements, looking for classes in the class list that might match and so will eat
                        for (element = e.target; element; element = element.parentNode) {
                            // check if the element is the same element the directive is attached to and exit if so (props @CosticaPuntaru)
                            if (element === elem[0]) {
                                return;
                            }
                            
                            // now we have done the initial checks, start gathering id's and classes
                            id = element.id,
                            classNames = element.className,
                            l = classList.length;

                            // Unwrap SVGAnimatedString classes
                            if (classNames && classNames.baseVal !== undefined) {
                                classNames = classNames.baseVal;
                            }

                            // if there are no class names on the element clicked, skip the check
                            if (classNames || id) {

                                // loop through the elements id's and classnames looking for exceptions
                                for (i = 0; i < l; i++) {
                                    //prepare regex for class word matching
                                    r = new RegExp('\\b' + classList[i] + '\\b');

                                    // check for exact matches on id's or classes, but only if they exist in the first place
                                    if ((id !== undefined && id === classList[i]) || (classNames && r.test(classNames))) {
                                        // now let's exit out as it is an element that has been defined as being ignored for clicking outside
                                        return;
                                    }
                                }
                            }
                        }

                        // if we have got this far, then we are good to go with processing the command passed in via the click-outside attribute
                        $timeout(function() {
                            fn = $parse(attr['clickOutside']);
                            fn($scope, { event: e });
                        });
                    }

                    // if the devices has a touchscreen, listen for this event
                    if (_hasTouch()) {
                        $document.on('touchstart', eventHandler);
                    }

                    // still listen for the click event even if there is touch to cater for touchscreen laptops
                    $document.on('click', eventHandler);

                    // when the scope is destroyed, clean up the documents event handlers as we don't want it hanging around
                    $scope.$on('$destroy', function() {
                        if (_hasTouch()) {
                            $document.off('touchstart', eventHandler);
                        }

                        $document.off('click', eventHandler);
                    });

                    /**
                     * @description Private function to attempt to figure out if we are on a touch device
                     * @private
                     **/
                    function _hasTouch() {
                        // works on most browsers, IE10/11 and Surface
                        return 'ontouchstart' in window || navigator.maxTouchPoints;
                    };
                });
            }
        };
    }
})();

/**
 * angular-recaptcha build:2016-07-19 
 * https://github.com/vividcortex/angular-recaptcha 
 * Copyright (c) 2016 VividCortex 
**/

!function(a){"use strict";a.module("vcRecaptcha",[])}(angular),function(a){"use strict";function b(){throw new Error('You need to set the "key" attribute to your public reCaptcha key. If you don\'t have a key, please get one from https://www.google.com/recaptcha/admin/create')}var c=a.module("vcRecaptcha");c.provider("vcRecaptchaService",function(){var c=this,d={};c.onLoadFunctionName="vcRecaptchaApiLoaded",c.setDefaults=function(b){a.copy(b,d)},c.setSiteKey=function(a){d.key=a},c.setTheme=function(a){d.theme=a},c.setStoken=function(a){d.stoken=a},c.setSize=function(a){d.size=a},c.setType=function(a){d.type=a},c.setOnLoadFunctionName=function(a){c.onLoadFunctionName=a},c.$get=["$rootScope","$window","$q",function(e,f,g){function h(){return j?g.when(j):l}function i(){if(!j)throw new Error("reCaptcha has not been loaded yet.")}var j,k=g.defer(),l=k.promise;f.vcRecaptchaApiLoadedCallback=f.vcRecaptchaApiLoadedCallback||[];var m=function(){j=f.grecaptcha,k.resolve(j)};return f.vcRecaptchaApiLoadedCallback.push(m),f[c.onLoadFunctionName]=function(){f.vcRecaptchaApiLoadedCallback.forEach(function(a){a()})},a.isDefined(f.grecaptcha)&&m(),{create:function(a,c){return c.sitekey=c.key||d.key,c.theme=c.theme||d.theme,c.stoken=c.stoken||d.stoken,c.size=c.size||d.size,c.type=c.type||d.type,c.sitekey&&40===c.sitekey.length||b(),h().then(function(b){return b.render(a,c)})},reload:function(a){i(),j.reset(a),e.$broadcast("reCaptchaReset",a)},getResponse:function(a){return i(),j.getResponse(a)}}}]})}(angular),function(a){"use strict";var b=a.module("vcRecaptcha");b.directive("vcRecaptcha",["$document","$timeout","vcRecaptchaService",function(b,c,d){return{restrict:"A",require:"?^^form",scope:{response:"=?ngModel",key:"=?",stoken:"=?",theme:"=?",size:"=?",type:"=?",tabindex:"=?",required:"=?",onCreate:"&",onSuccess:"&",onExpire:"&"},link:function(e,f,g,h){function i(){h&&h.$setValidity("recaptcha",null),l()}function j(){c(function(){e.response="",k(),e.onExpire({widgetId:e.widgetId})})}function k(){h&&h.$setValidity("recaptcha",e.required===!1?null:Boolean(e.response))}function l(){a.element(b[0].querySelectorAll(".pls-container")).parent().remove()}e.widgetId=null,h&&a.isDefined(g.required)&&e.$watch("required",k);var m=e.$watch("key",function(b){var h=function(a){c(function(){e.response=a,k(),e.onSuccess({response:a,widgetId:e.widgetId})})};d.create(f[0],{callback:h,key:b,stoken:e.stoken||g.stoken||null,theme:e.theme||g.theme||null,type:e.type||g.type||null,tabindex:e.tabindex||g.tabindex||null,size:e.size||g.size||null,"expired-callback":j}).then(function(b){k(),e.widgetId=b,e.onCreate({widgetId:b}),e.$on("$destroy",i),e.$on("reCaptchaReset",function(c,d){(a.isUndefined(d)||b===d)&&(e.response="",k())})}),m()})}}}])}(angular);
/**
 * Owl Carousel v2.2.1
 * Copyright 2013-2017 David Deutsch
 * Licensed under  ()
 */
!function(a,b,c,d){function e(b,c){this.settings=null,this.options=a.extend({},e.Defaults,c),this.$element=a(b),this._handlers={},this._plugins={},this._supress={},this._current=null,this._speed=null,this._coordinates=[],this._breakpoint=null,this._width=null,this._items=[],this._clones=[],this._mergers=[],this._widths=[],this._invalidated={},this._pipe=[],this._drag={time:null,target:null,pointer:null,stage:{start:null,current:null},direction:null},this._states={current:{},tags:{initializing:["busy"],animating:["busy"],dragging:["interacting"]}},a.each(["onResize","onThrottledResize"],a.proxy(function(b,c){this._handlers[c]=a.proxy(this[c],this)},this)),a.each(e.Plugins,a.proxy(function(a,b){this._plugins[a.charAt(0).toLowerCase()+a.slice(1)]=new b(this)},this)),a.each(e.Workers,a.proxy(function(b,c){this._pipe.push({filter:c.filter,run:a.proxy(c.run,this)})},this)),this.setup(),this.initialize()}e.Defaults={items:3,loop:!1,center:!1,rewind:!1,mouseDrag:!0,touchDrag:!0,pullDrag:!0,freeDrag:!1,margin:0,stagePadding:0,merge:!1,mergeFit:!0,autoWidth:!1,startPosition:0,rtl:!1,smartSpeed:250,fluidSpeed:!1,dragEndSpeed:!1,responsive:{},responsiveRefreshRate:200,responsiveBaseElement:b,fallbackEasing:"swing",info:!1,nestedItemSelector:!1,itemElement:"div",stageElement:"div",refreshClass:"owl-refresh",loadedClass:"owl-loaded",loadingClass:"owl-loading",rtlClass:"owl-rtl",responsiveClass:"owl-responsive",dragClass:"owl-drag",itemClass:"owl-item",stageClass:"owl-stage",stageOuterClass:"owl-stage-outer",grabClass:"owl-grab"},e.Width={Default:"default",Inner:"inner",Outer:"outer"},e.Type={Event:"event",State:"state"},e.Plugins={},e.Workers=[{filter:["width","settings"],run:function(){this._width=this.$element.width()}},{filter:["width","items","settings"],run:function(a){a.current=this._items&&this._items[this.relative(this._current)]}},{filter:["items","settings"],run:function(){this.$stage.children(".cloned").remove()}},{filter:["width","items","settings"],run:function(a){var b=this.settings.margin||"",c=!this.settings.autoWidth,d=this.settings.rtl,e={width:"auto","margin-left":d?b:"","margin-right":d?"":b};!c&&this.$stage.children().css(e),a.css=e}},{filter:["width","items","settings"],run:function(a){var b=(this.width()/this.settings.items).toFixed(3)-this.settings.margin,c=null,d=this._items.length,e=!this.settings.autoWidth,f=[];for(a.items={merge:!1,width:b};d--;)c=this._mergers[d],c=this.settings.mergeFit&&Math.min(c,this.settings.items)||c,a.items.merge=c>1||a.items.merge,f[d]=e?b*c:this._items[d].width();this._widths=f}},{filter:["items","settings"],run:function(){var b=[],c=this._items,d=this.settings,e=Math.max(2*d.items,4),f=2*Math.ceil(c.length/2),g=d.loop&&c.length?d.rewind?e:Math.max(e,f):0,h="",i="";for(g/=2;g--;)b.push(this.normalize(b.length/2,!0)),h+=c[b[b.length-1]][0].outerHTML,b.push(this.normalize(c.length-1-(b.length-1)/2,!0)),i=c[b[b.length-1]][0].outerHTML+i;this._clones=b,a(h).addClass("cloned").appendTo(this.$stage),a(i).addClass("cloned").prependTo(this.$stage)}},{filter:["width","items","settings"],run:function(){for(var a=this.settings.rtl?1:-1,b=this._clones.length+this._items.length,c=-1,d=0,e=0,f=[];++c<b;)d=f[c-1]||0,e=this._widths[this.relative(c)]+this.settings.margin,f.push(d+e*a);this._coordinates=f}},{filter:["width","items","settings"],run:function(){var a=this.settings.stagePadding,b=this._coordinates,c={width:Math.ceil(Math.abs(b[b.length-1]))+2*a,"padding-left":a||"","padding-right":a||""};this.$stage.css(c)}},{filter:["width","items","settings"],run:function(a){var b=this._coordinates.length,c=!this.settings.autoWidth,d=this.$stage.children();if(c&&a.items.merge)for(;b--;)a.css.width=this._widths[this.relative(b)],d.eq(b).css(a.css);else c&&(a.css.width=a.items.width,d.css(a.css))}},{filter:["items"],run:function(){this._coordinates.length<1&&this.$stage.removeAttr("style")}},{filter:["width","items","settings"],run:function(a){a.current=a.current?this.$stage.children().index(a.current):0,a.current=Math.max(this.minimum(),Math.min(this.maximum(),a.current)),this.reset(a.current)}},{filter:["position"],run:function(){this.animate(this.coordinates(this._current))}},{filter:["width","position","items","settings"],run:function(){var a,b,c,d,e=this.settings.rtl?1:-1,f=2*this.settings.stagePadding,g=this.coordinates(this.current())+f,h=g+this.width()*e,i=[];for(c=0,d=this._coordinates.length;c<d;c++)a=this._coordinates[c-1]||0,b=Math.abs(this._coordinates[c])+f*e,(this.op(a,"<=",g)&&this.op(a,">",h)||this.op(b,"<",g)&&this.op(b,">",h))&&i.push(c);this.$stage.children(".active").removeClass("active"),this.$stage.children(":eq("+i.join("), :eq(")+")").addClass("active"),this.settings.center&&(this.$stage.children(".center").removeClass("center"),this.$stage.children().eq(this.current()).addClass("center"))}}],e.prototype.initialize=function(){if(this.enter("initializing"),this.trigger("initialize"),this.$element.toggleClass(this.settings.rtlClass,this.settings.rtl),this.settings.autoWidth&&!this.is("pre-loading")){var b,c,e;b=this.$element.find("img"),c=this.settings.nestedItemSelector?"."+this.settings.nestedItemSelector:d,e=this.$element.children(c).width(),b.length&&e<=0&&this.preloadAutoWidthImages(b)}this.$element.addClass(this.options.loadingClass),this.$stage=a("<"+this.settings.stageElement+' class="'+this.settings.stageClass+'"/>').wrap('<div class="'+this.settings.stageOuterClass+'"/>'),this.$element.append(this.$stage.parent()),this.replace(this.$element.children().not(this.$stage.parent())),this.$element.is(":visible")?this.refresh():this.invalidate("width"),this.$element.removeClass(this.options.loadingClass).addClass(this.options.loadedClass),this.registerEventHandlers(),this.leave("initializing"),this.trigger("initialized")},e.prototype.setup=function(){var b=this.viewport(),c=this.options.responsive,d=-1,e=null;c?(a.each(c,function(a){a<=b&&a>d&&(d=Number(a))}),e=a.extend({},this.options,c[d]),"function"==typeof e.stagePadding&&(e.stagePadding=e.stagePadding()),delete e.responsive,e.responsiveClass&&this.$element.attr("class",this.$element.attr("class").replace(new RegExp("("+this.options.responsiveClass+"-)\\S+\\s","g"),"$1"+d))):e=a.extend({},this.options),this.trigger("change",{property:{name:"settings",value:e}}),this._breakpoint=d,this.settings=e,this.invalidate("settings"),this.trigger("changed",{property:{name:"settings",value:this.settings}})},e.prototype.optionsLogic=function(){this.settings.autoWidth&&(this.settings.stagePadding=!1,this.settings.merge=!1)},e.prototype.prepare=function(b){var c=this.trigger("prepare",{content:b});return c.data||(c.data=a("<"+this.settings.itemElement+"/>").addClass(this.options.itemClass).append(b)),this.trigger("prepared",{content:c.data}),c.data},e.prototype.update=function(){for(var b=0,c=this._pipe.length,d=a.proxy(function(a){return this[a]},this._invalidated),e={};b<c;)(this._invalidated.all||a.grep(this._pipe[b].filter,d).length>0)&&this._pipe[b].run(e),b++;this._invalidated={},!this.is("valid")&&this.enter("valid")},e.prototype.width=function(a){switch(a=a||e.Width.Default){case e.Width.Inner:case e.Width.Outer:return this._width;default:return this._width-2*this.settings.stagePadding+this.settings.margin}},e.prototype.refresh=function(){this.enter("refreshing"),this.trigger("refresh"),this.setup(),this.optionsLogic(),this.$element.addClass(this.options.refreshClass),this.update(),this.$element.removeClass(this.options.refreshClass),this.leave("refreshing"),this.trigger("refreshed")},e.prototype.onThrottledResize=function(){b.clearTimeout(this.resizeTimer),this.resizeTimer=b.setTimeout(this._handlers.onResize,this.settings.responsiveRefreshRate)},e.prototype.onResize=function(){return!!this._items.length&&(this._width!==this.$element.width()&&(!!this.$element.is(":visible")&&(this.enter("resizing"),this.trigger("resize").isDefaultPrevented()?(this.leave("resizing"),!1):(this.invalidate("width"),this.refresh(),this.leave("resizing"),void this.trigger("resized")))))},e.prototype.registerEventHandlers=function(){a.support.transition&&this.$stage.on(a.support.transition.end+".owl.core",a.proxy(this.onTransitionEnd,this)),this.settings.responsive!==!1&&this.on(b,"resize",this._handlers.onThrottledResize),this.settings.mouseDrag&&(this.$element.addClass(this.options.dragClass),this.$stage.on("mousedown.owl.core",a.proxy(this.onDragStart,this)),this.$stage.on("dragstart.owl.core selectstart.owl.core",function(){return!1})),this.settings.touchDrag&&(this.$stage.on("touchstart.owl.core",a.proxy(this.onDragStart,this)),this.$stage.on("touchcancel.owl.core",a.proxy(this.onDragEnd,this)))},e.prototype.onDragStart=function(b){var d=null;3!==b.which&&(a.support.transform?(d=this.$stage.css("transform").replace(/.*\(|\)| /g,"").split(","),d={x:d[16===d.length?12:4],y:d[16===d.length?13:5]}):(d=this.$stage.position(),d={x:this.settings.rtl?d.left+this.$stage.width()-this.width()+this.settings.margin:d.left,y:d.top}),this.is("animating")&&(a.support.transform?this.animate(d.x):this.$stage.stop(),this.invalidate("position")),this.$element.toggleClass(this.options.grabClass,"mousedown"===b.type),this.speed(0),this._drag.time=(new Date).getTime(),this._drag.target=a(b.target),this._drag.stage.start=d,this._drag.stage.current=d,this._drag.pointer=this.pointer(b),a(c).on("mouseup.owl.core touchend.owl.core",a.proxy(this.onDragEnd,this)),a(c).one("mousemove.owl.core touchmove.owl.core",a.proxy(function(b){var d=this.difference(this._drag.pointer,this.pointer(b));a(c).on("mousemove.owl.core touchmove.owl.core",a.proxy(this.onDragMove,this)),Math.abs(d.x)<Math.abs(d.y)&&this.is("valid")||(b.preventDefault(),this.enter("dragging"),this.trigger("drag"))},this)))},e.prototype.onDragMove=function(a){var b=null,c=null,d=null,e=this.difference(this._drag.pointer,this.pointer(a)),f=this.difference(this._drag.stage.start,e);this.is("dragging")&&(a.preventDefault(),this.settings.loop?(b=this.coordinates(this.minimum()),c=this.coordinates(this.maximum()+1)-b,f.x=((f.x-b)%c+c)%c+b):(b=this.settings.rtl?this.coordinates(this.maximum()):this.coordinates(this.minimum()),c=this.settings.rtl?this.coordinates(this.minimum()):this.coordinates(this.maximum()),d=this.settings.pullDrag?-1*e.x/5:0,f.x=Math.max(Math.min(f.x,b+d),c+d)),this._drag.stage.current=f,this.animate(f.x))},e.prototype.onDragEnd=function(b){var d=this.difference(this._drag.pointer,this.pointer(b)),e=this._drag.stage.current,f=d.x>0^this.settings.rtl?"left":"right";a(c).off(".owl.core"),this.$element.removeClass(this.options.grabClass),(0!==d.x&&this.is("dragging")||!this.is("valid"))&&(this.speed(this.settings.dragEndSpeed||this.settings.smartSpeed),this.current(this.closest(e.x,0!==d.x?f:this._drag.direction)),this.invalidate("position"),this.update(),this._drag.direction=f,(Math.abs(d.x)>3||(new Date).getTime()-this._drag.time>300)&&this._drag.target.one("click.owl.core",function(){return!1})),this.is("dragging")&&(this.leave("dragging"),this.trigger("dragged"))},e.prototype.closest=function(b,c){var d=-1,e=30,f=this.width(),g=this.coordinates();return this.settings.freeDrag||a.each(g,a.proxy(function(a,h){return"left"===c&&b>h-e&&b<h+e?d=a:"right"===c&&b>h-f-e&&b<h-f+e?d=a+1:this.op(b,"<",h)&&this.op(b,">",g[a+1]||h-f)&&(d="left"===c?a+1:a),d===-1},this)),this.settings.loop||(this.op(b,">",g[this.minimum()])?d=b=this.minimum():this.op(b,"<",g[this.maximum()])&&(d=b=this.maximum())),d},e.prototype.animate=function(b){var c=this.speed()>0;this.is("animating")&&this.onTransitionEnd(),c&&(this.enter("animating"),this.trigger("translate")),a.support.transform3d&&a.support.transition?this.$stage.css({transform:"translate3d("+b+"px,0px,0px)",transition:this.speed()/1e3+"s"}):c?this.$stage.animate({left:b+"px"},this.speed(),this.settings.fallbackEasing,a.proxy(this.onTransitionEnd,this)):this.$stage.css({left:b+"px"})},e.prototype.is=function(a){return this._states.current[a]&&this._states.current[a]>0},e.prototype.current=function(a){if(a===d)return this._current;if(0===this._items.length)return d;if(a=this.normalize(a),this._current!==a){var b=this.trigger("change",{property:{name:"position",value:a}});b.data!==d&&(a=this.normalize(b.data)),this._current=a,this.invalidate("position"),this.trigger("changed",{property:{name:"position",value:this._current}})}return this._current},e.prototype.invalidate=function(b){return"string"===a.type(b)&&(this._invalidated[b]=!0,this.is("valid")&&this.leave("valid")),a.map(this._invalidated,function(a,b){return b})},e.prototype.reset=function(a){a=this.normalize(a),a!==d&&(this._speed=0,this._current=a,this.suppress(["translate","translated"]),this.animate(this.coordinates(a)),this.release(["translate","translated"]))},e.prototype.normalize=function(a,b){var c=this._items.length,e=b?0:this._clones.length;return!this.isNumeric(a)||c<1?a=d:(a<0||a>=c+e)&&(a=((a-e/2)%c+c)%c+e/2),a},e.prototype.relative=function(a){return a-=this._clones.length/2,this.normalize(a,!0)},e.prototype.maximum=function(a){var b,c,d,e=this.settings,f=this._coordinates.length;if(e.loop)f=this._clones.length/2+this._items.length-1;else if(e.autoWidth||e.merge){for(b=this._items.length,c=this._items[--b].width(),d=this.$element.width();b--&&(c+=this._items[b].width()+this.settings.margin,!(c>d)););f=b+1}else f=e.center?this._items.length-1:this._items.length-e.items;return a&&(f-=this._clones.length/2),Math.max(f,0)},e.prototype.minimum=function(a){return a?0:this._clones.length/2},e.prototype.items=function(a){return a===d?this._items.slice():(a=this.normalize(a,!0),this._items[a])},e.prototype.mergers=function(a){return a===d?this._mergers.slice():(a=this.normalize(a,!0),this._mergers[a])},e.prototype.clones=function(b){var c=this._clones.length/2,e=c+this._items.length,f=function(a){return a%2===0?e+a/2:c-(a+1)/2};return b===d?a.map(this._clones,function(a,b){return f(b)}):a.map(this._clones,function(a,c){return a===b?f(c):null})},e.prototype.speed=function(a){return a!==d&&(this._speed=a),this._speed},e.prototype.coordinates=function(b){var c,e=1,f=b-1;return b===d?a.map(this._coordinates,a.proxy(function(a,b){return this.coordinates(b)},this)):(this.settings.center?(this.settings.rtl&&(e=-1,f=b+1),c=this._coordinates[b],c+=(this.width()-c+(this._coordinates[f]||0))/2*e):c=this._coordinates[f]||0,c=Math.ceil(c))},e.prototype.duration=function(a,b,c){return 0===c?0:Math.min(Math.max(Math.abs(b-a),1),6)*Math.abs(c||this.settings.smartSpeed)},e.prototype.to=function(a,b){var c=this.current(),d=null,e=a-this.relative(c),f=(e>0)-(e<0),g=this._items.length,h=this.minimum(),i=this.maximum();this.settings.loop?(!this.settings.rewind&&Math.abs(e)>g/2&&(e+=f*-1*g),a=c+e,d=((a-h)%g+g)%g+h,d!==a&&d-e<=i&&d-e>0&&(c=d-e,a=d,this.reset(c))):this.settings.rewind?(i+=1,a=(a%i+i)%i):a=Math.max(h,Math.min(i,a)),this.speed(this.duration(c,a,b)),this.current(a),this.$element.is(":visible")&&this.update()},e.prototype.next=function(a){a=a||!1,this.to(this.relative(this.current())+1,a)},e.prototype.prev=function(a){a=a||!1,this.to(this.relative(this.current())-1,a)},e.prototype.onTransitionEnd=function(a){if(a!==d&&(a.stopPropagation(),(a.target||a.srcElement||a.originalTarget)!==this.$stage.get(0)))return!1;this.leave("animating"),this.trigger("translated")},e.prototype.viewport=function(){var d;return this.options.responsiveBaseElement!==b?d=a(this.options.responsiveBaseElement).width():b.innerWidth?d=b.innerWidth:c.documentElement&&c.documentElement.clientWidth?d=c.documentElement.clientWidth:console.warn("Can not detect viewport width."),d},e.prototype.replace=function(b){this.$stage.empty(),this._items=[],b&&(b=b instanceof jQuery?b:a(b)),this.settings.nestedItemSelector&&(b=b.find("."+this.settings.nestedItemSelector)),b.filter(function(){return 1===this.nodeType}).each(a.proxy(function(a,b){b=this.prepare(b),this.$stage.append(b),this._items.push(b),this._mergers.push(1*b.find("[data-merge]").addBack("[data-merge]").attr("data-merge")||1)},this)),this.reset(this.isNumeric(this.settings.startPosition)?this.settings.startPosition:0),this.invalidate("items")},e.prototype.add=function(b,c){var e=this.relative(this._current);c=c===d?this._items.length:this.normalize(c,!0),b=b instanceof jQuery?b:a(b),this.trigger("add",{content:b,position:c}),b=this.prepare(b),0===this._items.length||c===this._items.length?(0===this._items.length&&this.$stage.append(b),0!==this._items.length&&this._items[c-1].after(b),this._items.push(b),this._mergers.push(1*b.find("[data-merge]").addBack("[data-merge]").attr("data-merge")||1)):(this._items[c].before(b),this._items.splice(c,0,b),this._mergers.splice(c,0,1*b.find("[data-merge]").addBack("[data-merge]").attr("data-merge")||1)),this._items[e]&&this.reset(this._items[e].index()),this.invalidate("items"),this.trigger("added",{content:b,position:c})},e.prototype.remove=function(a){a=this.normalize(a,!0),a!==d&&(this.trigger("remove",{content:this._items[a],position:a}),this._items[a].remove(),this._items.splice(a,1),this._mergers.splice(a,1),this.invalidate("items"),this.trigger("removed",{content:null,position:a}))},e.prototype.preloadAutoWidthImages=function(b){b.each(a.proxy(function(b,c){this.enter("pre-loading"),c=a(c),a(new Image).one("load",a.proxy(function(a){c.attr("src",a.target.src),c.css("opacity",1),this.leave("pre-loading"),!this.is("pre-loading")&&!this.is("initializing")&&this.refresh()},this)).attr("src",c.attr("src")||c.attr("data-src")||c.attr("data-src-retina"))},this))},e.prototype.destroy=function(){this.$element.off(".owl.core"),this.$stage.off(".owl.core"),a(c).off(".owl.core"),this.settings.responsive!==!1&&(b.clearTimeout(this.resizeTimer),this.off(b,"resize",this._handlers.onThrottledResize));for(var d in this._plugins)this._plugins[d].destroy();this.$stage.children(".cloned").remove(),this.$stage.unwrap(),this.$stage.children().contents().unwrap(),this.$stage.children().unwrap(),this.$element.removeClass(this.options.refreshClass).removeClass(this.options.loadingClass).removeClass(this.options.loadedClass).removeClass(this.options.rtlClass).removeClass(this.options.dragClass).removeClass(this.options.grabClass).attr("class",this.$element.attr("class").replace(new RegExp(this.options.responsiveClass+"-\\S+\\s","g"),"")).removeData("owl.carousel")},e.prototype.op=function(a,b,c){var d=this.settings.rtl;switch(b){case"<":return d?a>c:a<c;case">":return d?a<c:a>c;case">=":return d?a<=c:a>=c;case"<=":return d?a>=c:a<=c}},e.prototype.on=function(a,b,c,d){a.addEventListener?a.addEventListener(b,c,d):a.attachEvent&&a.attachEvent("on"+b,c)},e.prototype.off=function(a,b,c,d){a.removeEventListener?a.removeEventListener(b,c,d):a.detachEvent&&a.detachEvent("on"+b,c)},e.prototype.trigger=function(b,c,d,f,g){var h={item:{count:this._items.length,index:this.current()}},i=a.camelCase(a.grep(["on",b,d],function(a){return a}).join("-").toLowerCase()),j=a.Event([b,"owl",d||"carousel"].join(".").toLowerCase(),a.extend({relatedTarget:this},h,c));return this._supress[b]||(a.each(this._plugins,function(a,b){b.onTrigger&&b.onTrigger(j)}),this.register({type:e.Type.Event,name:b}),this.$element.trigger(j),this.settings&&"function"==typeof this.settings[i]&&this.settings[i].call(this,j)),j},e.prototype.enter=function(b){a.each([b].concat(this._states.tags[b]||[]),a.proxy(function(a,b){this._states.current[b]===d&&(this._states.current[b]=0),this._states.current[b]++},this))},e.prototype.leave=function(b){a.each([b].concat(this._states.tags[b]||[]),a.proxy(function(a,b){this._states.current[b]--},this))},e.prototype.register=function(b){if(b.type===e.Type.Event){if(a.event.special[b.name]||(a.event.special[b.name]={}),!a.event.special[b.name].owl){var c=a.event.special[b.name]._default;a.event.special[b.name]._default=function(a){return!c||!c.apply||a.namespace&&a.namespace.indexOf("owl")!==-1?a.namespace&&a.namespace.indexOf("owl")>-1:c.apply(this,arguments)},a.event.special[b.name].owl=!0}}else b.type===e.Type.State&&(this._states.tags[b.name]?this._states.tags[b.name]=this._states.tags[b.name].concat(b.tags):this._states.tags[b.name]=b.tags,this._states.tags[b.name]=a.grep(this._states.tags[b.name],a.proxy(function(c,d){return a.inArray(c,this._states.tags[b.name])===d},this)))},e.prototype.suppress=function(b){a.each(b,a.proxy(function(a,b){this._supress[b]=!0},this))},e.prototype.release=function(b){a.each(b,a.proxy(function(a,b){delete this._supress[b]},this))},e.prototype.pointer=function(a){var c={x:null,y:null};return a=a.originalEvent||a||b.event,a=a.touches&&a.touches.length?a.touches[0]:a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:a,a.pageX?(c.x=a.pageX,c.y=a.pageY):(c.x=a.clientX,c.y=a.clientY),c},e.prototype.isNumeric=function(a){return!isNaN(parseFloat(a))},e.prototype.difference=function(a,b){return{x:a.x-b.x,y:a.y-b.y}},a.fn.owlCarousel=function(b){var c=Array.prototype.slice.call(arguments,1);return this.each(function(){var d=a(this),f=d.data("owl.carousel");f||(f=new e(this,"object"==typeof b&&b),d.data("owl.carousel",f),a.each(["next","prev","to","destroy","refresh","replace","add","remove"],function(b,c){f.register({type:e.Type.Event,name:c}),f.$element.on(c+".owl.carousel.core",a.proxy(function(a){a.namespace&&a.relatedTarget!==this&&(this.suppress([c]),f[c].apply(this,[].slice.call(arguments,1)),this.release([c]))},f))})),"string"==typeof b&&"_"!==b.charAt(0)&&f[b].apply(f,c)})},a.fn.owlCarousel.Constructor=e}(window.Zepto||window.jQuery,window,document),function(a,b,c,d){var e=function(b){this._core=b,this._interval=null,this._visible=null,this._handlers={"initialized.owl.carousel":a.proxy(function(a){a.namespace&&this._core.settings.autoRefresh&&this.watch()},this)},this._core.options=a.extend({},e.Defaults,this._core.options),this._core.$element.on(this._handlers)};e.Defaults={autoRefresh:!0,autoRefreshInterval:500},e.prototype.watch=function(){this._interval||(this._visible=this._core.$element.is(":visible"),this._interval=b.setInterval(a.proxy(this.refresh,this),this._core.settings.autoRefreshInterval))},e.prototype.refresh=function(){this._core.$element.is(":visible")!==this._visible&&(this._visible=!this._visible,this._core.$element.toggleClass("owl-hidden",!this._visible),this._visible&&this._core.invalidate("width")&&this._core.refresh())},e.prototype.destroy=function(){var a,c;b.clearInterval(this._interval);for(a in this._handlers)this._core.$element.off(a,this._handlers[a]);for(c in Object.getOwnPropertyNames(this))"function"!=typeof this[c]&&(this[c]=null)},a.fn.owlCarousel.Constructor.Plugins.AutoRefresh=e}(window.Zepto||window.jQuery,window,document),function(a,b,c,d){var e=function(b){this._core=b,this._loaded=[],this._handlers={"initialized.owl.carousel change.owl.carousel resized.owl.carousel":a.proxy(function(b){if(b.namespace&&this._core.settings&&this._core.settings.lazyLoad&&(b.property&&"position"==b.property.name||"initialized"==b.type))for(var c=this._core.settings,e=c.center&&Math.ceil(c.items/2)||c.items,f=c.center&&e*-1||0,g=(b.property&&b.property.value!==d?b.property.value:this._core.current())+f,h=this._core.clones().length,i=a.proxy(function(a,b){this.load(b)},this);f++<e;)this.load(h/2+this._core.relative(g)),h&&a.each(this._core.clones(this._core.relative(g)),i),g++},this)},this._core.options=a.extend({},e.Defaults,this._core.options),this._core.$element.on(this._handlers)};e.Defaults={lazyLoad:!1},e.prototype.load=function(c){var d=this._core.$stage.children().eq(c),e=d&&d.find(".owl-lazy");!e||a.inArray(d.get(0),this._loaded)>-1||(e.each(a.proxy(function(c,d){var e,f=a(d),g=b.devicePixelRatio>1&&f.attr("data-src-retina")||f.attr("data-src");this._core.trigger("load",{element:f,url:g},"lazy"),f.is("img")?f.one("load.owl.lazy",a.proxy(function(){f.css("opacity",1),this._core.trigger("loaded",{element:f,url:g},"lazy")},this)).attr("src",g):(e=new Image,e.onload=a.proxy(function(){f.css({"background-image":'url("'+g+'")',opacity:"1"}),this._core.trigger("loaded",{element:f,url:g},"lazy")},this),e.src=g)},this)),this._loaded.push(d.get(0)))},e.prototype.destroy=function(){var a,b;for(a in this.handlers)this._core.$element.off(a,this.handlers[a]);for(b in Object.getOwnPropertyNames(this))"function"!=typeof this[b]&&(this[b]=null)},a.fn.owlCarousel.Constructor.Plugins.Lazy=e}(window.Zepto||window.jQuery,window,document),function(a,b,c,d){var e=function(b){this._core=b,this._handlers={"initialized.owl.carousel refreshed.owl.carousel":a.proxy(function(a){a.namespace&&this._core.settings.autoHeight&&this.update()},this),"changed.owl.carousel":a.proxy(function(a){a.namespace&&this._core.settings.autoHeight&&"position"==a.property.name&&this.update()},this),"loaded.owl.lazy":a.proxy(function(a){a.namespace&&this._core.settings.autoHeight&&a.element.closest("."+this._core.settings.itemClass).index()===this._core.current()&&this.update()},this)},this._core.options=a.extend({},e.Defaults,this._core.options),this._core.$element.on(this._handlers)};e.Defaults={autoHeight:!1,autoHeightClass:"owl-height"},e.prototype.update=function(){var b=this._core._current,c=b+this._core.settings.items,d=this._core.$stage.children().toArray().slice(b,c),e=[],f=0;a.each(d,function(b,c){e.push(a(c).height())}),f=Math.max.apply(null,e),this._core.$stage.parent().height(f).addClass(this._core.settings.autoHeightClass)},e.prototype.destroy=function(){var a,b;for(a in this._handlers)this._core.$element.off(a,this._handlers[a]);for(b in Object.getOwnPropertyNames(this))"function"!=typeof this[b]&&(this[b]=null)},a.fn.owlCarousel.Constructor.Plugins.AutoHeight=e}(window.Zepto||window.jQuery,window,document),function(a,b,c,d){var e=function(b){this._core=b,this._videos={},this._playing=null,this._handlers={"initialized.owl.carousel":a.proxy(function(a){a.namespace&&this._core.register({type:"state",name:"playing",tags:["interacting"]})},this),"resize.owl.carousel":a.proxy(function(a){a.namespace&&this._core.settings.video&&this.isInFullScreen()&&a.preventDefault()},this),"refreshed.owl.carousel":a.proxy(function(a){a.namespace&&this._core.is("resizing")&&this._core.$stage.find(".cloned .owl-video-frame").remove()},this),"changed.owl.carousel":a.proxy(function(a){a.namespace&&"position"===a.property.name&&this._playing&&this.stop()},this),"prepared.owl.carousel":a.proxy(function(b){if(b.namespace){var c=a(b.content).find(".owl-video");c.length&&(c.css("display","none"),this.fetch(c,a(b.content)))}},this)},this._core.options=a.extend({},e.Defaults,this._core.options),this._core.$element.on(this._handlers),this._core.$element.on("click.owl.video",".owl-video-play-icon",a.proxy(function(a){this.play(a)},this))};e.Defaults={video:!1,videoHeight:!1,videoWidth:!1},e.prototype.fetch=function(a,b){var c=function(){return a.attr("data-vimeo-id")?"vimeo":a.attr("data-vzaar-id")?"vzaar":"youtube"}(),d=a.attr("data-vimeo-id")||a.attr("data-youtube-id")||a.attr("data-vzaar-id"),e=a.attr("data-width")||this._core.settings.videoWidth,f=a.attr("data-height")||this._core.settings.videoHeight,g=a.attr("href");if(!g)throw new Error("Missing video URL.");if(d=g.match(/(http:|https:|)\/\/(player.|www.|app.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com)|vzaar\.com)\/(video\/|videos\/|embed\/|channels\/.+\/|groups\/.+\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/),d[3].indexOf("youtu")>-1)c="youtube";else if(d[3].indexOf("vimeo")>-1)c="vimeo";else{if(!(d[3].indexOf("vzaar")>-1))throw new Error("Video URL not supported.");c="vzaar"}d=d[6],this._videos[g]={type:c,id:d,width:e,height:f},b.attr("data-video",g),this.thumbnail(a,this._videos[g])},e.prototype.thumbnail=function(b,c){var d,e,f,g=c.width&&c.height?'style="width:'+c.width+"px;height:"+c.height+'px;"':"",h=b.find("img"),i="src",j="",k=this._core.settings,l=function(a){e='<div class="owl-video-play-icon"></div>',d=k.lazyLoad?'<div class="owl-video-tn '+j+'" '+i+'="'+a+'"></div>':'<div class="owl-video-tn" style="opacity:1;background-image:url('+a+')"></div>',b.after(d),b.after(e)};if(b.wrap('<div class="owl-video-wrapper"'+g+"></div>"),this._core.settings.lazyLoad&&(i="data-src",j="owl-lazy"),h.length)return l(h.attr(i)),h.remove(),!1;"youtube"===c.type?(f="//img.youtube.com/vi/"+c.id+"/hqdefault.jpg",l(f)):"vimeo"===c.type?a.ajax({type:"GET",url:"//vimeo.com/api/v2/video/"+c.id+".json",jsonp:"callback",dataType:"jsonp",success:function(a){f=a[0].thumbnail_large,l(f)}}):"vzaar"===c.type&&a.ajax({type:"GET",url:"//vzaar.com/api/videos/"+c.id+".json",jsonp:"callback",dataType:"jsonp",success:function(a){f=a.framegrab_url,l(f)}})},e.prototype.stop=function(){this._core.trigger("stop",null,"video"),this._playing.find(".owl-video-frame").remove(),this._playing.removeClass("owl-video-playing"),this._playing=null,this._core.leave("playing"),this._core.trigger("stopped",null,"video")},e.prototype.play=function(b){var c,d=a(b.target),e=d.closest("."+this._core.settings.itemClass),f=this._videos[e.attr("data-video")],g=f.width||"100%",h=f.height||this._core.$stage.height();this._playing||(this._core.enter("playing"),this._core.trigger("play",null,"video"),e=this._core.items(this._core.relative(e.index())),this._core.reset(e.index()),"youtube"===f.type?c='<iframe width="'+g+'" height="'+h+'" src="//www.youtube.com/embed/'+f.id+"?autoplay=1&rel=0&v="+f.id+'" frameborder="0" allowfullscreen></iframe>':"vimeo"===f.type?c='<iframe src="//player.vimeo.com/video/'+f.id+'?autoplay=1" width="'+g+'" height="'+h+'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>':"vzaar"===f.type&&(c='<iframe frameborder="0"height="'+h+'"width="'+g+'" allowfullscreen mozallowfullscreen webkitAllowFullScreen src="//view.vzaar.com/'+f.id+'/player?autoplay=true"></iframe>'),a('<div class="owl-video-frame">'+c+"</div>").insertAfter(e.find(".owl-video")),this._playing=e.addClass("owl-video-playing"))},e.prototype.isInFullScreen=function(){var b=c.fullscreenElement||c.mozFullScreenElement||c.webkitFullscreenElement;return b&&a(b).parent().hasClass("owl-video-frame")},e.prototype.destroy=function(){var a,b;this._core.$element.off("click.owl.video");for(a in this._handlers)this._core.$element.off(a,this._handlers[a]);for(b in Object.getOwnPropertyNames(this))"function"!=typeof this[b]&&(this[b]=null)},a.fn.owlCarousel.Constructor.Plugins.Video=e}(window.Zepto||window.jQuery,window,document),function(a,b,c,d){var e=function(b){this.core=b,this.core.options=a.extend({},e.Defaults,this.core.options),this.swapping=!0,this.previous=d,this.next=d,this.handlers={"change.owl.carousel":a.proxy(function(a){a.namespace&&"position"==a.property.name&&(this.previous=this.core.current(),this.next=a.property.value)},this),"drag.owl.carousel dragged.owl.carousel translated.owl.carousel":a.proxy(function(a){a.namespace&&(this.swapping="translated"==a.type)},this),"translate.owl.carousel":a.proxy(function(a){a.namespace&&this.swapping&&(this.core.options.animateOut||this.core.options.animateIn)&&this.swap()},this)},this.core.$element.on(this.handlers)};e.Defaults={animateOut:!1,animateIn:!1},e.prototype.swap=function(){if(1===this.core.settings.items&&a.support.animation&&a.support.transition){this.core.speed(0);var b,c=a.proxy(this.clear,this),d=this.core.$stage.children().eq(this.previous),e=this.core.$stage.children().eq(this.next),f=this.core.settings.animateIn,g=this.core.settings.animateOut;this.core.current()!==this.previous&&(g&&(b=this.core.coordinates(this.previous)-this.core.coordinates(this.next),d.one(a.support.animation.end,c).css({left:b+"px"}).addClass("animated owl-animated-out").addClass(g)),f&&e.one(a.support.animation.end,c).addClass("animated owl-animated-in").addClass(f))}},e.prototype.clear=function(b){a(b.target).css({left:""}).removeClass("animated owl-animated-out owl-animated-in").removeClass(this.core.settings.animateIn).removeClass(this.core.settings.animateOut),this.core.onTransitionEnd()},e.prototype.destroy=function(){var a,b;for(a in this.handlers)this.core.$element.off(a,this.handlers[a]);for(b in Object.getOwnPropertyNames(this))"function"!=typeof this[b]&&(this[b]=null)},
a.fn.owlCarousel.Constructor.Plugins.Animate=e}(window.Zepto||window.jQuery,window,document),function(a,b,c,d){var e=function(b){this._core=b,this._timeout=null,this._paused=!1,this._handlers={"changed.owl.carousel":a.proxy(function(a){a.namespace&&"settings"===a.property.name?this._core.settings.autoplay?this.play():this.stop():a.namespace&&"position"===a.property.name&&this._core.settings.autoplay&&this._setAutoPlayInterval()},this),"initialized.owl.carousel":a.proxy(function(a){a.namespace&&this._core.settings.autoplay&&this.play()},this),"play.owl.autoplay":a.proxy(function(a,b,c){a.namespace&&this.play(b,c)},this),"stop.owl.autoplay":a.proxy(function(a){a.namespace&&this.stop()},this),"mouseover.owl.autoplay":a.proxy(function(){this._core.settings.autoplayHoverPause&&this._core.is("rotating")&&this.pause()},this),"mouseleave.owl.autoplay":a.proxy(function(){this._core.settings.autoplayHoverPause&&this._core.is("rotating")&&this.play()},this),"touchstart.owl.core":a.proxy(function(){this._core.settings.autoplayHoverPause&&this._core.is("rotating")&&this.pause()},this),"touchend.owl.core":a.proxy(function(){this._core.settings.autoplayHoverPause&&this.play()},this)},this._core.$element.on(this._handlers),this._core.options=a.extend({},e.Defaults,this._core.options)};e.Defaults={autoplay:!1,autoplayTimeout:5e3,autoplayHoverPause:!1,autoplaySpeed:!1},e.prototype.play=function(a,b){this._paused=!1,this._core.is("rotating")||(this._core.enter("rotating"),this._setAutoPlayInterval())},e.prototype._getNextTimeout=function(d,e){return this._timeout&&b.clearTimeout(this._timeout),b.setTimeout(a.proxy(function(){this._paused||this._core.is("busy")||this._core.is("interacting")||c.hidden||this._core.next(e||this._core.settings.autoplaySpeed)},this),d||this._core.settings.autoplayTimeout)},e.prototype._setAutoPlayInterval=function(){this._timeout=this._getNextTimeout()},e.prototype.stop=function(){this._core.is("rotating")&&(b.clearTimeout(this._timeout),this._core.leave("rotating"))},e.prototype.pause=function(){this._core.is("rotating")&&(this._paused=!0)},e.prototype.destroy=function(){var a,b;this.stop();for(a in this._handlers)this._core.$element.off(a,this._handlers[a]);for(b in Object.getOwnPropertyNames(this))"function"!=typeof this[b]&&(this[b]=null)},a.fn.owlCarousel.Constructor.Plugins.autoplay=e}(window.Zepto||window.jQuery,window,document),function(a,b,c,d){"use strict";var e=function(b){this._core=b,this._initialized=!1,this._pages=[],this._controls={},this._templates=[],this.$element=this._core.$element,this._overrides={next:this._core.next,prev:this._core.prev,to:this._core.to},this._handlers={"prepared.owl.carousel":a.proxy(function(b){b.namespace&&this._core.settings.dotsData&&this._templates.push('<div class="'+this._core.settings.dotClass+'">'+a(b.content).find("[data-dot]").addBack("[data-dot]").attr("data-dot")+"</div>")},this),"added.owl.carousel":a.proxy(function(a){a.namespace&&this._core.settings.dotsData&&this._templates.splice(a.position,0,this._templates.pop())},this),"remove.owl.carousel":a.proxy(function(a){a.namespace&&this._core.settings.dotsData&&this._templates.splice(a.position,1)},this),"changed.owl.carousel":a.proxy(function(a){a.namespace&&"position"==a.property.name&&this.draw()},this),"initialized.owl.carousel":a.proxy(function(a){a.namespace&&!this._initialized&&(this._core.trigger("initialize",null,"navigation"),this.initialize(),this.update(),this.draw(),this._initialized=!0,this._core.trigger("initialized",null,"navigation"))},this),"refreshed.owl.carousel":a.proxy(function(a){a.namespace&&this._initialized&&(this._core.trigger("refresh",null,"navigation"),this.update(),this.draw(),this._core.trigger("refreshed",null,"navigation"))},this)},this._core.options=a.extend({},e.Defaults,this._core.options),this.$element.on(this._handlers)};e.Defaults={nav:!1,navText:["prev","next"],navSpeed:!1,navElement:"div",navContainer:!1,navContainerClass:"owl-nav",navClass:["owl-prev","owl-next"],slideBy:1,dotClass:"owl-dot",dotsClass:"owl-dots",dots:!0,dotsEach:!1,dotsData:!1,dotsSpeed:!1,dotsContainer:!1},e.prototype.initialize=function(){var b,c=this._core.settings;this._controls.$relative=(c.navContainer?a(c.navContainer):a("<div>").addClass(c.navContainerClass).appendTo(this.$element)).addClass("disabled"),this._controls.$previous=a("<"+c.navElement+">").addClass(c.navClass[0]).html(c.navText[0]).prependTo(this._controls.$relative).on("click",a.proxy(function(a){this.prev(c.navSpeed)},this)),this._controls.$next=a("<"+c.navElement+">").addClass(c.navClass[1]).html(c.navText[1]).appendTo(this._controls.$relative).on("click",a.proxy(function(a){this.next(c.navSpeed)},this)),c.dotsData||(this._templates=[a("<div>").addClass(c.dotClass).append(a("<span>")).prop("outerHTML")]),this._controls.$absolute=(c.dotsContainer?a(c.dotsContainer):a("<div>").addClass(c.dotsClass).appendTo(this.$element)).addClass("disabled"),this._controls.$absolute.on("click","div",a.proxy(function(b){var d=a(b.target).parent().is(this._controls.$absolute)?a(b.target).index():a(b.target).parent().index();b.preventDefault(),this.to(d,c.dotsSpeed)},this));for(b in this._overrides)this._core[b]=a.proxy(this[b],this)},e.prototype.destroy=function(){var a,b,c,d;for(a in this._handlers)this.$element.off(a,this._handlers[a]);for(b in this._controls)this._controls[b].remove();for(d in this.overides)this._core[d]=this._overrides[d];for(c in Object.getOwnPropertyNames(this))"function"!=typeof this[c]&&(this[c]=null)},e.prototype.update=function(){var a,b,c,d=this._core.clones().length/2,e=d+this._core.items().length,f=this._core.maximum(!0),g=this._core.settings,h=g.center||g.autoWidth||g.dotsData?1:g.dotsEach||g.items;if("page"!==g.slideBy&&(g.slideBy=Math.min(g.slideBy,g.items)),g.dots||"page"==g.slideBy)for(this._pages=[],a=d,b=0,c=0;a<e;a++){if(b>=h||0===b){if(this._pages.push({start:Math.min(f,a-d),end:a-d+h-1}),Math.min(f,a-d)===f)break;b=0,++c}b+=this._core.mergers(this._core.relative(a))}},e.prototype.draw=function(){var b,c=this._core.settings,d=this._core.items().length<=c.items,e=this._core.relative(this._core.current()),f=c.loop||c.rewind;this._controls.$relative.toggleClass("disabled",!c.nav||d),c.nav&&(this._controls.$previous.toggleClass("disabled",!f&&e<=this._core.minimum(!0)),this._controls.$next.toggleClass("disabled",!f&&e>=this._core.maximum(!0))),this._controls.$absolute.toggleClass("disabled",!c.dots||d),c.dots&&(b=this._pages.length-this._controls.$absolute.children().length,c.dotsData&&0!==b?this._controls.$absolute.html(this._templates.join("")):b>0?this._controls.$absolute.append(new Array(b+1).join(this._templates[0])):b<0&&this._controls.$absolute.children().slice(b).remove(),this._controls.$absolute.find(".active").removeClass("active"),this._controls.$absolute.children().eq(a.inArray(this.current(),this._pages)).addClass("active"))},e.prototype.onTrigger=function(b){var c=this._core.settings;b.page={index:a.inArray(this.current(),this._pages),count:this._pages.length,size:c&&(c.center||c.autoWidth||c.dotsData?1:c.dotsEach||c.items)}},e.prototype.current=function(){var b=this._core.relative(this._core.current());return a.grep(this._pages,a.proxy(function(a,c){return a.start<=b&&a.end>=b},this)).pop()},e.prototype.getPosition=function(b){var c,d,e=this._core.settings;return"page"==e.slideBy?(c=a.inArray(this.current(),this._pages),d=this._pages.length,b?++c:--c,c=this._pages[(c%d+d)%d].start):(c=this._core.relative(this._core.current()),d=this._core.items().length,b?c+=e.slideBy:c-=e.slideBy),c},e.prototype.next=function(b){a.proxy(this._overrides.to,this._core)(this.getPosition(!0),b)},e.prototype.prev=function(b){a.proxy(this._overrides.to,this._core)(this.getPosition(!1),b)},e.prototype.to=function(b,c,d){var e;!d&&this._pages.length?(e=this._pages.length,a.proxy(this._overrides.to,this._core)(this._pages[(b%e+e)%e].start,c)):a.proxy(this._overrides.to,this._core)(b,c)},a.fn.owlCarousel.Constructor.Plugins.Navigation=e}(window.Zepto||window.jQuery,window,document),function(a,b,c,d){"use strict";var e=function(c){this._core=c,this._hashes={},this.$element=this._core.$element,this._handlers={"initialized.owl.carousel":a.proxy(function(c){c.namespace&&"URLHash"===this._core.settings.startPosition&&a(b).trigger("hashchange.owl.navigation")},this),"prepared.owl.carousel":a.proxy(function(b){if(b.namespace){var c=a(b.content).find("[data-hash]").addBack("[data-hash]").attr("data-hash");if(!c)return;this._hashes[c]=b.content}},this),"changed.owl.carousel":a.proxy(function(c){if(c.namespace&&"position"===c.property.name){var d=this._core.items(this._core.relative(this._core.current())),e=a.map(this._hashes,function(a,b){return a===d?b:null}).join();if(!e||b.location.hash.slice(1)===e)return;b.location.hash=e}},this)},this._core.options=a.extend({},e.Defaults,this._core.options),this.$element.on(this._handlers),a(b).on("hashchange.owl.navigation",a.proxy(function(a){var c=b.location.hash.substring(1),e=this._core.$stage.children(),f=this._hashes[c]&&e.index(this._hashes[c]);f!==d&&f!==this._core.current()&&this._core.to(this._core.relative(f),!1,!0)},this))};e.Defaults={URLhashListener:!1},e.prototype.destroy=function(){var c,d;a(b).off("hashchange.owl.navigation");for(c in this._handlers)this._core.$element.off(c,this._handlers[c]);for(d in Object.getOwnPropertyNames(this))"function"!=typeof this[d]&&(this[d]=null)},a.fn.owlCarousel.Constructor.Plugins.Hash=e}(window.Zepto||window.jQuery,window,document),function(a,b,c,d){function e(b,c){var e=!1,f=b.charAt(0).toUpperCase()+b.slice(1);return a.each((b+" "+h.join(f+" ")+f).split(" "),function(a,b){if(g[b]!==d)return e=!c||b,!1}),e}function f(a){return e(a,!0)}var g=a("<support>").get(0).style,h="Webkit Moz O ms".split(" "),i={transition:{end:{WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd",transition:"transitionend"}},animation:{end:{WebkitAnimation:"webkitAnimationEnd",MozAnimation:"animationend",OAnimation:"oAnimationEnd",animation:"animationend"}}},j={csstransforms:function(){return!!e("transform")},csstransforms3d:function(){return!!e("perspective")},csstransitions:function(){return!!e("transition")},cssanimations:function(){return!!e("animation")}};j.csstransitions()&&(a.support.transition=new String(f("transition")),a.support.transition.end=i.transition.end[a.support.transition]),j.cssanimations()&&(a.support.animation=new String(f("animation")),a.support.animation.end=i.animation.end[a.support.animation]),j.csstransforms()&&(a.support.transform=new String(f("transform")),a.support.transform3d=j.csstransforms3d())}(window.Zepto||window.jQuery,window,document);
/*!
 * angular-ui-mask
 * https://github.com/angular-ui/ui-mask
 * Version: 1.8.7 - 2016-07-26T15:59:07.992Z
 * License: MIT
 */
!function(){"use strict";angular.module("ui.mask",[]).value("uiMaskConfig",{maskDefinitions:{9:/\d/,A:/[a-zA-Z]/,"*":/[a-zA-Z0-9]/},clearOnBlur:!0,clearOnBlurPlaceholder:!1,escChar:"\\",eventsToHandle:["input","keyup","click","focus"],addDefaultPlaceholder:!0,allowInvalidValue:!1}).provider("uiMask.Config",function(){var e={};this.maskDefinitions=function(n){return e.maskDefinitions=n},this.clearOnBlur=function(n){return e.clearOnBlur=n},this.clearOnBlurPlaceholder=function(n){return e.clearOnBlurPlaceholder=n},this.eventsToHandle=function(n){return e.eventsToHandle=n},this.addDefaultPlaceholder=function(n){return e.addDefaultPlaceholder=n},this.allowInvalidValue=function(n){return e.allowInvalidValue=n},this.$get=["uiMaskConfig",function(n){var t=n;for(var a in e)angular.isObject(e[a])&&!angular.isArray(e[a])?angular.extend(t[a],e[a]):t[a]=e[a];return t}]}).directive("uiMask",["uiMask.Config",function(e){function n(e){return e===document.activeElement&&(!document.hasFocus||document.hasFocus())&&!!(e.type||e.href||~e.tabIndex)}return{priority:100,require:"ngModel",restrict:"A",compile:function(){var t=angular.copy(e);return function(e,a,i,r){function l(e){return angular.isDefined(e)?(w(e),K?(h(),d(),!0):f()):f()}function u(e){e&&(T=e,!K||0===a.val().length&&angular.isDefined(i.placeholder)||a.val(m(p(a.val()))))}function o(){return l(i.uiMask)}function c(e){return K?(j=p(e||""),R=g(j),r.$setValidity("mask",R),j.length&&(R||Q.allowInvalidValue)?m(j):void 0):e}function s(e){return K?(j=p(e||""),R=g(j),r.$viewValue=j.length?m(j):"",r.$setValidity("mask",R),R||Q.allowInvalidValue?J?r.$viewValue:j:void 0):e}function f(){return K=!1,v(),angular.isDefined(q)?a.attr("placeholder",q):a.removeAttr("placeholder"),angular.isDefined(W)?a.attr("maxlength",W):a.removeAttr("maxlength"),a.val(r.$modelValue),r.$viewValue=r.$modelValue,!1}function h(){j=F=p(r.$modelValue||""),H=_=m(j),R=g(j),i.maxlength&&a.attr("maxlength",2*S[S.length-1]),!q&&Q.addDefaultPlaceholder&&a.attr("placeholder",T);for(var e=r.$modelValue,n=r.$formatters.length;n--;)e=r.$formatters[n](e);r.$viewValue=e||"",r.$render()}function d(){Z||(a.bind("blur",y),a.bind("mousedown mouseup",V),a.bind("keydown",M),a.bind(Q.eventsToHandle.join(" "),O),Z=!0)}function v(){Z&&(a.unbind("blur",y),a.unbind("mousedown",V),a.unbind("mouseup",V),a.unbind("keydown",M),a.unbind("input",O),a.unbind("keyup",O),a.unbind("click",O),a.unbind("focus",O),Z=!1)}function g(e){return e.length?e.length>=I:!0}function p(e){var n,t,i="",r=a[0],l=A.slice(),u=L,o=u+C(r),c="";return e=e.toString(),n=0,t=e.length-T.length,angular.forEach(B,function(a){var i=a.position;i>=u&&o>i||(i>=u&&(i+=t),e.substring(i,i+a.value.length)===a.value&&(c+=e.slice(n,i),n=i+a.value.length))}),e=c+e.slice(n),angular.forEach(e.split(""),function(e){l.length&&l[0].test(e)&&(i+=e,l.shift())}),i}function m(e){var n="",t=S.slice();return angular.forEach(T.split(""),function(a,i){e.length&&i===t[0]?(n+=e.charAt(0)||"_",e=e.substr(1),t.shift()):n+=a}),n}function b(e){var n,t=angular.isDefined(i.uiMaskPlaceholder)?i.uiMaskPlaceholder:i.placeholder;return angular.isDefined(t)&&t[e]?t[e]:(n=angular.isDefined(i.uiMaskPlaceholderChar)&&i.uiMaskPlaceholderChar?i.uiMaskPlaceholderChar:"_","space"===n.toLowerCase()?" ":n[0])}function k(){var e,n,t=T.split("");S&&!isNaN(S[0])&&angular.forEach(S,function(e){t[e]="_"}),e=t.join(""),n=e.replace(/[_]+/g,"_").split("_"),n=n.filter(function(e){return""!==e});var a=0;return n.map(function(n){var t=e.indexOf(n,a);return a=t+1,{value:n,position:t}})}function w(e){var n=0;if(S=[],A=[],T="",angular.isString(e)){I=0;var t=!1,a=0,i=e.split(""),r=!1;angular.forEach(i,function(e,i){r?(r=!1,T+=e,n++):Q.escChar===e?r=!0:Q.maskDefinitions[e]?(S.push(n),T+=b(i-a),A.push(Q.maskDefinitions[e]),n++,t||I++,t=!1):"?"===e?(t=!0,a++):(T+=e,n++)})}S.push(S.slice().pop()+1),B=k(),K=S.length>1?!0:!1}function y(){if((Q.clearOnBlur||Q.clearOnBlurPlaceholder&&0===j.length&&i.placeholder)&&(L=0,N=0,R&&0!==j.length||(H="",a.val(""),e.$apply(function(){r.$pristine||r.$setViewValue("")}))),j!==U){var n=a.val(),t=""===j&&n&&angular.isDefined(i.uiMaskPlaceholderChar)&&"space"===i.uiMaskPlaceholderChar;t&&a.val(""),$(a[0]),t&&a.val(n)}U=j}function $(e){var n;if(angular.isFunction(window.Event)&&!e.fireEvent)try{n=new Event("change",{view:window,bubbles:!0,cancelable:!1})}catch(t){n=document.createEvent("HTMLEvents"),n.initEvent("change",!1,!0)}finally{e.dispatchEvent(n)}else"createEvent"in document?(n=document.createEvent("HTMLEvents"),n.initEvent("change",!1,!0),e.dispatchEvent(n)):e.fireEvent&&e.fireEvent("onchange")}function V(e){"mousedown"===e.type?a.bind("mouseout",E):a.unbind("mouseout",E)}function E(){N=C(this),a.unbind("mouseout",E)}function M(e){var n=8===e.which,t=P(this)-1||0,i=90===e.which&&e.ctrlKey;if(n){for(;t>=0;){if(D(t)){x(this,t+1);break}t--}z=-1===t}i&&(a.val(""),e.preventDefault())}function O(n){n=n||{};var t=n.which,i=n.type;if(16!==t&&91!==t){var l,u=a.val(),o=_,c=!1,s=p(u),f=F,h=P(this)||0,d=L||0,v=h-d,g=S[0],b=S[s.length]||S.slice().shift(),k=N||0,w=C(this)>0,y=k>0,$=u.length>o.length||k&&u.length>o.length-k,V=u.length<o.length||k&&u.length===o.length-k,E=t>=37&&40>=t&&n.shiftKey,M=37===t,O=8===t||"keyup"!==i&&V&&-1===v,A=46===t||"keyup"!==i&&V&&0===v&&!y,B=(M||O||"click"===i)&&h>g;if(N=C(this),!E&&(!w||"click"!==i&&"keyup"!==i&&"focus"!==i)){if(O&&z)return a.val(T),e.$apply(function(){r.$setViewValue("")}),void x(this,d);if("input"===i&&V&&!y&&s===f){for(;O&&h>g&&!D(h);)h--;for(;A&&b>h&&-1===S.indexOf(h);)h++;var I=S.indexOf(h);s=s.substring(0,I)+s.substring(I+1),s!==f&&(c=!0)}for(l=m(s),_=l,F=s,!c&&u.length>l.length&&(c=!0),a.val(l),c&&e.$apply(function(){r.$setViewValue(l)}),$&&g>=h&&(h=g+1),B&&h--,h=h>b?b:g>h?g:h;!D(h)&&h>g&&b>h;)h+=B?-1:1;(B&&b>h||$&&!D(d))&&h++,L=h,x(this,h)}}}function D(e){return S.indexOf(e)>-1}function P(e){if(!e)return 0;if(void 0!==e.selectionStart)return e.selectionStart;if(document.selection&&n(a[0])){e.focus();var t=document.selection.createRange();return t.moveStart("character",e.value?-e.value.length:0),t.text.length}return 0}function x(e,t){if(!e)return 0;if(0!==e.offsetWidth&&0!==e.offsetHeight)if(e.setSelectionRange)n(a[0])&&(e.focus(),e.setSelectionRange(t,t));else if(e.createTextRange){var i=e.createTextRange();i.collapse(!0),i.moveEnd("character",t),i.moveStart("character",t),i.select()}}function C(e){return e?void 0!==e.selectionStart?e.selectionEnd-e.selectionStart:window.getSelection?window.getSelection().toString().length:document.selection?document.selection.createRange().text.length:0:0}var S,A,T,B,I,j,H,R,_,F,L,N,z,K=!1,Z=!1,q=i.placeholder,W=i.maxlength,G=r.$isEmpty;r.$isEmpty=function(e){return G(K?p(e||""):e)};var J=!1;i.$observe("modelViewValue",function(e){"true"===e&&(J=!0)}),i.$observe("allowInvalidValue",function(e){Q.allowInvalidValue=""===e?!0:!!e,c(r.$modelValue)});var Q={};i.uiOptions?(Q=e.$eval("["+i.uiOptions+"]"),Q=angular.isObject(Q[0])?function(e,n){for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&(void 0===n[t]?n[t]=angular.copy(e[t]):angular.isObject(n[t])&&!angular.isArray(n[t])&&(n[t]=angular.extend({},e[t],n[t])));return n}(t,Q[0]):t):Q=t,i.$observe("uiMask",l),angular.isDefined(i.uiMaskPlaceholder)?i.$observe("uiMaskPlaceholder",u):i.$observe("placeholder",u),angular.isDefined(i.uiMaskPlaceholderChar)&&i.$observe("uiMaskPlaceholderChar",o),r.$formatters.unshift(c),r.$parsers.unshift(s);var U=a.val();a.bind("mousedown mouseup",V),Array.prototype.indexOf||(Array.prototype.indexOf=function(e){if(null===this)throw new TypeError;var n=Object(this),t=n.length>>>0;if(0===t)return-1;var a=0;if(arguments.length>1&&(a=Number(arguments[1]),a!==a?a=0:0!==a&&a!==1/0&&a!==-(1/0)&&(a=(a>0||-1)*Math.floor(Math.abs(a)))),a>=t)return-1;for(var i=a>=0?a:Math.max(t-Math.abs(a),0);t>i;i++)if(i in n&&n[i]===e)return i;return-1})}}}}])}();
/*! angularjs-slider - v6.0.1 - 
 (c) Rafal Zajac <rzajac@gmail.com>, Valentin Hervieu <valentin@hervieu.me>, Jussi Saarivirta <jusasi@gmail.com>, Angelin Sirbu <angelin.sirbu@gmail.com> - 
 https://github.com/angular-slider/angularjs-slider - 
 2017-02-15 */
/*jslint unparam: true */
/*global angular: false, console: false, define, module */
(function(root, factory) {
  'use strict';
  /* istanbul ignore next */
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['angular'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    // to support bundler like browserify
    var angularObj = angular || require('angular');
    if ((!angularObj || !angularObj.module) && typeof angular != 'undefined') {
      angularObj = angular;
    }
    module.exports = factory(angularObj);
  } else {
    // Browser globals (root is window)
    factory(root.angular);
  }

}(this, function(angular) {
  'use strict';
  var module = angular.module('rzModule', [])

  .factory('RzSliderOptions', function() {
    var defaultOptions = {
      floor: 0,
      ceil: null, //defaults to rz-slider-model
      step: 1,
      precision: 0,
      minRange: null,
      maxRange: null,
      pushRange: false,
      minLimit: null,
      maxLimit: null,
      id: null,
      translate: null,
      getLegend: null,
      stepsArray: null,
      bindIndexForStepsArray: false,
      draggableRange: false,
      draggableRangeOnly: false,
      showSelectionBar: false,
      showSelectionBarEnd: false,
      showSelectionBarFromValue: null,
      hidePointerLabels: false,
      hideLimitLabels: false,
      autoHideLimitLabels: true,
      readOnly: false,
      disabled: false,
      interval: 350,
      showTicks: false,
      showTicksValues: false,
      ticksArray: null,
      ticksTooltip: null,
      ticksValuesTooltip: null,
      vertical: false,
      getSelectionBarColor: null,
      getTickColor: null,
      getPointerColor: null,
      keyboardSupport: true,
      scale: 1,
      enforceStep: true,
      enforceRange: false,
      noSwitching: false,
      onlyBindHandles: false,
      onStart: null,
      onChange: null,
      onEnd: null,
      rightToLeft: false,
      boundPointerLabels: true,
      mergeRangeLabelsIfSame: false,
      customTemplateScope: null,
      logScale: false,
      customValueToPosition: null,
      customPositionToValue: null,
      selectionBarGradient: null
    };
    var globalOptions = {};

    var factory = {};
    /**
     * `options({})` allows global configuration of all sliders in the
     * application.
     *
     *   var app = angular.module( 'App', ['rzModule'], function( RzSliderOptions ) {
     *     // show ticks for all sliders
     *     RzSliderOptions.options( { showTicks: true } );
     *   });
     */
    factory.options = function(value) {
      angular.extend(globalOptions, value);
    };

    factory.getOptions = function(options) {
      return angular.extend({}, defaultOptions, globalOptions, options);
    };

    return factory;
  })

  .factory('rzThrottle', ['$timeout', function($timeout) {
    /**
     * rzThrottle
     *
     * Taken from underscore project
     *
     * @param {Function} func
     * @param {number} wait
     * @param {ThrottleOptions} options
     * @returns {Function}
     */
    return function(func, wait, options) {
      'use strict';
      /* istanbul ignore next */
      var getTime = (Date.now || function() {
        return new Date().getTime();
      });
      var context, args, result;
      var timeout = null;
      var previous = 0;
      options = options || {};
      var later = function() {
        previous = getTime();
        timeout = null;
        result = func.apply(context, args);
        context = args = null;
      };
      return function() {
        var now = getTime();
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
          $timeout.cancel(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
          context = args = null;
        } else if (!timeout && options.trailing !== false) {
          timeout = $timeout(later, remaining);
        }
        return result;
      };
    }
  }])

  .factory('RzSlider', ['$timeout', '$document', '$window', '$compile', 'RzSliderOptions', 'rzThrottle', function($timeout, $document, $window, $compile, RzSliderOptions, rzThrottle) {
    'use strict';

    /**
     * Slider
     *
     * @param {ngScope} scope            The AngularJS scope
     * @param {Element} sliderElem The slider directive element wrapped in jqLite
     * @constructor
     */
    var Slider = function(scope, sliderElem) {
      /**
       * The slider's scope
       *
       * @type {ngScope}
       */
      this.scope = scope;

      /**
       * The slider inner low value (linked to rzSliderModel)
       * @type {number}
       */
      this.lowValue = 0;

      /**
       * The slider inner high value (linked to rzSliderHigh)
       * @type {number}
       */
      this.highValue = 0;

      /**
       * Slider element wrapped in jqLite
       *
       * @type {jqLite}
       */
      this.sliderElem = sliderElem;

      /**
       * Slider type
       *
       * @type {boolean} Set to true for range slider
       */
      this.range = this.scope.rzSliderModel !== undefined && this.scope.rzSliderHigh !== undefined;

      /**
       * Values recorded when first dragging the bar
       *
       * @type {Object}
       */
      this.dragging = {
        active: false,
        value: 0,
        difference: 0,
        position: 0,
        lowLimit: 0,
        highLimit: 0
      };

      /**
       * property that handle position (defaults to left for horizontal)
       * @type {string}
       */
      this.positionProperty = 'left';

      /**
       * property that handle dimension (defaults to width for horizontal)
       * @type {string}
       */
      this.dimensionProperty = 'width';

      /**
       * Half of the width or height of the slider handles
       *
       * @type {number}
       */
      this.handleHalfDim = 0;

      /**
       * Maximum position the slider handle can have
       *
       * @type {number}
       */
      this.maxPos = 0;

      /**
       * Precision
       *
       * @type {number}
       */
      this.precision = 0;

      /**
       * Step
       *
       * @type {number}
       */
      this.step = 1;

      /**
       * The name of the handle we are currently tracking
       *
       * @type {string}
       */
      this.tracking = '';

      /**
       * Minimum value (floor) of the model
       *
       * @type {number}
       */
      this.minValue = 0;

      /**
       * Maximum value (ceiling) of the model
       *
       * @type {number}
       */
      this.maxValue = 0;


      /**
       * The delta between min and max value
       *
       * @type {number}
       */
      this.valueRange = 0;


      /**
       * If showTicks/showTicksValues options are number.
       * In this case, ticks values should be displayed below the slider.
       * @type {boolean}
       */
      this.intermediateTicks = false;

      /**
       * Set to true if init method already executed
       *
       * @type {boolean}
       */
      this.initHasRun = false;

      /**
       * Used to call onStart on the first keydown event
       *
       * @type {boolean}
       */
      this.firstKeyDown = false;

      /**
       * Internal flag to prevent watchers to be called when the sliders value are modified internally.
       * @type {boolean}
       */
      this.internalChange = false;

      /**
       * Internal flag to keep track of the visibility of combo label
       * @type {boolean}
       */
      this.cmbLabelShown = false;

      /**
       * Internal variable to keep track of the focus element
       */
      this.currentFocusElement = null;

      // Slider DOM elements wrapped in jqLite
      this.fullBar = null; // The whole slider bar
      this.selBar = null; // Highlight between two handles
      this.minH = null; // Left slider handle
      this.maxH = null; // Right slider handle
      this.flrLab = null; // Floor label
      this.ceilLab = null; // Ceiling label
      this.minLab = null; // Label above the low value
      this.maxLab = null; // Label above the high value
      this.cmbLab = null; // Combined label
      this.ticks = null; // The ticks

      // Initialize slider
      this.init();
    };

    // Add instance methods
    Slider.prototype = {

      /**
       * Initialize slider
       *
       * @returns {undefined}
       */
      init: function() {
        var thrLow, thrHigh,
          self = this;

        var calcDimFn = function() {
          self.calcViewDimensions();
        };

        this.applyOptions();
        this.syncLowValue();
        if (this.range)
          this.syncHighValue();
        this.initElemHandles();
        this.manageElementsStyle();
        this.setDisabledState();
        this.calcViewDimensions();
        this.setMinAndMax();
        this.addAccessibility();
        this.updateCeilLab();
        this.updateFloorLab();
        this.initHandles();
        this.manageEventsBindings();

        // Recalculate slider view dimensions
        this.scope.$on('reCalcViewDimensions', calcDimFn);

        // Recalculate stuff if view port dimensions have changed
        angular.element($window).on('resize', calcDimFn);

        this.initHasRun = true;

        // Watch for changes to the model
        thrLow = rzThrottle(function() {
          self.onLowHandleChange();
        }, self.options.interval);

        thrHigh = rzThrottle(function() {
          self.onHighHandleChange();
        }, self.options.interval);

        this.scope.$on('rzSliderForceRender', function() {
          self.resetLabelsValue();
          thrLow();
          if (self.range) {
            thrHigh();
          }
          self.resetSlider();
        });

        // Watchers (order is important because in case of simultaneous change,
        // watchers will be called in the same order)
        this.scope.$watch('rzSliderOptions()', function(newValue, oldValue) {
          if (newValue === oldValue)
            return;
          self.applyOptions(); // need to be called before synchronizing the values
          self.syncLowValue();
          if (self.range)
            self.syncHighValue();
          self.resetSlider();
        }, true);

        this.scope.$watch('rzSliderModel', function(newValue, oldValue) {
          if (self.internalChange)
            return;
          if (newValue === oldValue)
            return;
          thrLow();
        });

        this.scope.$watch('rzSliderHigh', function(newValue, oldValue) {
          if (self.internalChange)
            return;
          if (newValue === oldValue)
            return;
          if (newValue != null)
            thrHigh();
          if (self.range && newValue == null || !self.range && newValue != null) {
            self.applyOptions();
            self.resetSlider();
          }
        });

        this.scope.$on('$destroy', function() {
          self.unbindEvents();
          angular.element($window).off('resize', calcDimFn);
          self.currentFocusElement = null;
        });
      },

      findStepIndex: function(modelValue) {
        var index = 0;
        for (var i = 0; i < this.options.stepsArray.length; i++) {
          var step = this.options.stepsArray[i];
          if (step === modelValue) {
            index = i;
            break;
          }
          else if (angular.isDate(step)) {
            if (step.getTime() === modelValue.getTime()) {
              index = i;
              break;
            }
          }
          else if (angular.isObject(step)) {
            if (angular.isDate(step.value) && step.value.getTime() === modelValue.getTime() || step.value === modelValue) {
              index = i;
              break;
            }
          }
        }
        return index;
      },

      syncLowValue: function() {
        if (this.options.stepsArray) {
          if (!this.options.bindIndexForStepsArray)
            this.lowValue = this.findStepIndex(this.scope.rzSliderModel);
          else
            this.lowValue = this.scope.rzSliderModel
        }
        else
          this.lowValue = this.scope.rzSliderModel;
      },

      syncHighValue: function() {
        if (this.options.stepsArray) {
          if (!this.options.bindIndexForStepsArray)
            this.highValue = this.findStepIndex(this.scope.rzSliderHigh);
          else
            this.highValue = this.scope.rzSliderHigh
        }
        else
          this.highValue = this.scope.rzSliderHigh;
      },

      getStepValue: function(sliderValue) {
        var step = this.options.stepsArray[sliderValue];
        if (angular.isDate(step))
          return step;
        if (angular.isObject(step))
          return step.value;
        return step;
      },

      applyLowValue: function() {
        if (this.options.stepsArray) {
          if (!this.options.bindIndexForStepsArray)
            this.scope.rzSliderModel = this.getStepValue(this.lowValue);
          else
            this.scope.rzSliderModel = this.lowValue
        }
        else
          this.scope.rzSliderModel = this.lowValue;
      },

      applyHighValue: function() {
        if (this.options.stepsArray) {
          if (!this.options.bindIndexForStepsArray)
            this.scope.rzSliderHigh = this.getStepValue(this.highValue);
          else
            this.scope.rzSliderHigh = this.highValue
        }
        else
          this.scope.rzSliderHigh = this.highValue;
      },

      /*
       * Reflow the slider when the low handle changes (called with throttle)
       */
      onLowHandleChange: function() {
        this.syncLowValue();
        if (this.range)
          this.syncHighValue();
        this.setMinAndMax();
        this.updateLowHandle(this.valueToPosition(this.lowValue));
        this.updateSelectionBar();
        this.updateTicksScale();
        this.updateAriaAttributes();
        if (this.range) {
          this.updateCmbLabel();
        }
      },

      /*
       * Reflow the slider when the high handle changes (called with throttle)
       */
      onHighHandleChange: function() {
        this.syncLowValue();
        this.syncHighValue();
        this.setMinAndMax();
        this.updateHighHandle(this.valueToPosition(this.highValue));
        this.updateSelectionBar();
        this.updateTicksScale();
        this.updateCmbLabel();
        this.updateAriaAttributes();
      },

      /**
       * Read the user options and apply them to the slider model
       */
      applyOptions: function() {
        var sliderOptions;
        if (this.scope.rzSliderOptions)
          sliderOptions = this.scope.rzSliderOptions();
        else
          sliderOptions = {};

        this.options = RzSliderOptions.getOptions(sliderOptions);

        if (this.options.step <= 0)
          this.options.step = 1;

        this.range = this.scope.rzSliderModel !== undefined && this.scope.rzSliderHigh !== undefined;
        this.options.draggableRange = this.range && this.options.draggableRange;
        this.options.draggableRangeOnly = this.range && this.options.draggableRangeOnly;
        if (this.options.draggableRangeOnly) {
          this.options.draggableRange = true;
        }

        this.options.showTicks = this.options.showTicks || this.options.showTicksValues || !!this.options.ticksArray;
        this.scope.showTicks = this.options.showTicks; //scope is used in the template
        if (angular.isNumber(this.options.showTicks) || this.options.ticksArray)
          this.intermediateTicks = true;

        this.options.showSelectionBar = this.options.showSelectionBar || this.options.showSelectionBarEnd
          || this.options.showSelectionBarFromValue !== null;

        if (this.options.stepsArray) {
          this.parseStepsArray();
        } else {
          if (this.options.translate)
            this.customTrFn = this.options.translate;
          else
            this.customTrFn = function(value) {
              return String(value);
            };

          this.getLegend = this.options.getLegend;
        }

        if (this.options.vertical) {
          this.positionProperty = 'bottom';
          this.dimensionProperty = 'height';
        }

        if (this.options.customTemplateScope)
          this.scope.custom = this.options.customTemplateScope;
      },

      parseStepsArray: function() {
        this.options.floor = 0;
        this.options.ceil = this.options.stepsArray.length - 1;
        this.options.step = 1;

        if (this.options.translate) {
          this.customTrFn = this.options.translate;
        }
        else {
          this.customTrFn = function(modelValue) {
            if (this.options.bindIndexForStepsArray)
              return this.getStepValue(modelValue);
            return modelValue;
          };
        }

        this.getLegend = function(index) {
          var step = this.options.stepsArray[index];
          if (angular.isObject(step))
            return step.legend;
          return null;
        };
      },

      /**
       * Resets slider
       *
       * @returns {undefined}
       */
      resetSlider: function() {
        this.manageElementsStyle();
        this.addAccessibility();
        this.setMinAndMax();
        this.updateCeilLab();
        this.updateFloorLab();
        this.unbindEvents();
        this.manageEventsBindings();
        this.setDisabledState();
        this.calcViewDimensions();
        this.refocusPointerIfNeeded();
      },

      refocusPointerIfNeeded: function() {
        if (this.currentFocusElement) {
          this.onPointerFocus(this.currentFocusElement.pointer, this.currentFocusElement.ref);
          this.focusElement(this.currentFocusElement.pointer)
        }
      },

      /**
       * Set the slider children to variables for easy access
       *
       * Run only once during initialization
       *
       * @returns {undefined}
       */
      initElemHandles: function() {
        // Assign all slider elements to object properties for easy access
        angular.forEach(this.sliderElem.children(), function(elem, index) {
          var jElem = angular.element(elem);

          switch (index) {
            case 0:
              this.fullBar = jElem;
              break;
            case 1:
              this.selBar = jElem;
              break;
            case 2:
              this.minH = jElem;
              break;
            case 3:
              this.maxH = jElem;
              break;
            case 4:
              this.flrLab = jElem;
              break;
            case 5:
              this.ceilLab = jElem;
              break;
            case 6:
              this.minLab = jElem;
              break;
            case 7:
              this.maxLab = jElem;
              break;
            case 8:
              this.cmbLab = jElem;
              break;
            case 9:
              this.ticks = jElem;
              break;
          }

        }, this);

        // Initialize position cache properties
        this.selBar.rzsp = 0;
        this.minH.rzsp = 0;
        this.maxH.rzsp = 0;
        this.flrLab.rzsp = 0;
        this.ceilLab.rzsp = 0;
        this.minLab.rzsp = 0;
        this.maxLab.rzsp = 0;
        this.cmbLab.rzsp = 0;
      },

      /**
       * Update each elements style based on options
       */
      manageElementsStyle: function() {

        if (!this.range)
          this.maxH.css('display', 'none');
        else
          this.maxH.css('display', '');


        this.alwaysHide(this.flrLab, this.options.showTicksValues || this.options.hideLimitLabels);
        this.alwaysHide(this.ceilLab, this.options.showTicksValues || this.options.hideLimitLabels);

        var hideLabelsForTicks = this.options.showTicksValues && !this.intermediateTicks;
        this.alwaysHide(this.minLab, hideLabelsForTicks || this.options.hidePointerLabels);
        this.alwaysHide(this.maxLab, hideLabelsForTicks || !this.range || this.options.hidePointerLabels);
        this.alwaysHide(this.cmbLab, hideLabelsForTicks || !this.range || this.options.hidePointerLabels);
        this.alwaysHide(this.selBar, !this.range && !this.options.showSelectionBar);

        if (this.options.vertical)
          this.sliderElem.addClass('rz-vertical');

        if (this.options.draggableRange)
          this.selBar.addClass('rz-draggable');
        else
          this.selBar.removeClass('rz-draggable');

        if (this.intermediateTicks && this.options.showTicksValues)
          this.ticks.addClass('rz-ticks-values-under');
      },

      alwaysHide: function(el, hide) {
        el.rzAlwaysHide = hide;
        if (hide)
          this.hideEl(el);
        else
          this.showEl(el)
      },

      /**
       * Manage the events bindings based on readOnly and disabled options
       *
       * @returns {undefined}
       */
      manageEventsBindings: function() {
        if (this.options.disabled || this.options.readOnly)
          this.unbindEvents();
        else
          this.bindEvents();
      },

      /**
       * Set the disabled state based on rzSliderDisabled
       *
       * @returns {undefined}
       */
      setDisabledState: function() {
        if (this.options.disabled) {
          this.sliderElem.attr('disabled', 'disabled');
        } else {
          this.sliderElem.attr('disabled', null);
        }
      },

      /**
       * Reset label values
       *
       * @return {undefined}
       */
      resetLabelsValue: function() {
        this.minLab.rzsv = undefined;
        this.maxLab.rzsv = undefined;
      },

      /**
       * Initialize slider handles positions and labels
       *
       * Run only once during initialization and every time view port changes size
       *
       * @returns {undefined}
       */
      initHandles: function() {
        this.updateLowHandle(this.valueToPosition(this.lowValue));

        /*
         the order here is important since the selection bar should be
         updated after the high handle but before the combined label
         */
        if (this.range)
          this.updateHighHandle(this.valueToPosition(this.highValue));
        this.updateSelectionBar();
        if (this.range)
          this.updateCmbLabel();

        this.updateTicksScale();
      },

      /**
       * Translate value to human readable format
       *
       * @param {number|string} value
       * @param {jqLite} label
       * @param {String} which
       * @param {boolean} [useCustomTr]
       * @returns {undefined}
       */
      translateFn: function(value, label, which, useCustomTr) {
        useCustomTr = useCustomTr === undefined ? true : useCustomTr;

        var valStr = '',
          getDimension = false,
          noLabelInjection = label.hasClass('no-label-injection');

        if (useCustomTr) {
          if (this.options.stepsArray && !this.options.bindIndexForStepsArray)
            value = this.getStepValue(value);
          valStr = String(this.customTrFn(value, this.options.id, which));
        }
        else {
          valStr = String(value)
        }

        if (label.rzsv === undefined || label.rzsv.length !== valStr.length || (label.rzsv.length > 0 && label.rzsd === 0)) {
          getDimension = true;
          label.rzsv = valStr;
        }

        if (!noLabelInjection) {
          label.html(valStr);
        }
        ;

        this.scope[which + 'Label'] = valStr;

        // Update width only when length of the label have changed
        if (getDimension) {
          this.getDimension(label);
        }
      },

      /**
       * Set maximum and minimum values for the slider and ensure the model and high
       * value match these limits
       * @returns {undefined}
       */
      setMinAndMax: function() {

        this.step = +this.options.step;
        this.precision = +this.options.precision;

        this.minValue = this.options.floor;
        if (this.options.logScale && this.minValue === 0)
          throw Error("Can't use floor=0 with logarithmic scale");

        if (this.options.enforceStep) {
          this.lowValue = this.roundStep(this.lowValue);
          if (this.range)
            this.highValue = this.roundStep(this.highValue);
        }

        if (this.options.ceil != null)
          this.maxValue = this.options.ceil;
        else
          this.maxValue = this.options.ceil = this.range ? this.highValue : this.lowValue;

        if (this.options.enforceRange) {
          this.lowValue = this.sanitizeValue(this.lowValue);
          if (this.range)
            this.highValue = this.sanitizeValue(this.highValue);
        }

        this.applyLowValue();
        if (this.range)
          this.applyHighValue();

        this.valueRange = this.maxValue - this.minValue;
      },

      /**
       * Adds accessibility attributes
       *
       * Run only once during initialization
       *
       * @returns {undefined}
       */
      addAccessibility: function() {
        this.minH.attr('role', 'slider');
        this.updateAriaAttributes();
        if (this.options.keyboardSupport && !(this.options.readOnly || this.options.disabled))
          this.minH.attr('tabindex', '0');
        else
          this.minH.attr('tabindex', '');
        if (this.options.vertical)
          this.minH.attr('aria-orientation', 'vertical');

        if (this.range) {
          this.maxH.attr('role', 'slider');
          if (this.options.keyboardSupport && !(this.options.readOnly || this.options.disabled))
            this.maxH.attr('tabindex', '0');
          else
            this.maxH.attr('tabindex', '');
          if (this.options.vertical)
            this.maxH.attr('aria-orientation', 'vertical');
        }
      },

      /**
       * Updates aria attributes according to current values
       */
      updateAriaAttributes: function() {
        this.minH.attr({
          'aria-valuenow': this.scope.rzSliderModel,
          'aria-valuetext': this.customTrFn(this.scope.rzSliderModel, this.options.id, 'model'),
          'aria-valuemin': this.minValue,
          'aria-valuemax': this.maxValue
        });
        if (this.range) {
          this.maxH.attr({
            'aria-valuenow': this.scope.rzSliderHigh,
            'aria-valuetext': this.customTrFn(this.scope.rzSliderHigh, this.options.id, 'high'),
            'aria-valuemin': this.minValue,
            'aria-valuemax': this.maxValue
          });
        }
      },

      /**
       * Calculate dimensions that are dependent on view port size
       *
       * Run once during initialization and every time view port changes size.
       *
       * @returns {undefined}
       */
      calcViewDimensions: function() {
        var handleWidth = this.getDimension(this.minH);

        this.handleHalfDim = handleWidth / 2;
        this.barDimension = this.getDimension(this.fullBar);

        this.maxPos = this.barDimension - handleWidth;

        this.getDimension(this.sliderElem);
        this.sliderElem.rzsp = this.sliderElem[0].getBoundingClientRect()[this.positionProperty];

        if (this.initHasRun) {
          this.updateFloorLab();
          this.updateCeilLab();
          this.initHandles();
          var self = this;
          $timeout(function() {
            self.updateTicksScale();
          });
        }
      },

      /**
       * Update the ticks position
       *
       * @returns {undefined}
       */
      updateTicksScale: function() {
        if (!this.options.showTicks) return;

        var ticksArray = this.options.ticksArray || this.getTicksArray(),
          translate = this.options.vertical ? 'translateY' : 'translateX',
          self = this;

        if (this.options.rightToLeft)
          ticksArray.reverse();

        this.scope.ticks = ticksArray.map(function(value) {
          var position = self.valueToPosition(value);

          if (self.options.vertical)
            position = self.maxPos - position;

          var tick = {
            selected: self.isTickSelected(value),
            style: {
              transform: translate + '(' + Math.round(position) + 'px)'
            }
          };
          if (tick.selected && self.options.getSelectionBarColor) {
            tick.style['background-color'] = self.getSelectionBarColor();
          }
          if (!tick.selected && self.options.getTickColor) {
            tick.style['background-color'] = self.getTickColor(value);
          }
          if (self.options.ticksTooltip) {
            tick.tooltip = self.options.ticksTooltip(value);
            tick.tooltipPlacement = self.options.vertical ? 'right' : 'top';
          }
          if (self.options.showTicksValues) {
            tick.value = self.getDisplayValue(value, 'tick-value');
            if (self.options.ticksValuesTooltip) {
              tick.valueTooltip = self.options.ticksValuesTooltip(value);
              tick.valueTooltipPlacement = self.options.vertical ? 'right' : 'top';
            }
          }
          if (self.getLegend) {
            var legend = self.getLegend(value, self.options.id);
            if (legend)
              tick.legend = legend;
          }
          return tick;
        });
      },

      getTicksArray: function() {
        var step = this.step,
          ticksArray = [];
        if (this.intermediateTicks)
          step = this.options.showTicks;
        for (var value = this.minValue; value <= this.maxValue; value += step) {
          ticksArray.push(value);
        }
        return ticksArray;
      },

      isTickSelected: function(value) {
        if (!this.range) {
          if (this.options.showSelectionBarFromValue !== null) {
            var center = this.options.showSelectionBarFromValue;
            if (this.lowValue > center && value >= center && value <= this.lowValue)
              return true;
            else if (this.lowValue < center && value <= center && value >= this.lowValue)
              return true;
          }
          else if (this.options.showSelectionBarEnd) {
            if (value >= this.lowValue)
              return true;
          }
          else if (this.options.showSelectionBar && value <= this.lowValue)
            return true;
        }
        if (this.range && value >= this.lowValue && value <= this.highValue)
          return true;
        return false;
      },

      /**
       * Update position of the floor label
       *
       * @returns {undefined}
       */
      updateFloorLab: function() {
        this.translateFn(this.minValue, this.flrLab, 'floor');
        this.getDimension(this.flrLab);
        var position = this.options.rightToLeft ? this.barDimension - this.flrLab.rzsd : 0;
        this.setPosition(this.flrLab, position);
      },

      /**
       * Update position of the ceiling label
       *
       * @returns {undefined}
       */
      updateCeilLab: function() {
        this.translateFn(this.maxValue, this.ceilLab, 'ceil');
        this.getDimension(this.ceilLab);
        var position = this.options.rightToLeft ? 0 : this.barDimension - this.ceilLab.rzsd;
        this.setPosition(this.ceilLab, position);
      },

      /**
       * Update slider handles and label positions
       *
       * @param {string} which
       * @param {number} newPos
       */
      updateHandles: function(which, newPos) {
        if (which === 'lowValue')
          this.updateLowHandle(newPos);
        else
          this.updateHighHandle(newPos);

        this.updateSelectionBar();
        this.updateTicksScale();
        if (this.range)
          this.updateCmbLabel();
      },

      /**
       * Helper function to work out the position for handle labels depending on RTL or not
       *
       * @param {string} labelName maxLab or minLab
       * @param newPos
       *
       * @returns {number}
       */
      getHandleLabelPos: function(labelName, newPos) {
        var labelRzsd = this[labelName].rzsd,
          nearHandlePos = newPos - labelRzsd / 2 + this.handleHalfDim,
          endOfBarPos = this.barDimension - labelRzsd;

        if (!this.options.boundPointerLabels)
          return nearHandlePos;

        if (this.options.rightToLeft && labelName === 'minLab' || !this.options.rightToLeft && labelName === 'maxLab') {
          return Math.min(nearHandlePos, endOfBarPos);
        } else {
          return Math.min(Math.max(nearHandlePos, 0), endOfBarPos);
        }
      },

      /**
       * Update low slider handle position and label
       *
       * @param {number} newPos
       * @returns {undefined}
       */
      updateLowHandle: function(newPos) {
        this.setPosition(this.minH, newPos);
        this.translateFn(this.lowValue, this.minLab, 'model');
        this.setPosition(this.minLab, this.getHandleLabelPos('minLab', newPos));

        if (this.options.getPointerColor) {
          var pointercolor = this.getPointerColor('min');
          this.scope.minPointerStyle = {
            backgroundColor: pointercolor
          };
        }

        if (this.options.autoHideLimitLabels) {
          this.shFloorCeil();
        }
      },

      /**
       * Update high slider handle position and label
       *
       * @param {number} newPos
       * @returns {undefined}
       */
      updateHighHandle: function(newPos) {
        this.setPosition(this.maxH, newPos);
        this.translateFn(this.highValue, this.maxLab, 'high');
        this.setPosition(this.maxLab, this.getHandleLabelPos('maxLab', newPos));

        if (this.options.getPointerColor) {
          var pointercolor = this.getPointerColor('max');
          this.scope.maxPointerStyle = {
            backgroundColor: pointercolor
          };
        }
        if (this.options.autoHideLimitLabels) {
          this.shFloorCeil();
        }

      },

      /**
       * Show/hide floor/ceiling label
       *
       * @returns {undefined}
       */
      shFloorCeil: function() {
        // Show based only on hideLimitLabels if pointer labels are hidden
        if (this.options.hidePointerLabels) {
          return;
        }
        var flHidden = false,
          clHidden = false,
          isMinLabAtFloor = this.isLabelBelowFloorLab(this.minLab),
          isMinLabAtCeil = this.isLabelAboveCeilLab(this.minLab),
          isMaxLabAtCeil = this.isLabelAboveCeilLab(this.maxLab),
          isCmbLabAtFloor = this.isLabelBelowFloorLab(this.cmbLab),
          isCmbLabAtCeil =  this.isLabelAboveCeilLab(this.cmbLab);

        if (isMinLabAtFloor) {
          flHidden = true;
          this.hideEl(this.flrLab);
        } else {
          flHidden = false;
          this.showEl(this.flrLab);
        }

        if (isMinLabAtCeil) {
          clHidden = true;
          this.hideEl(this.ceilLab);
        } else {
          clHidden = false;
          this.showEl(this.ceilLab);
        }

        if (this.range) {
          var hideCeil = this.cmbLabelShown ? isCmbLabAtCeil : isMaxLabAtCeil;
          var hideFloor = this.cmbLabelShown ? isCmbLabAtFloor : isMinLabAtFloor;

          if (hideCeil) {
            this.hideEl(this.ceilLab);
          } else if (!clHidden) {
            this.showEl(this.ceilLab);
          }

          // Hide or show floor label
          if (hideFloor) {
            this.hideEl(this.flrLab);
          } else if (!flHidden) {
            this.showEl(this.flrLab);
          }
        }
      },

      isLabelBelowFloorLab: function(label) {
        var isRTL = this.options.rightToLeft,
          pos = label.rzsp,
          dim = label.rzsd,
          floorPos = this.flrLab.rzsp,
          floorDim = this.flrLab.rzsd;
        return isRTL ?
        pos + dim >= floorPos - 2 :
        pos <= floorPos + floorDim + 2;
      },

      isLabelAboveCeilLab: function(label) {
        var isRTL = this.options.rightToLeft,
          pos = label.rzsp,
          dim = label.rzsd,
          ceilPos = this.ceilLab.rzsp,
          ceilDim = this.ceilLab.rzsd;
        return isRTL ?
        pos <= ceilPos + ceilDim + 2 :
        pos + dim >= ceilPos - 2;
      },

      /**
       * Update slider selection bar, combined label and range label
       *
       * @returns {undefined}
       */
      updateSelectionBar: function() {
        var position = 0,
          dimension = 0,
          isSelectionBarFromRight = this.options.rightToLeft ? !this.options.showSelectionBarEnd : this.options.showSelectionBarEnd,
          positionForRange = this.options.rightToLeft ? this.maxH.rzsp + this.handleHalfDim : this.minH.rzsp + this.handleHalfDim;

        if (this.range) {
          dimension = Math.abs(this.maxH.rzsp - this.minH.rzsp);
          position = positionForRange;
        }
        else {
          if (this.options.showSelectionBarFromValue !== null) {
            var center = this.options.showSelectionBarFromValue,
              centerPosition = this.valueToPosition(center),
              isModelGreaterThanCenter = this.options.rightToLeft ? this.lowValue <= center : this.lowValue > center;
            if (isModelGreaterThanCenter) {
              dimension = this.minH.rzsp - centerPosition;
              position = centerPosition + this.handleHalfDim;
            }
            else {
              dimension = centerPosition - this.minH.rzsp;
              position = this.minH.rzsp + this.handleHalfDim;
            }
          }
          else if (isSelectionBarFromRight) {
            dimension = Math.abs(this.maxPos - this.minH.rzsp) + this.handleHalfDim;
            position = this.minH.rzsp + this.handleHalfDim;
          } else {
            dimension = Math.abs(this.maxH.rzsp - this.minH.rzsp) + this.handleHalfDim;
            position = 0;
          }
        }
        this.setDimension(this.selBar, dimension);
        this.setPosition(this.selBar, position);
        if (this.options.getSelectionBarColor) {
          var color = this.getSelectionBarColor();
          this.scope.barStyle = {
            backgroundColor: color
          };
        } else if (this.options.selectionBarGradient) {
          var offset = this.options.showSelectionBarFromValue !== null ? this.valueToPosition(this.options.showSelectionBarFromValue) : 0,
            reversed = offset - position > 0 ^ isSelectionBarFromRight,
            direction = this.options.vertical ? (reversed ? 'bottom' : 'top') : (reversed ? 'left' : 'right');
          this.scope.barStyle = {
            backgroundImage: 'linear-gradient(to ' + direction + ', ' + this.options.selectionBarGradient.from + ' 0%,' + this.options.selectionBarGradient.to + ' 100%)'
          };
          if (this.options.vertical) {
            this.scope.barStyle.backgroundPosition = 'center ' + (offset + dimension + position + (reversed ? -this.handleHalfDim : 0)) + 'px';
            this.scope.barStyle.backgroundSize = '100% ' + (this.barDimension - this.handleHalfDim) + 'px';
          } else {
            this.scope.barStyle.backgroundPosition = (offset - position + (reversed ? this.handleHalfDim : 0)) + 'px center';
            this.scope.barStyle.backgroundSize = (this.barDimension - this.handleHalfDim) + 'px 100%';
          }
        }
      },

      /**
       * Wrapper around the getSelectionBarColor of the user to pass to
       * correct parameters
       */
      getSelectionBarColor: function() {
        if (this.range)
          return this.options.getSelectionBarColor(this.scope.rzSliderModel, this.scope.rzSliderHigh);
        return this.options.getSelectionBarColor(this.scope.rzSliderModel);
      },

      /**
       * Wrapper around the getPointerColor of the user to pass to
       * correct parameters
       */
      getPointerColor: function(pointerType) {
        if (pointerType === 'max') {
          return this.options.getPointerColor(this.scope.rzSliderHigh, pointerType);
        }
        return this.options.getPointerColor(this.scope.rzSliderModel, pointerType);
      },

      /**
       * Wrapper around the getTickColor of the user to pass to
       * correct parameters
       */
      getTickColor: function(value) {
        return this.options.getTickColor(value);
      },

      /**
       * Update combined label position and value
       *
       * @returns {undefined}
       */
      updateCmbLabel: function() {
        var isLabelOverlap = null;
        if (this.options.rightToLeft) {
          isLabelOverlap = this.minLab.rzsp - this.minLab.rzsd - 10 <= this.maxLab.rzsp;
        } else {
          isLabelOverlap = this.minLab.rzsp + this.minLab.rzsd + 10 >= this.maxLab.rzsp;
        }

        if (isLabelOverlap) {
          var lowTr = this.getDisplayValue(this.lowValue, 'model'),
            highTr = this.getDisplayValue(this.highValue, 'high'),
            labelVal = '';
          if (this.options.mergeRangeLabelsIfSame && lowTr === highTr) {
            labelVal = lowTr;
          } else {
            labelVal = this.options.rightToLeft ? highTr + ' - ' + lowTr : lowTr + ' - ' + highTr;
          }

          this.translateFn(labelVal, this.cmbLab, 'cmb', false);
          var pos = this.options.boundPointerLabels ? Math.min(
            Math.max(
              this.selBar.rzsp + this.selBar.rzsd / 2 - this.cmbLab.rzsd / 2,
              0
            ),
            this.barDimension - this.cmbLab.rzsd
          ) : this.selBar.rzsp + this.selBar.rzsd / 2 - this.cmbLab.rzsd / 2;

          this.setPosition(this.cmbLab, pos);
          this.cmbLabelShown = true;
          this.hideEl(this.minLab);
          this.hideEl(this.maxLab);
          this.showEl(this.cmbLab);
        } else {
          this.cmbLabelShown = false;
          this.showEl(this.maxLab);
          this.showEl(this.minLab);
          this.hideEl(this.cmbLab);
        }
        if (this.options.autoHideLimitLabels) {
          this.shFloorCeil();
        }
      },

      /**
       * Return the translated value if a translate function is provided else the original value
       * @param value
       * @param which if it's min or max handle
       * @returns {*}
       */
      getDisplayValue: function(value, which) {
        if (this.options.stepsArray && !this.options.bindIndexForStepsArray) {
          value = this.getStepValue(value);
        }
        return this.customTrFn(value, this.options.id, which);
      },

      /**
       * Round value to step and precision based on minValue
       *
       * @param {number} value
       * @param {number} customStep a custom step to override the defined step
       * @returns {number}
       */
      roundStep: function(value, customStep) {
        var step = customStep ? customStep : this.step,
          steppedDifference = parseFloat((value - this.minValue) / step).toPrecision(12);
        steppedDifference = Math.round(+steppedDifference) * step;
        var newValue = (this.minValue + steppedDifference).toFixed(this.precision);
        return +newValue;
      },

      /**
       * Hide element
       *
       * @param element
       * @returns {jqLite} The jqLite wrapped DOM element
       */
      hideEl: function(element) {
        return element.css({
          visibility: 'hidden'
        });
      },

      /**
       * Show element
       *
       * @param element The jqLite wrapped DOM element
       * @returns {jqLite} The jqLite
       */
      showEl: function(element) {
        if (!!element.rzAlwaysHide) {
          return element;
        }

        return element.css({
          visibility: 'visible'
        });
      },

      /**
       * Set element left/top position depending on whether slider is horizontal or vertical
       *
       * @param {jqLite} elem The jqLite wrapped DOM element
       * @param {number} pos
       * @returns {number}
       */
      setPosition: function(elem, pos) {
        elem.rzsp = pos;
        var css = {};
        css[this.positionProperty] = Math.round(pos) + 'px';
        elem.css(css);
        return pos;
      },

      /**
       * Get element width/height depending on whether slider is horizontal or vertical
       *
       * @param {jqLite} elem The jqLite wrapped DOM element
       * @returns {number}
       */
      getDimension: function(elem) {
        var val = elem[0].getBoundingClientRect();
        if (this.options.vertical)
          elem.rzsd = (val.bottom - val.top) * this.options.scale;
        else
          elem.rzsd = (val.right - val.left) * this.options.scale;
        return elem.rzsd;
      },

      /**
       * Set element width/height depending on whether slider is horizontal or vertical
       *
       * @param {jqLite} elem  The jqLite wrapped DOM element
       * @param {number} dim
       * @returns {number}
       */
      setDimension: function(elem, dim) {
        elem.rzsd = dim;
        var css = {};
        css[this.dimensionProperty] = Math.round(dim) + 'px';
        elem.css(css);
        return dim;
      },

      /**
       * Returns a value that is within slider range
       *
       * @param {number} val
       * @returns {number}
       */
      sanitizeValue: function(val) {
        return Math.min(Math.max(val, this.minValue), this.maxValue);
      },

      /**
       * Translate value to pixel position
       *
       * @param {number} val
       * @returns {number}
       */
      valueToPosition: function(val) {
        var fn = this.linearValueToPosition;
        if (this.options.customValueToPosition)
          fn = this.options.customValueToPosition;
        else if (this.options.logScale)
          fn = this.logValueToPosition;

        val = this.sanitizeValue(val);
        var percent = fn(val, this.minValue, this.maxValue) || 0;
        if (this.options.rightToLeft)
          percent = 1 - percent;
        return percent * this.maxPos;
      },

      linearValueToPosition: function(val, minVal, maxVal) {
        var range = maxVal - minVal;
        return (val - minVal) / range;
      },

      logValueToPosition: function(val, minVal, maxVal) {
        val = Math.log(val);
        minVal = Math.log(minVal);
        maxVal = Math.log(maxVal);
        var range = maxVal - minVal;
        return (val - minVal) / range;
      },

      /**
       * Translate position to model value
       *
       * @param {number} position
       * @returns {number}
       */
      positionToValue: function(position) {
        var percent = position / this.maxPos;
        if (this.options.rightToLeft)
          percent = 1 - percent;
        var fn = this.linearPositionToValue;
        if (this.options.customPositionToValue)
          fn = this.options.customPositionToValue;
        else if (this.options.logScale)
          fn = this.logPositionToValue;
        return fn(percent, this.minValue, this.maxValue) || 0;
      },

      linearPositionToValue: function(percent, minVal, maxVal) {
        return percent * (maxVal - minVal) + minVal;
      },

      logPositionToValue: function(percent, minVal, maxVal) {
        minVal = Math.log(minVal);
        maxVal = Math.log(maxVal);
        var value = percent * (maxVal - minVal) + minVal;
        return Math.exp(value);
      },

      // Events
      /**
       * Get the X-coordinate or Y-coordinate of an event
       *
       * @param {Object} event  The event
       * @returns {number}
       */
      getEventXY: function(event) {
        /* http://stackoverflow.com/a/12336075/282882 */
        //noinspection JSLint
        var clientXY = this.options.vertical ? 'clientY' : 'clientX';
        if (event[clientXY] !== undefined) {
          return event[clientXY];
        }

        return event.originalEvent === undefined ?
          event.touches[0][clientXY] : event.originalEvent.touches[0][clientXY];
      },

      /**
       * Compute the event position depending on whether the slider is horizontal or vertical
       * @param event
       * @returns {number}
       */
      getEventPosition: function(event) {
        var sliderPos = this.sliderElem.rzsp,
          eventPos = 0;
        if (this.options.vertical)
          eventPos = -this.getEventXY(event) + sliderPos;
        else
          eventPos = this.getEventXY(event) - sliderPos;
        return eventPos * this.options.scale - this.handleHalfDim; // #346 handleHalfDim is already scaled
      },

      /**
       * Get event names for move and event end
       *
       * @param {Event}    event    The event
       *
       * @return {{moveEvent: string, endEvent: string}}
       */
      getEventNames: function(event) {
        var eventNames = {
          moveEvent: '',
          endEvent: ''
        };

        if (event.touches || (event.originalEvent !== undefined && event.originalEvent.touches)) {
          eventNames.moveEvent = 'touchmove';
          eventNames.endEvent = 'touchend';
        } else {
          eventNames.moveEvent = 'mousemove';
          eventNames.endEvent = 'mouseup';
        }

        return eventNames;
      },

      /**
       * Get the handle closest to an event.
       *
       * @param event {Event} The event
       * @returns {jqLite} The handle closest to the event.
       */
      getNearestHandle: function(event) {
        if (!this.range) {
          return this.minH;
        }
        var position = this.getEventPosition(event),
          distanceMin = Math.abs(position - this.minH.rzsp),
          distanceMax = Math.abs(position - this.maxH.rzsp);
        if (distanceMin < distanceMax)
          return this.minH;
        else if (distanceMin > distanceMax)
          return this.maxH;
        else if (!this.options.rightToLeft)
        //if event is at the same distance from min/max then if it's at left of minH, we return minH else maxH
          return position < this.minH.rzsp ? this.minH : this.maxH;
        else
        //reverse in rtl
          return position > this.minH.rzsp ? this.minH : this.maxH;
      },

      /**
       * Wrapper function to focus an angular element
       *
       * @param el {AngularElement} the element to focus
       */
      focusElement: function(el) {
        var DOM_ELEMENT = 0;
        el[DOM_ELEMENT].focus();
      },

      /**
       * Bind mouse and touch events to slider handles
       *
       * @returns {undefined}
       */
      bindEvents: function() {
        var barTracking, barStart, barMove;

        if (this.options.draggableRange) {
          barTracking = 'rzSliderDrag';
          barStart = this.onDragStart;
          barMove = this.onDragMove;
        } else {
          barTracking = 'lowValue';
          barStart = this.onStart;
          barMove = this.onMove;
        }

        if (!this.options.onlyBindHandles) {
          this.selBar.on('mousedown', angular.bind(this, barStart, null, barTracking));
          this.selBar.on('mousedown', angular.bind(this, barMove, this.selBar));
        }

        if (this.options.draggableRangeOnly) {
          this.minH.on('mousedown', angular.bind(this, barStart, null, barTracking));
          this.maxH.on('mousedown', angular.bind(this, barStart, null, barTracking));
        } else {
          this.minH.on('mousedown', angular.bind(this, this.onStart, this.minH, 'lowValue'));
          if (this.range) {
            this.maxH.on('mousedown', angular.bind(this, this.onStart, this.maxH, 'highValue'));
          }
          if (!this.options.onlyBindHandles) {
            this.fullBar.on('mousedown', angular.bind(this, this.onStart, null, null));
            this.fullBar.on('mousedown', angular.bind(this, this.onMove, this.fullBar));
            this.ticks.on('mousedown', angular.bind(this, this.onStart, null, null));
            this.ticks.on('mousedown', angular.bind(this, this.onTickClick, this.ticks));
          }
        }

        if (!this.options.onlyBindHandles) {
          this.selBar.on('touchstart', angular.bind(this, barStart, null, barTracking));
          this.selBar.on('touchstart', angular.bind(this, barMove, this.selBar));
        }
        if (this.options.draggableRangeOnly) {
          this.minH.on('touchstart', angular.bind(this, barStart, null, barTracking));
          this.maxH.on('touchstart', angular.bind(this, barStart, null, barTracking));
        } else {
          this.minH.on('touchstart', angular.bind(this, this.onStart, this.minH, 'lowValue'));
          if (this.range) {
            this.maxH.on('touchstart', angular.bind(this, this.onStart, this.maxH, 'highValue'));
          }
          if (!this.options.onlyBindHandles) {
            this.fullBar.on('touchstart', angular.bind(this, this.onStart, null, null));
            this.fullBar.on('touchstart', angular.bind(this, this.onMove, this.fullBar));
            this.ticks.on('touchstart', angular.bind(this, this.onStart, null, null));
            this.ticks.on('touchstart', angular.bind(this, this.onTickClick, this.ticks));
          }
        }

        if (this.options.keyboardSupport) {
          this.minH.on('focus', angular.bind(this, this.onPointerFocus, this.minH, 'lowValue'));
          if (this.range) {
            this.maxH.on('focus', angular.bind(this, this.onPointerFocus, this.maxH, 'highValue'));
          }
        }
      },

      /**
       * Unbind mouse and touch events to slider handles
       *
       * @returns {undefined}
       */
      unbindEvents: function() {
        this.minH.off();
        this.maxH.off();
        this.fullBar.off();
        this.selBar.off();
        this.ticks.off();
      },

      /**
       * onStart event handler
       *
       * @param {?Object} pointer The jqLite wrapped DOM element; if null, the closest handle is used
       * @param {?string} ref     The name of the handle being changed; if null, the closest handle's value is modified
       * @param {Event}   event   The event
       * @returns {undefined}
       */
      onStart: function(pointer, ref, event) {
        var ehMove, ehEnd,
          eventNames = this.getEventNames(event);

        event.stopPropagation();
        event.preventDefault();

        // We have to do this in case the HTML where the sliders are on
        // have been animated into view.
        this.calcViewDimensions();

        if (pointer) {
          this.tracking = ref;
        } else {
          pointer = this.getNearestHandle(event);
          this.tracking = pointer === this.minH ? 'lowValue' : 'highValue';
        }

        pointer.addClass('rz-active');

        if (this.options.keyboardSupport)
          this.focusElement(pointer);

        ehMove = angular.bind(this, this.dragging.active ? this.onDragMove : this.onMove, pointer);
        ehEnd = angular.bind(this, this.onEnd, ehMove);

        $document.on(eventNames.moveEvent, ehMove);
        $document.one(eventNames.endEvent, ehEnd);
        this.callOnStart();
      },

      /**
       * onMove event handler
       *
       * @param {jqLite} pointer
       * @param {Event}  event The event
       * @param {boolean}  fromTick if the event occured on a tick or not
       * @returns {undefined}
       */
      onMove: function(pointer, event, fromTick) {
        var newPos = this.getEventPosition(event),
          newValue,
          ceilValue = this.options.rightToLeft ? this.minValue : this.maxValue,
          flrValue = this.options.rightToLeft ? this.maxValue : this.minValue;

        if (newPos <= 0) {
          newValue = flrValue;
        } else if (newPos >= this.maxPos) {
          newValue = ceilValue;
        } else {
          newValue = this.positionToValue(newPos);
          if (fromTick && angular.isNumber(this.options.showTicks))
            newValue = this.roundStep(newValue, this.options.showTicks);
          else
            newValue = this.roundStep(newValue);
        }
        this.positionTrackingHandle(newValue);
      },

      /**
       * onEnd event handler
       *
       * @param {Event}    event    The event
       * @param {Function} ehMove   The the bound move event handler
       * @returns {undefined}
       */
      onEnd: function(ehMove, event) {
        var moveEventName = this.getEventNames(event).moveEvent;

        if (!this.options.keyboardSupport) {
          this.minH.removeClass('rz-active');
          this.maxH.removeClass('rz-active');
          this.tracking = '';
        }
        this.dragging.active = false;

        $document.off(moveEventName, ehMove);
        this.callOnEnd();
      },

      onTickClick: function(pointer, event) {
        this.onMove(pointer, event, true);
      },

      onPointerFocus: function(pointer, ref) {
        this.tracking = ref;
        pointer.one('blur', angular.bind(this, this.onPointerBlur, pointer));
        pointer.on('keydown', angular.bind(this, this.onKeyboardEvent));
        pointer.on('keyup', angular.bind(this, this.onKeyUp));
        this.firstKeyDown = true;
        pointer.addClass('rz-active');

        this.currentFocusElement = {
          pointer: pointer,
          ref: ref
        };
      },

      onKeyUp: function() {
        this.firstKeyDown = true;
        this.callOnEnd();
      },

      onPointerBlur: function(pointer) {
        pointer.off('keydown');
        pointer.off('keyup');
        this.tracking = '';
        pointer.removeClass('rz-active');
        this.currentFocusElement = null
      },

      /**
       * Key actions helper function
       *
       * @param {number} currentValue value of the slider
       *
       * @returns {?Object} action value mappings
       */
      getKeyActions: function(currentValue) {
        var increaseStep = currentValue + this.step,
          decreaseStep = currentValue - this.step,
          increasePage = currentValue + this.valueRange / 10,
          decreasePage = currentValue - this.valueRange / 10;

        //Left to right default actions
        var actions = {
          'UP': increaseStep,
          'DOWN': decreaseStep,
          'LEFT': decreaseStep,
          'RIGHT': increaseStep,
          'PAGEUP': increasePage,
          'PAGEDOWN': decreasePage,
          'HOME': this.minValue,
          'END': this.maxValue
        };
        //right to left means swapping right and left arrows
        if (this.options.rightToLeft) {
          actions.LEFT = increaseStep;
          actions.RIGHT = decreaseStep;
          // right to left and vertical means we also swap up and down
          if (this.options.vertical) {
            actions.UP = decreaseStep;
            actions.DOWN = increaseStep;
          }
        }
        return actions;
      },

      onKeyboardEvent: function(event) {
        var currentValue = this[this.tracking],
          keyCode = event.keyCode || event.which,
          keys = {
            38: 'UP',
            40: 'DOWN',
            37: 'LEFT',
            39: 'RIGHT',
            33: 'PAGEUP',
            34: 'PAGEDOWN',
            36: 'HOME',
            35: 'END'
          },
          actions = this.getKeyActions(currentValue),
          key = keys[keyCode],
          action = actions[key];
        if (action == null || this.tracking === '') return;
        event.preventDefault();

        if (this.firstKeyDown) {
          this.firstKeyDown = false;
          this.callOnStart();
        }

        var self = this;
        $timeout(function() {
          var newValue = self.roundStep(self.sanitizeValue(action));
          if (!self.options.draggableRangeOnly) {
            self.positionTrackingHandle(newValue);
          }
          else {
            var difference = self.highValue - self.lowValue,
              newMinValue, newMaxValue;
            if (self.tracking === 'lowValue') {
              newMinValue = newValue;
              newMaxValue = newValue + difference;
              if (newMaxValue > self.maxValue) {
                newMaxValue = self.maxValue;
                newMinValue = newMaxValue - difference;
              }
            } else {
              newMaxValue = newValue;
              newMinValue = newValue - difference;
              if (newMinValue < self.minValue) {
                newMinValue = self.minValue;
                newMaxValue = newMinValue + difference;
              }
            }
            self.positionTrackingBar(newMinValue, newMaxValue);
          }
        });
      },

      /**
       * onDragStart event handler
       *
       * Handles dragging of the middle bar.
       *
       * @param {Object} pointer The jqLite wrapped DOM element
       * @param {string} ref     One of the refLow, refHigh values
       * @param {Event}  event   The event
       * @returns {undefined}
       */
      onDragStart: function(pointer, ref, event) {
        var position = this.getEventPosition(event);
        this.dragging = {
          active: true,
          value: this.positionToValue(position),
          difference: this.highValue - this.lowValue,
          lowLimit: this.options.rightToLeft ? this.minH.rzsp - position : position - this.minH.rzsp,
          highLimit: this.options.rightToLeft ? position - this.maxH.rzsp : this.maxH.rzsp - position
        };

        this.onStart(pointer, ref, event);
      },

      /**
       * getValue helper function
       *
       * gets max or min value depending on whether the newPos is outOfBounds above or below the bar and rightToLeft
       *
       * @param {string} type 'max' || 'min' The value we are calculating
       * @param {number} newPos  The new position
       * @param {boolean} outOfBounds Is the new position above or below the max/min?
       * @param {boolean} isAbove Is the new position above the bar if out of bounds?
       *
       * @returns {number}
       */
      getValue: function(type, newPos, outOfBounds, isAbove) {
        var isRTL = this.options.rightToLeft,
          value = null;

        if (type === 'min') {
          if (outOfBounds) {
            if (isAbove) {
              value = isRTL ? this.minValue : this.maxValue - this.dragging.difference;
            } else {
              value = isRTL ? this.maxValue - this.dragging.difference : this.minValue;
            }
          } else {
            value = isRTL ? this.positionToValue(newPos + this.dragging.lowLimit) : this.positionToValue(newPos - this.dragging.lowLimit)
          }
        } else {
          if (outOfBounds) {
            if (isAbove) {
              value = isRTL ? this.minValue + this.dragging.difference : this.maxValue;
            } else {
              value = isRTL ? this.maxValue : this.minValue + this.dragging.difference;
            }
          } else {
            if (isRTL) {
              value = this.positionToValue(newPos + this.dragging.lowLimit) + this.dragging.difference
            } else {
              value = this.positionToValue(newPos - this.dragging.lowLimit) + this.dragging.difference;
            }
          }
        }
        return this.roundStep(value);
      },

      /**
       * onDragMove event handler
       *
       * Handles dragging of the middle bar.
       *
       * @param {jqLite} pointer
       * @param {Event}  event The event
       * @returns {undefined}
       */
      onDragMove: function(pointer, event) {
        var newPos = this.getEventPosition(event),
          newMinValue, newMaxValue,
          ceilLimit, flrLimit,
          isUnderFlrLimit, isOverCeilLimit,
          flrH, ceilH;

        if (this.options.rightToLeft) {
          ceilLimit = this.dragging.lowLimit;
          flrLimit = this.dragging.highLimit;
          flrH = this.maxH;
          ceilH = this.minH;
        } else {
          ceilLimit = this.dragging.highLimit;
          flrLimit = this.dragging.lowLimit;
          flrH = this.minH;
          ceilH = this.maxH;
        }
        isUnderFlrLimit = newPos <= flrLimit;
        isOverCeilLimit = newPos >= this.maxPos - ceilLimit;

        if (isUnderFlrLimit) {
          if (flrH.rzsp === 0)
            return;
          newMinValue = this.getValue('min', newPos, true, false);
          newMaxValue = this.getValue('max', newPos, true, false);
        } else if (isOverCeilLimit) {
          if (ceilH.rzsp === this.maxPos)
            return;
          newMaxValue = this.getValue('max', newPos, true, true);
          newMinValue = this.getValue('min', newPos, true, true);
        } else {
          newMinValue = this.getValue('min', newPos, false);
          newMaxValue = this.getValue('max', newPos, false);
        }
        this.positionTrackingBar(newMinValue, newMaxValue);
      },

      /**
       * Set the new value and position for the entire bar
       *
       * @param {number} newMinValue   the new minimum value
       * @param {number} newMaxValue   the new maximum value
       */
      positionTrackingBar: function(newMinValue, newMaxValue) {

        if (this.options.minLimit != null && newMinValue < this.options.minLimit) {
          newMinValue = this.options.minLimit;
          newMaxValue = newMinValue + this.dragging.difference;
        }
        if (this.options.maxLimit != null && newMaxValue > this.options.maxLimit) {
          newMaxValue = this.options.maxLimit;
          newMinValue = newMaxValue - this.dragging.difference;
        }

        this.lowValue = newMinValue;
        this.highValue = newMaxValue;
        this.applyLowValue();
        if (this.range)
          this.applyHighValue();
        this.applyModel(true);
        this.updateHandles('lowValue', this.valueToPosition(newMinValue));
        this.updateHandles('highValue', this.valueToPosition(newMaxValue));
      },

      /**
       * Set the new value and position to the current tracking handle
       *
       * @param {number} newValue new model value
       */
      positionTrackingHandle: function(newValue) {
        var valueChanged = false;
        newValue = this.applyMinMaxLimit(newValue);
        if (this.range) {
          if (this.options.pushRange) {
            newValue = this.applyPushRange(newValue);
            valueChanged = true;
          }
          else {
            if (this.options.noSwitching) {
              if (this.tracking === 'lowValue' && newValue > this.highValue)
                newValue = this.applyMinMaxRange(this.highValue);
              else if (this.tracking === 'highValue' && newValue < this.lowValue)
                newValue = this.applyMinMaxRange(this.lowValue);
            }
            newValue = this.applyMinMaxRange(newValue);
            /* This is to check if we need to switch the min and max handles */
            if (this.tracking === 'lowValue' && newValue > this.highValue) {
              this.lowValue = this.highValue;
              this.applyLowValue();
              this.applyModel();
              this.updateHandles(this.tracking, this.maxH.rzsp);
              this.updateAriaAttributes();
              this.tracking = 'highValue';
              this.minH.removeClass('rz-active');
              this.maxH.addClass('rz-active');
              if (this.options.keyboardSupport)
                this.focusElement(this.maxH);
              valueChanged = true;
            }
            else if (this.tracking === 'highValue' && newValue < this.lowValue) {
              this.highValue = this.lowValue;
              this.applyHighValue();
              this.applyModel();
              this.updateHandles(this.tracking, this.minH.rzsp);
              this.updateAriaAttributes();
              this.tracking = 'lowValue';
              this.maxH.removeClass('rz-active');
              this.minH.addClass('rz-active');
              if (this.options.keyboardSupport)
                this.focusElement(this.minH);
              valueChanged = true;
            }
          }
        }

        if (this[this.tracking] !== newValue) {
          this[this.tracking] = newValue;
          if (this.tracking === 'lowValue')
            this.applyLowValue();
          else
            this.applyHighValue();
          this.applyModel();
          this.updateHandles(this.tracking, this.valueToPosition(newValue));
          this.updateAriaAttributes();
          valueChanged = true;
        }

        if (valueChanged)
          this.applyModel(true);
      },

      applyMinMaxLimit: function(newValue) {
        if (this.options.minLimit != null && newValue < this.options.minLimit)
          return this.options.minLimit;
        if (this.options.maxLimit != null && newValue > this.options.maxLimit)
          return this.options.maxLimit;
        return newValue;
      },

      applyMinMaxRange: function(newValue) {
        var oppositeValue = this.tracking === 'lowValue' ? this.highValue : this.lowValue,
          difference = Math.abs(newValue - oppositeValue);
        if (this.options.minRange != null) {
          if (difference < this.options.minRange) {
            if (this.tracking === 'lowValue')
              return this.highValue - this.options.minRange;
            else
              return this.lowValue + this.options.minRange;
          }
        }
        if (this.options.maxRange != null) {
          if (difference > this.options.maxRange) {
            if (this.tracking === 'lowValue')
              return this.highValue - this.options.maxRange;
            else
              return this.lowValue + this.options.maxRange;
          }
        }
        return newValue;
      },

      applyPushRange: function(newValue) {
        var difference = this.tracking === 'lowValue' ? this.highValue - newValue : newValue - this.lowValue,
          minRange = this.options.minRange !== null ? this.options.minRange : this.options.step,
          maxRange = this.options.maxRange;
        // if smaller than minRange
        if (difference < minRange) {
          if (this.tracking === 'lowValue') {
            this.highValue = Math.min(newValue + minRange, this.maxValue);
            newValue = this.highValue - minRange;
            this.applyHighValue();
            this.updateHandles('highValue', this.valueToPosition(this.highValue));
          }
          else {
            this.lowValue = Math.max(newValue - minRange, this.minValue);
            newValue = this.lowValue + minRange;
            this.applyLowValue();
            this.updateHandles('lowValue', this.valueToPosition(this.lowValue));
          }
          this.updateAriaAttributes();
        }
        // if greater than maxRange
        else if (maxRange !== null && difference > maxRange) {
          if (this.tracking === 'lowValue') {
            this.highValue = newValue + maxRange;
            this.applyHighValue();
            this.updateHandles('highValue', this.valueToPosition(this.highValue));
          }
          else {
            this.lowValue = newValue - maxRange;
            this.applyLowValue();
            this.updateHandles('lowValue', this.valueToPosition(this.lowValue));
          }
          this.updateAriaAttributes();
        }
        return newValue;
      },

      /**
       * Apply the model values using scope.$apply.
       * We wrap it with the internalChange flag to avoid the watchers to be called
       */
      applyModel: function(callOnChange) {
        this.internalChange = true;
        this.scope.$apply();
        callOnChange && this.callOnChange();
        this.internalChange = false;
      },

      /**
       * Call the onStart callback if defined
       * The callback call is wrapped in a $evalAsync to ensure that its result will be applied to the scope.
       *
       * @returns {undefined}
       */
      callOnStart: function() {
        if (this.options.onStart) {
          var self = this,
            pointerType = this.tracking === 'lowValue' ? 'min' : 'max';
          this.scope.$evalAsync(function() {
            self.options.onStart(self.options.id, self.scope.rzSliderModel, self.scope.rzSliderHigh, pointerType);
          });
        }
      },

      /**
       * Call the onChange callback if defined
       * The callback call is wrapped in a $evalAsync to ensure that its result will be applied to the scope.
       *
       * @returns {undefined}
       */
      callOnChange: function() {
        if (this.options.onChange) {
          var self = this,
            pointerType = this.tracking === 'lowValue' ? 'min' : 'max';
          this.scope.$evalAsync(function() {
            self.options.onChange(self.options.id, self.scope.rzSliderModel, self.scope.rzSliderHigh, pointerType);
          });
        }
      },

      /**
       * Call the onEnd callback if defined
       * The callback call is wrapped in a $evalAsync to ensure that its result will be applied to the scope.
       *
       * @returns {undefined}
       */
      callOnEnd: function() {
        if (this.options.onEnd) {
          var self = this,
            pointerType = this.tracking === 'lowValue' ? 'min' : 'max';
          this.scope.$evalAsync(function() {
            self.options.onEnd(self.options.id, self.scope.rzSliderModel, self.scope.rzSliderHigh, pointerType);
          });
        }
        this.scope.$emit('slideEnded');
      }
    };

    return Slider;
  }])

  .directive('rzslider', ['RzSlider', function(RzSlider) {
    'use strict';

    return {
      restrict: 'AE',
      replace: true,
      scope: {
        rzSliderModel: '=?',
        rzSliderHigh: '=?',
        rzSliderOptions: '&?',
        rzSliderTplUrl: '@'
      },

      /**
       * Return template URL
       *
       * @param {jqLite} elem
       * @param {Object} attrs
       * @return {string}
       */
      templateUrl: function(elem, attrs) {
        //noinspection JSUnresolvedVariable
        return attrs.rzSliderTplUrl || 'rzSliderTpl.html';
      },

      link: function(scope, elem) {
        scope.slider = new RzSlider(scope, elem); //attach on scope so we can test it
      }
    };
  }]);

  // IDE assist

  /**
   * @name ngScope
   *
   * @property {number} rzSliderModel
   * @property {number} rzSliderHigh
   * @property {Object} rzSliderOptions
   */

  /**
   * @name jqLite
   *
   * @property {number|undefined} rzsp rzslider label position position
   * @property {number|undefined} rzsd rzslider element dimension
   * @property {string|undefined} rzsv rzslider label value/text
   * @property {Function} css
   * @property {Function} text
   */

  /**
   * @name Event
   * @property {Array} touches
   * @property {Event} originalEvent
   */

  /**
   * @name ThrottleOptions
   *
   * @property {boolean} leading
   * @property {boolean} trailing
   */

  module.run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('rzSliderTpl.html',
    "<div class=rzslider><span class=rz-bar-wrapper><span class=rz-bar></span></span> <span class=rz-bar-wrapper><span class=\"rz-bar rz-selection\" ng-style=barStyle></span></span> <span class=\"rz-pointer rz-pointer-min\" ng-style=minPointerStyle></span> <span class=\"rz-pointer rz-pointer-max\" ng-style=maxPointerStyle></span> <span class=\"rz-bubble rz-limit rz-floor\"></span> <span class=\"rz-bubble rz-limit rz-ceil\"></span> <span class=rz-bubble></span> <span class=rz-bubble></span> <span class=rz-bubble></span><ul ng-show=showTicks class=rz-ticks><li ng-repeat=\"t in ticks track by $index\" class=rz-tick ng-class=\"{'rz-selected': t.selected}\" ng-style=t.style ng-attr-uib-tooltip=\"{{ t.tooltip }}\" ng-attr-tooltip-placement={{t.tooltipPlacement}} ng-attr-tooltip-append-to-body=\"{{ t.tooltip ? true : undefined}}\"><span ng-if=\"t.value != null\" class=rz-tick-value ng-attr-uib-tooltip=\"{{ t.valueTooltip }}\" ng-attr-tooltip-placement={{t.valueTooltipPlacement}}>{{ t.value }}</span> <span ng-if=\"t.legend != null\" class=rz-tick-legend>{{ t.legend }}</span></li></ul></div>"
  );

}]);

  return module.name
}));

/*! Hammer.JS - v1.0.5 - 2013-04-07
 * http://eightmedia.github.com/hammer.js
 *
 * Copyright (c) 2013 Jorik Tangelder <j.tangelder@gmail.com>;
 * Licensed under the MIT license */

(function(t,e){"use strict";function n(){if(!i.READY){i.event.determineEventTypes();for(var t in i.gestures)i.gestures.hasOwnProperty(t)&&i.detection.register(i.gestures[t]);i.event.onTouch(i.DOCUMENT,i.EVENT_MOVE,i.detection.detect),i.event.onTouch(i.DOCUMENT,i.EVENT_END,i.detection.detect),i.READY=!0}}var i=function(t,e){return new i.Instance(t,e||{})};i.defaults={stop_browser_behavior:{userSelect:"none",touchAction:"none",touchCallout:"none",contentZooming:"none",userDrag:"none",tapHighlightColor:"rgba(0,0,0,0)"}},i.HAS_POINTEREVENTS=navigator.pointerEnabled||navigator.msPointerEnabled,i.HAS_TOUCHEVENTS="ontouchstart"in t,i.MOBILE_REGEX=/mobile|tablet|ip(ad|hone|od)|android/i,i.NO_MOUSEEVENTS=i.HAS_TOUCHEVENTS&&navigator.userAgent.match(i.MOBILE_REGEX),i.EVENT_TYPES={},i.DIRECTION_DOWN="down",i.DIRECTION_LEFT="left",i.DIRECTION_UP="up",i.DIRECTION_RIGHT="right",i.POINTER_MOUSE="mouse",i.POINTER_TOUCH="touch",i.POINTER_PEN="pen",i.EVENT_START="start",i.EVENT_MOVE="move",i.EVENT_END="end",i.DOCUMENT=document,i.plugins={},i.READY=!1,i.Instance=function(t,e){var r=this;return n(),this.element=t,this.enabled=!0,this.options=i.utils.extend(i.utils.extend({},i.defaults),e||{}),this.options.stop_browser_behavior&&i.utils.stopDefaultBrowserBehavior(this.element,this.options.stop_browser_behavior),i.event.onTouch(t,i.EVENT_START,function(t){r.enabled&&i.detection.startDetect(r,t)}),this},i.Instance.prototype={on:function(t,e){for(var n=t.split(" "),i=0;n.length>i;i++)this.element.addEventListener(n[i],e,!1);return this},off:function(t,e){for(var n=t.split(" "),i=0;n.length>i;i++)this.element.removeEventListener(n[i],e,!1);return this},trigger:function(t,e){var n=i.DOCUMENT.createEvent("Event");n.initEvent(t,!0,!0),n.gesture=e;var r=this.element;return i.utils.hasParent(e.target,r)&&(r=e.target),r.dispatchEvent(n),this},enable:function(t){return this.enabled=t,this}};var r=null,o=!1,s=!1;i.event={bindDom:function(t,e,n){for(var i=e.split(" "),r=0;i.length>r;r++)t.addEventListener(i[r],n,!1)},onTouch:function(t,e,n){var a=this;this.bindDom(t,i.EVENT_TYPES[e],function(c){var u=c.type.toLowerCase();if(!u.match(/mouse/)||!s){(u.match(/touch/)||u.match(/pointerdown/)||u.match(/mouse/)&&1===c.which)&&(o=!0),u.match(/touch|pointer/)&&(s=!0);var h=0;o&&(i.HAS_POINTEREVENTS&&e!=i.EVENT_END?h=i.PointerEvent.updatePointer(e,c):u.match(/touch/)?h=c.touches.length:s||(h=u.match(/up/)?0:1),h>0&&e==i.EVENT_END?e=i.EVENT_MOVE:h||(e=i.EVENT_END),h||null===r?r=c:c=r,n.call(i.detection,a.collectEventData(t,e,c)),i.HAS_POINTEREVENTS&&e==i.EVENT_END&&(h=i.PointerEvent.updatePointer(e,c))),h||(r=null,o=!1,s=!1,i.PointerEvent.reset())}})},determineEventTypes:function(){var t;t=i.HAS_POINTEREVENTS?i.PointerEvent.getEvents():i.NO_MOUSEEVENTS?["touchstart","touchmove","touchend touchcancel"]:["touchstart mousedown","touchmove mousemove","touchend touchcancel mouseup"],i.EVENT_TYPES[i.EVENT_START]=t[0],i.EVENT_TYPES[i.EVENT_MOVE]=t[1],i.EVENT_TYPES[i.EVENT_END]=t[2]},getTouchList:function(t){return i.HAS_POINTEREVENTS?i.PointerEvent.getTouchList():t.touches?t.touches:[{identifier:1,pageX:t.pageX,pageY:t.pageY,target:t.target}]},collectEventData:function(t,e,n){var r=this.getTouchList(n,e),o=i.POINTER_TOUCH;return(n.type.match(/mouse/)||i.PointerEvent.matchType(i.POINTER_MOUSE,n))&&(o=i.POINTER_MOUSE),{center:i.utils.getCenter(r),timeStamp:(new Date).getTime(),target:n.target,touches:r,eventType:e,pointerType:o,srcEvent:n,preventDefault:function(){this.srcEvent.preventManipulation&&this.srcEvent.preventManipulation(),this.srcEvent.preventDefault&&this.srcEvent.preventDefault()},stopPropagation:function(){this.srcEvent.stopPropagation()},stopDetect:function(){return i.detection.stopDetect()}}}},i.PointerEvent={pointers:{},getTouchList:function(){var t=this,e=[];return Object.keys(t.pointers).sort().forEach(function(n){e.push(t.pointers[n])}),e},updatePointer:function(t,e){return t==i.EVENT_END?this.pointers={}:(e.identifier=e.pointerId,this.pointers[e.pointerId]=e),Object.keys(this.pointers).length},matchType:function(t,e){if(!e.pointerType)return!1;var n={};return n[i.POINTER_MOUSE]=e.pointerType==e.MSPOINTER_TYPE_MOUSE||e.pointerType==i.POINTER_MOUSE,n[i.POINTER_TOUCH]=e.pointerType==e.MSPOINTER_TYPE_TOUCH||e.pointerType==i.POINTER_TOUCH,n[i.POINTER_PEN]=e.pointerType==e.MSPOINTER_TYPE_PEN||e.pointerType==i.POINTER_PEN,n[t]},getEvents:function(){return["pointerdown MSPointerDown","pointermove MSPointerMove","pointerup pointercancel MSPointerUp MSPointerCancel"]},reset:function(){this.pointers={}}},i.utils={extend:function(t,n,i){for(var r in n)t[r]!==e&&i||(t[r]=n[r]);return t},hasParent:function(t,e){for(;t;){if(t==e)return!0;t=t.parentNode}return!1},getCenter:function(t){for(var e=[],n=[],i=0,r=t.length;r>i;i++)e.push(t[i].pageX),n.push(t[i].pageY);return{pageX:(Math.min.apply(Math,e)+Math.max.apply(Math,e))/2,pageY:(Math.min.apply(Math,n)+Math.max.apply(Math,n))/2}},getVelocity:function(t,e,n){return{x:Math.abs(e/t)||0,y:Math.abs(n/t)||0}},getAngle:function(t,e){var n=e.pageY-t.pageY,i=e.pageX-t.pageX;return 180*Math.atan2(n,i)/Math.PI},getDirection:function(t,e){var n=Math.abs(t.pageX-e.pageX),r=Math.abs(t.pageY-e.pageY);return n>=r?t.pageX-e.pageX>0?i.DIRECTION_LEFT:i.DIRECTION_RIGHT:t.pageY-e.pageY>0?i.DIRECTION_UP:i.DIRECTION_DOWN},getDistance:function(t,e){var n=e.pageX-t.pageX,i=e.pageY-t.pageY;return Math.sqrt(n*n+i*i)},getScale:function(t,e){return t.length>=2&&e.length>=2?this.getDistance(e[0],e[1])/this.getDistance(t[0],t[1]):1},getRotation:function(t,e){return t.length>=2&&e.length>=2?this.getAngle(e[1],e[0])-this.getAngle(t[1],t[0]):0},isVertical:function(t){return t==i.DIRECTION_UP||t==i.DIRECTION_DOWN},stopDefaultBrowserBehavior:function(t,e){var n,i=["webkit","khtml","moz","ms","o",""];if(e&&t.style){for(var r=0;i.length>r;r++)for(var o in e)e.hasOwnProperty(o)&&(n=o,i[r]&&(n=i[r]+n.substring(0,1).toUpperCase()+n.substring(1)),t.style[n]=e[o]);"none"==e.userSelect&&(t.onselectstart=function(){return!1})}}},i.detection={gestures:[],current:null,previous:null,stopped:!1,startDetect:function(t,e){this.current||(this.stopped=!1,this.current={inst:t,startEvent:i.utils.extend({},e),lastEvent:!1,name:""},this.detect(e))},detect:function(t){if(this.current&&!this.stopped){t=this.extendEventData(t);for(var e=this.current.inst.options,n=0,r=this.gestures.length;r>n;n++){var o=this.gestures[n];if(!this.stopped&&e[o.name]!==!1&&o.handler.call(o,t,this.current.inst)===!1){this.stopDetect();break}}return this.current&&(this.current.lastEvent=t),t.eventType==i.EVENT_END&&!t.touches.length-1&&this.stopDetect(),t}},stopDetect:function(){this.previous=i.utils.extend({},this.current),this.current=null,this.stopped=!0},extendEventData:function(t){var e=this.current.startEvent;if(e&&(t.touches.length!=e.touches.length||t.touches===e.touches)){e.touches=[];for(var n=0,r=t.touches.length;r>n;n++)e.touches.push(i.utils.extend({},t.touches[n]))}var o=t.timeStamp-e.timeStamp,s=t.center.pageX-e.center.pageX,a=t.center.pageY-e.center.pageY,c=i.utils.getVelocity(o,s,a);return i.utils.extend(t,{deltaTime:o,deltaX:s,deltaY:a,velocityX:c.x,velocityY:c.y,distance:i.utils.getDistance(e.center,t.center),angle:i.utils.getAngle(e.center,t.center),direction:i.utils.getDirection(e.center,t.center),scale:i.utils.getScale(e.touches,t.touches),rotation:i.utils.getRotation(e.touches,t.touches),startEvent:e}),t},register:function(t){var n=t.defaults||{};return n[t.name]===e&&(n[t.name]=!0),i.utils.extend(i.defaults,n,!0),t.index=t.index||1e3,this.gestures.push(t),this.gestures.sort(function(t,e){return t.index<e.index?-1:t.index>e.index?1:0}),this.gestures}},i.gestures=i.gestures||{},i.gestures.Hold={name:"hold",index:10,defaults:{hold_timeout:500,hold_threshold:1},timer:null,handler:function(t,e){switch(t.eventType){case i.EVENT_START:clearTimeout(this.timer),i.detection.current.name=this.name,this.timer=setTimeout(function(){"hold"==i.detection.current.name&&e.trigger("hold",t)},e.options.hold_timeout);break;case i.EVENT_MOVE:t.distance>e.options.hold_threshold&&clearTimeout(this.timer);break;case i.EVENT_END:clearTimeout(this.timer)}}},i.gestures.Tap={name:"tap",index:100,defaults:{tap_max_touchtime:250,tap_max_distance:10,tap_always:!0,doubletap_distance:20,doubletap_interval:300},handler:function(t,e){if(t.eventType==i.EVENT_END){var n=i.detection.previous,r=!1;if(t.deltaTime>e.options.tap_max_touchtime||t.distance>e.options.tap_max_distance)return;n&&"tap"==n.name&&t.timeStamp-n.lastEvent.timeStamp<e.options.doubletap_interval&&t.distance<e.options.doubletap_distance&&(e.trigger("doubletap",t),r=!0),(!r||e.options.tap_always)&&(i.detection.current.name="tap",e.trigger(i.detection.current.name,t))}}},i.gestures.Swipe={name:"swipe",index:40,defaults:{swipe_max_touches:1,swipe_velocity:.7},handler:function(t,e){if(t.eventType==i.EVENT_END){if(e.options.swipe_max_touches>0&&t.touches.length>e.options.swipe_max_touches)return;(t.velocityX>e.options.swipe_velocity||t.velocityY>e.options.swipe_velocity)&&(e.trigger(this.name,t),e.trigger(this.name+t.direction,t))}}},i.gestures.Drag={name:"drag",index:50,defaults:{drag_min_distance:10,drag_max_touches:1,drag_block_horizontal:!1,drag_block_vertical:!1,drag_lock_to_axis:!1,drag_lock_min_distance:25},triggered:!1,handler:function(t,n){if(i.detection.current.name!=this.name&&this.triggered)return n.trigger(this.name+"end",t),this.triggered=!1,e;if(!(n.options.drag_max_touches>0&&t.touches.length>n.options.drag_max_touches))switch(t.eventType){case i.EVENT_START:this.triggered=!1;break;case i.EVENT_MOVE:if(t.distance<n.options.drag_min_distance&&i.detection.current.name!=this.name)return;i.detection.current.name=this.name,(i.detection.current.lastEvent.drag_locked_to_axis||n.options.drag_lock_to_axis&&n.options.drag_lock_min_distance<=t.distance)&&(t.drag_locked_to_axis=!0);var r=i.detection.current.lastEvent.direction;t.drag_locked_to_axis&&r!==t.direction&&(t.direction=i.utils.isVertical(r)?0>t.deltaY?i.DIRECTION_UP:i.DIRECTION_DOWN:0>t.deltaX?i.DIRECTION_LEFT:i.DIRECTION_RIGHT),this.triggered||(n.trigger(this.name+"start",t),this.triggered=!0),n.trigger(this.name,t),n.trigger(this.name+t.direction,t),(n.options.drag_block_vertical&&i.utils.isVertical(t.direction)||n.options.drag_block_horizontal&&!i.utils.isVertical(t.direction))&&t.preventDefault();break;case i.EVENT_END:this.triggered&&n.trigger(this.name+"end",t),this.triggered=!1}}},i.gestures.Transform={name:"transform",index:45,defaults:{transform_min_scale:.01,transform_min_rotation:1,transform_always_block:!1},triggered:!1,handler:function(t,n){if(i.detection.current.name!=this.name&&this.triggered)return n.trigger(this.name+"end",t),this.triggered=!1,e;if(!(2>t.touches.length))switch(n.options.transform_always_block&&t.preventDefault(),t.eventType){case i.EVENT_START:this.triggered=!1;break;case i.EVENT_MOVE:var r=Math.abs(1-t.scale),o=Math.abs(t.rotation);if(n.options.transform_min_scale>r&&n.options.transform_min_rotation>o)return;i.detection.current.name=this.name,this.triggered||(n.trigger(this.name+"start",t),this.triggered=!0),n.trigger(this.name,t),o>n.options.transform_min_rotation&&n.trigger("rotate",t),r>n.options.transform_min_scale&&(n.trigger("pinch",t),n.trigger("pinch"+(1>t.scale?"in":"out"),t));break;case i.EVENT_END:this.triggered&&n.trigger(this.name+"end",t),this.triggered=!1}}},i.gestures.Touch={name:"touch",index:-1/0,defaults:{prevent_default:!1,prevent_mouseevents:!1},handler:function(t,n){return n.options.prevent_mouseevents&&t.pointerType==i.POINTER_MOUSE?(t.stopDetect(),e):(n.options.prevent_default&&t.preventDefault(),t.eventType==i.EVENT_START&&n.trigger(this.name,t),e)}},i.gestures.Release={name:"release",index:1/0,handler:function(t,e){t.eventType==i.EVENT_END&&e.trigger(this.name,t)}},"object"==typeof module&&"object"==typeof module.exports?module.exports=i:(t.Hammer=i,"function"==typeof t.define&&t.define.amd&&t.define("hammer",[],function(){return i}))})(this),function(t,e){"use strict";t!==e&&(Hammer.event.bindDom=function(n,i,r){t(n).on(i,function(t){var n=t.originalEvent||t;n.pageX===e&&(n.pageX=t.pageX,n.pageY=t.pageY),n.target||(n.target=t.target),n.which===e&&(n.which=n.button),n.preventDefault||(n.preventDefault=t.preventDefault),n.stopPropagation||(n.stopPropagation=t.stopPropagation),r.call(this,n)})},Hammer.Instance.prototype.on=function(e,n){return t(this.element).on(e,n)},Hammer.Instance.prototype.off=function(e,n){return t(this.element).off(e,n)},Hammer.Instance.prototype.trigger=function(e,n){var i=t(this.element);return i.has(n.target).length&&(i=t(n.target)),i.trigger({type:e,gesture:n})},t.fn.hammer=function(e){return this.each(function(){var n=t(this),i=n.data("hammer");i?i&&e&&Hammer.utils.extend(i.options,e):n.data("hammer",new Hammer(this,e||{}))})})}(window.jQuery||window.Zepto);
'use strict';
/*https://github.com/peledies/google-places/blob/master/google-places.js*/
(function($) {
    var namespace = 'googlePlaces';
    $.googlePlaces = function(element, options) {

        var defaults = {
                placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4' // placeId provided by google api documentation
                , render: ['reviews']
                , min_rating: 0
                , max_rows: 0
                , map_plug_id: 'map-plug'
                , rotateTime: false
                , schema:{
                    displayElement: '#schema'
                    , type: 'Store'
                    , beforeText: 'Google Users Have Rated'
                    , middleText: 'based on'
                    , afterText: 'ratings and reviews'
                }
                , address:{
                    displayElement: "#google-address"
                }
                , phone:{
                    displayElement: "#google-phone"
                }
                , staticMap:{
                    displayElement: "#google-static-map"
                    , width: 512
                    , height: 512
                    , zoom: 17
                    , type: "roadmap"
                }
                , hours:{
                    displayElement: "#google-hours"
                }
            };

        var plugin = this;

        plugin.settings = {}

        var $element = $(element),
            element = element;

        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options);
            plugin.settings.schema = $.extend({}, defaults.schema, options.schema);
            $element.html("<div id='" + plugin.settings.map_plug_id + "'></div>"); // create a plug for google to load data into
            initialize_place(function(place){
                plugin.place_data = place;

                // Trigger event before render
                $element.trigger('beforeRender.' + namespace);

                // render specified sections
                if(plugin.settings.render.indexOf('reviews') > -1){
                    renderReviews(plugin.place_data.reviews);
                    if(!!plugin.settings.rotateTime) {
                        initRotation();
                    }
                }
                if(plugin.settings.render.indexOf('address') > -1){
                    renderAddress(
                        capture_element(plugin.settings.address.displayElement)
                        , plugin.place_data.adr_address
                    );
                }
                if(plugin.settings.render.indexOf('phone') > -1){
                    renderPhone(
                        capture_element(plugin.settings.phone.displayElement)
                        , plugin.place_data.formatted_phone_number
                    );
                }
                if(plugin.settings.render.indexOf('staticMap') > -1){
                    renderStaticMap(
                        capture_element(plugin.settings.staticMap.displayElement)
                        , plugin.place_data.formatted_address
                    );
                }
                if(plugin.settings.render.indexOf('hours') > -1){
                    renderHours(
                        capture_element(plugin.settings.hours.displayElement)
                        , plugin.place_data.opening_hours
                    );
                }

                // render schema markup
                addSchemaMarkup(
                    capture_element(plugin.settings.schema.displayElement)
                    , plugin.place_data
                );

                // Trigger event after render
                $element.trigger('afterRender.' + namespace);

            });
        }

        var capture_element = function(element){
            if(element instanceof jQuery){
                return element;
            }else if(typeof element == 'string'){
                try{
                    var ele = $(element);
                    if( ele.length ){
                        return ele;
                    }else{
                        throw 'Element [' + element + '] couldnt be found in the DOM. Skipping '+element+' markup generation.';
                    }
                }catch(e){
                    console.warn(e);
                }
            }
        }

        var initialize_place = function(c){
            var map = new google.maps.Map(document.getElementById(plugin.settings.map_plug_id));

            var request = {
                placeId: plugin.settings.placeId
            };

            var service = new google.maps.places.PlacesService(map);

            service.getDetails(request, function(place, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    c(place);
                }
            });
        }

        var sort_by_date = function(ray) {
            ray.sort(function(a, b){
                var keyA = new Date(a.time),
                    keyB = new Date(b.time);
                // Compare the 2 dates
                if(keyA < keyB) return -1;
                if(keyA > keyB) return 1;
                return 0;
            });
            return ray;
        }

        var filter_minimum_rating = function(reviews){
            for (var i = reviews.length -1; i >= 0; i--) {
                if(reviews[i].rating < plugin.settings.min_rating){
                    reviews.splice(i,1);
                }
            }
            return reviews;
        }

        var renderReviews = function(reviews){
            reviews = sort_by_date(reviews);
            reviews = filter_minimum_rating(reviews);
            var html = "";
            var row_count = (plugin.settings.max_rows > 0)? plugin.settings.max_rows - 1 : reviews.length - 1;
            // make sure the row_count is not greater than available records
            row_count = (row_count > reviews.length-1)? reviews.length -1 : row_count;
            for (var i = row_count; i >= 0; i--) {
                var stars = renderStars(reviews[i].rating);
                var date = convertTime(reviews[i].time);
                html = html+"<div class='review-item'><div class='review-meta'><span class='review-author'>"+reviews[i].author_name+"</span><span class='review-sep'>, </span><span class='review-date'>"+date+"</span></div>"+stars+"<p class='review-text'>"+reviews[i].text+"</p></div>"
            };
            $element.append(html);
        }

        var renderHours = function(element, data){
            if(element instanceof jQuery){
                var html = "<ul>";
                data.weekday_text.forEach(function(day){
                    html += "<li>"+day+"</li>";
                });
                html += "</ul>";
                element.append(html);
            }
        }

        var renderStaticMap = function(element, data){
            if(element instanceof jQuery){
                var map = plugin.settings.staticMap;
                element.append(
                    "<img src='https://maps.googleapis.com/maps/api/staticmap"+
                    "?size="+map.width+"x"+map.height+
                    "&zoom="+map.zoom+
                    "&maptype="+map.type+
                    "&markers=size:large%7Ccolor:red%7C"+data+"'>"+
                    "</img>");
            }
        }

        var renderAddress = function(element, data){
            if(element instanceof jQuery){
                element.append(data);
            }
        }

        var renderPhone = function(element, data){
            if(element instanceof jQuery){
                element.append(data);
            }
        }

        var initRotation = function() {
            var $reviewEls = $element.children('.review-item');
            var currentIdx = $reviewEls.length > 0 ? 0 : false;
            $reviewEls.hide();
            if(currentIdx !== false) {
                $($reviewEls[currentIdx]).show();
                setInterval(function(){
                    if(++currentIdx >= $reviewEls.length) {
                        currentIdx = 0;
                    }
                    $reviewEls.hide();
                    $($reviewEls[currentIdx]).fadeIn('slow');
                }, plugin.settings.rotateTime);
            }
        }

        var renderStars = function(rating){
            var stars = "<div class='review-stars'><ul>";

            // fill in gold stars
            for (var i = 0; i < rating; i++) {
                stars = stars+"<li><i class='star'></i></li>";
            };

            // fill in empty stars
            if(rating < 5){
                for (var i = 0; i < (5 - rating); i++) {
                    stars = stars+"<li><i class='star inactive'></i></li>";
                };
            }
            stars = stars+"</ul></div>";
            return stars;
        }

        var convertTime = function(UNIX_timestamp){
            var a = new Date(UNIX_timestamp * 1000);
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var time = months[a.getMonth()] + ' ' + a.getDate() + ', ' + a.getFullYear();
            return time;
        }

        var addSchemaMarkup = function(element, placeData) {
            var reviews = placeData.reviews;
            var lastIndex = reviews.length - 1;
            var reviewPointTotal = 0;
            var schema = plugin.settings.schema;
            for (var i = lastIndex; i >= 0; i--) {
                reviewPointTotal += reviews[i].rating;
            };
            // Set totals and averages - may be used later.
            var averageReview = reviewPointTotal / ( reviews.length );
            if(element instanceof jQuery){
                element.append( '<span itemscope="" itemtype="http://schema.org/' + schema.type + '">'
                    +  '<meta itemprop="url" content="' + location.origin + '">'
                    +  schema.beforeText + ' <span itemprop="name">' + placeData.name + '</span> '
                    +  '<span itemprop="aggregateRating" itemscope="" itemtype="http://schema.org/AggregateRating">'
                    +    '<span itemprop="ratingValue">' + averageReview.toFixed(2) + '</span>/<span itemprop="bestRating">5</span> '
                    +  schema.middleText + ' <span itemprop="ratingCount">' + reviews.length + '</span> '
                    +  schema.afterText
                    +  '</span>'
                    +'</span>');
            }
        }

        plugin.init();

    }

    $.fn.googlePlaces = function(options) {

        return this.each(function() {
            if (undefined == $(this).data(namespace)) {
                var plugin = new $.googlePlaces(this, options);
                $(this).data(namespace, plugin);
            }
        });

    }

})(jQuery);
/*
 * jQuery Nivo Slider v3.2
 * http://nivo.dev7studios.com
 *
 * Copyright 2012, Dev7studios
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function($) {
    var NivoSlider = function(element, options){
        // Defaults are below
        var settings = $.extend({}, $.fn.nivoSlider.defaults, options);

        // Useful variables. Play carefully.
        var vars = {
            currentSlide: 0,
            currentImage: '',
            totalSlides: 0,
            running: false,
            paused: false,
            stop: false,
            controlNavEl: false
        };

        // Get this slider
        var slider = $(element);
        slider.data('nivo:vars', vars).addClass('nivoSlider');

        // Find our slider children
        var kids = slider.children();
        kids.each(function() {
            var child = $(this);
            var link = '';
            if(!child.is('img')){
                if(child.is('a')){
                    child.addClass('nivo-imageLink');
                    link = child;
                }
                child = child.find('img:first');
            }
            // Get img width & height
            var childWidth = (childWidth === 0) ? child.attr('width') : child.width(),
                childHeight = (childHeight === 0) ? child.attr('height') : child.height();

            if(link !== ''){
                link.css('display','none');
            }
            child.css('display','none');
            vars.totalSlides++;
        });
         
        // If randomStart
        if(settings.randomStart){
            settings.startSlide = Math.floor(Math.random() * vars.totalSlides);
        }
        
        // Set startSlide
        if(settings.startSlide > 0){
            if(settings.startSlide >= vars.totalSlides) { settings.startSlide = vars.totalSlides - 1; }
            vars.currentSlide = settings.startSlide;
        }
        
        // Get initial image
        if($(kids[vars.currentSlide]).is('img')){
            vars.currentImage = $(kids[vars.currentSlide]);
        } else {
            vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
        }
        
        // Show initial link
        if($(kids[vars.currentSlide]).is('a')){
            $(kids[vars.currentSlide]).css('display','block');
        }
        
        // Set first background
        var sliderImg = $('<img/>').addClass('nivo-main-image');
        sliderImg.attr('src', vars.currentImage.attr('src')).show();
        slider.append(sliderImg);

        // Detect Window Resize
        $(window).resize(function() {
            slider.children('img').width(slider.width());
            sliderImg.attr('src', vars.currentImage.attr('src'));
            sliderImg.stop().height('auto');
            $('.nivo-slice').remove();
            $('.nivo-box').remove();
        });

        //Create caption
        slider.append($('<div class="nivo-caption"></div>'));
        
        // Process caption function
        var processCaption = function(settings){
            var nivoCaption = $('.nivo-caption', slider);
            if(vars.currentImage.attr('title') != '' && vars.currentImage.attr('title') != undefined){
                var title = vars.currentImage.attr('title');
                if(title.substr(0,1) == '#') title = $(title).html();   

                if(nivoCaption.css('display') == 'block'){
                    setTimeout(function(){
                        nivoCaption.html(title);
                    }, settings.animSpeed);
                } else {
                    nivoCaption.html(title);
                    nivoCaption.stop().fadeIn(settings.animSpeed);
                }
            } else {
                nivoCaption.stop().fadeOut(settings.animSpeed);
            }
        }
        
        //Process initial  caption
        processCaption(settings);
        
        // In the words of Super Mario "let's a go!"
        var timer = 0;
        if(!settings.manualAdvance && kids.length > 1){
            timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
        }
        
        // Add Direction nav
        if(settings.directionNav){
            slider.append('<div class="nivo-directionNav"><a class="nivo-prevNav">'+ settings.prevText +'</a><a class="nivo-nextNav">'+ settings.nextText +'</a></div>');
            
            $(slider).on('click', 'a.nivo-prevNav', function(){
                if(vars.running) { return false; }
                clearInterval(timer);
                timer = '';
                vars.currentSlide -= 2;
                nivoRun(slider, kids, settings, 'prev');
            });
            
            $(slider).on('click', 'a.nivo-nextNav', function(){
                if(vars.running) { return false; }
                clearInterval(timer);
                timer = '';
                nivoRun(slider, kids, settings, 'next');
            });
        }
        
        // Add Control nav
        if(settings.controlNav){
            vars.controlNavEl = $('<div class="nivo-controlNav carousel-indicators"></div>');
            var carouselBox = $('<div class="carousel-box"></div>')
            slider.after(vars.controlNavEl);
            for(var i = 0; i < kids.length; i++){
                if(settings.controlNavThumbs){
                    vars.controlNavEl.addClass('nivo-thumbs-enabled');
                    var child = kids.eq(i);
                    if(!child.is('img')){
                        child = child.find('img:first');
                    }
                    carouselBox.append('<a class="nivo-control" rel="'+ i +'"><span class="set-slide"></span></a>');
                    vars.controlNavEl.append(carouselBox)
                    //if(child.attr('data-thumb')) vars.controlNavEl.append('<a class="nivo-control" rel="'+ i +'"><span class="set-slide"></span></a>');
                } else {
                    vars.controlNavEl.append('<a class="nivo-control" rel="'+ i +'">'+ (i + 1) +'</a>');
                }
            }

            //Set initial active link
            $('a:eq('+ vars.currentSlide +')', vars.controlNavEl).addClass('active');
            
            $('a', vars.controlNavEl).bind('click', function(){
                if(vars.running) return false;
                if($(this).hasClass('active')) return false;
                clearInterval(timer);
                timer = '';
                sliderImg.attr('src', vars.currentImage.attr('src'));
                vars.currentSlide = $(this).attr('rel') - 1;
                nivoRun(slider, kids, settings, 'control');
            });
        }
        
        //For pauseOnHover setting
        if(settings.pauseOnHover){
            slider.hover(function(){
                vars.paused = true;
                clearInterval(timer);
                timer = '';
            }, function(){
                vars.paused = false;
                // Restart the timer
                if(timer === '' && !settings.manualAdvance){
                    timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
                }
            });
        }
        
        // Event when Animation finishes
        slider.bind('nivo:animFinished', function(){
            sliderImg.attr('src', vars.currentImage.attr('src'));
            vars.running = false; 
            // Hide child links
            $(kids).each(function(){
                if($(this).is('a')){
                   $(this).css('display','none');
                }
            });
            // Show current link
            if($(kids[vars.currentSlide]).is('a')){
                $(kids[vars.currentSlide]).css('display','block');
            }
            // Restart the timer
            if(timer === '' && !vars.paused && !settings.manualAdvance){
                timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
            }
            // Trigger the afterChange callback
            settings.afterChange.call(this);
        }); 
        
        // Add slices for slice animations
        var createSlices = function(slider, settings, vars) {
        	if($(vars.currentImage).parent().is('a')) $(vars.currentImage).parent().css('display','block');
            $('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').width(slider.width()).css('visibility', 'hidden').show();
            var sliceHeight = ($('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').parent().is('a')) ? $('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').parent().height() : $('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').height();

            for(var i = 0; i < settings.slices; i++){
                var sliceWidth = Math.round(slider.width()/settings.slices);
                
                if(i === settings.slices-1){
                    slider.append(
                        $('<div class="nivo-slice" name="'+i+'"><img src="'+ vars.currentImage.attr('src') +'" style="position:absolute; width:'+ slider.width() +'px; height:auto; display:block !important; top:0; left:-'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px;" /></div>').css({ 
                            left:(sliceWidth*i)+'px', 
                            width:(slider.width()-(sliceWidth*i))+'px',
                            height:sliceHeight+'px', 
                            opacity:'0',
                            overflow:'hidden'
                        })
                    );
                } else {
                    slider.append(
                        $('<div class="nivo-slice" name="'+i+'"><img src="'+ vars.currentImage.attr('src') +'" style="position:absolute; width:'+ slider.width() +'px; height:auto; display:block !important; top:0; left:-'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px;" /></div>').css({ 
                            left:(sliceWidth*i)+'px', 
                            width:sliceWidth+'px',
                            height:sliceHeight+'px',
                            opacity:'0',
                            overflow:'hidden'
                        })
                    );
                }
            }
            
            $('.nivo-slice', slider).height(sliceHeight);
            sliderImg.stop().animate({
                height: $(vars.currentImage).height()
            }, settings.animSpeed);
        };
        
        // Add boxes for box animations
        var createBoxes = function(slider, settings, vars){
        	if($(vars.currentImage).parent().is('a')) $(vars.currentImage).parent().css('display','block');
            $('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').width(slider.width()).css('visibility', 'hidden').show();
            var boxWidth = Math.round(slider.width()/settings.boxCols),
                boxHeight = Math.round($('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').height() / settings.boxRows);
            
                        
            for(var rows = 0; rows < settings.boxRows; rows++){
                for(var cols = 0; cols < settings.boxCols; cols++){
                    if(cols === settings.boxCols-1){
                        slider.append(
                            $('<div class="nivo-box" name="'+ cols +'" rel="'+ rows +'"><img src="'+ vars.currentImage.attr('src') +'" style="position:absolute; width:'+ slider.width() +'px; height:auto; display:block; top:-'+ (boxHeight*rows) +'px; left:-'+ (boxWidth*cols) +'px;" /></div>').css({ 
                                opacity:0,
                                left:(boxWidth*cols)+'px', 
                                top:(boxHeight*rows)+'px',
                                width:(slider.width()-(boxWidth*cols))+'px'
                                
                            })
                        );
                        $('.nivo-box[name="'+ cols +'"]', slider).height($('.nivo-box[name="'+ cols +'"] img', slider).height()+'px');
                    } else {
                        slider.append(
                            $('<div class="nivo-box" name="'+ cols +'" rel="'+ rows +'"><img src="'+ vars.currentImage.attr('src') +'" style="position:absolute; width:'+ slider.width() +'px; height:auto; display:block; top:-'+ (boxHeight*rows) +'px; left:-'+ (boxWidth*cols) +'px;" /></div>').css({ 
                                opacity:0,
                                left:(boxWidth*cols)+'px', 
                                top:(boxHeight*rows)+'px',
                                width:boxWidth+'px'
                            })
                        );
                        $('.nivo-box[name="'+ cols +'"]', slider).height($('.nivo-box[name="'+ cols +'"] img', slider).height()+'px');
                    }
                }
            }
            
            sliderImg.stop().animate({
                height: $(vars.currentImage).height()
            }, settings.animSpeed);
        };

        // Private run method
        var nivoRun = function(slider, kids, settings, nudge){          
            // Get our vars
            var vars = slider.data('nivo:vars');
            
            // Trigger the lastSlide callback
            if(vars && (vars.currentSlide === vars.totalSlides - 1)){ 
                settings.lastSlide.call(this);
            }
            
            // Stop
            if((!vars || vars.stop) && !nudge) { return false; }
            
            // Trigger the beforeChange callback
            settings.beforeChange.call(this);

            // Set current background before change
            if(!nudge){
                sliderImg.attr('src', vars.currentImage.attr('src'));
            } else {
                if(nudge === 'prev'){
                    sliderImg.attr('src', vars.currentImage.attr('src'));
                }
                if(nudge === 'next'){
                    sliderImg.attr('src', vars.currentImage.attr('src'));
                }
            }
            
            vars.currentSlide++;
            // Trigger the slideshowEnd callback
            if(vars.currentSlide === vars.totalSlides){ 
                vars.currentSlide = 0;
                settings.slideshowEnd.call(this);
            }
            if(vars.currentSlide < 0) { vars.currentSlide = (vars.totalSlides - 1); }
            // Set vars.currentImage
            if($(kids[vars.currentSlide]).is('img')){
                vars.currentImage = $(kids[vars.currentSlide]);
            } else {
                vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
            }
            
            // Set active links
            if(settings.controlNav){
                $('a', vars.controlNavEl).removeClass('active');
                $('a:eq('+ vars.currentSlide +')', vars.controlNavEl).addClass('active');
            }
            
            // Process caption
            processCaption(settings);            
            
            // Remove any slices from last transition
            $('.nivo-slice', slider).remove();
            
            // Remove any boxes from last transition
            $('.nivo-box', slider).remove();
            
            var currentEffect = settings.effect,
                anims = '';
                
            // Generate random effect
            if(settings.effect === 'random'){
                anims = new Array('sliceDownRight','sliceDownLeft','sliceUpRight','sliceUpLeft','sliceUpDown','sliceUpDownLeft','fold','fade',
                'boxRandom','boxRain','boxRainReverse','boxRainGrow','boxRainGrowReverse');
                currentEffect = anims[Math.floor(Math.random()*(anims.length + 1))];
                if(currentEffect === undefined) { currentEffect = 'fade'; }
            }
            
            // Run random effect from specified set (eg: effect:'fold,fade')
            if(settings.effect.indexOf(',') !== -1){
                anims = settings.effect.split(',');
                currentEffect = anims[Math.floor(Math.random()*(anims.length))];
                if(currentEffect === undefined) { currentEffect = 'fade'; }
            }
            
            // Custom transition as defined by "data-transition" attribute
            if(vars.currentImage.attr('data-transition')){
                currentEffect = vars.currentImage.attr('data-transition');
            }
        
            // Run effects
            vars.running = true;
            var timeBuff = 0,
                i = 0,
                slices = '',
                firstSlice = '',
                totalBoxes = '',
                boxes = '';
            
            if(currentEffect === 'sliceDown' || currentEffect === 'sliceDownRight' || currentEffect === 'sliceDownLeft'){
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                slices = $('.nivo-slice', slider);
                if(currentEffect === 'sliceDownLeft') { slices = $('.nivo-slice', slider)._reverse(); }
                
                slices.each(function(){
                    var slice = $(this);
                    slice.css({ 'top': '0px' });
                    if(i === settings.slices-1){
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if(currentEffect === 'sliceUp' || currentEffect === 'sliceUpRight' || currentEffect === 'sliceUpLeft'){
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                slices = $('.nivo-slice', slider);
                if(currentEffect === 'sliceUpLeft') { slices = $('.nivo-slice', slider)._reverse(); }
                
                slices.each(function(){
                    var slice = $(this);
                    slice.css({ 'bottom': '0px' });
                    if(i === settings.slices-1){
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if(currentEffect === 'sliceUpDown' || currentEffect === 'sliceUpDownRight' || currentEffect === 'sliceUpDownLeft'){
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                var v = 0;
                slices = $('.nivo-slice', slider);
                if(currentEffect === 'sliceUpDownLeft') { slices = $('.nivo-slice', slider)._reverse(); }
                
                slices.each(function(){
                    var slice = $(this);
                    if(i === 0){
                        slice.css('top','0px');
                        i++;
                    } else {
                        slice.css('bottom','0px');
                        i = 0;
                    }
                    
                    if(v === settings.slices-1){
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    v++;
                });
            } else if(currentEffect === 'fold'){
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                
                $('.nivo-slice', slider).each(function(){
                    var slice = $(this);
                    var origWidth = slice.width();
                    slice.css({ top:'0px', width:'0px' });
                    if(i === settings.slices-1){
                        setTimeout(function(){
                            slice.animate({ width:origWidth, opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            slice.animate({ width:origWidth, opacity:'1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if(currentEffect === 'fade'){
                createSlices(slider, settings, vars);
                
                firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'width': slider.width() + 'px'
                });
    
                firstSlice.animate({ opacity:'1.0' }, (settings.animSpeed*2), '', function(){ slider.trigger('nivo:animFinished'); });
            } else if(currentEffect === 'slideInRight'){
                createSlices(slider, settings, vars);
                
                firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'width': '0px',
                    'opacity': '1'
                });

                firstSlice.animate({ width: slider.width() + 'px' }, (settings.animSpeed*2), '', function(){ slider.trigger('nivo:animFinished'); });
            } else if(currentEffect === 'slideInLeft'){
                createSlices(slider, settings, vars);
                
                firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'width': '0px',
                    'opacity': '1',
                    'left': '',
                    'right': '0px'
                });

                firstSlice.animate({ width: slider.width() + 'px' }, (settings.animSpeed*2), '', function(){ 
                    // Reset positioning
                    firstSlice.css({
                        'left': '0px',
                        'right': ''
                    });
                    slider.trigger('nivo:animFinished'); 
                });
            } else if(currentEffect === 'boxRandom'){
                createBoxes(slider, settings, vars);
                
                totalBoxes = settings.boxCols * settings.boxRows;
                i = 0;
                timeBuff = 0;

                boxes = shuffle($('.nivo-box', slider));
                boxes.each(function(){
                    var box = $(this);
                    if(i === totalBoxes-1){
                        setTimeout(function(){
                            box.animate({ opacity:'1' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            box.animate({ opacity:'1' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 20;
                    i++;
                });
            } else if(currentEffect === 'boxRain' || currentEffect === 'boxRainReverse' || currentEffect === 'boxRainGrow' || currentEffect === 'boxRainGrowReverse'){
                createBoxes(slider, settings, vars);
                
                totalBoxes = settings.boxCols * settings.boxRows;
                i = 0;
                timeBuff = 0;
                
                // Split boxes into 2D array
                var rowIndex = 0;
                var colIndex = 0;
                var box2Darr = [];
                box2Darr[rowIndex] = [];
                boxes = $('.nivo-box', slider);
                if(currentEffect === 'boxRainReverse' || currentEffect === 'boxRainGrowReverse'){
                    boxes = $('.nivo-box', slider)._reverse();
                }
                boxes.each(function(){
                    box2Darr[rowIndex][colIndex] = $(this);
                    colIndex++;
                    if(colIndex === settings.boxCols){
                        rowIndex++;
                        colIndex = 0;
                        box2Darr[rowIndex] = [];
                    }
                });
                
                // Run animation
                for(var cols = 0; cols < (settings.boxCols * 2); cols++){
                    var prevCol = cols;
                    for(var rows = 0; rows < settings.boxRows; rows++){
                        if(prevCol >= 0 && prevCol < settings.boxCols){
                            /* Due to some weird JS bug with loop vars 
                            being used in setTimeout, this is wrapped
                            with an anonymous function call */
                            (function(row, col, time, i, totalBoxes) {
                                var box = $(box2Darr[row][col]);
                                var w = box.width();
                                var h = box.height();
                                if(currentEffect === 'boxRainGrow' || currentEffect === 'boxRainGrowReverse'){
                                    box.width(0).height(0);
                                }
                                if(i === totalBoxes-1){
                                    setTimeout(function(){
                                        box.animate({ opacity:'1', width:w, height:h }, settings.animSpeed/1.3, '', function(){ slider.trigger('nivo:animFinished'); });
                                    }, (100 + time));
                                } else {
                                    setTimeout(function(){
                                        box.animate({ opacity:'1', width:w, height:h }, settings.animSpeed/1.3);
                                    }, (100 + time));
                                }
                            })(rows, prevCol, timeBuff, i, totalBoxes);
                            i++;
                        }
                        prevCol--;
                    }
                    timeBuff += 100;
                }
            }           
        };
        
        // Shuffle an array
        var shuffle = function(arr){
            for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i, 10), x = arr[--i], arr[i] = arr[j], arr[j] = x);
            return arr;
        };
        
        // For debugging
        var trace = function(msg){
            if(this.console && typeof console.log !== 'undefined') { console.log(msg); }
        };
        
        // Start / Stop
        this.stop = function(){
            if(!$(element).data('nivo:vars').stop){
                $(element).data('nivo:vars').stop = true;
                trace('Stop Slider');
            }
        };
        
        this.start = function(){
            if($(element).data('nivo:vars').stop){
                $(element).data('nivo:vars').stop = false;
                trace('Start Slider');
            }
        };
        
        // Trigger the afterLoad callback
        settings.afterLoad.call(this);
        
        return this;
    };
        
    $.fn.nivoSlider = function(options) {
        return this.each(function(key, value){
            var element = $(this);
            // Return early if this element already has a plugin instance
            if (element.data('nivoslider')) { return element.data('nivoslider'); }
            // Pass options to plugin constructor
            var nivoslider = new NivoSlider(this, options);
            // Store plugin object in this element's data
            element.data('nivoslider', nivoslider);
        });
    };
    
    //Default settings
    $.fn.nivoSlider.defaults = {
        effect: 'random',
        slices: 15,
        boxCols: 8,
        boxRows: 4,
        animSpeed: 500,
        pauseTime: 3000,
        startSlide: 0,
        directionNav: true,
        controlNav: true,
        controlNavThumbs: false,
        pauseOnHover: true,
        manualAdvance: false,
        prevText: '<span class="icon-prev-img"></span>',
        nextText: '<span class="icon-next-img"></span>',
        randomStart: false,
        beforeChange: function(){},
        afterChange: function(){},
        slideshowEnd: function(){},
        lastSlide: function(){},
        afterLoad: function(){}
    };

    $.fn._reverse = [].reverse;
    
})(jQuery);
"use strict";var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key]}}}return target};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor}}();var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj};function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}}(function(root,factory){var pluginName="BackgroundVideo";if(typeof define==="function"&&define.amd){define([],factory(pluginName))}else if((typeof exports==="undefined"?"undefined":_typeof(exports))==="object"){module.exports=factory(pluginName)}else{root[pluginName]=factory(pluginName)}})(window||module||{},function(pluginName){var defaults={parallax:{effect:1.5},pauseVideoOnViewLoss:false,preventContextMenu:false,minimumVideoWidth:400,onBeforeReady:function onBeforeReady(){},onReady:function onReady(){}};var addClass=function addClass(el,className){if(el.classList){el.classList.add(className)}else{el.className+=" "+className}};var BackgroundVideo=function(){function BackgroundVideo(element,options){_classCallCheck(this,BackgroundVideo);this.element=document.querySelectorAll(element);this.options=_extends({},defaults,options);this.options.browserPrexix=this.detectBrowser();this.shimRequestAnimationFrame();this.options.has3d=this.detect3d();for(var i=0;i<this.element.length;i++){this.init(this.element[i],i)}}_createClass(BackgroundVideo,[{key:"init",value:function init(element,iteration){this.el=element;this.playEvent=this.videoReadyCallback.bind(this);this.setVideoWrap(iteration);this.setVideoProperties();this.insertVideos();if(this.options&&this.options.onBeforeReady())this.options.onBeforeReady();if(this.el.readyState>3){this.videoReadyCallback()}else{this.el.addEventListener("canplaythrough",this.playEvent,false);this.el.addEventListener("canplay",this.playEvent,false)}if(this.options.preventContextMenu){this.el.addEventListener("contextmenu",function(){return false})}}},{key:"videoReadyCallback",value:function videoReadyCallback(){this.el.removeEventListener("canplaythrough",this.playEvent,false);this.el.removeEventListener("canplay",this.playEvent,false);this.options.originalVideoW=this.el.videoWidth;this.options.originalVideoH=this.el.videoHeight;this.bindEvents();this.requestTick();if(this.options&&this.options.onReady())this.options.onReady()}},{key:"bindEvents",value:function bindEvents(){this.ticking=false;if(this.options.parallax){window.addEventListener("scroll",this.requestTick.bind(this))}window.addEventListener("resize",this.requestTick.bind(this))}},{key:"requestTick",value:function requestTick(){if(!this.ticking){this.ticking=true;window.requestAnimationFrame(this.positionObject.bind(this))}this.ticking=false}},{key:"positionObject",value:function positionObject(){var scrollPos=window.pageYOffset;var _scaleObject=this.scaleObject(),xPos=_scaleObject.xPos,yPos=_scaleObject.yPos;if(this.options.parallax){if(scrollPos>=0){yPos=this.calculateYPos(yPos,scrollPos)}else{yPos=this.calculateYPos(yPos,0)}}else{yPos=-yPos}var transformStyle=this.options.has3d?"translate3d("+xPos+"px, "+yPos+"px, 0)":"translate("+xPos+"px, "+yPos+"px)";this.el.style[""+this.options.browserPrexix]=transformStyle;this.el.style.transform=transformStyle}},{key:"scaleObject",value:function scaleObject(){var windowWidth=window.innerWidth;var windowHeight=window.innerHeight;var heightScale=windowWidth/this.options.originalVideoW;var widthScale=windowHeight/this.options.originalVideoH;var scaleFactor=void 0;this.options.bvVideoWrap.style.width=windowWidth+"px";this.options.bvVideoWrap.style.height=windowHeight+"px";scaleFactor=heightScale>widthScale?heightScale:widthScale;if(scaleFactor*this.options.originalVideoW<this.options.minimumVideoWidth){scaleFactor=this.options.minimumVideoWidth/this.options.originalVideoW}var videoWidth=scaleFactor*this.options.originalVideoW;var videoHeight=scaleFactor*this.options.originalVideoH;this.el.style.width=videoWidth+"px";this.el.style.height=videoHeight+"px";return{xPos:-parseInt((videoWidth-windowWidth)/2),yPos:parseInt(videoHeight-windowHeight)/2}}},{key:"calculateYPos",value:function calculateYPos(yPos,scrollPos){var videoPosition=parseInt(this.options.bvVideoWrap.offsetTop);var videoOffset=videoPosition-scrollPos;yPos=-(videoOffset/this.options.parallax.effect+yPos);return yPos}},{key:"setVideoWrap",value:function setVideoWrap(iteration){var wrapper=document.createElement("div");this.options.bvVideoWrapClass=this.el.className+"-wrap-"+iteration;addClass(wrapper,"bv-video-wrap");addClass(wrapper,this.options.bvVideoWrapClass);wrapper.style.position="relative";wrapper.style.overflow="hidden";wrapper.style.zIndex="10";this.el.parentNode.insertBefore(wrapper,this.el);wrapper.appendChild(this.el);this.options.bvVideoWrap=document.querySelector("."+this.options.bvVideoWrapClass)}},{key:"setVideoProperties",value:function setVideoProperties(){this.el.setAttribute("preload","metadata");this.el.setAttribute("loop","true");this.el.setAttribute("autoplay","true");this.el.style.position="absolute";this.el.style.zIndex="1"}},{key:"insertVideos",value:function insertVideos(){for(var i=0;i<this.options.src.length;i++){var videoTypeArr=this.options.src[i].split(".");var videoType=videoTypeArr[videoTypeArr.length-1];this.addSourceToVideo(this.options.src[i],"video/"+videoType)}}},{key:"addSourceToVideo",value:function addSourceToVideo(src,type){var source=document.createElement("source");source.src=src;source.type=type;this.el.appendChild(source)}},{key:"detectBrowser",value:function detectBrowser(){var val=navigator.userAgent.toLowerCase();var browserPrexix=void 0;if(val.indexOf("chrome")>-1||val.indexOf("safari")>-1){browserPrexix="webkitTransform"}else if(val.indexOf("firefox")>-1){browserPrexix="MozTransform"}else if(val.indexOf("MSIE")!==-1||val.indexOf("Trident/")>0){browserPrexix="msTransform"}else if(val.indexOf("Opera")>-1){browserPrexix="OTransform"}return browserPrexix}},{key:"shimRequestAnimationFrame",value:function shimRequestAnimationFrame(){var lastTime=0;var vendors=["ms","moz","webkit","o"];for(var x=0;x<vendors.length&&!window.requestAnimationFrame;++x){window.requestAnimationFrame=window[vendors[x]+"RequestAnimationFrame"];window.cancelAnimationFrame=window[vendors[x]+"CancelAnimationFrame"]||window[vendors[x]+"CancelRequestAnimationFrame"]}if(!window.requestAnimationFrame)window.requestAnimationFrame=function(callback,element){var currTime=(new Date).getTime();var timeToCall=Math.max(0,16-(currTime-lastTime));var id=window.setTimeout(function(){callback(currTime+timeToCall)},timeToCall);lastTime=currTime+timeToCall;return id};if(!window.cancelAnimationFrame)window.cancelAnimationFrame=function(id){clearTimeout(id)}}},{key:"detect3d",value:function detect3d(){var el=document.createElement("p"),t,has3d,transforms={WebkitTransform:"-webkit-transform",OTransform:"-o-transform",MSTransform:"-ms-transform",MozTransform:"-moz-transform",transform:"transform"};document.body.insertBefore(el,document.body.lastChild);for(t in transforms){if(el.style[t]!==undefined){el.style[t]="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)";has3d=window.getComputedStyle(el).getPropertyValue(transforms[t])}}el.parentNode.removeChild(el);if(has3d!==undefined){return has3d!=="none"}else{return false}}}]);return BackgroundVideo}();return BackgroundVideo});
/**
 * @license
 * Video.js 6.0.0 <http://videojs.com/>
 * Copyright Brightcove, Inc. <https://www.brightcove.com/>
 * Available under Apache License Version 2.0
 * <https://github.com/videojs/video.js/blob/master/LICENSE>
 *
 * Includes vtt.js <https://github.com/mozilla/vtt.js>
 * Available under Apache License Version 2.0
 * <https://github.com/mozilla/vtt.js/blob/master/LICENSE>
 */
!function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;b="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,b.videojs=a()}}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(2),i=d(h),j=a(5),k=d(j),l=function(a){function b(){return e(this,b),f(this,a.apply(this,arguments))}return g(b,a),b.prototype.buildCSSClass=function(){return"vjs-big-play-button"},b.prototype.handleClick=function(a){var b=this.player_.play(),c=this.player_.getChild("controlBar"),d=c&&c.getChild("playToggle");if(!d)return void this.player_.focus();b?b.then(function(){return d.focus()}):this.setTimeout(function(){d.focus()},1)},b}(i["default"]);l.prototype.controlText_="Play Video",k["default"].registerComponent("BigPlayButton",l),c["default"]=l},{2:2,5:5}],2:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(3),i=d(h),j=a(5),k=d(j),l=a(91),m=d(l),n=a(93),o=function(a){function b(){return e(this,b),f(this,a.apply(this,arguments))}return g(b,a),b.prototype.createEl=function(a){var b=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},c=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};a="button",b=(0,n.assign)({innerHTML:'<span aria-hidden="true" class="vjs-icon-placeholder"></span>',className:this.buildCSSClass()},b),c=(0,n.assign)({type:"button","aria-live":"polite"},c);var d=k["default"].prototype.createEl.call(this,a,b,c);return this.createControlTextEl(d),d},b.prototype.addChild=function(a){var b=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},c=this.constructor.name;return m["default"].warn("Adding an actionable (user controllable) child to a Button ("+c+") is not supported; use a ClickableComponent instead."),k["default"].prototype.addChild.call(this,a,b)},b.prototype.enable=function(){a.prototype.enable.call(this),this.el_.removeAttribute("disabled")},b.prototype.disable=function(){a.prototype.disable.call(this),this.el_.setAttribute("disabled","disabled")},b.prototype.handleKeyPress=function(b){32!==b.which&&13!==b.which&&a.prototype.handleKeyPress.call(this,b)},b}(i["default"]);k["default"].registerComponent("Button",o),c["default"]=o},{3:3,5:5,91:91,93:93}],3:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(5),j=e(i),k=a(85),l=d(k),m=a(86),n=d(m),o=a(88),p=d(o),q=a(91),r=e(q),s=a(99),t=e(s),u=a(93),v=function(a){function b(c,d){f(this,b);var e=g(this,a.call(this,c,d));return e.emitTapEvents(),e.enable(),e}return h(b,a),b.prototype.createEl=function(){var b=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"div",c=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},d=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};c=(0,u.assign)({innerHTML:'<span aria-hidden="true" class="vjs-icon-placeholder"></span>',className:this.buildCSSClass(),tabIndex:0},c),"button"===b&&r["default"].error("Creating a ClickableComponent with an HTML element of "+b+" is not supported; use a Button instead."),d=(0,u.assign)({role:"button","aria-live":"polite"},d),this.tabIndex_=c.tabIndex;var e=a.prototype.createEl.call(this,b,c,d);return this.createControlTextEl(e),e},b.prototype.createControlTextEl=function(a){return this.controlTextEl_=l.createEl("span",{className:"vjs-control-text"}),a&&a.appendChild(this.controlTextEl_),this.controlText(this.controlText_,a),this.controlTextEl_},b.prototype.controlText=function(a){var b=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.el();if(!a)return this.controlText_||"Need Text";var c=this.localize(a);this.controlText_=a,this.controlTextEl_.innerHTML=c,this.nonIconControl||b.setAttribute("title",c)},b.prototype.buildCSSClass=function(){return"vjs-control vjs-button "+a.prototype.buildCSSClass.call(this)},b.prototype.enable=function(){this.removeClass("vjs-disabled"),this.el_.setAttribute("aria-disabled","false"),"undefined"!=typeof this.tabIndex_&&this.el_.setAttribute("tabIndex",this.tabIndex_),this.on("tap",this.handleClick),this.on("click",this.handleClick),this.on("focus",this.handleFocus),this.on("blur",this.handleBlur)},b.prototype.disable=function(){this.addClass("vjs-disabled"),this.el_.setAttribute("aria-disabled","true"),"undefined"!=typeof this.tabIndex_&&this.el_.removeAttribute("tabIndex"),this.off("tap",this.handleClick),this.off("click",this.handleClick),this.off("focus",this.handleFocus),this.off("blur",this.handleBlur)},b.prototype.handleClick=function(a){},b.prototype.handleFocus=function(a){n.on(t["default"],"keydown",p.bind(this,this.handleKeyPress))},b.prototype.handleKeyPress=function(b){32===b.which||13===b.which?(b.preventDefault(),this.trigger("click")):a.prototype.handleKeyPress&&a.prototype.handleKeyPress.call(this,b)},b.prototype.handleBlur=function(a){n.off(t["default"],"keydown",p.bind(this,this.handleKeyPress))},b}(j["default"]);j["default"].registerComponent("ClickableComponent",v),c["default"]=v},{5:5,85:85,86:86,88:88,91:91,93:93,99:99}],4:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(2),i=d(h),j=a(5),k=d(j),l=function(a){function b(c,d){e(this,b);var g=f(this,a.call(this,c,d));return g.controlText(d&&d.controlText||g.localize("Close")),g}return g(b,a),b.prototype.buildCSSClass=function(){return"vjs-close-button "+a.prototype.buildCSSClass.call(this)},b.prototype.handleClick=function(a){this.trigger({type:"close",bubbles:!1})},b}(i["default"]);k["default"].registerComponent("CloseButton",l),c["default"]=l},{2:2,5:5}],5:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}c.__esModule=!0;var g=a(100),h=e(g),i=a(53),j=e(i),k=a(54),l=e(k),m=a(85),n=d(m),o=a(84),p=d(o),q=a(88),r=d(q),s=a(90),t=d(s),u=a(91),v=e(u),w=a(96),x=e(w),y=a(92),z=e(y),A=function(){function a(b,c,d){if(f(this,a),!b&&this.play?this.player_=b=this:this.player_=b,this.options_=(0,z["default"])({},this.options_),c=this.options_=(0,z["default"])(this.options_,c),this.id_=c.id||c.el&&c.el.id,!this.id_){var e=b&&b.id&&b.id()||"no_player";this.id_=e+"_component_"+t.newGUID()}this.name_=c.name||null,c.el?this.el_=c.el:c.createEl!==!1&&(this.el_=this.createEl()),(0,j["default"])(this,{eventBusKey:this.el_?"el_":null}),(0,l["default"])(this,this.constructor.defaultState),this.children_=[],this.childIndex_={},this.childNameIndex_={},c.initChildren!==!1&&this.initChildren(),this.ready(d),c.reportTouchActivity!==!1&&this.enableTouchActivity()}return a.prototype.dispose=function(){if(this.trigger({type:"dispose",bubbles:!1}),this.children_)for(var a=this.children_.length-1;a>=0;a--)this.children_[a].dispose&&this.children_[a].dispose();this.children_=null,this.childIndex_=null,this.childNameIndex_=null,this.el_&&(this.el_.parentNode&&this.el_.parentNode.removeChild(this.el_),p.removeData(this.el_),this.el_=null)},a.prototype.player=function(){return this.player_},a.prototype.options=function(a){return v["default"].warn("this.options() has been deprecated and will be moved to the constructor in 6.0"),a?(this.options_=(0,z["default"])(this.options_,a),this.options_):this.options_},a.prototype.el=function(){return this.el_},a.prototype.createEl=function(a,b,c){return n.createEl(a,b,c)},a.prototype.localize=function(a,b){var c=arguments.length>2&&void 0!==arguments[2]?arguments[2]:a,d=this.player_.language&&this.player_.language(),e=this.player_.languages&&this.player_.languages(),f=e&&e[d],g=d&&d.split("-")[0],h=e&&e[g],i=c;return f&&f[a]?i=f[a]:h&&h[a]&&(i=h[a]),b&&(i=i.replace(/\{(\d+)\}/g,function(a,c){var d=b[c-1],e=d;return void 0===d&&(e=a),e})),i},a.prototype.contentEl=function(){return this.contentEl_||this.el_},a.prototype.id=function(){return this.id_},a.prototype.name=function(){return this.name_},a.prototype.children=function(){return this.children_},a.prototype.getChildById=function(a){return this.childIndex_[a]},a.prototype.getChild=function(a){if(a)return a=(0,x["default"])(a),this.childNameIndex_[a]},a.prototype.addChild=function(b){var c=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},d=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this.children_.length,e=void 0,f=void 0;if("string"==typeof b){f=(0,x["default"])(b);var g=c.componentClass||f;c.name=f;var h=a.getComponent(g);if(!h)throw new Error("Component "+g+" does not exist");if("function"!=typeof h)return null;e=new h(this.player_||this,c)}else e=b;if(this.children_.splice(d,0,e),"function"==typeof e.id&&(this.childIndex_[e.id()]=e),f=f||e.name&&(0,x["default"])(e.name()),f&&(this.childNameIndex_[f]=e),"function"==typeof e.el&&e.el()){var i=this.contentEl().children,j=i[d]||null;this.contentEl().insertBefore(e.el(),j)}return e},a.prototype.removeChild=function(a){if("string"==typeof a&&(a=this.getChild(a)),a&&this.children_){for(var b=!1,c=this.children_.length-1;c>=0;c--)if(this.children_[c]===a){b=!0,this.children_.splice(c,1);break}if(b){this.childIndex_[a.id()]=null,this.childNameIndex_[a.name()]=null;var d=a.el();d&&d.parentNode===this.contentEl()&&this.contentEl().removeChild(a.el())}}},a.prototype.initChildren=function(){var b=this,c=this.options_.children;if(c){var d=this.options_,e=function(a){var c=a.name,e=a.opts;if(void 0!==d[c]&&(e=d[c]),e!==!1){e===!0&&(e={}),e.playerOptions=b.options_.playerOptions;var f=b.addChild(c,e);f&&(b[c]=f)}},f=void 0,g=a.getComponent("Tech");f=Array.isArray(c)?c:Object.keys(c),f.concat(Object.keys(this.options_).filter(function(a){return!f.some(function(b){return"string"==typeof b?a===b:a===b.name})})).map(function(a){var d=void 0,e=void 0;return"string"==typeof a?(d=a,e=c[d]||b.options_[d]||{}):(d=a.name,e=a),{name:d,opts:e}}).filter(function(b){var c=a.getComponent(b.opts.componentClass||(0,x["default"])(b.name));return c&&!g.isTech(c)}).forEach(e)}},a.prototype.buildCSSClass=function(){return""},a.prototype.ready=function(a){var b=arguments.length>1&&void 0!==arguments[1]&&arguments[1];a&&(this.isReady_?b?a.call(this):this.setTimeout(a,1):(this.readyQueue_=this.readyQueue_||[],this.readyQueue_.push(a)))},a.prototype.triggerReady=function(){this.isReady_=!0,this.setTimeout(function(){var a=this.readyQueue_;this.readyQueue_=[],a&&a.length>0&&a.forEach(function(a){a.call(this)},this),this.trigger("ready")},1)},a.prototype.$=function(a,b){return n.$(a,b||this.contentEl())},a.prototype.$$=function(a,b){return n.$$(a,b||this.contentEl())},a.prototype.hasClass=function(a){return n.hasClass(this.el_,a)},a.prototype.addClass=function(a){n.addClass(this.el_,a)},a.prototype.removeClass=function(a){n.removeClass(this.el_,a)},a.prototype.toggleClass=function(a,b){n.toggleClass(this.el_,a,b)},a.prototype.show=function(){this.removeClass("vjs-hidden")},a.prototype.hide=function(){this.addClass("vjs-hidden")},a.prototype.lockShowing=function(){this.addClass("vjs-lock-showing")},a.prototype.unlockShowing=function(){this.removeClass("vjs-lock-showing")},a.prototype.getAttribute=function(a){return n.getAttribute(this.el_,a)},a.prototype.setAttribute=function(a,b){n.setAttribute(this.el_,a,b)},a.prototype.removeAttribute=function(a){n.removeAttribute(this.el_,a)},a.prototype.width=function(a,b){return this.dimension("width",a,b)},a.prototype.height=function(a,b){return this.dimension("height",a,b)},a.prototype.dimensions=function(a,b){this.width(a,!0),this.height(b)},a.prototype.dimension=function(a,b,c){if(void 0!==b)return null!==b&&b===b||(b=0),(""+b).indexOf("%")!==-1||(""+b).indexOf("px")!==-1?this.el_.style[a]=b:this.el_.style[a]="auto"===b?"":b+"px",void(c||this.trigger("componentresize"));if(!this.el_)return 0;var d=this.el_.style[a],e=d.indexOf("px");return e!==-1?parseInt(d.slice(0,e),10):parseInt(this.el_["offset"+(0,x["default"])(a)],10)},a.prototype.currentDimension=function(a){var b=0;if("width"!==a&&"height"!==a)throw new Error("currentDimension only accepts width or height value");if("function"==typeof h["default"].getComputedStyle){var c=h["default"].getComputedStyle(this.el_);b=c.getPropertyValue(a)||c[a]}if(b=parseFloat(b),0===b){var d="offset"+(0,x["default"])(a);b=this.el_[d]}return b},a.prototype.currentDimensions=function(){return{width:this.currentDimension("width"),height:this.currentDimension("height")}},a.prototype.currentWidth=function(){return this.currentDimension("width")},a.prototype.currentHeight=function(){return this.currentDimension("height")},a.prototype.focus=function(){this.el_.focus()},a.prototype.blur=function(){this.el_.blur()},a.prototype.emitTapEvents=function(){var a=0,b=null,c=void 0;this.on("touchstart",function(d){1===d.touches.length&&(b={pageX:d.touches[0].pageX,pageY:d.touches[0].pageY},a=(new Date).getTime(),c=!0)}),this.on("touchmove",function(a){if(a.touches.length>1)c=!1;else if(b){var d=a.touches[0].pageX-b.pageX,e=a.touches[0].pageY-b.pageY,f=Math.sqrt(d*d+e*e);f>10&&(c=!1)}});var d=function(){c=!1};this.on("touchleave",d),this.on("touchcancel",d),this.on("touchend",function(d){if(b=null,c===!0){(new Date).getTime()-a<200&&(d.preventDefault(),this.trigger("tap"))}})},a.prototype.enableTouchActivity=function(){if(this.player()&&this.player().reportUserActivity){var a=r.bind(this.player(),this.player().reportUserActivity),b=void 0;this.on("touchstart",function(){a(),this.clearInterval(b),b=this.setInterval(a,250)});var c=function(c){a(),this.clearInterval(b)};this.on("touchmove",a),this.on("touchend",c),this.on("touchcancel",c)}},a.prototype.setTimeout=function(a,b){a=r.bind(this,a);var c=h["default"].setTimeout(a,b),d=function(){this.clearTimeout(c)};return d.guid="vjs-timeout-"+c,this.on("dispose",d),c},a.prototype.clearTimeout=function(a){h["default"].clearTimeout(a);var b=function(){};return b.guid="vjs-timeout-"+a,this.off("dispose",b),a},a.prototype.setInterval=function(a,b){a=r.bind(this,a);var c=h["default"].setInterval(a,b),d=function(){this.clearInterval(c)};return d.guid="vjs-interval-"+c,this.on("dispose",d),c},a.prototype.clearInterval=function(a){h["default"].clearInterval(a);var b=function(){};return b.guid="vjs-interval-"+a,this.off("dispose",b),a},a.prototype.requestAnimationFrame=function(a){var b=this;if(this.supportsRaf_){a=r.bind(this,a);var c=h["default"].requestAnimationFrame(a),d=function(){return b.cancelAnimationFrame(c)};return d.guid="vjs-raf-"+c,this.on("dispose",d),c}return this.setTimeout(a,1e3/60)},a.prototype.cancelAnimationFrame=function(a){if(this.supportsRaf_){h["default"].cancelAnimationFrame(a);var b=function(){};return b.guid="vjs-raf-"+a,this.off("dispose",b),a}return this.clearTimeout(a)},a.registerComponent=function(b,c){if("string"!=typeof b||!b)throw new Error('Illegal component name, "'+b+'"; must be a non-empty string.');var d=a.getComponent("Tech"),e=d&&d.isTech(c),f=a===c||a.prototype.isPrototypeOf(c.prototype);if(e||!f){var g=void 0;throw g=e?"techs must be registered using Tech.registerTech()":"must be a Component subclass",new Error('Illegal component, "'+b+'"; '+g+".")}b=(0,x["default"])(b),a.components_||(a.components_={});var h=a.getComponent("Player");if("Player"===b&&h&&h.players){var i=h.players,j=Object.keys(i);if(i&&j.length>0&&j.map(function(a){return i[a]}).every(Boolean))throw new Error("Can not register Player component after player has been created.")}return a.components_[b]=c,c},a.getComponent=function(b){if(b)return b=(0,x["default"])(b),a.components_&&a.components_[b]?a.components_[b]:void 0},a}();A.prototype.supportsRaf_="function"==typeof h["default"].requestAnimationFrame&&"function"==typeof h["default"].cancelAnimationFrame,A.registerComponent("Component",A),c["default"]=A},{100:100,53:53,54:54,84:84,85:85,88:88,90:90,91:91,92:92,96:96}],6:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(38),i=d(h),j=a(5),k=d(j),l=a(7),m=d(l),n=function(a){function b(c){var d=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return e(this,b),d.tracks=c.audioTracks(),f(this,a.call(this,c,d))}return g(b,a),b.prototype.buildCSSClass=function(){return"vjs-audio-button "+a.prototype.buildCSSClass.call(this)},b.prototype.buildWrapperCSSClass=function(){return"vjs-audio-button "+a.prototype.buildWrapperCSSClass.call(this)},b.prototype.createItems=function(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];this.hideThreshold_=1;for(var b=this.player_.audioTracks(),c=0;c<b.length;c++){var d=b[c];a.push(new m["default"](this.player_,{track:d,selectable:!0}))}return a},b}(i["default"]);n.prototype.controlText_="Audio Track",k["default"].registerComponent("AudioTrackButton",n),c["default"]=n},{38:38,5:5,7:7}],7:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(51),j=e(i),k=a(5),l=e(k),m=a(88),n=d(m),o=function(a){function b(c,d){f(this,b);var e=d.track,h=c.audioTracks();d.label=e.label||e.language||"Unknown",d.selected=e.enabled;var i=g(this,a.call(this,c,d));i.track=e;var j=n.bind(i,i.handleTracksChange);return h.addEventListener("change",j),i.on("dispose",function(){h.removeEventListener("change",j)}),i}return h(b,a),b.prototype.handleClick=function(b){var c=this.player_.audioTracks();a.prototype.handleClick.call(this,b);for(var d=0;d<c.length;d++){var e=c[d];e.enabled=e===this.track}},b.prototype.handleTracksChange=function(a){this.selected(this.track.enabled)},b}(j["default"]);l["default"].registerComponent("AudioTrackMenuItem",o),c["default"]=o},{5:5,51:51,88:88}],8:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(5),i=d(h);a(12),a(34),a(35),a(37),a(36),a(10),a(18),a(9),a(43),a(25),a(27),a(31),a(24),a(29),a(6),a(13),a(21);var j=function(a){function b(){return e(this,b),f(this,a.apply(this,arguments))}return g(b,a),b.prototype.createEl=function(){return a.prototype.createEl.call(this,"div",{className:"vjs-control-bar",dir:"ltr"},{role:"group"})},b}(i["default"]);j.prototype.options_={children:["playToggle","volumePanel","currentTimeDisplay","timeDivider","durationDisplay","progressControl","liveDisplay","remainingTimeDisplay","customControlSpacer","playbackRateMenuButton","chaptersButton","descriptionsButton","subsCapsButton","audioTrackButton","fullscreenToggle"]},i["default"].registerComponent("ControlBar",j),c["default"]=j},{10:10,12:12,13:13,18:18,21:21,24:24,25:25,27:27,29:29,31:31,34:34,35:35,36:36,37:37,43:43,5:5,6:6,9:9}],9:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(2),i=d(h),j=a(5),k=d(j),l=function(a){function b(c,d){e(this,b);var g=f(this,a.call(this,c,d));return g.on(c,"fullscreenchange",g.handleFullscreenChange),g}return g(b,a),b.prototype.buildCSSClass=function(){return"vjs-fullscreen-control "+a.prototype.buildCSSClass.call(this)},b.prototype.handleFullscreenChange=function(a){this.player_.isFullscreen()?this.controlText("Non-Fullscreen"):this.controlText("Fullscreen")},b.prototype.handleClick=function(a){this.player_.isFullscreen()?this.player_.exitFullscreen():this.player_.requestFullscreen()},b}(i["default"]);l.prototype.controlText_="Fullscreen",k["default"].registerComponent("FullscreenToggle",l),c["default"]=l},{2:2,5:5}],10:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(5),j=e(i),k=a(85),l=d(k),m=function(a){function b(c,d){f(this,b);var e=g(this,a.call(this,c,d));return e.updateShowing(),e.on(e.player(),"durationchange",e.updateShowing),e}return h(b,a),b.prototype.createEl=function(){var b=a.prototype.createEl.call(this,"div",{className:"vjs-live-control vjs-control"});return this.contentEl_=l.createEl("div",{className:"vjs-live-display",innerHTML:'<span class="vjs-control-text">'+this.localize("Stream Type")+"</span>"+this.localize("LIVE")},{"aria-live":"off"}),b.appendChild(this.contentEl_),b},b.prototype.updateShowing=function(a){this.player().duration()===1/0?this.show():this.hide()},b}(j["default"]);j["default"].registerComponent("LiveDisplay",m),c["default"]=m},{5:5,85:85}],11:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(2),j=e(i),k=a(5),l=e(k),m=a(85),n=d(m),o=a(39),p=e(o),q=function(a){function b(c,d){f(this,b);var e=g(this,a.call(this,c,d));return(0,p["default"])(e,c),e.on(c,["loadstart","volumechange"],e.update),e}return h(b,a),b.prototype.buildCSSClass=function(){return"vjs-mute-control "+a.prototype.buildCSSClass.call(this)},b.prototype.handleClick=function(a){var b=this.player_.volume(),c=this.player_.lastVolume_();if(0===b){var d=c<.1?.1:c;this.player_.volume(d),this.player_.muted(!1)}else this.player_.muted(!this.player_.muted())},b.prototype.update=function(a){this.updateIcon_(),this.updateControlText_()},b.prototype.updateIcon_=function(){var a=this.player_.volume(),b=3;0===a||this.player_.muted()?b=0:a<.33?b=1:a<.67&&(b=2);for(var c=0;c<4;c++)n.removeClass(this.el_,"vjs-vol-"+c);n.addClass(this.el_,"vjs-vol-"+b)},b.prototype.updateControlText_=function(){var a=this.player_.muted()||0===this.player_.volume(),b=a?"Unmute":"Mute";this.controlText()!==b&&this.controlText(b)},b}(j["default"]);q.prototype.controlText_="Mute",l["default"].registerComponent("MuteToggle",q),c["default"]=q},{2:2,39:39,5:5,85:85}],12:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(2),i=d(h),j=a(5),k=d(j),l=function(a){function b(c,d){e(this,b);var g=f(this,a.call(this,c,d));return g.on(c,"play",g.handlePlay),g.on(c,"pause",g.handlePause),g.on(c,"ended",g.handleEnded),g}return g(b,a),b.prototype.buildCSSClass=function(){return"vjs-play-control "+a.prototype.buildCSSClass.call(this)},b.prototype.handleClick=function(a){this.player_.paused()?this.player_.play():this.player_.pause()},b.prototype.handlePlay=function(a){this.removeClass("vjs-ended"),this.removeClass("vjs-paused"),this.addClass("vjs-playing"),this.controlText("Pause")},b.prototype.handlePause=function(a){this.removeClass("vjs-playing"),this.addClass("vjs-paused"),this.controlText("Play")},b.prototype.handleEnded=function(a){this.removeClass("vjs-playing"),this.addClass("vjs-ended"),this.controlText("Replay")},b}(i["default"]);l.prototype.controlText_="Play",k["default"].registerComponent("PlayToggle",l),c["default"]=l},{2:2,5:5}],13:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(50),j=e(i),k=a(52),l=e(k),m=a(14),n=e(m),o=a(5),p=e(o),q=a(85),r=d(q),s=function(a){function b(c,d){f(this,b);var e=g(this,a.call(this,c,d));return e.updateVisibility(),e.updateLabel(),e.on(c,"loadstart",e.updateVisibility),e.on(c,"ratechange",e.updateLabel),e}return h(b,a),b.prototype.createEl=function(){var b=a.prototype.createEl.call(this);return this.labelEl_=r.createEl("div",{className:"vjs-playback-rate-value",innerHTML:1}),b.appendChild(this.labelEl_),b},b.prototype.buildCSSClass=function(){return"vjs-playback-rate "+a.prototype.buildCSSClass.call(this)},b.prototype.buildWrapperCSSClass=function(){return"vjs-playback-rate "+a.prototype.buildWrapperCSSClass.call(this)},b.prototype.createMenu=function(){var a=new l["default"](this.player()),b=this.playbackRates();if(b)for(var c=b.length-1;c>=0;c--)a.addChild(new n["default"](this.player(),{rate:b[c]+"x"}));return a},b.prototype.updateARIAAttributes=function(){this.el().setAttribute("aria-valuenow",this.player().playbackRate())},b.prototype.handleClick=function(a){for(var b=this.player().playbackRate(),c=this.playbackRates(),d=c[0],e=0;e<c.length;e++)if(c[e]>b){d=c[e];break}this.player().playbackRate(d)},b.prototype.playbackRates=function(){
        return this.options_.playbackRates||this.options_.playerOptions&&this.options_.playerOptions.playbackRates},b.prototype.playbackRateSupported=function(){return this.player().tech_&&this.player().tech_.featuresPlaybackRate&&this.playbackRates()&&this.playbackRates().length>0},b.prototype.updateVisibility=function(a){this.playbackRateSupported()?this.removeClass("vjs-hidden"):this.addClass("vjs-hidden")},b.prototype.updateLabel=function(a){this.playbackRateSupported()&&(this.labelEl_.innerHTML=this.player().playbackRate()+"x")},b}(j["default"]);s.prototype.controlText_="Playback Rate",p["default"].registerComponent("PlaybackRateMenuButton",s),c["default"]=s},{14:14,5:5,50:50,52:52,85:85}],14:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(51),i=d(h),j=a(5),k=d(j),l=function(a){function b(c,d){e(this,b);var g=d.rate,h=parseFloat(g,10);d.label=g,d.selected=1===h,d.selectable=!0;var i=f(this,a.call(this,c,d));return i.label=g,i.rate=h,i.on(c,"ratechange",i.update),i}return g(b,a),b.prototype.handleClick=function(b){a.prototype.handleClick.call(this),this.player().playbackRate(this.rate)},b.prototype.update=function(a){this.selected(this.player().playbackRate()===this.rate)},b}(i["default"]);l.prototype.contentElType="button",k["default"].registerComponent("PlaybackRateMenuItem",l),c["default"]=l},{5:5,51:51}],15:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(5),j=e(i),k=a(85),l=d(k),m=function(a){function b(c,d){f(this,b);var e=g(this,a.call(this,c,d));return e.partEls_=[],e.on(c,"progress",e.update),e}return h(b,a),b.prototype.createEl=function(){return a.prototype.createEl.call(this,"div",{className:"vjs-load-progress",innerHTML:'<span class="vjs-control-text"><span>'+this.localize("Loaded")+"</span>: 0%</span>"})},b.prototype.update=function(a){var b=this.player_.buffered(),c=this.player_.duration(),d=this.player_.bufferedEnd(),e=this.partEls_,f=function(a,b){var c=a/b||0;return 100*(c>=1?1:c)+"%"};this.el_.style.width=f(d,c);for(var g=0;g<b.length;g++){var h=b.start(g),i=b.end(g),j=e[g];j||(j=this.el_.appendChild(l.createEl()),e[g]=j),j.style.left=f(h,d),j.style.width=f(i-h,d)}for(var k=e.length;k>b.length;k--)this.el_.removeChild(e[k-1]);e.length=b.length},b}(j["default"]);j["default"].registerComponent("LoadProgressBar",m),c["default"]=m},{5:5,85:85}],16:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(5),j=e(i),k=a(88),l=d(k),m=a(89),n=e(m);a(20);var o=function(a){function b(c,d){f(this,b);var e=g(this,a.call(this,c,d));return e.update=l.throttle(l.bind(e,e.update),25),e}return h(b,a),b.prototype.createEl=function(){return a.prototype.createEl.call(this,"div",{className:"vjs-mouse-display"})},b.prototype.update=function(a,b){var c=this;this.rafId_&&this.cancelAnimationFrame(this.rafId_),this.rafId_=this.requestAnimationFrame(function(){var d=c.player_.duration(),e=(0,n["default"])(b*d,d);c.el_.style.left=a.width*b+"px",c.getChild("timeTooltip").update(a,b,e)})},b}(j["default"]);o.prototype.options_={children:["timeTooltip"]},j["default"].registerComponent("MouseTimeDisplay",o),c["default"]=o},{20:20,5:5,88:88,89:89}],17:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(5),i=d(h),j=a(81),k=a(89),l=d(k);a(20);var m=function(a){function b(){return e(this,b),f(this,a.apply(this,arguments))}return g(b,a),b.prototype.createEl=function(){return a.prototype.createEl.call(this,"div",{className:"vjs-play-progress vjs-slider-bar",innerHTML:'<span class="vjs-control-text"><span>'+this.localize("Progress")+"</span>: 0%</span>"})},b.prototype.update=function(a,b){var c=this;this.rafId_&&this.cancelAnimationFrame(this.rafId_),this.rafId_=this.requestAnimationFrame(function(){var d=c.player_.scrubbing()?c.player_.getCache().currentTime:c.player_.currentTime(),e=(0,l["default"])(d,c.player_.duration()),f=c.getChild("timeTooltip");f&&f.update(a,b,e)})},b}(i["default"]);m.prototype.options_={children:[]},j.IE_VERSION&&!(j.IE_VERSION>8)||j.IS_IOS||j.IS_ANDROID||m.prototype.options_.children.push("timeTooltip"),i["default"].registerComponent("PlayProgressBar",m),c["default"]=m},{20:20,5:5,81:81,89:89}],18:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(5),j=e(i),k=a(85),l=d(k),m=a(88);a(19);var n=function(a){function b(c,d){f(this,b);var e=g(this,a.call(this,c,d));return e.handleMouseMove=(0,m.throttle)((0,m.bind)(e,e.handleMouseMove),25),e.on(e.el_,"mousemove",e.handleMouseMove),e.throttledHandleMouseSeek=(0,m.throttle)((0,m.bind)(e,e.handleMouseSeek),25),e.on(["mousedown","touchstart"],e.handleMouseDown),e}return h(b,a),b.prototype.createEl=function(){return a.prototype.createEl.call(this,"div",{className:"vjs-progress-control vjs-control"})},b.prototype.handleMouseMove=function(a){var b=this.getChild("seekBar"),c=b.getChild("mouseTimeDisplay"),d=b.el(),e=l.getBoundingClientRect(d),f=l.getPointerPosition(d,a).x;f>1?f=1:f<0&&(f=0),c&&c.update(e,f)},b.prototype.handleMouseSeek=function(a){this.getChild("seekBar").handleMouseMove(a)},b.prototype.handleMouseDown=function(a){var b=this.el_.ownerDocument;this.on(b,"mousemove",this.throttledHandleMouseSeek),this.on(b,"touchmove",this.throttledHandleMouseSeek),this.on(b,"mouseup",this.handleMouseUp),this.on(b,"touchend",this.handleMouseUp)},b.prototype.handleMouseUp=function(a){var b=this.el_.ownerDocument;this.off(b,"mousemove",this.throttledHandleMouseSeek),this.off(b,"touchmove",this.throttledHandleMouseSeek),this.off(b,"mouseup",this.handleMouseUp),this.off(b,"touchend",this.handleMouseUp)},b}(j["default"]);n.prototype.options_={children:["seekBar"]},j["default"].registerComponent("ProgressControl",n),c["default"]=n},{19:19,5:5,85:85,88:88}],19:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(60),j=e(i),k=a(5),l=e(k),m=a(81),n=a(85),o=d(n),p=a(88),q=d(p),r=a(89),s=e(r);a(15),a(17),a(16);var t=function(a){function b(c,d){f(this,b);var e=g(this,a.call(this,c,d));return e.update=q.throttle(q.bind(e,e.update),50),e.on(c,["timeupdate","ended"],e.update),e}return h(b,a),b.prototype.createEl=function(){return a.prototype.createEl.call(this,"div",{className:"vjs-progress-holder"},{"aria-label":this.localize("Progress Bar")})},b.prototype.update=function(){var b=a.prototype.update.call(this),c=this.player_.duration(),d=this.player_.scrubbing()?this.player_.getCache().currentTime:this.player_.currentTime();return this.el_.setAttribute("aria-valuenow",(100*b).toFixed(2)),this.el_.setAttribute("aria-valuetext",this.localize("progress bar timing: currentTime={1} duration={2}",[(0,s["default"])(d,c),(0,s["default"])(c,c)],"{1} of {2}")),this.bar.update(o.getBoundingClientRect(this.el_),b),b},b.prototype.getPercent=function(){var a=this.player_.scrubbing()?this.player_.getCache().currentTime:this.player_.currentTime(),b=a/this.player_.duration();return b>=1?1:b},b.prototype.handleMouseDown=function(b){this.player_.scrubbing(!0),this.videoWasPlaying=!this.player_.paused(),this.player_.pause(),a.prototype.handleMouseDown.call(this,b)},b.prototype.handleMouseMove=function(a){var b=this.calculateDistance(a)*this.player_.duration();b===this.player_.duration()&&(b-=.1),this.player_.currentTime(b)},b.prototype.handleMouseUp=function(b){a.prototype.handleMouseUp.call(this,b),this.player_.scrubbing(!1),this.videoWasPlaying&&this.player_.play()},b.prototype.stepForward=function(){this.player_.currentTime(this.player_.currentTime()+5)},b.prototype.stepBack=function(){this.player_.currentTime(this.player_.currentTime()-5)},b.prototype.handleAction=function(a){this.player_.paused()?this.player_.play():this.player_.pause()},b.prototype.handleKeyPress=function(b){32===b.which||13===b.which?(b.preventDefault(),this.handleAction(b)):a.prototype.handleKeyPress&&a.prototype.handleKeyPress.call(this,b)},b}(j["default"]);t.prototype.options_={children:["loadProgressBar","playProgressBar"],barName:"playProgressBar"},m.IE_VERSION&&!(m.IE_VERSION>8)||m.IS_IOS||m.IS_ANDROID||t.prototype.options_.children.splice(1,0,"mouseTimeDisplay"),t.prototype.playerEvent="timeupdate",l["default"].registerComponent("SeekBar",t),c["default"]=t},{15:15,16:16,17:17,5:5,60:60,81:81,85:85,88:88,89:89}],20:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(5),j=e(i),k=a(85),l=d(k),m=function(a){function b(){return f(this,b),g(this,a.apply(this,arguments))}return h(b,a),b.prototype.createEl=function(){return a.prototype.createEl.call(this,"div",{className:"vjs-time-tooltip"})},b.prototype.update=function(a,b,c){var d=l.getBoundingClientRect(this.el_),e=l.getBoundingClientRect(this.player_.el()),f=a.width*b;if(e&&d){var g=a.left-e.left+f,h=a.width-f+(e.right-a.right),i=d.width/2;g<i?i+=i-g:h<i&&(i=h),i<0?i=0:i>d.width&&(i=d.width),this.el_.style.right="-"+i+"px",l.textContent(this.el_,c)}},b}(j["default"]);j["default"].registerComponent("TimeTooltip",m),c["default"]=m},{5:5,85:85}],21:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(22),i=d(h),j=a(5),k=d(j),l=function(a){function b(){return e(this,b),f(this,a.apply(this,arguments))}return g(b,a),b.prototype.buildCSSClass=function(){return"vjs-custom-control-spacer "+a.prototype.buildCSSClass.call(this)},b.prototype.createEl=function(){var b=a.prototype.createEl.call(this,{className:this.buildCSSClass()});return b.innerHTML="&nbsp;",b},b}(i["default"]);k["default"].registerComponent("CustomControlSpacer",l),c["default"]=l},{22:22,5:5}],22:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(5),i=d(h),j=function(a){function b(){return e(this,b),f(this,a.apply(this,arguments))}return g(b,a),b.prototype.buildCSSClass=function(){return"vjs-spacer "+a.prototype.buildCSSClass.call(this)},b.prototype.createEl=function(){return a.prototype.createEl.call(this,"div",{className:this.buildCSSClass()})},b}(i["default"]);i["default"].registerComponent("Spacer",j),c["default"]=j},{5:5}],23:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(33),i=d(h),j=a(5),k=d(j),l=function(a){function b(c,d){e(this,b),d.track={player:c,kind:d.kind,label:d.kind+" settings",selectable:!1,"default":!1,mode:"disabled"},d.selectable=!1,d.name="CaptionSettingsMenuItem";var g=f(this,a.call(this,c,d));return g.addClass("vjs-texttrack-settings"),g.controlText(", opens "+d.kind+" settings dialog"),g}return g(b,a),b.prototype.handleClick=function(a){this.player().getChild("textTrackSettings").open()},b}(i["default"]);k["default"].registerComponent("CaptionSettingsMenuItem",l),c["default"]=l},{33:33,5:5}],24:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(32),i=d(h),j=a(5),k=d(j),l=a(23),m=d(l),n=function(a){function b(c,d,g){return e(this,b),f(this,a.call(this,c,d,g))}return g(b,a),b.prototype.buildCSSClass=function(){return"vjs-captions-button "+a.prototype.buildCSSClass.call(this)},b.prototype.buildWrapperCSSClass=function(){return"vjs-captions-button "+a.prototype.buildWrapperCSSClass.call(this)},b.prototype.createItems=function(){var b=[];return this.player().tech_&&this.player().tech_.featuresNativeTextTracks||(b.push(new m["default"](this.player_,{kind:this.kind_})),this.hideThreshold_+=1),a.prototype.createItems.call(this,b)},b}(i["default"]);n.prototype.kind_="captions",n.prototype.controlText_="Captions",k["default"].registerComponent("CaptionsButton",n),c["default"]=n},{23:23,32:32,5:5}],25:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(32),i=d(h),j=a(5),k=d(j),l=a(26),m=d(l),n=a(96),o=d(n),p=function(a){function b(c,d,g){return e(this,b),f(this,a.call(this,c,d,g))}return g(b,a),b.prototype.buildCSSClass=function(){return"vjs-chapters-button "+a.prototype.buildCSSClass.call(this)},b.prototype.buildWrapperCSSClass=function(){return"vjs-chapters-button "+a.prototype.buildWrapperCSSClass.call(this)},b.prototype.update=function(b){this.track_&&(!b||"addtrack"!==b.type&&"removetrack"!==b.type)||this.setTrack(this.findChaptersTrack()),a.prototype.update.call(this)},b.prototype.setTrack=function(a){if(this.track_!==a){if(this.updateHandler_||(this.updateHandler_=this.update.bind(this)),this.track_){var b=this.player_.remoteTextTrackEls().getTrackElementByTrack_(this.track_);b&&b.removeEventListener("load",this.updateHandler_),this.track_=null}if(this.track_=a,this.track_){this.track_.mode="hidden";var c=this.player_.remoteTextTrackEls().getTrackElementByTrack_(this.track_);c&&c.addEventListener("load",this.updateHandler_)}}},b.prototype.findChaptersTrack=function(){for(var a=this.player_.textTracks()||[],b=a.length-1;b>=0;b--){var c=a[b];if(c.kind===this.kind_)return c}},b.prototype.getMenuCaption=function(){return this.track_&&this.track_.label?this.track_.label:this.localize((0,o["default"])(this.kind_))},b.prototype.createMenu=function(){return this.options_.title=this.getMenuCaption(),a.prototype.createMenu.call(this)},b.prototype.createItems=function(){var a=[];if(!this.track_)return a;var b=this.track_.cues;if(!b)return a;for(var c=0,d=b.length;c<d;c++){var e=b[c],f=new m["default"](this.player_,{track:this.track_,cue:e});a.push(f)}return a},b}(i["default"]);p.prototype.kind_="chapters",p.prototype.controlText_="Chapters",k["default"].registerComponent("ChaptersButton",p),c["default"]=p},{26:26,32:32,5:5,96:96}],26:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(51),j=e(i),k=a(5),l=e(k),m=a(88),n=d(m),o=function(a){function b(c,d){f(this,b);var e=d.track,h=d.cue,i=c.currentTime();d.selectable=!0,d.label=h.text,d.selected=h.startTime<=i&&i<h.endTime;var j=g(this,a.call(this,c,d));return j.track=e,j.cue=h,e.addEventListener("cuechange",n.bind(j,j.update)),j}return h(b,a),b.prototype.handleClick=function(b){a.prototype.handleClick.call(this),this.player_.currentTime(this.cue.startTime),this.update(this.cue.startTime)},b.prototype.update=function(a){var b=this.cue,c=this.player_.currentTime();this.selected(b.startTime<=c&&c<b.endTime)},b}(j["default"]);l["default"].registerComponent("ChaptersTrackMenuItem",o),c["default"]=o},{5:5,51:51,88:88}],27:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(32),j=e(i),k=a(5),l=e(k),m=a(88),n=d(m),o=function(a){function b(c,d,e){f(this,b);var h=g(this,a.call(this,c,d,e)),i=c.textTracks(),j=n.bind(h,h.handleTracksChange);return i.addEventListener("change",j),h.on("dispose",function(){i.removeEventListener("change",j)}),h}return h(b,a),b.prototype.handleTracksChange=function(a){for(var b=this.player().textTracks(),c=!1,d=0,e=b.length;d<e;d++){var f=b[d];if(f.kind!==this.kind_&&"showing"===f.mode){c=!0;break}}c?this.disable():this.enable()},b.prototype.buildCSSClass=function(){return"vjs-descriptions-button "+a.prototype.buildCSSClass.call(this)},b.prototype.buildWrapperCSSClass=function(){return"vjs-descriptions-button "+a.prototype.buildWrapperCSSClass.call(this)},b}(j["default"]);o.prototype.kind_="descriptions",o.prototype.controlText_="Descriptions",l["default"].registerComponent("DescriptionsButton",o),c["default"]=o},{32:32,5:5,88:88}],28:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(33),i=d(h),j=a(5),k=d(j),l=function(a){function b(c,d){e(this,b),d.track={player:c,kind:d.kind,kinds:d.kinds,"default":!1,mode:"disabled"},d.kinds||(d.kinds=[d.kind]),d.label?d.track.label=d.label:d.track.label=d.kinds.join(" and ")+" off",d.selectable=!0;var g=f(this,a.call(this,c,d));return g.selected(!0),g}return g(b,a),b.prototype.handleTracksChange=function(a){for(var b=this.player().textTracks(),c=!0,d=0,e=b.length;d<e;d++){var f=b[d];if(this.options_.kinds.indexOf(f.kind)>-1&&"showing"===f.mode){c=!1;break}}this.selected(c)},b}(i["default"]);k["default"].registerComponent("OffTextTrackMenuItem",l),c["default"]=l},{33:33,5:5}],29:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(32),i=d(h),j=a(5),k=d(j),l=a(23),m=d(l),n=a(30),o=d(n),p=a(96),q=d(p),r=function(a){function b(c){var d=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};e(this,b);var g=f(this,a.call(this,c,d));return g.label_="subtitles",["en","en-us","en-ca","fr-ca"].indexOf(g.player_.language_)>-1&&(g.label_="captions"),g.menuButton_.controlText((0,q["default"])(g.label_)),g}return g(b,a),b.prototype.buildCSSClass=function(){return"vjs-subs-caps-button "+a.prototype.buildCSSClass.call(this)},b.prototype.buildWrapperCSSClass=function(){return"vjs-subs-caps-button "+a.prototype.buildWrapperCSSClass.call(this)},b.prototype.createItems=function(){var b=[];return this.player().tech_&&this.player().tech_.featuresNativeTextTracks||(b.push(new m["default"](this.player_,{kind:this.label_})),this.hideThreshold_+=1),b=a.prototype.createItems.call(this,b,o["default"])},b}(i["default"]);r.prototype.kinds_=["captions","subtitles"],r.prototype.controlText_="Subtitles",k["default"].registerComponent("SubsCapsButton",r),c["default"]=r},{23:23,30:30,32:32,5:5,96:96}],30:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(33),i=d(h),j=a(5),k=d(j),l=a(93),m=function(a){function b(){return e(this,b),f(this,a.apply(this,arguments))}return g(b,a),b.prototype.createEl=function(b,c,d){var e='<span class="vjs-menu-item-text">'+this.localize(this.options_.label);return"captions"===this.options_.track.kind&&(e+='\n        <span aria-hidden="true" class="vjs-icon-placeholder"></span>\n        <span class="vjs-control-text"> '+this.localize("Captions")+"</span>\n      "),e+="</span>",a.prototype.createEl.call(this,b,(0,l.assign)({innerHTML:e},c),d)},b}(i["default"]);k["default"].registerComponent("SubsCapsMenuItem",m),c["default"]=m},{33:33,5:5,93:93}],31:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(32),i=d(h),j=a(5),k=d(j),l=function(a){function b(c,d,g){return e(this,b),f(this,a.call(this,c,d,g))}return g(b,a),b.prototype.buildCSSClass=function(){return"vjs-subtitles-button "+a.prototype.buildCSSClass.call(this)},b.prototype.buildWrapperCSSClass=function(){return"vjs-subtitles-button "+a.prototype.buildWrapperCSSClass.call(this)},b}(i["default"]);l.prototype.kind_="subtitles",l.prototype.controlText_="Subtitles",k["default"].registerComponent("SubtitlesButton",l),c["default"]=l},{32:32,5:5}],32:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(38),i=d(h),j=a(5),k=d(j),l=a(33),m=d(l),n=a(28),o=d(n),p=function(a){function b(c){var d=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};e(this,b),d.tracks=c.textTracks();var g=f(this,a.call(this,c,d));return Array.isArray(g.kinds_)||(g.kinds_=[g.kind_]),g}return g(b,a),b.prototype.createItems=function(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],b=arguments.length>1&&void 0!==arguments[1]?arguments[1]:m["default"],c=void 0;this.label_&&(c=this.label_+" off"),a.push(new o["default"](this.player_,{kinds:this.kinds_,kind:this.kind_,label:c})),this.hideThreshold_+=1;for(var d=this.player_.textTracks(),e=0;e<d.length;e++){var f=d[e];if(this.kinds_.indexOf(f.kind)>-1){var g=new b(this.player_,{track:f,selectable:!0});g.addClass("vjs-"+f.kind+"-menu-item"),a.push(g)}}return a},b}(i["default"]);k["default"].registerComponent("TextTrackButton",p),c["default"]=p},{28:28,33:33,38:38,5:5}],33:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){
        if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},j=a(51),k=e(j),l=a(5),m=e(l),n=a(88),o=d(n),p=a(100),q=e(p),r=a(99),s=e(r),t=function(a){function b(c,d){f(this,b);var e=d.track,h=c.textTracks();d.label=e.label||e.language||"Unknown",d.selected=e["default"]||"showing"===e.mode;var j=g(this,a.call(this,c,d));j.track=e;var k=o.bind(j,j.handleTracksChange);if(c.on(["loadstart","texttrackchange"],k),h.addEventListener("change",k),j.on("dispose",function(){h.removeEventListener("change",k)}),void 0===h.onchange){var l=void 0;j.on(["tap","click"],function(){if("object"!==i(q["default"].Event))try{l=new q["default"].Event("change")}catch(a){}l||(l=s["default"].createEvent("Event"),l.initEvent("change",!0,!0)),h.dispatchEvent(l)})}return j}return h(b,a),b.prototype.handleClick=function(b){var c=this.track.kind,d=this.track.kinds,e=this.player_.textTracks();if(d||(d=[c]),a.prototype.handleClick.call(this,b),e)for(var f=0;f<e.length;f++){var g=e[f];g===this.track&&d.indexOf(g.kind)>-1?g.mode="showing":g.mode="disabled"}},b.prototype.handleTracksChange=function(a){this.selected("showing"===this.track.mode)},b}(k["default"]);m["default"].registerComponent("TextTrackMenuItem",t),c["default"]=t},{100:100,5:5,51:51,88:88,99:99}],34:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(5),j=e(i),k=a(85),l=d(k),m=a(89),n=e(m),o=function(a){function b(c,d){f(this,b);var e=g(this,a.call(this,c,d));return e.on(c,"timeupdate",e.updateContent),e}return h(b,a),b.prototype.createEl=function(){var b=a.prototype.createEl.call(this,"div",{className:"vjs-current-time vjs-time-control vjs-control"});return this.contentEl_=l.createEl("div",{className:"vjs-current-time-display",innerHTML:'<span class="vjs-control-text">Current Time </span>0:00'},{"aria-live":"off"}),b.appendChild(this.contentEl_),b},b.prototype.updateContent=function(a){var b=this.player_.scrubbing()?this.player_.getCache().currentTime:this.player_.currentTime(),c=this.localize("Current Time"),d=(0,n["default"])(b,this.player_.duration());d!==this.formattedTime_&&(this.formattedTime_=d,this.contentEl_.innerHTML='<span class="vjs-control-text">'+c+"</span> "+d)},b}(j["default"]);j["default"].registerComponent("CurrentTimeDisplay",o),c["default"]=o},{5:5,85:85,89:89}],35:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(5),j=e(i),k=a(85),l=d(k),m=a(89),n=e(m),o=function(a){function b(c,d){f(this,b);var e=g(this,a.call(this,c,d));return e.on(c,"durationchange",e.updateContent),e.on(c,"timeupdate",e.updateContent),e.on(c,"loadedmetadata",e.updateContent),e}return h(b,a),b.prototype.createEl=function(){var b=a.prototype.createEl.call(this,"div",{className:"vjs-duration vjs-time-control vjs-control"});return this.contentEl_=l.createEl("div",{className:"vjs-duration-display",innerHTML:'<span class="vjs-control-text">'+this.localize("Duration Time")+"</span> 0:00"},{"aria-live":"off"}),b.appendChild(this.contentEl_),b},b.prototype.updateContent=function(a){var b=this.player_.duration();if(b&&this.duration_!==b){this.duration_=b;var c=this.localize("Duration Time"),d=(0,n["default"])(b);this.contentEl_.innerHTML='<span class="vjs-control-text">'+c+"</span> "+d}},b}(j["default"]);j["default"].registerComponent("DurationDisplay",o),c["default"]=o},{5:5,85:85,89:89}],36:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(5),j=e(i),k=a(85),l=d(k),m=a(89),n=e(m),o=function(a){function b(c,d){f(this,b);var e=g(this,a.call(this,c,d));return e.on(c,"timeupdate",e.updateContent),e.on(c,"durationchange",e.updateContent),e}return h(b,a),b.prototype.createEl=function(){var b=a.prototype.createEl.call(this,"div",{className:"vjs-remaining-time vjs-time-control vjs-control"});return this.contentEl_=l.createEl("div",{className:"vjs-remaining-time-display",innerHTML:'<span class="vjs-control-text">'+this.localize("Remaining Time")+"</span> -0:00"},{"aria-live":"off"}),b.appendChild(this.contentEl_),b},b.prototype.updateContent=function(a){if(this.player_.duration()){var b=this.localize("Remaining Time"),c=(0,n["default"])(this.player_.remainingTime());c!==this.formattedTime_&&(this.formattedTime_=c,this.contentEl_.innerHTML='<span class="vjs-control-text">'+b+"</span> -"+c)}},b}(j["default"]);j["default"].registerComponent("RemainingTimeDisplay",o),c["default"]=o},{5:5,85:85,89:89}],37:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(5),i=d(h),j=function(a){function b(){return e(this,b),f(this,a.apply(this,arguments))}return g(b,a),b.prototype.createEl=function(){return a.prototype.createEl.call(this,"div",{className:"vjs-time-control vjs-time-divider",innerHTML:"<div><span>/</span></div>"})},b}(i["default"]);i["default"].registerComponent("TimeDivider",j),c["default"]=j},{5:5}],38:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(50),j=e(i),k=a(5),l=e(k),m=a(88),n=d(m),o=function(a){function b(c,d){f(this,b);var e=d.tracks,h=g(this,a.call(this,c,d));if(h.items.length<=1&&h.hide(),!e)return g(h);var i=n.bind(h,h.update);return e.addEventListener("removetrack",i),e.addEventListener("addtrack",i),h.player_.on("ready",i),h.player_.on("dispose",function(){e.removeEventListener("removetrack",i),e.removeEventListener("addtrack",i)}),h}return h(b,a),b}(j["default"]);l["default"].registerComponent("TrackButton",o),c["default"]=o},{5:5,50:50,88:88}],39:[function(a,b,c){"use strict";c.__esModule=!0;var d=function(a,b){b.tech_&&!b.tech_.featuresVolumeControl&&a.addClass("vjs-hidden"),a.on(b,"loadstart",function(){b.tech_.featuresVolumeControl?a.removeClass("vjs-hidden"):a.addClass("vjs-hidden")})};c["default"]=d},{}],40:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(60),i=d(h),j=a(5),k=d(j);a(42);var l=function(a){function b(c,d){e(this,b);var g=f(this,a.call(this,c,d));return g.on("slideractive",g.updateLastVolume_),g.on(c,"volumechange",g.updateARIAAttributes),c.ready(function(){return g.updateARIAAttributes()}),g}return g(b,a),b.prototype.createEl=function(){return a.prototype.createEl.call(this,"div",{className:"vjs-volume-bar vjs-slider-bar"},{"aria-label":this.localize("Volume Level"),"aria-live":"polite"})},b.prototype.handleMouseMove=function(a){this.checkMuted(),this.player_.volume(this.calculateDistance(a))},b.prototype.checkMuted=function(){this.player_.muted()&&this.player_.muted(!1)},b.prototype.getPercent=function(){return this.player_.muted()?0:this.player_.volume()},b.prototype.stepForward=function(){this.checkMuted(),this.player_.volume(this.player_.volume()+.1)},b.prototype.stepBack=function(){this.checkMuted(),this.player_.volume(this.player_.volume()-.1)},b.prototype.updateARIAAttributes=function(a){var b=this.player_.muted()?0:this.volumeAsPercentage_();this.el_.setAttribute("aria-valuenow",b),this.el_.setAttribute("aria-valuetext",b+"%")},b.prototype.volumeAsPercentage_=function(){return Math.round(100*this.player_.volume())},b.prototype.updateLastVolume_=function(){var a=this,b=this.player_.volume();this.one("sliderinactive",function(){0===a.player_.volume()&&a.player_.lastVolume_(b)})},b}(i["default"]);l.prototype.options_={children:["volumeLevel"],barName:"volumeLevel"},l.prototype.playerEvent="volumechange",k["default"].registerComponent("VolumeBar",l),c["default"]=l},{42:42,5:5,60:60}],41:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(5),i=d(h),j=a(39),k=d(j),l=a(93),m=a(88);a(40);var n=function(a){function b(c){var d=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};e(this,b),d.vertical=d.vertical||!1,("undefined"==typeof d.volumeBar||(0,l.isPlain)(d.volumeBar))&&(d.volumeBar=d.volumeBar||{},d.volumeBar.vertical=d.vertical);var g=f(this,a.call(this,c,d));return(0,k["default"])(g,c),g.throttledHandleMouseMove=(0,m.throttle)((0,m.bind)(g,g.handleMouseMove),25),g.on("mousedown",g.handleMouseDown),g.on("touchstart",g.handleMouseDown),g.on(g.volumeBar,["focus","slideractive"],function(){g.volumeBar.addClass("vjs-slider-active"),g.addClass("vjs-slider-active"),g.trigger("slideractive")}),g.on(g.volumeBar,["blur","sliderinactive"],function(){g.volumeBar.removeClass("vjs-slider-active"),g.removeClass("vjs-slider-active"),g.trigger("sliderinactive")}),g}return g(b,a),b.prototype.createEl=function(){var b="vjs-volume-horizontal";return this.options_.vertical&&(b="vjs-volume-vertical"),a.prototype.createEl.call(this,"div",{className:"vjs-volume-control vjs-control "+b})},b.prototype.handleMouseDown=function(a){var b=this.el_.ownerDocument;this.on(b,"mousemove",this.throttledHandleMouseMove),this.on(b,"touchmove",this.throttledHandleMouseMove),this.on(b,"mouseup",this.handleMouseUp),this.on(b,"touchend",this.handleMouseUp)},b.prototype.handleMouseUp=function(a){var b=this.el_.ownerDocument;this.off(b,"mousemove",this.throttledHandleMouseMove),this.off(b,"touchmove",this.throttledHandleMouseMove),this.off(b,"mouseup",this.handleMouseUp),this.off(b,"touchend",this.handleMouseUp)},b.prototype.handleMouseMove=function(a){this.volumeBar.handleMouseMove(a)},b}(i["default"]);n.prototype.options_={children:["volumeBar"]},i["default"].registerComponent("VolumeControl",n),c["default"]=n},{39:39,40:40,5:5,88:88,93:93}],42:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(5),i=d(h),j=function(a){function b(){return e(this,b),f(this,a.apply(this,arguments))}return g(b,a),b.prototype.createEl=function(){return a.prototype.createEl.call(this,"div",{className:"vjs-volume-level",innerHTML:'<span class="vjs-control-text"></span>'})},b}(i["default"]);i["default"].registerComponent("VolumeLevel",j),c["default"]=j},{5:5}],43:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(5),i=d(h),j=a(39),k=d(j),l=a(93);a(41),a(11);var m=function(a){function b(c){var d=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};e(this,b),"undefined"!=typeof d.inline?d.inline=d.inline:d.inline=!0,("undefined"==typeof d.volumeControl||(0,l.isPlain)(d.volumeControl))&&(d.volumeControl=d.volumeControl||{},d.volumeControl.vertical=!d.inline);var g=f(this,a.call(this,c,d));return(0,k["default"])(g,c),g.on(g.volumeControl,["slideractive"],g.sliderActive_),g.on(g.muteToggle,"focus",g.sliderActive_),g.on(g.volumeControl,["sliderinactive"],g.sliderInactive_),g.on(g.muteToggle,"blur",g.sliderInactive_),g}return g(b,a),b.prototype.sliderActive_=function(){this.addClass("vjs-slider-active")},b.prototype.sliderInactive_=function(){this.removeClass("vjs-slider-active")},b.prototype.createEl=function(){var b="vjs-volume-panel-horizontal";return this.options_.inline||(b="vjs-volume-panel-vertical"),a.prototype.createEl.call(this,"div",{className:"vjs-volume-panel vjs-control "+b})},b}(i["default"]);m.prototype.options_={children:["muteToggle","volumeControl"]},i["default"].registerComponent("VolumePanel",m),c["default"]=m},{11:11,39:39,41:41,5:5,93:93}],44:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(5),i=d(h),j=a(55),k=d(j),l=a(92),m=d(l),n=function(a){function b(c,d){e(this,b);var g=f(this,a.call(this,c,d));return g.on(c,"error",g.open),g}return g(b,a),b.prototype.buildCSSClass=function(){return"vjs-error-display "+a.prototype.buildCSSClass.call(this)},b.prototype.content=function(){var a=this.player().error();return a?this.localize(a.message):""},b}(k["default"]);n.prototype.options_=(0,m["default"])(k["default"].prototype.options_,{pauseOnOpen:!1,fillAlways:!0,temporary:!1,uncloseable:!0}),i["default"].registerComponent("ErrorDisplay",n),c["default"]=n},{5:5,55:55,92:92}],45:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}c.__esModule=!0;var e=a(86),f=d(e),g=function(){};g.prototype.allowedEvents_={},g.prototype.on=function(a,b){var c=this.addEventListener;this.addEventListener=function(){},f.on(this,a,b),this.addEventListener=c},g.prototype.addEventListener=g.prototype.on,g.prototype.off=function(a,b){f.off(this,a,b)},g.prototype.removeEventListener=g.prototype.off,g.prototype.one=function(a,b){var c=this.addEventListener;this.addEventListener=function(){},f.one(this,a,b),this.addEventListener=c},g.prototype.trigger=function(a){var b=a.type||a;"string"==typeof a&&(a={type:b}),a=f.fixEvent(a),this.allowedEvents_[b]&&this["on"+b]&&this["on"+b](a),f.trigger(this,a)},g.prototype.dispatchEvent=g.prototype.trigger,c["default"]=g},{86:86}],46:[function(a,b,c){"use strict";c.__esModule=!0;var d="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},e=function(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+(void 0===b?"undefined":d(b)));a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(a.super_=b)},f=function(a){var b=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},c=function(){a.apply(this,arguments)},f={};"object"===(void 0===b?"undefined":d(b))?(b.constructor!==Object.prototype.constructor&&(c=b.constructor),f=b):"function"==typeof b&&(c=b),e(c,a);for(var g in f)f.hasOwnProperty(g)&&(c.prototype[g]=f[g]);return c};c["default"]=f},{}],47:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}c.__esModule=!0;for(var e=a(99),f=d(e),g={},h=[["requestFullscreen","exitFullscreen","fullscreenElement","fullscreenEnabled","fullscreenchange","fullscreenerror"],["webkitRequestFullscreen","webkitExitFullscreen","webkitFullscreenElement","webkitFullscreenEnabled","webkitfullscreenchange","webkitfullscreenerror"],["webkitRequestFullScreen","webkitCancelFullScreen","webkitCurrentFullScreenElement","webkitCancelFullScreen","webkitfullscreenchange","webkitfullscreenerror"],["mozRequestFullScreen","mozCancelFullScreen","mozFullScreenElement","mozFullScreenEnabled","mozfullscreenchange","mozfullscreenerror"],["msRequestFullscreen","msExitFullscreen","msFullscreenElement","msFullscreenEnabled","MSFullscreenChange","MSFullscreenError"]],i=h[0],j=void 0,k=0;k<h.length;k++)if(h[k][1]in f["default"]){j=h[k];break}if(j)for(var l=0;l<j.length;l++)g[i[l]]=j[l];c["default"]=g},{99:99}],48:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(5),i=d(h),j=function(a){function b(){return e(this,b),f(this,a.apply(this,arguments))}return g(b,a),b.prototype.createEl=function(){return a.prototype.createEl.call(this,"div",{className:"vjs-loading-spinner",dir:"ltr"})},b}(i["default"]);i["default"].registerComponent("LoadingSpinner",j),c["default"]=j},{5:5}],49:[function(a,b,c){"use strict";function d(a){if(a instanceof d)return a;"number"==typeof a?this.code=a:"string"==typeof a?this.message=a:(0,e.isObject)(a)&&("number"==typeof a.code&&(this.code=a.code),(0,e.assign)(this,a)),this.message||(this.message=d.defaultMessages[this.code]||"")}c.__esModule=!0;var e=a(93);d.prototype.code=0,d.prototype.message="",d.prototype.status=null,d.errorTypes=["MEDIA_ERR_CUSTOM","MEDIA_ERR_ABORTED","MEDIA_ERR_NETWORK","MEDIA_ERR_DECODE","MEDIA_ERR_SRC_NOT_SUPPORTED","MEDIA_ERR_ENCRYPTED"],d.defaultMessages={1:"You aborted the media playback",2:"A network error caused the media download to fail part-way.",3:"The media playback was aborted due to a corruption problem or because the media used features your browser did not support.",4:"The media could not be loaded, either because the server or network failed or because the format is not supported.",5:"The media is encrypted and we do not have the keys to decrypt it."};for(var f=0;f<d.errorTypes.length;f++)d[d.errorTypes[f]]=f,d.prototype[d.errorTypes[f]]=f;c["default"]=d},{93:93}],50:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(2),j=e(i),k=a(5),l=e(k),m=a(52),n=e(m),o=a(85),p=d(o),q=a(88),r=d(q),s=a(86),t=d(s),u=a(96),v=e(u),w=a(99),x=e(w),y=function(a){function b(c){var d=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};f(this,b);var e=g(this,a.call(this,c,d));e.menuButton_=new j["default"](c,d),e.menuButton_.controlText(e.controlText_),e.menuButton_.el_.setAttribute("aria-haspopup","true");var h=j["default"].prototype.buildCSSClass();return e.menuButton_.el_.className=e.buildCSSClass()+" "+h,e.menuButton_.removeClass("vjs-control"),e.addChild(e.menuButton_),e.update(),e.enabled_=!0,e.on(e.menuButton_,"tap",e.handleClick),e.on(e.menuButton_,"click",e.handleClick),e.on(e.menuButton_,"focus",e.handleFocus),e.on(e.menuButton_,"blur",e.handleBlur),e.on("keydown",e.handleSubmenuKeyPress),e}return h(b,a),b.prototype.update=function(){var a=this.createMenu();this.menu&&this.removeChild(this.menu),this.menu=a,this.addChild(a),this.buttonPressed_=!1,this.menuButton_.el_.setAttribute("aria-expanded","false"),this.items&&this.items.length<=this.hideThreshold_?this.hide():this.show()},b.prototype.createMenu=function(){var a=new n["default"](this.player_,{menuButton:this});if(this.hideThreshold_=0,this.options_.title){var b=p.createEl("li",{className:"vjs-menu-title",innerHTML:(0,v["default"])(this.options_.title),tabIndex:-1});this.hideThreshold_+=1,a.children_.unshift(b),p.prependTo(b,a.contentEl())}if(this.items=this.createItems(),this.items)for(var c=0;c<this.items.length;c++)a.addItem(this.items[c]);return a},b.prototype.createItems=function(){},b.prototype.createEl=function(){return a.prototype.createEl.call(this,"div",{className:this.buildWrapperCSSClass()},{})},b.prototype.buildWrapperCSSClass=function(){var b="vjs-menu-button";return b+=this.options_.inline===!0?"-inline":"-popup","vjs-menu-button "+b+" "+j["default"].prototype.buildCSSClass()+" "+a.prototype.buildCSSClass.call(this)},b.prototype.buildCSSClass=function(){var b="vjs-menu-button";return b+=this.options_.inline===!0?"-inline":"-popup","vjs-menu-button "+b+" "+a.prototype.buildCSSClass.call(this)},b.prototype.controlText=function(a){var b=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.menuButton_.el();return this.menuButton_.controlText(a,b)},b.prototype.handleClick=function(a){this.one(this.menu.contentEl(),"mouseleave",r.bind(this,function(a){this.unpressButton(),this.el_.blur()})),this.buttonPressed_?this.unpressButton():this.pressButton()},b.prototype.focus=function(){this.menuButton_.focus()},b.prototype.blur=function(){this.menuButton_.blur()},b.prototype.handleFocus=function(){t.on(x["default"],"keydown",r.bind(this,this.handleKeyPress))},b.prototype.handleBlur=function(){t.off(x["default"],"keydown",r.bind(this,this.handleKeyPress))},b.prototype.handleKeyPress=function(a){27===a.which||9===a.which?(this.buttonPressed_&&this.unpressButton(),9!==a.which&&(a.preventDefault(),this.menuButton_.el_.focus())):38!==a.which&&40!==a.which||this.buttonPressed_||(this.pressButton(),a.preventDefault())},b.prototype.handleSubmenuKeyPress=function(a){27!==a.which&&9!==a.which||(this.buttonPressed_&&this.unpressButton(),9!==a.which&&(a.preventDefault(),this.menuButton_.el_.focus()))},b.prototype.pressButton=function(){this.enabled_&&(this.buttonPressed_=!0,this.menu.lockShowing(),this.menuButton_.el_.setAttribute("aria-expanded","true"),this.menu.focus())},b.prototype.unpressButton=function(){this.enabled_&&(this.buttonPressed_=!1,this.menu.unlockShowing(),this.menuButton_.el_.setAttribute("aria-expanded","false"))},b.prototype.disable=function(){this.unpressButton(),this.enabled_=!1,this.addClass("vjs-disabled"),this.menuButton_.disable()},b.prototype.enable=function(){this.enabled_=!0,this.removeClass("vjs-disabled"),this.menuButton_.enable()},b}(l["default"]);l["default"].registerComponent("MenuButton",y),c["default"]=y},{2:2,5:5,52:52,85:85,86:86,88:88,96:96,99:99}],51:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(3),i=d(h),j=a(5),k=d(j),l=a(93),m=function(a){function b(c,d){e(this,b);var g=f(this,a.call(this,c,d));return g.selectable=d.selectable,g.selected(d.selected),g.selectable?g.el_.setAttribute("role","menuitemcheckbox"):g.el_.setAttribute("role","menuitem"),g}return g(b,a),b.prototype.createEl=function(b,c,d){return this.nonIconControl=!0,a.prototype.createEl.call(this,"li",(0,l.assign)({className:"vjs-menu-item",innerHTML:'<span class="vjs-menu-item-text">'+this.localize(this.options_.label)+"</span>",tabIndex:-1},c),d)},b.prototype.handleClick=function(a){this.selected(!0)},b.prototype.selected=function(a){this.selectable&&(a?(this.addClass("vjs-selected"),this.el_.setAttribute("aria-checked","true"),this.controlText(", selected")):(this.removeClass("vjs-selected"),this.el_.setAttribute("aria-checked","false"),this.controlText(" ")))},b}(i["default"]);k["default"].registerComponent("MenuItem",m),c["default"]=m},{3:3,5:5,93:93}],52:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(5),j=e(i),k=a(85),l=d(k),m=a(88),n=d(m),o=a(86),p=d(o),q=function(a){function b(c,d){f(this,b);var e=g(this,a.call(this,c,d));return d&&(e.menuButton_=d.menuButton),e.focusedChild_=-1,e.on("keydown",e.handleKeyPress),e}return h(b,a),b.prototype.addItem=function(a){this.addChild(a),a.on("click",n.bind(this,function(b){this.menuButton_&&(this.menuButton_.unpressButton(),"CaptionSettingsMenuItem"!==a.name()&&this.menuButton_.focus())}))},b.prototype.createEl=function(){var b=this.options_.contentElType||"ul";this.contentEl_=l.createEl(b,{className:"vjs-menu-content"}),this.contentEl_.setAttribute("role","menu");var c=a.prototype.createEl.call(this,"div",{append:this.contentEl_,className:"vjs-menu"});return c.appendChild(this.contentEl_),p.on(c,"click",function(a){a.preventDefault(),a.stopImmediatePropagation()}),c},b.prototype.handleKeyPress=function(a){37===a.which||40===a.which?(a.preventDefault(),this.stepForward()):38!==a.which&&39!==a.which||(a.preventDefault(),this.stepBack())},b.prototype.stepForward=function(){var a=0
    ;void 0!==this.focusedChild_&&(a=this.focusedChild_+1),this.focus(a)},b.prototype.stepBack=function(){var a=0;void 0!==this.focusedChild_&&(a=this.focusedChild_-1),this.focus(a)},b.prototype.focus=function(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,b=this.children().slice();b.length&&b[0].className&&/vjs-menu-title/.test(b[0].className)&&b.shift(),b.length>0&&(a<0?a=0:a>=b.length&&(a=b.length-1),this.focusedChild_=a,b[a].el_.focus())},b}(j["default"]);j["default"].registerComponent("Menu",q),c["default"]=q},{5:5,85:85,86:86,88:88}],53:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function f(a){var b=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},c=b.eventBusKey;if(c){if(!a[c].nodeName)throw new Error('The eventBusKey "'+c+'" does not refer to an element.');a.eventBusEl_=a[c]}else a.eventBusEl_=h.createEl("span",{className:"vjs-event-bus"});return n.assign(a,x),a.on("dispose",function(){return a.off()}),a}c.__esModule=!0,c.isEvented=void 0;var g=a(85),h=e(g),i=a(86),j=e(i),k=a(88),l=e(k),m=a(93),n=e(m),o=a(45),p=d(o),q=function(a){return a instanceof p["default"]||!!a.eventBusEl_&&["on","one","off","trigger"].every(function(b){return"function"==typeof a[b]})},r=function(a){return"string"==typeof a&&/\S/.test(a)||Array.isArray(a)&&!!a.length},s=function(a){if(!a.nodeName&&!q(a))throw new Error("Invalid target; must be a DOM node or evented object.")},t=function(a){if(!r(a))throw new Error("Invalid event type; must be a non-empty string or array.")},u=function(a){if("function"!=typeof a)throw new Error("Invalid listener; must be a function.")},v=function(a,b){var c=b.length<3||b[0]===a||b[0]===a.eventBusEl_,d=void 0,e=void 0,f=void 0;return c?(d=a.eventBusEl_,b.length>=3&&b.shift(),e=b[0],f=b[1]):(d=b[0],e=b[1],f=b[2]),s(d),t(e),u(f),f=l.bind(a,f),{isTargetingSelf:c,target:d,type:e,listener:f}},w=function(a,b,c,d){s(a),a.nodeName?j[b](a,c,d):a[b](c,d)},x={on:function(){for(var a=this,b=arguments.length,c=Array(b),d=0;d<b;d++)c[d]=arguments[d];var e=v(this,c),f=e.isTargetingSelf,g=e.target,h=e.type,i=e.listener;if(w(g,"on",h,i),!f){var j=function(){return a.off(g,h,i)};j.guid=i.guid;var k=function(){return a.off("dispose",j)};k.guid=i.guid,w(this,"on","dispose",j),w(g,"on","dispose",k)}},one:function(){for(var a=this,b=arguments.length,c=Array(b),d=0;d<b;d++)c[d]=arguments[d];var e=v(this,c),f=e.isTargetingSelf,g=e.target,h=e.type,i=e.listener;if(f)w(g,"one",h,i);else{var j=function k(){for(var b=arguments.length,c=Array(b),d=0;d<b;d++)c[d]=arguments[d];a.off(g,h,k),i.apply(null,c)};j.guid=i.guid,w(g,"one",h,j)}},off:function(a,b,c){if(!a||r(a))j.off(this.eventBusEl_,a,b);else{var d=a,e=b;s(d),t(e),u(c),c=l.bind(this,c),this.off("dispose",c),d.nodeName?(j.off(d,e,c),j.off(d,"dispose",c)):q(d)&&(d.off(e,c),d.off("dispose",c))}},trigger:function(a,b){return j.trigger(this.eventBusEl_,a,b)}};c["default"]=f,c.isEvented=q},{45:45,85:85,86:86,88:88,93:93}],54:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a,b){return h.assign(a,i),a.state=h.assign({},a.state,b),"function"==typeof a.handleStateChanged&&(0,f.isEvented)(a)&&a.on("statechanged",a.handleStateChanged),a}c.__esModule=!0;var f=a(53),g=a(93),h=d(g),i={state:{},setState:function(a){var b=this;"function"==typeof a&&(a=a());var c=void 0;return h.each(a,function(a,d){b.state[d]!==a&&(c=c||{},c[d]={from:b.state[d],to:a}),b.state[d]=a}),c&&(0,f.isEvented)(this)&&this.trigger({changes:c,type:"statechanged"}),c}};c["default"]=e},{53:53,93:93}],55:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(85),j=e(i),k=a(88),l=e(k),m=a(5),n=d(m),o=a(100),p=d(o),q=a(99),r=d(q),s=function(a){function b(c,d){f(this,b);var e=g(this,a.call(this,c,d));return e.opened_=e.hasBeenOpened_=e.hasBeenFilled_=!1,e.closeable(!e.options_.uncloseable),e.content(e.options_.content),e.contentEl_=j.createEl("div",{className:"vjs-modal-dialog-content"},{role:"document"}),e.descEl_=j.createEl("p",{className:"vjs-modal-dialog-description vjs-control-text",id:e.el().getAttribute("aria-describedby")}),j.textContent(e.descEl_,e.description()),e.el_.appendChild(e.descEl_),e.el_.appendChild(e.contentEl_),e}return h(b,a),b.prototype.createEl=function(){return a.prototype.createEl.call(this,"div",{className:this.buildCSSClass(),tabIndex:-1},{"aria-describedby":this.id()+"_description","aria-hidden":"true","aria-label":this.label(),role:"dialog"})},b.prototype.buildCSSClass=function(){return"vjs-modal-dialog vjs-hidden "+a.prototype.buildCSSClass.call(this)},b.prototype.handleKeyPress=function(a){27===a.which&&this.closeable()&&this.close()},b.prototype.label=function(){return this.localize(this.options_.label||"Modal Window")},b.prototype.description=function(){var a=this.options_.description||this.localize("This is a modal window.");return this.closeable()&&(a+=" "+this.localize("This modal can be closed by pressing the Escape key or activating the close button.")),a},b.prototype.open=function(){if(!this.opened_){var a=this.player();this.trigger("beforemodalopen"),this.opened_=!0,(this.options_.fillAlways||!this.hasBeenOpened_&&!this.hasBeenFilled_)&&this.fill(),this.wasPlaying_=!a.paused(),this.options_.pauseOnOpen&&this.wasPlaying_&&a.pause(),this.closeable()&&this.on(this.el_.ownerDocument,"keydown",l.bind(this,this.handleKeyPress)),a.controls(!1),this.show(),this.conditionalFocus_(),this.el().setAttribute("aria-hidden","false"),this.trigger("modalopen"),this.hasBeenOpened_=!0}},b.prototype.opened=function(a){return"boolean"==typeof a&&this[a?"open":"close"](),this.opened_},b.prototype.close=function(){if(this.opened_){var a=this.player();this.trigger("beforemodalclose"),this.opened_=!1,this.wasPlaying_&&this.options_.pauseOnOpen&&a.play(),this.closeable()&&this.off(this.el_.ownerDocument,"keydown",l.bind(this,this.handleKeyPress)),a.controls(!0),this.hide(),this.el().setAttribute("aria-hidden","true"),this.trigger("modalclose"),this.conditionalBlur_(),this.options_.temporary&&this.dispose()}},b.prototype.closeable=function c(a){if("boolean"==typeof a){var c=this.closeable_=!!a,b=this.getChild("closeButton");if(c&&!b){var d=this.contentEl_;this.contentEl_=this.el_,b=this.addChild("closeButton",{controlText:"Close Modal Dialog"}),this.contentEl_=d,this.on(b,"close",this.close)}!c&&b&&(this.off(b,"close",this.close),this.removeChild(b),b.dispose())}return this.closeable_},b.prototype.fill=function(){this.fillWith(this.content())},b.prototype.fillWith=function(a){var b=this.contentEl(),c=b.parentNode,d=b.nextSibling;this.trigger("beforemodalfill"),this.hasBeenFilled_=!0,c.removeChild(b),this.empty(),j.insertContent(b,a),this.trigger("modalfill"),d?c.insertBefore(b,d):c.appendChild(b);var e=this.getChild("closeButton");e&&c.appendChild(e.el_)},b.prototype.empty=function(){this.trigger("beforemodalempty"),j.emptyEl(this.contentEl()),this.trigger("modalempty")},b.prototype.content=function(a){return void 0!==a&&(this.content_=a),this.content_},b.prototype.conditionalFocus_=function(){var a=r["default"].activeElement,b=this.player_.el_;this.previouslyActiveEl_=null,(b.contains(a)||b===a)&&(this.previouslyActiveEl_=a,this.focus(),this.on(r["default"],"keydown",this.handleKeyDown))},b.prototype.conditionalBlur_=function(){this.previouslyActiveEl_&&(this.previouslyActiveEl_.focus(),this.previouslyActiveEl_=null),this.off(r["default"],"keydown",this.handleKeyDown)},b.prototype.handleKeyDown=function(a){if(9===a.which){for(var b=this.focusableEls_(),c=this.el_.querySelector(":focus"),d=void 0,e=0;e<b.length;e++)if(c===b[e]){d=e;break}r["default"].activeElement===this.el_&&(d=0),a.shiftKey&&0===d?(b[b.length-1].focus(),a.preventDefault()):a.shiftKey||d!==b.length-1||(b[0].focus(),a.preventDefault())}},b.prototype.focusableEls_=function(){var a=this.el_.querySelectorAll("*");return Array.prototype.filter.call(a,function(a){return(a instanceof p["default"].HTMLAnchorElement||a instanceof p["default"].HTMLAreaElement)&&a.hasAttribute("href")||(a instanceof p["default"].HTMLInputElement||a instanceof p["default"].HTMLSelectElement||a instanceof p["default"].HTMLTextAreaElement||a instanceof p["default"].HTMLButtonElement)&&!a.hasAttribute("disabled")||a instanceof p["default"].HTMLIFrameElement||a instanceof p["default"].HTMLObjectElement||a instanceof p["default"].HTMLEmbedElement||a.hasAttribute("tabindex")&&a.getAttribute("tabindex")!==-1||a.hasAttribute("contenteditable")})},b}(n["default"]);s.prototype.options_={pauseOnOpen:!0,temporary:!0},n["default"].registerComponent("ModalDialog",s),c["default"]=s},{100:100,5:5,85:85,88:88,99:99}],56:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){return a.raw=b,a}function g(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function h(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function i(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var j=f(["\n        Using the tech directly can be dangerous. I hope you know what you're doing.\n        See https://github.com/videojs/video.js/issues/2617 for more info.\n      "],["\n        Using the tech directly can be dangerous. I hope you know what you're doing.\n        See https://github.com/videojs/video.js/issues/2617 for more info.\n      "]),k=a(5),l=e(k),m=a(99),n=e(m),o=a(100),p=e(o),q=a(103),r=e(q),s=a(53),t=e(s),u=a(86),v=d(u),w=a(85),x=d(w),y=a(88),z=d(y),A=a(90),B=d(A),C=a(81),D=d(C),E=a(91),F=e(E),G=a(96),H=e(G),I=a(95),J=a(82),K=a(94),L=d(K),M=a(47),N=e(M),O=a(49),P=e(O),Q=a(102),R=e(Q),S=a(93),T=a(92),U=e(T),V=a(71),W=e(V),X=a(55),Y=e(X),Z=a(64),$=e(Z),_=a(63),aa=d(_),ba=a(77),ca=a(87),da=e(ca);a(62),a(58),a(70),a(48),a(1),a(4),a(8),a(44),a(73),a(61);var ea=["progress","abort","suspend","emptied","stalled","loadedmetadata","loadeddata","timeupdate","ratechange","resize","volumechange","texttrackchange"],fa=function(a){function b(c,d,e){if(g(this,b),c.id=c.id||"vjs_video_"+B.newGUID(),d=(0,S.assign)(b.getTagSettings(c),d),d.initChildren=!1,d.createEl=!1,d.reportTouchActivity=!1,!d.language)if("function"==typeof c.closest){var f=c.closest("[lang]");f&&(d.language=f.getAttribute("lang"))}else for(var i=c;i&&1===i.nodeType;){if(x.getAttributes(i).hasOwnProperty("lang")){d.language=i.getAttribute("lang");break}i=i.parentNode}var j=h(this,a.call(this,null,d,e));if(j.isReady_=!1,!j.options_||!j.options_.techOrder||!j.options_.techOrder.length)throw new Error("No techOrder specified. Did you overwrite videojs.options instead of just changing the properties you want to override?");if(j.tag=c,j.tagAttributes=c&&x.getAttributes(c),j.language(j.options_.language),d.languages){var k={};Object.getOwnPropertyNames(d.languages).forEach(function(a){k[a.toLowerCase()]=d.languages[a]}),j.languages_=k}else j.languages_=b.prototype.options_.languages;j.cache_={},j.poster_=d.poster||"",j.controls_=!!d.controls,j.cache_.lastVolume=1,c.controls=!1,j.scrubbing_=!1,j.el_=j.createEl(),(0,t["default"])(j,{eventBusKey:"el_"});var l=(0,U["default"])(j.options_);if(d.plugins){var m=d.plugins;Object.keys(m).forEach(function(a){if("function"!=typeof this[a])throw new Error('plugin "'+a+'" does not exist');this[a](m[a])},j)}return j.options_.playerOptions=l,j.middleware_=[],j.initChildren(),j.isAudio("audio"===c.nodeName.toLowerCase()),j.controls()?j.addClass("vjs-controls-enabled"):j.addClass("vjs-controls-disabled"),j.el_.setAttribute("role","region"),j.isAudio()?j.el_.setAttribute("aria-label",j.localize("Audio Player")):j.el_.setAttribute("aria-label",j.localize("Video Player")),j.isAudio()&&j.addClass("vjs-audio"),j.flexNotSupported_()&&j.addClass("vjs-no-flex"),D.IS_IOS||j.addClass("vjs-workinghover"),b.players[j.id_]=j,j.userActive(!0),j.reportUserActivity(),j.listenForUserActivity_(),j.on("fullscreenchange",j.handleFullscreenChange_),j.on("stageclick",j.handleStageClick_),j.changingSrc_=!1,j}return i(b,a),b.prototype.dispose=function(){this.trigger("dispose"),this.off("dispose"),this.styleEl_&&this.styleEl_.parentNode&&this.styleEl_.parentNode.removeChild(this.styleEl_),b.players[this.id_]=null,this.tag&&this.tag.player&&(this.tag.player=null),this.el_&&this.el_.player&&(this.el_.player=null),this.tech_&&this.tech_.dispose(),a.prototype.dispose.call(this)},b.prototype.createEl=function(){var b=this.tag,c=void 0,d=this.playerElIngest_=b.parentNode&&b.parentNode.hasAttribute&&b.parentNode.hasAttribute("data-vjs-player");c=this.el_=d?b.parentNode:a.prototype.createEl.call(this,"div"),b.setAttribute("tabindex","-1"),b.removeAttribute("width"),b.removeAttribute("height");var e=x.getAttributes(b);if(Object.getOwnPropertyNames(e).forEach(function(a){"class"===a?c.className+=" "+e[a]:c.setAttribute(a,e[a])}),b.playerId=b.id,b.id+="_html5_api",b.className="vjs-tech",b.player=c.player=this,this.addClass("vjs-paused"),p["default"].VIDEOJS_NO_DYNAMIC_STYLE!==!0){this.styleEl_=L.createStyleElement("vjs-styles-dimensions");var f=x.$(".vjs-styles-defaults"),g=x.$("head");g.insertBefore(this.styleEl_,f?f.nextSibling:g.firstChild)}this.width(this.options_.width),this.height(this.options_.height),this.fluid(this.options_.fluid),this.aspectRatio(this.options_.aspectRatio);for(var h=b.getElementsByTagName("a"),i=0;i<h.length;i++){var j=h.item(i);x.addClass(j,"vjs-hidden"),j.setAttribute("hidden","hidden")}return b.initNetworkState_=b.networkState,b.parentNode&&!d&&b.parentNode.insertBefore(c,b),x.prependTo(b,c),this.children_.unshift(b),this.el_.setAttribute("lang",this.language_),this.el_=c,c},b.prototype.width=function(a){return this.dimension("width",a)},b.prototype.height=function(a){return this.dimension("height",a)},b.prototype.dimension=function(a,b){var c=a+"_";if(void 0===b)return this[c]||0;if(""===b)this[c]=void 0;else{var d=parseFloat(b);if(isNaN(d))return void F["default"].error('Improper value "'+b+'" supplied for for '+a);this[c]=d}this.updateStyleEl_()},b.prototype.fluid=function(a){if(void 0===a)return!!this.fluid_;this.fluid_=!!a,a?this.addClass("vjs-fluid"):this.removeClass("vjs-fluid"),this.updateStyleEl_()},b.prototype.aspectRatio=function(a){if(void 0===a)return this.aspectRatio_;if(!/^\d+\:\d+$/.test(a))throw new Error("Improper value supplied for aspect ratio. The format should be width:height, for example 16:9.");this.aspectRatio_=a,this.fluid(!0),this.updateStyleEl_()},b.prototype.updateStyleEl_=function(){if(p["default"].VIDEOJS_NO_DYNAMIC_STYLE===!0){var a="number"==typeof this.width_?this.width_:this.options_.width,b="number"==typeof this.height_?this.height_:this.options_.height,c=this.tech_&&this.tech_.el();return void(c&&(a>=0&&(c.width=a),b>=0&&(c.height=b)))}var d=void 0,e=void 0,f=void 0,g=void 0;f=void 0!==this.aspectRatio_&&"auto"!==this.aspectRatio_?this.aspectRatio_:this.videoWidth()>0?this.videoWidth()+":"+this.videoHeight():"16:9";var h=f.split(":"),i=h[1]/h[0];d=void 0!==this.width_?this.width_:void 0!==this.height_?this.height_/i:this.videoWidth()||300,e=void 0!==this.height_?this.height_:d*i,g=/^[^a-zA-Z]/.test(this.id())?"dimensions-"+this.id():this.id()+"-dimensions",this.addClass(g),L.setTextContent(this.styleEl_,"\n      ."+g+" {\n        width: "+d+"px;\n        height: "+e+"px;\n      }\n\n      ."+g+".vjs-fluid {\n        padding-top: "+100*i+"%;\n      }\n    ")},b.prototype.loadTech_=function(a,b){var c=this;this.tech_&&this.unloadTech_();var d=(0,H["default"])(a),e=a.charAt(0).toLowerCase()+a.slice(1);"Html5"!==d&&this.tag&&($["default"].getTech("Html5").disposeMediaElement(this.tag),this.tag.player=null,this.tag=null),this.techName_=d,this.isReady_=!1;var f={source:b,nativeControlsForTouch:this.options_.nativeControlsForTouch,playerId:this.id(),techId:this.id()+"_"+d+"_api",autoplay:this.options_.autoplay,preload:this.options_.preload,loop:this.options_.loop,muted:this.options_.muted,poster:this.poster(),language:this.language(),playerElIngest:this.playerElIngest_||!1,"vtt.js":this.options_["vtt.js"]};ba.ALL.names.forEach(function(a){var b=ba.ALL[a];f[b.getterName]=c[b.privateName]}),(0,S.assign)(f,this.options_[d]),(0,S.assign)(f,this.options_[e]),(0,S.assign)(f,this.options_[a.toLowerCase()]),this.tag&&(f.tag=this.tag),b&&b.src===this.cache_.src&&this.cache_.currentTime>0&&(f.startTime=this.cache_.currentTime);var g=$["default"].getTech(a);if(!g)throw new Error("No Tech named '"+d+"' exists! '"+d+"' should be registered using videojs.registerTech()'");this.tech_=new g(f),this.tech_.ready(z.bind(this,this.handleTechReady_),!0),W["default"].jsonToTextTracks(this.textTracksJson_||[],this.tech_),ea.forEach(function(a){c.on(c.tech_,a,c["handleTech"+(0,H["default"])(a)+"_"])}),this.on(this.tech_,"loadstart",this.handleTechLoadStart_),this.on(this.tech_,"waiting",this.handleTechWaiting_),this.on(this.tech_,"canplay",this.handleTechCanPlay_),this.on(this.tech_,"canplaythrough",this.handleTechCanPlayThrough_),this.on(this.tech_,"playing",this.handleTechPlaying_),this.on(this.tech_,"ended",this.handleTechEnded_),this.on(this.tech_,"seeking",this.handleTechSeeking_),this.on(this.tech_,"seeked",this.handleTechSeeked_),this.on(this.tech_,"play",this.handleTechPlay_),this.on(this.tech_,"firstplay",this.handleTechFirstPlay_),this.on(this.tech_,"pause",this.handleTechPause_),this.on(this.tech_,"durationchange",this.handleTechDurationChange_),this.on(this.tech_,"fullscreenchange",this.handleTechFullscreenChange_),this.on(this.tech_,"error",this.handleTechError_),this.on(this.tech_,"loadedmetadata",this.updateStyleEl_),this.on(this.tech_,"posterchange",this.handleTechPosterChange_),this.on(this.tech_,"textdata",this.handleTechTextData_),this.usingNativeControls(this.techGet_("controls")),this.controls()&&!this.usingNativeControls()&&this.addTechControlsListeners_(),this.tech_.el().parentNode===this.el()||"Html5"===d&&this.tag||x.prependTo(this.tech_.el(),this.el()),this.tag&&(this.tag.player=null,this.tag=null)},b.prototype.unloadTech_=function(){var a=this;ba.ALL.names.forEach(function(b){var c=ba.ALL[b];a[c.privateName]=a[c.getterName]()}),this.textTracksJson_=W["default"].textTracksToJson(this.tech_),this.isReady_=!1,this.tech_.dispose(),this.tech_=!1},b.prototype.tech=function(a){return void 0===a&&F["default"].warn((0,r["default"])(j)),this.tech_},b.prototype.addTechControlsListeners_=function(){this.removeTechControlsListeners_(),this.on(this.tech_,"mousedown",this.handleTechClick_),this.on(this.tech_,"touchstart",this.handleTechTouchStart_),this.on(this.tech_,"touchmove",this.handleTechTouchMove_),this.on(this.tech_,"touchend",this.handleTechTouchEnd_),this.on(this.tech_,"tap",this.handleTechTap_)},b.prototype.removeTechControlsListeners_=function(){this.off(this.tech_,"tap",this.handleTechTap_),this.off(this.tech_,"touchstart",this.handleTechTouchStart_),this.off(this.tech_,"touchmove",this.handleTechTouchMove_),this.off(this.tech_,"touchend",this.handleTechTouchEnd_),this.off(this.tech_,"mousedown",this.handleTechClick_)},b.prototype.handleTechReady_=function(){if(this.triggerReady(),this.cache_.volume&&this.techCall_("setVolume",this.cache_.volume),this.handleTechPosterChange_(),this.handleTechDurationChange_(),(this.src()||this.currentSrc())&&this.tag&&this.options_.autoplay&&this.paused()){try{delete this.tag.poster}catch(a){(0,F["default"])("deleting tag.poster throws in some browsers",a)}this.play()}},b.prototype.handleTechLoadStart_=function(){this.removeClass("vjs-ended"),this.removeClass("vjs-seeking"),this.error(null),this.paused()?(this.hasStarted(!1),this.trigger("loadstart")):(this.trigger("loadstart"),this.trigger("firstplay"))},b.prototype.hasStarted=function(a){return void 0!==a?void(this.hasStarted_!==a&&(this.hasStarted_=a,a?(this.addClass("vjs-has-started"),this.trigger("firstplay")):this.removeClass("vjs-has-started"))):!!this.hasStarted_},b.prototype.handleTechPlay_=function(){this.removeClass("vjs-ended"),this.removeClass("vjs-paused"),this.addClass("vjs-playing"),this.hasStarted(!0),this.trigger("play")},b.prototype.handleTechWaiting_=function(){var a=this;this.addClass("vjs-waiting"),this.trigger("waiting"),this.one("timeupdate",function(){return a.removeClass("vjs-waiting")})},b.prototype.handleTechCanPlay_=function(){this.removeClass("vjs-waiting"),this.trigger("canplay")},b.prototype.handleTechCanPlayThrough_=function(){this.removeClass("vjs-waiting"),this.trigger("canplaythrough")},b.prototype.handleTechPlaying_=function(){this.removeClass("vjs-waiting"),this.trigger("playing")},b.prototype.handleTechSeeking_=function(){this.addClass("vjs-seeking"),this.trigger("seeking")},b.prototype.handleTechSeeked_=function(){this.removeClass("vjs-seeking"),this.trigger("seeked")},b.prototype.handleTechFirstPlay_=function(){this.options_.starttime&&(F["default"].warn("Passing the `starttime` option to the player will be deprecated in 6.0"),this.currentTime(this.options_.starttime)),this.addClass("vjs-has-started"),this.trigger("firstplay")},b.prototype.handleTechPause_=function(){this.removeClass("vjs-playing"),this.addClass("vjs-paused"),this.trigger("pause")},b.prototype.handleTechEnded_=function(){this.addClass("vjs-ended"),this.options_.loop?(this.currentTime(0),this.play()):this.paused()||this.pause(),this.trigger("ended")},b.prototype.handleTechDurationChange_=function(){this.duration(this.techGet_("duration"))},b.prototype.handleTechClick_=function(a){0===a.button&&this.controls()&&(this.paused()?this.play():this.pause())},b.prototype.handleTechTap_=function(){this.userActive(!this.userActive())},b.prototype.handleTechTouchStart_=function(){this.userWasActive=this.userActive()},b.prototype.handleTechTouchMove_=function(){this.userWasActive&&this.reportUserActivity()},b.prototype.handleTechTouchEnd_=function(a){a.preventDefault()},b.prototype.handleFullscreenChange_=function(){this.isFullscreen()?this.addClass("vjs-fullscreen"):this.removeClass("vjs-fullscreen")},b.prototype.handleStageClick_=function(){this.reportUserActivity()},b.prototype.handleTechFullscreenChange_=function(a,b){b&&this.isFullscreen(b.isFullscreen),this.trigger("fullscreenchange")},b.prototype.handleTechError_=function(){var a=this.tech_.error();this.error(a)},b.prototype.handleTechTextData_=function(){var a=null;arguments.length>1&&(a=arguments[1]),this.trigger("textdata",a)},b.prototype.getCache=function(){return this.cache_},b.prototype.techCall_=function(a,b){this.ready(function(){if(a in aa.allowedSetters)return aa.set(this.middleware_,this.tech_,a,b);try{this.tech_&&this.tech_[a](b)}catch(c){throw(0,F["default"])(c),c}},!0)},b.prototype.techGet_=function(a){if(this.tech_&&this.tech_.isReady_){if(a in aa.allowedGetters)return aa.get(this.middleware_,this.tech_,a);try{return this.tech_[a]()}catch(b){throw void 0===this.tech_[a]?(0,F["default"])("Video.js: "+a+" method not defined for "+this.techName_+" playback technology.",b):"TypeError"===b.name?((0,F["default"])("Video.js: "+a+" unavailable on "+this.techName_+" playback technology element.",b),this.tech_.isReady_=!1):(0,F["default"])(b),b}}},b.prototype.play=function(){if(this.changingSrc_)this.ready(function(){var a=this.techGet_("play");void 0!==a&&"function"==typeof a.then&&a.then(null,function(a){})});else{if(this.isReady_&&(this.src()||this.currentSrc()))return this.techGet_("play");this.ready(function(){this.tech_.one("loadstart",function(){var a=this.play();void 0!==a&&"function"==typeof a.then&&a.then(null,function(a){})})})}},b.prototype.pause=function(){this.techCall_("pause")},b.prototype.paused=function(){return this.techGet_("paused")!==!1},b.prototype.played=function(){return this.techGet_("played")||(0,I.createTimeRange)(0,0)},b.prototype.scrubbing=function(a){if(void 0===a)return this.scrubbing_;this.scrubbing_=!!a,a?this.addClass("vjs-scrubbing"):this.removeClass("vjs-scrubbing")},b.prototype.currentTime=function(a){return void 0!==a?void this.techCall_("setCurrentTime",a):(this.cache_.currentTime=this.techGet_("currentTime")||0,this.cache_.currentTime)},b.prototype.duration=function(a){if(void 0===a)return this.cache_.duration||0;a=parseFloat(a)||0,a<0&&(a=1/0),a!==this.cache_.duration&&(this.cache_.duration=a,a===1/0?this.addClass("vjs-live"):this.removeClass("vjs-live"),this.trigger("durationchange"))},b.prototype.remainingTime=function(){return this.duration()-this.currentTime()},b.prototype.buffered=function c(){var c=this.techGet_("buffered");return c&&c.length||(c=(0,I.createTimeRange)(0,0)),c},b.prototype.bufferedPercent=function(){return(0,J.bufferedPercent)(this.buffered(),this.duration())},b.prototype.bufferedEnd=function(){var a=this.buffered(),b=this.duration(),c=a.end(a.length-1);return c>b&&(c=b),c},b.prototype.volume=function(a){var b=void 0;return void 0!==a?(b=Math.max(0,Math.min(1,parseFloat(a))),this.cache_.volume=b,this.techCall_("setVolume",b),void(b>0&&this.lastVolume_(b))):(b=parseFloat(this.techGet_("volume")),isNaN(b)?1:b)},b.prototype.muted=function(a){return void 0!==a?void this.techCall_("setMuted",a):this.techGet_("muted")||!1},b.prototype.defaultMuted=function(a){return void 0!==a?this.techCall_("setDefaultMuted",a):this.techGet_("defaultMuted")||!1},b.prototype.lastVolume_=function(a){return void 0!==a&&0!==a?void(this.cache_.lastVolume=a):this.cache_.lastVolume},b.prototype.supportsFullScreen=function(){return this.techGet_("supportsFullScreen")||!1},b.prototype.isFullscreen=function(a){return void 0!==a?void(this.isFullscreen_=!!a):!!this.isFullscreen_},b.prototype.requestFullscreen=function(){var a=N["default"];this.isFullscreen(!0),a.requestFullscreen?(v.on(n["default"],a.fullscreenchange,z.bind(this,function b(c){this.isFullscreen(n["default"][a.fullscreenElement]),this.isFullscreen()===!1&&v.off(n["default"],a.fullscreenchange,b),this.trigger("fullscreenchange")})),this.el_[a.requestFullscreen]()):this.tech_.supportsFullScreen()?this.techCall_("enterFullScreen"):(this.enterFullWindow(),this.trigger("fullscreenchange"))},b.prototype.exitFullscreen=function(){var a=N["default"];this.isFullscreen(!1),a.requestFullscreen?n["default"][a.exitFullscreen]():this.tech_.supportsFullScreen()?this.techCall_("exitFullScreen"):(this.exitFullWindow(),this.trigger("fullscreenchange"))},b.prototype.enterFullWindow=function(){this.isFullWindow=!0,this.docOrigOverflow=n["default"].documentElement.style.overflow,v.on(n["default"],"keydown",z.bind(this,this.fullWindowOnEscKey)),n["default"].documentElement.style.overflow="hidden",x.addClass(n["default"].body,"vjs-full-window"),this.trigger("enterFullWindow")},b.prototype.fullWindowOnEscKey=function(a){27===a.keyCode&&(this.isFullscreen()===!0?this.exitFullscreen():this.exitFullWindow())},b.prototype.exitFullWindow=function(){this.isFullWindow=!1,v.off(n["default"],"keydown",this.fullWindowOnEscKey),n["default"].documentElement.style.overflow=this.docOrigOverflow,x.removeClass(n["default"].body,"vjs-full-window"),this.trigger("exitFullWindow")},b.prototype.canPlayType=function(a){for(var b=void 0,c=0,d=this.options_.techOrder;c<d.length;c++){var e=d[c],f=$["default"].getTech(e);if(f||(f=l["default"].getComponent(e)),f){if(f.isSupported()&&(b=f.canPlayType(a)))return b}else F["default"].error('The "'+e+'" tech is undefined. Skipped browser support check for that tech.')}return""},b.prototype.selectSource=function(a){var b=this,c=this.options_.techOrder.map(function(a){return[a,$["default"].getTech(a)]}).filter(function(a){var b=a[0],c=a[1];return c?c.isSupported():(F["default"].error('The "'+b+'" tech is undefined. Skipped browser support check for that tech.'),!1)}),d=function(a,b,c){var d=void 0;return a.some(function(a){return b.some(function(b){if(d=c(a,b))return!0})}),d},e=void 0,f=function(a){return function(b,c){return a(c,b)}},g=function(a,c){var d=a[0];if(a[1].canPlaySource(c,b.options_[d.toLowerCase()]))return{source:c,tech:d}};return e=this.options_.sourceOrder?d(a,c,f(g)):d(c,a,g),e||!1},b.prototype.src=function(a){var b=this;if(void 0===a)return this.cache_.src;var c=(0,da["default"])(a);if(!c.length)return void this.setTimeout(function(){this.error({code:4,message:this.localize(this.options_.notSupportedMessage)})},0);this.cache_.sources=c,this.changingSrc_=!0,this.cache_.source=c[0],aa.setSource(this,c[0],function(a,d){if(b.middleware_=d,b.src_(a))return c.length>1?b.src(c.slice(1)):(b.setTimeout(function(){this.error({code:4,message:this.localize(this.options_.notSupportedMessage)})},0),void b.triggerReady());b.changingSrc_=!1,b.cache_.src=a.src,aa.setTech(d,b.tech_)})},b.prototype.src_=function(a){var b=this.selectSource([a]);return!b||(b.tech!==this.techName_?(this.changingSrc_=!0,this.loadTech_(b.tech,b.source),!1):(this.ready(function(){this.tech_.constructor.prototype.hasOwnProperty("setSource")?this.techCall_("setSource",a):this.techCall_("src",a.src),"auto"===this.options_.preload&&this.load(),this.options_.autoplay&&this.play()},!0),!1))},b.prototype.load=function(){this.techCall_("load")},b.prototype.reset=function(){this.loadTech_(this.options_.techOrder[0],null),this.techCall_("reset")},b.prototype.currentSources=function(){var a=this.currentSource(),b=[];return 0!==Object.keys(a).length&&b.push(a),this.cache_.sources||b},b.prototype.currentSource=function(){return this.cache_.source||{}},b.prototype.currentSrc=function(){return this.currentSource()&&this.currentSource().src||""},b.prototype.currentType=function(){return this.currentSource()&&this.currentSource().type||""},b.prototype.preload=function(a){return void 0!==a?(this.techCall_("setPreload",a),void(this.options_.preload=a)):this.techGet_("preload")},b.prototype.autoplay=function(a){return void 0!==a?(this.techCall_("setAutoplay",a),void(this.options_.autoplay=a)):this.techGet_("autoplay",a)},b.prototype.loop=function(a){return void 0!==a?(this.techCall_("setLoop",a),void(this.options_.loop=a)):this.techGet_("loop")},b.prototype.poster=function(a){if(void 0===a)return this.poster_;a||(a=""),this.poster_=a,this.techCall_("setPoster",a),this.trigger("posterchange")},b.prototype.handleTechPosterChange_=function(){!this.poster_&&this.tech_&&this.tech_.poster&&(this.poster_=this.tech_.poster()||"",this.trigger("posterchange"))},b.prototype.controls=function(a){return void 0!==a?(a=!!a,void(this.controls_!==a&&(this.controls_=a,this.usingNativeControls()&&this.techCall_("setControls",a),a?(this.removeClass("vjs-controls-disabled"),this.addClass("vjs-controls-enabled"),this.trigger("controlsenabled"),this.usingNativeControls()||this.addTechControlsListeners_()):(this.removeClass("vjs-controls-enabled"),
        this.addClass("vjs-controls-disabled"),this.trigger("controlsdisabled"),this.usingNativeControls()||this.removeTechControlsListeners_())))):!!this.controls_},b.prototype.usingNativeControls=function(a){return void 0!==a?(a=!!a,void(this.usingNativeControls_!==a&&(this.usingNativeControls_=a,a?(this.addClass("vjs-using-native-controls"),this.trigger("usingnativecontrols")):(this.removeClass("vjs-using-native-controls"),this.trigger("usingcustomcontrols"))))):!!this.usingNativeControls_},b.prototype.error=function(a){return void 0===a?this.error_||null:null===a?(this.error_=a,this.removeClass("vjs-error"),void(this.errorDisplay&&this.errorDisplay.close())):(this.error_=new P["default"](a),this.addClass("vjs-error"),F["default"].error("(CODE:"+this.error_.code+" "+P["default"].errorTypes[this.error_.code]+")",this.error_.message,this.error_),void this.trigger("error"))},b.prototype.reportUserActivity=function(a){this.userActivity_=!0},b.prototype.userActive=function(a){return void 0!==a?(a=!!a,void(a!==this.userActive_&&(this.userActive_=a,a?(this.userActivity_=!0,this.removeClass("vjs-user-inactive"),this.addClass("vjs-user-active"),this.trigger("useractive")):(this.userActivity_=!1,this.tech_&&this.tech_.one("mousemove",function(a){a.stopPropagation(),a.preventDefault()}),this.removeClass("vjs-user-active"),this.addClass("vjs-user-inactive"),this.trigger("userinactive"))))):this.userActive_},b.prototype.listenForUserActivity_=function(){var a=void 0,b=void 0,c=void 0,d=z.bind(this,this.reportUserActivity),e=function(a){a.screenX===b&&a.screenY===c||(b=a.screenX,c=a.screenY,d())},f=function(){d(),this.clearInterval(a),a=this.setInterval(d,250)},g=function(b){d(),this.clearInterval(a)};this.on("mousedown",f),this.on("mousemove",e),this.on("mouseup",g),this.on("keydown",d),this.on("keyup",d);var h=void 0;this.setInterval(function(){if(this.userActivity_){this.userActivity_=!1,this.userActive(!0),this.clearTimeout(h);var a=this.options_.inactivityTimeout;a>0&&(h=this.setTimeout(function(){this.userActivity_||this.userActive(!1)},a))}},250)},b.prototype.playbackRate=function(a){return void 0!==a?void this.techCall_("setPlaybackRate",a):this.tech_&&this.tech_.featuresPlaybackRate?this.techGet_("playbackRate"):1},b.prototype.defaultPlaybackRate=function(a){return void 0!==a?this.techCall_("setDefaultPlaybackRate",a):this.tech_&&this.tech_.featuresPlaybackRate?this.techGet_("defaultPlaybackRate"):1},b.prototype.isAudio=function(a){return void 0!==a?void(this.isAudio_=!!a):!!this.isAudio_},b.prototype.addTextTrack=function(a,b,c){if(this.tech_)return this.tech_.addTextTrack(a,b,c)},b.prototype.addRemoteTextTrack=function(a,b){if(this.tech_)return this.tech_.addRemoteTextTrack(a,b)},b.prototype.removeRemoteTextTrack=function(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},b=a.track,c=void 0===b?arguments[0]:b;if(this.tech_)return this.tech_.removeRemoteTextTrack(c)},b.prototype.videoWidth=function(){return this.tech_&&this.tech_.videoWidth&&this.tech_.videoWidth()||0},b.prototype.videoHeight=function(){return this.tech_&&this.tech_.videoHeight&&this.tech_.videoHeight()||0},b.prototype.language=function(a){if(void 0===a)return this.language_;this.language_=String(a).toLowerCase()},b.prototype.languages=function(){return(0,U["default"])(b.prototype.options_.languages,this.languages_)},b.prototype.toJSON=function(){var a=(0,U["default"])(this.options_),b=a.tracks;a.tracks=[];for(var c=0;c<b.length;c++){var d=b[c];d=(0,U["default"])(d),d.player=void 0,a.tracks[c]=d}return a},b.prototype.createModal=function(a,b){var c=this;b=b||{},b.content=a||"";var d=new Y["default"](this,b);return this.addChild(d),d.on("dispose",function(){c.removeChild(d)}),d.open(),d},b.getTagSettings=function(a){var b={sources:[],tracks:[]},c=x.getAttributes(a),d=c["data-setup"];if(x.hasClass(a,"vjs-fluid")&&(c.fluid=!0),null!==d){var e=(0,R["default"])(d||"{}"),f=e[0],g=e[1];f&&F["default"].error(f),(0,S.assign)(c,g)}if((0,S.assign)(b,c),a.hasChildNodes())for(var h=a.childNodes,i=0,j=h.length;i<j;i++){var k=h[i],l=k.nodeName.toLowerCase();"source"===l?b.sources.push(x.getAttributes(k)):"track"===l&&b.tracks.push(x.getAttributes(k))}return b},b.prototype.flexNotSupported_=function(){var a=n["default"].createElement("i");return!("flexBasis"in a.style||"webkitFlexBasis"in a.style||"mozFlexBasis"in a.style||"msFlexBasis"in a.style||"msFlexOrder"in a.style)},b}(l["default"]);ba.ALL.names.forEach(function(a){var b=ba.ALL[a];fa.prototype[b.getterName]=function(){return this.tech_?this.tech_[b.getterName]():(this[b.privateName]=this[b.privateName]||new b.ListClass,this[b.privateName])}}),fa.players={};var ga=p["default"].navigator;fa.prototype.options_={techOrder:$["default"].defaultTechOrder_,html5:{},flash:{},inactivityTimeout:2e3,playbackRates:[],children:["mediaLoader","posterImage","textTrackDisplay","loadingSpinner","bigPlayButton","controlBar","errorDisplay","textTrackSettings"],language:ga&&(ga.languages&&ga.languages[0]||ga.userLanguage||ga.language)||"en",languages:{},notSupportedMessage:"No compatible source was found for this media."},["ended","seeking","seekable","networkState","readyState"].forEach(function(a){fa.prototype[a]=function(){return this.techGet_(a)}}),ea.forEach(function(a){fa.prototype["handleTech"+(0,H["default"])(a)+"_"]=function(){return this.trigger(a)}}),l["default"].registerComponent("Player",fa),c["default"]=fa},{1:1,100:100,102:102,103:103,4:4,44:44,47:47,48:48,49:49,5:5,53:53,55:55,58:58,61:61,62:62,63:63,64:64,70:70,71:71,73:73,77:77,8:8,81:81,82:82,85:85,86:86,87:87,88:88,90:90,91:91,92:92,93:93,94:94,95:95,96:96,99:99}],57:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}c.__esModule=!0;var g="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},h=a(53),i=e(h),j=a(54),k=e(j),l=a(86),m=d(l),n=a(88),o=d(n),p=a(91),q=e(p),r=a(56),s=e(r),t={},u=function(a){return t.hasOwnProperty(a)},v=function(a){return u(a)?t[a]:void 0},w=function(a,b){a.activePlugins_=a.activePlugins_||{},a.activePlugins_[b]=!0},x=function(a,b){var c=function(){var c=b.apply(this,arguments);return w(this,a),this.trigger("pluginsetup",{name:a,plugin:b,instance:c}),c};return Object.keys(b).forEach(function(a){c[a]=b[a]}),c},y=function(a,b){return b.prototype.name=a,function(){for(var c=arguments.length,d=Array(c),e=0;e<c;e++)d[e]=arguments[e];var f=new(Function.prototype.bind.apply(b,[null].concat([this].concat(d))));return this[a]=function(){return f},f}},z=function(){function a(b){if(f(this,a),this.player=b,this.constructor===a)throw new Error("Plugin must be sub-classed; not directly instantiated.");(0,i["default"])(this),delete this.trigger,(0,k["default"])(this,this.constructor.defaultState),w(b,this.name),this.dispose=o.bind(this,this.dispose),b.on("dispose",this.dispose),b.trigger("pluginsetup",this.getEventHash())}return a.prototype.getEventHash=function(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return a.name=this.name,a.plugin=this.constructor,a.instance=this,a},a.prototype.trigger=function(a){var b=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return m.trigger(this.eventBusEl_,a,this.getEventHash(b))},a.prototype.handleStateChanged=function(a){},a.prototype.dispose=function(){var a=this.name,b=this.player;this.trigger("dispose"),this.off(),b.off("dispose",this.dispose),b.activePlugins_[a]=!1,this.player=this.state=null,b[a]=y(a,t[a])},a.isBasic=function(b){var c="string"==typeof b?v(b):b;return"function"==typeof c&&!a.prototype.isPrototypeOf(c.prototype)},a.registerPlugin=function(b,c){if("string"!=typeof b)throw new Error('Illegal plugin name, "'+b+'", must be a string, was '+(void 0===b?"undefined":g(b))+".");if(u(b))q["default"].warn('A plugin named "'+b+'" already exists. You may want to avoid re-registering plugins!');else if(s["default"].prototype.hasOwnProperty(b))throw new Error('Illegal plugin name, "'+b+'", cannot share a name with an existing player method!');if("function"!=typeof c)throw new Error('Illegal plugin for "'+b+'", must be a function, was '+(void 0===c?"undefined":g(c))+".");return t[b]=c,"plugin"!==b&&(a.isBasic(c)?s["default"].prototype[b]=x(b,c):s["default"].prototype[b]=y(b,c)),c},a.deregisterPlugin=function(a){if("plugin"===a)throw new Error("Cannot de-register base plugin.");u(a)&&(delete t[a],delete s["default"].prototype[a])},a.getPlugins=function(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:Object.keys(t),b=void 0;return a.forEach(function(a){var c=v(a);c&&(b=b||{},b[a]=c)}),b},a.getPluginVersion=function(a){var b=v(a);return b&&b.VERSION||""},a}();z.getPlugin=v,z.BASE_PLUGIN_NAME="plugin",z.registerPlugin("plugin",z),s["default"].prototype.usingPlugin=function(a){return!!this.activePlugins_&&this.activePlugins_[a]===!0},s["default"].prototype.hasPlugin=function(a){return!!u(a)},c["default"]=z},{53:53,54:54,56:56,86:86,88:88,91:91}],58:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(3),j=e(i),k=a(5),l=e(k),m=a(88),n=d(m),o=a(85),p=d(o),q=a(81),r=d(q),s=function(a){function b(c,d){f(this,b);var e=g(this,a.call(this,c,d));return e.update(),c.on("posterchange",n.bind(e,e.update)),e}return h(b,a),b.prototype.dispose=function(){this.player().off("posterchange",this.update),a.prototype.dispose.call(this)},b.prototype.createEl=function(){var a=p.createEl("div",{className:"vjs-poster",tabIndex:-1});return r.BACKGROUND_SIZE_SUPPORTED||(this.fallbackImg_=p.createEl("img"),a.appendChild(this.fallbackImg_)),a},b.prototype.update=function(a){var b=this.player().poster();this.setSrc(b),b?this.show():this.hide()},b.prototype.setSrc=function(a){if(this.fallbackImg_)this.fallbackImg_.src=a;else{var b="";a&&(b='url("'+a+'")'),this.el_.style.backgroundImage=b}},b.prototype.handleClick=function(a){this.player_.controls()&&(this.player_.paused()?this.player_.play():this.player_.pause())},b}(j["default"]);l["default"].registerComponent("PosterImage",s),c["default"]=s},{3:3,5:5,81:81,85:85,88:88}],59:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function f(a,b){b&&(p=b),n["default"].setTimeout(q,a)}c.__esModule=!0,c.hasLoaded=c.autoSetupTimeout=c.autoSetup=void 0;var g=a(85),h=e(g),i=a(86),j=e(i),k=a(99),l=d(k),m=a(100),n=d(m),o=!1,p=void 0,q=function(){if(h.isReal()){var a=l["default"].getElementsByTagName("video"),b=l["default"].getElementsByTagName("audio"),c=[];if(a&&a.length>0)for(var d=0,e=a.length;d<e;d++)c.push(a[d]);if(b&&b.length>0)for(var g=0,i=b.length;g<i;g++)c.push(b[g]);if(c&&c.length>0)for(var j=0,k=c.length;j<k;j++){var m=c[j];if(!m||!m.getAttribute){f(1);break}if(void 0===m.player){var n=m.getAttribute("data-setup");null!==n&&p(m)}}else o||f(1)}};h.isReal()&&"complete"===l["default"].readyState?o=!0:j.one(n["default"],"load",function(){o=!0});var r=function(){return o};c.autoSetup=q,c.autoSetupTimeout=f,c.hasLoaded=r},{100:100,85:85,86:86,99:99}],60:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(5),j=e(i),k=a(85),l=d(k),m=a(93),n=function(a){function b(c,d){f(this,b);var e=g(this,a.call(this,c,d));return e.bar=e.getChild(e.options_.barName),e.vertical(!!e.options_.vertical),e.on("mousedown",e.handleMouseDown),e.on("touchstart",e.handleMouseDown),e.on("focus",e.handleFocus),e.on("blur",e.handleBlur),e.on("click",e.handleClick),e.on(c,"controlsvisible",e.update),e.playerEvent&&e.on(c,e.playerEvent,e.update),e}return h(b,a),b.prototype.createEl=function(b){var c=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},d=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return c.className=c.className+" vjs-slider",c=(0,m.assign)({tabIndex:0},c),d=(0,m.assign)({role:"slider","aria-valuenow":0,"aria-valuemin":0,"aria-valuemax":100,tabIndex:0},d),a.prototype.createEl.call(this,b,c,d)},b.prototype.handleMouseDown=function(a){var b=this.bar.el_.ownerDocument;a.preventDefault(),l.blockTextSelection(),this.addClass("vjs-sliding"),this.trigger("slideractive"),this.on(b,"mousemove",this.handleMouseMove),this.on(b,"mouseup",this.handleMouseUp),this.on(b,"touchmove",this.handleMouseMove),this.on(b,"touchend",this.handleMouseUp),this.handleMouseMove(a)},b.prototype.handleMouseMove=function(a){},b.prototype.handleMouseUp=function(){var a=this.bar.el_.ownerDocument;l.unblockTextSelection(),this.removeClass("vjs-sliding"),this.trigger("sliderinactive"),this.off(a,"mousemove",this.handleMouseMove),this.off(a,"mouseup",this.handleMouseUp),this.off(a,"touchmove",this.handleMouseMove),this.off(a,"touchend",this.handleMouseUp),this.update()},b.prototype.update=function(){if(this.el_){var a=this.getPercent(),b=this.bar;if(b){("number"!=typeof a||a!==a||a<0||a===1/0)&&(a=0);var c=(100*a).toFixed(2)+"%",d=b.el().style;return this.vertical()?d.height=c:d.width=c,a}}},b.prototype.calculateDistance=function(a){var b=l.getPointerPosition(this.el_,a);return this.vertical()?b.y:b.x},b.prototype.handleFocus=function(){this.on(this.bar.el_.ownerDocument,"keydown",this.handleKeyPress)},b.prototype.handleKeyPress=function(a){37===a.which||40===a.which?(a.preventDefault(),this.stepBack()):38!==a.which&&39!==a.which||(a.preventDefault(),this.stepForward())},b.prototype.handleBlur=function(){this.off(this.bar.el_.ownerDocument,"keydown",this.handleKeyPress)},b.prototype.handleClick=function(a){a.stopImmediatePropagation(),a.preventDefault()},b.prototype.vertical=function(a){if(void 0===a)return this.vertical_||!1;this.vertical_=!!a,this.vertical_?this.addClass("vjs-slider-vertical"):this.addClass("vjs-slider-horizontal")},b}(j["default"]);j["default"].registerComponent("Slider",n),c["default"]=n},{5:5,85:85,93:93}],61:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){return a.raw=b,a}function g(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function h(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function i(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var j=f(["Text Tracks are being loaded from another origin but the crossorigin attribute isn't used.\n            This may prevent text tracks from loading."],["Text Tracks are being loaded from another origin but the crossorigin attribute isn't used.\n            This may prevent text tracks from loading."]),k=a(64),l=e(k),m=a(85),n=d(m),o=a(97),p=d(o),q=a(91),r=e(q),s=a(103),t=e(s),u=a(81),v=d(u),w=a(99),x=e(w),y=a(100),z=e(y),A=a(93),B=a(92),C=e(B),D=a(96),E=e(D),F=a(77),G=function(a){function b(c,d){g(this,b);var e=h(this,a.call(this,c,d)),f=c.source,i=!1;if(f&&(e.el_.currentSrc!==f.src||c.tag&&3===c.tag.initNetworkState_)?e.setSource(f):e.handleLateInit_(e.el_),e.el_.hasChildNodes()){for(var k=e.el_.childNodes,l=k.length,m=[];l--;){var n=k[l];"track"===n.nodeName.toLowerCase()&&(e.featuresNativeTextTracks?(e.remoteTextTrackEls().addTrackElement_(n),e.remoteTextTracks().addTrack(n.track),e.textTracks().addTrack(n.track),i||e.el_.hasAttribute("crossorigin")||!p.isCrossOrigin(n.src)||(i=!0)):m.push(n))}for(var o=0;o<m.length;o++)e.el_.removeChild(m[o])}return e.proxyNativeTracks_(),e.featuresNativeTextTracks&&i&&r["default"].warn((0,t["default"])(j)),(v.TOUCH_ENABLED||v.IS_IPHONE||v.IS_NATIVE_ANDROID)&&c.nativeControlsForTouch===!0&&e.setControls(!0),e.proxyWebkitFullscreen_(),e.triggerReady(),e}return i(b,a),b.prototype.dispose=function(){b.disposeMediaElement(this.el_),a.prototype.dispose.call(this)},b.prototype.proxyNativeTracks_=function(){var a=this;F.NORMAL.names.forEach(function(b){var c=F.NORMAL[b],d=a.el()[c.getterName],e=a[c.getterName]();if(a["featuresNative"+c.capitalName+"Tracks"]&&d&&d.addEventListener){var f={change:function(a){e.trigger({type:"change",target:e,currentTarget:e,srcElement:e})},addtrack:function(a){e.addTrack(a.track)},removetrack:function(a){e.removeTrack(a.track)}},g=function(){for(var a=[],b=0;b<e.length;b++){for(var c=!1,f=0;f<d.length;f++)if(d[f]===e[b]){c=!0;break}c||a.push(e[b])}for(;a.length;)e.removeTrack(a.shift())};Object.keys(f).forEach(function(b){var c=f[b];d.addEventListener(b,c),a.on("dispose",function(a){return d.removeEventListener(b,c)})}),a.on("loadstart",g),a.on("dispose",function(b){return a.off("loadstart",g)})}})},b.prototype.createEl=function(){var a=this.options_.tag;if(!a||!this.options_.playerElIngest&&!this.movingMediaElementInDOM){if(a){var c=a.cloneNode(!0);a.parentNode&&a.parentNode.insertBefore(c,a),b.disposeMediaElement(a),a=c}else{a=x["default"].createElement("video");var d=this.options_.tag&&n.getAttributes(this.options_.tag),e=(0,C["default"])({},d);v.TOUCH_ENABLED&&this.options_.nativeControlsForTouch===!0||delete e.controls,n.setAttributes(a,(0,A.assign)(e,{id:this.options_.techId,"class":"vjs-tech"}))}a.playerId=this.options_.playerId}for(var f=["autoplay","preload","loop","muted"],g=f.length-1;g>=0;g--){var h=f[g],i={};"undefined"!=typeof this.options_[h]&&(i[h]=this.options_[h]),n.setAttributes(a,i)}return a},b.prototype.handleLateInit_=function(a){if(0!==a.networkState&&3!==a.networkState){if(0===a.readyState){var b=!1,c=function(){b=!0};this.on("loadstart",c);var d=function(){b||this.trigger("loadstart")};return this.on("loadedmetadata",d),void this.ready(function(){this.off("loadstart",c),this.off("loadedmetadata",d),b||this.trigger("loadstart")})}var e=["loadstart"];e.push("loadedmetadata"),a.readyState>=2&&e.push("loadeddata"),a.readyState>=3&&e.push("canplay"),a.readyState>=4&&e.push("canplaythrough"),this.ready(function(){e.forEach(function(a){this.trigger(a)},this)})}},b.prototype.setCurrentTime=function(a){try{this.el_.currentTime=a}catch(b){(0,r["default"])(b,"Video is not ready. (Video.js)")}},b.prototype.duration=function(){var a=this;if(this.el_.duration===1/0&&v.IS_ANDROID&&v.IS_CHROME&&0===this.el_.currentTime){var b=function c(){a.el_.currentTime>0&&(a.el_.duration===1/0&&a.trigger("durationchange"),a.off("timeupdate",c))};return this.on("timeupdate",b),NaN}return this.el_.duration||NaN},b.prototype.width=function(){return this.el_.offsetWidth},b.prototype.height=function(){return this.el_.offsetHeight},b.prototype.proxyWebkitFullscreen_=function(){var a=this;if("webkitDisplayingFullscreen"in this.el_){var b=function(){this.trigger("fullscreenchange",{isFullscreen:!1})},c=function(){this.one("webkitendfullscreen",b),this.trigger("fullscreenchange",{isFullscreen:!0})};this.on("webkitbeginfullscreen",c),this.on("dispose",function(){a.off("webkitbeginfullscreen",c),a.off("webkitendfullscreen",b)})}},b.prototype.supportsFullScreen=function(){if("function"==typeof this.el_.webkitEnterFullScreen){var a=z["default"].navigator&&z["default"].navigator.userAgent||"";if(/Android/.test(a)||!/Chrome|Mac OS X 10.5/.test(a))return!0}return!1},b.prototype.enterFullScreen=function(){var a=this.el_;a.paused&&a.networkState<=a.HAVE_METADATA?(this.el_.play(),this.setTimeout(function(){a.pause(),a.webkitEnterFullScreen()},0)):a.webkitEnterFullScreen()},b.prototype.exitFullScreen=function(){this.el_.webkitExitFullScreen()},b.prototype.src=function(a){if(void 0===a)return this.el_.src;this.setSrc(a)},b.prototype.reset=function(){b.resetMediaElement(this.el_)},b.prototype.currentSrc=function(){return this.currentSource_?this.currentSource_.src:this.el_.currentSrc},b.prototype.setControls=function(a){this.el_.controls=!!a},b.prototype.addTextTrack=function(b,c,d){return this.featuresNativeTextTracks?this.el_.addTextTrack(b,c,d):a.prototype.addTextTrack.call(this,b,c,d)},b.prototype.createRemoteTextTrack=function(b){if(!this.featuresNativeTextTracks)return a.prototype.createRemoteTextTrack.call(this,b);var c=x["default"].createElement("track");return b.kind&&(c.kind=b.kind),b.label&&(c.label=b.label),(b.language||b.srclang)&&(c.srclang=b.language||b.srclang),b["default"]&&(c["default"]=b["default"]),b.id&&(c.id=b.id),b.src&&(c.src=b.src),c},b.prototype.addRemoteTextTrack=function(b,c){var d=a.prototype.addRemoteTextTrack.call(this,b,c);return this.featuresNativeTextTracks&&this.el().appendChild(d),d},b.prototype.removeRemoteTextTrack=function(b){if(a.prototype.removeRemoteTextTrack.call(this,b),this.featuresNativeTextTracks)for(var c=this.$$("track"),d=c.length;d--;)b!==c[d]&&b!==c[d].track||this.el().removeChild(c[d])},b}(l["default"]);if(n.isReal()){G.TEST_VID=x["default"].createElement("video");var H=x["default"].createElement("track");H.kind="captions",H.srclang="en",H.label="English",G.TEST_VID.appendChild(H)}G.isSupported=function(){try{G.TEST_VID.volume=.5}catch(a){return!1}return!(!G.TEST_VID||!G.TEST_VID.canPlayType)},G.canPlayType=function(a){return G.TEST_VID.canPlayType(a)},G.canPlaySource=function(a,b){return G.canPlayType(a.type)},G.canControlVolume=function(){try{var a=G.TEST_VID.volume;return G.TEST_VID.volume=a/2+.1,a!==G.TEST_VID.volume}catch(b){return!1}},G.canControlPlaybackRate=function(){if(v.IS_ANDROID&&v.IS_CHROME)return!1;try{var a=G.TEST_VID.playbackRate;return G.TEST_VID.playbackRate=a/2+.1,a!==G.TEST_VID.playbackRate}catch(b){return!1}},G.supportsNativeTextTracks=function(){return v.IS_ANY_SAFARI},G.supportsNativeVideoTracks=function(){return!(!G.TEST_VID||!G.TEST_VID.videoTracks)},G.supportsNativeAudioTracks=function(){return!(!G.TEST_VID||!G.TEST_VID.audioTracks)},G.Events=["loadstart","suspend","abort","error","emptied","stalled","loadedmetadata","loadeddata","canplay","canplaythrough","playing","waiting","seeking","seeked","ended","durationchange","timeupdate","progress","play","pause","ratechange","resize","volumechange"],G.prototype.featuresVolumeControl=G.canControlVolume(),G.prototype.featuresPlaybackRate=G.canControlPlaybackRate(),G.prototype.movingMediaElementInDOM=!v.IS_IOS,G.prototype.featuresFullscreenResize=!0,G.prototype.featuresProgressEvents=!0,G.prototype.featuresTimeupdateEvents=!0,G.prototype.featuresNativeTextTracks=G.supportsNativeTextTracks(),G.prototype.featuresNativeVideoTracks=G.supportsNativeVideoTracks(),G.prototype.featuresNativeAudioTracks=G.supportsNativeAudioTracks();var I=G.TEST_VID&&G.TEST_VID.constructor.prototype.canPlayType,J=/^application\/(?:x-|vnd\.apple\.)mpegurl/i,K=/^video\/mp4/i;G.patchCanPlayType=function(){v.ANDROID_VERSION>=4&&!v.IS_FIREFOX?G.TEST_VID.constructor.prototype.canPlayType=function(a){return a&&J.test(a)?"maybe":I.call(this,a)}:v.IS_OLD_ANDROID&&(G.TEST_VID.constructor.prototype.canPlayType=function(a){return a&&K.test(a)?"maybe":I.call(this,a)})},G.unpatchCanPlayType=function(){var a=G.TEST_VID.constructor.prototype.canPlayType;return G.TEST_VID.constructor.prototype.canPlayType=I,a},G.patchCanPlayType(),G.disposeMediaElement=function(a){if(a){for(a.parentNode&&a.parentNode.removeChild(a);a.hasChildNodes();)a.removeChild(a.firstChild);a.removeAttribute("src"),"function"==typeof a.load&&function(){try{a.load()}catch(b){}}()}},G.resetMediaElement=function(a){if(a){for(var b=a.querySelectorAll("source"),c=b.length;c--;)a.removeChild(b[c]);a.removeAttribute("src"),"function"==typeof a.load&&function(){try{a.load()}catch(b){}}()}},["paused","currentTime","buffered","volume","muted","defaultMuted","poster","preload","autoplay","controls","loop","error","seeking","seekable","ended","defaultMuted","playbackRate","defaultPlaybackRate","played","networkState","readyState","videoWidth","videoHeight"].forEach(function(a){G.prototype[a]=function(){return this.el_[a]}}),["volume","muted","defaultMuted","src","poster","preload","autoplay","loop","playbackRate","defaultPlaybackRate"].forEach(function(a){G.prototype["set"+(0,E["default"])(a)]=function(b){this.el_[a]=b}}),["pause","load","play"].forEach(function(a){G.prototype[a]=function(){return this.el_[a]()}}),l["default"].withSourceHandlers(G),G.nativeSourceHandler={},G.nativeSourceHandler.canPlayType=function(a){try{return G.TEST_VID.canPlayType(a)}catch(b){return""}},G.nativeSourceHandler.canHandleSource=function(a,b){if(a.type)return G.nativeSourceHandler.canPlayType(a.type);if(a.src){var c=p.getFileExtension(a.src);return G.nativeSourceHandler.canPlayType("video/"+c)}return""},G.nativeSourceHandler.handleSource=function(a,b,c){b.setSrc(a.src)},G.nativeSourceHandler.dispose=function(){},G.registerSourceHandler(G.nativeSourceHandler),l["default"].registerTech("Html5",G),c["default"]=G},{100:100,103:103,64:64,77:77,81:81,85:85,91:91,92:92,93:93,96:96,97:97,99:99}],62:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function f(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function g(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var h=a(5),i=d(h),j=a(64),k=d(j),l=a(96),m=d(l),n=a(92),o=d(n),p=function(a){function b(c,d,g){e(this,b);var h=(0,o["default"])({createEl:!1},d),j=f(this,a.call(this,c,h,g));if(d.playerOptions.sources&&0!==d.playerOptions.sources.length)c.src(d.playerOptions.sources);else for(var l=0,n=d.playerOptions.techOrder;l<n.length;l++){var p=(0,m["default"])(n[l]),q=k["default"].getTech(p);if(p||(q=i["default"].getComponent(p)),q&&q.isSupported()){c.loadTech_(p);break}}return j}return g(b,a),b}(i["default"]);i["default"].registerComponent("MediaLoader",p),c["default"]=p},{5:5,64:64,92:92,96:96}],63:[function(a,b,c){"use strict";function d(a,b){m[a]=m[a]||[],m[a].push(b)}function e(a){return a?m[a]:m}function f(a,b,c){a.setTimeout(function(){return k(b,m[b.type],c,a)},1)}function g(a,b){a.forEach(function(a){return a.setTech&&a.setTech(b)})}function h(a,b,c){return a.reduceRight(j(c),b[c]())}function i(a,b,c,d){return b[c](a.reduce(j(c),d))}function j(a){return function(b,c){return c[a]?c[a](b):b}}function k(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},b=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],c=arguments[2],d=arguments[3],e=arguments.length>4&&void 0!==arguments[4]?arguments[4]:[],f=arguments.length>5&&void 0!==arguments[5]&&arguments[5],g=b[0],h=b.slice(1);if("string"==typeof g)k(a,m[g],c,d,e,f);else if(g){var i=g(d);i.setSource((0,l.assign)({},a),function(b,g){if(b)return k(a,h,c,d,e,f);e.push(i),k(g,a.type===g.type?h:m[g.type],c,d,e,f)})}else h.length?k(a,h,c,d,e,f):f?c(a,e):k(a,m["*"],c,d,e,!0)}c.__esModule=!0,c.allowedSetters=c.allowedGetters=void 0,c.use=d,c.getMiddleware=e,c.setSource=f,c.setTech=g,c.get=h,c.set=i;var l=a(93),m={};c.allowedGetters={buffered:1,currentTime:1,duration:1,seekable:1,played:1},c.allowedSetters={setCurrentTime:1}},{93:93}],64:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}function i(a,b,c,d){var e=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{},f=a.textTracks();e.kind=b,c&&(e.label=c),d&&(e.language=d),e.tech=a;var g=new B.ALL.text.TrackClass(e);return f.addTrack(g),g}c.__esModule=!0;var j=a(5),k=e(j),l=a(92),m=e(l),n=a(88),o=d(n),p=a(91),q=e(p),r=a(95),s=a(82),t=a(49),u=e(t),v=a(100),w=e(v),x=a(99),y=e(x),z=a(93),A=a(77),B=d(A),C=a(96),D=e(C),E=function(b){function c(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},d=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(){};f(this,c),a.reportTouchActivity=!1;var e=g(this,b.call(this,null,a,d));return e.hasStarted_=!1,e.on("playing",function(){this.hasStarted_=!0}),e.on("loadstart",function(){this.hasStarted_=!1}),B.ALL.names.forEach(function(b){var c=B.ALL[b];a&&a[c.getterName]&&(e[c.privateName]=a[c.getterName])}),e.featuresProgressEvents||e.manualProgressOn(),e.featuresTimeupdateEvents||e.manualTimeUpdatesOn(),["Text","Audio","Video"].forEach(function(b){a["native"+b+"Tracks"]===!1&&(e["featuresNative"+b+"Tracks"]=!1)}),a.nativeCaptions===!1||a.nativeTextTracks===!1?e.featuresNativeTextTracks=!1:a.nativeCaptions!==!0&&a.nativeTextTracks!==!0||(e.featuresNativeTextTracks=!0),e.featuresNativeTextTracks||e.emulateTextTracks(),e.autoRemoteTextTracks_=new B.ALL.text.ListClass,e.initTrackListeners(),a.nativeControlsForTouch||e.emitTapEvents(),e.constructor&&(e.name_=e.constructor.name||"Unknown Tech"),e}return h(c,b),c.prototype.manualProgressOn=function(){this.on("durationchange",this.onDurationChange),this.manualProgress=!0,this.one("ready",this.trackProgress)},c.prototype.manualProgressOff=function(){this.manualProgress=!1,this.stopTrackingProgress(),this.off("durationchange",this.onDurationChange)},c.prototype.trackProgress=function(a){this.stopTrackingProgress(),this.progressInterval=this.setInterval(o.bind(this,function(){
        var a=this.bufferedPercent();this.bufferedPercent_!==a&&this.trigger("progress"),this.bufferedPercent_=a,1===a&&this.stopTrackingProgress()}),500)},c.prototype.onDurationChange=function(a){this.duration_=this.duration()},c.prototype.buffered=function(){return(0,r.createTimeRange)(0,0)},c.prototype.bufferedPercent=function(){return(0,s.bufferedPercent)(this.buffered(),this.duration_)},c.prototype.stopTrackingProgress=function(){this.clearInterval(this.progressInterval)},c.prototype.manualTimeUpdatesOn=function(){this.manualTimeUpdates=!0,this.on("play",this.trackCurrentTime),this.on("pause",this.stopTrackingCurrentTime)},c.prototype.manualTimeUpdatesOff=function(){this.manualTimeUpdates=!1,this.stopTrackingCurrentTime(),this.off("play",this.trackCurrentTime),this.off("pause",this.stopTrackingCurrentTime)},c.prototype.trackCurrentTime=function(){this.currentTimeInterval&&this.stopTrackingCurrentTime(),this.currentTimeInterval=this.setInterval(function(){this.trigger({type:"timeupdate",target:this,manuallyTriggered:!0})},250)},c.prototype.stopTrackingCurrentTime=function(){this.clearInterval(this.currentTimeInterval),this.trigger({type:"timeupdate",target:this,manuallyTriggered:!0})},c.prototype.dispose=function(){this.clearTracks(B.NORMAL.names),this.manualProgress&&this.manualProgressOff(),this.manualTimeUpdates&&this.manualTimeUpdatesOff(),b.prototype.dispose.call(this)},c.prototype.clearTracks=function(a){var b=this;a=[].concat(a),a.forEach(function(a){for(var c=b[a+"Tracks"]()||[],d=c.length;d--;){var e=c[d];"text"===a&&b.removeRemoteTextTrack(e),c.removeTrack(e)}})},c.prototype.cleanupAutoTextTracks=function(){for(var a=this.autoRemoteTextTracks_||[],b=a.length;b--;){var c=a[b];this.removeRemoteTextTrack(c)}},c.prototype.reset=function(){},c.prototype.error=function(a){return void 0!==a&&(this.error_=new u["default"](a),this.trigger("error")),this.error_},c.prototype.played=function(){return this.hasStarted_?(0,r.createTimeRange)(0,0):(0,r.createTimeRange)()},c.prototype.setCurrentTime=function(){this.manualTimeUpdates&&this.trigger({type:"timeupdate",target:this,manuallyTriggered:!0})},c.prototype.initTrackListeners=function(){var a=this;B.NORMAL.names.forEach(function(b){var c=B.NORMAL[b],d=function(){a.trigger(b+"trackchange")},e=a[c.getterName]();e.addEventListener("removetrack",d),e.addEventListener("addtrack",d),a.on("dispose",function(){e.removeEventListener("removetrack",d),e.removeEventListener("addtrack",d)})})},c.prototype.addWebVttScript_=function(){var b=this;if(!w["default"].WebVTT)if(y["default"].body.contains(this.el())){var c=a(110);if(!this.options_["vtt.js"]&&(0,z.isPlain)(c)&&Object.keys(c).length>0)return void this.trigger("vttjsloaded");var d=y["default"].createElement("script");d.src=this.options_["vtt.js"]||"https://vjs.zencdn.net/vttjs/0.12.3/vtt.min.js",d.onload=function(){b.trigger("vttjsloaded")},d.onerror=function(){b.trigger("vttjserror")},this.on("dispose",function(){d.onload=null,d.onerror=null}),w["default"].WebVTT=!0,this.el().parentNode.appendChild(d)}else this.ready(this.addWebVttScript_)},c.prototype.emulateTextTracks=function(){var a=this,b=this.textTracks(),c=this.remoteTextTracks(),d=function(a){return b.addTrack(a.track)},e=function(a){return b.removeTrack(a.track)};c.on("addtrack",d),c.on("removetrack",e),this.addWebVttScript_();var f=function(){return a.trigger("texttrackchange")},g=function(){f();for(var a=0;a<b.length;a++){var c=b[a];c.removeEventListener("cuechange",f),"showing"===c.mode&&c.addEventListener("cuechange",f)}};g(),b.addEventListener("change",g),b.addEventListener("addtrack",g),b.addEventListener("removetrack",g),this.on("dispose",function(){c.off("addtrack",d),c.off("removetrack",e),b.removeEventListener("change",g),b.removeEventListener("addtrack",g),b.removeEventListener("removetrack",g);for(var a=0;a<b.length;a++){b[a].removeEventListener("cuechange",f)}})},c.prototype.addTextTrack=function(a,b,c){if(!a)throw new Error("TextTrack kind is required but was not provided");return i(this,a,b,c)},c.prototype.createRemoteTextTrack=function(a){var b=(0,m["default"])(a,{tech:this});return new B.REMOTE.remoteTextEl.TrackClass(b)},c.prototype.addRemoteTextTrack=function(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},b=arguments[1],c=this.createRemoteTextTrack(a);return b!==!0&&b!==!1&&(q["default"].warn('Calling addRemoteTextTrack without explicitly setting the "manualCleanup" parameter to `true` is deprecated and default to `false` in future version of video.js'),b=!0),this.remoteTextTrackEls().addTrackElement_(c),this.remoteTextTracks().addTrack(c.track),b!==!0&&this.autoRemoteTextTracks_.addTrack(c.track),c},c.prototype.removeRemoteTextTrack=function(a){var b=this.remoteTextTrackEls().getTrackElementByTrack_(a);this.remoteTextTrackEls().removeTrackElement_(b),this.remoteTextTracks().removeTrack(a),this.autoRemoteTextTracks_.removeTrack(a)},c.prototype.setPoster=function(){},c.prototype.canPlayType=function(){return""},c.canPlayType=function(){return""},c.canPlaySource=function(a,b){return c.canPlayType(a.type)},c.isTech=function(a){return a.prototype instanceof c||a instanceof c||a===c},c.registerTech=function(a,b){if(c.techs_||(c.techs_={}),!c.isTech(b))throw new Error("Tech "+a+" must be a Tech");if(!c.canPlayType)throw new Error("Techs must have a static canPlayType method on them");if(!c.canPlaySource)throw new Error("Techs must have a static canPlaySource method on them");return a=(0,D["default"])(a),c.techs_[a]=b,"Tech"!==a&&c.defaultTechOrder_.push(a),b},c.getTech=function(a){if(a)return a=(0,D["default"])(a),c.techs_&&c.techs_[a]?c.techs_[a]:w["default"]&&w["default"].videojs&&w["default"].videojs[a]?(q["default"].warn("The "+a+" tech was added to the videojs object when it should be registered using videojs.registerTech(name, tech)"),w["default"].videojs[a]):void 0},c}(k["default"]);B.ALL.names.forEach(function(a){var b=B.ALL[a];E.prototype[b.getterName]=function(){return this[b.privateName]=this[b.privateName]||new b.ListClass,this[b.privateName]}}),E.prototype.featuresVolumeControl=!0,E.prototype.featuresFullscreenResize=!1,E.prototype.featuresPlaybackRate=!1,E.prototype.featuresProgressEvents=!1,E.prototype.featuresTimeupdateEvents=!1,E.prototype.featuresNativeTextTracks=!1,E.withSourceHandlers=function(a){a.registerSourceHandler=function(b,c){var d=a.sourceHandlers;d||(d=a.sourceHandlers=[]),void 0===c&&(c=d.length),d.splice(c,0,b)},a.canPlayType=function(b){for(var c=a.sourceHandlers||[],d=void 0,e=0;e<c.length;e++)if(d=c[e].canPlayType(b))return d;return""},a.selectSourceHandler=function(b,c){for(var d=a.sourceHandlers||[],e=0;e<d.length;e++)if(d[e].canHandleSource(b,c))return d[e];return null},a.canPlaySource=function(b,c){var d=a.selectSourceHandler(b,c);return d?d.canHandleSource(b,c):""},["seekable","duration"].forEach(function(a){var b=this[a];"function"==typeof b&&(this[a]=function(){return this.sourceHandler_&&this.sourceHandler_[a]?this.sourceHandler_[a].apply(this.sourceHandler_,arguments):b.apply(this,arguments)})},a.prototype),a.prototype.setSource=function(b){var c=a.selectSourceHandler(b,this.options_);c||(a.nativeSourceHandler?c=a.nativeSourceHandler:q["default"].error("No source hander found for the current source.")),this.disposeSourceHandler(),this.off("dispose",this.disposeSourceHandler),c!==a.nativeSourceHandler&&(this.currentSource_=b),this.sourceHandler_=c.handleSource(b,this,this.options_),this.on("dispose",this.disposeSourceHandler)},a.prototype.disposeSourceHandler=function(){this.currentSource_&&(this.clearTracks(["audio","video"]),this.currentSource_=null),this.cleanupAutoTextTracks(),this.sourceHandler_&&(this.sourceHandler_.dispose&&this.sourceHandler_.dispose(),this.sourceHandler_=null)}},k["default"].registerComponent("Tech",E),E.registerTech("Tech",E),E.defaultTechOrder_=[],c["default"]=E},{100:100,110:110,49:49,5:5,77:77,82:82,88:88,91:91,92:92,93:93,95:95,96:96,99:99}],65:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(76),j=e(i),k=a(81),l=d(k),m=a(99),n=e(m),o=function(a,b){for(var c=0;c<a.length;c++)b.id!==a[c].id&&(a[c].enabled=!1)},p=function(a){function b(){var c,d,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];f(this,b);for(var h=void 0,i=e.length-1;i>=0;i--)if(e[i].enabled){o(e,e[i]);break}if(l.IS_IE8){h=n["default"].createElement("custom");for(var k in j["default"].prototype)"constructor"!==k&&(h[k]=j["default"].prototype[k]);for(var m in b.prototype)"constructor"!==m&&(h[m]=b.prototype[m])}return h=c=g(this,a.call(this,e,h)),h.changing_=!1,d=h,g(c,d)}return h(b,a),b.prototype.addTrack=function(b){var c=this;b.enabled&&o(this,b),a.prototype.addTrack.call(this,b),b.addEventListener&&b.addEventListener("enabledchange",function(){c.changing_||(c.changing_=!0,o(c,b),c.changing_=!1,c.trigger("change"))})},b}(j["default"]);c["default"]=p},{76:76,81:81,99:99}],66:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(75),j=a(78),k=e(j),l=a(92),m=e(l),n=a(81),o=d(n),p=function(a){function b(){var c,d,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};f(this,b);var h=(0,m["default"])(e,{kind:i.AudioTrackKind[e.kind]||""}),j=c=g(this,a.call(this,h)),k=!1;if(o.IS_IE8)for(var l in b.prototype)"constructor"!==l&&(j[l]=b.prototype[l]);return Object.defineProperty(j,"enabled",{get:function(){return k},set:function(a){"boolean"==typeof a&&a!==k&&(k=a,this.trigger("enabledchange"))}}),h.enabled&&(j.enabled=h.enabled),j.loaded_=!0,d=j,g(c,d)}return h(b,a),b}(k["default"]);c["default"]=p},{75:75,78:78,81:81,92:92}],67:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}c.__esModule=!0;var g=a(81),h=e(g),i=a(99),j=d(i),k=function(){function a(){var b=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];f(this,a);var c=this;if(h.IS_IE8){c=j["default"].createElement("custom");for(var d in a.prototype)"constructor"!==d&&(c[d]=a.prototype[d])}c.trackElements_=[],Object.defineProperty(c,"length",{get:function(){return this.trackElements_.length}});for(var e=0,g=b.length;e<g;e++)c.addTrackElement_(b[e]);if(h.IS_IE8)return c}return a.prototype.addTrackElement_=function(a){var b=this.trackElements_.length;""+b in this||Object.defineProperty(this,b,{get:function(){return this.trackElements_[b]}}),this.trackElements_.indexOf(a)===-1&&this.trackElements_.push(a)},a.prototype.getTrackElementByTrack_=function(a){for(var b=void 0,c=0,d=this.trackElements_.length;c<d;c++)if(a===this.trackElements_[c].track){b=this.trackElements_[c];break}return b},a.prototype.removeTrackElement_=function(a){for(var b=0,c=this.trackElements_.length;b<c;b++)if(a===this.trackElements_[b]){this.trackElements_.splice(b,1);break}},a}();c["default"]=k},{81:81,99:99}],68:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(81),j=e(i),k=a(99),l=d(k),m=a(45),n=d(m),o=a(74),p=d(o),q=function(a){function b(){var c=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};f(this,b);var d=g(this,a.call(this)),e=void 0,h=d;if(j.IS_IE8){h=l["default"].createElement("custom");for(var i in b.prototype)"constructor"!==i&&(h[i]=b.prototype[i])}var k=new p["default"](c);if(h.kind=k.kind,h.src=k.src,h.srclang=k.language,h.label=k.label,h["default"]=k["default"],Object.defineProperty(h,"readyState",{get:function(){return e}}),Object.defineProperty(h,"track",{get:function(){return k}}),e=0,k.addEventListener("loadeddata",function(){e=2,h.trigger({type:"load",target:h})}),j.IS_IE8){var m;return m=h,g(d,m)}return d}return h(b,a),b}(n["default"]);q.prototype.allowedEvents_={load:"load"},q.NONE=0,q.LOADING=1,q.LOADED=2,q.ERROR=3,c["default"]=q},{45:45,74:74,81:81,99:99}],69:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}c.__esModule=!0;var g=a(81),h=e(g),i=a(99),j=d(i),k=function(){function a(b){f(this,a);var c=this;if(h.IS_IE8){c=j["default"].createElement("custom");for(var d in a.prototype)"constructor"!==d&&(c[d]=a.prototype[d])}if(a.prototype.setCues_.call(c,b),Object.defineProperty(c,"length",{get:function(){return this.length_}}),h.IS_IE8)return c}return a.prototype.setCues_=function(a){var b=this.length||0,c=0,d=a.length;this.cues_=a,this.length_=a.length;var e=function(a){""+a in this||Object.defineProperty(this,""+a,{get:function(){return this.cues_[a]}})};if(b<d)for(c=b;c<d;c++)e.call(this,c)},a.prototype.getCueById=function(a){for(var b=null,c=0,d=this.length;c<d;c++){var e=this[c];if(e.id===a){b=e;break}}return b},a}();c["default"]=k},{81:81,99:99}],70:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}function i(a,b){return"rgba("+parseInt(a[1]+a[1],16)+","+parseInt(a[2]+a[2],16)+","+parseInt(a[3]+a[3],16)+","+b+")"}function j(a,b,c){try{a.style[b]=c}catch(d){return}}c.__esModule=!0;var k=a(5),l=e(k),m=a(88),n=d(m),o=a(100),p=e(o),q={monospace:"monospace",sansSerif:"sans-serif",serif:"serif",monospaceSansSerif:'"Andale Mono", "Lucida Console", monospace',monospaceSerif:'"Courier New", monospace',proportionalSansSerif:"sans-serif",proportionalSerif:"serif",casual:'"Comic Sans MS", Impact, fantasy',script:'"Monotype Corsiva", cursive',smallcaps:'"Andale Mono", "Lucida Console", monospace, sans-serif'},r=function(a){function b(c,d,e){f(this,b);var h=g(this,a.call(this,c,d,e));return c.on("loadstart",n.bind(h,h.toggleDisplay)),c.on("texttrackchange",n.bind(h,h.updateDisplay)),c.ready(n.bind(h,function(){if(c.tech_&&c.tech_.featuresNativeTextTracks)return void this.hide();c.on("fullscreenchange",n.bind(this,this.updateDisplay));for(var a=this.options_.playerOptions.tracks||[],b=0;b<a.length;b++)this.player_.addRemoteTextTrack(a[b],!0);for(var d={captions:1,subtitles:1},e=this.player_.textTracks(),f=void 0,g=void 0,h=0;h<e.length;h++){var i=e[h];i["default"]&&("descriptions"!==i.kind||f?i.kind in d&&!g&&(g=i):f=i)}g?g.mode="showing":f&&(f.mode="showing")})),h}return h(b,a),b.prototype.toggleDisplay=function(){this.player_.tech_&&this.player_.tech_.featuresNativeTextTracks?this.hide():this.show()},b.prototype.createEl=function(){return a.prototype.createEl.call(this,"div",{className:"vjs-text-track-display"},{"aria-live":"off","aria-atomic":"true"})},b.prototype.clearDisplay=function(){"function"==typeof p["default"].WebVTT&&p["default"].WebVTT.processCues(p["default"],[],this.el_)},b.prototype.updateDisplay=function(){var a=this.player_.textTracks();this.clearDisplay();for(var b=null,c=null,d=a.length;d--;){var e=a[d];"showing"===e.mode&&("descriptions"===e.kind?b=e:c=e)}c?("off"!==this.getAttribute("aria-live")&&this.setAttribute("aria-live","off"),this.updateForTrack(c)):b&&("assertive"!==this.getAttribute("aria-live")&&this.setAttribute("aria-live","assertive"),this.updateForTrack(b))},b.prototype.updateForTrack=function(a){if("function"==typeof p["default"].WebVTT&&a.activeCues){for(var b=this.player_.textTrackSettings.getValues(),c=[],d=0;d<a.activeCues.length;d++)c.push(a.activeCues[d]);p["default"].WebVTT.processCues(p["default"],c,this.el_);for(var e=c.length;e--;){var f=c[e];if(f){var g=f.displayState;if(b.color&&(g.firstChild.style.color=b.color),b.textOpacity&&j(g.firstChild,"color",i(b.color||"#fff",b.textOpacity)),b.backgroundColor&&(g.firstChild.style.backgroundColor=b.backgroundColor),b.backgroundOpacity&&j(g.firstChild,"backgroundColor",i(b.backgroundColor||"#000",b.backgroundOpacity)),b.windowColor&&(b.windowOpacity?j(g,"backgroundColor",i(b.windowColor,b.windowOpacity)):g.style.backgroundColor=b.windowColor),b.edgeStyle&&("dropshadow"===b.edgeStyle?g.firstChild.style.textShadow="2px 2px 3px #222, 2px 2px 4px #222, 2px 2px 5px #222":"raised"===b.edgeStyle?g.firstChild.style.textShadow="1px 1px #222, 2px 2px #222, 3px 3px #222":"depressed"===b.edgeStyle?g.firstChild.style.textShadow="1px 1px #ccc, 0 1px #ccc, -1px -1px #222, 0 -1px #222":"uniform"===b.edgeStyle&&(g.firstChild.style.textShadow="0 0 4px #222, 0 0 4px #222, 0 0 4px #222, 0 0 4px #222")),b.fontPercent&&1!==b.fontPercent){var h=p["default"].parseFloat(g.style.fontSize);g.style.fontSize=h*b.fontPercent+"px",g.style.height="auto",g.style.top="auto",g.style.bottom="2px"}b.fontFamily&&"default"!==b.fontFamily&&("small-caps"===b.fontFamily?g.firstChild.style.fontVariant="small-caps":g.firstChild.style.fontFamily=q[b.fontFamily])}}}},b}(l["default"]);l["default"].registerComponent("TextTrackDisplay",r),c["default"]=r},{100:100,5:5,88:88}],71:[function(a,b,c){"use strict";c.__esModule=!0;var d=function(a){return["kind","label","language","id","inBandMetadataTrackDispatchType","mode","src"].reduce(function(b,c,d){return a[c]&&(b[c]=a[c]),b},{cues:a.cues&&Array.prototype.map.call(a.cues,function(a){return{startTime:a.startTime,endTime:a.endTime,text:a.text,id:a.id}})})},e=function(a){var b=a.$$("track"),c=Array.prototype.map.call(b,function(a){return a.track});return Array.prototype.map.call(b,function(a){var b=d(a.track);return a.src&&(b.src=a.src),b}).concat(Array.prototype.filter.call(a.textTracks(),function(a){return c.indexOf(a)===-1}).map(d))},f=function(a,b){return a.forEach(function(a){var c=b.addRemoteTextTrack(a).track;!a.src&&a.cues&&a.cues.forEach(function(a){return c.addCue(a)})}),b.textTracks()};c["default"]={textTracksToJson:e,jsonToTextTracks:f,trackToJson_:d}},{}],72:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(76),j=e(i),k=a(88),l=d(k),m=a(81),n=d(m),o=a(99),p=e(o),q=function(a){function b(){var c,d,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];f(this,b);var h=void 0;if(n.IS_IE8){h=p["default"].createElement("custom");for(var i in j["default"].prototype)"constructor"!==i&&(h[i]=j["default"].prototype[i]);for(var k in b.prototype)"constructor"!==k&&(h[k]=b.prototype[k])}return h=c=g(this,a.call(this,e,h)),d=h,g(c,d)}return h(b,a),b.prototype.addTrack=function(b){a.prototype.addTrack.call(this,b),b.addEventListener("modechange",l.bind(this,function(){this.trigger("change")}))},b}(j["default"]);c["default"]=q},{76:76,81:81,88:88,99:99}],73:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}function i(a,b){if(b&&(a=b(a)),a&&"none"!==a)return a}function j(a,b){return i(a.options[a.options.selectedIndex].value,b)}function k(a,b,c){if(b)for(var d=0;d<a.options.length;d++)if(i(a.options[d].value,c)===b){a.selectedIndex=d;break}}c.__esModule=!0;var l=a(100),m=e(l),n=a(99),o=e(n),p=a(5),q=e(p),r=a(55),s=e(r),t=a(85),u=a(88),v=d(u),w=a(93),x=d(w),y=a(91),z=e(y),A=["#000","Black"],B=["#00F","Blue"],C=["#0FF","Cyan"],D=["#0F0","Green"],E=["#F0F","Magenta"],F=["#F00","Red"],G=["#FFF","White"],H=["#FF0","Yellow"],I=["1","Opaque"],J=["0.5","Semi-Transparent"],K=["0","Transparent"],L={backgroundColor:{selector:".vjs-bg-color > select",id:"captions-background-color-%s",label:"Color",options:[A,G,F,D,B,H,E,C]},backgroundOpacity:{selector:".vjs-bg-opacity > select",id:"captions-background-opacity-%s",label:"Transparency",options:[I,J,K]},color:{selector:".vjs-fg-color > select",id:"captions-foreground-color-%s",label:"Color",options:[G,A,F,D,B,H,E,C]},edgeStyle:{selector:".vjs-edge-style > select",id:"%s",label:"Text Edge Style",options:[["none","None"],["raised","Raised"],["depressed","Depressed"],["uniform","Uniform"],["dropshadow","Dropshadow"]]},fontFamily:{selector:".vjs-font-family > select",id:"captions-font-family-%s",label:"Font Family",options:[["proportionalSansSerif","Proportional Sans-Serif"],["monospaceSansSerif","Monospace Sans-Serif"],["proportionalSerif","Proportional Serif"],["monospaceSerif","Monospace Serif"],["casual","Casual"],["script","Script"],["small-caps","Small Caps"]]},fontPercent:{selector:".vjs-font-percent > select",id:"captions-font-size-%s",label:"Font Size",options:[["0.50","50%"],["0.75","75%"],["1.00","100%"],["1.25","125%"],["1.50","150%"],["1.75","175%"],["2.00","200%"],["3.00","300%"],["4.00","400%"]],"default":2,parser:function(a){return"1.00"===a?null:Number(a)}},textOpacity:{selector:".vjs-text-opacity > select",id:"captions-foreground-opacity-%s",label:"Transparency",options:[I,J]},windowColor:{selector:".vjs-window-color > select",id:"captions-window-color-%s",label:"Color"},windowOpacity:{selector:".vjs-window-opacity > select",id:"captions-window-opacity-%s",label:"Transparency",options:[K,J,I]}};L.windowColor.options=L.backgroundColor.options;var M=function(a){function b(c,d){f(this,b),d.temporary=!1;var e=g(this,a.call(this,c,d));return e.updateDisplay=v.bind(e,e.updateDisplay),e.fill(),e.hasBeenOpened_=e.hasBeenFilled_=!0,e.endDialog=(0,t.createEl)("p",{className:"vjs-control-text",textContent:e.localize("End of dialog window.")}),e.el().appendChild(e.endDialog),e.setDefaults(),void 0===d.persistTextTrackSettings&&(e.options_.persistTextTrackSettings=e.options_.playerOptions.persistTextTrackSettings),e.on(e.$(".vjs-done-button"),"click",function(){e.saveSettings(),e.close()}),e.on(e.$(".vjs-default-button"),"click",function(){e.setDefaults(),e.updateDisplay()}),x.each(L,function(a){e.on(e.$(a.selector),"change",e.updateDisplay)}),e.options_.persistTextTrackSettings&&e.restoreSettings(),e}return h(b,a),b.prototype.createElSelect_=function(a){var b=this,c=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",d=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"label",e=L[a],f=e.id.replace("%s",this.id_);return[(0,t.createEl)(d,{id:f,className:"label"===d?"vjs-label":"",textContent:this.localize(e.label)},{}),(0,t.createEl)("select",{},{"aria-labelledby":c+" "+f},e.options.map(function(a){var d=f+"-"+a[1];return(0,t.createEl)("option",{id:d,textContent:b.localize(a[1]),value:a[0]},{"aria-labelledby":c+" "+f+" "+d})}))]},b.prototype.createElFgColor_=function(){var a=(0,t.createEl)("legend",{id:"captions-text-legend-"+this.id_,textContent:this.localize("Text")}),b=this.createElSelect_("color",a.id),c=(0,t.createEl)("span",{className:"vjs-text-opacity vjs-opacity"},void 0,this.createElSelect_("textOpacity",a.id));return(0,t.createEl)("fieldset",{className:"vjs-fg-color vjs-track-setting"},void 0,[a].concat(b,c))},b.prototype.createElBgColor_=function(){var a=(0,t.createEl)("legend",{id:"captions-background-"+this.id_,textContent:this.localize("Background")}),b=this.createElSelect_("backgroundColor",a.id),c=(0,t.createEl)("span",{className:"vjs-bg-opacity vjs-opacity"},void 0,this.createElSelect_("backgroundOpacity",a.id));return(0,t.createEl)("fieldset",{className:"vjs-bg-color vjs-track-setting"},void 0,[a].concat(b,c))},b.prototype.createElWinColor_=function(){var a=(0,t.createEl)("legend",{id:"captions-window-"+this.id_,textContent:this.localize("Window")}),b=this.createElSelect_("windowColor",a.id),c=(0,t.createEl)("span",{className:"vjs-window-opacity vjs-opacity"},void 0,this.createElSelect_("windowOpacity",a.id));return(0,t.createEl)("fieldset",{className:"vjs-window-color vjs-track-setting"},void 0,[a].concat(b,c))},b.prototype.createElColors_=function(){return(0,t.createEl)("div",{className:"vjs-track-settings-colors"},void 0,[this.createElFgColor_(),this.createElBgColor_(),this.createElWinColor_()])},b.prototype.createElFont_=function(){var a=(0,t.createEl)("fieldset",{className:"vjs-font-percent vjs-track-setting"},void 0,this.createElSelect_("fontPercent","","legend")),b=(0,t.createEl)("fieldset",{className:"vjs-edge-style vjs-track-setting"},void 0,this.createElSelect_("edgeStyle","","legend")),c=(0,t.createEl)("fieldset",{className:"vjs-font-family vjs-track-setting"},void 0,this.createElSelect_("fontFamily","","legend"));return(0,t.createEl)("div",{className:"vjs-track-settings-font"},void 0,[a,b,c])},b.prototype.createElControls_=function(){var a=this.localize("restore all settings to the default values"),b=(0,t.createEl)("button",{className:"vjs-default-button",title:a,innerHTML:this.localize("Reset")+"<span class='vjs-control-text'> "+a+"</span>"}),c=(0,t.createEl)("button",{className:"vjs-done-button",textContent:this.localize("Done")});return(0,t.createEl)("div",{className:"vjs-track-settings-controls"},void 0,[b,c])},b.prototype.createEl=function(){return a.prototype.createEl.call(this)},b.prototype.content=function(){return[this.createElColors_(),this.createElFont_(),this.createElControls_()]},b.prototype.label=function(){return this.localize("Caption Settings Dialog")},b.prototype.description=function(){return this.localize("Beginning of dialog window. Escape will cancel and close the window.")},b.prototype.buildCSSClass=function(){return a.prototype.buildCSSClass.call(this)+" vjs-text-track-settings"},b.prototype.getValues=function(){var a=this;return x.reduce(L,function(b,c,d){var e=j(a.$(c.selector),c.parser);return void 0!==e&&(b[d]=e),b},{})},b.prototype.setValues=function(a){var b=this;x.each(L,function(c,d){k(b.$(c.selector),a[d],c.parser)})},b.prototype.setDefaults=function(){var a=this;x.each(L,function(b){var c=b.hasOwnProperty("default")?b["default"]:0;a.$(b.selector).selectedIndex=c})},b.prototype.restoreSettings=function(){var a=void 0;try{a=JSON.parse(m["default"].localStorage.getItem("vjs-text-track-settings"))}catch(b){z["default"].warn(b)}a&&this.setValues(a)},b.prototype.saveSettings=function(){if(this.options_.persistTextTrackSettings){var a=this.getValues();try{Object.keys(a).length?m["default"].localStorage.setItem("vjs-text-track-settings",JSON.stringify(a)):m["default"].localStorage.removeItem("vjs-text-track-settings")}catch(b){z["default"].warn(b)}}},b.prototype.updateDisplay=function(){var a=this.player_.getChild("textTrackDisplay");a&&a.updateDisplay()},b.prototype.conditionalBlur_=function(){this.previouslyActiveEl_=null,this.off(o["default"],"keydown",this.handleKeyDown);var a=this.player_.controlBar,b=a&&a.subsCapsButton,c=a&&a.captionsButton;b?b.focus():c&&c.focus()},b}(s["default"]);q["default"].registerComponent("TextTrackSettings",M),c["default"]=M},{100:100,5:5,55:55,85:85,88:88,91:91,93:93,99:99}],74:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(69),j=e(i),k=a(88),l=d(k),m=a(75),n=a(91),o=e(n),p=a(100),q=e(p),r=a(78),s=e(r),t=a(97),u=a(104),v=e(u),w=a(92),x=e(w),y=a(81),z=d(y),A=function(a,b){var c=new q["default"].WebVTT.Parser(q["default"],q["default"].vttjs,q["default"].WebVTT.StringDecoder()),d=[];c.oncue=function(a){b.addCue(a)},c.onparsingerror=function(a){d.push(a)},c.onflush=function(){b.trigger({
        type:"loadeddata",target:b})},c.parse(a),d.length>0&&(q["default"].console&&q["default"].console.groupCollapsed&&q["default"].console.groupCollapsed("Text Track parsing errors for "+b.src),d.forEach(function(a){return o["default"].error(a)}),q["default"].console&&q["default"].console.groupEnd&&q["default"].console.groupEnd()),c.flush()},B=function(a,b){var c={uri:a},d=(0,t.isCrossOrigin)(a);d&&(c.cors=d),(0,v["default"])(c,l.bind(this,function(a,c,d){if(a)return o["default"].error(a,c);if(b.loaded_=!0,"function"!=typeof q["default"].WebVTT){if(b.tech_){var e=function(){return A(d,b)};b.tech_.on("vttjsloaded",e),b.tech_.on("vttjserror",function(){o["default"].error("vttjs failed to load, stopping trying to process "+b.src),b.tech_.off("vttjsloaded",e)})}}else A(d,b)}))},C=function(a){function b(){var c,d,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(f(this,b),!e.tech)throw new Error("A tech was not provided.");var h=(0,x["default"])(e,{kind:m.TextTrackKind[e.kind]||"subtitles",language:e.language||e.srclang||""}),i=m.TextTrackMode[h.mode]||"disabled",k=h["default"];"metadata"!==h.kind&&"chapters"!==h.kind||(i="hidden");var n=c=g(this,a.call(this,h));if(n.tech_=h.tech,z.IS_IE8)for(var o in b.prototype)"constructor"!==o&&(n[o]=b.prototype[o]);n.cues_=[],n.activeCues_=[];var p=new j["default"](n.cues_),q=new j["default"](n.activeCues_),r=!1,s=l.bind(n,function(){this.activeCues,r&&(this.trigger("cuechange"),r=!1)});return"disabled"!==i&&n.tech_.ready(function(){n.tech_.on("timeupdate",s)},!0),Object.defineProperty(n,"default",{get:function(){return k},set:function(){}}),Object.defineProperty(n,"mode",{get:function(){return i},set:function(a){var b=this;m.TextTrackMode[a]&&(i=a,"showing"===i&&this.tech_.ready(function(){b.tech_.on("timeupdate",s)},!0),this.trigger("modechange"))}}),Object.defineProperty(n,"cues",{get:function(){return this.loaded_?p:null},set:function(){}}),Object.defineProperty(n,"activeCues",{get:function(){if(!this.loaded_)return null;if(0===this.cues.length)return q;for(var a=this.tech_.currentTime(),b=[],c=0,d=this.cues.length;c<d;c++){var e=this.cues[c];e.startTime<=a&&e.endTime>=a?b.push(e):e.startTime===e.endTime&&e.startTime<=a&&e.startTime+.5>=a&&b.push(e)}if(r=!1,b.length!==this.activeCues_.length)r=!0;else for(var f=0;f<b.length;f++)this.activeCues_.indexOf(b[f])===-1&&(r=!0);return this.activeCues_=b,q.setCues_(this.activeCues_),q},set:function(){}}),h.src?(n.src=h.src,B(h.src,n)):n.loaded_=!0,d=n,g(c,d)}return h(b,a),b.prototype.addCue=function(a){var b=a;if(q["default"].vttjs&&!(a instanceof q["default"].vttjs.VTTCue)){b=new q["default"].vttjs.VTTCue(a.startTime,a.endTime,a.text);for(var c in a)c in b||(b[c]=a[c]);b.id=a.id,b.originalCue_=a}for(var d=this.tech_.textTracks(),e=0;e<d.length;e++)d[e]!==this&&d[e].removeCue(b);this.cues_.push(b),this.cues.setCues_(this.cues_)},b.prototype.removeCue=function(a){for(var b=this.cues_.length;b--;){var c=this.cues_[b];if(c===a||c.originalCue_&&c.originalCue_===a){this.cues_.splice(b,1),this.cues.setCues_(this.cues_);break}}},b}(s["default"]);C.prototype.allowedEvents_={cuechange:"cuechange"},c["default"]=C},{100:100,104:104,69:69,75:75,78:78,81:81,88:88,91:91,92:92,97:97}],75:[function(a,b,c){"use strict";c.__esModule=!0;c.VideoTrackKind={alternative:"alternative",captions:"captions",main:"main",sign:"sign",subtitles:"subtitles",commentary:"commentary"},c.AudioTrackKind={alternative:"alternative",descriptions:"descriptions",main:"main","main-desc":"main-desc",translation:"translation",commentary:"commentary"},c.TextTrackKind={subtitles:"subtitles",captions:"captions",descriptions:"descriptions",chapters:"chapters",metadata:"metadata"},c.TextTrackMode={disabled:"disabled",hidden:"hidden",showing:"showing"}},{}],76:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(45),j=e(i),k=a(81),l=d(k),m=a(99),n=e(m),o=function(a){function b(){var c,d=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;f(this,b);var h=g(this,a.call(this));if(!e&&(e=h,l.IS_IE8)){e=n["default"].createElement("custom");for(var i in b.prototype)"constructor"!==i&&(e[i]=b.prototype[i])}e.tracks_=[],Object.defineProperty(e,"length",{get:function(){return this.tracks_.length}});for(var j=0;j<d.length;j++)e.addTrack(d[j]);return c=e,g(h,c)}return h(b,a),b.prototype.addTrack=function(a){var b=this.tracks_.length;""+b in this||Object.defineProperty(this,b,{get:function(){return this.tracks_[b]}}),this.tracks_.indexOf(a)===-1&&(this.tracks_.push(a),this.trigger({track:a,type:"addtrack"}))},b.prototype.removeTrack=function(a){for(var b=void 0,c=0,d=this.length;c<d;c++)if(this[c]===a){b=this[c],b.off&&b.off(),this.tracks_.splice(c,1);break}b&&this.trigger({track:b,type:"removetrack"})},b.prototype.getTrackById=function(a){for(var b=null,c=0,d=this.length;c<d;c++){var e=this[c];if(e.id===a){b=e;break}}return b},b}(j["default"]);o.prototype.allowedEvents_={change:"change",addtrack:"addtrack",removetrack:"removetrack"};for(var p in o.prototype.allowedEvents_)o.prototype["on"+p]=null;c["default"]=o},{45:45,81:81,99:99}],77:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}c.__esModule=!0,c.ALL=c.REMOTE=c.NORMAL=void 0;var e=a(65),f=d(e),g=a(79),h=d(g),i=a(72),j=d(i),k=a(67),l=d(k),m=a(74),n=d(m),o=a(66),p=d(o),q=a(80),r=d(q),s=a(68),t=d(s),u=a(92),v=d(u),w={audio:{ListClass:f["default"],TrackClass:p["default"],capitalName:"Audio"},video:{ListClass:h["default"],TrackClass:r["default"],capitalName:"Video"},text:{ListClass:j["default"],TrackClass:n["default"],capitalName:"Text"}};Object.keys(w).forEach(function(a){w[a].getterName=a+"Tracks",w[a].privateName=a+"Tracks_"});var x={remoteText:{ListClass:j["default"],TrackClass:n["default"],capitalName:"RemoteText",getterName:"remoteTextTracks",privateName:"remoteTextTracks_"},remoteTextEl:{ListClass:l["default"],TrackClass:t["default"],capitalName:"RemoteTextTrackEls",getterName:"remoteTextTrackEls",privateName:"remoteTextTrackEls_"}},y=(0,v["default"])(w,x);x.names=Object.keys(x),w.names=Object.keys(w),y.names=[].concat(x.names).concat(w.names),c.NORMAL=w,c.REMOTE=x,c.ALL=y},{65:65,66:66,67:67,68:68,72:72,74:74,79:79,80:80,92:92}],78:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(81),j=e(i),k=a(99),l=d(k),m=a(90),n=e(m),o=a(45),p=d(o),q=function(a){function b(){var c,d=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};f(this,b);var e=g(this,a.call(this)),h=e;if(j.IS_IE8){h=l["default"].createElement("custom");for(var i in b.prototype)"constructor"!==i&&(h[i]=b.prototype[i])}var k={id:d.id||"vjs_track_"+n.newGUID(),kind:d.kind||"",label:d.label||"",language:d.language||""},m=function(a){Object.defineProperty(h,a,{get:function(){return k[a]},set:function(){}})};for(var o in k)m(o);return c=h,g(e,c)}return h(b,a),b}(p["default"]);c["default"]=q},{45:45,81:81,90:90,99:99}],79:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(76),j=e(i),k=a(81),l=d(k),m=a(99),n=e(m),o=function(a,b){for(var c=0;c<a.length;c++)b.id!==a[c].id&&(a[c].selected=!1)},p=function(a){function b(){var c,d,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];f(this,b);for(var h=void 0,i=e.length-1;i>=0;i--)if(e[i].selected){o(e,e[i]);break}if(l.IS_IE8){h=n["default"].createElement("custom");for(var k in j["default"].prototype)"constructor"!==k&&(h[k]=j["default"].prototype[k]);for(var m in b.prototype)"constructor"!==m&&(h[m]=b.prototype[m])}return h=c=g(this,a.call(this,e,h)),h.changing_=!1,Object.defineProperty(h,"selectedIndex",{get:function(){for(var a=0;a<this.length;a++)if(this[a].selected)return a;return-1},set:function(){}}),d=h,g(c,d)}return h(b,a),b.prototype.addTrack=function(b){var c=this;b.selected&&o(this,b),a.prototype.addTrack.call(this,b),b.addEventListener&&b.addEventListener("selectedchange",function(){c.changing_||(c.changing_=!0,o(c,b),c.changing_=!1,c.trigger("change"))})},b}(j["default"]);c["default"]=p},{76:76,81:81,99:99}],80:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function g(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b}function h(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}c.__esModule=!0;var i=a(75),j=a(78),k=e(j),l=a(92),m=e(l),n=a(81),o=d(n),p=function(a){function b(){var c,d,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};f(this,b);var h=(0,m["default"])(e,{kind:i.VideoTrackKind[e.kind]||""}),j=c=g(this,a.call(this,h)),k=!1;if(o.IS_IE8)for(var l in b.prototype)"constructor"!==l&&(j[l]=b.prototype[l]);return Object.defineProperty(j,"selected",{get:function(){return k},set:function(a){"boolean"==typeof a&&a!==k&&(k=a,this.trigger("selectedchange"))}}),h.selected&&(j.selected=h.selected),d=j,g(c,d)}return h(b,a),b}(k["default"]);c["default"]=p},{75:75,78:78,81:81,92:92}],81:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}c.__esModule=!0,c.BACKGROUND_SIZE_SUPPORTED=c.TOUCH_ENABLED=c.IS_ANY_SAFARI=c.IS_SAFARI=c.IE_VERSION=c.IS_IE8=c.IS_CHROME=c.IS_EDGE=c.IS_FIREFOX=c.IS_NATIVE_ANDROID=c.IS_OLD_ANDROID=c.ANDROID_VERSION=c.IS_ANDROID=c.IOS_VERSION=c.IS_IOS=c.IS_IPOD=c.IS_IPHONE=c.IS_IPAD=void 0;var f=a(85),g=e(f),h=a(100),i=d(h),j=i["default"].navigator&&i["default"].navigator.userAgent||"",k=/AppleWebKit\/([\d.]+)/i.exec(j),l=k?parseFloat(k.pop()):null,m=c.IS_IPAD=/iPad/i.test(j),n=c.IS_IPHONE=/iPhone/i.test(j)&&!m,o=c.IS_IPOD=/iPod/i.test(j),p=c.IS_IOS=n||m||o,q=(c.IOS_VERSION=function(){var a=j.match(/OS (\d+)_/i);return a&&a[1]?a[1]:null}(),c.IS_ANDROID=/Android/i.test(j)),r=c.ANDROID_VERSION=function(){var a=j.match(/Android (\d+)(?:\.(\d+))?(?:\.(\d+))*/i);if(!a)return null;var b=a[1]&&parseFloat(a[1]),c=a[2]&&parseFloat(a[2]);return b&&c?parseFloat(a[1]+"."+a[2]):b?b:null}(),s=(c.IS_OLD_ANDROID=q&&/webkit/i.test(j)&&r<2.3,c.IS_NATIVE_ANDROID=q&&r<5&&l<537,c.IS_FIREFOX=/Firefox/i.test(j),c.IS_EDGE=/Edge/i.test(j)),t=c.IS_CHROME=!s&&/Chrome/i.test(j),u=(c.IS_IE8=/MSIE\s8\.0/.test(j),c.IE_VERSION=function(a){return a&&parseFloat(a[1])}(/MSIE\s(\d+)\.\d/.exec(j)),c.IS_SAFARI=/Safari/i.test(j)&&!t&&!q&&!s);c.IS_ANY_SAFARI=u||p,c.TOUCH_ENABLED=g.isReal()&&("ontouchstart"in i["default"]||i["default"].DocumentTouch&&i["default"].document instanceof i["default"].DocumentTouch),c.BACKGROUND_SIZE_SUPPORTED=g.isReal()&&"backgroundSize"in i["default"].document.createElement("video").style},{100:100,85:85}],82:[function(a,b,c){"use strict";function d(a,b){var c=0,d=void 0,f=void 0;if(!b)return 0;a&&a.length||(a=(0,e.createTimeRange)(0,0));for(var g=0;g<a.length;g++)d=a.start(g),f=a.end(g),f>b&&(f=b),c+=f-d;return c/b}c.__esModule=!0,c.bufferedPercent=d;var e=a(95)},{95:95}],83:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){if(!a||!b)return"";if("function"==typeof g["default"].getComputedStyle){var c=g["default"].getComputedStyle(a);return c?c[b]:""}return a.currentStyle[b]||""}c.__esModule=!0,c["default"]=e;var f=a(100),g=d(f)},{100:100}],84:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){var b=a[k];return b||(b=a[k]=i.newGUID()),j[b]||(j[b]={}),j[b]}function f(a){var b=a[k];return!!b&&!!Object.getOwnPropertyNames(j[b]).length}function g(a){var b=a[k];if(b){delete j[b];try{delete a[k]}catch(c){a.removeAttribute?a.removeAttribute(k):a[k]=null}}}c.__esModule=!0,c.getData=e,c.hasData=f,c.removeData=g;var h=a(90),i=d(h),j={},k="vdata"+(new Date).getTime()},{90:90}],85:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){return a.raw=b,a}function f(a){return"string"==typeof a&&/\S/.test(a)}function g(a){if(/\s/.test(a))throw new Error("class has illegal whitespace characters")}function h(a){return new RegExp("(^|\\s)"+a+"($|\\s)")}function i(){return J["default"]===L["default"].document&&"undefined"!=typeof J["default"].createElement}function j(a){return(0,Q.isObject)(a)&&1===a.nodeType}function k(a){return function(b,c){if(!f(b))return J["default"][a](null);f(c)&&(c=J["default"].querySelector(c));var d=j(c)?c:J["default"];return d[a]&&d[a](b)}}function l(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"div",b=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},c=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},d=arguments[3],e=J["default"].createElement(a);return Object.getOwnPropertyNames(b).forEach(function(a){var c=b[a];a.indexOf("aria-")!==-1||"role"===a||"type"===a?(N["default"].warn((0,P["default"])(H,a,c)),e.setAttribute(a,c)):"textContent"===a?m(e,c):e[a]=c}),Object.getOwnPropertyNames(c).forEach(function(a){e.setAttribute(a,c[a])}),d&&F(e,d),e}function m(a,b){return"undefined"==typeof a.textContent?a.innerText=b:a.textContent=b,a}function n(a,b){b.firstChild?b.insertBefore(a,b.firstChild):b.appendChild(a)}function o(a,b){return g(b),a.classList?a.classList.contains(b):h(b).test(a.className)}function p(a,b){return a.classList?a.classList.add(b):o(a,b)||(a.className=(a.className+" "+b).trim()),a}function q(a,b){return a.classList?a.classList.remove(b):(g(b),a.className=a.className.split(/\s+/).filter(function(a){return a!==b}).join(" ")),a}function r(a,b,c){var d=o(a,b);if("function"==typeof c&&(c=c(a,b)),"boolean"!=typeof c&&(c=!d),c!==d)return c?p(a,b):q(a,b),a}function s(a,b){Object.getOwnPropertyNames(b).forEach(function(c){var d=b[c];null===d||void 0===d||d===!1?a.removeAttribute(c):a.setAttribute(c,d===!0?"":d)})}function t(a){var b={};if(a&&a.attributes&&a.attributes.length>0)for(var c=a.attributes,d=c.length-1;d>=0;d--){var e=c[d].name,f=c[d].value;"boolean"!=typeof a[e]&&",autoplay,controls,loop,muted,default,".indexOf(","+e+",")===-1||(f=null!==f),b[e]=f}return b}function u(a,b){return a.getAttribute(b)}function v(a,b,c){a.setAttribute(b,c)}function w(a,b){a.removeAttribute(b)}function x(){J["default"].body.focus(),J["default"].onselectstart=function(){return!1}}function y(){J["default"].onselectstart=function(){return!0}}function z(a){if(a&&a.getBoundingClientRect&&a.parentNode){var b=a.getBoundingClientRect(),c={};return["bottom","height","left","right","top","width"].forEach(function(a){void 0!==b[a]&&(c[a]=b[a])}),c.height||(c.height=parseFloat((0,S["default"])(a,"height"))),c.width||(c.width=parseFloat((0,S["default"])(a,"width"))),c}}function A(a){var b=void 0;if(a.getBoundingClientRect&&a.parentNode&&(b=a.getBoundingClientRect()),!b)return{left:0,top:0};var c=J["default"].documentElement,d=J["default"].body,e=c.clientLeft||d.clientLeft||0,f=L["default"].pageXOffset||d.scrollLeft,g=b.left+f-e,h=c.clientTop||d.clientTop||0,i=L["default"].pageYOffset||d.scrollTop,j=b.top+i-h;return{left:Math.round(g),top:Math.round(j)}}function B(a,b){var c={},d=A(a),e=a.offsetWidth,f=a.offsetHeight,g=d.top,h=d.left,i=b.pageY,j=b.pageX;return b.changedTouches&&(j=b.changedTouches[0].pageX,i=b.changedTouches[0].pageY),c.y=Math.max(0,Math.min(1,(g-i+f)/f)),c.x=Math.max(0,Math.min(1,(j-h)/e)),c}function C(a){return(0,Q.isObject)(a)&&3===a.nodeType}function D(a){for(;a.firstChild;)a.removeChild(a.firstChild);return a}function E(a){return"function"==typeof a&&(a=a()),(Array.isArray(a)?a:[a]).map(function(a){return"function"==typeof a&&(a=a()),j(a)||C(a)?a:"string"==typeof a&&/\S/.test(a)?J["default"].createTextNode(a):void 0}).filter(function(a){return a})}function F(a,b){return E(b).forEach(function(b){return a.appendChild(b)}),a}function G(a,b){return F(D(a),b)}c.__esModule=!0,c.$$=c.$=void 0;var H=e(["Setting attributes in the second argument of createEl()\n                has been deprecated. Use the third argument instead.\n                createEl(type, properties, attributes). Attempting to set "," to ","."],["Setting attributes in the second argument of createEl()\n                has been deprecated. Use the third argument instead.\n                createEl(type, properties, attributes). Attempting to set "," to ","."]);c.isReal=i,c.isEl=j,c.createEl=l,c.textContent=m,c.prependTo=n,c.hasClass=o,c.addClass=p,c.removeClass=q,c.toggleClass=r,c.setAttributes=s,c.getAttributes=t,c.getAttribute=u,c.setAttribute=v,c.removeAttribute=w,c.blockTextSelection=x,c.unblockTextSelection=y,c.getBoundingClientRect=z,c.findPosition=A,c.getPointerPosition=B,c.isTextNode=C,c.emptyEl=D,c.normalizeContent=E,c.appendContent=F,c.insertContent=G;var I=a(99),J=d(I),K=a(100),L=d(K),M=a(91),N=d(M),O=a(103),P=d(O),Q=a(93),R=a(83),S=d(R);c.$=k("querySelector"),c.$$=k("querySelectorAll")},{100:100,103:103,83:83,91:91,93:93,99:99}],86:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function f(a,b){var c=n.getData(a);0===c.handlers[b].length&&(delete c.handlers[b],a.removeEventListener?a.removeEventListener(b,c.dispatcher,!1):a.detachEvent&&a.detachEvent("on"+b,c.dispatcher)),Object.getOwnPropertyNames(c.handlers).length<=0&&(delete c.handlers,delete c.dispatcher,delete c.disabled),0===Object.getOwnPropertyNames(c).length&&n.removeData(a)}function g(a,b,c,d){c.forEach(function(c){a(b,c,d)})}function h(a){function b(){return!0}function c(){return!1}if(!a||!a.isPropagationStopped){var d=a||t["default"].event;a={};for(var e in d)"layerX"!==e&&"layerY"!==e&&"keyLocation"!==e&&"webkitMovementX"!==e&&"webkitMovementY"!==e&&("returnValue"===e&&d.preventDefault||(a[e]=d[e]));if(a.target||(a.target=a.srcElement||v["default"]),a.relatedTarget||(a.relatedTarget=a.fromElement===a.target?a.toElement:a.fromElement),a.preventDefault=function(){d.preventDefault&&d.preventDefault(),a.returnValue=!1,d.returnValue=!1,a.defaultPrevented=!0},a.defaultPrevented=!1,a.stopPropagation=function(){d.stopPropagation&&d.stopPropagation(),a.cancelBubble=!0,d.cancelBubble=!0,a.isPropagationStopped=b},a.isPropagationStopped=c,a.stopImmediatePropagation=function(){d.stopImmediatePropagation&&d.stopImmediatePropagation(),a.isImmediatePropagationStopped=b,a.stopPropagation()},a.isImmediatePropagationStopped=c,null!==a.clientX&&void 0!==a.clientX){var f=v["default"].documentElement,g=v["default"].body;a.pageX=a.clientX+(f&&f.scrollLeft||g&&g.scrollLeft||0)-(f&&f.clientLeft||g&&g.clientLeft||0),a.pageY=a.clientY+(f&&f.scrollTop||g&&g.scrollTop||0)-(f&&f.clientTop||g&&g.clientTop||0)}a.which=a.charCode||a.keyCode,null!==a.button&&void 0!==a.button&&(a.button=1&a.button?0:4&a.button?1:2&a.button?2:0)}return a}function i(a,b,c){if(Array.isArray(b))return g(i,a,b,c);var d=n.getData(a);d.handlers||(d.handlers={}),d.handlers[b]||(d.handlers[b]=[]),c.guid||(c.guid=p.newGUID()),d.handlers[b].push(c),d.dispatcher||(d.disabled=!1,d.dispatcher=function(b,c){if(!d.disabled){b=h(b);var e=d.handlers[b.type];if(e)for(var f=e.slice(0),g=0,i=f.length;g<i&&!b.isImmediatePropagationStopped();g++)try{f[g].call(a,b,c)}catch(j){r["default"].error(j)}}}),1===d.handlers[b].length&&(a.addEventListener?a.addEventListener(b,d.dispatcher,!1):a.attachEvent&&a.attachEvent("on"+b,d.dispatcher))}function j(a,b,c){if(n.hasData(a)){var d=n.getData(a);if(d.handlers){if(Array.isArray(b))return g(j,a,b,c);var e=function(b){d.handlers[b]=[],f(a,b)};if(b){var h=d.handlers[b];if(h){if(!c)return void e(b);if(c.guid)for(var i=0;i<h.length;i++)h[i].guid===c.guid&&h.splice(i--,1);f(a,b)}}else for(var k in d.handlers)e(k)}}}function k(a,b,c){var d=n.hasData(a)?n.getData(a):{},e=a.parentNode||a.ownerDocument;if("string"==typeof b&&(b={type:b,target:a}),b=h(b),d.dispatcher&&d.dispatcher.call(a,b,c),e&&!b.isPropagationStopped()&&b.bubbles===!0)k.call(null,e,b,c);else if(!e&&!b.defaultPrevented){var f=n.getData(b.target);b.target[b.type]&&(f.disabled=!0,"function"==typeof b.target[b.type]&&b.target[b.type](),f.disabled=!1)}return!b.defaultPrevented}function l(a,b,c){if(Array.isArray(b))return g(l,a,b,c);var d=function e(){j(a,b,e),c.apply(this,arguments)};d.guid=c.guid=c.guid||p.newGUID(),i(a,b,d)}c.__esModule=!0,c.fixEvent=h,c.on=i,c.off=j,c.trigger=k,c.one=l;var m=a(84),n=e(m),o=a(90),p=e(o),q=a(91),r=d(q),s=a(100),t=d(s),u=a(99),v=d(u)},{100:100,84:84,90:90,91:91,99:99}],87:[function(a,b,c){"use strict";c.__esModule=!0;var d=a(93),e=function f(a){if(Array.isArray(a)){var b=[];a.forEach(function(a){a=f(a),Array.isArray(a)?b=b.concat(a):(0,d.isObject)(a)&&b.push(a)}),a=b}else a="string"==typeof a&&a.trim()?[{src:a}]:(0,d.isObject)(a)&&"string"==typeof a.src&&a.src&&a.src.trim()?[a]:[];return a};c["default"]=e},{93:93}],88:[function(a,b,c){"use strict";c.__esModule=!0,c.throttle=c.bind=void 0;var d=a(90);c.bind=function(a,b,c){b.guid||(b.guid=(0,d.newGUID)());var e=function(){return b.apply(a,arguments)};return e.guid=c?c+"_"+b.guid:b.guid,e},c.throttle=function(a,b){var c=Date.now();return function(){var d=Date.now();d-c>=b&&(a.apply(void 0,arguments),c=d)}}},{90:90}],89:[function(a,b,c){"use strict";function d(a){var b=arguments.length>1&&void 0!==arguments[1]?arguments[1]:a;a=a<0?0:a;var c=Math.floor(a%60),d=Math.floor(a/60%60),e=Math.floor(a/3600),f=Math.floor(b/60%60),g=Math.floor(b/3600);return(isNaN(a)||a===1/0)&&(e=d=c="-"),e=e>0||g>0?e+":":"",d=((e||f>=10)&&d<10?"0"+d:d)+":",c=c<10?"0"+c:c,e+d+c}c.__esModule=!0,c["default"]=d},{}],90:[function(a,b,c){"use strict";function d(){return e++}c.__esModule=!0,c.newGUID=d;var e=1},{}],91:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}c.__esModule=!0,c.logByType=void 0;var e=a(100),f=d(e),g=a(81),h=a(93),i=void 0,j="all",k=[],l=c.logByType=function(a,b){var c=arguments.length>2&&void 0!==arguments[2]?arguments[2]:!!g.IE_VERSION&&g.IE_VERSION<11,d=i.levels[j],e=new RegExp("^("+d+")$");"log"!==a&&b.unshift(a.toUpperCase()+":"),k&&k.push([].concat(b)),b.unshift("VIDEOJS:");var l=f["default"].console&&f["default"].console[a];l&&d&&e.test(a)&&(c&&(b=b.map(function(a){if((0,h.isObject)(a)||Array.isArray(a))try{return JSON.stringify(a)}catch(b){return String(a)}return String(a)}).join(" ")),l.apply?l[Array.isArray(b)?"apply":"call"](f["default"].console,b):l(b))};i=function(){for(var a=arguments.length,b=Array(a),c=0;c<a;c++)b[c]=arguments[c];l("log",b)},i.levels={all:"log|warn|error",error:"error",off:"",warn:"warn|error",DEFAULT:j},i.level=function(a){if("string"==typeof a){if(!i.levels.hasOwnProperty(a))throw new Error('"'+a+'" in not a valid log level');j=a}return j},i.history=function(){return k?[].concat(k):[]},i.history.clear=function(){k&&(k.length=0)},i.history.disable=function(){null!==k&&(k.length=0,k=null)},i.history.enable=function(){null===k&&(k=[])},i.error=function(){for(var a=arguments.length,b=Array(a),c=0;c<a;c++)b[c]=arguments[c];return l("error",b)},i.warn=function(){for(var a=arguments.length,b=Array(a),c=0;c<a;c++)b[c]=arguments[c];return l("warn",b)},c["default"]=i},{100:100,81:81,93:93}],92:[function(a,b,c){"use strict";function d(){for(var a={},b=arguments.length,c=Array(b),f=0;f<b;f++)c[f]=arguments[f];return c.forEach(function(b){b&&(0,e.each)(b,function(b,c){if(!(0,e.isPlain)(b))return void(a[c]=b);(0,e.isPlain)(a[c])||(a[c]={}),a[c]=d(a[c],b)})}),a}c.__esModule=!0,c["default"]=d;var e=a(93)},{93:93}],93:[function(a,b,c){"use strict";function d(a,b){k(a).forEach(function(c){return b(a[c],c)})}function e(a,b){var c=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;return k(a).reduce(function(c,d){return b(c,a[d],d)},c)}function f(a){for(var b=arguments.length,c=Array(b>1?b-1:0),e=1;e<b;e++)c[e-1]=arguments[e];return Object.assign?Object.assign.apply(Object,[a].concat(c)):(c.forEach(function(b){b&&d(b,function(b,c){a[c]=b})}),a)}function g(a){return!!a&&"object"===(void 0===a?"undefined":i(a))}function h(a){return g(a)&&"[object Object]"===j.call(a)&&a.constructor===Object}c.__esModule=!0;var i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a};c.each=d,c.reduce=e,c.assign=f,c.isObject=g,c.isPlain=h;var j=Object.prototype.toString,k=function(a){return g(a)?Object.keys(a):[]}},{}],94:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}c.__esModule=!0,c.setTextContent=c.createStyleElement=void 0;var e=a(99),f=d(e);c.createStyleElement=function(a){var b=f["default"].createElement("style");return b.className=a,b},c.setTextContent=function(a,b){a.styleSheet?a.styleSheet.cssText=b:a.textContent=b}},{99:99}],95:[function(a,b,c){"use strict";function d(a,b,c){if("number"!=typeof b||b<0||b>c)throw new Error("Failed to execute '"+a+"' on 'TimeRanges': The index provided ("+b+") is non-numeric or out of bounds (0-"+c+").")}function e(a,b,c,e){return d(a,e,c.length-1),c[e][b]}function f(a){return void 0===a||0===a.length?{length:0,start:function(){throw new Error("This TimeRanges object is empty")},end:function(){throw new Error("This TimeRanges object is empty")}}:{length:a.length,start:e.bind(null,"start",0,a),end:e.bind(null,"end",1,a)}}function g(a,b){return Array.isArray(a)?f(a):void 0===a||void 0===b?f():f([[a,b]])}c.__esModule=!0,c.createTimeRanges=g,c.createTimeRange=g},{}],96:[function(a,b,c){"use strict";function d(a){return"string"!=typeof a?a:a.charAt(0).toUpperCase()+a.slice(1)}c.__esModule=!0,c["default"]=d},{}],97:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}c.__esModule=!0,c.isCrossOrigin=c.getFileExtension=c.getAbsoluteURL=c.parseUrl=void 0;var e=a(99),f=d(e),g=a(100),h=d(g),i=c.parseUrl=function(a){var b=["protocol","hostname","port","pathname","search","hash","host"],c=f["default"].createElement("a");c.href=a;var d=""===c.host&&"file:"!==c.protocol,e=void 0;d&&(e=f["default"].createElement("div"),e.innerHTML='<a href="'+a+'"></a>',c=e.firstChild,e.setAttribute("style","display:none; position:absolute;"),f["default"].body.appendChild(e));for(var g={},h=0;h<b.length;h++)g[b[h]]=c[b[h]];return"http:"===g.protocol&&(g.host=g.host.replace(/:80$/,"")),"https:"===g.protocol&&(g.host=g.host.replace(/:443$/,"")),d&&f["default"].body.removeChild(e),g};c.getAbsoluteURL=function(a){if(!a.match(/^https?:\/\//)){var b=f["default"].createElement("div");b.innerHTML='<a href="'+a+'">x</a>',a=b.firstChild.href}return a},c.getFileExtension=function(a){if("string"==typeof a){var b=/^(\/?)([\s\S]*?)((?:\.{1,2}|[^\/]+?)(\.([^\.\/\?]+)))(?:[\/]*|[\?].*)$/i,c=b.exec(a);if(c)return c.pop().toLowerCase()}return""},c.isCrossOrigin=function(a){var b=h["default"].location,c=i(a);return(":"===c.protocol?b.protocol:c.protocol)+c.host!==b.protocol+b.host}},{100:100,99:99}],98:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a,b,c){var d=void 0;if("string"==typeof a){var e=f.getPlayers();if(0===a.indexOf("#")&&(a=a.slice(1)),e[a])return b&&M["default"].warn('Player "'+a+'" is already initialised. Options will not be applied.'),c&&e[a].ready(c),e[a];d=O.$("#"+a)}else d=a;if(!d||!d.nodeName)throw new TypeError("The element or ID supplied is not valid. (videojs)");if(d.player||v["default"].players[d.playerId])return d.player||v["default"].players[d.playerId];b=b||{},f.hooks("beforesetup").forEach(function(a){var c=a(d,(0,z["default"])(b));if(!(0,T.isObject)(c)||Array.isArray(c))return void M["default"].error("please return an object in beforesetup hooks");b=(0,z["default"])(b,c)});var g=p["default"].getComponent("Player"),h=new g(d,b,c);return f.hooks("setup").forEach(function(a){return a(h)}),h}var g=a(100),h=e(g),i=a(99),j=e(i),k=a(59),l=d(k),m=a(94),n=d(m),o=a(5),p=e(o),q=a(45),r=e(q),s=a(86),t=d(s),u=a(56),v=e(u),w=a(57),x=e(w),y=a(92),z=e(y),A=a(88),B=d(A),C=a(74),D=e(C),E=a(66),F=e(E),G=a(80),H=e(G),I=a(95),J=a(89),K=e(J),L=a(91),M=e(L),N=a(85),O=d(N),P=a(81),Q=d(P),R=a(97),S=d(R),T=a(93),U=a(83),V=e(U),W=a(46),X=e(W),Y=a(104),Z=e(Y),$=a(64),_=e($),aa=a(63);if("undefined"==typeof HTMLVideoElement&&O.isReal()&&(j["default"].createElement("video"),j["default"].createElement("audio"),j["default"].createElement("track")),f.hooks_={},f.hooks=function(a,b){return f.hooks_[a]=f.hooks_[a]||[],b&&(f.hooks_[a]=f.hooks_[a].concat(b)),f.hooks_[a]},f.hook=function(a,b){f.hooks(a,b)},f.removeHook=function(a,b){var c=f.hooks(a).indexOf(b);return!(c<=-1)&&(f.hooks_[a]=f.hooks_[a].slice(),f.hooks_[a].splice(c,1),!0)},h["default"].VIDEOJS_NO_DYNAMIC_STYLE!==!0&&O.isReal()){var ba=O.$(".vjs-styles-defaults");if(!ba){ba=n.createStyleElement("vjs-styles-defaults");var ca=O.$("head");ca&&ca.insertBefore(ba,ca.firstChild),n.setTextContent(ba,"\n      .video-js {\n        width: 300px;\n        height: 150px;\n      }\n\n      .vjs-fluid {\n        padding-top: 56.25%\n      }\n    ")}}l.autoSetupTimeout(1,f),
        f.VERSION="6.0.0",f.options=v["default"].prototype.options_,f.getPlayers=function(){return v["default"].players},f.players=v["default"].players,f.getComponent=p["default"].getComponent,f.registerComponent=function(a,b){_["default"].isTech(b)&&M["default"].warn("The "+a+" tech was registered as a component. It should instead be registered using videojs.registerTech(name, tech)"),p["default"].registerComponent.call(p["default"],a,b)},f.getTech=_["default"].getTech,f.registerTech=_["default"].registerTech,f.use=aa.use,f.browser=Q,f.TOUCH_ENABLED=Q.TOUCH_ENABLED,f.extend=X["default"],f.mergeOptions=z["default"],f.bind=B.bind,f.registerPlugin=x["default"].registerPlugin,f.plugin=function(a,b){return M["default"].warn("videojs.plugin() is deprecated; use videojs.registerPlugin() instead"),x["default"].registerPlugin(a,b)},f.getPlugins=x["default"].getPlugins,f.getPlugin=x["default"].getPlugin,f.getPluginVersion=x["default"].getPluginVersion,f.addLanguage=function(a,b){var c;return a=(""+a).toLowerCase(),f.options.languages=(0,z["default"])(f.options.languages,(c={},c[a]=b,c)),f.options.languages[a]},f.log=M["default"],f.createTimeRange=f.createTimeRanges=I.createTimeRanges,f.formatTime=K["default"],f.parseUrl=S.parseUrl,f.isCrossOrigin=S.isCrossOrigin,f.EventTarget=r["default"],f.on=t.on,f.one=t.one,f.off=t.off,f.trigger=t.trigger,f.xhr=Z["default"],f.TextTrack=D["default"],f.AudioTrack=F["default"],f.VideoTrack=H["default"],["isEl","isTextNode","createEl","hasClass","addClass","removeClass","toggleClass","setAttributes","getAttributes","emptyEl","appendContent","insertContent"].forEach(function(a){f[a]=function(){return M["default"].warn("videojs."+a+"() is deprecated; use videojs.dom."+a+"() instead"),O[a].apply(null,arguments)}}),f.computedStyle=V["default"],f.dom=O,f.url=S,b.exports=f},{100:100,104:104,45:45,46:46,5:5,56:56,57:57,59:59,63:63,64:64,66:66,74:74,80:80,81:81,83:83,85:85,86:86,88:88,89:89,91:91,92:92,93:93,94:94,95:95,97:97,99:99}],99:[function(a,b,c){(function(c){var d=void 0!==c?c:"undefined"!=typeof window?window:{},e=a(101);if("undefined"!=typeof document)b.exports=document;else{var f=d["__GLOBAL_DOCUMENT_CACHE@4"];f||(f=d["__GLOBAL_DOCUMENT_CACHE@4"]=e),b.exports=f}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{101:101}],100:[function(a,b,c){(function(a){"undefined"!=typeof window?b.exports=window:void 0!==a?b.exports=a:"undefined"!=typeof self?b.exports=self:b.exports={}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],101:[function(a,b,c){},{}],102:[function(a,b,c){function d(a,b){var c,d=null;try{c=JSON.parse(a,b)}catch(e){d=e}return[d,c]}b.exports=d},{}],103:[function(a,b,c){function d(a){return a.replace(/\n\r?\s*/g,"")}b.exports=function(a){for(var b="",c=0;c<arguments.length;c++)b+=d(a[c])+(arguments[c+1]||"");return b}},{}],104:[function(a,b,c){"use strict";function d(a,b){for(var c=0;c<a.length;c++)b(a[c])}function e(a){for(var b in a)if(a.hasOwnProperty(b))return!1;return!0}function f(a,b,c){var d=a;return l(b)?(c=b,"string"==typeof a&&(d={uri:a})):d=n(b,{uri:a}),d.callback=c,d}function g(a,b,c){return b=f(a,b,c),h(b)}function h(a){function b(){4===k.readyState&&setTimeout(f,0)}function c(){var a=void 0;if(a=k.response?k.response:k.responseText||i(k),u)try{a=JSON.parse(a)}catch(b){}return a}function d(a){return clearTimeout(o),a instanceof Error||(a=new Error(""+(a||"Unknown XMLHttpRequest Error"))),a.statusCode=0,j(a,v)}function f(){if(!n){var b;clearTimeout(o),b=a.useXDR&&void 0===k.status?200:1223===k.status?204:k.status;var d=v,e=null;return 0!==b?(d={body:c(),statusCode:b,method:q,headers:{},url:p,rawRequest:k},k.getAllResponseHeaders&&(d.headers=m(k.getAllResponseHeaders()))):e=new Error("Internal XMLHttpRequest Error"),j(e,d,d.body)}}if("undefined"==typeof a.callback)throw new Error("callback argument missing");var h=!1,j=function(b,c,d){h||(h=!0,a.callback(b,c,d))},k=a.xhr||null;k||(k=a.cors||a.useXDR?new g.XDomainRequest:new g.XMLHttpRequest);var l,n,o,p=k.url=a.uri||a.url,q=k.method=a.method||"GET",r=a.body||a.data,s=k.headers=a.headers||{},t=!!a.sync,u=!1,v={body:void 0,headers:{},statusCode:0,method:q,url:p,rawRequest:k};if("json"in a&&a.json!==!1&&(u=!0,s.accept||s.Accept||(s.Accept="application/json"),"GET"!==q&&"HEAD"!==q&&(s["content-type"]||s["Content-Type"]||(s["Content-Type"]="application/json"),r=JSON.stringify(a.json===!0?r:a.json))),k.onreadystatechange=b,k.onload=f,k.onerror=d,k.onprogress=function(){},k.onabort=function(){n=!0},k.ontimeout=d,k.open(q,p,!t,a.username,a.password),t||(k.withCredentials=!!a.withCredentials),!t&&a.timeout>0&&(o=setTimeout(function(){if(!n){n=!0,k.abort("timeout");var a=new Error("XMLHttpRequest timeout");a.code="ETIMEDOUT",d(a)}},a.timeout)),k.setRequestHeader)for(l in s)s.hasOwnProperty(l)&&k.setRequestHeader(l,s[l]);else if(a.headers&&!e(a.headers))throw new Error("Headers cannot be set on an XDomainRequest object");return"responseType"in a&&(k.responseType=a.responseType),"beforeSend"in a&&"function"==typeof a.beforeSend&&a.beforeSend(k),k.send(r||null),k}function i(a){if("document"===a.responseType)return a.responseXML;var b=a.responseXML&&"parsererror"===a.responseXML.documentElement.nodeName;return""!==a.responseType||b?null:a.responseXML}function j(){}var k=a(100),l=a(105),m=a(108),n=a(109);b.exports=g,g.XMLHttpRequest=k.XMLHttpRequest||j,g.XDomainRequest="withCredentials"in new g.XMLHttpRequest?g.XMLHttpRequest:k.XDomainRequest,d(["get","put","post","patch","head","delete"],function(a){g["delete"===a?"del":a]=function(b,c,d){return c=f(b,c,d),c.method=a.toUpperCase(),h(c)}})},{100:100,105:105,108:108,109:109}],105:[function(a,b,c){function d(a){var b=e.call(a);return"[object Function]"===b||"function"==typeof a&&"[object RegExp]"!==b||"undefined"!=typeof window&&(a===window.setTimeout||a===window.alert||a===window.confirm||a===window.prompt)}b.exports=d;var e=Object.prototype.toString},{}],106:[function(a,b,c){function d(a,b,c){if(!h(b))throw new TypeError("iterator must be a function");arguments.length<3&&(c=this),"[object Array]"===i.call(a)?e(a,b,c):"string"==typeof a?f(a,b,c):g(a,b,c)}function e(a,b,c){for(var d=0,e=a.length;d<e;d++)j.call(a,d)&&b.call(c,a[d],d,a)}function f(a,b,c){for(var d=0,e=a.length;d<e;d++)b.call(c,a.charAt(d),d,a)}function g(a,b,c){for(var d in a)j.call(a,d)&&b.call(c,a[d],d,a)}var h=a(105);b.exports=d;var i=Object.prototype.toString,j=Object.prototype.hasOwnProperty},{105:105}],107:[function(a,b,c){function d(a){return a.replace(/^\s*|\s*$/g,"")}c=b.exports=d,c.left=function(a){return a.replace(/^\s*/,"")},c.right=function(a){return a.replace(/\s*$/,"")}},{}],108:[function(a,b,c){var d=a(107),e=a(106),f=function(a){return"[object Array]"===Object.prototype.toString.call(a)};b.exports=function(a){if(!a)return{};var b={};return e(d(a).split("\n"),function(a){var c=a.indexOf(":"),e=d(a.slice(0,c)).toLowerCase(),g=d(a.slice(c+1));"undefined"==typeof b[e]?b[e]=g:f(b[e])?b[e].push(g):b[e]=[b[e],g]}),b}},{106:106,107:107}],109:[function(a,b,c){function d(){for(var a={},b=0;b<arguments.length;b++){var c=arguments[b];for(var d in c)e.call(c,d)&&(a[d]=c[d])}return a}b.exports=d;var e=Object.prototype.hasOwnProperty},{}],110:[function(a,b,c){var d=b.exports={WebVTT:a(111).WebVTT,VTTCue:a(112).VTTCue,VTTRegion:a(114).VTTRegion};window.vttjs=d,window.WebVTT=d.WebVTT;var e=d.VTTCue,f=d.VTTRegion,g=window.VTTCue,h=window.VTTRegion;d.shim=function(){window.VTTCue=e,window.VTTRegion=f},d.restore=function(){window.VTTCue=g,window.VTTRegion=h},window.VTTCue||d.shim()},{111:111,112:112,114:114}],111:[function(a,b,c){!function(a){function b(a,b){this.name="ParsingError",this.code=a.code,this.message=b||a.message}function c(a){function b(a,b,c,d){return 3600*(0|a)+60*(0|b)+(0|c)+(0|d)/1e3}var c=a.match(/^(\d+):(\d{2})(:\d{2})?\.(\d{3})/);return c?c[3]?b(c[1],c[2],c[3].replace(":",""),c[4]):c[1]>59?b(c[1],c[2],0,c[4]):b(0,c[1],c[2],c[4]):null}function d(){this.values=p(null)}function e(a,b,c,d){var e=d?a.split(d):[a];for(var f in e)if("string"==typeof e[f]){var g=e[f].split(c);if(2===g.length){var h=g[0],i=g[1];b(h,i)}}}function f(a,f,g){function h(){var d=c(a);if(null===d)throw new b(b.Errors.BadTimeStamp,"Malformed timestamp: "+k);return a=a.replace(/^[^\sa-zA-Z-]+/,""),d}function i(a,b){var c=new d;e(a,function(a,b){switch(a){case"region":for(var d=g.length-1;d>=0;d--)if(g[d].id===b){c.set(a,g[d].region);break}break;case"vertical":c.alt(a,b,["rl","lr"]);break;case"line":var e=b.split(","),f=e[0];c.integer(a,f),c.percent(a,f)&&c.set("snapToLines",!1),c.alt(a,f,["auto"]),2===e.length&&c.alt("lineAlign",e[1],["start","middle","end"]);break;case"position":e=b.split(","),c.percent(a,e[0]),2===e.length&&c.alt("positionAlign",e[1],["start","middle","end"]);break;case"size":c.percent(a,b);break;case"align":c.alt(a,b,["start","middle","end","left","right"])}},/:/,/\s/),b.region=c.get("region",null),b.vertical=c.get("vertical",""),b.line=c.get("line","auto"),b.lineAlign=c.get("lineAlign","start"),b.snapToLines=c.get("snapToLines",!0),b.size=c.get("size",100),b.align=c.get("align","middle"),b.position=c.get("position",{start:0,left:0,middle:50,end:100,right:100},b.align),b.positionAlign=c.get("positionAlign",{start:"start",left:"start",middle:"middle",end:"end",right:"end"},b.align)}function j(){a=a.replace(/^\s+/,"")}var k=a;if(j(),f.startTime=h(),j(),"-->"!==a.substr(0,3))throw new b(b.Errors.BadTimeStamp,"Malformed time stamp (time stamps must be separated by '-->'): "+k);a=a.substr(3),j(),f.endTime=h(),j(),i(a,f)}function g(a,b){function d(){function a(a){return b=b.substr(a.length),a}if(!b)return null;var c=b.match(/^([^<]*)(<[^>]+>?)?/);return a(c[1]?c[1]:c[2])}function e(a){return q[a]}function f(a){for(;o=a.match(/&(amp|lt|gt|lrm|rlm|nbsp);/);)a=a.replace(o[0],e);return a}function g(a,b){return!t[b.localName]||t[b.localName]===a.localName}function h(b,c){var d=r[b];if(!d)return null;var e=a.document.createElement(d);e.localName=d;var f=s[b];return f&&c&&(e[f]=c.trim()),e}for(var i,j=a.document.createElement("div"),k=j,l=[];null!==(i=d());)if("<"!==i[0])k.appendChild(a.document.createTextNode(f(i)));else{if("/"===i[1]){l.length&&l[l.length-1]===i.substr(2).replace(">","")&&(l.pop(),k=k.parentNode);continue}var m,n=c(i.substr(1,i.length-2));if(n){m=a.document.createProcessingInstruction("timestamp",n),k.appendChild(m);continue}var o=i.match(/^<([^.\s\/0-9>]+)(\.[^\s\\>]+)?([^>\\]+)?(\\?)>?$/);if(!o)continue;if(m=h(o[1],o[3]),!m)continue;if(!g(k,m))continue;o[2]&&(m.className=o[2].substr(1).replace("."," ")),l.push(o[1]),k.appendChild(m),k=m}return j}function h(a){for(var b=0;b<u.length;b++){var c=u[b];if(a>=c[0]&&a<=c[1])return!0}return!1}function i(a){function b(a,b){for(var c=b.childNodes.length-1;c>=0;c--)a.push(b.childNodes[c])}function c(a){if(!a||!a.length)return null;var d=a.pop(),e=d.textContent||d.innerText;if(e){var f=e.match(/^.*(\n|\r)/);return f?(a.length=0,f[0]):e}return"ruby"===d.tagName?c(a):d.childNodes?(b(a,d),c(a)):void 0}var d,e=[],f="";if(!a||!a.childNodes)return"ltr";for(b(e,a);f=c(e);)for(var g=0;g<f.length;g++)if(d=f.charCodeAt(g),h(d))return"rtl";return"ltr"}function j(a){if("number"==typeof a.line&&(a.snapToLines||a.line>=0&&a.line<=100))return a.line;if(!a.track||!a.track.textTrackList||!a.track.textTrackList.mediaElement)return-1;for(var b=a.track,c=b.textTrackList,d=0,e=0;e<c.length&&c[e]!==b;e++)"showing"===c[e].mode&&d++;return++d*-1}function k(){}function l(a,b,c){var d=/MSIE\s8\.0/.test(navigator.userAgent),e="rgba(255, 255, 255, 1)",f="rgba(0, 0, 0, 0.8)";d&&(e="rgb(255, 255, 255)",f="rgb(0, 0, 0)"),k.call(this),this.cue=b,this.cueDiv=g(a,b.text);var h={color:e,backgroundColor:f,position:"relative",left:0,right:0,top:0,bottom:0,display:"inline"};d||(h.writingMode=""===b.vertical?"horizontal-tb":"lr"===b.vertical?"vertical-lr":"vertical-rl",h.unicodeBidi="plaintext"),this.applyStyles(h,this.cueDiv),this.div=a.document.createElement("div"),h={textAlign:"middle"===b.align?"center":b.align,font:c.font,whiteSpace:"pre-line",position:"absolute"},d||(h.direction=i(this.cueDiv),h.writingMode=""===b.vertical?"horizontal-tb":"lr"===b.vertical?"vertical-lr":"vertical-rl".stylesunicodeBidi="plaintext"),this.applyStyles(h),this.div.appendChild(this.cueDiv);var j=0;switch(b.positionAlign){case"start":j=b.position;break;case"middle":j=b.position-b.size/2;break;case"end":j=b.position-b.size}""===b.vertical?this.applyStyles({left:this.formatStyle(j,"%"),width:this.formatStyle(b.size,"%")}):this.applyStyles({top:this.formatStyle(j,"%"),height:this.formatStyle(b.size,"%")}),this.move=function(a){this.applyStyles({top:this.formatStyle(a.top,"px"),bottom:this.formatStyle(a.bottom,"px"),left:this.formatStyle(a.left,"px"),right:this.formatStyle(a.right,"px"),height:this.formatStyle(a.height,"px"),width:this.formatStyle(a.width,"px")})}}function m(a){var b,c,d,e,f=/MSIE\s8\.0/.test(navigator.userAgent);if(a.div){c=a.div.offsetHeight,d=a.div.offsetWidth,e=a.div.offsetTop;var g=(g=a.div.childNodes)&&(g=g[0])&&g.getClientRects&&g.getClientRects();a=a.div.getBoundingClientRect(),b=g?Math.max(g[0]&&g[0].height||0,a.height/g.length):0}this.left=a.left,this.right=a.right,this.top=a.top||e,this.height=a.height||c,this.bottom=a.bottom||e+(a.height||c),this.width=a.width||d,this.lineHeight=void 0!==b?b:a.lineHeight,f&&!this.lineHeight&&(this.lineHeight=13)}function n(a,b,c,d){function e(a,b){for(var e,f=new m(a),g=1,h=0;h<b.length;h++){for(;a.overlapsOppositeAxis(c,b[h])||a.within(c)&&a.overlapsAny(d);)a.move(b[h]);if(a.within(c))return a;var i=a.intersectPercentage(c);g>i&&(e=new m(a),g=i),a=new m(f)}return e||f}var f=new m(b),g=b.cue,h=j(g),i=[];if(g.snapToLines){var k;switch(g.vertical){case"":i=["+y","-y"],k="height";break;case"rl":i=["+x","-x"],k="width";break;case"lr":i=["-x","+x"],k="width"}var l=f.lineHeight,n=l*Math.round(h),o=c[k]+l,p=i[0];Math.abs(n)>o&&(n=n<0?-1:1,n*=Math.ceil(o/l)*l),h<0&&(n+=""===g.vertical?c.height:c.width,i=i.reverse()),f.move(p,n)}else{var q=f.lineHeight/c.height*100;switch(g.lineAlign){case"middle":h-=q/2;break;case"end":h-=q}switch(g.vertical){case"":b.applyStyles({top:b.formatStyle(h,"%")});break;case"rl":b.applyStyles({left:b.formatStyle(h,"%")});break;case"lr":b.applyStyles({right:b.formatStyle(h,"%")})}i=["+y","-x","+x","-y"],f=new m(b)}var r=e(f,i);b.move(r.toCSSCompatValues(c))}function o(){}var p=Object.create||function(){function a(){}return function(b){if(1!==arguments.length)throw new Error("Object.create shim only accepts one parameter.");return a.prototype=b,new a}}();b.prototype=p(Error.prototype),b.prototype.constructor=b,b.Errors={BadSignature:{code:0,message:"Malformed WebVTT signature."},BadTimeStamp:{code:1,message:"Malformed time stamp."}},d.prototype={set:function(a,b){this.get(a)||""===b||(this.values[a]=b)},get:function(a,b,c){return c?this.has(a)?this.values[a]:b[c]:this.has(a)?this.values[a]:b},has:function(a){return a in this.values},alt:function(a,b,c){for(var d=0;d<c.length;++d)if(b===c[d]){this.set(a,b);break}},integer:function(a,b){/^-?\d+$/.test(b)&&this.set(a,parseInt(b,10))},percent:function(a,b){return!!(b.match(/^([\d]{1,3})(\.[\d]*)?%$/)&&(b=parseFloat(b),b>=0&&b<=100))&&(this.set(a,b),!0)}};var q={"&amp;":"&","&lt;":"<","&gt;":">","&lrm;":"‎","&rlm;":"‏","&nbsp;":" "},r={c:"span",i:"i",b:"b",u:"u",ruby:"ruby",rt:"rt",v:"span",lang:"span"},s={v:"title",lang:"lang"},t={rt:"ruby"},u=[[1470,1470],[1472,1472],[1475,1475],[1478,1478],[1488,1514],[1520,1524],[1544,1544],[1547,1547],[1549,1549],[1563,1563],[1566,1610],[1645,1647],[1649,1749],[1765,1766],[1774,1775],[1786,1805],[1807,1808],[1810,1839],[1869,1957],[1969,1969],[1984,2026],[2036,2037],[2042,2042],[2048,2069],[2074,2074],[2084,2084],[2088,2088],[2096,2110],[2112,2136],[2142,2142],[2208,2208],[2210,2220],[8207,8207],[64285,64285],[64287,64296],[64298,64310],[64312,64316],[64318,64318],[64320,64321],[64323,64324],[64326,64449],[64467,64829],[64848,64911],[64914,64967],[65008,65020],[65136,65140],[65142,65276],[67584,67589],[67592,67592],[67594,67637],[67639,67640],[67644,67644],[67647,67669],[67671,67679],[67840,67867],[67872,67897],[67903,67903],[67968,68023],[68030,68031],[68096,68096],[68112,68115],[68117,68119],[68121,68147],[68160,68167],[68176,68184],[68192,68223],[68352,68405],[68416,68437],[68440,68466],[68472,68479],[68608,68680],[126464,126467],[126469,126495],[126497,126498],[126500,126500],[126503,126503],[126505,126514],[126516,126519],[126521,126521],[126523,126523],[126530,126530],[126535,126535],[126537,126537],[126539,126539],[126541,126543],[126545,126546],[126548,126548],[126551,126551],[126553,126553],[126555,126555],[126557,126557],[126559,126559],[126561,126562],[126564,126564],[126567,126570],[126572,126578],[126580,126583],[126585,126588],[126590,126590],[126592,126601],[126603,126619],[126625,126627],[126629,126633],[126635,126651],[1114109,1114109]];k.prototype.applyStyles=function(a,b){b=b||this.div;for(var c in a)a.hasOwnProperty(c)&&(b.style[c]=a[c])},k.prototype.formatStyle=function(a,b){return 0===a?0:a+b},l.prototype=p(k.prototype),l.prototype.constructor=l,m.prototype.move=function(a,b){switch(b=void 0!==b?b:this.lineHeight,a){case"+x":this.left+=b,this.right+=b;break;case"-x":this.left-=b,this.right-=b;break;case"+y":this.top+=b,this.bottom+=b;break;case"-y":this.top-=b,this.bottom-=b}},m.prototype.overlaps=function(a){return this.left<a.right&&this.right>a.left&&this.top<a.bottom&&this.bottom>a.top},m.prototype.overlapsAny=function(a){for(var b=0;b<a.length;b++)if(this.overlaps(a[b]))return!0;return!1},m.prototype.within=function(a){return this.top>=a.top&&this.bottom<=a.bottom&&this.left>=a.left&&this.right<=a.right},m.prototype.overlapsOppositeAxis=function(a,b){switch(b){case"+x":return this.left<a.left;case"-x":return this.right>a.right;case"+y":return this.top<a.top;case"-y":return this.bottom>a.bottom}},m.prototype.intersectPercentage=function(a){return Math.max(0,Math.min(this.right,a.right)-Math.max(this.left,a.left))*Math.max(0,Math.min(this.bottom,a.bottom)-Math.max(this.top,a.top))/(this.height*this.width)},m.prototype.toCSSCompatValues=function(a){return{top:this.top-a.top,bottom:a.bottom-this.bottom,left:this.left-a.left,right:a.right-this.right,height:this.height,width:this.width}},m.getSimpleBoxPosition=function(a){var b=a.div?a.div.offsetHeight:a.tagName?a.offsetHeight:0,c=a.div?a.div.offsetWidth:a.tagName?a.offsetWidth:0,d=a.div?a.div.offsetTop:a.tagName?a.offsetTop:0;return a=a.div?a.div.getBoundingClientRect():a.tagName?a.getBoundingClientRect():a,{left:a.left,right:a.right,top:a.top||d,height:a.height||b,bottom:a.bottom||d+(a.height||b),width:a.width||c}},o.StringDecoder=function(){return{decode:function(a){if(!a)return"";if("string"!=typeof a)throw new Error("Error - expected string data.");return decodeURIComponent(encodeURIComponent(a))}}},o.convertCueToDOMTree=function(a,b){return a&&b?g(a,b):null};o.processCues=function(a,b,c){function d(a){for(var b=0;b<a.length;b++)if(a[b].hasBeenReset||!a[b].displayState)return!0;return!1}if(!a||!b||!c)return null;for(;c.firstChild;)c.removeChild(c.firstChild);var e=a.document.createElement("div");if(e.style.position="absolute",e.style.left="0",e.style.right="0",e.style.top="0",e.style.bottom="0",e.style.margin="1.5%",c.appendChild(e),d(b)){var f=[],g=m.getSimpleBoxPosition(e),h=Math.round(.05*g.height*100)/100,i={font:h+"px sans-serif"};!function(){for(var c,d,h=0;h<b.length;h++)d=b[h],c=new l(a,d,i),e.appendChild(c.div),n(a,c,g,f),d.displayState=c.div,f.push(m.getSimpleBoxPosition(c))}()}else for(var j=0;j<b.length;j++)e.appendChild(b[j].displayState)},o.Parser=function(a,b,c){c||(c=b,b={}),b||(b={}),this.window=a,this.vttjs=b,this.state="INITIAL",this.buffer="",this.decoder=c||new TextDecoder("utf8"),this.regionList=[]},o.Parser.prototype={reportOrThrowError:function(a){if(!(a instanceof b))throw a;this.onparsingerror&&this.onparsingerror(a)},parse:function(a){function g(){for(var a=k.buffer,b=0;b<a.length&&"\r"!==a[b]&&"\n"!==a[b];)++b;var c=a.substr(0,b);return"\r"===a[b]&&++b,"\n"===a[b]&&++b,k.buffer=a.substr(b),c}function h(a){var b=new d;if(e(a,function(a,c){switch(a){case"id":b.set(a,c);break;case"width":b.percent(a,c);break;case"lines":b.integer(a,c);break;case"regionanchor":case"viewportanchor":var e=c.split(",");if(2!==e.length)break;var f=new d;if(f.percent("x",e[0]),f.percent("y",e[1]),!f.has("x")||!f.has("y"))break;b.set(a+"X",f.get("x")),b.set(a+"Y",f.get("y"));break;case"scroll":b.alt(a,c,["up"])}},/=/,/\s/),b.has("id")){var c=new(k.vttjs.VTTRegion||k.window.VTTRegion);c.width=b.get("width",100),c.lines=b.get("lines",3),c.regionAnchorX=b.get("regionanchorX",0),c.regionAnchorY=b.get("regionanchorY",100),c.viewportAnchorX=b.get("viewportanchorX",0),c.viewportAnchorY=b.get("viewportanchorY",100),c.scroll=b.get("scroll",""),k.onregion&&k.onregion(c),k.regionList.push({id:b.get("id"),region:c})}}function i(a){var b=new d;e(a,function(a,d){switch(a){case"MPEGT":b.integer(a+"S",d);break;case"LOCA":b.set(a+"L",c(d))}},/[^\d]:/,/,/),k.ontimestampmap&&k.ontimestampmap({MPEGTS:b.get("MPEGTS"),LOCAL:b.get("LOCAL")})}function j(a){a.match(/X-TIMESTAMP-MAP/)?e(a,function(a,b){switch(a){case"X-TIMESTAMP-MAP":i(b)}},/=/):e(a,function(a,b){switch(a){case"Region":h(b)}},/:/)}var k=this;a&&(k.buffer+=k.decoder.decode(a,{stream:!0}));try{var l;if("INITIAL"===k.state){if(!/\r\n|\n/.test(k.buffer))return this;l=g();var m=l.match(/^WEBVTT([ \t].*)?$/);if(!m||!m[0])throw new b(b.Errors.BadSignature);k.state="HEADER"}for(var n=!1;k.buffer;){if(!/\r\n|\n/.test(k.buffer))return this;switch(n?n=!1:l=g(),k.state){case"HEADER":/:/.test(l)?j(l):l||(k.state="ID");continue;case"NOTE":l||(k.state="ID");continue;case"ID":if(/^NOTE($|[ \t])/.test(l)){k.state="NOTE";break}if(!l)continue;if(k.cue=new(k.vttjs.VTTCue||k.window.VTTCue)(0,0,""),k.state="CUE",l.indexOf("-->")===-1){k.cue.id=l;continue}case"CUE":try{f(l,k.cue,k.regionList)}catch(o){k.reportOrThrowError(o),k.cue=null,k.state="BADCUE";continue}k.state="CUETEXT";continue;case"CUETEXT":var p=l.indexOf("-->")!==-1;if(!l||p&&(n=!0)){k.oncue&&k.oncue(k.cue),k.cue=null,k.state="ID";continue}k.cue.text&&(k.cue.text+="\n"),k.cue.text+=l;continue;case"BADCUE":l||(k.state="ID");continue}}}catch(o){k.reportOrThrowError(o),"CUETEXT"===k.state&&k.cue&&k.oncue&&k.oncue(k.cue),k.cue=null,k.state="INITIAL"===k.state?"BADWEBVTT":"BADCUE"}return this},flush:function(){var a=this;try{if(a.buffer+=a.decoder.decode(),(a.cue||"HEADER"===a.state)&&(a.buffer+="\n\n",a.parse()),"INITIAL"===a.state)throw new b(b.Errors.BadSignature)}catch(c){a.reportOrThrowError(c)}return a.onflush&&a.onflush(),this}},a.WebVTT=o}(this,this.vttjs)},{}],112:[function(a,b,c){void 0!==b&&b.exports&&(this.VTTCue=this.VTTCue||a(113).VTTCue),function(a){a.VTTCue.prototype.toJSON=function(){var a={},b=this;return Object.keys(this).forEach(function(c){"getCueAsHTML"!==c&&"hasBeenReset"!==c&&"displayState"!==c&&(a[c]=b[c])}),a},a.VTTCue.create=function(b){if(!b.hasOwnProperty("startTime")||!b.hasOwnProperty("endTime")||!b.hasOwnProperty("text"))throw new Error("You must at least have start time, end time, and text.");var c=new a.VTTCue(b.startTime,b.endTime,b.text);for(var d in b)c.hasOwnProperty(d)&&(c[d]=b[d]);return c},a.VTTCue.fromJSON=function(a){return this.create(JSON.parse(a))}}(this)},{113:113}],113:[function(a,b,c){!function(a,b){function c(a){return"string"==typeof a&&(!!g[a.toLowerCase()]&&a.toLowerCase())}function d(a){return"string"==typeof a&&(!!h[a.toLowerCase()]&&a.toLowerCase())}function e(a){for(var b=1;b<arguments.length;b++){var c=arguments[b];for(var d in c)a[d]=c[d]}return a}function f(a,b,f){var g=this,h=/MSIE\s8\.0/.test(navigator.userAgent),i={};h?g=document.createElement("custom"):i.enumerable=!0,g.hasBeenReset=!1;var j="",k=!1,l=a,m=b,n=f,o=null,p="",q=!0,r="auto",s="start",t=50,u="middle",v=50,w="middle";if(Object.defineProperty(g,"id",e({},i,{get:function(){return j},set:function(a){j=""+a}})),Object.defineProperty(g,"pauseOnExit",e({},i,{get:function(){return k},set:function(a){k=!!a}})),Object.defineProperty(g,"startTime",e({},i,{get:function(){return l},set:function(a){if("number"!=typeof a)throw new TypeError("Start time must be set to a number.");l=a,this.hasBeenReset=!0}})),Object.defineProperty(g,"endTime",e({},i,{get:function(){return m},set:function(a){if("number"!=typeof a)throw new TypeError("End time must be set to a number.");m=a,this.hasBeenReset=!0}})),Object.defineProperty(g,"text",e({},i,{get:function(){return n},set:function(a){n=""+a,this.hasBeenReset=!0}})),Object.defineProperty(g,"region",e({},i,{get:function(){return o},set:function(a){o=a,this.hasBeenReset=!0}})),Object.defineProperty(g,"vertical",e({},i,{get:function(){return p},set:function(a){var b=c(a);if(b===!1)throw new SyntaxError("An invalid or illegal string was specified.");p=b,this.hasBeenReset=!0}})),Object.defineProperty(g,"snapToLines",e({},i,{get:function(){return q},set:function(a){q=!!a,this.hasBeenReset=!0}})),Object.defineProperty(g,"line",e({},i,{get:function(){return r},set:function(a){if("number"!=typeof a&&"auto"!==a)throw new SyntaxError("An invalid number or illegal string was specified.");r=a,this.hasBeenReset=!0}})),Object.defineProperty(g,"lineAlign",e({},i,{get:function(){return s},set:function(a){var b=d(a);if(!b)throw new SyntaxError("An invalid or illegal string was specified.");s=b,this.hasBeenReset=!0}})),Object.defineProperty(g,"position",e({},i,{get:function(){return t},set:function(a){if(a<0||a>100)throw new Error("Position must be between 0 and 100.");t=a,this.hasBeenReset=!0}})),Object.defineProperty(g,"positionAlign",e({},i,{get:function(){return u},set:function(a){var b=d(a);if(!b)throw new SyntaxError("An invalid or illegal string was specified.");u=b,this.hasBeenReset=!0}})),Object.defineProperty(g,"size",e({},i,{get:function(){return v},set:function(a){if(a<0||a>100)throw new Error("Size must be between 0 and 100.");v=a,this.hasBeenReset=!0}})),Object.defineProperty(g,"align",e({},i,{get:function(){return w},set:function(a){var b=d(a);if(!b)throw new SyntaxError("An invalid or illegal string was specified.");w=b,this.hasBeenReset=!0}})),g.displayState=void 0,h)return g}var g={"":!0,lr:!0,rl:!0},h={start:!0,middle:!0,end:!0,left:!0,right:!0};f.prototype.getCueAsHTML=function(){return WebVTT.convertCueToDOMTree(window,this.text)},a.VTTCue=a.VTTCue||f,b.VTTCue=f}(this,this.vttjs||{})},{}],114:[function(a,b,c){void 0!==b&&b.exports&&(this.VTTRegion=a(115).VTTRegion),function(a){a.VTTRegion.create=function(b){var c=new a.VTTRegion;for(var d in b)c.hasOwnProperty(d)&&(c[d]=b[d]);return c},a.VTTRegion.fromJSON=function(a){return this.create(JSON.parse(a))}}(this)},{115:115}],115:[function(a,b,c){!function(a,b){function c(a){return"string"==typeof a&&(!!f[a.toLowerCase()]&&a.toLowerCase())}function d(a){return"number"==typeof a&&a>=0&&a<=100}function e(){var a=100,b=3,e=0,f=100,g=0,h=100,i="";Object.defineProperties(this,{width:{enumerable:!0,get:function(){return a},set:function(b){if(!d(b))throw new Error("Width must be between 0 and 100.");a=b}},lines:{enumerable:!0,get:function(){return b},set:function(a){if("number"!=typeof a)throw new TypeError("Lines must be set to a number.");b=a}},regionAnchorY:{enumerable:!0,get:function(){return f},set:function(a){if(!d(a))throw new Error("RegionAnchorX must be between 0 and 100.");f=a}},regionAnchorX:{enumerable:!0,get:function(){return e},set:function(a){if(!d(a))throw new Error("RegionAnchorY must be between 0 and 100.");e=a}},viewportAnchorY:{enumerable:!0,get:function(){return h},set:function(a){if(!d(a))throw new Error("ViewportAnchorY must be between 0 and 100.");h=a}},viewportAnchorX:{enumerable:!0,get:function(){return g},set:function(a){if(!d(a))throw new Error("ViewportAnchorX must be between 0 and 100.");g=a}},scroll:{enumerable:!0,get:function(){return i},set:function(a){var b=c(a);if(b===!1)throw new SyntaxError("An invalid or illegal string was specified.");i=b}}})}var f={"":!0,up:!0};a.VTTRegion=a.VTTRegion||e,b.VTTRegion=e}(this,this.vttjs||{})},{}]},{},[98])(98)});
!function(){!function(a){var b=a&&a.videojs;b&&(b.CDN_VERSION="6.0.0")}(window),function(a,b,c,d,e,f,g){b&&b.HELP_IMPROVE_VIDEOJS!==!1&&(e.random()>.01||(f=b.location,g=b.videojs||{},a.src="//www.google-analytics.com/__utm.gif?utmwv=5.4.2&utmac=UA-16505296-3&utmn=1&utmhn="+d(f.hostname)+"&utmsr="+b.screen.availWidth+"x"+b.screen.availHeight+"&utmul="+(c.language||c.userLanguage||"").toLowerCase()+"&utmr="+d(f.href)+"&utmp="+d(f.hostname+f.pathname)+"&utmcc=__utma%3D1."+e.floor(1e10*e.random())+".1.1.1.1%3B&utme=8(vjsv*cdnv)9("+g.VERSION+"*"+g.CDN_VERSION+")"))}(new Image,window,navigator,encodeURIComponent,Math)}();
/**
 * videojs-vimeo
 * @version 3.0.0
 * @copyright 2016 Benoit Tremblay <trembl.ben@gmail.com>
 * @license MIT
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.videojsVimeo = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/*! @vimeo/player v1.0.6 | (c) 2016 Vimeo | MIT License | https://github.com/vimeo/player.js */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e.Vimeo=e.Vimeo||{},e.Vimeo.Player=t())}(this,function(){"use strict";function e(e,t){return t={exports:{}},e(t,t.exports),t.exports}function t(e,t,n){var r=T.get(e.element)||{};t in r||(r[t]=[]),r[t].push(n),T.set(e.element,r)}function n(e,t){var n=T.get(e.element)||{};return n[t]||[]}function r(e,t,n){var r=T.get(e.element)||{};if(!r[t])return!0;if(!n)return r[t]=[],T.set(e.element,r),!0;var o=r[t].indexOf(n);return o!==-1&&r[t].splice(o,1),T.set(e.element,r),r[t]&&0===r[t].length}function o(e,t){var n=T.get(e);T.set(t,n),T.delete(e)}function i(e,t){return 0===e.indexOf(t.toLowerCase())?e:""+t.toLowerCase()+e.substr(0,1).toUpperCase()+e.substr(1)}function a(e){return e instanceof window.HTMLElement}function u(e){return!isNaN(parseFloat(e))&&isFinite(e)&&Math.floor(e)==e}function s(e){return/^(https?:)?\/\/(player.)?vimeo.com(?=$|\/)/.test(e)}function c(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],t=e.id,n=e.url,r=t||n;if(!r)throw new Error("An id or url must be passed, either in an options object or as a data-vimeo-id or data-vimeo-url attribute.");if(u(r))return"https://vimeo.com/"+r;if(s(r))return r.replace("http:","https:");if(t)throw new TypeError("“"+t+"” is not a valid video id.");throw new TypeError("“"+r+"” is not a vimeo.com url.")}function f(e){for(var t=arguments.length<=1||void 0===arguments[1]?{}:arguments[1],n=_,r=Array.isArray(n),o=0,n=r?n:n[Symbol.iterator]();;){var i;if(r){if(o>=n.length)break;i=n[o++]}else{if(o=n.next(),o.done)break;i=o.value}var a=i,u=e.getAttribute("data-vimeo-"+a);(u||""===u)&&(t[a]=""===u?1:u)}return t}function l(e){var t=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];return new Promise(function(n,r){if(!s(e))throw new TypeError("“"+e+"” is not a vimeo.com url.");var o="https://vimeo.com/api/oembed.json?url="+encodeURIComponent(e);for(var i in t)t.hasOwnProperty(i)&&(o+="&"+i+"="+encodeURIComponent(t[i]));var a="XDomainRequest"in window?new XDomainRequest:new XMLHttpRequest;a.open("GET",o,!0),a.onload=function(){if(404===a.status)return void r(new Error("“"+e+"” was not found."));if(403===a.status)return void r(new Error("“"+e+"” is not embeddable."));try{var t=JSON.parse(a.responseText);n(t)}catch(e){r(e)}},a.onerror=function(){var e=a.status?" ("+a.status+")":"";r(new Error("There was an error fetching the embed code from Vimeo"+e+"."))},a.send()})}function h(e,t){var n=e.html;if(!t)throw new TypeError("An element must be provided");if(null!==t.getAttribute("data-vimeo-initialized"))return t.querySelector("iframe");var r=document.createElement("div");return r.innerHTML=n,t.appendChild(r.firstChild),t.setAttribute("data-vimeo-initialized","true"),t.querySelector("iframe")}function d(){var e=arguments.length<=0||void 0===arguments[0]?document:arguments[0],t=[].slice.call(e.querySelectorAll("[data-vimeo-id], [data-vimeo-url]")),n=function(e){"console"in window&&console.error&&console.error("There was an error creating an embed: "+e)},r=function(){if(i){if(a>=o.length)return"break";u=o[a++]}else{if(a=o.next(),a.done)return"break";u=a.value}var e=u;try{if(null!==e.getAttribute("data-vimeo-defer"))return"continue";var t=f(e),r=c(t);l(r,t).then(function(t){return h(t,e)}).catch(n)}catch(e){n(e)}};e:for(var o=t,i=Array.isArray(o),a=0,o=i?o:o[Symbol.iterator]();;){var u,s=r();switch(s){case"break":break e;case"continue":continue}}}function p(e){return"string"==typeof e&&(e=JSON.parse(e)),e}function v(e,t,n){if(e.element.contentWindow.postMessage){var r={method:t};void 0!==n&&(r.value=n);var o=parseFloat(navigator.userAgent.toLowerCase().replace(/^.*msie (\d+).*$/,"$1"));o>=8&&o<10&&(r=JSON.stringify(r)),e.element.contentWindow.postMessage(r,e.origin)}}function y(e,t){t=p(t);var o=[],i=void 0;if(t.event){if("error"===t.event)for(var a=n(e,t.data.method),u=a,s=Array.isArray(u),c=0,u=s?u:u[Symbol.iterator]();;){var f;if(s){if(c>=u.length)break;f=u[c++]}else{if(c=u.next(),c.done)break;f=c.value}var l=f,h=new Error(t.data.message);h.name=t.data.name,l.reject(h),r(e,t.data.method,l)}o=n(e,"event:"+t.event),i=t.data}else t.method&&(o=n(e,t.method),i=t.value,r(e,t.method));for(var d=o,v=Array.isArray(d),y=0,d=v?d:d[Symbol.iterator]();;){var m;if(v){if(y>=d.length)break;m=d[y++]}else{if(y=d.next(),y.done)break;m=y.value}var g=m;try{if("function"==typeof g){g.call(e,i);continue}g.resolve(i)}catch(e){}}}var m="undefined"!=typeof Array.prototype.indexOf,g="undefined"!=typeof window.postMessage;if(!m||!g)throw new Error("Sorry, the Vimeo Player API is not available in this browser.");var w="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},b=(e(function(e,t){!function(e){function t(e,t){function r(e){return this&&this.constructor===r?(this._keys=[],this._values=[],this._itp=[],this.objectOnly=t,void(e&&n.call(this,e))):new r(e)}return t||w(e,"size",{get:y}),e.constructor=r,r.prototype=e,r}function n(e){this.add?e.forEach(this.add,this):e.forEach(function(e){this.set(e[0],e[1])},this)}function r(e){return this.has(e)&&(this._keys.splice(g,1),this._values.splice(g,1),this._itp.forEach(function(e){g<e[0]&&e[0]--})),-1<g}function o(e){return this.has(e)?this._values[g]:void 0}function i(e,t){if(this.objectOnly&&t!==Object(t))throw new TypeError("Invalid value used as weak collection key");if(t!=t||0===t)for(g=e.length;g--&&!b(e[g],t););else g=e.indexOf(t);return-1<g}function a(e){return i.call(this,this._values,e)}function u(e){return i.call(this,this._keys,e)}function s(e,t){return this.has(e)?this._values[g]=t:this._values[this._keys.push(e)-1]=t,this}function c(e){return this.has(e)||this._values.push(e),this}function f(){(this._keys||0).length=this._values.length=0}function l(){return v(this._itp,this._keys)}function h(){return v(this._itp,this._values)}function d(){return v(this._itp,this._keys,this._values)}function p(){return v(this._itp,this._values,this._values)}function v(e,t,n){var r=[0],o=!1;return e.push(r),{next:function(){var i,a=r[0];return!o&&a<t.length?(i=n?[t[a],n[a]]:t[a],r[0]++):(o=!0,e.splice(e.indexOf(r),1)),{done:o,value:i}}}}function y(){return this._values.length}function m(e,t){for(var n=this.entries();;){var r=n.next();if(r.done)break;e.call(t,r.value[1],r.value[0],this)}}var g,w=Object.defineProperty,b=function(e,t){return e===t||e!==e&&t!==t};"undefined"==typeof WeakMap&&(e.WeakMap=t({delete:r,clear:f,get:o,has:u,set:s},!0)),"undefined"!=typeof Map&&"function"==typeof(new Map).values&&(new Map).values().next||(e.Map=t({delete:r,has:u,get:o,set:s,keys:l,values:h,entries:d,forEach:m,clear:f})),"undefined"!=typeof Set&&"function"==typeof(new Set).values&&(new Set).values().next||(e.Set=t({has:a,add:c,delete:r,clear:f,keys:h,values:h,entries:p,forEach:m})),"undefined"==typeof WeakSet&&(e.WeakSet=t({delete:r,add:c,clear:f,has:a},!0))}("undefined"!=typeof t&&"undefined"!=typeof w?w:window)}),e(function(e){!function(t,n,r){n[t]=n[t]||r(),"undefined"!=typeof e&&e.exports?e.exports=n[t]:"function"==typeof define&&define.amd&&define(function(){return n[t]})}("Promise","undefined"!=typeof w?w:w,function(){function e(e,t){h.add(e,t),l||(l=p(h.drain))}function t(e){var t,n=typeof e;return null==e||"object"!=n&&"function"!=n||(t=e.then),"function"==typeof t&&t}function n(){for(var e=0;e<this.chain.length;e++)r(this,1===this.state?this.chain[e].success:this.chain[e].failure,this.chain[e]);this.chain.length=0}function r(e,n,r){var o,i;try{n===!1?r.reject(e.msg):(o=n===!0?e.msg:n.call(void 0,e.msg),o===r.promise?r.reject(TypeError("Promise-chain cycle")):(i=t(o))?i.call(o,r.resolve,r.reject):r.resolve(o))}catch(e){r.reject(e)}}function o(r){var a,s=this;if(!s.triggered){s.triggered=!0,s.def&&(s=s.def);try{(a=t(r))?e(function(){var e=new u(s);try{a.call(r,function(){o.apply(e,arguments)},function(){i.apply(e,arguments)})}catch(t){i.call(e,t)}}):(s.msg=r,s.state=1,s.chain.length>0&&e(n,s))}catch(e){i.call(new u(s),e)}}}function i(t){var r=this;r.triggered||(r.triggered=!0,r.def&&(r=r.def),r.msg=t,r.state=2,r.chain.length>0&&e(n,r))}function a(e,t,n,r){for(var o=0;o<t.length;o++)!function(o){e.resolve(t[o]).then(function(e){n(o,e)},r)}(o)}function u(e){this.def=e,this.triggered=!1}function s(e){this.promise=e,this.state=0,this.triggered=!1,this.chain=[],this.msg=void 0}function c(t){if("function"!=typeof t)throw TypeError("Not a function");if(0!==this.__NPO__)throw TypeError("Not a promise");this.__NPO__=1;var r=new s(this);this.then=function(t,o){var i={success:"function"!=typeof t||t,failure:"function"==typeof o&&o};return i.promise=new this.constructor(function(e,t){if("function"!=typeof e||"function"!=typeof t)throw TypeError("Not a function");i.resolve=e,i.reject=t}),r.chain.push(i),0!==r.state&&e(n,r),i.promise},this.catch=function(e){return this.then(void 0,e)};try{t.call(void 0,function(e){o.call(r,e)},function(e){i.call(r,e)})}catch(e){i.call(r,e)}}var f,l,h,d=Object.prototype.toString,p="undefined"!=typeof setImmediate?function(e){return setImmediate(e)}:setTimeout;try{Object.defineProperty({},"x",{}),f=function(e,t,n,r){return Object.defineProperty(e,t,{value:n,writable:!0,configurable:r!==!1})}}catch(e){f=function(e,t,n){return e[t]=n,e}}h=function(){function e(e,t){this.fn=e,this.self=t,this.next=void 0}var t,n,r;return{add:function(o,i){r=new e(o,i),n?n.next=r:t=r,n=r,r=void 0},drain:function(){var e=t;for(t=n=l=void 0;e;)e.fn.call(e.self),e=e.next}}}();var v=f({},"constructor",c,!1);return c.prototype=v,f(v,"__NPO__",0,!1),f(c,"resolve",function(e){var t=this;return e&&"object"==typeof e&&1===e.__NPO__?e:new t(function(t,n){if("function"!=typeof t||"function"!=typeof n)throw TypeError("Not a function");t(e)})}),f(c,"reject",function(e){return new this(function(t,n){if("function"!=typeof t||"function"!=typeof n)throw TypeError("Not a function");n(e)})}),f(c,"all",function(e){var t=this;return"[object Array]"!=d.call(e)?t.reject(TypeError("Not an array")):0===e.length?t.resolve([]):new t(function(n,r){if("function"!=typeof n||"function"!=typeof r)throw TypeError("Not a function");var o=e.length,i=Array(o),u=0;a(t,e,function(e,t){i[e]=t,++u===o&&n(i)},r)})}),f(c,"race",function(e){var t=this;return"[object Array]"!=d.call(e)?t.reject(TypeError("Not an array")):new t(function(n,r){if("function"!=typeof n||"function"!=typeof r)throw TypeError("Not a function");a(t,e,function(e,t){n(t)},r)})}),c})})),E=b&&"object"==typeof b&&"default"in b?b.default:b,T=new WeakMap,_=["id","url","width","maxwidth","height","maxheight","portrait","title","byline","color","autoplay","autopause","loop","responsive"],k=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")},x=new WeakMap,j=new WeakMap,Player=function(){function Player(e){var t=this,n=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];if(k(this,Player),window.jQuery&&e instanceof jQuery&&(e.length>1&&window.console&&console.warn&&console.warn("A jQuery object with multiple elements was passed, using the first element."),e=e[0]),"string"==typeof e&&(e=document.getElementById(e)),!a(e))throw new TypeError("You must pass either a valid element or a valid id.");if("IFRAME"!==e.nodeName){var r=e.querySelector("iframe");r&&(e=r)}if("IFRAME"===e.nodeName&&!s(e.getAttribute("src")||""))throw new Error("The player element passed isn’t a Vimeo embed.");if(x.has(e))return x.get(e);this.element=e,this.origin="*";var i=new E(function(r,i){var a=function(e){if(s(e.origin)&&t.element.contentWindow===e.source){"*"===t.origin&&(t.origin=e.origin);var n=p(e.data),o="event"in n&&"ready"===n.event,i="method"in n&&"ping"===n.method;return o||i?(t.element.setAttribute("data-ready","true"),void r()):void y(t,n)}};if(window.addEventListener?window.addEventListener("message",a,!1):window.attachEvent&&window.attachEvent("onmessage",a),"IFRAME"!==t.element.nodeName){var u=f(e,n),d=c(u);l(d,u).then(function(n){var r=h(n,e);return t.element=r,o(e,r),n}).catch(function(e){return i(e)})}});return j.set(this,i),x.set(this.element,this),"IFRAME"===this.element.nodeName&&v(this,"ping"),this}return Player.prototype.then=function(e){var t=arguments.length<=1||void 0===arguments[1]?function(){}:arguments[1];return this.ready().then(e,t)},Player.prototype.callMethod=function(e){var n=this,r=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];return new E(function(o,i){return n.ready().then(function(){t(n,e,{resolve:o,reject:i}),v(n,e,r)})})},Player.prototype.get=function(e){var n=this;return new E(function(r,o){return e=i(e,"get"),n.ready().then(function(){t(n,e,{resolve:r,reject:o}),v(n,e)})})},Player.prototype.set=function(e,n){var r=this;return E.resolve(n).then(function(n){if(e=i(e,"set"),void 0===n||null===n)throw new TypeError("There must be a value to set.");return r.ready().then(function(){return new E(function(o,i){t(r,e,{resolve:o,reject:i}),v(r,e,n)})})})},Player.prototype.on=function(e,r){if(!e)throw new TypeError("You must pass an event name.");if(!r)throw new TypeError("You must pass a callback function.");if("function"!=typeof r)throw new TypeError("The callback must be a function.");var o=n(this,"event:"+e);0===o.length&&this.callMethod("addEventListener",e).catch(function(){}),t(this,"event:"+e,r)},Player.prototype.off=function(e,t){if(!e)throw new TypeError("You must pass an event name.");if(t&&"function"!=typeof t)throw new TypeError("The callback must be a function.");var n=r(this,"event:"+e,t);n&&this.callMethod("removeEventListener",e).catch(function(e){})},Player.prototype.loadVideo=function(e){return this.callMethod("loadVideo",e)},Player.prototype.ready=function(){var e=j.get(this);return E.resolve(e)},Player.prototype.enableTextTrack=function(e,t){if(!e)throw new TypeError("You must pass a language.");return this.callMethod("enableTextTrack",{language:e,kind:t})},Player.prototype.disableTextTrack=function(){return this.callMethod("disableTextTrack")},Player.prototype.pause=function(){return this.callMethod("pause")},Player.prototype.play=function(){return this.callMethod("play")},Player.prototype.unload=function(){return this.callMethod("unload")},Player.prototype.getAutopause=function(){return this.get("autopause")},Player.prototype.setAutopause=function(e){return this.set("autopause",e)},Player.prototype.getColor=function(){return this.get("color")},Player.prototype.setColor=function(e){return this.set("color",e)},Player.prototype.getCurrentTime=function(){return this.get("currentTime")},Player.prototype.setCurrentTime=function(e){return this.set("currentTime",e)},Player.prototype.getDuration=function(){return this.get("duration")},Player.prototype.getEnded=function(){return this.get("ended")},Player.prototype.getLoop=function(){return this.get("loop")},Player.prototype.setLoop=function(e){return this.set("loop",e)},Player.prototype.getPaused=function(){return this.get("paused")},Player.prototype.getTextTracks=function(){return this.get("textTracks")},Player.prototype.getVideoEmbedCode=function(){return this.get("videoEmbedCode")},Player.prototype.getVideoId=function(){return this.get("videoId")},Player.prototype.getVideoTitle=function(){return this.get("videoTitle")},Player.prototype.getVideoWidth=function(){return this.get("videoWidth")},Player.prototype.getVideoHeight=function(){return this.get("videoHeight")},Player.prototype.getVideoUrl=function(){return this.get("videoUrl")},Player.prototype.getVolume=function(){return this.get("volume")},Player.prototype.setVolume=function(e){return this.set("volume",e)},Player}();return d(),Player});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
(function (global){
'use strict';

exports.__esModule = true;

var _video = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _video2 = _interopRequireDefault(_video);

var _player = require('@vimeo/player');

var _player2 = _interopRequireDefault(_player);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Component = _video2.default.getComponent('Component');
var Tech = _video2.default.getComponent('Tech');
var cssInjected = false;

/**
 * Vimeo - Wrapper for Video Player API
 *
 * @param {Object=} options Object of option names and values
 * @param {Function=} ready Ready callback function
 * @extends Tech
 * @class Vimeo
 */

var Vimeo = function (_Tech) {
  _inherits(Vimeo, _Tech);

  function Vimeo(options, ready) {
    _classCallCheck(this, Vimeo);

    var _this = _possibleConstructorReturn(this, _Tech.call(this, options, ready));

    injectCss();
    _this.setPoster(options.poster);
    _this.initVimeoPlayer();
    return _this;
  }

  Vimeo.prototype.initVimeoPlayer = function initVimeoPlayer() {
    var _this2 = this;

    var vimeoOptions = {
      url: this.options_.source.src,
      byline: false,
      portrait: false,
      title: false
    };

    if (this.options_.autoplay) {
      vimeoOptions.autoplay = true;
    }
    if (this.options_.height) {
      vimeoOptions.height = this.options_.height;
    }
    if (this.options_.width) {
      vimeoOptions.width = this.options_.width;
    }
    if (this.options_.maxheight) {
      vimeoOptions.maxheight = this.options_.maxheight;
    }
    if (this.options_.maxwidth) {
      vimeoOptions.maxwidth = this.options_.maxwidth;
    }
    if (this.options_.loop) {
      vimeoOptions.loop = this.options_.loop;
    }

    this._player = new _player2.default(this.el(), vimeoOptions);
    this.initVimeoState();

    ['play', 'pause', 'ended', 'timeupdate', 'progress', 'seeked'].forEach(function (e) {
      _this2._player.on(e, function (progress) {
        if (_this2._vimeoState.progress.duration != progress.duration) {
          _this2.trigger('durationchange');
        }
        _this2._vimeoState.progress = progress;
        _this2.trigger(e);
      });
    });

    this._player.on('pause', function () {
      return _this2._vimeoState.playing = false;
    });
    this._player.on('play', function () {
      _this2._vimeoState.playing = true;
      _this2._vimeoState.ended = false;
    });
    this._player.on('ended', function () {
      _this2._vimeoState.playing = false;
      _this2._vimeoState.ended = true;
    });
    this._player.on('volumechange', function (v) {
      return _this2._vimeoState.volume = v;
    });
    this._player.on('error', function (e) {
      return _this2.trigger('error', e);
    });

    this.triggerReady();
  };

  Vimeo.prototype.initVimeoState = function initVimeoState() {
    var state = this._vimeoState = {
      ended: false,
      playing: false,
      volume: 0,
      progress: {
        seconds: 0,
        percent: 0,
        duration: 0
      }
    };

    this._player.getCurrentTime().then(function (time) {
      return state.progress.seconds = time;
    });
    this._player.getDuration().then(function (time) {
      return state.progress.duration = time;
    });
    this._player.getPaused().then(function (paused) {
      return state.playing = !paused;
    });
    this._player.getVolume().then(function (volume) {
      return state.volume = volume;
    });
  };

  Vimeo.prototype.createEl = function createEl() {
    var div = _video2.default.createEl('div', {
      id: this.options_.techId
    });

    div.style.cssText = 'width:100%;height:100%;top:0;left:0;position:absolute';
    div.className = 'vjs-vimeo';

    return div;
  };

  Vimeo.prototype.controls = function controls() {
    return true;
  };

  Vimeo.prototype.supportsFullScreen = function supportsFullScreen() {
    return true;
  };

  Vimeo.prototype.src = function src() {
    // @note: Not sure why this is needed but videojs requires it
    return this.options_.source;
  };

  Vimeo.prototype.currentSrc = function currentSrc() {
    return this.options_.source.src;
  };

  // @note setSrc is used in other usecases (YouTube, Html) it doesn't seem required here
  // setSrc() {}

  Vimeo.prototype.currentTime = function currentTime() {
    return this._vimeoState.progress.seconds;
  };

  Vimeo.prototype.setCurrentTime = function setCurrentTime(time) {
    this._player.setCurrentTime(time);
  };

  Vimeo.prototype.volume = function volume() {
    return this._vimeoState.volume;
  };

  Vimeo.prototype.setVolume = function setVolume(v) {
    return this._player.setVolume(volume);
  };

  Vimeo.prototype.duration = function duration() {
    return this._vimeoState.progress.duration;
  };

  Vimeo.prototype.buffered = function buffered() {
    var progress = this._vimeoState.progress;
    return _video2.default.createTimeRange(0, progress.percent * progress.duration);
  };

  Vimeo.prototype.paused = function paused() {
    return !this._vimeoState.playing;
  };

  Vimeo.prototype.pause = function pause() {
    this._player.pause();
  };

  Vimeo.prototype.play = function play() {
    this._player.play();
  };

  Vimeo.prototype.muted = function muted() {
    return this._vimeoState.volume === 0;
  };

  Vimeo.prototype.ended = function ended() {
    return this._vimeoState.ended;
  };

  // Vimeo does has a mute API and native controls aren't being used,
  // so setMuted doesn't really make sense and shouldn't be called.
  // setMuted(mute) {}


  return Vimeo;
}(Tech);

Vimeo.prototype.featuresTimeupdateEvents = true;

Vimeo.isSupported = function () {
  return true;
};

// Add Source Handler pattern functions to this tech
Tech.withSourceHandlers(Vimeo);

Vimeo.nativeSourceHandler = {};

/**
 * Check if Vimeo can play the given videotype
 * @param  {String} type    The mimetype to check
 * @return {String}         'maybe', or '' (empty string)
 */
Vimeo.nativeSourceHandler.canPlayType = function (source) {
  if (source === 'video/vimeo') {
    return 'maybe';
  }

  return '';
};

/*
 * Check Vimeo can handle the source natively
 *
 * @param  {Object} source  The source object
 * @return {String}         'maybe', or '' (empty string)
 * @note: Copied over from YouTube — not sure this is relevant
 */
Vimeo.nativeSourceHandler.canHandleSource = function (source) {
  if (source.type) {
    return Vimeo.nativeSourceHandler.canPlayType(source.type);
  } else if (source.src) {
    return Vimeo.nativeSourceHandler.canPlayType(source.src);
  }

  return '';
};

// @note: Copied over from YouTube — not sure this is relevant
Vimeo.nativeSourceHandler.handleSource = function (source, tech) {
  tech.src(source.src);
};

// @note: Copied over from YouTube — not sure this is relevant
Vimeo.nativeSourceHandler.dispose = function () {};

Vimeo.registerSourceHandler(Vimeo.nativeSourceHandler);

// Since the iframe can't be touched using Vimeo's way of embedding,
// let's add a new styling rule to have the same style as `vjs-tech`
function injectCss() {
  if (cssInjected) {
    return;
  }
  cssInjected = true;
  var css = '\n      .vjs-vimeo iframe {\n        position: absolute;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n      }\n    ';
  var head = document.head || document.getElementsByTagName('head')[0];

  var style = document.createElement('style');
  style.type = 'text/css';

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);
}

//Component.registerComponent('Vimeo', Vimeo);Tech.registerTech('Vimeo', Vimeo);
if (typeof videojs.registerTech !== 'undefined') { videojs.registerTech('Vimeo', Vimeo); } else { videojs.registerComponent('Vimeo', Vimeo); }



// Include the version number.
Vimeo.VERSION = '0.0.1';

exports.default = Vimeo;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"@vimeo/player":1}]},{},[2])(2)
});