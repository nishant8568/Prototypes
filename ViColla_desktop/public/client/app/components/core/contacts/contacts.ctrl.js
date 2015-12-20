/**
 * Created by Antony on 11/29/2015.
 */
contactsModule.controller('contactsController', function (databaseService,$scope,$http,authService,$location,$window,$timeout,config) {
    'use strict';

    $scope.searchContactByName = '';
    $scope.searchContactByTag = '';
    var vm = this;
    var isInitiator;
   	$scope.max = 3;
  	$scope.selectedIndex = 1;
  	 // var pc_config = webrtcDetectedBrowser === 'firefox' ?
    //   {'iceServers':[{'url':config.stunip}]} : // number IP
    //   {'iceServers': [{'url': config.stunurl}]};

      // var pc_constraints = {
      // 'optional': [
      //     {'DtlsSrtpKeyAgreement': true},
      //     {'RtpDataChannels': true}
      // ]};

      // Set up audio and video regardless of what devices are present.
      // var sdpConstraints = {'mandatory': {
      //           'OfferToReceiveAudio':true,
      //           'OfferToReceiveVideo':true }};

      var room='ChatRoom';
      var callerdetails;
			var username=localStorage.getItem('username');
  		var socket=io.connect(null,{'force new connection':true});
	  	
  			var userinfo={
            room:'ChatRoom',
            username:localStorage.getItem('username')
          };
 					if (room !== '') {
              console.log('Create or join room...', JSON.stringify(userinfo));              
              socket.emit('create or join', JSON.stringify(userinfo));
          }
          socket.on('called',function(caller){
		        callerdetails=JSON.parse(caller);
		        if(callerdetails.callername==username) {
		            console.log("caller:",caller);
		            isInitiator=true;
		            //maybeStart();
		        }
	    		});

	    		$scope.videoCall=function(receivername) {
              var caller={
                  callername:username,
                  receivername:receivername,
                  roomname:room
              }
              socket.emit('calling',JSON.stringify(caller));
              databaseService.addItem(3);   
          };

		    // $scope.videoCall=function(receivername){     	
		    	  
		    // 	databaseService.addItem(3);   	
		   
		    // };


});