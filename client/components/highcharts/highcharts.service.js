angular.module("abuseApp")
.service("HighchartsService", function (Highcharts, HIGHCHARTS_CONFIG) {
    "use strict";

    this.getDefaultConfig = function () {
        return JSON.parse(JSON.stringify(HIGHCHARTS_CONFIG));
    };

});
