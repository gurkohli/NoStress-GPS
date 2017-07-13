#!/bin/bash

# Prepare Bluetooth
sudo service bluetooth stop
sudo hciconfig hci0 up

trap '' SIGHUP SIGINT SIGTERM

# Run Services
echo "Starting Services"
echo

echo "--Starting Bluetooth--"
cd bluetooth
mate-terminal -e "sudo node bluetooth.js"

until pgrep -f "sudo node bluetooth.js"
do
  sleep 0.1
done

PID_BLUETOOTH=$(pgrep -f "sudo node bluetooth.js")
echo "----Bluetooth PID = $PID_BLUETOOTH"
echo
 
echo "--Starting Maps--"
cd ../maps
mate-terminal -e "node maps"

until pgrep -f "node maps"
do 
  sleep 0.1
done

PID_MAPS=$(pgrep -f "node maps")
echo "----Maps PID = $PID_MAPS"
echo

echo "--Starting Routing Engine--"
cd ../routing_server
mate-terminal -e "./routing-server.sh"

until pgrep -f "./routing-server.sh"
do 
  sleep 0.1
done

PID_ROUTING=$(pgrep -f "./routing-server.sh")
echo "----Routing PID = $PID_ROUTING"
echo

echo "--Starting Interface--"
# Run Interface
cd ../interface
mate-terminal -e "node interface.js"

until pgrep -f "node interface.js"
do 
  sleep 0.1
done

PID_INTERFACE=$(pgrep -f "node interface.js")

echo "----Interface PID = $PID_INTERFACE"
echo

echo "All Services Successfully Started!"
echo

# Start Display
echo "Starting Display"
echo

mate-terminal -e "electron display.js --enable-webgl --ignore-gpu-blacklist"

until pgrep -f "node /usr/local/bin/electron display.js --enable-webgl --ignore-gpu-blacklist"
do
  sleep 0.1
done

PID_DISPLAY=$(pgrep -f "node /usr/local/bin/electron display.js --enable-webgl --ignore-gpu-blacklist")

echo "----Display PID = $PID_DISPLAY"
echo 

echo "Module Loaded"


# Run GPS
sudo killall gpsd
sudo gpsd /dev/ttyS0 -F /var/run/gpsd.sock

cd ../GPS
mate-terminal -e "sudo python pyserial.py"

until pgrep -f "sudo python pyserial.py"
do
   sleep 0.1
done

PID_GPS=$(pgrep -f "sudo python pyserial.py")

function kill_everything {
	echo "Terminating!!"
	sudo kill $PID_BLUETOOTH
	sudo kill $PID_MAPS
	sudo kill $PID_ROUTING
	sudo kill $PID_INTERFACE
	sudo kill $PID_GPS
	pkill "electron" & pkill "electron"
}

trap kill_everything SIGHUP SIGINT SIGTERM

while (sudo kill -0 $PID_BLUETOOTH && sudo kill -0 $PID_MAPS && sudo kill -0 $PID_ROUTING && sudo kill -0 $PID_INTERFACE && sudo kill -0 $PID_GPS && (pgrep -f "node /usr/local/bin/electron display.js" > /dev/null 2>&1) && (pgrep -f "electron" > /dev/null 2>&1))
do
	sleep 1
done

kill_everything