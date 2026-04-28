export {
  TEXTURE_STANDARD_SIZE,
  TEXTURE_HERO_SIZE,
  TEXTURES_BASE_PATH,
  TEXTURE_FALLBACK_URL,
  type TextureCategory,
  type TextureTier,
  type TextureRole,
} from './constants';

export {
  isValidTextureBaseName,
  texturePixelSize,
  pixelPlaceTexturePath,
  parseTextureFilename,
  assertValidTextureSubdir,
} from './naming';

export { loadWhenIdle, loadTextureWhenVisible, type LazyTextureOptions } from './lazyLoad';

export { createProceduralFallbackDataTexture } from './proceduralFallback';

export {
  applyPixelPlaceTextureSettings,
  PixelPlaceTextureLoader,
  loadPixelPlaceTexture,
  type LoadPixelPlaceTextureOptions,
  type PixelPlaceTextureColorMode,
} from './pixelPlaceTextureLoader';

export {
  generateTexturePrompt,
  generateTexturePromptFromPreset,
  batchGenerateTexturePrompts,
  exportTexturePromptsJSON,
  exportTexturePromptsJSONL,
  generateDefaultTexturePromptDataset,
  listPresetIds,
  PRESET_TEMPLATES,
  type TexturePromptRecord,
  type TexturePresetId,
  type LightingStyle,
  type ArtStyleHint,
} from './texturePromptGenerator';

export * from './environmentPack';

export {
  getTextureDeviceProfile,
  getGlobalGpuTextureMemoryTracker,
  getGlobalPrioritizedTextureQueue,
  loadOptimizedTexture,
  buildAtlasFromUrls,
  disposeOptimizedTexture,
  packTextureAtlas,
  atlasRectToRepeatUv,
  createScaledCanvasTexture,
  estimateTexture2DBytes,
  estimateThreeTextureBytes,
  GpuTextureMemoryTracker,
  PrioritizedTextureQueue,
  type TextureDeviceProfile,
  type OptimizedTextureLoadOptions,
  type AtlasUrlEntry,
  type BuildAtlasOptions,
  type AtlasPackResult,
  type AtlasSource,
  type AtlasUVRect,
} from './optimization';
