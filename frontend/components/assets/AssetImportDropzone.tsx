'use client';

import * as THREE from 'three';
import { useCallback, useState } from 'react';
import {
  gameAssetRegistry,
  AssetValidationError,
  AssetModerationError,
  type GameRegistryAssetRecord,
} from '@/lib/assets';

export type AssetImportDropzoneProps = {
  /** Optional WebGL renderer (anisotropy / caps for texture setup). */
  renderer?: THREE.WebGLRenderer;
  className?: string;
  disabled?: boolean;
  /** Persist to IndexedDB + manifest (default true). */
  persist?: boolean;
  onImported?: (payload: {
    id: string;
    record: GameRegistryAssetRecord;
    root: THREE.Object3D;
  }) => void;
  onError?: (err: Error) => void;
};

export function AssetImportDropzone({
  renderer,
  className,
  disabled,
  persist = true,
  onImported,
  onError,
}: AssetImportDropzoneProps) {
  const [busy, setBusy] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const runImport = useCallback(
    async (file: File) => {
      setBusy(true);
      setLastMessage(null);
      try {
        const result = await gameAssetRegistry.importAndRegister(THREE, file, {
          renderer,
          persist,
        });
        const msg = `Imported ${result.record.name} — ${result.report.triangleCount.toLocaleString()} tris, ${result.report.textureCount} textures`;
        setLastMessage(msg);
        onImported?.({ id: result.id, record: result.record, root: result.root });
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        if (err instanceof AssetValidationError || err instanceof AssetModerationError) {
          setLastMessage(err.message);
        } else {
          setLastMessage(err.message);
        }
        onError?.(err);
      } finally {
        setBusy(false);
      }
    },
    [renderer, persist, onImported, onError]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled || busy) return;
      const f = e.dataTransfer.files?.[0];
      if (f) void runImport(f);
    },
    [busy, disabled, runImport]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      e.target.value = '';
      if (f) void runImport(f);
    },
    [runImport]
  );

  return (
    <div
      className={className}
      onDrop={onDrop}
      onDragOver={onDragOver}
      role="region"
      aria-label="Drop GLB or FBX model to import"
    >
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-black/20 px-6 py-10 text-center text-sm text-white/80 hover:border-white/35 hover:bg-black/30">
        <input
          type="file"
          accept=".glb,.gltf,.fbx,model/gltf-binary,application/octet-stream"
          className="sr-only"
          disabled={disabled || busy}
          onChange={onFileInput}
        />
        <span className="font-medium text-white">
          {busy ? 'Importing…' : 'Drop model here or click to choose'}
        </span>
        <span className="text-xs text-white/55">GLB, GLTF, or FBX — auto scale, materials, validation</span>
        {lastMessage ? <span className="mt-1 max-w-md text-xs text-emerald-200/90">{lastMessage}</span> : null}
      </label>
    </div>
  );
}
