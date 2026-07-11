/** Showcase / Customize avatar poses for Avatar3DViewer */

export type AvatarPoseId =
  | 'idle'
  | 'wave'
  | 'cheer'
  | 'dance'
  | 'flex'
  | 'point'
  | 'think'
  | 'salute'
  | 'shrug'
  | 'clap'
  | 'bow'
  | 'sit'
  | 'kick'
  | 'run'
  | 'walk'
  | 'jump'
  | 'armsOut'
  | 'celebrate'
  | 'none';

export type AvatarPoseOption = {
  id: AvatarPoseId;
  label: string;
  blurb: string;
};

export const AVATAR_POSES: AvatarPoseOption[] = [
  { id: 'wave', label: 'Wave', blurb: 'Arm up diagonally — default friend showcase' },
  { id: 'idle', label: 'Idle', blurb: 'Gentle idle sway' },
  { id: 'cheer', label: 'Cheer', blurb: 'Both arms raised' },
  { id: 'dance', label: 'Dance', blurb: 'Side-to-side groove' },
  { id: 'flex', label: 'Flex', blurb: 'Show off the guns' },
  { id: 'point', label: 'Point', blurb: 'Pointing forward' },
  { id: 'think', label: 'Think', blurb: 'Hand to chin' },
  { id: 'salute', label: 'Salute', blurb: 'Hand to brow' },
  { id: 'shrug', label: 'Shrug', blurb: 'Who knows?' },
  { id: 'clap', label: 'Clap', blurb: 'Clapping hands' },
  { id: 'bow', label: 'Bow', blurb: 'Polite bow' },
  { id: 'sit', label: 'Sit', blurb: 'Seated crouch' },
  { id: 'kick', label: 'Kick', blurb: 'Front kick loop' },
  { id: 'walk', label: 'Walk', blurb: 'Walking cycle' },
  { id: 'run', label: 'Run', blurb: 'Faster run cycle' },
  { id: 'jump', label: 'Jump', blurb: 'Hopping loop' },
  { id: 'armsOut', label: 'T-Pose', blurb: 'Arms straight out' },
  { id: 'celebrate', label: 'Celebrate', blurb: 'Victory hop' },
  { id: 'none', label: 'Still', blurb: 'No motion' },
];

export const DEFAULT_AVATAR_POSE: AvatarPoseId = 'wave';

export function normalizeAvatarPose(value: unknown): AvatarPoseId {
  const id = String(value || '').trim();
  if (AVATAR_POSES.some((p) => p.id === id)) return id as AvatarPoseId;
  return DEFAULT_AVATAR_POSE;
}
