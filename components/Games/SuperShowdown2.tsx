import React, { useEffect, useRef, useState } from "react";

/**
 * SuperShowdown2 — updated powers with stronger Regen and visual indicators
 *
 * - Regen: stronger healing (starts after 5s, gives 8 ticks of 2 HP per 500ms = ~16 HP total).
 * - Lunar Midnight: visual moon + sky darkening overlay while Midnight is active (callable every 80s, lasts 10s).
 * - Soleil teleport indicator: sun emblem rendered at the chosen aimTarget (shows if player.power === 'soleil').
 *
 * This variant now also includes a simple in-game Store and persistent owned-powers/pixelcoins
 * (from the SuperShowdown file) so players can purchase powers and persist them locally or
 * attempt to sync to /api/supershowdown/player when available.
 */

// Map config
const MAP_SIZE = 100; // studs (square)
const CANVAS_SIZE_PX = 700; // visual size (px)
const STUD_TO_PX = CANVAS_SIZE_PX / MAP_SIZE; // scale studs -> px

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const distance = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.y - b.y);

type Vec2 = { x: number; y: number };

type Statuses = {
  burn?: number; // ticks (500ms)
  poison?: number; // ticks
  regen?: number; // ticks
  stunned?: number; // ticks
  invisible?: number; // ticks
  slow?: number; // ticks
  atkBuffTurns?: number;
  defBuffTurns?: number;
  invincible?: number; // ticks (500ms ticks)
  hexStacks?: number;
  hexLastAt?: number; // timestamp ms when last hex applied
};

type Fighter = {
  id: string;
  name: string;
  pos: Vec2;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  power: Power;
  specialReady: boolean;
  statuses: Statuses;
  atkBuff: number;
  defBuff: number;
};

type MudPatch = {
  id: string;
  pos: Vec2;
  radius: number;
  createdAt: number;
  durationMs: number;
};

type ParasiteEntity = {
  id: string;
  ownerId: string;
  targetEnemyId: string;
  nextAttackAt: number;
  expireAt: number;
};

type Doppel = {
  id: string;
  pos: Vec2;
  hp: number;
  createdAt: number;
  durationMs: number;
  nextAttackAt: number;
  invulnerable?: boolean;
};

type Power =
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

// Small store cost map so players can buy powers and persist ownership. Free for common basics.
const POWER_COSTS: Record<Power, number> = {
  mud: 0,
  parasite: 30,
  harmony: 0,
  berserker: 45,
  regen: 30,
  hex: 30,
  lunar: 45,
  soleil: 50,
  doppelganger: 60,
};

const DEFAULT_AMMO: Record<string, number> = {
  mud: 6,
  parasite: 5,
  harmony: 3,
  berserker: 4,
  regen: 3,
  hex: 4,
  lunar: 4,
  soleil: 5,
  doppelganger: 2,
};

