/**
 * Created by Antony on 11/21/2015.
 */
offlineModeModule.controller('offlineModeController', ['$scope', '$mdUtil', '$mdSidenav', '$log', '$mdDialog', '$compile', 'databaseService', function ($scope, $mdUtil, $mdSidenav, $log, $mdDialog, $compile, databaseService) {
    'use strict';
    $scope.max = 3;
    $scope.selectedIndex = 2;
    $scope.volumeStatus = "volume_up";
    $scope.toggleLeft = buildToggler('left');
    $scope.openVideoButton = document.getElementById('openVideo');
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
    $scope.drawingStyle = "";
    $scope.strokeColor = "red";
    $scope.brushThickness = 1;

    // Drawing styles data structures
    $scope.penStrokes = [];
    $scope.penStrokeTemp = [];
    $scope.drawnLines = [];
    $scope.drawnRectangles = [];
    $scope.drawnCircles = [];
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

    $scope.$watch(function () {
        return $scope.videoFile
    }, function handleFooChange(newValue, oldValue) {
        console.log("video file changed, call get video file");
        if (newValue != oldValue)
            $scope.getVideoFile();
    });

    /**
     * Get the video file to be played
     */
    $scope.getVideoFile = function () {
        var vFile = $scope.videoFile;
        $scope.videoName = $scope.openVideoButton.value;
        if ($scope.videoName != null) {
            var nameSplit = $scope.videoName.split("\\");
            $scope.videoName = nameSplit[nameSplit.length - 1];
            var videoNode = document.querySelector('video');
            videoNode.src = window.URL.createObjectURL(vFile);
            console.log(videoNode.src);
            isVideoReady = true;
            // trigger enable/disable tools in toolsController
            $scope.$broadcast('toggleDisable');
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
        $scope.openVideoButton.click();
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
                // trigger enable/disable tools in toolsController
                $scope.$broadcast('toggleDisable');
                updateVideoCache();
                $scope.drawCanvas();
            } else {
                videoObject.pause();
                $scope.playPlauseButton = "play_arrow";
                // trigger enable/disable tools in toolsController
                $scope.$broadcast('toggleDisable');
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
    $scope.drawAllPenStrokes = function () {
        for (var i = 0; i < $scope.penStrokes.length; i++) {
            var currentPen = $scope.penStrokes[i];
            for (var j = 1; j < currentPen.length; j++) {
                $scope.drawLine(currentPen[j - 1].posX, currentPen[j - 1].posY, currentPen[j].posX, currentPen[j].posY, currentPen[j].thickness, currentPen[j].color);
            }
        }
    };

    // lines
    $scope.drawLine = function (startX, startY, endX, endY, thickness, color) {
        $scope.ctx.beginPath();
        $scope.ctx.moveTo(startX, startY);
        $scope.ctx.lineTo(endX, endY);
        $scope.ctx.lineWidth = thickness;
        $scope.ctx.strokeStyle = color;
        $scope.ctx.stroke();
    };

    $scope.drawAllLines = function () {
        for (var i = 0; i < $scope.drawnLines.length; i++) {
            var currentLine = $scope.drawnLines[i];
            $scope.drawLine(currentLine.startX, currentLine.startY, currentLine.endX, currentLine.endY, currentLine.thickness, currentLine.color);
        }
    };

    // circles
    $scope.drawCircle = function (startX, startY, radius, thickness, color) {
        $scope.ctx.beginPath();
        $scope.ctx.arc(startX, startY, radius, 0, 2 * Math.PI, false);
        $scope.ctx.closePath();
        $scope.ctx.lineWidth = thickness;
        $scope.ctx.strokeStyle = color;//"#4bf";
        $scope.ctx.stroke();
    };

    $scope.drawAllCircles = function () {
        for (var i = 0; i < $scope.drawnCircles.length; i++) {
            var currentCircle = $scope.drawnCircles[i];
            $scope.drawCircle(currentCircle.startX, currentCircle.startY, currentCircle.radius, currentCircle.thickness, currentCircle.color);
        }
    };

    // triangles
    $scope.drawTriangle = function (startX, startY, endX, endY, thirdX, thirdY, thickness, color) {
        $scope.ctx.beginPath();
        $scope.ctx.moveTo(startX, startY);
        $scope.ctx.lineTo(endX, endY);
        $scope.ctx.lineTo(thirdX, thirdY);
        $scope.ctx.lineTo(startX, startY);
        $scope.ctx.lineWidth = thickness;
        $scope.ctx.strokeStyle = color;
        $scope.ctx.stroke();
    };

    $scope.drawAllTriangles = function () {
        for (var i = 0; i < $scope.drawnTriangles.length; i++) {
            var currentTriangle = $scope.drawnTriangles[i];
            $scope.drawTriangle(currentTriangle.startX, currentTriangle.startY, currentTriangle.endX, currentTriangle.endY,
                currentTriangle.thirdX, currentTriangle.thirdY, currentTriangle.thickness, currentTriangle.color);
        }
    };

    // rectangles
    $scope.drawRectangle = function (startX, startY, width, height, thickness, color) {
        $scope.ctx.beginPath();
        $scope.ctx.rect(startX, startY, width, height);
        $scope.ctx.lineWidth = thickness;
        $scope.ctx.strokeStyle = color;
        $scope.ctx.stroke();
    };

    $scope.drawAllRectangles = function () {
        for (var i = 0; i < $scope.drawnRectangles.length; i++) {
            var currentRectangle = $scope.drawnRectangles[i];
            $scope.drawRectangle(currentRectangle.startX, currentRectangle.startY, currentRectangle.width, currentRectangle.height, currentRectangle.thickness, currentRectangle.color);
        }
    };

    $scope.drawUserDrawings = function () {
        $scope.drawAllTriangles();
        $scope.drawAllCircles();
        $scope.drawAllRectangles();
        $scope.drawAllLines();
        $scope.drawAllPenStrokes();
    };

    $scope.clearDrawings = function () {
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
        var description = "";
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
                description = answer[2];
                console.log("duration : " + durationSet);
                console.log("playbackTime : " + playbackTime);
                console.log("description : " + description);
                $scope.saveImage(playbackTime, durationSet, description);
            }, function () {
                console.log('text duration dialog closed');
            });
    };
    $scope.saveImage = function (playbackTime, duration, description) {
        updateCanvas();
        var imgData = $scope.ctx.getImageData(0, 0, $scope.canvasElement.width, $scope.canvasElement.height);
        // clear strokes data from respective arrays
        $scope.clearDrawings();

        var dataURL = $scope.canvasElement.toDataURL();
        var newImage = {
            description: description,
            duration: duration,
            playbackTime: playbackTime,
            dataURL: dataURL,
            videoName: $scope.videoName
        };
        databaseService.saveImage(newImage).then(function (data) {
            if (data.success) {
                var imageId = data.id;
                appendImageToSnapshots(imageId, playbackTime, duration, dataURL);
                var savedSnapshot = {
                    imageId: 'canvasImg_' + imageId,
                    playbackTime: playbackTime,
                    duration: duration,
                    description: description
                };
                $scope.savedSnapshotsData.push(savedSnapshot);
            } else {
                alert(data.message);
            }
        });
    };

    $scope.loadImages = function () {
        databaseService.loadImages($scope.videoName).then(function (data) {
            if (data.success) {
                var snapshotsNode = document.getElementById("snapshots");
                while (snapshotsNode.firstChild) {
                    snapshotsNode.removeChild(snapshotsNode.firstChild);
                }
                for (var i = 0; i < data.images.length; i++) {
                    var image = data.images[i];
                    appendImageToSnapshots(image._id, image.playbackTime, image.duration, image.dataURL);
                }
            }
        })
    };

    var appendImageToSnapshots = function (imageId, playbackTime, duration, dataURL) {
        var snapshotElement =
            "<md-grid-list layout-padding id=\"snapshotsList_" + playbackTime + "\" md-cols=\"1\" md-row-height=\"" +
            $scope.ctx.canvas.width + ":" + $scope.ctx.canvas.height + "\" " +
            "style=\"border: 1px solid green\">" +
            "<md-grid-tile id=\"snapshot_" + imageId + "\">" +
            "<img id=\"canvasImg_" + imageId + "\" " +
            "style=\"position: relative; width: 100%; height: 100%;\">" +
            "<md-grid-tile-footer layout=\"row\" layout-align=\"space-between center\">" +
            "<h3>Time : " + playbackTime + "</h3>" +
            "<h3>Duration : " + duration + "</h3>" +
            "</md-grid-tile-footer>" +
            "</md-grid-tile>" +
            "</md-grid-list>";
        var childNode = $compile(snapshotElement)($scope);
        document.getElementById('snapshots').appendChild(childNode[0]);
        // set canvasImg image src to dataURL so it can be saved as an image
        document.getElementById('canvasImg_' + imageId).src = dataURL;
    };

    var updateCanvas = function () {
        $scope.drawVideoOnCanvas();
        $scope.drawUserDrawings();
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
        console.log("mouse down with color : " + $scope.strokeColor);
        var backgroundObject = document.getElementById("videoBackgrounddata");
        $scope.isVideoPaused = backgroundObject.paused;
        if (backgroundObject.paused) {
            if ($event.offsetX !== undefined) {
                $scope.lastX = ($scope.canvasElement.width / $event.currentTarget.offsetWidth) * $event.offsetX;
                $scope.lastY = ($scope.canvasElement.height / $event.currentTarget.offsetHeight) * $event.offsetY;
            } else {
                $scope.lastX = ($scope.canvasElement.width / $event.currentTarget.offsetWidth) * $event.layerX;
                $scope.lastY = ($scope.canvasElement.height / $event.currentTarget.offsetHeight) * $event.layerX;
            }
            console.log("X : " + $scope.lastX + " : Y : " + $scope.lastY);
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
                $scope.penStrokeTemp.push(penClick);
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

            var currentX = 0;
            var currentY = 0;
            // get current mouse position
            if ($event.offsetX !== undefined) {
                currentX = ($scope.canvasElement.width / $event.currentTarget.offsetWidth) * $event.offsetX;
                currentY = ($scope.canvasElement.height / $event.currentTarget.offsetHeight) * $event.offsetY;
            } else {
                currentX = ($scope.canvasElement.width / $event.currentTarget.offsetWidth) * $event.layerX;
                currentY = ($scope.canvasElement.height / $event.currentTarget.offsetHeight) * $event.layerX;
            }
            //console.log("currentX : " + currentX + " : currentY : " + currentY);
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
                var index = $scope.penStrokeTemp.length;
                if (index > 0) {
                    $scope.drawLine($scope.penStrokeTemp[index - 1].posX, $scope.penStrokeTemp[index - 1].posY, currentX, currentY, thickness, color)
                }
                $scope.penStrokeTemp.push(penClick);
            } else if ($scope.drawingStyle.toLowerCase() == "rectangle") {
                var width = currentX - $scope.lastX;
                var height = currentY - $scope.lastY;
                updateCanvas();
                $scope.drawRectangle($scope.lastX, $scope.lastY, width, height, thickness, color);
            } else if ($scope.drawingStyle.toLowerCase() == "line") {
                updateCanvas();
                $scope.drawLine($scope.lastX, $scope.lastY, currentX, currentY, thickness, color)
            } else if ($scope.drawingStyle.toLowerCase() == "circle") {
                updateCanvas();
                var radius = Math.sqrt((Math.pow(Math.abs(currentX - $scope.lastX), 2) + Math.pow(Math.abs(currentY - $scope.lastY), 2)));
                $scope.drawCircle($scope.lastX, $scope.lastY, radius, thickness, color);
            } else if ($scope.drawingStyle.toLowerCase() == "triangle") {
                updateCanvas();
                var thirdX = $scope.lastX + 2 * (currentX - $scope.lastX);
                var thirdY = $scope.lastY;
                $scope.drawTriangle($scope.lastX, $scope.lastY, currentX, currentY, thirdX, thirdY, thickness, color);
            }
        }
    };
    $scope.mouseUpHandler = function ($event) {
        // stop drawing
        $scope.drawing = false;
        var currentX = 0;
        var currentY = 0;
        if ($event.offsetX !== undefined) {
            currentX = ($scope.canvasElement.width / $event.currentTarget.offsetWidth) * $event.offsetX;
            currentY = ($scope.canvasElement.height / $event.currentTarget.offsetHeight) * $event.offsetY;
        } else {
            currentX = ($scope.canvasElement.width / $event.currentTarget.offsetWidth) * $event.layerX;
            currentY = ($scope.canvasElement.height / $event.currentTarget.offsetHeight) * $event.layerX;
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
            $scope.penStrokeTemp.push(penClick);
            $scope.penStrokes.push($scope.penStrokeTemp);
            $scope.penStrokeTemp = [];
            updateCanvas();
        } else if ($scope.drawingStyle.toLowerCase() == "line") {
            var drawnLine = {
                startX: $scope.lastX,
                startY: $scope.lastY,
                endX: currentX,
                endY: currentY,
                color: color,
                thickness: thickness
            };
            $scope.drawnLines.push(drawnLine);
            updateCanvas();
        } else if ($scope.drawingStyle.toLowerCase() == "rectangle") {
            var drawnRectangle = {
                startX: $scope.lastX,
                startY: $scope.lastY,
                width: currentX - $scope.lastX,
                height: currentY - $scope.lastY,
                color: color,
                thickness: thickness
            };
            $scope.drawnRectangles.push(drawnRectangle);
            updateCanvas()
        } else if ($scope.drawingStyle.toLowerCase() == "circle") {
            var drawnCircle = {
                startX: $scope.lastX,
                startY: $scope.lastY,
                radius: Math.sqrt((Math.pow(Math.abs(currentX - $scope.lastX), 2) + Math.pow(Math.abs(currentY - $scope.lastY), 2))),
                color: color,
                thickness: thickness
            };
            $scope.drawnCircles.push(drawnCircle);
            updateCanvas();

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
            updateCanvas();
        }
    };
}]);