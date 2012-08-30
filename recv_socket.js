/*
Theis module is executed by the child processes of the recv_relay.js module
recv_relay modules gets connections form clients, creates a listening socket S 
and pass it to this module.
This module opens a connection to listen to incoming messages on Rabbitmq.
When a message lands on Rabbitmq on the queue with this child comm number, 
The message is relayed to the socket S and the process starts again
*/
var amqp = require('amqp');
var fs = require('fs');

process.on('message', function(m, socket) {
    //Receiving the socket from the parent process
    if (m === 'socket') {
        //When data is received, the following block is executed
        socket.on('data', function(data){
            //Extractiong the comm number ftom the handshake 
            json = JSON.parse(data);
            addr = json['addr'];//The comm number
            console.log("The exchange address to listen to is: "+addr);
            get_rmq_config(addr, socket);
        })
    } 
});

/*
The folowing function gets the rabbitmq info (ip, port, username and password)
form config/recv_socket_config and send all the info to listen function 
*/
get_rmq_config = function(exchange_addr, socket){
    //Data is the content of the file
    fs.readFile('./config/recv_socket_config', function(err, data){
        if(err) throw err;
        config_array = JSON.parse(data);
        config_array["exchange_addr"] = exchange_addr;
        listen(config_array, socket);
    });  
}
    
listen = function(config_array, socket){
    //Opening a connection to Rabbitmq with the exchange address being the comm number
    var rmq_url = "amqp://"+config_array["username"]+":"+config_array["password"]+"@"+config_array["ip_addr"]+":"+config_array["port"];
    var conn = amqp.createConnection({url: rmq_url});
    conn.on('ready', function() {
	var exc = conn.exchange(addr, options={type:'direct'}, function (exchange) {
	    //console.log('Exchange ' + exchange.name + ' is open');
	});
	conn.queue('', function (q) {
	    console.log('Queue ' + q.name + ' is open');
            var exchange_addr = config_array["exchange_addr"];
	    q.bind(exchange_addr, '');//The exchange we bind to is the exchange with the comm number
	    console.log("Waiting for a message to relay");
	    //Subscribing to the queue and waiting for messages to relay
	    q.subscribe(options={ack: true, prefetchCount: 1}, function (message) {
		/*
		  message is an object that has 2 attributes:
		  {
		   data: <Buffer>,
		   contentType: ''application/octet-stream''
		  }
		  When a message is received, the following is executed
		*/
		console.log(message["data"]);
		//Sending the received message to the Socket S
		socket.write(message["data"]);
		q.shift();
	    });
	});
    })
}

