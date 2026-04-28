import type { PrimitiveKind } from "@/engine/types";

/**
 * Declarative list of content the editor surface area can spawn.
 * Binary files live under `/public/assets`; this module is the typed index for the UI.
 */
export type AssetCatalogEntry = {
  id: string;
  label: string;
  description: string;
  kind: "primitive" | "texture";
  primitive?: PrimitiveKind;
  /** Public URL (served by Vite) for textures or future mesh imports. */
  url?: string;
};

export const ASSET_CATALOG: AssetCatalogEntry[] = [
  {
    id: "primitive-box",
    label: "Block",
    description: "Scaled cube primitive",
    kind: "primitive",
    primitive: "box",
  },
  {
    id: "primitive-sphere",
    label: "Ball",
    description: "Sphere primitive",
    kind: "primitive",
    primitive: "sphere",
  },
  {
    id: "primitive-cylinder",
    label: "Cylinder",
    description: "Rounded column primitive",
    kind: "primitive",
    primitive: "cylinder",
  },
  {
    id: "primitive-plane",
    label: "Plate",
    description: "Flat staging plane",
    kind: "primitive",
    primitive: "plane",
  },
  {
    id: "texture-grid",
    label: "Checker",
    description: "Procedural-friendly placeholder texture",
    kind: "texture",
    url: "/assets/textures/placeholder-checker.svg",
  },
];
