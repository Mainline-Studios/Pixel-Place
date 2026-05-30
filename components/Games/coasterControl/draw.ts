import { MAP_H, MAP_W, RIDE_DEF } from './catalog';
import type { RideCategory } from './ridesRegistry';
import type { Guest, ParkState, Structure } from './types';
import { TW, TH, canvasSize, diamondPath, tileToScreen } from './iso';

export { canvasSize };

const PAL = {
  grass: ['#4d8a3a', '#5a9a45', '#3f7832', '#6bab52'],
  pathTop: '#d4bc8a',
  pathLeft: '#a89068',
  pathRight: '#c9b080',
  waterTop: '#4a9fd4',
  waterDeep: '#2e6f9e',
  cliff: '#3d5c34',
  peep: ['#ffeb3b', '#ffb74d', '#ef5350'],
  outline: '#1a2418',
};

function idx(x: number, y: number): number {
  return y * MAP_W + x;
}

export function guestDrawPos(g: Guest, alpha: number): { x: number; y: number } {
  const center = (tx: number, ty: number) => {
    const p = tileToScreen(tx, ty, 6);
    return { x: p.x, y: p.y };
  };
  if (g.path.length > 0 && g.pathIndex < g.path.length - 1) {
    const a = g.path[g.pathIndex];
    const b = g.path[g.pathIndex + 1];
    const ca = center(a.x, a.y);
    const cb = center(b.x, b.y);
    const t = Math.min(1, Math.max(0, alpha));
    return { x: ca.x + (cb.x - ca.x) * t, y: ca.y + (cb.y - ca.y) * t };
  }
  const target = center(g.x, g.y);
  const from = center(g.animX, g.animY);
  const t = Math.min(1, Math.max(0, alpha));
  return { x: from.x + (target.x - from.x) * t, y: from.y + (target.y - from.y) * t };
}

function fillPx(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

function drawGrassTile(ctx: CanvasRenderingContext2D, x: number, y: number, seed: number): void {
  const { x: cx, y: cy } = tileToScreen(x, y);
  const c = PAL.grass[seed % PAL.grass.length];
  diamondPath(ctx, cx, cy);
  ctx.fillStyle = c;
  ctx.fill();
  ctx.strokeStyle = PAL.cliff;
  ctx.lineWidth = 1;
  ctx.stroke();
  if (seed % 5 === 0) {
    fillPx(ctx, cx - 2, cy - 5, 2, 2, '#3d6b30');
  }
}

function drawPathTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const { x: cx, y: cy } = tileToScreen(x, y, 1);
  diamondPath(ctx, cx, cy);
  ctx.fillStyle = PAL.pathTop;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - TW / 2, cy);
  ctx.lineTo(cx, cy + TH / 2);
  ctx.closePath();
  ctx.fillStyle = PAL.pathLeft;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + TW / 2, cy);
  ctx.lineTo(cx, cy + TH / 2);
  ctx.closePath();
  ctx.fillStyle = PAL.pathRight;
  ctx.fill();
}

function drawWaterTile(ctx: CanvasRenderingContext2D, x: number, y: number, animTime: number): void {
  const { x: cx, y: cy } = tileToScreen(x, y, -2);
  diamondPath(ctx, cx, cy);
  ctx.fillStyle = PAL.waterDeep;
  ctx.fill();
  diamondPath(ctx, cx, cy - 2);
  ctx.fillStyle = PAL.waterTop;
  ctx.fill();
  const wave = Math.sin(animTime * 4 + x * 0.5 + y * 0.3) * 2;
  fillPx(ctx, cx - 6 + wave, cy - 4, 12, 2, 'rgba(255,255,255,0.35)');
}

