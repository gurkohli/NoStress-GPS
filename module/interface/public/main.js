// var RASPI_HOST = 'http://localhost:8080'
// var tileURL = RASPI_HOST + '/styles/nostress/rendered/{z}/{x}/{y}.png'
const ZOOM_LEVEL_SLOW = 18;
const ZOOM_LEVEL_MED = 17;
const ZOOM_LEVEL_FAST = 16;

 // variable to update current zoom level on next map ren
var zoomLevelGlobal = ZOOM_LEVEL_SLOW;
var pitchAngle = 0;
var bearingAngle = 0;

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'http://localhost:8080/styles/nostress.json', //stylesheet location
    center: [-123.10, 49.2811], // starting position
    zoom: zoomLevelGlobal // starting zoom
});

map.on('load', function () {


	loadPath([ [-123.10, 49.2811], [-123.00, 49.2811] ]); // for testing purposes    
    loadLocatorImage(); // load GPS symbol
    updateLocator(-123.10, 49.2811); // spawn start point

});   

var socket = io();
//var routingLayer = L.geoJSON().addTo(map)
var isFirstData = true;

map.addControl( new mapboxgl.NavigationControl());
// // BLE handle
socket.on('routing', function(data) {
	if (data.geometry) {
		var geoJSONFeature = {
			"type": "Feature",
			"geometry": data.geometry
		}
		if (!isFirstData) {
			routingLayer.clearLayers()
		}
		isFirstData = false;
		loadPath(geoJSONFeature);
	}
});

// GPS sensor handle
//var counter = 10;

socket.on('mag', function(data) {
	pitchAngle = data[0];
	bearingAngle = data[1]; 
});


socket.on('gps', function(data) {

	map.removeLayer("point");// clear previous marker
	map.removeSource("point");
	updateLocator(data[1], data[0]); // update current position
	map.flyTo({ 
			center: [data[1], data[0]],  // updates view and centers your position
			zoom: zoomLevelGlobal,
			pitch: pitchAngle,
    		bearing: bearingAngle
		});
	// counter--;
	// if(counter==0) // update the View of the map not everytime but periodically
	// {

	// 	counter=10;
	// }

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

function loadPath(data)
{
	map.addLayer({
        "id": "route",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "LineString",
                    "coordinates": data
                }
            }
        },
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#0000FF",
            "line-width": 8
        }
    });
}

function loadLocatorImage()
{	   
	map.loadImage('https://upload.wikimedia.org/wikipedia/commons/a/ad/Gradeas_dick.png', (error, image) => {
    if (error) throw error;
    map.addImage('flag', image);
 	});
}

function updateLocator(long, lat)
{
	map.addLayer({
            "id": "point",
            "type": "symbol",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [long, lat]
                        }
                    }]
                }
            },
            "layout": {
                "icon-image": "flag",
                "icon-size": 0.5
            }
        });
}