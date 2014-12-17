var socketio = require('socket.io');
var io;

var users = {};

var onJoined = function(socket) {
    socket.on("join", function(data) {
        var joinMsg = {
            name: 'server', 
            msg: 'There are ' + Object.keys(users).length + ' users online'
        };
        socket.emit('msg', joinMsg);
        socket.name = data.name;
        users[socket.name] = socket.name;
        socket.join('room1');
        socket.broadcast.to('room1').emit('msg', { name: 'server', msg: socket.name + " has joined the room."} );
        console.log(socket.name + ' joined');
        socket.emit('msg', {name: 'server', msg: 'You joined the room'});
    });
};

var onMsg = function(socket) {
    socket.on('msg', function(data) {
        io.sockets.in('room1').emit('msg', {name: socket.name, msg: data.msg});
    });
};

var onDisconnect = function(socket) {
    socket.on("disconnect", function(data) {
        socket.broadcast.to('room1').emit('msg', {name: 'server', msg: socket.name + " has left the room."});
        socket.leave('room1');
        delete users[socket.name];
 
    });
};

console.log('starting up');

function loadSockets(socketserver){
	io = socketserver;
    io.sockets.on("connection", function(socket) {
        console.log('started');
        onJoined(socket); 
        onMsg(socket); 
        onDisconnect(socket);
    });
}

module.exports.load = loadSockets;