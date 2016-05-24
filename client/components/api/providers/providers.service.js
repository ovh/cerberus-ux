/*global angular*/
'use strict';

angular.module('abuseApp').factory('Providers', function ($resource, URLS) {
    return $resource(
        [URLS.API,'providers/:Id'].join('/'),
        {Id: '@Id' },
        {
            'update': {
                method: 'PUT'
            },
            addTag: {
                method: 'POST',
                isArray: false,
                url: [URLS.API,'providers/:Id/tags'].join('/')
            },
            deleteTag: {
                method: 'DELETE',
                url: [URLS.API,'providers/:Id/tags/:idTag'].join('/')
            },
            query: {
                isArray: false,
            }
        }
    );
});

