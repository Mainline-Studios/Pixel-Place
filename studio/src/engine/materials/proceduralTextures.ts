/**
 * Canvas-driven procedural surfaces (grass, stone, sand, metal) plus a noise "AI" variant.
 * Outputs are HTMLCanvasElement instances suitable for THREE.CanvasTexture.
 */

export type ProceduralPreset = "grass" | "stone" | "sand" | "metal" | "noise";

const SIZE = 256;

function makeCanvas(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  return c;
}

function hashNoise(x: number, y: number, seed: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233 + seed * 0.001) * 43758.5453;
  return s - Math.floor(s);
}

/** Fractal-ish value noise for organic variation (stretch-goal "AI" texture without APIs). */
export function layeredNoise(x: number, y: number, seed: number): number {
  let amp = 0.55;
  let freq = 3;
  let sum = 0;
  for (let i = 0; i < 4; i += 1) {
    const ix = Math.floor(x * freq);
    const iy = Math.floor(y * freq);
    const a = hashNoise(ix, iy, seed + i * 17);
    const b = hashNoise(ix + 1, iy, seed + i * 17);
    const c = hashNoise(ix, iy + 1, seed + i * 17);
    const d = hashNoise(ix + 1, iy + 1, seed + i * 17);
    const fx = x * freq - ix;
    const fy = y * freq - iy;
    const u = fx * fx * (3 - 2 * fx);
    const v = fy * fy * (3 - 2 * fy);
    const mix = a * (1 - u) + b * u;
    const mix2 = c * (1 - u) + d * u;
    sum += (mix * (1 - v) + mix2 * v) * amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return Math.min(1, Math.max(0, sum));
}

export function generateProceduralTexture(preset: ProceduralPreset, seed = 1337): HTMLCanvasElement {
  const canvas = makeCanvas();
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const img = ctx.createImageData(SIZE, SIZE);
  const data = img.data;
  for (let j = 0; j < SIZE; j += 1) {
    for (let i = 0; i < SIZE; i += 1) {
      const u = i / SIZE;
      const v = j / SIZE;
      const n = layeredNoise(u, v, seed);
      let r = 80;
      let g = 120;
      let b = 60;
      if (preset === "grass") {
        r = 40 + n * 90;
        g = 110 + n * 80;
        b = 40 + n * 40;
      } else if (preset === "stone") {
        const m = 90 + n * 70;
        r = m;
        g = m * 0.95;
        b = m * 0.9;
      } else if (preset === "sand") {
        r = 200 + n * 40;
        g = 170 + n * 35;
        b = 110 + n * 25;
      } else if (preset === "metal") {
        const m = 120 + n * 80;
        r = m;
        g = m * 0.97;
        b = m * 1.02;
      } else {
        r = n * 255;
        g = layeredNoise(u + 0.3, v - 0.1, seed + 3) * 255;
        b = layeredNoise(u - 0.2, v + 0.4, seed + 9) * 255;
      }
      const idx = (j * SIZE + i) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}
