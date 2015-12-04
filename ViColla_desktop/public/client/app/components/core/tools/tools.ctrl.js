/**
 * Created by Nishant on 11/27/2015.
 */
toolsModule.controller('toolsController', function ($scope, $q, $timeout) {

    'use strict';

    $scope.tools = [
        {
            name: 'pen',
            icon: 'create'
        },
        {
            name: 'line',
            icon: 'remove'
        },
        {
            name: 'circle',
            icon: 'panorama_fish_eye'
        },
        {
            name: 'rectangle',
            icon: 'crop_5_4'
        },
        {
            name: 'triangle',
            icon: 'change_history'
        },
        {
            name: 'text',
            icon: 'text_format'
        }
    ];
    $scope.actions = [
        {
            name: 'undo',
            icon: 'undo',
            method: 'undo'
        },
        {
            name: 'save',
            icon: 'save',
            method: 'saveSnapshot'
        }
    ];

    $scope.disableTools = true;

    $scope.toolClicked = function ($index) {
        $scope.tool = $scope.tools[$index].name;
    };

    $scope.colorClicked = function (color) {
        alert(color);
    };

    $scope.actionClicked = function ($index) {
        if ($scope.actions[$index].method == "undo") {
            $scope.undo();
        } else {
            $scope.save();
        }
    };


});