function drawStructureIso(
  ctx: CanvasRenderingContext2D,
  structure: Structure,
  x: number,
  y: number,
  animTime: number
): void {
  const { x: cx, y: cy } = tileToScreen(x, y, 4);
  const h = 14;
  switch (structure) {
    case 'tree':
      fillPx(ctx, cx - 2, cy - h - 8, 4, 10, '#4a3520');
      fillPx(ctx, cx - 6, cy - h - 4, 12, 10, '#2d6b22');
      fillPx(ctx, cx - 4, cy - h - 8, 8, 6, '#3d8a32');
      break;
    case 'entrance':
      fillPx(ctx, cx - 10, cy - 4, 20, 12, '#8b6914');
      fillPx(ctx, cx - 8, cy - h - 2, 16, h, '#c62828');
      fillPx(ctx, cx - 6, cy - h + 2, 12, 4, '#ffeb3b');
      ctx.fillStyle = '#000';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('IN', cx - 5, cy - 2);
      break;
    case 'food':
      fillPx(ctx, cx - 8, cy - 2, 16, 10, '#e65100');
      fillPx(ctx, cx - 4, cy - h, 8, h, '#ff8f00');
      break;
    case 'toilet':
      fillPx(ctx, cx - 7, cy - 2, 14, 10, '#eceff1');
      fillPx(ctx, cx - 5, cy - h, 10, h, '#90a4ae');
      break;
    case 'fountain': {
      fillPx(ctx, cx - 8, cy, 16, 6, '#78909c');
      const fh = 6 + Math.abs(Math.sin(animTime * 5)) * 6;
      fillPx(ctx, cx - 2, cy - fh, 4, fh, '#64b5f6');
      break;
    }
    case 'statue':
      fillPx(ctx, cx - 6, cy, 12, 6, '#757575');
      fillPx(ctx, cx - 5, cy - h - 4, 10, h + 4, '#bdbdbd');
      break;
    case 'bench':
      fillPx(ctx, cx - 8, cy - 2, 16, 6, '#6d4c41');
      break;
    case 'flower':
      fillPx(ctx, cx - 3, cy - 6, 6, 6, '#e91e63');
      break;
    case 'flowerBed':
      for (let i = 0; i < 3; i++) {
        fillPx(ctx, cx - 6 + i * 4, cy - 5, 3, 3, ['#e91e63', '#ffeb3b', '#9c27b0'][i]);
      }
      break;
    case 'bush':
      fillPx(ctx, cx - 7, cy - 4, 14, 8, '#388e3c');
      break;
    case 'hedge':
      fillPx(ctx, cx - 9, cy - 2, 18, 8, '#2e7d32');
      break;
    case 'rock':
      fillPx(ctx, cx - 6, cy - 2, 12, 8, '#616161');
      break;
    case 'lamp':
      fillPx(ctx, cx - 2, cy - h - 6, 4, 6, '#ffee58');
      fillPx(ctx, cx - 1, cy - 2, 2, h, '#455a64');
      break;
    default:
      break;
  }
}

function drawRideBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  top: string,
  left: string,
  right: string,
  height: number,
  open: boolean
): void {
  const { x: cx, y: cy } = tileToScreen(x, y, 2);
  const h = height * 5;
  if (!open) {
    fillPx(ctx, cx - 10, cy - 4, 20, 10, '#546e7a');
    ctx.fillStyle = '#cfd8dc';
    ctx.font = '7px monospace';
    ctx.fillText('CLOSED', cx - 12, cy);
    return;
  }
  diamondPath(ctx, cx, cy);
  ctx.fillStyle = right;
  ctx.fill();
  fillPx(ctx, cx - 8, cy - h, 16, h, top);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - TW / 2, cy);
  ctx.lineTo(cx - 8, cy - h);
  ctx.lineTo(cx + 8, cy - h);
  ctx.closePath();
  ctx.fillStyle = left;
  ctx.fill();
}

