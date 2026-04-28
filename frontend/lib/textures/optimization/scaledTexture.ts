import { applyPixelPlaceTextureSettings, type PixelPlaceTextureColorMode } from '../pixelPlaceTextureLoader';

type THREE_NS = typeof import('three');

function getImageSize(img: CanvasImageSource): { w: number; h: number } {
  if (img instanceof HTMLImageElement) {
    return { w: img.naturalWidth || img.width, h: img.naturalHeight || img.height };
  }
  if (img instanceof HTMLCanvasElement || img instanceof OffscreenCanvas) {
    return { w: img.width, h: img.height };
  }
  if (typeof ImageBitmap !== 'undefined' && img instanceof ImageBitmap) {
    return { w: img.width, h: img.height };
  }
  return { w: 256, h: 256 };
}

/**
 * Fast path: scale on GPU upload via canvas, no extra JPEG/WebP round-trip.
 */
export function createScaledCanvasTexture(
  THREE: THREE_NS,
  source: CanvasImageSource,
  maxDimension: number,
  colorMode: PixelPlaceTextureColorMode,
  renderer?: import('three').WebGLRenderer
): import('three').CanvasTexture {
  const { w: nw, h: nh } = getImageSize(source);
  const scale = Math.min(1, maxDimension / Math.max(nw, nh, 1));
  const cw = Math.max(1, Math.floor(nw * scale));
  const ch = Math.max(1, Math.floor(nh * scale));

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, cw, ch);

  const tex = new THREE.CanvasTexture(canvas);
  applyPixelPlaceTextureSettings(tex, renderer, colorMode);
  return tex;
}
