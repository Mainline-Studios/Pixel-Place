'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Tile = 'grass' | 'tree' | 'swamp' | 'stone';
type Vec = { x: number; y: number };

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function keyFor(x: number, y: number) {
  return `${x},${y}`;
}

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function chooseTile(r: number): Tile {
  // Tuned for “playable” maps: mostly grass, some blockers, a little swamp (slow)
  if (r < 0.72) return 'grass';
  if (r < 0.86) return 'tree';
  if (r < 0.95) return 'swamp';
  return 'stone';
}

function tileColor(t: Tile) {
  switch (t) {
    case 'grass':
      return '#1f8a3b';
    case 'tree':
      return '#0f5d24';
    case 'swamp':
      return '#2a6f6e';
    case 'stone':
      return '#6b7280';
  }
}

function tileIsBlocked(t: Tile) {
  return t === 'tree' || t === 'stone';
}

function tileSpeedMultiplier(t: Tile) {
  if (t === 'swamp') return 0.55;
  return 1;
}

const FRUITS = [
  { label: 'Banana', icon: '🍌' },
  { label: 'Mango', icon: '🥭' },
  { label: 'Pineapple', icon: '🍍' },
  { label: 'Berries', icon: '🫐' },
  { label: 'Coconut', icon: '🥥' },
] as const;

