"use strict";

angular
    .module("abuseApp")
    .controller("DashboardCtrl", function ($scope, Reports, Tickets, Defendant, Status, Categories, Toast, Auth, NewsFeed, $mdDialog, $state, $stateParams, $q, $interval, $window, $timeout) {

        var dashboard = this;
        dashboard.tickets = [];
        dashboard.news = [];
        dashboard.filters = $stateParams.filters || {};
        dashboard.sortBy = { field: "modificationDate", order:  -1 };
        dashboard.updateSnoozeProgressionInterval = null;
        dashboard.ceil = Math.ceil;

        dashboard.pagination = {
            escalated: {
                currentPage : parseInt($stateParams.page) || 1,
                resultsPerPage : 10
            },
            moderated: {
                currentPage : parseInt($stateParams.page) || 1,
                resultsPerPage : 10
            },
            top20: {
                report: {
                    currentPage: 1,
                    resultsPerPage: 10
                },
                ticket: {
                    currentPage: 1,
                    resultsPerPage: 10
                }
            }
        };

        dashboard.paginationNews =  {
            currentPage: 1,
            resultsPerPage: 5
        };

        dashboard.loaders = {
            init: false,
            status: false,
            tickets : false,
            categories: false,
            activities: false,
            stats: false,
            news: false,
            ticketsEscalated: false,
            ticketsModerated: false,
            top20: false
        };

        dashboard.init = function () {
            dashboard.loaders.init = true;

            $q.all([
                dashboard.getStats(),
                dashboard.getStatus(),
                dashboard.getCategories(),
                dashboard.getNews(),
                dashboard.getTicketsEscalated(),
                dashboard.getTicketsModerated(),
                dashboard.getTopDefendants()
            ]).then(function () {

                $timeout(function () {
                    $($window).resize();
                }, 700);

                var colors = {
                    idle:    ["#8BC34A", "#03A9F4", "#673AB7", "#FFC107", "#FF9800", "#795548", "#607D8B", "#F44336", "#CDDC39"],
                    pending: ["#558B2F", "#0277BD", "#4527A0", "#FF8F00", "#EF6C00", "#4E342E", "#37474F", "#C62828", "#9E9D24"],
                    waiting: ["#AED581", "#4FC3F7", "#9575CD", "#FFD54F", "#FFB74D", "#A1887F", "#90A4AE", "#E57373", "#DCE775"]
                };

                dashboard.chartTicketsByCategories = {
                    options: {
                        exporting: {
                            enabled: false
                        },
                        chart: {
                            type: "column"
                        },
                        plotOptions: {
                            column: {
                                stacking: "normal",
                                dataLabels: {
                                    enabled: true,
                                    formatter: function () {
                                        // Do not display useless 0 labels
                                        return (this.y > 0) ? this.y : "";
                                    },
                                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || "white",
                                    style: {
                                        textShadow: "0 0 3px black"
                                    }
                                }
                            }
                        }
                    },
                    xAxis: {
                        categories: dashboard.stats.categories
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: "Nb tickets"
                        },
                        stackLabels: {
                            enabled: true,
                            style: {
                                fontWeight: "bold",
                                color: (Highcharts.theme && Highcharts.theme.textColor) || "gray"
                            }
                        }
                    },
                    title: {
                        text: "Tickets repartition per categories"
                    },
                    series: Object.keys(dashboard.stats.ticketsByCategory).map(function (k) {
                        // Rebuild data array setting differents colors by category and nuances for series
                        var data = [];
                        for (var i in dashboard.stats.ticketsByCategory[k]) {
                            data.push({ y: dashboard.stats.ticketsByCategory[k][i], color: colors[k][i] });
                        }
                        return { name: k, data : data };
                    }),
                    loading: dashboard.loaders.stats
                };

                // Charts Reports
                dashboard.reportsChart = {
                    options: {
                        exporting: {
                            enabled: false
                        },
                        chart: {
                            type: "pie"
                        },
                        tooltip: {
                            headerFormat: "<span style=\"font-size:11px\">{series.name}</span><br/>",
                            pointFormat: "<span style=\"color:{point.color}\">{point.name}</span> : <b>{point.y}</b><br/>"
                        }
                    },
                    series: [{
                        name: "Reports",
                        data: Object.keys(dashboard.stats.reportsByStatus).map(function (k) {
                            return [k, dashboard.stats.reportsByStatus[k]];
                        })
                    }],
                    title: {
                        text: "Reports repartition per status"
                    },
                    loading: false
                };

                // Charts Ticket
                dashboard.ticketsChart = {
                    options: {
                        exporting: {
                            enabled: false
                        },
                        chart: {
                            type: "pie"
                        },
                        tooltip: {
                            headerFormat: "<span style=\"font-size:11px\">{series.name}</span><br/>",
                            pointFormat: "<span style=\"color:{point.color}\">{point.name}</span> : <b>{point.y}</b><br/>"
                        }
                    },
                    series: [{
                        name: "Tickets",
                        data: Object.keys(dashboard.stats.ticketsByStatus).map(function (k) {
                            return [k, dashboard.stats.ticketsByStatus[k]];
                        })
                    }],
                    title: {
                        text: "Tickets repartition per status"
                    },
                    loading: false
                };
            }, function (err) {
                Toast.error(err);
            })["finally"](function () {
                dashboard.loaders.init = false;
            });
        };

        dashboard.getStatus = function () {
            dashboard.loaders.status = true;
            return Status.query().$promise.then(
                function (status) {
                    dashboard.status = status;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                dashboard.loaders.status = false;
            });
        };

        dashboard.getCategories = function () {
            dashboard.loaders.categories = true;
            return Categories.query().$promise.then(
                function (categories) {
                    dashboard.categories = categories;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                dashboard.loaders.categories = false;
            });
        };

        dashboard.getStats = function () {
            dashboard.loaders.stats = true;

            return Reports.dashboardStats().$promise.then(
                function (stats) {
                    dashboard.stats = stats;
                    //dashboard.stats.ticketsCount = _.reduce(_.values(stats.ticketsByCategory), function (sum, n) {return sum + n; });
                }, function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                dashboard.loaders.stats = false;
            });
        };

        dashboard.getActivities = function () {
            dashboard.loaders.activities = true;
            return Reports.activities().$promise.then(
                function (activities) {
                    dashboard.activities = activities;
                    dashboard.lastActivities = [];
                    activities.forEach(function (act) {
                        dashboard.lastActivities.push({
                            id: act._id,
                            activity: _.max(act.history, function (h) { return new Date(h.date);})
                        });
                    });
                }, function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                dashboard.loaders.activities = false;
            });
        };

        dashboard.getNews = function () {
            dashboard.loaders.news = true;
            return NewsFeed.query({ filters: JSON.stringify({ paginate: dashboard.paginationNews }) }).$promise.then(
                function (news) {
                    dashboard.news = news;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                dashboard.loaders.news = false;
            });
        };

        dashboard.getTicketsEscalated = function () {
            dashboard.loaders.ticketsEscalated = true;
            var sort = {};
            sort[dashboard.sortBy.field] = dashboard.sortBy.order;

            var query = {
                paginate: dashboard.pagination.escalated,
                sortBy: sort,
                queryFields: [
                    "id",
                    "status",
                    "creationDate",
                    "category",
                    "confidential",
                    "priority",
                    "modificationDate",
                    "defendant",
                    "snoozeDuration",
                    "snoozeStart",
                    "escalated"
                ],
                where: { in: [{ escalated: [true] }] }
            };

            Tickets.query({ filters: JSON.stringify(query) }).$promise.then(
                function (tickets) {
                    dashboard.ticketsEscalated = tickets;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                dashboard.loaders.ticketsEscalated = false;
            });

            Tickets.query({ filters: JSON.stringify({
                sortBy: sort,
                queryFields: [
                    "id"
                ],
                where: { in: [{ escalated: [true] }] }
            }) }).$promise.then(
                function (tickets) {
                    dashboard.ticketsEscalatedCount = tickets.length;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                dashboard.loaders.ticketsEscalated = false;
            });

        };

        dashboard.getTicketsModerated = function () {
            dashboard.loaders.ticketsModerated = true;
            var sort = {};
            sort[dashboard.sortBy.field] = dashboard.sortBy.order;

            var query = {
                paginate: dashboard.pagination.moderated,
                sortBy: sort,
                queryFields: [
                    "id",
                    "status",
                    "creationDate",
                    "category",
                    "confidential",
                    "priority",
                    "modificationDate",
                    "defendant",
                    "snoozeDuration",
                    "snoozeStart",
                    "escalated",
                    "moderation"
                ],
                where: { in: [{ moderation: [true] }] }
            };

            Tickets.query({ filters: JSON.stringify(query) }).$promise.then(
                function (tickets) {
                    dashboard.ticketsModerated = tickets;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                dashboard.loaders.ticketsModerated = false;
            });

            Tickets.query({ filters: JSON.stringify({
                sortBy: sort,
                queryFields: [
                    "id"
                ],
                where: { in: [{ moderation: [true] }] }
            }) }).$promise.then(
                function (tickets) {
                    dashboard.ticketsModeratedCount = tickets.length;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                dashboard.loaders.ticketsModerated = false;
            });
        };

        dashboard.getMyTickets = function () {
            dashboard.loaders.tickets = true;
            var sort = {};
            sort[dashboard.sortBy.field] = dashboard.sortBy.order;

            var query = {
                paginate: dashboard.pagination,
                sortBy: sort,
                queryFields: [
                    "id",
                    "status",
                    "creationDate",
                    "category",
                    "confidential",
                    "priority",
                    "modificationDate",
                    "defendant",
                    "snoozeDuration",
                    "snoozeStart"
                ],
                where: {}
            };

            if (dashboard.filters.status) {
                if (!query.where.in) {
                    query.where.in = [];
                }
                query.where.in.push({ status: [dashboard.filters.status] });
            }

            if (dashboard.filters.category) {
                if (!query.where.in) {
                    query.where.in = [];
                }
                query.where.in.push({ category: [dashboard.filters.category] });
            }

            if (dashboard.filters.customerId) {
                if (!query.where.like) {
                    query.where.like = [];
                }
                query.where.like.push({ defendantEmail: [dashboard.filters.customerId] });
            }

            if (dashboard.filters.id) {
                if (!query.where.in) {
                    query.where.in = [];
                }
                query.where.in.push({ id: [dashboard.filters.id] });
            }

            Tickets.getMyTickets({ filters: JSON.stringify(query) }).$promise.then(
                function (tickets) {
                    dashboard.tickets = tickets;
                    dashboard.updateSnoozeProgression();

                    if (dashboard.updateSnoozeProgressionInterval) {
                        $interval.cancel(dashboard.updateSnoozeProgressionInterval);
                    }
                    dashboard.updateSnoozeProgressionInterval = $interval(dashboard.updateSnoozeProgression, 60000);
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                dashboard.loaders.tickets = false;
            });
        };

        dashboard.updateSnoozeProgression = function () {
            dashboard.tickets.forEach(function (ticket) {
                if (ticket.snoozeStart && ticket.snoozeDuration) {
                    var dateEnd = moment(ticket.snoozeStart).add(ticket.snoozeDuration, "h");
                    ticket.snoozeProgress = Math.min(Math.round((ticket.snoozeDuration - dateEnd.diff(moment(), "h", true)) / ticket.snoozeDuration * 100), 100);
                }
            });
        };

        dashboard.getTopDefendants = function () {
            dashboard.loaders.top20 = true;
            return Defendant.mostNoisy().$promise.then(
                function (results) {
                    dashboard.top20 = results;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                dashboard.loaders.top20 = false;
            });
        };

        dashboard.getTop20Page = function (what) {
            var startIndex = (dashboard.pagination.top20[what].currentPage - 1) * dashboard.pagination.top20[what].resultsPerPage;
            var endIndex = startIndex + dashboard.pagination.top20[what].resultsPerPage;

            return dashboard.top20[what].filter(function (current, index) {
                return index >= startIndex && index < endIndex;
            });
        };

        dashboard.searchByDefendant = function (what, customerId) {
            return ["search?filters=", JSON.stringify({ type: what, customerId: customerId })].join("");
        };

        dashboard.filter = function () {
            dashboard.pagination.currentPage = 1;
            dashboard.tickets = [];
            dashboard.getMyTickets();
        };

        dashboard.searchByCategory = function (category) {
            return ["search?filters=", JSON.stringify({ category: category })].join("");
        };

        dashboard.searchMyTickets = function () {
            return ["search?filters=", JSON.stringify({ treatedBy: Auth.getCurrentUser().username })].join("");
        };

        dashboard.canEditNews = function (news) {
            return Auth.getCurrentUser().username === news.author || Auth.isAdmin();
        };

        dashboard.getElapsedTime = function (news) {
            var now = new Date();
            return new Date(now - (news.date * 1000));
        };

        dashboard.isNewsRecent = function (news) {
            return dashboard.getElapsedTime(news).getUTCDate() <= 1;
        };

        dashboard.getFormattedElapsedTime = function (news) {
            var elapsed = dashboard.getElapsedTime(news);
            var result;

            if (dashboard.isNewsRecent(news)) {
                var hours = elapsed.getUTCHours();
                if (hours === 0) {
                    result = "A few minutes";
                } else {
                    result = elapsed.getUTCHours() + "h";
                }
            } else {
                result = elapsed.getUTCDate() + "d";
            }

            return result;
        };

        dashboard.showDialogAddNews = function (ev) {
            $mdDialog.show({
                controller: "DialogNewsAddCtrl",
                templateUrl: "components/news/dialog-news-add/dialog-news-add.html",
                targetEvent: ev
            }).then(function (news) {
                dashboard.news.news.push(news);
            }, function () {

            });
        };

        dashboard.showDialogDeleteNews = function (ev, news) {
            $mdDialog.show({
                controller: "DialogNewsDeleteCtrl",
                templateUrl: "components/news/dialog-news-delete/dialog-news-delete.html",
                targetEvent: ev,
                locals: { news: news }
            }).then(function () {
                _.remove(dashboard.news.news, news);
            }, function () {

            });
        };

        dashboard.showDialogEditNews = function (ev, news) {
            var oldNews = angular.copy(news);
            $mdDialog.show({
                controller: "DialogNewsEditCtrl",
                templateUrl: "components/news/dialog-news-edit/dialog-news-edit.html",
                targetEvent: ev,
                locals: { news: news }
            }).then(function () {

            }, function () {
                dashboard.news.news = dashboard.news.news.map(function (n) {
                    return (n === news) ? oldNews : n;
                });
            });
        };

        $scope.$watch(function () {
            return dashboard.filters;
        }, function () {
            if (!angular.equals({}, dashboard.filters)) {
                dashboard.filter();
            }
        }, true);

        dashboard.goPage = function (page) {
            dashboard.pagination.currentPage = page;
            dashboard.getMyTickets();
        };

        $scope.$on("$destroy", function () {
            if (dashboard.updateSnoozeProgressionInterval) {
                $interval.cancel(dashboard.updateSnoozeProgressionInterval);
            }

        });
    });
