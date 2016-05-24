/*global angular*/
'use strict';

angular
    .module('abuseApp')
    .controller('DialogNewsEditCtrl', function ($scope, $mdDialog, Toast, NewsFeed, Auth, news) {
        
        $scope.news = news || {
            author: Auth.getCurrentUser().username,
            date: new Date()
        };
        
        $scope.send = function() {

            NewsFeed.update({id: $scope.news.id}, $scope.news).$promise.then(
                function (data) {
                    Toast.success('News updated successfully');
                    $mdDialog.hide(data);
                },
                function (err) {
                    $mdDialog.cancel(err);
                    Toast.error(err);
                }
            );
        };
        
        $scope.cancel = function() {
            $mdDialog.cancel();
        };        
});
