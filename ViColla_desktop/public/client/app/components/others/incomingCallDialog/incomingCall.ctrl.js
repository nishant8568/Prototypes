/**
 * Created by Antony on 12/6/2015.
 */
incomingCallModule.controller('incomingCallDialogController', function ($scope, $mdDialog, message) {
    'use strict';

    $scope.user = {
        firstName: "Tim",
        lastName: "Smith",
        place: "Augsburg",
        designation: "Field Engineer"
    };

    $scope.userDetails = message;
    $scope.answer = function(answer) {
        $mdDialog.hide($scope.userDetails.callername);
    };
});