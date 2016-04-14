'use strict';

angular.module('abuseApp').factory('Campaign', function ($resource, URLS) {
    return $resource(
        [URLS.API,'mass-contact/:Id'].join('/'),
        {Id: '@Id' }
    );
});
