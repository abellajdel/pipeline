var net = require('net');
var cp = require('child_process');
var fs = require('fs');

var server = net.createServer(function (socket) {
    /*
     When there is a socket connection request, a child of 
     send_socket.js is created and the socket is passed to the child process
     to handle the messages
    */
    send_relay_child = cp.fork("send_socket.js");
    send_relay_child.send('socket', socket);
    send_relay_child.on('exit', function(code, signal){
        console.log('Exiting with code '+code+' signal '+signal+' received, bye');
    });
});


//Reading the configuration file
fs.readFile('./config/send_config', function (err, data) {
    if (err) throw err;
    var config_array = JSON.parse(data);
    var ip_addr;
    var port;
    ip_addr = config_array["ip_addr"];
    port = config_array["port"];
    console.log("Listening on the ip: "+config_array["ip_addr"]+" and the port: "+config_array["port"]);
    server.listen(port, ip_addr);
});


