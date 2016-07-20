/*global angular */
'use strict';

angular.module('abuseApp')
.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
    $httpProvider.defaults.useXDomain = true;
    $httpProvider.defaults.withCredentials = true;
})
.run(function ($rootScope, $location, Auth) {

    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {

        Auth.isLoggedInAsync(function(loggedIn) {
            if (next.authenticate && !loggedIn) {
                var requestedUrl = window.encodeURIComponent($location.url());
                $location.url(['/login?url=', requestedUrl].join(""));
            }
            if (next.admin && !Auth.isAdmin()) {
                $location.path('/');
            }
        });

    });

});
