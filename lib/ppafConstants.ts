/** Must match functions/src/ppaf.ts */
export const PPAF_DOC_FORMAT = 'pixel-place-account-file';
export const PPAF_DOC_VERSION = 1;
/** Reject stale backups older than this many milliseconds (90 days). */
export const PPAF_MAX_RESTORE_AGE_MS = 90 * 24 * 60 * 60 * 1000;

export const PPAF_KEYGEN_COMMAND = 'node scripts/generate-ppaf-keys.mjs';
