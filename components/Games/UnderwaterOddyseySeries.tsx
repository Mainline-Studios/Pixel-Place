import React, { useEffect, useRef, useState } from 'react';

type Vec = { x: number; y: number };

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function distance(a: Vec, b: Vec) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export default function UnderwaterOddyseySeries() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let width = (canvas.width = canvas.clientWidth = 800);
    let height = (canvas.height = canvas.clientHeight = 600);

    const player: Vec & { vx: number; vy: number } = { x: width / 2, y: height / 2, vx: 0, vy: 0 };
    const keys: Record<string, boolean> = {};

    // World / camera
    const world = { width: 4000, height: 2000 };
    const camera = { x: player.x - width / 2, y: player.y - height / 2 };

    // Entities
    type Fish = { pos: Vec; speed: number; size: number; color: string; dir: number };
    const fishes: Fish[] = [];
    const treasures: Vec[] = [];

    function random(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Populate world
    for (let i = 0; i < 50; i++) {
      fishes.push({ pos: { x: random(0, world.width), y: random(100, world.height - 200) }, speed: random(0.2, 1.2), size: random(6, 20), color: `hsl(${Math.floor(random(180, 300))},70%,65%)`, dir: Math.random() < 0.5 ? -1 : 1 });
    }
    for (let i = 0; i < 12; i++) treasures.push({ x: random(100, world.width - 100), y: random(world.height - 300, world.height - 80) });

    // Controls
    function onKey(e: KeyboardEvent) {
      const down = e.type === 'keydown';
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        keys[e.key] = down;
        e.preventDefault();
      }
      if (e.key === ' ') {
        // toggle pause
        if (down) setRunning((r) => !r);
      }
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);

    // Resize handler (kept simple)
    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = Math.floor(rect.width || 800);
      height = canvas.height = Math.floor(rect.height || 600);
    }
    resize();
    window.addEventListener('resize', resize);

    // Game state
    let collected = 0;

    function update(dt: number) {
      // Player acceleration from keys
      const accel = 0.0018 * dt;
      if (keys['ArrowLeft'] || keys['a']) player.vx -= accel;
      if (keys['ArrowRight'] || keys['d']) player.vx += accel;
      if (keys['ArrowUp'] || keys['w']) player.vy -= accel;
      if (keys['ArrowDown'] || keys['s']) player.vy += accel;

      // water drag
      player.vx *= 0.995;
      player.vy *= 0.995;

      // integrate
      player.x = clamp(player.x + player.vx * dt, 0, world.width);
      player.y = clamp(player.y + player.vy * dt, 0, world.height);

      // Camera follows player with smoothing
      const camTargetX = player.x - width / 2;
      const camTargetY = player.y - height / 2;
      camera.x += (camTargetX - camera.x) * 0.08;
      camera.y += (camTargetY - camera.y) * 0.08;
      camera.x = clamp(camera.x, 0, world.width - width);
      camera.y = clamp(camera.y, 0, world.height - height);

      // Move fish
      for (const f of fishes) {
        f.pos.x += f.speed * f.dir * dt * 0.03;
        // bobbing
        f.pos.y += Math.sin((performance.now() + f.pos.x) * 0.002) * 0.25;
        if (f.pos.x < -50) f.pos.x = world.width + 50;
        if (f.pos.x > world.width + 50) f.pos.x = -50;
      }

      // Check treasure collection
      for (let i = treasures.length - 1; i >= 0; i--) {
        if (distance(treasures[i], player) < 36) {
          treasures.splice(i, 1);
          collected++;
        }
      }
    }

    function drawBackground() {
      // gradient water
      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, '#a2e7ff');
      g.addColorStop(0.5, '#69c0de');
      g.addColorStop(1, '#0b3b66');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      // light rays
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const x = ((i / 6) * width + (performance.now() * 0.02) % 200) % width;
        ctx.moveTo(x - 200, 0);
        ctx.lineTo(x + 40, 0);
        ctx.lineTo(x + 200, height);
        ctx.lineTo(x - 400, height);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // distant seabed
      ctx.fillStyle = '#0d2b3a';
      ctx.fillRect(-camera.x * 0.5, world.height - 160 - camera.y * 0.1, world.width, 160);

      // foreground plants (parallax)
      ctx.save();
      ctx.translate(-camera.x * 0.9, 0);
      for (let x = -200; x < world.width; x += 120) {
        const baseY = world.height - 60;
        const sway = Math.sin((performance.now() + x) * 0.002) * 8;
        ctx.beginPath();
        ctx.moveTo(x, baseY - camera.y);
        ctx.quadraticCurveTo(x + 10 + sway, baseY - 120 - camera.y, x + 30, baseY - camera.y);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#0b6b61';
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawEntities() {
      // draw fishes
      for (const f of fishes) {
        const sx = f.pos.x - camera.x;
        const sy = f.pos.y - camera.y;
        if (sx < -50 || sx > width + 50 || sy < -50 || sy > height + 50) continue;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.scale(f.dir, 1);
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, f.size, f.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        // tail
        ctx.beginPath();
        ctx.moveTo(-f.size - 2, 0);
        ctx.lineTo(-f.size - 8, -f.size * 0.6);
        ctx.lineTo(-f.size - 8, f.size * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // treasures
      for (const t of treasures) {
        const sx = t.x - camera.x;
        const sy = t.y - camera.y;
        if (sx < -30 || sx > width + 30 || sy < -30 || sy > height + 30) continue;
        ctx.save();
        ctx.translate(sx, sy);
        // shell / chest style
        ctx.fillStyle = '#f9d976';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c47a00';
        ctx.fillRect(-8, 5, 16, 6);
        ctx.restore();
      }

      // player (diver)
      const px = player.x - camera.x;
      const py = player.y - camera.y;
      ctx.save();
      // bubbles trailing
      for (let i = 0; i < 6; i++) {
        ctx.globalAlpha = 0.1 + i * 0.12;
        ctx.beginPath();
        ctx.arc(px - player.vx * (i * 6 + 8), py - player.vy * (i * 6 + 8) + i * 4, 3 + i * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = '#e6f7ff';
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // diver body
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.ellipse(px, py, 12, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      // helmet
      ctx.fillStyle = '#dff0ff';
      ctx.beginPath();
      ctx.arc(px - 2, py - 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawHUD() {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(10, 10, 220, 74);
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Ocean Explorer`, 18, 32);
      ctx.fillText(`Treasures: ${collected}/${12}`, 18, 52);
      ctx.fillText(`Depth: ${Math.floor(player.y)}m`, 18, 70);
      ctx.restore();

      // mini map
      ctx.save();
      const mapW = 140;
      const mapH = 60;
      const mapX = width - mapW - 10;
      const mapY = 10;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(mapX, mapY, mapW, mapH);
      ctx.fillStyle = '#eaf6ff';
      ctx.fillRect(mapX + 4, mapY + 4, (player.x / world.width) * (mapW - 8), 8);
      ctx.fillStyle = '#ffef99';
      ctx.beginPath();
      const px = mapX + 4 + (player.x / world.width) * (mapW - 8);
      const py = mapY + mapH - 18;
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    let last = performance.now();

    function loop(now: number) {
      const dt = Math.min(40, now - last);
      last = now;
      if (running) update(dt);

      // clear
      ctx.clearRect(0, 0, width, height);

      drawBackground();
      drawEntities();
      drawHUD();

      // win message
      if (collected >= 12) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, height / 2 - 40, width, 80);
        ctx.fillStyle = '#fff';
        ctx.font = '36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Expedition Complete!', width / 2, height / 2 + 12);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      window.removeEventListener('resize', resize);
    };
  }, [running]);

  return (
    <div style={{ width: '100%', maxWidth: 900 }}>
      <h3>Underwater Odyssey — Ocean Explorer</h3>
      <p>Use WASD or arrow keys to swim. Press Space to pause. Collect all treasures!</p>
      <div style={{ border: '2px solid #053b5a', borderRadius: 8, overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 600, display: 'block', background: '#69c0de' }} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Resume'}</button>
      </div>
    </div>
  );
}
