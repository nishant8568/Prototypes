/**
 * Created by Antony on 11/21/2015.
 */
headerModule.controller('HeaderController', ['$scope', '$location', 'authService', 'socket', function ($scope, $location, authService, socket) {
    'use strict';

    var vm = this;

    $scope.logout = function () {
        var userinfo = {roomname: "ChatRoom", username: $scope.appCtrl.user.username};
        socket.emit('logoutme', JSON.stringify(userinfo));
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