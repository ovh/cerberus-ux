"use strict";

angular
    .module("abuseApp")
    .controller("ThresholdsCtrl", function (Thresholds, Categories, Toast, $mdDialog, $q) {

        var ctrl = this;
        ctrl.loaders = {
            thresholds: true
        };

        ctrl.init = function () {
            $q.all([
                ctrl.getThresholds(),
                ctrl.getCategories()
            ])["finally"](function () {
                ctrl.loaders.thresholds = false;
            });
        };

        ctrl.getThresholds = function () {
            ctrl.loaders.thresholds = true;
            return Thresholds.query().$promise.then(
                function (thresholds) {
                    ctrl.thresholds = thresholds;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.thresholds = false;
            });
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

        ctrl.addThreshold = function (ev) {
            $mdDialog.show({
                controller: "ThresholdEditCtrl",
                templateUrl: "app/admin/thresholds/edit/threshold-edit.html",
                targetEvent: ev,
                locals: { categories: ctrl.categories, threshold: null }
            }).then(function (threshold) {
                Thresholds.save(threshold).$promise.then(
                    function (threshold) {
                        ctrl.thresholds.push(threshold);
                        Toast.success(["Threshold", threshold.name, "successfully added"].join(" "));
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );

            }, function () {});
        };

        ctrl.updateThreshold = function (threshold, ev) {
            $mdDialog.show({
                controller: "ThresholdEditCtrl",
                templateUrl: "app/admin/thresholds/edit/threshold-edit.html",
                targetEvent: ev,
                locals: { categories: ctrl.categories, threshold: threshold }
            }).then(function (newThreshold) {
                Thresholds.update({ id: newThreshold.id }, newThreshold).$promise.then(
                    function () {
                        Toast.success("Threshold successfully updated.");
                    },
                    function (err) {
                        Toast.error(err);
                    }
                );
            }, function () {});
        };

        ctrl.deleteThreshold = function (threshold) {
            Thresholds.remove({ id: threshold.id }).$promise.then(
                function () {
                    _.remove(ctrl.thresholds, threshold);
                    Toast.success("Threshold successfully removed.");
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };
    });
