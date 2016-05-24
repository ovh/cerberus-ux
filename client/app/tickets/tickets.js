"use strict";

angular.module("abuseApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("ticket", {
                abstract: true,
                url: "/ticket/{id:int}",
                templateUrl: "app/tickets/ticket.html",
                controller: "TicketCtrl",
                controllerAs: "ctrl",
                authenticate: true
            }).state("ticket.activities", {
                url: "/activities",
                data: {
                    "selectedTab": 0
                },
                views: {
                    "tab-activities": {
                        templateUrl: "app/tickets/activities/activities.html",
                        controller: "TicketActivitiesCtrl",
                        controllerAs: "ctrlActivities"
                    }
                }
            }).state("ticket.comments", {
                url: "/comments",
                data: {
                    "selectedTab": 1
                },
                views: {
                    "tab-comments": {
                        templateUrl: "components/comments/comments.html",
                        controller: "CommentsCtrl",
                        controllerAs: "ctrlComments"
                    }
                }
            }).state("ticket.reports", {
                url: "/reports",
                data: {
                    "selectedTab": 2
                },
                views: {
                    "tab-reports": {
                        templateUrl: "app/tickets/reports/reports.html",
                        controller: "TicketReportsCtrl",
                        controllerAs: "ctrlReports"
                    }
                }
            }).state("ticket.services", {
                url: "/services",
                data: {
                    "selectedTab": 3
                },
                views: {
                    "tab-services": {
                        templateUrl: "components/services/services.html",
                        controller: "ServicesCtrl",
                        controllerAs: "ctrlServices"
                    }
                }
            }).state("ticket.history", {
                url: "/history",
                data: {
                    "selectedTab": 4
                },
                views: {
                    "tab-history": {
                        templateUrl: "app/tickets/history/history.html",
                        controller: "TicketHistoryCtrl",
                        controllerAs: "ctrlHistory"
                    }
                }
            }).state("ticket.proofs", {
                url: "/proofs",
                data: {
                    "selectedTab": 5
                },
                views: {
                    "tab-proofs": {
                        templateUrl: "app/tickets/proofs/proofs.html",
                        controller: "TicketProofsCtrl",
                        controllerAs: "ctrlProofs"
                    }
                }
            }).state("ticket.emails", {
                url: "/emails",
                data: {
                    "selectedTab": 6
                },
                views: {
                    "tab-emails": {
                        templateUrl: "app/tickets/emails/emails.html",
                        controller: "TicketEmailsCtrl",
                        controllerAs: "ctrlEmails"
                    }
                }
            });
    });
