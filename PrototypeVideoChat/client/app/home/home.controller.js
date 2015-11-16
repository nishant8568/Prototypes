angular.module('videochatapp')
    .controller( 'HomeCtrl', function authorsCtrl($scope, $http,$stateParams,$location,$window,$timeout,config) {
        'use strict';

        var sendChannel;


        var isChannelReady;
        var isInitiator;
        var isStarted;
        var localStream;
        var pc = null;
        var remoteStream;
        var turnReady;


        $scope.isoffercall=false;
        $scope.userlist=[];

        var pc_config = webrtcDetectedBrowser === 'firefox' ?
        {'iceServers':[{'url':config.stunip}]} : // number IP
        {'iceServers': [{'url': config.stunurl}]};

        var pc_constraints = {
            'optional': [
                {'DtlsSrtpKeyAgreement': true},
                {'RtpDataChannels': true}
            ]};

// Set up audio and video regardless of what devices are present.
        var sdpConstraints = {'mandatory': {
            'OfferToReceiveAudio':true,
            'OfferToReceiveVideo':true }};

/////////////////////////////////////////////


        var room=$stateParams.roomname;
        var callerdetails;
        $scope.nickname=$stateParams.username;
        var username=$stateParams.username;
        var userinfo={
            room:$stateParams.roomname,
            username:$stateParams.username
        }
        $scope.busy=false;
        var answer=false;
        //var socket = io.connect();
        var socket=io.connect(null,{'force new connection':true});
        if (room !== '') {
            console.log('Create or join room', JSON.stringify(userinfo));
            console.log("called one time");
            socket.emit('create or join', JSON.stringify(userinfo));

        }

        socket.on('full', function (room){
            console.log('Room ' + room + ' is full');
        });

        socket.on('join', function (message){
            console.log(message);
            if(message=="no users") {
                console.log("room created user");
                if($scope.userlist.indexOf(username)==-1) {
                    $scope.userlist.push(username);
                    $scope.$apply();
                }
            }
            else{
                console.log("room joined user");
                if($scope.userlist.indexOf(message)==-1) {
                    $scope.userlist.push(message);
                    $scope.$apply();
                }
            }
            socket.emit('users',$scope.userlist);
            isChannelReady = true;
        });

        socket.on('joined', function (room){
            console.log('This peer has joined room ' + room);
            isChannelReady = true;
        });

        socket.on('log', function (array){
            console.log.apply(console, array);
        });

        socket.on('onlineusers',function(user){
            console.log("userlists");
            $scope.userlist=user;
            console.log($scope.userlist);
            $scope.$apply();
        })

////////////////////////////////////////////////

        function sendMessage(message){
            socket.emit('message', message);
        }

        socket.on('message', function (message){
            if (message === 'got user media') {
                console.log("i got user media");
                maybeStart();
            } else if (message.type === 'offer') {
                console.log("offer received");
                if(callerdetails.receivername==username) {
                    answer=window.confirm(message.callername+' calling...');
                    if(answer) {
                        console.log("peer connection value is " + pc);
                        if(pc==null) {
                            maybeStart();
                        }
                        if (!isInitiator && !isStarted) {
                            console.log("rare offer received");
                            maybeStart();
                        }
                        pc.setRemoteDescription(new RTCSessionDescription(message.sessiondescription));
                        doAnswer();

                    }
                }
            }
            else if (message.type === 'answer' && isStarted) {
                console.log(message);
                console.log(message.answername+" answered the call");
                $scope.busy=true;
                $scope.$apply();
                pc.setRemoteDescription(new RTCSessionDescription(message.sessiondescription));
            } else if (message.type === 'candidate' && isStarted) {
                console.log("received candidate from remote and added");
                var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
                    candidate:message.candidate});
                pc.addIceCandidate(candidate);
            }
        });

        socket.on('called',function(caller){
            callerdetails=JSON.parse(caller);
            if(callerdetails.callername==$stateParams.username) {
                console.log(caller);
                isInitiator=true;
                maybeStart();
            }
        });

