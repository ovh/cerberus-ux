/*global angular*/

angular.module('abuseApp').factory('Proofs', function ($resource, URLS) {
    'use strict';
    return $resource(
        [URLS.API,'tickets/:ticketId/proof/:Id'].join('/'),
        {Id: '@Id' },
        {
            update: {
                method: 'PUT'
            }
        }
    );
});
