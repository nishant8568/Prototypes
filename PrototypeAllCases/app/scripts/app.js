'use strict';

// Look after different browser vendors' ways of calling the getUserMedia()
// API method:
// Opera --> getUserMedia
// Chrome --> webkitGetUserMedia
// Firefox --> mozGetUserMedia
navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;



// Declare app level module which depends on filters, and services
var app = angular.module('myApp', []);

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
app.factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});




/* Controllers */

app.controller("AppCtrl", AppCtrl);

function AppCtrl($scope, socket) {
    console.log('AppCtrl ... ');

    // Clean-up function:
// collect garbage before unloading browser's window
    window.onbeforeunload = function(e){
        hangup();
    }

    // Let's get started: prompt user for input (room name)
    var room = "test";


// Send 'Create or join' message to singnaling server
    if (room !== '') {
        console.log('Create or join room', room);
        socket.emit('create or join', room);
    }



// HTML5 <video> elements
    var localVideo = document.querySelector('#localVideo');
    var remoteVideo = document.querySelector('#remoteVideo');


    // Flags...
    var isChannelReady = false;
    $scope.isInitiator = false;
    var isStarted = false;

    $scope.videoChat = function(){

        sendState("video");
    }

    $scope.helping = function(){

        sendState("helping");
    }

    $scope.drawing = function(){

        sendState("drawing");
    }

// WebRTC data structures
// Streams
    var localStream;
    var remoteStream;
// PeerConnection
    var pc;

// PeerConnection ICE protocol configuration (either Firefox or Chrome)
    var pcConfig = webrtcDetectedBrowser === 'firefox' ?
    {'iceServers':[{'url':'stun:23.21.150.121'}]} : // IP address
    {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

    var pcConstraints = {
        'optional': [
            {'DtlsSrtpKeyAgreement': true}
        ]};

    var sdpConstraints = {};


    // Socket listeners
    // ================

    // Server-mediated message exchanging...

    // 1. Server-->Client...

    // Handle 'created' message coming back from server:
    // this peer is the initiator
    socket.on('created', function (room){
        console.log('Created room ' + room);
        $scope.isInitiator = true;

        // Call getUserMedia()
        navigator.getUserMedia(constraints, handleUserMedia, handleUserMediaError);
        console.log('Getting user media with constraints', constraints);

        checkAndStart();
    });

    // Handle 'full' message coming back from server:
    // this peer arrived too late :-(
    socket.on('full', function (room){
        console.log('Room ' + room + ' is full');
        alert('Room ' + room + ' is full');
    });

    // Handle 'join' message coming back from server:
    // another peer is joining the channel
    socket.on('join', function (room){
        console.log('Another peer made a request to join room ' + room);
        console.log('This peer is the initiator of room ' + room + '!');
        isChannelReady = true;
    });

    // Handle 'joined' message coming back from server:
    // this is the second peer joining the channel
    socket.on('joined', function (room){
        console.log('This peer has joined room ' + room);
        isChannelReady = true;

        // Call getUserMedia()
        navigator.getUserMedia(constraints, handleUserMedia, handleUserMediaError);
        console.log('Getting user media with constraints', constraints);
    });

    // Server-sent log message...
    socket.on('log', function (array){
        console.log.apply(console, array);
    });


    // Receive state from the other peer via the signaling server
    socket.on('state', function (state){

        if (state === 'helping') {
            localVideo.style.display = "none";
            remoteVideo.style.display = "none";
            document.getElementById("helpCanvas").style.display = "inline";
            document.getElementById("drawCanvas").style.display = "none";
            angular.element('a[href="#help"]').tab('show');

        } else if (state === 'drawing') {
            localVideo.style.display = "none";
            remoteVideo.style.display = "none";
            document.getElementById("helpCanvas").style.display = "none";
            document.getElementById("drawCanvas").style.display = "inline";
            angular.element('a[href="#draw"]').tab('show');

        } else if (state === 'video') {
            localVideo.style.display = "inline";
            remoteVideo.style.display = "inline";
            document.getElementById("helpCanvas").style.display = "none";
            document.getElementById("drawCanvas").style.display = "none";
            angular.element('a[href="#video"]').tab('show');

        }

    });



    // Receive message from the other peer via the signaling server
    socket.on('message', function (message){
        console.log('Received message:', message);
        if (message === 'got user media') {
            checkAndStart();
        } else if (message.type === 'offer') {
            if (!$scope.isInitiator && !isStarted) {
                checkAndStart();
            }
            pc.setRemoteDescription(new RTCSessionDescription(message));
            doAnswer();
        } else if (message.type === 'answer' && isStarted) {
            pc.setRemoteDescription(new RTCSessionDescription(message));
        } else if (message.type === 'candidate' && isStarted) {
            var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
                candidate:message.candidate});
            pc.addIceCandidate(candidate);
        } else if (message === 'bye' && isStarted) {
            handleRemoteHangup();
        }
    });

    // 2. Client-->Server

    // Send message to the other peer via the signaling server
    function sendMessage(message){
        console.log('Sending message: ', message);
        socket.emit('message', message);
    }

    // Send state to the other peer via the signaling server
    function sendState(state){
        console.log('Sending state: ', state);
        socket.emit('state', state);
    }


    // Set getUserMedia constraints
    var constraints = {video: true, audio: true};

