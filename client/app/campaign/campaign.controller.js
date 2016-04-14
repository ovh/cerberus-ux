"use strict";

angular
    .module("abuseApp")
    .controller("CampaignCtrl", function ($scope, Toast, $q, $mdDialog, Categories, EmailTemplates, Campaign, Search) {

        var ctrl = this;

        ctrl.view = "history";

        ctrl.loaders = {
            init: false,
            newForm: false
        };

        ctrl.init = function () {
            ctrl.loaders.init = true;

            ctrl.getCampaign().then(function () {

                // For each campaign, retrieve tickets count
                ctrl.campaigns.forEach(function (el) {
                    ctrl.getTicketsCount(el);
                });

                ctrl.loaders.init = false;
            });
        };

        ctrl.getCampaign = function () {
            var query = {
                sortBy: { date: -1 }
            };

            return Campaign.query({ filters: query }).$promise.then(
                function (campaigns) {
                    ctrl.campaigns = campaigns;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.getTicketsCount = function (campaign) {
            var query = {
                paginate: {
                    resultsPerPage: 0
                },
                where: {
                    in: [{ ticketTag: [campaign.campaignName] }]
                },
                queryFields: ["id"]
            };

            Search.query({ filters: query }).$promise.then(
                function (result) {
                    campaign.ticketsCount = result.ticketsCount;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.getCategories = function () {
            return Categories.query().$promise.then(
                function (categories) {
                    ctrl.categories = categories;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.getCampaignTemplate = function () {
            var filter = {
                where: {
                    in: [{ "codename": ["mass_contact"] }]
                }
            };

            return EmailTemplates.query({ filters: filter }).$promise.then(
                function (template) {
                    if (template.length !== 1) {
                        Toast.error("A single template is required to use this feature.");
                        return;
                    }

                    ctrl.template = template[0];
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.searchTickets = function (campaign) {
            var query = {
                type: "tickets",
                ticketTag: campaign.campaignName,
                status: ["Closed", "Answered", "Reopened", "WaitingAnswer", "Paused", "ActionError"]
            };

            return ["search?filters=", JSON.stringify(query)].join("");
        };

        ctrl.enterIPs = function (ev) {
            var ipsList = [];

            $mdDialog.show({
                controller: "PasteAndParseDialogCtrl",
                templateUrl: "components/paste-and-parse/paste-and-parse.html",
                targetEvent: ev,
                locals: {
                    parsing: function (el) {
                        return validator.isIP(el);
                    },
                    formatting: function (el) {
                        return { item: el, type: "IP" };
                    },
                    processing: function (el) {
                        return $q(function (success) {
                            ipsList.push(el.item);
                            success();
                        });
                    }
                }
            })
            .then(function () {
                // Set final list
                ctrl.campaignDraft.ips = ipsList;
                // Prepare input value
                ctrl.ipsFieldValue = ctrl.campaignDraft.ips.join(" ,");
            });
        };

        ctrl.sendCampaign = function () {
            Campaign.save(ctrl.campaignDraft).$promise.then(
                function (result) {
                    console.log(result);
                    Toast.success("Campaign successfully started.");

                    ctrl.view = "history";
                    ctrl.init();
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        $scope.$watch("ctrl.view", function (newVal) {
            // Reset campaign draft when starting new campaign, and if needed, load data.
            if (newVal === "new") {
                if (!ctrl.categories) {
                    ctrl.loaders.newForm = true;
                    ctrl.ipsFieldValue = "";

                    $q.all([
                        ctrl.getCategories(),
                        ctrl.getCampaignTemplate()
                    ]).then(function () {
                        ctrl.campaignDraft = {
                            ips: [],
                            email: {
                                subject: ctrl.template.subject,
                                body: ctrl.template.body
                            }
                        };

                        ctrl.loaders.newForm = false;
                    });
                } else {
                    ctrl.campaignDraft = {
                        ips: [],
                        email: {
                            subject: ctrl.template.subject,
                            body: ctrl.template.body
                        }
                    };
                }
            }
        });
    });
