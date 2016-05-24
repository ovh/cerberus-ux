"use strict";

angular
    .module("abuseApp")
    .controller("ReportCommentCtrl", function ($scope, $mdDialog, defaultText) {

        $scope.comment = defaultText || "";

        $scope.hide = function () {
            $mdDialog.hide($scope.comment);
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.remove = function () {
            $mdDialog.cancel(true);
        };
    });
