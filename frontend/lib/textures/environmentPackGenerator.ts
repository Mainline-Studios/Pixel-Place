/**
 * Procedural seamless environment textures + JSON manifest (Node / tsx).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { TEXTURES_BASE_PATH } from './constants';
import {
  ENV_PACK_GRASS_VARIANTS,
  ENV_PACK_LIGHT_DIRECTION,
  ENV_PACK_RESOLUTION,
  ENV_PACK_SKY_FACES,
  ENV_PACK_SKY_SUBDIR,
  ENV_PACK_TERRAIN_BASE,
  ENV_PACK_VERSION,
  envPackSkyBaseName,
  type EnvPackSkyFace,
  type EnvPackTerrainMaterial,
} from './environmentPackCatalog';

const SIZE = ENV_PACK_RESOLUTION;
const PERIOD = 48;

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

function periodIdx(n: number, p: number): number {
  let m = n % p;
  if (m < 0) m += p;
  return m;
}

function noise2Cell(ix: number, iy: number, p: number): number {
  const x = periodIdx(ix, p);
  const y = periodIdx(iy, p);
  const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

function smoothedNoise(px: number, py: number, p: number): number {
  const x0 = Math.floor(px);
  const y0 = Math.floor(py);
  const fx = px - x0;
  const fy = py - y0;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const n00 = noise2Cell(x0, y0, p);
  const n10 = noise2Cell(x0 + 1, y0, p);
  const n01 = noise2Cell(x0, y0 + 1, p);
  const n11 = noise2Cell(x0 + 1, y0 + 1, p);
  return n00 * (1 - u) * (1 - v) + n10 * u * (1 - v) + n01 * (1 - u) * v + n11 * u * v;
}

function modPos(a: number, m: number): number {
  return ((a % m) + m) % m;
}

function fbmTiled(i: number, j: number, octaves: number): number {
  let sum = 0;
  let norm = 0;
  let amp = 0.5;
  for (let o = 0; o < octaves; o++) {
    const scale = 2 ** o;
    const p = PERIOD * scale;
    const px = modPos((i / SIZE) * PERIOD * scale, p);
    const py = modPos((j / SIZE) * PERIOD * scale, p);
    sum += amp * smoothedNoise(px, py, p);
    norm += amp;
    amp *= 0.5;
  }
  return norm > 0 ? sum / norm : 0;
}

/** Low-frequency sine bias that is 0 on tile edges (seam-safe) for unified lighting tilt */
function lightingTiltHeight(i: number, j: number): number {
  const ax = (Math.PI * 2 * i) / SIZE;
  const ay = (Math.PI * 2 * j) / SIZE;
  const lx = ENV_PACK_LIGHT_DIRECTION.x;
  const ly = ENV_PACK_LIGHT_DIRECTION.y;
  const s =
    0.022 * lx * Math.sin(ax) +
    0.022 * ly * Math.sin(ay) +
    0.012 * (ENV_PACK_LIGHT_DIRECTION.z * Math.sin(ax + ay * 0.7));
  return s;
}

function sampleHeight(
  i: number,
  j: number,
  mat: EnvPackTerrainMaterial,
  profile: GrassProfile | null
): number {
  const ii = (i + SIZE) % SIZE;
  const jj = (j + SIZE) % SIZE;
  let h = fbmTiled(ii, jj, 4);

  if (mat.kind === 'water') {
    const w1 = Math.sin((ii * 3 + jj * 5) * ((Math.PI * 2) / SIZE) * 6);
    const w2 = Math.sin((ii * 7 - jj * 4) * ((Math.PI * 2) / SIZE) * 4);
    h = h * 0.35 + w1 * 0.22 + w2 * 0.18;
  } else if (mat.baseName.includes('grass')) {
    const blades = Math.sin((ii * 0.35 + jj * 2.1 + profile!.phase) * 0.9);
    const clump = fbmTiled(ii + 10, jj + 3, 3);
    h = h * 0.55 + blades * 0.28 + clump * 0.35;
  } else if (mat.id === 'rock') {
    const cracks = Math.pow(1 - Math.abs(fbmTiled(ii, jj, 2) - 0.5) * 2, 3);
    h = h * 0.85 + cracks * 0.4;
  } else if (mat.id === 'sand') {
    h = h * 0.65 + fbmTiled(ii + 99, jj + 99, 2) * 0.35;
  } else if (mat.id === 'cobble') {
    const cell = Math.sin(ii * 0.42) * Math.cos(jj * 0.38);
    h = h * 0.4 + cell * 0.35 + fbmTiled(ii, jj, 2) * 0.45;
  } else if (mat.id === 'moss_flagstone') {
    const slab = Math.abs(Math.sin(ii * 0.09) * Math.sin(jj * 0.11));
    h = h * 0.5 + slab * 0.5 + fbmTiled(ii + 5, jj + 8, 3) * 0.3;
  } else {
    h = h * 0.75 + fbmTiled(ii + 7, jj + 13, 2) * 0.25;
  }

  h += lightingTiltHeight(ii, jj);
  return h;
}

