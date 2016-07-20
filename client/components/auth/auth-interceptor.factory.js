/*global angular */
'use strict';

angular.module('abuseApp').factory('authInterceptor', function ($rootScope, $q, $cookieStore) {
    return {
        // Add authorization token to headers
        request: function (config) {
            config.headers = config.headers || {};

            if ($cookieStore.get('token')) {
                config.headers['X-Api-Token'] = $cookieStore.get('token');
            }

            return config;
        },

        // Intercept 401s and redirect you to login
        responseError: function(response) {
            if (response.status === 401) {
                // remove any stale tokens
                $cookieStore.remove('token');
                return $q.reject(response);
            } else {
                return $q.reject(response);
            }
        }
    };
});
