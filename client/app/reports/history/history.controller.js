"use strict";

angular
    .module("abuseApp")
    .controller("ReportHistoryCtrl", function ($scope, $stateParams, Reports, Toast, $mdDialog, $q, Stats) {
        var ctrlTabHistory = this;
        ctrlTabHistory.paginationReportsHistory = {
            currentPage : 1,
            resultsPerPage : 10
        };
        ctrlTabHistory.sortBy = { field: "receivedDate", order:  -1 };

        var ctrl = $scope.ctrl;

        ctrlTabHistory.loaders = {
            init: false,
            history: false,
            stats: false,
            reportsHistoryForDefenfant: false
        };

        ctrlTabHistory.chartConfigAllQueues = {
            options: {
                exporting: {
                    enabled: false
                },
                chart: {
                    type: "line"
                }
            },
            xAxis: {
                type: "datetime",
                dateTimeLabelFormats: {
                    day: "%b %e %Y"
                },
                title: {
                    text: "Date"
                }
            },
            yAxis: {
                allowDecimals: false,
                title: {
                    text: "Nb reports"
                },
                min: 0
            },

            loading: ctrlTabHistory.loaders.stats
        };

        ctrlTabHistory.init = function () {
            ctrlTabHistory.loaders.init = true;

            if (ctrl.report && ctrl.report.defendant && ctrl.report.defendant.customerId) {
                $q.all([
                    ctrlTabHistory.getReportsHistoryForDefenfant(),
                    ctrlTabHistory.getAbuseHistory()
                ]).then(function () {
                    ctrlTabHistory.chartConfigAllQueues.title = {
                        text: ["Abuse history for ", ctrl.report.defendant.customerId].join("")
                    };

                    ctrlTabHistory.loaders.init = false;
                });
            }
        };

        ctrlTabHistory.getReportsHistoryForDefenfant = function () {

            if (!ctrl.report.defendant) {
                return;
            }
            ctrlTabHistory.loaders.reportsHistoryForDefenfant = true;
            var sort = {};
            sort[ctrlTabHistory.sortBy.field] = ctrlTabHistory.sortBy.order;

            var query = {
                paginate: ctrlTabHistory.paginationReportsHistory,
                sortBy: sort,
                queryFields: [
                    "id",
                    "status",
                    "receivedDate",
                    "category",
                    "provider",
                    "defendant"
                ],
                where: { in: [{ defendantEmail: [ctrl.report.defendant.email] }] }
            };

            $q.all([
                Reports.query({ filters: JSON.stringify(query) }).$promise,
                Reports.query({ filters: JSON.stringify({
                    queryFields: [
                        "id"
                    ],
                    where: { in: [{ defendantEmail: [ctrl.report.defendant.email] }] }
                }) }).$promise,
            ]).then(
                function (data) {

                    ctrlTabHistory.reportsHistoryForDefenfant = data[0].filter(function (report) {
                        return report.id !== ctrl.report.id;
                    });
                    ctrlTabHistory.reportsHistoryForDefenfantCount = data[1].length - 1;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrlTabHistory.loaders.reportsHistoryForDefenfant = false;
            });
        };

        ctrlTabHistory.getAbuseHistory = function () {
            ctrlTabHistory.loaders.stats = true;
            return Stats.reports({ customerId: ctrl.report.defendant.customerId }).$promise.then(
                function (stats) {
                    ctrlTabHistory.chartConfigAllQueues.series = stats;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrlTabHistory.loaders.stats = false;
            });
        };
    });
