import React, { useRef, useEffect, useState, useCallback } from 'react';

// Simple "Floor Is Lava" canvas mini-game component
// - Player is a square that can move left/right and jump
// - Platforms generate upward as lava rises from the bottom
// - If player touches lava (y >= lavaY) they lose
// - Score increases with time / height

type Vec = { x: number; y: number };

const WIDTH = 640;
const HEIGHT = 360;
const GRAVITY = 0.8;
const FRICTION = 0.9;
const PLAYER_SIZE = 18;
const PLATFORM_MIN_W = 60;
const PLATFORM_MAX_W = 160;
const PLATFORM_H = 10;

export default function FloorIsLava(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Game state
  const playerRef = useRef({ pos: { x: WIDTH / 2 - PLAYER_SIZE / 2, y: 60 }, vel: { x: 0, y: 0 }, onGround: false });
  const platformsRef = useRef<Array<{ x: number; y: number; w: number; h: number }>>([]);
  const lavaYRef = useRef(HEIGHT - 24);
  const lavaSpeedRef = useRef(6); // pixels per second initially
  const elapsedRef = useRef(0);

  // Controls
  const keys = useRef<{ left: boolean; right: boolean; up: boolean }>( { left: false, right: false, up: false } );

  const resetGame = useCallback(() => {
    const p = playerRef.current;
    p.pos.x = WIDTH / 2 - PLAYER_SIZE / 2;
    p.pos.y = 40;
    p.vel.x = 0;
    p.vel.y = 0;
    p.onGround = false;
    platformsRef.current = [
      { x: 0, y: HEIGHT - 80, w: WIDTH, h: PLATFORM_H },
      { x: 120, y: HEIGHT - 150, w: 120, h: PLATFORM_H },
      { x: 380, y: HEIGHT - 220, w: 120, h: PLATFORM_H },
    ];
    lavaYRef.current = HEIGHT - 24;
    lavaSpeedRef.current = 15;
    elapsedRef.current = 0;
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    resetGame();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.current.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') keys.current.up = true;
      if (e.key === 'p' || e.key === 'P') setPaused(p => !p);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.current.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') keys.current.up = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetGame]);

  const spawnPlatformIfNeeded = useCallback(() => {
    const plats = platformsRef.current;
    // Keep platforms above the camera / view: spawn as lava rises
    const highest = Math.min(...plats.map(p => p.y));
    while (highest > 40 && plats.length < 12) break; // safety

    // Spawn some platforms near top
    const topY = Math.min(...plats.map(p => p.y));
    if (topY > 40) {
      // nothing
    }

    // Occasionally add new platform at top of screen
    if (Math.random() < 0.02) {
      const w = Math.round(PLATFORM_MIN_W + Math.random() * (PLATFORM_MAX_W - PLATFORM_MIN_W));
      const x = Math.round(Math.random() * (WIDTH - w));
      const y = Math.round(20 + Math.random() * 100);
      plats.push({ x, y, w, h: PLATFORM_H });
    }
  }, []);

  const step = useCallback((dt: number) => {
    const p = playerRef.current;
    const plats = platformsRef.current;

    // Controls horizontal
    if (keys.current.left) p.vel.x -= 0.9;
    if (keys.current.right) p.vel.x += 0.9;

    // Jump
    if (keys.current.up && p.onGround) {
      p.vel.y = -14.5;
      p.onGround = false;
    }

    // Apply physics
    p.vel.y += GRAVITY * (dt / (1000 / 60));
    p.pos.x += p.vel.x * (dt / (1000 / 60));
    p.pos.y += p.vel.y * (dt / (1000 / 60));

    // Friction
    p.vel.x *= 0.88;

    // Boundaries
    if (p.pos.x < 0) { p.pos.x = 0; p.vel.x = 0; }
    if (p.pos.x + PLAYER_SIZE > WIDTH) { p.pos.x = WIDTH - PLAYER_SIZE; p.vel.x = 0; }

    // Platform collisions
    p.onGround = false;
    for (let i = 0; i < plats.length; i++) {
      const pl = plats[i];
      if (
        p.pos.x + PLAYER_SIZE > pl.x &&
        p.pos.x < pl.x + pl.w &&
        p.pos.y + PLAYER_SIZE > pl.y &&
        p.pos.y + PLAYER_SIZE - p.vel.y <= pl.y
      ) {
        // landed
        p.pos.y = pl.y - PLAYER_SIZE;
        p.vel.y = 0;
        p.onGround = true;
      }
    }

    // Lava rises
    const lava = lavaYRef.current;
    lavaYRef.current -= (lavaSpeedRef.current * dt) / 1000; // move up
    // As time passes, increase lava speed slightly
    elapsedRef.current += dt / 1000;
    if (elapsedRef.current > 20) lavaSpeedRef.current = 24;
    if (elapsedRef.current > 40) lavaSpeedRef.current = 36;

    // Scroll world down as lava rises to give upward feel: move platforms down
    const riseDelta = (lavaSpeedRef.current * dt) / 1000;
    for (let i = 0; i < plats.length; i++) {
      plats[i].y += riseDelta;
    }
    p.pos.y += riseDelta;

    // Remove platforms that fall off bottom
    platformsRef.current = plats.filter(pl => pl.y < HEIGHT + 100);

    // Randomly spawn new platforms near top
    if (Math.random() < 0.03) {
      const w = Math.round(PLATFORM_MIN_W + Math.random() * (PLATFORM_MAX_W - PLATFORM_MIN_W));
      const x = Math.round(Math.random() * (WIDTH - w));
      const y = -20 - Math.random() * 80;
      platformsRef.current.push({ x, y, w, h: PLATFORM_H });
    }

    // Score based on lowest lavaY (the higher lava gets, the more score)
    const currentScore = Math.max(0, Math.floor((HEIGHT - lavaYRef.current) * 2));
    setScore(currentScore);

    // Check death
    if (p.pos.y + PLAYER_SIZE >= lavaYRef.current) {
      setGameOver(true);
      setRunning(false);
    }
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0b1020';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Draw platforms
    ctx.fillStyle = '#6b8e23';
    platformsRef.current.forEach(pl => {
      ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
    });

    // Draw player
    const p = playerRef.current;
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(p.pos.x, p.pos.y, PLAYER_SIZE, PLAYER_SIZE);

    // Draw lava
    const lavaY = lavaYRef.current;
    const grd = ctx.createLinearGradient(0, lavaY, 0, HEIGHT);
    grd.addColorStop(0, '#ff5f1f');
    grd.addColorStop(1, '#ff2e00');
    ctx.fillStyle = grd;
    ctx.fillRect(0, lavaY, WIDTH, HEIGHT - lavaY);

    // HUD
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    ctx.fillText('Floor is Lava', 10, 20);
    ctx.fillText('Score: ' + score, 10, 40);
    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = 'white';
      ctx.font = '28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Paused', WIDTH / 2, HEIGHT / 2);
      ctx.textAlign = 'left';
    }
    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = 'white';
      ctx.font = '22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('You fell in the lava!', WIDTH / 2, HEIGHT / 2 - 10);
      ctx.fillText('Final score: ' + score, WIDTH / 2, HEIGHT / 2 + 24);
      ctx.textAlign = 'left';
    }
  }, [score, paused, gameOver]);

  const gameLoop = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const dt = time - lastTimeRef.current;
    lastTimeRef.current = time;
    if (!paused && running && !gameOver) {
      step(dt);
    }
    render();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [paused, running, gameOver, step, render]);

  useEffect(() => {
    // start loop
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameLoop]);

  const start = () => {
    resetGame();
    setRunning(true);
    setPaused(false);
  };

  const stop = () => {
    setRunning(false);
    setPaused(false);
  };

  const resume = () => setPaused(false);
  const togglePause = () => setPaused(p => !p);

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ border: '2px solid #333', width: WIDTH, height: HEIGHT, background: '#000' }}>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
      </div>
      <div style={{ minWidth: 200, color: '#fff', fontFamily: 'monospace' }}>
        <h3>Floor is Lava</h3>
        <p>Use A/D or Left/Right to move. W / Up / Space to jump. P to pause.</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button onClick={start} disabled={running} style={{ padding: '8px 12px' }}>Start</button>
          <button onClick={stop} disabled={!running} style={{ padding: '8px 12px' }}>Stop</button>
          <button onClick={resetGame} style={{ padding: '8px 12px' }}>Reset</button>
        </div>
        <div style={{ marginBottom: 8 }}>
          <button onClick={togglePause} style={{ padding: '6px 10px' }}>{paused ? 'Resume' : 'Pause'}</button>
        </div>

        <div>
          <strong>Score:</strong> {score}
        </div>
        <div>
          <strong>Status:</strong> {gameOver ? 'Game Over' : running ? (paused ? 'Paused' : 'Running') : 'Stopped'}
        </div>

        <div style={{ marginTop: 10 }}>
          <small>Lava rises over time; keep jumping to survive!</small>
        </div>
      </div>
    </div>
  );
}
