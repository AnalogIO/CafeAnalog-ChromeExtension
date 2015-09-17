// Takes a number and returns it if it is above 1 otherwise return 1
function cleanUpdateTime(updateTime) {
  return (updateTime>1) ? updateTime : 1;
}


// Saves options to chrome.storage
function save_options() {
  var updateTime = cleanUpdateTime(document.getElementById('UpdateTime').value);
  var showOnShift = document.getElementById('ShowOnShift').checked;
  chrome.storage.sync.set({
    timesetting: updateTime,
    showshiftsetting: showOnShift,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    document.getElementById('UpdateTime').value = updateTime; // in case an invalid number was choosen
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value;
  chrome.storage.sync.get({
    timesetting: 30,
    showshiftsetting: true,
  }, function(items) {
    document.getElementById('UpdateTime').value = items.timesetting;
    document.getElementById('ShowOnShift').checked = items.showshiftsetting;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);