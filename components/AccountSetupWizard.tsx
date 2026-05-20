'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { useStyle } from '@/components/StyleProvider';
import { useColorMode } from '@/components/ColorModeProvider';
import { useSound } from '@/contexts/SoundContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useSiteLanguage } from '@/contexts/SiteLanguageContext';
import { useMobileBeta } from '@/contexts/MobileBetaContext';
import {
  applySetupDraftLocally,
  DEFAULT_SETUP_DRAFT,
  preferencesFromDraft,
  SETUP_STYLE_OPTIONS,
  type AccountSetupDraft,
} from '@/lib/accountSetup';
import type { StyleTheme } from '@/lib/styleTheme';
import type { ColorMode } from '@/lib/colorMode';
import { isSupportedLocale, type SupportedLocale } from '@/lib/locale';

const STEPS = ['welcome', 'appearance', 'style', 'extras', 'done'] as const;
type StepId = (typeof STEPS)[number];

const STEP_LABELS: Record<StepId, string> = {
  welcome: 'Welcome',
  appearance: 'Light or dark',
  style: 'Theme',
  extras: 'More options',
  done: 'Ready',
};

type AccountSetupWizardProps = {
  onFinished: () => void;
};

export default function AccountSetupWizard({ onFinished }: AccountSetupWizardProps) {
  const { user, updateUser } = useUser();
  const { setStyle } = useStyle();
  const { setColorMode } = useColorMode();
  const { setSoundsEnabled } = useSound();
  const { setReduceMotion, setInvertColors } = useAccessibility();
  const { setLocale, localeChoices } = useSiteLanguage();
  const { setForceDesktop } = useMobileBeta();

  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<AccountSetupDraft>({ ...DEFAULT_SETUP_DRAFT });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    applySetupDraftLocally(draft);
  }, []);

  const step = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const patchDraft = (partial: Partial<AccountSetupDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...partial };
      applySetupDraftLocally(next);
      if (partial.styleTheme) setStyle(partial.styleTheme);
      if (partial.colorMode) setColorMode(partial.colorMode);
      if (partial.soundsEnabled !== undefined) setSoundsEnabled(partial.soundsEnabled);
      if (partial.reduceMotion !== undefined) setReduceMotion(partial.reduceMotion);
      if (partial.invertColors !== undefined) setInvertColors(partial.invertColors);
      if (partial.locale) setLocale(partial.locale);
      if (partial.forceDesktop !== undefined) setForceDesktop(partial.forceDesktop);
      return next;
    });
  };

  const finish = async () => {
    if (!user) return;
    setBusy(true);
    setError('');
    try {
      const prefs = preferencesFromDraft(draft);
      applySetupDraftLocally(draft);
      await updateUser({
        setupCompleted: true,
        accountPreferences: prefs,
      });
      onFinished();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not save your setup. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const goNext = () => {
    if (step === 'done') {
      void finish();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const previewCardStyle = useMemo(
    () => ({
      borderRadius: 14,
      border: '1px solid var(--border)',
      background: 'var(--panel)',
      padding: 16,
      minHeight: 120,
    }),
    [],
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-setup-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="main-card"
        style={{
          width: 'min(560px, 100%)',
          maxHeight: 'min(92vh, 720px)',
          overflow: 'auto',
          margin: 0,
          boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              height: 6,
              borderRadius: 999,
              background: 'var(--panel-soft)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--accent), var(--brand-sky))',
                transition: 'width 0.25s ease',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 8,
              fontSize: 11,
              color: 'var(--text-dim)',
            }}
          >
            <span>
              Step {stepIndex + 1} of {STEPS.length} — {STEP_LABELS[step]}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Image src="/logo.png" alt="" width={40} height={40} />
          <div>
            <h2 id="account-setup-title" style={{ margin: 0, fontSize: 22 }}>
              Set up Pixel Place
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-dim)' }}>
              Hi {user?.username || 'there'} — pick how the site looks and feels.
            </p>
          </div>
        </div>

        {step === 'welcome' && (
          <div style={previewCardStyle}>
            <p style={{ margin: 0, lineHeight: 1.65, color: 'var(--text-main)' }}>
              You will choose <strong>light or dark mode</strong>, a <strong>visual theme</strong>, sounds,
              language, accessibility options, and more. You can change everything later in{' '}
              <strong>Settings</strong>.
            </p>
            <ul style={{ margin: '14px 0 0', paddingLeft: 20, color: 'var(--text-dim)', fontSize: 13 }}>
              <li>10 Pixel Coins to start playing and customizing</li>
              <li>Default avatar: Pixel Placer</li>
              <li>+20 bonus coins when you verify your email</li>
            </ul>
          </div>
        )}

        {step === 'appearance' && (
          <div>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-dim)' }}>
              This controls backgrounds and contrast across the whole site.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(['dark', 'light'] as ColorMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className="btn"
                  onClick={() => patchDraft({ colorMode: mode })}
                  style={{
                    padding: '18px 14px',
                    borderColor: draft.colorMode === mode ? 'var(--accent)' : 'var(--border)',
                    background:
                      draft.colorMode === mode ? 'var(--accent-bg-hover)' : 'var(--accent-bg)',
                  }}
                >
                  <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>
                    {mode === 'dark' ? '🌙' : '☀️'}
                  </span>
                  <span style={{ fontWeight: 700 }}>{mode === 'dark' ? 'Dark mode' : 'Light mode'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'style' && (
          <div>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-dim)' }}>
              Themes change colors, borders, and some layout chrome — not just the palette.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 8,
              }}
            >
              {SETUP_STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="btn"
                  onClick={() => patchDraft({ styleTheme: opt.id as StyleTheme })}
                  style={{
                    fontSize: 12,
                    padding: '12px 10px',
                    borderColor: draft.styleTheme === opt.id ? 'var(--accent)' : 'var(--border)',
                    background:
                      draft.styleTheme === opt.id ? 'var(--accent-bg-hover)' : 'var(--accent-bg)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'extras' && (
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={draft.soundsEnabled}
                onChange={(e) => patchDraft({ soundsEnabled: e.target.checked })}
              />
              <span>Sound effects (clicks, tabs, purchases)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={draft.reduceMotion}
                onChange={(e) => patchDraft({ reduceMotion: e.target.checked })}
              />
              <span>Reduce motion</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={draft.invertColors}
                onChange={(e) => patchDraft({ invertColors: e.target.checked })}
              />
              <span>Invert colors</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={draft.particlesEnabled}
                onChange={(e) => patchDraft({ particlesEnabled: e.target.checked })}
              />
              <span>Ambient floating particles on the dashboard</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={draft.forceDesktop}
                onChange={(e) => patchDraft({ forceDesktop: e.target.checked })}
              />
              <span>Use full desktop layout on this device (not recommended on phones)</span>
            </label>
            <div>
              <label htmlFor="setup-locale" style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>
                Language
              </label>
              <select
                id="setup-locale"
                value={draft.locale}
                onChange={(e) => {
                  const v = e.target.value;
                  if (isSupportedLocale(v)) patchDraft({ locale: v });
                }}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10 }}
              >
                {localeChoices.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div style={previewCardStyle}>
            <p style={{ margin: 0, fontWeight: 700 }}>Your setup</p>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 13, lineHeight: 1.7 }}>
              <li>{draft.colorMode === 'light' ? 'Light mode' : 'Dark mode'}</li>
              <li>Theme: {SETUP_STYLE_OPTIONS.find((o) => o.id === draft.styleTheme)?.label}</li>
              <li>Sounds: {draft.soundsEnabled ? 'On' : 'Off'}</li>
              <li>Reduce motion: {draft.reduceMotion ? 'On' : 'Off'}</li>
              <li>Particles: {draft.particlesEnabled ? 'On' : 'Off'}</li>
              <li>Language: {localeChoices.find((c) => c.value === draft.locale)?.label || draft.locale}</li>
            </ul>
          </div>
        )}

        {error ? (
          <p style={{ margin: '12px 0 0', fontSize: 13, color: '#fca5a5' }}>{error}</p>
        ) : null}

        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {stepIndex > 0 ? (
            <button type="button" className="btn" onClick={goBack} disabled={busy}>
              Back
            </button>
          ) : null}
          <button type="button" className="btn auth-btn" onClick={goNext} disabled={busy} style={{ marginLeft: 'auto' }}>
            {busy ? 'Saving...' : step === 'done' ? 'Enter Pixel Place' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
