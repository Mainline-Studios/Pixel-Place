'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const GAME_WIDTH = 320;
const GAME_HEIGHT = 240;
const PADDLE_W = 48;
const PADDLE_H = 10;
const BALL_R = 6;
const COIN_R = 8;
const PADDLE_SPEED = 4;
const FALL_SPEED = 1.2;
const SPAWN_INTERVAL = 90;

interface LoadingScreenWithGameProps {
  gettingReady: boolean;
  onGoToApp: () => void;
}

export default function LoadingScreenWithGame({ gettingReady, onGoToApp }: LoadingScreenWithGameProps) {
  const [paused, setPaused] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<{
    paddleX: number;
    ballX: number;
    ballY: number;
    ballVx: number;
    ballVy: number;
    coins: { x: number; y: number }[];
    score: number;
    lastSpawn: number;
  }>({
    paddleX: (GAME_WIDTH - PADDLE_W) / 2,
    ballX: GAME_WIDTH / 2,
    ballY: GAME_HEIGHT - 40,
    ballVx: 2,
    ballVy: -2,
    coins: [],
    score: 0,
    lastSpawn: 0,
  });

  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const g = gameRef.current;
    if (!canvas || !g) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1b26';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (paused) return;

    g.paddleX = Math.max(0, Math.min(GAME_WIDTH - PADDLE_W, g.paddleX));
    if (keysRef.current.left) g.paddleX -= PADDLE_SPEED;
    if (keysRef.current.right) g.paddleX += PADDLE_SPEED;

    g.ballX += g.ballVx;
    g.ballY += g.ballVy;
    if (g.ballX <= BALL_R || g.ballX >= GAME_WIDTH - BALL_R) g.ballVx *= -1;
    if (g.ballY <= BALL_R) g.ballVy *= -1;
    if (g.ballY >= GAME_HEIGHT - BALL_R - PADDLE_H) {
      if (g.ballX >= g.paddleX && g.ballX <= g.paddleX + PADDLE_W) {
        g.ballVy = -Math.abs(g.ballVy);
        g.ballY = GAME_HEIGHT - BALL_R - PADDLE_H - 2;
      } else if (g.ballY > GAME_HEIGHT) {
        g.ballX = GAME_WIDTH / 2;
        g.ballY = GAME_HEIGHT - 40;
        g.ballVy = -2;
      }
    }

    const now = Date.now();
    if (now - g.lastSpawn > SPAWN_INTERVAL) {
      g.coins.push({ x: Math.random() * (GAME_WIDTH - 2 * COIN_R) + COIN_R, y: 0 });
      g.lastSpawn = now;
    }
    g.coins = g.coins.filter((c) => {
      c.y += FALL_SPEED;
      const px = g.paddleX + PADDLE_W / 2;
      const hit = c.y + COIN_R >= GAME_HEIGHT - PADDLE_H && c.y - COIN_R <= GAME_HEIGHT
        && Math.abs(c.x - px) < PADDLE_W / 2 + COIN_R;
      if (hit) {
        g.score += 1;
        return false;
      }
      return c.y < GAME_HEIGHT + 20;
    });

    ctx.fillStyle = '#7aa2f7';
    ctx.fillRect(g.paddleX, GAME_HEIGHT - PADDLE_H, PADDLE_W, PADDLE_H);

    ctx.fillStyle = '#bb9af7';
    ctx.beginPath();
    ctx.arc(g.ballX, g.ballY, BALL_R, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e0af68';
    g.coins.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, COIN_R, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Score: ${g.score}`, 8, 20);
  }, [paused]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setPaused((p) => !p);
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = e.type === 'keydown';
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = e.type === 'keydown';
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, []);

  useEffect(() => {
    let id: number;
    const tick = () => {
      draw();
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [draw]);

  const showBanner = !gettingReady && !bannerDismissed;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'linear-gradient(180deg, #16161e 0%, #1a1b26 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text, #c0caf5)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h2 style={{ marginBottom: '8px', fontSize: '1.25rem', fontWeight: 600 }}>
        Getting some things ready…
      </h2>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', opacity: 0.8 }}>
        Catch the coins! Arrow keys or A/D to move · P to pause
      </p>
      <div style={{ border: '2px solid var(--border, #3b4261)', borderRadius: '8px', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          style={{ display: 'block', width: 'min(90vw, 320px)', height: 'auto', maxHeight: '50vh' }}
        />
      </div>
      {paused && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <p style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '4px' }}>Paused</p>
          <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>P to resume (P to close)</p>
        </div>
      )}

      {showBanner && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: 10,
            background: 'var(--panel, #24283b)',
            border: '1px solid var(--border, #3b4261)',
            borderRadius: '10px',
            padding: '14px 18px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            maxWidth: '280px',
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: '10px', fontSize: '0.95rem' }}>Ready!</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '12px' }}>
            Keep playing or head to Pixel Place.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--panel-soft, #32344a)',
                color: 'var(--text)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Keep playing
            </button>
            <button
              type="button"
              onClick={onGoToApp}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: '#7aa2f7',
                color: '#1a1b26',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Go to Pixel Place
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
