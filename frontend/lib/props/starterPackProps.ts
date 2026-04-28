import { createPropLOD } from './lodUtils';
import { getSharedPropMaterial } from './sharedMaterials';
import type { PropLODThresholds, PropFactoryResult } from './types';
import { DEFAULT_PROP_LOD_THRESHOLDS } from './types';

type THREE_NS = typeof import('three');

export type StarterPackPropPreset =
  | 'barrel'
  | 'crate'
  | 'bush'
  | 'rock_pile'
  | 'street_lamp'
  | 'bench'
  | 'fountain'
  | 'hay_bale'
  | 'sign_post'
  | 'flower_patch';

const PRESET_IDS: Record<StarterPackPropPreset, string> = {
  barrel: 'starter_prop_barrel',
  crate: 'starter_prop_crate',
  bush: 'starter_prop_bush',
  rock_pile: 'starter_prop_rock_pile',
  street_lamp: 'starter_prop_street_lamp',
  bench: 'starter_prop_bench',
  fountain: 'starter_prop_fountain',
  hay_bale: 'starter_prop_hay_bale',
  sign_post: 'starter_prop_sign_post',
  flower_patch: 'starter_prop_flower_patch',
};

export function createBarrelProp(
  THREE: THREE_NS,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS
): import('three').LOD {
  const wood = getSharedPropMaterial(THREE, 'wood');
  const metal = getSharedPropMaterial(THREE, 'metal');
  const high = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.48, 1.15, 12, 1, false), wood);
  body.position.y = 0.58;
  high.add(body);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 8, 24), metal);
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.72;
  high.add(band);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.52, 0.12, 12, 1, false), wood);
  lid.position.y = 1.18;
  high.add(lid);

  const medium = new THREE.Group();
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.5, 1.2, 8, 1, false), wood);
  b.position.y = 0.6;
  medium.add(b);

  const low = new THREE.Group();
  const blob = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.25, 6, 1, false), wood);
  blob.position.y = 0.62;
  low.add(blob);
  return createPropLOD(THREE, high, medium, low, thresholds);
}

export function createCrateProp(
  THREE: THREE_NS,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS
): import('three').LOD {
  const wood = getSharedPropMaterial(THREE, 'wood');
  const high = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.95, 1, 1, 1), wood);
  box.position.y = 0.48;
  high.add(box);
  const strap = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.12, 0.14, 1, 1, 1), wood);
  strap.position.set(0, 0.48, 0);
  high.add(strap);

  const medium = new THREE.Group();
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.95, 1, 1, 1), wood);
  m.position.y = 0.48;
  medium.add(m);

  const low = new THREE.Group();
  const l = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9, 1, 1, 1), wood);
  l.position.y = 0.45;
  low.add(l);
  return createPropLOD(THREE, high, medium, low, thresholds);
}

export function createBushProp(
  THREE: THREE_NS,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS
): import('three').LOD {
  const foliage = getSharedPropMaterial(THREE, 'foliage');
  const high = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const s = 0.55 + (i % 3) * 0.12;
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), foliage);
    puff.position.set(Math.sin(i * 1.7) * 0.25, 0.45 + i * 0.15, Math.cos(i * 1.2) * 0.22);
    high.add(puff);
  }

  const medium = new THREE.Group();
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 0), foliage);
  m.position.y = 0.55;
  medium.add(m);

  const low = new THREE.Group();
  const l = new THREE.Mesh(new THREE.IcosahedronGeometry(0.95, 0), foliage);
  l.position.y = 0.5;
  low.add(l);
  return createPropLOD(THREE, high, medium, low, thresholds);
}

export function createRockPileProp(
  THREE: THREE_NS,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS
): import('three').LOD {
  const rock = getSharedPropMaterial(THREE, 'concrete');
  const high = new THREE.Group();
  const r1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), rock);
  r1.position.set(0, 0.32, 0);
  high.add(r1);
  const r2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), rock);
  r2.position.set(0.42, 0.22, 0.15);
  high.add(r2);
  const r3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), rock);
  r3.position.set(-0.35, 0.18, -0.12);
  high.add(r3);

  const medium = new THREE.Group();
  const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.62, 0), rock);
  m.position.y = 0.35;
  medium.add(m);

  const low = new THREE.Group();
  const l = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), rock);
  l.position.y = 0.32;
  low.add(l);
  return createPropLOD(THREE, high, medium, low, thresholds);
}

export function createStreetLampProp(
  THREE: THREE_NS,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS
): import('three').LOD {
  const metal = getSharedPropMaterial(THREE, 'metal');
  const glow = getSharedPropMaterial(THREE, 'glow');
  const high = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 3.2, 8, 1, false), metal);
  pole.position.y = 1.6;
  high.add(pole);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), glow);
  head.position.y = 3.35;
  high.add(head);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.15, 8, 1, false), metal);
  cap.position.y = 3.25;
  high.add(cap);

  const medium = new THREE.Group();
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.2, 6, 1, false), metal);
  p.position.y = 1.6;
  medium.add(p);
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 6), glow);
  h.position.y = 3.32;
  medium.add(h);

  const low = new THREE.Group();
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 3.4, 5, 1, false), metal);
  stick.position.y = 1.7;
  low.add(stick);
  return createPropLOD(THREE, high, medium, low, thresholds);
}

