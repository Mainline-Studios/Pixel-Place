/**
 * Part - Roblox-style Part (like a block/box)
 */

import { Entity } from './Entity';

export type PartShape = 'Block' | 'Sphere' | 'Cylinder' | 'Wedge';
export type MaterialType = 'Plastic' | 'Metal' | 'Wood' | 'Grass' | 'Concrete' | 'Glass';

export class Part extends Entity {
  private size: { x: number; y: number; z: number } = { x: 1, y: 1, z: 1 };
  private shape: PartShape = 'Block';
  private color: { r: number; g: number; b: number } = { r: 1, g: 1, b: 1 };
  private material: MaterialType = 'Plastic';
  private topSurface: string = 'Smooth';
  private bottomSurface: string = 'Smooth';

  /**
   * Set size (like Roblox Part.Size)
   */
  setSize(x: number, y: number, z: number): void {
    this.size = { x, y, z };
  }

  /**
   * Get size
   */
  getSize(): { x: number; y: number; z: number } {
    return { ...this.size };
  }

  /**
   * Set shape
   */
  setShape(shape: PartShape): void {
    this.shape = shape;
  }

  /**
   * Get shape
   */
  getShape(): PartShape {
    return this.shape;
  }

  /**
   * Set color (hex string like '#ff0000' or RGB 0-1)
   */
  setColor(color: string | { r: number; g: number; b: number }): void {
    if (typeof color === 'string') {
      const hex = color.replace('#', '');
      this.color = {
        r: parseInt(hex.substring(0, 2), 16) / 255,
        g: parseInt(hex.substring(2, 4), 16) / 255,
        b: parseInt(hex.substring(4, 6), 16) / 255
      };
    } else {
      this.color = { ...color };
    }
  }

  /**
   * Get color
   */
  getColor(): { r: number; g: number; b: number } {
    return { ...this.color };
  }

  /**
   * Set material
   */
  setMaterial(material: MaterialType): void {
    this.material = material;
  }

  /**
   * Get material
   */
  getMaterial(): MaterialType {
    return this.material;
  }

  /**
   * Get mesh data for rendering
   */
  getMeshData(): { vertices: Float32Array; colors: Float32Array; indices: Uint16Array } | null {
    if (this.shape === 'Block') {
      return this.getBlockMeshData();
    } else if (this.shape === 'Sphere') {
      return this.getSphereMeshData();
    } else if (this.shape === 'Cylinder') {
      return this.getCylinderMeshData();
    }
    
    return this.getBlockMeshData(); // Default to block
  }

  private getBlockMeshData(): { vertices: Float32Array; colors: Float32Array; indices: Uint16Array } {
    const w = this.size.x / 2;
    const h = this.size.y / 2;
    const d = this.size.z / 2;
    
    // 8 vertices of a box
    const vertices = new Float32Array([
      // Front face
      -w, -h,  d,  w, -h,  d,  w,  h,  d, -w,  h,  d,
      // Back face
      -w, -h, -d, -w,  h, -d,  w,  h, -d,  w, -h, -d,
      // Top face
      -w,  h, -d, -w,  h,  d,  w,  h,  d,  w,  h, -d,
      // Bottom face
      -w, -h, -d,  w, -h, -d,  w, -h,  d, -w, -h,  d,
      // Right face
      w, -h, -d,  w,  h, -d,  w,  h,  d,  w, -h,  d,
      // Left face
      -w, -h, -d, -w, -h,  d, -w,  h,  d, -w,  h, -d,
    ]);
    
    // Colors (same color for all vertices)
    const colors = new Float32Array(vertices.length);
    for (let i = 0; i < vertices.length; i += 3) {
      colors[i] = this.color.r;
      colors[i + 1] = this.color.g;
      colors[i + 2] = this.color.b;
    }
    
    // Indices for 12 triangles (2 per face)
    const indices = new Uint16Array([
      // Front face
      0, 1, 2,  0, 2, 3,
      // Back face
      4, 5, 6,  4, 6, 7,
      // Top face
      8, 9, 10,  8, 10, 11,
      // Bottom face
      12, 13, 14,  12, 14, 15,
      // Right face
      16, 17, 18,  16, 18, 19,
      // Left face
      20, 21, 22,  20, 22, 23,
    ]);
    
    return { vertices, colors, indices };
  }

  private getSphereMeshData(): { vertices: Float32Array; colors: Float32Array; indices: Uint16Array } {
    // Simple sphere approximation (icosahedron-based)
    const radius = Math.max(this.size.x, this.size.y, this.size.z) / 2;
    const segments = 16;
    
    const vertices: number[] = [];
    const indices: number[] = [];
    
    // Generate sphere vertices
    for (let lat = 0; lat <= segments; lat++) {
      const theta = (lat * Math.PI) / segments;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      
      for (let lon = 0; lon <= segments; lon++) {
        const phi = (lon * 2 * Math.PI) / segments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        
        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;
        
        vertices.push(x * radius, y * radius, z * radius);
      }
    }
    
    // Generate indices
    for (let lat = 0; lat < segments; lat++) {
      for (let lon = 0; lon < segments; lon++) {
        const first = lat * (segments + 1) + lon;
        const second = first + segments + 1;
        
        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }
    
    const verticesArray = new Float32Array(vertices);
    const colorsArray = new Float32Array(vertices.length);
    for (let i = 0; i < vertices.length; i += 3) {
      colorsArray[i] = this.color.r;
      colorsArray[i + 1] = this.color.g;
      colorsArray[i + 2] = this.color.b;
    }
    
    return {
      vertices: verticesArray,
      colors: colorsArray,
      indices: new Uint16Array(indices)
    };
  }

  private getCylinderMeshData(): { vertices: Float32Array; colors: Float32Array; indices: Uint16Array } {
    const radius = Math.max(this.size.x, this.size.z) / 2;
    const height = this.size.y;
    const segments = 32;
    
    const vertices: number[] = [];
    const indices: number[] = [];
    
    // Generate cylinder vertices
    for (let i = 0; i <= segments; i++) {
      const angle = (i * 2 * Math.PI) / segments;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Top vertex
      vertices.push(x, height / 2, z);
      // Bottom vertex
      vertices.push(x, -height / 2, z);
    }
    
    // Generate side faces
    for (let i = 0; i < segments; i++) {
      const base = i * 2;
      indices.push(base, base + 1, base + 2);
      indices.push(base + 1, base + 3, base + 2);
    }
    
    // Generate top and bottom caps
    // (Simplified - could be improved)
    
    const verticesArray = new Float32Array(vertices);
    const colorsArray = new Float32Array(vertices.length);
    for (let i = 0; i < vertices.length; i += 3) {
      colorsArray[i] = this.color.r;
      colorsArray[i + 1] = this.color.g;
      colorsArray[i + 2] = this.color.b;
    }
    
    return {
      vertices: verticesArray,
      colors: colorsArray,
      indices: new Uint16Array(indices)
    };
  }
}








