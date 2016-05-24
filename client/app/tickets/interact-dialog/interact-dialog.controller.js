angular
    .module("abuseApp")
    .controller("InteractDialogCtrl", function ($scope, $mdDialog, $q, $state, Tickets, Reports, Toast, EmailTemplates, Resolution, Preset, ticket, nextTicketId, options) {
        "use strict";
        $scope.ticket = ticket;

        $scope.loaders = {
            init: false,
            start: false
        };

        $scope.recipients = {};

        function filterEmailTemplatesByRecipientType (recipientType) {
            return $scope.emailTemplates.filter(function (t) {
                return t.recipientType === recipientType;
            });
        }

        $scope.init = function () {
            $scope.loaders.init = true;
            $q.all([
                $scope.getActions(),
                $scope.getEmailTemplates(),
                $scope.getInteractionPresets(),
                $scope.getResolutions(),
                $scope.getProviders(),
                $scope.getTicketItems()
            ]).then(function () {

                if (ticket.defendant) {
                    // Autocompletion of defendant emails (list of unique and non-null e-mails)
                    $scope.recipients.defendant = _.uniq([ticket.defendant.email, ticket.defendant.spareEmail].filter(function (mail) {
                        return mail !== null;
                    }));

                    // Same thing with plaintiff emails
                    $scope.recipients.plaintiff = _.uniq($scope.reportProviders.filter(function (mail) {
                        // Remove mails that start by "api:..." which are not real email addresses.
                        return mail && !~mail.indexOf("api:");
                    }));
                }

                $scope.reset();

                $scope.loaders.init = false;

                if (options) {
                    $scope.applyOptions();
                }
            });
        };

        $scope.getActions = function () {
            return Tickets.getActions({ Id: $scope.ticket.id }).$promise.then(
                function (actions) {
                    $scope.actions = actions;
                },
                function (err) {
                    Toast.error(err);
                    $scope.cancel();
                }
            );
        };

        $scope.getEmailTemplates = function () {
            return EmailTemplates.query().$promise.then(
                function (templates) {
                    $scope.emailTemplates = templates;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        $scope.getResolutions = function () {
            return Resolution.query().$promise.then(
                function (resolutions) {
                    $scope.resolutions = resolutions;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        $scope.getInteractionPresets = function () {
            var query = {
                queryFields: ["id", "name", "codename"]
            };

            return Preset.query({ filters: JSON.stringify(query) }).$promise.then(
                function (presets) {
                    $scope.interactionPresets = presets;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        $scope.getProviders = function () {
            var query = {
                queryFields: ["provider"],
                where: { in: [{ ticket: [ticket.id] }] }
            };

            return Reports.query({ filters: query }).$promise.then(
                function (reports) {
                    $scope.reportProviders = reports.map(function (report) {
                        return report.provider.email;
                    });
                }, function (err) {
                    Toast.error(err);
                }
            );
        };

        $scope.getTicketItems = function () {
            return Tickets.getItems({ Id: $scope.ticket.id }).$promise.then(
                function (items) {
                    $scope.items = _.uniq(
                        items.items
                        // 1st map on the more recent item info
                            .map(function (item) {
                                return item.history[item.history.length - 1];
                            })
                        // Remove not managed items
                            .filter(function (item) {
                                return item.ipCategory === "managed";
                            })
                        // Keep only ip
                            .map(function (item) {
                                var ip = (item.ip || item.fqdnResolved);
                                return ip;
                            })
                    );
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        $scope.getEmailsToSend = function () {
            var result = Object.keys($scope.data.templates);

            return result.filter(function (k) {
                return $scope.data.templates[k].send;
            }).sort();
        };

        $scope.getPlaintiffTemplates = function () {
            return filterEmailTemplatesByRecipientType("Plaintiff");
        };

        $scope.getDefendantTemplates = function () {
            return filterEmailTemplatesByRecipientType("Defendant");
        };

        $scope.getThirdPartyTemplates = function () {
            return filterEmailTemplatesByRecipientType("Other");
        };

        $scope.collapseAllExcept = function (notToCollapse) {
            Object.keys($scope.toggle).forEach(function (key) {
                if (key === notToCollapse) {
                    $scope.toggle[key] = true;
                } else {
                    $scope.toggle[key] = false;
                }
            });
        };

        $scope.applyOptions = function () {
            // If a preset has been forced when calling the popup
            if (options.preset) {
                // Force preset change by fetching the right id using passed codename
                var preset = _.chain($scope.interactionPresets)
                    .map(function (currentGroup) {
                        return currentGroup.presets;
                    })
                    .flatten()
                    .find(function (currentPreset) {
                        return currentPreset.codename === options.preset;
                    })
                    .value();

                if (!preset) {
                    Toast.error("SBL Removal preset cannot be found.");
                    $scope.cancel();
                    return;
                }

                $scope.onPresetChange(preset).then(function () {
                    // When done, apply other options about templates
                    ["plaintiff", "defendant", "other"].forEach(function (recipient) {
                        if (!options[recipient]) {
                            return;
                        }

                        Object.keys(options[recipient]).forEach(function (key) {
                            $scope.data.templates[recipient][key] = options[recipient][key];
                        });
                    });

                    // If set, display a custom view
                    if (options.defaultView) {
                        $scope.collapseAllExcept(options.defaultView);
                    }
                });
            }
        };

        $scope.onPresetChange = function (preset) {

            $scope.loaders.start = true;
            return Tickets.getPreset({ Id: $scope.ticket.id, presetId: preset.id }).$promise.then(
                function (data) {
                    $scope.currentPreset = data;

                    $scope.data = data;

                    var templates = $scope.data.templates;
                    $scope.data.templates = {};
                    templates.forEach(function (t) {
                        var attr = null;

                        if (t.recipientType === "Plaintiff") {
                            attr = "plaintiff";
                        } else if (t.recipientType === "Defendant") {
                            attr = "defendant";
                        } else if (t.recipientType === "Other") {
                            attr = "other";
                        }

                        if (attr) {
                            $scope.data.templates[attr] = t;
                            $scope.data.templates[attr].send = true;
                            $scope.data.templates[attr].to = t.to ? t.to.join(";") : "";
                        }
                    });

                    // Convert seconds to hours
                    if ($scope.data.action.params.snoozeDuration) {
                        $scope.data.action.params.snoozeDuration /= 3600;
                    }
                    if ($scope.data.action.params.pauseDuration) {
                        $scope.data.action.params.pauseDuration /= 3600;
                    }

                    // If there is only 1 item, select it by default
                    if ($scope.items.length === 1) {
                        $scope.data.action.params.ip = $scope.items[0];
                    }

                    // Show email section
                    $scope.collapseAllExcept("emails");
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                $scope.loaders.start = false;
            });
        };

        $scope.preRenderEmail = function (recipient) {
            // No template selected, no need to go further
            if (!$scope.data.templates[recipient] || !$scope.data.templates[recipient].id) {
                return;
            }

            Tickets.preRenderEmail({ Id: ticket.id, templateId: $scope.data.templates[recipient].id }).$promise.then(
                function (email) {
                    $scope.data.templates[recipient].body = email.body;
                    $scope.data.templates[recipient].subject = email.subject;
                    $scope.data.templates[recipient].to = email.to.join(";");
                },
                function (err) {
                    Toast.error(err);

                    // 400 codes has a special sense :: no proof are attached to the ticket and templates need some
                    if (err.status === 400) {
                        // Clean selected template
                        delete $scope.data.templates[recipient].id;
                    }
                }
            );
        };

        $scope.validate = function (actionOnSuccess) {
            $scope.loaders.start = true;

            var toSend = {
                emails: [],
                action: angular.copy($scope.data.action)
            };

            for (var k in $scope.data.templates) {
                // Do not send not checked email
                if (!$scope.data.templates[k].send) {
                    continue;
                }

                var email = {
                    body: $scope.data.templates[k].body,
                    subject: $scope.data.templates[k].subject,
                    to: $scope.data.templates[k].to.split(";")
                };

                toSend.emails.push(email);
            }

            // Hours to seconds
            if (toSend.action.params.snoozeDuration) {
                toSend.action.params.snoozeDuration *= 3600;
            }
            if (toSend.action.params.pauseDuration) {
                toSend.action.params.pauseDuration *= 3600;
            }

            Tickets.interact({ Id: $scope.ticket.id }, toSend).$promise.then(
                function (result) {
                    Toast.success(result.message);
                    if (actionOnSuccess === "next") {
                        $scope.gotoNextTicket();
                    } else if (actionOnSuccess === "stay") {
                        $mdDialog.hide(true);
                    }
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                $scope.loaders.start = false;
            });
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.remove = function () {
            $mdDialog.cancel(true);
        };

        $scope.reset = function () {
            $scope.data = {
                templates : {
                    defendant: {}
                },
                action: {}
            };

            // If there is only 1 item, select it by default
            if ($scope.items.length === 1) {
                $scope.data.action.params = {
                    ip: $scope.items[0]
                };
            }

            $scope.toggle = {
                presets: true,
                emails: false,
                preview: false,
                actions: false
            };

            delete $scope.currentPreset;
        };

        $scope.gotoNextTicket = function () {
            // Navigate to next ticket
            $state.go("ticket.activities", { id: nextTicketId });
            // Dismiss popup
            $mdDialog.cancel();
        };

    });
