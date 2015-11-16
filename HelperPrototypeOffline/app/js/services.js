/**
 * Created by Nishant on 8/28/2015.
 */
angular.module('mainApp')
    .service('ToolsService', function() {
        var toolSelected = null;
        var colorSelected = null;
        var brushThickness = null;
        var setTool = function(newTool) {
            toolSelected = newTool;
        };
        var getTool = function() {
            return toolSelected;
        };
        var setColor = function(selectedColor) {
            colorSelected = selectedColor;
        };
        var getColor = function() {
            return colorSelected;
        };
        var setBrushThickness = function(thickness) {
            brushThickness = thickness;
        };
        var getBrushThickness = function() {
            return brushThickness;
        };
        return {
            setTool: setTool,
            getTool: getTool,
            setColor: setColor,
            getColor: getColor,
            setBrushThickness: setBrushThickness,
            getBrushThickness: getBrushThickness
        };
    });