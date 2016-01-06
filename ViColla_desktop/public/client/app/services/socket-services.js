/**
 * Created by daniel on 28.12.2015.
 */

socketWrapper.factory('socket', function ($rootScope) {
    var socket;

    socket = io.connect();

    return {
        connect: function(){
            socket = io.connect();
            //socket = io.connect(null, {'force new connection': true});
        },
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            console.log("services >> emitting event : " + eventName + " : with data : ");
            console.log(data);
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        },
        removeAllListeners : function(eventName){
            socket.removeAllListeners();
            console.log("removeAllListeners");
        }
    };
});
