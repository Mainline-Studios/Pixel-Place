import { createPropLOD } from './lodUtils';
import { getSharedPropMaterial } from './sharedMaterials';
import type { PropLODThresholds, PropFactoryResult } from './types';
import { DEFAULT_PROP_LOD_THRESHOLDS } from './types';
import { createSeededRng, createVariedPropMaterial } from './variation';
import type { PropVariationSpec } from './variation';

type THREE_NS = typeof import('three');

function shouldApplyVariation(spec: PropVariationSpec | undefined): spec is PropVariationSpec {
  if (!spec) return false;
  const i = spec.intensity ?? 1;
  return i > 1e-4;
}

export function createTreeProp(
  THREE: THREE_NS,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS,
  variation?: PropVariationSpec
): import('three').LOD {
  const useVar = shouldApplyVariation(variation);
  const intensity = variation?.intensity ?? 1;
  const rng =
    useVar && variation ? createSeededRng(variation.seed ?? 'prop_tree_stylized') : null;

  const w = (base: number) =>
    useVar && rng ? base * (1 + (rng() - 0.5) * 0.24 * intensity) : base;
  const yJ = () => (useVar && rng ? (rng() - 0.5) * 0.06 * intensity : 0);
  const rotZ = () => (useVar && rng ? (rng() - 0.5) * 0.05 * intensity : 0);

  const bark = useVar && rng
    ? createVariedPropMaterial(THREE, 'bark', { rng, intensity })
    : getSharedPropMaterial(THREE, 'bark');
  const foliage = useVar && rng
    ? createVariedPropMaterial(THREE, 'foliage', { rng, intensity })
    : getSharedPropMaterial(THREE, 'foliage');

  const high = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(w(0.32), w(0.42), w(2.2), 10, 1, false),
    bark
  );
  trunk.position.y = w(1.1);
  trunk.rotation.z = rotZ();
  high.add(trunk);
  for (let i = 0; i < 5; i++) {
    const r = w(1.15 - i * 0.14);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r, w(0.95), 10, 1, false), foliage);
    cone.position.y = 2.35 + i * 0.72 + yJ();
    cone.rotation.z = rotZ();
    high.add(cone);
  }

  const medium = new THREE.Group();
  const trunkM = new THREE.Mesh(
    new THREE.CylinderGeometry(w(0.34), w(0.44), w(2.2), 6, 1, false),
    bark
  );
  trunkM.position.y = w(1.1);
  trunkM.rotation.z = rotZ();
  medium.add(trunkM);
  const crown = new THREE.Mesh(new THREE.ConeGeometry(w(1.75), w(2.85), 7, 1, false), foliage);
  crown.position.y = 3.15 + yJ();
  crown.rotation.z = rotZ();
  medium.add(crown);

  const low = new THREE.Group();
  const trunkL = new THREE.Mesh(
    new THREE.CylinderGeometry(w(0.38), w(0.48), w(2.35), 5, 1, false),
    bark
  );
  trunkL.position.y = w(1.18);
  trunkL.rotation.z = rotZ();
  low.add(trunkL);
  const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(w(1.55), 0), foliage);
  blob.position.y = 3.1 + yJ();
  blob.rotation.z = rotZ();
  low.add(blob);

  const lod = createPropLOD(THREE, high, medium, low, thresholds);
  if (useVar) {
    lod.userData.pixelPlaceVariedMaterials = true;
  }
  return lod;
}

export function createTreePropAsset(
  THREE: THREE_NS,
  thresholds?: PropLODThresholds,
  variation?: PropVariationSpec
): PropFactoryResult {
  return {
    lod: createTreeProp(THREE, thresholds, variation),
    category: 'tree',
    presetId: 'prop_tree_stylized',
  };
}
