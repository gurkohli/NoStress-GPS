const express = require('express');
const app = express();
const http = require('http').Server(app);
const io =  require('socket.io')(http);
const port = 3000;

var bleno = require('bleno');

var BlenoPrimaryService = bleno.PrimaryService;

var EchoCharacteristic = require('./characteristic');

var isConnected  = false;
var client = null;

app.use(express.static(__dirname + '/public'));

// WebSocket

function onConnection(socket) {
 	isConnected = true;
	client = socket
}

io.on('connection', onConnection);


// Callbacks

function routingCallback(data) {
	if (isConnected && client) {
		client.emit('routing', data);
	}
	return 
}

// Main

console.log('bleno - echo');

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
          new EchoCharacteristic(routingCallback)
        ]
      })
    ]);

	http.listen(port, () => console.log('Listening on port ' + port));
  }
});
