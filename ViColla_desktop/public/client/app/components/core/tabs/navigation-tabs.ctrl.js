/**
 * Created by Antony on 11/21/2015.
 */

navTabsModule.controller('NavTabsController', ['$scope', '$rootScope', 'authService', '$location', 'databaseService', 'socket', '$state', 'utilityService',
    function ($scope, $rootScope, authService, $location, databaseService, socket,  $state, utilityService) {
        'use strict';

        var vm = this;
        vm.optionSelected = "qwertyuiop";

        $scope.currentTab = $state.current.data.selectedTab;

        $scope.room = "ChatRoom";
        $scope.isInitiator = false;
        $scope.isChannelReady = false;
        $scope.callerdetails = {};


        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $scope.currentTab = toState.data.selectedTab;
        });

        $scope.$on('eventFired', function (event, data) {
            $scope.max = 3;
            $scope.selectedIndex = 3;
        });

        $scope.videoChatData = function () {
            databaseService.videoChatData($scope.appCtrl.user.id).then(function (data) {
                if (data.success) {
                    $scope.videoChat = data["videoChat"];
                } else {
                    alert(data.message);
                }
            })
        };


        var userinfo = {
            room: $scope.room,
            username: ($scope.appCtrl.user) ? $scope.appCtrl.user.username : undefined
        };

        if ($scope.room !== '') {
            console.log('Create or join room', JSON.stringify(userinfo));
            console.log("called one time");
            socket.emit('create or join', JSON.stringify(userinfo));
        }

        socket.on('joined', function (room) {
            console.log('socket.on("joined") >> This peer '+ room.userinfo +' has joined room ' + room.room);
            if ($scope.appCtrl.usersList.indexOf(room.userinfo) == -1) {
                $scope.appCtrl.usersList.push(room.userinfo);
                //$scope.$apply();
            }
            $scope.isChannelReady = true;
        });

        socket.on('join', function (message) {
            console.log('socket.on("join") >> ' + message);
            if (message == "no users") {
                console.log("room created user");
            }
            else {
                console.log("room joined user");
                if ($scope.appCtrl.usersList.indexOf(message) == -1) {
                    $scope.appCtrl.usersList.push(message);
                    //$scope.$apply();
                }
            }
            socket.emit('users', $scope.userlist);
            $scope.isChannelReady = true;
        });

        socket.on('all users', function(usernames){
            console.log('socket.on("all users") >> ');
            console.log(usernames);
            $scope.appCtrl.usersList = usernames;
            $rootScope.$broadcast("updateOnlineStatus");
        });

        socket.on('log', function (array) {
            console.log.apply(console, array);
        });

        $scope.$on('$destroy', function (event) {
            socket.removeAllListeners();
        });

        socket.on('called', function (caller) {
            console.log("socket.on('called') >> caller : ");
            console.log(caller);
            $scope.callerdetails = JSON.parse(caller);
            console.log("from navigation tabs ctrl", $state.current);
            if ($scope.callerdetails.callername == $scope.appCtrl.user.username) {
                $scope.isInitiator = true;
            }
            //if($state.url != "onlineMode"){
                $state.go('tabs.onlineMode');
            //}
        });
    }]);