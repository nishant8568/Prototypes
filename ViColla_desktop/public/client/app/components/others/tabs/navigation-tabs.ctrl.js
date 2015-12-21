/**
 * Created by Antony on 11/21/2015.
 */

navTabsModule.controller('NavTabsController', ['$scope', 'authService', '$location', 'databaseService',
    function ($scope, authService, $location, databaseService) {
        'use strict';
        $scope.$on('eventFired', function (event, data) {
            $scope.max = 3;
            $scope.selectedIndex = 3;
        });
        $scope.loadContacts = function () {
            databaseService.loadContacts().then(function (data) {
                if (data.success) {
                    $scope.contacts = data['contacts'];
                    console.log("navigation-tabs.ctrl.js >> loadContacts >> contacts");
                    console.log($scope.contacts);
                } else {
                    alert(data.message);
                }
            })
        };

        $scope.loadCallHistory = function () {
            databaseService.loadCallHistory($scope.appCtrl.user.id).then(function (data) {
                if (data.success) {
                    $scope.callHistory = data["callHistory"];
                } else {
                    alert(data.message);
                }
            })
        };
        $scope.videoChatData = function () {
            databaseService.videoChatData($scope.appCtrl.user.id).then(function (data) {
                if (data.success) {
                    $scope.videoChat = data["videoChat"];
                } else {
                    alert(data.message);
                }
            })
        };
        $scope.loadCallHistory();

    }]);