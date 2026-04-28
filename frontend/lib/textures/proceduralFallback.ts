import * as THREE from 'three';

/** Neutral stylized grey-violet chip if disk fallback fails (world-consistent “missing tex”) */
export function createProceduralFallbackDataTexture(size = 64): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  const r = 0xa8;
  const g = 0xb4;
  const b = 0xc8;
  for (let i = 0; i < size * size; i++) {
    const o = i * 4;
    data[o] = r;
    data[o + 1] = g;
    data[o + 2] = b;
    data[o + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size);
  tex.needsUpdate = true;
  if ('colorSpace' in tex && THREE.SRGBColorSpace) {
    (tex as THREE.DataTexture & { colorSpace?: string }).colorSpace = THREE.SRGBColorSpace;
  }
  return tex;
}
