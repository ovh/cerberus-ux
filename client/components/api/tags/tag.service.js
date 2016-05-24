/*global angular*/
'use strict';

angular.module('abuseApp').factory('Tags', function ($resource, URLS) {
    return $resource(
        [URLS.API,'tags/:id'].join('/'),
        {id: '@id' },
        {
            update: {
                method: 'PUT'
            },
            types: {
                method: 'GET',
                isArray: true,
                url: [URLS.API,'tags/:id/types'].join('/')
            }
        }
    );
});


