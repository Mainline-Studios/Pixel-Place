import React, { useEffect, useRef, useState } from "react";

/**
 * MountainMarchSeries.tsx
 *
 * A self-contained React + TypeScript component implementing a simple "team climb the mountain" game.
 * New features in this version:
 *  - Shops spawn along the way. At a shop you can buy:
 *      * Medkit — 30 coins
 *      * Rope  — 70 coins
 *      * Flare — 100 coins
 *    You can only purchase items at a shop when you're near it (in-progress).
 *
 *  - Players can get coins by:
 *      * Buying with real money (simulated) — adds coins instantly
 *      * Converting PixelCoins (simulated balance) to game coins
 *      * Reaching the top of the mountain — awards 30 coins
 *
 *  - Items have in-game effects:
 *      * Medkit prevents a single death when a hazard would kill a player, restores stamina.
 *      * Rope automatically saves affected players at canyons (consumed per canyon encounter)
 *      * Flare reduces avalanche kill chance (consumed per avalanche)
 *
 *  - Existing features preserved:
 *      * Camps (max 5) grant temporary invincibility and restore stamina.
 *      * 30 in-game days == 1 hour real time limit to reach the summit.
 *
 * This component is intentionally self-contained for easy review and iteration.
 */

type Player = {
  id: number;
  name: string;
  alive: boolean;
  stamina: number; // 0-100
  lane: number; // current lane index
};

type HazardType = "glacier" | "canyon" | "slippery" | "avalanche" | "cliff" | "hard";

type Hazard = {
  id: number;
  type: HazardType;
  lane: number;
  progress: number;
  width?: number;
  severity?: number;
};

type Shop = {
  id: number;
  progress: number;
  lane: number;
};

const LANES = 5;
const CANVAS_W = 700;
const CANVAS_H = 480;

const MAX_CAMPS = 5;
const CAMP_INVINCIBLE_MS = 90_000; // 90s invincibility per camp
const IN_GAME_TOTAL_DAYS = 30; // 30 in-game days
const GAME_TIME_LIMIT_MS = 60 * 60 * 1000; // 1 hour real time

const SHOP_SPAWN_CHANCE = 0.12; // 12% chance to spawn a shop instead of a hazard each spawn tick

const PRICE_MEDKIT = 30;
const PRICE_ROPE = 70;
const PRICE_FLARE = 100;

const initialTeam = (size = 5): Player[] =>
  Array.from({ length: size }).map((_, i) => ({
    id: i + 1,
    name: `Alpine-${i + 1}`,
    alive: true,
    stamina: 100,
    lane: Math.floor(LANES / 2),
  }));

