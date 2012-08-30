#client example
import sys
import socket
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect(('127.0.0.1', 1338))
client_socket.send('{"addr":"'+sys.argv[1]+'"}')
while 1:
    data = client_socket.recv(1024)
    print "RECIEVED:" , data

