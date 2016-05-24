/*global angular*/
'use strict';

angular.module('abuseApp').factory('Stats', function ($resource, URLS) {
    return $resource(
        [URLS.API,'stats/:customerId'].join('/'),
        {Id: '@customerId' },
        {
            tickets: {
                method: 'GET',
                url: [URLS.API,'stats/tickets/:customerId'].join('/'),
                isArray: true
            },
            reports: {
                method: 'GET',
                url: [URLS.API,'stats/reports/:customerId'].join('/'),
                isArray: true
            },
            update: {method: 'PUT'}
        }
    );
});
