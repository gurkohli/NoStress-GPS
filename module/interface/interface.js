const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const http = require('http').Server(app);
const io =  require('socket.io')(http);
const port = 3000;

var isConnected  = false;
var client = null;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json())

// Connections

app.post('/routing', function(req, res) {
  var data = req.body;
  if (isConnected && client) {
    client.emit('routing', data);
  }
  console.log("Recieved POST from Routing")
  res.send("ACK")
})




// WebSocket

function onConnection(socket) {
 	isConnected = true;
	client = socket
}

io.on('connection', onConnection);
// Callbacks

http.listen(port, () => console.log('Listening on port ' + port));
