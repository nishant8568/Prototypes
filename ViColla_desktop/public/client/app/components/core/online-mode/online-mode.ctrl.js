/**
 * Created by Antony on 11/21/2015.
 */
onlineModeModule.controller('onlineModeController', ['$scope', 'callHistoryService',
    function ($scope, callHistoryService) {
        'use strict';
        var vm = this;
        $scope.max = 3;
        $scope.selectedIndex = 0;
        $scope.uname = localStorage.getItem('username');
        //callHistoryService.getCallHistory().then(function (data) {
        //  $scope.callers = data["callHistory"];
        //   console.log($scope.callers);
        //});
    }]);