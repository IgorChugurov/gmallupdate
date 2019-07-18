angular
    .module('gmall.services')
    .factory('Confirm', confirmFactory);

confirmFactory.$inject = ['$q','$uibModal'];

function confirmFactory($q,$uibModal) {
    return service;
    function service(question,html){
        return $q(function(resolve,reject){
            var options={
                animation: true,
                template : [
                    '<div class="modal-header">',
                        '<h3 class="modal-title text-center" ng-bind="$ctrl.question"></h3>',

                        '<span class="cancel-confirm" ng-click="$ctrl.cancel()"><span class="icon-cancel-img" ></span></span>',

                    '</div>',
                    '<div class="modal-body confirm">',
                    '<div class="modal-html" ng-bind-html="$ctrl.html|unsafe"></div>',
                    '<form ng-submit="$ctrl.ok()">'+
                    '<button autofocus class="btn btn-project btn-border  btn-modal pull-right" type="reset" ng-click="$ctrl.cancel()">{{global.get("langOrder").val.noo}}</button>',
                    '<button class="btn btn-project btn-modal pull-left" type="submit">{{global.get("langOrder").val.yes}}</button>',
                    '</form>'+
                    '<div class="clearfix"></div>',
                    '</div>'
                ].join(''),
                controller: function($uibModalInstance,$rootScope,question,html){
                    var self=this;
                    self.question=question;
                    if(html){
                        self.html=html;
                    }
                    self.ok=function(){
                        $uibModalInstance.close();
                    }
                    self.cancel = function () {
                        //console.log('????')
                        $uibModalInstance.dismiss();
                    };
                    $rootScope.$on('$stateChangeStart',function(){
                        $uibModalInstance.dismiss();
                    });
                },
                controllerAs:'$ctrl',
                size: 'sm',
                resolve:{
                    question: function(){return question},
                    html: function(){return html}
                }
            }
            if(html){
                options.size='md'
            }
            $uibModal.open(options).result.then(function () {resolve();},function () {reject()});
        })


    }
}
