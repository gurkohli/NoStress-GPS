var RASPI_HOST = 'http://localhost:8080' // server with rendered tiles
var tileURL = RASPI_HOST + '/styles/nostress/rendered/{z}/{x}/{y}.png' // path to get a tile

var tileLayer = new L.TileLayer(tileURL, {minZoom: 10, maxZoom: 20}); // create a map
var markers = new L.FeatureGroup(); // hold temporary objects only
var map = L.map('map'); // main map where all tiles attached

const ZOOM_LEVEL_SLOW = 18;
const ZOOM_LEVEL_MED = 17;
const ZOOM_LEVEL_FAST = 16;

var zoomLevelGlobal = ZOOM_LEVEL_SLOW; // variable to update current zoom level on next map render

map.setView([49.2811, -123.10], zoomLevelGlobal) // TODO: change onces start coordinates once feature is impremented
map.addLayer(tileLayer) // rendering of map
map.addLayer(markers) // rendering of temp objects

var latlngs = [ // temp data for simulations line
    [49.2811, -123.10],
    [49.2811, -123.00]
];
var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);

var socket = io(); // establish connection to socket server
var routingLayer = L.geoJSON().addTo(map)
var isFirstData = true;

// BLE handle
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

// GPS sensor handle
var counter = 10;
socket.on('gps', function(data) {
	markers.clearLayers(); // clear previous marker
	//console.log("gps data");
	L.marker([data[0], data[1]]).addTo(markers); // use default leaflet marker, todo: change to dot or smth like  that
	counter--;
	if(counter==0) // update the View of the map not everytime but periodically
	{
		map.setView([data[0], data[1]], zoomLevelGlobal); // updates view and centers your position
		counter=10;
	}

});

socket.on('acc', function(data) {
	if(data == "Fast")
	{
		zoomLevelGlobal = ZOOM_LEVEL_FAST;
	}
	else
	{
		zoomLevelGlobal = ZOOM_LEVEL_SLOW;
	}

});





