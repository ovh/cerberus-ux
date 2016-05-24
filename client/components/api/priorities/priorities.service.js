'use strict';

angular.module('abuseApp').factory('Priorities', function ($resource, URLS) {
    return $resource(
        [URLS.API,'priorities/:id'].join('/'),
        {Id: '@id' },
        {
            'update': {method: 'PUT'},
            getTickets : {
                method: 'GET',
                isArray: true,
                url: [URLS.API,'priorities/ticket'].join('/')
            },
            getProviders : {
                method: 'GET',
                isArray: true,
                url: [URLS.API,'priorities/provider'].join('/')
            }
        }        
    );
});
