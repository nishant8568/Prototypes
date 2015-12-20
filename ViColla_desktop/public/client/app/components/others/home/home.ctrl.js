/**
 * Created by Antony on 11/21/2015.
 */
homeModule.controller('HomeController', ['$scope', 'authService', '$window', '$location',
    function ($scope, authService, $window, $location) {
        'use strict';

        var vm = this;
        vm.user = {
            username: "",
            password: ""
        };

        vm.submitCredentials = function () {
            authService.login(vm.user)
                .then(function (data) {
                    if (data.success) {
                        $scope.appCtrl.user = data["user"];
                        localStorage.setItem('username', $scope.appCtrl.user.username);
                        //console.log($scope.appCtrl.user.username);
                        $location.path('/')
                    } else {
                        $window.alert(data["message"]);
                    }
                })
        };

        vm.test_session = function () {
            authService.test_session()

        };
        vm.logout = function () {
            authService.logout()

        };
    }]);