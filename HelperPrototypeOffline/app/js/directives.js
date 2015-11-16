/**
 * Created by Nishant on 8/28/2015.
 */
angular.module('mainApp')
    .directive('mainHeaderToolbar', function() {
        return {
            restrict: "E",
            templateUrl: "app/partials/mainHeader.html"
        }
    })
    .directive('myToolbox', function() {
        return {
            restrict: "E",
            $scope: {
                name: "="
            },
            templateUrl: "app/partials/toolbox.html",
            controller: "ToolboxController"
        }
    })
    .directive('clearButton', function() {
        return {
            restrict: "E",
            templateUrl: "app/partials/clearButton.html",
            controller: "ClearOptionsController"
        }
    })
    .directive('selectVideoButton', function() {
        return {
            restrict: "E",
            templateUrl: "app/partials/selectVideoButton.html",
            controller: "SelectVideoOptionsController"
        }
    })
    .directive('videoPlayer', function() {
        return {
            restrict: "E",
            templateUrl: "app/partials/videoPlayer.html"
        }
    });