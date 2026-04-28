import { createPropLOD } from './lodUtils';
import { getSharedPropMaterial } from './sharedMaterials';
import type { PropLODThresholds, PropFactoryResult } from './types';
import { DEFAULT_PROP_LOD_THRESHOLDS } from './types';
import { createSeededRng, createVariedPropMaterial } from './variation';
import type { PropVariationSpec } from './variation';

type THREE_NS = typeof import('three');

export type BuildingStyle = 'cottage' | 'shop' | 'tower';

function shouldApplyVariation(spec: PropVariationSpec | undefined): spec is PropVariationSpec {
  if (!spec) return false;
  const i = spec.intensity ?? 1;
  return i > 1e-4;
}

type BuildingMats = {
  wall: import('three').MeshStandardMaterial;
  roofMat: import('three').MeshStandardMaterial;
  glass: import('three').MeshStandardMaterial;
  fabric?: import('three').MeshStandardMaterial;
};

function resolveBuildingMaterials(
  THREE: THREE_NS,
  useVar: boolean,
  rng: (() => number) | null,
  intensity: number
): BuildingMats {
  if (useVar && rng) {
    return {
      wall: createVariedPropMaterial(THREE, 'concrete', { rng, intensity }),
      roofMat: createVariedPropMaterial(THREE, 'brick', { rng, intensity }),
      glass: createVariedPropMaterial(THREE, 'glass', { rng, intensity }, { colorNoiseMul: 0.28, mapNoiseMul: 0.45 }),
      fabric: createVariedPropMaterial(THREE, 'fabric', { rng, intensity }),
    };
  }
  return {
    wall: getSharedPropMaterial(THREE, 'concrete'),
    roofMat: getSharedPropMaterial(THREE, 'brick'),
    glass: getSharedPropMaterial(THREE, 'glass'),
    fabric: getSharedPropMaterial(THREE, 'fabric'),
  };
}

function createCottageBuilding(
  THREE: THREE_NS,
  mats: BuildingMats,
  thresholds: PropLODThresholds,
  useVar: boolean,
  rng: (() => number) | null,
  intensity: number
): import('three').LOD {
  const { wall, roofMat, glass } = mats;
  const s = (base: number) =>
    useVar && rng ? base * (1 + (rng() - 0.5) * 0.08 * intensity) : base;
  const yJ = () => (useVar && rng ? (rng() - 0.5) * 0.04 * intensity : 0);

  const high = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(s(4), s(3.4), s(3), 1, 1, 1), wall);
  body.position.y = s(1.7) + yJ();
  high.add(body);
  const roofMesh = new THREE.Mesh(new THREE.ConeGeometry(s(2.65), s(1.35), 4, 1, false), roofMat);
  roofMesh.position.y = 3.4 + 0.68 + yJ();
  roofMesh.rotation.y = Math.PI / 4 + (useVar && rng ? (rng() - 0.5) * 0.06 * intensity : 0);
  high.add(roofMesh);
  for (const x of [-1.15, 1.15]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(s(0.85), s(1), s(0.06)), glass);
    win.position.set(x, 1.75 + yJ(), 1.53);
    high.add(win);
  }
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(s(0.45), s(0.9), s(0.45)), roofMat);
  chimney.position.set(1.2 + (useVar && rng ? (rng() - 0.5) * 0.15 * intensity : 0), 4.1 + yJ(), -0.4);
  high.add(chimney);

  const medium = new THREE.Group();
  const bodyM = new THREE.Mesh(new THREE.BoxGeometry(s(4), s(3.4), s(3), 1, 1, 1), wall);
  bodyM.position.y = s(1.7) + yJ();
  medium.add(bodyM);
  const roofM = new THREE.Mesh(new THREE.ConeGeometry(s(2.5), s(1.45), 4, 1, false), roofMat);
  roofM.position.y = 3.4 + 0.72 + yJ();
  roofM.rotation.y = Math.PI / 4;
  medium.add(roofM);

  const low = new THREE.Group();
  const block = new THREE.Mesh(new THREE.BoxGeometry(s(4.2), s(4.4), s(3.2), 1, 1, 1), wall);
  block.position.y = s(2.2) + yJ();
  low.add(block);

  return createPropLOD(THREE, high, medium, low, thresholds);
}

