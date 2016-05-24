/*global angular*/
'use strict';

angular
    .module('abuseApp')
    .controller('DialogNewsAddCtrl', function ($scope, $mdDialog, Toast, NewsFeed, Auth) {
        
        $scope.news = {
            author: Auth.getCurrentUser().username,
            date: new Date()
        };
        
        $scope.send = function() {
            NewsFeed.save($scope.news).$promise.then(
                function (data) {
                    Toast.success('News added successfully');
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
