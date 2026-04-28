/**
 * Pixel Place Game Engine
 * Main entry point - exports all public APIs
 */

// Core
export { Engine } from './core/Engine';
export { Scene } from './core/Scene';
export { Renderer } from './core/Renderer';

// Entities
export { Entity } from './entities/Entity';
export { Part } from './entities/Part';

// Camera
export { Camera } from './camera/Camera';

// Import classes for namespace object
import { Engine } from './core/Engine';
import { Scene } from './core/Scene';
import { Renderer } from './core/Renderer';
import { Entity } from './entities/Entity';
import { Part } from './entities/Part';
import { Camera } from './camera/Camera';
// Create a namespace-like object for easy access
export const PixelEngine = {
  Engine,
  Scene,
  Renderer,
  Entity,
  Part,
  Camera};

// Default export
export default PixelEngine;

// Unified texture pipeline (Three.js + naming + lazy load) — see `public/assets/textures/manifest.json`
export {
  TEXTURE_STANDARD_SIZE,
  TEXTURE_HERO_SIZE,
  TEXTURES_BASE_PATH,
  TEXTURE_FALLBACK_URL,
  pixelPlaceTexturePath,
  loadWhenIdle,
  loadTextureWhenVisible,
  applyPixelPlaceTextureSettings,
  PixelPlaceTextureLoader,
  loadPixelPlaceTexture,
  getTextureDeviceProfile,
  loadOptimizedTexture,
  buildAtlasFromUrls,
  disposeOptimizedTexture,
  getGlobalGpuTextureMemoryTracker,
  getGlobalPrioritizedTextureQueue,
  estimateThreeTextureBytes,
} from '../textures';
export type {
  TextureCategory,
  TextureTier,
  TextureRole,
  LoadPixelPlaceTextureOptions,
  OptimizedTextureLoadOptions,
  AtlasUrlEntry,
  BuildAtlasOptions,
  TextureDeviceProfile,
} from '../textures';

// Procedural low-poly props (trees, buildings, furniture, interactables) + shared materials + LOD
export {
  createGameProp,
  disposeGameProp,
  createPropLOD,
  getSharedPropMaterial,
  setSharedPropMaterialMap,
  clearSharedPropMaterialCache,
  DEFAULT_PROP_LOD_THRESHOLDS,
  createSeededRng,
  variationSlotSeed,
  hashStringToUint32,
  createVariedPropMaterial,
  createAlbedoOverlayTexture,
  createRoughnessOverlayTexture,
} from '../props';
export type {
  CreateGamePropSpec,
  PropCategory,
  PropFactoryResult,
  PropLODThresholds,
  PropMaterialKey,
  FurnitureVariant,
  InteractiveVariant,
  PropVariationSpec,
  PropVariationContext,
  VariedMaterialOptions,
  BuildingStyle,
  StarterPackPropPreset,
} from '../props';

export {
  STARTER_PACK_VERSION,
  STARTER_ENV_TEXTURE_IDS,
  starterEnvAlbedoUrl,
  getStarterDayOneSkins,
  STARTER_PROP_15,
  STARTER_BUILDINGS_3,
} from '../starterPack';
export type { StarterEnvTextureId } from '../starterPack';

// Global Three.js PBR lighting (sun + hemi + ambient), time-of-day, soft shadows, standard materials
export {
  GlobalPBRLighting,
  configureRendererPBRShadows,
  configureSunShadowCamera,
  computeTimeOfDayState,
  applyTimeOfDayToLights,
  createGamePBRMaterial,
  tuneGamePBRMaterialTextures,
  loadMapsAndCreatePBRMaterial,
} from '../rendering';
export type {
  GlobalLightingOptions,
  TimeOfDayVisualState,
  PBRShadowOptions,
  CreateGamePBRMaterialOptions,
  GamePBRTextureMaps,
} from '../rendering';

// User model import pipeline (GLB/FBX) + validation + game asset registry
export {
  AssetValidationError,
  DEFAULT_IMPORT_LIMITS,
  assertSupportedModelFilename,
  collectMaterialTextures,
  countTriangles,
  validateImportedModel,
  normalizeImportedModelRoot,
  setupImportedMaterials,
  loadFBXSceneFromArrayBuffer,
  loadGLTFSceneFromArrayBuffer,
  loadModelRootFromArrayBuffer,
  runGameAssetImportPipeline,
  reprocessImportedRoot,
  GameAssetRegistry,
  gameAssetRegistry,
  GAME_ASSET_MANIFEST_STORAGE_KEY,
  GAME_ASSET_IDB_NAME,
  GAME_ASSET_IDB_STORE,
  AssetModerationError,
  getVerifiedAssetsOnlyMode,
  setVerifiedAssetsOnlyMode,
  isUserAssetApprovedForVerifiedMode,
} from '../assets';
export type {
  ImportValidationLimits,
  NormalizeResult,
  GameAssetImportPipelineOptions,
  GameAssetImportReport,
  GameAssetImportResult,
  GameRegistryAssetFormat,
  GameRegistryAssetRecord,
  GameRegistryModeration,
} from '../assets';