export default function JungleJourneySeries() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});

  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1_000_000));
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [collected, setCollected] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<string>('Collect fruit and reach 20 points!');

  const world = useMemo(() => {
    const rand = mulberry32(seed);
    const W = 56;
    const H = 36;
    const tiles: Tile[][] = Array.from({ length: H }, () =>
      Array.from({ length: W }, () => chooseTile(rand()))
    );

    // Clear a guaranteed playable area around spawn
    const spawn = { x: Math.floor(W / 2), y: Math.floor(H / 2) };
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const x = clamp(spawn.x + dx, 0, W - 1);
        const y = clamp(spawn.y + dy, 0, H - 1);
        tiles[y][x] = 'grass';
      }
    }

    // Place fruit on grass tiles
    const fruitPositions = new Map<string, number>(); // key -> fruit index
    const targetFruitCount = 26;
    let tries = 0;
    while (fruitPositions.size < targetFruitCount && tries++ < 20_000) {
      const x = Math.floor(rand() * W);
      const y = Math.floor(rand() * H);
      if (tileIsBlocked(tiles[y][x])) continue;
      const k = keyFor(x, y);
      if (fruitPositions.has(k)) continue;
      // Keep a little space around spawn
      if (Math.abs(x - spawn.x) <= 2 && Math.abs(y - spawn.y) <= 2) continue;
      fruitPositions.set(k, Math.floor(rand() * FRUITS.length));
    }

    // Pick an “exit” tile (a temple) far from spawn, ensure not blocked
    let exit = { x: W - 3, y: H - 3 };
    for (let t = 0; t < 5000; t++) {
      const x = Math.floor(rand() * W);
      const y = Math.floor(rand() * H);
      if (tileIsBlocked(tiles[y][x])) continue;
      const d = Math.abs(x - spawn.x) + Math.abs(y - spawn.y);
      if (d > 36) {
        exit = { x, y };
        break;
      }
    }
    tiles[exit.y][exit.x] = 'grass';

    return { W, H, tiles, spawn, fruitPositions, exit };
  }, [seed]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key === 'Spacebar') e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DPR = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const tilePx = 18;
    const viewTilesX = 26;
    const viewTilesY = 16;
    const width = viewTilesX * tilePx;
    const height = viewTilesY * tilePx;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width * DPR;
    canvas.height = height * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const player = {
      pos: { x: world.spawn.x + 0.5, y: world.spawn.y + 0.5 },
      v: { x: 0, y: 0 },
      stamina: 100,
    };

    const fruitMap = new Map(world.fruitPositions);
    let last = performance.now();
    let localScore = 0;
    let win = false;

    const draw = () => {
      // Camera follows player (in tile units)
      const cam = {
        x: clamp(player.pos.x - viewTilesX / 2, 0, world.W - viewTilesX),
        y: clamp(player.pos.y - viewTilesY / 2, 0, world.H - viewTilesY),
      };

      ctx.clearRect(0, 0, width, height);

      // Background tiles
      for (let ty = 0; ty < viewTilesY; ty++) {
        for (let tx = 0; tx < viewTilesX; tx++) {
          const gx = Math.floor(cam.x) + tx;
          const gy = Math.floor(cam.y) + ty;
          if (gx < 0 || gy < 0 || gx >= world.W || gy >= world.H) continue;
          const t = world.tiles[gy][gx];
          ctx.fillStyle = tileColor(t);
          ctx.fillRect(tx * tilePx, ty * tilePx, tilePx, tilePx);
        }
      }

      // Exit marker
      {
        const ex = world.exit.x - cam.x;
        const ey = world.exit.y - cam.y;
        if (ex >= -1 && ey >= -1 && ex <= viewTilesX && ey <= viewTilesY) {
          ctx.fillStyle = 'rgba(255, 215, 0, 0.18)';
          ctx.fillRect(ex * tilePx, ey * tilePx, tilePx, tilePx);
          ctx.fillStyle = '#fbbf24';
          ctx.font = '14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
          ctx.fillText('⛩️', ex * tilePx + 2, ey * tilePx + 14);
        }
      }

      // Fruits
      ctx.font = '14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      for (const [k, fruitIx] of fruitMap.entries()) {
        const [sx, sy] = k.split(',').map((n) => Number(n));
        const fx = sx + 0.5 - cam.x;
        const fy = sy + 0.5 - cam.y;
        if (fx < -1 || fy < -1 || fx > viewTilesX + 1 || fy > viewTilesY + 1) continue;
        ctx.fillText(FRUITS[fruitIx].icon, fx * tilePx - 7, fy * tilePx + 6);
      }

      // Player
      {
        const px = (player.pos.x - cam.x) * tilePx;
        const py = (player.pos.y - cam.y) * tilePx;
        ctx.beginPath();
        ctx.fillStyle = '#ffe08a';
        ctx.arc(px, py, 6.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.stroke();
        ctx.fillStyle = '#111827';
        ctx.fillText('🧭', px - 7, py + 6);
      }

      // HUD
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(8, 8, 162, 44);
      ctx.fillStyle = '#fff';
      ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.fillText(`Score: ${localScore}`, 16, 26);
      ctx.fillText(`Stamina: ${Math.round(player.stamina)}`, 16, 44);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (running) {
        const keys = keysRef.current;
        const left = keys['arrowleft'] || keys['a'];
        const right = keys['arrowright'] || keys['d'];
        const up = keys['arrowup'] || keys['w'];
        const down = keys['arrowdown'] || keys['s'];
        const sprint = keys['shift'] === true;

        const onTile = world.tiles[Math.floor(player.pos.y)]?.[Math.floor(player.pos.x)] ?? 'grass';
        const tileMul = tileSpeedMultiplier(onTile);
        const baseSpeed = 5.2 * tileMul;
        const sprintMul = sprint && player.stamina > 4 ? 1.55 : 1;
        const speed = baseSpeed * sprintMul;

        const input = { x: (right ? 1 : 0) - (left ? 1 : 0), y: (down ? 1 : 0) - (up ? 1 : 0) };
        const mag = Math.hypot(input.x, input.y) || 1;
        const dir = { x: input.x / mag, y: input.y / mag };

        if (sprintMul > 1 && (input.x !== 0 || input.y !== 0)) {
          player.stamina = Math.max(0, player.stamina - 34 * dt);
        } else {
          player.stamina = Math.min(100, player.stamina + 22 * dt);
        }

        // Velocity smoothing
        const accel = 16;
        player.v.x += (dir.x * speed - player.v.x) * clamp(accel * dt, 0, 1);
        player.v.y += (dir.y * speed - player.v.y) * clamp(accel * dt, 0, 1);

        const next = { x: player.pos.x + player.v.x * dt, y: player.pos.y + player.v.y * dt };

        // Collision against blocked tiles (AABB-ish in tile space)
        const tryMove = (axis: 'x' | 'y') => {
          const candidate = { ...player.pos, [axis]: next[axis] } as Vec;
          const cx = clamp(candidate.x, 0.05, world.W - 0.05);
          const cy = clamp(candidate.y, 0.05, world.H - 0.05);
          const tx = Math.floor(cx);
          const ty = Math.floor(cy);
          const t = world.tiles[ty]?.[tx] ?? 'tree';
          if (tileIsBlocked(t)) return false;
          player.pos.x = cx;
          player.pos.y = cy;
          return true;
        };

        // Move x then y for stable corner behavior
        tryMove('x');
        tryMove('y');

        // Fruit pickup
        const px = Math.floor(player.pos.x);
        const py = Math.floor(player.pos.y);
        const k = keyFor(px, py);
        const fruitIx = fruitMap.get(k);
        if (fruitIx !== undefined) {
          fruitMap.delete(k);
          localScore += 1;
          setScore(localScore);
          setCollected((prev) => ({ ...prev, [FRUITS[fruitIx].label]: (prev[FRUITS[fruitIx].label] || 0) + 1 }));
          setStatus(`Collected ${FRUITS[fruitIx].label}! (+1)`);
        }

        // Win condition: score >= 20 and reach exit
        if (!win && localScore >= 20 && px === world.exit.x && py === world.exit.y) {
          win = true;
          setStatus('You made it to the temple with 20+ fruit. Jungle Journey complete!');
        } else if (!win && localScore >= 20) {
          setStatus('You have 20+ fruit. Find the ⛩️ temple to finish!');
        }
      }

      draw();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, world, seed]);

  const collectedList = useMemo(() => {
    const entries = Object.entries(collected).filter(([, v]) => v > 0);
    entries.sort((a, b) => b[1] - a[1]);
    return entries;
  }, [collected]);

  return (
    <div style={{ width: '100%', maxWidth: 980, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Jungle Journey</div>
          <div style={{ opacity: 0.85, fontSize: 13 }}>{status}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="pixel-button"
            onClick={() => setRunning((r) => !r)}
            type="button"
            style={{ padding: '8px 10px' }}
          >
            {running ? 'Pause' : 'Resume'}
          </button>
          <button
            className="pixel-button"
            onClick={() => {
              setCollected({});
              setScore(0);
              setStatus('Collect fruit and reach 20 points!');
              setSeed(Math.floor(Math.random() * 1_000_000));
              setRunning(true);
            }}
            type="button"
            style={{ padding: '8px 10px' }}
          >
            New run
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            padding: 10,
            background: 'rgba(0,0,0,0.16)',
          }}
        >
          <canvas ref={canvasRef} />
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.9, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <span>
              <strong>Move</strong>: WASD / Arrow keys
            </span>
            <span>
              <strong>Sprint</strong>: Shift (uses stamina)
            </span>
            <span>
              <strong>Goal</strong>: 20 fruit → find ⛩️
            </span>
          </div>
        </div>

        <div
          style={{
            flex: '1 1 220px',
            minWidth: 220,
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            padding: 12,
            background: 'rgba(0,0,0,0.16)',
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Collected</div>
          {collectedList.length === 0 ? (
            <div style={{ fontSize: 13, opacity: 0.85 }}>None yet. Start collecting!</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {collectedList.map(([k, v]) => (
                <li key={k} style={{ fontSize: 13, opacity: 0.95, marginBottom: 4 }}>
                  {k}: {v}
                </li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.85 }}>
            Terrain: <span style={{ color: '#1f8a3b' }}>grass</span>,{' '}
            <span style={{ color: '#0f5d24' }}>trees</span> (blocked),{' '}
            <span style={{ color: '#2a6f6e' }}>swamp</span> (slow),{' '}
            <span style={{ color: '#6b7280' }}>stone</span> (blocked).
          </div>
        </div>
      </div>
    </div>
  );
}

