"use strict";

angular.module("abuseApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("diaporama", {
                url: "/diaporama",
                templateUrl: "app/diaporama/diaporama.html",
                authenticate: true,
                controller: "DiaporamaCtrl",
                controllerAs: "ctrl"
            });
    });
