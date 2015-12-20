/**
 * Created by Antony on 11/21/2015.
 */
'use strict';

app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider
        .otherwise('/');
    
});

//app.run(function ($rootScope, $location, authService) {
//    // Redirect to login if route requires auth and you're not logged in
//    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
//        authService.test_session(function(loggedIn) {
//            if (toState.authenticate && !loggedIn) {
//                $rootScope.returnToState = toState.url;
//                $rootScope.returnToStateParams = toParams.Id;
//                $location.path('/login');
//            }
//        });
//    });
//});