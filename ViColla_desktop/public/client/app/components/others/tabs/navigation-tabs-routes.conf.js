/**
 * Created by Nishant on 11/29/2015.
 */
navTabsModule.config(function ($stateProvider) {
    $stateProvider
        .state('modes', {
            url: '/modes',
            templateUrl: 'app/components/others/tabs/navigation-tabs.tpl.html',
            controller: 'NavTabsController'
        })
});