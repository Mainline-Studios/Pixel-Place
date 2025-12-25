import React, { useEffect, useRef } from 'react';

// JungleJourneySeries.tsx
// Dense jungle scene with thick trees, swamps, realistic terrain, fauna and fruits
// Added: lightweight clan system and camp creation (clans > 6 members can create a camp)

type Tile = {
  elevation: number; // 0..1
  humidity: number;  // 0..1
  feature?: 'water' | 'swamp' | 'tree' | 'clear' | 'vine' | 'lily';
};

type Animal = {
  species: string;
  x: number; // pixel position
  y: number; // pixel position
  size: number;
  color?: string;
  id: number;
  edible?: boolean;
  hostile?: boolean;
  attackDamage?: number;
  aggroRange?: number;
  aggroProbability?: number;
};

type Fruit = {
  kind: string;
  x: number; // pixel
  y: number; // pixel
  size: number;
  edible: boolean;       // safe to eat
  poisonous: boolean;    // causes poisoning (but not instant death)
  lethal: boolean;       // causes instant death if consumed
  tileX: number;         // tile coordinate
  tileY: number;
  id: number;
};

// Lightweight player / clan types for gameplay integration
export type Player = {
  id: string;
  name: string;
  // additional player state (health, inventory, position) should be managed by game code
};

export type Camp = {
  id: string;
  clanId: string;
  x: number; // pixel
  y: number; // pixel
  createdAt: number;
};

export type Clan = {
  id: string;
  name: string;
  ownerId: string;
  members: string[]; // player IDs
  canCreateCamp: boolean;
  camp?: Camp | null;
};

const TILE_SIZE = 8; // pixels per tile for canvas preview
const MAP_W = 80;
const MAP_H = 48;

// Simple seeded deterministic random
function seededRandom(seed: number) {
  return function() {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967295;
  };
}

function smoothstep(t: number) { return t * t * (3 - 2 * t); }

function valueNoise(width: number, height: number, scale: number, seed = 1) {
  const rand = seededRandom(seed);
  const gridW = Math.ceil(width / scale) + 2;
  const gridH = Math.ceil(height / scale) + 2;
  const values: number[] = new Array(gridW * gridH).fill(0).map(() => rand());

  function getGrid(x: number, y: number) { return values[(y * gridW) + x]; }

  return (x: number, y: number) => {
    const gx = x / scale;
    const gy = y / scale;
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const sx = smoothstep(gx - x0);
    const sy = smoothstep(gy - y0);

    const v00 = getGrid(x0 + 1, y0 + 1);
    const v10 = getGrid(x0 + 2, y0 + 1);
    const v01 = getGrid(x0 + 1, y0 + 2);
    const v11 = getGrid(x0 + 2, y0 + 2);

    const ix0 = v00 * (1 - sx) + v10 * sx;
    const ix1 = v01 * (1 - sx) + v11 * sx;
    return ix0 * (1 - sy) + ix1 * sy;
  };
}

function generateJungleMap(seed = 42) {
  const elevationNoise = valueNoise(MAP_W, MAP_H, 12, seed * 23 + 7);
  const humidityNoise = valueNoise(MAP_W, MAP_H, 8, seed * 17 + 13);
  const detailNoise = valueNoise(MAP_W, MAP_H, 3, seed * 29 + 3);

  const map: Tile[][] = [];

  for (let y = 0; y < MAP_H; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < MAP_W; x++) {
      const e = elevationNoise(x, y);
      const h = Math.min(1, Math.max(0, humidityNoise(x, y)));
      row.push({ elevation: e, humidity: h, feature: 'clear' });
    }
    map.push(row);
  }

  // Determine water level and swamp pockets
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const t = map[y][x];
      const d = detailNoise(x, y);

      if (t.elevation < 0.32 - d * 0.07) {
        t.feature = 'water';
      } else if (t.elevation < 0.42 && t.humidity > 0.6) {
        if (d > 0.35) t.feature = 'swamp';
      }
    }
  }

  // Dense trees: prefer medium elevation, very high humidity, and not on water/swamp
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const t = map[y][x];
      if (t.feature === 'clear') {
        const d = detailNoise(x, y);
        const canopyScore = (t.humidity * 0.7) + (1 - Math.abs(t.elevation - 0.6)) * 0.4 + d * 0.4;
        if (canopyScore > 0.85 || (canopyScore > 0.72 && neighborsHaveTrees(map, x, y))) {
          t.feature = 'tree';
        }
      }
    }
  }

  // Add vines and lily pads in swampy areas
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const t = map[y][x];
      if (t.feature === 'swamp') {
        if (detailNoise(x + 5, y + 7) > 0.6) t.feature = 'lily';
        else if (detailNoise(x + 11, y + 3) > 0.68) t.feature = 'vine';
      }
    }
  }

  return map;
}

