// Background Service Worker - PrayUp

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const ALARM_NAME = 'prayerCheck';
const DAILY_REFRESH_ALARM = 'dailyRefresh';

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('PrayUp installed');
  await initializeAlarms();
  await fetchPrayerTimes();
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('PrayUp started');
  await initializeAlarms();
});

// Setup alarms
async function initializeAlarms() {
  // Check prayer times every minute
  await chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });
  
  // Daily refresh at midnight
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const delayInMinutes = (midnight.getTime() - now.getTime()) / 60000;
  
  await chrome.alarms.create(DAILY_REFRESH_ALARM, {
    delayInMinutes: delayInMinutes,
    periodInMinutes: 720 // 12 hours
  });
}

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await checkPrayerTime();
  } else if (alarm.name === DAILY_REFRESH_ALARM) {
    await fetchPrayerTimes();
  }
});

// Check if current time matches prayer time
async function checkPrayerTime() {
  const settings = await getSettings();
  if (!settings.notificationsEnabled) return;

  const data = await chrome.storage.local.get(['prayerTimes', 'lastNotified']);
  const prayerTimes = data.prayerTimes;
  const lastNotified = data.lastNotified || {};

  if (!prayerTimes) return;

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const today = now.toDateString();

  for (const prayer of PRAYER_NAMES) {
    const prayerTime = prayerTimes[prayer];
    if (prayerTime === currentTime) {
      const notifyKey = `${today}-${prayer}`;
      
      // Prevent double notification
      if (lastNotified[notifyKey]) continue;

      await showNotification(prayer, settings.soundType);
      
      lastNotified[notifyKey] = true;
      await chrome.storage.local.set({ lastNotified });
      break;
    }
  }
}


// Show overlay notification in active tab
let notificationWindowId = null;

async function showNotification(prayerName, soundType) {
  // Play sound if enabled
  if (soundType && soundType !== 'none') {
    playSound(soundType);
  }

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.id && !tab.url.startsWith('chrome://')) {
      // Send message to content script
      await chrome.tabs.sendMessage(tab.id, {
        action: 'showOverlayNotification',
        prayerName: prayerName
      });
    } else {
      // Fallback: open popup window if no valid tab
      const window = await chrome.windows.create({
        url: `notification.html?prayer=${encodeURIComponent(prayerName)}`,
        type: 'popup',
        width: 380,
        height: 340,
        focused: true
      });
      notificationWindowId = window.id;
    }
  } catch (error) {
    console.error('Error showing notification:', error);
    // Fallback to popup window
    const window = await chrome.windows.create({
      url: `notification.html?prayer=${encodeURIComponent(prayerName)}`,
      type: 'popup',
      width: 380,
      height: 340,
      focused: true
    });
    notificationWindowId = window.id;
  }
}

// Stop sound when notification window is closed (fallback)
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === notificationWindowId) {
    stopSound();
    notificationWindowId = null;
  }
});

// Play sound using offscreen document
async function playSound(soundType) {
  try {
    if (await hasOffscreenDocument()) {
      await chrome.runtime.sendMessage({ action: 'playSound', soundType });
      return;
    }

    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Play adzan/beep sound for prayer notification'
    });

    await chrome.runtime.sendMessage({ action: 'playSound', soundType });
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

async function stopSound() {
  try {
    if (await hasOffscreenDocument()) {
      await chrome.runtime.sendMessage({ action: 'stopSound' });
    }
  } catch (error) {
    console.error('Error stopping sound:', error);
  }
}

async function hasOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });
  return existingContexts.length > 0;
}

// Get user settings
async function getSettings() {
  const defaults = {
    notificationsEnabled: true,
    calculationMethod: 11,
    soundType: 'none'
  };
  
  const result = await chrome.storage.sync.get(defaults);
  return result;
}

// Fetch prayer times from API
async function fetchPrayerTimes(locationFromPopup = null) {
  try {
    let latitude, longitude;
    
    if (locationFromPopup) {
      latitude = locationFromPopup.latitude;
      longitude = locationFromPopup.longitude;
    } else {
      // Try to get from storage
      const stored = await chrome.storage.local.get(['userLocation']);
      if (stored.userLocation) {
        latitude = stored.userLocation.latitude;
        longitude = stored.userLocation.longitude;
      } else {
        // Default to Jakarta
        latitude = -6.2088;
        longitude = 106.8456;
      }
    }
    
    const settings = await getSettings();
    const date = new Date();
    const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${settings.calculationMethod}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    const timings = data.data.timings;
    
    // Get city name via reverse geocoding using BigDataCloud API (free)
    let cityName = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
    try {
      const geoResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`
      );
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        cityName = geoData.city || geoData.locality || geoData.principalSubdivision || cityName;
      }
    } catch (e) {
      console.log('Could not get city name:', e);
    }

    const prayerData = {
      prayerTimes: {
        Fajr: timings.Fajr,
        Dhuhr: timings.Dhuhr,
        Asr: timings.Asr,
        Maghrib: timings.Maghrib,
        Isha: timings.Isha
      },
      location: {
        latitude,
        longitude,
        cityName
      },
      lastUpdated: Date.now(),
      date: dateStr
    };

    await chrome.storage.local.set(prayerData);
    return prayerData;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw error;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'refreshPrayerTimes') {
    fetchPrayerTimes(message.location)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.action === 'getPrayerTimes') {
    chrome.storage.local.get(['prayerTimes', 'location', 'lastUpdated', 'date'])
      .then(data => sendResponse(data))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }

  if (message.action === 'testNotification') {
    getSettings().then(settings => {
      showNotification('Test', settings.soundType);
    });
    sendResponse({ success: true });
    return true;
  }
});
