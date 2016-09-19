angular
    .module("abuseApp")
    .controller("ReportCtrl", function ($rootScope, $scope, $stateParams, Reports, Tickets, Defendant, Tags, Toast, Categories, Status, User, $mdDialog, Auth, Stats, Search, $state, $timeout, $q) {
        "use strict";
        var ctrl = this;
        ctrl.state = $state;

        ctrl.loaders = {
            init: false,
            report: false,
            services: false,
            categories: false,
            status: false,
            reportsHistoryForDefenfant: false
        };

        ctrl.init = function () {
            ctrl.loaders.init = true;
            $q.all([
                ctrl.getReport(),
                ctrl.getUsers(),
                ctrl.getCategories(),
                ctrl.getStatus(),
                ctrl.getTags(),
                ctrl.getReportCount()
            ]).then(function () {
                var stats = arguments[0][5];

                var query = {
                    paginate: { resultsPerPage: stats.reportsCount, currentPage: 1 },
                    queryFields: ["id"],
                    where: { in : [{ status: ["New", "Attached", "Validated", "ToValidate"] }] }
                };
                Reports.query({ filters: JSON.stringify(query) }).$promise.then(
                    function (reportIds) {

                        var ids = reportIds.map(function (rIds) {
                            return rIds.id;
                        });
                        var i = ids.indexOf(ctrl.report.id);
                        if (i - 1 >= 0) {
                            ctrl.prevReportId = ids[i - 1];
                        }
                        if (i + 1 <= reportIds.length) {
                            ctrl.nextReportId = ids[i + 1];
                        }
                    },
                    function (err) {
                        Toast.error(err);
                    }
                )["finally"](function () {
                    ctrl.loaders.reports = false;
                });

                if (!ctrl.report.ticket && ctrl.report.defendant) {
                    query = {
                        queryFields: ["id"], where: { in: [
                            { category: [ctrl.report.category] },
                            { defendantCustomerId: [ctrl.report.defendant.customerId] },
                            { service: [ctrl.report.service.id] }
                        ] }
                    };
                    Tickets.query({ filters: JSON.stringify(query) }).$promise.then(function (ticket) {
                        ctrl.hasMatchTicketToAttach = ticket.length  === 1;
                    });
                }
                ctrl.loaders.init = false;

            }, function (err) {
                Toast.error(err);
            });

        };

        ctrl.getUsers = function () {
            ctrl.loaders.users = true;

            return User.query({}).$promise.then(
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

        ctrl.getReport = function () {
            ctrl.loaders.report = true;

            return Reports.get({ Id: $stateParams.id }).$promise.then(
                function (report) {
                    ctrl.report = report;
                    if (ctrl.report.defendant) {
                        ctrl.report.defendant.creationDate = moment(ctrl.report.defendant.creationDate, "DD/MM/YY");
                    }
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.report = false;
            });
        };

        ctrl.getReportCount = function () {
            var query = {
                paginate: { resultsPerPage: 0, currentPage: 1 }
            };

            return Search.query({ filters: JSON.stringify(query) }).$promise;
        };

        ctrl.getCategories = function () {
            ctrl.loaders.categories = true;
            return Categories.query().$promise.then(
                function (categories) {
                    ctrl.categories = categories.map(function (c) {
                        return {
                            label: c.label,
                            name: c.name,
                            description: c.description
                        };
                    });
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.categories = false;
            });
        };

        ctrl.getStatus = function () {
            ctrl.loaders.status = true;
            return Status.getReport().$promise.then(
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

        ctrl.createTicket = function () {
            var r = angular.copy(ctrl.report);
            delete r.items;
            Tickets.save(r).$promise.then(
                function () {
                    Toast.success("Ticket created successfully");
                    ctrl.getReport().then(function () {
                        if (ctrl.report.ticket) {
                            $state.go("ticket.activities", { id: ctrl.report.ticket });
                        }
                    });
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.updateReport = function () {
            ctrl.loaders.reports = true;

            if (ctrl.report.defendant && ctrl.report.defendant.customerId === "") {
                ctrl.report.defendant = null;
            }
            return Reports.update({ Id: ctrl.report.id }, ctrl.report).$promise.then(
                function (report) {
                    ctrl.report = report;
                    $rootScope.$broadcast("ticketsOrReportsUpdated");
                    Toast.success("Report updated successfully");
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.reports = false;
            });
        };

        ctrl.showDialogDefendantComment = function (ev) {
            $mdDialog.show({
                controller: "ReportCommentCtrl",
                templateUrl: "components/comments/add/comments-add.html",
                targetEvent: ev,
                locals: { defaultText: "" }
            }).then(function (comment) {
                Defendant.addComment({ id: ctrl.report.defendant.id }, { comment: comment }).$promise.then(
                    function (result) {
                        if (!Array.isArray(ctrl.report.defendant.comments)) {
                            ctrl.report.defendant.comments = [];
                        }

                        // Push front
                        ctrl.report.defendant.comments.splice(0, 0, result);
                        Toast.success("Comment has successfully been added.");
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );
            });
        };

        ctrl.showDialogEditDefendantComment = function (ev, comment) {
            $mdDialog.show({
                controller: "ReportCommentCtrl",
                templateUrl: "components/comments/add/comments-add.html",
                targetEvent: ev,
                locals: { defaultText: comment.comment }
            }).then(function (content) {
                Defendant.updateComment({ id: ctrl.report.defendant.id, idComment: comment.id }, { comment: content }).$promise.then(
                    function () {
                        comment.comment = content;
                        Toast.success("Comment has successfully been added.");
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );
            });
        };

        ctrl.removeDefendantComment = function (comment) {
            Defendant.deleteComment({ id: ctrl.report.defendant.id, idComment: comment.id }).$promise.then(
                function () {
                    Toast.success("Comment has been successfully removed.");
                    // Remove comment from the list
                    var index = ctrl.report.defendant.comments.indexOf(comment);
                    ctrl.report.defendant.comments.splice(index, 1);
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.showStatusButton = function (status) {
            if (status.label === "Attached") {
                return !ctrl.report.ticket && ctrl.hasMatchTicketToAttach;
            }

            return status.label !== ctrl.report.status;
        };

        ctrl.updateDefendantComment = function () {
            ctrl.loaders.reports = true;

            return Defendant.addComment({ id: ctrl.report.defendant.id }, { comments: ctrl.report.defendant.comments }).$promise.then(
                function () {
                    Toast.success("Ticket updated successfully");
                },
                function (err) {
                    ctrl.init();
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.reports = false;
            });
        };

        /* TAGS */
        ctrl.getTags = function () {
            return Tags.query().$promise.then(
                function (tags) {
                    ctrl.defendantTags = tags.filter(function (tag) { return tag.tagType === "Defendant"; });
                    ctrl.reportTags = tags.filter(function (tag) { return tag.tagType === "Report"; });
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.getMatchingDefendantTags = function (query) {
            return ctrl.defendantTags.filter(function (tag) {
                return ~tag.name.indexOf(query);
            });
        };

        ctrl.addReportTag = function (tag) {
            var tagExists = ctrl.reportTags.filter(function (t) {
                return t.id === tag.id;
            }).length > 0;

            if (tagExists) {
                Reports.addTag({ Id: ctrl.report.id }, tag.toJSON()).$promise.then(
                    function () {
                        Toast.success("Tag added successfully");
                    },
                    function (err) {
                        ctrl.init();
                        Toast.error(err);
                    }
                )["finally"](function () {
                    ctrl.loaders.tickets = false;
                });
            } else {
                Tags.save({ name: tag.name, tagType: "Report" }).$promise.then(function (tagCreated) {
                    ctrl.reportTags.push(tagCreated);
                    ctrl.addReportTag(tagCreated);
                });
            }
        };

        ctrl.removeReportTag = function (tag) {
            Reports.deleteTag({ Id: ctrl.report.id, idTag: tag.id }).$promise.then(
                function () {
                    _.remove(ctrl.report.tags, function (t) {
                        return tag.id === t.id;
                    });
                    Toast.success("Tag removed successfully");
                },
                function (err) {
                    ctrl.init();
                    Toast.error(err);
                }
            );
        };

        ctrl.addDefendantTag = function (tag) {
            var tagExists = ctrl.defendantTags.filter(function (t) {
                return t.id === tag.id;
            }).length > 0;

            if (tagExists) {
                Defendant.addTag({ id: ctrl.report.defendant.id }, tag.toJSON()).$promise.then(
                    function () {
                        Toast.success("Tag added successfully");
                    },
                    function (err) {
                        ctrl.init();
                        Toast.error(err);
                    }
                );
            } else {
                Tags.save({ name: tag.name, tagType: "Defendant" }).$promise.then(function (tagCreated) {
                    ctrl.defendantTags.push(tagCreated);
                    ctrl.addDefendantTag(tagCreated);
                });
            }
        };

        ctrl.removeDefendantTag = function (tag) {
            Defendant.deleteTag({ id: ctrl.report.defendant.id, idTag: tag.id }).$promise.then(
                function () {
                    _.remove(ctrl.report.defendant.tags, function (t) {
                        return tag.id === t.id;
                    });
                    Toast.success("Tag removed successfully");
                },
                function (err) {
                    ctrl.init();
                    Toast.error(err);
                }
            );
        };

        ctrl.showDialogDetachDefendant = function (ev) {
            $mdDialog.show({
                controller: "DetachDefendantCtrl",
                templateUrl: "app/tickets/detach-defendant/detach-defendant.html",
                targetEvent: ev,
                locals: { ticket: ctrl.report }
            }).then(function () {
                ctrl.report.defendant = null;
                ctrl.updateReport().then(function () {
                    ctrl.init();
                });
            });
        };
    });
