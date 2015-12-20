/**
 * Created by Antony on 11/21/2015.
 */

'use strict';

var authModule = angular.module('authModule', []);
var homeModule = angular.module('homeModule', ['authModule']);
var registerModule = angular.module('registerModule', ['authModule']);
var headerModule = angular.module('headerModule', []);
var navTabsModule = angular.module('navTabsModule', ['authModule', 'databaseModule']);
var onlineModeModule = angular.module('onlineModeModule', ['callHistoryModule']);
var contactsModule = angular.module('contactsModule', []);
var offlineModeModule = angular.module('offlineModeModule', ["databaseModule"]);
var toolsModule = angular.module('toolsModule', []);
var snapshotsModule = angular.module('snapshotsModule', []);
var snapshotsAttributesModule = angular.module('snapshotsAttributesModule', []);
var incomingCallModule = angular.module('incomingCallModule', []);
var videochatModule = angular.module('videochatModule', []);

var app = angular.module('AbcApp', [
    'ngMaterial',
    'ui.router',
    'homeModule',
    'registerModule',
    'headerModule',
    'navTabsModule',
    'onlineModeModule',
    'contactsModule',
    'offlineModeModule',
    'toolsModule',
    'snapshotsModule',
    'snapshotsAttributesModule',
    'incomingCallModule',
    'authModule',
    'callHistoryModule',
    'databaseModule',
    'videochatModule'
    
]);

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    var file = element[0].files[0];
                    modelSetter(scope, file);
                })
            })
        }
    }
}]);
