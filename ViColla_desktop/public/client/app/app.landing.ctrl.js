/**
 * Created by daniel on 10.12.2015.
 */

app.controller('AbcAppLandingController', ['$scope', '$location', 'authService', function($scope, $location, authService){
    var vm = this;

    authService.isLoggedIn().then(function(data){
        if(data.success){
            $scope.appCtrl.user = data["user"];
        }else{
            $location.path('/login')
        }
    });
}]);
