'use strict';

angular.module('abuseApp').factory('Preset', function ($resource, URLS) {
    return $resource(
        [URLS.API,'presets/:Id'].join('/'),
        {Id: '@Id' },
        {
            'update': {method: 'PUT'},
            'remove': {
                method: 'DELETE',
                isArray: true
            },
            'saveOrder': {
               method: 'PUT',
               isArray: true,
               url: [URLS.API,'presets/order'].join('/')
            }
        }
    );
});
