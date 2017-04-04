var RASPI_HOST = 'http://192.168.0.3:8080'
var tileURL = RASPI_HOST + '/styles/nostress/rendered/{z}/{x}/{y}.png'
var tileLayer = new L.TileLayer(tileURL, {minZoom: 10, maxZoom: 20});

var map = L.map('map')

map.setView([49.26, -122.95], 13)
map.addLayer(tileLayer)

var socket = io();
var routingLayer = L.geoJSON().addTo(map)
var isFirstData = true;

socket.on('routing', function(data) {
	console.log(hex2a(data))
	var parsedData = JSON.parse(hex2a(data));
	if (parsedData.geometry) {
		var geoJSONFeature = {
			"type": "Feature",
			"geometry": parsedData.geometry		
		}
		if (!isFirstData) {
			routingLayer.clearLayers()
		}
		isFirstData = false
		routingLayer.addData(geoJSONFeature)
	}
});


function hex2a(hexx) {
	var hex = hexx.toString();
	var str = '';
	for (var i=0; i<hex.length; i+=2)
		str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	return str;
}
