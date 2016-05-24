/*global angular*/
'use strict';

angular.module('abuseApp').factory('Tickets', function ($resource, URLS) {
    return $resource(
        [URLS.API,'tickets/:Id'].join('/'),
        {Id: '@Id' },
        {
            update: {
                method: 'PUT'
            },
            getMyTickets : {
                method: 'GET',
                isArray: true,
                url: [URLS.API,'my-tickets'].join('/')
            },
            getItems: {
                method: 'GET',
                isArray: false,
                url: [URLS.API,'tickets/:Id/items'].join('/')
            },
            createItem: {
                method: 'POST',
                url: [URLS.API,'tickets/:Id/items'].join('/')
            },            
            updateItem: {
                method: 'PUT',
                url: [URLS.API,'tickets/:Id/items/:itemId'].join('/')
            },
            deleteItem: {
                method: 'DELETE',
                url: [URLS.API,'tickets/:Id/items/:itemId'].join('/')
            },
            stats: {                
                method: 'GET',
                isArray: false,                
                url: '/api/tickets/stats'
            },
            providers: {
                method: 'GET',
                isArray: true,
                url: [URLS.API,'tickets/:Id/providers'].join('/')
            },
            activities: {
                method: 'GET',
                isArray: true,
                url: '/api/tickets/activities'
            },
            getEmails: {
                method: 'GET',
                isArray: true,
                url: [URLS.API,'tickets/:Id/emails'].join('/')
            },
            sendEmail: {
                method: 'POST',
                isArray: false,
                url: [URLS.API,'tickets/:Id/emails'].join('/')
            },            
            status:  {
                method: 'PUT',
                isArray: false,
                url: [URLS.API,'tickets/:Id/status/:status'].join('/')
            },
            interact: {
                method: 'POST',
                isArray: false,
                url: [URLS.API,'tickets/:Id/interact'].join('/')
            },
            getMisc: {
                method: 'GET',
                isArray: false,
                url: [URLS.API,'tickets/:Id/misc'].join('/')
            },
            preRenderEmail: {
                method: 'GET',
                isArray: false,
                url: [URLS.API,'tickets/:Id/templates/:templateId'].join('/')
            },
            getPreset: {
                method: 'GET',
                isArray: false,
                url: [URLS.API,'tickets/:Id/presets/:presetId'].join('/')
            },
            changeDelay: {
                method: 'PATCH',
                isArray: false,
                url: [URLS.API,'tickets/:Id/snoozeDuration'].join('/')
            },
            changePauseDelay: {
                method: 'PATCH',
                isArray: false,
                url: [URLS.API,'tickets/:Id/pauseDuration'].join('/')
            },
            addTag: {
                method: 'POST',
                isArray: false,
                url: [URLS.API,'tickets/:Id/tags'].join('/')
            },
            deleteTag: {
                method: 'DELETE',
                url: [URLS.API,'tickets/:Id/tags/:idTag'].join('/')
            },
            bulk: {
                method: 'PUT',
                url: [URLS.API,'tickets/bulk'].join('/')
            },
            getActions: {
                method: 'GET',
                isArray: true,
                url: [URLS.API, 'tickets/:Id/actions/list'].join('/')
            },
            getTicketJobs: {
                method: 'GET',
                isArray: true,
                url: [URLS.API, 'tickets/:Id/jobs'].join('/')
            },
            cancelJob: {
                method: 'DELETE',
                isArray: false,
                url: [URLS.API, 'tickets/:Id/jobs/:jobId'].join('/')
            },
            saveComment: {
                method: 'POST',
                isArray: false,
                url: [URLS.API, 'tickets/:Id/comments'].join('/')
            },
            updateComment: {
                method: 'PUT',
                isArray: false,
                url: [URLS.API, 'tickets/:Id/comments/:idComment'].join('/')
            }
        }
    );
});