export function createBenchProp(
  THREE: THREE_NS,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS
): import('three').LOD {
  const wood = getSharedPropMaterial(THREE, 'wood');
  const high = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.12, 0.55, 1, 1, 1), wood);
  seat.position.y = 0.55;
  high.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.55, 0.1, 1, 1, 1), wood);
  back.position.set(0, 0.85, -0.28);
  high.add(back);
  for (const x of [-0.72, 0.72]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.45, 1, 1, 1), wood);
    leg.position.set(x, 0.25, 0);
    high.add(leg);
  }

  const medium = new THREE.Group();
  const s = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.55, 0.6, 1, 1, 1), wood);
  s.position.y = 0.45;
  medium.add(s);

  const low = new THREE.Group();
  const l = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.45, 0.55, 1, 1, 1), wood);
  l.position.y = 0.38;
  low.add(l);
  return createPropLOD(THREE, high, medium, low, thresholds);
}

export function createFountainProp(
  THREE: THREE_NS,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS
): import('three').LOD {
  const stone = getSharedPropMaterial(THREE, 'concrete');
  const water = getSharedPropMaterial(THREE, 'glass');
  const high = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.25, 0.35, 12, 1, false), stone);
  base.position.y = 0.18;
  high.add(base);
  const bowl = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.22, 10, 24, Math.PI), stone);
  bowl.rotation.x = Math.PI / 2;
  bowl.position.y = 0.65;
  high.add(bowl);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(0.65, 20), water);
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.52;
  high.add(pool);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.85, 8, 1, false), stone);
  spout.position.y = 1.05;
  high.add(spout);

  const medium = new THREE.Group();
  const b = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.15, 0.95, 8, 1, false), stone);
  b.position.y = 0.48;
  medium.add(b);

  const low = new THREE.Group();
  const l = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.75, 6, 1, false), stone);
  l.position.y = 0.38;
  low.add(l);
  return createPropLOD(THREE, high, medium, low, thresholds);
}

export function createHayBaleProp(
  THREE: THREE_NS,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS
): import('three').LOD {
  const hay = getSharedPropMaterial(THREE, 'straw');
  const high = new THREE.Group();
  const bale = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.75, 0.85, 1, 1, 1), hay);
  bale.position.y = 0.38;
  high.add(bale);

  const medium = new THREE.Group();
  const m = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.72, 0.82, 1, 1, 1), hay);
  m.position.y = 0.36;
  medium.add(m);

  const low = new THREE.Group();
  const l = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.65, 0.78, 1, 1, 1), hay);
  l.position.y = 0.33;
  low.add(l);
  return createPropLOD(THREE, high, medium, low, thresholds);
}

export function createSignPostProp(
  THREE: THREE_NS,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS
): import('three').LOD {
  const wood = getSharedPropMaterial(THREE, 'wood');
  const high = new THREE.Group();
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.65, 0.14, 1, 1, 1), wood);
  post.position.y = 0.82;
  high.add(post);
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.55, 0.06, 1, 1, 1), wood);
  board.position.set(0, 1.35, 0.08);
  high.add(board);

  const medium = new THREE.Group();
  const p = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.7, 0.16, 1, 1, 1), wood);
  p.position.y = 0.85;
  medium.add(p);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.55, 0.08, 1, 1, 1), wood);
  b.position.set(0, 1.38, 0);
  medium.add(b);

  const low = new THREE.Group();
  const stick = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.95, 0.2, 1, 1, 1), wood);
  stick.position.y = 0.98;
  low.add(stick);
  return createPropLOD(THREE, high, medium, low, thresholds);
}

export function createFlowerPatchProp(
  THREE: THREE_NS,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS
): import('three').LOD {
  const grass = getSharedPropMaterial(THREE, 'foliage');
  const fun = getSharedPropMaterial(THREE, 'plastic_fun');
  const high = new THREE.Group();
  const bed = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.78, 0.12, 12, 1, false), grass);
  bed.position.y = 0.06;
  high.add(bed);
  for (let i = 0; i < 7; i++) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.35, 6, 1, false), grass);
    const a = (i / 7) * Math.PI * 2;
    stem.position.set(Math.cos(a) * 0.35, 0.28, Math.sin(a) * 0.32);
    high.add(stem);
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), fun);
    petal.position.set(stem.position.x, stem.position.y + 0.22, stem.position.z);
    high.add(petal);
  }

  const medium = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.75, 0.35, 10, 1, false), grass);
  m.position.y = 0.18;
  medium.add(m);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), fun);
  top.position.y = 0.45;
  medium.add(top);

  const low = new THREE.Group();
  const l = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.72, 0.4, 8, 1, false), grass);
  l.position.y = 0.2;
  low.add(l);
  return createPropLOD(THREE, high, medium, low, thresholds);
}

export function createStarterPackProp(
  THREE: THREE_NS,
  preset: StarterPackPropPreset,
  thresholds: PropLODThresholds = DEFAULT_PROP_LOD_THRESHOLDS
): import('three').LOD {
  switch (preset) {
    case 'barrel':
      return createBarrelProp(THREE, thresholds);
    case 'crate':
      return createCrateProp(THREE, thresholds);
    case 'bush':
      return createBushProp(THREE, thresholds);
    case 'rock_pile':
      return createRockPileProp(THREE, thresholds);
    case 'street_lamp':
      return createStreetLampProp(THREE, thresholds);
    case 'bench':
      return createBenchProp(THREE, thresholds);
    case 'fountain':
      return createFountainProp(THREE, thresholds);
    case 'hay_bale':
      return createHayBaleProp(THREE, thresholds);
    case 'sign_post':
      return createSignPostProp(THREE, thresholds);
    case 'flower_patch':
      return createFlowerPatchProp(THREE, thresholds);
    default: {
      const _x: never = preset;
      return _x;
    }
  }
}

export function createStarterPackPropAsset(
  THREE: THREE_NS,
  preset: StarterPackPropPreset,
  thresholds?: PropLODThresholds
): PropFactoryResult {
  return {
    lod: createStarterPackProp(THREE, preset, thresholds),
    category: 'starter',
    presetId: PRESET_IDS[preset],
  };
}
