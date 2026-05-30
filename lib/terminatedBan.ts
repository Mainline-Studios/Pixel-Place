import type { Ban } from '@/types';

/** Firestore / API value for employment termination + permanent site block */
export const TERMINATED_BAN_KIND = 'terminated';

export const TERMINATED_LOCK_STORAGE_KEY = 'pixelplace_terminated_lock_v1';

export const TERMINATED_SUBJECT_DEFAULT = 'You';

export const TERMINATED_FIRE_MESSAGE = `YOU ARE FIRED.

Your access to Pixel Place is permanently revoked. Every browser and device profile linked to your accounts has been burned from our systems.

You will never see Pixel Place again. There is no appeal. There is no back door. There is no second chance.

Turn off the screen and walk away.`;

export function isTerminatedBan(ban: Ban | null | undefined): boolean {
  if (!ban) return false;
  return ban.banKind === TERMINATED_BAN_KIND;
}

export function terminatedSubjectFromBan(ban: Ban | null | undefined): string {
  const name = ban?.terminatedSubject?.trim();
  if (name) return name;
  const u = ban?.username?.trim();
  if (u && u !== 'This device') return u;
  return TERMINATED_SUBJECT_DEFAULT;
}

export function setTerminatedLockFlag(active: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (active) localStorage.setItem(TERMINATED_LOCK_STORAGE_KEY, '1');
    else localStorage.removeItem(TERMINATED_LOCK_STORAGE_KEY);
  } catch {
    /* private mode */
  }
}

export function hasTerminatedLockFlag(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(TERMINATED_LOCK_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}
