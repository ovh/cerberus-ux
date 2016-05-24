"use strict";

angular
    .module("abuseApp")
    .controller("TicketResolutionCtrl", function ($scope, $q, $rootScope, $mdDialog, Resolution, Tickets, Toast) {

        $scope.loading = false;
        $scope.body = {};

        $scope.init = function () {
            $scope.loading = true;
            $q.all([
                $scope.getResolutions()
            ]).then(function () {
                $scope.loading = false;
            });
        };

        $scope.getResolutions = function () {
            return Resolution.query().$promise.then(
                function (resolutions) {
                    $scope.resolutions = resolutions;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.confirm = function () {
            $mdDialog.hide($scope.body);
        };
    });
