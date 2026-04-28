import type { Skin } from '@/types';
import { createModularPartMaterials } from './materials';
import type { ModularCharacterBuildOptions } from './types';

type THREE_NS = typeof import('three');

function bone(THREE: THREE_NS, name: string): import('three').Bone {
  const b = new THREE.Bone();
  b.name = name;
  return b;
}

export type ModularCharacterRig = {
  /** Scene root (orbit / move this) */
  root: import('three').Group;
  /** World Y of pelvis at bind pose (for emote grounding) */
  hipBaseY: number;
  /** Skeleton root bone */
  hips: import('three').Bone;
  bones: {
    hips: import('three').Bone;
    spine: import('three').Bone;
    chest: import('three').Bone;
    neck: import('three').Bone;
    head: import('three').Bone;
    leftShoulder: import('three').Bone;
    leftUpperArm: import('three').Bone;
    leftLowerArm: import('three').Bone;
    rightShoulder: import('three').Bone;
    rightUpperArm: import('three').Bone;
    rightLowerArm: import('three').Bone;
    leftUpLeg: import('three').Bone;
    leftLeg: import('three').Bone;
    leftFoot: import('three').Bone;
    rightUpLeg: import('three').Bone;
    rightLeg: import('three').Bone;
    rightFoot: import('three').Bone;
  };
  /** Body chunk meshes for material swaps / visibility */
  meshes: {
    head: import('three').Mesh;
    torso: import('three').Mesh;
    leftUpperArm: import('three').Mesh;
    leftLowerArm: import('three').Mesh;
    rightUpperArm: import('three').Mesh;
    rightLowerArm: import('three').Mesh;
    leftUpperLeg: import('three').Mesh;
    leftLowerLeg: import('three').Mesh;
    rightUpperLeg: import('three').Mesh;
    rightLowerLeg: import('three').Mesh;
  };
  materials: ReturnType<typeof createModularPartMaterials>;
};

/**
 * Low-poly modular humanoid (~10 skinned-style parts, clean boxes), Fortnite-ish proportions,
 * animation-ready `Bone` hierarchy for emotes and future clips.
 */
