/**
 * Created by Antony on 11/29/2015.
 */
navTabsModule.config(function ($stateProvider) {
    $stateProvider
        .state('/', {
            url: '/',
            templateUrl: 'app/components/others/tabs/navigation-tabs.tpl.html',
            controller: 'NavTabsController'
        })
});