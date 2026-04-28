import { RepeatWrapping, SRGBColorSpace, Texture, TextureLoader } from "three";

/**
 * Async texture loads keyed by URL/data URL. The engine polls readiness each frame via `has`.
 */
class TextureAssetCache {
  private readonly textures = new Map<string, Texture>();
  private readonly inflight = new Set<string>();
  private notify?: () => void;

  setNotifier(fn: () => void): void {
    this.notify = fn;
  }

  has(url: string): boolean {
    return this.textures.has(url);
  }

  get(url: string): Texture | undefined {
    return this.textures.get(url);
  }

  ensure(url: string): void {
    if (!url || this.textures.has(url) || this.inflight.has(url)) return;
    this.inflight.add(url);
    const loader = new TextureLoader();
    loader.load(
      url,
      (tex) => {
        tex.wrapS = RepeatWrapping;
        tex.wrapT = RepeatWrapping;
        tex.colorSpace = SRGBColorSpace;
        this.textures.set(url, tex);
        this.inflight.delete(url);
        this.notify?.();
      },
      undefined,
      () => {
        this.inflight.delete(url);
      },
    );
  }
}

export const textureAssetCache = new TextureAssetCache();
