/** Lightweight client-side password hygiene hints (not a substitute for server rules). */
export type PasswordStrengthTier = 0 | 1 | 2 | 3 | 4;

export function getPasswordStrength(pw: string): {
  tier: PasswordStrengthTier;
  label: string;
  /** 0–1 for progress bars */
  fraction: number;
} {
  if (!pw.trim()) {
    return { tier: 0, label: 'Enter a password', fraction: 0 };
  }
  if (pw.length < 8) {
    return {
      tier: 0,
      label: 'Use at least 8 characters',
      fraction: Math.min(0.35, 0.08 * pw.length),
    };
  }
  let raw = 0;
  if (pw.length >= 8) raw++;
  if (pw.length >= 12) raw++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) raw++;
  if (/\d/.test(pw)) raw++;
  if (/[^a-zA-Z0-9]/.test(pw)) raw++;

  const tier = Math.min(4, Math.ceil((raw / 5) * 4)) as PasswordStrengthTier;
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'] as const;
  const fraction = (tier + 1) / 5;

  return { tier, label: labels[tier], fraction };
}
