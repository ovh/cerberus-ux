"use strict";

angular
    .module("abuseApp")
    .controller("DiaporamaCtrl", function ($scope, $location, Toast, Auth, User, Search, Reports, Defendant, $q, $mdDialog, $state, hotkeys) {
        var ctrl = this;

        ctrl.skippedReports = [];

        ctrl.loaders = {
            init: false,
            screenshots: false,
            defendant: false
        };

        ctrl.init = function () {
            ctrl.loaders.init = true;
            ctrl.loaders.screenshots = true;
            ctrl.loaders.defendant = true;

            ctrl.view = "description";
            ctrl.screenshotPage = 1;
            delete ctrl.currentScreenshot;

            ctrl.getPhishToCheckReports().then(
                function () {
                    if (ctrl.report) {
                        $location.search("report", ctrl.report.id);
                        $q.all([
                            ctrl.getDefendant(),
                            ctrl.getScreenshots(),
                            ctrl.getDehtmlifiedReportBody()
                        ]);
                    }
                }
            )["finally"](function () {
                ctrl.loaders.init = false;
            });
        };

        ctrl.getPhishToCheckReports = function () {
            var queryFilters = {
                paginate: {
                    resultsPerPage: 100,
                    currentPage: 1
                },
                where: {
                    in: [{ status: ["PhishToCheck"] }]
                }
            };

            return Search.query({ filters: queryFilters }).$promise.then(
                function (result) {
                    var urlReport = parseInt($location.search().report);

                    // Remove from result skippedId
                    var reports = result.reports.filter(function (report) {
                        return !~ctrl.skippedReports.indexOf(report.id);
                    });

                    // A reportId is in the URL, check it exists in result. If yes, it means
                    // it has probably been forced and must be displayed.
                    if (urlReport) {
                        var match = false;
                        reports.forEach(function (report) {
                            if (report.id === urlReport) {
                                match = true;

                                ctrl.report = report;
                                ctrl.reportsCount = result.reports.length;

                                return false;
                            }
                        });

                        // If a result matched, dont go further
                        if (match) {
                            return;
                        }
                    }

                    if (reports.length === 0) {
                        delete ctrl.report;
                        ctrl.reportsCount = reports.length;
                        $location.search("report", null);
                        return;
                    }

                    var index = Math.floor(Math.random() * reports.length);

                    ctrl.report = reports[index];
                    ctrl.reportsCount = reports.length;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.getDefendant = function () {
            return Defendant.get({ id: ctrl.report.defendant.id }).$promise.then(
                function (result) {
                    ctrl.report.defendant = result;

                    // Then get tickets/reports count
                    ctrl.getDefendantTicketsAndReportsCount().then(function () {
                        ctrl.loaders.defendant = false;
                    });
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.getDefendantTicketsAndReportsCount = function () {
            var queryFilters = {
                paginate: {
                    resultsPerPage: 0,
                    currentPage: 1
                },
                where: {
                    like: [
                        { defendant: [ctrl.report.defendant.customerId] }
                    ]
                }
            };

            return Search.query({ filters: queryFilters }).$promise.then(
                function (result) {
                    ctrl.report.defendant.ticketsCount = result.ticketsCount;
                    ctrl.report.defendant.reportsCount = result.reportsCount;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.getScreenshots = function () {
            ctrl.loaders.screenshots = true;
            return Reports.screenshots({ Id: ctrl.report.id }).$promise.then(
                function (screenshots) {
                    ctrl.screenshots = screenshots;
                    ctrl.loaders.screenshots = false;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.getDehtmlifiedReportBody = function () {
            return Reports.dehtmlify({ Id: ctrl.report.id }).$promise.then(
                function (body) {
                    ctrl.report.body = body.dehtmlify;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.changeCategory = function (ev) {
            $mdDialog.show({
                controller: "DiaporamaChangeCategoryCtrl",
                templateUrl: "app/diaporama/change-category/change-category.html",
                targetEvent: ev,
                locals: { category: ctrl.report.category }
            }).then(function (newCategory) {
                var toSend = {
                    id: ctrl.report.id,
                    status: newCategory !== "Phishing" ? "New" : "PhishToCheck",
                    category: newCategory
                };

                Reports.update({ Id: ctrl.report.id }, toSend).$promise.then(
                    function () {
                        ctrl.init();
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );
            });
        };

        ctrl.skipReport = function () {
            ctrl.skippedReports.push(ctrl.report.id);
            ctrl.init();
        };

        ctrl.showScreenshot = function (screenshot) {
            ctrl.view = "screenshot";
            ctrl.showHeadersOf = null;

            ctrl.screenshotHistoryIndex = 0;
            ctrl.currentScreenshot = screenshot;
        };

        ctrl.exitScreenshotView = function () {
            ctrl.view = "description";
            delete ctrl.currentScreenshot;
        };

        ctrl.isPhishing = function (userFeedback) {
            ctrl.currentScreenshot.isPhishing = userFeedback;
            if (ctrl.currentScreenshot.screenshots.length > 0) {
                ctrl.currentScreenshot.screenshotId = ctrl.currentScreenshot.screenshots[ctrl.screenshotHistoryIndex].screenshotId;
            } else {
                ctrl.currentScreenshot.screenshotId = null;
            }

            // get next screenshot to display
            var nextScreenshot = null;
            ctrl.screenshots.forEach(function (screenshot) {
                if (typeof(screenshot.isPhishing) === "undefined") {
                    nextScreenshot = screenshot;
                    return false;
                }
            });

            if (nextScreenshot) {
                ctrl.showScreenshot(nextScreenshot);
                return;
            }

            // no screenshot anymore to display, time to push all these data to the server
            ctrl.sendUserFeedback();
        };

        ctrl.sendUserFeedback = function () {
            // Is there at least 1 phishing item?
            var phishingPresent = false;
            var feedbacks = _.chain(ctrl.screenshots)
                .map(function (screenshot) {
                    phishingPresent |= screenshot.isPhishing;

                    return {
                        screenshotId: screenshot.screenshotId,
                        feedback: screenshot.isPhishing
                    };
                })
                .value();

            // Show user a "loading" popup while pushing data
            $mdDialog.show({
                clickOutsideToClose: false,
                template: "<md-dialog>" +
                          "  <md-dialog-content class=\"md-dialog-content\">" +
                          "    <p>" +
                         (phishingPresent ? "At least one item is phishing, report is being automatically processed."
                                          : "No item are phishing, this report will be automatically archived.") +
                          "    </p>" +
                          "    <md-progress-linear md-mode=\"indeterminate\"></md-progress-linear>" +
                          "  </md-dialog-content>" +
                          "</md-dialog>"
            });

            Reports.giveFeedback({ Id: ctrl.report.id }, feedbacks).$promise.then(
                function (result) {
                    Toast.success(result.message);
                    ctrl.init();
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                $mdDialog.hide();
            });
        };

        hotkeys.bindTo($scope).add({
            combo: "y",
            description: "This screenshot is phishing.",
            callback: function () {
                ctrl.view = "screenshot" && ctrl.isPhishing(true);
            }
        }).add({
            combo: "n",
            description: "This screenshot is not phishing.",
            callback: function () {
                ctrl.view = "screenshot" && ctrl.isPhishing(false);
            }
        });
    });
