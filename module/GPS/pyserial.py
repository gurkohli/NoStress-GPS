##############
## Script listens to serial port and writes contents into a file
##############
## requires pySerial to be installed 
import serial
import httplib
from socket import error as socket_error
import json
import time



while True:
    try:
	conn = httplib.HTTPConnection("localhost:3000")
	break;
    except socket_error as serr:
	print "Interface Not Ready Yet"
    time.sleep(0.1)

headers={'Content-type' : 'application/json'}
serial_port = '/dev/ttyS0';
baud_rate = 9600; #In arduino, Serial.begin(baud_rate)
GPS=[0,1,2]
ser = serial.Serial(serial_port, baud_rate)
while True:
    line = ser.readline();
    line = line.decode("utf-8") #ser.readline returns a binary, convert to string

    if "GPRMC" in line:
    	line=line.split(',')
	if line[2]=='A':
		#print line[5]
       		 #print line
		breakpoint=line[3].find('.')-2	
		deg=line[3][:breakpoint]
		minute=line[3][breakpoint:]
		lat=float(deg)+(float(minute)/60)
		if line[4]=='S':
			lat=lat*-1
		GPS[1]=lat
		breakpoint=line[5].find('.')-2  
       		deg=line[5][:breakpoint]
	        minute=line[5][breakpoint:]
		longi=float(deg)+(float(minute)/60)
		if line[6]=='W':
			longi=longi*-1
		GPS[0]=longi
		GPS[2]=float(float(line[7])*1.852)
		print GPS
		#print json.dumps(GPS,",")
		try:
			conn.request("POST", "/gps", json.dumps(GPS), headers)
    			response = conn.getresponse()
			print(response.read())
		except socket_error as serr:
			print "Socket Error: Interface Down"
			try:
        			conn = httplib.HTTPConnection("localhost:3000")
    			except socket_error as serr:
				print ""
		except httplib.CannotSendRequest:
			print "Cannot Send Request: Interface down"
			try:
        			conn = httplib.HTTPConnection("localhost:3000")
			except socket_error as serr:
				print""
	else:
		time.sleep(0.1)
		print ("Locking to satellites")
