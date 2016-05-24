/*global angular*/
'use strict';

angular.module('abuseApp').factory('Reports', function ($resource, URLS) {
    return $resource(
        [URLS.API,'reports/:Id'].join('/'),
        {Id: '@Id' },
        {
            update: {
                method: 'PUT'
            },
            getItems: {
                method: 'GET',
                isArray: false,
                url: [URLS.API,'reports/:Id/items'].join('/')
            },
            createItem: {
                method: 'POST',
                url: [URLS.API,'reports/:Id/items'].join('/')
            },            
            updateItem: {
                method: 'PUT',
                url: [URLS.API,'reports/:Id/items/:itemId'].join('/')
            },
            deleteItem: {
                method: 'DELETE',
                url: [URLS.API,'reports/:Id/items/:itemId'].join('/')
            },
            screenshots: {
                method: 'GET',
                isArray: true,
                url: [URLS.API,'reports/:Id/items/screenshots'].join('/')
            },
            giveFeedback: {
                method: 'POST',
                isArray: false,
                url: [URLS.API,'reports/:Id/feedback'].join('/')
            },
            activities: {
                method: 'GET',
                isArray: true,
                url: '/api/reports/activities'
            },
            attachments: {
                method: 'GET',
                isArray: true,
                url: [URLS.API,'reports/:Id/attachments'].join('/')
            },
            raw: {
                method: 'GET',
                isArray: false,
                url: [URLS.API,'reports/:Id/raw'].join('/')
            },
            dehtmlify: {
                method: 'GET',
                isArray: false,
                url: [URLS.API, 'reports/:Id/dehtmlify'].join('/')
            },
            attachment: {
                method: 'GET',
                isArray: false,
                url: [URLS.API,'reports/:Id/attachments/:attachmentId'].join('/')
            },
            addTag: {
                method: 'POST',
                isArray: false,
                url: [URLS.API,'reports/:Id/tags'].join('/')
            },
            deleteTag: {
                method: 'DELETE',
                url: [URLS.API,'reports/:Id/tags/:idTag'].join('/')
            },
            shortcutStats: {
                method: 'GET',
                url: [URLS.API,'toolbar'].join('/')
            },
            dashboardStats: {
                method: 'GET',
                url: [URLS.API,'dashboard'].join('/')
            }
        }
    );
});


