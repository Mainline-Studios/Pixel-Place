import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  MeshStandardMaterial,
} from "three";
import { layeredNoise } from "@/engine/materials/proceduralTextures";

export type TerrainBiome = "desert" | "forest" | "snow";

/**
 * Single heightfield tile with optional vertex-color biomes and sculpting buffers.
 * Mesh is regenerated when heights change (chunking can split this later for huge worlds).
 */
export class TerrainManager {
  resolution = 48;
  worldSize = 36;
  heights: Float32Array;
  /** 0 grass, 1 sand, 2 rock — used for tinting vertices. */
  splat: Uint8Array;
  mesh: Mesh;
  biome: TerrainBiome = "forest";

  constructor() {
    const count = this.resolution * this.resolution;
    this.heights = new Float32Array(count);
    this.splat = new Uint8Array(count);
    this.mesh = new Mesh(new BufferGeometry(), new MeshStandardMaterial({ vertexColors: true, flatShading: false }));
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = false;
    this.mesh.name = "Terrain";
    this.flattenHeights(0);
  }

  flattenHeights(value: number): void {
    this.heights.fill(value);
    this.rebuildMesh();
  }

  /** FBM-style height noise with biome tint on vertices. */
  generateNoise(heightScale: number, smoothness: number, scale: number, biome: TerrainBiome): void {
    this.biome = biome;
    const res = this.resolution;
    const denom = Math.max(0.0001, smoothness);
    for (let z = 0; z < res; z += 1) {
      for (let x = 0; x < res; x += 1) {
        const u = x / res;
        const v = z / res;
        const n = layeredNoise(u * scale, v * scale, biome.length * 131);
        const h = (n - 0.5) * 2 * heightScale;
        this.heights[z * res + x] = h / denom;
        this.splat[z * res + x] = n > 0.62 ? 2 : n < 0.35 ? 1 : 0;
      }
    }
    this.rebuildMesh();
  }

  /** Raises/lowers terrain in a world-space brush (approximate projection on XZ). */
  applyBrush(worldX: number, worldZ: number, radius: number, strength: number, mode: "raise" | "lower" | "flatten", targetY: number): void {
    const half = this.worldSize / 2;
    const res = this.resolution;
    for (let z = 0; z < res; z += 1) {
      for (let x = 0; x < res; x += 1) {
        const wx = (x / (res - 1)) * this.worldSize - half;
        const wz = (z / (res - 1)) * this.worldSize - half;
        const dx = wx - worldX;
        const dz = wz - worldZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > radius) continue;
        const falloff = 1 - dist / radius;
        const idx = z * res + x;
        if (mode === "raise") this.heights[idx] += strength * falloff * 0.08;
        if (mode === "lower") this.heights[idx] -= strength * falloff * 0.08;
        if (mode === "flatten") this.heights[idx] += (targetY - this.heights[idx]) * strength * falloff * 0.15;
      }
    }
    this.rebuildMesh();
  }

  paintSplat(worldX: number, worldZ: number, radius: number, layer: 0 | 1 | 2): void {
    const half = this.worldSize / 2;
    const res = this.resolution;
    for (let z = 0; z < res; z += 1) {
      for (let x = 0; x < res; x += 1) {
        const wx = (x / (res - 1)) * this.worldSize - half;
        const wz = (z / (res - 1)) * this.worldSize - half;
        const dx = wx - worldX;
        const dz = wz - worldZ;
        if (Math.sqrt(dx * dx + dz * dz) <= radius) {
          this.splat[z * res + x] = layer;
        }
      }
    }
    this.rebuildMesh();
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as MeshStandardMaterial).dispose();
  }

  /** Restores serialized heightfield data (resolution must match array length). */
  importSerialized(data: {
    resolution: number;
    worldSize: number;
    heights: number[];
    splat: number[];
    biome: TerrainBiome;
  }): void {
    this.resolution = data.resolution;
    this.worldSize = data.worldSize;
    this.biome = data.biome;
    const count = this.resolution * this.resolution;
    this.heights = new Float32Array(count);
    this.splat = new Uint8Array(count);
    for (let i = 0; i < count; i += 1) {
      this.heights[i] = data.heights[i] ?? 0;
      this.splat[i] = (data.splat[i] ?? 0) as 0 | 1 | 2;
    }
    this.rebuildMesh();
  }

  private rebuildMesh(): void {
    const res = this.resolution;
    const half = this.worldSize / 2;
    const vertexCount = res * res;
    const positions = new Float32Array(vertexCount * 3);
    const colors = new Float32Array(vertexCount * 3);
    const indices: number[] = [];

    const biomeBase =
      this.biome === "desert"
        ? new Color(0xcfa66b)
        : this.biome === "snow"
          ? new Color(0xd7ecff)
          : new Color(0x4f8f56);

    for (let z = 0; z < res; z += 1) {
      for (let x = 0; x < res; x += 1) {
        const idx = z * res + x;
        const wx = (x / (res - 1)) * this.worldSize - half;
        const wz = (z / (res - 1)) * this.worldSize - half;
        const h = this.heights[idx];
        const base = idx * 3;
        positions[base + 0] = wx;
        positions[base + 1] = h;
        positions[base + 2] = wz;

        const tint =
          this.splat[idx] === 1 ? new Color(0xdcc090) : this.splat[idx] === 2 ? new Color(0x6f7685) : biomeBase.clone();
        colors[base + 0] = tint.r;
        colors[base + 1] = tint.g;
        colors[base + 2] = tint.b;
      }
    }

    for (let z = 0; z < res - 1; z += 1) {
      for (let x = 0; x < res - 1; x += 1) {
        const a = z * res + x;
        const b = a + 1;
        const c = a + res;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    const geom = new BufferGeometry();
    geom.setAttribute("position", new BufferAttribute(positions, 3));
    geom.setAttribute("color", new BufferAttribute(colors, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    this.mesh.geometry.dispose();
    this.mesh.geometry = geom;
  }
}
