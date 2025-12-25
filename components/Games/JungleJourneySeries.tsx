import React, { useEffect, useRef } from 'react';

// JungleJourneySeries.tsx
// Generates a dense jungle scene with thick trees, swamps, and realistic terrain

type Tile = {
  elevation: number; // 0..1
  humidity: number;  // 0..1
  feature?: 'water' | 'swamp' | 'tree' | 'clear' | 'vine' | 'lily';
};

const TILE_SIZE = 8; // pixels per tile for canvas preview
const MAP_W = 80;
const MAP_H = 48;

// Simple value-noise (coherent) generator using hashing and interpolation
function seededRandom(seed: number) {
  return function() {
    // Xorshift32-ish
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
  // Water is where elevation is very low; swamps are low-elevation high-humidity
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const t = map[y][x];
      // Introduce river meanders using detail noise
      const d = detailNoise(x, y);

      if (t.elevation < 0.32 - d * 0.07) {
        t.feature = 'water';
      } else if (t.elevation < 0.42 && t.humidity > 0.6) {
        // swamps form in lower, humid areas with some randomness
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
        // canopy probability increases with humidity and mid-elevation
        const canopyScore = (t.humidity * 0.7) + (1 - Math.abs(t.elevation - 0.6)) * 0.4 + d * 0.4;
        // Bias for clustering to create thick stands
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
    case 'water': return '#1B6CA8'; // deep water blue
    case 'swamp': return '#3B6B2F'; // muddy green-brown
    case 'lily': return '#2E8B57'; // lily pad green
    case 'vine': return '#2F5E2E';
    case 'tree': {
      // canopy shading depends on humidity and elevation
      const g = Math.floor(100 + tile.humidity * 80 - tile.elevation * 30);
      const r = Math.floor(30 + (1 - tile.elevation) * 20);
      const b = Math.floor(20 + tile.elevation * 10);
      return `rgb(${r},${g},${b})`;
    }
    default:
      // ground: vary between muddy soil and dense undergrowth
      const tone = Math.floor(70 + tile.humidity * 60 - tile.elevation * 20);
      return `rgb(${40},${tone},${30})`;
  }
}

export default function JungleJourneySeries({ seed = 42 }: { seed?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = MAP_W * TILE_SIZE;
    canvas.height = MAP_H * TILE_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // pixelated look
    ctx.imageSmoothingEnabled = false;

    const map = generateJungleMap(seed);

    // Render base tiles
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const t = map[y][x];
        ctx.fillStyle = tileColor(t);
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

    // Add details: water highlights, tree trunks, fog overlay, and swamp ripples
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const t = map[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        if (t.feature === 'water') {
          // lighter edges where adjacent to non-water
          if (isAdjacentTo(map, x, y, (f) => f !== 'water')) {
            ctx.fillStyle = 'rgba(46,122,184,0.28)';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          }
          // subtle ripple
          ctx.fillStyle = 'rgba(255,255,255,0.04)';
          ctx.fillRect(px + (TILE_SIZE/4)|0, py + (TILE_SIZE/4)|0, TILE_SIZE/2, TILE_SIZE/2);
        }

        if (t.feature === 'swamp') {
          // draw patches of mud and reeds
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
          // draw trunk (small) and canopy highlight
          ctx.fillStyle = '#3B2314';
          ctx.fillRect(px + TILE_SIZE/2 - 1, py + TILE_SIZE - 3, 2, 3);

          // canopy overlay: multi-layer circle to simulate thick leaves
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

    // Global fog/haze to evoke thick jungle humidity
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
