/**
 * Created by Antony on 11/21/2015.
 */
headerModule.controller('HeaderController', ['$scope', '$location', 'authService', function ($scope, $location, authService) {
    'use strict';

    var vm = this;

    $scope.logout = function () {
        $scope.appCtrl.user = {};       

        authService.logout()
            .then(function (data) {
                $location.path('/login')
            })
    };
    $scope.showSettings = function () {
        alert("showSettings");
    };
    $scope.showInfo = function () {
        alert("showInfo");
    };
    $scope.showAccountDetails = function () {
        alert("showAccountDetails");
    };
}]);