/**
 * Created by Nishant on 11/21/2015.
 */
navTabsModule.directive('navigationTabs', function() {
   return {
       restrict: 'E',
       templateUrl: 'app/components/others/tabs/navigation-tabs.tpl.html',
       controller: 'NavTabsController'
   }
});