////////////////////////////////////////////////////

        var localVideo = document.querySelector('#localVideo');
        var remoteVideo = document.querySelector('#remoteVideo');

        function handleUserMedia(stream) {
            console.log(stream);
            localStream = stream;
            attachMediaStream(localVideo, stream);
            console.log('Adding local stream.');
            sendMessage('got user media');
        }
        socket.on('callended',function(callend) {
            var callenddetails=JSON.parse(callend);
            console.log(callenddetails.to);
            if(callenddetails.to==username) {
                $scope.busy=false;
                $scope.$apply();
                stop();
            }
        })

        $scope.callend=function() {
            var callend={
                callendedby:username,
                roomname:room
            }
            if(callend.callendedby==callerdetails.receivername) {
                callend.to=callerdetails.callername;
            }
            else{
                callend.to=callerdetails.receivername;
            }
            console.log(callend);
            socket.emit('callending',JSON.stringify(callend));
            stop();
        };

        $scope.calluser=function(receivername) {
            var caller={
                callername:username,
                receivername:receivername,
                roomname:room
            }
            socket.emit('calling',JSON.stringify(caller));

        };


        $scope.logout=function() {
            var userinfo={
                username:username,
                roomname:room
            }
            console.log("user logout"+userinfo);
            socket.emit('userlogout',JSON.stringify(userinfo));

        };

        $scope.removelogoutuser=function(user) {
            console.log("remove user functionality begins");
            var userdetails=JSON.parse(user);
            var position=$scope.userlist.indexOf(userdetails.username);
            if(position!=-1) {
                console.log("username remove from list");
                $scope.userlist.splice(position,1);

            }
            if(userdetails.username==username) {
                console.log(userdetails)
                console.log("go to login");
                if($scope.userlist.length>1) {
                    stop();
                }
                socket.emit("logoutme",JSON.stringify(userdetails));
                localStream.stop();
                $timeout(function(){
                    socket.disconnect();
                    $location.path('/login');
                },2000);
            }
            $scope.$apply();
        };
        socket.on('userout',function(user) {
            console.log("user out details"+user);
            $scope.removelogoutuser(user);
        })

        function handleUserMediaError(error){
            console.log('getUserMedia error: ', error);
        }

        var constraints = {video: true,audio:true};

        getUserMedia(constraints, handleUserMedia, handleUserMediaError);
        if (location.hostname != "localhost") {
            requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
        }

        function maybeStart() {
            if (localStream && isChannelReady) {
                createPeerConnection();
                pc.addStream(localStream);
                isStarted = true;
                if(isInitiator)
                    doCall();
            }
        }

        $window.onbeforeunload = function(event){
            alert("");
            if(window.confirm("do you want reload")) {
                $scope.logout();
            }
            $scope.userlist=[];
            $scope.$apply();
        }


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function createPeerConnection() {
            try {
                pc = new RTCPeerConnection(pc_config, pc_constraints);
                pc.onicecandidate = handleIceCandidate;
                console.log("connection state"+pc.iceConnectionState);
            } catch (e) {
                console.log('Failed to create PeerConnection, exception: ' + e.message);
                alert('Cannot create RTCPeerConnection object.');
                return;
            }
            pc.onaddstream = handleRemoteStreamAdded;
            pc.onremovestream = handleRemoteStreamRemoved;

            if (isInitiator) {
                try {
                    // Reliable Data Channels not yet supported in Chrome
                    sendChannel = pc.createDataChannel("sendDataChannel",
                        {reliable: false});
                    sendChannel.onmessage = handleMessage;
                    trace('Created send data channel');
                } catch (e) {
                    alert('Failed to create data channel. ' +
                        'You need Chrome M25 or later with RtpDataChannel enabled');
                    trace('createDataChannel() failed with exception: ' + e.message);
                }
                sendChannel.onopen = handleSendChannelStateChange;
                sendChannel.onclose = handleSendChannelStateChange;
            } else {
                pc.ondatachannel = gotReceiveChannel;
            }
        }


        function gotReceiveChannel(event) {
            trace('Receive Channel Callback');
            sendChannel = event.channel;
            sendChannel.onmessage = handleMessage;
            sendChannel.onopen = handleReceiveChannelStateChange;
            sendChannel.onclose = handleReceiveChannelStateChange;
        }

        function handleMessage(event) {
            trace('Received message: ' + event.data);
        }

        function handleSendChannelStateChange() {
            var readyState = sendChannel.readyState;
            trace('Send channel state is: ' + readyState);
        }

        function handleReceiveChannelStateChange() {
            var readyState = sendChannel.readyState;
            trace('Receive channel state is: ' + readyState);
        }


        function handleIceCandidate(event) {
            if (event.candidate) {
                sendMessage({
                    type: 'candidate',
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate});
            }
        }

        function doCall() {
            var constraints = {'optional': [], 'mandatory': {'MozDontOfferDataChannel': true}};
            // temporary measure to remove Moz* constraints in Chrome
            if (webrtcDetectedBrowser === 'chrome') {
                for (var prop in constraints.mandatory) {
                    if (prop.indexOf('Moz') !== -1) {
                        delete constraints.mandatory[prop];
                    }
                }
            }
            constraints = mergeConstraints(constraints, sdpConstraints);
            pc.createOffer(setLocalAndSendOffer, null, constraints);
        }

        function doAnswer() {
            pc.createAnswer(setLocalAndSendAnswer, null, sdpConstraints);
            $scope.busy=true;
            $scope.$apply();
        }

        function mergeConstraints(cons1, cons2) {
            var merged = cons1;
            for (var name in cons2.mandatory) {
                merged.mandatory[name] = cons2.mandatory[name];
            }
            merged.optional.concat(cons2.optional);
            return merged;
        }

        function setLocalAndSendOffer(sessionDescription) {
            // Set Opus as the preferred codec in SDP if Opus is present.
            sessionDescription.sdp = preferOpus(sessionDescription.sdp);
            pc.setLocalDescription(sessionDescription);
            sendMessage({
                sessiondescription:sessionDescription,
                callername:username,
                type:'offer'
            });
        }

        function setLocalAndSendAnswer(sessionDescription) {
            // Set Opus as the preferred codec in SDP if Opus is present.
            sessionDescription.sdp = preferOpus(sessionDescription.sdp);
            pc.setLocalDescription(sessionDescription);
            sendMessage({
                sessiondescription:sessionDescription,
                answername:username,
                type:'answer'
            });
        }

        function requestTurn(turn_url) {
            var turnExists = false;
            for (var i in pc_config.iceServers) {
                if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
                    turnExists = true;
                    turnReady = true;
                    break;
                }
            }
            if (!turnExists) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function(){
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var turnServer = JSON.parse(xhr.responseText);
                        // console.log('Got TURN server: ', turnServer);
                        pc_config.iceServers.push({
                            'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
                            'credential': turnServer.password
                        });
                        turnReady = true;
                    }
                };
                xhr.open('GET', turn_url, true);
                xhr.send();
            }
        }

        function handleRemoteStreamAdded(event) {
            console.log('Remote stream added.');
            console.log(event.stream);
            attachMediaStream(remoteVideo, event.stream);
            remoteStream = event.stream;
        }
        function handleRemoteStreamRemoved(event) {
            console.log('Remote stream removed. Event: ', event);
        }

        function hangup() {
            console.log('Hanging up.');
            stop();
            sendMessage('bye');
        }

        function handleRemoteHangup() {
            console.log('Session terminated.');
            stop();
            //  isInitiator = false;
        }

        function stop() {
            console.log("values reset");
            isInitiator = false;
            isStarted = false;
            $scope.busy=false;
            pc.close();
            pc = null;
            $scope.$apply();
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Set Opus as the default audio codec if it's present.
        function preferOpus(sdp) {
            var sdpLines = sdp.split('\r\n');
            var mLineIndex;
            // Search for m line.
            for (var i = 0; i < sdpLines.length; i++) {
                if (sdpLines[i].search('m=audio') !== -1) {
                    mLineIndex = i;
                    break;
                }
            }
            if (mLineIndex === null) {
                return sdp;
            }

            // If Opus is available, set it as the default in m line.
            for (i = 0; i < sdpLines.length; i++) {
                if (sdpLines[i].search('opus/48000') !== -1) {
                    var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
                    if (opusPayload) {
                        sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
                    }
                    break;
                }
            }

            // Remove CN in m line and sdp.
            sdpLines = removeCN(sdpLines, mLineIndex);

            sdp = sdpLines.join('\r\n');
            return sdp;
        }

        function extractSdp(sdpLine, pattern) {
            var result = sdpLine.match(pattern);
            return result && result.length === 2 ? result[1] : null;
        }

// Set the selected codec to the first in m line.
        function setDefaultCodec(mLine, payload) {
            var elements = mLine.split(' ');
            var newLine = [];
            var index = 0;
            for (var i = 0; i < elements.length; i++) {
                if (index === 3) { // Format of media starts from the fourth.
                    newLine[index++] = payload; // Put target payload to the first.
                }
                if (elements[i] !== payload) {
                    newLine[index++] = elements[i];
                }
            }
            return newLine.join(' ');
        }

// Strip CN from sdp before CN constraints is ready.
        function removeCN(sdpLines, mLineIndex) {
            var mLineElements = sdpLines[mLineIndex].split(' ');
            // Scan from end for the convenience of removing an item.
            for (var i = sdpLines.length-1; i >= 0; i--) {
                var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
                if (payload) {
                    var cnPos = mLineElements.indexOf(payload);
                    if (cnPos !== -1) {
                        // Remove CN payload from m line.
                        mLineElements.splice(cnPos, 1);
                    }
                    // Remove CN line in sdp
                    sdpLines.splice(i, 1);
                }
            }

            sdpLines[mLineIndex] = mLineElements.join(' ');
            return sdpLines;
        }

    });