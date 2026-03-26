/** Binary signup choices */
export const GENDER_MALE = 'Male';
export const GENDER_FEMALE = 'Female';

/** Default when user opens the rainbow / “Other” path */
export const DEFAULT_EXTENDED_GENDER = 'Non-binary';

/**
 * Identities shown when the user selects the rainbow symbol (beyond only “Non-binary”).
 * Stored verbatim on the user profile.
 */
export const GENDER_IDENTITY_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'Non-binary', label: 'Non-binary' },
  { value: 'Agender', label: 'Agender' },
  { value: 'Genderfluid', label: 'Genderfluid' },
  { value: 'Genderqueer', label: 'Genderqueer' },
  { value: 'Bigender', label: 'Bigender' },
  { value: 'Two-Spirit', label: 'Two-Spirit' },
  { value: 'Trans man', label: 'Trans man' },
  { value: 'Trans woman', label: 'Trans woman' },
  { value: 'Demiboy', label: 'Demiboy' },
  { value: 'Demigirl', label: 'Demigirl' },
  { value: 'Intersex', label: 'Intersex' },
  { value: 'Pangender', label: 'Pangender' },
  { value: 'Another identity', label: 'Another identity' },
];

const EXTENDED_SET = new Set(GENDER_IDENTITY_OPTIONS.map((o) => o.value));

export function isMaleOrFemale(value: string): boolean {
  return value === GENDER_MALE || value === GENDER_FEMALE;
}

/** True when gender is any extended / rainbow path value (including legacy `Other`). */
export function isExtendedGenderBranch(value: string): boolean {
  if (!value.trim()) return false;
  if (isMaleOrFemale(value)) return false;
  return true;
}

/** Normalize stored value for <select> when it must match an option. */
export function coerceExtendedGenderForSelect(stored: string): string {
  if (EXTENDED_SET.has(stored)) return stored;
  if (stored === 'Other') return DEFAULT_EXTENDED_GENDER;
  return DEFAULT_EXTENDED_GENDER;
}
