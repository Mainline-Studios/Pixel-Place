import type * as THREE from 'three';
import type { GameRegistryAssetRecord, GameRegistryModeration } from './types';
import { GAME_ASSET_MANIFEST_STORAGE_KEY } from './types';
import { idbDeleteModelBuffer, idbGetModelBuffer, idbPutModelBuffer } from './idb';
import {
  runGameAssetImportPipeline,
  reprocessImportedRoot,
  type GameAssetImportPipelineOptions,
  type GameAssetImportResult,
} from '../import/pipeline';
import { loadModelRootFromArrayBuffer } from '../import/loaders';
import { getAuthToken } from '@/lib/api';
import { getBackendToken } from '@/lib/backendSession';
import { evaluateAssetFileName } from '@/lib/moderation/assetFileRules';
import { captureTextureSnapshotsForModeration } from '../moderation/textureSnapshots';
import { submitUserAssetTextureScan, fetchUserAssetScanStatus } from '../moderation/clientScan';
import { AssetModerationError } from '../moderation/AssetModerationError';
import {
  getVerifiedAssetsOnlyMode,
  isUserAssetApprovedForVerifiedMode,
} from '../verifiedAssetsOnly';

type CachedEntry = {
  record: GameRegistryAssetRecord;
  root: THREE.Object3D;
};

function readManifest(): GameRegistryAssetRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GAME_ASSET_MANIFEST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GameRegistryAssetRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeManifest(entries: GameRegistryAssetRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GAME_ASSET_MANIFEST_STORAGE_KEY, JSON.stringify(entries));
}

