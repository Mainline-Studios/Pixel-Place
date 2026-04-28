import type { PrimitiveKind } from "./types";
import { createDefaultSurface, type SurfaceSettings } from "./materials/surfaceTypes";

export type MeshSourceKind = "primitive" | "model";

/**
 * Describes how a {@link GameObject} should be drawn.
 * The engine owns the actual Three.js `Mesh`; this component is the authoritative config.
 */
export class MeshRenderer {
  /** When false, the object participates in the hierarchy but renders nothing. */
  enabled = true;

  /** Use built-in {@link PrimitiveBuilder} shapes or load a GLTF/GLB URL / data URL. */
  source: MeshSourceKind = "primitive";

  primitive: PrimitiveKind = "box";

  /** When `source === "model"`, this should be an http(s) URL, `/path`, or `data:...` GLB. */
  modelUrl: string | null = null;

  /** Hex color string (e.g. `#4a90d9`) used by the standard material path. */
  color = "#6b8cff";

  /** Primitive size or uniform scale for imported models. */
  size = 1;

  /** Extended material configuration (textures, procedural canvases, shader templates). */
  surface: SurfaceSettings = createDefaultSurface();
}
