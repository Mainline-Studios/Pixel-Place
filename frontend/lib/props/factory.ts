import { createBuildingPropAsset, type BuildingStyle } from './buildingProp';
import { createFurniturePropAsset, type FurnitureVariant } from './furnitureProp';
import { createInteractivePropAsset, type InteractiveVariant } from './interactiveProp';
import { disposePropObject } from './lodUtils';
import { createStarterPackPropAsset, type StarterPackPropPreset } from './starterPackProps';
import { createTreePropAsset } from './treeProp';
import type { PropCategory, PropDisposeOptions, PropFactoryResult, PropLODThresholds } from './types';
import type { PropVariationSpec } from './variation';

type THREE_NS = typeof import('three');

export type CreateGamePropSpec =
  | { category: 'tree'; lod?: PropLODThresholds; variation?: PropVariationSpec }
  | {
      category: 'building';
      style?: BuildingStyle;
      lod?: PropLODThresholds;
      variation?: PropVariationSpec;
    }
  | { category: 'furniture'; variant?: FurnitureVariant; lod?: PropLODThresholds }
  | { category: 'interactive'; variant?: InteractiveVariant; lod?: PropLODThresholds }
  | { category: 'starter'; preset: StarterPackPropPreset; lod?: PropLODThresholds };

/**
 * Single entry point for stylized low-poly props with three LOD levels and shared materials.
 */
export function createGameProp(THREE: THREE_NS, spec: CreateGamePropSpec): PropFactoryResult {
  switch (spec.category) {
    case 'tree':
      return createTreePropAsset(THREE, spec.lod, spec.variation);
    case 'building':
      return createBuildingPropAsset(THREE, spec.lod, spec.variation, spec.style ?? 'cottage');
    case 'furniture':
      return createFurniturePropAsset(THREE, spec.variant ?? 'chair', spec.lod);
    case 'interactive':
      return createInteractivePropAsset(THREE, spec.variant ?? 'chest', spec.lod);
    case 'starter':
      return createStarterPackPropAsset(THREE, spec.preset, spec.lod);
    default: {
      const _x: never = spec;
      return _x;
    }
  }
}

/** Dispose geometries under this prop; shared materials are kept unless `disposeSharedMaterials`. */
export function disposeGameProp(prop: import('three').LOD, options: PropDisposeOptions = {}): void {
  disposePropObject(prop, options.disposeSharedMaterials ?? false);
}

export type { BuildingStyle } from './buildingProp';
export type { StarterPackPropPreset } from './starterPackProps';
export type { PropCategory, PropFactoryResult, FurnitureVariant, InteractiveVariant, PropVariationSpec };
