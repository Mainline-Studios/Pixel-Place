import type { ProceduralPreset } from "./proceduralTextures";
import type { BuiltInShaderId } from "@/engine/shaders/ShaderManager";

/**
 * Logical surface description serialized with each {@link MeshRenderer}.
 */
export type SurfaceMode = "standard" | "procedural" | "shader";

export type SurfaceSettings = {
  mode: SurfaceMode;
  /** Optional data URL or public path for image maps. */
  mapDataUrl: string | null;
  tilingU: number;
  tilingV: number;
  offsetU: number;
  offsetV: number;
  /** Rotation in radians around the UV origin. */
  rotation: number;
  proceduralPreset: ProceduralPreset;
  shaderId: BuiltInShaderId;
};

export function createDefaultSurface(): SurfaceSettings {
  return {
    mode: "standard",
    mapDataUrl: null,
    tilingU: 1,
    tilingV: 1,
    offsetU: 0,
    offsetV: 0,
    rotation: 0,
    proceduralPreset: "grass",
    shaderId: "basicColor",
  };
}
