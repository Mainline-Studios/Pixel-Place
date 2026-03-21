'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { HISTORIMAC_VERSIONS, type HistoriMacVersion } from '@/lib/historiMacVersions';
import { HISTORIMAC_WHISPERS } from '@/lib/historiMacWhispers';
import { computeHistoriMacTimeline } from '@/lib/historiMacTimeline';
import HistoriMacTimelineStrip from './HistoriMacTimelineStrip';

interface HistoriMacProps {
  onClose?: () => void;
}

const INFINITE_MAC_URL = 'https://infinitemac.org';
/** Classic Finder / Happy Mac–style pixel art for version Play controls */
const HISTORIMAC_PLAY_ICON = '/images/games/historimac-play.png';
const LAST_PLAYED_KEY = 'historiMac_lastVersionId';
const EMBED_LOAD_TIMEOUT_MS = 45_000;

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

export default function HistoriMac({ onClose }: HistoriMacProps) {
  const [selected, setSelected] = useState<HistoriMacVersion | null>(null);
  const [whisperIdx, setWhisperIdx] = useState(pickWhisperStart);
  const [lastPlayedId, setLastPlayedId] = useState<string | null>(null);
  const [embedFullscreen, setEmbedFullscreen] = useState(false);
  const [embedPhase, setEmbedPhase] = useState<'loading' | 'ready' | 'fail'>('loading');
  const [embedRetryKey, setEmbedRetryKey] = useState(0);

  const cycleWhisper = useCallback(() => {
    setWhisperIdx((i) => (i + 1) % HISTORIMAC_WHISPERS.length);
  }, []);

  useEffect(() => {
    setLastPlayedId(readLastPlayedId());
  }, []);

  const iframeProps = useMemo(() => (selected ? getIframeProps(selected) : null), [selected]);
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
  }, [selected, selected?.id, iframeProps?.src, iframeProps?.srcDoc, embedRetryKey]);

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

  const attribution = (
    <p
      style={{
        margin: 0,
        fontSize: '11px',
        color: 'var(--text-dim, #8b90a8)',
        textAlign: 'center',
        lineHeight: 1.5,
      }}
    >
      Powered by Infinite Mac. See them at{' '}
      <a
        href={INFINITE_MAC_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Infinite Mac — emulators so good they feel like a stolen weekend in Cupertino."
        style={{ color: '#00a2ff' }}
      >
        infinitemac.org
      </a>
      .
    </p>
  );

  if (!selected) {
    return (
      <div
        data-historimac-root
        data-era-hint="MCMLXXXIV"
        style={{
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          gap: '20px',
          background: 'var(--bg, #0a0c12)',
        }}
      >
        {onClose && (
          <button
            type="button"
            title="Exit to the games grid — no saving to a floppy required."
            onClick={onClose}
            style={{
              position: 'fixed',
              top: '12px',
              left: '12px',
              zIndex: 9999,
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '10px',
              padding: '8px 14px',
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            ◄ Back
          </button>
        )}

        <div style={{ textAlign: 'center', maxWidth: '520px' }}>
          <h1
            title="A nod to history — and to every “one more thing” that shipped anyway."
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 'clamp(14px, 3vw, 20px)',
              margin: '0 0 8px',
              color: 'var(--text, #fff)',
            }}
          >
            Histori
            <span title="The ROM knows what you did last session." style={{ color: '#7dd3fc' }}>
              Mac
            </span>
          </h1>
          <p
            style={{
              margin: '0 0 12px',
              fontSize: '10px',
              color: 'rgba(139, 144, 168, 0.55)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            <span title="512×342 forever in our hearts">Desk accessory mode</span>
            {' · '}
            <span title="0x7C0 = 1984 in decimal — the year the Mac said hello.">0x7c0</span>
          </p>
          {attribution}
          <button
            type="button"
            onClick={cycleWhisper}
            title="Click to cycle hidden references. Shhh."
            style={{
              display: 'block',
              width: '100%',
              marginTop: '14px',
              padding: 0,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '10px',
              lineHeight: 1.45,
              color: 'rgba(139, 144, 168, 0.38)',
              fontStyle: 'italic',
              textAlign: 'center',
            }}
          >
            {HISTORIMAC_WHISPERS[whisperIdx]}
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
            maxWidth: 'min(640px, 100%)',
          }}
        >
          {resumeVersion ? (
            <button
              type="button"
              onClick={() => handlePlay(resumeVersion)}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(125, 211, 252, 0.45)',
                background: 'linear-gradient(135deg, rgba(0, 80, 120, 0.5) 0%, rgba(20, 40, 70, 0.85) 100%)',
                color: '#e0f2fe',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                boxShadow: '0 0 24px rgba(0, 162, 255, 0.2)',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: '14px' }}>
                Resume: <span style={{ color: '#fff' }}>{resumeVersion.label}</span>
              </span>
              <span
                style={{
                  fontSize: '11px',
                  opacity: 0.85,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={HISTORIMAC_PLAY_ICON} alt="" width={28} height={28} style={{ imageRendering: 'pixelated' }} />
                Continue →
              </span>
            </button>
          ) : null}

          {timelineModel ? (
            <HistoriMacTimelineStrip model={timelineModel} onActivateVersion={activateVersionById} />
          ) : null}

          <div
            title="Pick your poison — er, partition — er, disk image."
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-dim, #8b90a8)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '4px',
            }}
          >
            Choose a version
          </div>
          {HISTORIMAC_VERSIONS.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>
              No versions configured yet. Add entries in <code>lib/historiMacVersions.ts</code>.
            </p>
          ) : (
            HISTORIMAC_VERSIONS.map((v) => (
              <div
                key={v.id}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '16px 18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border, rgba(255,255,255,0.15))',
                  background: 'linear-gradient(135deg, var(--panel, #141820) 0%, var(--panel-soft, #1a2030) 100%)',
                  color: 'var(--text, #fff)',
                  cursor: 'default',
                  textAlign: 'left',
                  boxShadow: 'var(--shadow-card, 0 4px 20px rgba(0,0,0,0.4))',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: '15px',
                    fontWeight: 700,
                    marginBottom: v.backgroundInfo || v.deviceShowcase || v.warningBanner ? '10px' : 0,
                  }}
                >
                  Version: {v.label}
                  {v.timelineYear != null ? (
                    <span style={{ fontWeight: 500, color: 'var(--text-dim)', fontSize: '12px', marginLeft: '8px' }}>
                      · {v.timelineYear}
                    </span>
                  ) : null}
                </span>
                {v.warningBanner ? (
                  <div
                    style={{
                      marginBottom: v.backgroundInfo || v.deviceShowcase ? '14px' : 0,
                      padding: '12px 14px',
                      background: 'rgba(120, 20, 20, 0.45)',
                      border: '2px solid #ff3344',
                      borderRadius: '10px',
                      textAlign: 'center',
                      boxShadow: '0 0 20px rgba(255, 50, 60, 0.25)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: 'clamp(9px, 2.5vw, 12px)',
                        color: '#ff8a8a',
                        letterSpacing: '0.12em',
                        lineHeight: 1.6,
                      }}
                    >
                      {v.warningBanner}
                    </span>
                  </div>
                ) : null}
                {v.backgroundInfo ? (
                  <>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--text-dim, #8b90a8)',
                        marginBottom: '6px',
                      }}
                    >
                      Background
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 400,
                        lineHeight: 1.55,
                        color: 'rgba(255,255,255,0.82)',
                      }}
                    >
                      {v.backgroundInfo}
                    </span>
                  </>
                ) : null}
                {v.deviceShowcase ? (
                  <div
                    style={{
                      marginTop: v.backgroundInfo || v.warningBanner ? '14px' : 0,
                      paddingTop: v.backgroundInfo || v.warningBanner ? '14px' : 0,
                      borderTop: v.backgroundInfo || v.warningBanner ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    }}
                  >
                    <span style={{ display: 'block', ...showcaseHeadingStyle }}>Device Showcase</span>
                    {v.deviceShowcaseSubtitle ? (
                      <span style={{ display: 'block', ...showcaseSubtitleStyle }}>{v.deviceShowcaseSubtitle}</span>
                    ) : null}
                    <span style={{ display: 'block', ...showcaseBodyStyle }}>{v.deviceShowcase}</span>
                  </div>
                ) : null}
                <button
                  type="button"
                  aria-label={`Play ${v.label}`}
                  onClick={() => handlePlay(v)}
                  style={{
                    marginTop: '16px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.25)',
                    cursor: 'pointer',
                    background: 'linear-gradient(180deg, #00b4ff 0%, #0090d6 100%)',
                    boxShadow: '0 4px 16px rgba(0, 162, 255, 0.45)',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={HISTORIMAC_PLAY_ICON}
                    alt=""
                    width={36}
                    height={36}
                    style={{ flexShrink: 0, imageRendering: 'pixelated', objectFit: 'contain' }}
                  />
                  Play
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  const hasEmbed = hasSrc;
  const fixedSize =
    iframeProps?.external && iframeProps.width != null && iframeProps.height != null
      ? { width: iframeProps.width, height: iframeProps.height }
      : null;

  const iframeKey = `${selected.id}-${embedRetryKey}`;
  const showChrome = !embedFullscreen;

  const iframeShared = {
    key: iframeKey,
    src: iframeProps?.src,
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
            padding: '8px 12px',
            borderBottom: '1px solid var(--border, rgba(255,255,255,0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            background: 'var(--panel, #0f1218)',
          }}
        >
          <button
            type="button"
            title="Back to the pile of disks. (They’re virtual. It’s fine.)"
            onClick={() => {
              setEmbedFullscreen(false);
              setSelected(null);
            }}
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '9px',
              padding: '8px 12px',
              background: 'rgba(0,162,255,0.2)',
              border: '1px solid rgba(0,162,255,0.5)',
              color: '#fff',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            ← Versions
          </button>
          <span
            title="The name in the menu bar would be proud."
            style={{ fontSize: '12px', color: 'var(--text-dim)', flex: 1, textAlign: 'center' }}
          >
            Version: <strong style={{ color: 'var(--text, #fff)' }}>{selected.label}</strong>
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
            {hasEmbed ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '9px', color: '#7dd3fc', lineHeight: 1.2, textAlign: 'right', maxWidth: '160px' }}>
                  Fullscreen is recommended
                </span>
                <button
                  type="button"
                  title="Use the whole screen for the emulator — best experience."
                  onClick={() => setEmbedFullscreen(true)}
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '9px',
                    padding: '8px 12px',
                    background: 'rgba(125, 211, 252, 0.15)',
                    border: '1px solid rgba(125, 211, 252, 0.45)',
                    color: '#e0f2fe',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Fullscreen
                </button>
              </div>
            ) : null}
            {onClose && (
              <button
                type="button"
                title="Quit HistoriMac — remember to save your imaginary work."
                onClick={onClose}
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '9px',
                  padding: '8px 12px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Close game
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            flexShrink: 0,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            background: 'rgba(0,0,0,0.75)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>{selected.label}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setEmbedFullscreen(false)}
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '8px',
                padding: '8px 12px',
                background: 'rgba(0,162,255,0.35)',
                border: '1px solid rgba(0,162,255,0.6)',
                color: '#fff',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Exit fullscreen
            </button>
            <button
              type="button"
              onClick={() => {
                setEmbedFullscreen(false);
                setSelected(null);
              }}
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '8px',
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Versions
            </button>
          </div>
        </div>
      )}

      {showChrome &&
      (selected.backgroundInfo || selected.deviceShowcase || selected.warningBanner) ? (
        <div
          style={{
            flexShrink: 0,
            padding: '12px 16px',
            background: 'linear-gradient(180deg, rgba(30, 35, 48, 0.98) 0%, rgba(18, 22, 32, 0.95) 100%)',
            borderBottom: '1px solid var(--border, rgba(255,255,255,0.1))',
            maxHeight:
              selected.deviceShowcase || selected.warningBanner ? 'min(48vh, 420px)' : 'min(32vh, 220px)',
            overflowY: 'auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            zIndex: 2,
          }}
        >
          {selected.warningBanner ? (
            <div
              style={{
                marginBottom: selected.backgroundInfo || selected.deviceShowcase ? '14px' : 0,
                padding: '12px 14px',
                background: 'rgba(120, 20, 20, 0.45)',
                border: '2px solid #ff3344',
                borderRadius: '10px',
                textAlign: 'center',
                boxShadow: '0 0 20px rgba(255, 50, 60, 0.2)',
              }}
            >
              <span
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 'clamp(9px, 2.5vw, 12px)',
                  color: '#ff8a8a',
                  letterSpacing: '0.12em',
                  lineHeight: 1.6,
                }}
              >
                {selected.warningBanner}
              </span>
            </div>
          ) : null}
          {selected.backgroundInfo ? (
            <>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-dim, #8b90a8)',
                  marginBottom: '8px',
                }}
              >
                Background — {selected.label}
              </div>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.88)' }}>
                {selected.backgroundInfo}
              </p>
            </>
          ) : null}
          {selected.deviceShowcase ? (
            <div
              style={{
                marginTop: selected.backgroundInfo || selected.warningBanner ? '16px' : 0,
                paddingTop: selected.backgroundInfo || selected.warningBanner ? '16px' : 0,
                borderTop: selected.backgroundInfo || selected.warningBanner ? '1px solid rgba(255,255,255,0.12)' : 'none',
              }}
            >
              <div style={showcaseHeadingStyle}>Device Showcase</div>
              {selected.deviceShowcaseSubtitle ? (
                <div style={showcaseSubtitleStyle}>{selected.deviceShowcaseSubtitle}</div>
              ) : null}
              <p style={{ margin: 0, ...showcaseBodyStyle }}>{selected.deviceShowcase}</p>
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
                <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px' }}>Booting…</span>
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
                  padding: '24px',
                  background: 'rgba(15, 18, 24, 0.94)',
                  flexDirection: 'column',
                  gap: '14px',
                  textAlign: 'center',
                }}
              >
                <p style={{ margin: 0, color: '#fca5a5', fontSize: '14px', fontWeight: 700, maxWidth: '360px' }}>
                  This embed didn’t finish loading in time, or the browser blocked it.
                </p>
                <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '12px', maxWidth: '380px' }}>
                  Try Retry, or open the session directly on Infinite Mac.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={retryEmbed}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0,162,255,0.5)',
                      background: 'rgba(0,162,255,0.25)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    Retry
                  </button>
                  {openUrl ? (
                    <a
                      href={openUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.25)',
                        background: 'rgba(255,255,255,0.08)',
                        color: '#7dd3fc',
                        fontWeight: 700,
                        textDecoration: 'none',
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
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'var(--text-dim)',
                      fontSize: '13px',
                      textDecoration: 'none',
                    }}
                  >
                    infinitemac.org
                  </a>
                </div>
              </div>
            )}
            {embedFullscreen || !fixedSize ? (
              <iframe
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
            padding: '10px 16px',
            background: 'var(--panel-soft, #121620)',
            borderTop: '1px solid var(--border)',
          }}
        >
          {attribution}
          <button
            type="button"
            onClick={cycleWhisper}
            title="Another reference. Keep clicking. We have 68k of these."
            style={{
              display: 'block',
              width: '100%',
              marginTop: '8px',
              padding: 0,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '9px',
              lineHeight: 1.4,
              color: 'rgba(139, 144, 168, 0.32)',
              fontStyle: 'italic',
              textAlign: 'center',
            }}
          >
            {HISTORIMAC_WHISPERS[whisperIdx]}
          </button>
        </div>
      ) : null}
    </div>
  );
}
