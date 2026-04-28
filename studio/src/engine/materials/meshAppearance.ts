import {
  CanvasTexture,
  Color,
  Mesh,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  ShaderMaterial,
  type Material,
} from "three";
import type { MeshRenderer } from "@/engine/MeshRenderer";
import { generateProceduralTexture } from "@/engine/materials/proceduralTextures";
import { textureAssetCache } from "@/engine/materials/textureAssetCache";
import type { ShaderManager } from "@/engine/shaders/ShaderManager";

export type MeshVisualRecord = {
  mesh: Mesh;
  material: Material;
  signature: string;
  primitiveKey: string;
};

const proceduralTextureMemo = new Map<string, CanvasTexture>();

export function buildMeshSignature(gameObjectId: string, renderer: MeshRenderer): string {
  const mapReady = renderer.surface.mapDataUrl ? textureAssetCache.has(renderer.surface.mapDataUrl) : true;
  return [
    gameObjectId,
    renderer.enabled,
    renderer.source,
    renderer.modelUrl,
    renderer.primitive,
    renderer.size,
    renderer.color,
    renderer.surface.mode,
    renderer.surface.mapDataUrl,
    mapReady ? "mapReady" : "mapPending",
    renderer.surface.tilingU,
    renderer.surface.tilingV,
    renderer.surface.offsetU,
    renderer.surface.offsetV,
    renderer.surface.rotation,
    renderer.surface.proceduralPreset,
    renderer.surface.shaderId,
  ].join("|");
}

export function buildPrimitiveKey(renderer: MeshRenderer): string {
  if (renderer.source === "model") {
    return `model:${renderer.modelUrl}:${renderer.size}`;
  }
  return `${renderer.primitive}:${renderer.size}`;
}

/** Ensures the Three mesh uses materials that match the logical {@link MeshRenderer}. */
export function applyRendererMaterial(
  mesh: Mesh,
  renderer: MeshRenderer,
  record: MeshVisualRecord | undefined,
  shaderManager: ShaderManager,
  timeSeconds: number,
): MeshVisualRecord {
  if (renderer.surface.mapDataUrl) {
    textureAssetCache.ensure(renderer.surface.mapDataUrl);
  }

  const signature = buildMeshSignature(mesh.userData.gameObjectId ?? "", renderer);
  const needsMaterial = !record || record.signature !== signature;

  if (needsMaterial && record) {
    if ("map" in record.material && record.material.map) {
      record.material.map = null;
    }
    record.material.dispose();
  }

  if (needsMaterial) {
    if (renderer.surface.mode === "shader") {
      const mat = shaderManager.createBuiltIn(renderer.surface.shaderId);
      mesh.material = mat;
      record = { mesh, material: mat, signature, primitiveKey: buildPrimitiveKey(renderer) };
    } else if (renderer.surface.mode === "procedural") {
      const key = renderer.surface.proceduralPreset;
      let tex = proceduralTextureMemo.get(key);
      if (!tex) {
        const canvas = generateProceduralTexture(renderer.surface.proceduralPreset);
        tex = new CanvasTexture(canvas);
        tex.colorSpace = SRGBColorSpace;
        tex.wrapS = RepeatWrapping;
        tex.wrapT = RepeatWrapping;
        proceduralTextureMemo.set(key, tex);
      }
      const mat = new MeshStandardMaterial({ map: tex, color: renderer.color });
      applyUvTransform(mat, renderer);
      mesh.material = mat;
      record = { mesh, material: mat, signature, primitiveKey: buildPrimitiveKey(renderer) };
    } else {
      const mat = new MeshStandardMaterial({ color: renderer.color });
      const tex = renderer.surface.mapDataUrl ? textureAssetCache.get(renderer.surface.mapDataUrl) : undefined;
      if (tex) {
        mat.map = tex;
      }
      applyUvTransform(mat, renderer);
      mesh.material = mat;
      record = { mesh, material: mat, signature, primitiveKey: buildPrimitiveKey(renderer) };
    }
  }

  record = record!;
  updateDynamicUniforms(record.material, timeSeconds, renderer);
  return record;
}

function applyUvTransform(mat: MeshStandardMaterial, renderer: MeshRenderer): void {
  if (!mat.map) return;
  mat.map.repeat.set(renderer.surface.tilingU, renderer.surface.tilingV);
  mat.map.offset.set(renderer.surface.offsetU, renderer.surface.offsetV);
  mat.map.rotation = renderer.surface.rotation;
  mat.map.needsUpdate = true;
}

function updateDynamicUniforms(material: Material, timeSeconds: number, renderer: MeshRenderer): void {
  if (material instanceof ShaderMaterial) {
    if (material.uniforms.uTime) {
      material.uniforms.uTime.value = timeSeconds;
    }
    if (material.uniforms.uColor) {
      material.uniforms.uColor.value = new Color(renderer.color);
    }
    if (material.uniforms.uBaseColor?.value instanceof Color) {
      material.uniforms.uBaseColor.value.set(renderer.color);
    }
  }
}
