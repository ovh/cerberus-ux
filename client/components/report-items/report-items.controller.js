"use strict";

angular
    .module("abuseApp")
    .controller("ReportItemsCtrl", function ($scope, Tickets, Reports, Auth, Toast, Reputation, $q, URLS, $http, $mdDialog, $stateParams) {

        var ctrlItems = this;
        $scope.ctrlItems = ctrlItems;

        var parentName = "";
        ctrlItems.rbl = {};
        ctrlItems.internal = {};
        ctrlItems.external = {};
        ctrlItems.tools = {};
        ctrlItems.checks = {};

        ctrlItems.loaders = {
            init: false,
            items: false
        };

        // Ticket tab controller
        if ($scope.ctrlReports) {
            ctrlItems.rootCtrl = $scope.ctrlReports;
            parentName = "ticket";
        } else {
            // Report controller handles report data
            ctrlItems.rootCtrl = $scope.ctrlContent;
            parentName = "report";
        }

        ctrlItems.init = function () {
            ctrlItems.loaders.init = true;
            $q.all([
                ctrlItems.getItems()
            ]).then(function () {
                ctrlItems.loaders.init = false;
            });
        };

        ctrlItems.getService = function () {
            return (parentName === "ticket" ? Tickets : Reports);
        };

        ctrlItems.getReputation = function (ip) {
            if (ctrlItems.rbl[ip]) {
                return;
            }

            Reputation.getRbl({ip: ip}).$promise.then(
                function (data) {
                    ctrlItems.rbl[ip] = data;
                },
                function (err) {
                    Toast.error(err);
                }
            );

            Reputation.getInternal({ip: ip}).$promise.then(
                function (data) {
                    ctrlItems.internal[ip] = data;
                },
                function (err) {
                    Toast.error(err);
                }
            );

            Reputation.getExternal({ip: ip}).$promise.then(
                function (data) {
                    ctrlItems.external[ip] = data;
                },
                function (err) {
                    Toast.error(err);
                }
            );

            Reputation.getTools({ip: ip}).$promise.then(
                function (data) {
                    ctrlItems.tools[ip] = data;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrlItems.checkURL = function (url) {
            if (ctrlItems.checks[url]) {
                return;
            }

            Reputation.getURLChecks({}, {url: url}).$promise.then(
                function (data) {
                    ctrlItems.checks[url] = data;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrlItems.getItems = function () {
            ctrlItems.loaders.items = true;

            var filters = {
                paginate: {
                    currentPage: ctrlItems.rootCtrl.currentPageItems,
                    resultsPerPage: ctrlItems.rootCtrl.resultsItemsPerPage
                }
            };

            if (!!ctrlItems.txtFilterItems) {
                filters.where = {
                    like: [{rawItem : [ctrlItems.txtFilterItems]}]
                };
            }

            return ctrlItems.getService().getItems({Id: $stateParams.id, filters: JSON.stringify(filters)}).$promise.then(
                function (items) {
                    ctrlItems.items = items;
                    ctrlItems.items.items.forEach(function (item) {

                        if (item.itemType === "URL") {
                            ctrlItems.checkURL(item.rawItem);
                        }

                        angular.forEach(item.history, function (current) {
                            current.ip = (current.ip || current.fqdnResolved);

                            if (current.ip && current.ipCategory === "managed") {
                                ctrlItems.getReputation(current.ip);
                            }
                        });
                    });
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrlItems.loaders.items = false;
            });
        };

        ctrlItems.isReputationClean = function (what, ip) {
            return  _.find(ctrlItems[what][ip], function (element) {
                return element.result === true || element.result > 0;
            }) === undefined;
        };

        ctrlItems.showDialogReputation = function (ev, item, source) {
            var id = ($scope.ctrl.ticket ? $scope.ctrl.ticket.id : null);
            $mdDialog.show({
                controller: "ReputationDialogCtrl",
                templateUrl: "app/tickets/reputation-dialog/reputation-dialog.html",
                targetEvent: ev,
                locals: {item: item, source: source, ticketId: id}
            });
        };

        ctrlItems.showDialogPasteAndParse = function (ev) {
            $mdDialog.show({
                controller: "PasteAndParseDialogCtrl",
                templateUrl: "components/paste-and-parse/paste-and-parse.html",
                targetEvent: ev,
                locals: {
                    parsing: function (el) {
                        return validator.isIP(el) || validator.isURL(el) || validator.isFQDN(el);
                    },
                    formatting: function (el) {
                        var result = {item: el};
                        if (validator.isIP(el)) {
                            result.type = "IP";
                        } else if (validator.isURL(el)) {
                            result.type = "URL";
                        } else if (validator.isFQDN(el)) {
                            result.type = "FQDN";
                        }

                        return result;
                    },
                    processing: function (el) {
                        var id = ($scope.ctrl.ticket ? $scope.ctrl.ticket.reports[0].id : $scope.ctrl.report.id);

                        var item = {
                            rawItem: el.item,
                            itemType: el.type,
                            report: id
                        };

                        return Reports.createItem({Id: id}, item).$promise;
                    }
                }
            })
                .then(function () {
                    ctrlItems.loaders.items = true;
                    ctrlItems.init();
                });
        };

        ctrlItems.removeReportItem = function (item) {
            ctrlItems.loaders.items = true;
            Reports.deleteItem({Id: item.report, itemId: item.id}).$promise.then(
                function () {
                    ctrlItems.items =  {
                        items: ctrlItems.items.items.filter(function (it) {
                            return it.id !== item.id;
                        }),
                        itemsCount : ctrlItems.items.itemsCount -1
                    };
                    Toast.success("Item removed successfully");
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrlItems.loaders.items = false;
            });
        };

        ctrlItems.updateReportItem = function (item) {
            ctrlItems.loaders.items = true;

            var id = ($scope.ctrl.ticket ? $scope.ctrl.ticket.id : $scope.ctrl.report.id);
            ctrlItems.getService().updateItem({Id: id, itemId: item.id}, item).$promise.then(
                function (data) {
                    item = data;
                    Toast.success("Item updated successfully");
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrlItems.loaders.items = false;
            });
        };

        ctrlItems.addNewReportItemMode = function () {
            ctrlItems.newItem = {
                itemType: "None",
                rawItem: "Enter value"
            };
            ctrlItems.addItemMode = true;
        };

        ctrlItems.addNewReportItem = function () {

            if (!ctrlItems.newItem) {
                return;
            }

            var isOk = true;
            switch(ctrlItems.newItem.itemType) {
            case "IP":
                isOk = validator.isIP(ctrlItems.newItem.rawItem);
                break;
            case "URL":
                isOk = validator.isURL(ctrlItems.newItem.rawItem);
                break;
            case "FQDN":
                isOk = validator.isFQDN(ctrlItems.newItem.rawItem);
                break;
            }

            if (!isOk) {
                Toast.error({message: "The item type is wrong"});
                return;
            }

            ctrlItems.loaders.items = true;

            var id = ($scope.ctrl.ticket ? $scope.ctrl.ticket.reports[0].id : $scope.ctrl.report.id);
            Reports.createItem({Id: id}, ctrlItems.newItem).$promise.then(
                function () {
                    Toast.success("Item added successfully");
                    ctrlItems.newItem = null;
                    ctrlItems.addItemMode = false;
                    ctrlItems.init();

                    // If no defendant, get ticket one more time to refresh defendant part.
                    if ($scope.ctrl.ticket && !$scope.ctrl.ticket.defendant) {
                        Tickets.get({Id: $stateParams.id}).$promise.then(
                            function (ticket) {
                                $scope.ctrl.ticket = ticket;
                            }
                        );
                    }
                    // Do the same for reports
                    else if ($scope.ctrl.report && !$scope.ctrl.report.defendant) {
                        Reports.get({Id: $stateParams.id}).$promise.then(
                            function (report) {
                                $scope.ctrl.report = report;
                            }
                        );
                    }
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrlItems.loaders.items = false;
            });
        };

        ctrlItems.rootCtrl.addReportItem = function (report) {

            if (!window.getSelection().toString()) {
                return;
            }

            var selectedText = window.getSelection().toString().trim(),
            promises = [];

            selectedText.split("\n").forEach(function (txtItem) {
                txtItem = txtItem.trim().replace(/\[\.\]/g, ".").replace(/hxxp/i,"http").replace(/httpx/i,"https").replace(/\s/g,"");

                var itemType = "";

                if (validator.isIP(txtItem)) {
                    itemType = "IP";
                }
                else if (validator.isURL(txtItem)) {
                    itemType = "URL";
                }
                else if (validator.isFQDN(txtItem)) {
                    itemType = "FQDN";
                }
                else {
                    Toast.error({message: "Unable to determine the type of item"});
                    return;
                }

                var item = {
                    rawItem: txtItem,
                    itemType: itemType,
                    report: report.id
                };
                promises.push(Reports.createItem({Id: report.id}, item).$promise);

            });

            ctrlItems.loaders.items = true;
            if (promises.length > 0) {
                $q.all(promises).then(
                    function () {
                        Toast.success("Item added successfully");
                        ctrlItems.init();
                    },
                    function (err) {
                        Toast.error(err);
                    }
                )["finally"](function () {
                    ctrlItems.loaders.items = false;
                });
            }
        };
    });
