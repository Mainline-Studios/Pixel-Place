import React, { useEffect, useRef, useState } from "react";
import {
  POWER_STATS,
  ATTACK_RANGES,
  ATTACK_WIDTHS,
  ATTACK_RADII,
  DURATIONS,
  DAMAGE_VALUES,
  GAMEPLAY_CONSTANTS,
  isInBeam,
  inCircle,
  distance,
} from "@/lib/gameScaling";
import { getUserAvatarData, createAvatarMesh } from '@/lib/avatar3DRenderer';
import { useUser } from '@/contexts/UserContext';

/**
 * SuperShowdownCombined
 *
 * Combines SuperShowdown (3D arena + original powers/entities) and
 * SuperShowdown2 (newer powers: mud/parasite/harmony/regen/hex/lunar/soleil/doppelganger
 * along with improved regen/midnight/soleil visuals).
 *
 * Adjustments made per request:
 * - Whirlpools now pull nearby fighters toward their center.
 * - Black holes explode 3 seconds after being placed (deal area damage then removed).
 * - Doppelganger replicas are created invulnerable and persist (never expire).
 *
 * Added: ownership / store / pixelcoins logic borrowed from SuperShowdown / SuperShowdown2:
 * - pixelcoins state, ownedPowers persistence (localStorage + optional server sync)
 * - buyPower, buyFromStore / isOwned helpers
 * - UI store to buy/equip powers (store purchases persist)
 */

/* ---------------------------
   Shared types & utilities
   --------------------------- */

type Vec2 = { x: number; y: number };

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

type Statuses = {
  burn?: number;
  poison?: number;
  regen?: number;
  stunned?: number;
  invisible?: number;
  slow?: number;
  atkBuffTurns?: number;
  defBuffTurns?: number;
  invincible?: number;
  hexStacks?: number;
  hexLastAt?: number;
};

/* ---------------------------
   Powers (union of both files)
   --------------------------- */

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
  // SuperShowdown2 custom powers
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

/* ---------------------------
   Power costs (pixelcoins) - taken from SuperShowdown conventions + new powers
   --------------------------- */
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

/* ---------------------------
   Map / rendering constants
   --------------------------- */

const MAP_SIZE = 60; // studs (square)
const CANVAS_SIZE_PX = 700;
const STUD_TO_PX = CANVAS_SIZE_PX / MAP_SIZE;

/* ---------------------------
   Game types for entities
   --------------------------- */

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

type Bear = { id: string; ownerId: string; pos: Vec2; hp: number; range: number; dmgPerSec: number; alive: boolean };
type Whirlpool = { id: string; pos: Vec2; radius: number; durationMs: number; createdAt: number };
type Plant = { id: string; ownerId: string; pos: Vec2; radius: number; durationMs: number; createdAt: number };
// BlackHole now includes explodeAt and active flags
type BlackHole = { id: string; ownerId: string; pos: Vec2; radius: number; createdAt: number; explodeAt: number; active: boolean };

type MudPatch = { id: string; pos: Vec2; radius: number; createdAt: number; durationMs: number };
type ParasiteEntity = { id: string; ownerId: string; targetEnemyId: string; nextAttackAt: number; expireAt: number };
type Doppel = { id: string; pos: Vec2; hp: number; createdAt: number; durationMs: number; nextAttackAt: number; invulnerable?: boolean };

/* ---------------------------
   Default ammo for powers
   --------------------------- */

const DEFAULT_AMMO: Record<string, number> = {
  fire: 20,
  electricity: 10,
  ice: 7,
  invisible: 4,
  poison: 6,
  earth: 4,
  mud: 6,
  parasite: 2,
  harmony: 3,
  berserker: 4,
  regen: 3,
  hex: 4,
  lunar: 4,
  soleil: 8,
  doppelganger: 2,
};

/* ---------------------------
   Component
   --------------------------- */

interface InsaneShowdownProps {
  user?: any;
}

