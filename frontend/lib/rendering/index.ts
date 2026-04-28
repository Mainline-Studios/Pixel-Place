export { computeTimeOfDayState, applyTimeOfDayToLights, type TimeOfDayVisualState } from './timeOfDay';

export {
  configureRendererPBRShadows,
  configureSunShadowCamera,
  type PBRShadowOptions,
} from './shadows';

export { GlobalPBRLighting, type GlobalLightingOptions } from './globalLighting';

export {
  createGamePBRMaterial,
  tuneGamePBRMaterialTextures,
  loadMapsAndCreatePBRMaterial,
  type GamePBRTextureMaps,
  type CreateGamePBRMaterialOptions,
} from './pbrMaterial';
