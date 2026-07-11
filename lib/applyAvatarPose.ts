/**
 * Pure pose applicator for procedural Pixel Place avatars.
 * Used by Avatar3DViewer and unit-tested without a browser.
 */

export type PoseLimbTargets = {
  leftArm: { rotation: { x: number; y: number; z: number } };
  rightArm: { rotation: { x: number; y: number; z: number } };
  leftLeg: { rotation: { x: number; y: number; z: number } };
  rightLeg: { rotation: { x: number; y: number; z: number } };
  head: { position: { y: number }; rotation: { y: number; z: number } };
  character: { position: { y: number }; rotation: { z: number } };
};

type Vec3 = { x: number; y: number; z: number };

function setRot(target: { x: number; y: number; z: number }, x: number, y: number, z: number) {
  target.x = x;
  target.y = y;
  target.z = z;
}

export function applyAvatarPose(
  animation: string,
  t: number,
  limbs: PoseLimbTargets
): void {
  const { leftArm, rightArm, leftLeg, rightLeg, head, character } = limbs;

  const reset = () => {
    setRot(leftArm.rotation, 0, 0, 0);
    setRot(rightArm.rotation, 0, 0, 0);
    setRot(leftLeg.rotation, 0, 0, 0);
    setRot(rightLeg.rotation, 0, 0, 0);
    head.position.y = 2.1;
    head.rotation.y = 0;
    head.rotation.z = 0;
    character.position.y = 0;
    character.rotation.z = 0;
  };

  reset();

  if (animation === 'idle') {
    head.position.y = 2.1 + Math.sin(t * 2) * 0.02;
    leftArm.rotation.x = Math.sin(t * 1.5) * 0.1;
    rightArm.rotation.x = -Math.sin(t * 1.5) * 0.1;
  } else if (animation === 'walk') {
    leftLeg.rotation.x = Math.sin(t * 4) * 0.35;
    rightLeg.rotation.x = -Math.sin(t * 4) * 0.35;
    leftArm.rotation.x = -Math.sin(t * 4) * 0.3;
    rightArm.rotation.x = Math.sin(t * 4) * 0.3;
    character.position.y = Math.abs(Math.sin(t * 4)) * 0.08;
  } else if (animation === 'run') {
    leftLeg.rotation.x = Math.sin(t * 7) * 0.55;
    rightLeg.rotation.x = -Math.sin(t * 7) * 0.55;
    leftArm.rotation.x = -Math.sin(t * 7) * 0.5;
    rightArm.rotation.x = Math.sin(t * 7) * 0.5;
    character.position.y = Math.abs(Math.sin(t * 7)) * 0.14;
  } else if (animation === 'jump') {
    const jumpPhase = Math.abs(Math.sin(t * 3));
    character.position.y = jumpPhase * 0.55;
    leftLeg.rotation.x = -0.25;
    rightLeg.rotation.x = -0.25;
    leftArm.rotation.x = -0.35;
    rightArm.rotation.x = -0.35;
  } else if (animation === 'wave') {
    const wiggle = Math.sin(t * 4.2);
    rightArm.rotation.x = -Math.PI / 2.15 + wiggle * 0.12;
    rightArm.rotation.z = -0.95 + wiggle * 0.18;
    leftArm.rotation.x = 0.08;
    leftArm.rotation.z = 0.05;
    head.position.y = 2.1 + Math.sin(t * 2) * 0.015;
  } else if (animation === 'cheer') {
    const bob = Math.sin(t * 5);
    leftArm.rotation.x = -Math.PI / 1.15 + bob * 0.08;
    rightArm.rotation.x = -Math.PI / 1.15 - bob * 0.08;
    leftArm.rotation.z = 0.35;
    rightArm.rotation.z = -0.35;
    character.position.y = Math.abs(bob) * 0.06;
  } else if (animation === 'dance') {
    const sway = Math.sin(t * 3.5);
    leftArm.rotation.x = -0.4 + sway * 0.5;
    rightArm.rotation.x = -0.4 - sway * 0.5;
    leftArm.rotation.z = 0.4 + sway * 0.25;
    rightArm.rotation.z = -0.4 + sway * 0.25;
    leftLeg.rotation.x = sway * 0.2;
    rightLeg.rotation.x = -sway * 0.2;
    character.rotation.z = sway * 0.08;
    character.position.y = Math.abs(Math.sin(t * 7)) * 0.05;
  } else if (animation === 'flex') {
    leftArm.rotation.x = -1.15;
    rightArm.rotation.x = -1.15;
    leftArm.rotation.z = 1.05;
    rightArm.rotation.z = -1.05;
    head.rotation.y = Math.sin(t * 1.2) * 0.08;
  } else if (animation === 'point') {
    rightArm.rotation.x = -Math.PI / 2;
    rightArm.rotation.z = -0.15;
    leftArm.rotation.x = 0.12;
    head.rotation.y = 0.15;
  } else if (animation === 'think') {
    rightArm.rotation.x = -1.85;
    rightArm.rotation.z = -0.55;
    leftArm.rotation.x = 0.1;
    head.rotation.z = 0.12;
    head.rotation.y = -0.1;
  } else if (animation === 'salute') {
    rightArm.rotation.x = -2.05;
    rightArm.rotation.z = -0.35;
    leftArm.rotation.x = 0.05;
    head.rotation.y = 0.08;
  } else if (animation === 'shrug') {
    leftArm.rotation.x = -0.35;
    rightArm.rotation.x = -0.35;
    leftArm.rotation.z = 0.95;
    rightArm.rotation.z = -0.95;
    head.position.y = 2.12;
  } else if (animation === 'clap') {
    const clap = Math.abs(Math.sin(t * 8));
    leftArm.rotation.x = -1.1;
    rightArm.rotation.x = -1.1;
    leftArm.rotation.z = 0.55 - clap * 0.35;
    rightArm.rotation.z = -0.55 + clap * 0.35;
  } else if (animation === 'bow') {
    leftArm.rotation.x = 0.45;
    rightArm.rotation.x = 0.45;
    leftLeg.rotation.x = 0.35;
    rightLeg.rotation.x = 0.35;
    character.position.y = -0.25;
    head.position.y = 1.95;
  } else if (animation === 'sit') {
    leftLeg.rotation.x = -1.35;
    rightLeg.rotation.x = -1.35;
    leftArm.rotation.x = 0.25;
    rightArm.rotation.x = 0.25;
    character.position.y = -0.55;
  } else if (animation === 'kick') {
    const kick = Math.max(0, Math.sin(t * 4));
    rightLeg.rotation.x = -kick * 1.4;
    leftLeg.rotation.x = 0.15;
    leftArm.rotation.x = -0.2;
    rightArm.rotation.x = 0.25;
    character.position.y = kick * 0.08;
  } else if (animation === 'armsOut' || animation === 'tpose' || animation === 't-pose') {
    leftArm.rotation.z = Math.PI / 2;
    rightArm.rotation.z = -Math.PI / 2;
  } else if (animation === 'celebrate') {
    const hop = Math.abs(Math.sin(t * 5));
    character.position.y = hop * 0.35;
    leftArm.rotation.x = -Math.PI / 1.3;
    rightArm.rotation.x = -Math.PI / 1.3;
    leftArm.rotation.z = 0.55 + Math.sin(t * 6) * 0.2;
    rightArm.rotation.z = -0.55 - Math.sin(t * 6) * 0.2;
    leftLeg.rotation.x = -0.2;
    rightLeg.rotation.x = 0.2;
  }
  // 'none' / unknown → reset only
}

