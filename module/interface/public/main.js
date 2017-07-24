var app = angular.module("NoStressInterface",[])
var socket = io()

app.controller("InterfaceController", function InterfaceController($scope) {

  // Initialization
  var currentRoute = {};
  var settings = {};
  currentRoute.active = false;
  var lastGPSLocation;
  var lastVelocity;

  // var RASPI_HOST = 'http://localhost:8080'
  // var tileURL = RASPI_HOST + '/styles/nostress/rendered/{z}/{x}/{y}.png'
  const ZOOM_LEVEL_SLOW = 18;
  const ZOOM_LEVEL_FAST = 17;

   // variable to update current zoom level on next map ren
  var zoomLevelGlobal = ZOOM_LEVEL_SLOW;
  var pitchAngle = 60;
  var bearingAngle = 0;



  var map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'http://localhost:8080/styles/nostress.json', //stylesheet location
      center: [-122.979702, 49.279785], // starting position
      zoom: zoomLevelGlobal, // starting zoom
      pitch: pitchAngle,
      bearing: bearingAngle
  });

  map.on('load', function () {

  	//loadLocatorImage(); // load GPS symbol
  	//updateLocator(-123.10,49.2811); // spawn start point
  	//loadPath({type: "LineString", coordinates: [ [-123.10, 49.2811], [-123.00, 49.2811] ]}); // for testing purposes

  });
  var socket = io();

  map.addControl( new mapboxgl.NavigationControl());
  // // BLE handle
  socket.on('routing', function(data) {
  	console.log(data)
  	var path = data.paths[0];
  	var points = path.points;

    currentRoute.path = path;
    currentRoute.active = true;

  	if (points) {
//		updateLocator(path.snapped_waypoints.coordinates[0][0], path.snapped_waypoints.coordinates[0][1]);
  		loadPath(points);
      setValues(path);
  	}
  });

  // GPS sensor handle
  //var counter = 10;

  socket.on('mag', function(data) {
  	  pitchAngle = 60; // we can hardcode pitch=60
	  bearingAngle = data[1];
  });


  socket.on('gps', function(data) {
    if (lastGPSLocation == undefined) {
      lastGPSLocation = [data[0], data[1]];
    }
    var distanceTravelledInMetres = haversineDistance(lastGPSLocation, [data[0], data[1]])
    if (distanceTravelledInMetres >= 0.01) {
      updateLocator(data[0], data[1]); // update current position
      map.flyTo({
        center: [data[0], data[1]],  // updates view and centers your position
        zoom: zoomLevelGlobal,
        pitch: pitchAngle,
        bearing: bearingAngle
      });
    }
    if (currentRoute.active) {
      validateRoute(data) // Check if we need rerouting and reroute if we do
      updateValues(data, distanceTravelledinMetres); // Update UI Values
    }
    lastVelocity = data[3]
    lastGPSLocation = [data[0], data[1]];

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

  socket.on('settings', function(data) {
    settings = data;
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

  function updateValues(gpsData, distanceTravelledinMetres) {
    var currentInstruction = currentRoute.path.instructions[currentRoute.instructionIndex]
    var referenceVelocity = currentInstruction.distance/(currentInstruction.time/1000)

    var timeTaken = distanceTravelledinMetres/ referenceVelocity // kmph to mps
    var timeInMS = timeTaken * 1000;

    var newETA = currentRoute.eta - timeInMS;
    var newTurnDistance = currentRoute.nextTurnDistance - distanceTravelledinMetres;


    var indexOfLastCoordinateForCurrentInstruction = currentInstructions.interval[1];

    var lastCoordinateForCurrentInstruction = currentRoute.path.points[indexOfLastCoordinateForCurrentInstruction];

    var distanceToLastCoordinate = haversineDistance(lastCoordinateForCurrentInstruction, [gpsData[0], gpsData[1]]);

    if (distanceToLastCoordinate < 0.2) {
      // If it's the last instruction then do stuff
      if (lastCoordinateForCurrentInstruction == currentRoute.path.points.length) {
        clearValues();
      } else {
        setETA(newETA);
        setValues(currentRoute.path, currentRoute.instructionIndex+1);
      }
    } else {
      setETA(newETA);
      setNextTurnDistance(newTurnDistance);
    }
  }

  function setValues(path, index) {
    if (!index) index = 0;

    currentRoute.instructionIndex = index;

    if (index == 0) setETA(path.time);

    setCurrentStreetName(path.instructions[index].street_name)
    setInstructionText(path.instructions[index].text)

    setNextTurnDistance(path.instructions[index].distance)
    if (index+1) {
      setNextTurnStreet(path.instructions[index+1].street)
      setNextTurnDirection(path.instructions[index+1].sign)
    } else {
      setNextTurnStreet() // Clear Values
      setNextTurnDirection() // Clear Values
    }

    $scope.$apply();
  }

  function clearValues() {
    currentRoute = {};
    currentRoute.active = false;

    $scope.ETA = '';
    $scope.currentStreetName = '';
    $scope.instruction = '';
    $scope.nextTurnDistance = '';
    $scope.nextTurnStreet = '';
    $scope.nextTurnDirection = '';

  }

  function setETA(value) {
    var time = new Date(1970, 0, 1);
    time.setMilliseconds(value);

    currentRoute.eta = value;
    $scope.ETA = time.getMinutes().toString() + ":" + time.getSeconds().toString();
  }

  function setCurrentStreetName(value) {
    currentRoute.currentStreetName = value;
    $scope.currentStreetName = value;
  }

  function setInstructionText(value) {
    currentRoute.instruction = value;
    $scope.instruction = value;
  }

  function setNextTurnDistance(value) {
    var distanceRaw = value / 1000;
    var distanceParsed = distanceRaw.toPrecision(2);
    var units = (settings && settings.units) || "km"
    if (units == "km") {
      if (distanceParsed < 1) {
        distanceParsed = distanceParsed * 1000
        units = "m"
      }
    } else {
      distanceParsed = distanceParsed * 0.621371;
    }

    currentRoute.nextTurnDistance = value;
    $scope.nextTurnDistance = distanceParsed + " " + units;
  }

  function setNextTurnStreet(value) {
    var street = value
    if (street == undefined) {
      street = '';
    }
    currentRoute.nextTurnStreet = street;
    $scope.nextTurnStreet = street;
  }

  function setNextTurnDirection(value) {
    var getIconOfDirection = function(direction) {
        switch (direction){
          case -3:
            return "gfx/Sharp Left.png";
            break;
          case -2:
            return "gfx/Left.png";
            break;
          case -1:
            return "gfx/Slight Left.png";
            break;
          case -0:
            return "gfx/Straight.png";
            break;
          case 1:
            return "gfx/Slight Right.png";
            break;
          case 2:
            return "gfx/Right.png";
            break;
          case 3:
            return "gfx/Sharp Right.png";
            break;
          case 4:
            return "gfx/Finish.png";
            break;
          case 5:
            return "gfx/Sharp Left.png";
            break;
          case 6:
            return "gfx/Roundabout.png";
            break;
        }
      }
      if (value) {
        currentRoute.nextTurnDirection = value;
        $scope.nextTurnDirection = getIconOfDirection(value)
      } else {
        currentRoute.nextTurnDirection = '';
        $scope.nextTurnDirection = '';
      }

  }


  // Checks distance between two coordinates.
  // Obtained from: https://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript
  // coords arguments are [longitude, latitude].
  function haversineDistance(coords1, coords2, isMiles) {
    function toRad(x) {
      return x * Math.PI / 180;
    }

    var lon1 = coords1[0];
    var lat1 = coords1[1];

    var lon2 = coords2[0];
    var lat2 = coords2[1];

    var R = 6371; // km

    var x1 = lat2 - lat1;
    var dLat = toRad(x1);
    var x2 = lon2 - lon1;
    var dLon = toRad(x2)
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    if(isMiles) d /= 1.60934;

    return d;
  }
});
