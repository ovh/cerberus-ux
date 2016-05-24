angular
    .module("abuseApp")
    .controller("TicketCtrl", function ($rootScope, $scope, $stateParams, $location, $state, Tickets, Reports, Defendant, Tags, Toast, Categories, User, $mdDialog, Auth, Priorities, Status, $q, $http, Stats, $window, $timeout, Search, Proofs) {
        "use strict";

        var ctrl = this;
        ctrl.state = $state;

        ctrl.warningMode = false;
        ctrl.showFloatButtonComment = false;

        ctrl.loaders = {
            report: false,
            categories: false,
            priorities: false
        };

        ctrl.selectedTabIndex = 0;

        ctrl.init = function () {

            ctrl.getTicket().then(function () {
                $q.all([
                    ctrl.getUsers(),
                    ctrl.getCategories(),
                    ctrl.getPriorities(),
                    ctrl.getStatus(),
                    ctrl.getProofs(),
                    ctrl.getTags(),
                    ctrl.getReportsProviders(),
                    ctrl.getCustomerTicketCount(),
                    ctrl.getTicketCount()
                ]).then(function () {

                    var queryFilters = {
                        paginate: { resultsPerPage: 250, currentPage: 1 }
                    };

                    Search.todoTicketList({ filters: queryFilters }).$promise.then(
                        function (result) {

                            var ticketIds = result.tickets;
                            var ids = ticketIds.map(function (rIds) {
                                return rIds.id;
                            });

                            var i = ids.indexOf(ctrl.ticket.id);
                            if ((i - 1) >= 0) {
                                ctrl.prevTicketId = ids[i - 1];
                            }

                            if (i + 1 <= ticketIds.length) {
                                ctrl.nextTicketId = ids[i + 1];
                            }
                        },
                        function (err) {
                            Toast.error(err);
                        }
                    )["finally"](function () {
                        ctrl.loaders.reports = false;
                    });
                }, function (err) {
                    Toast.error(err);
                });
            });
        };

        ctrl.getUsers = function () {
            ctrl.loaders.users = true;

            return User.query({}).$promise.then(
                function (users) {
                    ctrl.users = users;
                    ctrl.users.unshift({ username: "nobody" });
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.users = false;
            });
        };

        ctrl.getTicket = function () {
            ctrl.loaders.ticket = true;

            return Tickets.get({ Id: $stateParams.id }).$promise.then(
                function (ticket) {
                    ctrl.ticket = ticket;

                    if (ctrl.ticket.justAssigned) {
                        Toast.success("Ticket assigned to me");
                    }

                    ctrl.ticket.creationDate = new Date(ctrl.ticket.creationDate * 1000);

                    if (ctrl.ticket.defendant) {
                        ctrl.ticket.defendant.creationDate = moment(ctrl.ticket.defendant.creationDate, "DD/MM/YY");
                    }

                    if (ctrl.ticket.snoozeStart) {
                        ctrl.ticket.snoozeStart = new Date(ctrl.ticket.snoozeStart * 1000);
                    }

                    if (ctrl.ticket.pauseStart) {
                        ctrl.ticket.pauseStart = new Date(ctrl.ticket.pauseStart * 1000);
                    }

                    if ((["WaitingAnswer", "Answered"].indexOf(ctrl.ticket.status) !== -1) && ctrl.ticket.snoozeStart && ctrl.ticket.snoozeDuration) {
                        var dateEnd = moment.tz(ctrl.ticket.snoozeStart, "Europe/Paris");
                        dateEnd.add(ctrl.ticket.snoozeDuration, "seconds");
                        ctrl.countdown = dateEnd.diff(moment.tz(new Date().getTime(), "Europe/Paris"), "seconds", true);
                        $scope.$broadcast("timer-set-countdown", ctrl.countdown);
                    }

                    if (ctrl.ticket.status === "Paused" && ctrl.ticket.pauseStart && ctrl.ticket.pauseDuration) {
                        var dateEndPause = moment.tz(ctrl.ticket.pauseStart, "Europe/Paris");
                        dateEndPause.add(ctrl.ticket.pauseDuration, "seconds");
                        ctrl.countdownPaused = dateEndPause.diff(moment.tz(new Date().getTime(), "Europe/Paris"), "seconds", true);
                        $scope.$broadcast("timer-set-countdown", ctrl.countdownPaused);
                    }
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.ticket = false;
            });
        };
        ctrl.reputationCharts = {};

        ctrl.getTicketCount = function () {
            var query = {
                paginate: { resultsPerPage: 0, currentPage: 1 }
            };

            return Search.query({ filters: JSON.stringify(query) }).$promise;
        };

        ctrl.getCustomerTicketCount = function () {
            if (!ctrl.ticket.defendant) {
                return null;
            }

            var query = {
                paginate: { resultsPerPage: 0, currentPage: 1 },
                where: {
                    like: [
                        { defendant: [ctrl.ticket.defendant.email] }
                    ], in: [
                        { status: ["Open", "Paused", "Answered", "Alarm", "WaitingAnswer", "Reopened"] }
                    ]
                }
            };

            return Search.query({ filters: JSON.stringify(query) }).$promise.then(
                function (data) {
                    ctrl.ticketsCount = data.ticketsCount;
                }
            );
        };

        ctrl.getReportsProviders = function () {
            ctrl.loaders.providerReports = true;
            Tickets.providers({ Id: ctrl.ticket.id }).$promise.then(
                function (providers) {
                    ctrl.trustedSources = _.uniq(providers.filter(function (provider) {
                        return provider.trusted === true;
                    }).map(function (provider) {
                        return provider.email;
                    }));

                    ctrl.unTrustedSources = _.uniq(providers.filter(function (provider) {
                        return provider.trusted === false;
                    }).map(function (provider) {
                        return provider.email;
                    }));
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.providerReports = false;
            });
        };

        ctrl.filterUserProfil = function (profile) {
            return Auth.getCurrentUser().profiles.filter(function (current) {
                return current.category === ctrl.ticket.category;
            })[0].profile === profile;
        };

        ctrl.isBeginner = function () {
            return ctrl.filterUserProfil("Beginner");
        };

        ctrl.isReadOnly = function () {
            return ctrl.filterUserProfil("Read-only");
        };

        ctrl.isMyTicket = function () {
            return ctrl.ticket && ctrl.ticket.treatedBy === Auth.getCurrentUser().username;
        };

        ctrl.hasTicketCountdown = function () {
            if (ctrl.ticket.status === "Paused") {
                return ctrl.countdownPaused > 0;
            } else if (~["WaitingAnswer", "Answered"].indexOf(ctrl.ticket.status)) {
                return ctrl.countdown > 0;
            }

            return false;
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
            return Status.getTicket().$promise.then(
                function (status) {
                    ctrl.status = status;
                    ctrl.btnStatus = status.filter(function (s) {
                        return s.label !== "Open";// && s.label !== "Snoozed";
                    });
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.status = false;
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

        ctrl.getProofs = function () {
            ctrl.loaders.proofs = true;
            return Proofs.query({ ticketId: ctrl.ticket.id }).$promise.then(
                function (proofs) {
                    ctrl.proofs = proofs;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.proofs = false;
            });
        };

        ctrl.toggleConfidential = function (ev) {

            // Do not show dialog when unchecking the box
            if (!ctrl.ticket.confidential) {
                ctrl.updateTicket();
                return;
            }

            var confirm = $mdDialog.confirm()
                .title("Are you sure to set this ticket confidential?")
                .ok("Yes I am")
                .cancel("No, forget about it")
                .targetEvent(ev);
            $mdDialog.show(confirm).then(
                ctrl.updateTicket,
                function () {
                    // Reset state.
                    ctrl.ticket.confidential = false;
                }
            );
        };

        ctrl.updateTicket = function () {
            ctrl.loaders.tickets = true;
            if (ctrl.ticket.treatedBy === "nobody") {
                ctrl.ticket.treatedBy = null;
            }
            return Tickets.update({ Id: ctrl.ticket.id }, ctrl.ticket).$promise.then(
                function (ticket) {
                    angular.extend(ctrl.ticket, ticket);
                    ctrl.ticket.creationDate = new Date(ctrl.ticket.creationDate * 1000);

                    if (ctrl.ticket.defendant) {
                        ctrl.ticket.defendant.creationDate = moment(ctrl.ticket.defendant.creationDate, "DD/MM/YY");
                    }

                    if (ctrl.ticket.snoozeStart) {
                        ctrl.ticket.snoozeStart = new Date(ctrl.ticket.snoozeStart * 1000);
                    }

                    if (ctrl.ticket.pauseStart) {
                        ctrl.ticket.pauseStart = new Date(ctrl.ticket.pauseStart * 1000);
                    }

                    Toast.success("Ticket updated successfully");
                    $rootScope.$broadcast("ticketsOrReportsUpdated");
                },
                function (err) {
                    Toast.error(err);
                    ctrl.init();
                }
            )["finally"](function () {
                ctrl.loaders.tickets = false;
            });
        };

        ctrl.showDialogDefendantComment = function (ev) {
            $mdDialog.show({
                controller: "ReportCommentCtrl",
                templateUrl: "components/comments/add/comments-add.html",
                targetEvent: ev,
                locals: { defaultText: "" }
            }).then(function (comment) {
                Defendant.addComment({ id: ctrl.ticket.defendant.id }, { comment: comment }).$promise.then(
                    function (result) {
                        if (!Array.isArray(ctrl.ticket.defendant.comments)) {
                            ctrl.ticket.defendant.comments = [];
                        }

                        // Push front
                        ctrl.ticket.defendant.comments.splice(0, 0, result);
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
                Defendant.updateComment({ id: ctrl.ticket.defendant.id, idComment: comment.id }, { comment: content }).$promise.then(
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
            Defendant.deleteComment({ id: ctrl.ticket.defendant.id, idComment: comment.id }).$promise.then(
                function () {
                    Toast.success("Comment has been successfully removed.");
                    var index = ctrl.ticket.defendant.comments.indexOf(comment);
                    ctrl.ticket.defendant.comments.splice(index, 1);
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.showDialogDetachDefendant = function (ev) {
            $mdDialog.show({
                controller: "DetachDefendantCtrl",
                templateUrl: "app/tickets/detach-defendant/detach-defendant.html",
                targetEvent: ev,
                locals: { ticket: ctrl.ticket }
            }).then(function () {
                ctrl.ticket.defendant = null;
                ctrl.updateTicket().then(function () {
                    ctrl.init();
                });
            });
        };

        ctrl.showDialogInteract = function (ev) {

            $mdDialog.show({
                controller: "InteractDialogCtrl",
                templateUrl: "app/tickets/interact-dialog/interact-dialog.html",
                targetEvent: ev,
                locals: {
                    ticket: ctrl.ticket,
                    nextTicketId: ctrl.nextTicketId,
                    options: null
                }
            }).then(function () {
                ctrl.init();
            });
        };

        ctrl.showDialogChangeDelay = function (ev) {

            $mdDialog.show({
                controller: "ChangeDelayCtrl",
                templateUrl: "app/tickets/change-delay/change-delay.html",
                targetEvent: ev,
                locals: { ticket: ctrl.ticket }
            }).then(function (newSnoozeDuration) {
                Tickets.changeDelay({ Id: ctrl.ticket.id }, { snoozeDuration: newSnoozeDuration }).$promise.then(
                    function () {
                        Toast.success("Delay changed successfully");
                        ctrl.init();
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );
            });
        };

        ctrl.showDialogComment = function (ev) {
            $mdDialog.show({
                controller: "ReportCommentCtrl",
                templateUrl: "components/comments/add/comments-add.html",
                targetEvent: ev,
                locals: { defaultText: "" }
            }).then(function (comment) {
                Tickets.saveComment({ Id: ctrl.ticket.id }, { comment: comment }).$promise.then(
                    function (result) {
                        if (!Array.isArray(ctrl.ticket.comments)) {
                            ctrl.ticket.comments = [];
                        }

                        ctrl.ticket.comments.splice(0, 0, result);
                        Toast.success("Comment has successfully been added.");
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );
            });
        };

        ctrl.showDialogAddProof = function (ev) {
            $mdDialog.show({
                controller: "ProofEditCtrl",
                templateUrl: "app/tickets/proofs/edit/edit-proof.html",
                targetEvent: ev
            }).then(function (proof) {
                Proofs.save({ ticketId: ctrl.ticket.id }, { content: proof }).$promise.then(
                    function (result) {
                        Toast.success(result.message);
                        ctrl.getProofs();
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );
            });
        };

        ctrl.showStatusButton = function (status) {
            return status.label !== ctrl.ticket.status;
        };

        ctrl.setPause = function (ev) {
            $mdDialog.show({
                controller: "PauseDelayCtrl",
                templateUrl: "app/tickets/pause-delay/pause-delay.html",
                targetEvent: ev,
                locals: { ticket: ctrl.ticket }
            }).then(function (newPauseDuration) {
                Tickets.status({ Id: ctrl.ticket.id, status: "paused" }, { pauseDuration: newPauseDuration }).$promise.then(
                    function () {
                        Toast.success("Ticket paused successfully");
                        ctrl.init();
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );
            });
        };

        ctrl.setPauseDuration = function (ev) {
            $mdDialog.show({
                controller: "PauseDelayCtrl",
                templateUrl: "app/tickets/pause-delay/pause-delay.html",
                targetEvent: ev,
                locals: { ticket: ctrl.ticket }
            }).then(function (newPauseDuration) {
                Tickets.changePauseDelay({ Id: ctrl.ticket.id }, { pauseDuration: newPauseDuration }).$promise.then(
                    function () {
                        Toast.success("Ticket pause duration successfully");
                        ctrl.init();
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );

            });
        };

        ctrl.setUnpause = function () {
            ctrl.loaders.status = true;
            return Tickets.status({ Id: ctrl.ticket.id, status: "unpaused" }, { pauseDuration: 0 }).$promise.then(
                function () {
                    ctrl.init();
                    $rootScope.$broadcast("ticketsOrReportsUpdated");
                    Toast.success("Ticket updated successfully");
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.status = false;
            });
        };

        ctrl.showDialogActionStatus = function (ev) {
            $mdDialog.show({
                controller: "ActionStatusDialogCtrl",
                templateUrl: "app/tickets/action-dialog/action-dialog.html",
                targetEvent: ev,
                locals: { ticketId: ctrl.ticket.id }
            });
        };

        ctrl.setStatus = function (status) {
            ctrl.loaders.status = true;
            return Tickets.status({ Id: ctrl.ticket.id, status: status.label.toLowerCase() }, { pauseDuration: 0 }).$promise.then(
                function () {
                    ctrl.init();
                    $rootScope.$broadcast("ticketsOrReportsUpdated");
                    Toast.success("Ticket updated successfully");
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.status = false;
            });
        };

        ctrl.setClosed = function (ev) {
            ctrl.loaders.status = true;
            $mdDialog.show({
                controller: "TicketResolutionCtrl",
                templateUrl: "app/tickets/ticket-resolution/ticket-resolution.html",
                targetEvent: ev
            }).then(function (data) {
                Tickets.status({ Id: ctrl.ticket.id, status: "closed" }, data).$promise.then(
                    function () {
                        $rootScope.$broadcast("ticketsOrReportsUpdated");
                        Toast.success("Ticket updated successfully");
                        ctrl.init();
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );
            });
        };

        ctrl.onTabSelected = function () {
            $timeout(function () {
                $($window).resize();
            }, 700);
        };

        $scope.$on("timer-stopped", function () {
            ctrl.getTicket();
        });

        /* TAGS */

        ctrl.getTags = function () {
            return Tags.query().$promise.then(
                function (tags) {
                    ctrl.defendantTags = tags.filter(function (tag) { return tag.tagType === "Defendant"; });
                    ctrl.ticketTags = tags.filter(function (tag) { return tag.tagType === "Ticket"; });
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.addTicketTag = function (tag) {
            var tagExists = ctrl.ticketTags.filter(function (t) {
                return t.id === tag.id;
            }).length > 0;

            if (tagExists) {
                Tickets.addTag({ Id: ctrl.ticket.id }, tag.toJSON()).$promise.then(
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
                Tags.save({ name: tag.name, tagType: "Ticket" }).$promise.then(function (tagCreated) {
                    ctrl.ticketTags.push(tagCreated);
                    ctrl.addTicketTag(tagCreated);
                });
            }
        };

        ctrl.removeTicketTag = function (tag) {
            Tickets.deleteTag({ Id: ctrl.ticket.id, idTag: tag.id }).$promise.then(
                function () {
                    _.remove(ctrl.ticket.tags, function (t) {
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
                Defendant.addTag({ id: ctrl.ticket.defendant.id }, tag.toJSON()).$promise.then(
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
            Defendant.deleteTag({ id: ctrl.ticket.defendant.id, idTag: tag.id }).$promise.then(
                function () {
                    _.remove(ctrl.ticket.defendant.tags, function (t) {
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
    });
