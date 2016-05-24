"use strict";

angular
    .module("abuseApp")
    .controller("ReportContentCtrl", function ($scope, $stateParams, Reports, Toast, $mdDialog, $q, $http, URLS) {
        var ctrlTabContent = this;
        ctrlTabContent.showRaw = false;
        ctrlTabContent.showDehtmlify = false;
        ctrlTabContent.currentPageItems = 1;
        ctrlTabContent.resultsItemsPerPage = 5;
        ctrlTabContent.round = Math.round;
        var ctrl = $scope.ctrl;

        ctrlTabContent.loaders = {
            init: false,
            report: false,
            services: false,
            categories: false,
            status: false,
            stats: false,
            reportsHistoryForDefenfant: false
        };

        ctrlTabContent.init = function () {
            ctrlTabContent.loaders.init = true;
            $q.all([
                ctrlTabContent.getReportAttachments()
            ]).then(function () {
                ctrlTabContent.loaders.init = false;
            });
        };

        ctrlTabContent.getReportAttachments = function () {
            return Reports.attachments({ Id: ctrl.report.id }).$promise.then(
                function (attachments) {
                    ctrl.report.attachments = attachments.map(function (attachment) {
                        attachment.url = [URLS.API, "reports", ctrl.report.id, "attachments", attachment.id].join("/");
                        return attachment;
                    });
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrlTabContent.showRawEmail = function () {
            if (!ctrl.report.raw) {
                Reports.raw({ Id: ctrl.report.id }).$promise.then(
                    function (data) {
                        ctrl.report.raw = data.raw;
                        ctrlTabContent.showRaw = true;
                        ctrlTabContent.showDehtmlify = false;
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );
            } else {
                ctrlTabContent.showRaw = true;
                ctrlTabContent.showDehtmlify = false;
            }
        };

        ctrlTabContent.showDehtmlifyEmail = function () {
            if (!ctrl.report.dehtmlify) {
                Reports.dehtmlify({ Id: ctrl.report.id }).$promise.then(
                    function (data) {
                        ctrl.report.dehtmlify = data.dehtmlify;
                        ctrlTabContent.showDehtmlify = true;
                        ctrlTabContent.showRaw = false;
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );
            } else {
                ctrlTabContent.showDehtmlify = true;
                ctrlTabContent.showRaw = false;
            }
        };

        ctrlTabContent.downloadAttach = function (attachment) {
            ctrlTabContent.loaders.downloadAttach = true;
            $http.get([URLS.API, "reports", ctrl.report.id, "attachments", attachment.id].join("/"), {
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
                ctrlTabContent.loaders.downloadAttach = false;
            });
        };

        ctrlTabContent.showDialogReputation = function (ev, item) {
            $mdDialog.show({
                controller: "ReputationDialogCtrl",
                templateUrl: "app/tickets/reputation-dialog/reputation-dialog.html",
                targetEvent: ev,
                locals: { item: item }
            });
        };

    });
