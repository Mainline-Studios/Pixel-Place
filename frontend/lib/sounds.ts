/**
 * Sound effects using Web Audio API - no external files needed.
 * Sounds are subtle and only play after user interaction (browser policy).
 */

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

function beep(options: { freq?: number; duration?: number; type?: OscillatorType; volume?: number }) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = options.freq ?? 440;
    osc.type = options.type ?? 'sine';
    gain.gain.setValueAtTime(options.volume ?? 0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (options.duration ?? 0.05));
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + (options.duration ?? 0.05));
  } catch {
    // Ignore audio errors (autoplay policy, etc.)
  }
}

export function playClick() {
  beep({ freq: 600, duration: 0.04, type: 'sine', volume: 0.06 });
}

export function playTabSwitch() {
  beep({ freq: 480, duration: 0.03, type: 'sine', volume: 0.05 });
}

export function playSuccess() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523, ctx.currentTime);
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.24);
  } catch {}
}

export function playError() {
  beep({ freq: 200, duration: 0.12, type: 'sawtooth', volume: 0.08 });
}

export function playEquip() {
  beep({ freq: 800, duration: 0.06, type: 'sine', volume: 0.07 });
}

export function playPurchase() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch {}
}
