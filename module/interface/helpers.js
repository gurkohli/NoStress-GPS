var request = require('request');

var Helper = function() {
   this.routingURL = "http://localhost:8989/route";
};

Helper.prototype.getRoute = function(points, callback) {

  var options = {
	url: this.routingURL,
	pointBegin: points[0],
	pointEnd: points[1],
	points_encoded: false
  }

  var url = this.routingURL + '?';
  for (var i=0; i<points.length; i++) {
    url += 'point=' + encodeURI(points[i]) + '&'; 
  }
  url += 'points_encoded=false'; 

  console.log(url);

  request.get({url: url}, callback);
};

Helper.prototype.sayHello = function() {
  console.log("Hello");
};

module.exports = Helper;
