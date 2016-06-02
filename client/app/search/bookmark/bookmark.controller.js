"use strict";

angular
    .module("abuseApp")
    .controller("SearchBookmarkCtrl", function ($scope, $mdDialog) {

        $scope.bookmarkName = "";

        $scope.hide = function () {
            $mdDialog.hide($scope.bookmarkName);
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.remove = function () {
            $mdDialog.cancel(true);
        };
    });
