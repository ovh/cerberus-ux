'use strict';

angular.module('abuseApp').factory('Resolution', function ($resource, URLS) {
    return $resource(
        [URLS.API,'resolutions/:Id'].join('/'),
        {Id: '@Id' },
        {
            save: {
                method: 'POST',
                isArray: true
            },
            update: {
                method: 'PUT',
                isArray: true
            },
            remove: {
                method: 'DELETE',
                isArray: true
            }
        }
    );
});
