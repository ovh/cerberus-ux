/*global angular*/
'use strict';

angular
    .module('abuseApp')
    .filter('htmlToPlainText', function () {
        return function (input) {
            if (input.match(/<body>([\s\S]*)<\/body>/ig)) {
                return angular.element(input.match(/<body>([\s\S]*)<\/body>/ig)[0]).text();
            }
            return input;
        };
    });
