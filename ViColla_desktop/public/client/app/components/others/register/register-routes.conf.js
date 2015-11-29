/**
 * Created by Nishant on 11/29/2015.
 */
registerModule.config(function ($stateProvider) {
    $stateProvider
        .state('register', {
            url: '/register',
            templateUrl: 'app/components/others/register/register.tpl.html',
            controller: 'RegisterController'
        });
});