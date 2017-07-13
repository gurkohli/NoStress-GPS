var app = angular.module("NoStressInterface",[])
var socket = io()
var currentRoute;

app.controller("InterfaceController", function InterfaceController($scope) {

  // Initialization
  $scope.ETA = "ETA";
  $scope.currentStreetName = "Current Street Name";
  $scope.nextTurnDistance = "Distance to Next Turn";
  $scope.nextTurnStreet = "Next Turn Street Name";
  // var RASPI_HOST = 'http://localhost:8080'
  // var tileURL = RASPI_HOST + '/styles/nostress/rendered/{z}/{x}/{y}.png'
  const ZOOM_LEVEL_SLOW = 18;
  const ZOOM_LEVEL_FAST = 17;

   // variable to update current zoom level on next map ren
  var zoomLevelGlobal = ZOOM_LEVEL_SLOW;
  var pitchAngle = 0;
  var bearingAngle = 0;
 

  var map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'http://localhost:8080/styles/nostress.json', //stylesheet location
      center: [-123.10, 49.2811], // starting position
      zoom: zoomLevelGlobal, // starting zoom
      pitch: pitchAngle,
      bearing: bearingAngle
  });

  map.on('load', function () {

  	loadLocatorImage(); // load GPS symbol
  	updateLocator(-123.10,49.2811); // spawn start point
  	loadPath({type: "LineString", coordinates: [ [-123.10, 49.2811], [-123.00, 49.2811] ]}); // for testing purposes

  });
  var socket = io();

  map.addControl( new mapboxgl.NavigationControl());
  // // BLE handle
  socket.on('routing', function(data) {
	console.log(data)
	currentRoute = data;
	var path = data.paths[0];
	var points = path.points
  	if (points) {
//		updateLocator(path.snapped_waypoints.coordinates[0][0], path.snapped_waypoints.coordinates[0][1]);
  		loadPath(points);
  	}
  });

  // GPS sensor handle
  //var counter = 10;

  socket.on('mag', function(data) {
  	  pitchAngle = data[0]; // we can hardcode pitch=60
	  bearingAngle = data[1]; 
  });


  socket.on('gps', function(data) {

   	updateLocator(data[0], data[1]); // update current position
  	map.flyTo({
		center: [data[0], data[1]],  // updates view and centers your position
		zoom: zoomLevelGlobal,
		pitch: pitchAngle,
    		bearing: bearingAngle
  	});
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
	var id = "route";
	if (map.getLayer(id) != undefined) {
		map.removeLayer(id);
	}
	if (map.getSource(id) != undefined) {
		map.removeSource(id);
	}
  	map.addLayer({
          "id": id,
          "type": "line",
          "source": {
              "type": "geojson",
              "data": {
                  "type": "Feature",
                  "properties": {},
                  "geometry": data
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

  function loadLocatorImage() // function to load image TODO: load from localhost
  {
  	map.loadImage('https://cdn3.iconfinder.com/data/icons/internet-and-web-4/78/internt_web_technology-08-512.png', (error, image) => {
      if (error) throw error;
      map.addImage('flag', image);
   	});
  }

  function updateLocator(long, lat) // function to move gps point
  {
        var id = "locator";
        if (map.getLayer(id) != undefined) {
                map.removeLayer(id);
        }
        if (map.getSource(id) != undefined) {
                map.removeSource(id);
        }
  	map.addLayer({
              "id": id,
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
                  "icon-size": 0.1
              }
          });
  }

  // UI Functions

  function updateETA(value) {
    $scope.ETA = 10;
  }

});
