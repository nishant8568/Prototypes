/**
 * Created by Nishant on 11/21/2015.
 */
onlineModeModule.directive('onlineMode', function () {
   return {
       templateUrl: 'app/components/core/online-mode/online-mode.tpl.html',
       controller: 'onlineModeController',
       replace: true
   }
});