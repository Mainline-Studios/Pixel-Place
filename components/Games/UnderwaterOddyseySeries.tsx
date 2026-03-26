'use client';

import React, { useEffect, useRef, useState } from 'react';

type Vec = { x: number; y: number };

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function distance(a: Vec, b: Vec) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

type BaseModule = { x: number; y: number; w: number; h: number; type: 'hab' | 'storage' | 'lab' };
type CreatureSpecies =
  | 'smallFish'
  | 'largeFish'
  | 'octopus'
  | 'anemone'
  | 'crab'
  | 'shrimp'
  | 'whale'
  | 'dolphin'
  | 'seaSnail'
  | 'starfish'
  | 'seaCucumber'
  | 'manta'
  | 'squid';

type Creature = {
  id: number;
  species: CreatureSpecies;
  pos: Vec;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  edible: boolean;
  health?: number;
  caught?: boolean;
  age?: number;
};

export default function UnderwaterOddyseySeries() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [running, setRunning] = useState(true);
  const [seed] = useState(() => Math.floor(Math.random() * 1000000));

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let width = (canvas.width = canvas.clientWidth = 960);
    let height = (canvas.height = canvas.clientHeight = 640);

    const player: Vec & {
      vx: number;
      vy: number;
      health: number;
      hitTimer: number;
      mode: 'sub' | 'scuba';
      oxygen: number;
    } = {
      x: width / 2,
      y: height / 2,
      vx: 0,
      vy: 0,
      health: 100,
      hitTimer: 0,
      mode: 'sub',
      oxygen: 100,
    };
    const keys: Record<string, boolean> = {};

    // World / camera
    const world = { width: 4800, height: 2600 };
    const camera = { x: player.x - width / 2, y: player.y - height / 2 };

    // Entities
    type Fish = { pos: Vec; speed: number; size: number; color: string; dir: number };
    const fishes: Fish[] = [];
    const treasures: Vec[] = [];
    const sharks: any[] = [];
    const jellies: any[] = [];

    // Biomes
    type CoralCluster = { x: number; y: number; scale: number; colors: string[]; width: number };
    type SeaweedCluster = { x: number; y: number; height: number; density: number };
    type ReefPatch = { x: number; y: number; width: number; complexity: number; colors: string[] };
    const coralClusters: CoralCluster[] = [];
    const seaweedClusters: SeaweedCluster[] = [];
    const reefPatches: ReefPatch[] = [];
    const trenchZones: { x: number; width: number; depthBias: number }[] = [];

    // Bases
    const baseModules: BaseModule[] = loadBases();

    // Build and mouse
    let buildMode = false;
    let buildPreview: { x: number; y: number; type: BaseModule['type'] } | null = null;
    let mousePos: Vec = { x: 0, y: 0 };

    // Creatures
    const creatures: Creature[] = [];
    let nextCreatureId = 1;
    const inventoryRef = { current: {} as Record<string, number> }; // species -> count

    function randSeeded(prng: () => number, min: number, max: number) {
      return prng() * (max - min) + min;
    }

    function createPRNG(seedVal: number) {
      let s = seedVal >>> 0;
      if (s === 0) s = 123456789;
      return function () {
        s ^= s << 13;
        s ^= s >>> 17;
        s ^= s << 5;
        return ((s >>> 0) % 1000000) / 1000000;
      };
    }

    function random(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Populate simple fish, treasures, sharks, jellies (existing logic)
    for (let i = 0; i < 40; i++) {
      fishes.push({
        pos: { x: random(0, world.width), y: random(100, world.height - 200) },
        speed: random(0.2, 1.2),
        size: random(6, 18),
        color: `hsl(${Math.floor(random(180, 300))},70%,65%)`,
        dir: Math.random() < 0.5 ? -1 : 1,
      });
    }
    for (let i = 0; i < 14; i++) treasures.push({ x: random(100, world.width - 100), y: random(world.height - 350, world.height - 80) });

    for (let i = 0; i < 6; i++) {
      sharks.push({ pos: { x: random(200, world.width - 200), y: random(150, world.height - 300) }, vx: 0, vy: 0, speed: random(0.18, 0.5), size: random(26, 46), cooldown: 0 });
    }
    for (let i = 0; i < 12; i++) {
      jellies.push({ pos: { x: random(80, world.width - 80), y: random(120, world.height - 200) }, size: random(14, 26), phase: random(0, Math.PI * 2) });
    }

    // Biome generation
    (function generateBiomes() {
      const prng = createPRNG(seed);
      for (let i = 0; i < 4; i++) {
        const w = 400 + prng() * 900;
        const x = prng() * (world.width - w);
        const depthBias = 1 + prng() * 1.8;
        trenchZones.push({ x, width: w, depthBias });
      }
      for (let i = 0; i < 40; i++) {
        const x = prng() * world.width;
        const y = world.height - (80 + prng() * 280);
        const scale = 0.6 + prng() * 1.6;
        const w = 40 + prng() * 120;
        coralClusters.push({
          x,
          y,
          scale,
          width: w,
          colors: [
            `hsl(${200 + Math.floor(prng() * 40)},70%,${45 + Math.floor(prng() * 20)}%)`,
            `hsl(${10 + Math.floor(prng() * 50)},65%,${50 + Math.floor(prng() * 18)}%)`,
            `hsl(${140 + Math.floor(prng() * 40)},60%,${50 + Math.floor(prng() * 15)}%)`,
          ],
        });
      }
      for (let i = 0; i < 54; i++) {
        const x = prng() * world.width;
        const y = world.height - (60 + prng() * 180);
        const height = 40 + prng() * 180;
        const density = 6 + Math.floor(prng() * 12);
        seaweedClusters.push({ x, y, height, density });
      }
      for (let i = 0; i < 18; i++) {
        const x = prng() * world.width;
        const y = world.height - (40 + prng() * 200);
        const width = 80 + prng() * 260;
        const complexity = 4 + Math.floor(prng() * 6);
        reefPatches.push({
          x,
          y,
          width,
          complexity,
          colors: ['#5a3a2a', '#7a5a40', '#3b2b20'],
        });
      }
    })();

    // Creature population generator
    (function populateCreatures() {
      const prng = createPRNG(seed + 42);
      function spawn(species: CreatureSpecies, count: number, zoneYMin?: number, zoneYMax?: number) {
        for (let i = 0; i < count; i++) {
          const x = prng() * world.width;
          const y = (zoneYMin ?? 80) + prng() * ((zoneYMax ?? world.height - 120) - (zoneYMin ?? 80));
          const sizeMap: Record<CreatureSpecies, number> = {
            smallFish: 8 + prng() * 6,
            largeFish: 16 + prng() * 12,
            octopus: 20 + prng() * 16,
            anemone: 14 + prng() * 8,
            crab: 12 + prng() * 6,
            shrimp: 6 + prng() * 4,
            whale: 120 + prng() * 80,
            dolphin: 36 + prng() * 40,
            seaSnail: 10 + prng() * 4,
            starfish: 10 + prng() * 4,
            seaCucumber: 14 + prng() * 8,
            manta: 60 + prng() * 40,
            squid: 40 + prng() * 30,
          };
          const speedMap: Record<CreatureSpecies, number> = {
            smallFish: 0.3 + prng() * 1.2,
            largeFish: 0.15 + prng() * 0.8,
            octopus: 0.06 + prng() * 0.15,
            anemone: 0,
            crab: 0.06 + prng() * 0.12,
            shrimp: 0.2 + prng() * 0.6,
            whale: 0.06 + prng() * 0.08,
            dolphin: 0.3 + prng() * 0.8,
            seaSnail: 0.02 + prng() * 0.04,
            starfish: 0.01,
            seaCucumber: 0.01,
            manta: 0.12 + prng() * 0.3,
            squid: 0.18 + prng() * 0.5,
          };
          const edibleMap: Record<CreatureSpecies, boolean> = {
            smallFish: true,
            largeFish: true,
            octopus: true,
            anemone: false,
            crab: true,
            shrimp: true,
            whale: false,
            dolphin: false,
            seaSnail: true,
            starfish: false,
            seaCucumber: false,
            manta: false,
            squid: true,
          };
          creatures.push({
            id: nextCreatureId++,
            species,
            pos: { x, y },
            vx: (prng() - 0.5) * speedMap[species],
            vy: (prng() - 0.5) * speedMap[species],
            size: sizeMap[species],
            phase: prng() * Math.PI * 2,
            edible: edibleMap[species],
            health: 10 + prng() * 20,
            age: 0,
            caught: false,
          });
        }
      }
      // spawn different species with approximate realistic distributions
      spawn('smallFish', 120);
      spawn('largeFish', 40);
      spawn('shrimp', 60, world.height - 300, world.height - 80);
      spawn('crab', 36, world.height - 200, world.height - 60);
      spawn('octopus', 14, world.height - 320, world.height - 100);
      spawn('anemone', 28, world.height - 260, world.height - 80);
      spawn('seaSnail', 38, world.height - 300, world.height - 60);
      spawn('starfish', 26, world.height - 260, world.height - 60);
      spawn('seaCucumber', 28, world.height - 260, world.height - 60);
      spawn('manta', 14, 120, world.height - 300);
      spawn('squid', 22, 120, world.height - 300);
      spawn('dolphin', 8, 140, 800);
      spawn('whale', 4, 200, 900);
    })();

    // Controls
    function onKey(e: KeyboardEvent) {
      const down = e.type === 'keydown';
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        keys[e.key] = down;
        e.preventDefault();
      }
      if (e.type === 'keydown') {
        if (e.key === ' ') {
          setRunning((r) => !r);
        } else if (e.key.toLowerCase() === 'e') {
          toggleMode();
        } else if (e.key.toLowerCase() === 'b') {
          if (player.mode === 'scuba') {
            buildMode = !buildMode;
            if (!buildMode) buildPreview = null;
          }
        } else if (e.key.toLowerCase() === 'f') {
          // attempt catch
          attemptCatch();
        } else if (e.key.toLowerCase() === 'r') {
          // eat one item
          attemptEat();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);

    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height);
      mousePos = { x: mx + camera.x, y: my + camera.y };
      if (buildMode) {
        const grid = 24;
        const snapped = { x: Math.round(mousePos.x / grid) * grid, y: Math.round(mousePos.y / grid) * grid };
        buildPreview = { x: snapped.x, y: snapped.y, type: 'hab' };
      }
    }
    function onMouseDown(e: MouseEvent) {
      if (!buildMode || player.mode !== 'scuba') return;
      if (!buildPreview) return;
      const cost = moduleCost(buildPreview.type);
      if (collected < cost) {
        return;
      }
      if (player.y < world.height - 220) return;
      if (baseModules.some((b) => rectOverlap(b.x, b.y, b.w, b.h, buildPreview!.x, buildPreview!.y, 40, 36))) {
        return;
      }
      const mod: BaseModule = { x: buildPreview.x, y: buildPreview.y, w: 40, h: 36, type: buildPreview.type };
      baseModules.push(mod);
      saveBases(baseModules);
      collected -= cost;
      saveCollected(collected);
    }
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = Math.floor(rect.width || 960);
      height = canvas.height = Math.floor(rect.height || 640);
    }
    resize();
    window.addEventListener('resize', resize);

    // Game state
    let collected = loadCollected();
    let gameOver = false;

    function toggleMode() {
      if (player.mode === 'sub') {
        player.mode = 'scuba';
        player.oxygen = Math.min(100, player.oxygen);
        player.vx *= 0.4;
        player.vy *= 0.4;
      } else {
        player.mode = 'sub';
        player.oxygen = 100;
      }
    }

    function moduleCost(type: BaseModule['type']) {
      switch (type) {
        case 'hab':
          return 3;
        case 'storage':
          return 2;
        case 'lab':
          return 4;
      }
    }

    function rectOverlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
      return !(ax + aw / 2 < bx - bw / 2 || ax - aw / 2 > bx + bw / 2 || ay + ah / 2 < by - bh / 2 || ay - ah / 2 > by + bh / 2);
    }

    // Catch & Eat logic
    function attemptCatch() {
      if (player.mode !== 'scuba') return;
      // find nearest edible creature within range
      let nearest: Creature | null = null;
      let nearestDist = Infinity;
      for (const c of creatures) {
        if (c.caught) continue;
        if (!c.edible) continue;
        const d = distance(c.pos, player);
        if (d < 48 && d < nearestDist) {
          nearest = c;
          nearestDist = d;
        }
      }
      if (!nearest) return;
      // chance depends on species & size; smaller/easier species higher chance
      const baseChance: Record<CreatureSpecies, number> = {
        smallFish: 0.85,
        largeFish: 0.45,
        octopus: 0.36,
        anemone: 0,
        crab: 0.6,
        shrimp: 0.75,
        whale: 0,
        dolphin: 0,
        seaSnail: 0.7,
        starfish: 0,
        seaCucumber: 0,
        manta: 0.1,
        squid: 0.55,
      };
      // skill / modifier: if player near seabed or sneaking (not implemented) -> small bonus, else none
      const chance = baseChance[nearest.species] ?? 0.3;
      if (Math.random() < chance) {
        // success: add to inventory and mark removed
        inventoryRef.current[nearest.species] = (inventoryRef.current[nearest.species] || 0) + 1;
        nearest.caught = true;
        // remove creature visually after short time
        setTimeout(() => {
          const idx = creatures.findIndex((x) => x.id === nearest!.id);
          if (idx >= 0) creatures.splice(idx, 1);
        }, 180);
      } else {
        // failure: some creatures flee (boost velocity)
        nearest.vx += (Math.random() - 0.5) * 1.6;
        nearest.vy -= Math.random() * 0.6;
      }
    }

    function attemptEat() {
      // eat the first available edible item in inventory
      const inv = inventoryRef.current;
      const speciesOrder: CreatureSpecies[] = [
        'smallFish',
        'shrimp',
        'largeFish',
        'octopus',
        'squid',
        'crab',
        'seaSnail',
      ];
      for (const sp of speciesOrder) {
        const cnt = inv[sp] || 0;
        if (cnt > 0) {
          // apply effects depending on species
          const effects: Record<CreatureSpecies, { oxy: number; hp: number }> = {
            smallFish: { oxy: 18, hp: 4 },
            largeFish: { oxy: 34, hp: 8 },
            octopus: { oxy: 28, hp: 6 },
            squid: { oxy: 26, hp: 6 },
            crab: { oxy: 12, hp: 3 },
            shrimp: { oxy: 10, hp: 2 },
            seaSnail: { oxy: 8, hp: 2 },
            anemone: { oxy: 0, hp: 0 },
            whale: { oxy: 0, hp: 0 },
            dolphin: { oxy: 0, hp: 0 },
            starfish: { oxy: 0, hp: 0 },
            seaCucumber: { oxy: 0, hp: 0 },
            manta: { oxy: 0, hp: 0 },
          };
          const e = effects[sp] || { oxy: 10, hp: 1 };
          player.oxygen = Math.min(100, player.oxygen + e.oxy);
          player.health = Math.min(100, player.health + e.hp);
          inv[sp] = cnt - 1;
          break;
        }
      }
    }

    function update(dt: number) {
      if (gameOver) return;

      // Movement handling per mode
      if (player.mode === 'sub') {
        const accel = 0.0016 * dt;
        if (keys['ArrowLeft'] || keys['a']) player.vx -= accel;
        if (keys['ArrowRight'] || keys['d']) player.vx += accel;
        if (keys['ArrowUp'] || keys['w']) player.vy -= accel;
        if (keys['ArrowDown'] || keys['s']) player.vy += accel;
        player.vx *= 0.993;
        player.vy *= 0.993;
      } else {
        const accel = 0.0010 * dt;
        if (keys['ArrowLeft'] || keys['a']) player.vx -= accel;
        if (keys['ArrowRight'] || keys['d']) player.vx += accel;
        if (keys['ArrowUp'] || keys['w']) player.vy -= accel;
        if (keys['ArrowDown'] || keys['s']) player.vy += accel;
        player.vx *= 0.985;
        player.vy *= 0.985;
      }

      // integrate
      player.x = clamp(player.x + player.vx * dt, 0, world.width);
      player.y = clamp(player.y + player.vy * dt, 0, world.height);

      // Camera follow
      const camTargetX = player.x - width / 2;
      const camTargetY = player.y - height / 2;
      camera.x += (camTargetX - camera.x) * 0.08;
      camera.y += (camTargetY - camera.y) * 0.08;
      camera.x = clamp(camera.x, 0, world.width - width);
      camera.y = clamp(camera.y, 0, world.height - height);

      // Move fishes (simple schooling)
      for (const f of fishes) {
        f.pos.x += f.speed * f.dir * dt * 0.03;
        f.pos.y += Math.sin((performance.now() + f.pos.x) * 0.002) * 0.25;
        if (f.pos.x < -50) f.pos.x = world.width + 50;
        if (f.pos.x > world.width + 50) f.pos.x = -50;
      }

      // Sharks
      for (const s of sharks) {
        const toPlayer = { x: player.x - s.pos.x, y: player.y - s.pos.y };
        const dist = Math.sqrt(toPlayer.x * toPlayer.x + toPlayer.y * toPlayer.y);
        if (dist < 450) {
          const nx = toPlayer.x / (dist || 1);
          const ny = toPlayer.y / (dist || 1);
          s.vx += nx * s.speed * dt * 0.02;
          s.vy += ny * s.speed * dt * 0.02;
        } else {
          s.vx += Math.sin((s.pos.y + performance.now() * 0.003) * 0.01) * 0.02;
          s.vy += Math.cos((s.pos.x + performance.now() * 0.002) * 0.01) * 0.02;
        }
        s.vx *= 0.995;
        s.vy *= 0.995;
        s.pos.x += s.vx * dt * 0.03;
        s.pos.y += s.vy * dt * 0.03;
        if (s.pos.x < -60) s.pos.x = world.width + 60;
        if (s.pos.x > world.width + 60) s.pos.x = -60;
        s.pos.y = clamp(s.pos.y, 100, world.height - 150);
        if (distance(s.pos, player) < s.size + 18) {
          if (s.cooldown <= 0) {
            if (player.mode === 'sub') {
              player.health -= 20;
            } else {
              player.oxygen = Math.max(0, player.oxygen - 30);
              if (player.oxygen <= 0) player.health -= 8;
            }
            player.hitTimer = 900;
            s.cooldown = 800;
          }
        }
        s.cooldown = Math.max(0, s.cooldown - dt);
      }

      // Jelly behavior
      for (const j of jellies) {
        j.phase += 0.003 * dt;
        j.pos.x += Math.sin(j.phase + seed) * 0.02;
        j.pos.y += Math.cos(j.phase) * 0.02;
        j.pos.y = clamp(j.pos.y, 80, world.height - 120);
        if (distance(j.pos, player) < j.size + 18) {
          if (player.hitTimer <= 0) {
            if (player.mode === 'sub') {
              player.health -= 8;
            } else {
              player.oxygen = Math.max(0, player.oxygen - 12);
              if (player.oxygen <= 0) player.health -= 4;
            }
            player.hitTimer = 700;
          }
        }
      }

      // Creature AI update
      for (const c of creatures) {
        c.age = (c.age || 0) + dt;
        if (c.caught) continue;
        c.phase += dt * 0.002;
        // species behaviors
        switch (c.species) {
          case 'smallFish':
          case 'largeFish':
            // flocking-ish: slight turning to avoid player and wander
            const avoidP = distance(c.pos, player);
            if (avoidP < 80) {
              const nx = (c.pos.x - player.x) / (avoidP || 1);
              const ny = (c.pos.y - player.y) / (avoidP || 1);
              c.vx += nx * 0.03;
              c.vy += ny * 0.02;
            } else {
              c.vx += Math.sin(c.phase + c.id) * 0.02;
              c.vy += Math.cos(c.phase + c.id) * 0.01;
            }
            c.vx *= 0.995;
            c.vy *= 0.995;
            c.pos.x += c.vx * dt * 0.06;
            c.pos.y += c.vy * dt * 0.04;
            if (c.pos.x < -60) c.pos.x = world.width + 60;
            if (c.pos.x > world.width + 60) c.pos.x = -60;
            c.pos.y = clamp(c.pos.y, 60, world.height - 80);
            break;
          case 'shrimp':
          case 'seaSnail':
          case 'starfish':
          case 'seaCucumber':
            // mostly stay near seabed and drift
            c.pos.x += Math.sin(c.phase + c.id) * 0.02 * dt * 0.05;
            c.pos.y += Math.cos(c.phase + c.id) * 0.02 * dt * 0.02;
            c.pos.y = clamp(c.pos.y, world.height - 320, world.height - 40);
            if (c.pos.x < -60) c.pos.x = world.width + 60;
            if (c.pos.x > world.width + 60) c.pos.x = -60;
            break;
          case 'crab':
            // scuttle along bottom
            c.vx += Math.sin(c.phase + c.id) * 0.01;
            c.pos.x += c.vx * dt * 0.08;
            c.pos.y = clamp(c.pos.y + Math.sin(c.phase + c.id) * 0.02, world.height - 260, world.height - 40);
            break;
          case 'octopus':
            // sometimes hide and jet away if player near
            const d = distance(c.pos, player);
            if (d < 120) {
              c.vx += (c.pos.x - player.x) / (d || 1) * 0.08;
              c.vy += (c.pos.y - player.y) / (d || 1) * 0.06;
            } else {
              c.vx += Math.sin(c.phase + c.id) * 0.01;
            }
            c.vx *= 0.995;
            c.vy *= 0.995;
            c.pos.x += c.vx * dt * 0.06;
            c.pos.y += c.vy * dt * 0.05;
            c.pos.y = clamp(c.pos.y, world.height - 420, world.height - 80);
            break;
          case 'manta':
          case 'dolphin':
            // gliders: smooth wide arcs, rarely interact
            c.vx += Math.sin((c.phase + c.id) * 0.001) * 0.02;
            c.vy += Math.cos((c.phase + c.id) * 0.001) * 0.01;
            c.pos.x += c.vx * dt * 0.04;
            c.pos.y += c.vy * dt * 0.03;
            if (c.pos.x < -200) c.pos.x = world.width + 200;
            if (c.pos.x > world.width + 200) c.pos.x = -200;
            c.pos.y = clamp(c.pos.y, 60, world.height - 220);
            break;
          case 'whale':
            // slow giant migrators
            c.pos.x += Math.sin((c.phase + c.id) * 0.0006) * 0.02 * dt;
            c.pos.y += Math.cos((c.phase + c.id) * 0.0006) * 0.015 * dt;
            c.pos.y = clamp(c.pos.y, 120, world.height - 300);
            break;
          case 'squid':
            c.vx += Math.sin(c.phase + c.id) * 0.02;
            c.vy += Math.cos(c.phase + c.id) * 0.01;
            c.vx *= 0.995;
            c.vy *= 0.995;
            c.pos.x += c.vx * dt * 0.05;
            c.pos.y += c.vy * dt * 0.04;
            c.pos.y = clamp(c.pos.y, 80, world.height - 120);
            break;
          case 'anemone':
            // stationary, sway
            c.phase += dt * 0.001;
            break;
        }
      }

      // Check treasure collection
      for (let i = treasures.length - 1; i >= 0; i--) {
        if (distance(treasures[i], player) < 36) {
          treasures.splice(i, 1);
          collected++;
          saveCollected(collected);
        }
      }

      // Build mode collision/push
      for (const b of baseModules) {
        const dx = player.x - b.x;
        const dy = player.y - b.y;
        const overlapX = Math.abs(dx) - (b.w / 2 + 10);
        const overlapY = Math.abs(dy) - (b.h / 2 + 10);
        if (overlapX < 0 && overlapY < 0) {
          if (Math.abs(overlapX) < Math.abs(overlapY)) {
            player.x += overlapX < 0 ? (overlapX - 0.5) * 0.5 : (overlapX + 0.5) * 0.5;
          } else {
            player.y += overlapY < 0 ? (overlapY - 0.5) * 0.5 : (overlapY + 0.5) * 0.5;
          }
        }
      }

      // oxygen handling
      if (player.mode === 'scuba') {
        const depletionRate = 0.008 * dt;
        player.oxygen = Math.max(0, player.oxygen - depletionRate);
        if (player.oxygen <= 0) {
          player.health -= 0.01 * dt;
        }
      }

      if (player.hitTimer > 0) player.hitTimer = Math.max(0, player.hitTimer - dt);
      if (player.health <= 0) {
        gameOver = true;
        setRunning(false);
      }
    }

    // Rendering helpers for biomes/bases/creatures
    function rectIntersectsScreen(cx: number, cy: number, w: number, h: number) {
      const sx = cx - camera.x;
      const sy = cy - camera.y;
      return sx + w >= -300 && sx <= width + 300 && sy + h >= -300 && sy <= height + 300;
    }

    function drawSeaFloorBase() {
      ctx.save();
      ctx.beginPath();
      const baseTop = world.height - 60 - camera.y * 0.05;
      ctx.moveTo(-400, baseTop + 10);
      const step = 80;
      for (let x = -400; x < world.width + 400; x += step) {
        const localDepthBias = trenchZones.reduce((acc, t) => {
          const dx = Math.abs(x - (t.x + t.width / 2));
          if (dx < t.width / 1.2) {
            const fall = 1 - dx / (t.width / 1.2);
            acc += fall * t.depthBias * 40;
          }
          return acc;
        }, 0);
        const h = baseTop + Math.sin((x + performance.now() * 0.01) * 0.001) * 8 + localDepthBias;
        ctx.lineTo(x, h);
      }
      ctx.lineTo(world.width + 400, world.height + 400 - camera.y * 0.05);
      ctx.lineTo(-400, world.height + 400 - camera.y * 0.05);
      ctx.closePath();
      ctx.fillStyle = '#0d2b3a';
      ctx.fill();
      ctx.restore();
    }

    function drawReefPatch(p: ReefPatch, parallax = 0.6) {
      const px = p.x - camera.x * parallax;
      const py = p.y - camera.y * (parallax * 0.9);
      if (!rectIntersectsScreen(px - p.width / 2, py - 60, p.width + 120, 140)) return;
      ctx.save();
      ctx.translate(px, py);
      for (let i = 0; i < p.complexity; i++) {
        const w = p.width * (0.6 + (i / p.complexity) * 0.8);
        const h = 18 + i * 8;
        ctx.fillStyle = p.colors[i % p.colors.length];
        ctx.beginPath();
        ctx.ellipse((i - p.complexity / 2) * 10, i * 6, w, h, (i % 2 ? 0.15 : -0.12), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawCoralCluster(c: CoralCluster, parallax = 0.85) {
      const px = c.x - camera.x * parallax;
      const py = c.y - camera.y * parallax;
      if (!rectIntersectsScreen(px - c.width / 2, py - 80, c.width + 120, 220)) return;
      ctx.save();
      ctx.translate(px, py);
      ctx.fillStyle = '#3a2b2b';
      ctx.beginPath();
      ctx.ellipse(0, 10, c.width * 0.6, 12 * c.scale, 0, 0, Math.PI * 2);
      ctx.fill();
      const count = Math.floor(4 * c.scale) + 4;
      for (let i = 0; i < count; i++) {
        const cx = (i - count / 2) * (c.scale * 8);
        const h = 18 + Math.abs(i - count / 2) * (6 * c.scale);
        ctx.strokeStyle = c.colors[i % c.colors.length];
        ctx.lineWidth = 3 * c.scale;
        ctx.beginPath();
        ctx.moveTo(cx, 8);
        ctx.quadraticCurveTo(cx + Math.sin(performance.now() * 0.001 + i) * 4, 8 - h / 2, cx + Math.sin(performance.now() * 0.001 + i) * 6, 8 - h);
        ctx.stroke();
        ctx.fillStyle = c.colors[(i + 1) % c.colors.length];
        ctx.beginPath();
        ctx.arc(cx + Math.sin(performance.now() * 0.001 + i) * 6, 8 - h, 4 * c.scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawSeaweedCluster(s: SeaweedCluster, parallax = 0.92) {
      const px = s.x - camera.x * parallax;
      const py = s.y - camera.y * parallax;
      if (!rectIntersectsScreen(px - 60, py - s.height - 40, 120, s.height + 140)) return;
      ctx.save();
      ctx.translate(px, py);
      for (let i = 0; i < s.density; i++) {
        const ox = (i - s.density / 2) * 8 + Math.sin(i * 0.3 + performance.now() * 0.001) * 4;
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = `hsl(${140 + (i % 3) * 8},70%,${28 + (i % 2) * 8}%)`;
        ctx.moveTo(ox, 0);
        ctx.quadraticCurveTo(ox + Math.sin(performance.now() * 0.002 + i) * 12, -s.height / 2, ox + Math.sin(performance.now() * 0.002 + i * 1.5) * 20, -s.height);
        ctx.stroke();
        ctx.fillStyle = `rgba(100,180,140,0.12)`;
        ctx.beginPath();
        ctx.ellipse(ox + 10, -s.height * 0.7 + (i % 3) * 6, 6, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawBases() {
      for (const b of baseModules) {
        const sx = b.x - camera.x;
        const sy = b.y - camera.y;
        if (sx + b.w / 2 < -100 || sx - b.w / 2 > width + 100 || sy + b.h / 2 < -100 || sy - b.h / 2 > height + 100) continue;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(-b.w / 2 - 4, 6, b.w + 8, 6);
        const color = b.type === 'hab' ? '#ffd6a5' : b.type === 'storage' ? '#c1fba4' : '#c7d2fe';
        ctx.fillStyle = color;
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.strokeStyle = '#5a5a5a';
        ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.fillStyle = '#cfefff';
        ctx.fillRect(-b.w / 2 + 6, -6, 8, 8);
        ctx.fillRect(b.w / 2 - 14, -6, 8, 8);
        ctx.restore();
      }
    }

    function drawCreature(c: Creature) {
      const sx = c.pos.x - camera.x;
      const sy = c.pos.y - camera.y;
      if (sx < -120 || sx > width + 120 || sy < -120 || sy > height + 120) return;
      ctx.save();
      ctx.translate(sx, sy);
      // species-specific rendering
      switch (c.species) {
        case 'smallFish':
        case 'largeFish': {
          // ellipse body + tail
          const bodyW = c.size;
          const bodyH = c.size * 0.6;
          const dir = c.vx >= 0 ? 1 : -1;
          ctx.scale(dir, 1);
          ctx.fillStyle = c.species === 'smallFish' ? '#ffcc99' : '#ffd6a5';
          ctx.beginPath();
          ctx.ellipse(0, 0, bodyW, bodyH, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(-bodyW - 2, 0);
          ctx.lineTo(-bodyW - 8, -bodyH);
          ctx.lineTo(-bodyW - 8, bodyH);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'octopus': {
          ctx.fillStyle = '#8cb6ff';
          ctx.beginPath();
          ctx.arc(0, -4, c.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
          // tentacles
          for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo((i - 3) * 3, 6);
            ctx.quadraticCurveTo((i - 3) * 6 + Math.sin(c.phase + i) * 4, 10 + i * 2, (i - 3) * 10 + Math.sin(c.phase + i * 1.5) * 8, 18 + (i % 2) * 2);
            ctx.strokeStyle = '#8cb6ff';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          break;
        }
        case 'anemone': {
          ctx.fillStyle = '#ff9fb1';
          for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            const ang = (i / 8) * Math.PI;
            const ox = Math.sin(c.phase + i) * 4;
            ctx.ellipse(ox + Math.cos(ang) * 6, Math.sin(ang) * -10, 4, 10, ang * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#6b3b2a';
          ctx.fillRect(-6, 6, 12, 8);
          break;
        }
        case 'crab': {
          ctx.fillStyle = '#d96b4c';
          ctx.beginPath();
          ctx.ellipse(0, 0, c.size * 0.7, c.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(-c.size * 0.9, -2, 6, 3);
          ctx.fillRect(c.size * 0.9 - 6, -2, 6, 3);
          break;
        }
        case 'shrimp': {
          ctx.fillStyle = '#ffefcc';
          ctx.beginPath();
          ctx.ellipse(0, 0, c.size * 0.8, c.size * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'whale': {
          ctx.fillStyle = '#305b75';
          ctx.beginPath();
          ctx.ellipse(0, 0, c.size, c.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#203b4a';
          ctx.fillRect(c.size * -0.2, -c.size * 0.25, c.size * 0.6, 6);
          break;
        }
        case 'dolphin': {
          ctx.fillStyle = '#6ea9c8';
          ctx.beginPath();
          ctx.ellipse(0, 0, c.size, c.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'seaSnail': {
          ctx.fillStyle = '#9bb97e';
          ctx.beginPath();
          ctx.ellipse(0, 0, c.size * 0.6, c.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#6b4a2a';
          ctx.beginPath();
          ctx.arc(-c.size * 0.1, -2, c.size * 0.35, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'starfish': {
          ctx.fillStyle = '#ffb86b';
          ctx.beginPath();
          ctx.moveTo(0, -c.size * 0.6);
          for (let i = 1; i <= 5; i++) {
            const ang = (i / 5) * Math.PI * 2;
            ctx.lineTo(Math.sin(ang) * c.size * 0.5, -Math.cos(ang) * c.size * 0.5);
          }
          ctx.fill();
          break;
        }
        case 'seaCucumber': {
          ctx.fillStyle = '#8aa97a';
          ctx.fillRect(-c.size * 0.5, -c.size * 0.2, c.size, c.size * 0.4);
          break;
        }
        case 'manta': {
          ctx.fillStyle = '#2f4f5f';
          ctx.beginPath();
          ctx.moveTo(-c.size, 0);
          ctx.quadraticCurveTo(0, -c.size * 0.6 + Math.sin(c.phase) * 6, c.size, 0);
          ctx.lineTo(0, c.size * 0.2);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'squid': {
          ctx.fillStyle = '#a58cff';
          ctx.beginPath();
          ctx.ellipse(0, -4, c.size * 0.6, c.size * 0.9, 0, 0, Math.PI * 2);
          ctx.fill();
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo((i - 2) * 3, 6);
            ctx.quadraticCurveTo((i - 2) * 6, 12 + i * 2, (i - 2) * 8, 18 + i * 3);
            ctx.strokeStyle = '#a58cff';
            ctx.stroke();
          }
          break;
        }
      }
      ctx.restore();
    }

    function drawBackground() {
      ctx.save();
      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, '#cfefff');
      g.addColorStop(0.36, '#86d0ea');
      g.addColorStop(0.72, '#35637a');
      g.addColorStop(1, '#02131d');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // seabed
      drawSeaFloorBase();

      // far reef patches
      for (const p of reefPatches) drawReefPatch(p, 0.6);
      // coral clusters
      for (const c of coralClusters) {
        const par = 0.82 + (1 - clamp((world.height - c.y) / world.height, 0, 1)) * 0.08;
        drawCoralCluster(c, par);
      }
      // seaweed
      for (const s of seaweedClusters) drawSeaweedCluster(s, 0.92);

      // trench shading
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = '#000';
      for (const t of trenchZones) {
        const sx = t.x - camera.x * 0.4;
        const sw = t.width;
        if (sx + sw < -200 || sx > width + 200) continue;
        ctx.fillRect(sx, 0, sw, height);
      }
      ctx.restore();
    }

    function drawEntities() {
      // draw creatures first (so player and bases render on top as appropriate)
      for (const c of creatures) {
        if (c.caught) continue;
        drawCreature(c);
      }

      // fishes
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
        ctx.fillStyle = '#f9d976';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c47a00';
        ctx.fillRect(-8, 5, 16, 6);
        ctx.restore();
      }

      // sharks, jellies (kept earlier visuals)
      for (const s of sharks) {
        const sx = s.pos.x - camera.x;
        const sy = s.pos.y - camera.y;
        if (sx < -100 || sx > width + 100 || sy < -100 || sy > height + 100) continue;
        ctx.save();
        ctx.translate(sx, sy);
        const ang = Math.atan2(s.vy || 0, s.vx || 1);
        ctx.rotate(ang);
        ctx.fillStyle = '#6b7b85';
        ctx.beginPath();
        ctx.ellipse(0, 0, s.size, s.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4a5960';
        ctx.beginPath();
        ctx.moveTo(-s.size * 0.2, -s.size * 0.6);
        ctx.lineTo(0, -s.size * 0.2);
        ctx.lineTo(s.size * 0.2, -s.size * 0.6);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.size * 0.35, -s.size * 0.12, Math.max(2, s.size * 0.08), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (const j of jellies) {
        const sx = j.pos.x - camera.x;
        const sy = j.pos.y - camera.y;
        if (sx < -60 || sx > width + 60 || sy < -60 || sy > height + 60) continue;
        ctx.save();
        ctx.translate(sx, sy);
        const alpha = 0.6 + Math.sin(j.phase) * 0.15;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#c4a7ff';
        ctx.beginPath();
        ctx.ellipse(0, 0, j.size, j.size * 0.8, 0, Math.PI, Math.PI * 2);
        ctx.fill();
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

      // draw bases and player on top
      drawBases();

      // player
      const px = player.x - camera.x;
      const py = player.y - camera.y;
      ctx.save();
      for (let i = 0; i < 6; i++) {
        ctx.globalAlpha = 0.06 + i * 0.06;
        ctx.beginPath();
        ctx.arc(px - player.vx * (i * 6 + 8), py - player.vy * (i * 6 + 8) + i * 6, 3 + i * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = '#e6f7ff';
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (player.mode === 'sub') {
        ctx.fillStyle = '#ffb86b';
        ctx.beginPath();
        ctx.ellipse(px, py, 24, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffdbb3';
        ctx.fillRect(px + 4, py - 16, 18, 12);
        ctx.fillStyle = '#cfefff';
        ctx.beginPath();
        ctx.arc(px - 6, py - 2, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.ellipse(px, py, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dff0ff';
        ctx.beginPath();
        ctx.arc(px - 2, py - 4, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (player.hitTimer > 0) {
        ctx.save();
        const alpha = (player.hitTimer / 900) * 0.5;
        ctx.fillStyle = `rgba(255,30,30,${alpha})`;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // build preview
      if (buildMode && buildPreview) {
        const sx = buildPreview.x - camera.x;
        const sy = buildPreview.y - camera.y;
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(sx - 20, sy - 18, 40, 36);
        ctx.strokeRect(sx - 20, sy - 18, 40, 36);
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.fillText(`${buildPreview.type} (cost ${moduleCost(buildPreview.type)})`, sx + 28, sy - 4);
        ctx.restore();
      }
    }

    function drawHUD() {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(10, 10, 380, 140);
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Ocean Explorer`, 18, 32);
      ctx.fillText(`Mode: ${player.mode === 'sub' ? 'Submarine' : 'Scuba Diver'}`, 18, 52);
      ctx.fillText(`Treasures: ${collected}/${14}`, 18, 72);
      ctx.fillText(`Depth: ${Math.floor(player.y)}m`, 18, 92);
      ctx.restore();

      if (player.mode === 'scuba') {
        ctx.save();
        const hx = 18;
        const hy = 112;
        const hw = 260;
        const hh = 10;
        ctx.fillStyle = '#222';
        ctx.fillRect(hx, hy, hw, hh);
        const pct = clamp(player.oxygen / 100, 0, 1);
        ctx.fillStyle = '#7ad1ff';
        ctx.fillRect(hx, hy, hw * pct, hh);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(hx, hy, hw, hh);
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.fillText(`Oxygen: ${Math.max(0, Math.floor(player.oxygen))}%`, hx + 6, hy + 9);
        ctx.restore();
      }

      // health bar
      ctx.save();
      const hx = 18;
      const hy = player.mode === 'scuba' ? 134 : 112;
      const hw = 260;
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
      ctx.fillText(`Hull/Health: ${Math.max(0, Math.floor(player.health))}%`, hx + 6, hy + 9);
      ctx.restore();

      // inventory
      ctx.save();
      const invX = 410;
      const invY = 10;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(invX, invY, 240, 180);
      ctx.fillStyle = '#fff';
      ctx.font = '13px sans-serif';
      ctx.fillText('Inventory (F to catch, R to eat):', invX + 10, invY + 22);
      ctx.font = '12px monospace';
      const inv = inventoryRef.current;
      const speciesOrder: CreatureSpecies[] = ['smallFish', 'largeFish', 'shrimp', 'crab', 'octopus', 'squid', 'seaSnail'];
      let y = invY + 44;
      for (const s of speciesOrder) {
        const cnt = inv[s] || 0;
        ctx.fillText(`${s.padEnd(12)} x ${String(cnt).padStart(3)}`, invX + 12, y);
        y += 18;
      }
      ctx.restore();

      // minimap / instructions
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.36)';
      ctx.fillRect(width - 220, height - 120, 210, 110);
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.fillText('Controls: WASD/arrows move | E: Toggle Sub/Scuba | B: Build | F: Catch | R: Eat', width - 208, height - 96);
      ctx.fillText('Build while scuba near seabed. Use treasures to build modules.', width - 208, height - 76);
      ctx.restore();
    }

    let last = performance.now();

    function loop(now: number) {
      const dt = Math.min(40, now - last);
      last = now;
      if (running) update(dt);

      ctx.clearRect(0, 0, width, height);
      drawBackground();
      drawEntities();
      drawHUD();

      if (collected >= 14) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, height / 2 - 40, width, 80);
        ctx.fillStyle = '#fff';
        ctx.font = '36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Expedition Complete!', width / 2, height / 2 + 12);
        ctx.restore();
      }

      if (gameOver) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#ffdddd';
        ctx.font = '36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Mission Failed', width / 2, height / 2 - 6);
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
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('resize', resize);
    };
  }, [running, seed]);

  // UI handlers
  function handleRestart() {
    location.reload();
  }

  return (
    <div style={{ width: '100%', maxWidth: 1200 }}>
      <h3>Underwater Odyssey — Ocean Explorer (Expanded Fauna & Fishing)</h3>
      <p>
        Use WASD or arrow keys to move. E to toggle Sub / Scuba. B to toggle Build Mode while scuba near the seabed. F to catch nearby edible
        creatures while scuba. R to eat from your inventory and restore oxygen/health. Press Space to pause.
      </p>
      <div style={{ border: '2px solid #053b5a', borderRadius: 8, overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 640, display: 'block', background: '#69c0de' }} />
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Resume'}</button>
        <button onClick={handleRestart}>Restart</button>
      </div>
    </div>
  );
}

// Persistence helpers
function saveBases(bases: BaseModule[]) {
  try {
    localStorage.setItem('pp_bases_v1', JSON.stringify(bases));
  } catch (e) {}
}
function loadBases(): BaseModule[] {
  try {
    const v = localStorage.getItem('pp_bases_v1');
    if (!v) return [];
    return JSON.parse(v) as BaseModule[];
  } catch (e) {
    return [];
  }
}
function saveCollected(n: number) {
  try {
    localStorage.setItem('pp_collected_v1', String(n));
  } catch (e) {}
}
function loadCollected(): number {
  try {
    const v = localStorage.getItem('pp_collected_v1');
    if (!v) return 0;
    return parseInt(v, 10) || 0;
  } catch (e) {
    return 0;
  }
}
