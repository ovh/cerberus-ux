"use strict";

angular
    .module("abuseApp")
    .controller("LoginCtrl", function ($scope, Auth, $location, $window, Toast) {
        var ctrl = this;
        ctrl.loaders = {
            init: false
        };
        ctrl.errors = {};

        ctrl.login = function (form) {
            ctrl.submitted = true;

            if (form.$valid) {
                Auth.login({
                    name: ctrl.user.name,
                    password: ctrl.user.password
                }).then(function () {
                    // Logged in, redirect to the requested page
                    var params = $location.search();
                    if (params && params.url) {
                        $location.url(window.decodeURIComponent(params.url));
                    } else {
                        $location.path("/");
                    }
                })["catch"](function (err) {
                    Toast.error(err);
                });
            }
        };
    });
