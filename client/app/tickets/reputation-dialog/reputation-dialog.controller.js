"use strict";

angular
    .module("abuseApp")
    .controller("ReputationDialogCtrl", function ($scope, Reputation, Proofs, Toast, $mdDialog, $timeout, $filter, item, source, ticketId) {

        $scope.rawData = "";

        $scope.init = function () {
            Reputation.getExternalDetails({ ip: item.ip, source: source }).$promise.then(
                function (data) {
                    $scope.rawData = data;
                    $scope.ticketId = ticketId;
                },
                function (err) {
                    Toast.error(err);
                    $mdDialog.cancel();
                }
            );
        };

        $scope.addProof = function (reputationEntry) {
            if (!window.getSelection().toString()) {
                return;
            }

            var proof = {
                content : window.getSelection().toString().trim()
            };

            if (~window.navigator.userAgent.search(/Firefox/i)) {
                // In Firefox, that's not as easy...
                // => https://www.w3.org/Bugs/Public/show_bug.cgi?id=10583
                // FF DOM component trims every spaces and line feed and that makes poor proof.
                // So, retrieve those proofs using regex from original entry.

                // Escape original caracters that might damage final regex
                var regex = proof.content.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
                // Replace every space by a class of spaces or line feed that can occurs several times.
                regex = regex.replace(/ /g, "[ \\r\\n]+");
                // Try to match this regex over the original string
                var match = reputationEntry.data.match("(" + regex + ")");
                if (!match || match.length < 2) {
                    return;
                }
                proof.content = match[1];
            }

            Proofs.save({ ticketId: ticketId }, proof).$promise.then(
                function (data) {
                    Toast.success(data.message);
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.remove = function () {
            $mdDialog.cancel(true);
        };
    });
