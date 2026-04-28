/**
 * Rule-based gates for user-provided asset names (no AI).
 * Blocks obvious slurs, CSAM-adjacent terms, and hate-symbol references in filenames.
 */

const DEFAULT_BLOCKED_FILENAME_FRAGMENTS = [
  'nazi',
  'swastika',
  'hitler',
  'ss-runen',
  '1488',
  'kkk',
  'isis',
  'beheading',
  'cp ',
  'childporn',
  'pedo',
  'rape',
  'goon',
  'coomer',
];

function envBlockedFragments(): string[] {
  const raw = process.env.MODERATION_ASSET_FILENAME_BLOCKLIST;
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export type AssetFileRuleResult = { ok: true } | { ok: false; reason: string };

export function evaluateAssetFileName(fileName: string): AssetFileRuleResult {
  if (!fileName || typeof fileName !== 'string') {
    return { ok: false, reason: 'missing_filename' };
  }
  const lower = fileName.toLowerCase().replace(/\+/g, ' ');
  const all = [...DEFAULT_BLOCKED_FILENAME_FRAGMENTS, ...envBlockedFragments()];
  for (const frag of all) {
    if (frag.length > 0 && lower.includes(frag)) {
      return { ok: false, reason: `blocked_filename:${frag}` };
    }
  }
  return { ok: true };
}
