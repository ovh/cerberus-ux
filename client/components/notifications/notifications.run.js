/*global angular */
'use strict';

angular.module('abuseApp').run(function (NotificationService) {    
    NotificationService.pollNotifications();
});
