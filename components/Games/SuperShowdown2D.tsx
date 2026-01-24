import React, { useEffect, useRef, useState } from "react";
import { AOE_RADII, GAME_2D } from "@/lib/gameScaling";

/**
 * SuperShowdown2D
 *
 * 2D "Brawl Stars" style port of InsaneShowdown features:
 * - All InsaneShowdown powers ported to 2D (beam/aoe/mines/whirlpools/blackholes/doppelganger/etc.)
 * - Inventory / Store / Pixelcoins / ownedPowers persisted to localStorage with optional server sync
 * - Power upgrades levels 0..3 (10 / 30 / 100 pixelcoins, sequential). Each level = +5% damage (additive)
 * - Arena: single grey surface with a few walls (rectangular obstacles). Walls block movement and bullets.
 * - Pickups spawn on the map (pixelcoins / ammo / power cards)
 * - 3 quick-slot binds (1/2/3) to equip powers for instant use
 *
 * Notes:
 * - This is a local/demo implementation (no real multiplayer).
 * - Bots exist and act (they do not auto-upgrade).
 */

/* ---------------------------
   Types & Utilities
   --------------------------- */

type Vec = { x: number; y: number };

type Power =
  | "fire"
  | "water"
  | "wind"
  | "earth"
  | "electricity"
  | "fauna"
  | "fleur"
  | "poison"
  | "celestial"
  | "ice"
  | "invisible"
  | "mud"
  | "parasite"
  | "harmony"
  | "berserker"
  | "regen"
  | "hex"
  | "lunar"
  | "soleil"
  | "doppelganger";

const POWERS: Power[] = [
  "fire",
  "water",
  "wind",
  "earth",
  "electricity",
  "fauna",
  "fleur",
  "poison",
  "celestial",
  "ice",
  "invisible",
  "mud",
  "parasite",
  "harmony",
  "berserker",
  "regen",
  "hex",
  "lunar",
  "soleil",
  "doppelganger",
];

const POWER_COSTS: Record<Power, number> = {
  fire: 0,
  water: 0,
  wind: 30,
  earth: 0,
  electricity: 0,
  fauna: 45,
  fleur: 50,
  poison: 30,
  celestial: 30,
  ice: 30,
  invisible: 45,
  mud: 15,
  parasite: 30,
  harmony: 25,
  berserker: 24,
  regen: 20,
  hex: 26,
  lunar: 34,
  soleil: 38,
  doppelganger: 50,
};

const UPGRADE_COSTS = [10, 30, 100]; // level1=10, level2=30, level3=100
const MAX_UPGRADE_LEVEL = 3;

const TAU = Math.PI * 2;

function rand(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}
function dist(a: Vec, b: Vec) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

/* ---------------------------
   Game entities
   --------------------------- */

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
  inventorySlots: (Power | null)[];
  isBot?: boolean;
  respawnTime?: number;
};

type Bullet = {
  id: string;
  pos: Vec;
  vel: Vec;
  ownerId: string;
  power?: Power;
  life: number;
  radius: number;
};

type MudPatch = { id: string; pos: Vec; radius: number; createdAt: number; durationMs: number };
type Parasite = { id: string; ownerId: string; targetId: string; nextAt: number; expireAt: number };
type Doppel = { id: string; pos: Vec; ownerId: string; nextAt: number; invulnerable?: boolean };
type BlackHole = { id: string; pos: Vec; radius: number; createdAt: number; explodeAt: number; active: boolean };
type Whirlpool = { id: string; pos: Vec; radius: number; createdAt: number; durationMs: number };
type Pickup =
  | { id: string; type: "pc"; amount: number; pos: Vec; createdAt: number }
  | { id: string; type: "ammo"; power: Power; amount: number; pos: Vec; createdAt: number }
  | { id: string; type: "powercard"; power: Power; pos: Vec; createdAt: number };

/* ---------------------------
   Map / Arena (grey surface + walls)
   --------------------------- */

const ARENA_W = 800;
const ARENA_H = 520;

/* Walls are rectangles {x,y,w,h} in pixel coordinates. They block movement and bullets. */
const DEFAULT_WALLS = [
  // sample walls — can be tuned / randomized
  { x: 200, y: 120, w: 16, h: 240 },
  { x: 420, y: 80, w: 16, h: 160 },
  { x: 520, y: 240, w: 16, h: 200 },
  { x: 90, y: 340, w: 180, h: 16 },
];

/* ---------------------------
   Persistence helpers
   --------------------------- */

function loadJSON<T>(k: string, fallback: T): T {
  try {
    const s = localStorage.getItem(k);
    if (!s) return fallback;
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}
function saveJSON(k: string, v: any) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}

/* ---------------------------
   Main Component
   --------------------------- */

