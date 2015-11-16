'use strict';

angular.module('videochatapp')
.controller( 'LoginCtrl', function authorsCtrl($scope, $http,$location) {

       $scope.login=function(user) {
           $location.path('/home/'+user.roomname+'/'+user.username);
       };

});
