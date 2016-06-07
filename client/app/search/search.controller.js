"use strict";

angular
    .module("abuseApp")
    .controller("SearchCtrl", function ($scope, Reports, Tickets, Status, Categories, Providers, Priorities, $location, Toast, Auth, User, Search, $q, Tags, $mdDialog, localStorageService, SEARCH) {
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
        ctrl.sortBy = { field: "creationDate", order:  -1 };
        ctrl.round = Math.round;
        ctrl.ceil = Math.ceil;
        ctrl.providerCount = 0;
        ctrl.searchText = "";
        ctrl.ql = "";
        ctrl.bookmarkedSearch = {};

        ctrl.selectedItems = [];
        ctrl.bulk = {};

        function readFiltersFromUrl () {
            if ($location.search() && $location.search().filters) {
                try {
                    ctrl.filters = JSON.parse($location.search().filters);
                    if (!ctrl.filters.type) {
                        ctrl.filters.type = "tickets";
                    }

                    // Force providers to be displayed in md-autocomplete
                    ctrl.searchText = ctrl.filters.providers;
                } catch (err) {
                    Toast.error(err);
                }
            } else {
                ctrl.filters.type = "tickets";
            }
        }

        function readBookmarks () {
            var result;
            try {
                var bookmark = localStorageService.get(SEARCH.BOOKMARK) || "[]";
                result = JSON.parse(bookmark);
            } catch (err) {
                Toast.error("Unable to load bookmarked searches.");
            }

            return result;
        }

        ctrl.init = function () {
            readFiltersFromUrl();

            $q.all([
                ctrl.getCategories(),
                ctrl.getPriorities(),
                ctrl.getUsers(),
                ctrl.getTags(),
                ctrl.getProviderCount(),
                ctrl.getBookmarkedSearch(),
                ctrl.getStatus()
            ]).then(function () {
                ctrl.search();
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

        ctrl.getBookmarkedSearch = function () {
            ctrl.bookmarkedSearch = readBookmarks();
        };

        ctrl.changeSearchType = function (type) {
            // Keep the same filters except the specific ones.
            ctrl.filters.type = type;

            delete ctrl.filters.status;
            if (type === "tickets") {
                delete ctrl.filters.reportTag;
                delete ctrl.filters.notAttached;
                delete ctrl.filters.subject;
            } else {
                delete ctrl.filters.treatedBy;
                delete ctrl.filters.ticketTag;
                delete ctrl.filters.escalated;
                delete ctrl.filters.moderation;
                delete ctrl.filters.confidential;
                delete ctrl.filters.ticketIds;
            }

            // Refresh status since they are different then relaunch the search
            ctrl.getStatus().then(ctrl.search);
        };

        ctrl.searchTextChange = function () {
            if (!ctrl.searchText) {
                delete ctrl.filters.providers;
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
            ctrl.appendQuery(query, "in", "defendantTag", { defendantTag: [ctrl.filters.defendantTag] });
            ctrl.appendQuery(query, "in", "providers", { providerEmail: [ctrl.filters.providers] });

            if (ctrl.filters.category && ctrl.filters.category.length !== 0) {
                ctrl.appendQuery(query, "in", "category", { category: ctrl.filters.category });
            } else {
                delete ctrl.filters.category;
            }

            if (ctrl.filters.status && ctrl.filters.status.length > 0) {
                if (!query.where.in) {
                    query.where.in = [];
                }
                query.where.in.push({ status: Array.isArray(ctrl.filters.status) ? ctrl.filters.status : [ctrl.filters.status] });
            } else {
                delete ctrl.filters.status;
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

        ctrl.saveSearch = function (ev) {
            $mdDialog.show({
                controller: "SearchBookmarkCtrl",
                templateUrl: "app/search/bookmark/bookmark.html",
                targetEvent: ev
            }).then(
                function (data) {
                    var bookmark = readBookmarks();
                    if (!bookmark) {
                        return;
                    }

                    // Check name is not already taken
                    var alreadyExists = false;
                    _.forEach(bookmark, function (current) {
                        if (current.name === data) {
                            alreadyExists = true;
                            return false;
                        }
                    });

                    if (alreadyExists) {
                        Toast.error("A bookmark with this name already exists.");
                        return;
                    }

                    readFiltersFromUrl();
                    bookmark.push({
                        name: data,
                        filters: ctrl.filters
                    });

                    localStorageService.set(SEARCH.BOOKMARK, angular.toJson(bookmark));
                    ctrl.bookmarkedSearch = bookmark;

                    Toast.success("This search has been bookmarked.");
                }
            );
        };

        ctrl.loadSearch = function (bookmark) {
            ctrl.filters = bookmark.filters;
            ctrl.search();

            Toast.success([bookmark.name, " loaded."].join(""));
        };

        ctrl.removeSearch = function (bookmarkToRemove) {
            var bookmark = readBookmarks();
            if (!bookmark) {
                return;
            }

            bookmark = _.filter(bookmark, function (current) {
                return current.name !== bookmarkToRemove.name;
            });

            localStorageService.set(SEARCH.BOOKMARK, angular.toJson(bookmark));
            ctrl.bookmarkedSearch = bookmark;

            Toast.success("Bookmark removed.");
        };

        $scope.$watchCollection(function () {
            return $location.search().filters;
        }, function (newVal, oldVal) {

            if (newVal === oldVal) {
                return;
            }

            readFiltersFromUrl();
        });
    });
