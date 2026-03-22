/**
 * Per-version **visual** chrome for HistoriMac cards (Infinite Mac–style eras).
 * Does not alter catalog copy — only typography, colors, and control shapes.
 */
import type { CSSProperties } from 'react';
import type { HistoriMacVersion } from '@/lib/historiMacVersions';
import {
  AQUA_FONT,
  aquaCardInfiniteMac,
  aquaGelButtonGraphite,
  aquaRunButton,
  aquaUnstableBadge,
  aquaPinstripePage,
  aquaSheet,
  aquaTextField,
  aquaSegmentOff,
  aquaSegmentOn,
  aquaHudToast,
} from '@/lib/historiMacAquaStyles';

export type HistoriMacCardTheme = 'classic' | 'platinum' | 'next' | 'aqua';

/** System 1–9 era cards / shell — low-res Macintosh “bitmapped” feel */
export function usesClassicPlatinumPixelUi(theme: HistoriMacCardTheme): boolean {
  return theme === 'classic' || theme === 'platinum';
}

/** Subtle 1×1-ish grid overlay (multiply) — “a bit pixelated” without hurting readability */
export function classicPlatinumPixelOverlayStyle(): CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    borderRadius: 'inherit',
    opacity: 0.055,
    backgroundImage: `
      repeating-linear-gradient(90deg, #000 0px, #000 1px, transparent 1px, transparent 4px),
      repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 4px)
    `,
    mixBlendMode: 'multiply',
  };
}

/** Sharper, less subpixel-smoothed type (closer to 1-bit / early CRT UI) */
export const classicPlatinumTextRenderStyle: CSSProperties = {
  WebkitFontSmoothing: 'none',
  MozOsxFontSmoothing: 'grayscale',
  textRendering: 'optimizeSpeed',
};

/** New York / early Mac marketing titles */
export const THEME_FONT_SERIF_TITLE =
  'ui-serif, "New York", "Iowan Old Style", Palatino, "Palatino Linotype", Georgia, "Times New Roman", serif';

/** Body / date — Helvetica era */
export const THEME_FONT_CLASSIC_SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif';

/** Run label — Chicago was bitmap; bold condensed sans reads closest on the web */
export const THEME_FONT_CHICAGO_LIKE = '"Helvetica Neue", Helvetica, Arial, sans-serif';

export function inferHistoriMacCardTheme(v: HistoriMacVersion): HistoriMacCardTheme {
  if (v.id === 'nextstep1') return 'next';
  if (v.id.startsWith('osx')) return 'aqua';
  if (v.id === 'system1' || v.id === 'system3' || v.id === 'system5') return 'classic';
  return 'platinum';
}

