var openString = "";

function getIsAnalogOpen(callback, errorCallback) {
  var x = new XMLHttpRequest();
  x.open('GET', "http://cafeanalog.dk/REST/");
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
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}

function updateOpenString() {
  getIsAnalogOpen(function (boolValue){
    if (boolValue)
    {
      openString = "Open";
    }
    else{
      openString = "";
    }
  },function(error){
    openString = "";
  })
}

function updateIcon() {
	chrome.browserAction.setIcon({path:"Assets/icon" + openString + "38.png"});
}

function updateAll() 
{
  updateOpenString();
  updateIcon();
}

function getUpdateTime(caller)
{
  chrome.storage.sync.get({
    timesetting: 5
  }, function(items) {
    var updateTime = items.timesetting*60*1000;
    console.log("storage: " + items.timesetting + " minutes.\n" + "updateTime: " + updateTime + " microseconds");
    caller(updateTime);
  })
}



var updateAndRetrieveUpdateTime = function()
{
  updateAll();
  
  getUpdateTime(function(updateTime) 
  {
    setTimeout(updateAndRetrieveUpdateTime, updateTime);
  });
}

updateAndRetrieveUpdateTime();