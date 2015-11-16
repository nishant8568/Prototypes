// jshint latedef:nofunc
'use strict';

angular
  .module('videochatapp', [
  'ui.router', 'ngMaterial'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/login');
    $locationProvider.html5Mode(true);
  })

  .factory('_', function() {
		return window._; // assumes underscore has already been loaded on the page
	});
