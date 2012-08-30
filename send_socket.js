var amqp = require('amqp');
var fs = require('fs');

process.on('message', function(m, socket){
    if(m === 'socket'){
        //console.log(socket);
        socket.on('data', function(data){
            var msg_attrs = get_message_attrs(data);//Decoding the message
            var exchange_addr = msg_attrs["addr"];
            var payload = msg_attrs["payload"]; 
            get_rmq_config(exchange_addr, payload);
        });
        //Destroying the socket when we are done
        socket.on('end', function() {
            socket.destroy();
        });
    };
})

//Getting the message attributes witch are the comm number (addr) and the payload (the message of the user)
get_message_attrs = function (raw_message){
    /*
      Uses json library to decode the 
      raw message and extract the destination addr and the message paylod
    */
    var json = JSON.parse(raw_message);
    var msg_attrs = new Object();
    msg_attrs["addr"] = json["addr"];
    msg_attrs["payload"] = json["payload"];
    //returning the array with the addr and the payload
    return msg_attrs;
}

/*
The folowing function gets the rabbitmq info (ip, port, username and password)
from config/send_socket_config and send all the info to listen function 
Todo: read the server info once and reuse everytime we send messages instead of reading the info
      everytime we send data
*/
get_rmq_config = function(exchange_addr, message){
    //Data is the content of the file
    fs.readFile('./config/send_socket_config', function(err, data){
        if(err) throw err;
        config_array = JSON.parse(data);
        config_array["exchange_addr"] = exchange_addr;
        //Passing the rmq server info nd the message to send_message function
        send_message(config_array, message);
    });  
}
 
/*
Sending only the payload of the message to the exchange with the comm number exchange_addr
and the info of the server in the array config_array
*/
send_message = function (config_array, message){
    //Sending the message to the queu where the destionation is subscribed
    console.log("The destination addr: '"+config_array["exchange_addr"]+"'.the payload:"+ message);
    var rmq_url = "amqp://"+config_array["username"]+":"+config_array["password"]+"@"+config_array["ip_addr"]+":"+config_array["port"];  
    var connection = amqp.createConnection({url: rmq_url});
    //We need to wait for the connection to be ready before we can use its attributes and functions
    connection.on('ready', function(){
        //Declaring the exchange that represents the dialing number of the subscribers
        exchange_addr = config_array["exchange_addr"];
        var exc = connection.exchange(exchange_addr, options={type:'direct'}, function (exchange) {
            //console.log('Exchange ' + exchange.name + ' is open');
            exchange.publish('', message, null);
        });
    });
}

