// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {ipcRenderer} = require('electron')

var maps = document.querySelector("#maps");
var mobile = document.querySelector("#mobile");


var mapsCSS = {
  visibleHeight: maps.style.height,
  hiddenHeight: 0
}

var mobileCSS = {
  visibleHeight: mobile.style.height,
  hiddenHeight: 0
}

var isDemoEnabled = true

function disableMaps() {
  maps.style.height = mapsCSS.hiddenHeight
}

function enableMaps() {
  maps.style.height = mapsCSS.visibleHeight
}

function disableMobile() {
  mobile.style.height = mobileCSS.hiddenHeight
}

function enableMobile() {
  mobile.style.height = mobileCSS.visibleHeight
}

ipcRenderer.on('demo-toggle', ()=> {
  if (isDemoEnabled) {
    disableMobile()
    disableMaps()
    isDemoEnabled = false;
  } else {
    enableMobile()
    enableMaps()
    isDemoEnabled = true;
  }
})
console.log(maps, mobile, mapsCSS)
