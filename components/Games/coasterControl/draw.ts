import { MAP_H, MAP_W, RIDE_DEF, TILE } from './catalog';
import type { RideCategory } from './ridesRegistry';
import type { Guest, ParkState, Structure } from './types';

const COLORS = {
  grass: ['#3d7a37', '#458a3f', '#367232'],
  path: '#9a8b73',
  water: '#2a6f9e',
  guest: '#ffeb3b',
  guestOutline: '#5d4037',
};

function idx(x: number, y: number): number {
  return y * MAP_W + x;
}

export function guestDrawPos(g: Guest, alpha: number): { px: number; py: number } {
  const center = (tx: number, ty: number) => ({
    px: tx * TILE + TILE / 2,
    py: ty * TILE + TILE / 2,
  });
  if (g.path.length > 0 && g.pathIndex < g.path.length - 1) {
    const a = g.path[g.pathIndex];
    const b = g.path[g.pathIndex + 1];
    const ca = center(a.x, a.y);
    const cb = center(b.x, b.y);
    const t = Math.min(1, Math.max(0, alpha));
    return { px: ca.px + (cb.px - ca.px) * t, py: ca.py + (cb.py - ca.py) * t };
  }
  const target = center(g.x, g.y);
  const from = center(g.animX, g.animY);
  const t = Math.min(1, Math.max(0, alpha));
  return { px: from.px + (target.px - from.px) * t, py: from.py + (target.py - from.py) * t };
}

