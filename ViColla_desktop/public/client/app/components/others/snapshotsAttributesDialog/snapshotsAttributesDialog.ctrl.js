/**
 * Created by Antony on 11/28/2015.
 */
snapshotsAttributesModule.controller('snapshotsAttributesController', function($scope, $mdDialog, playbackTime) {
    $scope.attributesDialogIcons = [
        { name: 'Close', icon: 'close' }
    ];
    $scope.durationSet = 3;
    $scope.videoplayTime = playbackTime;
    $scope.hide = function() {
        $mdDialog.hide();
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    $scope.answer = function(answer) {
        $mdDialog.hide([$scope.durationSet, $scope.videoplayTime, $scope.description]);
    };
});