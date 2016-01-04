/**
 * Created by daniel on 10.12.2015.
 */

app.controller('AbcAppLandingController', ['$scope', '$location', 'authService', 'socket', 'utilityService',
    function ($scope, $location, authService, socket, utilityService) {
        var vm = this;
        vm.usersList = [];

        authService.isLoggedIn().then(function (data) {
            if (data.success) {
                $scope.appCtrl.user = data["user"];
                console.log("emit user login");
                utilityService.setExpertFlag($scope.appCtrl.user.isExpert);
                socket.emit('userLogin', $scope.appCtrl.user.username);
            } else {
                $location.path('/login');
            }
        });
    }]);