export function createModularCharacter(THREE: THREE_NS, options: ModularCharacterBuildOptions): ModularCharacterRig {
  const { skin, equippedFace, textureSlots, bodyScale = { x: 1, y: 1, z: 1 }, headScale = { x: 1, y: 1, z: 1 } } =
    options;

  const bx = bodyScale.x;
  const by = bodyScale.y;
  const bz = bodyScale.z;
  const hx = headScale.x;
  const hy = headScale.y;
  const hz = headScale.z;

  const materials = createModularPartMaterials(THREE, skin, equippedFace ?? null, textureSlots);

  const root = new THREE.Group();
  root.name = 'ModularCharacter';

  const hipBaseY = 0.95 * by;
  const hips = bone(THREE, 'Hips');
  hips.position.set(0, hipBaseY, 0);

  const spine = bone(THREE, 'Spine');
  spine.position.set(0, 0.16 * by, 0);
  const chest = bone(THREE, 'Chest');
  chest.position.set(0, 0.24 * by, 0);
  const neck = bone(THREE, 'Neck');
  neck.position.set(0, 0.3 * by, 0);
  const head = bone(THREE, 'Head');
  head.position.set(0, 0.12 * by, 0);

  const leftShoulder = bone(THREE, 'LeftShoulder');
  leftShoulder.position.set(-0.44 * bx, 0.1 * by, 0);
  const leftUpperArm = bone(THREE, 'LeftUpperArm');
  leftUpperArm.position.set(0, -0.3 * by, 0);
  const leftLowerArm = bone(THREE, 'LeftLowerArm');
  leftLowerArm.position.set(0, -0.28 * by, 0);

  const rightShoulder = bone(THREE, 'RightShoulder');
  rightShoulder.position.set(0.44 * bx, 0.1 * by, 0);
  const rightUpperArm = bone(THREE, 'RightUpperArm');
  rightUpperArm.position.set(0, -0.3 * by, 0);
  const rightLowerArm = bone(THREE, 'RightLowerArm');
  rightLowerArm.position.set(0, -0.28 * by, 0);

  const leftUpLeg = bone(THREE, 'LeftUpLeg');
  leftUpLeg.position.set(-0.22 * bx, -0.04 * by, 0);
  const leftLeg = bone(THREE, 'LeftLeg');
  leftLeg.position.set(0, -0.44 * by, 0);
  const leftFoot = bone(THREE, 'LeftFoot');
  leftFoot.position.set(0, -0.38 * by, 0.06 * bz);

  const rightUpLeg = bone(THREE, 'RightUpLeg');
  rightUpLeg.position.set(0.22 * bx, -0.04 * by, 0);
  const rightLeg = bone(THREE, 'RightLeg');
  rightLeg.position.set(0, -0.44 * by, 0);
  const rightFoot = bone(THREE, 'RightFoot');
  rightFoot.position.set(0, -0.38 * by, 0.06 * bz);

  hips.add(spine);
  spine.add(chest);
  chest.add(neck);
  neck.add(head);
  chest.add(leftShoulder);
  leftShoulder.add(leftUpperArm);
  leftUpperArm.add(leftLowerArm);
  chest.add(rightShoulder);
  rightShoulder.add(rightUpperArm);
  rightUpperArm.add(rightLowerArm);
  hips.add(leftUpLeg);
  leftUpLeg.add(leftLeg);
  leftLeg.add(leftFoot);
  hips.add(rightUpLeg);
  rightUpLeg.add(rightLeg);
  rightLeg.add(rightFoot);

  root.add(hips);

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // Stylized: slightly larger head, compact torso, long limbs
  const headMesh = new THREE.Mesh(
    box(0.82 * hx, 0.88 * hy, 0.74 * hz),
    materials.head
  );
  headMesh.name = 'MeshHead';
  headMesh.castShadow = true;
  headMesh.position.set(0, 0.38 * hy, 0.02 * hz);
  head.add(headMesh);

  const torsoMesh = new THREE.Mesh(box(1.22 * bx, 0.95 * by, 0.58 * bz), materials.torso);
  torsoMesh.name = 'MeshTorso';
  torsoMesh.castShadow = true;
  torsoMesh.position.set(0, -0.02 * by, 0);
  chest.add(torsoMesh);

  const upperArmGeo = box(0.34 * bx, 0.62 * by, 0.34 * bz);
  const lowerArmGeo = box(0.3 * bx, 0.52 * by, 0.3 * bz);
  const upperLegGeo = box(0.42 * bx, 0.7 * by, 0.42 * bz);
  const lowerLegGeo = box(0.38 * bx, 0.62 * by, 0.38 * bz);

  const lua = new THREE.Mesh(upperArmGeo, materials.arm);
  lua.name = 'MeshLeftUpperArm';
  lua.castShadow = true;
  lua.position.set(0, -0.32 * by, 0);
  leftUpperArm.add(lua);

  const lla = new THREE.Mesh(lowerArmGeo, materials.arm);
  lla.name = 'MeshLeftLowerArm';
  lla.castShadow = true;
  lla.position.set(0, -0.3 * by, 0);
  leftLowerArm.add(lla);

  const rua = new THREE.Mesh(upperArmGeo, materials.arm);
  rua.name = 'MeshRightUpperArm';
  rua.castShadow = true;
  rua.position.set(0, -0.32 * by, 0);
  rightUpperArm.add(rua);

  const rla = new THREE.Mesh(lowerArmGeo, materials.arm);
  rla.name = 'MeshRightLowerArm';
  rla.castShadow = true;
  rla.position.set(0, -0.3 * by, 0);
  rightLowerArm.add(rla);

  const lul = new THREE.Mesh(upperLegGeo, materials.leg);
  lul.name = 'MeshLeftUpperLeg';
  lul.castShadow = true;
  lul.position.set(0, -0.36 * by, 0);
  leftUpLeg.add(lul);

  const lll = new THREE.Mesh(lowerLegGeo, materials.leg);
  lll.name = 'MeshLeftLowerLeg';
  lll.castShadow = true;
  lll.position.set(0, -0.34 * by, 0);
  leftLeg.add(lll);

  const rul = new THREE.Mesh(upperLegGeo, materials.leg);
  rul.name = 'MeshRightUpperLeg';
  rul.castShadow = true;
  rul.position.set(0, -0.36 * by, 0);
  rightUpLeg.add(rul);

  const rll = new THREE.Mesh(lowerLegGeo, materials.leg);
  rll.name = 'MeshRightLowerLeg';
  rll.castShadow = true;
  rll.position.set(0, -0.34 * by, 0);
  rightLeg.add(rll);

  const bones = {
    hips,
    spine,
    chest,
    neck,
    head,
    leftShoulder,
    leftUpperArm,
    leftLowerArm,
    rightShoulder,
    rightUpperArm,
    rightLowerArm,
    leftUpLeg,
    leftLeg,
    leftFoot,
    rightUpLeg,
    rightLeg,
    rightFoot,
  };

  return {
    root,
    hipBaseY,
    hips,
    bones,
    meshes: {
      head: headMesh,
      torso: torsoMesh,
      leftUpperArm: lua,
      leftLowerArm: lla,
      rightUpperArm: rua,
      rightLowerArm: rla,
      leftUpperLeg: lul,
      leftLowerLeg: lll,
      rightUpperLeg: rul,
      rightLowerLeg: rll,
    },
    materials,
  };
}

/** Map legacy `Skin` + scales into build options */
export function modularOptionsFromSkin(skin: Skin, equippedFace?: Skin | null): ModularCharacterBuildOptions {
  const bodyScale = (skin as unknown as { bodyScale?: { x: number; y: number; z: number } }).bodyScale ?? {
    x: 1,
    y: 1,
    z: 1,
  };
  const headScale = (skin as unknown as { headScale?: { x: number; y: number; z: number } }).headScale ?? {
    x: 1,
    y: 1,
    z: 1,
  };
  return { skin, equippedFace: equippedFace ?? undefined, bodyScale, headScale };
}
