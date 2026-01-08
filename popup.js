// Popup Script - PrayUp

// Prayer order
const PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const PRAYER_ICONS = {
  Fajr: '🌅',
  Dhuhr: '☀️',
  Asr: '🌤️',
  Maghrib: '🌇',
  Isha: '🌙'
};

const PRAYER_NAMES_ID = {
  Fajr: 'Fajr (فجر)',
  Dhuhr: 'Zhuhr (ظهر)',
  Asr: 'Asr (عصر)',
  Maghrib: 'Maghrib (مغرب)',
  Isha: 'Isha (عشاء)'
};

document.addEventListener('DOMContentLoaded', async () => {
  setCurrentDate();
  await requestLocationAndLoad();
  await loadSettings();
  setupEventListeners();
});

// Request location permission from popup (service worker can't access geolocation)
async function requestLocationAndLoad() {
  try {
    // Check if we have cached data first
    const cached = await chrome.storage.local.get(['prayerTimes', 'location']);
    
    if (cached.prayerTimes && cached.location) {
      renderPrayerTimes(cached.prayerTimes);
      document.getElementById('cityName').textContent = cached.location.cityName || 'Location Detected';
      return;
    }

    // Request location permission
    document.getElementById('cityName').textContent = 'Requesting location...';
    
    const position = await getCurrentPosition();
    
    // Save location and fetch prayer times
    await chrome.storage.local.set({ 
      userLocation: { 
        latitude: position.latitude, 
        longitude: position.longitude 
      } 
    });
    
    await refreshPrayerTimes();
  } catch (error) {
    console.error('Location error:', error);
    showError('Location denied. Using default location (Jakarta).');
    
    // Use default Jakarta location
    await chrome.storage.local.set({ 
      userLocation: { latitude: -6.2088, longitude: 106.8456 } 
    });
    await refreshPrayerTimes();
  }
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000, 
        maximumAge: 300000 
      }
    );
  });
}

function setCurrentDate() {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const date = new Date().toLocaleDateString('en-US', options);
  document.getElementById('currentDate').textContent = date;
}

async function loadPrayerTimes() {
  try {
    const data = await chrome.storage.local.get(['prayerTimes', 'location', 'lastUpdated']);
    
    if (data.prayerTimes && data.location) {
      renderPrayerTimes(data.prayerTimes);
      document.getElementById('cityName').textContent = data.location.cityName || 'Location Detected';
      hideError();
    } else {
      await refreshPrayerTimes();
    }
  } catch (error) {
    showError('Failed to load prayer times');
    console.error(error);
  }
}

