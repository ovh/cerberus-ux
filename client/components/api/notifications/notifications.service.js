/*global angular*/

angular
    .module('abuseApp')
    .factory('Notifications', function ($resource, URLS) {
        'use strict';

        return $resource(
            [URLS.API,'notifications'].join('/'),
            {}
        );
    })
    .service('NotificationService', function (STORAGE, Auth, localStorageService, Notifications, Toast, $interval) {
        'use strict';

        // Observe local storage for new notifications.
        // Note an event is sent by other tabs, so the tab which receives the notifications must
        // call directly this function since the event won't be triggered.
        function displayNotification (evt) {
            if (evt && evt.key !== [STORAGE.PREFIX, STORAGE.NOTIFICATIONS].join('.')) {
                return;
            }

            var notifications = angular.fromJson(localStorageService.get(STORAGE.NOTIFICATIONS));
            if (notifications && notifications.length > 0) {
                var msg = notifications.map(function (notif) {
                    return notif.message;
                }).join('<br/>');

                Toast.open(msg, {
                    delay: 5000,
                    position: 'bottom left'
                });
            }
        }

        this.pollNotifications = function (interval) {

            localStorageService.remove(STORAGE.NOTIFICATIONS);
            window.addEventListener('storage', displayNotification, false);

            $interval(function () {
                if (Auth.isLoggedIn()) {
                    Notifications.query().$promise.then(
                        function (notifications) {
                            if (notifications.length > 0) {
                                localStorageService.set(STORAGE.NOTIFICATIONS, angular.toJson(notifications));
                                displayNotification();
                            }
                    }
                    );
                }
            }, interval || 60000);
        };

    });
