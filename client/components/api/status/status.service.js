'use strict';

angular.module('abuseApp').factory('Status', function ($resource, URLS) {
    return $resource(
        [URLS.API,'status/:Id'].join('/'),
        {Id: '@Id' },
        {
            getReport: {
                method: 'GET',
                isArray: true,
                params: {
                    'Id': 'Report'
                }
            },
            getTicket: {
                method: 'GET',
                isArray: true,
                params: {
                    'Id': 'Ticket'
                }
            },
            'update': {method: 'PUT'}
        }
    );
});
