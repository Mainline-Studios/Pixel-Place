import type { Anti67AccountState, UserAccountPreferences } from '@/types';

export const ANTI_67_AUDIO_URL = '/audio/anti-67.mp3';
export const ANTI_67_REQUIRED_PLAYS = 3;

export type Anti67State = Anti67AccountState;

export function getAnti67FromPreferences(
  prefs: UserAccountPreferences | undefined,
): Anti67State {
  const raw = prefs?.anti67;
  if (!raw || typeof raw !== 'object') {
    return { locked: false, playsCompleted: 0 };
  }
  const locked = (raw as Anti67State).locked === true;
  const playsCompleted = Math.min(
    ANTI_67_REQUIRED_PLAYS,
    Math.max(0, Number((raw as Anti67State).playsCompleted) || 0),
  );
  return { locked, playsCompleted };
}

export function isAnti67Blocking(prefs: UserAccountPreferences | undefined): boolean {
  const s = getAnti67FromPreferences(prefs);
  return s.locked;
}

export function canDismissAnti67(prefs: UserAccountPreferences | undefined): boolean {
  const s = getAnti67FromPreferences(prefs);
  return s.locked && s.playsCompleted >= ANTI_67_REQUIRED_PLAYS;
}

export function mergeAnti67IntoPreferences(
  prefs: UserAccountPreferences | undefined,
  anti67: Anti67State,
): UserAccountPreferences {
  return { ...(prefs || {}), anti67 };
}
