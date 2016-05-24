"use strict";

angular.module("abuseApp").run(function (Highcharts) {

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

});
