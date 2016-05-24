"use strict";

angular
    .module("abuseApp")
    .controller("ResolutionAddCtrl", function ($scope, $mdDialog, isEditing, resolution) {

        $scope.isEditing = isEditing;
        $scope.resolution = resolution;

        $scope.hide = function () {
            $mdDialog.hide($scope.resolution);
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.remove = function () {
            $mdDialog.cancel(true);
        };
    });
