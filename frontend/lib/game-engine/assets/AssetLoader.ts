/**
 * AssetLoader - Handles loading of game assets (textures, models, sounds)
 */

import { TEXTURE_FALLBACK_URL } from '@/lib/textures/constants';
import { loadWhenIdle } from '@/lib/textures/lazyLoad';

export interface TextureData {
  image: HTMLImageElement;
  width: number;
  height: number;
}

export class AssetLoader {
  private static instance: AssetLoader | null = null;
  private loadedTextures: Map<string, TextureData> = new Map();
  private loadedAudio: Map<string, HTMLAudioElement> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }

  /**
   * Load texture from URL
   */
  async loadTexture(url: string): Promise<TextureData> {
    // Return cached texture if already loaded
    if (this.loadedTextures.has(url)) {
      return this.loadedTextures.get(url)!;
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Create new loading promise
    const promise = new Promise<TextureData>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Allow CORS
      
      img.onload = () => {
        const textureData: TextureData = {
          image: img,
          width: img.width,
          height: img.height
        };
        this.loadedTextures.set(url, textureData);
        this.loadingPromises.delete(url);
        resolve(textureData);
      };
      
      img.onerror = () => {
        this.loadingPromises.delete(url);
        reject(new Error(`Failed to load texture: ${url}`));
      };
      
      img.src = url;
    });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  /**
   * Load texture with Pixel Place fallback chain (primary URL → shared fallback → procedural PNG data URL).
   * Use `lazy` to defer until browser idle.
   */
  async loadTextureSafe(url: string, opts?: { lazy?: boolean }): Promise<TextureData> {
    const attempt = async (): Promise<TextureData> => {
      const urls = [url, TEXTURE_FALLBACK_URL];
      for (const u of urls) {
        try {
          return await this.loadTexture(u);
        } catch {
          /* try next */
        }
      }
      return this.loadProceduralPlaceholderTexture();
    };

    if (opts?.lazy) {
      return loadWhenIdle(attempt);
    }
    return attempt();
  }

  private loadProceduralPlaceholderTexture(): Promise<TextureData> {
    const key = '__pixelplace_procedural_fallback__';
    if (this.loadedTextures.has(key)) {
      return Promise.resolve(this.loadedTextures.get(key)!);
    }
    const promise = new Promise<TextureData>((resolve, reject) => {
      if (typeof document === 'undefined') {
        reject(new Error('No DOM for procedural texture'));
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('2D context unavailable'));
        return;
      }
      ctx.fillStyle = '#a8b4c8';
      ctx.fillRect(0, 0, 64, 64);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const textureData: TextureData = {
          image: img,
          width: img.width,
          height: img.height,
        };
        this.loadedTextures.set(key, textureData);
        resolve(textureData);
      };
      img.onerror = () => reject(new Error('Procedural texture decode failed'));
      img.src = canvas.toDataURL('image/png');
    });
    return promise;
  }

  /**
   * Load multiple textures
   */
  async loadTextures(urls: string[]): Promise<Map<string, TextureData>> {
    const results = new Map<string, TextureData>();
    
    try {
      const promises = urls.map(async (url) => {
        const texture = await this.loadTexture(url);
        return { url, texture };
      });
      
      const loaded = await Promise.all(promises);
      loaded.forEach(({ url, texture }) => {
        results.set(url, texture);
      });
    } catch (error) {
      console.error('Error loading textures:', error);
    }
    
    return results;
  }

  /**
   * Load audio file
   */
  async loadAudio(url: string): Promise<HTMLAudioElement> {
    // Return cached audio if already loaded
    if (this.loadedAudio.has(url)) {
      return this.loadedAudio.get(url)!;
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Create new loading promise
    const promise = new Promise<HTMLAudioElement>((resolve, reject) => {
      const audio = new Audio();
      
      audio.addEventListener('canplaythrough', () => {
        this.loadedAudio.set(url, audio);
        this.loadingPromises.delete(url);
        resolve(audio);
      }, { once: true });
      
      audio.addEventListener('error', () => {
        this.loadingPromises.delete(url);
        reject(new Error(`Failed to load audio: ${url}`));
      }, { once: true });
      
      audio.src = url;
      audio.load();
    });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  /**
   * Load JSON data
   */
  async loadJSON<T>(url: string): Promise<T> {
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    const promise = fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        this.loadingPromises.delete(url);
        return data as T;
      })
      .catch(error => {
        this.loadingPromises.delete(url);
        throw error;
      });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  /**
   * Get loaded texture
   */
  getTexture(url: string): TextureData | undefined {
    return this.loadedTextures.get(url);
  }

  /**
   * Get loaded audio
   */
  getAudio(url: string): HTMLAudioElement | undefined {
    return this.loadedAudio.get(url);
  }

  /**
   * Check if texture is loaded
   */
  isTextureLoaded(url: string): boolean {
    return this.loadedTextures.has(url);
  }

  /**
   * Check if audio is loaded
   */
  isAudioLoaded(url: string): boolean {
    return this.loadedAudio.has(url);
  }

  /**
   * Clear all loaded assets (for cleanup)
   */
  clear(): void {
    this.loadedTextures.clear();
    this.loadedAudio.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get loading progress (0-1) for all assets
   */
  getLoadingProgress(): number {
    // This is a simplified version - in reality you'd track total bytes
    const total = this.loadedTextures.size + this.loadedAudio.size + this.loadingPromises.size;
    const loaded = this.loadedTextures.size + this.loadedAudio.size;
    return total > 0 ? loaded / total : 1;
  }
}
