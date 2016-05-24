"use strict";

angular
    .module("abuseApp")
    .controller("TicketActivitiesCtrl", function () {
        var ctrlActivities = this;

        ctrlActivities.init = function () {
            ctrlActivities.txtFilter = "";
        };
    });
