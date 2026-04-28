import * as THREE from 'three';
import { isUserAssetApprovedForVerifiedMode, gameAssetRegistry } from '@/lib/assets';

type TextureSet = {
  albedo: THREE.Texture;
  normal: THREE.Texture;
  roughness: THREE.Texture;
};

const textureCache = new Map<string, Promise<TextureSet>>();

function safeTextureKey(key: string): string {
  const clean = key.trim().toLowerCase().replace(/[^a-z0-9_\-/]/g, '');
  if (!clean) return 'fallback/default';
  return clean;
}

function canvasTexture(size: number, painter: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable');
  painter(ctx);
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = true;
  return t;
}

function generateFallbackTextureSet(key: string, size: 512 | 1024): TextureSet {
  const hash = Array.from(key).reduce((acc, ch) => ((acc * 33) ^ ch.charCodeAt(0)) >>> 0, 5381);
  const hue = hash % 360;
  const hue2 = (hue + 18) % 360;

  const albedo = canvasTexture(size, (ctx) => {
    ctx.fillStyle = `hsl(${hue} 28% 44%)`;
    ctx.fillRect(0, 0, size, size);
    const step = Math.max(16, Math.floor(size / 14));
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        const jitter = ((x * 13 + y * 7 + hash) % 23) - 11;
        ctx.fillStyle = `hsl(${hue2} 24% ${48 + jitter * 0.5}%)`;
        ctx.fillRect(x, y, step - 2, step - 2);
      }
    }
  });
  albedo.colorSpace = THREE.SRGBColorSpace;

  const normal = canvasTexture(size, (ctx) => {
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, size, size);
    const step = Math.max(16, Math.floor(size / 16));
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        const ny = 116 + (((x * 5 + y * 11 + hash) % 28) - 14);
        ctx.fillStyle = `rgb(128,${Math.max(96, Math.min(160, ny))},255)`;
        ctx.fillRect(x, y, step - 1, step - 1);
      }
    }
  });

  const roughness = canvasTexture(size, (ctx) => {
    ctx.fillStyle = '#bdbdbd';
    ctx.fillRect(0, 0, size, size);
    const step = Math.max(8, Math.floor(size / 24));
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        const v = 120 + (((x * 3 + y * 19 + hash) % 85) - 42);
        const clamped = Math.max(70, Math.min(210, v));
        ctx.fillStyle = `rgb(${clamped},${clamped},${clamped})`;
        ctx.fillRect(x, y, step - 1, step - 1);
      }
    }
  });

  return { albedo, normal, roughness };
}

async function tryLoadTexture(url: string, srgb: boolean): Promise<THREE.Texture | null> {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        resolve(tex);
      },
      undefined,
      () => resolve(null)
    );
  });
}

/**
 * Asset pipeline:
 * - validates texture keys
 * - loads approved pre-authored textures when available
 * - generates procedural fallback map set when missing
 */
export async function loadOrGenerateTextureSet(
  category: string,
  assetName: string,
  importance: 'standard' | 'hero' = 'standard'
): Promise<TextureSet> {
  const size: 512 | 1024 = importance === 'hero' ? 1024 : 512;
  const key = `${safeTextureKey(category)}/${safeTextureKey(assetName)}@${size}`;
  const existing = textureCache.get(key);
  if (existing) return existing;

  const promise = (async () => {
    const base = `/assets/textures/${safeTextureKey(category)}/${safeTextureKey(assetName)}`;
    const [albedo, normal, roughness] = await Promise.all([
      tryLoadTexture(`${base}/albedo_${size}.png`, true),
      tryLoadTexture(`${base}/normal_${size}.png`, false),
      tryLoadTexture(`${base}/roughness_${size}.png`, false),
    ]);

    if (albedo && normal && roughness) {
      return { albedo, normal, roughness };
    }
    return generateFallbackTextureSet(`${category}/${assetName}`, size);
  })();

  textureCache.set(key, promise);
  return promise;
}

/**
 * Safety gate for user-generated model assets.
 * Returns approved in-memory clones only.
 */
export function listApprovedUserModelRoots(): THREE.Object3D[] {
  const entries = gameAssetRegistry.list();
  const approved = entries.filter(isUserAssetApprovedForVerifiedMode);
  const roots: THREE.Object3D[] = [];
  for (const rec of approved) {
    const clone = gameAssetRegistry.cloneForScene(rec.id);
    if (clone) roots.push(clone);
  }
  return roots;
}

export function clearGeneratedTextureCache(): void {
  textureCache.clear();
}

