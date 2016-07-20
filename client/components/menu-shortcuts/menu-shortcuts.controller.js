/*global angular*/
'use strict';

angular.module('abuseApp')
    .controller('MenuShortcutsCtrl', function ($rootScope, $scope, Reports, Auth, Toast) {

        $scope.loaders = {
            stats: false
        };

        function getStats () {
            $scope.loaders.stats = true;

            return Reports.shortcutStats().$promise.then(
                function(stats) {
                    $scope.stats = stats;
                    $scope.loaders.stats = false;
                },
                function(err) {
                    Toast.error(err);
                    $scope.loaders.stats = false;
                }
            );
        }

        $scope.searchMyTickets = function () {
            return ['search?forceReload&filters=', window.encodeURI(JSON.stringify({
                treatedBy: Auth.getCurrentUser().username,
                status: ['Open','Alarm','Reopened','Paused','Answered','WaitingAnswer', 'ActionError']
            }))].join('');
        };

        $scope.searchMyTicketsAnswered = function () {
            return ['search?forceReload&filters=', window.encodeURI(JSON.stringify({
                treatedBy: Auth.getCurrentUser().username,
                status: ['Answered']
            }))].join('');
        };

        $scope.searchMyTicketsTodo = function () {
            return ['search?forceReload&filters=', window.encodeURI(JSON.stringify({
                treatedBy: Auth.getCurrentUser().username,
                status: ['Open','Alarm','Reopened', 'ActionError']
            }))].join('');
        };

        $scope.searchMyTicketsSleeping = function () {
            return ['search?forceRealod&filters=', window.encodeURI(JSON.stringify({
                treatedBy: Auth.getCurrentUser().username,
                status: ['WaitingAnswer','Paused']
            }))].join('');
        };

        $rootScope.$on('ticketsOrReportsUpdated', getStats);

        getStats();
    });

