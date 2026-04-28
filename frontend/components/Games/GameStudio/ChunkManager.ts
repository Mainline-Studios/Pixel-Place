/**
 * Chunk Manager
 * Handles world streaming and chunk-based loading
 */

export interface Chunk {
  x: number;
  z: number;
  objects: string[]; // Object IDs in this chunk
  active: boolean;
}

export class ChunkManager {
  private chunkSize: number;
  private chunks: Map<string, Chunk>;
  private activeChunks: Set<string>;

  constructor(chunkSize: number = 50) {
    this.chunkSize = chunkSize;
    this.chunks = new Map();
    this.activeChunks = new Set();
  }

  /**
   * Get chunk coordinates from world position
   */
  getChunkCoords(x: number, z: number): { x: number; z: number } {
    return {
      x: Math.floor(x / this.chunkSize),
      z: Math.floor(z / this.chunkSize)
    };
  }

  /**
   * Get chunk key
   */
  getChunkKey(x: number, z: number): string {
    return `${x},${z}`;
  }

  /**
   * Get or create chunk
   */
  getChunk(x: number, z: number): Chunk {
    const key = this.getChunkKey(x, z);
    if (!this.chunks.has(key)) {
      this.chunks.set(key, {
        x,
        z,
        objects: [],
        active: false
      });
    }
    return this.chunks.get(key)!;
  }

  /**
   * Add object to chunk
   */
  addObject(objectId: string, worldX: number, worldZ: number): void {
    const coords = this.getChunkCoords(worldX, worldZ);
    const chunk = this.getChunk(coords.x, coords.z);
    if (!chunk.objects.includes(objectId)) {
      chunk.objects.push(objectId);
    }
  }

  /**
   * Remove object from chunk
   */
  removeObject(objectId: string, worldX: number, worldZ: number): void {
    const coords = this.getChunkCoords(worldX, worldZ);
    const chunk = this.getChunk(coords.x, coords.z);
    chunk.objects = chunk.objects.filter(id => id !== objectId);
  }

  /**
   * Get chunks near position (for activation)
   */
  getNearbyChunks(centerX: number, centerZ: number, radius: number = 2): Chunk[] {
    const centerChunk = this.getChunkCoords(centerX, centerZ);
    const chunks: Chunk[] = [];

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const chunk = this.getChunk(centerChunk.x + dx, centerChunk.z + dz);
        chunks.push(chunk);
      }
    }

    return chunks;
  }

  /**
   * Activate chunks near position
   */
  activateChunks(centerX: number, centerZ: number, radius: number = 2): string[] {
    const nearby = this.getNearbyChunks(centerX, centerZ, radius);
    const activated: string[] = [];

    // Deactivate old chunks
    this.activeChunks.forEach(key => {
      const chunk = this.chunks.get(key);
      if (chunk) chunk.active = false;
    });
    this.activeChunks.clear();

    // Activate new chunks
    nearby.forEach(chunk => {
      const key = this.getChunkKey(chunk.x, chunk.z);
      chunk.active = true;
      this.activeChunks.add(key);
      activated.push(...chunk.objects);
    });

    return activated;
  }

  /**
   * Get active object IDs
   */
  getActiveObjectIds(): string[] {
    const ids: string[] = [];
    this.activeChunks.forEach(key => {
      const chunk = this.chunks.get(key);
      if (chunk) ids.push(...chunk.objects);
    });
    return ids;
  }

  /**
   * Clear all chunks
   */
  clear(): void {
    this.chunks.clear();
    this.activeChunks.clear();
  }
}
