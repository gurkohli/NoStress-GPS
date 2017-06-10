var app = angular.module("NoStressInterface",[])
var socket = io()

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
      center: [0,0], // starting position
      zoom: zoomLevelGlobal, // starting zoom
      pitch: pitchAngle,
      bearing: bearingAngle
  });

  map.on('load', function () {

  	loadLocatorImage(); // load GPS symbol
  	updateLocator(0,0); // spawn start point

<<<<<<< cce466ec3135a698c30fca0e42d0a1b860be29be
  	loadPath([ [-123.10, 49.2811], [-123.00, 49.2811] ]); // for testing purposes
    
  });
  var socket = io();
=======
  	//loadPath([ [-123.10, 49.2811], [-123.00, 49.2811] ]); // for testing purposes
      //loadLocatorImage(); // load GPS symbol
      //updateLocator(-123.10, 49.2811); // spawn start point

  });

>>>>>>> Added script to run all services at once and keep track of them
  //var routingLayer = L.geoJSON().addTo(map)
  var isFirstData = true;

  map.addControl( new mapboxgl.NavigationControl());
  // // BLE handle
  socket.on('routing', function(data) {
	console.log(data)
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
  	  pitchAngle = data[0]; // we can hardcode pitch=60
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

  function loadLocatorImage() // function to load image TODO: load from localhost
  {
  	map.loadImage('https://cdn3.iconfinder.com/data/icons/internet-and-web-4/78/internt_web_technology-08-512.png', (error, image) => {
      if (error) throw error;
      map.addImage('flag', image);
   	});
  }

  function updateLocator(long, lat) // function to move gps point
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
                  "icon-size": 0.1
              }
          });
  }

  // UI Functions

  function updateETA(value) {
    $scope.ETA = 10;
  }

});
