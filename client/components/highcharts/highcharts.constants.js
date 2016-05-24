"use strict";

angular.module("abuseApp")
.constant("Highcharts", Highcharts)
.constant("HIGHCHARTS_CONFIG", {
    colors: ["#33acff", "#354291", "#fd8c06", "#24b994", "#b92463", "#5a2d7a", "#0d618c", "#e53232"],
    chart : {
        type: "areaspline",
        zoomType: "x",
        showAxes : true,
        style: {
            fontFamily: "Open Sans",
            color: "#333"
        }
    },
    title   : {
        text : ""
    },
    credits : {
        enabled : false
    },
    exporting   : {
        enabled : false
    },
    legend : {
        align: "right"
    },
    xAxis       : {
        minPadding: 0,
        type : "datetime",
        lineWidth: 2,
        minorGridLineWidth: 1,
        lineColor: "#333",
        minorTickLength: 0,
        tickLength: 0,
        labels: {
            style: {
                color: "#333",
                font: "11px Open Sans, Trebuchet MS, sans-serif"
            }
        }
    },
    yAxis: {
        gridLineWidth: 0,
        lineColor: "#333",
        minorTickLength: 0,
        tickLength: 0,
        lineWidth:2,
        labels: {
            style: {
                color: "#333",
                font: "11px Open Sans, Trebuchet MS, sans-serif"
            }
        }
    },
    plotOptions :  {
        areaspline: {
            marker: {
                enabled: false
            },
            lineWidth: 1,
            fillOpacity: 0.1
        }
    }
});