function createShopBuilding(
  THREE: THREE_NS,
  mats: BuildingMats,
  thresholds: PropLODThresholds,
  useVar: boolean,
  rng: (() => number) | null,
  intensity: number
): import('three').LOD {
  const { wall, roofMat, glass, fabric } = mats;
  const awningMat = fabric ?? roofMat;
  const s = (base: number) =>
    useVar && rng ? base * (1 + (rng() - 0.5) * 0.06 * intensity) : base;
  const yJ = () => (useVar && rng ? (rng() - 0.5) * 0.03 * intensity : 0);

  const high = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(s(5.2), s(2.85), s(3.4), 1, 1, 1), wall);
  body.position.y = s(1.42) + yJ();
  high.add(body);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(s(5.35), s(0.22), s(3.55), 1, 1, 1), roofMat);
  roof.position.y = 2.85 + 0.11 + yJ();
  high.add(roof);
  const awning = new THREE.Mesh(new THREE.BoxGeometry(s(4.8), s(0.12), s(1.1), 1, 1, 1), awningMat);
  awning.position.set(0, 2.05 + yJ(), 1.55);
  awning.rotation.x = 0.18;
  high.add(awning);
  for (let i = 0; i < 3; i++) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(s(1.15), s(1.25), s(0.06)), glass);
    win.position.set(-1.6 + i * 1.6, 1.35 + yJ(), 1.72);
    high.add(win);
  }

  const medium = new THREE.Group();
  const bodyM = new THREE.Mesh(new THREE.BoxGeometry(s(5.1), s(2.9), s(3.35), 1, 1, 1), wall);
  bodyM.position.y = s(1.45) + yJ();
  medium.add(bodyM);
  const roofM = new THREE.Mesh(new THREE.BoxGeometry(s(5.2), s(0.35), s(3.45), 1, 1, 1), roofMat);
  roofM.position.y = 2.92 + yJ();
  medium.add(roofM);

  const low = new THREE.Group();
  const block = new THREE.Mesh(new THREE.BoxGeometry(s(5.2), s(3.35), s(3.5), 1, 1, 1), wall);
  block.position.y = s(1.68) + yJ();
  low.add(block);

  return createPropLOD(THREE, high, medium, low, thresholds);
}

function createTowerBuilding(
  THREE: THREE_NS,
  mats: BuildingMats,
  thresholds: PropLODThresholds,
  useVar: boolean,
  rng: (() => number) | null,
  intensity: number
): import('three').LOD {
  const { wall, roofMat, glass } = mats;
  const s = (base: number) =>
    useVar && rng ? base * (1 + (rng() - 0.5) * 0.07 * intensity) : base;
  const yJ = () => (useVar && rng ? (rng() - 0.5) * 0.04 * intensity : 0);

  const high = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(s(2.25), s(5.2), s(2.25), 1, 1, 1), wall);
  body.position.y = s(2.6) + yJ();
  high.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(s(1.55), s(1.85), 5, 1, false), roofMat);
  roof.position.y = 5.2 + 0.92 + yJ();
  high.add(roof);
  const w1 = new THREE.Mesh(new THREE.BoxGeometry(s(0.55), s(0.85), s(0.06)), glass);
  w1.position.set(0, 2.1 + yJ(), 1.14);
  high.add(w1);
  const w2 = new THREE.Mesh(new THREE.BoxGeometry(s(0.55), s(0.85), s(0.06)), glass);
  w2.position.set(0, 3.55 + yJ(), 1.14);
  high.add(w2);

  const medium = new THREE.Group();
  const bodyM = new THREE.Mesh(new THREE.BoxGeometry(s(2.35), s(5.35), s(2.35), 1, 1, 1), wall);
  bodyM.position.y = s(2.68) + yJ();
  medium.add(bodyM);
  const roofM = new THREE.Mesh(new THREE.ConeGeometry(s(1.5), s(1.95), 4, 1, false), roofMat);
  roofM.position.y = 5.35 + 0.98 + yJ();
  medium.add(roofM);

  const low = new THREE.Group();
  const stack = new THREE.Mesh(new THREE.BoxGeometry(s(2.5), s(6.2), s(2.5), 1, 1, 1), wall);
  stack.position.y = s(3.1) + yJ();
  low.add(stack);

  return createPropLOD(THREE, high, medium, low, thresholds);
}

export function createBuildingProp(
  THREE: THREE_NS,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS,
  variation?: PropVariationSpec,
  style: BuildingStyle = 'cottage'
): import('three').LOD {
  const useVar = shouldApplyVariation(variation);
  const intensity = variation?.intensity ?? 1;
  const rng =
    useVar && variation ? createSeededRng(variation.seed ?? `prop_building_${style}`) : null;

  const mats = resolveBuildingMaterials(THREE, useVar, rng, intensity);

  let lod: import('three').LOD;
  switch (style) {
    case 'shop':
      lod = createShopBuilding(THREE, mats, thresholds, useVar, rng, intensity);
      break;
    case 'tower':
      lod = createTowerBuilding(THREE, mats, thresholds, useVar, rng, intensity);
      break;
    case 'cottage':
    default:
      lod = createCottageBuilding(THREE, mats, thresholds, useVar, rng, intensity);
      break;
  }

  if (useVar) {
    lod.userData.pixelPlaceVariedMaterials = true;
  }
  return lod;
}

const PRESET_FOR_STYLE: Record<BuildingStyle, string> = {
  cottage: 'prop_building_cottage',
  shop: 'prop_building_shop',
  tower: 'prop_building_tower',
};

export function createBuildingPropAsset(
  THREE: THREE_NS,
  thresholds?: PropLODThresholds,
  variation?: PropVariationSpec,
  style: BuildingStyle = 'cottage'
): PropFactoryResult {
  return {
    lod: createBuildingProp(THREE, thresholds, variation, style),
    category: 'building',
    presetId: PRESET_FOR_STYLE[style],
  };
}
