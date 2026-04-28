'use client';

import { useEffect, useState } from 'react';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export default function KonamiCodeEasterEgg() {
  const [triggered, setTriggered] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const expected = KONAMI[index];
      if (e.key === expected) {
        if (index + 1 === KONAMI.length) {
          setTriggered(true);
          setIndex(0);
          setTimeout(() => setTriggered(false), 4000);
        } else {
          setIndex((i) => i + 1);
        }
        e.preventDefault();
      } else {
        setIndex(0);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [index]);

  if (!triggered) return null;

  // Confetti burst - precompute dx/dy for broad browser support
  const colors = ['#00d4ff', '#f72585', '#00f5d4', '#fee440', '#ff6b35', '#9b5de5'];
  const pieces = Array.from({ length: 80 }, (_, i) => {
    const angle = (i / 80) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 8 + Math.random() * 12;
    return {
      id: i,
      dx: Math.cos(angle) * speed * 15,
      dy: Math.sin(angle) * speed * 15,
      color: colors[i % colors.length],
      size: 4 + Math.random() * 8,
      rotSpeed: (Math.random() - 0.5) * 360,
      delay: i * 5,
    };
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        overflow: 'hidden',
      }}
      aria-hidden
    >
      {pieces.map((p) => (
        <div
          key={p.id}
          className="konami-confetti"
          style={{
            '--dx': `${p.dx}vmax`,
            '--dy': `${p.dy}vmax`,
            '--color': p.color,
            '--size': `${p.size}px`,
            '--rotSpeed': `${p.rotSpeed}deg`,
            '--delay': `${p.delay}ms`,
            animationDelay: `${p.delay}ms`,
          } as React.CSSProperties}
        />
      ))}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.85)',
          padding: '24px 40px',
          borderRadius: 16,
          border: '2px solid rgba(0,212,255,0.5)',
          boxShadow: '0 0 40px rgba(0,212,255,0.3), 0 0 80px rgba(247,37,133,0.2)',
          textAlign: 'center',
          animation: 'konami-pulse 0.5s ease-out',
          zIndex: 100000,
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>🎮✨</div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            background: 'linear-gradient(90deg, #00d4ff, #f72585)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          You found the secret!
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
          +30 lives. Just kidding. 🌟
        </div>
      </div>
      <style>{`
        @keyframes konami-confetti-fly {
          to {
            transform: translate(var(--dx), var(--dy)) rotate(var(--rotSpeed));
            opacity: 0;
          }
        }
        @keyframes konami-pulse {
          from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        .konami-confetti {
          position: absolute;
          left: 50%;
          top: 50%;
          width: var(--size);
          height: var(--size);
          background: var(--color);
          border-radius: 2px;
          transform: translate(-50%, -50%);
          animation: konami-confetti-fly 2.5s ease-out forwards;
          animation-delay: var(--delay);
        }
      `}</style>
    </div>
  );
}
