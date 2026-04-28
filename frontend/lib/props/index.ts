export type {
  PropCategory,
  PropLODLevel,
  PropLODThresholds,
  PropMaterialKey,
  PropFactoryResult,
  PropDisposeOptions,
} from './types';
export { DEFAULT_PROP_LOD_THRESHOLDS, isLODObject } from './types';

export {
  getSharedPropMaterial,
  setSharedPropMaterialMap,
  clearSharedPropMaterialCache,
  listPropMaterialKeys,
} from './sharedMaterials';

export { createPropLOD, disposePropObject } from './lodUtils';

export { createTreeProp, createTreePropAsset } from './treeProp';
export {
  createBuildingProp,
  createBuildingPropAsset,
  type BuildingStyle,
} from './buildingProp';
export {
  createStarterPackProp,
  createStarterPackPropAsset,
  type StarterPackPropPreset,
} from './starterPackProps';
export {
  createChairProp,
  createTableProp,
  createFurniturePropAsset,
  type FurnitureVariant,
} from './furnitureProp';
export {
  createChestProp,
  createCrystalPedestalProp,
  createInteractivePropAsset,
  type InteractiveVariant,
} from './interactiveProp';

export {
  createGameProp,
  disposeGameProp,
  type CreateGamePropSpec,
} from './factory';

export {
  createSeededRng,
  variationSlotSeed,
  hashStringToUint32,
  createVariedPropMaterial,
  createAlbedoOverlayTexture,
  createRoughnessOverlayTexture,
} from './variation';
export type {
  PropVariationSpec,
  PropVariationContext,
  VariedMaterialOptions,
} from './variation';
