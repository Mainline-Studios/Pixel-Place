/**
 * Maps stored signup values to friendly labels (sidebar, settings, admin).
 * Extended identities are stored as chosen (e.g. Genderfluid). Legacy `Other` → umbrella label.
 */
export function formatGenderForDisplay(stored: string | undefined | null): string {
  const g = (stored ?? '').trim();
  if (!g || g === 'N/A') return 'Not set';

  const norm = g.toLowerCase();
  if (norm === 'male') return 'Boy';
  if (norm === 'female') return 'Girl';
  // Legacy signups before the extended dropdown
  if (norm === 'other') return 'Non-binary';

  return g;
}
