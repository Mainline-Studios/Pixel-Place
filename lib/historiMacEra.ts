import type { HistoriMacVersion } from '@/lib/historiMacVersions';

/** Catalog bucket for picker filters (not stored on version rows — inferred). */
export type HistoriMacEraBucket = 'system' | 'macos9' | 'osx' | 'next' | 'special';

export const HISTORIMAC_ERA_ORDER: HistoriMacEraBucket[] = ['system', 'macos9', 'osx', 'next', 'special'];

export const HISTORIMAC_ERA_LABELS: Record<HistoriMacEraBucket, string> = {
  system: 'Classic System',
  macos9: 'Mac OS 9',
  osx: 'Mac OS X',
  next: 'NeXT',
  special: 'Spotlight',
};

/**
 * Infer era from id/label/warning for filter chips (no schema change on versions).
 */
export function inferHistoriMacEra(v: HistoriMacVersion): HistoriMacEraBucket {
  const id = v.id.toLowerCase();
  const label = v.label.toLowerCase();
  if (id.includes('next') || label.includes('next')) return 'next';
  if (id === 'macos9' || label.includes('mac os 9')) return 'macos9';
  if (id.startsWith('osx') || label.includes('os x') || label.includes('public beta')) return 'osx';
  if (id.includes('kanji') || v.warningBanner) return 'special';
  if (id.startsWith('system')) return 'system';
  return 'system';
}