export function makePoseLimbTargets(): PoseLimbTargets {
  const rot = (): Vec3 => ({ x: 0, y: 0, z: 0 });
  return {
    leftArm: { rotation: rot() },
    rightArm: { rotation: rot() },
    leftLeg: { rotation: rot() },
    rightLeg: { rotation: rot() },
    head: { position: { y: 2.1 }, rotation: { y: 0, z: 0 } },
    character: { position: { y: 0 }, rotation: { z: 0 } },
  };
}

/** True when pose moved at least one limb/body channel away from the neutral reset. */
export function poseHasMotion(animation: string, t = 0.37): boolean {
  if (animation === 'none' || animation === 'no-animation' || animation === 'noAnimation') {
    return true; // intentional still pose
  }
  const limbs = makePoseLimbTargets();
  applyAvatarPose(animation, t, limbs);
  const neutral = makePoseLimbTargets();
  const changed =
    limbs.leftArm.rotation.x !== neutral.leftArm.rotation.x ||
    limbs.leftArm.rotation.z !== neutral.leftArm.rotation.z ||
    limbs.rightArm.rotation.x !== neutral.rightArm.rotation.x ||
    limbs.rightArm.rotation.z !== neutral.rightArm.rotation.z ||
    limbs.leftLeg.rotation.x !== neutral.leftLeg.rotation.x ||
    limbs.rightLeg.rotation.x !== neutral.rightLeg.rotation.x ||
    limbs.head.position.y !== neutral.head.position.y ||
    limbs.head.rotation.y !== neutral.head.rotation.y ||
    limbs.head.rotation.z !== neutral.head.rotation.z ||
    limbs.character.position.y !== neutral.character.position.y ||
    limbs.character.rotation.z !== neutral.character.rotation.z;
  return changed;
}
