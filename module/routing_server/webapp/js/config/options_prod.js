// var host = "http://localhost:8900";
var host = "https://graphhopper.com/api/1/";

var key = "2a24e316-61ea-4850-b231-4ef2fe25d229";

exports.options = {
    environment: "production",
    routing: {host: host, api_key: key},
    geocoding: {host: host, api_key: key},
    thunderforest: {api_key: '4f283c77a8644d0b8ead1a3c3faf04ba'}
};