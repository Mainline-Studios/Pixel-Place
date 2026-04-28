import * as THREE from 'three';
import type { AtlasSource } from './atlas';
import { packTextureAtlas, type AtlasPackResult } from './atlas';
import { pickTranscodeFormat, transcodeImageElement } from './compress';
import { getTextureDeviceProfile, type TextureDeviceProfile } from './deviceProfile';
import { getGlobalGpuTextureMemoryTracker } from './gpuMemoryTracker';
import { getGlobalPrioritizedTextureQueue } from './prioritizedQueue';
import { applyPixelPlaceTextureSettings, type PixelPlaceTextureColorMode } from '../pixelPlaceTextureLoader';
import { createScaledCanvasTexture } from './scaledTexture';

export type OptimizedTextureLoadOptions = {
  /** Higher = loads sooner when the global queue is saturated */
  priority?: number;
  maxDimension?: number;
  /** Extra JPEG/WebP encode pass (smaller transient GPU buffers; adds CPU work) */
  transcode?: boolean;
  colorMode?: PixelPlaceTextureColorMode;
  renderer?: THREE.WebGLRenderer;
  crossOrigin?: string;
  /** Key for `GpuTextureMemoryTracker` (default: url) */
  memoryId?: string;
  profile?: TextureDeviceProfile;
  /** Register with global memory tracker (default true) */
  trackMemory?: boolean;
};

function loadImageElement(url: string, crossOrigin: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = crossOrigin;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Decode → optional lossy transcode → GPU upload. Uses global priority queue + memory tracker.
 */
export function loadOptimizedTexture(
  url: string,
  options: OptimizedTextureLoadOptions = {}
): Promise<THREE.Texture> {
  const profile = options.profile ?? getTextureDeviceProfile();
  const maxDim = options.maxDimension ?? profile.maxTextureDimension;
  const priority = options.priority ?? 0;
  const colorMode = options.colorMode ?? 'srgb';
  const queue = getGlobalPrioritizedTextureQueue(profile.maxConcurrentLoads);
  const tracker = getGlobalGpuTextureMemoryTracker();

  return queue.submit(priority, async () => {
    const img = await loadImageElement(url, options.crossOrigin ?? 'anonymous');
    let tex: THREE.Texture;

    if (options.transcode) {
      const fmt = pickTranscodeFormat(profile.preferWebpTranscode);
      const { objectUrl } = await transcodeImageElement(
        img,
        img.naturalWidth,
        img.naturalHeight,
        maxDim,
        fmt,
        profile.lossyQuality
      );
      try {
        tex = await new Promise<THREE.Texture>((resolve, reject) => {
          new THREE.TextureLoader().load(objectUrl, resolve, undefined, reject);
        });
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
      applyPixelPlaceTextureSettings(tex, options.renderer, colorMode);
    } else {
      tex = createScaledCanvasTexture(THREE, img, maxDim, colorMode, options.renderer);
    }

    const memId = options.memoryId ?? url;
    if (options.trackMemory !== false) {
      tex.userData = { ...tex.userData, __textureMemoryId: memId };
      tracker.registerThreeTexture(memId, tex, url);
    }

    return tex;
  });
}

export type AtlasUrlEntry = {
  id: string;
  url: string;
  /** Fetch priority for this tile (higher first) */
  priority?: number;
};

export type BuildAtlasOptions = {
  profile?: TextureDeviceProfile;
  colorMode?: PixelPlaceTextureColorMode;
  renderer?: THREE.WebGLRenderer;
  crossOrigin?: string;
  basePriority?: number;
  trackMemory?: boolean;
  /** Tracker id for the atlas texture */
  memoryId?: string;
};

/**
 * Fetch tiles through the priority queue, then pack one atlas (shared material / one bind).
 */
export async function buildAtlasFromUrls(
  entries: AtlasUrlEntry[],
  options: BuildAtlasOptions = {}
): Promise<AtlasPackResult & { urls: string[] }> {
  const profile = options.profile ?? getTextureDeviceProfile();
  const baseP = options.basePriority ?? 0;
  const queue = getGlobalPrioritizedTextureQueue(profile.maxConcurrentLoads);
  const co = options.crossOrigin ?? 'anonymous';
  const sources: AtlasSource[] = [];

  for (const e of entries) {
    const p = (e.priority ?? 0) + baseP;
    const img = await queue.submit(p, () => loadImageElement(e.url, co));
    sources.push({
      id: e.id,
      image: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  }

  const packed = packTextureAtlas(THREE, sources, {
    maxAtlasWidth: profile.maxAtlasDimension,
    maxAtlasHeight: profile.maxAtlasDimension,
    maxCellLongestEdge: profile.maxTextureDimension,
    colorMode: options.colorMode ?? 'srgb',
    renderer: options.renderer,
  });

  if (options.trackMemory !== false) {
    const tracker = getGlobalGpuTextureMemoryTracker();
    const memId = options.memoryId ?? `atlas:${entries.map((e) => e.id).join('+')}`;
    packed.texture.userData = { ...packed.texture.userData, __textureMemoryId: memId };
    tracker.registerThreeTexture(memId, packed.texture, entries.map((e) => e.url).join(','));
  }

  return { ...packed, urls: entries.map((x) => x.url) };
}

/** Dispose texture and drop tracker entry */
export function disposeOptimizedTexture(
  tex: THREE.Texture,
  tracker = getGlobalGpuTextureMemoryTracker()
): void {
  const id = tex.userData?.__textureMemoryId as string | undefined;
  if (id) tracker.unregister(id);
  tex.dispose();
}

export type { AtlasPackResult, AtlasUVRect } from './atlas';
