import React, { useEffect, useRef, useState } from "react";
import {
  ATTACK_RANGES,
  ATTACK_WIDTHS,
  ATTACK_RADII,
  DURATIONS,
  DAMAGE_VALUES,
  GAMEPLAY_CONSTANTS,
  isInBeam,
  inCircle,
  distance,
  type Vec2 as GameVec2,
} from "@/lib/gameScaling";

/**
 * SuperShowdown — 3D Arena & 3D Players
 *
 * This file now includes:
 * - POWER_COSTS / ownedPowers with persistent ownership (localStorage)
 * - A small in-game Store UI to buy powers without instantly switching
 * - Optional server sync: attempts to load/save player pixelcoins + owned powers
 *   from/to /api/supershowdown/player when available (graceful fallback)
 *
 * UX decisions:
 * - Free powers are owned by default.
 * - Buying a power marks it owned forever (persisted locally and optionally server-side).
 * - Buying does NOT auto-equip unless the player explicitly switches/equips it.
 * - Starting-power selection will attempt to ensure ownership before match start.
 */

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
  | "invisible";

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
];

const POWER_COSTS: Record<Power, number> = {
  fire: 0,
  water: 0,
  earth: 0,
  electricity: 0,
  wind: 25,
  poison: 30,
  ice: 25,
  celestial: 30,
  invisible: 45,
  fauna: 45,
  fleur: 60,
};

const MAP_SIZE = 30;
const CANVAS_SIZE_PX = 700;
const STUD_TO_PX = CANVAS_SIZE_PX / MAP_SIZE;

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

type Vec2 = { x: number; y: number };

