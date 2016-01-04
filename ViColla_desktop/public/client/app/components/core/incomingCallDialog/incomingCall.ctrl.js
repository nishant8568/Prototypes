/**
 * Created by Antony on 12/6/2015.
 */
incomingCallModule.controller('incomingCallDialogController', function ($scope, $mdDialog, message, callerinfo) {
    'use strict';

    $scope.user = callerinfo;

    $scope.userDetails = message;
    $scope.answer = function(answer) {
        if(answer=='receive')
            $mdDialog.hide($scope.userDetails.callername);
        else
            $mdDialog.hide();
    };
});