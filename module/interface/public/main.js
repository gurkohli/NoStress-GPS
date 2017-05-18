var RASPI_HOST = 'http://localhost:8080'
var tileURL = RASPI_HOST + '/styles/nostress/rendered/{z}/{x}/{y}.png'
var tileLayer = new L.TileLayer(tileURL, {minZoom: 10, maxZoom: 20});

// var map = L.map('map')
//
// map.setView([49.26, -122.95], 13)
// map.addLayer(tileLayer)
//
// var socket = io();
// var routingLayer = L.geoJSON().addTo(map)
// var isFirstData = true;

var map = new mapboxgl.Map({
	container: 'map',
	style: 'http://localhost:8080/styles/nostress.json'
})

map.on('load', function () {


		var marker = new mapboxgl.Marker().setLngLat([-123.0076, 49.2276]).addTo(map)
    map.addLayer({
        "id": "route",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": {
                "type": "Feature",
                "properties": {},
								"geometry":{
                  "coordinates":[
                     [
                        -122.95882,
                        49.280616
                     ],
                     [
                        -122.959579,
                        49.280357
                     ],
                     [
                        -122.960472,
                        49.280248
                     ],
                     [
                        -122.960677,
                        49.280238
                     ],
                     [
                        -122.961415,
                        49.280252
                     ],
                     [
                        -122.962434,
                        49.280317
                     ],
                     [
                        -122.96349,
                        49.280388
                     ],
                     [
                        -122.964678,
                        49.280418
                     ],
                     [
                        -122.965839,
                        49.280403
                     ],
                     [
                        -122.967877,
                        49.2804
                     ],
                     [
                        -122.970032,
                        49.280396
                     ],
                     [
                        -122.97209,
                        49.280397
                     ],
                     [
                        -122.972511,
                        49.280341
                     ],
                     [
                        -122.974411,
                        49.280335
                     ],
                     [
                        -122.975525,
                        49.280333
                     ],
                     [
                        -122.97687,
                        49.280333
                     ],
                     [
                        -122.977636,
                        49.280333
                     ],
                     [
                        -122.978179,
                        49.280333
                     ],
                     [
                        -122.978195,
                        49.280333
                     ],
                     [
                        -122.978877,
                        49.280333
                     ]
                  ],
                  "type":"LineString"
               }
            }
        },
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#ffffff",
            "line-width": 8
        }
    });
});

//socket.on('routing', function(data) {
	// if (data.geometry) {
	// 	var geoJSONFeature = {
	// 		"type": "Feature",
	// 		"geometry": data.geometry
	// 	}
	// 	if (!isFirstData) {
	// 		routingLayer.clearLayers()
	// 	}
	// 	isFirstData = false
	// 	routingLayer.addData(geoJSONFeature)
	// }
//});