function renderPrayerTimes(prayerTimes) {
  const container = document.getElementById('prayerList');
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  let nextPrayer = null;
  
  for (const name of PRAYER_ORDER) {
    const time = prayerTimes[name];
    if (!time) continue;
    
    const [hours, minutes] = time.split(':').map(Number);
    const prayerMinutes = hours * 60 + minutes;
    
    if (prayerMinutes > currentMinutes) {
      nextPrayer = name;
      break;
    }
  }
  
  if (!nextPrayer) {
    nextPrayer = 'Fajr';
  }

  let html = '';
  for (const name of PRAYER_ORDER) {
    const time = prayerTimes[name];
    if (!time) continue;
    
    const [hours, minutes] = time.split(':').map(Number);
    const prayerMinutes = hours * 60 + minutes;
    const isPassed = prayerMinutes < currentMinutes;
    const isNext = name === nextPrayer;
    
    let className = 'prayer-item';
    if (isNext) className += ' next';
    else if (isPassed) className += ' passed';
    
    html += `
      <div class="${className}">
        <div class="prayer-name">
          <span class="prayer-icon">${PRAYER_ICONS[name]}</span>
          ${PRAYER_NAMES_ID[name]}
          ${isNext ? '<span class="next-label">Next</span>' : ''}
        </div>
        <div class="prayer-time">${time}</div>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

async function refreshPrayerTimes() {
  const refreshBtn = document.getElementById('refreshBtn');
  const btnIcon = refreshBtn.querySelector('.btn-icon');
  
  refreshBtn.disabled = true;
  btnIcon.classList.add('spinning');
  
  try {
    // Get location from popup (more reliable than service worker)
    let position;
    try {
      position = await getCurrentPosition();
      await chrome.storage.local.set({ 
        userLocation: { latitude: position.latitude, longitude: position.longitude } 
      });
    } catch (e) {
      // Fallback to stored location or default
      const stored = await chrome.storage.local.get(['userLocation']);
      position = stored.userLocation || { latitude: -6.2088, longitude: 106.8456 };
    }

    const response = await chrome.runtime.sendMessage({ 
      action: 'refreshPrayerTimes',
      location: position
    });
    
    if (response.success) {
      renderPrayerTimes(response.data.prayerTimes);
      document.getElementById('cityName').textContent = 
        response.data.location.cityName || 'Location Detected';
      hideError();
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    showError('Failed to update. Please try again.');
    console.error(error);
    
    const cached = await chrome.storage.local.get(['prayerTimes', 'location']);
    if (cached.prayerTimes) {
      renderPrayerTimes(cached.prayerTimes);
    }
  } finally {
    refreshBtn.disabled = false;
    btnIcon.classList.remove('spinning');
  }
}

// Settings Functions
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
  const customSound = await chrome.storage.local.get(['customSoundName']);
  if (customSound.customSoundName) {
    document.getElementById('fileName').textContent = customSound.customSoundName;
  }
}

function toggleCustomSoundSection(soundType) {
  const section = document.getElementById('customSoundSection');
  section.style.display = soundType === 'custom' ? 'block' : 'none';
}

async function onCustomFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const maxSize = 6 * 1024 * 1024;
  if (file.size > maxSize) {
    showStatus('File terlalu besar! Max 6MB', 'error');
    e.target.value = '';
    return;
  }
  
  if (!file.type.includes('audio') && !file.name.endsWith('.mp3')) {
    showStatus('Format tidak valid! Gunakan MP3', 'error');
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
    showStatus('File berhasil diupload!', 'success');
  } catch (error) {
    showStatus('Gagal upload file', 'error');
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

async function saveSettings() {
  const settings = {
    notificationsEnabled: document.getElementById('notificationsEnabled').checked,
    calculationMethod: parseInt(document.getElementById('calculationMethod').value),
    soundType: document.getElementById('soundType').value
  };

  try {
    await chrome.storage.sync.set(settings);
    showStatus('Settings saved!', 'success');
    
    setTimeout(async () => {
      showView('main');
      await refreshPrayerTimes();
    }, 1000);
  } catch (error) {
    showStatus('Failed to save', 'error');
    console.error(error);
  }
}

// View Switching
function showView(view) {
  const mainView = document.getElementById('mainView');
  const settingsView = document.getElementById('settingsView');
  
  if (view === 'settings') {
    mainView.style.display = 'none';
    settingsView.style.display = 'block';
  } else {
    mainView.style.display = 'block';
    settingsView.style.display = 'none';
  }
}

function setupEventListeners() {
  document.getElementById('refreshBtn').addEventListener('click', refreshPrayerTimes);
  document.getElementById('settingsBtn').addEventListener('click', () => showView('settings'));
  document.getElementById('backBtn').addEventListener('click', () => showView('main'));
  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
  // document.getElementById('testNotificationBtn').addEventListener('click', testNotification);
  document.getElementById('soundType').addEventListener('change', (e) => toggleCustomSoundSection(e.target.value));
  document.getElementById('customSoundFile').addEventListener('change', onCustomFileSelect);
}

// async function testNotification() {
//   const btn = document.getElementById('testNotificationBtn');
//   btn.disabled = true;
//   btn.textContent = '⏳ Opening...';
  
//   try {
//     await chrome.runtime.sendMessage({ action: 'testNotification' });
//     btn.textContent = '✓ Opened!';
//     setTimeout(() => {
//       btn.disabled = false;
//       btn.textContent = '🔔 Test Notification';
//     }, 2000);
//   } catch (error) {
//     console.error('Test notification error:', error);
//     btn.disabled = false;
//     btn.textContent = '🔔 Test Notification';
//   }
// }

function showError(message) {
  const errorEl = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  errorText.textContent = message;
  errorEl.style.display = 'flex';
}

function hideError() {
  document.getElementById('errorMessage').style.display = 'none';
}

function showStatus(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  
  setTimeout(() => {
    statusEl.className = 'status-message';
  }, 3000);
}
