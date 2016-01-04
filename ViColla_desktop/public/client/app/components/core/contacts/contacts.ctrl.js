/**
 * Created by Antony on 11/29/2015.
 */
contactsModule.controller('contactsController', ['databaseService', '$scope', '$http', 'authService', '$location', '$window', '$timeout', 'config', 'socket','$state',
    function (databaseService, $scope, $http, authService, $location, $window, $timeout, config, socket, $state) {
    'use strict';

    var vm = this;
    $scope.searchContactByName = '';
    $scope.searchContactByTag = '';


    $scope.max = 3;
    $scope.selectedIndex = 1;


        vm.loadContacts = function () {
            databaseService.loadContacts().then(function (data) {
                if (data.success) {
                    vm.contacts = data['contacts'];
                    for(var i=0; i<vm.contacts.length; i++){
                        var contact = vm.contacts[i];
                        if ($scope.appCtrl.usersList.indexOf(contact.username) != -1){
                            contact.status = true;
                        }else{
                            contact.status = false;
                        }
                    }
                    console.log("navigation-tabs.ctrl.js >> loadContacts >> contacts");
                    console.log(vm.contacts);
                } else {
                    alert(data.message);
                }
            })
        };
        vm.loadContacts();

    $scope.videoCall = function (receivername) {

        var caller = {
            callername: $scope.appCtrl.user.username,
            callerinfo: $scope.appCtrl.user,
            receivername: receivername,
            roomname: $scope.$parent.navTabsCtrl.room,
            startDateTime: Date.now()
        };
        socket.emit('calling', JSON.stringify(caller));
        $state.go('tabs.onlineMode');
        databaseService.addItem(3);
    };

}]);