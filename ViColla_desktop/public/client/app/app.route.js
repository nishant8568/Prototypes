/**
 * Created by Nishant on 11/21/2015.
 */
'use strict';

app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider
        .otherwise('/home');
});