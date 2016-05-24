"use strict";

angular
    .module("abuseApp")
    .controller("AdminCtrl", function ($state) {

        var ctrl = this;
        ctrl.state = $state;

        ctrl.init = function () {
        };
    });
