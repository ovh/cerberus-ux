"use strict";

angular.module("abuseApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("campaign", {
                url: "/campaign",
                templateUrl: "app/campaign/campaign.html",
                authenticate: true,
                controller: "CampaignCtrl",
                controllerAs: "ctrl"
            });
    });
