export type { TextureDeviceProfile, DevicePerformanceTier } from './deviceProfile';
export { getTextureDeviceProfile } from './deviceProfile';

export { estimateTexture2DBytes, estimateThreeTextureBytes } from './memoryEstimator';

export {
  GpuTextureMemoryTracker,
  getGlobalGpuTextureMemoryTracker,
  type TextureMemoryEntry,
} from './gpuMemoryTracker';

export { transcodeImageElement, pickTranscodeFormat, type TranscodeFormat, type TranscodeResult } from './compress';

export {
  packTextureAtlas,
  atlasRectToRepeatUv,
  type AtlasSource,
  type AtlasUVRect,
  type AtlasPackResult,
} from './atlas';

export { PrioritizedTextureQueue, getGlobalPrioritizedTextureQueue } from './prioritizedQueue';

export { createScaledCanvasTexture } from './scaledTexture';

export {
  loadOptimizedTexture,
  buildAtlasFromUrls,
  disposeOptimizedTexture,
  type OptimizedTextureLoadOptions,
  type AtlasUrlEntry,
  type BuildAtlasOptions,
} from './pipeline';
