/*global angular*/
'use strict';

angular.module('abuseApp').factory('Defendant', function ($resource, URLS) {
    return $resource(
        [URLS.API,'defendants/:id'].join('/'),
        {Id: '@id' },
        {
            update: {
                method: 'PUT'
            },
            addComment: {
                method: 'POST',
                isArray: false,
                url: [URLS.API,'defendants/:id/comments'].join('/')
            },
            updateComment: {
                method: 'PUT',
                isArray: false,
                url: [URLS.API, 'defendants/:id/comments/:idComment'].join('/')
            },
            deleteComment: {
                method: 'DELETE',
                isArray: false,
                url: [URLS.API, 'defendants/:id/comments/:idComment'].join('/')
            },
            addTag: {
                method: 'POST',
                isArray: false,
                url: [URLS.API,'defendants/:id/tags'].join('/')
            },
            deleteTag: {
                method: 'DELETE',
                url: [URLS.API,'defendants/:id/tags/:idTag'].join('/')
            },
            services: {
                method: 'GET',
                isArray: true,
                url: [URLS.API,'defendants/:id/services'].join('/')
            },
            mostNoisy: {
                method: 'GET',
                url: [URLS.API,'defendants/top20'].join('/')
            }
        }
    );
});
