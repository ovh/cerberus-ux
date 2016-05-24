"use strict";

angular.module("abuseApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("dashboard", {
                url: "/?filters",
                templateUrl: "app/dashboard/dashboard.html",
                authenticate: true,
                controller: "DashboardCtrl",
                controllerAs : "dashboard",
                reloadOnSearch: false
            });
    });