function drawCoasterTrack(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  part: 'station' | 'track',
  colors: { color: string; trackColor: string },
  running: boolean,
  animTime: number
): void {
  const pulse = running ? 0.9 + Math.sin(animTime * 10) * 0.1 : 1;
  const top = part === 'station' ? colors.color : colors.trackColor;
  const left = shade(top, -30);
  const right = shade(top, 15);
  drawRideBlock(ctx, x, y, top, left, right, part === 'station' ? 8 : 5, true);
  if (running && part === 'track') {
    const p = tileToScreen(x, y, 12);
    fillPx(ctx, p.x - 2, p.y - 14, 4, 4, `rgba(255,255,255,${0.4 * pulse})`);
  }
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt;
  let g = ((n >> 8) & 0xff) + amt;
  let b = (n & 0xff) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function drawFlatRideIso(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  def: { color: string; category: RideCategory },
  open: boolean,
  running: number,
  animTime: number,
  rideId: number
): void {
  const h = def.category === 'thrill' ? 14 : def.category === 'transport' ? 10 : 8;
  const top = def.color;
  drawRideBlock(ctx, x, y, top, shade(top, -25), shade(top, 12), h, open);
  if (open && running > 0) {
    const { x: cx, y: cy } = tileToScreen(x, y, h + 8);
    const spin = Math.sin(animTime * 4 + rideId) * 3;
    fillPx(ctx, cx + spin - 2, cy - 10, 4, 4, '#fff');
  }
}

type DrawItem = { z: number; draw: () => void };

export function drawPark(
  ctx: CanvasRenderingContext2D,
  state: ParkState,
  hover: { x: number; y: number } | null,
  cam: { x: number; y: number },
  animTime: number,
  moveAlpha: number
): void {
  const { width, height } = canvasSize();
  ctx.save();
  ctx.translate(-cam.x, -cam.y);
  ctx.fillStyle = '#6eb5e8';
  ctx.fillRect(0, 0, width + cam.x + 200, height + cam.y + 200);

  const items: DrawItem[] = [];

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const c = state.cells[idx(x, y)];
      const z = x + y;
      items.push({
        z,
        draw: () => {
          if (c.terrain === 'water') drawWaterTile(ctx, x, y, animTime);
          else {
            drawGrassTile(ctx, x, y, (x * 17 + y * 31) % 7);
            if (c.terrain === 'path') drawPathTile(ctx, x, y);
          }
        },
      });
    }
  }

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const c = state.cells[idx(x, y)];
      const z = x + y + 0.3;
      if (c.structure) {
        items.push({ z, draw: () => drawStructureIso(ctx, c.structure!, x, y, animTime) });
      }
      if (c.rideId != null) {
        const ride = state.rides.find((r) => r.id === c.rideId);
        if (ride) {
          const def = RIDE_DEF[ride.kind];
          items.push({
            z: z + 0.5,
            draw: () => {
              if (!ride.isCoaster && c.ridePart === 'station') {
                drawFlatRideIso(ctx, x, y, def, ride.open, ride.running, animTime, ride.id);
              } else if (ride.isCoaster) {
                drawCoasterTrack(
                  ctx,
                  x,
                  y,
                  c.ridePart === 'station' ? 'station' : 'track',
                  def,
                  ride.running > 0,
                  animTime
                );
              }
            },
          });
        }
      }
    }
  }

  items.sort((a, b) => a.z - b.z);
  for (const it of items) it.draw();

  if (state.coasterDraft?.station) {
    const draft = state.coasterDraft;
    const def = RIDE_DEF[draft.kind];
    for (const p of [draft.station, ...draft.cells]) {
      const { x: cx, y: cy } = tileToScreen(p.x, p.y, 6);
      diamondPath(ctx, cx, cy);
      ctx.strokeStyle = def.trackColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  for (const g of state.guests) {
    const pos = guestDrawPos(g, moveAlpha);
    const bob = Math.sin(animTime * 8 + g.id) * 1;
    fillPx(ctx, pos.x - 2, pos.y + bob - 5, 4, 5, PAL.outline);
    fillPx(
      ctx,
      pos.x - 1,
      pos.y + bob - 4,
      2,
      3,
      g.happiness > 70 ? PAL.peep[0] : g.happiness > 40 ? PAL.peep[1] : PAL.peep[2]
    );
  }

  if (hover && hover.x >= 0 && hover.y >= 0 && hover.x < MAP_W && hover.y < MAP_H) {
    const { x: cx, y: cy } = tileToScreen(hover.x, hover.y, 8);
    diamondPath(ctx, cx, cy);
    ctx.strokeStyle = 'rgba(255,255,240,0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
    const cell = state.cells[idx(hover.x, hover.y)];
    if (cell.rideId != null) {
      const ride = state.rides.find((r) => r.id === cell.rideId);
      if (ride) {
        const def = RIDE_DEF[ride.kind];
        const label = `${def.label}${ride.open ? '' : ' (closed)'}`;
        ctx.font = 'bold 10px monospace';
        const tw = ctx.measureText(label).width + 10;
        fillPx(ctx, cx - tw / 2, cy - 36, tw, 14, 'rgba(30,30,30,0.85)');
        ctx.fillStyle = ride.open ? '#fff9c4' : '#ffcdd2';
        ctx.fillText(label, cx - tw / 2 + 5, cy - 26);
      }
    }
  }

  ctx.restore();
}
