/**
 * Inverse Kinematics (IK) System
 * Provides natural limb movement and foot placement
 */

export interface IKTarget {
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
}

export interface IKBone {
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  length: number;
  children?: IKBone[];
}

/**
 * IK Solver using CCD (Cyclic Coordinate Descent) algorithm
 */
export class IKSystem {
  private bones: IKBone[] = [];
  private maxIterations: number = 10;
  private tolerance: number = 0.01;

  /**
   * Add bone chain for IK solving
   */
  addBoneChain(bones: IKBone[]): void {
    this.bones = bones;
  }

  /**
   * Solve IK to reach target position
   * Returns updated bone rotations
   */
  solve(target: IKTarget, effector: number = this.bones.length - 1): IKBone[] {
    if (this.bones.length === 0) return [];

    const result = JSON.parse(JSON.stringify(this.bones)) as IKBone[]; // Deep copy
    
    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      // Get effector position
      const effectorPos = this.getBonePosition(result, effector);
      
      // Check if close enough
      const distance = Math.sqrt(
        Math.pow(target.position.x - effectorPos.x, 2) +
        Math.pow(target.position.y - effectorPos.y, 2) +
        Math.pow(target.position.z - effectorPos.z, 2)
      );

      if (distance < this.tolerance) {
        break;
      }

      // CCD algorithm: rotate each bone towards target
      for (let i = effector; i >= 0; i--) {
        const bonePos = this.getBonePosition(result, i);
        const toEffector = {
          x: effectorPos.x - bonePos.x,
          y: effectorPos.y - bonePos.y,
          z: effectorPos.z - bonePos.z
        };
        const toTarget = {
          x: target.position.x - bonePos.x,
          y: target.position.y - bonePos.y,
          z: target.position.z - bonePos.z
        };

        // Calculate rotation needed
        const rotation = this.calculateRotation(toEffector, toTarget);
        
        // Apply rotation to bone
        result[i].rotation.x += rotation.x;
        result[i].rotation.y += rotation.y;
        result[i].rotation.z += rotation.z;

        // Update effector position after rotation
        effectorPos = this.getBonePosition(result, effector);
      }
    }

    return result;
  }

  /**
   * Get world position of bone
   */
  private getBonePosition(bones: IKBone[], index: number): { x: number; y: number; z: number } {
    if (index < 0 || index >= bones.length) {
      return { x: 0, y: 0, z: 0 };
    }

    let position = { x: 0, y: 0, z: 0 };
    
    for (let i = 0; i <= index; i++) {
      const bone = bones[i];
      
      // Apply rotation
      const rotatedDirection = this.rotateVector(
        { x: 0, y: bone.length, z: 0 },
        bone.rotation
      );
      
      position.x += bone.position.x + rotatedDirection.x;
      position.y += bone.position.y + rotatedDirection.y;
      position.z += bone.position.z + rotatedDirection.z;
    }

    return position;
  }

  /**
   * Calculate rotation between two vectors
   */
  private calculateRotation(from: { x: number; y: number; z: number }, to: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
    // Normalize vectors
    const fromLen = Math.sqrt(from.x ** 2 + from.y ** 2 + from.z ** 2);
    const toLen = Math.sqrt(to.x ** 2 + to.y ** 2 + to.z ** 2);
    
    if (fromLen === 0 || toLen === 0) {
      return { x: 0, y: 0, z: 0 };
    }

    const fromNorm = { x: from.x / fromLen, y: from.y / fromLen, z: from.z / fromLen };
    const toNorm = { x: to.x / toLen, y: to.y / toLen, z: to.z / toLen };

    // Cross product for rotation axis
    const cross = {
      x: fromNorm.y * toNorm.z - fromNorm.z * toNorm.y,
      y: fromNorm.z * toNorm.x - fromNorm.x * toNorm.z,
      z: fromNorm.x * toNorm.y - fromNorm.y * toNorm.x
    };

    // Dot product for angle
    const dot = fromNorm.x * toNorm.x + fromNorm.y * toNorm.y + fromNorm.z * toNorm.z;
    const angle = Math.acos(Math.max(-1, Math.min(1, dot)));

    // Convert to Euler angles (simplified)
    const factor = angle * 0.1; // Damping factor
    
    return {
      x: cross.x * factor,
      y: cross.y * factor,
      z: cross.z * factor
    };
  }

  /**
   * Rotate vector by Euler angles
   */
  private rotateVector(vector: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
    // Simplified rotation (full implementation would use quaternions or rotation matrices)
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    const cosZ = Math.cos(rotation.z);
    const sinZ = Math.sin(rotation.z);

    // Rotate around X
    let y = vector.y * cosX - vector.z * sinX;
    let z = vector.y * sinX + vector.z * cosX;
    
    // Rotate around Y
    let x = vector.x * cosY + z * sinY;
    z = -vector.x * sinY + z * cosY;
    
    // Rotate around Z
    const x2 = x * cosZ - y * sinZ;
    y = x * sinZ + y * cosZ;
    x = x2;

    return { x, y, z };
  }
}

/**
 * Helper to apply IK to Three.js bones
 */
export function applyIKToThreeJS(
  bones: IKBone[],
  targetPosition: { x: number; y: number; z: number },
  threeJSMeshes: Map<string, any>
): void {
  const ikSystem = new IKSystem();
  ikSystem.addBoneChain(bones);
  
  const result = ikSystem.solve({ position: targetPosition });
  
  // Apply rotations to Three.js meshes
  result.forEach((bone, index) => {
    const mesh = threeJSMeshes.get(bone.name);
    if (mesh) {
      mesh.rotation.x = bone.rotation.x;
      mesh.rotation.y = bone.rotation.y;
      mesh.rotation.z = bone.rotation.z;
    }
  });
}
