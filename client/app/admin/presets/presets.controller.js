"use strict";

angular
    .module("abuseApp")
    .controller("PresetsCtrl", function ($scope, $q, $mdDialog, Preset, Toast) {
        var ctrlTabPresets = this;

        ctrlTabPresets.loading = false;
        ctrlTabPresets.view = "list";
        ctrlTabPresets.toBeRemoved = [];

        ctrlTabPresets.init = function () {
            ctrlTabPresets.loading = true;
            $q.all([
                ctrlTabPresets.getPresets()
            ]).then(function () {
                ctrlTabPresets.loading = false;
            });
        };

        ctrlTabPresets.getPresets = function () {

            return Preset.query().$promise.then(
                function (groups) {
                    ctrlTabPresets.groups = groups;
                    ctrlTabPresets.createBlankGroup();
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrlTabPresets.addPreset = function () {
            ctrlTabPresets.view = "adding";
            delete ctrlTabPresets.editingPreset;
        };

        ctrlTabPresets.editPreset = function (preset) {
            ctrlTabPresets.view = "editing";
            ctrlTabPresets.editingPreset = preset.id;
        };

        ctrlTabPresets.onMovePreset = function (index, preset, originGroup) {
            // Remove preset from its origin group
            originGroup.presets.splice(index, 1);

            // If the group is empty, remove it (except if it"s the last one which is the special
            // blank group where you can drop whatever).
            if (originGroup.presets.length === 0) {

                var groupIndex = null;
                ctrlTabPresets.groups.forEach(function (group, index) {
                    if (group.groupId === originGroup.groupId) {
                        groupIndex = index;
                    }
                });

                // This case is so weird but...
                if (groupIndex === null) {
                    Toast.error("Sorry bro, cannot determine which group this preset left :-(");
                    return false;
                }

                ctrlTabPresets.groups.splice(groupIndex, 1);
            }

            ctrlTabPresets.saveOrder();
        };

        ctrlTabPresets.createBlankGroup = function () {
            var len = ctrlTabPresets.groups.length;
            if (ctrlTabPresets.groups[len - 1].presets.length !== 0) {
                ctrlTabPresets.groups[len] = {
                    groupId: null,
                    presets: []
                };
            }
        };

        ctrlTabPresets.saveOrder = function () {

            // Remove last groups if it"s empty to avoid server to save it
            var len = ctrlTabPresets.groups.length;
            if (ctrlTabPresets.groups[len - 1].presets.length === 0) {
                ctrlTabPresets.groups.splice(len - 1, 1);
            }

            Preset.saveOrder(ctrlTabPresets.groups).$promise.then(
                function (groups) {
                    Toast.success("Modifications have been saved.");
                    ctrlTabPresets.groups = groups;
                    ctrlTabPresets.createBlankGroup();
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        $scope.$watchCollection("ctrlPresets.toBeRemoved", function () {
            var preset = ctrlTabPresets.toBeRemoved.pop();
            if (!preset) {
                return;
            }

            Preset.remove({ Id: preset.id }).$promise.then(
                function (groups) {
                    Toast.success("Preset has been successfully removed.");
                    ctrlTabPresets.groups = groups;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        });
    });
