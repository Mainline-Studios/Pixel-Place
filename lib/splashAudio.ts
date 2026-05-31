/**
 * Startup splash score: ambient pad + arpeggio + phase stingers (Web Audio API).
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

/** C major / A minor cinematic palette (Hz). */
const PAD = [130.81, 164.81, 196.0, 261.63];
const ARP = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63];

export class SplashAudioController {
  private enabled: boolean;
  private started = false;
  private disposed = false;
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

  private ensureGraph(): AudioContext | null {
    if (this.disposed || !this.enabled) return null;
    const ctx = getCtx();
    if (!ctx) return null;
    resume(ctx);
    if (this.started) return ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    this.padGain = ctx.createGain();
    this.padGain.gain.value = 0.11;
    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.value = 900;
    this.padFilter.Q.value = 0.7;
    this.padGain.connect(this.padFilter);
    this.padFilter.connect(this.master);

    this.lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 280;
    this.lfo.frequency.value = 0.08;
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.padFilter.frequency);
    this.lfo.start();

    PAD.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      g.gain.value = 0.22 / PAD.length;
      osc.connect(g);
      g.connect(this.padGain!);
      osc.start();
      this.padOscs.push(osc);
    });

    this.arpGain = ctx.createGain();
    this.arpGain.gain.value = 0.07;
    this.arpGain.connect(this.master);

    const t = ctx.currentTime;
    this.master.gain.setValueAtTime(0.0001, t);
    this.master.gain.exponentialRampToValueAtTime(0.42, t + 1.8);

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
    if (!this.arpGain) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(volume, when + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    osc.connect(g);
    g.connect(this.arpGain);
    osc.start(when);
    osc.stop(when + duration + 0.05);
  }

  private stinger(ctx: AudioContext, freqs: number[], vol: number): void {
    const t = ctx.currentTime;
    freqs.forEach((f, i) => this.playNote(ctx, f, t + i * 0.045, 0.35, vol * 0.5, 'triangle'));
  }

  /** Call every animation frame with timeline position. */
  tick(elapsedMs: number, phase: SplashPhase, localT: number, iconIndex: number): void {
    const ctx = this.ensureGraph();
    if (!ctx || !this.master) return;

    const t = ctx.currentTime;

    if (phase !== this.lastPhase) {
      this.lastPhase = phase;
      switch (phase) {
        case 'singleton':
          this.playNote(ctx, 523.25, t, 0.5, 0.12, 'sine');
          break;
        case 'split':
          this.stinger(ctx, [392, 494, 587], 0.14);
          break;
        case 'multiply':
          if (this.padFilter) {
            this.padFilter.frequency.exponentialRampToValueAtTime(1400, t + 1.5);
          }
          break;
        case 'icons':
          this.stinger(ctx, [440, 554, 659], 0.1);
          break;
        case 'logo':
          this.stinger(ctx, [392, 494, 587, 784], 0.16);
          if (this.padGain) {
            this.padGain.gain.exponentialRampToValueAtTime(0.16, t + 2);
          }
          break;
        case 'hold':
          break;
        case 'exit':
          this.master.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
          this.padOscs.forEach((o) => {
            try {
              o.stop(t + 1);
            } catch {
              /* already stopped */
            }
          });
          break;
        default:
          break;
      }
    }

    if (phase === 'multiply' || phase === 'icons' || phase === 'logo') {
      const step = Math.floor(elapsedMs / 140);
      if (step !== this.lastArpStep) {
        this.lastArpStep = step;
        const freq = ARP[step % ARP.length];
        this.playNote(ctx, freq, t, 0.22, phase === 'logo' ? 0.06 : 0.08, 'triangle');
      }
    }

    if (phase === 'icons' && iconIndex !== this.lastIconIndex && localT < 0.12) {
      this.lastIconIndex = iconIndex;
      const motif = [494, 587, 659, 740, 659][iconIndex] ?? 587;
      this.playNote(ctx, motif, t, 0.32, 0.11, 'sine');
      this.playNote(ctx, motif * 1.5, t + 0.1, 0.25, 0.05, 'triangle');
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
  }
}
