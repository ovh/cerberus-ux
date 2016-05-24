"use strict";

angular
    .module("abuseApp")
    .controller("CategoryAddCtrl", function ($scope, $mdDialog) {

        $scope.category = {};

        $scope.hide = function () {
            $mdDialog.hide($scope.category);
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.remove = function () {
            $mdDialog.cancel(true);
        };
    });
