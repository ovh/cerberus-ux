"use strict";

angular.module("abuseApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("report", {
                abstract: true,
                url: "/report/{id:int}",
                templateUrl: "app/reports/report.html",
                authenticate : true,
                controller: "ReportCtrl",
                controllerAs : "ctrl"
            }).state("report.content", {
                url: "/content",
                data: {
                    "selectedTab": 0
                },
                views: {
                    "tab-content": {
                        templateUrl: "app/reports/content/content.html",
                        controller: "ReportContentCtrl",
                        controllerAs: "ctrlContent"
                    }
                }
            }).state("report.services", {
                url: "/services",
                data: {
                    "selectedTab": 1
                },
                views: {
                    "tab-services": {
                        templateUrl: "components/services/services.html",
                        controller: "ServicesCtrl",
                        controllerAs: "ctrlServices"
                    }
                }
            }).state("report.history", {
                url: "/history",
                data: {
                    "selectedTab": 2
                },
                views: {
                    "tab-history": {
                        templateUrl: "app/reports/history/history.html",
                        controller: "ReportHistoryCtrl",
                        controllerAs: "ctrlHistory"
                    }
                }
            });
    });
