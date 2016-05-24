"use strict";

angular
    .module("abuseApp")
    .controller("TicketEmailsCtrl", function ($scope, Tickets, Toast, $q) {
        var ctrlEmails = this,
            ctrl = $scope.ctrl;

        ctrlEmails.emails = [];

        ctrlEmails.loaders = {
            emails: false
        };

        ctrlEmails.init = function () {
            $q.all([
                ctrlEmails.getEmails(),
            ]);
        };

        ctrlEmails.getEmails = function () {
            ctrlEmails.loaders.emails = true;

            return Tickets.getEmails({ Id: ctrl.ticket.id }).$promise.then(
                function (emails) {
                    ctrlEmails.emails = emails.map(function (email) {
                        email.created = new Date(email.created * 1000);
                        return email;
                    }).reverse();
                },
                function (err) {
                    Toast.error(err);
                }
            )["finally"](function () {
                ctrlEmails.loaders.emails = false;
            });
        };
    });
