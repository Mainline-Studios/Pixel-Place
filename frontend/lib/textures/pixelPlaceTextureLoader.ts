import * as THREE from 'three';
import { TEXTURE_FALLBACK_URL } from './constants';
import { createProceduralFallbackDataTexture } from './proceduralFallback';
import { loadWhenIdle } from './lazyLoad';

/** Albedo/emissive: sRGB. Normal/roughness/metal/AO: linear. */
export type PixelPlaceTextureColorMode = 'srgb' | 'linear';

/**
 * World-consistent Three.js sampling: mipmaps, trilinear, modest anisotropy.
 */
export function applyPixelPlaceTextureSettings(
  texture: THREE.Texture,
  renderer?: THREE.WebGLRenderer,
  colorMode: PixelPlaceTextureColorMode = 'srgb'
): void {
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  const Lin = (THREE as unknown as { LinearSRGBColorSpace?: string }).LinearSRGBColorSpace;

  if (colorMode === 'linear' && Lin && 'colorSpace' in texture) {
    (texture as THREE.Texture & { colorSpace?: string }).colorSpace = Lin;
  } else if ('colorSpace' in texture && THREE.SRGBColorSpace) {
    (texture as THREE.Texture & { colorSpace?: string }).colorSpace = THREE.SRGBColorSpace;
  } else if ('encoding' in texture && (THREE as unknown as { sRGBEncoding?: number }).sRGBEncoding) {
    (texture as THREE.Texture & { encoding?: number }).encoding = (
      THREE as unknown as { sRGBEncoding: number }
    ).sRGBEncoding;
  }

  if (renderer) {
    const max = renderer.capabilities.getMaxAnisotropy();
    texture.anisotropy = Math.min(8, max);
  }
}

export type LoadPixelPlaceTextureOptions = {
  renderer?: THREE.WebGLRenderer;
  /** Defer load until browser idle */
  lazy?: boolean;
  crossOrigin?: string;
  /** Normal / roughness / metal / AO maps should use `linear` */
  colorMode?: PixelPlaceTextureColorMode;
};

/**
 * Central loader: cache, mipmaps, fallbacks (file → procedural), optional lazy idle scheduling.
 */
export class PixelPlaceTextureLoader {
  private static instance: PixelPlaceTextureLoader | null = null;

  private readonly urlLoader = new THREE.TextureLoader();
  private readonly cache = new Map<string, THREE.Texture>();

  private constructor() {}

  static getInstance(): PixelPlaceTextureLoader {
    if (!PixelPlaceTextureLoader.instance) {
      PixelPlaceTextureLoader.instance = new PixelPlaceTextureLoader();
    }
    return PixelPlaceTextureLoader.instance;
  }

  /** Remove cached GPU textures (e.g. scene teardown) */
  disposeAll(): void {
    for (const t of this.cache.values()) {
      t.dispose();
    }
    this.cache.clear();
  }

  /**
   * Load a texture from URL with Pixel Place sampling rules.
   * On failure: tries `TEXTURE_FALLBACK_URL`, then procedural 64² data texture.
   */
  load(url: string, options?: LoadPixelPlaceTextureOptions): Promise<THREE.Texture> {
    const run = () => this.loadInternal(url, options);
    if (options?.lazy) {
      return loadWhenIdle(run);
    }
    return run();
  }

  private cacheKey(url: string, options?: LoadPixelPlaceTextureOptions): string {
    return `${url}\0${options?.colorMode ?? 'srgb'}`;
  }

  private loadInternal(url: string, options?: LoadPixelPlaceTextureOptions): Promise<THREE.Texture> {
    const key = this.cacheKey(url, options);
    const cached = this.cache.get(key);
    if (cached) {
      return Promise.resolve(cached);
    }

    this.urlLoader.setCrossOrigin(options?.crossOrigin ?? 'anonymous');
    const mode = options?.colorMode ?? 'srgb';

    return new Promise((resolve) => {
      this.urlLoader.load(
        url,
        (tex) => {
          applyPixelPlaceTextureSettings(tex, options?.renderer, mode);
          this.cache.set(key, tex);
          resolve(tex);
        },
        undefined,
        () => {
          this.urlLoader.load(
            TEXTURE_FALLBACK_URL,
            (tex) => {
              applyPixelPlaceTextureSettings(tex, options?.renderer, mode);
              this.cache.set(key, tex);
              resolve(tex);
            },
            undefined,
            () => {
              const tex = createProceduralFallbackDataTexture(64);
              applyPixelPlaceTextureSettings(tex, options?.renderer, mode);
              this.cache.set(key, tex);
              resolve(tex);
            }
          );
        }
      );
    });
  }
}

/** Convenience singleton shortcut */
export function loadPixelPlaceTexture(
  url: string,
  options?: LoadPixelPlaceTextureOptions
): Promise<THREE.Texture> {
  return PixelPlaceTextureLoader.getInstance().load(url, options);
}
