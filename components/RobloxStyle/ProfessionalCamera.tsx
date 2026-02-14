'use client';

/**
 * Professional Camera System
 * Implements smooth, industry-standard camera controls
 * Better than typical Roblox camera feel
 */

export class ProfessionalCamera {
  private camera: any;
  private target: { x: number; y: number; z: number };
  private position: { x: number; y: number; z: number };
  private rotation: { x: number; y: number };
  private offset: { x: number; y: number; z: number };
  
  // Camera settings
  private followSpeed: number = 0.1;
  private rotationSpeed: number = 0.05;
  private mouseSensitivity: number = 0.002;
  private minVerticalAngle: number = -Math.PI / 3;
  private maxVerticalAngle: number = Math.PI / 3;
  
  // Smoothing
  private velocity: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  private rotationVelocity: { x: number; y: number } = { x: 0, y: 0 };

  constructor(camera: any) {
    this.camera = camera;
    this.target = { x: 0, y: 0, z: 0 };
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0 };
    this.offset = { x: 0, y: 5, z: 10 };
  }

  /**
   * First-person camera mode
   */
  setFirstPerson(target: { x: number; y: number; z: number }) {
    this.target = target;
    this.offset = { x: 0, y: 0, z: 0 };
  }

  /**
   * Third-person camera mode
   */
  setThirdPerson(target: { x: number; y: number; z: number }, distance: number = 10, height: number = 5) {
    this.target = target;
    this.offset = {
      x: 0,
      y: height,
      z: distance
    };
  }

  /**
   * Handle mouse look
   */
  handleMouseMove(deltaX: number, deltaY: number) {
    this.rotation.y -= deltaX * this.mouseSensitivity;
    this.rotation.x -= deltaY * this.mouseSensitivity;
    this.rotation.x = Math.max(this.minVerticalAngle, Math.min(this.maxVerticalAngle, this.rotation.x));
  }

  /**
   * Update camera position and rotation smoothly
   */
  update(deltaTime: number) {
    // Calculate desired position
    const desiredX = this.target.x + this.offset.x;
    const desiredY = this.target.y + this.offset.y;
    const desiredZ = this.target.z + this.offset.z;

    // Smooth interpolation (exponential smoothing)
    const smoothFactor = 1 - Math.pow(0.1, deltaTime * 60);
    
    this.position.x += (desiredX - this.position.x) * smoothFactor;
    this.position.y += (desiredY - this.position.y) * smoothFactor;
    this.position.z += (desiredZ - this.position.z) * smoothFactor;

    // Apply position
    this.camera.position.set(this.position.x, this.position.y, this.position.z);

    // Apply rotation
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.rotation.y;
    this.camera.rotation.x = this.rotation.x;

    // Look at target if in third-person
    if (this.offset.z > 0) {
      this.camera.lookAt(this.target.x, this.target.y, this.target.z);
    }
  }

  /**
   * Add camera shake effect
   */
  addShake(intensity: number, duration: number) {
    // Implementation for screen shake
    const shake = {
      intensity,
      duration,
      elapsed: 0,
      offset: { x: 0, y: 0, z: 0 }
    };

    const updateShake = (deltaTime: number) => {
      shake.elapsed += deltaTime;
      if (shake.elapsed < shake.duration) {
        const progress = shake.elapsed / shake.duration;
        const currentIntensity = shake.intensity * (1 - progress);
        shake.offset.x = (Math.random() - 0.5) * currentIntensity;
        shake.offset.y = (Math.random() - 0.5) * currentIntensity;
        shake.offset.z = (Math.random() - 0.5) * currentIntensity;
        
        this.camera.position.x += shake.offset.x;
        this.camera.position.y += shake.offset.y;
        this.camera.position.z += shake.offset.z;
      }
    };

    return updateShake;
  }

  /**
   * Smooth camera transition
   */
  transitionTo(newTarget: { x: number; y: number; z: number }, newOffset: { x: number; y: number; z: number }, duration: number = 1.0) {
    const startTarget = { ...this.target };
    const startOffset = { ...this.offset };
    let elapsed = 0;

    const update = (deltaTime: number) => {
      elapsed += deltaTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      this.target.x = startTarget.x + (newTarget.x - startTarget.x) * ease;
      this.target.y = startTarget.y + (newTarget.y - startTarget.y) * ease;
      this.target.z = startTarget.z + (newTarget.z - startTarget.z) * ease;

      this.offset.x = startOffset.x + (newOffset.x - startOffset.x) * ease;
      this.offset.y = startOffset.y + (newOffset.y - startOffset.y) * ease;
      this.offset.z = startOffset.z + (newOffset.z - startOffset.z) * ease;
    };

    return update;
  }
}
