"use strict";

angular
    .module("abuseApp")
    .controller("ProofEditCtrl", function ($scope, $mdDialog) {

        $scope.hide = function () {
            $mdDialog.hide($scope.proof);
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.remove = function () {
            $mdDialog.cancel(true);
        };
    });
