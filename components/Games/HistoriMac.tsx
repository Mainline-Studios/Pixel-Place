'use client';

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { HISTORIMAC_VERSIONS, type HistoriMacVersion } from '@/lib/historiMacVersions';
import { HISTORIMAC_WHISPERS } from '@/lib/historiMacWhispers';
import { computeHistoriMacTimeline } from '@/lib/historiMacTimeline';
import { readFavoriteVersionIds, toggleFavoriteVersion } from '@/lib/historiMacFavorites';
import { tabToPath } from '@/lib/routing';
import HistoriMacPicker from './HistoriMacPicker';
import HistoriMacSideRail, { INFINITE_MONKEY_URL } from './HistoriMacSideRail';
import HistoriMacCopilot from './HistoriMacCopilot';
import { buildInfiniteMacEmbedSrc, isInfiniteMacEmbedUrl } from '@/lib/infiniteMacEmbed';
import {
  AQUA_FONT,
  aquaEmbedFooterStrip,
  aquaEmbedToolbarDark,
  aquaGelButtonBlue,
  aquaGelButtonGraphite,
  aquaHudToast,
  aquaToolbarButtonDark,
  aquaToolbarButtonKeyDark,
  aquaTrafficLight,
  aquaSheet,
} from '@/lib/historiMacAquaStyles';

interface HistoriMacProps {
  onClose?: () => void;
  /** From URL hash `#historimac=versionId` — auto-opens that version once */
  bootVersionId?: string | null;
  onBootVersionConsumed?: () => void;
}

const INFINITE_MAC_URL = 'https://infinitemac.org';
/** Classic Finder / Happy Mac–style pixel art for version Play controls */
const HISTORIMAC_PLAY_ICON = '/images/games/historimac-play.png';
const LAST_PLAYED_KEY = 'historiMac_lastVersionId';
const LORE_EXPANDED_KEY = 'historiMac_loreExpanded';
const EMBED_LOAD_TIMEOUT_MS = 45_000;

function readLoreExpandedDefault(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(LORE_EXPANDED_KEY) !== '0';
  } catch {
    return true;
  }
}

function writeLoreExpanded(expanded: boolean) {
  try {
    localStorage.setItem(LORE_EXPANDED_KEY, expanded ? '1' : '0');
  } catch {
    /* ignore */
  }
}

function clearHistoriMacShareHash() {
  if (typeof window === 'undefined') return;
  if (!window.location.hash.toLowerCase().includes('historimac')) return;
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
}

function buildHistoriMacShareUrl(versionId: string): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const path = tabToPath('games');
  return `${origin}${path}#historimac=${encodeURIComponent(versionId)}`;
}

function pickWhisperStart() {
  return Math.floor(Math.random() * HISTORIMAC_WHISPERS.length);
}

function readLastPlayedId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const id = localStorage.getItem(LAST_PLAYED_KEY);
    return id && HISTORIMAC_VERSIONS.some((v) => v.id === id) ? id : null;
  } catch {
    return null;
  }
}

function saveLastPlayedId(id: string) {
  try {
    localStorage.setItem(LAST_PLAYED_KEY, id);
  } catch {
    /* ignore quota */
  }
}

function getOpenEmbedUrl(v: HistoriMacVersion): string | null {
  if (v.embedUrl?.trim()) return v.embedUrl.trim();
  if (typeof window !== 'undefined' && v.htmlPath) {
    return `${window.location.origin}${v.htmlPath}`;
  }
  return null;
}

const showcaseHeadingStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'rgba(180, 200, 255, 0.95)',
  marginBottom: '6px',
};

const showcaseSubtitleStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.92)',
  marginBottom: '8px',
};

const showcaseBodyStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 400,
  lineHeight: 1.55,
  color: 'rgba(255,255,255,0.85)',
};

type IframeEmbedConfig = {
  src?: string;
  srcDoc?: string;
  title: string;
  allow?: string;
  external?: boolean;
  width?: number;
  height?: number;
};