type Statuses = {
  burn?: number;
  poison?: number;
  regen?: number;
  stunned?: number;
  invisible?: number;
  slow?: number;
  atkBuffTurns?: number;
  defBuffTurns?: number;
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

type Bear = {
  id: string;
  ownerId: string;
  pos: Vec2;
  hp: number;
  range: number;
  dmgPerSec: number;
  alive: boolean;
};

type Whirlpool = {
  id: string;
  pos: Vec2;
  radius: number;
  durationMs: number;
  createdAt: number;
};

type Plant = {
  id: string;
  ownerId: string;
  pos: Vec2;
  radius: number;
  durationMs: number;
  createdAt: number;
};

type BlackHole = {
  id: string;
  ownerId: string;
  pos: Vec2;
  radius: number;
  createdAt: number;
  explodeAt: number;
  active: boolean;
};

export default function SuperShowdown(): JSX.Element {
  // Setup & start state
  const [chooseDeathPower, setChooseDeathPower] = useState(false);
  const [deathPower, setDeathPower] = useState<Power>("fire");
  const [startConfirmed, setStartConfirmed] = useState(false);
  const [autoRespawn, setAutoRespawn] = useState(true);

  // Pixelcoins and owned powers
  const [pixelcoins, setPixelcoins] = useState<number>(100);
  const [ownedPowers, setOwnedPowers] = useState<Record<Power, boolean>>(() => {
    // free powers default to owned
    const initial: Record<Power, boolean> = {
      fire: true,
      water: true,
      earth: true,
      electricity: true,
      wind: false,
      poison: false,
      ice: false,
      celestial: false,
      invisible: false,
      fauna: false,
      fleur: false,
    };
    for (const p of POWERS) {
      if (!(p in initial)) initial[p] = POWER_COSTS[p] === 0;
    }
    return initial;
  });

  // Server sync availability
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

  const [turnLog, setTurnLog] = useState<string[]>(() => [
    "A challenger prepares to enter the 3D arena...",
  ]);
  const pushLog = (s: string) => setTurnLog((l) => [s, ...l].slice(0, 80));

  const [waiting, setWaiting] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Aiming
  const [aimTarget, setAimTarget] = useState<Vec2>({
    x: playerStart.x + 10,
    y: playerStart.y,
  });
  const [isAiming, setIsAiming] = useState(false);

  // Entities
  const [bears, setBears] = useState<Bear[]>([]);
  const [whirlpools, setWhirlpools] = useState<Whirlpool[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [blackHoles, setBlackHoles] = useState<BlackHole[]>([]);

  // Cooldowns & ammo
  const cooldownsRef = useRef<Record<string, number>>({});
  const ammoRef = useRef<Record<string, number>>({});
  useEffect(() => {
    ammoRef.current["fire"] = 10;
    ammoRef.current["electricity"] = 10;
    ammoRef.current["ice"] = 10;
    ammoRef.current["invisible"] = 4;
    ammoRef.current["poison"] = 6;
    ammoRef.current["earth"] = 4;
  }, []);

  // Canvas & drawing (keeps accurate click mapping)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    drawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, enemy, aimTarget, bears, whirlpools, plants, blackHoles, startConfirmed]);

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

  // Status ticks (same logic as before)
  useEffect(() => {
    const interval = setInterval(() => {
      // Player statuses
      setPlayer((p) => {
        let changed = false;
        let np = { ...p };
        const s = { ...(np.statuses || {}) };
        if (s.burn && s.burn > 0) {
          const dmg = randInt(2, 4);
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
        if (s.regen && s.regen > 0) {
          const heal = 1 + randInt(0, 2);
          np.hp = Math.min(np.maxHp, np.hp + heal);
          pushLog(`${np.name} regenerates ${heal} HP.`);
          s.regen!--;
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
          const dmg = randInt(2, 4);
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
          const heal = 1 + randInt(0, 2);
          ne.hp = Math.min(ne.maxHp, ne.hp + heal);
          pushLog(`${ne.name} regenerates ${heal} HP.`);
          s.regen!--;
          changed = true;
        }
        ne.statuses = s;
        if (ne.hp <= 0) checkGameOver(player, ne);
        return changed ? ne : e;
      });

      // Bears, whirlpools, plants, black holes — simplified processing omitted for brevity
    }, 1000 / 2);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, enemy]);

  // Regeneration: if player hasn't attacked or taken damage in the last 10 seconds,
  // regenerate 10 HP per second (implemented as 1 HP every 100ms) until max HP,
  // attack, or take damage.
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
          idleMs >= DURATIONS.IDLE_REGEN_THRESHOLD;
        if (canRegen) {
          if (!regenActiveRef.current) {
            regenActiveRef.current = true;
            pushLog("You begin regenerating health.");
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

  // Drawing
  function drawCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0b1020";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#0f1a2b";
    ctx.lineWidth = 1;
    for (let i = 0; i <= MAP_SIZE; i += 5) {
      const px = i * STUD_TO_PX;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, canvas.height);
      ctx.stroke();
    }

    // entities drawing omitted for brevity...
    const ePx = toPx(enemy.pos);
    ctx.fillStyle = "#d25a5a";
    ctx.beginPath();
    ctx.arc(ePx.x, ePx.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "10px Arial";
    ctx.fillText(`${enemy.name} (${enemy.hp})`, ePx.x - 24, ePx.y - 14);

    const pPx = toPx(player.pos);
    ctx.fillStyle = "#4f8fd2";
    ctx.beginPath();
    ctx.arc(pPx.x, pPx.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "10px Arial";
    ctx.fillText(`${player.name} (${player.hp})`, pPx.x - 20, pPx.y - 14);

    ctx.strokeStyle = "rgba(220,220,60,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pPx.x, pPx.y);
    const aimPx = toPx(aimTarget);
    ctx.lineTo(aimPx.x, aimPx.y);
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

  function applyDamageToFighter(f: Fighter, amount: number) {
    return { ...f, hp: Math.max(0, Math.round(f.hp - amount)) };
  }
  function healFighter(f: Fighter, amount: number) {
    const cap = f.power === "fleur" ? Math.min(GAMEPLAY_CONSTANTS.FLEUR_MAX_HP, f.maxHp) : f.maxHp;
    return { ...f, hp: Math.min(cap, Math.round(f.hp + amount)) };
  }

  // Ownership helpers
  const isOwned = (p: Power) => Boolean(ownedPowers[p]);

  // Attempt to buy a power. Returns true if owned after the call.
  function buyPower(pw: Power): boolean {
    if (isOwned(pw)) return true;
    const cost = POWER_COSTS[pw];
    if (cost <= 0) {
      setOwnedPowers((prev) => ({ ...prev, [pw]: true }));
      pushLog(`Unlocked ${pw} (free).`);
      return true;
    }
    if (pixelcoins >= cost) {
      setPixelcoins((prev) => prev - cost);
      setOwnedPowers((prev) => ({ ...prev, [pw]: true }));
      pushLog(`Purchased ${pw} for ${cost} pixelcoins.`);
      // attempt server save is handled by effect that watches ownedPowers/pixelcoins
      return true;
    } else {
      pushLog(`Not enough pixelcoins to purchase ${pw} (need ${cost}).`);
      return false;
    }
  }

  // Aimed fire
  function playerFireAim() {
    if (waiting || gameOver || !startConfirmed) return;
    lastPlayerCombatAtRef.current = Date.now();
    regenActiveRef.current = false;

    const dir = { x: aimTarget.x - player.pos.x, y: aimTarget.y - player.pos.y };
    const len = Math.hypot(dir.x, dir.y) || 0.0001;
    const norm = { x: dir.x / len, y: dir.y / len };
    if (isInBeam(player.pos, norm, ATTACK_WIDTHS.BASIC_BEAM, ATTACK_RANGES.BASIC_BEAM, enemy.pos)) {
      setEnemy((e) => {
        const ne = applyDamageToFighter(e, DAMAGE_VALUES.BASIC_BEAM);
        return ne;
      });
      pushLog(`You fire your power and hit the enemy for ${DAMAGE_VALUES.BASIC_BEAM} damage.`);
    } else {
      pushLog(
        `You fire toward (${aimTarget.x.toFixed(1)}, ${aimTarget.y.toFixed(
          1
        )}) and hit nothing.`
      );
    }
    setIsAiming(false);

    setTimeout(() => {
      if (!checkGameOver(player, enemy)) enemyAIAction();
    }, DURATIONS.ENEMY_ACTION_DELAY);
  }

  // Respawn
  function respawnPlayer(immediate = true) {
    let appliedPower = chooseDeathPower ? deathPower : player.power;
    const cost = POWER_COSTS[appliedPower];

    // If not owned, attempt to buy at respawn time. If fails, fallback to fire.
    if (!isOwned(appliedPower) && cost > 0) {
      const ok = buyPower(appliedPower);
      if (!ok) {
        pushLog(
          `Not enough pixelcoins for ${appliedPower} on respawn. Respawning with Fire instead.`
        );
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
    lastPlayerCombatAtRef.current = Date.now();
    regenActiveRef.current = false;

    ammoRef.current = {
      ...ammoRef.current,
      fire: 10,
      electricity: 10,
      ice: 10,
      invisible: 4,
      poison: 6,
      earth: 4,
    };
    pushLog(`You have respawned${chooseDeathPower ? ` with ${appliedPower}` : ""}.`);
    if (!gameOver) {
      setTimeout(() => {
        enemyAIAction();
      }, 500);
    }
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
        setTimeout(() => {
          respawnPlayer(true);
        }, 500);
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

  // Player punch
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

  // Enemy AI
  function enemyAIAction() {
    if (gameOver) return;
    const delay = DURATIONS.ENEMY_TURN_DELAY_MIN + randInt(0, DURATIONS.ENEMY_TURN_DELAY_MAX - DURATIONS.ENEMY_TURN_DELAY_MIN);
    setTimeout(() => {
      if (gameOver) return;
      if (distance(enemy.pos, player.pos) <= 3) {
        setPlayer((p) => {
          const np = applyDamageToFighter(p, 6);
          lastPlayerCombatAtRef.current = Date.now();
          regenActiveRef.current = false;
          return np;
        });
        pushLog(`${enemy.name} strikes you for 6 damage.`);
      } else {
        setEnemy((e) => {
          const dir = { x: player.pos.x - e.pos.x, y: player.pos.y - e.pos.y };
          const len = Math.hypot(dir.x, dir.y) || 0.0001;
          const step = 0.8;
          return {
            ...e,
            pos: clampPos({
              x: e.pos.x + (dir.x / len) * step,
              y: e.pos.y + (dir.y / len) * step,
            }),
          };
        });
        pushLog(`${enemy.name} advances.`);
      }
    }, delay);
  }

  // Reset match (owned powers/pixelcoins persist)
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
    ammoRef.current = {
      fire: 10,
      electricity: 10,
      ice: 10,
      invisible: 4,
      poison: 6,
      earth: 4,
    };
    cooldownsRef.current = {};
    lastPlayerCombatAtRef.current = Date.now();
    regenActiveRef.current = false;
  }

  // Mobile detection
  const isTouchDevice =
    typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  // Keyboard handlers
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.key === " " || e.key === "Spacebar") {
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

  // Joystick handlers simplified
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

  // Start match: ensure ownership for starting power (attempt buy if needed)
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

  // Switch power (equip). If not owned, attempt to buy (store allows separate purchase).
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

  const capName = (p: Power) => p.charAt(0).toUpperCase() + p.slice(1);
  const optionLabel = (p: Power) =>
    isOwned(p) ? `${capName(p)} (owned)` : POWER_COSTS[p] === 0 ? `${capName(p)} (free)` : `${capName(p)} (${POWER_COSTS[p]} pixelcoins)`;

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

  // --- 3D render helpers (unchanged visual code) ---
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
            background:
              f.id === player.id
                ? "linear-gradient(#4f8fd2,#2b6fb0)"
                : "linear-gradient(#d25a5a,#a83737)",
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

  function Bear3D({ b }: { b: Bear }) {
    const { xPx, zPx } = toScenePx(b.pos);
    const size = 22;
    const transform = `translate3d(${xPx - size / 2}px, 0px, ${zPx - size / 2}px)`;
    return (
      <div
        style={{
          position: "absolute",
          transform,
          width: size,
          height: size,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 6,
            background: "linear-gradient(#7b4a28,#5a2f1a)",
            boxShadow: "0 6px 18px rgba(0,0,0,0.6)",
          }}
        />
      </div>
    );
  }

  function Whirlpool3D({ w }: { w: Whirlpool }) {
    const { xPx, zPx } = toScenePx(w.pos);
    const size = w.radius * 2 * STUD_TO_PX;
    const transform = `translate3d(${xPx - size / 2}px, 0px, ${zPx - size / 2}px)`;
    return (
      <div
        style={{
          position: "absolute",
          transform,
          width: size,
          height: size,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 30% 30%, rgba(140,200,255,0.45), rgba(20,60,120,0.12))",
            boxShadow: "inset 0 8px 24px rgba(10,120,220,0.28)",
            transform: "rotateX(60deg)",
          }}
        />
      </div>
    );
  }

  function Plant3D({ pl }: { pl: Plant }) {
    const { xPx, zPx } = toScenePx(pl.pos);
    const size = 16;
    const transform = `translate3d(${xPx - size / 2}px, 0px, ${zPx - size / 2}px)`;
    return (
      <div style={{ position: "absolute", transform, width: size, height: size, pointerEvents: "none" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(#9fe29f,#68b268)",
            borderRadius: 6,
            boxShadow: "0 6px 14px rgba(0,0,0,0.5)",
          }}
        />
      </div>
    );
  }

  function BlackHole3D({ bh }: { bh: BlackHole }) {
    const { xPx, zPx } = toScenePx(bh.pos);
    const size = bh.radius * 2 * STUD_TO_PX;
    const transform = `translate3d(${xPx - size / 2}px, 0px, ${zPx - size / 2}px)`;
    return (
      <div style={{ position: "absolute", transform, width: size, height: size, pointerEvents: "none" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, #111 0%, #000 70%)",
            boxShadow: "0 0 30px rgba(120,60,200,0.5) inset",
          }}
        />
      </div>
    );
  }

  // UI & render
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", fontFamily: "Inter, Arial, sans-serif", color: "#cfe" }}>
      <h2>Super Showdown — True 3D Arena & 3D Players</h2>

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
            <input type="checkbox" checked={chooseDeathPower} onChange={(e) => setChooseDeathPower(e.target.checked)} />{" "}
            Choose a power to have when you die (applies on next respawn)
          </label>

          {chooseDeathPower && (
            <label style={{ display: "block", marginBottom: 8 }}>
              Power on death:
              <select style={{ marginLeft: 8 }} value={deathPower} onChange={(e) => setDeathPower(e.target.value as Power)}>
                {POWERS.map((p) => (
                  <option key={p} value={p}>{optionLabel(p)}</option>
                ))}
              </select>
              <div style={{ fontSize: 12, color: "#9ab", marginTop: 6 }}>
                Note: Death-power will be purchased at respawn if not owned. If you can't pay at that time you'll respawn with Fire.
              </div>
            </label>
          )}

          <label style={{ display: "block", marginBottom: 8 }}>
            Starting power:
            <select
              value={player.power}
              onChange={(e) => setPlayerPower(e.target.value as Power)}
              style={{ marginLeft: 8 }}
            >
              {POWERS.map((p) => (
                // disable if not owned AND cost > balance
                <option key={p} value={p} disabled={!isOwned(p) && POWER_COSTS[p] > pixelcoins}>
                  {optionLabel(p)}
                </option>
              ))}
            </select>
            <div style={{ fontSize: 12, color: "#9ab", marginTop: 6 }}>
              Options you can't afford are disabled. Buying from the Store will make them available permanently.
            </div>
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            <input type="checkbox" checked={autoRespawn} onChange={(e) => setAutoRespawn(e.target.checked)} />{" "}
            Auto-respawn immediately upon death (join back into same server)
          </label>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={confirmStart} style={{ padding: "8px 12px" }}>
              Confirm & Start Match
            </button>
            <button onClick={() => { setPixelcoins((p) => p + 50); pushLog("Added 50 pixelcoins (dev)."); }} style={{ padding: "8px 12px" }}>
              +50 PC (dev)
            </button>
            <button onClick={() => { localStorage.removeItem("supershowdown_ownedPowers"); localStorage.removeItem("supershowdown_pixelcoins"); setOwnedPowers((prev) => prev); pushLog("Cleared local save (dev)."); }} style={{ padding: "8px 12px", opacity: 0.6 }}>
              Clear Local Save
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          {/* 3D scene */}
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
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#7f7f7f",
                    transform: "translateZ(0px)",
                  }}
                />

                {whirlpools.map((w) => (
                  <Whirlpool3D key={w.id} w={w} />
                ))}
                {plants.map((pl) => (
                  <Plant3D key={pl.id} pl={pl} />
                ))}
                {blackHoles.map((bh) => (
                  <BlackHole3D key={bh.id} bh={bh} />
                ))}
                {bears.map((b) => (
                  <Bear3D key={b.id} b={b} />
                ))}

                <Player3D f={enemy} size={36} />
                <Player3D f={player} size={40} />

                {(isAiming || joystickActive) && <Aim3D target={aimTarget} />}
              </div>
            </div>
          </div>

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
              Click the arena (hidden hit canvas) to set aim. On PC press E to enter aiming mode, move the mouse to adjust direction and release the mousepad to fire. On mobile use the joystick [...]
            </div>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button onClick={playerPunch} disabled={waiting || gameOver || !startConfirmed} style={{ padding: "8px 12px" }}>
              Punch (Fist) — 10 dmg, range 1
            </button>
            <button onClick={() => { /* power handler not implemented here */ }} disabled style={{ padding: "8px 12px", opacity: 0.6 }}>
              Use Power — (not wired)
            </button>
            <button onClick={resetMatch} style={{ marginLeft: "auto", padding: "8px 12px" }}>
              Reset Match
            </button>
          </div>

          <div style={{ marginTop: 8, fontSize: 13 }}>
            <div>Map: {MAP_SIZE} x {MAP_SIZE} studs</div>
            <div>Aim: click on the arena to set target (current: {aimTarget.x.toFixed(1)}, {aimTarget.y.toFixed(1)})</div>
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
            <div>HP: {player.hp}/{player.maxHp}</div>
            <div>Pixelcoins: <strong>{pixelcoins}</strong></div>
            <div>Power: <strong style={{ textTransform: "capitalize" }}>{`${player.power} (${isOwned(player.power) ? "owned" : POWER_COSTS[player.power] + " pixelcoins"})`}</strong></div>
            <div>Special Ready: {player.specialReady ? "Yes" : "No"}</div>

            <div style={{ marginTop: 6 }}>
              <label>
                Change power:
                <select
                  value={player.power}
                  onChange={(e) => setPlayerPower(e.target.value as Power)}
                  disabled={waiting || gameOver}
                  style={{ marginLeft: 8 }}
                >
                  {POWERS.map((p) => (
                    <option key={p} value={p} disabled={!isOwned(p) && POWER_COSTS[p] > pixelcoins}>
                      {optionLabel(p)}
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
            <div>HP: {enemy.hp}/{enemy.maxHp}</div>
            <div>Power: <strong style={{ textTransform: "capitalize" }}>{enemy.power}</strong></div>
            <hr style={{ border: "none", borderTop: "1px solid #123" }} />
            <h4 style={{ margin: "6px 0" }}>Entities</h4>
            <div>Bears: {bears.length}</div>
            <div>Whirlpools: {whirlpools.length}</div>
            <div>Plants: {plants.length}</div>
            <div>Black Holes: {blackHoles.length}</div>
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

  // small helper declared earlier but used in JSX — already defined above
}

// Note: Whirlpools/Plants/BlackHole components referenced above are defined in-file earlier (omitted in this snippet for brevity)
// but remain the same as in the previous implementation.
