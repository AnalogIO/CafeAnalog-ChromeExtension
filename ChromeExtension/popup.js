// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


function getIsAnalogOpen(callback, errorCallback) {
  var x = new XMLHttpRequest();
  x.open('GET', "http://cafeanalog.dk/REST/");
  // The Google image search API responds with JSON, so let Chrome parse it.
  x.responseType = 'json';
  x.onload = function() {
    var response = x.response;
    if (!response ) {
        errorCallback('No response from CafeAnalog.dk!');
        return;
    }
    var isOpen = response.open;
    
    callback(isOpen);
  };
  x.onerror = errorCallback('Network error.');
  x.send();
}

var cafeanalog;
var downloading;

function downloadHomePage(callback, errorCallback) {
  if (downloading) {
    // If currently downloading, don't redownload, just wait to see if the download finishes soon.
    setTimeout(function() { downloadHomePage(callback, errorCallback);}, 50);
    return;
  }
  if (cafeanalog) { // If the content is already available
    callback(cafeanalog); // just callback with content
    return;
  }
  downloading = true; // Download now in progress
  var x = new XMLHttpRequest();
  x.open('GET', 'http://cafeanalog.dk/');
  x.responseType = 'document';
  x.onload = function() {
    cafeanalog = x.response;
    downloading = false; // Download now done, and content is available if found
    if (!cafeanalog) {
      errorCallback();
      return;
    }
    callback(cafeanalog);
    return;
  }
  x.onerror = errorCallback;
  x.send();
}

function getOpening(errorCallback) {
  getShowOpening(function (showOpening) { // Check the settings to see if the opening should be downloaded or not.
    if (!showOpening) return;
    downloadHomePage(function(response) {
      var opening = response.getElementById("openingHours").getElementsByTagName("li")[0].textContent;
      if (!opening) { 
        renderOpening('No openings found');
        return;
      }
      renderOpening(opening);
    }, function() { renderOpening('No openings found'); });
  });
}

function getNames() {
  getShowNames(function (showNames) {
    if (!showNames) return;
    var nameRegex = /On shift right now: ([a-zæøå\s,&;]+)\n/i
    downloadHomePage(function(response) {
      var names = nameRegex.exec(response.getElementById("openingHours").textContent);
      renderNames(names[1].replace("&amp;","&"));
    }, function() {renderStatus('Network error.');renderNames('');}
    );
  });
}

function renderOpening(openingText) {
  document.getElementById('opening').textContent = openingText;  
}

function renderNames(namesText) {
  document.getElementById('onshift').textContent = namesText;
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function boolToText(isOpenBool) {
  if (isOpenBool)
  {
    setIcon("Open");
    return "ÅPEN";
  } 
  else
  {
    setIcon("");
    return "CLØSED";
  }
}

function setIcon(openString) {
  chrome.browserAction.setIcon({path:"Assets/icon"+openString+"38.png"});
}

function getShowNames(caller) {
  chrome.storage.sync.get({
    showshiftsetting: true
  }, function(items) {
    return caller(items.showshiftsetting);
  })
}

function getShowOpening(caller) {
  chrome.storage.sync.get({
    showopeningsetting: true
  }, function(items) {
    return caller(items.showopeningsetting);
  })
}

document.addEventListener('DOMContentLoaded', function() {
  renderStatus('Cafe Analog is ...');
  getIsAnalogOpen(function (boolValue){
    renderStatus('Cafe Analog is ' + boolToText(boolValue));
    // names
    if (boolValue) {
      getNames();
    }
  }, renderStatus);
  // opening
  getOpening(renderStatus);
});
