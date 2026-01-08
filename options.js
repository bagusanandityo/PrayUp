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
  
  // Show custom sound section if custom is selected
  toggleCustomSoundSection(settings.soundType);
  
  // Check if custom sound exists
  const customSound = await chrome.storage.local.get(['customSoundData', 'customSoundName']);
  if (customSound.customSoundName) {
    document.getElementById('fileName').textContent = customSound.customSoundName;
  }
}

function setupEventListeners() {
  document.getElementById('settingsForm').addEventListener('submit', saveSettings);
  document.getElementById('testSoundBtn').addEventListener('click', testSound);
  document.getElementById('soundType').addEventListener('change', onSoundTypeChange);
  document.getElementById('customSoundFile').addEventListener('change', onCustomFileSelect);
}

function onSoundTypeChange(e) {
  toggleCustomSoundSection(e.target.value);
}

function toggleCustomSoundSection(soundType) {
  const section = document.getElementById('customSoundSection');
  section.style.display = soundType === 'custom' ? 'block' : 'none';
}

async function onCustomFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Validate file size (max 6MB)
  const maxSize = 6 * 1024 * 1024;
  if (file.size > maxSize) {
    showStatus('File terlalu besar! Maksimal 6MB', 'error');
    e.target.value = '';
    return;
  }
  
  // Validate file type
  if (!file.type.includes('audio') && !file.name.endsWith('.mp3')) {
    showStatus('Format file tidak valid! Gunakan file MP3', 'error');
    e.target.value = '';
    return;
  }
  
  try {
    const base64 = await fileToBase64(file);
    await chrome.storage.local.set({
      customSoundData: base64,
      customSoundName: file.name
    });
    
    document.getElementById('fileName').textContent = file.name;
    showStatus('File audio berhasil diupload!', 'success');
  } catch (error) {
    showStatus('Gagal mengupload file', 'error');
    console.error(error);
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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

async function testSound() {
  const soundType = document.getElementById('soundType').value;
  
  if (soundType === 'none') {
    showStatus('Pilih suara terlebih dahulu', 'error');
    return;
  }

  const audio = new Audio();
  
  if (soundType === 'custom') {
    const customSound = await chrome.storage.local.get(['customSoundData']);
    if (!customSound.customSoundData) {
      showStatus('Upload file MP3 terlebih dahulu', 'error');
      return;
    }
    audio.src = customSound.customSoundData;
  } else {
    audio.src = 'assets/adzan.mp3';
  }
  
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