function neighborsHaveTrees(map: Tile[][], x: number, y: number) {
  for (let oy = -2; oy <= 2; oy++) {
    for (let ox = -2; ox <= 2; ox++) {
      if (ox === 0 && oy === 0) continue;
      const nx = x + ox;
      const ny = y + oy;
      if (nx >= 0 && ny >= 0 && ny < map.length && nx < map[0].length) {
        if (map[ny][nx].feature === 'tree') return true;
      }
    }
  }
  return false;
}

function tileColor(tile: Tile) {
  switch (tile.feature) {
    case 'water': return '#1B6CA8';
    case 'swamp': return '#3B6B2F';
    case 'lily': return '#2E8B57';
    case 'vine': return '#2F5E2E';
    case 'tree': {
      const g = Math.floor(100 + tile.humidity * 80 - tile.elevation * 30);
      const r = Math.floor(30 + (1 - tile.elevation) * 20);
      const b = Math.floor(20 + tile.elevation * 10);
      return `rgb(${r},${g},${b})`;
    }
    default:
      const tone = Math.floor(70 + tile.humidity * 60 - tile.elevation * 20);
      return `rgb(${40},${tone},${30})`;
  }
}

function spawnFauna(map: Tile[][], seed = 42) {
  const rand = seededRandom(seed * 97 + 13);
  const animals: Animal[] = [];
  let idCounter = 1;

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const t = map[y][x];
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;

      // water: fish, otters, hippos
      if (t.feature === 'water') {
        if (rand() < 0.06) animals.push({ species: 'fish', x: px + rand() * TILE_SIZE, y: py + rand() * TILE_SIZE, size: 4 + rand() * 4, id: idCounter++ , edible: true});
        if (rand() < 0.01) animals.push({ species: 'otter', x: px + rand() * TILE_SIZE, y: py + rand() * TILE_SIZE, size: 8, id: idCounter++ });
        if (rand() < 0.008) animals.push({ species: 'hippo', x: px + rand() * TILE_SIZE, y: py + rand() * TILE_SIZE, size: 18, id: idCounter++ , hostile: true, attackDamage: 18, aggroRange: 18});
      }

      // swamp inhabitants
      if (t.feature === 'swamp' || t.feature === 'lily') {
        if (rand() < 0.08) animals.push({ species: 'frog', x: px + rand() * TILE_SIZE, y: py + rand() * TILE_SIZE, size: 4, id: idCounter++, edible: true });
        if (rand() < 0.04) animals.push({ species: 'capybara', x: px + rand() * TILE_SIZE, y: py + rand() * TILE_SIZE, size: 12, id: idCounter++ });
        if (rand() < 0.03) animals.push({ species: 'lizard', x: px + rand() * TILE_SIZE, y: py + rand() * TILE_SIZE, size: 5, id: idCounter++, edible: true });
      }

      // trees: monkeys, parrots, toucans, sloths, jaguars occasionally
      if (t.feature === 'tree') {
        if (rand() < 0.06) animals.push({ species: 'monkey', x: px + rand() * TILE_SIZE, y: py + rand() * TILE_SIZE, size: 8, id: idCounter++ });
        if (rand() < 0.03) animals.push({ species: 'parrot', x: px + rand() * TILE_SIZE, y: py + rand() * TILE_SIZE, size: 6, id: idCounter++ });
        if (rand() < 0.02) animals.push({ species: 'toucan', x: px + rand() * TILE_SIZE, y: py + rand() * TILE_SIZE, size: 6, id: idCounter++ });
        if (rand() < 0.015) animals.push({ species: 'sloth', x: px + rand() * TILE_SIZE, y: py + rand() * TILE_SIZE, size: 10, id: idCounter++ });
        if (rand() < 0.008) animals.push({ species: 'jaguar', x: px + rand() * TILE_SIZE, y: py + rand() * TILE_SIZE, size: 14, id: idCounter++, hostile: true, attackDamage: 22, aggroRange: 30 });
      }

      // clear ground: lizards, occasional elephants, lions, bears, pandas
      if (t.feature === 'clear') {
        if (rand() < 0.03) animals.push({ species: 'lizard', x: px + rand() * TILE_SIZE, y: py + rand() * TILE_SIZE, size: 5, id: idCounter++, edible: true });
        if (rand() < 0.003 && rand() > 0.6) animals.push({ species: 'elephant', x: px + rand() * TILE_SIZE, y: py + rand() * TILE_SIZE, size: 24, id: idCounter++, hostile: true, attackDamage: 28, aggroProbability: 0.15 });
        if (rand() < 0.002) animals.push({ species: 'lion', x: px + rand() * TILE_SIZE, y: py + rand() * TILE_SIZE, size: 16, id: idCounter++, hostile: true, attackDamage: 20, aggroRange: 28 });
        if (rand() < 0.002) animals.push({ species: 'panda', x: px + rand() * TILE_SIZE, y: py + rand() * TILE_SIZE, size: 16, id: idCounter++ , hostile: true, attackDamage: 12 });
        if (rand() < 0.002) animals.push({ species: 'bear', x: px + rand() * TILE_SIZE, y: py + rand() * TILE_SIZE, size: 18, id: idCounter++, edible: true, hostile: true, attackDamage: 24 });
      }
    }
  }

  // Post-process: ensure animals inside canvas bounds
  for (const a of animals) {
    a.x = Math.max(1, Math.min(a.x, MAP_W * TILE_SIZE - 2));
    a.y = Math.max(1, Math.min(a.y, MAP_H * TILE_SIZE - 2));
  }

  return animals;
}

