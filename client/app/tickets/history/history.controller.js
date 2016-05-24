"use strict";

angular
    .module("abuseApp")
    .controller("TicketHistoryCtrl", function ($scope, Tickets, Toast, $q, Stats) {
        var ctrlHistory = this;

        ctrlHistory.paginationTicketsHistory = {
            currentPage : 1,
            resultsPerPage : 10
        };
        ctrlHistory.sortBy = { field: "modificationDate", order:  -1 };

        var ctrl = $scope.ctrl;

        ctrlHistory.loaders = {
            init: false,
            history: false,
            stats: false,
            reportsHistoryForDefenfant: false
        };

        ctrlHistory.chartConfigAllQueues = {
            options: {
                exporting: {
                    enabled: false
                },
                chart: {
                    type: "line"
                }
            },
            rangeSelector : {
                selected : 1
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
                    text: "Nb tickets"
                },
                min: 0
            },
            title: {
                x: -20
            },
            loading: ctrlHistory.loaders.stats
        };

        ctrlHistory.chartConfigAllQueuesReports = {
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
            title: {
                x: -20
            },
            loading: ctrlHistory.loaders.stats
        };

        ctrlHistory.init = function () {
            ctrlHistory.loaders.init = true;

            if (ctrl.ticket && ctrl.ticket.defendant && ctrl.ticket.defendant.customerId) {
                $q.all([
                    ctrlHistory.getTicketsHistoryForDefenfant(),
                    ctrlHistory.getAbuseHistory(),
                    ctrlHistory.getStats()
                ]).then(function () {

                    ctrlHistory.chartConfigAllQueues.title = {
                        text: ["Abuse tickets history for ", ctrl.ticket.defendant.customerId].join("")
                    };
                    ctrlHistory.chartConfigAllQueuesReports.title = {
                        text: ["Abuse reports history for ", ctrl.ticket.defendant.customerId].join("")
                    };

                    ctrlHistory.loaders.init = false;
                });
            }
        };

        ctrlHistory.getStats = function () {
            ctrlHistory.loaders.stats = true;

            return Stats.tickets({ customerId: ctrl.ticket.defendant.customerId }).$promise.then(
                function (stats) {
                    ctrlHistory.chartConfigAllQueues.series = stats.map(function (s) {
                        s.toJSON().data.forEach(function (d) {
                            var date =  moment(d[0]).toDate();
                            d[0] = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
                        });
                        return s.toJSON();
                    });
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrlHistory.loaders.stats = false;
            });
        };

        ctrlHistory.getTicketsHistoryForDefenfant = function () {
            if (!ctrl.ticket.defendant) {
                return;
            }
            ctrlHistory.loaders.ticketsHistoryForDefenfant = true;
            var sort = {};
            sort[ctrlHistory.sortBy.field] = ctrlHistory.sortBy.order;

            var query = {
                paginate: ctrlHistory.paginationTicketsHistory,
                sortBy: sort,
                queryFields: [
                    "id",
                    "status",
                    "creationDate",
                    "category",
                    "confidential",
                    "priority",
                    "modificationDate",
                    "defendant"
                ],
                where: { in: [
                    { defendantEmail: [ctrl.ticket.defendant.email] }
                ] }
            };

            $q.all([
                Tickets.query({ filters: JSON.stringify(query) }).$promise,
                Tickets.query({ filters: JSON.stringify({
                    queryFields: [
                        "id"
                    ],
                    where: { in: [
                        { defendantEmail: [ctrl.ticket.defendant.email] }
                    ] }
                }) }).$promise,
            ]).then(
                function (data) {
                    ctrlHistory.ticketsHistoryForDefenfant = data[0].filter(function (ticket) {
                        return ticket.id !== ctrl.ticket.id;
                    });

                    ctrlHistory.ticketsHistoryForDefenfantCount = data[1].length - 1;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrlHistory.loaders.ticketsHistoryForDefenfant = false;
            });
        };

        ctrlHistory.getAbuseHistory = function () {
            ctrlHistory.loaders.stats = true;
            return Stats.reports({ customerId: ctrl.ticket.defendant.customerId }).$promise.then(
                function (stats) {
                    ctrlHistory.chartConfigAllQueuesReports.series = stats;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrlHistory.loaders.stats = false;
            });
        };

    });
