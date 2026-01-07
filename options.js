// Options Script - PrayUp

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

async function loadSettings() {
  const defaults = {
    notificationsEnabled: true,
    calculationMethod: 11,
    soundType: 'none'
  };

  const settings = await chrome.storage.sync.get(defaults);
  
  document.getElementById('notificationsEnabled').checked = settings.notificationsEnabled;
  document.getElementById('calculationMethod').value = settings.calculationMethod;
  document.getElementById('soundType').value = settings.soundType;
}

function setupEventListeners() {
  document.getElementById('settingsForm').addEventListener('submit', saveSettings);
  document.getElementById('testSoundBtn').addEventListener('click', testSound);
}

async function saveSettings(e) {
  e.preventDefault();
  
  const settings = {
    notificationsEnabled: document.getElementById('notificationsEnabled').checked,
    calculationMethod: parseInt(document.getElementById('calculationMethod').value),
    soundType: document.getElementById('soundType').value
  };

  try {
    await chrome.storage.sync.set(settings);
    
    // Refresh prayer times with new calculation method
    await chrome.runtime.sendMessage({ action: 'refreshPrayerTimes' });
    
    showStatus('Pengaturan berhasil disimpan!', 'success');
  } catch (error) {
    showStatus('Gagal menyimpan pengaturan', 'error');
    console.error(error);
  }
}

function testSound() {
  const soundType = document.getElementById('soundType').value;
  
  if (soundType === 'none') {
    showStatus('Pilih suara terlebih dahulu', 'error');
    return;
  }

  // Play sound locally for testing
  const audio = new Audio();
  audio.src = soundType === 'beep' ? 'assets/beep.mp3' : 'assets/adzan.mp3';
  audio.volume = 0.7;
  audio.play().catch(error => {
    showStatus('Gagal memutar suara. Pastikan file audio tersedia.', 'error');
    console.error(error);
  });
}

function showStatus(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  
  setTimeout(() => {
    statusEl.className = 'status-message';
  }, 3000);
}
