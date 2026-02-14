'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Showdown — Premium Arena Brawler
 *
 * A stunning 2D arena combat game with:
 * - Neon cyberpunk aesthetic
 * - Particle effects & screen shake
 * - Fluid WASD + mouse aim combat
 * - 8 unique powers with distinct mechanics
 * - Pickups, walls, and bot opponents
 * - Store with pixelcoins & upgrades
 */

const TAU = Math.PI * 2;

function rand(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}
function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

type Power = 'fire' | 'ice' | 'lightning' | 'poison' | 'earth' | 'wind' | 'solar' | 'shadow';

const POWERS: Power[] = ['fire', 'ice', 'lightning', 'poison', 'earth', 'wind', 'solar', 'shadow'];

const POWER_COLORS: Record<Power, string> = {
  fire: '#ff6b35',
  ice: '#4cc9f0',
  lightning: '#fee440',
  poison: '#9b5de5',
  earth: '#00f5d4',
  wind: '#94d2bd',
  solar: '#f72585',
  shadow: '#7209b7',
};

const POWER_COSTS: Record<Power, number> = {
  fire: 0,
  ice: 25,
  lightning: 0,
  poison: 35,
  earth: 30,
  wind: 20,
  solar: 50,
  shadow: 45,
};

// Fire rate (ms between shots) — high damage powers shoot slower
const POWER_COOLDOWN: Record<Power, number> = {
  fire: 140,
  ice: 120,
  lightning: 180,
  poison: 110,
  earth: 220,
  wind: 80,
  solar: 150,
  shadow: 130,
};

const ARENA_W = 900;
const ARENA_H = 580;

const WALLS = [
  { x: 220, y: 100, w: 18, h: 200 },
  { x: 480, y: 60, w: 18, h: 180 },
  { x: 660, y: 280, w: 18, h: 220 },
  { x: 80, y: 360, w: 200, h: 18 },
  { x: 420, y: 420, w: 200, h: 18 },
];

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
  power: Power;
  score: number;
  lastShot: number;
  isBot?: boolean;
  lastDeadAt?: number;
};

