/*global angular*/
'use strict';

angular.module('abuseApp').factory('Permissions', function ($resource, URLS) {
    return $resource(
        [URLS.API,'profiles/:Id'].join('/'),
        {Id: '@Id' },
        {
            'update': {method: 'PUT'}
        }
    );
});
