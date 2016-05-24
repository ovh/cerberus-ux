/*global angular*/
"use strict";

angular
    .module("abuseApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("login", {
                url: "/login",
                templateUrl: "app/account/login/login.html",
                controller: "LoginCtrl",
                controllerAs: "ctrl"
            });
    });