// From this point on, execution proceeds based on asynchronous events...

// getUserMedia() handlers...

    function handleUserMedia(stream) {
        localStream = stream;
        attachMediaStream(localVideo, stream);
        console.log('Adding local stream.');
        sendMessage('got user media');
    }

    function handleUserMediaError(error){
        console.log('navigator.getUserMedia error: ', error);
    }



// Channel negotiation trigger function
    function checkAndStart() {
        if (!isStarted && typeof localStream != 'undefined' && isChannelReady) {
            createPeerConnection();
            isStarted = true;
            if ($scope.isInitiator) {
                doCall();
            }
        }
    }

// PeerConnection management...
    function createPeerConnection() {
        try {
            pc = new RTCPeerConnection(pcConfig, pcConstraints);

            pc.addStream(localStream);

            pc.onicecandidate = handleIceCandidate;
            console.log('Created RTCPeerConnnection with:\n' +
                '  config: \'' + JSON.stringify(pcConfig) + '\';\n' +
                '  constraints: \'' + JSON.stringify(pcConstraints) + '\'.');
        } catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message);
            alert('Cannot create RTCPeerConnection object.');
            return;
        }

        pc.onaddstream = handleRemoteStreamAdded;
        pc.onremovestream = handleRemoteStreamRemoved;
    }


// Handlers...


// ICE candidates management
    function handleIceCandidate(event) {
        console.log('handleIceCandidate event: ', event);
        if (event.candidate) {
            sendMessage({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate});
        } else {
            console.log('End of candidates.');
        }
    }

// Create Offer
    function doCall() {
        console.log('Creating Offer...');
        pc.createOffer(setLocalAndSendMessage, onSignalingError, sdpConstraints);
    }

// Signaling error handler
    function onSignalingError(error) {
        console.log('Failed to create signaling message : ' + error.name);
    }

// Create Answer
    function doAnswer() {
        console.log('Sending answer to peer.');
        pc.createAnswer(setLocalAndSendMessage, onSignalingError, sdpConstraints);
    }

// Success handler for both createOffer()
// and createAnswer()
    function setLocalAndSendMessage(sessionDescription) {
        pc.setLocalDescription(sessionDescription);
        sendMessage(sessionDescription);
    }

// Remote stream handlers...

    function handleRemoteStreamAdded(event) {
        console.log('Remote stream added.');
        attachMediaStream(remoteVideo, event.stream);
        console.log('Remote stream attached!!.');
        remoteStream = event.stream;
    }

    function handleRemoteStreamRemoved(event) {
        console.log('Remote stream removed. Event: ', event);
    }

// Clean-up functions...

    function hangup() {
        console.log('Hanging up.');
        stop();
        sendMessage('bye');
    }

    function handleRemoteHangup() {
        console.log('Session terminated.');
        stop();
        $scope.isInitiator = false;
    }

    function stop() {
        isStarted = false;
        if (pc) pc.close();
        pc = null;
    }


};


app.controller("HelpCanvasCtrl", HelpCanvasCtrl);