export function cardArticleStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
      return {
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        position: 'relative',
        ...classicPlatinumTextRenderStyle,
      };
    case 'platinum':
      return {
        backgroundColor: '#ffffff',
        border: '1px solid #b8b8b8',
        borderRadius: 8,
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,1),
          0 2px 8px rgba(0,0,0,0.08)
        `,
        position: 'relative',
        ...classicPlatinumTextRenderStyle,
      };
    case 'next':
      return {
        backgroundColor: '#999999',
        border: '1px solid #666666',
        borderRadius: 4,
        boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
      };
    case 'aqua':
      return { ...aquaCardInfiniteMac };
    default:
      return {};
  }
}

export function cardRunButtonStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
      return {
        fontFamily: THEME_FONT_CHICAGO_LIKE,
        fontWeight: 800,
        fontSize: 14,
        letterSpacing: '0.04em',
        color: '#000',
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: 6,
        padding: '8px 22px',
        cursor: 'pointer',
        boxShadow: 'none',
      };
    case 'platinum':
      return {
        fontFamily: THEME_FONT_CLASSIC_SANS,
        fontWeight: 700,
        fontSize: 14,
        color: '#000',
        background: 'linear-gradient(180deg, #f0f0f0 0%, #d8d8d8 100%)',
        border: '1px solid #000',
        borderRadius: 4,
        padding: '8px 22px',
        cursor: 'pointer',
        boxShadow: `
          inset 1px 1px 0 rgba(255,255,255,0.95),
          inset -1px -1px 0 rgba(0,0,0,0.2)
        `,
      };
    case 'next':
      return {
        fontFamily: THEME_FONT_CLASSIC_SANS,
        fontWeight: 800,
        fontSize: 14,
        color: '#000',
        backgroundColor: '#cccccc',
        borderTop: '2px solid #ffffff',
        borderLeft: '2px solid #ffffff',
        borderBottom: '2px solid #000000',
        borderRight: '2px solid #000000',
        borderRadius: 0,
        padding: '8px 22px',
        cursor: 'pointer',
        boxShadow: 'none',
      };
    case 'aqua':
      return { ...aquaRunButton };
    default:
      return {};
  }
}

export function cardFavButtonStyle(theme: HistoriMacCardTheme, favorited: boolean): CSSProperties {
  const base: CSSProperties = {
    flexShrink: 0,
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    cursor: 'pointer',
    padding: 0,
  };
  switch (theme) {
    case 'classic':
      return {
        ...base,
        borderRadius: 6,
        border: '2px solid #000',
        background: '#fff',
        color: favorited ? '#000' : '#333',
      };
    case 'platinum':
      return {
        ...base,
        borderRadius: 4,
        border: '1px solid #000',
        background: 'linear-gradient(180deg, #eee 0%, #ccc 100%)',
        boxShadow: 'inset 1px 1px 0 #fff, inset -1px -1px 0 rgba(0,0,0,0.15)',
        color: favorited ? '#b8860b' : '#333',
      };
    case 'next':
      return {
        ...base,
        borderRadius: 0,
        borderTop: '2px solid #fff',
        borderLeft: '2px solid #fff',
        borderBottom: '2px solid #000',
        borderRight: '2px solid #000',
        background: '#b0b0b0',
        color: favorited ? '#ffd700' : '#222',
      };
    case 'aqua':
      return {
        ...base,
        borderRadius: 10,
        ...aquaGelButtonGraphite,
        width: 40,
        height: 40,
        padding: 0,
        color: favorited ? '#b8860b' : '#666',
      };
    default:
      return base;
  }
}

export function unstableBadgeStyle(theme: HistoriMacCardTheme): CSSProperties {
  if (theme === 'aqua') return { ...aquaUnstableBadge };
  if (theme === 'classic') {
    return {
      fontFamily: THEME_FONT_CHICAGO_LIKE,
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: '0.08em',
      color: '#000',
      padding: '4px 8px',
      borderRadius: 4,
      border: '2px solid #000',
      background: '#ffcccc',
      whiteSpace: 'nowrap',
    };
  }
  if (theme === 'next') {
    return {
      fontFamily: THEME_FONT_CLASSIC_SANS,
      fontSize: 11,
      fontWeight: 700,
      color: '#fff',
      padding: '4px 10px',
      borderRadius: 4,
      background: '#a04040',
      border: '1px solid #000',
      whiteSpace: 'nowrap',
    };
  }
  // platinum
  return {
    fontFamily: THEME_FONT_CLASSIC_SANS,
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    padding: '4px 10px',
    borderRadius: 4,
    background: 'linear-gradient(180deg, #e8a0a0, #c05050)',
    border: '1px solid #000',
    boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.35)',
    whiteSpace: 'nowrap',
  };
}

export function eraChipStyle(theme: HistoriMacCardTheme): CSSProperties {
  if (theme === 'next') {
    return {
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      padding: '3px 8px',
      borderRadius: 4,
      background: 'rgba(0,0,0,0.15)',
      border: '1px solid rgba(0,0,0,0.35)',
      color: '#111',
      fontFamily: THEME_FONT_CLASSIC_SANS,
    };
  }
  if (theme === 'aqua') {
    return {
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      padding: '3px 8px',
      borderRadius: 6,
      background: 'rgba(0,0,0,0.06)',
      border: '1px solid rgba(0,0,0,0.12)',
      color: '#555',
      fontFamily: AQUA_FONT,
    };
  }
  return {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    padding: '3px 8px',
    borderRadius: 4,
    background: '#f0f0f0',
    border: '1px solid #999',
    color: '#333',
    fontFamily: THEME_FONT_CLASSIC_SANS,
  };
}

export function themeYearStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
      return {
        fontSize: 13,
        fontWeight: 500,
        color: '#888888',
        fontFamily: THEME_FONT_CLASSIC_SANS,
      };
    case 'platinum':
      return {
        fontSize: 13,
        fontWeight: 500,
        color: '#666666',
        fontFamily: THEME_FONT_CLASSIC_SANS,
      };
    case 'next':
      return {
        fontSize: 13,
        fontWeight: 600,
        color: '#333333',
        fontFamily: THEME_FONT_CLASSIC_SANS,
      };
    case 'aqua':
      return {
        fontSize: 13,
        fontWeight: 500,
        color: '#666666',
        fontFamily: AQUA_FONT,
      };
    default:
      return {};
  }
}

export function themeBlurbStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
    case 'platinum':
      return {
        fontSize: 13,
        lineHeight: 1.55,
        color: '#000',
        fontFamily: THEME_FONT_CLASSIC_SANS,
      };
    case 'next':
      return {
        fontSize: 13,
        lineHeight: 1.55,
        color: '#000',
        fontFamily: THEME_FONT_CLASSIC_SANS,
      };
    case 'aqua':
      return {
        fontSize: 13,
        lineHeight: 1.5,
        color: '#444',
        fontFamily: AQUA_FONT,
      };
    default:
      return {};
  }
}

export function themeDetailsLinkStyle(theme: HistoriMacCardTheme): CSSProperties {
  const base: CSSProperties = {
    marginTop: 12,
    padding: '6px 0',
    border: 'none',
    background: 'none',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  };
  switch (theme) {
    case 'classic':
      return { ...base, color: '#000', fontFamily: THEME_FONT_CLASSIC_SANS };
    case 'platinum':
      return { ...base, color: '#0066cc', fontFamily: THEME_FONT_CLASSIC_SANS };
    case 'next':
      return { ...base, color: '#111', fontFamily: THEME_FONT_CLASSIC_SANS };
    case 'aqua':
      return { ...base, color: '#0066cc', fontFamily: AQUA_FONT };
    default:
      return base;
  }
}

export function themeExpandedHeadingStyle(theme: HistoriMacCardTheme): CSSProperties {
  const base = {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    marginBottom: 6,
  };
  switch (theme) {
    case 'next':
      return { ...base, color: '#222', fontFamily: THEME_FONT_CLASSIC_SANS };
    case 'aqua':
      return { ...base, color: '#5a5a5a', fontFamily: AQUA_FONT };
    default:
      return { ...base, color: '#444', fontFamily: THEME_FONT_CLASSIC_SANS };
  }
}

export function themeExpandedBodyStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'next':
      return { fontSize: 13, lineHeight: 1.6, color: '#000', fontFamily: THEME_FONT_CLASSIC_SANS };
    case 'aqua':
      return { fontSize: 13, lineHeight: 1.6, color: '#222', fontFamily: AQUA_FONT };
    default:
      return { fontSize: 13, lineHeight: 1.6, color: '#111', fontFamily: THEME_FONT_CLASSIC_SANS };
  }
}

export function themeExpandedSubtitleStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'next':
      return { fontSize: 12, fontWeight: 600, color: '#111', marginBottom: 8, fontFamily: THEME_FONT_CLASSIC_SANS };
    case 'aqua':
      return { fontSize: 12, fontWeight: 600, color: '#222', marginBottom: 8, fontFamily: AQUA_FONT };
    default:
      return { fontSize: 12, fontWeight: 600, color: '#111', marginBottom: 8, fontFamily: THEME_FONT_CLASSIC_SANS };
  }
}

export function themeWarningBoxStyle(theme: HistoriMacCardTheme): CSSProperties {
  if (theme === 'classic') {
    return {
      marginBottom: 12,
      padding: '12px',
      background: '#ffdddd',
      border: '2px solid #000',
      borderRadius: 4,
      textAlign: 'center' as const,
    };
  }
  if (theme === 'next') {
    return {
      marginBottom: 12,
      padding: '12px',
      background: '#c88',
      border: '2px solid #000',
      borderRadius: 2,
      textAlign: 'center' as const,
    };
  }
  if (theme === 'aqua') {
    return {
      marginBottom: 12,
      padding: '12px',
      background: 'linear-gradient(180deg, #fee2e2, #fecaca)',
      border: '2px solid #dc2626',
      borderRadius: 10,
      textAlign: 'center' as const,
    };
  }
  return {
    marginBottom: 12,
    padding: '12px',
    background: 'linear-gradient(180deg, #fde8e8, #f5caca)',
    border: '2px solid #000',
    borderRadius: 6,
    textAlign: 'center' as const,
  };
}

export function themeWarningTextStyle(theme: HistoriMacCardTheme): CSSProperties {
  if (theme === 'aqua') {
    return { fontFamily: AQUA_FONT, fontSize: 12, fontWeight: 700, color: '#991b1b', lineHeight: 1.5 };
  }
  return {
    fontFamily: THEME_FONT_CLASSIC_SANS,
    fontSize: 12,
    fontWeight: 700,
    color: '#000',
    lineHeight: 1.5,
  };
}

export function themeExpandedBorderColor(theme: HistoriMacCardTheme): string {
  if (theme === 'next') return 'rgba(0,0,0,0.25)';
  if (theme === 'aqua') return '#ccc';
  return '#ccc';
}

// --- Picker shell (matches **last played** version era) ---

export function shellRootStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
      return {
        backgroundColor: '#dcdcdc',
        backgroundImage: 'none',
        ...classicPlatinumTextRenderStyle,
      };
    case 'platinum':
      return {
        backgroundColor: '#c8c8c8',
        backgroundImage: 'linear-gradient(180deg, #d8d8d8 0%, #b8b8b8 100%)',
        ...classicPlatinumTextRenderStyle,
      };
    case 'next':
      return {
        backgroundColor: '#6a6a6a',
        backgroundImage: 'none',
      };
    case 'aqua':
    default:
      return { ...aquaPinstripePage };
  }
}

export function shellBodyFont(theme: HistoriMacCardTheme): string {
  return theme === 'aqua' ? AQUA_FONT : THEME_FONT_CLASSIC_SANS;
}

export function shellHeroSheetStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
      return {
        background: '#ffffff',
        borderRadius: 8,
        border: '2px solid #000',
        boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
        position: 'relative',
        ...classicPlatinumTextRenderStyle,
      };
    case 'platinum':
      return {
        ...aquaSheet,
        borderRadius: 10,
        position: 'relative',
        ...classicPlatinumTextRenderStyle,
      };
    case 'next':
      return {
        backgroundColor: '#999999',
        borderRadius: 4,
        border: '2px solid #333',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
      };
    case 'aqua':
    default:
      return { ...aquaSheet };
  }
}

export function shellHeroTitlebarStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
      return {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: '#fff',
        borderBottom: '2px solid #000',
      };
    case 'platinum':
      return {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: 'linear-gradient(180deg, #ececec 0%, #c8c8c8 100%)',
        borderBottom: '1px solid #666',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85)',
      };
    case 'next':
      return {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: '#666666',
        borderBottom: '2px solid #000',
      };
    case 'aqua':
    default:
      return {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: 'linear-gradient(180deg, #ededed 0%, #c8c8c8 100%)',
        borderBottom: '1px solid #888',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
      };
  }
}

export function shellHeroTitleStyle(theme: HistoriMacCardTheme): CSSProperties {
  const base: CSSProperties = {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 700,
  };
  switch (theme) {
    case 'classic':
      return { ...base, fontFamily: THEME_FONT_CHICAGO_LIKE, color: '#000', letterSpacing: '0.06em' };
    case 'platinum':
      return {
        ...base,
        fontFamily: THEME_FONT_SERIF_TITLE,
        color: '#111',
        textShadow: '0 1px 0 rgba(255,255,255,0.7)',
      };
    case 'next':
      return { ...base, fontFamily: THEME_FONT_CLASSIC_SANS, color: '#f0f0f0', textShadow: '0 -1px 0 #000' };
    case 'aqua':
    default:
      return {
        ...base,
        fontFamily: AQUA_FONT,
        color: '#333',
        textShadow: '0 1px 0 rgba(255,255,255,0.8)',
      };
  }
}

export function shellShowTrafficLights(theme: HistoriMacCardTheme): boolean {
  return theme === 'aqua';
}

export function shellHeroBodyMuted(theme: HistoriMacCardTheme): string {
  switch (theme) {
    case 'next':
      return '#222';
    case 'classic':
      return '#555';
    default:
      return '#666';
  }
}

export function shellHeroBodyText(theme: HistoriMacCardTheme): string {
  if (theme === 'next') return '#000';
  return '#444';
}

export function shellH1Style(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
    case 'platinum':
      return {
        fontFamily: THEME_FONT_SERIF_TITLE,
        fontSize: 'clamp(22px, 4.5vw, 32px)',
        fontWeight: 700,
        margin: '0 0 12px',
        lineHeight: 1.2,
        color: '#000',
      };
    case 'next':
      return {
        fontFamily: THEME_FONT_SERIF_TITLE,
        fontSize: 'clamp(22px, 4.5vw, 32px)',
        fontWeight: 700,
        margin: '0 0 12px',
        lineHeight: 1.2,
        color: '#000',
      };
    case 'aqua':
    default:
      return {
        fontFamily: AQUA_FONT,
        fontSize: 'clamp(22px, 4.5vw, 32px)',
        fontWeight: 700,
        margin: '0 0 12px',
        lineHeight: 1.2,
        color: '#111',
        textShadow: '0 1px 0 rgba(255,255,255,0.95)',
        letterSpacing: '-0.02em',
      };
  }
}

export function shellH1AccentColor(theme: HistoriMacCardTheme): string {
  if (theme === 'aqua') return '#0066cc';
  if (theme === 'next') return '#222';
  return '#000';
}

export function shellBackButtonStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
      return {
        fontFamily: THEME_FONT_CHICAGO_LIKE,
        fontSize: 11,
        fontWeight: 800,
        padding: '8px 16px',
        color: '#000',
        background: '#fff',
        border: '2px solid #000',
        borderRadius: 6,
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      };
    case 'platinum':
      return {
        ...aquaGelButtonGraphite,
        fontSize: 11,
        padding: '8px 16px',
        boxShadow: `${aquaGelButtonGraphite.boxShadow}, 0 4px 12px rgba(0,0,0,0.15)`,
      };
    case 'next':
      return {
        fontFamily: THEME_FONT_CLASSIC_SANS,
        fontSize: 11,
        fontWeight: 800,
        padding: '8px 16px',
        color: '#000',
        background: '#ccc',
        borderTop: '2px solid #fff',
        borderLeft: '2px solid #fff',
        borderBottom: '2px solid #000',
        borderRight: '2px solid #000',
        cursor: 'pointer',
      };
    case 'aqua':
    default:
      return {
        ...aquaGelButtonGraphite,
        fontSize: 11,
        padding: '8px 16px',
        boxShadow: `${aquaGelButtonGraphite.boxShadow}, 0 4px 16px rgba(0,0,0,0.2)`,
      };
  }
}

export function shellSearchFieldStyle(theme: HistoriMacCardTheme): CSSProperties {
  const base: CSSProperties = {
    flex: '1 1 220px',
    minWidth: 0,
    padding: '10px 14px',
    fontSize: 14,
    fontFamily: theme === 'aqua' ? AQUA_FONT : THEME_FONT_CLASSIC_SANS,
  };
  switch (theme) {
    case 'classic':
      return {
        ...base,
        border: '2px solid #000',
        borderRadius: 4,
        background: '#fff',
        color: '#000',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
        outline: 'none',
      };
    case 'platinum':
      return {
        ...base,
        ...aquaTextField,
      };
    case 'next':
      return {
        ...base,
        border: '2px solid #000',
        borderRadius: 0,
        background: '#eee',
        color: '#000',
        boxShadow: 'inset 1px 1px 0 #fff',
        outline: 'none',
      };
    case 'aqua':
    default:
      return { ...base, ...aquaTextField };
  }
}

export function shellSortButtonStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
      return {
        fontFamily: THEME_FONT_CHICAGO_LIKE,
        fontWeight: 800,
        fontSize: 12,
        padding: '10px 16px',
        whiteSpace: 'nowrap',
        color: '#000',
        background: '#fff',
        border: '2px solid #000',
        borderRadius: 6,
        cursor: 'pointer',
      };
    case 'next':
      return {
        fontFamily: THEME_FONT_CLASSIC_SANS,
        fontWeight: 800,
        fontSize: 12,
        padding: '10px 16px',
        whiteSpace: 'nowrap',
        color: '#000',
        background: '#ccc',
        borderTop: '2px solid #fff',
        borderLeft: '2px solid #fff',
        borderBottom: '2px solid #000',
        borderRight: '2px solid #000',
        cursor: 'pointer',
      };
    case 'platinum':
    case 'aqua':
    default:
      return {
        ...aquaGelButtonGraphite,
        padding: '10px 16px',
        whiteSpace: 'nowrap',
      };
  }
}

export function shellSegmentOffStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
      return {
        fontFamily: THEME_FONT_CHICAGO_LIKE,
        fontSize: 11,
        fontWeight: 800,
        color: '#000',
        padding: '6px 12px',
        borderRadius: 4,
        border: '2px solid #000',
        background: '#fff',
        cursor: 'pointer',
      };
    case 'next':
      return {
        fontFamily: THEME_FONT_CLASSIC_SANS,
        fontSize: 12,
        fontWeight: 700,
        color: '#000',
        padding: '6px 12px',
        borderRadius: 0,
        borderTop: '2px solid #ccc',
        borderLeft: '2px solid #ccc',
        borderBottom: '2px solid #333',
        borderRight: '2px solid #333',
        background: '#aaa',
        cursor: 'pointer',
      };
    case 'platinum':
    case 'aqua':
    default:
      return { ...aquaSegmentOff };
  }
}

export function shellSegmentOnStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
      return {
        fontFamily: THEME_FONT_CHICAGO_LIKE,
        fontSize: 11,
        fontWeight: 800,
        color: '#fff',
        padding: '6px 12px',
        borderRadius: 4,
        border: '2px solid #000',
        background: '#000',
        cursor: 'pointer',
      };
    case 'next':
      return {
        fontFamily: THEME_FONT_CLASSIC_SANS,
        fontSize: 12,
        fontWeight: 800,
        color: '#000',
        padding: '6px 12px',
        borderRadius: 0,
        borderTop: '2px solid #fff',
        borderLeft: '2px solid #fff',
        borderBottom: '2px solid #000',
        borderRight: '2px solid #000',
        background: '#ddd',
        cursor: 'pointer',
      };
    case 'platinum':
    case 'aqua':
    default:
      return { ...aquaSegmentOn };
  }
}

export function shellToolbarLabelStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'next':
      return { fontSize: 11, fontWeight: 800, color: '#eee', marginRight: 4, fontFamily: THEME_FONT_CLASSIC_SANS };
    case 'classic':
      return { fontSize: 11, fontWeight: 800, color: '#000', marginRight: 4, fontFamily: THEME_FONT_CHICAGO_LIKE };
    case 'aqua':
    default:
      return {
        fontSize: 11,
        fontWeight: 700,
        color: '#444',
        marginRight: 4,
        textShadow: '0 1px 0 rgba(255,255,255,0.5)',
        fontFamily: AQUA_FONT,
      };
  }
}

export function shellSectionHeadingStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
      return {
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#000',
        margin: '0 0 16px',
        textAlign: 'center',
        fontFamily: THEME_FONT_CHICAGO_LIKE,
      };
    case 'next':
      return {
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#f5f5f5',
        margin: '0 0 16px',
        textAlign: 'center',
        fontFamily: THEME_FONT_CLASSIC_SANS,
        textShadow: '0 1px 0 #000',
      };
    case 'platinum':
      return {
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#333',
        margin: '0 0 16px',
        textAlign: 'center',
        fontFamily: THEME_FONT_SERIF_TITLE,
      };
    case 'aqua':
    default:
      return {
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#444',
        margin: '0 0 16px',
        textAlign: 'center',
        textShadow: '0 1px 0 rgba(255,255,255,0.5)',
        fontFamily: AQUA_FONT,
      };
  }
}

export function shellFavoritesPanelStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
      return {
        padding: '16px',
        background: '#fff',
        border: '2px solid #000',
        borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      };
    case 'next':
      return {
        padding: '16px',
        background: '#999',
        border: '2px solid #000',
        borderRadius: 4,
      };
    case 'platinum':
      return {
        ...aquaSheet,
        padding: '16px',
        background: 'linear-gradient(180deg, #fffef8 0%, #f0ead8 100%)',
        border: '1px solid #a89870',
      };
    case 'aqua':
    default:
      return {
        ...aquaSheet,
        padding: '16px',
        background: 'linear-gradient(180deg, #fffef5 0%, #f5f0dc 100%)',
        border: '1px solid #c9b87a',
      };
  }
}

export function shellFavoritesLabelStyle(theme: HistoriMacCardTheme): CSSProperties {
  const base = {
    fontSize: 11,
    fontWeight: 800,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    marginBottom: 10,
  };
  switch (theme) {
    case 'classic':
      return { ...base, color: '#000', fontFamily: THEME_FONT_CHICAGO_LIKE };
    case 'next':
      return { ...base, color: '#111', fontFamily: THEME_FONT_CLASSIC_SANS };
    case 'platinum':
      return { ...base, color: '#6a5a28', fontFamily: THEME_FONT_CLASSIC_SANS };
    case 'aqua':
    default:
      return { ...base, color: '#8a7220', fontFamily: AQUA_FONT };
  }
}

export function shellPickPillStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
      return {
        fontFamily: THEME_FONT_CHICAGO_LIKE,
        fontWeight: 800,
        fontSize: 12,
        padding: '8px 14px',
        color: '#000',
        background: '#fff',
        border: '2px solid #000',
        borderRadius: 6,
        cursor: 'pointer',
      };
    case 'next':
      return {
        fontFamily: THEME_FONT_CLASSIC_SANS,
        fontWeight: 800,
        fontSize: 13,
        padding: '8px 14px',
        color: '#000',
        background: '#ccc',
        borderTop: '2px solid #fff',
        borderLeft: '2px solid #fff',
        borderBottom: '2px solid #000',
        borderRight: '2px solid #000',
        cursor: 'pointer',
      };
    case 'platinum':
    case 'aqua':
    default:
      return {
        ...aquaGelButtonGraphite,
        padding: '8px 14px',
        fontSize: 13,
        borderColor: '#a89860',
      };
  }
}

export function shellResumeStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
      return {
        width: '100%',
        padding: '14px 18px',
        cursor: 'pointer',
        textAlign: 'left' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
        background: '#fff',
        border: '2px solid #000',
        borderRadius: 8,
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
      };
    case 'next':
      return {
        width: '100%',
        padding: '14px 18px',
        cursor: 'pointer',
        textAlign: 'left' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
        background: '#b0b0b0',
        border: '2px solid #000',
        borderRadius: 0,
      };
    case 'platinum':
      return {
        width: '100%',
        padding: '14px 18px',
        ...aquaSheet,
        cursor: 'pointer',
        textAlign: 'left' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
        border: '1px solid #666',
        background: 'linear-gradient(180deg, #f5f5f5 0%, #d8d8d8 100%)',
      };
    case 'aqua':
    default:
      return {
        width: '100%',
        padding: '14px 18px',
        ...aquaSheet,
        cursor: 'pointer',
        textAlign: 'left' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
        border: '1px solid #4a8cc8',
        background: 'linear-gradient(180deg, #eef6ff 0%, #d0e8fc 100%)',
      };
  }
}

export function shellResumeFont(theme: HistoriMacCardTheme): CSSProperties {
  return {
    fontWeight: 700,
    fontSize: 15,
    color: theme === 'next' ? '#000' : '#111',
    fontFamily: shellBodyFont(theme),
  };
}

export function shellResumeAccent(theme: HistoriMacCardTheme): string {
  if (theme === 'classic') return '#000';
  if (theme === 'next') return '#111';
  return '#0066cc';
}

export function shellWhisperButtonStyle(theme: HistoriMacCardTheme): CSSProperties {
  const font = shellBodyFont(theme);
  switch (theme) {
    case 'classic':
      return {
        display: 'block',
        width: '100%',
        maxWidth: 480,
        margin: '14px auto 0',
        padding: '8px 12px',
        border: '2px dashed #000',
        borderRadius: 4,
        background: '#f5f5f5',
        cursor: 'pointer',
        fontSize: 11,
        lineHeight: 1.45,
        color: '#444',
        fontStyle: 'italic',
        textAlign: 'center',
        fontFamily: font,
      };
    case 'next':
      return {
        display: 'block',
        width: '100%',
        maxWidth: 480,
        margin: '14px auto 0',
        padding: '8px 12px',
        border: '1px solid #333',
        borderRadius: 0,
        background: '#888',
        cursor: 'pointer',
        fontSize: 11,
        lineHeight: 1.45,
        color: '#111',
        fontStyle: 'italic',
        textAlign: 'center',
        fontFamily: font,
      };
    case 'platinum':
    case 'aqua':
    default:
      return {
        display: 'block',
        width: '100%',
        maxWidth: 480,
        margin: '14px auto 0',
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: 8,
        background: 'linear-gradient(180deg, #f8f8f8, #eaeaea)',
        cursor: 'pointer',
        fontSize: 11,
        lineHeight: 1.45,
        color: '#777',
        fontStyle: 'italic',
        textAlign: 'center',
        fontFamily: font,
        boxShadow: 'inset 0 1px 0 #fff',
      };
  }
}

export function shellStatsPillStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
      return {
        ...shellSegmentOffStyle('classic'),
        cursor: 'default',
        fontSize: 12,
      };
    case 'next':
      return {
        ...shellSegmentOffStyle('next'),
        cursor: 'default',
        fontSize: 12,
      };
    case 'platinum':
    case 'aqua':
    default:
      return {
        ...aquaSegmentOff,
        cursor: 'default',
        fontSize: 12,
        color: '#333',
      };
  }
}

export function shellKbdHintStyle(theme: HistoriMacCardTheme): CSSProperties {
  if (theme === 'next') {
    return { fontSize: 12, color: '#e8e8e8', fontFamily: THEME_FONT_CLASSIC_SANS };
  }
  if (theme === 'classic') {
    return { fontSize: 12, color: '#333', fontFamily: THEME_FONT_CLASSIC_SANS };
  }
  return { fontSize: 12, color: '#555', fontFamily: AQUA_FONT };
}

export function shellToastStyle(theme: HistoriMacCardTheme): CSSProperties {
  switch (theme) {
    case 'classic':
      return {
        fontFamily: THEME_FONT_CLASSIC_SANS,
        background: '#fff',
        border: '2px solid #000',
        borderRadius: 8,
        color: '#000',
        fontSize: 13,
        fontWeight: 600,
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      };
    case 'next':
      return {
        fontFamily: THEME_FONT_CLASSIC_SANS,
        background: '#ccc',
        border: '2px solid #000',
        borderRadius: 0,
        color: '#000',
        fontSize: 13,
        fontWeight: 700,
        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
      };
    case 'platinum':
      return {
        fontFamily: THEME_FONT_CLASSIC_SANS,
        background: 'linear-gradient(180deg, #fafafa, #e8e8e8)',
        border: '1px solid #000',
        borderRadius: 8,
        color: '#111',
        fontSize: 13,
        fontWeight: 600,
        boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
      };
    case 'aqua':
    default:
      return {
        ...aquaHudToast,
        boxShadow: `${aquaHudToast.boxShadow}, 0 4px 24px rgba(0,0,0,0.25)`,
      };
  }
}

/** Outer chrome for timeline strip — same era as last played */
export function shellTimelineCardStyle(theme: HistoriMacCardTheme): CSSProperties {
  return {
    width: '100%',
    maxWidth: 'min(900px, 100%)',
    margin: '0 auto',
    ...cardArticleStyle(theme),
    padding: '16px 18px 14px',
  };
}

export type TimelineStripChrome = {
  headerBorder: string;
  titleColor: string;
  bodyColor: string;
  strongColor: string;
  accentStrong: string;
  font: string;
  showLights: boolean;
  trackStyle: CSSProperties;
  tickColor: string;
  dotStyle: CSSProperties;
};

export function timelineStripChrome(theme: HistoriMacCardTheme): TimelineStripChrome {
  const trackBase: CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 5,
    marginTop: -2,
  };
  const dotBase: CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 18,
    height: 18,
    cursor: 'pointer',
    padding: 0,
  };

  switch (theme) {
    case 'classic':
      return {
        headerBorder: '2px solid #000',
        titleColor: '#000',
        bodyColor: '#333',
        strongColor: '#000',
        accentStrong: '#000',
        font: THEME_FONT_CLASSIC_SANS,
        showLights: false,
        trackStyle: {
          ...trackBase,
          borderRadius: 2,
          background: '#fff',
          border: '2px solid #000',
          boxShadow: 'none',
        },
        tickColor: '#000',
        dotStyle: {
          ...dotBase,
          borderRadius: '50%',
          border: '2px solid #000',
          background: '#fff',
          boxShadow: 'none',
        },
      };
    case 'platinum':
      return {
        headerBorder: '1px solid #888',
        titleColor: '#1a1a1a',
        bodyColor: '#333',
        strongColor: '#000',
        accentStrong: '#0066cc',
        font: THEME_FONT_CLASSIC_SANS,
        showLights: false,
        trackStyle: {
          ...trackBase,
          borderRadius: 4,
          background: 'linear-gradient(180deg, #c0c0c0 0%, #e4e4e4 45%, #d0d0d0 100%)',
          border: '1px solid #666',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.12)',
        },
        tickColor: '#444',
        dotStyle: {
          ...dotBase,
          borderRadius: '50%',
          border: '1px solid #000',
          background: 'linear-gradient(180deg, #f4f4f4, #c8c8c8)',
          boxShadow: 'inset 1px 1px 0 #fff, inset -1px -1px 0 rgba(0,0,0,0.2)',
        },
      };
    case 'next':
      return {
        headerBorder: '2px solid #000',
        titleColor: '#000',
        bodyColor: '#111',
        strongColor: '#000',
        accentStrong: '#000',
        font: THEME_FONT_CLASSIC_SANS,
        showLights: false,
        trackStyle: {
          ...trackBase,
          height: 6,
          marginTop: -3,
          borderRadius: 0,
          background: '#777',
          borderTop: '1px solid #aaa',
          borderLeft: '1px solid #aaa',
          borderBottom: '1px solid #222',
          borderRight: '1px solid #222',
          boxShadow: 'none',
        },
        tickColor: '#111',
        dotStyle: {
          ...dotBase,
          width: 16,
          height: 16,
          borderRadius: 0,
          background: '#ccc',
          borderTop: '2px solid #fff',
          borderLeft: '2px solid #fff',
          borderBottom: '2px solid #000',
          borderRight: '2px solid #000',
          boxShadow: 'none',
        },
      };
    case 'aqua':
    default:
      return {
        headerBorder: '1px solid #c8c8c8',
        titleColor: '#0066cc',
        bodyColor: '#444',
        strongColor: '#111',
        accentStrong: '#0066cc',
        font: AQUA_FONT,
        showLights: true,
        trackStyle: {
          ...trackBase,
          borderRadius: 4,
          background: 'linear-gradient(180deg, #b8b8b8 0%, #e8e8e8 40%, #d0d0d0 100%)',
          border: '1px solid #888',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.12)',
        },
        tickColor: '#666',
        dotStyle: {
          ...dotBase,
          borderRadius: '50%',
          border: '2px solid #1a5a8a',
          background: `
            radial-gradient(circle at 32% 28%, #ffffff 0%, #a8dcff 35%, #4a9ee6 55%, #2a78c8 100%)
          `,
          boxShadow: `
            inset 0 2px 4px rgba(255,255,255,0.7),
            inset 0 -2px 4px rgba(0,60,120,0.25),
            0 2px 6px rgba(0,60,120,0.35)
          `,
        },
      };
  }
}
