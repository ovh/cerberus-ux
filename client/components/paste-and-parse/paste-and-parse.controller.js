/*global angular*/
'use strict';

angular
    .module('abuseApp')
    .controller('PasteAndParseDialogCtrl', function ($scope, Toast, $mdDialog, $timeout, $filter, parsing, formatting, processing) {

        $scope.rawData = '';
        $scope.parsedData = undefined;
        $scope.processing = false;


        $scope.init = function () { };
        
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        
        $scope.displayParsedData = function() {

            $scope.parsedData = [];

            if(!parsing || !formatting) {
                return;
            }

            // Split by any of thoses : spaces , ; [ ] # ( ) { } " ' |
            var items = $scope.rawData.split(/(\s|,|;|\[|\]|#|\(|\)|{|}|"|'|\|)/);
            for(var i in items) {
                // Remove trailing dot if any to be more efficient
                items[i] = items[i].replace(/\.$/, '');

                if(items[i].trim().length > 0 && parsing(items[i])) {
                    $scope.parsedData.push(formatting(items[i]));
                }
            }
        };

        $scope.removeParsedData = function(entry) {
            for(var i in $scope.parsedData) {

                var equals = true;
                for(var k in Object.keys($scope.parsedData[i])) {
                    if($scope.parsedData[i][k] !== entry[k]) {
                        equals = false;
                        break;
                    }
                }

                if(equals) {
                    $scope.parsedData.splice(i, 1);
                    break;
                }
            }
        };

        $scope.processParsedData = function() {
            $scope.processing = true;

            $scope.parsedData.forEach(function(current) {
                current.status = 'Doing...';
                
                processing(current)
                .then(
                    function() {
                        current.status = 'Ok';
                    },
                    function(err) {
                        current.status = err.data.message;
                    }
                );
            });
        };

        $scope.validate = function() {
            $mdDialog.hide($scope.parsedData);
        };
});
