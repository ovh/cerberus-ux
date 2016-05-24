"use strict";

angular
    .module("abuseApp")
    .controller("DetachDefendantCtrl", function ($scope, $mdDialog, ticket) {

        $scope.ticket = angular.copy(ticket);

        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.remove = function () {
            $mdDialog.cancel(true);
        };
    });
