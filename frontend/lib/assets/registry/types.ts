export type GameRegistryAssetFormat = 'glb' | 'fbx';

export type GameRegistryModeration = {
  scanId: string;
  reviewStatus: 'approved' | 'pending_review' | 'rejected';
  scannedAt: number;
  aiChecked: boolean;
  /** Server scan vs local filename-only (not eligible for strict verified-only). */
  source?: 'server' | 'local_filename_only';
};

export type GameRegistryAssetRecord = {
  id: string;
  name: string;
  format: GameRegistryAssetFormat;
  importedAt: number;
  triangleCount: number;
  textureCount: number;
  maxTextureSideSeen: number;
  normalizeScale: number;
  moderation?: GameRegistryModeration;
};

export const GAME_ASSET_MANIFEST_STORAGE_KEY = 'pixelplace_game_asset_manifest_v1';
export const GAME_ASSET_IDB_NAME = 'PixelPlaceGameAssets';
export const GAME_ASSET_IDB_STORE = 'modelBuffers';
