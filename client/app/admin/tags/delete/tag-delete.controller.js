"use strict";

angular
    .module("abuseApp")
    .controller("DefendantTagDeleteCtrl", function ($scope, $mdDialog, Toast, Tags, tag) {
        $scope.loaders = {
            tags: false
        };
        $scope.hide = function () {
            $scope.loaders.tags = true;
            Tags["delete"]({ id: tag.id }).$promise.then(
                function () {
                    $mdDialog.hide();
                    Toast.success("Tag removed successfully");
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                $scope.loaders.tags = false;
            });
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.remove = function () {
            $mdDialog.cancel(true);
        };
    });
