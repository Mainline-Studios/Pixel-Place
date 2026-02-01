/**
 * Physics - Basic physics and collision detection system
 */

import { Entity } from '../entities/Entity';

export interface BoundingBox {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
}

export interface CollisionResult {
  collided: boolean;
  normal?: { x: number; y: number; z: number };
  penetration?: number;
}

export class Physics {
  private gravity: number = -9.82;
  private entities: Set<Entity> = new Set();
  
  /**
   * Add entity to physics simulation
   */
  addEntity(entity: Entity): void {
    this.entities.add(entity);
  }

  /**
   * Remove entity from physics simulation
   */
  removeEntity(entity: Entity): void {
    this.entities.delete(entity);
  }

  /**
   * Set gravity
   */
  setGravity(gravity: number): void {
    this.gravity = gravity;
  }

  /**
   * Get bounding box for entity (AABB - Axis-Aligned Bounding Box)
   */
  getBoundingBox(entity: Entity): BoundingBox | null {
    const pos = entity.getPosition();
    const scale = entity.getScale();
    
    // For Part entities, we need size info
    // This is a simplified version - in reality you'd get actual mesh bounds
    const halfSize = {
      x: scale.x / 2,
      y: scale.y / 2,
      z: scale.z / 2
    };
    
    return {
      min: {
        x: pos.x - halfSize.x,
        y: pos.y - halfSize.y,
        z: pos.z - halfSize.z
      },
      max: {
        x: pos.x + halfSize.x,
        y: pos.y + halfSize.y,
        z: pos.z + halfSize.z
      }
    };
  }

  /**
   * Check collision between two bounding boxes (AABB collision)
   */
  checkAABBCollision(box1: BoundingBox, box2: BoundingBox): boolean {
    return (
      box1.min.x <= box2.max.x &&
      box1.max.x >= box2.min.x &&
      box1.min.y <= box2.max.y &&
      box1.max.y >= box2.min.y &&
      box1.min.z <= box2.max.z &&
      box1.max.z >= box2.min.z
    );
  }

  /**
   * Check collision between two entities
   */
  checkCollision(entity1: Entity, entity2: Entity): CollisionResult {
    const box1 = this.getBoundingBox(entity1);
    const box2 = this.getBoundingBox(entity2);
    
    if (!box1 || !box2) {
      return { collided: false };
    }
    
    const collided = this.checkAABBCollision(box1, box2);
    
    if (!collided) {
      return { collided: false };
    }
    
    // Calculate collision normal and penetration
    const center1 = {
      x: (box1.min.x + box1.max.x) / 2,
      y: (box1.min.y + box1.max.y) / 2,
      z: (box1.min.z + box1.max.z) / 2
    };
    
    const center2 = {
      x: (box2.min.x + box2.max.x) / 2,
      y: (box2.min.y + box2.max.y) / 2,
      z: (box2.min.z + box2.max.z) / 2
    };
    
    const delta = {
      x: center2.x - center1.x,
      y: center2.y - center1.y,
      z: center2.z - center1.z
    };
    
    // Find minimum penetration axis
    const overlapX = Math.min(box1.max.x - box2.min.x, box2.max.x - box1.min.x);
    const overlapY = Math.min(box1.max.y - box2.min.y, box2.max.y - box1.min.y);
    const overlapZ = Math.min(box1.max.z - box2.min.z, box2.max.z - box1.min.z);
    
    let minOverlap = overlapX;
    let normal = { x: delta.x > 0 ? 1 : -1, y: 0, z: 0 };
    
    if (overlapY < minOverlap) {
      minOverlap = overlapY;
      normal = { x: 0, y: delta.y > 0 ? 1 : -1, z: 0 };
    }
    
    if (overlapZ < minOverlap) {
      minOverlap = overlapZ;
      normal = { x: 0, y: 0, z: delta.z > 0 ? 1 : -1 };
    }
    
    return {
      collided: true,
      normal,
      penetration: minOverlap
    };
  }

  /**
   * Raycast from origin in direction
   * Returns first entity hit
   */
  raycast(
    origin: { x: number; y: number; z: number },
    direction: { x: number; y: number; z: number },
    maxDistance: number = 1000
  ): { entity: Entity; distance: number } | null {
    let closestHit: { entity: Entity; distance: number } | null = null;
    
    // Normalize direction
    const length = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);
    if (length === 0) return null;
    const dir = {
      x: direction.x / length,
      y: direction.y / length,
      z: direction.z / length
    };
    
    for (const entity of this.entities) {
      const box = this.getBoundingBox(entity);
      if (!box) continue;
      
      // Simplified ray-AABB intersection
      const invDir = {
        x: 1 / dir.x,
        y: 1 / dir.y,
        z: 1 / dir.z
      };
      
      const t1 = (box.min.x - origin.x) * invDir.x;
      const t2 = (box.max.x - origin.x) * invDir.x;
      const t3 = (box.min.y - origin.y) * invDir.y;
      const t4 = (box.max.y - origin.y) * invDir.y;
      const t5 = (box.min.z - origin.z) * invDir.z;
      const t6 = (box.max.z - origin.z) * invDir.z;
      
      const tMin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
      const tMax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));
      
      if (tMax >= tMin && tMin >= 0 && tMin <= maxDistance) {
        if (!closestHit || tMin < closestHit.distance) {
          closestHit = { entity, distance: tMin };
        }
      }
    }
    
    return closestHit;
  }

  /**
   * Update physics (called each frame)
   */
  update(deltaTime: number): void {
    // Basic physics simulation would go here
    // For now, collision detection is handled manually
  }

  /**
   * Get all entities in physics world
   */
  getEntities(): Entity[] {
    return Array.from(this.entities);
  }

  /**
   * Clear all entities
   */
  clear(): void {
    this.entities.clear();
  }
}
