"use strict";

angular
    .module("abuseApp")
    .controller("DefendantTagAddCtrl", function ($scope, $mdDialog, Tags, Toast, type) {

        $scope.loaders = {
            add: false
        };

        $scope.tag = {
            name: "",
            tagType: type,
            level: null
        };

        $scope.hide = function () {
            $scope.loaders.add = true;

            Tags.save({}, $scope.tag).$promise.then(
                function (data) {
                    $mdDialog.hide(data);
                    Toast.success("Tag added successfully");
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                $scope.loaders.add = false;
            });
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.remove = function () {
            $mdDialog.cancel(true);
        };
    });
