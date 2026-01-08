// Get prayer name from URL params
const urlParams = new URLSearchParams(window.location.search);
const prayerName = urlParams.get('prayer') || 'Prayer';

// Display prayer name
document.getElementById('prayerName').textContent = prayerName;

// Stop sound when window is closed
window.addEventListener('beforeunload', () => {
  chrome.runtime.sendMessage({ action: 'stopSound' });
});

// Stop Sound button
document.getElementById('stopSoundBtn').addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ action: 'stopSound' });
  const btn = document.getElementById('stopSoundBtn');
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    Stopped
  `;
  btn.disabled = true;
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
