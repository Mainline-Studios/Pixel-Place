/**
 * Startup splash score: ambient pad + melodies + arpeggios (Web Audio API).
 */

import type { SplashPhase } from '@/lib/splashTimeline';

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedCtx) {
    const Ctx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    sharedCtx = new Ctx();
  }
  return sharedCtx;
}

function resume(ctx: AudioContext): void {
  if (ctx.state === 'suspended') void ctx.resume();
}

const PAD = [130.81, 164.81, 196.0, 261.63];
const ARP = [261.63, 329.63, 392.0, 523.25, 659.25, 523.25, 392.0, 329.63];

const OPENING_MELODY: { freq: number; at: number; dur: number; vol: number; type?: OscillatorType }[] = [
  { freq: 392, at: 0, dur: 0.45, vol: 0.11 },
  { freq: 494, at: 0.25, dur: 0.42, vol: 0.1 },
  { freq: 587, at: 0.52, dur: 0.48, vol: 0.11 },
  { freq: 659, at: 0.78, dur: 0.5, vol: 0.1 },
  { freq: 784, at: 1.05, dur: 0.52, vol: 0.12 },
  { freq: 659, at: 1.4, dur: 0.42, vol: 0.09 },
  { freq: 523, at: 1.7, dur: 0.58, vol: 0.1 },
  { freq: 587, at: 2.0, dur: 0.48, vol: 0.09 },
  { freq: 698, at: 2.3, dur: 0.65, vol: 0.11 },
  { freq: 784, at: 2.65, dur: 0.55, vol: 0.1 },
];

export class SplashAudioController {
  private enabled: boolean;
  private started = false;
  private disposed = false;
  private melodyPlayed = false;
  private lastPhase: SplashPhase | '' = '';
  private lastIconIndex = -1;
  private lastArpStep = -1;

  private master: GainNode | null = null;
  private padGain: GainNode | null = null;
  private arpGain: GainNode | null = null;
  private padOscs: OscillatorNode[] = [];
  private padFilter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;

  constructor(enabled: boolean) {
    this.enabled = enabled;
  }

  /** Call on pointer down or first frame — unlocks autoplay policy. */
  unlock(): void {
    if (!this.enabled || this.disposed) return;
    const ctx = getCtx();
    if (!ctx) return;
    void ctx.resume().then(() => this.ensureGraph());
    resume(ctx);
    this.ensureGraph();
  }

  private ensureGraph(): AudioContext | null {
    if (this.disposed || !this.enabled) return null;
    const ctx = getCtx();
    if (!ctx) return null;
    resume(ctx);
    if (this.started) return ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0.0001;
    this.master.connect(ctx.destination);

    this.padGain = ctx.createGain();
    this.padGain.gain.value = 0.11;
    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.value = 820;
    this.padGain.connect(this.padFilter);
    this.padFilter.connect(this.master);

    this.lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 300;
    this.lfo.frequency.value = 0.07;
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.padFilter.frequency);
    this.lfo.start();

    PAD.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      g.gain.value = 0.2 / PAD.length;
      osc.connect(g);
      g.connect(this.padGain!);
      osc.start();
      this.padOscs.push(osc);
    });

    this.arpGain = ctx.createGain();
    this.arpGain.gain.value = 0.09;
    this.arpGain.connect(this.master);

    const t = ctx.currentTime;
    this.master.gain.exponentialRampToValueAtTime(0.48, t + 1.6);

    this.started = true;
    return ctx;
  }

  private playNote(
    ctx: AudioContext,
    freq: number,
    when: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'sine'
  ): void {
    if (!this.arpGain || !this.master) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0002), when + 0.025);
    g.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    osc.connect(g);
    g.connect(this.arpGain);
    osc.start(when);
    osc.stop(when + duration + 0.08);
  }

  private playMelody(ctx: AudioContext, baseTime: number): void {
    OPENING_MELODY.forEach((n) => {
      this.playNote(ctx, n.freq, baseTime + n.at, n.dur, n.vol, n.type ?? 'triangle');
    });
  }

  private playPhrase(ctx: AudioContext, freqs: number[], gap: number, vol: number): void {
    const t = ctx.currentTime;
    freqs.forEach((f, i) => this.playNote(ctx, f, t + i * gap, 0.34, vol, 'triangle'));
  }

  tick(elapsedMs: number, phase: SplashPhase, localT: number, iconIndex: number): void {
    this.unlock();
    const ctx = this.ensureGraph();
    if (!ctx || !this.master) return;

    const t = ctx.currentTime;

    if (!this.melodyPlayed && (phase === 'intro' || phase === 'cover')) {
      this.melodyPlayed = true;
      this.playMelody(ctx, t);
    }

    if (phase !== this.lastPhase) {
      this.lastPhase = phase;
      switch (phase) {
        case 'disperse':
          this.playPhrase(ctx, [392, 440, 494, 587], 0.08, 0.11);
          if (this.padFilter) {
            this.padFilter.frequency.exponentialRampToValueAtTime(1300, t + 1.2);
          }
          break;
        case 'split':
          this.playPhrase(ctx, [523, 659, 784], 0.07, 0.1);
          break;
        case 'icons':
          this.playPhrase(ctx, [440, 554, 659], 0.08, 0.09);
          break;
        case 'assemble':
          this.playPhrase(ctx, [392, 494, 587, 740, 988], 0.1, 0.12);
          if (this.padGain) {
            this.padGain.gain.exponentialRampToValueAtTime(0.14, t + 2);
          }
          break;
        case 'exit':
          this.master.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
          this.padOscs.forEach((o) => {
            try {
              o.stop(t + 1);
            } catch {
              /* stopped */
            }
          });
          break;
        default:
          break;
      }
    }

    if (phase === 'multiply' || phase === 'icons' || phase === 'assemble' || phase === 'disperse' || phase === 'cover') {
      const interval = phase === 'cover' ? 100 : phase === 'multiply' ? 90 : 115;
      const step = Math.floor(elapsedMs / interval);
      if (step !== this.lastArpStep) {
        this.lastArpStep = step;
        const freq = ARP[step % ARP.length];
        this.playNote(ctx, freq, t, 0.22, 0.08, 'triangle');
        if (step % 2 === 0) {
          this.playNote(ctx, freq * 0.5, t + 0.05, 0.3, 0.045, 'sine');
        }
      }
    }

    if (phase === 'icons' && iconIndex !== this.lastIconIndex && localT < 0.1) {
      this.lastIconIndex = iconIndex;
      const motif = [494, 587, 659, 740, 880][iconIndex] ?? 587;
      this.playPhrase(ctx, [motif, motif * 1.25], 0.1, 0.1);
    }
  }

  dispose(): void {
    this.disposed = true;
    const ctx = sharedCtx;
    if (!ctx || !this.master) {
      this.lastPhase = '';
      return;
    }
    const t = ctx.currentTime;
    try {
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setValueAtTime(this.master.gain.value, t);
      this.master.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    } catch {
      /* ignore */
    }
    this.padOscs.forEach((o) => {
      try {
        o.stop(t + 0.4);
      } catch {
        /* ignore */
      }
    });
    this.lfo?.stop(t + 0.4);
    this.padOscs = [];
    this.lastPhase = '';
    this.started = false;
    this.melodyPlayed = false;
  }
}
