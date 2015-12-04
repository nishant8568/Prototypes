/**
 * Created by Nishant on 11/21/2015.
 */
offlineModeModule.controller('offlineModeController', function ($scope, $mdUtil, $mdSidenav, $log, $mdDialog, $compile) {
    'use strict';

    $scope.volumeStatus = "volume_up";
    $scope.toggleLeft = buildToggler('left');
    $scope.resourceDir = 'assets/resources/';
    $scope.uploadButton = document.getElementById('upload');
    $scope.canvasElement = document.getElementById('outputCanvas');
    $scope.videoObject = document.getElementById("videoBackgrounddata");
    $scope.ctx = $scope.canvasElement.getContext('2d');
    $scope.currentTime = "00:00";
    $scope.duration = "00:00";
    $scope.playPlauseButton = "play_arrow";
    $scope.ctx.canvas.width = $scope.ctx.canvas.offsetWidth;
    $scope.ctx.canvas.height = $scope.ctx.canvas.offsetHeight;
    // variable that decides if something should be drawn on mousemove
    $scope.drawing = false;

    // Drawing properties
    $scope.drawingStyle = "pen";
    $scope.strokeColor = 'red';
    $scope.brushThickness = 1;

    // Drawing styles data structures
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

    // the last coordinates before the current move
    $scope.lastX;
    $scope.lastY;

    // snapshots
    $scope.savedSnapshotsData = [];

    // video status variables
    var isVideoReady = false;
    var videoEnded = false;
    var isVideoPaused = true;

    $scope.videoCache = [];
    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildToggler(navID) {
        var debounceFn = $mdUtil.debounce(function () {
            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });
        }, 300);

        return debounceFn;
    }

    $scope.formatPlayerTime = function (timeString) {
        console.log(timeString);
        var sec_num = parseInt(timeString, 10);
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        var time = hours + ':' + minutes + ':' + seconds;
        return time;
    };

    /**
     * Get the video file to be played
     */
    $scope.getVideoFile = function () {
        $scope.videoName = $scope.uploadButton.value;
        if ($scope.videoName != null) {
            var nameSplit = $scope.videoName.split("\\");
            $scope.videoName = nameSplit[nameSplit.length - 1];
            var videoNode = document.querySelector('video');
            videoNode.src = $scope.resourceDir + $scope.videoName;
            isVideoReady = true;
            $scope.clearDrawings();
            videoEnded = false;
        } else {
            console.log("Invalid Video Selection");
        }
    };

    /**
     * Open file browser
     */
    $scope.openFileDialog = function () {
        $scope.uploadButton.click();
    };

    /**
     * Close left sideNav
     */
    $scope.closeSideNav = function () {
        $mdSidenav('left').close()
            .then(function () {
                $log.debug("close LEFT is done");
            });
    };

    /**
     * Mute/Unmute video
     */
    $scope.toggleVolumeStatus = function () {
        var videoObject = document.getElementById("videoBackgrounddata");
        if ($scope.volumeStatus == "volume_up") {
            videoObject.muted = true;
            $scope.volumeStatus = "volume_mute";
        }
        else {
            videoObject.muted = false;
            $scope.volumeStatus = "volume_up";
        }
    };

    /**
     * Add new video to video cache
     */
    var updateVideoCache = function () {
        var currentdate = new Date();
        var dateStr = currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear();
        var timeStr = currentdate.getHours() + ":" + currentdate.getMinutes();
        var videoDetailsObj = {
            title: $scope.videoName,
            atDateTime: {
                atDate: dateStr,
                atTime: timeStr
            }
        };
        $scope.videoCache.push(videoDetailsObj);
    };

    /**
     * Undo the latest drawing stroke
     */
    $scope.undo = function () {
        alert("undo");
    };

    /**
     * Play video and draw over canvas
     */
    $scope.playVideo = function () {
        if (isVideoReady) {
            var videoObject = document.getElementById("videoBackgrounddata");
            if (videoObject.ended) {
                //videoEnded = false;
                videoObject.currentTime = '0';
                videoObject.play();
            }
            if (videoObject.paused && !videoObject.ended) {
                videoObject.play();
                $scope.playPlauseButton = "pause_arrow";
                updateVideoCache();
                $scope.drawCanvas();
            } else {
                videoObject.pause();
                $scope.playPlauseButton = "play_arrow";
                console.log("Video Paused. Stopping the video draw on canvas");
            }
            //videoObject.play();
            $scope.clearDrawings();
        }
    };
    $scope.drawCanvas = function () {
        var backgroundObject = document.getElementById("videoBackgrounddata");
        if (!backgroundObject.ended && !backgroundObject.paused) {
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
        else if (backgroundObject.ended) {
            //$scope.videoEnded = true;
            console.log("Video Ended. Stopping the video draw on canvas");
            $scope.playPlauseButton = "play_arrow";
            backgroundObject.currentTime = '0';
        }
    };
    $scope.drawVideoOnCanvas = function () {
        console.log("drawVideoOnCanvas method...");
        var backgroundObject = document.getElementById("videoBackgrounddata");
        var width = ($scope.canvasElement.width);
        var height = ($scope.canvasElement.height);
        if ($scope.ctx) {
            $scope.ctx.drawImage(backgroundObject, 0, 0, width, height);
        }
    };

    /**
     * Draw text strokes
     */
    $scope.drawTextStrokes = function () {
        for (var i = 0; i < $scope.drawnText.length; i++) {
            $scope.ctx.beginPath();
            $scope.ctx.font = "10pt Arial";
            $scope.ctx.fillStyle = $scope.drawnText[i].color;
            $scope.ctx.fillText($scope.drawnText[i].value, $scope.drawnText[i].left, $scope.drawnText[i].top);
        }
    };
    // freehand pen drawing
    $scope.drawPenStrokes = function () {
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
    $scope.drawLineStrokes = function () {
        $scope.ctx.beginPath();
        var numberOfTempLines = $scope.tempLines.length;
        if (numberOfTempLines > 0) {
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
    $scope.drawCircleStrokes = function () {
        $scope.ctx.beginPath();
        var numberOfTempCircles = $scope.tempCircles.length;
        if (numberOfTempCircles > 0) {
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
    $scope.drawTriangleStrokes = function () {
        $scope.ctx.beginPath();
        var numberOfTempTriangles = $scope.tempTriangles.length;
        if (numberOfTempTriangles > 0) {
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
    $scope.drawFinalLines = function () {
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
    $scope.drawFinalRectangles = function () {
        for (var i = 0; i < $scope.drawnRectangles.length; i++) {
            $scope.ctx.beginPath();
            $scope.ctx.rect($scope.drawnRectangles[i].startX, $scope.drawnRectangles[i].startY,
                $scope.drawnRectangles[i].sizeX, $scope.drawnRectangles[i].sizeY);
            $scope.ctx.lineWidth = $scope.drawnRectangles[i].thickness;
            $scope.ctx.strokeStyle = $scope.drawnRectangles[i].color;
            $scope.ctx.stroke();
        }
    };
    // rectangles
    $scope.drawRectangleStrokes = function () {
        $scope.ctx.beginPath();
        var numberOfTempRectangles = $scope.tempRectangles.length;
        if (numberOfTempRectangles > 0) {
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
    $scope.drawFinalCircles = function () {
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
    $scope.drawFinalCircles = function () {
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
    $scope.drawFinalTriangles = function () {
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
    $scope.clearDrawings = function () {
        $scope.tempCircles = [];
        $scope.tempTriangles = [];
        $scope.tempLines = [];
        $scope.tempRectangles = [];
        $scope.drawnCircles = [];
        $scope.drawnTriangles = [];
        $scope.drawnLines = [];
        $scope.drawnRectangles = [];
        $scope.penClicks = [];
        if (videoEnded) {
            $scope.drawVideoOnCanvas();
        }
    };
    $scope.createInputsForText = function (color, videoObject) {
        var idText = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++)
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
        document.getElementById(idButton).onclick = function () {
            $scope.applyText(idInputBox, idContainer, leftPos, topPos, color, videoObject);
        };
    };
    /**
     * Show snapshot attributes dialog and save snapshot
     */
    $scope.saveSnapshot = function () {
        var videoObject = document.getElementById("videoBackgrounddata");
        var durationSet = 3;
        var playbackTime = videoObject.currentTime;
        $mdDialog.show({
                controller: 'snapshotsAttributesController',
                templateUrl: 'app/components/others/snapshotsAttributesDialog/snapshotsAttributesDialog.tpl.html',
                locals: {playbackTime: playbackTime},
                parent: angular.element(document.body)
            })
            .then(function (answer) {
                durationSet = answer[0];
                playbackTime = answer[1];
                console.log("duration : " + durationSet);
                console.log("playbackTime : " + playbackTime);
                $scope.saveImage(playbackTime, durationSet);
            }, function () {
                console.log('text duration dialog closed');
            });
    };
    $scope.saveImage = function (playbackTime, duration) {
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
            "<md-grid-list layout-padding id=\"snapshotsList_" + playbackTime + "\" md-cols=\"1\" md-row-height=\"" +
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
        console.log(snapshotElement);
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
    $scope.applyText = function (textId, containerId, leftPos, topPos, color, videoObject) {
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
    };

    /**
     * mouseDown handler on canvas
     * @param $event
     */
    $scope.mouseDownHandler = function ($event) {
        console.log("mouse down with tool : " + $scope.drawingStyle);
        var backgroundObject = document.getElementById("videoBackgrounddata");
        $scope.isVideoPaused = backgroundObject.paused;
        if (backgroundObject.paused) {
            if ($event.offsetX !== undefined) {
                $scope.lastX = $event.offsetX;
                $scope.lastY = $event.offsetY;
            } else {
                $scope.lastX = $event.layerX - $event.currentTarget.offsetLeft;
                $scope.lastY = $event.layerY - $event.currentTarget.offsetTop;
            }
            var color = $scope.strokeColor;
            var thickness = $scope.brushThickness;
            if ($scope.drawingStyle.toLowerCase() == "pen") {
                var penClick = {
                    posX: $scope.lastX,
                    posY: $scope.lastY,
                    drag: false,
                    color: color,
                    thickness: thickness
                };
                $scope.penClicks.push(penClick);
            } else if ($scope.drawingStyle.toLowerCase() == "text") {
                var videoObject = document.getElementById("videoBackgrounddata");
                videoObject.pause();
                $scope.createInputsForText(color, videoObject);
            }
            // begins new line
            $scope.ctx.beginPath();
            $scope.drawing = true;
        }
    };
    $scope.mouseMoveHandler = function ($event) {
        if ($scope.drawing) {
            console.log("mouse moving over canvas...");
            var currentX = 0;
            var currentY = 0;
            // get current mouse position
            if ($event.offsetX !== undefined) {
                currentX = $event.offsetX;
                currentY = $event.offsetY;
            } else {
                currentX = $event.layerX - $event.currentTarget.offsetLeft;
                currentY = $event.layerY - $event.currentTarget.offsetTop;
            }
            var color = $scope.strokeColor;
            var thickness = $scope.brushThickness;
            if ($scope.drawingStyle.toLowerCase() == "pen") {
                var penClick = {
                    posX: currentX,
                    posY: currentY,
                    drag: true,
                    color: color,
                    thickness: thickness
                };
                $scope.penClicks.push(penClick);
                $scope.drawPenStrokes();
            } else if ($scope.drawingStyle.toLowerCase() == "rectangle") {
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
            } else if ($scope.drawingStyle.toLowerCase() == "line") {
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
            } else if ($scope.drawingStyle.toLowerCase() == "circle") {
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
            } else if ($scope.drawingStyle.toLowerCase() == "triangle") {
                var drawnTriangle = {
                    startX: $scope.lastX,
                    startY: $scope.lastY,
                    endX: currentX,
                    endY: currentY,
                    thirdX: $scope.lastX + 2 * (currentX - $scope.lastX),
                    thirdY: $scope.lastY,
                    color: color,
                    thickness: thickness
                };
                $scope.tempTriangles.push(drawnTriangle);
                $scope.drawTriangleStrokes();
            }
        }
    };
    $scope.mouseUpHandler = function ($event) {
        // stop drawing
        $scope.drawing = false;
        var currentX = 0;
        var currentY = 0;
        if ($event.offsetX !== undefined) {
            currentX = $event.offsetX;
            currentY = $event.offsetY;
        } else {
            currentX = $event.layerX - $event.currentTarget.offsetLeft;
            currentY = $event.layerY - $event.currentTarget.offsetTop;
        }
        var color = $scope.strokeColor;
        var thickness = $scope.brushThickness;
        if ($scope.drawingStyle.toLowerCase() == "line") {
            var drawnLine = {
                startX: $scope.lastX,
                startY: $scope.lastY,
                endX: currentX,
                endY: currentY,
                color: color,
                thickness: thickness
            };
            $scope.drawnLines.push(drawnLine);
        } else if ($scope.drawingStyle.toLowerCase() == "rectangle") {
            var drawnRectangle = {
                startX: $scope.lastX,
                startY: $scope.lastY,
                sizeX: currentX - $scope.lastX,
                sizeY: currentY - $scope.lastY,
                color: color,
                thickness: thickness
            };
            $scope.drawnRectangles.push(drawnRectangle);
        } else if ($scope.drawingStyle.toLowerCase() == "circle") {
            var drawnCircle = {
                startX: $scope.lastX,
                startY: $scope.lastY,
                endX: currentX,
                endY: currentY,
                color: color,
                thickness: thickness
            };
            $scope.drawnCircles.push(drawnCircle);
        } else if ($scope.drawingStyle.toLowerCase() == "triangle") {
            var drawnTriangle = {
                startX: $scope.lastX,
                startY: $scope.lastY,
                endX: currentX,
                endY: currentY,
                thirdX: $scope.lastX + 2 * (currentX - $scope.lastX),
                thirdY: $scope.lastY,
                color: color,
                thickness: thickness
            };
            $scope.drawnTriangles.push(drawnTriangle);
        }


    };
});