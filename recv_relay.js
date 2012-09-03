//This the recption relay server implemented in nodejs

var net = require('net');
var cp = require('child_process');
var fs = require('fs');

//Creating the instance of the listening server and attaching thr callback
var server = net.createServer(function (socket) {
    //Creating a child processs that executes the code in recv_socket.js
    recv_relay_child = cp.fork('recv_socket.js');
    //Passing the socket created to the new child process to handle it
    recv_relay_child.send('socket', socket);
});

//Reading the configuration file
fs.readFile('./config/recv_config', function (err, data) {
    if (err) throw err;
    var config_array = JSON.parse(data);
    var port;
    port = config_array["port"];
    console.log("Listening on the port: "+port);
    //The ip address and the port come from the config files
    server.listen(port);
});

