angular
    .module("abuseApp")
    .controller("TicketProofsCtrl", function ($scope, Proofs, Toast) {
        "use strict";

        var ctrlProofs = this;

        ctrlProofs.removeProof = function (proof) {
            Proofs.remove({ ticketId: $scope.ctrl.ticket.id, Id: proof.id }).$promise.then(
                function () {
                    Toast.success("Proof has been successfully removed.");
                    $scope.ctrl.getProofs();
                },
                function (err) {
                    Toast.error(err);
                }
            );
        };
    });
