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
	if (data.geometry) {
		var geoJSONFeature = {
			"type": "Feature",
			"geometry": data.geometry
		}
		if (!isFirstData) {
			routingLayer.clearLayers()
		}
		isFirstData = false
		routingLayer.addData(geoJSONFeature)
	}
});
