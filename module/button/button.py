import os
import serial
import httplib
from socket import error as socket_error
import json
import time
 
import RPi.GPIO as GPIO
 
headers={'Content-type' : 'application/json'}

# send POST to interface.js

def sendData(buttonNumber, conn):
    try:
      print "Button cliked to send data"
      buttonJson = { "Bnum": int(buttonNumber) }
      conn.request("POST", "/button", json.dumps(buttonJson), headers)
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

while True:
    try:
        conn = httplib.HTTPConnection("localhost:3000")
        print "Connected"
        break;
    except socket_error as serr:
        print "Interface Not Ready Yet"
        time.sleep(0.1)

# declare buttons
GPIO.setmode(GPIO.BCM)
GPIO.setup(26, GPIO.IN)

# gpio button handler
while True:
  if(GPIO.input(26) == True):
    buttonNumber = 0
    sendData(buttonNumber, conn)
    time.sleep(10)
