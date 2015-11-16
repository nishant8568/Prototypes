var express = require('express');
/*
var http = require('http');
var server = http.createServer();
*/
// Setup server
var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var server = require('http').createServer(app);

require('./config/express')(app);
require('./routes')(app);


// Start server
server.listen(9000, function () {

  var io = require('socket.io').listen(server);
  io.sockets.on('connection', function (socket){

    function log(){
      var array = [">>> "];
      for (var i = 0; i < arguments.length; i++) {
        array.push(arguments[i]);
      }
      socket.emit('log', array);
    }

    socket.on('message', function (message) {
      log('Got message: ', message);
      socket.broadcast.emit('message', message); // should be room only
    });

    socket.on('create or join', function (userinfo) {
      var userdetail=JSON.parse(userinfo);
      var room =userdetail.room;
      var username=userdetail.username;
     var numClients = io.sockets.clients(room).length;

      log('Room ' + room + ' has ' + numClients + ' client(s)');
      log('Request to create or join room', room);

       if(numClients==0) {
            socket.emit('join',"no users");
       }
      else{
         io.sockets.in(room).emit('join', username);
       }

        socket.join(room);
        socket.emit('joined', room);


      //broadcast to all users in room userslist
      socket.on('users',function(usernames){
        io.sockets.in(room).emit('onlineusers',usernames);
      })

        socket.on('calling', function(caller){
            var calldetails=JSON.parse(caller);
            io.sockets.in(calldetails.roomname).emit('called', caller);
        })
        socket.on('callending',function(callended) {
            var callend=JSON.parse(callended);
            io.sockets.in(callend.roomname).emit('callended', callended);
        })

        socket.on('userlogout',function(userdetails) {
           var userinfo=JSON.parse(userdetails);
           io.sockets.in(userinfo.roomname).emit('userout',userdetails);
        })

        socket.on('logoutme',function(userdetails){
            var userinfo=JSON.parse(userdetails);
            console.log("user disconnected "+ userinfo.roomname);
            socket.leave(userinfo.roomname);
        })

      socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
      socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);

    });
  });

});

// Expose app
module.exports = module.exports = app;
