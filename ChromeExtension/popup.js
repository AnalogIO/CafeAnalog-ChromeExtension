// Copyright (c) 2015 Analog.IO group. All rights reserved.
// Use of this source code is governed by a Apache-style license that can be
// found in the LICENSE file.
var endpoints = {
  shifts: "https://analogio.dk/publicshiftplanning/api/shifts/analog",
  open: "https://analogio.dk/publicshiftplanning/api/open/analog"
};

function toDate(dateString) { var b = dateString.split(/\D/); return new Date(b[0], b[1]-1, b[2], b[3], b[4], b[5]); }
function addZero(i) { if (i < 10) { i = "0" + i; } return i; }
function dateToString(date) { return date.getHours() + ':' + addZero(date.getMinutes()); }
function dayToString(date) { return date.toDateString(); }
function openingToString(opening) { return dateToString(toDate(opening.start)) + ' - ' + dateToString(toDate(opening.end)); }
function isToday(opening) { var date = toDate(opening.start); var today = new Date(); return date.getDay() == today.getDay() && date.getDate() == today.getDate(); }
function isNow(opening) { var now = new Date(); return toDate(opening.start) <= now && now <= toDate(opening.end); }

function getIsAnalogOpen(callback, errorCallback) {
  var x = new XMLHttpRequest();
  x.open('GET', endpoints.open);
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
  x.onerror = function(){ errorCallback('Network error.'); };
  x.send();
}

function getOpenings(success, error) {
  getShowOpening(function (showOpening) {
    if (!showOpening) return;

    var x = new XMLHttpRequest();
    x.open('GET', endpoints.shifts);
    x.responseType = 'json';
    x.onload = function() {
      var openings = x.response;
      if (!openings) {
        error();
      }
      else
      {
        success(openings);
      }
    }
    x.onerror = function(){};
    x.send();
  });
}

function getCurrentOpening(success, error) {
  getOpenings(function (openings) {
    var opening = openings.find(isNow);

    if (opening) success(opening);
    else error();
  });
}

function getOpening(callback, errorCallback) {
  getShowOpening( function (showOpening) { // Check the settings to see if the opening should be downloaded or not.
    if (!showOpening) return;

    getOpenings(function(openings) {
	  var now = new Date();
      var currentIndex = openings.findIndex(isNow);

      if (currentIndex === -1) {
        var afterNow = openings.filter(function(value) { return now <= toDate(value.start); });

        if (afterNow.length == 0) {
          errorCallback('No openings found');
        } else {
          var d = "2017-03-28T08:00:00";
          if (isToday(afterNow[0]))	 {
            errorCallback('We open again today at ' + dateToString(toDate(afterNow[0].start)));
          } else {
            var date = toDate(afterNow[0].start);
            errorCallback('We open again ' + dayToString(date) + ' at ' + dateToString(date));
          }
        }

        return;
      }

      var opening = openings[currentIndex];

      if (isToday(opening)) {
        var nextOpening = openings[currentIndex + 1];
        var openingString = 'today: ' + openingToString(opening);
        if (nextOpening && isToday(nextOpening)) {
          callback(openingString + " and " + openingToString(nextOpening));
        } else {
          callback(openingString); // Check that this works for all dates.
        }
      } else {
        callback(openingToString(opening));
      }
    }, function() {
      errorCallback('No openings found');
    });
  });
}

function getNames(callback, errorCallback) {
  getShowNames( function (showNames) {
    if (!showNames) return;
    getCurrentOpening(function (opening) {
      var checkedIn = opening.checkedInEmployees;

      var joined = checkedIn.map(function(emp) { return emp.firstName; }).join(', ');

      
      var lastAnd = joined.lastIndexOf(',');
      if (lastAnd > -1) {
        callback(joined.substring(0, lastAnd) + ' and' + joined.substring(lastAnd + 1));
      } else {
        callback(joined)
      }
    }, function () { errorCallback('No names found'); });
  });
}

function renderOpening(openingText) { document.getElementById('opening').textContent = openingText; }
function renderNames(namesText) { document.getElementById('onshift').innerHTML = namesText; }
function renderStatus(statusText) { document.getElementById('status').textContent = statusText; }

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

function setIcon(openString) { chrome.browserAction.setIcon({path:"Assets/icon"+openString+"38.png"}); }

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
        openingText = openingText.charAt(0).toUpperCase() + openingText.slice(1);;
        renderOpening(openingText);
      }
      else
      {
        renderOpening("We open again " + openingText);
      }
    }, renderOpening);
  }, renderStatus);
});
