/*global angular*/
angular
    .module("abuseApp")
    .controller("PeopleCtrl", function ($state, Auth, User, Toast) {
        "use strict";

        var ctrl = this;
        ctrl.loaders = {
            users: true
        };

        function init () {
            ctrl.getUsers()["finally"](function () {
                ctrl.loaders.users = false;
            });
        }

        // ------ Users ------ //
        ctrl.getUsers = function () {
            ctrl.loaders.users = true;
            return User.query().$promise.then(
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

        ctrl.delete = function (user) {
            User.remove({ id: user.id });
            angular.forEach(ctrl.users, function (u, i) {
                if (u === user) {
                    ctrl.users.splice(i, 1);
                }
            });
        };

        init();
    });