function HelpCanvasCtrl($scope,$timeout) {
    console.log('HelpCanvasCtrl ..... ');

    function draw() {
        if (window.requestAnimationFrame) window.requestAnimationFrame(draw);
        // IE implementation
        else if (window.msRequestAnimationFrame) window.msRequestAnimationFrame(draw);
        // Firefox implementation
        else if (window.mozRequestAnimationFrame) window.mozRequestAnimationFrame(draw);
        // Chrome implementation
        else if (window.webkitRequestAnimationFrame) window.webkitRequestAnimationFrame(draw);
        // Other browsers that do not yet support feature
        else $timeout(draw, 16.7);
        DrawVideoOnCanvas();
    }

    draw();


    function DrawVideoOnCanvas() {

        var object,backgroundObject;

        if ($scope.isInitiator) {
            console.log('initiator ..... ');
            object = document.getElementById("remoteVideo")
            backgroundObject = document.getElementById("localVideo");
        } else {
            console.log('peer ..... ');
            object = document.getElementById("localVideo")
            backgroundObject = document.getElementById("remoteVideo");
        }

        var width = object.width;
        var height = object.height;
        var canvas = document.getElementById("helpCanvas");
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);

        if (canvas.getContext) {
            //console.log('printing .. ');
            var context = canvas.getContext('2d');
            context.drawImage(backgroundObject, 0, 0, width, height);
            var imgDataBackground = context.getImageData(0, 0, width, height);
            context.drawImage(object, 0, 0, width, height);
            var imgDataNormal = context.getImageData(0, 0, width, height);

            var imgData = context.createImageData(width, height);

            for (var i = 0; i < imgData.width * imgData.height * 4; i += 4) {
                var r = imgDataNormal.data[i + 0];
                var g = imgDataNormal.data[i + 1];
                var b = imgDataNormal.data[i + 2];
                var a = imgDataNormal.data[i + 3];

                // compare rgb levels for gray and set alphachannel to 0;
                var selectedR = 10;
                var selectedG = 120;
                var selectedB = 60;
                if (r <= selectedR || g >= selectedG) {
                    a = 0;
                }
                if (a != 0) {
                    imgData.data[i + 0] = r;
                    imgData.data[i + 1] = g;
                    imgData.data[i + 2] = b;
                    imgData.data[i + 3] = a;
                }

            }

            for (var y = 0; y < imgData.height; y++) {
                for (var x = 0; x < imgData.width; x++) {
                    var r = imgData.data[((imgData.width * y) + x) * 4];
                    var g = imgData.data[((imgData.width * y) + x) * 4 + 1];
                    var b = imgData.data[((imgData.width * y) + x) * 4 + 2];
                    var a = imgData.data[((imgData.width * y) + x) * 4 + 3];
                    if (imgData.data[((imgData.width * y) + x) * 4 + 3] != 0) {
                        var offsetYup = y - 1;
                        var offsetYdown = y + 1;
                        var offsetXleft = x - 1;
                        var offsetxRight = x + 1;
                        var change=false;
                        if(offsetYup>0)
                        {
                            if(imgData.data[((imgData.width * (y-1) ) + (x)) * 4 + 3]==0)
                            {
                                change=true;
                            }
                        }
                        if (offsetYdown < imgData.height)
                        {
                            if (imgData.data[((imgData.width * (y + 1)) + (x)) * 4 + 3] == 0) {
                                change = true;
                            }
                        }
                        if (offsetXleft > -1) {
                            if (imgData.data[((imgData.width * y) + (x -1)) * 4 + 3] == 0) {
                                change = true;
                            }
                        }
                        if (offsetxRight < imgData.width) {
                            if (imgData.data[((imgData.width * y) + (x + 1)) * 4 + 3] == 0) {
                                change = true;
                            }
                        }
                        if (change) {
                            var gray = (imgData.data[((imgData.width * y) + x) * 4 + 0] * .393) + (imgData.data[((imgData.width * y) + x) * 4 + 1] * .769) + (imgData.data[((imgData.width * y) + x) * 4 + 2] * .189);
                            imgData.data[((imgData.width * y) + x) * 4] = (gray * 0.2) + (imgDataBackground.data[((imgData.width * y) + x) * 4] *0.9);
                            imgData.data[((imgData.width * y) + x) * 4 + 1] = (gray * 0.2) + (imgDataBackground.data[((imgData.width * y) + x) * 4 + 1]*0.9);
                            imgData.data[((imgData.width * y) + x) * 4 + 2] = (gray * 0.2) + (imgDataBackground.data[((imgData.width * y) + x) * 4 + 2] * 0.9);
                            imgData.data[((imgData.width * y) + x) * 4 + 3] = 255;
                        }
                    }

                }
            }

            for (i = 0; i < imgData.width * imgData.height * 4; i += 4) {
                var a = imgData.data[i + 3];
                if (a == 0) {
                    imgData.data[i + 0] = imgDataBackground.data[i + 0];
                    imgData.data[i + 1] = imgDataBackground.data[i + 1];
                    imgData.data[i + 2] = imgDataBackground.data[i + 2];
                    imgData.data[i + 3] = imgDataBackground.data[i + 3];
                }
            }

            context.putImageData(imgData, 0, 0);

        }
    }

};

