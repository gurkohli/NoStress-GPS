map = new L.Map('map');
var osmUrl='http://localhost:8080/styles/klokantech-basic/rendered/{z}/{x}/{y}.png';
var osmAttrib='Test Server';
var osm = new L.TileLayer(osmUrl, {minZoom: 6, maxZoom: 20, attribution: osmAttrib});   
    // start in Vancouver DT

// start jorney
//console.log(showInitialRoute());
var firstViewCoordinates= showInitialRoute();
map.setView(new L.LatLng(firstViewCoordinates[0],firstViewCoordinates[1]),14);
map.addLayer(osm);
showInitialRoute();

// start marker
var markerStart = L.marker(getCoordinatesStart() ).addTo(map);

//end marker
var markerEnd = L.marker(getCoordinatesEnd() ).addTo(map);

//route
var polygon = L.polyline( getRoutePolyline()
).addTo(map);

function getCoordinatesStart() {
  //fake for now, real should be from the Routing
  return [49.2833, -123.1179];
}

function getCoordinatesEnd() {
  //fake for now, real should be from the Routing
  return [49.2811, -123.017];
}

function getRoutePolyline() {
  //fake for now, real should be from the Routing
  return [ [49.2833, -123.1179],[49.2811, -123.017] ]
}

function showInitialRoute() {
  var start = getCoordinatesStart();
  var end = getCoordinatesEnd();
  var result = [0,0];
  //console.log(start);
  //console.log(end);

  // latitude -90 to 90
  if( start[0] - end[0] > 0 )
  {
    result[0] = end[0] + (start[0] - end[0])/2;
    //console.log("if");
  }
  else
  {
    result[0] = start[0] + (end[0]-start[0])/2;
    //console.log("else");
  }

  // longitude -180 to 180
  if( start[1] - end[1] > 0 )
  {
    result[1] = end[1] + (start[1] - end[1])/2;
    //console.log("if");
  }
  else
  {
    result[1] = start[1] + (end[1]-start[1])/2;
    //console.log("else");
  }
  //console.log(result);
  
  result[0]=parseFloat(result[0].toFixed(3));
  result[1]=parseFloat(result[1].toFixed(3));

  return result


}