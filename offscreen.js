// Offscreen document for audio playback

const audioPlayer = document.getElementById("audioPlayer");

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "playSound") {
    playSound(message.soundType, message.customSoundData);
  } else if (message.action === "stopSound") {
    stopSound();
  }
});

function playSound(soundType, customSoundData) {
  let soundFile = "";

  switch (soundType) {
    case "beep":
      soundFile = "assets/beep.mp3";
      break;
    case "adzan":
      soundFile = "assets/adzan.mp3";
      break;
    case "custom":
      if (customSoundData) {
        audioPlayer.src = customSoundData;
        audioPlayer.volume = 0.7;
        audioPlayer.play().catch((error) => {
          console.error("Error playing custom audio:", error);
        });
        return;
      }
      return;
    default:
      return;
  }

  audioPlayer.src = soundFile;
  audioPlayer.volume = 0.7;
  audioPlayer.play().catch((error) => {
    console.error("Error playing audio:", error);
  });
}

function stopSound() {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
}
