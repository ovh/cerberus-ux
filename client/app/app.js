"use strict";

angular.module("abuseApp", [
    "angularMoment",
    "bw.paging",
    "cfp.hotkeys",
    "dndLists",
    "focus-if",
    "highcharts-ng",
    "LocalStorageModule",
    "ngAnimate",
    "ngCookies",
    "ngMaterial",
    "ngMessages",
    "ngResource",
    "ngSanitize",
    "ngTagsInput",
    "timer",
    "ui.router",
    "xeditable"
])
.config(function ($urlRouterProvider, html5BasePathProvider, $locationProvider) {
    $urlRouterProvider.otherwise("/");

    html5BasePathProvider.addTag();
    $locationProvider.html5Mode(true);
});
