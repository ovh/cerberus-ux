"use strict";

angular
    .module("abuseApp")
    .controller("ThresholdEditCtrl", function ($scope, $mdDialog, categories, threshold) {

        $scope.isEditing = !!threshold;
        $scope.threshold = threshold || {};
        $scope.categories = categories;

        $scope.hide = function () {
            $mdDialog.hide($scope.threshold);
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.remove = function () {
            $mdDialog.cancel(true);
        };
    });
