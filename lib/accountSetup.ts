import type { ColorMode } from '@/lib/colorMode';
import { applyColorModeToDocument, setStoredColorMode } from '@/lib/colorMode';
import type { SupportedLocale } from '@/lib/locale';
import { setStoredLocale, applyDocumentLocale } from '@/lib/locale';
import { setStoredStyle, type StyleTheme, STYLE_OPTIONS } from '@/lib/styleTheme';
import type { User, UserAccountPreferences } from '@/types';

export const SETUP_STYLE_OPTIONS = STYLE_OPTIONS.filter((o) =>
  ['modern', 'normal', 'futuristic', 'minimalist', 'highcontrast', '80s'].includes(o.id),
);

export type AccountSetupDraft = {
  colorMode: ColorMode;
  styleTheme: StyleTheme;
  soundsEnabled: boolean;
  reduceMotion: boolean;
  invertColors: boolean;
  locale: SupportedLocale;
  forceDesktop: boolean;
  particlesEnabled: boolean;
};

export const DEFAULT_SETUP_DRAFT: AccountSetupDraft = {
  colorMode: 'dark',
  styleTheme: 'modern',
  soundsEnabled: true,
  reduceMotion: false,
  invertColors: false,
  locale: 'en-US',
  forceDesktop: false,
  particlesEnabled: true,
};

export function needsAccountSetup(user: User | null | undefined): boolean {
  return Boolean(user && user.setupCompleted === false);
}

export function preferencesFromDraft(draft: AccountSetupDraft): UserAccountPreferences {
  return {
    colorMode: draft.colorMode,
    styleTheme: draft.styleTheme,
    soundsEnabled: draft.soundsEnabled,
    reduceMotion: draft.reduceMotion,
    invertColors: draft.invertColors,
    locale: draft.locale,
    forceDesktop: draft.forceDesktop,
    particlesEnabled: draft.particlesEnabled,
  };
}

export function draftFromPreferences(prefs?: UserAccountPreferences | null): AccountSetupDraft {
  if (!prefs) return { ...DEFAULT_SETUP_DRAFT };
  return {
    colorMode: prefs.colorMode === 'light' ? 'light' : 'dark',
    styleTheme: (SETUP_STYLE_OPTIONS.some((o) => o.id === prefs.styleTheme)
      ? prefs.styleTheme
      : 'modern') as StyleTheme,
    soundsEnabled: prefs.soundsEnabled !== false,
    reduceMotion: prefs.reduceMotion === true,
    invertColors: prefs.invertColors === true,
    locale: prefs.locale || 'en-US',
    forceDesktop: prefs.forceDesktop === true,
    particlesEnabled: prefs.particlesEnabled !== false,
  };
}

/** Apply draft to localStorage + document (live preview during setup). */
export function applySetupDraftLocally(draft: AccountSetupDraft): void {
  setStoredColorMode(draft.colorMode);
  applyColorModeToDocument(draft.colorMode);
  setStoredStyle(draft.styleTheme);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-style', draft.styleTheme);
  }
  setStoredLocale(draft.locale);
  applyDocumentLocale(draft.locale);
  try {
    localStorage.setItem('pixelplace_sounds', draft.soundsEnabled ? '1' : '0');
    localStorage.setItem('pixelplace_a11y_reduce_motion', draft.reduceMotion ? '1' : '0');
    localStorage.setItem('pixelplace_a11y_invert', draft.invertColors ? '1' : '0');
    localStorage.setItem('pixelplace_force_desktop', draft.forceDesktop ? '1' : '0');
    localStorage.setItem('pixelplace_particles', draft.particlesEnabled ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function hydratePreferencesFromUser(user: User | null | undefined): void {
  if (!user?.accountPreferences) return;
  applySetupDraftLocally(draftFromPreferences(user.accountPreferences));
}
