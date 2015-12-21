/**
 * Created by Antony on 11/21/2015.
 */
onlineModeModule.controller('onlineModeController', ['$scope', 'utilityService',
    function ($scope, utilityService) {
        'use strict';
        var vm = this;
        $scope.max = 3;
        $scope.selectedIndex = 0;
        $scope.utilityService = utilityService;
    }]);