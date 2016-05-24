"use strict";

angular
    .module("abuseApp")
    .controller("ResolutionsCtrl", function ($q, $mdDialog, Resolution, Toast) {
        var ctrl = this;
        ctrl.loading = false;

        ctrl.init = function () {
            ctrl.loading = true;
            $q.all([
                ctrl.getResolutions()
            ]).then(function () {
                ctrl.loading = false;
            });
        };

        ctrl.getResolutions = function () {
            return Resolution.query().$promise.then(
                function (resolutions) {
                    ctrl.resolutions = resolutions;
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        ctrl.addResolution = function (ev) {
            $mdDialog.show({
                controller: "ResolutionAddCtrl",
                templateUrl: "app/admin/resolutions/add/resolution-add.html",
                targetEvent: ev,
                isEditing: false,
                resolution: {}
            }).then(function (resolution) {
                Resolution.save(resolution).$promise.then(
                    function (data) {
                        ctrl.resolutions = data;
                        Toast.success("Ticket resolution has been added.");
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );
            });
        };

        ctrl.updateResolution = function (ev, resolution) {
            $mdDialog.show({
                controller: "ResolutionAddCtrl",
                templateUrl: "app/admin/resolutions/add/resolution-add.html",
                targetEvent: ev,
                isEditing: true,
                resolution: resolution
            }).then(function (resolution) {
                Resolution.update({ Id: resolution.id }, resolution).$promise.then(
                    function (data) {
                        ctrl.resolutions = data;
                        Toast.success("Ticket resolution has been updated.");
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );
            });
        };

        ctrl.deleteResolution = function (resolution) {
            Resolution.remove({ Id: resolution.id }).$promise.then(
                function () {
                    Toast.success("Resolution has been successfully removed.");
                    ctrl.resolutions = ctrl.resolutions.filter(function (r) {
                        return r.id !== resolution.id;
                    });
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };
    });
