import { applyPixelPlaceTextureSettings, type PixelPlaceTextureColorMode } from '../pixelPlaceTextureLoader';

type THREE_NS = typeof import('three');

export type AtlasSource = {
  id: string;
  image: CanvasImageSource;
  width: number;
  height: number;
};

/** UV in 0–1 space for sampling the atlas (u0,v0 bottom-left, u1,v1 top-right in Three UV convention adjust in material if needed) */
export type AtlasUVRect = { u0: number; v0: number; u1: number; v1: number };

export type AtlasPackResult = {
  texture: import('three').CanvasTexture;
  width: number;
  height: number;
  uvById: Record<string, AtlasUVRect>;
};

type Placed = { id: string; x: number; y: number; w: number; h: number };

/**
 * Shelf pack rows, power-of-two pad optional. Scales all sources to fit `maxCell` longest edge.
 */
export function packTextureAtlas(
  THREE: THREE_NS,
  sources: AtlasSource[],
  options: {
    maxAtlasWidth: number;
    maxAtlasHeight: number;
    maxCellLongestEdge: number;
    padding?: number;
    colorMode?: PixelPlaceTextureColorMode;
    renderer?: import('three').WebGLRenderer;
  }
): AtlasPackResult {
  const pad = options.padding ?? 2;
  const scaled: { id: string; w: number; h: number; img: CanvasImageSource }[] = [];

  for (const s of sources) {
    const scale = Math.min(1, options.maxCellLongestEdge / Math.max(s.width, s.height, 1));
    const w = Math.max(1, Math.floor(s.width * scale));
    const h = Math.max(1, Math.floor(s.height * scale));
    scaled.push({ id: s.id, w, h, img: s.image });
  }

  scaled.sort((a, b) => b.h - a.h);

  const placed: Placed[] = [];
  let x = pad;
  let y = pad;
  let rowH = 0;
  let atlasW = pad;
  let atlasH = pad;

  for (const s of scaled) {
    if (x + s.w + pad > options.maxAtlasWidth) {
      x = pad;
      y += rowH + pad;
      rowH = 0;
    }
    if (y + s.h + pad > options.maxAtlasHeight) {
      throw new Error(
        `Atlas overflow: increase maxAtlasHeight or reduce entries (current ${atlasW}x${atlasH}, need row to ${y + s.h})`
      );
    }
    placed.push({ id: s.id, x, y, w: s.w, h: s.h });
    rowH = Math.max(rowH, s.h);
    atlasW = Math.max(atlasW, x + s.w + pad);
    atlasH = Math.max(atlasH, y + s.h + pad);
    x += s.w + pad;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.min(options.maxAtlasWidth, ceilPow2(atlasW));
  canvas.height = Math.min(options.maxAtlasHeight, ceilPow2(atlasH));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const uvById: Record<string, AtlasUVRect> = {};
  const aw = canvas.width;
  const ah = canvas.height;

  for (const p of placed) {
    const src = scaled.find((z) => z.id === p.id)!;
    ctx.drawImage(src.img, p.x, p.y, p.w, p.h);
    uvById[p.id] = {
      u0: p.x / aw,
      v0: 1 - (p.y + p.h) / ah,
      u1: (p.x + p.w) / aw,
      v1: 1 - p.y / ah,
    };
  }

  const texture = new THREE.CanvasTexture(canvas);
  applyPixelPlaceTextureSettings(texture, options.renderer, options.colorMode ?? 'srgb');

  return { texture, width: canvas.width, height: canvas.height, uvById };
}

function ceilPow2(n: number): number {
  if (n <= 1) return 1;
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

/** Helpers for `mesh.scale` / custom UV attr from atlas rects */
export function atlasRectToRepeatUv(rect: AtlasUVRect): { offset: [number, number]; repeat: [number, number] } {
  const du = rect.u1 - rect.u0;
  const dv = rect.v1 - rect.v0;
  return { offset: [rect.u0, rect.v0], repeat: [du, dv] };
}
