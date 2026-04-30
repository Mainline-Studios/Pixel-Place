import type { User } from '@/types';

/** Builds a JSON-serializable snapshot without passwords or secrets. */
export function buildPrivacySafeProfileExport(user: User): Record<string, unknown> {
  const { password: _omit, ...rest } = user;
  return {
    ...rest,
    password: '[REDACTED]',
    exportedAt: new Date().toISOString(),
    exportNote:
      'Passwords are never included. Anyone with this file can see profile fields shown here — keep it private.',
  };
}

export function downloadPrivacySafeProfileJson(user: User): void {
  if (typeof window === 'undefined') return;
  const payload = buildPrivacySafeProfileExport(user);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  const safeName = (user.username || 'profile').replace(/[^\w.-]+/g, '_').slice(0, 64);
  a.href = URL.createObjectURL(blob);
  a.download = `pixel-place-profile-${safeName}.json`;
  a.rel = 'noopener';
  a.click();
  URL.revokeObjectURL(a.href);
}
