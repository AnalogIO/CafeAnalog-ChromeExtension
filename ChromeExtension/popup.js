// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


function getIsAnalogOpen(callback, errorCallback) {
  var x = new XMLHttpRequest();
  x.open('GET', "http://cafeanalog.dk/REST/");
  // The Google image search API responds with JSON, so let Chrome parse it.
  x.responseType = 'json';
  console.log("test 1");
  x.onload = function() {
    var response = x.response;
    if (!response ) {
        errorCallback('No response from CafeAnalog.com!');
        return;
    }
    console.log(response.open);
    var isOpen = response.open;
    console.log(isOpen);
    
    callback(isOpen);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}

function getNames(callback, errorCallback) {
  var nameRegex = /On shift right now: ([a-zA-ZæøåÆØÅ\s,]+)/i
  
  var x = new XMLHttpRequest();
  x.open('GET', "http://cafeanalog.dk/");
  x.responseType = "html";
  x.onload = function() {
    var response = x.response;
    if (!response) {
      errorCallback('No response from CafeAnalog.dk');
      return;
    }
    var names = nameRegex.exec(x.responseText);
    callback(names[1]);
  }
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}

function renderNames(namesTest) {
  document.getElementById('onshift').textContent = namesTest;
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function boolToText(isOpenBool) {
  var toReturn = "";
  if (isOpenBool)
  {
    toReturn = "ÅPEN";
    setIcon("Open");
  } 
  else
  {
    toReturn = "CLØSED";
    setIcon("");
  }
  return toReturn;
}

function setIcon(openString) {
  chrome.browserAction.setIcon({path:"Assets/icon"+openString+"38.png"});
}

document.addEventListener('DOMContentLoaded', function() {
  renderStatus('Cafe Analog is...');
  getIsAnalogOpen(function (boolValue){
    console.log(boolValue);
    var result = boolToText(boolValue);
    console.log(result);
    renderStatus('Cafe Analog is ' + result);
    if (boolValue) {
      getNames(function (names) {
        console.log(names);
        renderNames('On shift: ' + names);
      }, function (error) {
        renderStatus('Something went wrong: ' + error);
        renderNames('');
      });
    }
  }, function (error) {
    renderStatus('Something went wrong: ' + error);
  });
});
