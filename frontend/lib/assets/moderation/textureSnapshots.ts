import type * as THREE from 'three';
import { collectMaterialTextures } from '../import/validation';

export type TextureSnapshotPayload = {
  base64: string;
  mime: string;
};

export type CaptureTextureSnapshotsOptions = {
  maxTextures: number;
  maxSide: number;
  jpegQuality: number;
};

const DEFAULT_OPTS: CaptureTextureSnapshotsOptions = {
  maxTextures: 32,
  maxSide: 512,
  jpegQuality: 0.82,
};

function stripDataUrlPrefix(dataUrl: string): string {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  return m ? m[2]! : dataUrl.replace(/^data:image\/\w+;base64,/, '');
}

async function ensureImageLoaded(img: HTMLImageElement): Promise<boolean> {
  if (img.complete && img.naturalWidth > 0) return true;
  return new Promise((resolve) => {
    const ok = () => resolve(true);
    const bad = () => resolve(false);
    img.addEventListener('load', ok, { once: true });
    img.addEventListener('error', bad, { once: true });
  });
}

/**
 * Rasterize unique mesh textures to JPEG snapshots for server-side moderation.
 */
export async function captureTextureSnapshotsForModeration(
  root: THREE.Object3D,
  options: Partial<CaptureTextureSnapshotsOptions> = {}
): Promise<TextureSnapshotPayload[]> {
  const opts = { ...DEFAULT_OPTS, ...options };
  const textures = collectMaterialTextures(root).slice(0, opts.maxTextures);
  const out: TextureSnapshotPayload[] = [];

  for (const tex of textures) {
    const snap = await textureToJpegSnapshot(tex, opts.maxSide, opts.jpegQuality);
    if (!snap) {
      throw new Error(
        'Cannot rasterize one or more textures for safety review. Try a GLB with embedded images, or convert textures to PNG/JPEG.'
      );
    }
    out.push(snap);
  }

  return out;
}

async function textureToJpegSnapshot(
  tex: THREE.Texture,
  maxSide: number,
  jpegQuality: number
): Promise<TextureSnapshotPayload | null> {
  const image = tex.image as
    | HTMLImageElement
    | HTMLCanvasElement
    | ImageBitmap
    | { width: number; height: number; data?: Uint8ClampedArray | Uint8Array }
    | undefined;

  if (!image) return null;

  let source: CanvasImageSource | null = null;
  let w = 0;
  let h = 0;

  if (typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement) {
    await ensureImageLoaded(image);
    if (image.naturalWidth <= 0) return null;
    w = image.naturalWidth;
    h = image.naturalHeight;
    source = image;
  } else if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) {
    w = image.width;
    h = image.height;
    source = image;
  } else if (typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement) {
    w = image.width;
    h = image.height;
    source = image;
  } else if (
    'data' in image &&
    image.data &&
    typeof image.width === 'number' &&
    typeof image.height === 'number' &&
    image.width > 0 &&
    image.height > 0
  ) {
    w = image.width;
    h = image.height;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    const imgData = ctx.createImageData(w, h);
    const buf = image.data;
    const need = w * h * 4;
    if (buf.length === need) {
      imgData.data.set(buf);
    } else if (buf.length === w * h * 3) {
      for (let p = 0; p < w * h; p++) {
        const o = p * 4;
        const s = p * 3;
        imgData.data[o] = buf[s]!;
        imgData.data[o + 1] = buf[s + 1]!;
        imgData.data[o + 2] = buf[s + 2]!;
        imgData.data[o + 3] = 255;
      }
    } else {
      return null;
    }
    ctx.putImageData(imgData, 0, 0);
    source = c;
  }

  if (!source || w <= 0 || h <= 0) return null;

  const scale = Math.min(1, maxSide / Math.max(w, h));
  const tw = Math.max(1, Math.round(w * scale));
  const th = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement('canvas');
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  try {
    ctx.drawImage(source, 0, 0, tw, th);
  } catch {
    return null;
  }
  const dataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
  return { base64: stripDataUrlPrefix(dataUrl), mime: 'image/jpeg' };
}
