import { createPropLOD } from './lodUtils';
import { getSharedPropMaterial } from './sharedMaterials';
import type { PropLODThresholds, PropFactoryResult } from './types';
import { DEFAULT_PROP_LOD_THRESHOLDS } from './types';

type THREE_NS = typeof import('three');

export function createChairProp(
  THREE: THREE_NS,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS
): import('three').LOD {
  const wood = getSharedPropMaterial(THREE, 'wood');

  const high = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1, 0.14, 1, 1, 1, 1), wood);
  seat.position.y = 0.92;
  high.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(1, 1.05, 0.11, 1, 1, 1), wood);
  back.position.set(0, 1.42, -0.44);
  high.add(back);
  const legGeo = new THREE.BoxGeometry(0.11, 0.82, 0.11, 1, 1, 1);
  for (const [lx, lz] of [
    [-0.38, 0.38],
    [0.38, 0.38],
    [-0.38, -0.38],
    [0.38, -0.38],
  ]) {
    const leg = new THREE.Mesh(legGeo, wood);
    leg.position.set(lx, 0.41, lz);
    high.add(leg);
  }

  const medium = new THREE.Group();
  const seatM = new THREE.Mesh(new THREE.BoxGeometry(1, 0.14, 1, 1, 1, 1), wood);
  seatM.position.y = 0.92;
  medium.add(seatM);
  const backM = new THREE.Mesh(new THREE.BoxGeometry(1, 1.05, 0.11, 1, 1, 1), wood);
  backM.position.set(0, 1.42, -0.44);
  medium.add(backM);
  const legBlock = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.78, 0.75, 1, 1, 1), wood);
  legBlock.position.y = 0.39;
  medium.add(legBlock);

  const low = new THREE.Group();
  const silhouette = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.95, 0.95, 1, 1, 1), wood);
  silhouette.position.y = 0.98;
  low.add(silhouette);

  return createPropLOD(THREE, high, medium, low, thresholds);
}

export function createTableProp(
  THREE: THREE_NS,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS
): import('three').LOD {
  const wood = getSharedPropMaterial(THREE, 'wood');

  const high = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 1.1, 1, 1, 1), wood);
  top.position.y = 1.05;
  high.add(top);
  const legW = 0.12;
  const legH = 1.0;
  const legGeo = new THREE.BoxGeometry(legW, legH, legW, 1, 1, 1);
  for (const [lx, lz] of [
    [-0.72, 0.38],
    [0.72, 0.38],
    [-0.72, -0.38],
    [0.72, -0.38],
  ]) {
    const leg = new THREE.Mesh(legGeo, wood);
    leg.position.set(lx, 0.5, lz);
    high.add(leg);
  }

  const medium = new THREE.Group();
  const topM = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 1.1, 1, 1, 1), wood);
  topM.position.y = 1.05;
  medium.add(topM);
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 0.85, 1, 1, 1), wood);
  skirt.position.y = 0.5;
  medium.add(skirt);

  const low = new THREE.Group();
  const block = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.15, 1.15, 1, 1, 1), wood);
  block.position.y = 0.58;
  low.add(block);

  return createPropLOD(THREE, high, medium, low, thresholds);
}

export type FurnitureVariant = 'chair' | 'table';

export function createFurniturePropAsset(
  THREE: THREE_NS,
  variant: FurnitureVariant = 'chair',
  thresholds?: PropLODThresholds
): PropFactoryResult {
  const lod =
    variant === 'table' ? createTableProp(THREE, thresholds) : createChairProp(THREE, thresholds);
  return {
    lod,
    category: 'furniture',
    presetId: variant === 'table' ? 'prop_furniture_table' : 'prop_furniture_chair',
  };
}
