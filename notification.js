// Get prayer name from URL params
const urlParams = new URLSearchParams(window.location.search);
const prayerName = urlParams.get('prayer') || 'Prayer';

// Display prayer name
document.getElementById('prayerName').textContent = prayerName;

// Stop sound when window is closed (X button)
window.addEventListener('beforeunload', () => {
  chrome.runtime.sendMessage({ action: 'stopSound' });
});

// Stop Sound button
document.getElementById('stopSoundBtn').addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ action: 'stopSound' });
  document.getElementById('stopSoundBtn').textContent = '✓ Sound Stopped';
  document.getElementById('stopSoundBtn').disabled = true;
});

// Close button
document.getElementById('closeBtn').addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ action: 'stopSound' });
  window.close();
});

// Auto-close after 5 minutes
setTimeout(async () => {
  await chrome.runtime.sendMessage({ action: 'stopSound' });
  window.close();
}, 5 * 60 * 1000);
