/*global angular*/
"use strict";

angular.module("abuseApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("admin", {
                abstract: true,
                url: "/admin",
                templateUrl: "app/admin/admin.html",
                controller: "AdminCtrl",
                controllerAs: "ctrl",
                authenticate: true,
                admin: true
            }).state("admin.people", {
                url: "/people",
                data: {
                    "selectedTab": 0
                },
                views: {
                    "tab-people": {
                        templateUrl: "app/admin/people/people.html",
                        controller: "PeopleCtrl",
                        controllerAs: "ctrlPeople"
                    }
                }
            }).state("admin.category", {
                url: "/category",
                data: {
                    "selectedTab": 1
                },
                views: {
                    "tab-categories": {
                        templateUrl: "app/admin/categories/categories.html",
                        controller: "CategoriesCtrl",
                        controllerAs: "ctrlCategories"
                    }
                }
            }).state("admin.providers", {
                url: "/sources",
                data: {
                    "selectedTab": 2
                },
                views: {
                    "tab-providers": {
                        templateUrl: "app/admin/providers/providers.html",
                        controller: "ProvidersCtrl",
                        controllerAs: "ctrlProviders"
                    }
                }
            }).state("admin.tags", {
                url: "/tags",
                data: {
                    "selectedTab": 3
                },
                views: {
                    "tab-tags": {
                        templateUrl: "app/admin/tags/tags.html",
                        controller: "TagsCtrl",
                        controllerAs: "ctrlTags"
                    }
                }
            }).state("admin.emails", {
                url: "/emails",
                data: {
                    "selectedTab": 4
                },
                views: {
                    "tab-emails": {
                        templateUrl: "app/admin/emails/emails.html",
                        controller: "EmailsCtrl",
                        controllerAs: "ctrlEmails"
                    }
                }
            }).state("admin.resolutions", {
                url: "/resolutions",
                data: {
                    "selectedTab": 5
                },
                views: {
                    "tab-resolutions": {
                        templateUrl: "app/admin/resolutions/resolutions.html",
                        controller: "ResolutionsCtrl",
                        controllerAs: "ctrlResolutions"
                    }
                }
            }).state("admin.presets", {
                url: "/presets",
                data: {
                    "selectedTab": 6
                },
                views: {
                    "tab-presets": {
                        templateUrl: "app/admin/presets/presets.html",
                        controller: "PresetsCtrl",
                        controllerAs: "ctrlPresets"
                    }
                }
            }).state("admin.thresholds", {
                url: "/thresholds",
                data: {
                    "selectedTab": 7
                },
                views: {
                    "tab-thresholds": {
                        templateUrl: "app/admin/thresholds/thresholds.html",
                        controller: "ThresholdsCtrl",
                        controllerAs: "ctrlThresholds"
                    }
                }
            }).state("adminUserEdit", {
                url: "/admin/people/edit/:userId",
                templateUrl: "app/admin/people/edit/user-edit.html",
                controller: "AdminUserEditCtrl",
                controllerAs: "ctrl",
                authenticate: true,
                admin: true
            });
    });
