var util = require('util');
var bleno = require('bleno');
var pako = require('pako');
var BlenoCharacteristic = bleno.Characteristic;

var PAYLOAD_END = "145145145145";

var ButtonCharacteristics = function(callback) {
  ButtonCharacteristics.super_.call(this, {
    uuid: '50726f6772616d6d61626c6542754331',
    properties: ['read', 'write', 'notify'],
    value: null
  });

  this._value = new Buffer(0);
  this._packetArray = [];
  this._updateValueCallback = callback;
};

util.inherits(ButtonCharacteristics, BlenoCharacteristic);

ButtonCharacteristics.prototype.onReadRequest = function(offset, callback) {
  console.log('ButtonCharacteristics - onReadRequest: value = ' + this._value.toString('hex'));

  callback(this.RESULT_SUCCESS, this._value);
};

ButtonCharacteristics.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  this._value = data

  console.log('ButtonCharacteristics - onWriteRequest: value = ' + this._value.toString('hex'));

  if (data.toString('hex') == PAYLOAD_END) {
    var payload = this._packetArray.join("");
    payload = pako.inflate(hex2a(payload), {to:'string', level: 9})
    //console.log('\n','\n',payload)

    if (this._updateValueCallback) {
      this._updateValueCallback(payload);
    }

    this._packetArray = [];
  } else {
    this._packetArray.push(data.toString('hex'));
  }


  callback(this.RESULT_SUCCESS);
};

function hex2a(hexx) {
	var hex = hexx.toString();
	var str = '';
	for (var i=0; i<hex.length; i+=2)
		str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	return str;
}

module.exports = ButtonCharacteristics;
