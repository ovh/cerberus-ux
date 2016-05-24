"use strict";

angular
    .module("abuseApp")
    .controller("ActionStatusDialogCtrl", function ($scope, Tickets, Toast, $mdDialog, ticketId) {

        $scope.loading = false;

        $scope.init = function () {
            $scope.loading = true;
            Tickets.getTicketJobs({ Id: ticketId }).$promise.then(
                function (jobs) {
                    $scope.jobs = jobs;
                },
                function (err) {
                    Toast.error(err);
                    $mdDialog.cancel();
                }
            )["finally"](function () {
                $scope.loading = false;
            });
        };

        $scope.cancelJob = function (job) {
            Tickets.cancelJob({ Id: ticketId, jobId: job.id }).$promise.then(
                function (result) {
                    Toast.success(result.message);
                    $mdDialog.cancel();
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.remove = function () {
            $mdDialog.cancel(true);
        };
    });
