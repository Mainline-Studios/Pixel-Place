import type { HistoriMacCardTheme } from '@/lib/historiMacCardTheme';

/** Transparent PNG — System-era Run (from user asset, edge-flood white → α) */
export const HISTORIMAC_RUN_SYSTEM_SRC = '/images/games/historimac/run-system.png';

/** Transparent PNG — Platinum Run */
export const HISTORIMAC_RUN_PLATINUM_SRC = '/images/games/historimac/run-platinum.png';

export function historiMacRunUsesImage(theme: HistoriMacCardTheme): boolean {
  return theme === 'classic' || theme === 'platinum';
}

export function historiMacRunImageSrc(theme: HistoriMacCardTheme): string {
  return theme === 'classic' ? HISTORIMAC_RUN_SYSTEM_SRC : HISTORIMAC_RUN_PLATINUM_SRC;
}
