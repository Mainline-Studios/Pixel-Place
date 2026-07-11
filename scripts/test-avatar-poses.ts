/**
 * Automated pose smoke test.
 * Run: npx tsx scripts/test-avatar-poses.ts
 */
import {
  applyAvatarPose,
  poseHasMotion,
  makePoseLimbTargets,
} from '../lib/applyAvatarPose';
import { AVATAR_POSES, normalizeAvatarPose } from '../lib/avatarPoses';

const POSES = [
  'idle',
  'wave',
  'cheer',
  'dance',
  'flex',
  'point',
  'think',
  'salute',
  'shrug',
  'clap',
  'bow',
  'sit',
  'kick',
  'walk',
  'run',
  'jump',
  'armsOut',
  'celebrate',
  'none',
] as const;

let failed = 0;

for (const p of POSES) {
  const ok = poseHasMotion(p, 0.37);
  const limbs = makePoseLimbTargets();
  applyAvatarPose(p, 0.37, limbs);
  const line = `${ok ? 'PASS' : 'FAIL'}  ${p.padEnd(12)} rightArm=(${limbs.rightArm.rotation.x.toFixed(3)}, z=${limbs.rightArm.rotation.z.toFixed(3)}) leftArm.z=${limbs.leftArm.rotation.z.toFixed(3)} char.y=${limbs.character.position.y.toFixed(3)}`;
  console.log(line);
  if (!ok) failed += 1;
}

const waveLimbs = makePoseLimbTargets();
applyAvatarPose('wave', 0.37, waveLimbs);
if (!(waveLimbs.rightArm.rotation.x < -1) || !(waveLimbs.rightArm.rotation.z < -0.5)) {
  console.error('FAIL  wave diagonal raise check');
  failed += 1;
} else {
  console.log('PASS  wave diagonal raise check');
}

const cheerLimbs = makePoseLimbTargets();
applyAvatarPose('cheer', 0.37, cheerLimbs);
if (!(cheerLimbs.rightArm.rotation.x < -2) || !(cheerLimbs.leftArm.rotation.x < -2)) {
  console.error('FAIL  cheer arms-up check');
  failed += 1;
} else {
  console.log('PASS  cheer arms-up check');
}

const armsLimbs = makePoseLimbTargets();
applyAvatarPose('armsOut', 0.37, armsLimbs);
if (Math.abs(Math.abs(armsLimbs.leftArm.rotation.z) - Math.PI / 2) > 0.05) {
  console.error('FAIL  armsOut T-pose check');
  failed += 1;
} else {
  console.log('PASS  armsOut T-pose check');
}

if (normalizeAvatarPose('wave') !== 'wave' || normalizeAvatarPose('nope') !== 'wave') {
  console.error('FAIL  normalizeAvatarPose');
  failed += 1;
} else {
  console.log('PASS  normalizeAvatarPose');
}

if (AVATAR_POSES.length < 10) {
  console.error('FAIL  pose catalog count', AVATAR_POSES.length);
  failed += 1;
} else {
  console.log('PASS  pose catalog count', AVATAR_POSES.length);
}

// Catalog ids must all be recognized by applicator
for (const pose of AVATAR_POSES) {
  if (!poseHasMotion(pose.id, 0.5) && pose.id !== 'none') {
    console.error('FAIL  catalog pose has no motion:', pose.id);
    failed += 1;
  }
}

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}

console.log(`\nAll pose checks passed (${POSES.length} poses).`);
