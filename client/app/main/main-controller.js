angular.module("abuseApp").controller("AppCtrl", function ($rootScope, $scope, $state, Auth, $location) {
    "use strict";

    $scope.Auth = Auth;
    $scope.backState = "dashboard";
    $scope.previousState = "dashboard";
    $scope.previousStateParams = {};

    $scope.toggleMenu = function () {
        $rootScope.$broadcast("toggleMenu");
    };

    $scope.logout = function () {
        Auth.logout();
        $location.path("login");
    };

    $scope.goBack = function () {
        window.history.back();
    };
    $scope.goBackState = function () {
        $state.go($scope.previousState, $scope.previousStateParams);
    };

    $scope.goTo = function (url) {
        $location.path(url);
    };

    $scope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
        if (fromState.name !== "" && fromState.name.indexOf("admin.") !== 0) {
            $scope.backState = fromState.url;
            $scope.previousState = fromState.name;
            $scope.previousStateParams = fromParams;
        }
    });
});