// Spawn fruits and mushrooms with edible / poisonous / lethal metadata
function spawnFruits(map: Tile[][], seed = 42) {
  const rand = seededRandom(seed * 131 + 7);
  const fruits: Fruit[] = [];
  let idCounter = 1;

  const treeFruits = [
    { kind: 'passion_fruit', edible: true, poisonous: false, lethal: false },
    { kind: 'star_fruit', edible: true, poisonous: false, lethal: false },
    { kind: 'papaya', edible: true, poisonous: false, lethal: false },
    { kind: 'pineapple', edible: true, poisonous: false, lethal: false },
    { kind: 'sugar_apple', edible: true, poisonous: false, lethal: false },
    { kind: 'berries', edible: true, poisonous: false, lethal: false }
  ];

  const groundFruits = [
    { kind: 'edible_mushroom', edible: true, poisonous: false, lethal: false },
    { kind: 'poisonous_mushroom', edible: false, poisonous: true, lethal: false }
  ];

  const deadlyFruits = [
    { kind: 'ackee', edible: false, poisonous: true, lethal: false },
    { kind: 'elderberry', edible: false, poisonous: true, lethal: false },
    { kind: 'manchineel', edible: false, poisonous: true, lethal: true }
  ];

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const t = map[y][x];
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;

      if (t.feature === 'tree') {
        if (rand() < 0.12) {
          const pick = treeFruits[Math.floor(rand() * treeFruits.length)];
          fruits.push({
            kind: pick.kind,
            x: px + TILE_SIZE * (0.2 + rand() * 0.6),
            y: py + TILE_SIZE * (0.15 + rand() * 0.5),
            size: 3 + Math.floor(rand() * 3),
            edible: pick.edible,
            poisonous: pick.poisonous,
            lethal: pick.lethal,
            tileX: x,
            tileY: y,
            id: idCounter++
          });
        }
        if (rand() < 0.0015) {
          const df = deadlyFruits.find(f => f.kind === 'manchineel')!;
          fruits.push({
            kind: df.kind,
            x: px + TILE_SIZE * (0.2 + rand() * 0.6),
            y: py + TILE_SIZE * (0.15 + rand() * 0.5),
            size: 4,
            edible: df.edible,
            poisonous: df.poisonous,
            lethal: df.lethal,
            tileX: x,
            tileY: y,
            id: idCounter++
          });
        }
      }

      if (t.feature === 'clear' || t.feature === 'swamp') {
        if (rand() < 0.02) {
          const pick = groundFruits[Math.floor(rand() * groundFruits.length)];
          fruits.push({
            kind: pick.kind,
            x: px + TILE_SIZE * (0.2 + rand() * 0.6),
            y: py + TILE_SIZE * (0.6 + rand() * 0.3),
            size: 2 + Math.floor(rand() * 3),
            edible: pick.edible,
            poisonous: pick.poisonous,
            lethal: pick.lethal,
            tileX: x,
            tileY: y,
            id: idCounter++
          });
        }
        if (rand() < 0.0015) {
          const pick = deadlyFruits[Math.floor(rand() * deadlyFruits.length)];
          if (pick.kind !== 'manchineel' && rand() < 0.5) {
            fruits.push({
              kind: pick.kind,
              x: px + TILE_SIZE * (0.3 + rand() * 0.4),
              y: py + TILE_SIZE * (0.6 + rand() * 0.3),
              size: 3,
              edible: pick.edible,
              poisonous: pick.poisonous,
              lethal: pick.lethal,
              tileX: x,
              tileY: y,
              id: idCounter++
            });
          }
        }
      }

      if (t.feature === 'lily') {
        if (rand() < 0.02) {
          fruits.push({
            kind: 'berries',
            x: px + TILE_SIZE * (0.3 + rand() * 0.4),
            y: py + TILE_SIZE * (0.4 + rand() * 0.3),
            size: 2 + Math.floor(rand() * 2),
            edible: true,
            poisonous: false,
            lethal: false,
            tileX: x,
            tileY: y,
            id: idCounter++
          });
        }
      }
    }
  }

  for (const f of fruits) {
    f.x = Math.max(1, Math.min(f.x, MAP_W * TILE_SIZE - 2));
    f.y = Math.max(1, Math.min(f.y, MAP_H * TILE_SIZE - 2));
  }

  return fruits;
}

