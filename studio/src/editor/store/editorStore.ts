import { create } from "zustand";
import type { GizmoMode } from "@/engine/gizmos/GizmoController";
import type { TerrainBiome } from "@/engine/terrain/TerrainManager";

/**
 * Lightweight UI state shared across docked panels.
 * Heavy scene data stays inside the engine; this store only tracks selection and refresh signals.
 */
type EditorState = {
  selectedId: string | null;
  isPlaying: boolean;
  sceneRevision: number;
  gizmoMode: GizmoMode;
  snapGrid: number;
  lightingPreset: "day" | "night";
  terrainBrush: "raise" | "lower" | "flatten" | "paint";
  terrainPaintLayer: 0 | 1 | 2;
  terrainBiome: TerrainBiome;
  terrainBrushRadius: number;
  terrainBrushStrength: number;
  setSelectedId: (id: string | null) => void;
  setPlaying: (playing: boolean) => void;
  bumpScene: () => void;
  setGizmoMode: (mode: GizmoMode) => void;
  setSnapGrid: (size: number) => void;
  setLightingPreset: (preset: "day" | "night") => void;
  setTerrainBrush: (mode: "raise" | "lower" | "flatten" | "paint") => void;
  setTerrainPaintLayer: (layer: 0 | 1 | 2) => void;
  setTerrainBiome: (biome: TerrainBiome) => void;
  setTerrainBrushRadius: (value: number) => void;
  setTerrainBrushStrength: (value: number) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  selectedId: null,
  isPlaying: false,
  sceneRevision: 0,
  gizmoMode: "translate",
  snapGrid: 0,
  lightingPreset: "day",
  terrainBrush: "raise",
  terrainPaintLayer: 0,
  terrainBiome: "forest",
  terrainBrushRadius: 3,
  terrainBrushStrength: 1,
  setSelectedId: (id) => set({ selectedId: id }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  bumpScene: () => set((state) => ({ sceneRevision: state.sceneRevision + 1 })),
  setGizmoMode: (mode) => set({ gizmoMode: mode }),
  setSnapGrid: (size) => set({ snapGrid: size }),
  setLightingPreset: (preset) => set({ lightingPreset: preset }),
  setTerrainBrush: (mode) => set({ terrainBrush: mode }),
  setTerrainPaintLayer: (layer) => set({ terrainPaintLayer: layer }),
  setTerrainBiome: (biome) => set({ terrainBiome: biome }),
  setTerrainBrushRadius: (value) => set({ terrainBrushRadius: value }),
  setTerrainBrushStrength: (value) => set({ terrainBrushStrength: value }),
}));
