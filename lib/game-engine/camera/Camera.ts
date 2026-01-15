/**
 * Camera - Handles view and projection
 */

export class Camera {
  private position: { x: number; y: number; z: number } = { x: 0, y: 5, z: 10 };
  private target: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  private up: { x: number; y: number; z: number } = { x: 0, y: 1, z: 0 };
  private fov: number = 60; // Field of view in degrees
  private near: number = 0.1;
  private far: number = 1000;
  private aspect: number = 16 / 9;

  /**
   * Set camera position
   */
  setPosition(x: number, y: number, z: number): void {
    this.position = { x, y, z };
  }

  /**
   * Get camera position
   */
  getPosition(): { x: number; y: number; z: number } {
    return { ...this.position };
  }

  /**
   * Set camera target (look at point)
   */
  setTarget(x: number, y: number, z: number): void {
    this.target = { x, y, z };
  }

  /**
   * Get camera target
   */
  getTarget(): { x: number; y: number; z: number } {
    return { ...this.target };
  }

  /**
   * Set aspect ratio
   */
  setAspect(aspect: number): void {
    this.aspect = aspect;
  }

  /**
   * Get model-view matrix
   */
  getModelViewMatrix(): Float32Array {
    const matrix = new Float32Array(16);
    
    // Calculate look-at matrix
    const fx = this.target.x - this.position.x;
    const fy = this.target.y - this.position.y;
    const fz = this.target.z - this.position.z;
    const length = Math.sqrt(fx * fx + fy * fy + fz * fz);
    const f = { x: fx / length, y: fy / length, z: fz / length };
    
    const sx = fy * this.up.z - fz * this.up.y;
    const sy = fz * this.up.x - fx * this.up.z;
    const sz = fx * this.up.y - fy * this.up.x;
    const lengthS = Math.sqrt(sx * sx + sy * sy + sz * sz);
    const s = { x: sx / lengthS, y: sy / lengthS, z: sz / lengthS };
    
    const ux = s.y * f.z - s.z * f.y;
    const uy = s.z * f.x - s.x * f.z;
    const uz = s.x * f.y - s.y * f.x;
    
    // Build matrix
    matrix[0] = s.x; matrix[4] = s.y; matrix[8] = s.z; matrix[12] = -(s.x * this.position.x + s.y * this.position.y + s.z * this.position.z);
    matrix[1] = ux; matrix[5] = uy; matrix[9] = uz; matrix[13] = -(ux * this.position.x + uy * this.position.y + uz * this.position.z);
    matrix[2] = -f.x; matrix[6] = -f.y; matrix[10] = -f.z; matrix[14] = f.x * this.position.x + f.y * this.position.y + f.z * this.position.z;
    matrix[3] = 0; matrix[7] = 0; matrix[11] = 0; matrix[15] = 1;
    
    return matrix;
  }

  /**
   * Get projection matrix (perspective)
   */
  getProjectionMatrix(): Float32Array {
    const matrix = new Float32Array(16);
    
    const f = 1.0 / Math.tan((this.fov * Math.PI / 180) / 2);
    const range = this.far - this.near;
    
    matrix[0] = f / this.aspect; matrix[4] = 0; matrix[8] = 0; matrix[12] = 0;
    matrix[1] = 0; matrix[5] = f; matrix[9] = 0; matrix[13] = 0;
    matrix[2] = 0; matrix[6] = 0; matrix[10] = -(this.far + this.near) / range; matrix[14] = -1;
    matrix[3] = 0; matrix[7] = 0; matrix[11] = -(2 * this.far * this.near) / range; matrix[15] = 0;
    
    return matrix;
  }
}