function drawStructure(
  ctx: CanvasRenderingContext2D,
  structure: Structure,
  px: number,
  py: number,
  animTime: number
): void {
  const cx = px + TILE / 2;
  const cy = py + TILE / 2;
  switch (structure) {
    case 'tree': {
      const sway = Math.sin(animTime * 2 + px * 0.1) * 0.5;
      ctx.fillStyle = '#2d5a27';
      ctx.beginPath();
      ctx.arc(cx + sway, cy + 2, TILE / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(cx - 2, py + TILE - 4, 4, 5);
      break;
    }
    case 'bench':
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(px + 3, py + TILE - 6, TILE - 6, 4);
      break;
    case 'food':
      ctx.fillStyle = '#ff6f00';
      ctx.fillRect(px + 2, py + 3, TILE - 4, TILE - 6);
      break;
    case 'toilet':
      ctx.fillStyle = '#eceff1';
      ctx.fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
      ctx.strokeStyle = '#607d8b';
      ctx.strokeRect(px + 3, py + 3, TILE - 6, TILE - 6);
      break;
    case 'entrance':
      ctx.fillStyle = '#ffd54f';
      ctx.fillRect(px + 1, py + 1, TILE - 2, TILE - 2);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText('IN', px + 4, py + TILE - 5);
      break;
    case 'flower': {
      const pulse = 0.85 + Math.sin(animTime * 4 + px) * 0.15;
      ctx.fillStyle = `rgba(236, 64, 122, ${pulse})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(cx - 1, cy + 2, 2, 4);
      break;
    }
    case 'fountain': {
      ctx.fillStyle = '#78909c';
      ctx.fillRect(px + 4, py + TILE - 5, TILE - 8, 4);
      const h = 3 + Math.abs(Math.sin(animTime * 6)) * 5;
      ctx.fillStyle = 'rgba(100, 181, 246, 0.85)';
      ctx.fillRect(cx - 2, cy - h, 4, h);
      ctx.beginPath();
      ctx.arc(cx, cy - h, 3 + Math.sin(animTime * 8) * 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'statue':
      ctx.fillStyle = '#9e9e9e';
      ctx.fillRect(cx - 3, py + 4, 6, TILE - 6);
      ctx.fillStyle = '#bdbdbd';
      ctx.fillRect(cx - 4, py + 2, 8, 6);
      break;
    case 'lamp': {
      const glow = 0.4 + Math.sin(animTime * 3) * 0.25;
      ctx.fillStyle = `rgba(255, 235, 59, ${glow})`;
      ctx.beginPath();
      ctx.arc(cx, py + 4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#455a64';
      ctx.fillRect(cx - 1, py + 6, 2, TILE - 8);
      break;
    }
    case 'bush':
      ctx.fillStyle = '#388e3c';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 1, TILE / 2 - 2, TILE / 3, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'hedge':
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(px + 1, py + TILE / 2 - 2, TILE - 2, TILE / 2);
      break;
    case 'rock':
      ctx.fillStyle = '#757575';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 2, 5, 4, 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'flowerBed': {
      for (let i = 0; i < 4; i++) {
        const angle = animTime * 2 + i * 1.5;
        ctx.fillStyle = ['#e91e63', '#ffeb3b', '#9c27b0', '#ff5722'][i];
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * 3, cy + Math.sin(angle) * 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#33691e';
      ctx.fillRect(px + 2, py + TILE - 5, TILE - 4, 4);
      break;
    }
    default:
      break;
  }
}

function drawFlatRide(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  rideId: number,
  color: string,
  animTime: number,
  category: RideCategory,
  running: number
): void {
  const cx = px + TILE / 2;
  const cy = py + TILE / 2;
  const spin = animTime * 2 + rideId;
  const active = running > 0;
  ctx.save();
  ctx.translate(cx, cy);

  if (category === 'transport') {
    const chug = Math.sin(animTime * 8 + rideId) * 1.5;
    ctx.fillStyle = color;
    ctx.fillRect(-TILE / 2 + 1 + chug, -3, TILE - 4, 6);
    ctx.fillStyle = '#37474f';
    ctx.fillRect(-TILE / 2 - 2 + chug, -2, 4, 4);
    ctx.fillStyle = active ? '#ffeb3b' : '#90a4ae';
    ctx.beginPath();
    ctx.arc(TILE / 2 - 4 + chug, 0, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (category === 'water') {
    const wave = Math.sin(animTime * 5 + rideId) * 2;
    ctx.fillStyle = 'rgba(33, 150, 243, 0.35)';
    ctx.fillRect(-TILE / 2, TILE / 4, TILE, TILE / 3);
    ctx.fillStyle = color;
    ctx.rotate(Math.sin(spin) * 0.06);
    ctx.fillRect(-TILE / 2 + 2, -TILE / 2 + 2 + wave, TILE - 4, TILE - 5);
    if (active) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(-4 + i * 4, -6 + Math.sin(animTime * 10 + i) * 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (category === 'thrill') {
    ctx.rotate(Math.sin(spin * 1.5) * (active ? 0.25 : 0.06));
    ctx.fillStyle = color;
    ctx.fillRect(-TILE / 2 + 2, -TILE / 2 + 2, TILE - 4, TILE - 4);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.strokeRect(-TILE / 2 + 2, -TILE / 2 + 2, TILE - 4, TILE - 4);
  } else {
    ctx.rotate(Math.sin(spin) * (active ? 0.12 : 0.05));
    ctx.fillStyle = color;
    ctx.fillRect(-TILE / 2 + 2, -TILE / 2 + 2, TILE - 4, TILE - 4);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-TILE / 2 + 2, -TILE / 2 + 2, TILE - 4, TILE - 4);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, 3 + Math.sin(spin * 2) * 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawPark(
  ctx: CanvasRenderingContext2D,
  state: ParkState,
  hover: { x: number; y: number } | null,
  cam: { x: number; y: number },
  animTime: number,
  moveAlpha: number
): void {
  const w = MAP_W * TILE;
  const h = MAP_H * TILE;
  ctx.save();
  ctx.translate(-cam.x, -cam.y);
  ctx.fillStyle = '#1a2f1a';
  ctx.fillRect(0, 0, w, h);

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const c = state.cells[idx(x, y)];
      const px = x * TILE;
      const py = y * TILE;

      if (c.terrain === 'water') {
        const wave = Math.sin(animTime * 3 + x * 0.4 + y * 0.3) * 0.08;
        ctx.fillStyle = COLORS.water;
        ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = `rgba(144, 202, 249, ${0.2 + wave})`;
        ctx.fillRect(px + 2, py + 4 + wave * 4, TILE - 4, 3);
        continue;
      }

      const hash = (x * 17 + y * 31) % COLORS.grass.length;
      ctx.fillStyle = COLORS.grass[hash];
      ctx.fillRect(px, py, TILE, TILE);

      if (c.terrain === 'path') {
        ctx.fillStyle = COLORS.path;
        ctx.fillRect(px + 1, py + 1, TILE - 2, TILE - 2);
      }

      if (c.structure) {
        drawStructure(ctx, c.structure, px, py, animTime);
      }

      if (c.rideId != null) {
        const ride = state.rides.find((r) => r.id === c.rideId);
        const def = ride ? RIDE_DEF[ride.kind] : RIDE_DEF.mini;
        if (ride && !ride.isCoaster) {
          if (c.ridePart === 'station') {
            drawFlatRide(ctx, px, py, ride.id, def.color, animTime, def.category, ride.running);
          }
        } else {
          const pulse =
            ride && ride.running > 0
              ? 0.85 + Math.sin(animTime * 12 + ride.id) * 0.15
              : 1;
          ctx.globalAlpha = pulse;
          ctx.fillStyle = c.ridePart === 'station' ? def.color : def.trackColor;
          ctx.fillRect(px + 1, py + 1, TILE - 2, TILE - 2);
          if (c.ridePart === 'station') {
            ctx.fillStyle = '#fff';
            ctx.fillRect(px + 4, py + 5, TILE - 8, 3);
          }
          ctx.globalAlpha = 1;
        }
      }
    }
  }

  if (state.coasterDraft?.station) {
    const draft = state.coasterDraft;
    const def = RIDE_DEF[draft.kind];
    const all = [draft.station, ...draft.cells];
    const dash = 4 + Math.sin(animTime * 5) * 2;
    ctx.strokeStyle = def.trackColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([dash, 3]);
    for (const p of all) {
      ctx.strokeRect(p.x * TILE + 1, p.y * TILE + 1, TILE - 2, TILE - 2);
    }
    ctx.setLineDash([]);
  }

  for (const g of state.guests) {
    const { px, py } = guestDrawPos(g, moveAlpha);
    const bob = Math.sin(animTime * 8 + g.id) * 0.6;
    ctx.fillStyle = COLORS.guestOutline;
    ctx.beginPath();
    ctx.arc(px, py + bob, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = g.happiness > 70 ? COLORS.guest : g.happiness > 40 ? '#ffb74d' : '#ef5350';
    ctx.beginPath();
    ctx.arc(px, py + bob - 1, 3, 0, Math.PI * 2);
    ctx.fill();
    if (g.state === 'riding') {
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.arc(px, py + bob, 6 + Math.sin(animTime * 15) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (hover) {
    const { x, y } = hover;
    if (x >= 0 && y >= 0 && x < MAP_W && y < MAP_H) {
      const pulse = 0.5 + Math.sin(animTime * 6) * 0.5;
      ctx.strokeStyle = `rgba(255,255,255,${0.5 + pulse * 0.35})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(x * TILE + 1, y * TILE + 1, TILE - 2, TILE - 2);
    }
  }

  ctx.restore();
}

export function canvasSize(): { width: number; height: number } {
  return { width: MAP_W * TILE, height: MAP_H * TILE };
}
