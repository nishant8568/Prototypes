/**
 * Created by Nishant on 8/28/2015.
 */
angular.module('mainApp')
    .controller('MainController', ['$scope', 'ToolsService', '$compile', '$mdDialog', '$timeout', '$mdSidenav', '$mdUtil', '$log',
        function($scope, ToolsService, $compile, $mdDialog, $timeout, $mdSidenav, $mdUtil, $log){
            $scope.resourceDir = 'app/resources/';
            //$scope.clearOption = "";
            console.log('==== main ====');
            //$scope.canvasElement = document.getElementById('outputCanvas');
            $scope.canvasElement = angular.element($('#outputCanvas'))[0];
            $scope.ctx = $scope.canvasElement.getContext('2d');
            $scope.ctx.canvas.width = $scope.ctx.canvas.offsetWidth;
            $scope.ctx.canvas.height = $scope.ctx.canvas.offsetHeight;
            // variable that decides if something should be drawn on mousemove
            $scope.drawing = false;
            $scope.drawingStyle = "Pen";
            $scope.strokeColor = 'black';
            $scope.brushThickness = 1;
            $scope.currentTime = 0;
            // the last coordinates before the current move
            $scope.lastX;
            $scope.lastY;
            $scope.penClicks = [];
            $scope.tempLines = [];
            $scope.drawnLines = [];
            $scope.tempRectangles = [];
            $scope.drawnRectangles = [];
            $scope.tempCircles = [];
            $scope.drawnCircles = [];
            $scope.tempTriangles = [];
            $scope.drawnTriangles = [];
            $scope.drawnText = [];
            $scope.isVideoReady = false;
            $scope.videoEnded = false;
            $scope.isVideoPaused = true;
            $scope.Math = window.Math;
            $scope.toggleRight = buildToggler('right');
            $scope.savedSnapshotsData = [];
            $scope.playerControls = [
                { name: 'Play', icon: 'play', show: true },
                { name: 'Pause', icon: 'pause', show: true },
                { name: 'Play Again', icon: 'replay', show: false }
            ];

            /**
             * Build handler to open/close a SideNav; when animation finishes
             * report completion in console
             */
            function buildToggler(navID) {
                var debounceFn =  $mdUtil.debounce(function(){
                    $mdSidenav(navID)
                        .toggle()
                        .then(function () {
                            $log.debug("toggle " + navID + " is done");
                        });
                },300);

                return debounceFn;
            }
            $scope.clearDrawings = function() {
                $scope.tempCircles = [];
                $scope.tempTriangles = [];
                $scope.tempLines = [];
                $scope.tempRectangles = [];
                $scope.drawnCircles = [];
                $scope.drawnTriangles = [];
                $scope.drawnLines = [];
                $scope.drawnRectangles = [];
                $scope.penClicks = [];
                if($scope.videoEnded) {
                    $scope.drawVideoOnCanvas();
                }
            };
            $scope.clearPenDrawings = function() {
                $scope.penClicks = [];
                if($scope.videoEnded) {
                    $scope.drawVideoOnCanvas();
                }
            };
            $scope.clearLineDrawings = function() {
                $scope.tempLines = [];
                $scope.drawnLines = [];
                if($scope.videoEnded) {
                    $scope.drawVideoOnCanvas();
                }
            };
            $scope.clearRectangleDrawings = function() {
                $scope.tempRectangles = [];
                $scope.drawnRectangles = [];
                if($scope.videoEnded) {
                    $scope.drawVideoOnCanvas();
                }
            };
            $scope.clearTriangleDrawings = function() {
                $scope.tempTriangles = [];
                $scope.drawnTriangles = [];
                if($scope.videoEnded) {
                    $scope.drawVideoOnCanvas();
                }
            };
            $scope.clearCircleDrawings = function() {
                $scope.tempCircles = [];
                $scope.drawnCircles = [];
                if($scope.videoEnded) {
                    $scope.drawVideoOnCanvas();
                }
            };
            $scope.clearTextDrawings = function() {
                $scope.drawnText = [];
                if($scope.videoEnded) {
                    $scope.drawVideoOnCanvas();
                }
            };
            $scope.createInputsForText = function(color, videoObject) {
                var idText = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for( var i=0; i < 5; i++ )
                    idText += possible.charAt(Math.floor(Math.random() * possible.length));
                var idContainer = idText + "_container";
                var idInputBox = idText + "_text";
                var idButton = idText + "_button";
                var leftPos = $scope.lastX;
                var topPos = $scope.lastY;
                var contentStyle = '{\"background\":\"transparent\", \"position\":\"absolute\",' +
                    '\"left\":\"' + leftPos + 'px\", \"top\":\"' + topPos + 'px\", \"width\":\"25%\", \"height\":\"25%\"}';
                var newElement =
                    "<md-content id=\"" + idContainer + "\" ng-style='" + contentStyle + "' layout-padding layout='row'>" +
                    "<md-input-container>" +
                    "<label ng-style='{\"color\":\"" + color + "\"}'>Text</label>" +
                    "<input id=\"" + idInputBox + "\" ng-style='{\"color\":\"" + color + "\"}'>" +
                    "</md-input-container>" +
                    "<md-button id=\"" + idButton + "\" ng-style='{\"color\":\"" + color + "\"}'>Apply</md-button></md-content>";
                var childNode = $compile(newElement)($scope);
                document.getElementById('whiteFrameContainer').appendChild(childNode[0]);
                document.getElementById(idButton).onclick = function(){
                    $scope.applyText(idInputBox, idContainer, leftPos, topPos, color, videoObject);
                };
            };
            $scope.saveSnapshot = function() {
                var videoObject = document.getElementById("videoBackgrounddata");
                var durationSet = 3;
                var playbackTime = videoObject.currentTime;
                $mdDialog.show({
                    controller: 'SnapshotAttributesDialogController',
                    templateUrl: 'app/partials/snapshotAttributesDialog.html',
                    locals: { playbackTime: playbackTime },
                    parent: angular.element(document.body)
                })
                    .then(function(answer) {
                        durationSet = answer[0];
                        playbackTime = answer[1];
                        console.log("duration : " + durationSet);
                        console.log("playbackTime : " + playbackTime);
                        $scope.toggleRight();
                        $scope.saveImage(playbackTime, durationSet);
                    }, function() {
                        console.log('text duration dialog closed');
                    });
            };
            $scope.applyText = function(textId, containerId, leftPos, topPos, color, videoObject) {
                var textToWrite = {
                    value: document.getElementById(textId).value,
                    left: leftPos,
                    top: topPos,
                    color: color,
                    duration: durationSet
                };
                var durationSet = 3;
                $scope.drawnText.push(textToWrite);
                console.log("duration : " + durationSet);
                document.getElementById(containerId).style.display = "none";
                //var playbackTime = videoObject.currentTime;
                //$scope.saveImage(playbackTime, durationSet);
                /*
                $mdDialog.show({
                    controller: 'TextDurationDialogController',
                    templateUrl: 'app/partials/textDurationDialog.html',
                    parent: angular.element(document.body)
                })
                    .then(function(answer) {
                        durationSet = answer;
                        var playbackTime = "aa";
                        document.getElementById(containerId).style.display = "none";
                        videoObject.play();
                        $scope.drawnText.push(textToWrite);
                        console.log("duration : " + durationSet);
                        $scope.saveImage(playbackTime, durationSet);
                        $timeout(function () {
                            console.log("removing...");
                            var index = $scope.drawnText.indexOf(textToWrite);
                            if(index > -1) {
                                $scope.drawnText.splice(index, 1);
                            }
                        }, durationSet*1000);
                    }, function() {
                        console.log('text duration dialog closed');
                    });
                */
            };
            $scope.saveImage = function(playbackTime, duration) {
                var backgroundObject = document.getElementById("videoBackgrounddata");
                var width = ($scope.canvasElement.width);
                var height = ($scope.canvasElement.height);
                if ($scope.ctx) {
                    $scope.ctx.drawImage(backgroundObject, 0, 0, width, height);
                }
                var imgData = $scope.ctx.getImageData(0, 0, $scope.canvasElement.width, $scope.canvasElement.height);
                console.log("drawing video on canvas...");
                // draw all strokes over canvas
                $scope.ctx.putImageData(imgData, 0, 0);
                $scope.ctx.beginPath();
                $scope.drawPenStrokes();
                $scope.drawRectangleStrokes();
                $scope.drawLineStrokes();
                $scope.drawTriangleStrokes();
                $scope.drawCircleStrokes();
                $scope.drawTextStrokes();

                // clear strokes data from respective arrays
                $scope.clearDrawings();

                var snapshotElement =
                    "<md-grid-list id=\"snapshotsList_" + playbackTime + "\" md-cols=\"1\" md-row-height=\"" +
                    $scope.ctx.canvas.width + ":" + $scope.ctx.canvas.height + "\" " +
                    "style=\"border: 1px solid green\">" +
                    "<md-grid-tile id=\"snapshot_" + playbackTime + "\">" +
                    "<img id=\"canvasImg_" + playbackTime + "\" " +
                    "style=\"position: relative; width: 100%; height: 100%;\">" +
                    "<md-grid-tile-footer layout=\"row\" layout-align=\"space-between center\">" +
                    "<h3>Time : " + playbackTime + "</h3>" +
                    "<h3>Duration : " + duration + "</h3>" +
                    "</md-grid-tile-footer>" +
                    "</md-grid-tile>" +
                    "</md-grid-list>";
                var childNode = $compile(snapshotElement)($scope);
                document.getElementById('snapshots').appendChild(childNode[0]);
                // save canvas image as data url (png format by default)
                var dataURL = $scope.canvasElement.toDataURL();
                // set canvasImg image src to dataURL so it can be saved as an image
                document.getElementById('canvasImg_' + playbackTime).src = dataURL;
                var savedSnapshot = {
                    imageId: 'canvasImg_' + playbackTime,
                    playbackTime: playbackTime,
                    duration: duration
                };
                $scope.savedSnapshotsData.push(savedSnapshot);
            };
            $scope.mouseDownHandler = function($event) {
                var backgroundObject = document.getElementById("videoBackgrounddata");
                $scope.isVideoPaused = backgroundObject.paused;
                if($scope.isVideoPaused) {
                    if(ToolsService.getTool() != null) {
                        $scope.drawingStyle = ToolsService.getTool().name;
                    }
                    if(ToolsService.getColor() != null) {
                        $scope.strokeColor = ToolsService.getColor().color;
                    }
                    if(ToolsService.getBrushThickness() != null) {
                        $scope.brushThickness = ToolsService.getBrushThickness();
                    }

                    if($event.offsetX!==undefined){
                        $scope.lastX = $event.offsetX;
                        $scope.lastY = $event.offsetY;
                    } else {
                        $scope.lastX = $event.layerX - $event.currentTarget.offsetLeft;
                        $scope.lastY = $event.layerY - $event.currentTarget.offsetTop;
                    }
                    var color = $scope.strokeColor;
                    var thickness = $scope.brushThickness;
                    if($scope.drawingStyle.toLowerCase() == "pen") {
                        var penClick = {
                            posX: $scope.lastX,
                            posY: $scope.lastY,
                            drag: false,
                            color: color,
                            thickness: thickness
                        };
                        $scope.penClicks.push(penClick);
                    } else if($scope.drawingStyle.toLowerCase() == "text") {
                        var videoObject = document.getElementById("videoBackgrounddata");
                        videoObject.pause();
                        $scope.createInputsForText(color, videoObject);
                    }
                    // begins new line
                    $scope.ctx.beginPath();
                    $scope.drawing = true;
                }
            };
            $scope.mouseMoveHandler = function($event) {
                if($scope.drawing){
                    console.log("mouse moving over canvas...");
                    var currentX = 0;
                    var currentY = 0;
                    // get current mouse position
                    if($event.offsetX!==undefined){
                        currentX = $event.offsetX;
                        currentY = $event.offsetY;
                    } else {
                        currentX = $event.layerX - $event.currentTarget.offsetLeft;
                        currentY = $event.layerY - $event.currentTarget.offsetTop;
                    }
                    var color = $scope.strokeColor;
                    var thickness = $scope.brushThickness;
                    if($scope.drawingStyle.toLowerCase() == "pen") {
                        var penClick = {
                            posX: currentX,
                            posY: currentY,
                            drag: true,
                            color: color,
                            thickness: thickness
                        };
                        $scope.penClicks.push(penClick);
                        $scope.drawPenStrokes();
                    } else if($scope.drawingStyle.toLowerCase() == "rectangle") {
                        var drawnRectangle = {
                            startX: $scope.lastX,
                            startY: $scope.lastY,
                            sizeX: currentX - $scope.lastX,
                            sizeY: currentY - $scope.lastY,
                            color: color,
                            thickness: thickness
                        };
                        $scope.tempRectangles.push(drawnRectangle);
                        $scope.drawRectangleStrokes();
                    } else if($scope.drawingStyle.toLowerCase() == "line") {
                        var drawnLine = {
                            startX: $scope.lastX,
                            startY: $scope.lastY,
                            endX: currentX,
                            endY: currentY,
                            color: color,
                            thickness: thickness
                        };
                        $scope.tempLines.push(drawnLine);
                        $scope.drawLineStrokes();
                    } else if($scope.drawingStyle.toLowerCase() == "circle") {
                        var drawnCircle = {
                            startX: $scope.lastX,
                            startY: $scope.lastY,
                            endX: currentX,
                            endY: currentY,
                            color: color,
                            thickness: thickness
                        };
                        $scope.tempCircles.push(drawnCircle);
                        $scope.drawCircleStrokes();
                    } else if($scope.drawingStyle.toLowerCase() == "triangle") {
                        var drawnTriangle = {
                            startX: $scope.lastX,
                            startY: $scope.lastY,
                            endX: currentX,
                            endY: currentY,
                            thirdX: $scope.lastX + 2*(currentX - $scope.lastX),
                            thirdY: $scope.lastY,
                            color: color,
                            thickness: thickness
                        };
                        $scope.tempTriangles.push(drawnTriangle);
                        $scope.drawTriangleStrokes();
                    }
                }
            };
            $scope.mouseUpHandler = function($event) {
                // stop drawing
                $scope.drawing = false;
                var currentX = 0;
                var currentY = 0;
                if($event.offsetX!==undefined){
                    currentX = $event.offsetX;
                    currentY = $event.offsetY;
                } else {
                    currentX = $event.layerX - $event.currentTarget.offsetLeft;
                    currentY = $event.layerY - $event.currentTarget.offsetTop;
                }
                var color = $scope.strokeColor;
                var thickness = $scope.brushThickness;
                if($scope.drawingStyle.toLowerCase() == "line") {
                    var drawnLine = {
                        startX: $scope.lastX,
                        startY: $scope.lastY,
                        endX: currentX,
                        endY: currentY,
                        color: color,
                        thickness: thickness
                    };
                    $scope.drawnLines.push(drawnLine);
                } else if($scope.drawingStyle.toLowerCase() == "rectangle") {
                    var drawnRectangle = {
                        startX: $scope.lastX,
                        startY: $scope.lastY,
                        sizeX: currentX - $scope.lastX,
                        sizeY: currentY - $scope.lastY,
                        color: color,
                        thickness: thickness
                    };
                    $scope.drawnRectangles.push(drawnRectangle);
                } else if($scope.drawingStyle.toLowerCase() == "circle") {
                    var drawnCircle = {
                        startX: $scope.lastX,
                        startY: $scope.lastY,
                        endX: currentX,
                        endY: currentY,
                        color: color,
                        thickness: thickness
                    };
                    $scope.drawnCircles.push(drawnCircle);
                } else if($scope.drawingStyle.toLowerCase() == "triangle") {
                    var drawnTriangle = {
                        startX: $scope.lastX,
                        startY: $scope.lastY,
                        endX: currentX,
                        endY: currentY,
                        thirdX: $scope.lastX + 2*(currentX - $scope.lastX),
                        thirdY: $scope.lastY,
                        color: color,
                        thickness: thickness
                    };
                    $scope.drawnTriangles.push(drawnTriangle);
                }
            };
            $scope.reset = function() {
                $scope.canvasElement.width = $scope.canvasElement.width;
            };
            $scope.playVideo = function() {
                if($scope.isVideoReady) {
                    if($scope.videoEnded) {
                        $scope.videoEnded = false;
                        $scope.playerControls[0].show = true;
                        $scope.playerControls[1].show = true;
                        $scope.playerControls[2].show = false;
                        $scope.clearDrawings();
                        var videoObject = document.getElementById("videoBackgrounddata");
                        videoObject.currentTime = '0';
                        videoObject.play();
                    }
                    $scope.clearDrawings();
                    $scope.drawCanvas();
                }
            };
            $scope.drawCanvas = function() {
                var backgroundObject = document.getElementById("videoBackgrounddata");
                $scope.videoEnded = backgroundObject.ended;
                $scope.isVideoPaused = backgroundObject.paused;
                if(!$scope.videoEnded && !$scope.isVideoPaused) {
                    if (window.requestAnimationFrame) window.requestAnimationFrame($scope.drawCanvas);
                    // IE implementation
                    else if (window.msRequestAnimationFrame) window.msRequestAnimationFrame($scope.drawCanvas);
                    // Firefox implementation
                    else if (window.mozRequestAnimationFrame) window.mozRequestAnimationFrame($scope.drawCanvas);
                    // Chrome implementation
                    else if (window.webkitRequestAnimationFrame) window.webkitRequestAnimationFrame($scope.drawCanvas);
                    // Other browsers that do not yet support feature
                    else setTimeout($scope.drawCanvas, 16.7);
                    $scope.drawVideoOnCanvas();
                }
                else if($scope.videoEnded) {
                    //$scope.videoEnded = true;
                    $scope.playerControls[2].show = true;
                    $scope.playerControls[0].show = false;
                    $scope.playerControls[1].show = false;
                    console.log("Video Ended. Stopping the video draw on canvas");
                } else if($scope.isVideoPaused && !$scope.videoEnded) {
                    console.log("Video Paused. Stopping the video draw on canvas");
                }
            };
            $scope.drawVideoOnCanvas = function() {
                var backgroundObject = document.getElementById("videoBackgrounddata");
                var width = ($scope.canvasElement.width);
                var height = ($scope.canvasElement.height);
                if ($scope.ctx) {
                    $scope.ctx.drawImage(backgroundObject, 0, 0, width, height);
                }

                /*
                 var imgData = $scope.ctx.getImageData(0, 0, $scope.canvasElement.width, $scope.canvasElement.height);
                 console.log("drawing video on canvas...");
                 $scope.ctx.putImageData(imgData, 0, 0);
                $scope.ctx.beginPath();
                $scope.drawPenStrokes();
                $scope.drawRectangleStrokes();
                $scope.drawLineStrokes();
                $scope.drawTriangleStrokes();
                $scope.drawCircleStrokes();
                $scope.drawTextStrokes();
                */
            };
            $scope.drawTextStrokes = function() {
                for (var i = 0; i < $scope.drawnText.length; i++) {
                    $scope.ctx.beginPath();
                    $scope.ctx.font = "10pt Arial";
                    $scope.ctx.fillStyle = $scope.drawnText[i].color;
                    $scope.ctx.fillText($scope.drawnText[i].value, $scope.drawnText[i].left, $scope.drawnText[i].top);
                }
            };
            // freehand pen drawing
            $scope.drawPenStrokes = function() {
                for (var i = 1; i < $scope.penClicks.length; i++) {
                    $scope.ctx.beginPath();
                    if ($scope.penClicks[i].drag) {
                        $scope.ctx.moveTo($scope.penClicks[i - 1].posX, $scope.penClicks[i - 1].posY);
                    } else {
                        $scope.ctx.moveTo($scope.penClicks[i].posX - 1, $scope.penClicks[i].posY);
                    }
                    $scope.ctx.lineTo($scope.penClicks[i].posX, $scope.penClicks[i].posY);
                    $scope.ctx.lineWidth = $scope.penClicks[i].thickness;
                    $scope.ctx.strokeStyle = $scope.penClicks[i].color;
                    $scope.ctx.stroke();
                }
            };
            // lines
            $scope.drawLineStrokes = function() {
                $scope.ctx.beginPath();
                var numberOfTempLines = $scope.tempLines.length;
                if(numberOfTempLines > 0) {
                    // introduced drawVideoOnCanvas() here while moving from video to photo as base for drawing
                    $scope.drawVideoOnCanvas();
                    $scope.ctx.moveTo($scope.tempLines[numberOfTempLines - 1].startX, $scope.tempLines[numberOfTempLines - 1].startY);
                    $scope.ctx.lineTo($scope.tempLines[numberOfTempLines - 1].endX, $scope.tempLines[numberOfTempLines - 1].endY);
                    //$scope.ctx.strokeStyle = $scope.strokeColor;//"#4bf";
                    $scope.ctx.lineWidth = $scope.tempLines[numberOfTempLines - 1].thickness;
                    $scope.ctx.strokeStyle = $scope.tempLines[numberOfTempLines - 1].color;
                    $scope.ctx.stroke();
                }
                $scope.drawFinalLines();
                $scope.drawFinalTriangles();
                $scope.drawFinalRectangles();
                $scope.drawFinalCircles();
            };
            // circles
            $scope.drawCircleStrokes = function() {
                $scope.ctx.beginPath();
                var numberOfTempCircles = $scope.tempCircles.length;
                if(numberOfTempCircles > 0) {
                    // introduced drawVideoOnCanvas() here while moving from video to photo as base for drawing
                    $scope.drawVideoOnCanvas();
                    var radiusX = ($scope.tempCircles[numberOfTempCircles - 1].endX - $scope.tempCircles[numberOfTempCircles - 1].startX) * 0.5;
                    var radiusY = ($scope.tempCircles[numberOfTempCircles - 1].endY - $scope.tempCircles[numberOfTempCircles - 1].startY) * 0.5;
                    var centerX = $scope.tempCircles[numberOfTempCircles - 1].startX + radiusX;
                    var centerY = $scope.tempCircles[numberOfTempCircles - 1].startY + radiusY;
                    var step = 0.01;
                    var a = step;
                    var pi2 = Math.PI * 2 - step;
                    $scope.ctx.moveTo(centerX + radiusX * Math.cos(0), centerY + radiusY * Math.sin(0));
                    for (; a < pi2; a += step) {
                        $scope.ctx.lineTo(centerX + radiusX * Math.cos(a), centerY + radiusY * Math.sin(a));
                    }
                    $scope.ctx.closePath();
                    $scope.ctx.lineWidth = $scope.tempCircles[numberOfTempCircles - 1].thickness;
                    $scope.ctx.strokeStyle = $scope.tempCircles[numberOfTempCircles - 1].color;//"#4bf";
                    $scope.ctx.stroke();
                }
                $scope.drawFinalLines();
                $scope.drawFinalTriangles();
                $scope.drawFinalRectangles();
                $scope.drawFinalCircles();
            };
            // triangles
            $scope.drawTriangleStrokes = function() {
                $scope.ctx.beginPath();
                var numberOfTempTriangles = $scope.tempTriangles.length;
                if(numberOfTempTriangles > 0) {
                    // introduced drawVideoOnCanvas() here while moving from video to photo as base for drawing
                    $scope.drawVideoOnCanvas();
                    $scope.ctx.moveTo($scope.tempTriangles[numberOfTempTriangles - 1].startX, $scope.tempTriangles[numberOfTempTriangles - 1].startY);
                    $scope.ctx.lineTo($scope.tempTriangles[numberOfTempTriangles - 1].endX, $scope.tempTriangles[numberOfTempTriangles - 1].endY);
                    $scope.ctx.lineTo($scope.tempTriangles[numberOfTempTriangles - 1].thirdX, $scope.tempTriangles[numberOfTempTriangles - 1].thirdY);
                    $scope.ctx.lineTo($scope.tempTriangles[numberOfTempTriangles - 1].startX, $scope.tempTriangles[numberOfTempTriangles - 1].startY);
                    $scope.ctx.lineWidth = $scope.tempTriangles[numberOfTempTriangles - 1].thickness;
                    $scope.ctx.strokeStyle = $scope.tempTriangles[numberOfTempTriangles - 1].color;
                    $scope.ctx.stroke();
                }
                $scope.drawFinalLines();
                $scope.drawFinalTriangles();
                $scope.drawFinalRectangles();
                $scope.drawFinalCircles();
            };
            // rectangles
            $scope.drawRectangleStrokes = function() {
                $scope.ctx.beginPath();
                var numberOfTempRectangles = $scope.tempRectangles.length;
                if(numberOfTempRectangles > 0) {
                    // introduced drawVideoOnCanvas() here while moving from video to photo as base for drawing
                    $scope.drawVideoOnCanvas();
                    $scope.ctx.rect($scope.tempRectangles[numberOfTempRectangles - 1].startX,
                        $scope.tempRectangles[numberOfTempRectangles - 1].startY,
                        $scope.tempRectangles[numberOfTempRectangles - 1].sizeX,
                        $scope.tempRectangles[numberOfTempRectangles - 1].sizeY);
                    $scope.ctx.lineWidth = $scope.tempRectangles[numberOfTempRectangles - 1].thickness;
                    $scope.ctx.strokeStyle = $scope.tempRectangles[numberOfTempRectangles - 1].color;
                    $scope.ctx.stroke();
                }
                $scope.drawFinalLines();
                $scope.drawFinalTriangles();
                $scope.drawFinalRectangles();
                $scope.drawFinalCircles();
            };
            $scope.drawFinalCircles = function() {
                for (var i = 0; i < $scope.drawnCircles.length; i++) {
                    $scope.ctx.beginPath();
                    var radiusX = ($scope.drawnCircles[i].endX - $scope.drawnCircles[i].startX) * 0.5;
                    var radiusY = ($scope.drawnCircles[i].endY - $scope.drawnCircles[i].startY) * 0.5;
                    var centerX = $scope.drawnCircles[i].startX + radiusX;
                    var centerY = $scope.drawnCircles[i].startY + radiusY;
                    var step = 0.01;
                    var a = step;
                    var pi2 = Math.PI * 2 - step;
                    //$scope.ctx.beginPath();
                    $scope.ctx.moveTo(centerX + radiusX * Math.cos(0), centerY + radiusY * Math.sin(0));
                    for (; a < pi2; a += step) {
                        $scope.ctx.lineTo(centerX + radiusX * Math.cos(a), centerY + radiusY * Math.sin(a));
                    }
                    $scope.ctx.closePath();
                    $scope.ctx.lineWidth = $scope.drawnCircles[i].thickness;
                    $scope.ctx.strokeStyle = $scope.drawnCircles[i].color;//'#4bf';
                    $scope.ctx.stroke();
                }
            };
            $scope.drawFinalTriangles = function() {
                for (var i = 0; i < $scope.drawnTriangles.length; i++) {
                    $scope.ctx.beginPath();
                    $scope.ctx.moveTo($scope.drawnTriangles[i].startX, $scope.drawnTriangles[i].startY);
                    $scope.ctx.lineTo($scope.drawnTriangles[i].endX, $scope.drawnTriangles[i].endY);
                    $scope.ctx.lineTo($scope.drawnTriangles[i].thirdX, $scope.drawnTriangles[i].thirdY);
                    $scope.ctx.lineTo($scope.drawnTriangles[i].startX, $scope.drawnTriangles[i].startY);
                    $scope.ctx.lineWidth = $scope.drawnTriangles[i].thickness;
                    $scope.ctx.strokeStyle = $scope.drawnTriangles[i].color;//"#4bf";
                    $scope.ctx.stroke();
                }
            };
            $scope.drawFinalLines = function() {
                for (var i = 0; i < $scope.drawnLines.length; i++) {
                    $scope.ctx.beginPath();
                    $scope.ctx.moveTo($scope.drawnLines[i].startX, $scope.drawnLines[i].startY);
                    $scope.ctx.lineTo($scope.drawnLines[i].endX, $scope.drawnLines[i].endY);
                    //$scope.ctx.strokeStyle = $scope.strokeColor;//"#4bf";
                    $scope.ctx.lineWidth = $scope.drawnLines[i].thickness;
                    $scope.ctx.strokeStyle = $scope.drawnLines[i].color;
                    $scope.ctx.stroke();
                }
            };
            $scope.drawFinalRectangles = function() {
                for (var i = 0; i < $scope.drawnRectangles.length; i++) {
                    $scope.ctx.beginPath();
                    $scope.ctx.rect($scope.drawnRectangles[i].startX, $scope.drawnRectangles[i].startY,
                        $scope.drawnRectangles[i].sizeX, $scope.drawnRectangles[i].sizeY);
                    $scope.ctx.lineWidth = $scope.drawnRectangles[i].thickness;
                    $scope.ctx.strokeStyle = $scope.drawnRectangles[i].color;
                    $scope.ctx.stroke();
                }
            };
            $scope.playAugmentedVideo = function() {
                $mdDialog.show({
                    controller: 'AugmentedVideoDialogController',
                    templateUrl: 'app/partials/augmentedVideoDialog.html',
                    locals: {
                        canvasWidth: $scope.canvasElement.width,
                        canvasHeight: $scope.canvasElement.height,
                        snapshotsData: $scope.savedSnapshotsData
                    },
                    parent: angular.element(document.body)
                })
                    .then(function(answer) {

                    }, function() {
                        console.log('text duration dialog closed');
                    });
            };
        }])

    .controller('RightCtrl', function ($scope, $timeout, $mdSidenav, $log) {
        $scope.close = function () {
            $mdSidenav('right').close()
                .then(function () {
                    $log.debug("close RIGHT is done");
                });
        };
    })

    .controller('SelectVideoOptionsController', function($scope, video) {
        $scope.items = [
            { name: 'Select Video', icon: 'add' }
        ];
        $scope.uploadButton = angular.element($('#upload'))[0];
        $scope.openFileDialog = function(){
            $scope.uploadButton.click();
        };
        $scope.getVideoFile = function() {
            var videoName = $scope.uploadButton.value;
            if(videoName != null) {
                var nameSplit = videoName.split("\\");
                videoName = nameSplit[nameSplit.length - 1];
                video.addSource('mp4', $scope.resourceDir + videoName, true);
                console.log("video loaded...");
                $scope.isVideoReady = true;
                $scope.clearDrawings();
                $scope.videoEnded = false;
            } else {
                console.log("Invalid Video Selection");
            }
        };
    })

    .controller('AugmentedVideoDialogController', function($scope, $timeout, $mdDialog, canvasWidth, canvasHeight, snapshotsData) {
        $scope.augPlayerControls = [
            { name: 'Play', icon: 'play', show: true },
            { name: 'Pause', icon: 'pause', show: true },
            { name: 'Play Again', icon: 'replay', show: false }
        ];
        $scope.augCanvasWidth = canvasWidth;
        $scope.augCanvasHeight = canvasHeight;
        $scope.canvasElem = null;
        $scope.context = null;
        $scope.backgroundObject = document.getElementById("videoBackgrounddata");
        $scope.iterator = 0;
        $scope.nextSnapshotTime;
        $scope.nextImageElem;
        $scope.nextDuration;
        $scope.stopDrawing = false;
        $scope.videoOnceStarted = false;
        $scope.augmentedVideoDialogIcons = [
            { name: 'Close', icon: 'close' }
        ];
        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.pauseAugVideo = function() {
            $scope.backgroundObject.pause();
        };
        $scope.playAugVideo = function() {
            if(!$scope.videoOnceStarted) {
                $scope.backgroundObject.currentTime = 0;
            }
            $scope.backgroundObject.play();
            $scope.nextSnapshotTime = snapshotsData[$scope.iterator].playbackTime;
            $scope.nextImageElem = document.getElementById(snapshotsData[$scope.iterator].imageId);
            $scope.nextDuration = snapshotsData[$scope.iterator].duration;
            $scope.videoOnceStarted = true;
            $scope.drawAugVideo();
        };
        $scope.drawAugVideo = function() {
            if(!$scope.stopDrawing) {
                //$mdDialog.hide(1);
                if (window.requestAnimationFrame) window.requestAnimationFrame($scope.drawAugVideo);
                // IE implementation
                else if (window.msRequestAnimationFrame) window.msRequestAnimationFrame($scope.drawAugVideo);
                // Firefox implementation
                else if (window.mozRequestAnimationFrame) window.mozRequestAnimationFrame($scope.drawAugVideo);
                // Chrome implementation
                else if (window.webkitRequestAnimationFrame) window.webkitRequestAnimationFrame($scope.drawAugVideo);
                // Other browsers that do not yet support feature
                else setTimeout($scope.drawAugVideo, 16.7);
                $scope.drawAugmentedVideoOnCanvas();
            }
        };
        $scope.drawAugmentedVideoOnCanvas = function() {
            $scope.canvasElem = angular.element($('#augmentedVideoCanvas'))[0];
            if($scope.canvasElem) {
                $scope.context = $scope.canvasElem.getContext('2d');
                if($scope.context) {
                    $scope.context.canvas.width = $scope.context.canvas.offsetWidth;
                    $scope.context.canvas.height = $scope.context.canvas.offsetHeight;

                    var width = ($scope.augCanvasWidth);
                    var height = ($scope.augCanvasHeight);
                    console.log("drawing augmented video... : " + $scope.backgroundObject.currentTime);
                    console.log("$scope.nextSnapshotTime : " + $scope.nextSnapshotTime);
                    console.log("$scope.nextDuration : " + $scope.nextDuration);

                    if(Math.abs($scope.backgroundObject.currentTime - $scope.nextSnapshotTime) < 0.15) {
                        $scope.backgroundObject.pause();
                        $scope.stopDrawing = true;
                        console.log("Drawing snapshot now....... ");
                        $scope.context.drawImage($scope.nextImageElem, 0, 0, width, height);
                        if($scope.iterator < snapshotsData.length - 1) {
                            $scope.iterator++;
                        }
                        $timeout(function() {
                            $scope.updateSnapshotDetails();
                        }, $scope.nextDuration * 1000);
                    } else {
                        //$scope.backgroundObject.play();
                        $scope.context.drawImage($scope.backgroundObject, 0, 0, width, height);
                    }
                }
            }
        };
        $scope.updateSnapshotDetails = function() {
            console.log("updateSnapshotDetails ...");
            $scope.nextSnapshotTime = snapshotsData[$scope.iterator].playbackTime;
            $scope.nextImageElem = document.getElementById(snapshotsData[$scope.iterator].imageId);
            $scope.nextDuration = snapshotsData[$scope.iterator].duration;
            $scope.stopDrawing = false;
            $scope.backgroundObject.play();
            $scope.backgroundObject.currentTime = $scope.backgroundObject.currentTime + 0.5;
            $scope.drawAugVideo();
        };
    })

    .controller('SnapshotAttributesDialogController', function ($scope, $mdDialog, playbackTime) {
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
            $mdDialog.hide([$scope.durationSet, $scope.videoplayTime]);
        };
    })

    .controller('TextDurationDialogController', function ($scope, $mdDialog) {
        $scope.durationDialogIcons = [
            { name: 'Close', icon: 'close' }
        ];
        $scope.durationSet = 3;
        $scope.hide = function() {
            $mdDialog.hide();
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.answer = function(answer) {
            $mdDialog.hide($scope.durationSet);
        };
    })

    .controller('ClearOptionsController', function($scope, $mdBottomSheet) {
        $scope.options = [
            { name: 'Clear', icon: 'clear' }
        ];
        $scope.showClearOptionsToolbox = function($event) {
            $scope.clearOption = '';
            $mdBottomSheet
                .show({
                    templateUrl: 'app/partials/clearOptionsGrid.html',
                    controller: 'ClearOptionsGridController',
                    targetEvent: $event
                })
                .then(function(clickedItem) {
                    if(clickedItem.name.toLowerCase() == "clear lines") {
                        $scope.clearLineDrawings();
                    } else if(clickedItem.name.toLowerCase() == "clear rectangles") {
                        $scope.clearRectangleDrawings();
                    } else if(clickedItem.name.toLowerCase() == "clear circles") {
                        $scope.clearCircleDrawings();
                    } else if(clickedItem.name.toLowerCase() == "clear triangles") {
                        $scope.clearTriangleDrawings();
                    } else if(clickedItem.name.toLowerCase() == "clear pen drawings") {
                        $scope.clearPenDrawings();
                    } else if(clickedItem.name.toLowerCase() == "clear text") {
                        $scope.clearTextDrawings();
                    } else if(clickedItem.name.toLowerCase() == "clear all") {
                        $scope.clearDrawings();
                    }
                });
        };
    })

    .controller('ClearOptionsGridController', function($scope, $mdBottomSheet) {
        $scope.items = [
            { name: 'Clear All', icon: 'eraser' },
            { name: 'Clear Pen Drawings', icon: 'pen' },
            { name: 'Clear Lines', icon: 'line' },
            { name: 'Clear Circles', icon: 'circle' },
            { name: 'Clear Rectangles', icon: 'rectangle' },
            { name: 'Clear Triangles', icon: 'triangle' },
            { name: 'Clear Text', icon: 'text' }
        ];
        $scope.toolClicked = function($index) {
            var clickedItem = $scope.items[$index];
            $mdBottomSheet.hide(clickedItem);
        };
    })

    .controller('ToolboxController', function($scope, $mdBottomSheet, ToolsService) {
        console.log("======== toolbox =============");
        $scope.toolboxIcon = [
            { name: 'Drawing Tools', icon: 'toolbox' }
        ];
        $scope.cursorIcon = '';
        $scope.cursorColor = '';
        $scope.brushThickness = 1;
        $scope.setTool = function(tool, brushThickness, type) {
            if("item" == type) {
                ToolsService.setTool(tool);
            } else if("color" == type) {
                ToolsService.setColor(tool);
            }
            ToolsService.setBrushThickness(brushThickness);
        };
        $scope.showToolbox = function($event) {
            $scope.cursorIcon = '';
            $scope.cursorColor = '';
            $mdBottomSheet
                .show({
                    templateUrl: 'app/partials/toolboxGrid.html',
                    controller: 'ToolboxGridController',
                    targetEvent: $event
                })
                .then(function(value) {
                    $scope.brushThickness = value[1];
                    if("item" == value[2]) {
                        var clickedItem = value[0];
                        $scope.cursorIcon = clickedItem;
                        $scope.setTool($scope.cursorIcon, $scope.brushThickness, "item");
                    } else if ("color" == value[2]){
                        var clickedColor = value[0];
                        $scope.cursorColor = clickedColor;
                        $scope.setTool($scope.cursorColor, $scope.brushThickness, "color");
                    } else {
                        $scope.setTool(value[0], $scope.brushThickness, value[2])
                    }
                });
        };
    })

    .controller('ToolboxGridController', function($scope, $mdBottomSheet) {
        $scope.brushThickness = 1;
        $scope.items = [
            { name: 'Pen', icon: 'pen' },
            { name: 'Circle', icon: 'circle' },
            { name: 'Line', icon: 'line' },
            { name: 'Rectangle', icon: 'rectangle' },
            { name: 'Triangle', icon: 'triangle' },
            { name: 'Text', icon: 'text' }
        ];
        $scope.colors = [
            { name: 'Black', color: 'black' },
            { name: 'Grey', color: 'grey' },
            { name: 'White', color: 'white' },
            { name: 'Red', color: 'red' },
            { name: 'Orange', color: 'orange' },
            { name: 'Yellow', color: 'yellow' },
            { name: 'Green', color: 'green' },
            { name: 'Blue', color: 'blue' },
            { name: 'Purple', color: 'purple' },
            { name: 'Brown', color: 'brown' }
        ];
        $scope.toolClicked = function($index) {
            $scope.brushThickness = document.getElementById('thicknessSlider').textContent;
            $scope.brushThickness = parseInt($scope.brushThickness);
            var clickedItem = $scope.items[$index];
            $mdBottomSheet.hide([clickedItem, $scope.brushThickness, "item"]);
        };
        $scope.colorClicked = function($index) {
            $scope.brushThickness = document.getElementById('thicknessSlider').textContent;
            $scope.brushThickness = parseInt($scope.brushThickness);
            var clickedColor = $scope.colors[$index];
            $mdBottomSheet.hide([clickedColor, $scope.brushThickness, "color"]);
        };
        $scope.setThickness = function() {
            $scope.brushThickness = document.getElementById('thicknessSlider').textContent;
            $scope.brushThickness = parseInt($scope.brushThickness);
            $mdBottomSheet.hide([null, $scope.brushThickness, null]);
        };
    });