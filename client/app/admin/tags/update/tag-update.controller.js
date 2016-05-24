"use strict";

angular
    .module("abuseApp")
    .controller("DefendantTagUpdateCtrl", function ($scope, $mdDialog, Tags, Toast, tag) {

        $scope.tag = angular.copy(tag);
        $scope.loaders = {
            update : false
        };

        $scope.hide = function () {
            $scope.loaders.update = true;
            Tags.update({ id: tag.id }, {
                name: $scope.tag.name,
                level: $scope.tag.level ? $scope.tag.level : null
            }).$promise.then(
                function (data) {
                    $mdDialog.hide(data);
                    Toast.success("Tag updated successfully");
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                $scope.loaders.update = false;
            });
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.remove = function () {
            $mdDialog.cancel(true);
        };
    });
