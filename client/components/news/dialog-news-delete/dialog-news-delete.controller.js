/*global angular*/
'use strict';

angular
    .module('abuseApp')
    .controller('DialogNewsDeleteCtrl', function ($scope, $mdDialog, Toast, NewsFeed, news) {
        
        $scope['delete'] = function() {
            NewsFeed['delete'](news).$promise.then(
                function (data) {
                    Toast.success('News removed successfully');
                    $mdDialog.hide(data);
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };
        
        $scope.cancel = function() {
            $mdDialog.cancel();
        };        
    });
