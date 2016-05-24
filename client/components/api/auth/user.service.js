/*global angular */
'use strict';

angular
    .module('abuseApp')
    .factory('User', function ($resource, URLS) {
        return $resource([URLS.API,'users/:id'].join('/'), {
            id: '@id'
        },{           
            getUser: {
                method: 'GET'
            },
            get: {
                method: 'GET',
                params: {
                    id:'me'
                }
            },
            update: {method: 'PUT'}
	      });
    });

