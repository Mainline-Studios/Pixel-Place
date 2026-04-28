import { createPropLOD } from './lodUtils';
import { getSharedPropMaterial } from './sharedMaterials';
import type { PropLODThresholds, PropFactoryResult } from './types';
import { DEFAULT_PROP_LOD_THRESHOLDS } from './types';

type THREE_NS = typeof import('three');

export function createChestProp(
  THREE: THREE_NS,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS
): import('three').LOD {
  const wood = getSharedPropMaterial(THREE, 'wood');
  const metal = getSharedPropMaterial(THREE, 'metal');

  const high = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.65, 0.82, 1, 1, 1), wood);
  base.position.y = 0.325;
  high.add(base);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.16, 0.84, 1, 1, 1), wood);
  lid.position.set(0, 0.76, -0.12);
  lid.rotation.x = -0.4;
  high.add(lid);
  const band = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.1, 0.14, 1, 1, 1), metal);
  band.position.set(0, 0.42, 0.42);
  high.add(band);

  const medium = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.82, 0.82, 1, 1, 1), wood);
  box.position.y = 0.41;
  medium.add(box);

  const low = new THREE.Group();
  const boxL = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.65, 0.65, 1, 1, 1), wood);
  boxL.position.y = 0.325;
  low.add(boxL);

  return createPropLOD(THREE, high, medium, low, thresholds);
}

export function createCrystalPedestalProp(
  THREE: THREE_NS,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS
): import('three').LOD {
  const stone = getSharedPropMaterial(THREE, 'concrete');
  const glow = getSharedPropMaterial(THREE, 'glow');
  const accent = getSharedPropMaterial(THREE, 'plastic_fun');

  const high = new THREE.Group();
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.05, 0.32, 10, 1, false), stone);
  plinth.position.y = 0.16;
  high.add(plinth);
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.85, 8, 1, false), stone);
  column.position.y = 0.64;
  high.add(column);
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.52, 0), glow);
  crystal.position.y = 1.38;
  high.add(crystal);

  const medium = new THREE.Group();
  const plinthM = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.05, 0.32, 6, 1, false), stone);
  plinthM.position.y = 0.16;
  medium.add(plinthM);
  const crystalM = new THREE.Mesh(new THREE.OctahedronGeometry(0.62, 0), accent);
  crystalM.position.y = 1.05;
  medium.add(crystalM);

  const low = new THREE.Group();
  const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 1.75, 5, 1, false), stone);
  stack.position.y = 0.88;
  low.add(stack);
  const gem = new THREE.Mesh(new THREE.TetrahedronGeometry(0.55, 0), glow);
  gem.position.y = 1.82;
  low.add(gem);

  return createPropLOD(THREE, high, medium, low, thresholds);
}

export type InteractiveVariant = 'chest' | 'crystal_pedestal';

export function createInteractivePropAsset(
  THREE: THREE_NS,
  variant: InteractiveVariant = 'chest',
  thresholds?: PropLODThresholds
): PropFactoryResult {
  const lod =
    variant === 'crystal_pedestal'
      ? createCrystalPedestalProp(THREE, thresholds)
      : createChestProp(THREE, thresholds);
  return {
    lod,
    category: 'interactive',
    presetId:
      variant === 'crystal_pedestal' ? 'prop_interactive_crystal_pedestal' : 'prop_interactive_chest',
  };
}
