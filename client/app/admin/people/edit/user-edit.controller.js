"use strict";

angular
    .module("abuseApp")
    .controller("AdminUserEditCtrl", function ($stateParams, User, Toast, Permissions, $rootScope, $q) {

        var ctrl = this;
        ctrl.newPermissions = {};
        ctrl.allCategories = {};

        ctrl.loaders = {
            user: false,
            permissions: false,
            categories: false
        };

        ctrl.init = function () {
            ctrl.loaders.init = true;
            $q.all([
                ctrl.getUser(),
                ctrl.getPermissions(),
            ])["finally"](function () {
                ctrl.loaders.init = false;
            });
        };

        ctrl.getUser = function () {
            ctrl.loaders.user = true;
            return User.getUser({ id: $stateParams.userId }).$promise.then(
                function (user) {
                    ctrl.user = user;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.user = false;
            });
        };

        ctrl.getPermissions = function () {
            ctrl.loaders.permissions = true;
            return Permissions.query().$promise.then(
                function (permissions) {
                    ctrl.permissions = permissions;
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.permissions = false;
            });
        };

        ctrl.selectAllCategories = function (permission) {
            var checked = !ctrl.allCategories[permission.name];
            ctrl.allCategories = {};
            ctrl.allCategories[permission.name] = !checked;

            ctrl.user.profiles.forEach(function (p) {
                p.profile = permission.name;
                p.access = checked;
            });
        };

        ctrl.isSelected = function (profile, permission) {
            return profile.profile === permission.name && profile.access === true;
        };

        ctrl.toggleSelection = function (profile, permission) {
            profile.profile = permission.name;
            profile.access = !profile.access;
        };

        ctrl.savePermissions = function () {

            ctrl.loaders.user = true;

            User.update({ id: ctrl.user.id }, ctrl.user).$promise.then(
                function (user) {
                    ctrl.user = user;
                    $rootScope.$broadcast("user.permissions.changed");
                    Toast.success("User updated successfully");
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrl.loaders.user = false;
            });
        };

    });
