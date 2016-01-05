/**
 * Created by daniel on 10.12.2015.
 */

app.controller('AbcAppLandingController', ['$scope', '$location', 'authService', 'socket', 'utilityService',
    function ($scope, $location, authService, socket, utilityService) {
        var vm = this;
        vm.usersList = [];
        //vm.contacts = [];

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

        /*vm.loadContacts = function () {
            databaseService.loadContacts().then(function (data) {
                if (data.success) {
                    vm.contacts = data['contacts'];
                    updateOnlineStatus();
                    console.log("navigation-tabs.ctrl.js >> loadContacts >> contacts");
                    console.log(vm.contacts);
                } else {
                    alert(data.message);
                }
            })
        };

        var updateOnlineStatus = function(){
            for(var i=0; i<vm.contacts.length; i++){
                var contact = vm.contacts[i];
                contact.status = $scope.appCtrl.usersList.indexOf(contact.username) != -1;
            }
        };
        vm.loadContacts();*/
    }]);
