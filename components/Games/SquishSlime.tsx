'use client';

import React, { useCallback, useRef, useState } from 'react';

interface SquishSlimeProps {
  onClose?: () => void;
}

export default function SquishSlime({ onClose }: SquishSlimeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [squish, setSquish] = useState({ x: 0, y: 0, active: false });
  const [squishes, setSquishes] = useState(0);
  const size = { w: 400, h: 400 };
  const cx = size.w / 2;
  const cy = size.h / 2;
  const baseR = 80;
  const squishScale = squish.active ? 0.5 : 1;

  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * size.w - cx;
    const y = ((e.clientY - rect.top) / rect.height) * size.h - cy;
    setSquish({ x, y, active: true });
    setSquishes((n) => n + 1);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = useCallback(() => {
    setSquish((s) => ({ ...s, active: false }));
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!squish.active) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * size.w - cx;
    const y = ((e.clientY - rect.top) / rect.height) * size.h - cy;
    setSquish((s) => ({ ...s, x, y }));
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.w;
    canvas.height = size.h;

    const draw = () => {
      ctx.fillStyle = '#1a0505';
      ctx.fillRect(0, 0, size.w, size.h);
      ctx.fillStyle = 'rgba(255, 80, 80, 0.12)';
      ctx.fillRect(0, 0, size.w, size.h);

      const sx = squish.active ? squish.x * 0.4 : 0;
      const sy = squish.active ? squish.y * 0.4 : 0;
      const rx = baseR * (1 - Math.abs(sx) / 200) * squishScale;
      const ry = baseR * (1 - Math.abs(sy) / 200) * squishScale;

      const g = ctx.createRadialGradient(
        cx - 30,
        cy - 30,
        0,
        cx,
        cy,
        Math.max(rx, ry) + 20
      );
      g.addColorStop(0, 'rgba(255, 220, 220, 0.95)');
      g.addColorStop(0.5, 'rgba(255, 120, 120, 0.7)');
      g.addColorStop(1, 'rgba(180, 40, 40, 0.5)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx + sx, cy + sy, Math.max(20, rx), Math.max(20, ry), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    draw();
  }, [squish, squishScale]);

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
        Squish Slime
      </h2>
      <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '12px' }}>
        Click and drag to squish the slime! Squishes: <strong>{squishes}</strong>
      </p>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <canvas
          ref={canvasRef}
          width={size.w}
          height={size.h}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerMove={handlePointerMove}
          style={{
            maxWidth: '100%',
            border: '2px solid var(--border)',
            borderRadius: '12px',
            cursor: 'pointer',
            touchAction: 'none',
            background: '#1a0505',
          }}
        />
      </div>
    </div>
  );
}
