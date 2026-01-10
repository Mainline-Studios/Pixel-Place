import React, { useEffect, useRef, useState } from 'react';

type Vec = { x: number; y: number };

type Player = {
  id: string;
  name: string;
  pos: Vec;
  vel: Vec;
  color: string;
  radius: number;
  hp: number;
  maxHp: number;
  lastShot: number;
  score: number;
  isBot?: boolean;
  respawnTime?: number;
};

type Bullet = {
  id: string;
  pos: Vec;
  vel: Vec;
  ownerId: string;
  life: number;
};

const TAU = Math.PI * 2;

function rand(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

function dist(a: Vec, b: Vec) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

export default function SuperShowdown2D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number; y: number; down: boolean }>({ x: 0, y: 0, down: false });
  const keysRef = useRef<Record<string, boolean>>({});

  const [players, setPlayers] = useState<Player[]>(() => {
    const local: Player = {
      id: 'you',
      name: 'You',
      pos: { x: 400, y: 300 },
      vel: { x: 0, y: 0 },
      color: '#3b82f6',
      radius: 18,
      hp: 100,
      maxHp: 100,
      lastShot: 0,
      score: 0,
    };

    const bots: Player[] = [];
    for (let i = 0; i < 6; i++) {
      bots.push({
        id: 'bot_' + i,
        name: 'Bot' + (i + 1),
        pos: { x: rand(100, 700), y: rand(100, 500) },
        vel: { x: 0, y: 0 },
        color: `hsl(${Math.floor(rand(0, 360))} 70% 50%)`,
        radius: 18,
        hp: 100,
        maxHp: 100,
        lastShot: 0,
        score: 0,
        isBot: true,
      });
    }

    return [local, ...bots];
  });

  const bulletsRef = useRef<Bullet[]>([]);
  const playersRef = useRef<Player[]>(players);
  playersRef.current = players;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * devicePixelRatio;
      canvas.height = r.height * devicePixelRatio;
    }

    window.addEventListener('resize', resize);

    function onMove(e: MouseEvent) {
      const r = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - r.left) * (canvas.width / r.width);
      mouseRef.current.y = (e.clientY - r.top) * (canvas.height / r.height);
    }

    function onDown(e: MouseEvent) {
      mouseRef.current.down = true;
      onMove(e);
    }
    function onUp() {
      mouseRef.current.down = false;
    }

    function onKey(e: KeyboardEvent) {
      keysRef.current[e.key.toLowerCase()] = e.type === 'keydown';
    }

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);

    // Game state
    let time = 0;

    function spawnBullet(owner: Player, targetX: number, targetY: number) {
      const from = { x: owner.pos.x, y: owner.pos.y };
      const angle = Math.atan2(targetY - from.y, targetX - from.x);
      const speed = 600; // px/s
      const vel = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
      const b: Bullet = {
        id: Math.random().toString(36).slice(2),
        pos: { x: from.x + Math.cos(angle) * (owner.radius + 4), y: from.y + Math.sin(angle) * (owner.radius + 4) },
        vel,
        ownerId: owner.id,
        life: 1.5, // seconds
      };
      bulletsRef.current.push(b);
    }

    function update(dt: number) {
      time += dt;

      // Input -> player
      const local = playersRef.current.find((p) => p.id === 'you');
      if (local) {
        const speed = 220;
        let ax = 0;
        let ay = 0;
        if (keysRef.current['w'] || keysRef.current['arrowup']) ay -= 1;
        if (keysRef.current['s'] || keysRef.current['arrowdown']) ay += 1;
        if (keysRef.current['a'] || keysRef.current['arrowleft']) ax -= 1;
        if (keysRef.current['d'] || keysRef.current['arrowright']) ax += 1;
        const len = Math.hypot(ax, ay) || 1;
        local.vel.x = (ax / len) * speed;
        local.vel.y = (ay / len) * speed;

        if (mouseRef.current.down && time - local.lastShot > 0.18) {
          spawnBullet(local, mouseRef.current.x, mouseRef.current.y);
          local.lastShot = time;
        }
      }

      // Bots: simple AI
      for (const bot of playersRef.current.filter((p) => p.isBot)) {
        // wander and target nearest player
        const speed = 160;
        const target = playersRef.current.reduce((best, p) => {
          if (p.id === bot.id || p.hp <= 0) return best;
          if (!best) return p;
          return dist(bot.pos, p.pos) < dist(bot.pos, best.pos) ? p : best;
        }, null as Player | null);

        if (target) {
          const dx = target.pos.x - bot.pos.x;
          const dy = target.pos.y - bot.pos.y;
          const d = Math.hypot(dx, dy) || 1;
          bot.vel.x = (dx / d) * speed;
          bot.vel.y = (dy / d) * speed;

          if (Math.random() < 0.016 && time - bot.lastShot > 0.6) {
            spawnBullet(bot, target.pos.x, target.pos.y);
            bot.lastShot = time;
          }
        } else {
          bot.vel.x *= 0.98;
          bot.vel.y *= 0.98;
        }
      }

      // Update positions
      for (const p of playersRef.current) {
        if (p.hp <= 0) continue;
        p.pos.x += p.vel.x * dt;
        p.pos.y += p.vel.y * dt;

        // bounds
        p.pos.x = clamp(p.pos.x, p.radius + 8, canvas.width - (p.radius + 8));
        p.pos.y = clamp(p.pos.y, p.radius + 8, canvas.height - (p.radius + 8));
      }

      // Update bullets
      bulletsRef.current = bulletsRef.current.filter((b) => b.life > 0);
      for (const b of bulletsRef.current) {
        b.pos.x += b.vel.x * dt;
        b.pos.y += b.vel.y * dt;
        b.life -= dt;

        // check collisions with players
        for (const p of playersRef.current) {
          if (p.hp <= 0) continue;
          if (p.id === b.ownerId) continue;
          if (dist(b.pos, p.pos) < p.radius + 4) {
            p.hp -= 22;
            b.life = 0;
            const owner = playersRef.current.find((x) => x.id === b.ownerId);
            if (p.hp <= 0 && owner) {
              owner.score += 1;
              // respawn victim
              p.respawnTime = 2.0; // seconds
            }
            break;
          }
        }

        // remove if out of bounds
        if (b.pos.x < -50 || b.pos.y < -50 || b.pos.x > canvas.width + 50 || b.pos.y > canvas.height + 50) {
          b.life = 0;
        }
      }

      // Handle respawns
      for (const p of playersRef.current) {
        if (p.hp <= 0) {
          if (p.respawnTime == null) p.respawnTime = 3;
          p.respawnTime -= dt;
          if (p.respawnTime <= 0) {
            p.hp = p.maxHp;
            p.pos = { x: rand(100, canvas.width - 100), y: rand(100, canvas.height - 100) };
            p.respawnTime = undefined;
            p.vel = { x: 0, y: 0 };
          }
        }
      }

      // update state occasionally
      setPlayers((prev) => {
        // copy playersRef.current to trigger rerender
        return playersRef.current.map((p) => ({ ...p }));
      });
    }

    function draw() {
      const cw = canvas.width;
      const ch = canvas.height;
      // clear
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, cw, ch);

      // grid background
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      const grid = 48 * devicePixelRatio;
      for (let x = 0; x < cw; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ch);
        ctx.stroke();
      }
      for (let y = 0; y < ch; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cw, y);
        ctx.stroke();
      }

      // bullets
      for (const b of bulletsRef.current) {
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(b.pos.x, b.pos.y, 4, 0, TAU);
        ctx.fill();
      }

      // players
      for (const p of playersRef.current) {
        // dead shadow
        if (p.hp <= 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.06)';
          ctx.beginPath();
          ctx.arc(p.pos.x, p.pos.y, p.radius, 0, TAU);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.font = `${12 * devicePixelRatio}px Inter, Arial`;
          ctx.textAlign = 'center';
          ctx.fillText('Respawning...', p.pos.x, p.pos.y - 26);
          continue;
        }

        // body
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, p.radius, 0, TAU);
        ctx.fill();

        // face/eye direction
        const aimX = p.isBot ? p.pos.x + p.vel.x * 0.12 : mouseRef.current.x;
        const aimY = p.isBot ? p.pos.y + p.vel.y * 0.12 : mouseRef.current.y;
        const ang = Math.atan2(aimY - p.pos.y, aimX - p.pos.x);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.arc(p.pos.x + Math.cos(ang) * 6, p.pos.y + Math.sin(ang) * 6, 4, 0, TAU);
        ctx.fill();

        // hp bar
        const barW = p.radius * 2;
        const barH = 6 * devicePixelRatio;
        const tx = p.pos.x - p.radius;
        const ty = p.pos.y - p.radius - 12 * devicePixelRatio;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(tx - 1, ty - 1, barW + 2, barH + 2);
        ctx.fillStyle = '#ef4444';
        const hpPct = clamp(p.hp / p.maxHp, 0, 1);
        ctx.fillRect(tx, ty, barW * hpPct, barH);

        // name
        ctx.fillStyle = '#fff';
        ctx.font = `${11 * devicePixelRatio}px Inter, Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(p.name, p.pos.x, p.pos.y + p.radius + 14 * devicePixelRatio);
      }

      // HUD / scoreboard
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = `${16 * devicePixelRatio}px Inter, Arial`;
      ctx.textAlign = 'left';
      const sorted = [...playersRef.current].sort((a, b) => b.score - a.score);
      ctx.fillText('Scoreboard:', 12 * devicePixelRatio, 24 * devicePixelRatio);
      sorted.forEach((p, i) => {
        ctx.fillStyle = p.id === 'you' ? '#60a5fa' : 'rgba(255,255,255,0.9)';
        ctx.fillText(`${p.name}: ${p.score}`, 12 * devicePixelRatio, (40 + i * 18) * devicePixelRatio);
      });

      // instructions
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = `${12 * devicePixelRatio}px Inter, Arial`;
      ctx.textAlign = 'right';
      ctx.fillText('WASD to move • Click to shoot', cw - 12 * devicePixelRatio, 24 * devicePixelRatio);
    }

    function loop(ts: number) {
      if (!lastTimeRef.current) lastTimeRef.current = ts;
      const dt = Math.min((ts - lastTimeRef.current) / 1000, 1 / 15);
      lastTimeRef.current = ts;
      update(dt);
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, []);

  // Simple wrapper for full-size canvas container
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', background: '#0f172a' }}
      />
      <div style={{ position: 'absolute', left: 12, bottom: 12, color: '#fff', fontSize: 12 }}>
        <div>Super Showdown 2D — Brawl-Style Demo</div>
        <div style={{ opacity: 0.8, fontSize: 11 }}>Use WASD + mouse to play. Bots enabled.</div>
      </div>
    </div>
  );
}
