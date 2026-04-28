export type Rgb = { r: number; g: number; b: number };

export function parseHex(hex: string): Rgb {
  const h = hex.replace('#', '').trim();
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return { r: 200, g: 200, b: 210 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToCss(c: Rgb, a = 1): string {
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}

export function lerpRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

export function lighten(c: Rgb, amount: number): Rgb {
  return {
    r: Math.min(255, Math.round(c.r + (255 - c.r) * amount)),
    g: Math.min(255, Math.round(c.g + (255 - c.g) * amount)),
    b: Math.min(255, Math.round(c.b + (255 - c.b) * amount)),
  };
}

export function darken(c: Rgb, amount: number): Rgb {
  return {
    r: Math.max(0, Math.round(c.r * (1 - amount))),
    g: Math.max(0, Math.round(c.g * (1 - amount))),
    b: Math.max(0, Math.round(c.b * (1 - amount))),
  };
}

/** Tiny deterministic PRNG for stylized camo (no texture noise) */
export function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 0xfffffff) / 0xfffffff;
  };
}
