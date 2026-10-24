/**
 * Notification Helper Utilities
 * Provides gentle sound chimes, system push notifications, and webmail provider deep links
 */

/**
 * Plays a gentle double-chime notification sound using Web Audio API
 */
export function playNotificationChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First tone (D5 ~ 587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.14, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.2);

    // Second tone (A5 ~ 880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.16, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.42);
  } catch (err) {
    // Autoplay policy or unsupported audio - fail silently
    console.debug('Notification audio prevented or not supported:', err);
  }
}

/**
 * Triggers a native browser system notification if permitted
 */
export function triggerSystemPushNotification(title: string, options?: NotificationOptions): void {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(title, options);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, options);
        }
      });
    }
  } catch (err) {
    console.debug('System push notification error:', err);
  }
}

/**
 * Returns direct webmail provider URL for fast customer inbox access
 */
export function getEmailProviderUrl(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  if (domain.includes('gmail.com') || domain.includes('googlemail.com')) {
    return 'https://mail.google.com/mail/u/0/#search/nexalus+OR+reset';
  }
  if (domain.includes('outlook.com') || domain.includes('hotmail.com') || domain.includes('live.com')) {
    return 'https://outlook.live.com/mail/0/inbox';
  }
  if (domain.includes('yahoo.com')) {
    return 'https://mail.yahoo.com/';
  }
  return `mailto:${email}`;
}

/**
 * Returns user-friendly name for mail provider button
 */
export function getEmailProviderName(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  if (domain.includes('gmail.com') || domain.includes('googlemail.com')) {
    return 'Open Gmail (Inbox & Spam)';
  }
  if (domain.includes('outlook.com') || domain.includes('hotmail.com') || domain.includes('live.com')) {
    return 'Open Outlook';
  }
  if (domain.includes('yahoo.com')) {
    return 'Open Yahoo Mail';
  }
  return 'Open Mail App';
}
