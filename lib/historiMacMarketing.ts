/** Marketing copy + featured picks for HistoriMac catalog / SEO. */

export const HISTORIMAC_TAGLINE =
  'Classic Mac OS in your browser — from the original Macintosh to System 7, Mac OS 9, and NeXTSTEP. Play instantly and share invite links. Free, no install.';

export const HISTORIMAC_HERO_LEAD =
  'Every major era in one catalog. Pick a version, run the emulator fullscreen, and send friends a shareable invite link.';

export const HISTORIMAC_FEATURED_IDS = ['system7', 'macos9', 'nextstep1'] as const;

export const HISTORIMAC_FEATURED_BLURBS: Record<(typeof HISTORIMAC_FEATURED_IDS)[number], string> = {
  system7: 'The beige era — MultiFinder, Balloon Help, and the Finder you remember.',
  macos9: 'The last classic Mac OS — platinum chrome at its peak.',
  nextstep1: 'The black hardware that inspired Mac OS X.',
};
