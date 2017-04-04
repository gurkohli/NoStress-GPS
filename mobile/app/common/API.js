import React from 'react';
import {
} from 'react-native';

var LIMIT_COUNTRY_CODE = 'CA'
var GEOCODING_API = 'https://nominatim.openstreetmap.org/search';
var ROUTE_API = 'https://router.project-osrm.org/route/v1/driving/'

export default class API {
  constructor() {

  }

  geocodingSearch(query) {
    var parameters = {
      q: query,
      format: 'json',
      countrycodes: LIMIT_COUNTRY_CODE,
      limit: 1
    }
    var URL = GEOCODING_API + "";
    URL += '?' + 'q=' + parameters.q;
    URL += '&' + 'format=' + parameters.format;
    URL += '&' + 'countrycodes=' + parameters.countrycodes;
    URL += '&' + 'limit=' + parameters.limit;

    return fetch(encodeURI(URL)).then((response)=>response.json()).catch((error)=>{throw error})
  }
  // @parameters
  // source: [longitude, latitude]
  // destination: [longitude, latitude]
  // options : {}
  findFastestRoute(source, destination, options) {
    if (!options) options = {}
    var parameters = {
      source: source.join(","),
      destination: destination.join(","),
      steps: options.steps || 'true',
      geometries: options.geometries || 'geojson',
      overview: options.overview || 'simplified',//'full',
      alternatives: options.alternatives || 'false'
    }
    var URL = ROUTE_API + "";
    URL += parameters.source + ';' + parameters.destination;
    URL += '?' + 'steps=' + parameters.steps;
    URL += '&' + 'geometries=' + parameters.geometries;
    URL += '&' + 'overview=' + parameters.overview;
    URL += '&' + 'alternatives=' + parameters.alternatives;

    return fetch(encodeURI(URL)).then((response)=>response.json()).catch((error)=>{throw error})
  }
}
