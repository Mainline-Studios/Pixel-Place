/**
 * Scene - Manages all entities in the game world
 */

import { Entity } from '../entities/Entity';

export class Scene {
  private entities: Entity[] = [];
  private background: { r: number; g: number; b: number } = { r: 0.2, g: 0.2, b: 0.3 };

  /**
   * Add entity to scene
   */
  add(entity: Entity): void {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity);
      entity.setScene(this);
    }
  }

  /**
   * Remove entity from scene
   */
  remove(entity: Entity): void {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
      entity.setScene(null);
    }
  }

  /**
   * Get all entities
   */
  getEntities(): Entity[] {
    return [...this.entities];
  }

  /**
   * Update all entities
   */
  update(deltaTime: number): void {
    this.entities.forEach(entity => {
      if (entity.isEnabled()) {
        entity.update(deltaTime);
      }
    });
  }

  /**
   * Set background color
   */
  setBackground(r: number, g: number, b: number): void {
    this.background = { r, g, b };
  }

  /**
   * Get background color
   */
  getBackground(): { r: number; g: number; b: number } {
    return { ...this.background };
  }

  /**
   * Clear all entities
   */
  clear(): void {
    this.entities.forEach(entity => entity.setScene(null));
    this.entities = [];
  }
}