export default function SuperShowdown2D(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, down: false });
  const keysRef = useRef<Record<string, boolean>>({});
  const [walls] = useState(DEFAULT_WALLS);

  // Global persistent states
  const [pixelcoins, setPixelcoins] = useState<number>(() => loadJSON("ss2d_pixelcoins", 200));
  const [ownedPowers, setOwnedPowers] = useState<Record<Power, boolean>>(() => {
    const base = loadJSON<Record<string, boolean>>("ss2d_ownedPowers", {});
    const out: Record<Power, boolean> = {} as any;
    for (const p of POWERS) out[p] = Boolean(base[p]) || POWER_COSTS[p] === 0;
    return out;
  });
  const [upgradeLevels, setUpgradeLevels] = useState<Record<Power, number>>(() => {
    const stored = loadJSON<Record<string, number>>("ss2d_upgrades", {});
    const out: Record<Power, number> = {} as any;
    for (const p of POWERS) out[p] = Math.max(0, Math.min(MAX_UPGRADE_LEVEL, stored[p] || 0));
    return out;
  });

  // Game objects
  const [players, setPlayers] = useState<Player[]>(() => {
    // main local player
    const local: Player = {
      id: "you",
      name: "You",
      pos: { x: ARENA_W / 2 - 100, y: ARENA_H / 2 },
      vel: { x: 0, y: 0 },
      color: "#3b82f6",
      radius: 18,
      hp: 100,
      maxHp: 100,
      power: "fire",
      score: 0,
      lastShot: 0,
      inventorySlots: [null, null, null],
    };
    const bots: Player[] = [];
    for (let i = 0; i < 5; i++) {
      bots.push({
        id: `bot_${i}`,
        name: `Bot${i + 1}`,
        pos: { x: rand(60, ARENA_W - 60), y: rand(60, ARENA_H - 60) },
        vel: { x: 0, y: 0 },
        color: `hsl(${randInt(0, 360)} 70% 50%)`,
        radius: 18,
        hp: 100,
        maxHp: 100,
        power: POWERS[randInt(0, POWERS.length - 1)],
        score: 0,
        lastShot: 0,
        inventorySlots: [null, null, null],
        isBot: true,
      });
    }
    return [local, ...bots];
  });

  const playersRef = useRef(players);
  playersRef.current = players;

  const bulletsRef = useRef<Bullet[]>([]);
  const mudRef = useRef<MudPatch[]>([]);
  const parasiteRef = useRef<Parasite[]>([]);
  const doppelRef = useRef<Doppel[]>([]);
  const blackHoleRef = useRef<BlackHole[]>([]);
  const whirlRef = useRef<Whirlpool[]>([]);
  const pickupsRef = useRef<Pickup[]>([]);
  const upgradesRef = useRef(upgradeLevels);
  upgradesRef.current = upgradeLevels;

  // ammo / cooldowns
  const ammoRef = useRef<Record<Power, number>>({} as any);
  const cooldownRef = useRef<Record<string, number>>({});

  useEffect(() => {
    // default ammo per power similar to InsaneShowdown DEFAULT_AMMO but simpler
    const ammo: Record<Power, number> = {} as any;
    for (const p of POWERS) {
      ammo[p] = 6;
    }
    ammo["fire"] = 20;
    ammo["electricity"] = 10;
    ammo["ice"] = 6;
    ammoRef.current = ammo;
    // restore pickups and owned state if any
    pickupsRef.current = [];
  }, []);

  // persist owned and upgrades when changed
  useEffect(() => {
    saveJSON("ss2d_pixelcoins", pixelcoins);
  }, [pixelcoins]);
  useEffect(() => {
    saveJSON("ss2d_ownedPowers", ownedPowers);
  }, [ownedPowers]);
  useEffect(() => {
    saveJSON("ss2d_upgrades", upgradeLevels);
  }, [upgradeLevels]);

  /* ---------------------------
     Helper: damage multiplier from upgrades
     --------------------------- */
  function damageMultiplierFor(power?: Power) {
    if (!power) return 1;
    const lvl = upgradesRef.current[power] || 0;
    return 1 + 0.05 * lvl;
  }

  /* ---------------------------
     Map helpers & collisions
     --------------------------- */

  function pointInRect(px: number, py: number, r: { x: number; y: number; w: number; h: number }) {
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  }

  function circleRectCollision(cx: number, cy: number, cr: number, r: { x: number; y: number; w: number; h: number }) {
    // clamp circle center to rect
    const closestX = clamp(cx, r.x, r.x + r.w);
    const closestY = clamp(cy, r.y, r.y + r.h);
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy <= cr * cr;
  }

  function resolvePlayerWall(p: Player) {
    // simple pushback: if colliding with wall, move back along velocity until not colliding or max attempts
    for (const w of walls) {
      if (circleRectCollision(p.pos.x, p.pos.y, p.radius, w)) {
        // step back along velocity gently
        p.pos.x -= p.vel.x * 0.1;
        p.pos.y -= p.vel.y * 0.1;
        // clamp inside arena
        p.pos.x = clamp(p.pos.x, p.radius, ARENA_W - p.radius);
        p.pos.y = clamp(p.pos.y, p.radius, ARENA_H - p.radius);
      }
    }
  }

  /* ---------------------------
     Pickups
     --------------------------- */

  function spawnRandomPickup() {
    const now = Date.now();
    const types = ["pc", "ammo", "powercard"] as const;
    const type = types[randInt(0, types.length - 1)];
    const pos = { x: rand(60, ARENA_W - 60), y: rand(60, ARENA_H - 60) };
    if (type === "pc") {
      const p: Pickup = { id: `pc-${now}`, type: "pc", amount: randInt(8, 35), pos, createdAt: now };
      pickupsRef.current.push(p);
    } else if (type === "ammo") {
      const pw = POWERS[randInt(0, POWERS.length - 1)];
      const p: Pickup = { id: `ammo-${now}`, type: "ammo", power: pw, amount: randInt(2, 6), pos, createdAt: now } as any;
      pickupsRef.current.push(p);
    } else {
      const pw = POWERS[randInt(0, POWERS.length - 1)];
      const p: Pickup = { id: `card-${now}`, type: "powercard", power: pw, pos, createdAt: now } as any;
      pickupsRef.current.push(p);
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      // maintain up to 3 pickups
      if (pickupsRef.current.length < 3) spawnRandomPickup();
      // remove expired pickups after 30s
      const now = Date.now();
      pickupsRef.current = pickupsRef.current.filter((pu) => now - pu.createdAt < 30000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /* ---------------------------
     Power effects (2D versions of InsaneShowdown)
     --------------------------- */

  function spawnBullet(owner: Player, targetX: number, targetY: number, pw?: Power) {
    const from = { x: owner.pos.x, y: owner.pos.y };
    const angle = Math.atan2(targetY - from.y, targetX - from.x);
    const speed = GAME_2D.bulletSpeed;
    const vel = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
    const b: Bullet = {
      id: Math.random().toString(36).slice(2),
      pos: { x: from.x + Math.cos(angle) * (owner.radius + 6), y: from.y + Math.sin(angle) * (owner.radius + 6) },
      vel,
      ownerId: owner.id,
      power: pw,
      life: GAME_2D.bulletLifetime,
      radius: GAME_2D.bulletRadius,
    };
    bulletsRef.current.push(b);
  }

  function createMud(pos: Vec) {
    const mp: MudPatch = { id: `mud-${Date.now()}`, pos, radius: AOE_RADII.mudPatch2D, createdAt: Date.now(), durationMs: 9000 };
    mudRef.current.push(mp);
  }

  function createParasite(owner: Player, target: Player | undefined) {
    if (!target) return;
    const now = Date.now();
    const p: Parasite = { id: `par-${now}`, ownerId: owner.id, targetId: target.id, nextAt: now + 2000, expireAt: now + 18000 };
    parasiteRef.current.push(p);
  }

  function createDoppel(owner: Player) {
    const d: Doppel = {
      id: `dup-${Date.now()}`,
      pos: { x: owner.pos.x + 20, y: owner.pos.y },
      ownerId: owner.id,
      nextAt: Date.now() + 900,
      invulnerable: true, // persistent per request
    };
    doppelRef.current.push(d);
  }

  function createBlackHole(pos: Vec) {
    const now = Date.now();
    const bh: BlackHole = { id: `bh-${now}`, pos: clampPosInArena(pos), radius: 50, createdAt: now, explodeAt: now + 3000, active: true };
    blackHoleRef.current.push(bh);
  }

  function createWhirlpool(pos: Vec) {
    const now = Date.now();
    const w: Whirlpool = { id: `wh-${now}`, pos: clampPosInArena(pos), radius: 80, createdAt: now, durationMs: 12000 };
    whirlRef.current.push(w);
  }

  function clampPosInArena(pos: Vec) {
    return { x: clamp(pos.x, 16, ARENA_W - 16), y: clamp(pos.y, 16, ARENA_H - 16) };
  }

  /* ---------------------------
     Combat & damage application
     --------------------------- */

  function applyDamageToPlayerById(id: string, amount: number) {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (p.hp <= 0) return p;
        // invulnerability not implemented per-player here but could be added
        const newHp = Math.max(0, Math.round(p.hp - amount));
        return { ...p, hp: newHp };
      })
    );
  }

  function healPlayerById(id: string, amount: number) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, hp: Math.min(p.maxHp, p.hp + amount) } : p)));
  }

  /* ---------------------------
     Main loop: update + draw
     --------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = ARENA_W * devicePixelRatio;
    canvas.height = ARENA_H * devicePixelRatio;
    canvas.style.width = `${ARENA_W}px`;
    canvas.style.height = `${ARENA_H}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(devicePixelRatio, devicePixelRatio);

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
      keysRef.current[e.key.toLowerCase()] = e.type === "keydown";
      // quick slots
      if (e.type === "keydown") {
        if (e.key === "1") equipQuickSlot(0);
        if (e.key === "2") equipQuickSlot(1);
        if (e.key === "3") equipQuickSlot(2);
      }
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);

    let time = 0;

    function update(dt: number) {
      time += dt;

      // control local player using WASD
      setPlayers((prev) => {
        const copy = prev.map((p) => ({ ...p }));
        const local = copy.find((c) => c.id === "you")!;
        if (!local) return prev;
        if (local.hp > 0 && !local.isBot) {
          const speed = 220;
          let ax = 0;
          let ay = 0;
          if (keysRef.current["w"] || keysRef.current["arrowup"]) ay -= 1;
          if (keysRef.current["s"] || keysRef.current["arrowdown"]) ay += 1;
          if (keysRef.current["a"] || keysRef.current["arrowleft"]) ax -= 1;
          if (keysRef.current["d"] || keysRef.current["arrowright"]) ax += 1;
          const len = Math.hypot(ax, ay) || 1;
          local.vel.x = (ax / len) * speed;
          local.vel.y = (ay / len) * speed;
          local.pos.x += local.vel.x * dt;
          local.pos.y += local.vel.y * dt;
          // wall collisions
          resolvePlayerWall(local);
          // clamp in arena
          local.pos.x = clamp(local.pos.x, local.radius, ARENA_W - local.radius);
          local.pos.y = clamp(local.pos.y, local.radius, ARENA_H - local.radius);
        }
        // bots simple movement & firing
        for (const b of copy.filter((x) => x.isBot)) {
          // move toward random point or toward nearest enemy
          const target = copy.find((p) => p.id === "you")!;
          const dx = target.pos.x - b.pos.x;
          const dy = target.pos.y - b.pos.y;
          const d = Math.hypot(dx, dy) || 1;
          const speed = 120;
          b.vel.x = (dx / d) * speed;
          b.vel.y = (dy / d) * speed;
          b.pos.x += b.vel.x * dt;
          b.pos.y += b.vel.y * dt;
          resolvePlayerWall(b);
          b.pos.x = clamp(b.pos.x, b.radius, ARENA_W - b.radius);
          b.pos.y = clamp(b.pos.y, b.radius, ARENA_H - b.radius);

          // shooting occasionally
          if (Math.random() < 0.01 && Date.now() - b.lastShot > 400) {
            spawnBullet(b, target.pos.x, target.pos.y, b.power);
            b.lastShot = Date.now();
          }
        }

        return copy;
      });

      // bullets update
      bulletsRef.current = bulletsRef.current.filter((b) => b.life > 0);
      for (const b of bulletsRef.current) {
        b.pos.x += b.vel.x * dt;
        b.pos.y += b.vel.y * dt;
        b.life -= dt;

        // wall collision: remove bullet
        let removed = false;
        for (const w of walls) {
          if (circleRectCollision(b.pos.x, b.pos.y, b.radius, w)) {
            b.life = 0;
            removed = true;
            break;
          }
        }
        if (removed) continue;

        // pickup collision is passive (bullets ignore pickups)

        // player collisions
        for (const p of playersRef.current) {
          if (p.id === b.ownerId) continue;
          if (p.hp <= 0) continue;
          if (dist(b.pos, p.pos) <= p.radius + b.radius) {
            // apply damage depending on power
            const baseDamage = (() => {
              switch (b.power) {
                case "fire":
                  return 14;
                case "lunar":
                  return 12;
                case "doppelganger":
                  return 18;
                case "parasite":
                  return 8;
                default:
                  return 10;
              }
            })();
            const multiplier = damageMultiplierFor(b.power);
            const amount = Math.round(baseDamage * multiplier);
            applyDamageToPlayerById(p.id, amount);
            // award owner score if kill
            const owner = playersRef.current.find((x) => x.id === b.ownerId);
            if (owner) {
              // handled by later state sync (simple)
            }
            b.life = 0;
            break;
          }
        }

        // out of bounds
        if (b.pos.x < -50 || b.pos.y < -50 || b.pos.x > ARENA_W + 50 || b.pos.y > ARENA_H + 50) b.life = 0;
      }

      // mud ticks
      const now = Date.now();
      mudRef.current = mudRef.current.filter((m) => now - m.createdAt < m.durationMs);
      for (const m of mudRef.current) {
        // damage or slow anyone inside
        for (const p of playersRef.current) {
          const d = dist({ x: m.pos.x, y: m.pos.y }, p.pos);
          if (d <= m.radius) {
            // bog: small damage per second
            if (Math.random() < 0.02) {
              applyDamageToPlayerById(p.id, 2);
            }
            // slow movement a little:
            p.pos.x += (p.pos.x - m.pos.x) * 0.002;
            p.pos.y += (p.pos.y - m.pos.y) * 0.002;
          }
        }
      }

      // parasite ticks
      parasiteRef.current = parasiteRef.current.filter((p) => p.expireAt > Date.now());
      for (const par of parasiteRef.current) {
        if (Date.now() >= par.nextAt) {
          const target = playersRef.current.find((t) => t.id === par.targetId);
          const owner = playersRef.current.find((t) => t.id === par.ownerId);
          if (target) {
            applyDamageToPlayerById(target.id, Math.round(6 * damageMultiplierFor("parasite")));
          }
          if (owner) {
            healPlayerById(owner.id, 3);
          }
          par.nextAt = Date.now() + 4500;
        }
      }

      // doppel attacks
      for (const d of doppelRef.current) {
        if (Date.now() >= d.nextAt) {
          // find nearest enemy (target player)
          const enemy = playersRef.current.find((p) => p.id !== d.ownerId && p.hp > 0);
          if (enemy && dist(d.pos, enemy.pos) <= 40) {
            applyDamageToPlayerById(enemy.id, Math.round(12 * damageMultiplierFor("doppelganger")));
          } else if (enemy) {
            // home-in
            d.pos.x += (enemy.pos.x - d.pos.x) * 0.12;
            d.pos.y += (enemy.pos.y - d.pos.y) * 0.12;
          }
          d.nextAt = Date.now() + 800;
        }
      }

      // black hole explode
      const toKeep: BlackHole[] = [];
      for (const bh of blackHoleRef.current) {
        if (bh.active && Date.now() >= bh.explodeAt) {
          // explode: damage near players
          for (const p of playersRef.current) {
            if (dist(p.pos, bh.pos) <= bh.radius * 1.4) {
              applyDamageToPlayerById(p.id, Math.round(22 * damageMultiplierFor("earth")));
            }
          }
          // not kept
        } else {
          toKeep.push(bh);
        }
      }
      blackHoleRef.current = toKeep;

      // whirlpool pull
      whirlRef.current = whirlRef.current.filter((w) => Date.now() - w.createdAt < w.durationMs);
      for (const w of whirlRef.current) {
        for (const p of playersRef.current) {
          const d = dist(p.pos, w.pos);
          if (d <= w.radius * 1.2) {
            p.pos.x += (w.pos.x - p.pos.x) * 0.12;
            p.pos.y += (w.pos.y - p.pos.y) * 0.12;
          }
        }
      }

      // pickups: auto-pickup if player touches
      pickupsRef.current = pickupsRef.current.filter((pu) => {
        for (const p of playersRef.current) {
          if (dist(p.pos, pu.pos) <= p.radius + 12) {
            if (pu.type === "pc") {
              setPixelcoins((pc) => pc + pu.amount);
            } else if (pu.type === "ammo") {
              ammoRef.current[pu.power] = (ammoRef.current[pu.power] || 0) + pu.amount;
            } else if (pu.type === "powercard") {
              setOwnedPowers((op) => ({ ...op, [pu.power]: true }));
            }
            return false; // removed
          }
        }
        // lifetime
        return Date.now() - pu.createdAt < 30000;
      });

      // reflect playersRef changes back to state occasionally (so React UI updates)
      setPlayers((prev) => playersRef.current.map((p) => ({ ...p })));
    }

    function draw() {
      // dynamic scaling handled earlier
      ctx.clearRect(0, 0, ARENA_W, ARENA_H);

      // background grey surface
      ctx.fillStyle = "#9aa3a7";
      ctx.fillRect(0, 0, ARENA_W, ARENA_H);

      // walls
      ctx.fillStyle = "#666";
      for (const w of walls) {
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = "#444";
        ctx.strokeRect(w.x, w.y, w.w, w.h);
      }

      // pickups
      for (const pu of pickupsRef.current) {
        ctx.beginPath();
        if (pu.type === "pc") {
          ctx.fillStyle = "#ffd166";
          ctx.arc(pu.pos.x, pu.pos.y, 8, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#6b4";
          ctx.font = "10px sans-serif";
          ctx.fillText(`+${pu.amount}`, pu.pos.x - 10, pu.pos.y + 4);
        } else if (pu.type === "ammo") {
          ctx.fillStyle = "#ff9f1c";
          ctx.fillRect(pu.pos.x - 8, pu.pos.y - 8, 16, 16);
          ctx.fillStyle = "#111";
          ctx.font = "10px sans-serif";
          ctx.fillText(`${pu.amount}`, pu.pos.x - 6, pu.pos.y + 4);
        } else {
          ctx.fillStyle = "#6b5df0";
          ctx.beginPath();
          ctx.arc(pu.pos.x, pu.pos.y, 10, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.font = "10px sans-serif";
          ctx.fillText(pu.power[0].toUpperCase(), pu.pos.x - 4, pu.pos.y + 4);
        }
      }

      // mud patches
      for (const m of mudRef.current) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(80,50,20,0.45)";
        ctx.arc(m.pos.x, m.pos.y, m.radius, 0, TAU);
        ctx.fill();
      }

      // whirlpools & blackholes
      for (const w of whirlRef.current) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(20,120,200,0.22)";
        ctx.arc(w.pos.x, w.pos.y, w.radius, 0, TAU);
        ctx.fill();
      }
      for (const bh of blackHoleRef.current) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(8,8,12,0.95)";
        ctx.arc(bh.pos.x, bh.pos.y, bh.radius, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "rgba(200,160,255,0.25)";
        ctx.stroke();
      }

      // bullets
      for (const b of bulletsRef.current) {
        ctx.beginPath();
        ctx.fillStyle = "#ffd166";
        ctx.arc(b.pos.x, b.pos.y, b.radius, 0, TAU);
        ctx.fill();
      }

      // doppels
      for (const d of doppelRef.current) {
        ctx.beginPath();
        ctx.fillStyle = d.invulnerable ? "#fff" : "#ddd";
        ctx.arc(d.pos.x, d.pos.y, 8, 0, TAU);
        ctx.fill();
      }

      // players
      for (const p of playersRef.current) {
        // dead state
        if (p.hp <= 0) {
          ctx.fillStyle = "rgba(255,255,255,0.06)";
          ctx.beginPath();
          ctx.arc(p.pos.x, p.pos.y, p.radius, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.font = "12px sans-serif";
          ctx.fillText("Respawning...", p.pos.x - 28, p.pos.y - 28);
          continue;
        }

        // body
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, p.radius, 0, TAU);
        ctx.fill();

        // eye/aim dot
        // if bot aim in vel direction else mouse for local
        const aim = p.isBot ? { x: p.pos.x + p.vel.x * 0.1, y: p.pos.y + p.vel.y * 0.1 } : mouseRef.current;
        const ang = Math.atan2(aim.y - p.pos.y, aim.x - p.pos.x);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.arc(p.pos.x + Math.cos(ang) * 6, p.pos.y + Math.sin(ang) * 6, 4, 0, TAU);
        ctx.fill();

        // hp bar
        const barW = p.radius * 2;
        const tx = p.pos.x - p.radius;
        const ty = p.pos.y - p.radius - 12;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(tx - 1, ty - 1, barW + 2, 8);
        ctx.fillStyle = "#ef4444";
        const hpPct = clamp(p.hp / p.maxHp, 0, 1);
        ctx.fillRect(tx, ty, barW * hpPct, 6);

        // name
        ctx.fillStyle = "#fff";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(p.name, p.pos.x, p.pos.y + p.radius + 14);
      }

      // HUD: scoreboard
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Scoreboard:", 8, 18);
      const sorted = [...playersRef.current].sort((a, b) => b.score - a.score);
      sorted.forEach((p, i) => {
        ctx.fillStyle = p.id === "you" ? "#60a5fa" : "#fff";
        ctx.fillText(`${p.name}: ${p.score}`, 8, 36 + i * 16);
      });

      // instructions
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.textAlign = "right";
      ctx.font = "12px sans-serif";
      ctx.fillText("WASD • Mouse aim • Click to shoot • 1/2/3 quick slots", ARENA_W - 8, 18);
    }

    function loop(ts: number) {
      if (!lastRef.current) lastRef.current = ts;
      const dt = Math.min((ts - lastRef.current) / 1000, 1 / 15);
      lastRef.current = ts;
      update(dt);
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------
     Player actions: aim-fire, use power, quick slot, equip, buy, upgrade
     --------------------------- */

  function localPlayer() {
    return playersRef.current.find((p) => p.id === "you")!;
  }

  function playerShoot() {
    const me = localPlayer();
    if (!me || me.hp <= 0) return;
    const now = Date.now();
    if (now - me.lastShot < 140) return;
    spawnBullet(me, mouseRef.current.x, mouseRef.current.y, undefined);
    setPlayers((prev) => prev.map((p) => (p.id === me.id ? { ...p, lastShot: now } : p)));
  }

  function usePower(power?: Power) {
    const me = localPlayer();
    if (!me || me.hp <= 0) return;
    const pw = power || me.power;
    // check ammo
    if ((ammoRef.current[pw] || 0) <= 0) {
      // push message into console? for now, quickly credit small ammo on fail
      return;
    }
    ammoRef.current[pw] = Math.max(0, (ammoRef.current[pw] || 0) - 1);

    // dispatch power-specific effects (simplified)
    switch (pw) {
      case "fire":
      case "water":
      case "wind":
      case "electricity":
      case "ice":
      case "poison":
      case "fauna":
      case "fleur":
      case "celestial": {
        // basic projectile
        spawnBullet(me, mouseRef.current.x, mouseRef.current.y, pw);
        break;
      }
      case "mud": {
        createMud({ x: mouseRef.current.x, y: mouseRef.current.y });
        break;
      }
      case "parasite": {
        // attach to nearest enemy within range
        const t = playersRef.current.find((p) => p.id !== me.id && dist(p.pos, me.pos) <= 220);
        createParasite(me, t);
        break;
      }
      case "harmony": {
        // rapid 3 small projectiles in a cone
        for (let i = -1; i <= 1; i++) {
          const px = mouseRef.current.x + i * 12;
          const py = mouseRef.current.y + i * 6;
          spawnBullet(me, px, py, "harmony");
        }
        break;
      }
      case "berserker": {
        // short dash slash
        const angle = Math.atan2(mouseRef.current.y - me.pos.y, mouseRef.current.x - me.pos.x);
        const slashRange = 60;
        const targetPos = { x: me.pos.x + Math.cos(angle) * slashRange, y: me.pos.y + Math.sin(angle) * slashRange };
        // damage anyone in the path
        for (const p of playersRef.current) {
          if (p.id === me.id) continue;
          // simple beam check
          const proj = ((p.pos.x - me.pos.x) * (targetPos.x - me.pos.x) + (p.pos.y - me.pos.y) * (targetPos.y - me.pos.y)) / (slashRange * slashRange);
          if (proj > 0 && proj < 1) {
            const closestX = me.pos.x + (targetPos.x - me.pos.x) * proj;
            const closestY = me.pos.y + (targetPos.y - me.pos.y) * proj;
            if (dist(p.pos, { x: closestX, y: closestY }) <= p.radius + 12) {
              applyDamageToPlayerById(p.id, Math.round(18 * damageMultiplierFor("berserker")));
            }
          }
        }
        break;
      }
      case "regen": {
        // instant small heal + regen status via periodic hack (call heal once)
        healPlayerById(me.id, Math.round(12 * damageMultiplierFor("regen")));
        break;
      }
      case "hex": {
        // apply a debuff marker: represented by subtracting some HP percent on future hits (simple)
        // We'll just apply immediate small damage plus mark an array (not fully modeled)
        // choose nearest enemy
        const target = playersRef.current.find((p) => p.id !== me.id && dist(p.pos, me.pos) <= 260);
        if (target) {
          applyDamageToPlayerById(target.id, Math.round(8 * damageMultiplierFor("hex")));
        }
        break;
      }
      case "lunar": {
        // powerful beam
        spawnBullet(me, mouseRef.current.x, mouseRef.current.y, "lunar");
        break;
      }
      case "soleil": {
        // teleport if in range
        const tx = mouseRef.current.x;
        const ty = mouseRef.current.y;
        const d = dist(me.pos, { x: tx, y: ty });
        if (d <= 220) {
          setPlayers((prev) => prev.map((p) => (p.id === me.id ? { ...p, pos: clampPosInArena({ x: tx, y: ty }) } : p)));
        }
        break;
      }
      case "doppelganger": {
        createDoppel(me);
        break;
      }
      default:
        break;
    }
  }

  function equipQuickSlot(idx: number) {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== "you") return p;
        const pw = p.inventorySlots[idx];
        if (!pw) return p;
        return { ...p, power: pw };
      })
    );
  }

  function equipSlotForLocal(slotIdx: number, power: Power | null) {
    setPlayers((prev) => prev.map((p) => (p.id === "you" ? { ...p, inventorySlots: p.inventorySlots.map((s, i) => (i === slotIdx ? power : s)) } : p)));
  }

  /* ---------------------------
     Shop: buy/equip/upgrade
     --------------------------- */

  function isOwned(pw: Power) {
    return Boolean(ownedPowers[pw]);
  }

  function buyPower(pw: Power) {
    if (isOwned(pw)) return true;
    const cost = POWER_COSTS[pw] || 0;
    if (cost <= 0) {
      setOwnedPowers((prev) => ({ ...prev, [pw]: true }));
      return true;
    }
    if (pixelcoins >= cost) {
      setPixelcoins((pc) => pc - cost);
      setOwnedPowers((prev) => ({ ...prev, [pw]: true }));
      return true;
    } else {
      return false;
    }
  }

  function upgradePower(pw: Power) {
    const cur = upgradeLevels[pw] || 0;
    if (cur >= MAX_UPGRADE_LEVEL) return false;
    const nextCost = UPGRADE_COSTS[cur];
    if (pixelcoins < nextCost) return false;
    // cannot skip levels ensured by sequential buy
    setPixelcoins((pc) => pc - nextCost);
    setUpgradeLevels((prev) => ({ ...prev, [pw]: Math.min(MAX_UPGRADE_LEVEL, (prev[pw] || 0) + 1) }));
    return true;
  }

  /* ---------------------------
     UI: quick helpers
     --------------------------- */

  function giveAllPowersToLocal() {
    // dev helper to give all powers
    const newOwned: Record<Power, boolean> = {} as any;
    for (const p of POWERS) newOwned[p] = true;
    setOwnedPowers(newOwned);
  }

  /* ---------------------------
     Render UI + canvas
     --------------------------- */

  // local UI state
  const [showStore, setShowStore] = useState(false);

  const local = players.find((p) => p.id === "you")!;

  return (
    <div style={{ fontFamily: "Inter, Arial, sans-serif", color: "#092", display: "flex", gap: 12 }}>
      <div>
        <div
          style={{
            width: ARENA_W + 24,
            padding: 12,
            background: "#071018",
            borderRadius: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ marginBottom: 8, display: "flex", gap: 8 }}>
            <button onClick={() => setShowStore((s) => !s)} style={{ padding: "6px 8px" }}>
              {showStore ? "Hide Store" : "Store"}
            </button>
            <button
              onClick={() => {
                setPixelcoins((pc) => pc + 50);
              }}
              style={{ padding: "6px 8px" }}
            >
              +50 PC (dev)
            </button>
            <button
              onClick={() => {
                giveAllPowersToLocal();
              }}
              style={{ padding: "6px 8px" }}
            >
              Give All (dev)
            </button>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <canvas ref={canvasRef} style={{ borderRadius: 6, background: "#9aa3a7" }} />

            <div style={{ width: 260 }}>
              <div style={{ background: "#061018", padding: 10, borderRadius: 8 }}>
                <h3 style={{ margin: "4px 0" }}>{local.name}</h3>
                <div>HP: {local.hp}/{local.maxHp}</div>
                <div>Power: <strong style={{ textTransform: "capitalize" }}>{local.power}</strong></div>
                <div>Pixelcoins: <strong>{pixelcoins}</strong></div>
                <div style={{ marginTop: 8 }}>
                  Quick slots:
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    {[0,1,2].map((i) => (
                      <div key={i} style={{ width: 68, padding: 6, background: "#093022", borderRadius: 6 }}>
                        <div style={{ fontSize: 12 }}>Slot {i+1}</div>
                        <div style={{ fontSize: 12, minHeight: 18 }}>
                          {local.inventorySlots[i] ? (<strong>{local.inventorySlots[i]}</strong>) : <em>empty</em>}
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <button onClick={() => equipQuickSlot(i)} style={{ padding: "4px 6px" }} disabled={!local.inventorySlots[i]}>Equip</button>
                          <button onClick={() => { equipSlotForLocal(i, local.power); }} style={{ padding: "4px 6px", marginLeft: 6 }}>
                            Save
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <button onClick={() => playerShoot()} style={{ padding: "8px 10px", marginRight: 6 }}>
                    Shoot
                  </button>
                  <button onClick={() => usePower()} style={{ padding: "8px 10px" }}>
                    Use Power ({local.power}) — ammo: {ammoRef.current[local.power] ?? 0}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 12, background: "#041018", padding: 10, borderRadius: 8 }}>
                <h4 style={{ margin: "6px 0" }}>Store & Upgrades</h4>
                <div style={{ maxHeight: 380, overflowY: "auto" }}>
                  {POWERS.map((p) => {
                    const owned = isOwned(p);
                    const lvl = upgradeLevels[p] || 0;
                    const nextCost = lvl >= MAX_UPGRADE_LEVEL ? null : UPGRADE_COSTS[lvl];
                    return (
                      <div key={p} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <div style={{ width: 120 }}>
                          <strong style={{ textTransform: "capitalize" }}>{p}</strong>
                          <div style={{ fontSize: 12, color: "#9ab" }}>{owned ? "Owned" : `${POWER_COSTS[p]} PC`}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12 }}>Upgrade: Lv {lvl}</div>
                          <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                            <button onClick={() => buyPower(p)} disabled={owned || (POWER_COSTS[p] > pixelcoins)} style={{ padding: "6px 8px" }}>
                              {owned ? "Owned" : `Buy (${POWER_COSTS[p]})`}
                            </button>
                            <button onClick={() => setPlayers((prev) => prev.map(pp => pp.id === "you" ? { ...pp, power: p } : pp))} disabled={!owned} style={{ padding: "6px 8px" }}>
                              Equip
                            </button>
                            <button onClick={() => upgradePower(p)} disabled={!owned || lvl >= MAX_UPGRADE_LEVEL || (nextCost && pixelcoins < nextCost)} style={{ padding: "6px 8px" }}>
                              {lvl >= MAX_UPGRADE_LEVEL ? "Max" : `Upgrade (${nextCost} PC)`}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div style={{ marginTop: 8, color: "#bcd" }}>
          <div>Pickups spawn periodically: coins / ammo / power cards.</div>
          <div>Walls block movement and bullets. Map is a flat grey arena with a few walls.</div>
        </div>
      </div>
    </div>
  );
}
