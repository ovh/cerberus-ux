"use strict";

angular
    .module("abuseApp")
    .controller("PauseDelayCtrl", function ($scope, $mdDialog, ticket) {

        $scope.pauseDuration = {
            value: ticket.pauseDuration / 3600 || 12
        };

        $scope.hide = function () {
            $mdDialog.hide($scope.pauseDuration.value * 3600);
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.remove = function () {
            $mdDialog.cancel(true);
        };
    });
