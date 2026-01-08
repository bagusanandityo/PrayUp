// Content script for overlay notification

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showOverlayNotification') {
    showOverlayNotification(message.prayerName, message.verse);
    sendResponse({ success: true });
  }
});

function showOverlayNotification(prayerName, verse = null) {
  // Default verse if not provided
  const verseData = verse || {
    arabic: 'اَللّٰهُمَّ تَقَبَّلْ صَلَاتَنَا',
    translation: 'May Allah accept our prayers',
    surah: ''
  };
  
  // Truncate translation if too long
  let translation = verseData.translation;
  // if (translation.length > 100) {
  //   translation = translation.substring(0, 100) + '...';
  // }

  // Remove existing notification if any
  const existing = document.getElementById('prayup-overlay');
  if (existing) existing.remove();

  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'prayup-overlay';
  overlay.innerHTML = `
    <div class="prayup-backdrop"></div>
    <div class="prayup-card">
      <div class="prayup-particles">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
      
      <button class="prayup-close-btn" id="prayup-close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <div class="prayup-header">
        <span class="prayup-logo">🕌</span>
        <span class="prayup-brand">PrayUp</span>
      </div>
      
      <div class="prayup-content">
        <div class="prayup-icon-wrap">
          <div class="prayup-ripple"></div>
          <div class="prayup-ripple r2"></div>
          <div class="prayup-ripple r3"></div>
          <span class="prayup-icon">🕋</span>
        </div>
        
        <h1 class="prayup-title">${prayerName}</h1>
        <p class="prayup-subtitle">It's time for prayer</p>
        <p class="prayup-dua-trans">${translation}</p>
        ${verseData.surah ? `<p class="prayup-surah">— ${verseData.surah}</p>` : ''}
      </div>
      
      <div class="prayup-actions">
        <button class="prayup-btn prayup-btn-sec" id="prayup-stop">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
          Stop Sound
        </button>
        <button class="prayup-btn prayup-btn-pri" id="prayup-dismiss">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Dismiss
        </button>
      </div>
    </div>
  `;

  // Inject styles
  const style = document.createElement('style');
  style.id = 'prayup-styles';
  style.textContent = `
    #prayup-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    .prayup-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      animation: prayup-fadeIn 0.3s ease;
    }
    
    @keyframes prayup-fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .prayup-card {
      position: relative;
      width: 360px;
      background: linear-gradient(160deg, #1a5f4a 0%, #0d3d2e 50%, #082820 100%);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1);
      animation: prayup-scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    @keyframes prayup-scaleIn {
      from { opacity: 0; transform: scale(0.85) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    
    .prayup-particles {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }
    
    .prayup-particles span {
      position: absolute;
      width: 6px;
      height: 6px;
      background: linear-gradient(135deg, #d4af37, #f4d03f);
      border-radius: 50%;
      animation: prayup-float 4s ease-in-out infinite;
      box-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
    }
    
    .prayup-particles span:nth-child(1) { top: 12%; left: 8%; animation-delay: 0s; }
    .prayup-particles span:nth-child(2) { top: 25%; right: 10%; animation-delay: 0.6s; }
    .prayup-particles span:nth-child(3) { bottom: 35%; left: 6%; animation-delay: 1.2s; }
    .prayup-particles span:nth-child(4) { bottom: 20%; right: 8%; animation-delay: 1.8s; }
    .prayup-particles span:nth-child(5) { top: 55%; left: 4%; animation-delay: 2.4s; }
    .prayup-particles span:nth-child(6) { top: 45%; right: 5%; animation-delay: 3s; }
    
    @keyframes prayup-float {
      0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
      50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
    }
    
    .prayup-close-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border: none;
      background: rgba(255,255,255,0.1);
      border-radius: 10px;
      color: rgba(255,255,255,0.7);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      z-index: 10;
    }
    
    .prayup-close-btn:hover {
      background: rgba(255,255,255,0.2);
      color: #fff;
      transform: scale(1.05);
    }
    
    .prayup-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 18px 20px 14px;
      border-bottom: 1px solid rgba(212, 175, 55, 0.15);
    }
    
    .prayup-logo {
      font-size: 22px;
      animation: prayup-bounce 2s ease-in-out infinite;
    }
    
    @keyframes prayup-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    
    .prayup-brand {
      font-size: 17px;
      font-weight: 700;
      background: linear-gradient(135deg, #d4af37, #f4d03f);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: 0.5px;
    }
    
    .prayup-content {
      padding: 24px 20px 20px;
      text-align: center;
    }
    
    .prayup-icon-wrap {
      position: relative;
      width: 85px;
      height: 85px;
      margin: 0 auto 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .prayup-ripple {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 2px solid rgba(212, 175, 55, 0.35);
      border-radius: 50%;
      animation: prayup-rippleAnim 2s ease-out infinite;
    }
    
    .prayup-ripple.r2 { animation-delay: 0.6s; }
    .prayup-ripple.r3 { animation-delay: 1.2s; }
    
    @keyframes prayup-rippleAnim {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(1.7); opacity: 0; }
    }
    
    .prayup-icon {
      font-size: 44px;
      position: relative;
      z-index: 1;
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));
      animation: prayup-pulse 2s ease-in-out infinite;
    }
    
    @keyframes prayup-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.06); }
    }
    
    .prayup-title {
      font-size: 34px;
      font-weight: 800;
      color: #fff;
      margin: 0 0 6px;
      text-shadow: 0 3px 12px rgba(0,0,0,0.3);
    }
    
    .prayup-subtitle {
      font-size: 14px;
      color: rgba(255,255,255,0.8);
      margin: 0 0 14px;
      font-weight: 500;
    }
    
    .prayup-dua {
      font-size: 16px;
      color: #d4af37;
      margin: 0 0 6px;
      font-weight: 600;
      direction: rtl;
      text-shadow: 0 2px 6px rgba(212, 175, 55, 0.25);
      line-height: 1.6;
      max-height: 60px;
      overflow: hidden;
    }
    
    .prayup-dua-trans {
      font-size: 11px;
      color: rgba(255,255,255,0.6);
      margin: 0 0 4px;
      font-style: italic;
      line-height: 1.4;
    }
    
    .prayup-surah {
      font-size: 10px;
      color: rgba(212, 175, 55, 0.7);
      margin: 0;
    }
    
    .prayup-actions {
      display: flex;
      gap: 10px;
      padding: 0 18px 18px;
    }
    
    .prayup-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 11px 14px;
      border: none;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .prayup-btn-sec {
      background: rgba(255,255,255,0.1);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.15);
    }
    
    .prayup-btn-sec:hover {
      background: rgba(255,255,255,0.18);
      transform: translateY(-2px);
    }
    
    .prayup-btn-pri {
      background: linear-gradient(135deg, #d4af37, #c9a227);
      color: #0d3d2e;
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.25);
    }
    
    .prayup-btn-pri:hover {
      background: linear-gradient(135deg, #e5c358, #d4af37);
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(212, 175, 55, 0.35);
    }
    
    .prayup-btn:active { transform: translateY(0) !important; }
    .prayup-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
    
    @keyframes prayup-fadeOut {
      to { opacity: 0; }
    }
    
    @keyframes prayup-scaleOut {
      to { opacity: 0; transform: scale(0.85) translateY(20px); }
    }
  `;

  // Remove existing styles
  const existingStyle = document.getElementById('prayup-styles');
  if (existingStyle) existingStyle.remove();

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  // Event listeners
  document.getElementById('prayup-close').addEventListener('click', closeOverlay);
  document.getElementById('prayup-dismiss').addEventListener('click', closeOverlay);
  document.getElementById('prayup-stop').addEventListener('click', stopSound);
  overlay.querySelector('.prayup-backdrop').addEventListener('click', closeOverlay);

  // Auto close after 5 minutes
  setTimeout(closeOverlay, 5 * 60 * 1000);
}

function closeOverlay() {
  const overlay = document.getElementById('prayup-overlay');
  if (overlay) {
    const card = overlay.querySelector('.prayup-card');
    const backdrop = overlay.querySelector('.prayup-backdrop');
    
    if (card) card.style.animation = 'prayup-scaleOut 0.25s ease forwards';
    if (backdrop) backdrop.style.animation = 'prayup-fadeOut 0.25s ease forwards';
    
    chrome.runtime.sendMessage({ action: 'stopSound' });
    
    setTimeout(() => {
      overlay.remove();
      const style = document.getElementById('prayup-styles');
      if (style) style.remove();
    }, 250);
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
