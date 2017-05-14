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

var isLiveDemoOn = false

function hideVideo() {
  maps.style.height = mapsCSS.hiddenHeight
}

function showVideo() {
  maps.style.height = mapsCSS.visibleHeight
}

function hideMobilePhoto() {
  mobile.style.height = mobileCSS.hiddenHeight
}

function showMobilePhoto() {
  mobile.style.height = mobileCSS.visibleHeight
}

ipcRenderer.on('demo-toggle', ()=> {
  if (isLiveDemoOn) {
    //It's on. Turn it off
    showVideo()
    showMobilePhoto()
    isLiveDemoOn = false;
  } else {
    //It's off. Turn it on
    hideVideo()
    hideMobilePhoto()
    isLiveDemoOn = true;
  }
})
console.log(maps, mobile, mapsCSS)
