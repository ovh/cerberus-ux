"use strict";

angular
    .module("abuseApp")
    .controller("ChangeDelayCtrl", function ($scope, $mdDialog, ticket) {

        $scope.snoozeDuration = {
            value: parseInt(ticket.snoozeDuration / 3600)
        };

        $scope.hide = function () {
            $mdDialog.hide($scope.snoozeDuration.value * 3600);
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.remove = function () {
            $mdDialog.cancel(true);
        };
    });
