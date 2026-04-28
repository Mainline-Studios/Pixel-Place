/**
 * Entity - Base class for all game objects
 */

import { Scene } from '../core/Scene';

export class Entity {
  protected scene: Scene | null = null;
  protected enabled: boolean = true;
  protected position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  protected rotation: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  protected scale: { x: number; y: number; z: number } = { x: 1, y: 1, z: 1 };

  /**
   * Set the scene this entity belongs to
   */
  setScene(scene: Scene | null): void {
    this.scene = scene;
  }

  /**
   * Get the scene this entity belongs to
   */
  getScene(): Scene | null {
    return this.scene;
  }

  /**
   * Enable/disable entity
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if entity is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set position
   */
  setPosition(x: number, y: number, z: number): void {
    this.position = { x, y, z };
  }

  /**
   * Get position
   */
  getPosition(): { x: number; y: number; z: number } {
    return { ...this.position };
  }

  /**
   * Set rotation (in radians)
   */
  setRotation(x: number, y: number, z: number): void {
    this.rotation = { x, y, z };
  }

  /**
   * Get rotation
   */
  getRotation(): { x: number; y: number; z: number } {
    return { ...this.rotation };
  }

  /**
   * Set scale
   */
  setScale(x: number, y: number, z: number): void {
    this.scale = { x, y, z };
  }

  /**
   * Get scale
   */
  getScale(): { x: number; y: number; z: number } {
    return { ...this.scale };
  }

  /**
   * Update called every frame
   */
  update(deltaTime: number): void {
    // Override in subclasses
  }

  /**
   * Get mesh data for rendering
   * Returns: { vertices, colors, indices }
   */
  getMeshData(): { vertices: Float32Array; colors: Float32Array; indices: Uint16Array } | null {
    // Override in subclasses
    return null;
  }

  /**
   * Get transformation matrix
   */
  getTransformMatrix(): Float32Array {
    // Create 4x4 transformation matrix
    const matrix = new Float32Array(16);
    
    // Identity matrix
    matrix[0] = 1; matrix[1] = 0; matrix[2] = 0; matrix[3] = 0;
    matrix[4] = 0; matrix[5] = 1; matrix[6] = 0; matrix[7] = 0;
    matrix[8] = 0; matrix[9] = 0; matrix[10] = 1; matrix[11] = 0;
    matrix[12] = this.position.x; matrix[13] = this.position.y; matrix[14] = this.position.z; matrix[15] = 1;
    
    // TODO: Apply rotation and scale
    
    return matrix;
  }
}








