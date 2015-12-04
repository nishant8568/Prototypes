/**
 * Created by Nishant on 11/21/2015.
 */
onlineModeModule.controller('onlineModeController', function ($scope) {
    'use strict';

    $scope.callers = [
        {
            firstName: "Andy",
            lastName: "Strauss",
            call_status: "call_received",
            dateTime: "07/11/2015"
        },
        {
            firstName: "Michael",
            lastName: "Hall",
            call_status: "call_missed",
            dateTime: "09/11/2015"
        },
        {
            firstName: "Tim",
            lastName: "Smith",
            call_status: "call_missed",
            dateTime: "11/11/2015"
        },
        {
            firstName: "Andrew",
            lastName: "Clark",
            call_status: "call_received",
            dateTime: "15:32"
        }
    ];
});