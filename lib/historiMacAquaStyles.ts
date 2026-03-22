/**
 * Classic Mac OS X “Aqua” / unified toolbar era — glossy, pinstriped, “lickable.”
 * References: Tiger–Leopard window chrome, gel buttons, Lucida Grande hierarchy.
 */
import type { CSSProperties } from 'react';

/**
 * System UI face for HistoriMac — **Lucida Grande first** so macOS actually uses it
 * (putting -apple-system first would always pick San Francisco).
 */
export const AQUA_FONT =
  '"Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif';

/** Optional serif for marketing-style headlines; prefer {@link AQUA_FONT} for OS X–faithful UI */
export const AQUA_TITLE_SERIF =
  'ui-serif, "New York", "Iowan Old Style", Palatino, "Palatino Linotype", Georgia, "Times New Roman", serif';

/** Window / desktop: soft metallic (cards use horizontal pinstripes like infinitemac.org) */
export const aquaPinstripePage: CSSProperties = {
  backgroundColor: '#b0b0b0',
  backgroundImage: `
    repeating-linear-gradient(
      0deg,
      #f2f2f2 0px,
      #f2f2f2 1px,
      #dadada 1px,
      #dadada 2px
    ),
    linear-gradient(180deg, #cfcfcf 0%, #a5a5a5 100%)
  `,
};

/**
 * Version card shell — horizontal pinstripes (matches Infinite Mac “Run” cards).
 */
export const aquaCardInfiniteMac: CSSProperties = {
  backgroundColor: '#ececec',
  backgroundImage: `
    repeating-linear-gradient(
      0deg,
      #ffffff 0px,
      #ffffff 1px,
      #ebebeb 1px,
      #ebebeb 2px
    )
  `,
  borderRadius: 10,
  border: '1px solid rgba(0, 0, 0, 0.28)',
  boxShadow: `
    0 1px 0 rgba(255, 255, 255, 0.95) inset,
    0 2px 6px rgba(0, 0, 0, 0.14),
    0 10px 28px rgba(0, 0, 0, 0.1)
  `,
};

/** Coral “Unstable” pill from Infinite Mac */
export const aquaUnstableBadge: CSSProperties = {
  fontFamily: AQUA_FONT,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.02em',
  color: '#fff',
  textShadow: '0 1px 0 rgba(0,0,0,0.2)',
  padding: '4px 11px',
  borderRadius: 999,
  background: 'linear-gradient(180deg, #f8b4b4 0%, #e87878 45%, #d85858 100%)',
  border: '1px solid #b04040',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45)',
  whiteSpace: 'nowrap',
};

/**
 * Glossy pill “Run” control — specular highlight on top, black label (lickable).
 */
export const aquaRunButton: CSSProperties = {
  fontFamily: AQUA_FONT,
  fontWeight: 600,
  fontSize: 15,
  color: '#000',
  letterSpacing: '0.03em',
  border: '1px solid #9a9a9a',
  borderRadius: 999,
  padding: '11px 28px',
  background: `
    linear-gradient(180deg,
      rgba(255,255,255,0.98) 0%,
      rgba(255,255,255,0.55) 18%,
      rgba(255,255,255,0.15) 38%,
      transparent 52%),
    linear-gradient(180deg, #fafafa 0%, #e4e4e4 42%, #c8c8c8 100%)
  `,
  boxShadow: `
    inset 0 1px 0 rgba(255,255,255,1),
    inset 0 -1px 0 rgba(0,0,0,0.06),
    0 4px 12px rgba(0,0,0,0.22),
    0 1px 3px rgba(0,0,0,0.12)
  `,
  cursor: 'pointer',
};

/**
 * Run control — **pixel / flat** variant (horizontal 1px bands + hard bevel, no glossy pill).
 * Use on OS X cards when matching Infinite Mac “bitmap” chrome alongside pinstripe cards.
 */
export const aquaRunButtonPixel: CSSProperties = {
  fontFamily: AQUA_FONT,
  fontWeight: 700,
  fontSize: 14,
  color: '#000',
  letterSpacing: '0.04em',
  border: '2px solid #333',
  borderRadius: 2,
  padding: '10px 26px',
  backgroundColor: '#d8d8d8',
  backgroundImage: `
    repeating-linear-gradient(
      0deg,
      #ececec 0px,
      #ececec 1px,
      #d0d0d0 1px,
      #d0d0d0 2px
    )
  `,
  boxShadow: `
    inset 1px 1px 0 #fff,
    inset -1px -1px 0 #707070
  `,
  cursor: 'pointer',
  WebkitFontSmoothing: 'none',
  MozOsxFontSmoothing: 'grayscale',
  textRendering: 'optimizeSpeed',
};

/** Floating sheet / inspector panel */
export const aquaSheet: CSSProperties = {
  background: 'linear-gradient(180deg, #fafafa 0%, #ececec 100%)',
  borderRadius: 10,
  border: '1px solid rgba(0,0,0,0.35)',
  boxShadow: `
    0 1px 0 rgba(255,255,255,0.9) inset,
    0 12px 32px rgba(0,0,0,0.28),
    0 2px 4px rgba(0,0,0,0.15)
  `,
};

/** Unified titlebar / toolbar (graphite) */
export const aquaUnifiedToolbar: CSSProperties = {
  background: 'linear-gradient(180deg, #e4e4e4 0%, #b4b4b4 100%)',
  borderBottom: '1px solid #666',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85)',
};

