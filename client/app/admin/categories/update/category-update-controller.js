"use strict";

angular
    .module("abuseApp")
    .controller("CategoryUpdateCtrl", function ($scope, $mdDialog, category) {

        $scope.category = angular.copy(category);

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
