/**
 * Created by Nishant on 11/21/2015.
 */
headerModule.controller('HeaderController', function ($scope) {
    'use strict';

    $scope.user = {
        firstName: "Nishant",
        lastName: "Gupta",
        email: "nishant.gupta@tum.de",
        tags: ["laptop", "printer"]
    };
    $scope.logout = function () {
        alert("logout");
    };
    $scope.showSettings = function() {
        alert("showSettings");
    };
    $scope.showInfo = function() {
        alert("showInfo");
    };
    $scope.showAccountDetails = function() {
        alert("showAccountDetails");
    };
});