/** Dark embed chrome (still Aqua-shaped controls on graphite) */
export const aquaEmbedToolbarDark: CSSProperties = {
  background: 'linear-gradient(180deg, #5c5c5c 0%, #3a3a3a 100%)',
  borderBottom: '1px solid #222',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
};

/** Inset text field (search) */
export const aquaTextField: CSSProperties = {
  fontFamily: AQUA_FONT,
  border: '1px solid #8a8a8a',
  borderTopColor: '#5a5a5a',
  borderRadius: 12,
  background: '#fff',
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.6)',
  outline: 'none',
  color: '#111',
};

/** Primary blue gel (default action) — white label */
export const aquaGelButtonBlue: CSSProperties = {
  fontFamily: AQUA_FONT,
  fontWeight: 600,
  fontSize: 14,
  color: '#fff',
  textShadow: '0 1px 1px rgba(0,40,90,0.45)',
  border: '1px solid #1a4d7a',
  borderRadius: 12,
  background: `
    linear-gradient(180deg,
      rgba(255,255,255,0.55) 0%,
      rgba(255,255,255,0.08) 35%,
      transparent 36%),
    linear-gradient(180deg, #7ec8fa 0%, #4a9ee6 45%, #2a7cc8 55%, #1a6ab8 100%)
  `,
  boxShadow: `
    inset 0 1px 0 rgba(255,255,255,0.55),
    inset 0 -1px 0 rgba(0,40,80,0.2),
    0 2px 4px rgba(0,60,120,0.35)
  `,
  cursor: 'pointer',
};

/** Secondary chrome / graphite button */
export const aquaGelButtonGraphite: CSSProperties = {
  fontFamily: AQUA_FONT,
  fontWeight: 600,
  fontSize: 12,
  color: '#222',
  textShadow: '0 1px 0 rgba(255,255,255,0.75)',
  border: '1px solid #666',
  borderRadius: 10,
  background: `
    linear-gradient(180deg, rgba(255,255,255,0.9) 0%, #e8e8e8 45%, #c8c8c8 55%, #b0b0b0 100%)
  `,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 2px rgba(0,0,0,0.2)',
  cursor: 'pointer',
};

/** Segmented control — inactive segment */
export const aquaSegmentOff: CSSProperties = {
  fontFamily: AQUA_FONT,
  fontSize: 12,
  fontWeight: 600,
  color: '#333',
  textShadow: '0 1px 0 rgba(255,255,255,0.8)',
  padding: '6px 14px',
  borderRadius: 8,
  border: '1px solid #888',
  background: 'linear-gradient(180deg, #f6f6f6 0%, #d4d4d4 100%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 1px rgba(0,0,0,0.12)',
  cursor: 'pointer',
};

/** Segmented — selected (blue) */
export const aquaSegmentOn: CSSProperties = {
  ...aquaSegmentOff,
  color: '#fff',
  textShadow: '0 1px 1px rgba(0,40,80,0.4)',
  border: '1px solid #1a5a8a',
  background: `
    linear-gradient(180deg, #6eb9ec 0%, #3a8cc8 50%, #2a7ab8 100%)
  `,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,40,80,0.25)',
};

/** Small “dot” traffic light */
export const aquaTrafficLight = (color: 'close' | 'min' | 'zoom'): CSSProperties => {
  const fills = {
    close: 'radial-gradient(circle at 30% 30%, #ff9a9a, #e04040 45%, #a02020)',
    min: 'radial-gradient(circle at 30% 30%, #fff6a0, #e8c040 45%, #c89820)',
    zoom: 'radial-gradient(circle at 30% 30%, #9af0a0, #40c050 45%, #208030)',
  };
  return {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: fills[color],
    border: '1px solid rgba(0,0,0,0.35)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), 0 1px 1px rgba(0,0,0,0.25)',
    flexShrink: 0,
  };
};

/** Toast / HUD sheet */
export const aquaHudToast: CSSProperties = {
  fontFamily: AQUA_FONT,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(235,235,240,0.98) 100%)',
  border: '1px solid rgba(0,0,0,0.35)',
  borderRadius: 12,
  boxShadow: '0 8px 28px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.9)',
  color: '#222',
  fontSize: 13,
  fontWeight: 600,
};

/** Embossed control on dark graphite toolbar */
export const aquaToolbarButtonDark: CSSProperties = {
  fontFamily: AQUA_FONT,
  fontSize: 11,
  fontWeight: 600,
  color: '#f5f5f5',
  textShadow: '0 -1px 0 rgba(0,0,0,0.6)',
  padding: '6px 14px',
  borderRadius: 8,
  border: '1px solid rgba(0,0,0,0.55)',
  background: 'linear-gradient(180deg, #6a6a6a 0%, #484848 100%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
  cursor: 'pointer',
};

/** Key action on dark toolbar (blue gel, compact) */
export const aquaToolbarButtonKeyDark: CSSProperties = {
  ...aquaToolbarButtonDark,
  border: '1px solid #1a4d7a',
  background: `
    linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 40%),
    linear-gradient(180deg, #5aa8e8 0%, #2a78c8 55%, #1a68b8 100%)
  `,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 1px 2px rgba(0,40,80,0.4)',
};

/** Light footer strip under embed (brushed) */
export const aquaEmbedFooterStrip: CSSProperties = {
  fontFamily: AQUA_FONT,
  background: 'linear-gradient(180deg, #e6e6e6 0%, #c8c8c8 100%)',
  borderTop: '1px solid #888',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75)',
};
