"use strict";

angular
    .module("abuseApp")
    .controller("DiaporamaChangeCategoryCtrl", function ($scope, Toast, Categories, $mdDialog, category) {

        $scope.value = {
            selectedCategory: category
        };

        $scope.init = function () {
            Categories.query().$promise.then(
                function (categories) {
                    $scope.categories = categories;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.save = function () {
            $mdDialog.hide($scope.value.selectedCategory);
        };
    });
