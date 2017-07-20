import time
import Adafruit_LSM303
import numpy as np
lsm303 = Adafruit_LSM303.LSM303()
import httplib
from socket import error as socket_error
import json

lsm303 = Adafruit_LSM303.LSM303()
headers={'Content-type' : 'application/json'}

while True:
    try:
	conn = httplib.HTTPConnection("localhost:3000")
        print "Connected"
	break;
    except socket_error as serr:
	print "Interface Not Ready Yet"
    time.sleep(0.1)

print('Printing magnetometer X, Y, Z axis values')
while True:
    mag_x_t = 0.0
    mag_y_t = 0.0
    for i in range(0, 40):
      accel, mag = lsm303.read()
      mag_x_i, mag_z_i, mag_y_i = mag
      #print('X={0}, Y={1}'.format(mag_x_i, mag_y_i))
      mag_x_t += mag_x_i
      mag_y_t += mag_y_i
      time.sleep(0.05)
    mag_x_av = (mag_x_t/40.0 - 170.0)
    mag_y_av = (mag_y_t/40.0 + 90)
    mag_x, mag_z, mag_y = mag
    angle = np.arctan2(mag_y_av, mag_x_av)*180/np.pi
    print('AVG Mag X={0}, Mag Y={1}, Angle={2} Z={3}'.format(mag_x_av, mag_y_av, angle, mag_z))

    try:
      conn.request("POST", "/heading", json.dumps({'angle':angle}), headers)
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
          print ""

    time.sleep(0.1)
