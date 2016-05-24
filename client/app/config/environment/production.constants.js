"use strict";

angular.module("abuseApp").constant("CONFIG", {
    env           : "production",
    basePathRegex : undefined       // RegExp or array of RegExp to configure the HTML5 base path
})
.constant("URLS", {
    API: "https://127.0.0.1/api" // URI of the API
});
