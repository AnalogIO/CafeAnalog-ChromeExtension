// Saves options to chrome.storage
function save_options() {
  alert("what");
  var time = document.getElementById('updateTime').value;
  chrome.storage.sync.set({
    updateTime: time,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  alert("whaaaaaat");
  // Use default value;
  chrome.storage.sync.get({
    updateTime: 30,
  }, function(items) {
    document.getElementById('updateTime').value = items.updateTime;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);