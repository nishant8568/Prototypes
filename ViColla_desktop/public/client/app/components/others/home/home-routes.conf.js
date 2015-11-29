/**
 * Created by Nishant on 11/21/2015.
 */

homeModule.config(function ($stateProvider) {
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'app/components/others/home/home.tpl.html',
            controller: 'HomeController'
        });
});