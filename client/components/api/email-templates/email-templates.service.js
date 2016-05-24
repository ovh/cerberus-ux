'use strict';

angular.module('abuseApp').factory('EmailTemplates', function ($resource, URLS) {
    return $resource(
        [URLS.API,'emailTemplates/:Id'].join('/'),
        {Id: '@Id' },
        {
            update: {
                method: 'PUT'
            },
            getRecipientTypes: {
                method: 'GET',
                isArray: true,
                url: [URLS.API, 'emailTemplates/recipientsType'].join('/')
            },
            getLanguages: {
               method: 'GET',
               isArray: true,
               url: [URLS.API, 'emailTemplates/languages'].join('/')
            }
        }
    );
});