function newAssetId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `asset_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry?.dispose?.();
      const mats = mesh.material;
      if (Array.isArray(mats)) mats.forEach((m) => m.dispose?.());
      else mats?.dispose?.();
    }
  });
}

async function runModerationGate(
  file: File,
  root: THREE.Object3D,
  textureCount: number
): Promise<GameRegistryModeration> {
  const token = getBackendToken() || getAuthToken();

  if (textureCount > 0) {
    if (!token) {
      throw new AssetModerationError(
        'Sign in with an account that has a session token to import models that include textures. Textures are reviewed for safety before use.',
        'login_required'
      );
    }
    const snapshots = await captureTextureSnapshotsForModeration(root);
    if (snapshots.length !== textureCount) {
      throw new AssetModerationError(
        'Could not capture all textures for moderation.',
        'scan_failed',
        'count_mismatch'
      );
    }
    const scan = await submitUserAssetTextureScan({
      fileName: file.name,
      textureCountDeclared: textureCount,
      snapshots,
    });
    if (!scan.ok) {
      const code =
        scan.error === 'moderation_unavailable' ? 'moderation_unavailable' : 'scan_rejected';
      throw new AssetModerationError(
        scan.detail ? `${scan.error}: ${scan.detail}` : scan.error,
        code,
        scan.detail ?? null
      );
    }
    return {
      scanId: scan.scanId,
      reviewStatus: scan.reviewStatus,
      scannedAt: Date.now(),
      aiChecked: scan.aiChecked,
      source: 'server',
    };
  }

  if (token) {
    const scan = await submitUserAssetTextureScan({
      fileName: file.name,
      textureCountDeclared: 0,
      snapshots: [],
    });
    if (!scan.ok) {
      const code =
        scan.error === 'moderation_unavailable' ? 'moderation_unavailable' : 'scan_rejected';
      throw new AssetModerationError(
        scan.detail ? `${scan.error}: ${scan.detail}` : scan.error,
        code,
        scan.detail ?? null
      );
    }
    return {
      scanId: scan.scanId,
      reviewStatus: scan.reviewStatus,
      scannedAt: Date.now(),
      aiChecked: false,
      source: 'server',
    };
  }

  return {
    scanId: '',
    reviewStatus: 'approved',
    scannedAt: Date.now(),
    aiChecked: false,
    source: 'local_filename_only',
  };
}

/**
 * Browser-side registry: manifest in localStorage, binaries in IndexedDB, processed graphs in memory.
 */
export class GameAssetRegistry {
  private static instance: GameAssetRegistry | null = null;

  private readonly cache = new Map<string, CachedEntry>();

  static get(): GameAssetRegistry {
    if (!GameAssetRegistry.instance) GameAssetRegistry.instance = new GameAssetRegistry();
    return GameAssetRegistry.instance;
  }

  list(): GameRegistryAssetRecord[] {
    return readManifest();
  }

  /** When “verified assets only” is on, only server-approved imports (not legacy / local-only). */
  listForVerifiedMode(): GameRegistryAssetRecord[] {
    const all = readManifest();
    if (!getVerifiedAssetsOnlyMode()) return all;
    return all.filter(isUserAssetApprovedForVerifiedMode);
  }

  getCachedRoot(id: string): THREE.Object3D | undefined {
    if (getVerifiedAssetsOnlyMode()) {
      const rec = readManifest().find((r) => r.id === id);
      if (rec && !isUserAssetApprovedForVerifiedMode(rec)) return undefined;
    }
    return this.cache.get(id)?.root;
  }

  cloneForScene(id: string): THREE.Object3D | undefined {
    const root = this.getCachedRoot(id);
    return root ? root.clone(true) : undefined;
  }

  patchManifestRecord(id: string, patch: Partial<GameRegistryAssetRecord>): void {
    const manifest = readManifest();
    const i = manifest.findIndex((r) => r.id === id);
    if (i < 0) return;
    manifest[i] = { ...manifest[i]!, ...patch };
    writeManifest(manifest);
    const hit = this.cache.get(id);
    if (hit) hit.record = { ...hit.record, ...patch };
  }

  /** Pull `review_status` from Firestore for assets created with a server `scanId`. */
  async refreshModerationStatus(assetId: string): Promise<boolean> {
    const rec = readManifest().find((r) => r.id === assetId);
    if (!rec?.moderation?.scanId) return false;
    const st = await fetchUserAssetScanStatus(rec.moderation.scanId);
    if (!st?.reviewStatus) return false;
    const reviewStatus = st.reviewStatus as GameRegistryModeration['reviewStatus'];
    this.patchManifestRecord(assetId, {
      moderation: { ...rec.moderation, reviewStatus },
    });
    return true;
  }

  /**
   * Import file through the pipeline, moderation gate, validate, persist buffer + manifest, cache processed root.
   */
  async importAndRegister(
    THREE: typeof import('three'),
    file: File,
    options: GameAssetImportPipelineOptions & { persist?: boolean } = {}
  ): Promise<GameAssetImportResult & { id: string; record: GameRegistryAssetRecord }> {
    const persist = options.persist !== false;

    const nameRules = evaluateAssetFileName(file.name);
    if (!nameRules.ok) {
      throw new AssetModerationError(
        'This file name is not allowed on Pixel Place.',
        'filename_blocked',
        nameRules.reason
      );
    }

    const { root, report, buffer } = await runGameAssetImportPipeline(THREE, file, options);

    let moderation: GameRegistryModeration;
    try {
      moderation = await runModerationGate(file, root, report.textureCount);
    } catch (e) {
      disposeObject3D(root);
      throw e;
    }

    const id = newAssetId();
    const record: GameRegistryAssetRecord = {
      id,
      name: report.fileName,
      format: report.format,
      importedAt: Date.now(),
      triangleCount: report.triangleCount,
      textureCount: report.textureCount,
      maxTextureSideSeen: report.maxTextureSideSeen,
      normalizeScale: report.normalizeScale,
      moderation,
    };

    if (persist) {
      await idbPutModelBuffer(id, buffer);
      const manifest = readManifest();
      manifest.push(record);
      writeManifest(manifest);
    }

    this.cache.set(id, { record, root });

    return { id, record, root, report, buffer };
  }

  async remove(id: string): Promise<void> {
    const entry = this.cache.get(id);
    if (entry) {
      disposeObject3D(entry.root);
      this.cache.delete(id);
    }
    await idbDeleteModelBuffer(id);
    const manifest = readManifest().filter((r) => r.id !== id);
    writeManifest(manifest);
  }

  async hydrate(
    THREE: typeof import('three'),
    options: GameAssetImportPipelineOptions = {}
  ): Promise<void> {
    const manifest = readManifest();
    for (const record of manifest) {
      if (this.cache.has(record.id)) continue;
      if (getVerifiedAssetsOnlyMode() && !isUserAssetApprovedForVerifiedMode(record)) continue;
      const buffer = await idbGetModelBuffer(record.id);
      if (!buffer) continue;
      const root = await loadModelRootFromArrayBuffer(buffer, record.format);
      const { root: processed } = reprocessImportedRoot(THREE, root, record.name, buffer, options);
      this.cache.set(record.id, { record, root: processed });
    }
  }

  clearCacheOnly(): void {
    for (const [, e] of this.cache) disposeObject3D(e.root);
    this.cache.clear();
  }
}

export const gameAssetRegistry = GameAssetRegistry.get();
