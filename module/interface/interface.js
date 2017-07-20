const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const http = require('http').Server(app);
const io =  require('socket.io')(http);
const port = 3000;
const Helper = require('./helpers.js');


var interfaceHelper = new Helper();
var isConnected  = false;
var client = null;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json())

// Connections

app.post('/routing', function(req, res) {
  var data = req.body;
  console.log(data)
  if (data.source != undefined && data.destination != undefined) {
    var points = [data.source, data.destination];
    interfaceHelper.getRoute(points, function(err, response, body) {
	if (!err && res.statusCode == 200) {
	  if (isConnected && client) {
            client.emit('routing', JSON.parse(body));
	  }
     	  console.log("Recieved POST from Routing")
          res.send("SUCCESS")
	} else {
	  res.send("ROUTING_ERROR");
	}
    });
  } else {
    console.log("[ERROR] Recieved Bad Data from Routing")
    res.send("BAD DATA")
  }
})

app.post('/gps', function(req, res) {
  var data = req.body;
  if (isConnected && client)
  {
    client.emit('gps', data);
  }
  console.log("Recieved POST from GPS")
  res.send("ACK")
})

app.post('/acc', function(req, res) {
  var data = req.body;
  if (isConnected && client) 
  {
  	//console.log(data.data);
    client.emit('acc', data.data);
  }
  console.log("Recieved POST from acc")
  res.send("ACK")
})

app.post('/mag', function(req, res) {
  var data = req.body;
  if (isConnected && client) 
  {
  	console.log(data);
  	data = [ parseInt(data[0]), parseInt(data[1]) ];
    client.emit('mag', data);
  }
  console.log("Recieved POST from Mag")
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
