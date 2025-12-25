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
  const [seed] = useState(() => Math.floor(Math.random() * 1000000));

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let width = (canvas.width = canvas.clientWidth = 800);
    let height = (canvas.height = canvas.clientHeight = 600);

    const player: Vec & { vx: number; vy: number; health: number; hitTimer: number } = {
      x: width / 2,
      y: height / 2,
      vx: 0,
      vy: 0,
      health: 100,
      hitTimer: 0,
    };
    const keys: Record<string, boolean> = {};

    // World / camera
    const world = { width: 4000, height: 2000 };
    const camera = { x: player.x - width / 2, y: player.y - height / 2 };

    // Entities
    type Fish = { pos: Vec; speed: number; size: number; color: string; dir: number };
    type Shark = { pos: Vec; vx: number; vy: number; speed: number; size: number; cooldown: number };
    type Jelly = { pos: Vec; size: number; phase: number };

    const fishes: Fish[] = [];
    const treasures: Vec[] = [];
    const sharks: Shark[] = [];
    const jellies: Jelly[] = [];

    function random(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Populate world
    for (let i = 0; i < 50; i++) {
      fishes.push({ pos: { x: random(0, world.width), y: random(100, world.height - 200) }, speed: random(0.2, 1.2), size: random(6, 20), color: `hsl(${Math.floor(random(180, 300))},70%,65%)`, dir: Math.random() < 0.5 ? -1 : 1 });
    }
    for (let i = 0; i < 12; i++) treasures.push({ x: random(100, world.width - 100), y: random(world.height - 300, world.height - 80) });

    // Add sharks and jellies
    for (let i = 0; i < 6; i++) {
      sharks.push({ pos: { x: random(200, world.width - 200), y: random(150, world.height - 300) }, vx: 0, vy: 0, speed: random(0.18, 0.5), size: random(26, 46), cooldown: 0 });
    }
    for (let i = 0; i < 12; i++) {
      jellies.push({ pos: { x: random(80, world.width - 80), y: random(120, world.height - 200) }, size: random(14, 26), phase: random(0, Math.PI * 2) });
    }

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
    let gameOver = false;

    function resetGame() {
      player.x = world.width / 2;
      player.y = world.height / 2;
      player.vx = 0;
      player.vy = 0;
      player.health = 100;
      player.hitTimer = 0;
      collected = 0;
      gameOver = false;
      treasures.length = 0;
      for (let i = 0; i < 12; i++) treasures.push({ x: random(100, world.width - 100), y: random(world.height - 300, world.height - 80) });
      sharks.length = 0;
      jellies.length = 0;
      for (let i = 0; i < 6; i++) {
        sharks.push({ pos: { x: random(200, world.width - 200), y: random(150, world.height - 300) }, vx: 0, vy: 0, speed: random(0.18, 0.5), size: random(26, 46), cooldown: 0 });
      }
      for (let i = 0; i < 12; i++) {
        jellies.push({ pos: { x: random(80, world.width - 80), y: random(120, world.height - 200) }, size: random(14, 26), phase: random(0, Math.PI * 2) });
      }
    }

    function update(dt: number) {
      if (gameOver) return;

      // Player acceleration from keys (submarine feel)
      const accel = 0.0016 * dt;
      if (keys['ArrowLeft'] || keys['a']) player.vx -= accel;
      if (keys['ArrowRight'] || keys['d']) player.vx += accel;
      if (keys['ArrowUp'] || keys['w']) player.vy -= accel;
      if (keys['ArrowDown'] || keys['s']) player.vy += accel;

      // water drag
      player.vx *= 0.993;
      player.vy *= 0.993;

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

      // Sharks behavior
      for (const s of sharks) {
        const toPlayer = { x: player.x - s.pos.x, y: player.y - s.pos.y };
        const dist = Math.sqrt(toPlayer.x * toPlayer.x + toPlayer.y * toPlayer.y);
        // detect and chase
        if (dist < 450) {
          const nx = toPlayer.x / (dist || 1);
          const ny = toPlayer.y / (dist || 1);
          s.vx += nx * s.speed * dt * 0.02;
          s.vy += ny * s.speed * dt * 0.02;
        } else {
          // lazy patrol
          s.vx += Math.sin((s.pos.y + performance.now() * 0.003) * 0.01) * 0.02;
          s.vy += Math.cos((s.pos.x + performance.now() * 0.002) * 0.01) * 0.02;
        }
        // limit speed
        s.vx *= 0.995;
        s.vy *= 0.995;
        s.pos.x += s.vx * dt * 0.03;
        s.pos.y += s.vy * dt * 0.03;
        if (s.pos.x < -60) s.pos.x = world.width + 60;
        if (s.pos.x > world.width + 60) s.pos.x = -60;
        s.pos.y = clamp(s.pos.y, 100, world.height - 150);

        // attack player on collision
        if (dist < s.size + 18) {
          if (s.cooldown <= 0) {
            player.health -= 20;
            player.hitTimer = 900;
            s.cooldown = 800;
          }
        }
        s.cooldown = Math.max(0, s.cooldown - dt);
      }

      // Jellyfish behavior
      for (const j of jellies) {
        j.phase += 0.003 * dt;
        j.pos.x += Math.sin(j.phase + seed) * 0.02;
        j.pos.y += Math.cos(j.phase) * 0.02;
        j.pos.y = clamp(j.pos.y, 80, world.height - 120);
        const dist = distance(j.pos, player);
        if (dist < j.size + 18) {
          if (player.hitTimer <= 0) {
            player.health -= 8;
            player.hitTimer = 700;
          }
        }
      }

      // Check treasure collection
      for (let i = treasures.length - 1; i >= 0; i--) {
        if (distance(treasures[i], player) < 36) {
          treasures.splice(i, 1);
          collected++;
        }
      }

      // hit timer
      if (player.hitTimer > 0) player.hitTimer = Math.max(0, player.hitTimer - dt);

      if (player.health <= 0) {
        gameOver = true;
        setRunning(false);
      }
    }

    function drawBackground() {
      // gradient water
      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, '#a2e7ff');
      g.addColorStop(0.5, '#69c0de');
      g.addColorStop(1, '#001a2e');
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

      // sharks
      for (const s of sharks) {
        const sx = s.pos.x - camera.x;
        const sy = s.pos.y - camera.y;
        if (sx < -100 || sx > width + 100 || sy < -100 || sy > height + 100) continue;
        ctx.save();
        ctx.translate(sx, sy);
        const ang = Math.atan2(s.vy || 0, s.vx || 1);
        ctx.rotate(ang);
        // body
        ctx.fillStyle = '#6b7b85';
        ctx.beginPath();
        ctx.ellipse(0, 0, s.size, s.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // fin
        ctx.fillStyle = '#4a5960';
        ctx.beginPath();
        ctx.moveTo(-s.size * 0.2, -s.size * 0.6);
        ctx.lineTo(0, -s.size * 0.2);
        ctx.lineTo(s.size * 0.2, -s.size * 0.6);
        ctx.fill();
        // eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.size * 0.35, -s.size * 0.12, Math.max(2, s.size * 0.08), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // jellies
      for (const j of jellies) {
        const sx = j.pos.x - camera.x;
        const sy = j.pos.y - camera.y;
        if (sx < -60 || sx > width + 60 || sy < -60 || sy > height + 60) continue;
        ctx.save();
        ctx.translate(sx, sy);
        // bell
        const alpha = 0.6 + Math.sin(j.phase) * 0.15;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#c4a7ff';
        ctx.beginPath();
        ctx.ellipse(0, 0, j.size, j.size * 0.8, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        // tentacles
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#d8bfff';
        for (let t = -2; t <= 2; t++) {
          ctx.beginPath();
          ctx.moveTo(t * 6, j.size * 0.4);
          ctx.quadraticCurveTo(t * 6 + Math.sin(j.phase + t) * 6, j.size * 0.4 + 18, t * 6 + Math.sin(j.phase + t * 2) * 12, j.size * 0.4 + 36);
          ctx.stroke();
        }
        ctx.restore();
      }

      // player submarine
      const px = player.x - camera.x;
      const py = player.y - camera.y;
      ctx.save();
      // bubbles trailing
      for (let i = 0; i < 6; i++) {
        ctx.globalAlpha = 0.06 + i * 0.06;
        ctx.beginPath();
        ctx.arc(px - player.vx * (i * 6 + 8), py - player.vy * (i * 6 + 8) + i * 6, 3 + i * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = '#e6f7ff';
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // hull
      ctx.fillStyle = '#ffb86b';
      ctx.beginPath();
      ctx.ellipse(px, py, 20, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      // conning tower
      ctx.fillStyle = '#ffdbb3';
      ctx.fillRect(px + 4, py - 16, 18, 12);
      // window
      ctx.fillStyle = '#cfefff';
      ctx.beginPath();
      ctx.arc(px - 6, py - 2, 5, 0, Math.PI * 2);
      ctx.fill();
      // propeller (simple)
      ctx.fillStyle = '#ffb86b';
      ctx.beginPath();
      ctx.arc(px + 22, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // damage flash overlay when hit
      if (player.hitTimer > 0) {
        ctx.save();
        const alpha = (player.hitTimer / 900) * 0.5;
        ctx.fillStyle = `rgba(255,30,30,${alpha})`;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    }

    function drawHUD() {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(10, 10, 260, 92);
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Ocean Explorer`, 18, 32);
      ctx.fillText(`Treasures: ${collected}/${12}`, 18, 52);
      ctx.fillText(`Depth: ${Math.floor(player.y)}m`, 18, 70);
      ctx.restore();

      // health bar
      ctx.save();
      const hx = 18;
      const hy = 74;
      const hw = 220;
      const hh = 10;
      ctx.fillStyle = '#222';
      ctx.fillRect(hx, hy, hw, hh);
      const pct = clamp(player.health / 100, 0, 1);
      ctx.fillStyle = pct > 0.6 ? '#61e786' : pct > 0.3 ? '#ffd86b' : '#ff6b6b';
      ctx.fillRect(hx, hy, hw * pct, hh);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(hx, hy, hw, hh);
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Hull: ${Math.max(0, Math.floor(player.health))}%`, hx + 6, hy + 9);
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

      // game over
      if (gameOver) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#ffdddd';
        ctx.font = '36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Hull Breached — Mission Failed', width / 2, height / 2 - 6);
        ctx.font = '16px sans-serif';
        ctx.fillText('Press Restart to try again', width / 2, height / 2 + 28);
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
  }, [running, seed]);

  return (
    <div style={{ width: '100%', maxWidth: 1000 }}>
      <h3>Underwater Odyssey — Ocean Explorer (Submarine)</h3>
      <p>Use WASD or arrow keys to pilot the sub. Avoid sharks and jellyfish — they can damage your hull. Press Space to pause. Collect all treasures!</p>
      <div style={{ border: '2px solid #053b5a', borderRadius: 8, overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 600, display: 'block', background: '#69c0de' }} />
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Resume'}</button>
        <button onClick={() => {
          // Trigger a reset by remounting logic via a small hack: toggle running then resume after a tick
          // Simpler: reload component by forcing a page refresh of canvas — but keep it local: we'll call location.reload which is simple.
          // To avoid reloading the whole page, we could implement a proper reset handler — but the effect scope holds reset inside useEffect. 
          // For now, reload to reset game state.
          location.reload();
        }}>Restart</button>
      </div>
    </div>
  );
}
