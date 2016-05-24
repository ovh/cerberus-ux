/*global angular*/
'use strict';

angular.module('abuseApp').factory('Ping', function ($resource, URLS) {
    return $resource(
        [URLS.API,'ping'].join('/'),
        {},
        {
            update: {method: 'PUT'}
        }
    );
});
