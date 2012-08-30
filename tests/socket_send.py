#Echo client program
import sys
import socket

HOST = 'localhost'    # The remote host
PORT = 1337              # The same port as used by the server
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))
s.send('{"addr":"'+sys.argv[1]+'", "payload":"'+sys.argv[2]+'"}')
#data = s.recv(1024)
s.close()
