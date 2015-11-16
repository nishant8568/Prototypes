'use strict';

angular.module('videochatapp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('home', {
        url: '/home/:roomname/:username',
        templateUrl: 'app/home/home.html',
        controller: 'HomeCtrl'
      })
      ;
  });
