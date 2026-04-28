import type { ModularEmoteId } from './types';

/** Rig bone names we animate (must match factory) */
export type ModularRigBones = {
  hips: import('three').Bone;
  spine: import('three').Bone;
  chest: import('three').Bone;
  neck: import('three').Bone;
  head: import('three').Bone;
  leftUpperArm: import('three').Bone;
  leftLowerArm: import('three').Bone;
  rightUpperArm: import('three').Bone;
  rightLowerArm: import('three').Bone;
  leftUpLeg: import('three').Bone;
  leftLeg: import('three').Bone;
  rightUpLeg: import('three').Bone;
  rightLeg: import('three').Bone;
};

function resetLimbRotations(b: ModularRigBones): void {
  const bones: import('three').Bone[] = [
    b.spine,
    b.chest,
    b.neck,
    b.head,
    b.leftUpperArm,
    b.leftLowerArm,
    b.rightUpperArm,
    b.rightLowerArm,
    b.leftUpLeg,
    b.leftLeg,
    b.rightUpLeg,
    b.rightLeg,
  ];
  for (const bone of bones) {
    bone.rotation.set(0, 0, 0);
  }
}

/**
 * Keyframed-style procedural emotes on the humanoid rig. Call each frame with monotonic `time`.
 */
export function updateModularRigEmote(
  bones: ModularRigBones,
  emote: ModularEmoteId | string,
  time: number,
  hipBaseY: number
): void {
  bones.hips.position.set(0, hipBaseY, 0);
  bones.hips.rotation.set(0, 0, 0);
  resetLimbRotations(bones);
  const t = time;

  if (emote === 'idle') {
    bones.head.rotation.x = Math.sin(t * 2) * 0.04;
    bones.leftUpperArm.rotation.z = 0.06;
    bones.rightUpperArm.rotation.z = -0.06;
    bones.leftLowerArm.rotation.x = 0.05;
    bones.rightLowerArm.rotation.x = 0.05;
    bones.spine.rotation.y = Math.sin(t * 1.2) * 0.03;
    return;
  }

  if (emote === 'walk') {
    const w = t * 4;
    bones.leftUpLeg.rotation.x = Math.sin(w) * 0.42;
    bones.rightUpLeg.rotation.x = -Math.sin(w) * 0.42;
    bones.leftLeg.rotation.x = Math.max(0, Math.sin(w - 0.4)) * 0.35;
    bones.rightLeg.rotation.x = Math.max(0, Math.sin(-w - 0.4)) * 0.35;
    bones.leftUpperArm.rotation.x = -Math.sin(w) * 0.38;
    bones.rightUpperArm.rotation.x = Math.sin(w) * 0.38;
    bones.leftLowerArm.rotation.x = -0.15;
    bones.rightLowerArm.rotation.x = -0.15;
    bones.hips.position.y = hipBaseY + Math.abs(Math.sin(w)) * 0.06;
    bones.chest.rotation.y = Math.sin(w) * 0.05;
    return;
  }

  if (emote === 'wave') {
    bones.rightUpperArm.rotation.x = -1.15;
    bones.rightUpperArm.rotation.z = -0.35;
    bones.rightLowerArm.rotation.z = Math.sin(t * 8) * 0.55;
    bones.rightLowerArm.rotation.x = -0.2;
    bones.head.rotation.y = -0.12;
    bones.neck.rotation.y = -0.08;
    bones.leftUpperArm.rotation.z = 0.08;
    return;
  }

  if (emote === 'jump') {
    const phase = (t * 2.2) % (Math.PI * 2);
    const hop = Math.max(0, Math.sin(phase));
    bones.hips.position.y = hipBaseY + hop * 0.42;
    bones.leftUpLeg.rotation.x = -hop * 0.55;
    bones.rightUpLeg.rotation.x = -hop * 0.55;
    bones.leftLeg.rotation.x = hop * 0.9;
    bones.rightLeg.rotation.x = hop * 0.9;
    bones.leftUpperArm.rotation.x = -hop * 0.9;
    bones.rightUpperArm.rotation.x = -hop * 0.9;
    bones.spine.rotation.x = hop * 0.12;
    return;
  }

  if (emote === 'dance') {
    const beat = t * 7;
    bones.hips.position.y = hipBaseY + Math.abs(Math.sin(beat)) * 0.08;
    bones.hips.rotation.y = Math.sin(beat * 0.5) * 0.25;
    bones.chest.rotation.z = Math.sin(beat) * 0.12;
    bones.leftUpperArm.rotation.z = 0.85 + Math.sin(beat) * 0.15;
    bones.rightUpperArm.rotation.z = -0.85 - Math.sin(beat) * 0.15;
    bones.leftUpperArm.rotation.x = Math.sin(beat) * 0.2;
    bones.rightUpperArm.rotation.x = Math.sin(beat + Math.PI) * 0.2;
    bones.leftUpLeg.rotation.x = Math.sin(beat) * 0.22;
    bones.rightUpLeg.rotation.x = -Math.sin(beat) * 0.22;
    bones.head.rotation.y = Math.sin(beat * 0.5) * 0.18;
    bones.head.rotation.x = Math.sin(beat * 0.25) * 0.1;
    return;
  }

  // custom / unknown — idle-adjacent neutral
  bones.head.rotation.x = Math.sin(t * 2) * 0.02;
}

/** Reset hips Y after emotes that move root (walk/jump/dance) */
export function snapModularHipsHeight(bones: ModularRigBones, hipBaseY: number): void {
  bones.hips.position.y = hipBaseY;
}
