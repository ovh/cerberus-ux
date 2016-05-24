"use strict";

angular
    .module("abuseApp")
    .controller("PresetEditorCtrl", function ($q, $mdDialog, $state, Preset, Toast, EmailTemplates, Resolution) {
        var ctrlPresetEditor = this;

        ctrlPresetEditor.loading = false;

        ctrlPresetEditor.init = function (presetId, ctrlPresets) {
            ctrlPresetEditor.loading = true;
            $q.all([
                ctrlPresetEditor.getResolutions(),
                ctrlPresetEditor.getEmailTemplates(),
                ctrlPresetEditor.getPreset(presetId)
            ]).then(function () {
                ctrlPresetEditor.loading = false;
                ctrlPresetEditor.parent = ctrlPresets;
            });
        };

        ctrlPresetEditor.getPreset = function (presetId) {
            // Retrieve preset to edit (if exists)
            if (presetId) {
                return Preset.get({ Id: presetId }).$promise.then(
                    function (preset) {
                        ctrlPresetEditor.currentPreset = preset;

                        var templates = ctrlPresetEditor.currentPreset.templates;
                        ctrlPresetEditor.currentPreset.templates = {};
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
                                ctrlPresetEditor.currentPreset.templates[attr] = t;
                                ctrlPresetEditor.currentPreset.templates[attr].send = true;
                            }

                        });

                        // Convert hours to seconds
                        if (ctrlPresetEditor.currentPreset.action.params.snoozeDuration) {
                            ctrlPresetEditor.currentPreset.action.params.snoozeDuration /= 3600;
                        }
                        if (ctrlPresetEditor.currentPreset.action.params.pauseDuration) {
                            ctrlPresetEditor.currentPreset.action.params.pauseDuration /= 3600;
                        }
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );
            } else {
                ctrlPresetEditor.currentPreset = {};
            }
        };

        ctrlPresetEditor.getResolutions = function () {
            return Resolution.query().$promise.then(
                function (resolutions) {
                    ctrlPresetEditor.resolutions = resolutions;
                }, function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrlPresetEditor.getEmailTemplates = function () {
            var query = {};

            return EmailTemplates.query({ filters: JSON.stringify(query) }).$promise.then(
                function (templates) {
                    ctrlPresetEditor.emailTemplates = templates;
                }, function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrlPresetEditor.getRecipientTypes = function () {
            return EmailTemplates.getRecipientTypes().$promise.then(
                function (types) {
                    ctrlPresetEditor.recipientTypes = types;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrlPresetEditor.getEmailTemplatesByRecipient = function (type) {
            return ctrlPresetEditor.emailTemplates.filter(function (t) {
                return t.recipientType === type;
            });
        };

        ctrlPresetEditor.save = function () {
            // Transform preset to server format
            var toSend = angular.copy(ctrlPresetEditor.currentPreset);
            toSend.templates = [];

            for (var k in ctrlPresetEditor.currentPreset.templates) {
                if (ctrlPresetEditor.currentPreset.templates[k].send) {
                    toSend.templates.push(ctrlPresetEditor.currentPreset.templates[k].id);
                }
            }

            // Convert hours to seconds
            if (toSend.action.params.snoozeDuration) {
                toSend.action.params.snoozeDuration *= 3600;
            }
            if (toSend.action.params.pauseDuration) {
                toSend.action.params.pauseDuration *= 3600;
            }

            ctrlPresetEditor.loading = true;
            if (ctrlPresetEditor.currentPreset.id) {
                Preset.update({ Id: ctrlPresetEditor.currentPreset.id }, toSend).$promise.then(
                    function () {
                        ctrlPresetEditor.parent.view = "list";
                        ctrlPresetEditor.parent.init();
                    },
                    function (err) {
                        Toast.error(err);
                    }
                )["finally"](function () {
                    ctrlPresetEditor.loading = false;
                });
            } else {
                Preset.save(toSend).$promise.then(
                    function () {
                        ctrlPresetEditor.parent.view = "list";
                        ctrlPresetEditor.parent.init();
                    },
                    function (err) {
                        Toast.error(err);
                    }
                )["finally"](function () {
                    ctrlPresetEditor.loading = false;
                });
            }
        };
    });
