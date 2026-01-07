// Offscreen document for audio playback

const audioPlayer = document.getElementById('audioPlayer');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'playSound') {
    playSound(message.soundType);
  }
});

function playSound(soundType) {
  let soundFile = '';
  
  switch (soundType) {
    case 'beep':
      soundFile = 'assets/beep.mp3';
      break;
    case 'adzan':
      soundFile = 'assets/adzan.mp3';
      break;
    default:
      return;
  }

  audioPlayer.src = soundFile;
  audioPlayer.volume = 0.7;
  audioPlayer.play().catch(error => {
    console.error('Error playing audio:', error);
  });
}
