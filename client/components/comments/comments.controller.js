angular
    .module("abuseApp")
    .controller("CommentsCtrl", function ($scope, $state, Auth, Tickets, Reports, Toast) {
        "use strict";

        var ctrl = this;

        ctrl.getMe = function () {
            return Auth.getCurrentUser();
        };

        function getData () {
            var data = null;

            if ($state.$current.includes.ticket && $scope.ctrl.ticket) {
                data = $scope.ctrl.ticket;
            }

            if ($state.$current.includes.report && $scope.ctrl.report) {
                data = $scope.ctrl.report;
            }

            return data;
        }

        function getResource () {
            var resource = null;

            if ($state.$current.includes.ticket) {
                resource = Tickets;
            }

            if ($state.$current.includes.report) {
                resource = Reports;
            }

            return resource;
        }

        ctrl.updateComment = function (comment) {
            var data = getData(),
                resource = getResource();

            if (!data || !resource) {
                Toast.error("An error occurred");
                return;
            }

            resource.updateComment({ Id: data.id, idComment: comment.id }, { comment: comment.comment }).$promise.then(
                function () {
                    Toast.success("Comment has successfully been updated.");
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };


    });
