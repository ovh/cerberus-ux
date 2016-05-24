"use strict";

angular
    .module("abuseApp")
    .controller("TicketReportsCtrl", function ($scope, Tickets, Reports, Auth, Toast, Reputation, $q, URLS, $http, $mdDialog, $stateParams, Proofs) {
        var ctrlReports = this,
            ctrl = $scope.ctrl;

        ctrlReports.round = Math.round;
        ctrlReports.currentReportPage = parseInt($stateParams.page) || 1;
        ctrlReports.currentPageItems = 1;
        ctrlReports.reportResultsPerPage = 5;
        ctrlReports.resultsItemsPerPage = 5;
        ctrlReports.showRaw = false;
        ctrlReports.showDehtmlify = false;

        var rxSblRemoval = /<mailto:sbl-removals@spamhaus\.org\?Subject=(.*)>/;

        ctrlReports.loaders = {
            init: false,
            reports: false,
            downloadAttach: false
        };

        ctrlReports.init = function () {
            ctrlReports.loaders.init = true;
            $q.all([
                ctrlReports.getReports()
            ])["finally"](function () {
                ctrlReports.loaders.init = false;
            });
        };

        ctrlReports.getReports = function () {
            ctrlReports.loaders.reports = true;

            var query = {
                paginate: {
                    resultsPerPage: ctrlReports.reportResultsPerPage,
                    currentPage: ctrlReports.currentReportPage
                },
                where: { in : [{ ticket: [ctrl.ticket.id] }] }
            };

            Reports.query({ filters: JSON.stringify(query) }).$promise.then(
                function (reports) {
                    var reportsCount = reports.length;

                    ctrl.ticket.reports = reports;
                    ctrl.ticket.reports.forEach(function (report) {
                        if (report.provider.email === "notification@spamhaus.org") {
                            if (report.body.match(rxSblRemoval)[1]) {
                                report.sblRemoval = {
                                    subject: report.body.match(rxSblRemoval)[1],
                                    to: "sbl-removals@spamhaus.org"
                                };
                            }
                        }

                        Reports.getItems({ Id: report.id }).$promise.then(
                            function (items) {
                                report.items = items;
                            },
                            function (err) {
                                Toast.error(err);
                            }
                        )["finally"](function () {
                            // Reports are loading until all items have been loaded.
                            reportsCount--;
                            ctrlReports.loaders.reports = !!reportsCount;
                        });
                    });
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrlReports.getReportAttachments = function (report) {
            return Reports.attachments({ Id: report.id }).$promise.then(
                function (attachments) {
                    report.attachments = attachments.map(function (attachment) {
                        attachment.url = [URLS.API, "reports", report.id, "attachments", attachment.id].join("/");
                        return attachment;
                    });
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrlReports.downloadAttach = function (report, attachment) {
            ctrlReports.loaders.downloadAttach = true;
            $http.get([URLS.API, "reports", report.id, "attachments", attachment.id].join("/"), {
                headers: {
                    "Content-Type": attachment.filetype
                }
            }).then(
                function (data) {
                    var hiddenElement = document.createElement("a");
                    hiddenElement.href = "data:" + attachment.filetype  + ";base64," + data.data;
                    hiddenElement.target = "_blank";
                    hiddenElement.download = attachment.filename;
                    document.body.appendChild(hiddenElement);
                    hiddenElement.click();
                    document.body.removeChild(hiddenElement);
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrlReports.loaders.downloadAttach = false;
            });
        };

        ctrlReports.showRawEmail = function (report) {
            if (!report.raw) {
                Reports.raw({ Id: report.id }).$promise.then(
                    function (data) {
                        report.raw = data.raw;
                        ctrlReports.showRaw = true;
                        ctrlReports.showDehtmlify = false;
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );
            } else {
                ctrlReports.showRaw = true;
                ctrlReports.showDehtmlify = false;
            }
        };

        ctrlReports.showDehtmlifyEmail = function (report) {
            if (!report.dehtmlify) {
                Reports.dehtmlify({ Id: report.id }).$promise.then(
                    function (data) {
                        report.dehtmlify = data.dehtmlify;
                        ctrlReports.showDehtmlify = true;
                        ctrlReports.showRaw = false;
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );
            } else {
                ctrlReports.showDehtmlify = true;
                ctrlReports.showRaw = false;
            }
        };

        ctrlReports.detachReport = function (report) {
            var detach = function () {
                report.status = "New";
                return Reports.update({ Id: report.id }, report).$promise.then(
                    function () {
                        ctrl.ticket.reports = ctrl.ticket.reports.filter(function (r) {
                            return r.id !== report.id;
                        });
                        Toast.success("Report detached successfully");
                    },
                    function (err) {
                        Toast.error(err);
                    }
                )["finally"](function () {
                    ctrl.loaders.reports = false;
                });
            };

            if (ctrl.ticket.attachedReportsCount > 1) {
                detach();
            } else {
                var alert = $mdDialog.confirm({
                    title: "Delete ticket",
                    content: [
                        "This is the only report attached to this ticket.",
                        "If you detach this report, the ticket will be deleted."
                    ].join(" "),
                    ok: "OK",
                    cancel: "Cancel"
                });
                $mdDialog
                    .show(alert)
                    .then(function (confirm) {
                        if (confirm) {
                            detach().then(function () {});
                        }
                    });
            }
        };

        ctrl.showDialogSblRemoval = function (report, ev) {
            $mdDialog.show({
                controller: "InteractDialogCtrl",
                templateUrl: "app/tickets/interact-dialog/interact-dialog.html",
                targetEvent: ev,
                locals: {
                    ticket: ctrl.ticket,
                    nextTicketId: ctrl.nextTicketId,
                    options: {
                        preset: "sbl_removal",
                        other: report.sblRemoval,
                        defaultView: "preview"
                    }
                }
            }).then(function () {
                ctrl.init();
            });
        };

        ctrlReports.addProof = function (report, field) {
            if (!window.getSelection().toString()) {
                return;
            }

            var proof = {
                content : window.getSelection().toString().trim()
            };

            if (~window.navigator.userAgent.search(/Firefox/i)) {
                // In Firefox, that"s not as easy...
                // => https://www.w3.org/Bugs/Public/show_bug.cgi?id=10583
                // FF DOM component trims every spaces and line feed and that makes poor proof.
                // So, retrieve thoses proofs using regex from original mail body.

                // Escape original caracters that might damage final regex
                var regex = proof.content.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
                // Replace every space by a class of spaces or line feed that can occurs several times.
                regex = regex.replace(/ /g, "[ \\r\\n]+");
                // Try to match this regex over the original string
                var match = report[field].match("(" + regex + ")");
                if (!match || match.length < 2) {
                    return;
                }
                proof.content = match[1];
            }

            Proofs.save({ ticketId: ctrl.ticket.id }, proof).$promise.then(
                function (data) {
                    ctrl.getProofs();
                    Toast.success(data.message);
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

    });
