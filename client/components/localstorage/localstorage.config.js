 /*global angular */
'use strict';

angular.module('abuseApp').config(function (localStorageServiceProvider, STORAGE) {
    localStorageServiceProvider.setPrefix(STORAGE.PREFIX);
});
