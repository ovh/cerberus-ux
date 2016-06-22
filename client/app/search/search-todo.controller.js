"use strict";

angular
    .module("abuseApp")
    .controller("SearchTodoCtrl", function ($scope, Tickets, Status, Categories, Priorities, $location, Toast, User, Search, $q, $mdDialog) {
        var ctrl = this;

        ctrl.loaders = {
            search : false
        };

        ctrl.currentPage = parseInt($location.search().page) || 1;
        ctrl.resultsPerPage = parseInt($location.search().results) || 10;
        ctrl.showSearchForm = false;
        ctrl.onlyUnassigned = $location.search().onlyUnassigned === "true";
        ctrl.round = Math.round;
        ctrl.ceil = Math.ceil;

        ctrl.selectedItems = [];
        ctrl.bulk = {};

        ctrl.init = function () {

            ctrl.loaders.search = true;
            $q.all([
                ctrl.getTodoTickets(),
                ctrl.getStatus(),
                ctrl.getCategories(),
                ctrl.getPriorities(),
                ctrl.getUsers()
            ]).then(function () {
                ctrl.currentPage = parseInt($location.search().page) || 1;
                ctrl.resultsPerPage = parseInt($location.search().results) || 10;
                ctrl.onlyUnassigned = $location.search().onlyUnassigned === "true";
                ctrl.loaders.search = false;
            });
        };

        ctrl.getTodoTickets = function () {

            var queryFilter = {
                paginate: { resultsPerPage: ctrl.resultsPerPage, currentPage: ctrl.currentPage },
                onlyUnassigned: ctrl.onlyUnassigned
            };

            return Search.todoTicketList({ filters: queryFilter }).$promise.then(
                function (results) {
                    ctrl.results = results;
                    $location.search({
                        page: ctrl.currentPage,
                        results: ctrl.resultsPerPage,
                        onlyUnassigned: String(ctrl.onlyUnassigned)
                    });

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
                }, function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.getStatus = function () {
            ctrl.status = [];

            return Status.getTicket().$promise.then(
                function (status) {
                    ctrl.status = status;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.getCategories = function () {
            return Categories.query().$promise.then(
                function (categories) {
                    ctrl.categories = categories;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.getUsers = function () {
            return User.query().$promise.then(
                function (users) {
                    ctrl.users = users;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.getPriorities = function () {
            return Priorities.getTickets().$promise.then(
                function (priorities) {
                    ctrl.priorities = priorities;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.getElapsedTime = function (ticket) {
            var result;
            var now = new Date();
            var elapsed = Math.abs(now - ticket.modificationDate * 1000) / 1000;

            if (elapsed < 3600) {
                result = "A few minutes";
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
                }

                saveCallback(ctrl.bulk);
            });
        };

        ctrl.searchTickets = function () {
            ctrl.getTodoTickets();
        };

        $scope.$watch("ctrl.onlyUnassigned", function () {
            ctrl.getTodoTickets();
        });
    });
