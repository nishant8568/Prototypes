var static = require('node-static');
var http = require('http');

//
// Create a node-static server instance to serve the './app' folder
//
var file = new static.Server('./app');

// We use the http module’s createServer function and
// rely on our instance of node-static to serve the files
var app = http.createServer(function (req, res) {
    file.serve(req, res);
}).listen(8081);

// Use socket.io JavaScript library for real-time web applications
var io = require('socket.io').listen(app);

// Let's start managing connections...
io.sockets.on('connection', function (socket){
    var _room;
    // Handle 'message' messages
    socket.on('message', function (message) {
        log('S --> got message: ', message);
        // channel-only broadcast...
        io.sockets.in(_room).emit('message', message);
    });

    // Handle 'message' messages
    socket.on('state', function (state) {
        log('S --> got state: ', state);
        // channel-only broadcast...
        io.sockets.in(_room).emit('state', state);
    });

    // Handle 'Drawing' messages
    socket.on('newClick', function (click) {
        //log('S --> got click: ', click);
        // channel-only broadcast...
        io.sockets.in(_room).emit('newClick', click);
    });

    // Handle 'Drawing' messages
    socket.on('clearCanvas', function (msg) {
        //log('S --> got click: ', click);
        // channel-only broadcast...
        io.sockets.in(_room).emit('clearCanvas', msg);
    });


    // Handle 'create or join' messages
    socket.on('create or join', function (room) {

        _room = room;

        var numClients = (typeof io.sockets.adapter.rooms[room] == "undefined")?0 : Object.keys(io.nsps['/'].adapter.rooms[room]).length;

        log('S --> Room ' + room + ' has ' + numClients + ' client(s)');
        log('S --> Request to create or join room', room);

        // First client joining...
        if (numClients == 0){
            socket.join(room);
            socket.emit('created', room);
        } else if (numClients == 1) {
            // Second client joining...
            io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room);
        } else { // max two clients
            socket.emit('full', room);
        }
    });

    function log(){
        var array = [">>> "];
        for (var i = 0; i < arguments.length; i++) {
            array.push(arguments[i]);
        }
        socket.emit('log', array);
    }
});