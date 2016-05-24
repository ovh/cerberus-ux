/*global angular*/
'use strict';

angular.module('abuseApp').factory('Categories', function ($resource, URLS) {
    return $resource(
        [URLS.API,'categories/:Id'].join('/'),
        {Id: '@Id' },
        {
            'update': {
                method: 'PUT'
            }
        }
    );
});
