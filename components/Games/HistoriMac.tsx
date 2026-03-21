'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { HISTORIMAC_VERSIONS, type HistoriMacVersion } from '@/lib/historiMacVersions';
import { HISTORIMAC_WHISPERS } from '@/lib/historiMacWhispers';

interface HistoriMacProps {
  onClose?: () => void;
}

const INFINITE_MAC_URL = 'https://infinitemac.org';

function pickWhisperStart() {
  return Math.floor(Math.random() * HISTORIMAC_WHISPERS.length);
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
  /** External sites (e.g. infinitemac.org) — omit sandbox so embed + allow= work */
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
  const cycleWhisper = useCallback(() => {
    setWhisperIdx((i) => (i + 1) % HISTORIMAC_WHISPERS.length);
  }, []);

  const iframeProps = useMemo(() => (selected ? getIframeProps(selected) : null), [selected]);

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
            <span
              title="The ROM knows what you did last session."
              style={{ color: '#7dd3fc' }}
            >
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
              <button
                key={v.id}
                type="button"
                onClick={() => setSelected(v)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '16px 18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border, rgba(255,255,255,0.15))',
                  background: 'linear-gradient(135deg, var(--panel, #141820) 0%, var(--panel-soft, #1a2030) 100%)',
                  color: 'var(--text, #fff)',
                  cursor: 'pointer',
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
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  const hasEmbed = !!(iframeProps?.src || iframeProps?.srcDoc);
  const fixedSize =
    iframeProps?.external &&
    iframeProps.width != null &&
    iframeProps.height != null
      ? { width: iframeProps.width, height: iframeProps.height }
      : null;

  return (
    <div
      data-historimac-root
      data-era-hint="MCMLXXXIV"
      style={{ width: '100%', height: '100%', minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}
    >
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
          onClick={() => setSelected(null)}
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

      {selected.backgroundInfo || selected.deviceShowcase || selected.warningBanner ? (
        <div
          style={{
            flexShrink: 0,
            padding: '12px 16px',
            background: 'linear-gradient(180deg, rgba(30, 35, 48, 0.98) 0%, rgba(18, 22, 32, 0.95) 100%)',
            borderBottom: '1px solid var(--border, rgba(255,255,255,0.1))',
            maxHeight:
              selected.deviceShowcase || selected.warningBanner
                ? 'min(48vh, 420px)'
                : 'min(32vh, 220px)',
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
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.88)',
                }}
              >
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
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          background: '#1a1a1e',
        }}
      >
        {hasEmbed ? (
          fixedSize ? (
            <div
              style={{
                width: `min(100%, ${fixedSize.width}px)`,
                aspectRatio: `${fixedSize.width} / ${fixedSize.height}`,
                maxHeight: 'min(70vh, 100%)',
              }}
            >
              <iframe
                src={iframeProps.src}
                srcDoc={iframeProps.srcDoc}
                title={iframeProps.title}
                allow={iframeProps.allow}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                }}
                {...(iframeProps.external
                  ? {}
                  : {
                      sandbox:
                        'allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox',
                    })}
              />
            </div>
          ) : (
            <iframe
              src={iframeProps.src}
              srcDoc={iframeProps.srcDoc}
              title={iframeProps.title}
              allow={iframeProps.allow}
              style={{
                width: '100%',
                height: '100%',
                minHeight: 'calc(100vh - 120px)',
                border: 'none',
                display: 'block',
              }}
              {...(iframeProps.external
                ? {}
                : {
                    sandbox:
                      'allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox',
                  })}
            />
          )
        ) : (
          <div
            style={{
              padding: '40px',
              color: 'var(--text-dim)',
              textAlign: 'center',
              fontSize: '14px',
            }}
          >
            No HTML path or inline HTML set for this version.
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0, padding: '10px 16px', background: 'var(--panel-soft, #121620)', borderTop: '1px solid var(--border)' }}>
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
    </div>
  );
}
