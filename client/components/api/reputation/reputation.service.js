/*global angular*/
'use strict';

angular.module('abuseApp').factory('Reputation', function ($resource, URLS) {
    return $resource(
        [URLS.API, 'reputation/ip/:ip/'].join('/'),
        {ip: '@ip'},
        {
            getRbl: {
                method: 'GET',
                isArray: true,
                url: [URLS.API,'reputation/ip/:ip/rbl'].join('/')
            },
            getInternal: {
                method: 'GET',
                isArray: true,
                url: [URLS.API,'reputation/ip/:ip/internal'].join('/')
            },
            getExternal: {
                method: 'GET',
                isArray: true,
                url: [URLS.API,'reputation/ip/:ip/external'].join('/')
            },
            getTools: {
                method: 'GET',
                isArray: true,
                url: [URLS.API,'reputation/ip/:ip/tool'].join('/')
            },
            getExternalDetails: {
                method: 'GET',
                isArray: true,
                url: [URLS.API,'reputation/ip/:ip/external/:source'].join('/')
            },
            getURLChecks: {
                method: 'POST',
                isArray: true,
                url: [URLS.API,'reputation/url/external'].join('/')
            }
        }
    );
});


