var request = require('request');
var bleno = require('bleno');

var BlenoPrimaryService = bleno.PrimaryService;

var EchoCharacteristic = require('./src/characteristic');
var ButtonCharacteristics = require('./src/buttons');
var SettingsCharacteristic = require('./src/settings');

// Callbacks

function routingCallback(data) {
  request({
    url: "http://localhost:3000/routing",
    method: "POST",
    json: true,
    headers: {
        "content-type": "application/json",
    },
    body: JSON.parse(data)
  }, function(err, response, body) {
    console.log(body)
  })
  console.log("Routing: Sending POST data to Interface")
}

function buttonsCallback(data) {
  console.log(data)
  request({
    url: "http://localhost:3000/buttonconfig",
    method: "POST",
    json: true,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.parse(data)
  }, function(err, response, body) {
    console.log(body)
  })
  console.log("Buttons: Sending POST data to Interface")
}

function SettingsCallback(data) {
  console.log(data)
  request({
    url: "http://localhost:3000/settings",
    method: "POST",
    json: true,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.parse(data)
  }, function(err, response, body) {
    console.log(body)
  })
  console.log("Settings: Sending POST data to Interface")
}
// Main

console.log("Starting Bluetooth Module");

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('NoStress GPS', ['ec00']);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: '526f7574696e6753657276696365ffff',
        characteristics: [
          new EchoCharacteristic(routingCallback),
          new ButtonCharacteristics(buttonsCallback),
          new SettingsCharacteristic(SettingsCallback)
        ]
      })
    ]);
  }
});
