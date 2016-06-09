/*global angular*/
'use strict';

angular.module('abuseApp').factory('Tools', function ($resource, URLS) {
    return $resource(
        [URLS.API, 'tools'].join('/'),
        {},
        {
            curl: {
                method: 'GET',
                url: [URLS.API, 'tools/curl'].join('/'),
                isArray: false
            }
        }
    );
});