export default function MountainMarchSeries() {
  // Game state
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [goalProgress] = useState(2000);
  const [team, setTeam] = useState<Player[]>(initialTeam(5));
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [teamLane, setTeamLane] = useState(Math.floor(LANES / 2));
  const [message, setMessage] = useState<string | null>(null);
  const [tickCount, setTickCount] = useState(0);

  // Camps & invincibility
  const [campsLeft, setCampsLeft] = useState(MAX_CAMPS);
  const [invincible, setInvincible] = useState(false);
  const invincibleUntilRef = useRef<number | null>(null);
  const invincibleRef = useRef(invincible);
  invincibleRef.current = invincible;

  // Time limit
  const [timeLeftMs, setTimeLeftMs] = useState<number>(GAME_TIME_LIMIT_MS);
  const endTimeRef = useRef<number | null>(null);

  // Currency & inventory
  const [coins, setCoins] = useState<number>(0); // main in-game currency
  const [pixelCoins, setPixelCoins] = useState<number>(200); // simulated PixelCoins balance (can be converted)
  const inventoryRef = useRef({ medkits: 0, ropes: 0, flares: 0 });
  const [inventoryVersion, setInventoryVersion] = useState(0); // to force re-render when inventoryRef changes

  // Refs for other mutable state
  const runningRef = useRef(running);
  runningRef.current = running;
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const teamRef = useRef(team);
  teamRef.current = team;
  const hazardsRef = useRef(hazards);
  hazardsRef.current = hazards;
  const shopsRef = useRef(shops);
  shopsRef.current = shops;
  const teamLaneRef = useRef(teamLane);
  teamLaneRef.current = teamLane;

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // spawn hazards and shops
  useEffect(() => {
    let spawnId = 1;
    let shopId = 1;
    const spawnInterval = setInterval(() => {
      if (!runningRef.current) return;
      const spawnProgress = progressRef.current + 700 + Math.random() * 500;
      if (Math.random() < SHOP_SPAWN_CHANCE) {
        // spawn a shop
        const s: Shop = {
          id: shopId++,
          progress: Math.floor(spawnProgress),
          lane: Math.floor(Math.random() * LANES),
        };
        shopsRef.current = [...shopsRef.current, s];
        setShops(shopsRef.current);
        return;
      }

      const typeRand = Math.random();
      let type: HazardType = "hard";
      if (typeRand < 0.15) type = "avalanche";
      else if (typeRand < 0.30) type = "canyon";
      else if (typeRand < 0.50) type = "glacier";
      else if (typeRand < 0.65) type = "slippery";
      else if (typeRand < 0.80) type = "cliff";
      else type = "hard";

      let lane = Math.floor(Math.random() * LANES);
      let width = 1;
      if (type === "canyon") {
        width = 2 + (Math.random() < 0.5 ? 1 : 0);
        lane = Math.max(0, Math.min(LANES - width, lane));
      }
      const severity = Math.floor(1 + Math.random() * 3);

      const h: Hazard = {
        id: spawnId++,
        type,
        lane,
        progress: Math.floor(spawnProgress),
        width,
        severity,
      };
      hazardsRef.current = [...hazardsRef.current, h];
      setHazards(hazardsRef.current);
    }, 1400);

    return () => clearInterval(spawnInterval);
  }, [setHazards, setShops]);

  // Main loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    function loop(now: number) {
      const dt = now - last;
      last = now;

      if (runningRef.current) {
        // Update timer
        if (endTimeRef.current) {
          const remaining = Math.max(0, endTimeRef.current - Date.now());
          setTimeLeftMs(remaining);
          if (remaining <= 0) {
            setMessage("Time's up — your team couldn't reach the summit in time.");
            setRunning(false);
          }
        }

        // speed
        const baseSpeed = 0.5 + teamRef.current.filter((p) => p.alive).length * 0.03;
        const alive = teamRef.current.filter((p) => p.alive);
        const avgStamina = alive.length ? alive.reduce((s, p) => s + p.stamina, 0) / alive.length : 0;
        const pushing = (tickCount % 10) < 3;
        const pushMultiplier = pushing && avgStamina > 10 ? 1.7 : 1;

        const speed = baseSpeed * pushMultiplier;
        const newProgress = progressRef.current + speed * dt * 0.06;
        progressRef.current = newProgress;
        setProgress(newProgress);

        // Check for encountered hazards
        const encountered = hazardsRef.current.filter(
          (h) => h.progress <= newProgress + 10 && h.progress > newProgress - 10
        );
        if (encountered.length) {
          encountered.forEach((h) => handleHazardEncounter(h));
          hazardsRef.current = hazardsRef.current.filter((hh) => !encountered.includes(hh));
          setHazards(hazardsRef.current);
        }

        // Check for shops that we've reached (no forced interaction, but mark as behind)
        // (shops remain in the list so UI can interact if player is "near" them)

        // Stamina regen
        teamRef.current = teamRef.current.map((p) => {
          if (!p.alive) return p;
          let regen = 0.02 * dt;
          if (p.stamina < 100) p.stamina = Math.min(100, p.stamina + regen);
          return p;
        });
        setTeam(teamRef.current);

        // Invincibility expiration
        if (invincibleUntilRef.current && Date.now() >= invincibleUntilRef.current) {
          invincibleUntilRef.current = null;
          setInvincible(false);
          setMessage("Camp's protection faded.");
        }

        // Check win/lose
        const aliveCount = teamRef.current.filter((p) => p.alive).length;
        if (aliveCount === 0) {
          setMessage("All members lost. The mountain wins.");
          setRunning(false);
        } else if (progressRef.current >= goalProgress) {
          // award summit coin reward
          setCoins((c) => c + 30);
          setMessage("Success! Your team reached the summit! +30 coins awarded.");
          setRunning(false);
        }
      }

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalProgress, tickCount]);

  // Hazard interaction with item usage & shop protections
  function handleHazardEncounter(h: Hazard) {
    // If invincible from camp, hazards do nothing
    if (invincibleRef.current) {
      setMessage(`Camp protection blocks the ${h.type}.`);
      return;
    }

    // If we're at a shop location and the shop is considered "open", hazards can still happen.
    // Evaluate hazard
    const alivePlayers = teamRef.current.filter((p) => p.alive);
    if (alivePlayers.length === 0) return;

    // Determine affected players
    const affectedPlayers = teamRef.current.filter(
      (p) => p.alive && p.lane >= h.lane && p.lane < (h.lane + (h.width ?? 1))
    );

    const survivors = [...teamRef.current];

    switch (h.type) {
      case "glacier": {
        affectedPlayers.forEach((p) => {
          const dieProb = 0.12 * h.severity! + (1 - p.stamina / 150);
          // medkit can prevent a death once per player encounter
          if (Math.random() < dieProb) {
            if (inventoryRef.current.medkits > 0) {
              // use medkit to save player
              inventoryRef.current.medkits -= 1;
              setInventoryVersion((v) => v + 1);
              const idx = survivors.findIndex((s) => s.id === p.id);
              survivors[idx] = { ...survivors[idx], stamina: 80 }; // restored
              setMessage(`Glacier! ${p.name} would have died but a medkit saved them.`);
            } else {
              const idx = survivors.findIndex((s) => s.id === p.id);
              survivors[idx] = { ...survivors[idx], alive: false };
            }
          } else {
            const idx = survivors.findIndex((s) => s.id === p.id);
            survivors[idx] = { ...survivors[idx], stamina: Math.max(0, survivors[idx].stamina - 8 * h.severity!) };
          }
        });
        break;
      }
      case "canyon": {
        // If player has a rope, it will save them automatically (rope is consumed per encounter)
        const ropesAvailable = inventoryRef.current.ropes;
        let usedRope = false;
        affectedPlayers.forEach((p) => {
          const idx = survivors.findIndex((s) => s.id === p.id);
          if (!usedRope && inventoryRef.current.ropes > 0) {
            inventoryRef.current.ropes -= 1;
            usedRope = true;
            setInventoryVersion((v) => v + 1);
            survivors[idx] = { ...survivors[idx], stamina: Math.max(0, survivors[idx].stamina - 10) };
            setMessage(`Rope used to help cross the canyon.`);
            return;
          }
          const success = p.stamina > 30 && Math.random() > 0.25;
          if (!success) survivors[idx] = { ...survivors[idx], alive: false };
          else survivors[idx] = { ...survivors[idx], stamina: Math.max(0, survivors[idx].stamina - 25) };
        });
        break;
      }
      case "slippery": {
        affectedPlayers.forEach((p) => {
          const slide = Math.random() < 0.6;
          const dir = Math.random() < 0.5 ? -1 : 1;
          const idx = survivors.findIndex((s) => s.id === p.id);
          if (slide) {
            let newLane = Math.max(0, Math.min(LANES - 1, survivors[idx].lane + dir));
            survivors[idx] = { ...survivors[idx], lane: newLane, stamina: Math.max(0, survivors[idx].stamina - 10) };
          } else {
            survivors[idx] = { ...survivors[idx], stamina: Math.max(0, survivors[idx].stamina - 6) };
          }
        });
        setMessage(affectedPlayers.length ? `Slippery ice! Team scrambled.` : "A patch of ice is nearby.");
        break;
      }
      case "avalanche": {
        // Flares reduce kill probability if available (each flare reduces kill prob and is consumed)
        let killProb = 0.3 * h.severity!;
        if (inventoryRef.current.flares > 0) {
          inventoryRef.current.flares -= 1;
          setInventoryVersion((v) => v + 1);
          killProb *= 0.45; // flares dramatically reduce avalanche lethality
          setMessage("Flare used — avalanche impact reduced.");
        }
        affectedPlayers.forEach((p) => {
          const idx = survivors.findIndex((s) => s.id === p.id);
          if (Math.random() < killProb) {
            if (inventoryRef.current.medkits > 0) {
              // medkit as last ditch saves one player
              inventoryRef.current.medkits -= 1;
              setInventoryVersion((v) => v + 1);
              survivors[idx] = { ...survivors[idx], stamina: 70 };
            } else {
              survivors[idx] = { ...survivors[idx], alive: false };
            }
          } else survivors[idx] = { ...survivors[idx], stamina: Math.max(0, survivors[idx].stamina - 30) };
        });
        break;
      }
      case "cliff": {
        affectedPlayers.forEach((p) => {
          const outer = p.lane === 0 || p.lane === LANES - 1;
          const idx = survivors.findIndex((s) => s.id === p.id);
          if (outer && Math.random() < 0.45) {
            if (inventoryRef.current.medkits > 0) {
              inventoryRef.current.medkits -= 1;
              setInventoryVersion((v) => v + 1);
              survivors[idx] = { ...survivors[idx], stamina: 60 };
            } else {
              survivors[idx] = { ...survivors[idx], alive: false };
            }
          } else survivors[idx] = { ...survivors[idx], stamina: Math.max(0, survivors[idx].stamina - 12) };
        });
        setMessage(affectedPlayers.length ? `Cliff zone! Proceed carefully.` : "Cliffside ahead.");
        break;
      }
      case "hard": {
        affectedPlayers.forEach((p) => {
          const idx = survivors.findIndex((s) => s.id === p.id);
          survivors[idx] = { ...survivors[idx], stamina: Math.max(0, survivors[idx].stamina - 14) };
        });
        setMessage(affectedPlayers.length ? `Hard terrain: pushing through.` : "Rough terrain.");
        break;
      }
    }

    teamRef.current = survivors;
    setTeam(survivors);
  }

  // Controls
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!runningRef.current) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        const next = Math.max(0, teamLaneRef.current - 1);
        teamLaneRef.current = next;
        teamRef.current = teamRef.current.map((p) => (p.alive ? { ...p, lane: next } : p));
        setTeamLane(next);
        setTeam(teamRef.current);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        const next = Math.min(LANES - 1, teamLaneRef.current + 1);
        teamLaneRef.current = next;
        teamRef.current = teamRef.current.map((p) => (p.alive ? { ...p, lane: next } : p));
        setTeamLane(next);
        setTeam(teamRef.current);
      } else if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        teamRef.current = teamRef.current.map((p) => {
          if (!p.alive) return p;
          const drain = 12;
          return { ...p, stamina: Math.max(0, p.stamina - drain) };
        });
        progressRef.current += 18;
        setProgress(progressRef.current);
        setTeam(teamRef.current);
        setTickCount((t) => t + 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Drawing including shops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function draw() {
      // clear
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // background
      const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      g.addColorStop(0, "#cfeef5");
      g.addColorStop(0.5, "#b7e0ea");
      g.addColorStop(1, "#8fbecf");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // mountain silhouette
      ctx.fillStyle = "#4b6b7a";
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H);
      ctx.lineTo(CANVAS_W * 0.15, CANVAS_H * 0.45);
      ctx.lineTo(CANVAS_W * 0.35, CANVAS_H * 0.6);
      ctx.lineTo(CANVAS_W * 0.55, CANVAS_H * 0.25);
      ctx.lineTo(CANVAS_W * 0.72, CANVAS_H * 0.5);
      ctx.lineTo(CANVAS_W * 0.9, CANVAS_H * 0.28);
      ctx.lineTo(CANVAS_W, CANVAS_H);
      ctx.closePath();
      ctx.fill();

      // lanes
      const laneW = CANVAS_W / LANES;
      for (let i = 0; i < LANES; i++) {
        ctx.fillStyle = i === teamLane ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";
        ctx.fillRect(i * laneW, 0, laneW, CANVAS_H);
      }

      // hazards
      hazardsRef.current.forEach((h) => {
        const relative = Math.max(-200, h.progress - progressRef.current);
        const y = CANVAS_H - (relative / goalProgress) * (CANVAS_H + 600) - 120;
        const x = (h.lane + (h.width ? h.width / 2 : 0.5)) * laneW;
        ctx.save();
        switch (h.type) {
          case "glacier":
            ctx.fillStyle = "#dff6ff";
            ctx.fillRect(x - laneW * 0.45, y - 12, laneW * (h.width ?? 1) * 0.9, 24);
            ctx.strokeStyle = "#b9e6ff";
            ctx.strokeRect(x - laneW * 0.45, y - 12, laneW * (h.width ?? 1) * 0.9, 24);
            break;
          case "canyon":
            ctx.fillStyle = "#0b0e14";
            ctx.fillRect(x - laneW * (h.width ?? 1) * 0.5, y - 8, laneW * (h.width ?? 1), 28);
            ctx.strokeStyle = "#222";
            ctx.strokeRect(x - laneW * (h.width ?? 1) * 0.5, y - 8, laneW * (h.width ?? 1), 28);
            break;
          case "slippery":
            ctx.fillStyle = "#e8f7ff";
            ctx.beginPath();
            ctx.ellipse(x, y, laneW * 0.45, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "avalanche":
            ctx.fillStyle = "#fff2f2";
            ctx.beginPath();
            ctx.moveTo(x - laneW * 0.6, y + 18);
            ctx.lineTo(x, y - 28);
            ctx.lineTo(x + laneW * 0.6, y + 18);
            ctx.closePath();
            ctx.fill();
            break;
          case "cliff":
            ctx.fillStyle = "#8b5c42";
            ctx.fillRect(x - laneW * 0.45, y, laneW * (h.width ?? 1) * 0.9, 18);
            break;
          case "hard":
            ctx.fillStyle = "#9aa3a8";
            ctx.fillRect(x - laneW * 0.45, y - 6, laneW * (h.width ?? 1) * 0.9, 14);
            break;
        }
        ctx.restore();
      });

      // shops
      shopsRef.current.forEach((s) => {
        const relative = Math.max(-200, s.progress - progressRef.current);
        const y = CANVAS_H - (relative / goalProgress) * (CANVAS_H + 600) - 120;
        const x = (s.lane + 0.5) * laneW;
        ctx.save();
        ctx.fillStyle = "#ffd27a";
        ctx.fillRect(x - laneW * 0.45, y - 18, laneW * 0.9, 36);
        ctx.fillStyle = "#4b2e00";
        ctx.font = "12px sans-serif";
        ctx.fillText("SHOP", x - 18, y + 4);
        ctx.restore();
      });

      // team
      const baseY = CANVAS_H - 70;
      teamRef.current.forEach((p, i) => {
        const px = (p.lane + 0.5) * laneW;
        const py = baseY - i * 18;
        ctx.fillStyle = p.alive ? "#ffdd66" : "rgba(100,100,100,0.6)";
        ctx.beginPath();
        ctx.arc(px, py - 6, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = p.alive ? "#2b7a78" : "#555";
        ctx.fillRect(px - 8, py + 2, 16, 18);
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(px - 15, py + 22, 30, 6);
        ctx.fillStyle = p.stamina > 50 ? "#6ee37a" : p.stamina > 20 ? "#ffd24a" : "#ff6b6b";
        ctx.fillRect(px - 15, py + 22, (30 * Math.max(0, p.stamina)) / 100, 6);
      });

      // HUD
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(10, 10, 300, 140);
      ctx.fillStyle = "#fff";
      ctx.font = "14px sans-serif";
      ctx.fillText(`Progress: ${Math.floor(progressRef.current)} / ${goalProgress}`, 18, 30);
      ctx.fillText(`Alive: ${teamRef.current.filter((p) => p.alive).length} / ${teamRef.current.length}`, 18, 50);
      ctx.fillText(`Lane: ${teamLaneRef.current + 1} / ${LANES}`, 18, 70);
      ctx.fillText(`Hazards ahead: ${hazardsRef.current.length}`, 18, 90);
      ctx.fillText(`Coins: ${coins}  •  PixelCoins: ${pixelCoins}`, 18, 110);
      ctx.fillText(`Medkits: ${inventoryRef.current.medkits}  Rope: ${inventoryRef.current.ropes}  Flares: ${inventoryRef.current.flares}`, 18, 130);

      // Time left (in-game days)
      const fractionHoursLeft = timeLeftMs / GAME_TIME_LIMIT_MS;
      const daysLeft = Math.max(0, Math.round(fractionHoursLeft * IN_GAME_TOTAL_DAYS * 10) / 10);
      ctx.fillText(`Time left: ${daysLeft} days`, 18, 150);

      // Invincibility indicator
      if (invincibleRef.current) {
        const remain = invincibleUntilRef.current ? Math.max(0, invincibleUntilRef.current - Date.now()) : 0;
        const sec = Math.ceil(remain / 1000);
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fillRect(320, 10, 260, 36);
        ctx.fillStyle = "#fff";
        ctx.font = "14px sans-serif";
        ctx.fillText(`CAMP ACTIVE — Invincible for ${sec}s`, 328, 34);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.02)";
        ctx.fillRect(320, 10, 260, 36);
        ctx.fillStyle = "#fff";
        ctx.font = "14px sans-serif";
        ctx.fillText(`Camps left: ${campsLeft}`, 328, 34);
      }

      if (message) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(260, 52, 420, 36);
        ctx.fillStyle = "#fff";
        ctx.font = "16px sans-serif";
        ctx.fillText(message, 270, 76);
      }

      // top marker
      ctx.fillStyle = "#222";
      ctx.fillRect(CANVAS_W - 12, 0, 12, 40);
      ctx.fillStyle = "#fff";
      ctx.fillText("SUMMIT", CANVAS_W - 86, 24);
    }

    let id = 0;
    function tick() {
      draw();
      id = requestAnimationFrame(tick);
    }
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [message, coins, pixelCoins, inventoryVersion, campsLeft]);

  // Start / reset
  function startGame() {
    const fresh = initialTeam(5);
    setTeam(fresh);
    teamRef.current = fresh;
    setHazards([]);
    hazardsRef.current = [];
    setShops([]);
    shopsRef.current = [];
    setProgress(0);
    progressRef.current = 0;
    setMessage(null);
    setRunning(true);

    setCampsLeft(MAX_CAMPS);
    setInvincible(false);
    invincibleRef.current = false;
    invincibleUntilRef.current = null;

    const now = Date.now();
    endTimeRef.current = now + GAME_TIME_LIMIT_MS;
    setTimeLeftMs(GAME_TIME_LIMIT_MS);

    // reset inventory/currency for a fresh run (optional — here we preserve currency across runs to allow buying)
    // setCoins(0);
    // setPixelCoins(200);
    // inventoryRef.current = { medkits: 0, ropes: 0, flares: 0 };
    // setInventoryVersion((v) => v + 1);
  }

  function resetGame() {
    setRunning(false);
    const fresh = initialTeam(5);
    setTeam(fresh);
    teamRef.current = fresh;
    setHazards([]);
    hazardsRef.current = [];
    setShops([]);
    shopsRef.current = [];
    setProgress(0);
    progressRef.current = 0;
    setMessage(null);

    setCampsLeft(MAX_CAMPS);
    setInvincible(false);
    invincibleRef.current = false;
    invincibleUntilRef.current = null;
    endTimeRef.current = null;
    setTimeLeftMs(GAME_TIME_LIMIT_MS);

    // reset currency/inventory
    setCoins(0);
    setPixelCoins(200);
    inventoryRef.current = { medkits: 0, ropes: 0, flares: 0 };
    setInventoryVersion((v) => v + 1);
  }

  // Camp action
  function setCamp() {
    if (!runningRef.current) {
      setMessage("You must be climbing to set camp.");
      return;
    }
    if (campsLeft <= 0) {
      setMessage("No camps left.");
      return;
    }
    const next = campsLeft - 1;
    setCampsLeft(next);

    invincibleUntilRef.current = Date.now() + CAMP_INVINCIBLE_MS;
    invincibleRef.current = true;
    setInvincible(true);

    teamRef.current = teamRef.current.map((p) => (p.alive ? { ...p, stamina: 100 } : p));
    setTeam(teamRef.current);

    setMessage(`Camp set. Team is invincible for ${Math.round(CAMP_INVINCIBLE_MS / 1000)} seconds.`);
  }

  // Buy/Convert coins
  function buyCoinsReal() {
    // Simulate in-app purchase: add 150 coins
    setCoins((c) => c + 150);
    setMessage("Purchased 150 coins (real money).");
  }
  function convertPixelCoinsToCoins() {
    // convert 100 PixelCoins -> 100 coins
    const cost = 100;
    if (pixelCoins < cost) {
      setMessage("Not enough PixelCoins to convert.");
      return;
    }
    setPixelCoins((p) => p - cost);
    setCoins((c) => c + 100);
    setMessage("Converted 100 PixelCoins to 100 coins.");
  }

  // Shop buy action — only allowed when player is near the shop
  function canInteractWithShop(s: Shop) {
    // "near" means within +/- 80 progress units
    return Math.abs(progressRef.current - s.progress) < 80;
  }

  function buyItemAtShop(item: "medkit" | "rope" | "flare", shop: Shop) {
    if (!canInteractWithShop(shop)) {
      setMessage("You must reach a shop to buy items.");
      return;
    }
    let price = 0;
    if (item === "medkit") price = PRICE_MEDKIT;
    if (item === "rope") price = PRICE_ROPE;
    if (item === "flare") price = PRICE_FLARE;
    if (coins < price) {
      setMessage("Not enough coins.");
      return;
    }
    setCoins((c) => c - price);
    if (item === "medkit") inventoryRef.current.medkits += 1;
    if (item === "rope") inventoryRef.current.ropes += 1;
    if (item === "flare") inventoryRef.current.flares += 1;
    setInventoryVersion((v) => v + 1);
    setMessage(`Purchased ${item} for ${price} coins.`);
  }

  // Utility: use medkit manually (extra control)
  function useMedkit() {
    if (inventoryRef.current.medkits <= 0) {
      setMessage("No medkits available.");
      return;
    }
    // prefer to revive a dead player first
    const deadIdx = teamRef.current.findIndex((p) => !p.alive);
    if (deadIdx !== -1) {
      inventoryRef.current.medkits -= 1;
      setInventoryVersion((v) => v + 1);
      const revived = { ...teamRef.current[deadIdx], alive: true, stamina: 60 };
      teamRef.current = teamRef.current.map((p, i) => (i === deadIdx ? revived : p));
      setTeam(teamRef.current);
      setMessage(`${revived.name} revived using a medkit.`);
      return;
    }
    // else restore stamina to the lowest-stamina alive player
    const alivePlayers = teamRef.current.filter((p) => p.alive);
    if (!alivePlayers.length) {
      setMessage("No players to heal.");
      return;
    }
    const lowest = alivePlayers.reduce((acc, p) => (p.stamina < acc.stamina ? p : acc), alivePlayers[0]);
    inventoryRef.current.medkits -= 1;
    setInventoryVersion((v) => v + 1);
    teamRef.current = teamRef.current.map((p) => (p.id === lowest.id ? { ...p, stamina: Math.min(100, p.stamina + 40) } : p));
    setTeam(teamRef.current);
    setMessage(`Used medkit on ${lowest.name}.`);
  }

  // Keep invincibleRef up-to-date
  useEffect(() => {
    invincibleRef.current = invincible;
  }, [invincible]);

  // When component unmounts, clear invincibleUntil
  useEffect(() => {
    return () => {
      invincibleUntilRef.current = null;
    };
  }, []);

  // helper to format time
  function formatMsToMmSs(ms: number) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }

  // Derived values for UI
  const fractionHoursLeft = timeLeftMs / GAME_TIME_LIMIT_MS;
  const daysLeft = Math.max(0, Math.round(fractionHoursLeft * IN_GAME_TOTAL_DAYS * 10) / 10);

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <div>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{
            border: "2px solid #233",
            background: "#0a1",
            display: "block",
            borderRadius: 6,
          }}
        />
        <div style={{ marginTop: 8 }}>
          <button onClick={() => (running ? setRunning(false) : setRunning(true))}>{running ? "Pause" : "Resume"}</button>
          <button onClick={startGame} style={{ marginLeft: 8 }}>
            Start / Restart
          </button>
          <button onClick={resetGame} style={{ marginLeft: 8 }}>
            Reset
          </button>
          <button
            onClick={setCamp}
            style={{ marginLeft: 8 }}
            disabled={!running || campsLeft <= 0}
            title={`Set camp (makes team invincible for ${Math.round(CAMP_INVINCIBLE_MS / 1000)}s).`}
          >
            Set Camp ({campsLeft})
          </button>
          <button onClick={useMedkit} style={{ marginLeft: 8 }} disabled={inventoryRef.current.medkits <= 0}>
            Use Medkit ({inventoryRef.current.medkits})
          </button>
        </div>

        <div style={{ marginTop: 8, width: CANVAS_W }}>
          <p style={{ margin: 2 }}>
            Controls: Left & Right to change lane. Up / Space to push/climb (costs stamina but gives progress burst). Set camp up to{" "}
            {MAX_CAMPS} times — each camp grants temporary invincibility and restores stamina. You have {IN_GAME_TOTAL_DAYS} in-game days (~1 hour real time) to reach the summit.
          </p>
          <div style={{ fontSize: 13, color: "#333", marginTop: 6 }}>
            <strong>Currency</strong>
            <div style={{ marginTop: 6 }}>
              <button onClick={buyCoinsReal}>Buy 150 coins (Real Money)</button>
              <button onClick={convertPixelCoinsToCoins} style={{ marginLeft: 8 }}>
                Convert 100 PixelCoins → 100 coins (You have {pixelCoins})
              </button>
            </div>
            <div style={{ marginTop: 8 }}>
              Time left (real): {formatMsToMmSs(timeLeftMs)} • In-game days left: {daysLeft}
              <span style={{ marginLeft: 18 }}>
                Camp status: {invincible ? `ACTIVE (${Math.ceil((invincibleUntilRef.current! - Date.now()) / 1000)}s)` : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <aside style={{ width: 360, fontFamily: "sans-serif", color: "#222" }}>
        <h3>Team Status</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {team.map((p) => (
            <li
              key={p.id}
              style={{
                marginBottom: 8,
                padding: 8,
                background: p.alive ? "linear-gradient(#fff,#eef)" : "#222",
                color: p.alive ? "#111" : "#aaa",
                borderRadius: 6,
              }}
            >
              <strong>{p.name}</strong> — {p.alive ? "Alive" : "Lost"}
              <div style={{ height: 8, background: "#eee", borderRadius: 4, marginTop: 6 }}>
                <div
                  style={{
                    width: `${Math.max(0, p.stamina)}%`,
                    height: "100%",
                    background: p.stamina > 50 ? "#6ee37a" : p.stamina > 20 ? "#ffd24a" : "#ff6b6b",
                    borderRadius: 4,
                    transition: "width 0.3s linear",
                  }}
                />
              </div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Lane: {p.lane + 1}</div>
            </li>
          ))}
        </ul>

        <h3>Upcoming Hazards & Shops</h3>
        <div style={{ maxHeight: 220, overflow: "auto", paddingRight: 6 }}>
          {shops.length === 0 && hazards.length === 0 && <div style={{ color: "#666" }}>No dangers or shops in sight.</div>}

          {/* Shops (sorted by progress) */}
          {shops
            .slice()
            .sort((a, b) => a.progress - b.progress)
            .map((s) => (
              <div
                key={`shop-${s.id}`}
                style={{
                  marginBottom: 8,
                  padding: 8,
                  borderRadius: 6,
                  background: "#fff8e6",
                  border: "1px solid #f0dca6",
                }}
              >
                <div style={{ fontWeight: 700 }}>SHOP</div>
                <div style={{ fontSize: 13, color: "#444" }}>
                  Lane: {s.lane + 1} • Progress: {Math.floor(s.progress)}
                  <span style={{ marginLeft: 8, color: canInteractWithShop(s) ? "green" : "#666" }}>
                    {canInteractWithShop(s) ? "Nearby — you can buy here" : "Not nearby"}
                  </span>
                </div>
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <button onClick={() => buyItemAtShop("medkit", s)} disabled={!canInteractWithShop(s)}>
                    Medkit — {PRICE_MEDKIT} coins
                  </button>
                  <button onClick={() => buyItemAtShop("rope", s)} disabled={!canInteractWithShop(s)}>
                    Rope — {PRICE_ROPE} coins
                  </button>
                  <button onClick={() => buyItemAtShop("flare", s)} disabled={!canInteractWithShop(s)}>
                    Flare — {PRICE_FLARE} coins
                  </button>
                </div>
              </div>
            ))}

          {/* Hazards (sorted by progress) */}
          {hazards
            .slice()
            .sort((a, b) => a.progress - b.progress)
            .map((h) => (
              <div
                key={`haz-${h.id}`}
                style={{
                  marginBottom: 8,
                  padding: 8,
                  borderRadius: 6,
                  background: "#fbfbfb",
                  border: "1px solid #ddd",
                }}
              >
                <div style={{ fontWeight: 600 }}>{h.type.toUpperCase()}</div>
                <div style={{ fontSize: 13, color: "#444" }}>
                  Lane: {h.lane + 1}
                  {h.width && h.width > 1 ? ` - ${h.lane + h.width}` : ""} • Progress: {Math.floor(h.progress)}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: "#777" }}>Severity: {h.severity}</div>
              </div>
            ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Inventory & Currency</strong>
          <div style={{ marginTop: 8 }}>
            <div>Coins: {coins}</div>
            <div>PixelCoins: {pixelCoins}</div>
            <div style={{ marginTop: 6 }}>
              Medkits: {inventoryRef.current.medkits} • Ropes: {inventoryRef.current.ropes} • Flares: {inventoryRef.current.flares}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <strong>Message:</strong>
            <div style={{ minHeight: 36, marginTop: 6, background: "#f4f7fb", padding: 8, borderRadius: 6 }}>
              {message ?? "Stay alert."}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
