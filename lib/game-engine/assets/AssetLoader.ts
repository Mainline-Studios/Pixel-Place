/**
 * AssetLoader - Handles loading of game assets (textures, models, sounds)
 */

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
