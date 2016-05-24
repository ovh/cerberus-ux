/*global angular*/
'use strict';

angular.module('abuseApp').factory('Search', function ($resource, URLS) {
    return $resource(
        [URLS.API,'search'].join('/'),
        { },
        {
            query : {
                isArray: false
            },
            'update': {
                method: 'PUT',
                isArray: true
            },
            todoTicketList : {
                method: 'GET',
                isArray: false,
                url: [URLS.API, 'tickets/todo'].join('/')
            }
        }
    );
});