export default function SuperShowdown2(): JSX.Element {
  // Setup & start state
  const [chooseDeathPower, setChooseDeathPower] = useState(false);
  const [deathPower, setDeathPower] = useState<Power>("mud");
  const [startConfirmed, setStartConfirmed] = useState(false);
  const [autoRespawn, setAutoRespawn] = useState(true);

  // --- Store / persistence ---
  const [pixelcoins, setPixelcoins] = useState<number>(120);
  const [ownedPowers, setOwnedPowers] = useState<Record<Power, boolean>>(() => {
    const initial: Record<Power, boolean> = {
      mud: true,
      parasite: false,
      harmony: true,
      berserker: false,
      regen: false,
      hex: false,
      lunar: false,
      soleil: false,
      doppelganger: false,
    };
    return initial;
  });
  const [serverAvailable, setServerAvailable] = useState(false);

  // Try to load saved data from server (if API endpoint exists). Graceful fallback to localStorage.
  useEffect(() => {
    let mounted = true;
    async function tryServerLoad() {
      if (typeof window === "undefined") return;
      try {
        const res = await fetch("/api/supershowdown/player", { method: "GET", credentials: "same-origin" });
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          // expected shape: { pixelcoins: number, ownedPowers: Record<string, boolean> }
          if (json && typeof json.pixelcoins === "number" && typeof json.ownedPowers === "object") {
            setPixelcoins(json.pixelcoins);
            const merged: Record<Power, boolean> = { ...ownedPowers };
            for (const p of POWERS) {
              if (typeof json.ownedPowers[p] === "boolean") merged[p] = json.ownedPowers[p];
            }
            setOwnedPowers(merged);
            setServerAvailable(true);
            return;
          }
        }
      } catch (e) {
        // ignore errors — fallback below
      }

      // Server failed or returned unexpected data -> attempt to load localStorage
      try {
        const saved = localStorage.getItem("supershowdown2_ownedPowers");
        if (saved) {
          const parsed = JSON.parse(saved) as Record<string, boolean>;
          const merged: Record<Power, boolean> = { ...ownedPowers };
          for (const p of POWERS) {
            if (typeof parsed[p] === "boolean") merged[p] = parsed[p];
          }
          setOwnedPowers(merged);
        }
        const pc = localStorage.getItem("supershowdown2_pixelcoins");
        if (pc) {
          const v = parseInt(pc, 10);
          if (!Number.isNaN(v)) setPixelcoins(v);
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    tryServerLoad();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist locally when ownedPowers or pixelcoins changes AND if server is not available.
  useEffect(() => {
    if (serverAvailable) {
      // If server is available, also POST updates there (best-effort).
      (async () => {
        try {
          await fetch("/api/supershowdown/player", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ pixelcoins, ownedPowers }),
          });
        } catch (e) {
          // ignore
        }
      })();
    } else {
      try {
        localStorage.setItem("supershowdown2_ownedPowers", JSON.stringify(ownedPowers));
        localStorage.setItem("supershowdown2_pixelcoins", String(pixelcoins));
      } catch (e) {
        // ignore
      }
    }
  }, [ownedPowers, pixelcoins, serverAvailable]);

  const playerStart: Vec2 = { x: MAP_SIZE * 0.25, y: MAP_SIZE / 2 };
  const enemyStart: Vec2 = { x: MAP_SIZE * 0.75, y: MAP_SIZE / 2 };

  const [player, setPlayer] = useState<Fighter>(() => ({
    id: "player-1",
    name: "You",
    pos: playerStart,
    hp: 90,
    maxHp: 90,
    attack: 18,
    defense: 6,
    power: "mud",
    specialReady: true,
    statuses: {},
    atkBuff: 0,
    defBuff: 0,
  }));

  const [enemy, setEnemy] = useState<Fighter>(() => ({
    id: "enemy-1",
    name: "Champion",
    pos: enemyStart,
    hp: 100,
    maxHp: 100,
    attack: 16,
    defense: 5,
    power: POWERS[randInt(0, POWERS.length - 1)],
    specialReady: true,
    statuses: {},
    atkBuff: 0,
    defBuff: 0,
  }));

  const [turnLog, setTurnLog] = useState<string[]>(() => [
    "A challenger prepares to enter the 3D arena...",
  ]);
  const pushLog = (s: string) => setTurnLog((l) => [s, ...l].slice(0, 120));

  const [waiting, setWaiting] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Aiming
  const [aimTarget, setAimTarget] = useState<Vec2>({ x: playerStart.x + 10, y: playerStart.y });
  const [isAiming, setIsAiming] = useState(false);

  // Entities
  const [mudPatches, setMudPatches] = useState<MudPatch[]>([]);
  const [parasites, setParasites] = useState<ParasiteEntity[]>([]);
  const [doppels, setDoppels] = useState<Doppel[]>([]);

  // Ammo & cooldowns
  const ammoRef = useRef<Record<string, number>>({});
  const cooldownsRef = useRef<Record<string, number>>({});
  const lunarStateRef = useRef({ lastMidnightAt: 0, midnightActiveUntil: 0 });
  const soleilStateRef = useRef({ lastTeleportAt: 0 });
  const swapRef = useRef({ nextSwapAt: 0 });

  const [lunarActive, setLunarActive] = useState(false);
  const [timeNow, setTimeNow] = useState(Date.now()); // for UI countdown updates

  useEffect(() => {
    ammoRef.current = { ...DEFAULT_AMMO };
    ammoRef.current["berserker"] = DEFAULT_AMMO.berserker ?? 4;
  }, []);

  useEffect(() => {
    const tid = setInterval(() => setTimeNow(Date.now()), 1000);
    return () => clearInterval(tid);
  }, []);

  // Canvas & drawing
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    drawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, enemy, aimTarget, mudPatches, parasites, doppels, startConfirmed, lunarActive, timeNow]);

  function toPx(v: Vec2) {
    return { x: v.x * STUD_TO_PX, y: v.y * STUD_TO_PX };
  }
  function clampPos(pos: Vec2) {
    return { x: Math.max(0, Math.min(MAP_SIZE, pos.x)), y: Math.max(0, Math.min(MAP_SIZE, pos.y)) };
  }

  function isInBeam(source: Vec2, dir: Vec2, width: number, range: number, targetPos: Vec2) {
    const toT = { x: targetPos.x - source.x, y: targetPos.y - source.y };
    const proj = toT.x * dir.x + toT.y * dir.y;
    if (proj < 0 || proj > range) return false;
    const perpSq = toT.x * toT.x + toT.y * toT.y - proj * proj;
    const perp = Math.sqrt(Math.max(0, perpSq));
    return perp <= width / 2;
  }
  function inCircle(center: Vec2, radius: number, targetPos: Vec2) {
    return distance(center, targetPos) <= radius;
  }

  // Harmony/heavy state refs
  const harmonyRef = useRef({ magRemaining: 4, lastShotAt: 0, consecutiveHits: 0, lastHitAt: 0, reloadUntil: 0 });
  const hexStateRef = useRef({ hitsSinceReload: 0, reloadUntil: 0 });
  const lunarRef = useRef({ magRemaining: 2, reloadUntil: 0 });
  const regenRef = useRef({ reloadUntil: 0 });

  // Main tick loop
  useEffect(() => {
    const TICK_MS = 500;
    const interval = setInterval(() => {
      const ts = Date.now();

      // Player statuses
      setPlayer((p) => {
        let changed = false;
        const np = { ...p };
        const s = { ...(np.statuses || {}) };

        if (s.burn && s.burn > 0) {
          const dmg = randInt(1, 2);
          np.hp = Math.max(0, np.hp - dmg);
          pushLog(`${np.name} suffers ${dmg} burn damage.`);
          s.burn!--;
          changed = true;
        }

        if (s.poison && s.poison > 0) {
          const dmg = 1;
          np.hp = Math.max(0, np.hp - dmg);
          pushLog(`${np.name} takes ${dmg} poison damage.`);
          s.poison!--;
          changed = true;
        }

        // Stronger regen for player: heal 2 HP per 500ms tick
        if (s.regen && s.regen > 0) {
          const heal = 2;
          np.hp = Math.min(np.maxHp, np.hp + heal);
          pushLog(`${np.name} regenerates ${heal} HP.`);
          s.regen!--;
          changed = true;
        }

        if (s.invincible && s.invincible > 0) {
          s.invincible!--;
          changed = true;
        }

        np.statuses = s;
        if (np.hp <= 0) checkGameOver(np, enemy);
        return changed ? np : p;
      });

      // Enemy statuses
      setEnemy((e) => {
        let changed = false;
        const ne = { ...e };
        const s = { ...(ne.statuses || {}) };

        if (s.burn && s.burn > 0) {
          const dmg = randInt(1, 2);
          ne.hp = Math.max(0, ne.hp - dmg);
          pushLog(`${ne.name} suffers ${dmg} burn damage.`);
          s.burn!--;
          changed = true;
        }
        if (s.poison && s.poison > 0) {
          const dmg = 1;
          ne.hp = Math.max(0, ne.hp - dmg);
          pushLog(`${ne.name} takes ${dmg} poison damage.`);
          s.poison!--;
          changed = true;
        }
        if (s.regen && s.regen > 0) {
          const heal = 1;
          ne.hp = Math.min(ne.maxHp, ne.hp + heal);
          pushLog(`${ne.name} regenerates ${heal} HP.`);
          s.regen!--;
          changed = true;
        }

        // Hex expiry
        if (s.hexLastAt && s.hexStacks && ts - s.hexLastAt > 6000) {
          s.hexStacks = 0;
          delete s.hexLastAt;
          pushLog(`${ne.name} has the hex effects fade away.`);
          changed = true;
        }

        ne.statuses = s;
        if (ne.hp <= 0) checkGameOver(player, ne);
        return changed ? ne : e;
      });

      // Mud patches: enemy takes 3 per tick (approx 6 DPS)
      setMudPatches((mps) => {
        const alive = mps.filter((mp) => ts < mp.createdAt + mp.durationMs);
        alive.forEach((mp) => {
          const tickDmg = 3;
          if (inCircle(mp.pos, mp.radius, enemy.pos)) {
            setEnemy((e) => {
              const ne = { ...e, hp: Math.max(0, e.hp - tickDmg), statuses: { ...(e.statuses || {}), poison: Math.max(0, (e.statuses?.poison || 0) + 12) } };
              pushLog(`${ne.name} is bogged by mud and takes ${tickDmg} damage.`);
              return ne;
            });
          }
        });
        return alive;
      });

      // Parasites
      setParasites((ps) => {
        const alive = ps.filter((p) => p.expireAt > ts);
        alive.forEach((p) => {
          if (ts >= p.nextAttackAt) {
            setEnemy((e) => {
              const ne = { ...e, hp: Math.max(0, e.hp - 6) };
              pushLog(`${ne.name} is drained by a parasite for 6 damage.`);
              return ne;
            });
            setPlayer((pl) => {
              const healed = Math.min(pl.maxHp, pl.hp + 3);
              pushLog(`The parasite restores 3 HP to ${pl.name}.`);
              return { ...pl, hp: healed };
            });
            p.nextAttackAt = ts + 4500;
          }
        });
        return alive;
      });

      // Doppel attacks
      setDoppels((ds) => {
        const alive = ds.filter((d) => d.invulnerable || d.createdAt + d.durationMs > ts);
        alive.forEach((d) => {
          if (ts >= d.nextAttackAt) {
            if (distance(d.pos, enemy.pos) <= 2) {
              setEnemy((e) => ({ ...e, hp: Math.max(0, e.hp - 15) }));
              pushLog("A doppelganger slices the enemy for 15 damage.");
            } else {
              d.pos = clampPos({ x: d.pos.x + (enemy.pos.x - d.pos.x) * 0.12, y: d.pos.y + (enemy.pos.y - d.pos.y) * 0.12 });
            }
            d.nextAttackAt = ts + 1000;
          }
        });
        return alive;
      });

      // Soleil sun damage (if player is Soleil)
      if (player.power === "soleil") {
        const sunRadius = 4;
        if (inCircle(player.pos, sunRadius, enemy.pos)) {
          const sunTick = 10;
          setEnemy((e) => {
            const ne = { ...e, hp: Math.max(0, e.hp - sunTick) };
            pushLog(`${ne.name} scorched by Soleil's sun for ${sunTick} damage.`);
            return ne;
          });
        }
      }

      // Handle automatic end of midnight (ensure lunarActive state is cleared if ref expired)
      if (lunarActive && Date.now() >= lunarStateRef.current.midnightActiveUntil) {
        setLunarActive(false);
      }
    }, 500);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, enemy]);

  // Drawing canvas — now renders with simple 3D perspective projection (ground-plane) so the arena looks 3D
  function toScenePx(v: Vec2) {
    return { xPx: (v.x / MAP_SIZE) * CANVAS_SIZE_PX, zPx: (v.y / MAP_SIZE) * CANVAS_SIZE_PX };
  }

  function drawCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // simple sky
    ctx.fillStyle = lunarActive ? "#031026" : "#0b1020";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ground grid (faint), with slight perspective shading
    for (let i = 0; i <= MAP_SIZE; i += 5) {
      const px = (i / MAP_SIZE) * canvas.width;
      ctx.strokeStyle = lunarActive ? "rgba(20,30,60,0.12)" : "rgba(15,26,43,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, canvas.height);
      ctx.stroke();
    }

    // draw mud patches with perspective (scale down with z)
    mudPatches.forEach((mp) => {
      const s = toScenePx(mp.pos);
      const depth = 0.6 + (s.zPx / CANVAS_SIZE_PX) * 0.6;
      const size = mp.radius * STUD_TO_PX * (0.8 + depth * 0.6);
      ctx.beginPath();
      ctx.fillStyle = "rgba(80,50,20,0.6)";
      ctx.ellipse(s.xPx, s.zPx + depth * 6, size, size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(110,80,40,0.8)";
      ctx.stroke();
    });

    // parasites marker near enemy
    parasites.forEach(() => {
      const e = toScenePx(enemy.pos);
      ctx.fillStyle = "#9a3b9a";
      ctx.beginPath();
      ctx.arc(e.xPx + 14, e.zPx - 12, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // doppels
    doppels.forEach((d) => {
      const p = toScenePx(d.pos);
      const size = 12;
      ctx.fillStyle = d.invulnerable ? "rgba(240,240,240,0.95)" : "rgba(200,200,200,0.8)";
      ctx.beginPath();
      ctx.ellipse(p.xPx, p.zPx + 6, size, size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // soleil indicator
    if (player.power === "soleil") {
      const pp = toScenePx(player.pos);
      ctx.beginPath();
      ctx.fillStyle = "rgba(255,180,64,0.12)";
      ctx.arc(pp.xPx, pp.zPx, 4 * STUD_TO_PX, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,200,90,0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // enemy (with depth-based shadow)
    const ePx = toScenePx(enemy.pos);
    const eDepth = 0.6 + (ePx.zPx / CANVAS_SIZE_PX) * 0.4;
    ctx.fillStyle = "#d25a5a";
    ctx.beginPath();
    ctx.ellipse(ePx.xPx, ePx.zPx - 6 - eDepth * 4, 12, 18 * (1 - eDepth * 0.08), 0, 0, Math.PI * 2);
    ctx.fill();
    // name
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.fillText(`${enemy.name} (${enemy.hp})`, ePx.xPx - 28, ePx.zPx - 26 - eDepth * 4);

    // player
    const pPx = toScenePx(player.pos);
    const pDepth = 0.6 + (pPx.zPx / CANVAS_SIZE_PX) * 0.4;
    ctx.fillStyle = "#4f8fd2";
    ctx.beginPath();
    ctx.ellipse(pPx.xPx, pPx.zPx - 6 - pDepth * 4, 12, 18 * (1 - pDepth * 0.08), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.fillText(`${player.name} (${player.hp})`, pPx.xPx - 22, pPx.zPx - 26 - pDepth * 4);

    // aim line projected to ground-plane
    ctx.strokeStyle = "rgba(220,220,60,0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pPx.xPx, pPx.zPx);
    const aimPx = toScenePx(aimTarget);
    ctx.lineTo(aimPx.xPx, aimPx.zPx);
    ctx.stroke();
  }

  // Click/aim mapping
  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / STUD_TO_PX;
    const y = (e.clientY - rect.top) / STUD_TO_PX;
    setAimTarget(clampPos({ x, y }));
  }
  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!canvasRef.current) return;
    if (!isAiming) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / STUD_TO_PX;
    const y = (e.clientY - rect.top) / STUD_TO_PX;
    setAimTarget(clampPos({ x, y }));
  }

  // Movement -> mud footsteps
  useEffect(() => {
    let last = player.pos;
    const id = setInterval(() => {
      if (player.power === "mud") {
        if (distance(last, player.pos) >= 0.4) {
          const patch: MudPatch = { id: `mud-${Date.now()}`, pos: { ...player.pos }, radius: 2.4, createdAt: Date.now(), durationMs: 8000 };
          setMudPatches((m) => [...m, patch]);
        }
      }
      last = player.pos;
    }, 200);
    return () => clearInterval(id);
  }, [player.power, player.pos]);

  // Damage / heal helpers
  function applyDamageToFighter(f: Fighter, amount: number) {
    if (f.statuses?.invincible && f.statuses.invincible > 0) return f;
    return { ...f, hp: Math.max(0, Math.round(f.hp - amount)) };
  }
  function healFighter(f: Fighter, amount: number) {
    return { ...f, hp: Math.min(f.maxHp, Math.round(f.hp + amount)) };
  }

  // Player punch
  function playerPunch() {
    if (waiting || gameOver || !startConfirmed) return;
    const range = 1;
    if (distance(player.pos, enemy.pos) <= range) {
      setEnemy((e) => applyDamageToFighter(e, 10));
      pushLog("You punch the enemy for 10 damage.");
    } else {
      pushLog("You swing at the air — out of range for fists.");
    }
    setTimeout(() => {
      if (!checkGameOver(player, enemy)) enemyAIAction();
    }, 300);
  }

  // Berserker attack
  function berserkerAttack() {
    if (!canUseCooldown("berserk")) {
      pushLog("Berserker attack reloading...");
      return;
    }
    const hpNow = player.hp;
    let dmg = 10;
    let reloadMs = 1000;
    const range = 7;
    if (hpNow < 10) {
      dmg = 20;
      reloadMs = 500;
    } else if (hpNow < 50) {
      dmg = 15;
      reloadMs = 800;
    } else {
      dmg = 10;
      reloadMs = 1000;
    }

    const dir = { x: aimTarget.x - player.pos.x, y: aimTarget.y - player.pos.y };
    const len = Math.hypot(dir.x, dir.y) || 0.0001;
    const norm = { x: dir.x / len, y: dir.y / len };
    const width = 4;
    if (isInBeam(player.pos, norm, width, range, enemy.pos)) {
      setEnemy((e) => applyDamageToFighter(e, dmg));
      pushLog(`Berserker hits for ${dmg} damage.`);
    } else {
      pushLog("Berserker swings and misses.");
    }
    setCooldown("berserk", reloadMs);
    setTimeout(() => {
      if (!checkGameOver(player, enemy)) enemyAIAction();
    }, 300);
  }

  // Aim-fire (handles regen beam, berserker, doppel player attack, default)
  function playerFireAim() {
    if (waiting || gameOver || !startConfirmed) return;

    if (player.power === "doppelganger") {
      const sliceRange = 2;
      if (distance(player.pos, enemy.pos) <= sliceRange) {
        setEnemy((e) => applyDamageToFighter(e, 40));
        pushLog("You (Doppelganger) slice the enemy for 40 damage.");
      } else {
        pushLog("Your slice missed.");
      }
      setTimeout(() => {
        if (!checkGameOver(player, enemy)) enemyAIAction();
      }, 300);
      return;
    }

    if (player.power === "berserker") return berserkerAttack();

    if (player.power === "regen") {
      const r = regenRef.current;
      const nowTs = Date.now();
      if (r.reloadUntil > nowTs) {
        pushLog("Regen beam reloading...");
        return;
      }
      const dir = { x: aimTarget.x - player.pos.x, y: aimTarget.y - player.pos.y };
      const len = Math.hypot(dir.x, dir.y) || 0.0001;
      const norm = { x: dir.x / len, y: dir.y / len };
      if (isInBeam(player.pos, norm, 3, 7, enemy.pos)) {
        setEnemy((e) => {
          const ne = applyDamageToFighter(e, 10);
          pushLog("Regen beam hits for 10 damage.");
          return ne;
        });
      } else {
        pushLog("Regen beam missed.");
      }
      r.reloadUntil = nowTs + 1000;
      regenRef.current = r;
      setTimeout(() => {
        if (!checkGameOver(player, enemy)) enemyAIAction();
      }, 300);
      return;
    }

    // default generic beam
    const dir = { x: aimTarget.x - player.pos.x, y: aimTarget.y - player.pos.y };
    const len = Math.hypot(dir.x, dir.y) || 0.0001;
    const norm = { x: dir.x / len, y: dir.y / len };
    const range = 20;
    const width = 2;
    if (isInBeam(player.pos, norm, width, range, enemy.pos)) {
      setEnemy((e) => applyDamageToFighter(e, 14));
      pushLog("You fire and hit the enemy for 14 damage.");
    } else {
      pushLog(`You fire toward (${aimTarget.x.toFixed(1)}, ${aimTarget.y.toFixed(1)}) and hit nothing.`);
    }
    setIsAiming(false);
    setTimeout(() => {
      if (!checkGameOver(player, enemy)) enemyAIAction();
    }, 300);
  }

  // Player Use Power (with Regen stronger and Lunar/Soleil UI hooks)
  function playerUsePower() {
    if (waiting || gameOver || !startConfirmed) return;
    const pw = player.power;
    const ammo = ammoRef.current[pw] ?? 0;
    if (ammo <= 0) {
      pushLog("No ammo for your power.");
      return;
    }

    switch (pw) {
      case "mud": {
        const patch: MudPatch = { id: `mud-${Date.now()}`, pos: clampPos(aimTarget), radius: 3.5, createdAt: Date.now(), durationMs: 8000 };
        setMudPatches((m) => [...m, patch]);
        ammoRef.current["mud"] = Math.max(0, ammo - 1);
        pushLog("You create a muddy pool beneath your target.");
        break;
      }

      case "parasite": {
        const dir = { x: aimTarget.x - player.pos.x, y: aimTarget.y - player.pos.y };
        const len = Math.hypot(dir.x, dir.y) || 0.0001;
        const norm = { x: dir.x / len, y: dir.y / len };
        if (isInBeam(player.pos, norm, 4, 10, enemy.pos)) {
          setEnemy((e) => applyDamageToFighter(e, 10));
          setPlayer((p) => ({ ...p, hp: Math.min(p.maxHp, p.hp + 3) }));
          const pe: ParasiteEntity = { id: `par-${Date.now()}`, ownerId: player.id, targetEnemyId: enemy.id, nextAttackAt: Date.now() + 4500, expireAt: Date.now() + 18000 };
          setParasites((ps) => [...ps, pe]);
          ammoRef.current["parasite"] = Math.max(0, ammo - 1);
          pushLog("You latch on as a parasite, draining your foe.");
        } else {
          pushLog("Parasite latch missed.");
        }
        break;
      }

      case "harmony": {
        const hs = harmonyRef.current;
        const ts = Date.now();
        if (hs.reloadUntil > ts) {
          pushLog("Harmony reloading...");
          return;
        }
        const dir = { x: aimTarget.x - player.pos.x, y: aimTarget.y - player.pos.y };
        const len = Math.hypot(dir.x, dir.y) || 0.0001;
        const norm = { x: dir.x / len, y: dir.y / len };
        const range = 16;
        const width = 3.2;
        let hit = false;
        if (isInBeam(player.pos, norm, width, range, enemy.pos)) {
          setEnemy((e) => applyDamageToFighter(e, 3));
          pushLog("Harmony's note hits for 3 damage.");
          hit = true;
        } else {
          pushLog("Harmony's note misses.");
        }
        hs.magRemaining = Math.max(0, hs.magRemaining - 1);
        hs.lastShotAt = ts;
        if (hit) {
          if (ts - hs.lastHitAt <= 2000) {
            hs.consecutiveHits += 1;
          } else {
            hs.consecutiveHits = 1;
          }
          hs.lastHitAt = ts;
          if (hs.consecutiveHits >= 6) {
            setPlayer((pl) => ({ ...pl, statuses: { ...(pl.statuses || {}), invincible: Math.max(0, (pl.statuses?.invincible || 0) + 4) } }));
            pushLog("Harmony's cadence grants you a 2-second invincibility!");
            hs.consecutiveHits = 0;
          }
        }
        if (hs.magRemaining <= 0) {
          hs.reloadUntil = ts + 1000;
          hs.magRemaining = 4;
        }
        harmonyRef.current = hs;
        ammoRef.current["harmony"] = Math.max(0, ammo - 1);
        break;
      }

      case "berserker": {
        pushLog("Berserker is passive; your attacks change automatically.");
        break;
      }

      case "regen": {
        // Stronger regen: after 5 seconds grant 8 ticks of 2HP per 500ms tick (8 * 2 = 16HP)
        setTimeout(() => {
          setPlayer((p) => ({ ...p, statuses: { ...(p.statuses || {}), regen: Math.max(0, (p.statuses?.regen || 0) + 8) } }));
          pushLog("Regen begins to mend your wounds (stronger).");
        }, 5000);
        ammoRef.current["regen"] = Math.max(0, ammo - 1);
        pushLog("You prepare to regenerate; healing will begin shortly.");
        break;
      }

      case "hex": {
        if (hexStateRef.current.reloadUntil > Date.now()) {
          pushLog("Hex is reloading...");
          return;
        }
        const dir = { x: aimTarget.x - player.pos.x, y: aimTarget.y - player.pos.y };
        const len = Math.hypot(dir.x, dir.y) || 0.0001;
        const norm = { x: dir.x / len, y: dir.y / len };
        const hit = isInBeam(player.pos, norm, 2, 10, enemy.pos);
        if (hit) {
          setEnemy((e) => {
            const ne = applyDamageToFighter(e, 7);
            const s = { ...(ne.statuses || {}) };
            s.hexStacks = Math.min(10, (s.hexStacks || 0) + 1);
            s.hexLastAt = Date.now();
            ne.statuses = s;
            pushLog(`Hex hits: ${s.hexStacks} stack(s) applied (-${(s.hexStacks || 0) * 5}% dmg).`);
            return ne;
          });
          hexStateRef.current.hitsSinceReload += 1;
        } else {
          pushLog("Hex spell misses.");
        }
        if (hexStateRef.current.hitsSinceReload >= 3) {
          hexStateRef.current.reloadUntil = Date.now() + 1900;
          hexStateRef.current.hitsSinceReload = 0;
        }
        ammoRef.current["hex"] = Math.max(0, ammo - 1);
        break;
      }

      case "lunar": {
        const lr = lunarRef.current;
        const ts = Date.now();
        if (lr.reloadUntil > ts) {
          pushLog("Lunar is reloading...");
          return;
        }
        const dir = { x: aimTarget.x - player.pos.x, y: aimTarget.y - player.pos.y };
        const len = Math.hypot(dir.x, dir.y) || 0.0001;
        const norm = { x: dir.x / len, y: dir.y / len };
        let dmg = 12;
        const lunarState = lunarStateRef.current;
        if (ts < lunarState.midnightActiveUntil) dmg *= 2;
        if (isInBeam(player.pos, norm, 4, 16, enemy.pos)) {
          setEnemy((e) => applyDamageToFighter(e, dmg));
          pushLog(`Lunar hits for ${dmg} damage.`);
          lr.magRemaining -= 1;
        } else {
          pushLog("Lunar misses.");
          lr.magRemaining -= 1;
        }
        if (lr.magRemaining <= 0) {
          const reload = ts < lunarState.midnightActiveUntil ? 1000 : 2000;
          lr.reloadUntil = ts + reload;
          lr.magRemaining = 2;
        }
        lunarRef.current = lr;
        ammoRef.current["lunar"] = Math.max(0, ammo - 1);
        break;
      }

      case "soleil": {
        const ts = Date.now();
        if (soleilStateRef.current.lastTeleportAt && ts - soleilStateRef.current.lastTeleportAt < 120000) {
          pushLog("Soleil teleport not ready yet.");
          return;
        }
        const dist = distance(player.pos, aimTarget);
        if (dist <= 30) {
          setPlayer((p) => ({ ...p, pos: clampPos(aimTarget) }));
          soleilStateRef.current.lastTeleportAt = ts;
          ammoRef.current["soleil"] = Math.max(0, ammo - 1);
          pushLog("Soleil teleports to a nearby location.");
        } else {
          pushLog("Teleport target too far for Soleil (must be within 30 studs).");
        }
        break;
      }

      case "doppelganger": {
        const existing = doppels[0];
        if (!existing) {
          const d: Doppel = { id: `dup-${Date.now()}`, pos: clampPos({ x: player.pos.x + 1.5, y: player.pos.y }), hp: 60, createdAt: Date.now(), durationMs: 24 * 60 * 60 * 1000, nextAttackAt: Date.now() + 1000, invulnerable: true };
          setDoppels((ds) => [...ds, d]);
          ammoRef.current["doppelganger"] = Math.max(0, ammo - 1);
          pushLog("A doppelganger replica has been summoned and is invulnerable.");
        } else {
          const ts = Date.now();
          if (swapRef.current.nextSwapAt > ts) {
            pushLog("Swap is on cooldown.");
            return;
          }
          swapRef.current.nextSwapAt = ts + 30000;
          setPlayer((p) => {
            setDoppels((ds) => ds.map((dd, i) => (i === 0 ? { ...dd, pos: { ...p.pos } } : dd)));
            pushLog("You swap places with your doppelganger!");
            return { ...p, pos: existing.pos };
          });
        }
        break;
      }

      default:
        pushLog("Power not implemented.");
    }

    setTimeout(() => {
      if (!checkGameOver(player, enemy)) enemyAIAction();
    }, 300);
  }

  // Call Midnight (Lunar special)
  function callMidnight() {
    if (player.power !== "lunar") {
      pushLog("Only Lunar can call Midnight.");
      return;
    }
    const ts = Date.now();
    if (ts - lunarStateRef.current.lastMidnightAt < 80000) {
      const remain = Math.ceil((80000 - (ts - lunarStateRef.current.lastMidnightAt)) / 1000);
      pushLog(`Midnight not ready. ${remain}s remaining.`);
      return;
    }
    lunarStateRef.current.lastMidnightAt = ts;
    lunarStateRef.current.midnightActiveUntil = ts + 10000;
    setLunarActive(true);
    pushLog("Midnight rises — Lunar power doubled for 10 seconds!");
    // auto-clear after duration
    setTimeout(() => {
      setLunarActive(false);
    }, 10000);
  }

  // Ownership helpers (store)
  function isOwned(p: Power) {
    return Boolean(ownedPowers[p]);
  }
  function buyPower(pw: Power): boolean {
    if (isOwned(pw)) return true;
    const cost = POWER_COSTS[pw] ?? 0;
    if (cost <= 0) {
      setOwnedPowers((prev) => ({ ...prev, [pw]: true }));
      pushLog(`Unlocked ${pw} (free).`);
      return true;
    }
    if (pixelcoins >= cost) {
      setPixelcoins((prev) => prev - cost);
      setOwnedPowers((prev) => ({ ...prev, [pw]: true }));
      pushLog(`Purchased ${pw} for ${cost} pixelcoins.`);
      return true;
    } else {
      pushLog(`Not enough pixelcoins to purchase ${pw} (need ${cost}).`);
      return false;
    }
  }
  function buyFromStore(pw: Power) {
    if (isOwned(pw)) {
      pushLog(`${pw} is already owned.`);
      return;
    }
    const ok = buyPower(pw);
    if (ok) pushLog(`You now own ${pw}. You can equip it from the Change Power dropdown.`);
  }

  // Respawn logic
  function respawnPlayer(immediate = true) {
    const appliedPower = chooseDeathPower ? deathPower : player.power;
    let maxHp = 90;
    if (appliedPower === "soleil") maxHp = 120;
    setPlayer((prev) => ({ ...prev, pos: clampPos(playerStart), hp: maxHp, maxHp, statuses: {}, specialReady: true, atkBuff: 0, defBuff: 0, power: appliedPower }));
    setMudPatches([]);
    setParasites([]);
    setDoppels([]);
    pushLog(`You have respawned${chooseDeathPower ? ` with ${appliedPower}` : ""}.`);
    if (!gameOver) setTimeout(() => enemyAIAction(), 500);
  }

  // Game over check
  function checkGameOver(p: Fighter, e: Fighter) {
    if (p.hp <= 0 && e.hp <= 0) {
      pushLog("Both fighters die — a double KO.");
      setGameOver(true);
      return true;
    }
    if (p.hp <= 0) {
      pushLog(`${p.name} has died.`);
      if (autoRespawn) {
        setTimeout(() => respawnPlayer(true), 500);
        return false;
      } else {
        setGameOver(true);
        return true;
      }
    }
    if (e.hp <= 0) {
      pushLog(`${e.name} has been defeated. You win!`);
      setGameOver(true);
      return true;
    }
    return false;
  }

  // Enemy AI (applying hex damage reduction)
  function enemyAIAction() {
    if (gameOver) return;
    const delay = 700 + randInt(0, 400);
    setTimeout(() => {
      if (gameOver) return;
      if (enemy.statuses?.stunned && enemy.statuses.stunned > 0) {
        setEnemy((e) => ({ ...e, statuses: { ...(e.statuses || {}), stunned: Math.max(0, (e.statuses?.stunned || 0) - 1) } }));
        pushLog(`${enemy.name} is stunned and misses a turn.`);
        return;
      }

      const hexStacks = enemy.statuses?.hexStacks || 0;
      const dmgMult = 1 - Math.min(0.5, 0.05 * hexStacks);

      if (distance(enemy.pos, player.pos) <= 3) {
        const baseDmg = 6;
        const realDmg = Math.max(0, Math.round(baseDmg * dmgMult));
        setPlayer((p) => applyDamageToFighter(p, realDmg));
        pushLog(`${enemy.name} strikes you for ${realDmg} damage (hex applied).`);
      } else {
        setEnemy((e) => {
          const dir = { x: player.pos.x - e.pos.x, y: player.pos.y - e.pos.y };
          const len = Math.hypot(dir.x, dir.y) || 0.0001;
          const step = 0.8;
          return { ...e, pos: clampPos({ x: e.pos.x + (dir.x / len) * step, y: e.pos.y + (dir.y / len) * step }) };
        });
        pushLog(`${enemy.name} advances.`);
      }
    }, delay);
  }

  // Reset match
  function resetMatch() {
    const startingPower = chooseDeathPower && startConfirmed ? deathPower : "mud";
    const startingHp = startingPower === "soleil" ? 120 : 90;
    setPlayer({ id: "player-1", name: "You", pos: clampPos(playerStart), hp: startingHp, maxHp: startingHp, attack: 18, defense: 6, power: startingPower, specialReady: true, statuses: {}, atkBuff: 0, defBuff: 0 });
    setEnemy({ id: "enemy-1", name: "Champion", pos: clampPos(enemyStart), hp: 100, maxHp: 100, attack: 16, defense: 5, power: POWERS[randInt(0, POWERS.length - 1)], specialReady: true, statuses: {}, atkBuff: 0, defBuff: 0 });
    setTurnLog(["A challenger enters the arena... prepare to fight to the death!"]);
    setWaiting(false);
    setGameOver(false);
    setMudPatches([]);
    setParasites([]);
    setDoppels([]);
    cooldownsRef.current = {};
    ammoRef.current = { ...DEFAULT_AMMO };
  }

  // Mobile detection & input handlers (same as previous)
  const isTouchDevice = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Block spacebar and common "jump" keybindings explicitly so the game doesn't jump the page
      if (e.code === "Space" || e.key === " " || e.key === "Spacebar" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.key === "e" || e.key === "E") {
        if (!isTouchDevice && startConfirmed && !gameOver) {
          setIsAiming((v) => {
            const next = !v;
            pushLog(`Aiming ${next ? "enabled" : "disabled"}.`);
            return next;
          });
        }
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (gameOver || !startConfirmed) return;
      const speed = 0.9;
      let moved = false;
      if (e.key === "ArrowUp" || e.key === "w") {
        setPlayer((p) => ({ ...p, pos: clampPos({ x: p.pos.x, y: p.pos.y - speed }) }));
        moved = true;
      }
      if (e.key === "ArrowDown" || e.key === "s") {
        setPlayer((p) => ({ ...p, pos: clampPos({ x: p.pos.x, y: p.pos.y + speed }) }));
        moved = true;
      }
      if (e.key === "ArrowLeft" || e.key === "a") {
        setPlayer((p) => ({ ...p, pos: clampPos({ x: p.pos.x - speed, y: p.pos.y }) }));
        moved = true;
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        setPlayer((p) => ({ ...p, pos: clampPos({ x: p.pos.x + speed, y: p.pos.y }) }));
        moved = true;
      }
      if (moved) setAimTarget((t) => clampPos(t));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameOver, startConfirmed, isAiming]);

  useEffect(() => {
    function onMouseUp() {
      if (isAiming && !isTouchDevice) playerFireAim();
    }
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, [isAiming, isTouchDevice, aimTarget, player, enemy, startConfirmed, gameOver]);

  const [joystickActive, setJoystickActive] = useState(false);
  const joystickOriginRef = useRef<{ x: number; y: number } | null>(null);
  function onJoystickTouchStart(e: React.TouchEvent) {
    if (!startConfirmed || gameOver) return;
    const t = e.touches[0];
    joystickOriginRef.current = { x: t.clientX, y: t.clientY };
    setJoystickActive(true);
  }
  function onJoystickTouchMove(e: React.TouchEvent) {
    if (!joystickActive || !joystickOriginRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - joystickOriginRef.current.x;
    const dy = t.clientY - joystickOriginRef.current.y;
    const deltaStuds = { x: dx / STUD_TO_PX, y: dy / STUD_TO_PX };
    const newAim = clampPos({ x: player.pos.x + deltaStuds.x, y: player.pos.y + deltaStuds.y });
    setAimTarget(newAim);
  }
  function onJoystickTouchEnd() {
    if (!joystickActive) return;
    setJoystickActive(false);
    joystickOriginRef.current = null;
    playerFireAim();
  }

  function confirmStart() {
    const cost = POWER_COSTS[player.power];
    if (!isOwned(player.power) && cost > 0) {
      const ok = buyPower(player.power);
      if (!ok) {
        pushLog(`Starting-power purchase failed. Starting with Mud instead.`);
        setPlayer((p) => ({ ...p, power: "mud" }));
      }
    }

    setStartConfirmed(true);
    pushLog("Match started. Choose an aim and use your power or fists.");
  }

  function setPlayerPower(pw: Power) {
    const newMax = pw === "soleil" ? 120 : 90;
    if (isOwned(pw)) {
      setPlayer((p) => ({ ...p, power: pw, maxHp: newMax, hp: Math.min(newMax, p.hp) }));
      pushLog(`Equipped ${pw}.`);
      return;
    }
    const ok = buyPower(pw);
    if (ok) setPlayer((p) => ({ ...p, power: pw, maxHp: newMax, hp: Math.min(newMax, p.hp) }));
  }

  function Aim3D({ target }: { target: Vec2 }) {
    const start = toScenePx(player.pos);
    const end = toScenePx(target);
    const dx = end.xPx - start.xPx;
    const dz = end.zPx - start.zPx;
    const dist = Math.hypot(dx, dz);
    const angle = (Math.atan2(dz, dx) * 180) / Math.PI;
    const ringSize = 18;
    const transform = `translate3d(${start.xPx}px, 0px, ${start.zPx}px) rotateZ(${angle}deg)`;
    const endTransform = `translate3d(${end.xPx - ringSize / 2}px, 0px, ${end.zPx - ringSize / 2}px)`;
    return (
      <>
        <div style={{ position: "absolute", left: 0, top: 0, transform, width: dist, height: 10, transformOrigin: "0 50%", pointerEvents: "none", opacity: 0.45, background: "linear-gradient(90deg, rgba(255,255,120,0.0), rgba(255,255,120,0.35), rgba(255,255,120,0.0))", borderRadius: 6 }} />
        <div style={{ position: "absolute", left: 0, top: 0, transform: endTransform, width: ringSize, height: ringSize, borderRadius: "50%", border: "2px solid rgba(255,255,200,0.6)", boxShadow: "0 0 10px rgba(255,255,120,0.2)", pointerEvents: "none" }} />
      </>
    );
  }

  function Player3D({ f, size = 30 }: { f: Fighter; size?: number }) {
    const { xPx, zPx } = toScenePx(f.pos);
    const depthFactor = 0.8 + (zPx / CANVAS_SIZE_PX) * 0.4;
    const transform = `translate3d(${xPx - size / 2}px, 0px, ${zPx - size / 2}px)`;
    const shadowScale = 1 + (zPx / CANVAS_SIZE_PX) * 0.4;
    const hpPct = Math.max(0, Math.round((f.hp / f.maxHp) * 100));
    return (
      <div className="scene-object player-3d" style={{ position: "absolute", transformStyle: "preserve-3d", transform, width: size, height: size * 1.6, pointerEvents: "none" }} title={`${f.name} — ${f.hp}/${f.maxHp}`}>
        <div style={{ transform: `translateZ(0px)`, width: "100%", height: "70%", borderRadius: 8, background: f.id === player.id ? "linear-gradient(#4f8fd2,#2b6fb0)" : "linear-gradient(#d25a5a,#a83737)", boxShadow: "0 8px 20px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", width: size * 0.7, height: size * 0.45, borderRadius: "50% 50% 40% 40%", background: "rgba(255,255,255,0.06)", boxShadow: "inset 0 2px 4px rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%) rotateX(90deg) translateZ(-0.1px)", width: size * shadowScale, height: size * 0.25, borderRadius: "50%", background: "rgba(0,0,0,0.45)", filter: "blur(6px)", opacity: 0.6 }} />
        <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", width: size * 1.2, height: 6, background: "rgba(0,0,0,0.5)", borderRadius: 6, overflow: "hidden", border: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ width: `${hpPct}%`, height: "100%", background: hpPct > 50 ? "#4caf50" : hpPct > 20 ? "#ff9800" : "#f44336", transition: "width 200ms linear" }} />
        </div>
      </div>
    );
  }

  // UI render (includes Midnight overlay and Soleil teleport emblem)
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", fontFamily: "Inter, Arial, sans-serif", color: "#cfe", position: "relative" }}>
      <h2>Super Showdown 2 — Custom Powers + Store</h2>

      {/* MIDNIGHT OVERLAY (moon + darkening) */}
      {lunarActive && (
        <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 30 }}>
          {/* darken */}
          <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, background: "rgba(2,8,25,0.55)", transition: "opacity 400ms" }} />
          {/* moon rising (simple animated effect) */}
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: "64%", width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #fff, #ddd)", opacity: 0.95 }} />
        </div>
      )}

      {!startConfirmed && (
        <div style={{ border: "1px solid #334", padding: 12, marginBottom: 12, borderRadius: 8 }}>
          <h3>Match Setup</h3>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
            <div>Pixelcoins: <strong>{pixelcoins}</strong></div>
            <div style={{ color: serverAvailable ? "#8f8" : "#999", fontSize: 12 }}>{serverAvailable ? "Saved to server" : "Local (or server unreachable)"}</div>
          </div>

          <label style={{ display: "block", marginBottom: 8 }}>
            <input type="checkbox" checked={chooseDeathPower} onChange={(e) => setChooseDeathPower(e.target.checked)} /> Choose a power to have when you die (applies on next respawn)
          </label>
          {chooseDeathPower && (
            <label style={{ display: "block", marginBottom: 8 }}>
              Power on death:
              <select style={{ marginLeft: 8 }} value={deathPower} onChange={(e) => setDeathPower(e.target.value as Power)}>
                {POWERS.map((p) => (<option key={p} value={p}>{p}</option>))}
              </select>
            </label>
          )}
          <label style={{ display: "block", marginBottom: 8 }}>
            Starting power:
            <select value={player.power} onChange={(e) => setPlayerPower(e.target.value as Power)} style={{ marginLeft: 8 }}>
              {POWERS.map((p) => (<option key={p} value={p} disabled={!isOwned(p) && POWER_COSTS[p] > pixelcoins}>{p}{!isOwned(p) && POWER_COSTS[p] > 0 ? ` (${POWER_COSTS[p]} PC)` : isOwned(p) ? ' (owned)' : ''}</option>))}
            </select>
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            <input type="checkbox" checked={autoRespawn} onChange={(e) => setAutoRespawn(e.target.checked)} /> Auto-respawn immediately upon death
          </label>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={confirmStart} style={{ padding: "8px 12px" }}>Confirm & Start Match</button>
            <button onClick={() => { setPixelcoins((p) => p + 50); pushLog("Added 50 pixelcoins (dev)."); }} style={{ padding: "8px 12px" }}>+50 PC (dev)</button>
            <button onClick={() => { localStorage.removeItem("supershowdown2_ownedPowers"); localStorage.removeItem("supershowdown2_pixelcoins"); setOwnedPowers((prev) => ({ ...prev })); pushLog("Cleared local save (dev)."); }} style={{ padding: "8px 12px" }}>Clear Local Save</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          {/* 3D Scene */}
          <div style={{ perspective: 1100, marginBottom: 8, position: "relative", zIndex: 10 }}>
            <div aria-hidden style={{ width: CANVAS_SIZE_PX, height: CANVAS_SIZE_PX, margin: "0 auto", position: "relative", transformStyle: "preserve-3d", background: "linear-gradient(#071018,#041018)", borderRadius: 8, boxShadow: "0 12px 40px rgba(0,0,0,0.7)", overflow: "hidden" }}>

              {/* Sky darkening for lunarActive inside scene container as subtle overlay */}
              {lunarActive && (
                <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", background: "rgba(0,0,40,0.28)", zIndex: 5, pointerEvents: "none" }} />
              )}

              {/* Ground plane */}
              <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", transformStyle: "preserve-3d", transform: `rotateX(60deg) translateZ(-${CANVAS_SIZE_PX * 0.15}px)`, transformOrigin: "center center", pointerEvents: "none" }}>
                <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "18px 18px", transform: "translateZ(0px)" }} />

                {/* Mud patches (3D) */}
                {mudPatches.map((m) => {
                  const { xPx, zPx } = toScenePx(m.pos);
                  const size = m.radius * 2 * STUD_TO_PX;
                  const transform = `translate3d(${xPx - size / 2}px, 0px, ${zPx - size / 2}px)`;
                  return (
                    <div key={m.id} style={{ position: "absolute", transform, width: size, height: size, pointerEvents: "none" }}>
                      <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(#5a3d26,#3b2a19)", opacity: 0.9 }} />
                    </div>
                  );
                })}

                {/* Parasite icon near enemy */}
                {parasites.map((p) => (
                  <div key={p.id} style={{ position: "absolute", left: toScenePx(enemy.pos).xPx, top: toScenePx(enemy.pos).zPx, pointerEvents: "none", transform: `translate3d(${toScenePx(enemy.pos).xPx}px,0px,${toScenePx(enemy.pos).zPx}px)` }}>
                    <div style={{ transform: "translate3d(12px,-12px,0)", width: 12, height: 12, borderRadius: 6, background: "#7e2b7e" }} />
                  </div>
                ))}

                {/* Doppel */}
                {doppels.map((d) => {
                  const { xPx, zPx } = toScenePx(d.pos);
                  const size = 14;
                  const transform = `translate3d(${xPx - size / 2}px, 0px, ${zPx - size / 2}px)`;
                  return <div key={d.id} style={{ position: "absolute", transform, width: size, height: size, pointerEvents: "none" }}><div style={{ width: "100%", height: "100%", borderRadius: 6, background: d.invulnerable ? "linear-gradient(#fff,#ddd)" : "linear-gradient(#c8c8c8,#a8a8a8)" }} /></div>;
                })}

                {/* Soleil teleport emblem (sun) at aimTarget when player is Soleil */}
                {player.power === "soleil" && (() => {
                  const { xPx, zPx } = toScenePx(aimTarget);
                  const transform = `translate3d(${xPx - 12}px, 0px, ${zPx - 12}px)`;
                  const ready = !soleilStateRef.current.lastTeleportAt || (Date.now() - soleilStateRef.current.lastTeleportAt) >= 120000;
                  return (
                    <div key="soleil-sigil" style={{ position: "absolute", left: 0, top: 0, transform, pointerEvents: "none" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: ready ? "radial-gradient(circle at 30% 30%, #fff8d1, #ffd36a)" : "radial-gradient(circle at 30% 30%, #ddd, #999)", boxShadow: "0 0 8px rgba(255,180,64,0.28)", border: "1px solid rgba(255,200,90,0.6)" }} />
                    </div>
                  );
                })()}

                {/* Enemy & Player */}
                <Player3D f={enemy} size={36} />
                <Player3D f={player} size={40} />

                {(isAiming || joystickActive) && <Aim3D target={aimTarget} />}
              </div>
            </div>
          </div>

          {/* Visible canvas for accurate clicks and 3D styled representation (was hidden before) */}
          <div style={{ textAlign: "center", marginTop: -CANVAS_SIZE_PX - 6 }}>
            <canvas ref={canvasRef} width={CANVAS_SIZE_PX} height={CANVAS_SIZE_PX} style={{ opacity: 0.98, pointerEvents: "auto", cursor: isAiming ? "crosshair" : "crosshair", transform: `translateZ(0px)` }} onClick={handleCanvasClick} onMouseMove={handleMouseMove} />
            <div style={{ marginTop: 6, color: "#9fb", fontSize: 12 }}>Click the arena to set aim. On PC press E to enter aiming mode. Space and common jump keys are blocked to avoid page scrolling.</div>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button onClick={playerPunch} disabled={waiting || gameOver || !startConfirmed} style={{ padding: "8px 12px" }}>Punch (Fist) — 10 dmg, range 1</button>
            <button onClick={playerFireAim} disabled={waiting || gameOver || !startConfirmed} style={{ padding: "8px 12px" }}>Aim Fire</button>
            <button onClick={playerUsePower} disabled={waiting || gameOver || !startConfirmed} style={{ padding: "8px 12px" }}>Use Power ({player.power}) — ammo: {ammoRef.current[player.power] ?? 0}</button>

            {/* Lunar: Call Midnight button */}
            {player.power === "lunar" && (
              <button onClick={callMidnight} disabled={Date.now() - lunarStateRef.current.lastMidnightAt < 80000} style={{ padding: "8px 12px" }}>
                Call Midnight {Date.now() - lunarStateRef.current.lastMidnightAt < 80000 ? `(${Math.ceil((80000 - (Date.now() - lunarStateRef.current.lastMidnightAt))/1000)}s)` : ""}
              </button>
            )}

            <button onClick={resetMatch} style={{ marginLeft: "auto", padding: "8px 12px" }}>Reset Match</button>
          </div>

          <div style={{ marginTop: 8, fontSize: 13 }}>
            <div>Map: {MAP_SIZE} x {MAP_SIZE} studs</div>
            <div>Aim: click on the arena to set target (current: {aimTarget.x.toFixed(1)}, {aimTarget.y.toFixed(1)})</div>
            <div style={{ marginTop: 6 }}>Controls: Move with arrow keys / WASD. Enemy will act after your turn. Spacebar and jump keys blocked.</div>
          </div>

          {isTouchDevice && startConfirmed && (
            <div onTouchStart={onJoystickTouchStart} onTouchMove={onJoystickTouchMove} onTouchEnd={onJoystickTouchEnd} style={{ position: "fixed", right: 18, bottom: 18, width: 110, height: 110, borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", touchAction: "none" }}>
              <div style={{ width: 60, height: 60, borderRadius: 999, background: "rgba(255,255,255,0.06)" }} />
            </div>
          )}
        </div>

        <div style={{ width: 360 }}>
          <div style={{ background: "#06101a", padding: 10, borderRadius: 8 }}>
            <h3 style={{ margin: "4px 0" }}>{player.name}</h3>
            <div>HP: {player.hp}/{player.maxHp}</div>
            <div>Power: <strong style={{ textTransform: "capitalize" }}>{player.power}</strong></div>
            <div>Special Ready: {player.specialReady ? "Yes" : "No"}</div>
            <div style={{ marginTop: 6 }}>
              <label>Change power:
                <select value={player.power} onChange={(e) => setPlayerPower(e.target.value as Power)} disabled={waiting || gameOver} style={{ marginLeft: 8 }}>
                  {POWERS.map((p) => (<option key={p} value={p}>{p}{isOwned(p) ? ' (owned)' : POWER_COSTS[p] ? ` (${POWER_COSTS[p]} PC)` : ''}</option>))}
                </select>
              </label>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #123" }} />

            <h4 style={{ margin: "6px 0" }}>Store</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 8 }}>
              {POWERS.map((p) => (
                <React.Fragment key={p}>
                  <div style={{ alignSelf: "center" }}>
                    <strong style={{ textTransform: "capitalize" }}>{p}</strong>
                    <div style={{ fontSize: 12, color: "#9ab" }}>{isOwned(p) ? "Owned" : `${POWER_COSTS[p]} pixelcoins`}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => buyFromStore(p)} disabled={isOwned(p) || POWER_COSTS[p] > pixelcoins} style={{ flex: 1, padding: "6px 8px" }}>{isOwned(p) ? "Owned" : `Buy (${POWER_COSTS[p]})`}</button>
                    <button onClick={() => { if (isOwned(p)) { setPlayer((pl) => ({ ...pl, power: p })); pushLog(`Equipped ${p}.`); } }} disabled={!isOwned(p)} style={{ padding: "6px 8px" }}>Equip</button>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #123" }} />
            <h4 style={{ margin: "6px 0" }}>Enemy</h4>
            <div>{enemy.name}</div>
            <div>HP: {enemy.hp}/{enemy.maxHp}</div>
            <div>Power: <strong style={{ textTransform: "capitalize" }}>{enemy.power}</strong></div>

            <hr style={{ border: "none", borderTop: "1px solid #123" }} />
            <h4 style={{ margin: "6px 0" }}>Entities</h4>
            <div>Mud patches: {mudPatches.length}</div>
            <div>Parasites: {parasites.length}</div>
            <div>Doppelgangers: {doppels.length}</div>
          </div>

          <div style={{ marginTop: 12, background: "#04101a", padding: 10, borderRadius: 8, minHeight: 220 }}>
            <h4 style={{ margin: "6px 0" }}>Battle Log</h4>
            <div style={{ maxHeight: 180, overflowY: "auto", color: "#bcd" }}>
              <ul style={{ paddingLeft: 16 }}>{turnLog.map((t, i) => <li key={i} style={{ marginBottom: 6 }}>{t}</li>)}</ul>
            </div>
          </div>
        </div>
      </div>

      {gameOver && (
        <div style={{ marginTop: 12, padding: 12, background: "#170a0f", borderRadius: 6 }}>
          <strong>Match finished.</strong> {player.hp <= 0 ? "You died." : "Match over."}
          <div style={{ marginTop: 8 }}>
            <button onClick={() => { if (chooseDeathPower) { setPlayer((p) => ({ ...p, power: deathPower })); pushLog(`On respawn you will wield ${deathPower}.`); } respawnPlayer(); setGameOver(false); }} style={{ padding: "8px 12px" }}>Respawn / Reset (join back)</button>
          </div>
        </div>
      )}
    </div>
  );

  // helper functions used above
  function canUseCooldown(key: string) {
    return (cooldownsRef.current[key] || 0) <= Date.now();
  }
  function setCooldown(key: string, msFromNow: number) {
    cooldownsRef.current[key] = Date.now() + msFromNow;
  }
}
