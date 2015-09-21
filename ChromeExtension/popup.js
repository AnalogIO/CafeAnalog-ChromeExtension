// Copyright (c) 2015 Analog.IO group. All rights reserved.
// Use of this source code is governed by a Apache-style license that can be
// found in the LICENSE file.


function getIsAnalogOpen(callback, errorCallback) {
  var x = new XMLHttpRequest();
  x.open('GET', "http://cafeanalog.dk/REST/");
  x.responseType = 'json';
  x.onload = function() {
    var response = x.response;
    if (!response ) {
        errorCallback('No response from CafeAnalog.dk!');
    }
    else
    {
      var isOpen = response.open;
      callback(isOpen);
    }
  };
  x.onerror = function(){}; // errorCallback('Network error.');
  x.send();
}

var cafeanalog;
var downloading;

function downloadHomePage(callback, errorCallback) {
  if (downloading) {
    // If currently downloading, don't redownload, just wait to see if the download finishes soon.
    setTimeout( function() { 
      downloadHomePage(callback, errorCallback);
      }, 50);
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
    }
    else
    {
      callback(cafeanalog);
    }
  }
  x.onerror = errorCallback;
  x.send();
}

function getOpening(callback, errorCallback) {
  getShowOpening( function (showOpening) { // Check the settings to see if the opening should be downloaded or not.
    if (!showOpening) return;
    
    downloadHomePage( function(response) {
      var opening = response.getElementById("openingHours").getElementsByTagName("li")[0].textContent;
      if (!opening) { 
        errorCallback('No openings found');
      }
      else
      {
        callback(opening);
      }
    }, function() { 
      errorCallback('No openings found');
      });
  });
}

function getNames(callback, errorCallback) {
  getShowNames( function (showNames) {
    if (!showNames) return;
    var nameRegex = /On shift right now: ([a-zæøå\s,&;]+)\n/i
    
    downloadHomePage( function(response) {
      var names = nameRegex.exec(response.getElementById("openingHours").textContent);
      if (!names) { 
        errorCallback('No names found');
      } 
      else {
        callback(names[1]);
      }
    }, function() { 
      errorCallback('No names found');
      }
    );
  });
}

function renderOpening(openingText) {
  document.getElementById('opening').textContent = openingText;  
}

function renderNames(namesText) {
  document.getElementById('onshift').innerHTML = namesText;
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

function getShowNames(callback) {
  chrome.storage.sync.get({
    showshiftsetting: true
  }, function(items) {
    callback(items.showshiftsetting);
  })
}

function getShowOpening(callback) {
  chrome.storage.sync.get({
    showopeningsetting: true
  }, function(items) {
    callback(items.showopeningsetting);
  })
}

document.addEventListener('DOMContentLoaded', function() {
  renderStatus('Cafe Analog is ...');
  
  getIsAnalogOpen( function (boolValue) {
    renderStatus('Cafe Analog is ' + boolToText(boolValue));
    // names
    if (boolValue) {
      getNames( function (names) {
        renderNames(names); // put special handeling if necesarry
      }, renderNames);
    }
    // opening
    getOpening( function(openingText) {
      if (boolValue)
      {
        renderOpening(openingText);
      }
      else
      {
        renderOpening("We open again " + openingText);
      }
    }, renderOpening);
  }, renderStatus);
});