type Bullet = {
  id: string;
  pos: Vec;
  vel: Vec;
  ownerId: string;
  power: Power;
  life: number;
  radius: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

type Pickup =
  | { id: string; type: 'pc'; amount: number; pos: Vec; createdAt: number }
  | { id: string; type: 'power'; power: Power; pos: Vec; createdAt: number };

function loadJSON<T>(k: string, fallback: T): T {
  try {
    const s = localStorage.getItem(k);
    if (!s) return fallback;
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}
function saveJSON(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}

function circleRectCollision(
  cx: number,
  cy: number,
  cr: number,
  r: { x: number; y: number; w: number; h: number }
) {
  const closestX = clamp(cx, r.x, r.x + r.w);
  const closestY = clamp(cy, r.y, r.y + r.h);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= cr * cr;
}

interface ShowdownProps {
  user?: unknown;
}

export default function Showdown({ user }: ShowdownProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: ARENA_W / 2, y: ARENA_H / 2, down: false });
  const keysRef = useRef<Record<string, boolean>>({});
  const screenShakeRef = useRef(0);

  const [pixelcoins, setPixelcoins] = useState(() => loadJSON('showdown_pixelcoins', 150));
  const [ownedPowers, setOwnedPowers] = useState<Record<Power, boolean>>(() => {
    const base = loadJSON<Record<string, boolean>>('showdown_ownedPowers', {});
    const out: Record<Power, boolean> = {} as Record<Power, boolean>;
    for (const p of POWERS) out[p] = Boolean(base[p]) || POWER_COSTS[p] === 0;
    return out;
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    const local: Player = {
      id: 'you',
      name: 'You',
      pos: { x: ARENA_W / 2 - 80, y: ARENA_H / 2 },
      vel: { x: 0, y: 0 },
      color: '#00d4ff',
      radius: 20,
      hp: 100,
      maxHp: 100,
      power: 'fire',
      score: 0,
      lastShot: 0,
    };
    const bots: Player[] = [];
    const botColors = ['#ff4757', '#ffa502', '#7bed9f', '#ff6b81', '#a29bfe'];
    for (let i = 0; i < 5; i++) {
      bots.push({
        id: `bot_${i}`,
        name: `Rival ${i + 1}`,
        pos: { x: rand(80, ARENA_W - 80), y: rand(80, ARENA_H - 80) },
        vel: { x: 0, y: 0 },
        color: botColors[i],
        radius: 18,
        hp: 100,
        maxHp: 100,
        power: POWERS[randInt(0, POWERS.length - 1)],
        score: 0,
        lastShot: 0,
        isBot: true,
      });
    }
    return [local, ...bots];
  });

  const playersRef = useRef(players);
  playersRef.current = players;
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const pickupsRef = useRef<Pickup[]>([]);

  useEffect(() => {
    saveJSON('showdown_pixelcoins', pixelcoins);
  }, [pixelcoins]);
  useEffect(() => {
    saveJSON('showdown_ownedPowers', ownedPowers);
  }, [ownedPowers]);

  function spawnParticles(x: number, y: number, color: string, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = rand(0, TAU);
      const speed = rand(40, 120);
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: rand(0.3, 0.8),
        color,
        size: rand(2, 5),
      });
    }
  }

  function addScreenShake(amount: number) {
    screenShakeRef.current = Math.min(screenShakeRef.current + amount, 15);
  }

  function spawnBullet(owner: Player, targetX: number, targetY: number) {
    const from = { x: owner.pos.x, y: owner.pos.y };
    const angle = Math.atan2(targetY - from.y, targetX - from.x);
    const speed = 520;
    const vel = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
    bulletsRef.current.push({
      id: Math.random().toString(36).slice(2),
      pos: {
        x: from.x + Math.cos(angle) * (owner.radius + 8),
        y: from.y + Math.sin(angle) * (owner.radius + 8),
      },
      vel,
      ownerId: owner.id,
      power: owner.power,
      life: 1.6,
      radius: 6,
    });
  }

  function applyDamage(id: string, amount: number, hitX: number, hitY: number) {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== id || p.hp <= 0) return p;
        const newHp = Math.max(0, Math.round(p.hp - amount));
        spawnParticles(hitX, hitY, p.color, 12);
        addScreenShake(amount * 0.15);
        return {
          ...p,
          hp: newHp,
          ...(newHp <= 0 && { lastDeadAt: Date.now() }),
        };
      })
    );
  }

  function heal(id: string, amount: number) {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, hp: Math.min(p.maxHp, p.hp + amount) } : p
      )
    );
  }

  function isOwned(pw: Power) {
    return Boolean(ownedPowers[pw]);
  }

  function buyPower(pw: Power) {
    if (isOwned(pw)) return true;
    const cost = POWER_COSTS[pw] ?? 0;
    if (cost <= 0) {
      setOwnedPowers((prev) => ({ ...prev, [pw]: true }));
      return true;
    }
    if (pixelcoins >= cost) {
      setPixelcoins((pc) => pc - cost);
      setOwnedPowers((prev) => ({ ...prev, [pw]: true }));
      return true;
    }
    return false;
  }

  function spawnPickup() {
    const now = Date.now();
    const type = rand() < 0.6 ? 'pc' : 'power';
    const pos = { x: rand(60, ARENA_W - 60), y: rand(60, ARENA_H - 60) };
    if (type === 'pc') {
      pickupsRef.current.push({
        id: `pc-${now}`,
        type: 'pc',
        amount: randInt(10, 40),
        pos,
        createdAt: now,
      });
    } else {
      pickupsRef.current.push({
        id: `pw-${now}`,
        type: 'power',
        power: POWERS[randInt(0, POWERS.length - 1)],
        pos,
        createdAt: now,
      });
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (pickupsRef.current.length < 4) spawnPickup();
      const now = Date.now();
      pickupsRef.current = pickupsRef.current.filter((pu) => now - pu.createdAt < 25000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(devicePixelRatio, 2);
    canvas.width = ARENA_W * dpr;
    canvas.height = ARENA_H * dpr;
    canvas.style.width = `${ARENA_W}px`;
    canvas.style.height = `${ARENA_H}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    function onMove(e: MouseEvent) {
      const r = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - r.left;
      mouseRef.current.y = e.clientY - r.top;
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
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);

    function update(dt: number) {
      const ps = playersRef.current;

      // Local player input
      setPlayers((prev) => {
        const copy = prev.map((p) => ({ ...p }));
        const local = copy.find((c) => c.id === 'you')!;
        if (!local) return prev;
        if (local.hp > 0) {
          const speed = 240;
          let ax = 0,
            ay = 0;
          if (keysRef.current['w'] || keysRef.current['arrowup']) ay -= 1;
          if (keysRef.current['s'] || keysRef.current['arrowdown']) ay += 1;
          if (keysRef.current['a'] || keysRef.current['arrowleft']) ax -= 1;
          if (keysRef.current['d'] || keysRef.current['arrowright']) ax += 1;
          const len = Math.hypot(ax, ay) || 1;
          local.vel.x = (ax / len) * speed;
          local.vel.y = (ay / len) * speed;
          local.pos.x += local.vel.x * dt;
          local.pos.y += local.vel.y * dt;

          for (const w of WALLS) {
            if (circleRectCollision(local.pos.x, local.pos.y, local.radius, w)) {
              local.pos.x -= local.vel.x * 0.1;
              local.pos.y -= local.vel.y * 0.1;
            }
          }
          local.pos.x = clamp(local.radius, local.pos.x, ARENA_W - local.radius);
          local.pos.y = clamp(local.radius, local.pos.y, ARENA_H - local.radius);
        }

        // Bot AI
        for (const b of copy.filter((x) => x.isBot)) {
          const target = copy.find((p) => p.id === 'you')!;
          const dx = target.pos.x - b.pos.x;
          const dy = target.pos.y - b.pos.y;
          const d = Math.hypot(dx, dy) || 1;
          const speed = 130;
          b.vel.x = (dx / d) * speed;
          b.vel.y = (dy / d) * speed;
          b.pos.x += b.vel.x * dt;
          b.pos.y += b.vel.y * dt;
          for (const w of WALLS) {
            if (circleRectCollision(b.pos.x, b.pos.y, b.radius, w)) {
              b.pos.x -= b.vel.x * 0.1;
              b.pos.y -= b.vel.y * 0.1;
            }
          }
          b.pos.x = clamp(b.radius, b.pos.x, ARENA_W - b.radius);
          b.pos.y = clamp(b.radius, b.pos.y, ARENA_H - b.radius);

          const cooldown = POWER_COOLDOWN[b.power] ?? 150;
          if (Math.random() < 0.015 && Date.now() - b.lastShot > cooldown) {
            spawnBullet(b, target.pos.x, target.pos.y);
            b.lastShot = Date.now();
          }
        }
        return copy;
      });

      // Bullets
      bulletsRef.current = bulletsRef.current.filter((b) => b.life > 0);
      for (const b of bulletsRef.current) {
        b.pos.x += b.vel.x * dt;
        b.pos.y += b.vel.y * dt;
        b.life -= dt;

        for (const w of WALLS) {
          if (circleRectCollision(b.pos.x, b.pos.y, b.radius, w)) {
            spawnParticles(b.pos.x, b.pos.y, POWER_COLORS[b.power], 6);
            b.life = 0;
            break;
          }
        }
        if (b.life <= 0) continue;

        for (const p of playersRef.current) {
          if (p.id === b.ownerId || p.hp <= 0) continue;
          if (dist(b.pos, p.pos) <= p.radius + b.radius) {
            // Each power has distinct damage — high-risk high-reward vs utility
            const POWER_DAMAGE: Record<Power, number> = {
              fire: 22,      // heavy hitter, slow-ish
              ice: 14,       // low dmg but could add slow later
              lightning: 26, // highest burst, glass cannon
              poison: 12,    // low initial, DoT potential
              earth: 28,     // hardest hit, slow projectile
              wind: 10,      // fastest fire rate, lowest dmg
              solar: 24,     // strong and steady
              shadow: 20,    // balanced, sneaky
            };
            applyDamage(p.id, POWER_DAMAGE[b.power] ?? 15, b.pos.x, b.pos.y);
            b.life = 0;
            break;
          }
        }

        if (
          b.pos.x < -50 ||
          b.pos.y < -50 ||
          b.pos.x > ARENA_W + 50 ||
          b.pos.y > ARENA_H + 50
        )
          b.life = 0;
      }

      // Particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        p.vx *= 0.96;
        p.vy *= 0.96;
        return p.life > 0;
      });

      // Pickups
      pickupsRef.current = pickupsRef.current.filter((pu) => {
        for (const p of playersRef.current) {
          if (dist(p.pos, pu.pos) <= p.radius + 14) {
            if (pu.type === 'pc') {
              setPixelcoins((pc) => pc + pu.amount);
              spawnParticles(pu.pos.x, pu.pos.y, '#ffd166', 6);
            } else {
              setOwnedPowers((op) => ({ ...op, [pu.power]: true }));
              spawnParticles(pu.pos.x, pu.pos.y, POWER_COLORS[pu.power], 6);
            }
            return false;
          }
        }
        return Date.now() - pu.createdAt < 25000;
      });

      screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 25);

      // Respawn dead players after delay (removed overwrite that was reverting damage!)
      const RESPAWN_DELAY = 3;
      const now = Date.now();
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.hp > 0) return { ...p, lastDeadAt: undefined };
          const lastDead = p.lastDeadAt ?? now;
          if (now - lastDead >= RESPAWN_DELAY * 1000) {
            return {
              ...p,
              hp: p.maxHp,
              pos: { x: rand(80, ARENA_W - 80), y: rand(80, ARENA_H - 80) },
              vel: { x: 0, y: 0 },
              lastDeadAt: undefined,
            };
          }
          return { ...p, lastDeadAt: lastDead };
        })
      );
    }

    function draw() {
      const shakeX = (Math.random() - 0.5) * screenShakeRef.current * 2;
      const shakeY = (Math.random() - 0.5) * screenShakeRef.current * 2;
      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Arena background — dark gradient with grid
      const bgGrad = ctx.createLinearGradient(0, 0, ARENA_W, ARENA_H);
      bgGrad.addColorStop(0, '#0a0e1a');
      bgGrad.addColorStop(0.5, '#0f1629');
      bgGrad.addColorStop(1, '#0a0e1a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, ARENA_W, ARENA_H);

      // Subtle grid
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < ARENA_W; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ARENA_H);
        ctx.stroke();
      }
      for (let y = 0; y < ARENA_H; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ARENA_W, y);
        ctx.stroke();
      }

      // Arena border glow
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, ARENA_W - 4, ARENA_H - 4);
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(4, 4, ARENA_W - 8, ARENA_H - 8);

      // Walls — sleek dark with neon edge
      for (const w of WALLS) {
        ctx.fillStyle = '#151b2d';
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.35)';
        ctx.lineWidth = 2;
        ctx.strokeRect(w.x, w.y, w.w, w.h);
      }

      // Pickups
      for (const pu of pickupsRef.current) {
        const pulse = 0.8 + Math.sin(Date.now() * 0.004) * 0.2;
        if (pu.type === 'pc') {
          ctx.beginPath();
          ctx.arc(pu.pos.x, pu.pos.y, 10 * pulse, 0, TAU);
          ctx.fillStyle = 'rgba(255, 209, 102, 0.9)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#0a0e1a';
          ctx.font = 'bold 10px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(`+${pu.amount}`, pu.pos.x, pu.pos.y + 4);
        } else {
          ctx.beginPath();
          ctx.arc(pu.pos.x, pu.pos.y, 12 * pulse, 0, TAU);
          ctx.fillStyle = POWER_COLORS[pu.power];
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.6)';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 11px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(pu.power[0].toUpperCase(), pu.pos.x, pu.pos.y + 4);
        }
      }

      // Particles
      for (const p of particlesRef.current) {
        const t = 1 - p.life / p.maxLife;
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - t * 0.5), 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Bullets — glowing orbs
      for (const b of bulletsRef.current) {
        const color = POWER_COLORS[b.power];
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(b.pos.x, b.pos.y, b.radius, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(b.pos.x, b.pos.y, b.radius * 0.5, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Players
      for (const p of playersRef.current) {
        if (p.hp <= 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.08)';
          ctx.beginPath();
          ctx.arc(p.pos.x, p.pos.y, p.radius, 0, TAU);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.font = '12px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('Respawning...', p.pos.x, p.pos.y - p.radius - 14);
          continue;
        }

        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, p.radius, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;

        const aim =
          p.isBot
            ? { x: p.pos.x + p.vel.x * 0.1, y: p.pos.y + p.vel.y * 0.1 }
            : mouseRef.current;
        const ang = Math.atan2(aim.y - p.pos.y, aim.x - p.pos.x);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.arc(
          p.pos.x + Math.cos(ang) * 8,
          p.pos.y + Math.sin(ang) * 8,
          5,
          0,
          TAU
        );
        ctx.fill();

        const barW = p.radius * 2.4;
        const bx = p.pos.x - barW / 2;
        const by = p.pos.y - p.radius - 16;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(bx - 2, by - 2, barW + 4, 10);
        const hpPct = clamp(p.hp / p.maxHp, 0, 1);
        const barColor = hpPct > 0.5 ? '#00f5d4' : hpPct > 0.25 ? '#fee440' : '#ff6b35';
        ctx.fillStyle = barColor;
        ctx.fillRect(bx, by, barW * hpPct, 6);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, barW, 6);

        ctx.fillStyle = '#fff';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, p.pos.x, p.pos.y + p.radius + 16);
      }

      ctx.restore();

      // HUD overlay (no shake)
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, ARENA_W, 32);
      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`💰 ${pixelcoins}`, 12, 22);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.textAlign = 'right';
      ctx.font = '12px system-ui';
      ctx.fillText(
        'WASD move • Mouse aim • Click shoot • Pick powers in store',
        ARENA_W - 12,
        22
      );
    }

    function loop(ts: number) {
      if (!lastRef.current) lastRef.current = ts;
      const dt = Math.min((ts - lastRef.current) / 1000, 1 / 20);
      lastRef.current = ts;
      update(dt);
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, []);

  function localPlayer() {
    return playersRef.current.find((p) => p.id === 'you')!;
  }

  function playerShoot() {
    const me = localPlayer();
    if (!me || me.hp <= 0) return;
    const now = Date.now();
    const cooldown = POWER_COOLDOWN[me.power] ?? 130;
    if (now - me.lastShot < cooldown) return;
    spawnBullet(me, mouseRef.current.x, mouseRef.current.y);
    setPlayers((prev) =>
      prev.map((p) => (p.id === me.id ? { ...p, lastShot: now } : p))
    );
  }

  const local = players.find((p) => p.id === 'you')!;

  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        minHeight: '100%',
        background: 'linear-gradient(180deg, #0a0e1a 0%, #0f1629 100%)',
        padding: 24,
      }}
    >
      <h2
        style={{
          margin: '0 0 16px 0',
          fontSize: 28,
          fontWeight: 800,
          background: 'linear-gradient(90deg, #00d4ff, #f72585)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
        }}
      >
        ⚔️ Showdown
      </h2>
      <p style={{ margin: '0 0 20px 0', color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
        Arena combat • Collect pixelcoins • Unlock powers • Dominate
      </p>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div
          style={{
            padding: 4,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(247,37,133,0.2))',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div
            style={{
              borderRadius: 10,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <canvas
              ref={canvasRef}
              onClick={playerShoot}
              style={{
                cursor: 'crosshair',
                display: 'block',
              }}
            />
          </div>
        </div>

        <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: 'rgba(15,22,41,0.9)',
              borderRadius: 12,
              padding: 16,
              border: '1px solid rgba(0,212,255,0.2)',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              {local?.name}
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>HP</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#00f5d4' }}>
                  {local?.hp}/{local?.maxHp}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Power</div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: POWER_COLORS[local?.power ?? 'fire'],
                    textTransform: 'capitalize',
                  }}
                >
                  {local?.power}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {POWERS.filter(isOwned).map((pw) => (
                <button
                  key={pw}
                  onClick={() =>
                    setPlayers((prev) =>
                      prev.map((p) =>
                        p.id === 'you' ? { ...p, power: pw } : p
                      )
                    )
                  }
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: `2px solid ${local?.power === pw ? POWER_COLORS[pw] : 'transparent'}`,
                    background: local?.power === pw ? `${POWER_COLORS[pw]}22` : 'rgba(255,255,255,0.08)',
                    color: POWER_COLORS[pw],
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {pw}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15,22,41,0.9)',
              borderRadius: 12,
              padding: 16,
              border: '1px solid rgba(247,37,133,0.2)',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
              🛒 Power Store
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
              {POWERS.map((pw) => {
                const owned = isOwned(pw);
                const cost = POWER_COSTS[pw];
                return (
                  <div
                    key={pw}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: owned ? 'rgba(0,245,212,0.08)' : 'rgba(255,255,255,0.04)',
                      borderRadius: 8,
                      border: `1px solid ${owned ? 'rgba(0,245,212,0.3)' : 'transparent'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          background: POWER_COLORS[pw],
                          boxShadow: `0 0 12px ${POWER_COLORS[pw]}`,
                        }}
                      />
                      <span style={{ color: '#fff', fontWeight: 600, textTransform: 'capitalize' }}>
                        {pw}
                      </span>
                      {owned && (
                        <span style={{ fontSize: 11, color: '#00f5d4' }}>✓</span>
                      )}
                    </div>
                    <button
                      onClick={() => buyPower(pw)}
                      disabled={owned || pixelcoins < cost}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: owned ? 'rgba(0,245,212,0.2)' : pixelcoins >= cost ? 'linear-gradient(135deg, #00d4ff, #0099cc)' : 'rgba(255,255,255,0.1)',
                        color: owned ? '#00f5d4' : '#fff',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: owned || pixelcoins < cost ? 'default' : 'pointer',
                        opacity: owned || pixelcoins >= cost ? 1 : 0.5,
                      }}
                    >
                      {owned ? 'Owned' : `${cost} 💰`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
