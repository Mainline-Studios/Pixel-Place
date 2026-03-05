'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface SquishBubblesProps {
  onClose?: () => void;
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  r: number;
  popped: boolean;
}

export default function SquishBubbles({ onClose }: SquishBubblesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [size, setSize] = useState({ w: 800, h: 500 });

  const spawnBubbles = useCallback(() => {
    const w = size.w;
    const h = size.h;
    const list: Bubble[] = [];
    let id = 0;
    for (let i = 0; i < 24; i++) {
      list.push({
        id: id++,
        x: 60 + Math.random() * (w - 120),
        y: 60 + Math.random() * (h - 120),
        r: 20 + Math.random() * 25,
        popped: false,
      });
    }
    setBubbles(list);
  }, [size.w, size.h]);

  useEffect(() => {
    const onResize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        const w = Math.min(800, container.clientWidth || 800);
        const h = Math.min(500, container.clientHeight || 500);
        setSize({ w, h });
      }
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (size.w && size.h && bubbles.length === 0) spawnBubbles();
  }, [size, bubbles.length, spawnBubbles]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setBubbles((prev) => {
      let hit = false;
      const next = prev.map((b) => {
        if (b.popped) return b;
        const dx = x - b.x;
        const dy = y - b.y;
        if (dx * dx + dy * dy <= b.r * b.r) {
          hit = true;
          return { ...b, popped: true };
        }
        return b;
      });
      if (hit) setScore((s) => s + 1);
      const left = next.filter((b) => !b.popped).length;
      if (left === 0) setTimeout(spawnBubbles, 400);
      return next;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.w || !size.h) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.w;
    canvas.height = size.h;

    const draw = () => {
      ctx.fillStyle = '#1a0505';
      ctx.fillRect(0, 0, size.w, size.h);
      ctx.fillStyle = 'rgba(255, 80, 80, 0.15)';
      ctx.fillRect(0, 0, size.w, size.h);

      bubbles.forEach((b) => {
        if (b.popped) return;
        const g = ctx.createRadialGradient(
          b.x - b.r * 0.3,
          b.y - b.r * 0.3,
          0,
          b.x,
          b.y,
          b.r
        );
        g.addColorStop(0, 'rgba(255, 200, 200, 0.9)');
        g.addColorStop(0.6, 'rgba(255, 100, 100, 0.6)');
        g.addColorStop(1, 'rgba(200, 50, 50, 0.4)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };
    draw();
  }, [size, bubbles]);

  return (
    <div style={{ width: '100%', minHeight: '100%', padding: '16px', boxSizing: 'border-box' }}>
      {onClose && (
        <button
          type="button"
          className="btn"
          onClick={onClose}
          style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10 }}
        >
          ← Back
        </button>
      )}
      <h2 style={{ textAlign: 'center', color: 'var(--text-main)', marginBottom: '8px' }}>
        Squish Bubbles
      </h2>
      <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '12px' }}>
        Click bubbles to pop them. Score: <strong>{score}</strong>
      </p>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <canvas
          ref={canvasRef}
          width={size.w}
          height={size.h}
          onClick={handleClick}
          style={{
            maxWidth: '100%',
            border: '2px solid var(--border)',
            borderRadius: '12px',
            cursor: 'pointer',
            background: '#1a0505',
          }}
        />
      </div>
    </div>
  );
}
