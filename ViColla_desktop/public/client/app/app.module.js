/**
 * Created by Nishant on 11/21/2015.
 */

'use strict';

var homeModule = angular.module('homeModule', []);
var registerModule = angular.module('registerModule', []);
var headerModule = angular.module('headerModule', []);
var navTabsModule = angular.module('navTabsModule', []);
var onlineModeModule = angular.module('onlineModeModule', []);
var contactsModule = angular.module('contactsModule', []);
var offlineModeModule = angular.module('offlineModeModule', []);
var toolsModule = angular.module('toolsModule', []);
var snapshotsModule = angular.module('snapshotsModule', []);
var snapshotsAttributesModule = angular.module('snapshotsAttributesModule', []);

var app = angular.module('viCollaApp', [
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
    'snapshotsAttributesModule'
]);