// Saves options to chrome.storage
function save_options() {
  var updateTime = document.getElementById('UpdateTime').value;
  chrome.storage.sync.set({
    timesetting: updateTime,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
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
  }, function(items) {
    document.getElementById('UpdateTime').value = items.timesetting;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);