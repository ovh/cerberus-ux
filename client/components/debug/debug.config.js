"use strict";

angular.module("abuseApp")
.config(function ($compileProvider, $logProvider, CONFIG) {
    // Debug mode and logs are disabled in production
    $compileProvider.debugInfoEnabled(CONFIG.env !== "prod");
    $logProvider.debugEnabled(CONFIG.env !== "prod");
});
