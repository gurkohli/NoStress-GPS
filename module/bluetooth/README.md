# Bluetooth Module for NoStress GPS

## Prerequisites
* Raspberry Pi
* USB Bluetooth dongle (Inbuilt bluetooth in RPi3 works)
* bleno: Install it and it's dependencies using [this link](https://github.com/sandeepmistry/bleno)

## Running (bleno_example for now)
```
cd bleno_Example\echo
sudo node main.js
```

## Troubleshooting
### Bluetooth is not discoverable
    * Run ` hciconfig -a` and check BD Address.
    * If BD Address shows "AA:AA:AA...", blenz bluetooth kernel is incorrectly installed.
    * Follow [this link](https://www.raspberrypi.org/forums/viewtopic.php?f=28&t=138908)

## Copyright
NoStress 2017