app.controller("DrawCanvasCtrl", DrawCanvasCtrl);

function DrawCanvasCtrl($scope,$timeout, socket) {
    console.log('DrawCanvasCtrl ... ');

    var canvas = document.getElementById("drawCanvas");
    var clearButton = document.getElementById("clearDrawCanvas");


    function draw() {
        if (window.requestAnimationFrame) window.requestAnimationFrame(draw);
        // IE implementation
        else if (window.msRequestAnimationFrame) window.msRequestAnimationFrame(draw);
        // Firefox implementation
        else if (window.mozRequestAnimationFrame) window.mozRequestAnimationFrame(draw);
        // Chrome implementation
        else if (window.webkitRequestAnimationFrame) window.webkitRequestAnimationFrame(draw);
        // Other browsers that do not yet support feature
        else $timeout(draw, 16.7);
        DrawVideoOnCanvas();
    }

    var clickX = new Array();
    var clickY = new Array();
    var clickDrag = new Array();
    var paint;

    function addClick(x, y, dragging)
    {
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
    }

    function sendClick(x, y, dragging){
        if (!$scope.isInitiator) {
            socket.emit('newClick', {x: x, y: y, dragging: dragging});
        }
    }

    // Handle 'Drawing' messages
    socket.on('newClick', function (click) {
        if ($scope.isInitiator) {
            addClick (click.x, click.y, click.dragging);
        }
    });


    canvas.addEventListener("mousedown", function(e){
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;

        paint = true;
        addClick(mouseX, mouseY);
        sendClick(mouseX, mouseY);
        DrawVideoOnCanvas();

    });

    canvas.addEventListener("mousemove", function(e){
        if(paint){
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
            sendClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
            DrawVideoOnCanvas();
        }
    });

    canvas.addEventListener("mouseup", function(e){
        paint = false;
    });

    canvas.addEventListener("mouseleave", function(e){
        paint = false;
    });

    clearButton.addEventListener("click", function(e){
        e.preventDefault();
        socket.emit('clearCanvas', 'clearCanvas');
    });

    // Handle 'Drawing' messages
    socket.on('clearCanvas', function () {

        clickX = new Array();
        clickY = new Array();
        clickDrag = new Array();
        DrawVideoOnCanvas();
    });

    draw();

    function DrawVideoOnCanvas() {
        //console.log('draw on canvas ...');

        var object;

        if ($scope.isInitiator) {
            object = document.getElementById("localVideo");
        } else {
            object = document.getElementById("remoteVideo");
        }

        var width = object.width;
        var height = object.height;

        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);

        if (canvas.getContext) {
            var context = canvas.getContext('2d');
            context.drawImage(object, 0, 0, width, height);
            var imgDataNormal = context.getImageData(0, 0, width, height);

            context.putImageData(imgDataNormal, 0, 0);

            context.strokeStyle = "#df4b26";
            context.lineJoin = "round";
            context.lineWidth = 5;

            for(var i=0; i < clickX.length; i++) {
                context.beginPath();
                if(clickDrag[i] && i){
                    context.moveTo(clickX[i-1], clickY[i-1]);
                }else{
                    context.moveTo(clickX[i]-1, clickY[i]);
                }
                context.lineTo(clickX[i], clickY[i]);
                context.closePath();
                context.stroke();
            }


        }
    }

};