/**
 * Cloth Physics Simulation
 * Provides realistic cloth/hair/accessory movement
 */

export interface ClothParticle {
  position: { x: number; y: number; z: number };
  previousPosition: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  fixed: boolean; // Fixed particles don't move (e.g., attached to body)
  mass: number;
}

export interface ClothConstraint {
  particleA: number;
  particleB: number;
  restLength: number; // Rest length of constraint
}

export class ClothPhysics {
  private particles: ClothParticle[] = [];
  private constraints: ClothConstraint[] = [];
  private gravity: { x: number; y: number; z: number } = { x: 0, y: -9.82, z: 0 };
  private damping: number = 0.98; // Air resistance
  private stiffness: number = 0.9; // Constraint stiffness (0-1)

  /**
   * Initialize cloth grid
   */
  initializeCloth(
    width: number,
    height: number,
    segments: { x: number; y: number },
    fixedEdges: string[] = ['top'] // Which edges are fixed
  ): void {
    this.particles = [];
    this.constraints = [];

    const spacingX = width / segments.x;
    const spacingY = height / segments.y;

    // Create particles in grid
    for (let y = 0; y <= segments.y; y++) {
      for (let x = 0; x <= segments.x; x++) {
        const isFixed = 
          (fixedEdges.includes('top') && y === 0) ||
          (fixedEdges.includes('bottom') && y === segments.y) ||
          (fixedEdges.includes('left') && x === 0) ||
          (fixedEdges.includes('right') && x === segments.x);

        const particle: ClothParticle = {
          position: {
            x: (x - segments.x / 2) * spacingX,
            y: 0,
            z: (y - segments.y / 2) * spacingY
          },
          previousPosition: {
            x: (x - segments.x / 2) * spacingX,
            y: 0,
            z: (y - segments.y / 2) * spacingY
          },
          velocity: { x: 0, y: 0, z: 0 },
          fixed: isFixed,
          mass: 1.0
        };

        this.particles.push(particle);
      }
    }

    // Create constraints (springs between adjacent particles)
    for (let y = 0; y <= segments.y; y++) {
      for (let x = 0; x <= segments.x; x++) {
        const index = y * (segments.x + 1) + x;

        // Horizontal constraints
        if (x < segments.x) {
          this.constraints.push({
            particleA: index,
            particleB: index + 1,
            restLength: spacingX
          });
        }

        // Vertical constraints
        if (y < segments.y) {
          this.constraints.push({
            particleA: index,
            particleB: index + (segments.x + 1),
            restLength: spacingY
          });
        }

        // Diagonal constraints (for stability)
        if (x < segments.x && y < segments.y) {
          const diagonalLength = Math.sqrt(spacingX ** 2 + spacingY ** 2);
          this.constraints.push({
            particleA: index,
            particleB: index + (segments.x + 1) + 1,
            restLength: diagonalLength
          });
        }
      }
    }
  }

  /**
   * Update cloth simulation
   */
  update(deltaTime: number): void {
    // Verlet integration for movement
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      if (particle.fixed) {
        particle.previousPosition = { ...particle.position };
        continue;
      }

      // Calculate velocity from position difference
      particle.velocity = {
        x: (particle.position.x - particle.previousPosition.x) * this.damping,
        y: (particle.position.y - particle.previousPosition.y) * this.damping,
        z: (particle.position.z - particle.previousPosition.z) * this.damping
      };

      // Apply gravity
      particle.velocity.x += this.gravity.x * deltaTime;
      particle.velocity.y += this.gravity.y * deltaTime;
      particle.velocity.z += this.gravity.z * deltaTime;

      // Update position
      const tempPos = { ...particle.position };
      particle.position.x += particle.velocity.x * deltaTime;
      particle.position.y += particle.velocity.y * deltaTime;
      particle.position.z += particle.velocity.z * deltaTime;
      particle.previousPosition = tempPos;
    }

    // Solve constraints (multiple iterations for stability)
    const iterations = 3;
    for (let iter = 0; iter < iterations; iter++) {
      for (const constraint of this.constraints) {
        const particleA = this.particles[constraint.particleA];
        const particleB = this.particles[constraint.particleB];

        // Calculate current distance
        const dx = particleB.position.x - particleA.position.x;
        const dy = particleB.position.y - particleA.position.y;
        const dz = particleB.position.z - particleA.position.z;
        const distance = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);

        if (distance === 0) continue;

        // Calculate difference from rest length
        const difference = distance - constraint.restLength;
        const halfDifference = difference * 0.5;

        // Normalize direction
        const invDistance = 1 / distance;
        const directionX = dx * invDistance;
        const directionY = dy * invDistance;
        const directionZ = dz * invDistance;

        // Apply correction (stiffness controls how much)
        const correction = halfDifference * this.stiffness;

        if (!particleA.fixed) {
          particleA.position.x += directionX * correction;
          particleA.position.y += directionY * correction;
          particleA.position.z += directionZ * correction;
        }

        if (!particleB.fixed) {
          particleB.position.x -= directionX * correction;
          particleB.position.y -= directionY * correction;
          particleB.position.z -= directionZ * correction;
        }
      }
    }
  }

  /**
   * Get particle positions for rendering
   */
  getParticlePositions(): { x: number; y: number; z: number }[] {
    return this.particles.map(p => ({ ...p.position }));
  }

  /**
   * Apply external force (e.g., wind, collision)
   */
  applyForce(particleIndex: number, force: { x: number; y: number; z: number }): void {
    if (particleIndex >= 0 && particleIndex < this.particles.length) {
      const particle = this.particles[particleIndex];
      if (!particle.fixed) {
        particle.velocity.x += force.x / particle.mass;
        particle.velocity.y += force.y / particle.mass;
        particle.velocity.z += force.z / particle.mass;
      }
    }
  }

  /**
   * Set particle position (for attaching to moving body parts)
   */
  setParticlePosition(particleIndex: number, position: { x: number; y: number; z: number }): void {
    if (particleIndex >= 0 && particleIndex < this.particles.length) {
      const particle = this.particles[particleIndex];
      if (particle.fixed) {
        particle.position = { ...position };
        particle.previousPosition = { ...position };
      }
    }
  }
}
