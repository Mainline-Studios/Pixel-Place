'use client';

import { useEffect, useRef, useState } from 'react';

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    if (isPlaying && !audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    if (!isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Create a simple chiptune melody loop
    const playMelody = () => {
      if (!ctx || !isPlaying) return;

      const gainNode = ctx.createGain();
      gainNode.gain.value = volume * 0.2; // Lower overall volume
      gainNode.connect(ctx.destination);

      // Simple happy melody (C major scale)
      const notes = [
        { freq: 261.63, duration: 0.2 }, // C4
        { freq: 293.66, duration: 0.2 }, // D4
        { freq: 329.63, duration: 0.2 }, // E4
        { freq: 349.23, duration: 0.2 }, // F4
        { freq: 392.00, duration: 0.2 }, // G4
        { freq: 440.00, duration: 0.2 }, // A4
        { freq: 493.88, duration: 0.2 }, // B4
        { freq: 523.25, duration: 0.4 }, // C5
      ];

      let currentTime = ctx.currentTime;

      const playNote = (freq: number, duration: number, startTime: number) => {
        const oscillator = ctx.createOscillator();
        const noteGain = ctx.createGain();

        oscillator.type = 'square';
        oscillator.frequency.value = freq;

        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
        noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.connect(noteGain);
        noteGain.connect(gainNode);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Play melody
      notes.forEach((note, index) => {
        playNote(note.freq, note.duration, currentTime + index * 0.2);
      });

      // Add bass line (lower octave)
      notes.forEach((note, index) => {
        playNote(note.freq / 2, note.duration, currentTime + index * 0.2);
      });
    };

    // Play melody every 2.5 seconds
    playMelody();
    intervalRef.current = setInterval(playMelody, 2500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, volume]);

  if (typeof window === 'undefined') return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '200px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className="btn"
          onClick={() => setIsPlaying(!isPlaying)}
          style={{ flex: 1 }}
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play'} Music
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="smalltext" style={{ fontSize: '11px' }}>Volume:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
          }}
          style={{ flex: 1 }}
        />
        <span className="smalltext" style={{ fontSize: '11px', minWidth: '30px' }}>
          {Math.round(volume * 100)}%
        </span>
      </div>
      <div className="smalltext" style={{ fontSize: '10px', textAlign: 'center', color: 'var(--text-dim)' }}>
        🎵 Chiptune Music
      </div>
    </div>
  );
}


