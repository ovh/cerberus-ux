/*global angular*/
'use strict';

angular.module('abuseApp').factory('Thresholds', function ($resource, URLS) {
    return $resource(
        [URLS.API,'admin/threshold/:id'].join('/'),
        {id: '@id' },
        {
            update: {
                method: 'PUT'
            }
        }
    );
});


