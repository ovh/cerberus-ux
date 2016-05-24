"use strict";

angular
    .module("abuseApp")
    .controller("EmailTemplateDeleteCtrl", function ($scope, $mdDialog, template) {

        $scope.template = template;

        $scope.hide = function () {
            $mdDialog.hide($scope.template);
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.remove = function () {
            $mdDialog.cancel(true);
        };
    });