export default function SuperShowdownCombined({ user }: InsaneShowdownProps = {}): JSX.Element {
  // Setup & start state
  const [chooseDeathPower, setChooseDeathPower] = useState(false);
  const [deathPower, setDeathPower] = useState<Power>("fire");
  const [startConfirmed, setStartConfirmed] = useState(false);
  const [autoRespawn, setAutoRespawn] = useState(true);
  
  // 3D scene refs
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const playerAvatarRef = useRef<any>(null);
  const enemyAvatarRef = useRef<any>(null);
  const [avatarData, setAvatarData] = useState<{ skin: any; face: any; accessories: any[] } | null>(null);
  
  // Get user from context if not provided
  const { user: contextUser } = useUser();
  const currentUser = user || contextUser;

  // Load avatar data
  useEffect(() => {
    if (currentUser) {
      getUserAvatarData(currentUser).then(data => {
        setAvatarData(data);
      });
    }
  }, [currentUser]);

  // Pixelcoins & owned powers (persistence like SuperShowdown)
  const [pixelcoins, setPixelcoins] = useState<number>(100);
  const [ownedPowers, setOwnedPowers] = useState<Record<Power, boolean>>(() => {
    const initial = {} as Record<Power, boolean>;
    // Mark free powers as owned
    for (const p of POWERS) initial[p] = POWER_COSTS[p] === 0;
    // Provide a sensible default: ensure common ones are owned
    initial.fire = true;
    initial.water = true;
    initial.earth = true;
    initial.electricity = true;
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
        const saved = localStorage.getItem("supershowdown_ownedPowers");
        if (saved) {
          const parsed = JSON.parse(saved) as Record<string, boolean>;
          const merged: Record<Power, boolean> = { ...ownedPowers };
          for (const p of POWERS) {
            if (typeof parsed[p] === "boolean") merged[p] = parsed[p];
          }
          setOwnedPowers(merged);
        }
        const pc = localStorage.getItem("supershowdown_pixelcoins");
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
        localStorage.setItem("supershowdown_ownedPowers", JSON.stringify(ownedPowers));
        localStorage.setItem("supershowdown_pixelcoins", String(pixelcoins));
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
    hp: 100,
    maxHp: 100,
    attack: 18,
    defense: 6,
    power: "fire",
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

  const [turnLog, setTurnLog] = useState<string[]>(() => ["A challenger prepares to enter the 3D arena..."]);
  const pushLog = (s: string) => setTurnLog((l) => [s, ...l].slice(0, 200));

  const [waiting, setWaiting] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Aiming
  const [aimTarget, setAimTarget] = useState<Vec2>({ x: playerStart.x + 10, y: playerStart.y });
  const [isAiming, setIsAiming] = useState(false);

  // Entities (combined)
  const [bears, setBears] = useState<Bear[]>([]);
  const [whirlpools, setWhirlpools] = useState<Whirlpool[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [blackHoles, setBlackHoles] = useState<BlackHole[]>([]);
  const [mudPatches, setMudPatches] = useState<MudPatch[]>([]);
  const [parasites, setParasites] = useState<ParasiteEntity[]>([]);
  const [doppels, setDoppels] = useState<Doppel[]>([]);

  // Cooldowns & ammo
  const cooldownsRef = useRef<Record<string, number>>({});
  const ammoRef = useRef<Record<string, number>>({});
  useEffect(() => {
    ammoRef.current = { ...DEFAULT_AMMO };
  }, []);

  // Canvas & drawing (keeps accurate click mapping)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    drawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, enemy, aimTarget, bears, whirlpools, plants, blackHoles, mudPatches, parasites, doppels, startConfirmed]);

  function toPx(v: Vec2) {
    return { x: v.x * STUD_TO_PX, y: v.y * STUD_TO_PX };
  }
  function clampPos(pos: Vec2) {
    return {
      x: Math.max(0, Math.min(MAP_SIZE, pos.x)),
      y: Math.max(0, Math.min(MAP_SIZE, pos.y)),
    };
  }

  // isInBeam and inCircle functions now imported from @/lib/gameScaling

  // Track last time player attacked or took damage (ms since epoch)
  const lastPlayerCombatAtRef = useRef<number>(Date.now());
  // Track whether regen is currently active (to avoid spamming start logs)
  const regenActiveRef = useRef<boolean>(false);

  /* ---------------------------
     Status ticks (combined; 500ms tick to support SuperShowdown2 timing)
     --------------------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      const ts = Date.now();

      // Player statuses (500ms tick)
      setPlayer((p) => {
        let changed = false;
        let np = { ...p };
        const s = { ...(np.statuses || {}) };

        if (s.burn && s.burn > 0) {
          const dmg = randInt(1, 4); // combine behavior
          np.hp = Math.max(0, np.hp - dmg);
          pushLog(`${np.name} suffers ${dmg} burn damage.`);
          s.burn!--;
          lastPlayerCombatAtRef.current = Date.now();
          regenActiveRef.current = false;
          changed = true;
        }
        if (s.poison && s.poison > 0) {
          const dmg = 1;
          np.hp = Math.max(0, np.hp - dmg);
          pushLog(`${np.name} takes ${dmg} poison damage.`);
          s.poison!--;
          lastPlayerCombatAtRef.current = Date.now();
          regenActiveRef.current = false;
          changed = true;
        }
        // Regen status: support both strong regen (2HP/tick) and small regen (1HP/tick)
        if (s.regen && s.regen > 0) {
          const isStrong = p.power === "regen";
          const heal = isStrong ? DAMAGE_VALUES.REGEN_TICK : 1;
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
        let ne = { ...e };
        const s = { ...(ne.statuses || {}) };
        let changed = false;
        if (s.burn && s.burn > 0) {
          const dmg = randInt(1, 3);
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

        // Hex expiry (SuperShowdown2)
        if (s.hexLastAt && s.hexStacks && ts - s.hexLastAt > DURATIONS.HEX_STACK_EXPIRE) {
          s.hexStacks = 0;
          delete s.hexLastAt;
          pushLog(`${ne.name} has hex fade away.`);
          changed = true;
        }

        ne.statuses = s;
        if (ne.hp <= 0) checkGameOver(player, ne);
        return changed ? ne : e;
      });

      // Mud patches damage enemy when standing on them
      setMudPatches((mps) => {
        const alive = mps.filter((mp) => ts < mp.createdAt + mp.durationMs);
        alive.forEach((mp) => {
          const tickDmg = DAMAGE_VALUES.MUD_TICK; // slightly reduced for balance
          if (inCircle(mp.pos, mp.radius, enemy.pos)) {
            setEnemy((e) => {
              const ne = { ...e, hp: Math.max(0, e.hp - tickDmg) };
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
              const ne = { ...e, hp: Math.max(0, e.hp - DAMAGE_VALUES.PARASITE_DRAIN) };
              pushLog(`${ne.name} is drained by a parasite for ${DAMAGE_VALUES.PARASITE_DRAIN} damage.`);
              return ne;
            });
            setPlayer((pl) => {
              const healed = Math.min(pl.maxHp, pl.hp + DAMAGE_VALUES.PARASITE_HEAL);
              pushLog(`The parasite restores ${DAMAGE_VALUES.PARASITE_HEAL} HP to ${pl.name}.`);
              return { ...pl, hp: healed };
            });
            p.nextAttackAt = ts + DURATIONS.PARASITE_ATTACK_INTERVAL;
          }
        });
        return alive;
      });

      // Doppels (persisting if invulnerable)
      setDoppels((ds) => {
        const alive = ds.filter((d) => d.invulnerable || d.createdAt + d.durationMs > ts);
        alive.forEach((d) => {
          if (ts >= d.nextAttackAt) {
            if (distance(d.pos, enemy.pos) <= ATTACK_RANGES.DOPPELGANGER) {
              setEnemy((e) => ({ ...e, hp: Math.max(0, e.hp - DAMAGE_VALUES.DOPPELGANGER_ATTACK_INSANE) }));
              pushLog(`A doppelganger slices the enemy for ${DAMAGE_VALUES.DOPPELGANGER_ATTACK_INSANE} damage.`);
            } else {
              d.pos = clampPos({
                x: d.pos.x + (enemy.pos.x - d.pos.x) * GAMEPLAY_CONSTANTS.DOPPELGANGER_CHASE_SPEED,
                y: d.pos.y + (enemy.pos.y - d.pos.y) * GAMEPLAY_CONSTANTS.DOPPELGANGER_CHASE_SPEED,
              });
            }
            d.nextAttackAt = ts + DURATIONS.DOPPELGANGER_ATTACK_INTERVAL;
          }
        });
        return alive;
      });

      /* ---------------------------
         Whirlpool pull behavior
         - Pulls ANY fighter within the whirlpool radius inward by a fraction each tick.
         --------------------------- */
      whirlpools.forEach((w) => {
        // pull strength per tick (studs)
        const pullFraction = GAMEPLAY_CONSTANTS.WHIRLPOOL_PULL_FRACTION; // fraction of the distance per tick
        // Player
        if (distance(w.pos, player.pos) <= w.radius * 1.2) {
          setPlayer((p) => {
            const dx = w.pos.x - p.pos.x;
            const dy = w.pos.y - p.pos.y;
            // small step toward center
            const nx = p.pos.x + dx * pullFraction;
            const ny = p.pos.y + dy * pullFraction;
            pushLog(`You are pulled by a whirlpool!`);
            return { ...p, pos: clampPos({ x: nx, y: ny }) };
          });
        }
        // Enemy
        if (distance(w.pos, enemy.pos) <= w.radius * 1.2) {
          setEnemy((e) => {
            const dx = w.pos.x - e.pos.x;
            const dy = w.pos.y - e.pos.y;
            const nx = e.pos.x + dx * pullFraction;
            const ny = e.pos.y + dy * pullFraction;
            pushLog(`${enemy.name} is pulled by a whirlpool!`);
            return { ...e, pos: clampPos({ x: nx, y: ny }) };
          });
        }
      });

      /* ---------------------------
         Black hole explosion after 3s
         - When explodeAt <= now, deal AoE damage then remove the black hole.
         --------------------------- */
      setBlackHoles((bhs) => {
        const remaining: BlackHole[] = [];
        bhs.forEach((bh) => {
          if (bh.active && ts >= bh.explodeAt) {
            // Explosion: damage anything within radius * 1.4
            const explosionRadius = bh.radius * 1.4;
            const explosionDamage = DAMAGE_VALUES.BLACK_HOLE_EXPLOSION;
            if (inCircle(bh.pos, explosionRadius, player.pos)) {
              setPlayer((p) => applyDamageToFighter(p, explosionDamage));
              pushLog(`A black hole explodes and hits you for ${explosionDamage} damage!`);
            }
            if (inCircle(bh.pos, explosionRadius, enemy.pos)) {
              setEnemy((e) => applyDamageToFighter(e, explosionDamage));
              pushLog(`A black hole explodes and hits ${enemy.name} for ${explosionDamage} damage!`);
            }
            // mark as inactive (removed) - do not keep
            pushLog("A black hole collapses in a violent explosion.");
          } else {
            // keep it
            remaining.push(bh);
          }
        });
        return remaining;
      });

    }, DURATIONS.STATUS_TICK);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, enemy, whirlpools, blackHoles]);

  /* ---------------------------
     Idle regen (from SuperShowdown): after 10s idle heal rapidly
     --------------------------- */
  useEffect(() => {
    const regenInterval = setInterval(() => {
      setPlayer((prev) => {
        const now = Date.now();
        const idleMs = now - (lastPlayerCombatAtRef.current || 0);
        const canRegen =
          startConfirmed &&
          !gameOver &&
          prev.hp > 0 &&
          prev.hp < prev.maxHp &&
          idleMs >= DURATIONS.IDLE_REGEN_THRESHOLD; // 10s idle
        if (canRegen) {
          if (!regenActiveRef.current) {
            regenActiveRef.current = true;
            pushLog("You begin regenerating health (idle regen).");
          }
          const newHp = Math.min(prev.maxHp, prev.hp + 1);
          return { ...prev, hp: newHp };
        } else {
          if (regenActiveRef.current && idleMs < DURATIONS.IDLE_REGEN_THRESHOLD) {
            regenActiveRef.current = false;
          }
        }
        return prev;
      });
    }, 100);
    return () => clearInterval(regenInterval);
  }, [startConfirmed, gameOver]);

  /* ---------------------------
     Drawing the canvas for precise clicks (and some visual hints)
     --------------------------- */
  function drawCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background
    ctx.fillStyle = "#071221";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // grid
    ctx.strokeStyle = "#0f1a2b";
    ctx.lineWidth = 1;
    for (let i = 0; i <= MAP_SIZE; i += 5) {
      const px = i * STUD_TO_PX;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, canvas.height);
      ctx.stroke();
    }

    // mud patches
    mudPatches.forEach((mp) => {
      const p = toPx(mp.pos);
      ctx.beginPath();
      ctx.fillStyle = "rgba(80,50,20,0.45)";
      ctx.arc(p.x, p.y, mp.radius * STUD_TO_PX, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(110,80,40,0.7)";
      ctx.stroke();
    });

    // whirlpools (visual)
    whirlpools.forEach((w) => {
      const p = toPx(w.pos);
      ctx.beginPath();
      ctx.fillStyle = "rgba(10,120,220,0.28)";
      ctx.arc(p.x, p.y, w.radius * STUD_TO_PX, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(30,160,255,0.6)";
      ctx.stroke();
      // inner swirl indicator
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.arc(p.x, p.y, (w.radius * STUD_TO_PX) * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    });

    // parasites indicator (near enemy)
    parasites.forEach(() => {
      const ePx = toPx(enemy.pos);
      ctx.fillStyle = "#7e2b7e";
      ctx.beginPath();
      ctx.arc(ePx.x + 12, ePx.y - 12, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // doppels
    doppels.forEach((d) => {
      const p = toPx(d.pos);
      ctx.fillStyle = d.invulnerable ? "rgba(240,240,240,0.9)" : "rgba(200,200,200,0.7)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // blackholes (visual as dark circle)
    blackHoles.forEach((bh) => {
      const p = toPx(bh.pos);
      ctx.beginPath();
      ctx.fillStyle = "rgba(10,10,10,0.95)";
      ctx.arc(p.x, p.y, bh.radius * STUD_TO_PX, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(120,60,200,0.8)";
      ctx.stroke();
      // small countdown ring
      const remain = Math.max(0, bh.explodeAt - Date.now());
      const fraction = Math.max(0, Math.min(1, remain / DURATIONS.BLACK_HOLE_EXPLOSION_DELAY));
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255,255,255,${0.4 * fraction})`;
      ctx.lineWidth = 2;
      ctx.arc(p.x, p.y, (bh.radius + 0.6) * STUD_TO_PX, 0, Math.PI * 2 * fraction);
      ctx.stroke();
    });

    // enemy
    const ePx = toPx(enemy.pos);
    ctx.fillStyle = "#d25a5a";
    ctx.beginPath();
    ctx.arc(ePx.x, ePx.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "10px Arial";
    ctx.fillText(`${enemy.name} (${enemy.hp})`, ePx.x - 24, ePx.y - 14);

    // player
    const pPx = toPx(player.pos);
    ctx.fillStyle = "#4f8fd2";
    ctx.beginPath();
    ctx.arc(pPx.x, pPx.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "10px Arial";
    ctx.fillText(`${player.name} (${player.hp})`, pPx.x - 20, pPx.y - 14);

    // aim line
    ctx.strokeStyle = "rgba(220,220,60,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pPx.x, pPx.y);
    const aimPx = toPx(aimTarget);
    ctx.lineTo(aimPx.x, aimPx.y);
    ctx.stroke();
  }

  // Click/aim mapping uses the canvas
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

  /* ---------------------------
     Combat helpers (combined)
     --------------------------- */

  function applyDamageToFighter(f: Fighter, amount: number) {
    if (f.statuses?.invincible && f.statuses.invincible > 0) return f;
    return { ...f, hp: Math.max(0, Math.round(f.hp - amount)) };
  }
  function healFighter(f: Fighter, amount: number) {
    const cap = f.power === "fleur" ? Math.min(GAMEPLAY_CONSTANTS.FLEUR_MAX_HP, f.maxHp) : f.maxHp;
    return { ...f, hp: Math.min(cap, Math.round(f.hp + amount)) };
  }

  /* ---------------------------
     Player simple actions
     --------------------------- */

  function playerPunch() {
    if (waiting || gameOver || !startConfirmed) return;
    lastPlayerCombatAtRef.current = Date.now();
    regenActiveRef.current = false;
    const range = ATTACK_RANGES.MELEE;
    if (distance(player.pos, enemy.pos) <= range) {
      setEnemy((e) => applyDamageToFighter(e, DAMAGE_VALUES.MELEE));
      pushLog(`You punch the enemy for ${DAMAGE_VALUES.MELEE} damage.`);
    } else {
      pushLog("You swing at the air — out of range for fists.");
    }
    setTimeout(() => {
      if (!checkGameOver(player, enemy)) enemyAIAction();
    }, DURATIONS.ENEMY_ACTION_DELAY);
  }

  // Berserker specialized attack (from SuperShowdown2)
  function berserkerAttack() {
    if (!canUseCooldown("berserk")) {
      pushLog("Berserker attack reloading...");
      return;
    }
    const hpNow = player.hp;
    let dmg = DAMAGE_VALUES.BERSERKER_NORMAL;
    let reloadMs = DURATIONS.BERSERKER_NORMAL;
    const range = ATTACK_RANGES.BERSERKER;
    if (hpNow < 10) {
      dmg = DAMAGE_VALUES.BERSERKER_CRITICAL;
      reloadMs = DURATIONS.BERSERKER_CRITICAL;
    } else if (hpNow < 50) {
      dmg = DAMAGE_VALUES.BERSERKER_LOW;
      reloadMs = DURATIONS.BERSERKER_LOW;
    }
    const dir = { x: aimTarget.x - player.pos.x, y: aimTarget.y - player.pos.y };
    const len = Math.hypot(dir.x, dir.y) || 0.0001;
    const norm = { x: dir.x / len, y: dir.y / len };
    const width = ATTACK_WIDTHS.BERSERKER;
    if (isInBeam(player.pos, norm, width, range, enemy.pos)) {
      setEnemy((e) => applyDamageToFighter(e, dmg));
      pushLog(`Berserker hits for ${dmg} damage.`);
    } else {
      pushLog("Berserker swings and misses.");
    }
    setCooldown("berserk", reloadMs);
    setTimeout(() => {
      if (!checkGameOver(player, enemy)) enemyAIAction();
    }, DURATIONS.ENEMY_ACTION_DELAY);
  }

  /* ---------------------------
     Aim-fire handling (merged)
     --------------------------- */
  function playerFireAim() {
    if (waiting || gameOver || !startConfirmed) return;

    // reset idle regen tracking
    lastPlayerCombatAtRef.current = Date.now();
    regenActiveRef.current = false;

    if (player.power === "doppelganger") {
      const sliceRange = ATTACK_RANGES.DOPPELGANGER;
      if (distance(player.pos, enemy.pos) <= sliceRange) {
        setEnemy((e) => applyDamageToFighter(e, DAMAGE_VALUES.DOPPELGANGER_SLICE));
        pushLog(`You (Doppelganger) slice the enemy for ${DAMAGE_VALUES.DOPPELGANGER_SLICE} damage.`);
      } else {
        pushLog("Your slice missed.");
      }
      setTimeout(() => {
        if (!checkGameOver(player, enemy)) enemyAIAction();
      }, DURATIONS.ENEMY_ACTION_DELAY);
      return;
    }

    if (player.power === "berserker") return berserkerAttack();

    if (player.power === "regen") {
      const dir = { x: aimTarget.x - player.pos.x, y: aimTarget.y - player.pos.y };
      const len = Math.hypot(dir.x, dir.y) || 0.0001;
      const norm = { x: dir.x / len, y: dir.y / len };
      if (isInBeam(player.pos, norm, ATTACK_WIDTHS.REGEN, ATTACK_RANGES.REGEN, enemy.pos)) {
        setEnemy((e) => {
          const ne = applyDamageToFighter(e, DAMAGE_VALUES.REGEN_BEAM);
          pushLog(`Regen beam hits for ${DAMAGE_VALUES.REGEN_BEAM} damage.`);
          return ne;
        });
      } else {
        pushLog("Regen beam missed.");
      }
      setIsAiming(false);
      setTimeout(() => {
        if (!checkGameOver(player, enemy)) enemyAIAction();
      }, DURATIONS.ENEMY_ACTION_DELAY);
      return;
    }

    const dir = { x: aimTarget.x - player.pos.x, y: aimTarget.y - player.pos.y };
    const len = Math.hypot(dir.x, dir.y) || 0.0001;
    const norm = { x: dir.x / len, y: dir.y / len };
    const range = ATTACK_RANGES.BASIC_BEAM;
    const width = ATTACK_WIDTHS.BASIC_BEAM;
    if (isInBeam(player.pos, norm, width, range, enemy.pos)) {
      setEnemy((e) => applyDamageToFighter(e, DAMAGE_VALUES.BASIC_BEAM));
      pushLog(`You fire and hit the enemy for ${DAMAGE_VALUES.BASIC_BEAM} damage.`);
    } else {
      pushLog(`You fire toward (${aimTarget.x.toFixed(1)}, ${aimTarget.y.toFixed(1)}) and hit nothing.`);
    }
    setIsAiming(false);
    setTimeout(() => {
      if (!checkGameOver(player, enemy)) enemyAIAction();
    }, DURATIONS.ENEMY_ACTION_DELAY);
  }

  /* ---------------------------
     Use power (combined logic)
     --------------------------- */
  const harmonyRef = useRef({ magRemaining: GAMEPLAY_CONSTANTS.HARMONY_MAG_SIZE, lastShotAt: 0, consecutiveHits: 0, lastHitAt: 0, reloadUntil: 0 });
  const hexStateRef = useRef({ hitsSinceReload: 0, reloadUntil: 0 });
  const lunarRef = useRef({ magRemaining: GAMEPLAY_CONSTANTS.LUNAR_MAG_SIZE, reloadUntil: 0 });
  const regenRef = useRef({ reloadUntil: 0 });
  const lunarStateRef = useRef({ lastMidnightAt: 0, midnightActiveUntil: 0 });
  const soleilStateRef = useRef({ lastTeleportAt: 0 });
  const swapRef = useRef({ nextSwapAt: 0 });

  const [lunarActive, setLunarActive] = useState(false);

  function playerUsePower() {
    if (waiting || gameOver || !startConfirmed) return;
    const pw = player.power;
    const ammo = ammoRef.current[pw] ?? 0;
    if (ammo <= 0) {
      pushLog("No ammo for your power.");
      return;
    }

    switch (pw) {
      case "fire":
      case "water":
      case "wind":
      case "earth":
      case "electricity":
      case "fauna":
      case "fleur":
      case "poison":
      case "celestial":
      case "ice":
      case "invisible": {
        const dir = { x: aimTarget.x - player.pos.x, y: aimTarget.y - player.pos.y };
        const len = Math.hypot(dir.x, dir.y) || 0.0001;
        const norm = { x: dir.x / len, y: dir.y / len };
        if (isInBeam(player.pos, norm, ATTACK_WIDTHS.BASIC_BEAM, ATTACK_RANGES.BASIC_BEAM, enemy.pos)) {
          setEnemy((e) => applyDamageToFighter(e, DAMAGE_VALUES.BASIC_BEAM));
          pushLog(`${pw} strikes true and deals ${DAMAGE_VALUES.BASIC_BEAM} damage.`);
        } else {
          pushLog(`${pw} fires and misses.`);
        }
        ammoRef.current[pw] = Math.max(0, ammo - 1);
        break;
      }

      case "mud": {
        const patch: MudPatch = { id: `mud-${Date.now()}`, pos: clampPos(aimTarget), radius: ATTACK_RADII.MUD_PATCH, createdAt: Date.now(), durationMs: DURATIONS.MUD_PATCH };
        setMudPatches((m) => [...m, patch]);
        ammoRef.current["mud"] = Math.max(0, ammo - 1);
        pushLog("You create a muddy pool beneath your target.");
        break;
      }

      case "parasite": {
        const dir = { x: aimTarget.x - player.pos.x, y: aimTarget.y - player.pos.y };
        const len = Math.hypot(dir.x, dir.y) || 0.0001;
        const norm = { x: dir.x / len, y: dir.y / len };
        if (isInBeam(player.pos, norm, ATTACK_WIDTHS.PARASITE, ATTACK_RANGES.PARASITE, enemy.pos)) {
          setEnemy((e) => applyDamageToFighter(e, DAMAGE_VALUES.PARASITE_INITIAL));
          setPlayer((p) => ({ ...p, hp: Math.min(p.maxHp, p.hp + DAMAGE_VALUES.PARASITE_HEAL) }));
          const pe: ParasiteEntity = { id: `par-${Date.now()}`, ownerId: player.id, targetEnemyId: enemy.id, nextAttackAt: Date.now() + DURATIONS.PARASITE_ATTACK_INTERVAL, expireAt: Date.now() + DURATIONS.PARASITE_LIFETIME };
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
        const range = ATTACK_RANGES.HARMONY;
        const width = ATTACK_WIDTHS.HARMONY;
        let hit = false;
        if (isInBeam(player.pos, norm, width, range, enemy.pos)) {
          setEnemy((e) => applyDamageToFighter(e, DAMAGE_VALUES.HARMONY));
          pushLog(`Harmony's note hits for ${DAMAGE_VALUES.HARMONY} damage.`);
          hit = true;
        } else {
          pushLog("Harmony's note misses.");
        }
        hs.magRemaining = Math.max(0, hs.magRemaining - 1);
        hs.lastShotAt = ts;
        if (hit) {
          if (ts - hs.lastHitAt <= GAMEPLAY_CONSTANTS.HARMONY_COMBO_WINDOW) {
            hs.consecutiveHits += 1;
          } else {
            hs.consecutiveHits = 1;
          }
          hs.lastHitAt = ts;
          if (hs.consecutiveHits >= GAMEPLAY_CONSTANTS.HARMONY_COMBO_REQUIREMENT) {
            setPlayer((pl) => ({ ...pl, statuses: { ...(pl.statuses || {}), invincible: Math.max(0, (pl.statuses?.invincible || 0) + GAMEPLAY_CONSTANTS.HARMONY_INVINCIBILITY_DURATION) } }));
            pushLog("Harmony's cadence grants you a short invincibility!");
            hs.consecutiveHits = 0;
          }
        }
        if (hs.magRemaining <= 0) {
          hs.reloadUntil = ts + DURATIONS.HARMONY_RELOAD;
          hs.magRemaining = GAMEPLAY_CONSTANTS.HARMONY_MAG_SIZE;
        }
        harmonyRef.current = hs;
        ammoRef.current["harmony"] = Math.max(0, ammo - 1);
        break;
      }

      case "berserker": {
        pushLog("Berserker is passive; use Berserker aim-fire for its active attack.");
        break;
      }

      case "regen": {
        setTimeout(() => {
          setPlayer((p) => ({ ...p, statuses: { ...(p.statuses || {}), regen: Math.max(0, (p.statuses?.regen || 0) + POWER_STATS.REGEN.totalTicks) } }));
          pushLog("Regen begins to mend your wounds (stronger).");
        }, DURATIONS.REGEN_ACTIVATION_DELAY);
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
        const hit = isInBeam(player.pos, norm, ATTACK_WIDTHS.HEX, ATTACK_RANGES.HEX, enemy.pos);
        if (hit) {
          setEnemy((e) => {
            const ne = applyDamageToFighter(e, DAMAGE_VALUES.HEX);
            const s = { ...(ne.statuses || {}) };
            s.hexStacks = Math.min(GAMEPLAY_CONSTANTS.HEX_MAX_STACKS, (s.hexStacks || 0) + 1);
            s.hexLastAt = Date.now();
            ne.statuses = s;
            pushLog(`Hex hits: ${s.hexStacks} stack(s) applied.`);
            return ne;
          });
          hexStateRef.current.hitsSinceReload += 1;
        } else {
          pushLog("Hex spell misses.");
        }
        if (hexStateRef.current.hitsSinceReload >= 3) {
          hexStateRef.current.reloadUntil = Date.now() + DURATIONS.HEX_RELOAD;
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
        let dmg = DAMAGE_VALUES.LUNAR_NORMAL;
        const lunarState = lunarStateRef.current;
        if (ts < lunarState.midnightActiveUntil) dmg *= GAMEPLAY_CONSTANTS.LUNAR_MIDNIGHT_DAMAGE_MULTIPLIER;
        if (isInBeam(player.pos, norm, ATTACK_WIDTHS.LUNAR, ATTACK_RANGES.LUNAR, enemy.pos)) {
          setEnemy((e) => applyDamageToFighter(e, dmg));
          pushLog(`Lunar hits for ${dmg} damage.`);
          lr.magRemaining -= 1;
        } else {
          pushLog("Lunar misses.");
          lr.magRemaining -= 1;
        }
        if (lr.magRemaining <= 0) {
          const reload = ts < lunarState.midnightActiveUntil ? DURATIONS.LUNAR_RELOAD_MIDNIGHT : DURATIONS.LUNAR_RELOAD_NORMAL;
          lr.reloadUntil = ts + reload;
          lr.magRemaining = GAMEPLAY_CONSTANTS.LUNAR_MAG_SIZE;
        }
        lunarRef.current = lr;
        ammoRef.current["lunar"] = Math.max(0, ammo - 1);
        break;
      }

      case "soleil": {
        const ts = Date.now();
        if (soleilStateRef.current.lastTeleportAt && ts - soleilStateRef.current.lastTeleportAt < DURATIONS.SOLEIL_TELEPORT_COOLDOWN) {
          pushLog("Soleil teleport not ready yet.");
          return;
        }
        const dist = distance(player.pos, aimTarget);
        if (dist <= ATTACK_RANGES.SOLEIL_TELEPORT) {
          setPlayer((p) => ({ ...p, pos: clampPos(aimTarget) }));
          soleilStateRef.current.lastTeleportAt = ts;
          ammoRef.current["soleil"] = Math.max(0, ammo - 1);
          pushLog("Soleil teleports to a nearby location.");
        } else {
          pushLog(`Teleport target too far for Soleil (must be within ${ATTACK_RANGES.SOLEIL_TELEPORT} studs).`);
        }
        break;
      }

      case "doppelganger": {
        const existing = doppels[0];
        if (!existing) {
          const d: Doppel = {
            id: `dup-${Date.now()}`,
            pos: clampPos({ x: player.pos.x + 1.5, y: player.pos.y }),
            hp: GAMEPLAY_CONSTANTS.DOPPELGANGER_HP,
            createdAt: Date.now(),
            durationMs: Infinity, // persists forever
            nextAttackAt: Date.now() + DURATIONS.DOPPELGANGER_ATTACK_INTERVAL,
            invulnerable: true, // make it persist and never die
          };
          setDoppels((ds) => [...ds, d]);
          ammoRef.current["doppelganger"] = Math.max(0, ammo - 1);
          pushLog("A doppelganger replica has been summoned and is invulnerable (will not expire).");
        } else {
          const ts = Date.now();
          if (swapRef.current.nextSwapAt > ts) {
            pushLog("Swap is on cooldown.");
            return;
          }
          swapRef.current.nextSwapAt = ts + DURATIONS.DOPPELGANGER_SWAP_COOLDOWN;
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
    }, DURATIONS.ENEMY_ACTION_DELAY);
  }

  /* ---------------------------
     Shop / Ownership helpers (from SuperShowdown)
     --------------------------- */
  const isOwned = (p: Power) => Boolean(ownedPowers[p]);

  // Attempt to buy a power. Returns true if owned after the call.
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

  // Simple Store UI action: buy without equipping
  function buyFromStore(pw: Power) {
    if (isOwned(pw)) {
      pushLog(`${pw} is already owned.`);
      return;
    }
    const ok = buyPower(pw);
    if (ok) {
      pushLog(`You now own ${pw}. You can equip it from the Change Power dropdown.`);
    }
  }

  /* ---------------------------
     Black hole creation helper
     - Example usage (if some power creates one) should set explodeAt = createdAt + 3000 ms and active true.
     --------------------------- */
  function createBlackHole(origin: Vec2, radius = ATTACK_RADII.BLACK_HOLE) {
    const now = Date.now();
    const bh: BlackHole = {
      id: `bh-${now}`,
      ownerId: player.id,
      pos: clampPos(origin),
      radius,
      createdAt: now,
      explodeAt: now + DURATIONS.BLACK_HOLE_EXPLOSION_DELAY, // explode after 3 seconds
      active: true,
    };
    setBlackHoles((b) => [...b, bh]);
    pushLog("A black hole was placed and will collapse shortly...");
  }

  /* ---------------------------
     Lunar Midnight (special)
     --------------------------- */
  function callMidnight() {
    if (player.power !== "lunar") {
      pushLog("Only Lunar can call Midnight.");
      return;
    }
    const ts = Date.now();
    if (ts - lunarStateRef.current.lastMidnightAt < DURATIONS.LUNAR_MIDNIGHT_COOLDOWN) {
      const remain = Math.ceil((DURATIONS.LUNAR_MIDNIGHT_COOLDOWN - (ts - lunarStateRef.current.lastMidnightAt)) / 1000);
      pushLog(`Midnight not ready. ${remain}s remaining.`);
      return;
    }
    lunarStateRef.current.lastMidnightAt = ts;
    lunarStateRef.current.midnightActiveUntil = ts + DURATIONS.LUNAR_MIDNIGHT_DURATION;
    setLunarActive(true);
    pushLog(`Midnight rises — Lunar power doubled for ${DURATIONS.LUNAR_MIDNIGHT_DURATION / 1000} seconds!`);
    setTimeout(() => {
      setLunarActive(false);
    }, DURATIONS.LUNAR_MIDNIGHT_DURATION);
  }

  /* ---------------------------
     Respawn & Game over (attempt purchases like SuperShowdown)
     --------------------------- */
  function respawnPlayer(immediate = true) {
    let appliedPower = chooseDeathPower ? deathPower : player.power;
    const cost = POWER_COSTS[appliedPower];

    // If not owned, attempt to buy at respawn time. If fails, fallback to fire.
    if (!isOwned(appliedPower) && cost > 0) {
      const ok = buyPower(appliedPower);
      if (!ok) {
        pushLog(`Not enough pixelcoins for ${appliedPower} on respawn. Respawning with Fire instead.`);
        appliedPower = "fire";
      }
    }

    const maxHp = appliedPower === "fleur" ? GAMEPLAY_CONSTANTS.FLEUR_MAX_HP : GAMEPLAY_CONSTANTS.STANDARD_MAX_HP;
    setPlayer((prev) => ({
      ...prev,
      pos: clampPos(playerStart),
      hp: maxHp,
      maxHp,
      statuses: {},
      specialReady: true,
      atkBuff: 0,
      defBuff: 0,
      power: appliedPower,
    }));
    setMudPatches([]);
    setParasites([]);
    // don't remove doppels (they persist forever per request)
    setBlackHoles([]);
    pushLog(`You have respawned${chooseDeathPower ? ` with ${appliedPower}` : ""}.`);
    if (!gameOver) {
      setTimeout(() => {
        enemyAIAction();
      }, 500);
    }
    lastPlayerCombatAtRef.current = Date.now();
    regenActiveRef.current = false;
  }

  /* ---------------------------
     Game over check
     --------------------------- */
  function checkGameOver(p: Fighter, e: Fighter) {
    if (p.hp <= 0 && e.hp <= 0) {
      pushLog("Both fighters die — a double KO.");
      setGameOver(true);
      return true;
    }
    if (p.hp <= 0) {
      pushLog(`${p.name} has died.`);
      if (autoRespawn) {
        setTimeout(() => {
          respawnPlayer(true);
        }, DURATIONS.STATUS_TICK);
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

  /* ---------------------------
     Enemy AI (merged behavior including hex effect)
     --------------------------- */
  function enemyAIAction() {
    if (gameOver) return;
    const delay = DURATIONS.ENEMY_TURN_DELAY_MIN + randInt(0, DURATIONS.ENEMY_TURN_DELAY_MAX - DURATIONS.ENEMY_TURN_DELAY_MIN);
    setTimeout(() => {
      if (gameOver) return;
      if (enemy.statuses?.stunned && enemy.statuses.stunned > 0) {
        setEnemy((e) => ({ ...e, statuses: { ...(e.statuses || {}), stunned: Math.max(0, (e.statuses?.stunned || 0) - 1) } }));
        pushLog(`${enemy.name} is stunned and misses a turn.`);
        return;
      }

      const hexStacks = enemy.statuses?.hexStacks || 0;
      const dmgMult = 1 - Math.min(GAMEPLAY_CONSTANTS.HEX_MAX_DAMAGE_REDUCTION, GAMEPLAY_CONSTANTS.HEX_DAMAGE_REDUCTION_PER_STACK * hexStacks);

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
          return {
            ...e,
            pos: clampPos({ x: e.pos.x + (dir.x / len) * step, y: e.pos.y + (dir.y / len) * step }),
          };
        });
        pushLog(`${enemy.name} advances.`);
      }
    }, delay);
  }

  /* ---------------------------
     Reset match
     --------------------------- */
  function resetMatch() {
    const startingPower = chooseDeathPower && startConfirmed ? deathPower : "fire";
    setPlayer({
      id: "player-1",
      name: "You",
      pos: clampPos(playerStart),
      hp: 100,
      maxHp: 100,
      attack: 18,
      defense: 6,
      power: startingPower,
      specialReady: true,
      statuses: {},
      atkBuff: 0,
      defBuff: 0,
    });
    setEnemy({
      id: "enemy-1",
      name: "Champion",
      pos: clampPos(enemyStart),
      hp: 100,
      maxHp: 100,
      attack: 16,
      defense: 5,
      power: POWERS[randInt(0, POWERS.length - 1)],
      specialReady: true,
      statuses: {},
      atkBuff: 0,
      defBuff: 0,
    });
    setTurnLog(["A challenger enters the arena... prepare to fight to the death!"]);
    setWaiting(false);
    setGameOver(false);
    setBears([]);
    setWhirlpools([]);
    setPlants([]);
    setBlackHoles([]);
    setMudPatches([]);
    setParasites([]);
    // Preserve existing doppels (persist per earlier request)
    cooldownsRef.current = {};
    ammoRef.current = { ...DEFAULT_AMMO };
    lastPlayerCombatAtRef.current = Date.now();
    regenActiveRef.current = false;
  }

  /* ---------------------------
     Input handling (keyboard / mouse / mobile joystick)
     --------------------------- */
  const isTouchDevice =
    typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // prevent space
      if (e.code === "Space" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      // E toggles aiming
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
      if (moved) {
        setAimTarget((t) => clampPos(t));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameOver, startConfirmed, isAiming]);

  useEffect(() => {
    function onMouseUp() {
      if (isAiming && !isTouchDevice) {
        playerFireAim();
      }
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
    const newAim = clampPos({
      x: player.pos.x + deltaStuds.x,
      y: player.pos.y + deltaStuds.y,
    });
    setAimTarget(newAim);
  }
  function onJoystickTouchEnd() {
    if (!joystickActive) return;
    setJoystickActive(false);
    joystickOriginRef.current = null;
    lastPlayerCombatAtRef.current = Date.now();
    regenActiveRef.current = false;
    playerFireAim();
  }

  /* ---------------------------
     Helpers: start, setPower, cooldowns
     (setPlayerPower tries to buy if not owned)
     --------------------------- */
  function confirmStart() {
    const cost = POWER_COSTS[player.power];
    if (!isOwned(player.power) && cost > 0) {
      const ok = buyPower(player.power);
      if (!ok) {
        pushLog(`Starting-power purchase failed. Starting with Fire instead.`);
        setPlayer((p) => ({ ...p, power: "fire" }));
      }
    }

    setStartConfirmed(true);
    pushLog("Match started. Choose an aim on the map and use your power.");
  }
  function setPlayerPower(pw: Power) {
    if (isOwned(pw)) {
      setPlayer((p) => ({ ...p, power: pw }));
      pushLog(`Equipped ${pw}.`);
      return;
    }
    // Attempt immediate purchase+equip
    const ok = buyPower(pw);
    if (ok) {
      setPlayer((p) => ({ ...p, power: pw }));
    }
  }

  function canUseCooldown(key: string) {
    return (cooldownsRef.current[key] || 0) <= Date.now();
  }
  function setCooldown(key: string, msFromNow: number) {
    cooldownsRef.current[key] = Date.now() + msFromNow;
  }

  /* ---------------------------
     3D Scene helpers (visuals)
     --------------------------- */
  const toScenePx = (v: Vec2) => {
    const xPx = (v.x / MAP_SIZE) * CANVAS_SIZE_PX;
    const zPx = (v.y / MAP_SIZE) * CANVAS_SIZE_PX;
    return { xPx, zPx };
  };

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
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform,
            width: dist,
            height: 10,
            transformOrigin: "0 50%",
            pointerEvents: "none",
            opacity: 0.45,
            background:
              "linear-gradient(90deg, rgba(255,255,120,0.0), rgba(255,255,120,0.35), rgba(255,255,120,0.0))",
            borderRadius: 6,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: endTransform,
            width: ringSize,
            height: ringSize,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,200,0.5)",
            boxShadow: "0 0 10px rgba(255,255,120,0.2)",
            pointerEvents: "none",
          }}
        />
      </>
    );
  }

  function Player3D({ f, size = 30 }: { f: Fighter; size?: number }) {
    const { xPx, zPx } = toScenePx(f.pos);
    const transform = `translate3d(${xPx - size / 2}px, 0px, ${zPx - size / 2}px)`;
    const hpPct = Math.max(0, Math.round((f.hp / f.maxHp) * 100));
    return (
      <div
        className="scene-object player-3d"
        style={{
          position: "absolute",
          transformStyle: "preserve-3d",
          transform,
          width: size,
          height: size * 1.6,
          pointerEvents: "none",
        }}
        title={`${f.name} — ${f.hp}/${f.maxHp}`}
      >
        <div
          style={{
            transform: `translateZ(0px)`,
            width: "100%",
            height: "70%",
            borderRadius: 8,
            background: f.id === player.id ? "linear-gradient(#4f8fd2,#2b6fb0)" : "linear-gradient(#d25a5a,#a83737)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -8,
            left: "50%",
            transform: "translateX(-50%)",
            width: size * 0.7,
            height: size * 0.45,
            borderRadius: "50% 50% 40% 40%",
            background: "rgba(255,255,255,0.06)",
            boxShadow: "inset 0 2px 4px rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -6,
            left: "50%",
            transform: "translateX(-50%) rotateX(90deg) translateZ(-0.1px)",
            width: size,
            height: size * 0.25,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.45)",
            filter: "blur(6px)",
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -18,
            left: "50%",
            transform: "translateX(-50%)",
            width: size * 1.2,
            height: 6,
            background: "rgba(0,0,0,0.5)",
            borderRadius: 6,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div
            style={{
              width: `${hpPct}%`,
              height: "100%",
              background: hpPct > 50 ? "#4caf50" : hpPct > 20 ? "#ff9800" : "#f44336",
              transition: "width 200ms linear",
            }}
          />
        </div>
      </div>
    );
  }

  /* ---------------------------
     UI & render
     --------------------------- */
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", fontFamily: "Inter, Arial, sans-serif", color: "#cfe" }}>
      <h2>Insane Showdown — 3D Arena with Your Avatar (All Powers)</h2>
      
      {/* 3D Scene Container */}
      {startConfirmed && avatarData?.skin && (
        <div 
          ref={containerRef}
          style={{
            width: CANVAS_SIZE_PX,
            height: CANVAS_SIZE_PX,
            margin: "0 auto",
            position: "relative",
            border: "2px solid #334",
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: '20px'
          }}
        />
      )}

      {!startConfirmed && (
        <div style={{ border: "1px solid #334", padding: 12, marginBottom: 12, borderRadius: 8 }}>
          <h3>Match Setup</h3>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
            <div>Pixelcoins: <strong>{pixelcoins}</strong></div>
            <div style={{ color: serverAvailable ? "#8f8" : "#999", fontSize: 12 }}>
              {serverAvailable ? "Saved to server" : "Local (or server unreachable)"}
            </div>
          </div>

          <label style={{ display: "block", marginBottom: 8 }}>
            <input type="checkbox" checked={chooseDeathPower} onChange={(e) => setChooseDeathPower(e.target.checked)} /> Choose a power to have when you die (applies on next respawn)
          </label>
          {chooseDeathPower && (
            <label style={{ display: "block", marginBottom: 8 }}>
              Power on death:
              <select style={{ marginLeft: 8 }} value={deathPower} onChange={(e) => setDeathPower(e.target.value as Power)}>
                {POWERS.map((p) => (
                  <option key={p} value={p}>
                    {p} {isOwned(p) ? "(owned)" : POWER_COSTS[p] ? `(${POWER_COSTS[p]} PC)` : "(free)"}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label style={{ display: "block", marginBottom: 8 }}>
            Starting power:
            <select value={player.power} onChange={(e) => setPlayerPower(e.target.value as Power)} style={{ marginLeft: 8 }}>
              {POWERS.map((p) => (
                <option key={p} value={p} disabled={!isOwned(p) && POWER_COSTS[p] > pixelcoins}>
                  {p} {isOwned(p) ? "(owned)" : POWER_COSTS[p] ? `(${POWER_COSTS[p]} PC)` : "(free)"}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            <input type="checkbox" checked={autoRespawn} onChange={(e) => setAutoRespawn(e.target.checked)} /> Auto-respawn immediately upon death (join back into same server)
          </label>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={confirmStart} style={{ padding: "8px 12px" }}>
              Confirm & Start Match
            </button>
            <button onClick={() => { setPixelcoins((p) => p + 50); pushLog("Added 50 pixelcoins (dev)."); }} style={{ padding: "8px 12px" }}>
              +50 PC (dev)
            </button>
            <button onClick={() => { localStorage.removeItem("supershowdown_ownedPowers"); localStorage.removeItem("supershowdown_pixelcoins"); setOwnedPowers((prev) => prev); pushLog("Cleared local SuperShowdown save."); }} style={{ padding: "8px 12px" }}>
              Clear Local Save
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          {/* 3D Scene */}
          <div style={{ perspective: 1100, marginBottom: 8 }}>
            <div
              aria-hidden
              style={{
                width: CANVAS_SIZE_PX,
                height: CANVAS_SIZE_PX,
                margin: "0 auto",
                position: "relative",
                transformStyle: "preserve-3d",
                background: "linear-gradient(#071018,#041018)",
                borderRadius: 8,
                boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
                overflow: "hidden",
              }}
            >
              {/* ground plane container */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: "100%",
                  transformStyle: "preserve-3d",
                  transform: `rotateX(60deg) translateZ(-${CANVAS_SIZE_PX * 0.15}px)`,
                  transformOrigin: "center center",
                  pointerEvents: "none",
                }}
              >
                <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", backgroundColor: "#7f7f7f", transform: "translateZ(0px)" }} />

                {/* Entities */}
                {whirlpools.map((w) => {
                  const { xPx, zPx } = toScenePx(w.pos);
                  const size = w.radius * 2 * STUD_TO_PX;
                  const transform = `translate3d(${xPx - size / 2}px, 0px, ${zPx - size / 2}px)`;
                  return (
                    <div key={w.id} style={{ position: "absolute", transform, width: size, height: size, pointerEvents: "none" }}>
                      <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, rgba(140,200,255,0.45), rgba(20,60,120,0.12))", boxShadow: "0 0 40px rgba(30,160,255,0.08)" }} />
                    </div>
                  );
                })}

                {plants.map((pl) => {
                  const { xPx, zPx } = toScenePx(pl.pos);
                  const size = pl.radius * 2 * STUD_TO_PX * 0.5;
                  const transform = `translate3d(${xPx - size / 2}px, 0px, ${zPx - size / 2}px)`;
                  return (
                    <div key={pl.id} style={{ position: "absolute", transform, width: size, height: size, pointerEvents: "none" }}>
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(#9fe29f,#68b268)", borderRadius: 6 }} />
                    </div>
                  );
                })}

                {blackHoles.map((bh) => {
                  const { xPx, zPx } = toScenePx(bh.pos);
                  const size = bh.radius * 2 * STUD_TO_PX;
                  const transform = `translate3d(${xPx - size / 2}px, 0px, ${zPx - size / 2}px)`;
                  const remain = Math.max(0, bh.explodeAt - Date.now());
                  const readyPct = 1 - Math.max(0, Math.min(1, remain / 3000));
                  return (
                    <div key={bh.id} style={{ position: "absolute", transform, width: size, height: size, pointerEvents: "none" }}>
                      <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "radial-gradient(ellipse at center, #111 0%, #000 70%)", boxShadow: "0 0 30px rgba(120,60,200,0.6)" }} />
                      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: size * readyPct, height: 4, background: "rgba(255,255,255,0.18)", borderRadius: 4 }} />
                    </div>
                  );
                })}

                {bears.map((b) => {
                  const { xPx, zPx } = toScenePx(b.pos);
                  const size = 22;
                  const transform = `translate3d(${xPx - size / 2}px, 0px, ${zPx - size / 2}px)`;
                  return (
                    <div key={b.id} style={{ position: "absolute", transform, width: size, height: size, pointerEvents: "none" }}>
                      <div style={{ width: "100%", height: "100%", borderRadius: 6, background: "linear-gradient(#7b4a28,#5a2f1a)" }} />
                    </div>
                  );
                })}

                {/* Mud patches */}
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

                {/* Parasites indicator (near enemy) */}
                {parasites.map((p) => {
                  const { xPx, zPx } = toScenePx(enemy.pos);
                  const transform = `translate3d(${xPx}px, 0px, ${zPx}px)`;
                  return (
                    <div key={p.id} style={{ position: "absolute", left: 0, top: 0, transform, pointerEvents: "none" }}>
                      <div style={{ transform: "translate3d(12px,-12px,0)", width: 12, height: 12, borderRadius: 6, background: "#7e2b7e" }} />
                    </div>
                  );
                })}

                {/* Doppel */}
                {doppels.map((d) => {
                  const { xPx, zPx } = toScenePx(d.pos);
                  const size = 14;
                  const transform = `translate3d(${xPx - size / 2}px, 0px, ${zPx - size / 2}px)`;
                  return (
                    <div key={d.id} style={{ position: "absolute", transform, width: size, height: size, pointerEvents: "none" }}>
                      <div style={{ width: "100%", height: "100%", borderRadius: 6, background: d.invulnerable ? "#fff" : "#ddd" }} />
                    </div>
                  );
                })}

                {/* Soleil teleport emblem at aimTarget if Soleil */}
                {player.power === "soleil" && (() => {
                  const { xPx, zPx } = toScenePx(aimTarget);
                  const transform = `translate3d(${xPx - 12}px, 0px, ${zPx - 12}px)`;
                  const ready = !soleilStateRef.current.lastTeleportAt || Date.now() - soleilStateRef.current.lastTeleportAt >= DURATIONS.SOLEIL_TELEPORT_COOLDOWN;
                  return (
                    <div key="soleil-sigil" style={{ position: "absolute", left: 0, top: 0, transform, pointerEvents: "none" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: ready ? "radial-gradient(circle at 30% 30%, #fff8d1, #ffd36a)" : "radial-gradient(circle at 30% 30%, #6b5d4a, #3d2f21)" }} />
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

          {/* Hidden canvas layer for accurate clicks */}
          <div style={{ textAlign: "center", marginTop: -CANVAS_SIZE_PX - 6 }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE_PX}
              height={CANVAS_SIZE_PX}
              style={{ opacity: 0, pointerEvents: "auto", cursor: isAiming ? "crosshair" : "crosshair" }}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
            />
            <div style={{ marginTop: 6, color: "#9fb", fontSize: 12 }}>
              Click the arena (hidden hit canvas) to set aim. On PC press E to enter aiming mode, move the mouse to adjust direction and release to fire. On mobile use the joystick.
            </div>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button onClick={playerPunch} disabled={waiting || gameOver || !startConfirmed} style={{ padding: "8px 12px" }}>
              Punch (Fist) — {DAMAGE_VALUES.MELEE} dmg, range {ATTACK_RANGES.MELEE}
            </button>
            <button onClick={playerFireAim} disabled={waiting || gameOver || !startConfirmed} style={{ padding: "8px 12px" }}>
              Aim Fire
            </button>
            <button onClick={playerUsePower} disabled={waiting || gameOver || !startConfirmed} style={{ padding: "8px 12px" }}>
              Use Power ({player.power}) — ammo: {ammoRef.current[player.power] ?? 0}
            </button>

            {player.power === "lunar" && (
              <button onClick={callMidnight} disabled={Date.now() - lunarStateRef.current.lastMidnightAt < DURATIONS.LUNAR_MIDNIGHT_COOLDOWN} style={{ padding: "8px 12px" }}>
                Call Midnight {Date.now() - lunarStateRef.current.lastMidnightAt < DURATIONS.LUNAR_MIDNIGHT_COOLDOWN ? `(${Math.ceil((DURATIONS.LUNAR_MIDNIGHT_COOLDOWN - (Date.now() - lunarStateRef.current.lastMidnightAt)) / 1000)}s)` : ""}
              </button>
            )}

            <button onClick={resetMatch} style={{ marginLeft: "auto", padding: "8px 12px" }}>
              Reset Match
            </button>
          </div>

          <div style={{ marginTop: 8, fontSize: 13 }}>
            <div>
              Map: {MAP_SIZE} x {MAP_SIZE} studs
            </div>
            <div>
              Aim: click on the arena to set target (current: {aimTarget.x.toFixed(1)}, {aimTarget.y.toFixed(1)})
            </div>
            <div style={{ marginTop: 6 }}>Controls: Move with arrow keys / WASD. Enemy will act after your turn.</div>
          </div>

          {isTouchDevice && startConfirmed && (
            <div
              onTouchStart={onJoystickTouchStart}
              onTouchMove={onJoystickTouchMove}
              onTouchEnd={onJoystickTouchEnd}
              style={{
                position: "fixed",
                right: 18,
                bottom: 18,
                width: 110,
                height: 110,
                borderRadius: 999,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                touchAction: "none",
              }}
            >
              <div style={{ width: 60, height: 60, borderRadius: 999, background: "rgba(255,255,255,0.06)" }} />
            </div>
          )}
        </div>

        <div style={{ width: 360 }}>
          <div style={{ background: "#06101a", padding: 10, borderRadius: 8 }}>
            <h3 style={{ margin: "4px 0" }}>{player.name}</h3>
            <div>
              HP: {player.hp}/{player.maxHp}
            </div>
            <div>
              Pixelcoins: <strong>{pixelcoins}</strong>
            </div>
            <div>
              Power: <strong style={{ textTransform: "capitalize" }}>{player.power} {isOwned(player.power) ? "(owned)" : `(${POWER_COSTS[player.power]} PC)`}</strong>
            </div>
            <div>Special Ready: {player.specialReady ? "Yes" : "No"}</div>

            <div style={{ marginTop: 6 }}>
              <label>
                Change power:
                <select value={player.power} onChange={(e) => setPlayerPower(e.target.value as Power)} disabled={waiting || gameOver} style={{ marginLeft: 8 }}>
                  {POWERS.map((p) => (
                    <option key={p} value={p} disabled={!isOwned(p) && POWER_COSTS[p] > pixelcoins}>
                      {p} {isOwned(p) ? "(owned)" : POWER_COSTS[p] ? `(${POWER_COSTS[p]} PC)` : "(free)"}
                    </option>
                  ))}
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
                    <div style={{ fontSize: 12, color: "#9ab" }}>
                      {isOwned(p) ? "Owned" : `${POWER_COSTS[p]} pixelcoins`}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => buyFromStore(p)}
                      disabled={isOwned(p) || POWER_COSTS[p] > pixelcoins}
                      style={{ flex: 1, padding: "6px 8px" }}
                    >
                      {isOwned(p) ? "Owned" : `Buy (${POWER_COSTS[p]})`}
                    </button>
                    <button
                      onClick={() => { if (isOwned(p)) { setPlayer((pl) => ({ ...pl, power: p })); pushLog(`Equipped ${p}.`); } }}
                      disabled={!isOwned(p)}
                      style={{ padding: "6px 8px" }}
                    >
                      Equip
                    </button>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #123", marginTop: 8 }} />
            <h4 style={{ margin: "6px 0" }}>Enemy</h4>
            <div>{enemy.name}</div>
            <div>
              HP: {enemy.hp}/{enemy.maxHp}
            </div>
            <div>
              Power: <strong style={{ textTransform: "capitalize" }}>{enemy.power}</strong>
            </div>
            <hr style={{ border: "none", borderTop: "1px solid #123" }} />
            <h4 style={{ margin: "6px 0" }}>Entities</h4>
            <div>Bears: {bears.length}</div>
            <div>Whirlpools: {whirlpools.length}</div>
            <div>Plants: {plants.length}</div>
            <div>Black Holes: {blackHoles.length}</div>
            <div>Mud patches: {mudPatches.length}</div>
            <div>Parasites: {parasites.length}</div>
            <div>Doppelgangers: {doppels.length} (persistent)</div>
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
            <button
              onClick={() => {
                if (chooseDeathPower) {
                  setPlayer((p) => ({ ...p, power: deathPower }));
                  pushLog(`On respawn you will wield ${deathPower}.`);
                }
                respawnPlayer();
                setGameOver(false);
              }}
              style={{ padding: "8px 12px" }}
            >
              Respawn / Reset (join back)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
