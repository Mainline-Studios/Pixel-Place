/**
 * World Save Manager
 * Handles serialization and persistence of game worlds
 */

export interface WorldSaveData {
  version: string;
  objects: WorldObjectData[];
  metadata: {
    name: string;
    description: string;
    createdAt: number;
    lastModified: number;
  };
}

export interface WorldObjectData {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: string;
  script?: string;
  material?: string;
  shader?: string;
}

export class WorldSaveManager {
  private static STORAGE_KEY = 'gamestudio_worlds';

  /**
   * Save world to localStorage
   */
  static saveWorld(worldId: string, data: WorldSaveData): boolean {
    try {
      const worlds = this.getAllWorlds();
      data.metadata.lastModified = Date.now();
      worlds[worldId] = data;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(worlds));
      return true;
    } catch (error) {
      console.error('Failed to save world:', error);
      return false;
    }
  }

  /**
   * Load world from localStorage
   */
  static loadWorld(worldId: string): WorldSaveData | null {
    try {
      const worlds = this.getAllWorlds();
      return worlds[worldId] || null;
    } catch (error) {
      console.error('Failed to load world:', error);
      return null;
    }
  }

  /**
   * Get all saved worlds
   */
  static getAllWorlds(): Record<string, WorldSaveData> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  /**
   * Delete a world
   */
  static deleteWorld(worldId: string): boolean {
    try {
      const worlds = this.getAllWorlds();
      delete worlds[worldId];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(worlds));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Export world as JSON file
   */
  static exportWorld(data: WorldSaveData): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import world from JSON
   */
  static importWorld(json: string): WorldSaveData | null {
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}
