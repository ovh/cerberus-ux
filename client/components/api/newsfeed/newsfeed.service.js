/*global angular*/
'use strict';

angular.module('abuseApp').factory('NewsFeed', function ($resource, URLS) {
    return $resource(
        [URLS.API,'news/:id'].join('/'),
        {id: '@id' },
        {
            query: {
                isArray: false
            },
            'update': {
                method: 'PUT'
            }
        }
    );
});
