/**
 * Prefab Manager
 * Handles reusable object groups (prefabs)
 */

export interface PrefabAsset {
  id: string;
  name: string;
  description: string;
  objects: PrefabObjectData[];
  createdAt: number;
}

export interface PrefabObjectData {
  type: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: string;
  script?: string;
  material?: string;
  relativeTo?: string; // Parent object ID for hierarchy
}

export class PrefabManager {
  private static STORAGE_KEY = 'gamestudio_prefabs';

  /**
   * Create prefab from selected objects
   */
  static createPrefab(
    name: string,
    description: string,
    objects: PrefabObjectData[],
    centerPoint: { x: number; y: number; z: number }
  ): PrefabAsset {
    // Normalize positions relative to center
    const normalized = objects.map(obj => ({
      ...obj,
      position: {
        x: obj.position.x - centerPoint.x,
        y: obj.position.y - centerPoint.y,
        z: obj.position.z - centerPoint.z
      }
    }));

    const prefab: PrefabAsset = {
      id: `prefab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      objects: normalized,
      createdAt: Date.now()
    };

    this.savePrefab(prefab);
    return prefab;
  }

  /**
   * Save prefab
   */
  static savePrefab(prefab: PrefabAsset): boolean {
    try {
      const prefabs = this.getAllPrefabs();
      prefabs[prefab.id] = prefab;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prefabs));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Load prefab
   */
  static loadPrefab(prefabId: string): PrefabAsset | null {
    try {
      const prefabs = this.getAllPrefabs();
      return prefabs[prefabId] || null;
    } catch {
      return null;
    }
  }

  /**
   * Get all prefabs
   */
  static getAllPrefabs(): Record<string, PrefabAsset> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  /**
   * Spawn prefab at position
   */
  static spawnPrefab(
    prefab: PrefabAsset,
    position: { x: number; y: number; z: number }
  ): PrefabObjectData[] {
    return prefab.objects.map(obj => ({
      ...obj,
      position: {
        x: obj.position.x + position.x,
        y: obj.position.y + position.y,
        z: obj.position.z + position.z
      }
    }));
  }

  /**
   * Delete prefab
   */
  static deletePrefab(prefabId: string): boolean {
    try {
      const prefabs = this.getAllPrefabs();
      delete prefabs[prefabId];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prefabs));
      return true;
    } catch {
      return false;
    }
  }
}
