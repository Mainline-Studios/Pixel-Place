/**
 * Programmatic texture generators for Three.js materials.
 * All functions draw on a canvas and return it; use new THREE.CanvasTexture(canvas)
 * and set magFilter/minFilter/wrapS/wrapT as needed.
 */

export type RGB = { r: number; g: number; b: number };

function clamp255(n: number) {
  return Math.max(0, Math.min(255, Math.floor(n)));
}

function hexToRgb(hex: string): RGB {
  if (!hex || typeof hex !== 'string') return { r: 0.5, g: 0.5, b: 0.5 };
  const num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return { r: 0.5, g: 0.5, b: 0.5 };
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255
  };
}

/** Pixelated / blocky style (good for retro avatars). */
export function createPixelatedTexture(color: RGB, size: number = 512, pixelSize: number = 8): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  canvas.width = size;
  canvas.height = size;
  const perRow = Math.floor(size / pixelSize);
  for (let y = 0; y < perRow; y++) {
    for (let x = 0; x < perRow; x++) {
      const v = (Math.random() - 0.5) * 0.15;
      ctx.fillStyle = `rgb(${clamp255((color.r + v) * 255)}, ${clamp255((color.g + v) * 255)}, ${clamp255((color.b + v) * 255)})`;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
  return canvas;
}

/** Skin-like with subtle noise and pore-like dots. */
export function createSkinTexture(color: RGB, size: number = 512): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  canvas.width = size;
  canvas.height = size;
  ctx.fillStyle = `rgb(${clamp255(color.r * 255)}, ${clamp255(color.g * 255)}, ${clamp255(color.b * 255)})`;
  ctx.fillRect(0, 0, size, size);
  const imageData = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    imageData.data[i] = clamp255(imageData.data[i] + n);
    imageData.data[i + 1] = clamp255(imageData.data[i + 1] + n);
    imageData.data[i + 2] = clamp255(imageData.data[i + 2] + n);
  }
  ctx.putImageData(imageData, 0, 0);
  for (let i = 0; i < 280; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 2 + 0.5;
    ctx.fillStyle = `rgba(${clamp255(color.r * 200)}, ${clamp255(color.g * 200)}, ${clamp255(color.b * 200)}, 0.35)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas;
}

/** Woven fabric / cloth look with thin lines. */
export function createFabricTexture(color: RGB, size: number = 512): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  canvas.width = size;
  canvas.height = size;
  const base = `rgb(${clamp255(color.r * 255)}, ${clamp255(color.g * 255)}, ${clamp255(color.b * 255)})`;
  const dark = `rgb(${clamp255(color.r * 200)}, ${clamp255(color.g * 200)}, ${clamp255(color.b * 200)})`;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  const step = 12;
  ctx.strokeStyle = dark;
  ctx.lineWidth = 1;
  for (let i = 0; i <= size; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }
  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 4) {
      if (Math.random() < 0.08) {
        ctx.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.04})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }
  return canvas;
}

/** Brushed metal with horizontal streaks. */
export function createMetalTexture(color: RGB, size: number = 512): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  canvas.width = size;
  canvas.height = size;
  const r = color.r * 255;
  const g = color.g * 255;
  const b = color.b * 255;
  for (let y = 0; y < size; y++) {
    const streak = (Math.random() - 0.5) * 35;
    const br = clamp255(r + streak);
    const bg = clamp255(g + streak);
    const bb = clamp255(b + streak);
    ctx.fillStyle = `rgb(${br}, ${bg}, ${bb})`;
    ctx.fillRect(0, y, size, 1);
  }
  const imageData = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 12;
    imageData.data[i] = clamp255(imageData.data[i] + n);
    imageData.data[i + 1] = clamp255(imageData.data[i + 1] + n);
    imageData.data[i + 2] = clamp255(imageData.data[i + 2] + n);
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/** Leather with subtle wrinkles and grain. */
export function createLeatherTexture(color: RGB, size: number = 512): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  canvas.width = size;
  canvas.height = size;
  const base = `rgb(${clamp255(color.r * 255)}, ${clamp255(color.g * 255)}, ${clamp255(color.b * 255)})`;
  const dark = `rgb(${clamp255(color.r * 180)}, ${clamp255(color.g * 180)}, ${clamp255(color.b * 180)})`;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  const imageData = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 25;
    imageData.data[i] = clamp255(imageData.data[i] + n);
    imageData.data[i + 1] = clamp255(imageData.data[i + 1] + n);
    imageData.data[i + 2] = clamp255(imageData.data[i + 2] + n);
  }
  ctx.putImageData(imageData, 0, 0);
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 15 + Math.random() * 25;
    const angle = Math.random() * Math.PI * 2;
    ctx.strokeStyle = dark;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.15 + Math.random() * 0.15;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return canvas;
}

/** Denim with diagonal weave and slight fade. */
export function createDenimTexture(color: RGB, size: number = 512): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  canvas.width = size;
  canvas.height = size;
  const r = color.r * 255;
  const g = color.g * 255;
  const b = color.b * 255;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const weave = (x + y) % 6 === 0 ? -12 : (x - y) % 5 === 0 ? 8 : 0;
      const fade = (y / size) * 5;
      ctx.fillStyle = `rgb(${clamp255(r + weave + fade)}, ${clamp255(g + weave + fade)}, ${clamp255(b + weave + fade)})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  const imageData = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 10;
    imageData.data[i] = clamp255(imageData.data[i] + n);
    imageData.data[i + 1] = clamp255(imageData.data[i + 1] + n);
    imageData.data[i + 2] = clamp255(imageData.data[i + 2] + n);
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/** Wood grain (warm stripes). */
export function createWoodTexture(color: RGB, size: number = 512): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  canvas.width = size;
  canvas.height = size;
  const r = color.r * 255;
  const g = color.g * 255;
  const b = color.b * 255;
  for (let x = 0; x < size; x++) {
    const grain = Math.sin(x * 0.08) * 15 + (Math.random() - 0.5) * 20;
    const dark = Math.sin(x * 0.03) * 8;
    ctx.fillStyle = `rgb(${clamp255(r + grain - dark)}, ${clamp255(g + grain - dark)}, ${clamp255(b + grain - dark)})`;
    ctx.fillRect(x, 0, 1, size);
  }
  const imageData = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 12;
    imageData.data[i] = clamp255(imageData.data[i] + n);
    imageData.data[i + 1] = clamp255(imageData.data[i + 1] + n);
    imageData.data[i + 2] = clamp255(imageData.data[i + 2] + n);
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/** Carbon fiber style (grid + slight sheen). */
export function createCarbonTexture(color: RGB, size: number = 512): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  canvas.width = size;
  canvas.height = size;
  const dark = `rgb(${clamp255(color.r * 140)}, ${clamp255(color.g * 140)}, ${clamp255(color.b * 140)})`;
  const mid = `rgb(${clamp255(color.r * 200)}, ${clamp255(color.g * 200)}, ${clamp255(color.b * 200)})`;
  const bright = `rgb(${clamp255(color.r * 255)}, ${clamp255(color.g * 255)}, ${clamp255(color.b * 255)})`;
  ctx.fillStyle = dark;
  ctx.fillRect(0, 0, size, size);
  const step = 16;
  ctx.strokeStyle = mid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= size; i += step) {
    ctx.globalAlpha = 0.6 + Math.random() * 0.3;
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = Math.random() < 0.5 ? bright : mid;
    ctx.globalAlpha = 0.1 + Math.random() * 0.15;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
  return canvas;
}

export type TextureStyle = 'pixelated' | 'skin' | 'fabric' | 'metal' | 'leather' | 'denim' | 'wood' | 'carbon';

const TEXTURE_FNS: Record<TextureStyle, (color: RGB, size?: number, extra?: number) => HTMLCanvasElement> = {
  pixelated: (c, s = 512, p = 8) => createPixelatedTexture(c, s, p ?? 8),
  skin: createSkinTexture,
  fabric: createFabricTexture,
  metal: createMetalTexture,
  leather: createLeatherTexture,
  denim: createDenimTexture,
  wood: createWoodTexture,
  carbon: createCarbonTexture
};

/** Create a canvas texture by style name. For pixelated, pass pixelSize as third arg (default 8). */
export function createTextureByStyle(
  style: TextureStyle | string | undefined,
  color: RGB,
  size: number = 512,
  pixelSize: number = 8
): HTMLCanvasElement {
  const key = (style && TEXTURE_FNS[style as TextureStyle]) ? (style as TextureStyle) : 'pixelated';
  if (key === 'pixelated') return createPixelatedTexture(color, size, pixelSize);
  return TEXTURE_FNS[key](color, size);
}

/** Convert hex string to RGB (for use with texture functions). */
export { hexToRgb };