type GrassProfile = { phase: number; hueShift: number; saturation: number };

function grassProfileFor(mat: EnvPackTerrainMaterial): GrassProfile | null {
  if (!mat.baseName.includes('grass')) return null;
  switch (mat.id) {
    case 'grass_meadow':
      return { phase: 0.2, hueShift: 0, saturation: 1 };
    case 'grass_lush':
      return { phase: 0.6, hueShift: -0.04, saturation: 1.12 };
    case 'grass_dry':
      return { phase: 1.1, hueShift: 0.08, saturation: 0.75 };
    case 'grass_patchy':
      return { phase: 2.0, hueShift: 0.03, saturation: 0.9 };
    default:
      return { phase: 0.5, hueShift: 0, saturation: 1 };
  }
}

function hue2rgb(p: number, q: number, t: number): number {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

function hslToRgb(hDeg: number, s: number, l: number): [number, number, number] {
  const h = modPos(hDeg, 360) / 360;
  if (s <= 0) {
    const v = Math.round(clamp01(l) * 255);
    return [v, v, v];
  }
  const ss = clamp01(s);
  const ll = clamp01(l);
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function albedoRGB(
  i: number,
  j: number,
  mat: EnvPackTerrainMaterial,
  h: number,
  profile: GrassProfile | null
): [number, number, number] {
  const n = fbmTiled(i, j, 2);
  if (mat.kind === 'water') {
    const depth = clamp01(0.35 + h * 0.5);
    const r = Math.round(40 + depth * 35 + n * 25);
    const g = Math.round(110 + depth * 40 + n * 20);
    const b = Math.round(145 + depth * 45 + n * 15);
    return [r, g, b];
  }
  if (profile) {
    const hueDeg = 118 + profile.hueShift * 360 + n * 14;
    const baseS = clamp01(0.44 * profile.saturation);
    const baseL = clamp01(0.36 + n * 0.12 + h * 0.08);
    return hslToRgb(hueDeg, baseS, baseL);
  }
  if (mat.id === 'dirt') {
    const v = 95 + n * 45 + h * 30;
    return [Math.round(110 + h * 20), Math.round(v * 0.72), Math.round(v * 0.48)];
  }
  if (mat.id === 'sand') {
    const v = 200 + n * 35 + h * 25;
    return [Math.round(v), Math.round(v * 0.88 + h * 15), Math.round(v * 0.62 + h * 10)];
  }
  if (mat.id === 'rock') {
    const g = 95 + n * 50 + h * 25;
    return [Math.round(g * 0.95), Math.round(g), Math.round(g * 1.05)];
  }
  if (mat.id === 'cobble') {
    const base = 118 + n * 40 + h * 22;
    return [Math.round(base * 0.92), Math.round(base * 0.9), Math.round(base * 0.88)];
  }
  if (mat.id === 'moss_flagstone') {
    const stone = 96 + n * 35;
    const moss = 72 + n * 28;
    const t = clamp01(0.35 + fbmTiled(i, j, 2) * 0.65);
    return [
      Math.round(stone * (1 - t * 0.35) + moss * 0.15 * t),
      Math.round(stone * (1 - t * 0.25) + (110 + n * 20) * t),
      Math.round(stone * (1 - t * 0.2) + (70 + n * 15) * t),
    ];
  }
  return [128, 128, 128];
}

function roughnessFor(mat: EnvPackTerrainMaterial, i: number, j: number): number {
  const n = fbmTiled(i, j, 3);
  if (mat.kind === 'water') return clamp01(0.08 + n * 0.12);
  if (mat.baseName.includes('grass')) return clamp01(0.62 + n * 0.28);
  if (mat.id === 'sand') return clamp01(0.52 + n * 0.22);
  if (mat.id === 'dirt') return clamp01(0.62 + n * 0.2);
  if (mat.id === 'rock') return clamp01(0.72 + n * 0.22);
  if (mat.id === 'cobble') return clamp01(0.68 + n * 0.24);
  if (mat.id === 'moss_flagstone') return clamp01(0.64 + n * 0.26);
  return 0.7;
}

function dirFromFace(face: EnvPackSkyFace, u: number, v: number): [number, number, number] {
  switch (face) {
    case 'px':
      return [1, -v, -u];
    case 'nx':
      return [-1, -v, u];
    case 'py':
      return [u, 1, v];
    case 'ny':
      return [u, -1, -v];
    case 'pz':
      return [u, -v, 1];
    case 'nz':
      return [-u, -v, -1];
    default:
      return [0, 1, 0];
  }
}

function stylizedSkyColor(dx: number, dy: number, dz: number): [number, number, number] {
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
  const y = dy / len;
  const zenith: [number, number, number] = [88, 156, 235];
  const horizon: [number, number, number] = [245, 210, 168];
  const t = clamp01(Math.pow(1 - y, 1.15));
  const haze = clamp01((y + 0.15) * 0.9);
  let r = zenith[0] * t + horizon[0] * (1 - t);
  let g = zenith[1] * t + horizon[1] * (1 - t);
  let b = zenith[2] * t + horizon[2] * (1 - t);
  r = r * (0.92 + haze * 0.08);
  g = g * (0.94 + haze * 0.06);
  b = b * (0.98 + haze * 0.02);
  const lx = ENV_PACK_LIGHT_DIRECTION.x;
  const ly = ENV_PACK_LIGHT_DIRECTION.y;
  const lz = ENV_PACK_LIGHT_DIRECTION.z;
  const sun = Math.max(0, (dx * lx + dy * ly + dz * lz) / len);
  if (sun > 0.985) {
    const glow = (sun - 0.985) / 0.015;
    r += 255 * glow * 0.45;
    g += 245 * glow * 0.35;
    b += 200 * glow * 0.15;
  }
  return [Math.min(255, Math.round(r)), Math.min(255, Math.round(g)), Math.min(255, Math.round(b))];
}

function writePng(path: string, rgba: Buffer): Promise<void> {
  return sharp(rgba, {
    raw: { width: SIZE, height: SIZE, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(path);
}

async function writeTerrainMaterial(
  envRoot: string,
  mat: EnvPackTerrainMaterial
): Promise<void> {
  const profile = grassProfileFor(mat);
  const albedo = Buffer.alloc(SIZE * SIZE * 4);
  const normal = Buffer.alloc(SIZE * SIZE * 4);
  const rough = Buffer.alloc(SIZE * SIZE * 4);
  const ao = Buffer.alloc(SIZE * SIZE * 4);
  const heights = new Float32Array(SIZE * SIZE);

  for (let j = 0; j < SIZE; j++) {
    for (let i = 0; i < SIZE; i++) {
      heights[j * SIZE + i] = sampleHeight(i, j, mat, profile);
    }
  }

  const blurH = new Float32Array(SIZE * SIZE);
  for (let j = 0; j < SIZE; j++) {
    for (let i = 0; i < SIZE; i++) {
      let s = 0;
      for (let k = -1; k <= 1; k++) s += heights[j * SIZE + ((i + k + SIZE) % SIZE)];
      blurH[j * SIZE + i] = s / 3;
    }
  }
  const blur = new Float32Array(SIZE * SIZE);
  for (let j = 0; j < SIZE; j++) {
    for (let i = 0; i < SIZE; i++) {
      let s = 0;
      for (let k = -1; k <= 1; k++) s += blurH[((j + k + SIZE) % SIZE) * SIZE + i];
      blur[j * SIZE + i] = s / 3;
    }
  }

  for (let j = 0; j < SIZE; j++) {
    for (let i = 0; i < SIZE; i++) {
      const idx = j * SIZE + i;
      const hC = heights[idx];
      const hL = heights[j * SIZE + ((i - 1 + SIZE) % SIZE)];
      const hR = heights[j * SIZE + ((i + 1) % SIZE)];
      const hD = heights[((j - 1 + SIZE) % SIZE) * SIZE + i];
      const hU = heights[((j + 1 + SIZE) % SIZE) * SIZE + i];
      const strength = mat.kind === 'water' ? 10 : mat.baseName.includes('grass') ? 14 : 18;
      let dx = (hR - hL) * strength;
      let dy = (hU - hD) * strength;
      let dz = 1;
      const dLen = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      dx /= dLen;
      dy /= dLen;
      dz /= dLen;
      const nx = Math.round(clamp01(dx * 0.5 + 0.5) * 255);
      const ny = Math.round(clamp01(dy * 0.5 + 0.5) * 255);
      const nz = Math.round(clamp01(dz * 0.5 + 0.5) * 255);

      const [ar, ag, ab] = albedoRGB(i, j, mat, hC, profile);
      const o = idx * 4;
      albedo[o] = ar;
      albedo[o + 1] = ag;
      albedo[o + 2] = ab;
      albedo[o + 3] = 255;

      normal[o] = nx;
      normal[o + 1] = ny;
      normal[o + 2] = nz;
      normal[o + 3] = 255;

      const roughV = roughnessFor(mat, i, j);
      const rv = Math.round(roughV * 255);
      rough[o] = rv;
      rough[o + 1] = rv;
      rough[o + 2] = rv;
      rough[o + 3] = 255;

      const cavity = clamp01(0.35 + (blur[idx] - hC) * 1.8);
      const aoV = mat.kind === 'water' ? 0.92 : clamp01(0.55 + cavity * 0.45);
      const av = Math.round(aoV * 255);
      ao[o] = av;
      ao[o + 1] = av;
      ao[o + 2] = av;
      ao[o + 3] = 255;
    }
  }

  const sub = join(envRoot, mat.subfolder);
  await mkdir(sub, { recursive: true });
  const base = join(sub, mat.baseName);
  await writePng(`${base}_albedo_${SIZE}.png`, albedo);
  await writePng(`${base}_normal_${SIZE}.png`, normal);
  await writePng(`${base}_roughness_${SIZE}.png`, rough);
  await writePng(`${base}_ao_${SIZE}.png`, ao);
}

async function writeSkyFace(envRoot: string, face: EnvPackSkyFace): Promise<void> {
  const albedo = Buffer.alloc(SIZE * SIZE * 4);
  const normal = Buffer.alloc(SIZE * SIZE * 4);
  const rough = Buffer.alloc(SIZE * SIZE * 4);
  const ao = Buffer.alloc(SIZE * SIZE * 4);
  const sub = join(envRoot, ENV_PACK_SKY_SUBDIR);
  await mkdir(sub, { recursive: true });
  const name = envPackSkyBaseName(face);

  for (let j = 0; j < SIZE; j++) {
    for (let i = 0; i < SIZE; i++) {
      const u = (i / (SIZE - 1)) * 2 - 1;
      const v = (j / (SIZE - 1)) * 2 - 1;
      const [dx, dy, dz] = dirFromFace(face, u, v);
      const [r, g, b] = stylizedSkyColor(dx, dy, dz);
      const o = (j * SIZE + i) * 4;
      albedo[o] = r;
      albedo[o + 1] = g;
      albedo[o + 2] = b;
      albedo[o + 3] = 255;
      normal[o] = 128;
      normal[o + 1] = 128;
      normal[o + 2] = 255;
      normal[o + 3] = 255;
      const rv = 220;
      rough[o] = rv;
      rough[o + 1] = rv;
      rough[o + 2] = rv;
      rough[o + 3] = 255;
      ao[o] = 255;
      ao[o + 1] = 255;
      ao[o + 2] = 255;
      ao[o + 3] = 255;
    }
  }

  const base = join(sub, name);
  await writePng(`${base}_albedo_${SIZE}.png`, albedo);
  await writePng(`${base}_normal_${SIZE}.png`, normal);
  await writePng(`${base}_roughness_${SIZE}.png`, rough);
  await writePng(`${base}_ao_${SIZE}.png`, ao);
}

export type GenerateEnvironmentPackResult = {
  terrainFiles: number;
  skyFiles: number;
  manifestPath: string;
};

/**
 * Writes PNGs under `publicRoot/assets/textures/environment/{base,variants}/`
 * and `environment_pack_v1.json`.
 */
export async function generateEnvironmentPackToDisk(publicRoot: string): Promise<GenerateEnvironmentPackResult> {
  const envRoot = join(publicRoot, 'assets', 'textures', 'environment');
  await mkdir(envRoot, { recursive: true });

  const allTerrain = [...ENV_PACK_TERRAIN_BASE, ...ENV_PACK_GRASS_VARIANTS];
  for (const mat of allTerrain) {
    await writeTerrainMaterial(envRoot, mat);
  }

  for (const face of ENV_PACK_SKY_FACES) {
    await writeSkyFace(envRoot, face);
  }

  const manifest = {
    version: ENV_PACK_VERSION,
    resolution: SIZE,
    seamless: true,
    lightDirectionWorld: { ...ENV_PACK_LIGHT_DIRECTION },
    description:
      'Procedural starter pack: semi-stylized cohesive outdoor set. Replace with authored art as needed.',
    pathsRoot: `${TEXTURES_BASE_PATH}/environment`,
    terrain: allTerrain.map((m) => ({
      id: m.id,
      subfolder: m.subfolder,
      baseName: m.baseName,
      kind: m.kind,
      maps: ['albedo', 'normal', 'roughness', 'ao'],
    })),
    skybox: {
      subfolder: ENV_PACK_SKY_SUBDIR,
      faces: [...ENV_PACK_SKY_FACES],
      maps: ['albedo', 'normal', 'roughness', 'ao'],
    },
  };

  const manifestPath = join(envRoot, 'environment_pack_v1.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  return {
    terrainFiles: allTerrain.length * 4,
    skyFiles: ENV_PACK_SKY_FACES.length * 4,
    manifestPath,
  };
}