export default function JungleJourneySeries({ seed = 42 }: { seed?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = MAP_W * TILE_SIZE;
    canvas.height = MAP_H * TILE_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const map = generateJungleMap(seed);
    const animals = spawnFauna(map, seed);
    const fruits = spawnFruits(map, seed);

    // Render base tiles
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const t = map[y][x];
        ctx.fillStyle = tileColor(t);
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

    // Add tile details (water edge, trunks, lilies, vines)
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const t = map[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        if (t.feature === 'water') {
          if (isAdjacentTo(map, x, y, (f) => f !== 'water')) {
            ctx.fillStyle = 'rgba(46,122,184,0.28)';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          }
          ctx.fillStyle = 'rgba(255,255,255,0.04)';
          ctx.fillRect(px + (TILE_SIZE/4)|0, py + (TILE_SIZE/4)|0, TILE_SIZE/2, TILE_SIZE/2);
        }

        if (t.feature === 'swamp') {
          ctx.fillStyle = 'rgba(30,18,8,0.12)';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          if (Math.random() > 0.8) {
            ctx.fillStyle = 'rgba(80,120,60,0.9)';
            ctx.fillRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          }
        }

        if (t.feature === 'lily') {
          ctx.fillStyle = '#2FA36A';
          ctx.beginPath();
          ctx.ellipse(px + TILE_SIZE/2, py + TILE_SIZE/2, TILE_SIZE*0.4, TILE_SIZE*0.25, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        if (t.feature === 'vine') {
          ctx.strokeStyle = 'rgba(30,80,30,0.9)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px + TILE_SIZE/2, py);
          ctx.lineTo(px + TILE_SIZE/2, py + TILE_SIZE);
          ctx.stroke();
        }

        if (t.feature === 'tree') {
          ctx.fillStyle = '#3B2314';
          ctx.fillRect(px + TILE_SIZE/2 - 1, py + TILE_SIZE - 3, 2, 3);
          ctx.fillStyle = 'rgba(10,60,20,0.9)';
          ctx.beginPath();
          ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, TILE_SIZE * 0.9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(70,130,60,0.12)';
          ctx.beginPath();
          ctx.arc(px + TILE_SIZE/2 - 1, py + TILE_SIZE/2 - 1, TILE_SIZE * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw fruits (visual markers). NOTE: per request poisonous/lethal fruits are visually indistinguishable from normal fruits.
    for (const f of fruits) {
      drawFruit(ctx, f);
    }

    // Draw animals
    for (const a of animals) {
      drawAnimal(ctx, a);
    }

    // Global fog/haze
    const fogGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    fogGrad.addColorStop(0, 'rgba(230,250,240,0.02)');
    fogGrad.addColorStop(1, 'rgba(20,30,20,0.06)');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

  }, [seed]);

  return (
    <div style={{ border: '1px solid #222', display: 'inline-block', imageRendering: 'pixelated' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}

// Helpers
function isAdjacentTo(map: Tile[][], x: number, y: number, predicate: (f: string) => boolean) {
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      if (ox === 0 && oy === 0) continue;
      const nx = x + ox;
      const ny = y + oy;
      if (nx >= 0 && ny >= 0 && ny < map.length && nx < map[0].length) {
        if (predicate(map[ny][nx].feature!)) return true;
      }
    }
  }
  return false;
}

function drawAnimal(ctx: CanvasRenderingContext2D, a: Animal) {
  const x = a.x;
  const y = a.y;
  const s = a.size;

  switch (a.species) {
    case 'fish':
      ctx.fillStyle = '#F2A65A';
      ctx.beginPath();
      ctx.ellipse(x, y, s * 0.6, s * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(x + s * 0.4, y - 1, 2, 2);
      break;
    case 'frog':
      ctx.fillStyle = '#2EA849';
      ctx.beginPath();
      ctx.ellipse(x, y, s * 0.6, s * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#153716';
      ctx.fillRect(x - s * 0.2, y - s * 0.1, 2, 2);
      break;
    case 'hippo':
      ctx.fillStyle = '#6C6E72';
      ctx.beginPath();
      ctx.ellipse(x, y, s, s * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'otter':
      ctx.fillStyle = '#7A4F2B';
      ctx.beginPath();
      ctx.ellipse(x, y, s * 0.9, s * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'capybara':
      ctx.fillStyle = '#9B6B3A';
      ctx.beginPath();
      ctx.ellipse(x, y, s * 1.0, s * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'monkey':
      ctx.fillStyle = '#8B5A2B';
      ctx.beginPath();
      ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'parrot':
      ctx.fillStyle = '#2ECC71';
      ctx.beginPath();
      ctx.arc(x, y, s * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFD400';
      ctx.fillRect(x + 2, y - 1, 3, 2);
      break;
    case 'toucan':
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(x, y, s * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFD54F';
      ctx.beginPath();
      ctx.ellipse(x + s * 0.8, y, s * 0.55, s * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'jaguar':
      ctx.fillStyle = '#D9A84A';
      ctx.beginPath();
      ctx.ellipse(x, y, s * 0.9, s * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      // spots
      ctx.fillStyle = '#1B130E';
      ctx.fillRect(x - 3, y - 2, 2, 2);
      ctx.fillRect(x + 1, y, 2, 2);
      break;
    case 'sloth':
      ctx.fillStyle = '#7E5A3C';
      ctx.beginPath();
      ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'lizard':
      ctx.fillStyle = '#5FB86E';
      ctx.beginPath();
      ctx.ellipse(x, y, s * 0.8, s * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'elephant':
      ctx.fillStyle = '#9AA0A6';
      ctx.beginPath();
      ctx.ellipse(x, y, s * 1.2, s * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8F9599';
      ctx.fillRect(x + s * 0.9, y - s * 0.05, s * 0.25, s * 0.2);
      break;
    case 'lion':
      ctx.fillStyle = '#D7A24A';
      ctx.beginPath();
      ctx.ellipse(x, y, s * 0.9, s * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9B5A2B';
      ctx.beginPath();
      ctx.arc(x, y - s * 0.1, s * 0.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'panda':
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, s * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(x - s * 0.25, y - s * 0.05, s * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + s * 0.25, y - s * 0.05, s * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'bear':
      ctx.fillStyle = '#6B3E23';
      ctx.beginPath();
      ctx.ellipse(x, y, s * 1.0, s * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    default:
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 1, y - 1, 2, 2);
      break;
  }
}

// Draw fruit visual; per request poisonous/lethal fruits are visually indistinguishable from normal fruits
function drawFruit(ctx: CanvasRenderingContext2D, f: Fruit) {
  const colorMap: Record<string, string> = {
    passion_fruit: '#7EC850',
    star_fruit: '#FBE870',
    papaya: '#F59E4A',
    pineapple: '#F5D16A',
    sugar_apple: '#E3F7C6',
    berries: '#B93C6B',
    edible_mushroom: '#E6CDAA',
    poisonous_mushroom: '#8B3E72',
    ackee: '#E98B3C',
    elderberry: '#4B2A7A',
    manchineel: '#2F4F2F'
  };

  const c = colorMap[f.kind] || '#FFD400';
  ctx.beginPath();
  ctx.fillStyle = c;
  ctx.arc(f.x, f.y, Math.max(1, f.size), 0, Math.PI * 2);
  ctx.fill();

  // Only show edible marker for clearly edible non-poisonous items
  if (f.edible && !f.poisonous && !f.lethal) {
    ctx.fillStyle = 'rgba(255,215,64,0.9)';
    ctx.fillRect(f.x - 1, f.y - 1, 2, 2);
  }

  // Note: poisonous and lethal fruits intentionally have no outline or visible indicator here.
}

// --- Clan system (in-memory store) ---
// This is a minimal implementation to be used by game logic. Replace with persistent server-backed store as needed.
const clans = new Map<string, Clan>();

function makeId(prefix = '') { return prefix + Math.random().toString(36).slice(2, 9); }

export function createClan(name: string, owner: Player): Clan {
  const id = makeId('clan_');
  const clan: Clan = { id, name, ownerId: owner.id, members: [owner.id], canCreateCamp: false, camp: null };
  clans.set(id, clan);
  return clan;
}

export function joinClan(clanId: string, player: Player): Clan | null {
  const clan = clans.get(clanId);
  if (!clan) return null;
  if (!clan.members.includes(player.id)) {
    clan.members.push(player.id);
    // update camp eligibility
    clan.canCreateCamp = clan.members.length > 6;
  }
  return clan;
}

export function leaveClan(clanId: string, playerId: string): Clan | null {
  const clan = clans.get(clanId);
  if (!clan) return null;
  clan.members = clan.members.filter(m => m !== playerId);
  // if owner leaves and there are members left, assign a new owner (first member)
  if (clan.ownerId === playerId) {
    clan.ownerId = clan.members[0] || '';
  }
  clan.canCreateCamp = clan.members.length > 6;
  // if members drop below threshold, optionally remove camp
  if (clan.members.length <= 6 && clan.camp) {
    // automatically remove camp (game can decide to persist instead)
    clan.camp = null;
  }
  return clan;
}

export function getClan(clanId: string): Clan | null {
  return clans.get(clanId) ?? null;
}

export function createCamp(clanId: string, x: number, y: number): Camp | null {
  const clan = clans.get(clanId);
  if (!clan) return null;
  if (!clan.canCreateCamp) return null; // not enough members
  const camp: Camp = { id: makeId('camp_'), clanId: clan.id, x, y, createdAt: Date.now() };
  clan.camp = camp;
  return camp;
}

// Drawing helper for fruits/animals etc. reused above