function getIframeProps(version: HistoriMacVersion): IframeEmbedConfig {
  if (version.embedUrl?.trim()) {
    return {
      src: version.embedUrl.trim(),
      title: `HistoriMac — ${version.label}`,
      allow: version.embedAllow,
      external: true,
      width: version.embedWidth,
      height: version.embedHeight,
    };
  }
  if (version.inlineHtml?.trim()) {
    return { srcDoc: version.inlineHtml, title: `HistoriMac — ${version.label}` };
  }
  if (version.htmlPath) {
    return { src: version.htmlPath, title: `HistoriMac — ${version.label}` };
  }
  return { title: `HistoriMac — ${version.label}` };
}

export default function HistoriMac({
  onClose,
  bootVersionId,
  onBootVersionConsumed,
}: HistoriMacProps) {
  const [selected, setSelected] = useState<HistoriMacVersion | null>(null);
  const [whisperIdx, setWhisperIdx] = useState(pickWhisperStart);
  const [lastPlayedId, setLastPlayedId] = useState<string | null>(null);
  const [embedFullscreen, setEmbedFullscreen] = useState(false);
  const [embedPhase, setEmbedPhase] = useState<'loading' | 'ready' | 'fail'>('loading');
  const [embedRetryKey, setEmbedRetryKey] = useState(0);
  const [favoritesTick, setFavoritesTick] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [loreExpanded, setLoreExpanded] = useState(readLoreExpandedDefault);
  const [railNarrow, setRailNarrow] = useState(false);
  const bootAppliedRef = useRef<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  /** Enables screen_update_messages on Infinite Mac /embed (heavier). */
  const [copilotStream, setCopilotStream] = useState(false);
  const [pixelMonkeyKick, setPixelMonkeyKick] = useState(0);

  const cycleWhisper = useCallback(() => {
    setWhisperIdx((i) => (i + 1) % HISTORIMAC_WHISPERS.length);
  }, []);

  useEffect(() => {
    setLastPlayedId(readLastPlayedId());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 600px)');
    const fn = () => setRailNarrow(mq.matches);
    fn();
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  useEffect(() => {
    if (!bootVersionId) return;
    if (bootAppliedRef.current === bootVersionId) return;
    bootAppliedRef.current = bootVersionId;
    const v = HISTORIMAC_VERSIONS.find((x) => x.id === bootVersionId);
    if (v) {
      saveLastPlayedId(v.id);
      setLastPlayedId(v.id);
      setSelected(v);
      setEmbedFullscreen(false);
    }
    onBootVersionConsumed?.();
  }, [bootVersionId, onBootVersionConsumed]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!embedFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setEmbedFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [embedFullscreen]);

  const favoriteIds = useMemo(() => {
    void favoritesTick;
    return readFavoriteVersionIds();
  }, [favoritesTick]);

  const favoriteVersions = useMemo(
    () => favoriteIds.map((id) => HISTORIMAC_VERSIONS.find((v) => v.id === id)).filter(Boolean) as HistoriMacVersion[],
    [favoriteIds],
  );

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const bumpFavorites = useCallback(() => setFavoritesTick((n) => n + 1), []);

  const toggleFavoriteFor = useCallback(
    (id: string) => {
      const now = toggleFavoriteVersion(id);
      showToast(now ? 'Saved to your picks (this device)' : 'Removed from your picks');
      bumpFavorites();
    },
    [bumpFavorites, showToast],
  );

  const copyVersionLink = useCallback(
    async (versionId: string) => {
      const url = buildHistoriMacShareUrl(versionId);
      try {
        await navigator.clipboard.writeText(url);
        showToast('Link copied — share to open this Mac version');
      } catch {
        showToast(`Copy failed — link: ${url}`);
      }
    },
    [showToast],
  );

  const goToPicker = useCallback(() => {
    clearHistoriMacShareHash();
    setEmbedFullscreen(false);
    setSelected(null);
  }, []);

  const handleExitGame = useCallback(() => {
    clearHistoriMacShareHash();
    onClose?.();
  }, [onClose]);

  const iframeProps = useMemo(() => (selected ? getIframeProps(selected) : null), [selected]);

  const iframeSrcEffective = useMemo(() => {
    if (!iframeProps?.src || !iframeProps.external) return iframeProps?.src;
    return buildInfiniteMacEmbedSrc(iframeProps.src, { screenUpdateMessages: copilotStream });
  }, [iframeProps?.src, iframeProps?.external, copilotStream]);

  useEffect(() => {
    if (!selected) setCopilotStream(false);
  }, [selected]);
  const timelineModel = useMemo(() => computeHistoriMacTimeline(HISTORIMAC_VERSIONS), []);
  const resumeVersion = useMemo(
    () => (lastPlayedId ? HISTORIMAC_VERSIONS.find((v) => v.id === lastPlayedId) : undefined),
    [lastPlayedId],
  );

  const openUrl = selected ? getOpenEmbedUrl(selected) : null;
  const hasSrc = !!(iframeProps?.src || iframeProps?.srcDoc);

  useEffect(() => {
    if (!selected) return;
    if (!iframeProps?.src && !iframeProps?.srcDoc) return;
    setEmbedPhase('loading');
    const t = window.setTimeout(() => {
      setEmbedPhase((p) => (p === 'loading' ? 'fail' : p));
    }, EMBED_LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [selected, selected?.id, iframeProps?.src, iframeProps?.srcDoc, embedRetryKey, iframeSrcEffective]);

  const handlePlay = useCallback((v: HistoriMacVersion) => {
    saveLastPlayedId(v.id);
    setLastPlayedId(v.id);
    setSelected(v);
    setEmbedFullscreen(false);
  }, []);

  const activateVersionById = useCallback(
    (id: string) => {
      const v = HISTORIMAC_VERSIONS.find((x) => x.id === id);
      if (v) handlePlay(v);
    },
    [handlePlay],
  );

  const retryEmbed = useCallback(() => {
    setEmbedPhase('loading');
    setEmbedRetryKey((k) => k + 1);
  }, []);

  const attributionPicker = (
    <p
      style={{
        margin: 0,
        fontSize: 11,
        color: '#555',
        textAlign: 'center',
        lineHeight: 1.55,
        fontFamily: AQUA_FONT,
      }}
    >
      Powered by Infinite Mac. See them at{' '}
      <a
        href={INFINITE_MAC_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Infinite Mac — emulators so good they feel like a stolen weekend in Cupertino."
        style={{ color: '#0066cc', fontWeight: 600 }}
      >
        infinitemac.org
      </a>
      . For AI-driven control (OpenAI / Anthropic “computer use”), use their{' '}
      <a
        href={INFINITE_MONKEY_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Separate page: you choose disk + provider and paste your own API key."
        style={{ color: '#5a32a8', fontWeight: 600 }}
      >
        Infinite Monkey
      </a>{' '}
      demo — it doesn’t run inside our embed.
    </p>
  );

  const attributionEmbed = (
    <p
      style={{
        margin: 0,
        fontSize: 11,
        color: '#444',
        textAlign: 'center',
        lineHeight: 1.55,
        fontFamily: AQUA_FONT,
      }}
    >
      Powered by Infinite Mac. See them at{' '}
      <a
        href={INFINITE_MAC_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Infinite Mac — emulators so good they feel like a stolen weekend in Cupertino."
        style={{ color: '#0066cc', fontWeight: 600 }}
      >
        infinitemac.org
      </a>
      . For AI-driven control, use their{' '}
      <a
        href={INFINITE_MONKEY_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Separate page: you choose disk + provider and paste your own API key."
        style={{ color: '#5a32a8', fontWeight: 600 }}
      >
        Infinite Monkey
      </a>{' '}
      demo — it doesn’t run inside our embed.
    </p>
  );

  if (!selected) {
    return (
      <HistoriMacPicker
        onClose={onClose}
        onExitGame={handleExitGame}
        attribution={attributionPicker}
        whisperIdx={whisperIdx}
        cycleWhisper={cycleWhisper}
        favoriteVersions={favoriteVersions}
        favoriteIds={favoriteIds}
        resumeVersion={resumeVersion}
        timelineModel={timelineModel}
        onActivateVersion={activateVersionById}
        onPlay={handlePlay}
        onToggleFavorite={toggleFavoriteFor}
        toast={toast}
      />
    );
  }

  const hasEmbed = hasSrc;
  const fixedSize =
    iframeProps?.external && iframeProps.width != null && iframeProps.height != null
      ? { width: iframeProps.width, height: iframeProps.height }
      : null;

  const iframeKey = `${selected.id}-${embedRetryKey}`;
  const showChrome = !embedFullscreen;
  const hasLorePanel = !!(
    selected.backgroundInfo ||
    selected.deviceShowcase ||
    selected.warningBanner
  );

  const iframeShared = {
    key: iframeKey,
    src: iframeSrcEffective ?? iframeProps?.src,
    srcDoc: iframeProps?.srcDoc,
    title: iframeProps?.title ?? 'HistoriMac',
    allow: iframeProps?.allow,
    onLoad: () => setEmbedPhase('ready'),
    onError: () => setEmbedPhase('fail'),
    ...(iframeProps?.external
      ? {}
      : {
          sandbox:
            'allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox' as const,
        }),
  };

  const shellStyle: React.CSSProperties = embedFullscreen
    ? {
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        display: 'flex',
        flexDirection: 'column',
        background: '#000',
        width: '100%',
        height: '100%',
      }
    : {
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      };

  return (
    <div data-historimac-root data-era-hint="MCMLXXXIV" style={shellStyle}>
      {showChrome ? (
        <div
          style={{
            flexShrink: 0,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            ...aquaEmbedToolbarDark,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8 }} aria-hidden>
              <span style={aquaTrafficLight('close')} />
              <span style={aquaTrafficLight('min')} />
              <span style={aquaTrafficLight('zoom')} />
            </div>
            <button
              type="button"
              title="Back to the pile of disks. (They’re virtual. It’s fine.)"
              onClick={goToPicker}
              style={aquaToolbarButtonDark}
            >
              ← Versions
            </button>
          </div>
          <span
            title="The name in the menu bar would be proud."
            style={{
              fontSize: 13,
              color: '#d4d4d4',
              flex: 1,
              textAlign: 'center',
              fontFamily: AQUA_FONT,
              fontWeight: 600,
              textShadow: '0 -1px 0 rgba(0,0,0,0.5)',
            }}
          >
            {selected.label}
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
            {hasLorePanel && !loreExpanded ? (
              <button
                type="button"
                title="Show background & device info again"
                onClick={() => {
                  setLoreExpanded(true);
                  writeLoreExpanded(true);
                }}
                style={aquaToolbarButtonDark}
              >
                Show lore
              </button>
            ) : null}
            {hasEmbed ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: '#9ad4ff',
                    lineHeight: 1.2,
                    textAlign: 'right',
                    maxWidth: 180,
                    fontFamily: AQUA_FONT,
                  }}
                >
                  Fullscreen recommended
                </span>
                <button
                  type="button"
                  title="Use the whole screen for the emulator — best experience."
                  onClick={() => setEmbedFullscreen(true)}
                  style={aquaToolbarButtonKeyDark}
                >
                  Fullscreen
                </button>
              </div>
            ) : null}
            {onClose ? (
              <button
                type="button"
                title="Quit HistoriMac — remember to save your imaginary work."
                onClick={handleExitGame}
                style={aquaToolbarButtonDark}
              >
                Close
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div
          style={{
            flexShrink: 0,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            ...aquaEmbedToolbarDark,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontFamily: AQUA_FONT }}>
            <span style={{ fontSize: 13, color: '#eee', fontWeight: 700 }}>{selected.label}</span>
            <span style={{ fontSize: 10, color: 'rgba(220,220,220,0.85)' }}>Press Esc to exit fullscreen</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button type="button" title="Or press Escape" onClick={() => setEmbedFullscreen(false)} style={aquaToolbarButtonKeyDark}>
              Exit fullscreen
            </button>
            <button type="button" onClick={goToPicker} style={aquaToolbarButtonDark}>
              Versions
            </button>
          </div>
        </div>
      )}

      {/* Pixel Monkey must mount in fullscreen too — side rail stays visible there */}
      {iframeProps?.external &&
      iframeProps.src &&
      isInfiniteMacEmbedUrl(iframeProps.src) ? (
        <HistoriMacCopilot
          iframeRef={iframeRef}
          active
          streamScreen={copilotStream}
          onStreamScreenChange={setCopilotStream}
          versionLabel={selected.label}
          onToast={showToast}
          expandRequest={pixelMonkeyKick}
        />
      ) : null}

      {showChrome && loreExpanded && hasLorePanel ? (
        <div
          style={{
            flexShrink: 0,
            margin: '0 12px',
            padding: '14px 18px',
            ...aquaSheet,
            borderRadius: 10,
            maxHeight:
              selected.deviceShowcase || selected.warningBanner ? 'min(48vh, 420px)' : 'min(32vh, 220px)',
            overflowY: 'auto',
            zIndex: 2,
            fontFamily: AQUA_FONT,
          }}
        >
          {selected.warningBanner ? (
            <div
              style={{
                marginBottom: selected.backgroundInfo || selected.deviceShowcase ? 14 : 0,
                padding: '12px 14px',
                background: 'linear-gradient(180deg, #fee2e2, #fecaca)',
                border: '2px solid #dc2626',
                borderRadius: 10,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', lineHeight: 1.5 }}>
                {selected.warningBanner}
              </span>
            </div>
          ) : null}
          {selected.backgroundInfo ? (
            <>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#666',
                  marginBottom: 8,
                }}
              >
                Background — {selected.label}
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: '#333' }}>{selected.backgroundInfo}</p>
            </>
          ) : null}
          {selected.deviceShowcase ? (
            <div
              style={{
                marginTop: selected.backgroundInfo || selected.warningBanner ? 16 : 0,
                paddingTop: selected.backgroundInfo || selected.warningBanner ? 16 : 0,
                borderTop: selected.backgroundInfo || selected.warningBanner ? '1px solid #ccc' : 'none',
              }}
            >
              <div style={{ ...showcaseHeadingStyle, color: '#555' }}>Device Showcase</div>
              {selected.deviceShowcaseSubtitle ? (
                <div style={{ ...showcaseSubtitleStyle, color: '#222' }}>{selected.deviceShowcaseSubtitle}</div>
              ) : null}
              <p style={{ margin: 0, ...showcaseBodyStyle, color: '#333' }}>{selected.deviceShowcase}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        title="The “screen” — glass, phosphor, or LCD, depending on how old you feel today."
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          display: 'flex',
          alignItems: embedFullscreen ? 'stretch' : 'center',
          justifyContent: embedFullscreen ? 'stretch' : 'center',
          overflow: 'hidden',
          background: '#1a1a1e',
        }}
      >
        {hasEmbed ? (
          <>
            <div
              style={{
                position: 'absolute',
                zIndex: 12,
                pointerEvents: 'none',
                ...(railNarrow
                  ? { bottom: embedFullscreen ? 72 : 100, right: 8, top: 'auto' as const }
                  : { top: '50%', right: 10, transform: 'translateY(-50%)' }),
              }}
            >
              <div style={{ pointerEvents: 'auto' }}>
                <HistoriMacSideRail
                  favorited={favoriteIds.includes(selected.id)}
                  onToggleFavorite={() => toggleFavoriteFor(selected.id)}
                  onCopyLink={() => void copyVersionLink(selected.id)}
                  openExternalUrl={openUrl}
                  loreExpanded={loreExpanded}
                  onToggleLore={() => {
                    setLoreExpanded((prev) => {
                      const next = !prev;
                      writeLoreExpanded(next);
                      return next;
                    });
                  }}
                  hasLore={hasLorePanel}
                  onOpenPixelMonkey={() => setPixelMonkeyKick((k) => k + 1)}
                  compact={embedFullscreen}
                />
              </div>
            </div>
            {embedPhase === 'loading' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '12px',
                  background: 'rgba(15, 18, 24, 0.72)',
                  color: '#cbd5e1',
                  fontSize: '13px',
                  pointerEvents: 'none',
                }}
              >
                <span style={{ fontFamily: AQUA_FONT, fontSize: 13, fontWeight: 600, color: '#eee' }}>Booting…</span>
              </div>
            )}
            {embedPhase === 'fail' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 24,
                  background: 'rgba(40, 40, 40, 0.72)',
                  flexDirection: 'column',
                  gap: 14,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    ...aquaSheet,
                    padding: '22px 24px',
                    maxWidth: 400,
                    fontFamily: AQUA_FONT,
                  }}
                >
                  <p style={{ margin: '0 0 8px', color: '#b91c1c', fontSize: 15, fontWeight: 700 }}>
                    This embed didn’t finish loading in time, or the browser blocked it.
                  </p>
                  <p style={{ margin: '0 0 16px', color: '#555', fontSize: 13, lineHeight: 1.5 }}>
                    Try Retry, or open the session directly on Infinite Mac.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                    <button type="button" onClick={retryEmbed} style={{ ...aquaGelButtonBlue, padding: '8px 18px', fontSize: 13 }}>
                      Retry
                    </button>
                    {openUrl ? (
                      <a
                        href={openUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          ...aquaGelButtonGraphite,
                          padding: '8px 16px',
                          fontSize: 13,
                          textDecoration: 'none',
                          display: 'inline-block',
                          color: '#222',
                        }}
                      >
                        Open on Infinite Mac ↗
                      </a>
                    ) : null}
                    <a
                      href={INFINITE_MAC_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 14px',
                        fontSize: 13,
                        color: '#0066cc',
                        fontWeight: 600,
                        textDecoration: 'underline',
                      }}
                    >
                      infinitemac.org
                    </a>
                  </div>
                </div>
              </div>
            )}
            {embedFullscreen || !fixedSize ? (
              <iframe
                ref={iframeRef}
                {...iframeShared}
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: embedFullscreen ? '100%' : 'calc(100vh - 120px)',
                  border: 'none',
                  display: 'block',
                  flex: embedFullscreen ? 1 : undefined,
                }}
              />
            ) : (
              <div
                style={{
                  width: embedFullscreen ? '100%' : `min(100%, ${fixedSize.width}px)`,
                  height: embedFullscreen ? '100%' : undefined,
                  aspectRatio: embedFullscreen ? undefined : `${fixedSize.width} / ${fixedSize.height}`,
                  maxHeight: embedFullscreen ? 'none' : 'min(70vh, 100%)',
                  flex: embedFullscreen ? 1 : undefined,
                  minHeight: embedFullscreen ? 0 : undefined,
                }}
              >
                <iframe
                  ref={iframeRef}
                  {...iframeShared}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '40px', color: 'var(--text-dim)', textAlign: 'center', fontSize: '14px' }}>
            No HTML path or inline HTML set for this version.
          </div>
        )}
      </div>

      {showChrome ? (
        <div
          style={{
            flexShrink: 0,
            padding: '12px 16px',
            ...aquaEmbedFooterStrip,
          }}
        >
          {attributionEmbed}
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 10,
              color: '#666',
              textAlign: 'center',
              lineHeight: 1.45,
              fontFamily: AQUA_FONT,
            }}
          >
            Tip: side rail — 🍌 Pixel Monkey (AI in this page, BYOK), 🐵 Infinite Monkey (opens their site), plus save pick,
            copy link, open Infinite Mac.
          </p>
          <button
            type="button"
            onClick={cycleWhisper}
            title="Another reference. Keep clicking. We have 68k of these."
            style={{
              display: 'block',
              width: '100%',
              marginTop: 8,
              padding: 0,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 10,
              lineHeight: 1.4,
              color: '#888',
              fontStyle: 'italic',
              textAlign: 'center',
              fontFamily: AQUA_FONT,
            }}
          >
            {HISTORIMAC_WHISPERS[whisperIdx]}
          </button>
        </div>
      ) : null}

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100020,
            padding: '12px 22px',
            maxWidth: 'min(90vw, 420px)',
            textAlign: 'center',
            pointerEvents: 'none',
            ...aquaHudToast,
            boxShadow: `${aquaHudToast.boxShadow}, 0 4px 20px rgba(0,0,0,0.2)`,
          }}
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
