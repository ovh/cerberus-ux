"use strict";

angular
    .module("abuseApp")
    .controller("SearchCtrl", function ($scope, Reports, Tickets, Status, Categories, Providers, Priorities, $location, Toast, Auth, User, Search, $q, Tags, $mdDialog) {
        var ctrl = this;

        ctrl.markupQL = [
            "assignee",
            "category",
            "ip",
            "priority",
            "provider",
            "status",
            "url"
        ];

        ctrl.loaders = {
            search : false,
            status: false,
            categories: false,
            providers: false
        };

        ctrl.showSearchForm = true;
        ctrl.filters = {};
        ctrl.currentPage = parseInt($location.search().page, 10) || 1;
        ctrl.resultsPerPage = 10;
        ctrl.showFilters = true;
        ctrl.sortBy = { field: "creationDate", order:  1 };
        ctrl.round = Math.round;
        ctrl.ceil = Math.ceil;
        ctrl.filtersExpanded = true;
        ctrl.providerCount = 0;
        ctrl.searchText = "";
        ctrl.ql = "";

        ctrl.selectedItems = [];
        ctrl.bulk = {};

        function readFiltersFromUrl () {
            if ($location.search() && $location.search().filters) {
                try {
                    ctrl.filters = JSON.parse($location.search().filters);
                    if (!ctrl.filters.type) {
                        ctrl.filters.type = "tickets";
                    }
                } catch (err) {
                    Toast.error(err);
                }
            } else {
                ctrl.filters.type = "tickets";
            }
        }

        ctrl.init = function () {
            $q.all([
                ctrl.getCategories(),
                ctrl.getPriorities(),
                ctrl.getUsers(),
                ctrl.getTags(),
                ctrl.getProviderCount()
            ]).then(function () {
                readFiltersFromUrl();
                ctrl.currentPage = parseInt($location.search().page) || 1;
            });
        };

        ctrl.getStatus = function () {
            ctrl.loaders.status = true;
            ctrl.status = [];
            var promise = Status.query().$promise;

            if (ctrl.filters.type === "tickets") {
                promise = Status.getTicket().$promise;
            } else {
                promise = Status.getReport().$promise;
            }

            return promise.then(
                function (status) {
                    ctrl.status = status;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.status = false;
            });
        };

        ctrl.getCategories = function () {
            ctrl.loaders.categories = true;
            return Categories.query().$promise.then(
                function (categories) {
                    ctrl.categories = categories;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.categories = false;
            });
        };

        ctrl.getUsers = function () {
            ctrl.loaders.users = true;
            return User.query().$promise.then(
                function (users) {
                    ctrl.users = users;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.users = false;
            });
        };

        ctrl.getPriorities = function () {
            ctrl.loaders.priorities = true;
            return Priorities.getTickets().$promise.then(
                function (priorities) {
                    ctrl.priorities = priorities;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.priorities = false;
            });
        };

        ctrl.getTags = function () {
            return Tags.query().$promise.then(
                function (tags) {
                    ctrl.defendantTags = tags.filter(function (tag) { return tag.tagType === "Defendant"; });
                    ctrl.reportTags = tags.filter(function (tag) { return tag.tagType === "Report"; });

                    // Note: both ticket and report tags are available for tickets.
                    ctrl.ticketTags = tags.filter(function (tag) { return ~["Ticket", "Report"].indexOf(tag.tagType); });
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.searchTextChange = function () {
            if (!ctrl.searchText) {
                delete ctrl.filters.providers;
                ctrl.searchReports();
            }
        };

        ctrl.getProviderCount = function () {
            var query = {
                paginate: { resultsPerPage: 0, currentPage: 1 }
            };

            return Providers.query({ filters: JSON.stringify(query) }).$promise.then(
                function (providers) {
                    ctrl.providerCount = providers.providersCount;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.querySearchProvider = function (searchTextProvider) {
            if (searchTextProvider.length < 3) {
                return [];
            }

            ctrl.loaders.reports = true;
            var query = {
                paginate: { resultsPerPage: ctrl.providerCount, currentPage: 1 },
                queryFields: ["email", "trusted"],
                where: {
                    like: [{ email: [searchTextProvider] }]
                }
            };
            return Providers.query({ filters: JSON.stringify(query) }).$promise.then(
                function (providers) {
                    return providers.providers;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.reports = false;
            });
        };

        ctrl.hasActiveFilters = function () {
            var filtersCopy = angular.copy(ctrl.filters);
            delete filtersCopy.type;
            return ctrl.filters && !angular.equals({}, filtersCopy);
        };

        ctrl.search = function () {
            if (!ctrl.filters.status) {
                ctrl.filters.status = ctrl.status
                    .map(function (status) {
                        return status.label;
                    })
                    .filter(function (status) {
                        return !~["Closed", "Archived"].indexOf(status);
                    });
            }

            ctrl.selectAll = false;
            ctrl.selectedItems = [];
            ctrl.resetBulkFields();
            switch (ctrl.filters.type) {
            case "tickets":
                ctrl.searchTickets();
                break;
            case "reports":
                ctrl.searchReports();
                break;
            default:
                ctrl.searchTickets();
            }
        };

        ctrl.searchTickets = function () {
            ctrl.loaders.search = true;
            $location.search("page", ctrl.currentPage);
            var sort = {};
            sort[ctrl.sortBy.field] = ctrl.sortBy.order;

            var query = {
                paginate: {
                    resultsPerPage: ctrl.resultsPerPage,
                    currentPage: ctrl.currentPage || 1
                },
                where: { },
                queryFields: [
                    "id",
                    "publicId",
                    "creationDate",
                    "modificationDate",
                    "priority",
                    "defendant",
                    "confidential",
                    "treatedBy",
                    "status",
                    "category",
                    "service",
                    "escalated",
                    "moderation"
                ],
                sortBy: sort
            };

            if (ctrl.filters.ticketIds) {
                if (!query.where.like) {
                    query.where.like = [];
                }
                query.where.like.push({ ticketIds: [ctrl.filters.ticketIds.toUpperCase()] });
            } else {
                delete ctrl.filters.ticketIds;
            }

            ctrl.appendQuery(query, "in", "alarm", { alarm: [ctrl.filters.alarm] });
            ctrl.appendQuery(query, "in", "confidential", { confidential: [ctrl.filters.confidential] });
            ctrl.appendQuery(query, "in", "priority", { priority: [ctrl.filters.priority] });
            ctrl.appendQuery(query, "in", "ticketTag", { ticketTag: [ctrl.filters.ticketTag] });

            if (ctrl.filters.hasOwnProperty("moderation") && ctrl.filters.moderation === true) {
                if (!query.where.in) {
                    query.where.in = [];
                }
                query.where.in.push({ moderation: [true] });
            } else {
                delete ctrl.filters.moderation;
            }

            if (ctrl.filters.hasOwnProperty("escalated") && ctrl.filters.escalated === true) {
                if (!query.where.in) {
                    query.where.in = [];
                }
                query.where.in.push({ escalated: [true] });
            } else {
                delete ctrl.filters.escalated;
            }

            if (ctrl.filters.treatedBy) {
                if (!query.where.in) {
                    query.where.in = [];
                }

                var value = ctrl.filters.treatedBy;
                if (ctrl.filters.treatedBy === "unassigned") {
                    value = null;
                }

                query.where.in.push({ treatedBy: [value] });
            } else {
                delete ctrl.filters.treatedBy;
            }

            ctrl.buildCommonQuery(query);

            Search.query({ filters: JSON.stringify(query) }).$promise.then(
                function (results) {
                    ctrl.results = results;
                    $location.search("filters", JSON.stringify(ctrl.filters));
                    ctrl.currentPage = $location.search().page;

                    ctrl.results.tickets.forEach(function (ticket) {
                        Tickets.getItems({ Id: ticket.id }).$promise.then(
                            function (items) {
                                ticket.items = items;
                            },
                            function (err) {
                                Toast.error(err);
                            }
                        );
                    });

                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.search = false;
            });
        };

        ctrl.searchReports = function () {
            ctrl.loaders.search = true;
            $location.search("page", ctrl.currentPage);
            var sort = {};
            sort[ctrl.sortBy.field] = ctrl.sortBy.order;
            var query = {
                paginate: {
                    resultsPerPage: ctrl.resultsPerPage,
                    currentPage: ctrl.currentPage || 1
                },
                where: {},
                queryFields: [
                    "id",
                    "receivedDate",
                    "defendant",
                    "status",
                    "category",
                    "ticket",
                    "provider",
                    "reportMedia",
                    "subject",
                    "body",
                    "service"
                ],
                sortBy: sort
            };

            if (ctrl.filters.id && parseInt(ctrl.filters.id, 10)) {
                if (!query.where.in) {
                    query.where.in = [];
                }
                query.where.in.push({ id: [parseInt(ctrl.filters.id, 10)] });
            } else {
                delete ctrl.filters.id;
            }

            ctrl.appendQuery(query, "like", "subject", { subject: [ctrl.filters.subject] });
            ctrl.appendQuery(query, "in", "notAttached", { ticket: [null] });
            ctrl.appendQuery(query, "in", "reportTag", { reportTag: [ctrl.filters.reportTag] });

            ctrl.buildCommonQuery(query);

            Search.query({ filters: JSON.stringify(query) }).$promise.then(
                function (results) {
                    ctrl.results = results;
                    $location.search("filters", JSON.stringify(ctrl.filters));
                    ctrl.currentPage = $location.search().page;

                    ctrl.results.reports.forEach(function (report) {
                        Reports.getItems({ Id: report.id }).$promise.then(
                            function (items) {
                                report.items = items;
                            },
                            function (err) {
                                Toast.error(err);
                            }
                        );
                    });
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.search = false;
            });
        };

        ctrl.buildCommonQuery = function (query) {
            ctrl.appendQuery(query, "like", "fulltext", { fulltext: [ctrl.filters.fulltext] });
            ctrl.appendQuery(query, "like", "searchText", { body: [ctrl.filters.searchText] });
            ctrl.appendQuery(query, "like", "customerId", { defendant: [ctrl.filters.customerId] });
            ctrl.appendQuery(query, "like", "ip", { item: [ctrl.filters.ip] });
            ctrl.appendQuery(query, "in", "category", { category: ctrl.filters.category });
            ctrl.appendQuery(query, "in", "defendantTag", { defendantTag: [ctrl.filters.defendantTag] });

            if (ctrl.filters.status && ctrl.filters.status.length > 0) {
                if (!query.where.in) {
                    query.where.in = [];
                }
                query.where.in.push({ status: Array.isArray(ctrl.filters.status) ? ctrl.filters.status : [ctrl.filters.status] });
            } else {
                delete ctrl.filters.status;
            }

            if (ctrl.filters.providers) {
                if (!query.where.in) {
                    query.where.in = [];
                }
                query.where.in.push({ providerEmail: [ctrl.filters.providers.email] });
            } else {
                delete ctrl.filters.providers;
            }
        };

        ctrl.appendQuery = function (query, op, filter, obj) {
            if (ctrl.filters[filter]) {
                if (!query.where[op]) {
                    query.where[op] = [];
                }
                query.where[op].push(obj);
            } else {
                delete ctrl.filters[filter];
            }
        };

        ctrl.getElapsedTime = function (ticket) {
            var result;
            var now = new Date();
            var elapsed = Math.abs(now - ticket.modificationDate * 1000) / 1000;

            if (elapsed < 3600) {
                result = "A few hours";
            } else {
                result = parseInt(elapsed / 3600) + "h";
            }

            return result + " ago";
        };

        ctrl.selectAllResults = function () {
            var items = (ctrl.results.tickets || ctrl.results.reports);

            ctrl.selectedItems = [];
            items.forEach(function (item) {
                item.selected = ctrl.selectAll;
                if (ctrl.selectAll) {
                    ctrl.selectedItems.push(item.id);
                }
            });

            // Flush bulk actions if deselect all
            if (!ctrl.selectAll) {
                ctrl.resetBulkFields();
            }
        };

        ctrl.selectResultItem = function (item) {
            var index = ctrl.selectedItems.indexOf(item.id);
            if (~index) {
                ctrl.selectedItems.splice(index, 1);
            } else {
                ctrl.selectedItems.push(item.id);
            }

            // No selected items anymore => flush bulk actions
            if (ctrl.selectedItems.length === 0) {
                ctrl.resetBulkFields();
            }
        };

        ctrl.getBulkAllowedStatus = function () {
            return ctrl.status.filter(function (el) {
                return ~["Closed", "Paused", "Alarm", "Reopened"].indexOf(el.label);
            });
        };

        ctrl.resetBulkFields = function () {
            ctrl.bulk = {};
        };

        ctrl.saveBulk = function (ev) {
            var confirm = $mdDialog.confirm()
                .title("Are you sure to update all these " + ctrl.selectedItems.length + " tickets?")
                .ok("Yes I am")
                .cancel("No, forget about it")
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function () {
                var saveCallback = function (bulkObject) {
                    Tickets.bulk({}, { tickets: ctrl.selectedItems, properties: bulkObject }).$promise.then(
                        function () {
                            Toast.success(ctrl.selectedItems.length + " ticket(s) successfully updated.");
                            ctrl.search();
                        },
                        function (err) {
                            Toast.error(err);
                        }
                    );
                };

                if (ctrl.bulk.status === "Paused") {
                    var dummyTicket = {};
                    dummyTicket.pauseDuration = 0;

                    $mdDialog.show({
                        controller: "PauseDelayCtrl",
                        templateUrl: "app/tickets/pause-delay/pause-delay.html",
                        targetEvent: ev,
                        locals: { ticket: dummyTicket }
                    }).then(
                        function (duration) {
                            ctrl.bulk.pauseDuration = duration;
                            saveCallback(ctrl.bulk);
                        }
                    );

                    return;
                } else if (ctrl.bulk.status === "Alarm") {
                    ctrl.bulk.alarm = true;
                    ctrl.bulk.status = "Unpaused";
                } else if (ctrl.bulk.status === "Closed") {
                    $mdDialog.show({
                        controller: "TicketResolutionCtrl",
                        templateUrl: "app/tickets/ticket-resolution/ticket-resolution.html",
                        targetEvent: ev
                    }).then(
                        function (data) {
                            ctrl.bulk.resolution = data.resolution;
                            saveCallback(ctrl.bulk);
                        }
                    );

                    return;
                }

                saveCallback(ctrl.bulk);
            });
        };

        $scope.$watchCollection(function () {
            return $location.search().filters;
        }, function (newVal, oldVal) {

            if (newVal === oldVal) {
                return;
            }

            readFiltersFromUrl();
        });

        $scope.$watchCollection(function () {
            return ctrl.filters;
        }, function (newVal, oldVal) {
            if (newVal === oldVal) {
                return;
            }

            // Clear input on new search if no suggestion chosen
            if (ctrl.searchText && !ctrl.filters.providers) {
                ctrl.searchText = "";
            }

            if (newVal && oldVal && newVal.type !== oldVal.type) {
                if (!angular.equals(oldVal, {})) {
                    ctrl.filters.status = undefined;
                    delete ctrl.filters.status;
                }

                ctrl.currentReportPage = 1;
                ctrl.currentPage = 1;
                ctrl.getStatus()
                    .then(ctrl.search);
            } else {
                ctrl.search();
            }
        });
    });
