// Content script for overlay notification

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showOverlayNotification') {
    showOverlayNotification(message.prayerName);
    sendResponse({ success: true });
  }
});

function showOverlayNotification(prayerName) {
  // Remove existing notification if any
  const existing = document.getElementById('prayup-notification');
  if (existing) existing.remove();

  // Create notification container
  const notification = document.createElement('div');
  notification.id = 'prayup-notification';
  notification.innerHTML = `
    <div class="prayup-glow"></div>
    <div class="prayup-content">
      <div class="prayup-header">
        <div class="prayup-brand">
          <span class="prayup-logo">🕌</span>
          <span class="prayup-app-name">PrayUp</span>
        </div>
        <button class="prayup-close" id="prayup-close">×</button>
      </div>
      <div class="prayup-body">
        <div class="prayup-icon-container">
          <div class="prayup-ripple"></div>
          <div class="prayup-ripple delay-1"></div>
          <div class="prayup-ripple delay-2"></div>
          <span class="prayup-main-icon">🕋</span>
        </div>
        <h2 class="prayup-prayer-name">${prayerName}</h2>
        <p class="prayup-message">It's time for prayer</p>
        <p class="prayup-dua">اَللّٰهُمَّ تَقَبَّلْ صَلَاتَنَا</p>
      </div>
      <div class="prayup-actions">
        <button class="prayup-btn prayup-btn-stop" id="prayup-stop">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
          Stop Sound
        </button>
        <button class="prayup-btn prayup-btn-dismiss" id="prayup-dismiss">
          Dismiss
        </button>
      </div>
    </div>
  `;

  // Add styles
  const styles = document.createElement('style');
  styles.id = 'prayup-styles';
  styles.textContent = `
    #prayup-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483647;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
      animation: prayup-slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes prayup-slideIn {
      from {
        opacity: 0;
        transform: translateX(100px) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    @keyframes prayup-slideOut {
      from {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateX(100px) scale(0.8);
      }
    }

    .prayup-glow {
      position: absolute;
      inset: -2px;
      background: linear-gradient(135deg, #d4af37, #1a5f4a, #d4af37);
      border-radius: 22px;
      filter: blur(8px);
      opacity: 0.6;
      animation: prayup-glowPulse 2s ease-in-out infinite;
    }

    @keyframes prayup-glowPulse {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.02); }
    }

    .prayup-content {
      position: relative;
      width: 320px;
      background: linear-gradient(145deg, #1a5f4a 0%, #0d3d2e 100%);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .prayup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .prayup-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .prayup-logo {
      font-size: 20px;
    }

    .prayup-app-name {
      font-size: 14px;
      font-weight: 600;
      color: #d4af37;
      letter-spacing: 0.5px;
    }

    .prayup-close {
      width: 28px;
      height: 28px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
      border-radius: 8px;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .prayup-close:hover {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .prayup-body {
      padding: 24px;
      text-align: center;
    }

    .prayup-icon-container {
      position: relative;
      width: 80px;
      height: 80px;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .prayup-ripple {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 2px solid rgba(212, 175, 55, 0.4);
      border-radius: 50%;
      animation: prayup-rippleEffect 2s ease-out infinite;
    }

    .prayup-ripple.delay-1 { animation-delay: 0.5s; }
    .prayup-ripple.delay-2 { animation-delay: 1s; }

    @keyframes prayup-rippleEffect {
      0% {
        transform: scale(0.8);
        opacity: 1;
      }
      100% {
        transform: scale(1.8);
        opacity: 0;
      }
    }

    .prayup-main-icon {
      font-size: 48px;
      position: relative;
      z-index: 1;
      animation: prayup-bounce 1s ease-in-out infinite;
    }

    @keyframes prayup-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    .prayup-prayer-name {
      font-size: 32px;
      font-weight: 700;
      color: white;
      margin: 0 0 8px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }

    .prayup-message {
      font-size: 15px;
      color: rgba(255, 255, 255, 0.8);
      margin: 0 0 8px;
    }

    .prayup-dua {
      font-size: 14px;
      color: #d4af37;
      margin: 0;
      font-style: italic;
    }

    .prayup-actions {
      display: flex;
      gap: 10px;
      padding: 0 16px 16px;
    }

    .prayup-btn {
      flex: 1;
      padding: 12px 16px;
      border: none;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .prayup-btn-stop {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .prayup-btn-stop:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-2px);
    }

    .prayup-btn-dismiss {
      background: #d4af37;
      color: #0d3d2e;
    }

    .prayup-btn-dismiss:hover {
      background: #e5c358;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
    }

    .prayup-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }
  `;

  // Remove existing styles if any
  const existingStyles = document.getElementById('prayup-styles');
  if (existingStyles) existingStyles.remove();

  document.head.appendChild(styles);
  document.body.appendChild(notification);

  // Event listeners
  document.getElementById('prayup-close').addEventListener('click', closeNotification);
  document.getElementById('prayup-dismiss').addEventListener('click', closeNotification);
  document.getElementById('prayup-stop').addEventListener('click', stopSound);

  // Auto close after 5 minutes
  setTimeout(closeNotification, 5 * 60 * 1000);
}

function closeNotification() {
  const notification = document.getElementById('prayup-notification');
  if (notification) {
    notification.style.animation = 'prayup-slideOut 0.3s ease-in forwards';
    chrome.runtime.sendMessage({ action: 'stopSound' });
    setTimeout(() => {
      notification.remove();
      const styles = document.getElementById('prayup-styles');
      if (styles) styles.remove();
    }, 300);
  }
}

function stopSound() {
  chrome.runtime.sendMessage({ action: 'stopSound' });
  const btn = document.getElementById('prayup-stop');
  if (btn) {
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Stopped
    `;
    btn.disabled = true;
  }
}
