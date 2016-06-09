/*global angular*/
'use strict';

angular
    .module('abuseApp')
    .controller('CurlResultDialogCtrl', function ($scope, Toast, $mdDialog, Tools, url) {

        $scope.result = "";
        $scope.loading = true;

        $scope.init = function () {
            Tools.curl({url: url}).$promise.then(
                function (result) {
                    $scope.result = result;
                    $scope.loading = false;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };
        
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
});
