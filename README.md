# 🕌 PrayUp - Prayer Times Extension

A professional Chrome Extension that displays prayer times and provides automatic notifications based on your location.

## Features

- ✅ Automatic location detection via Geolocation API
- ✅ Prayer times from Aladhan API
- ✅ Automatic notifications at prayer times
- ✅ Multiple calculation methods (Kemenag, ISNA, Umm Al-Qura, etc.)
- ✅ Notification sound options (None, Beep, Adzan)
- ✅ Auto refresh every 12 hours
- ✅ Next prayer highlight
- ✅ Fallback to cached data if API fails

## File Structure

```
PrayUp/
├── manifest.json        # Extension configuration
├── background.js        # Service worker for alarms & notifications
├── popup.html          # Main popup UI
├── popup.css           # Popup styling
├── popup.js            # Popup logic
├── options.html        # Settings page
├── options.css         # Settings styling
├── options.js          # Settings logic
├── offscreen.html      # Offscreen document for audio
├── offscreen.js        # Audio player
└── assets/
    └── icon.png        # Extension icon (128x128)
```

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `PrayUp` folder
5. The extension will appear in your Chrome toolbar

## Usage

1. Click the extension icon in the toolbar to view prayer times
2. Allow location access when prompted
3. Click "Settings" to configure:
   - Toggle notifications ON/OFF
   - Choose calculation method
   - Choose notification sound

## API Used

- [Aladhan Prayer Times API](https://aladhan.com/prayer-times-api)
- [BigDataCloud Reverse Geocoding API](https://www.bigdatacloud.com/)

## License

MIT License
