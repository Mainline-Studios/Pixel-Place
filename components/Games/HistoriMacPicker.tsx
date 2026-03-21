'use client';

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import type { HistoriMacVersion } from '@/lib/historiMacVersions';
import { HISTORIMAC_VERSIONS } from '@/lib/historiMacVersions';
import { HISTORIMAC_WHISPERS } from '@/lib/historiMacWhispers';
import type { HistoriMacTimelineModel } from '@/lib/historiMacTimeline';
import {
  inferHistoriMacEra,
  HISTORIMAC_ERA_LABELS,
  HISTORIMAC_ERA_ORDER,
  type HistoriMacEraBucket,
} from '@/lib/historiMacEra';
import HistoriMacTimelineStrip from './HistoriMacTimelineStrip';
import {
  AQUA_FONT,
  aquaPinstripePage,
  aquaSheet,
  aquaCardInfiniteMac,
  aquaTextField,
  aquaGelButtonGraphite,
  aquaSegmentOff,
  aquaSegmentOn,
  aquaHudToast,
  aquaTrafficLight,
  aquaRunButton,
  aquaUnstableBadge,
} from '@/lib/historiMacAquaStyles';

const HISTORIMAC_PLAY_ICON = '/images/games/historimac-play.png';

type PickerFilter = 'all' | HistoriMacEraBucket | 'saved';

const showcaseHeadingStyle: React.CSSProperties = {
  fontFamily: AQUA_FONT,
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: '#5a5a5a',
  marginBottom: '6px',
};

const showcaseSubtitleStyle: React.CSSProperties = {
  fontFamily: AQUA_FONT,
  fontSize: '12px',
  fontWeight: 600,
  color: '#222',
  marginBottom: '8px',
};

const showcaseBodyStyle: React.CSSProperties = {
  fontFamily: AQUA_FONT,
  fontSize: '13px',
  fontWeight: 400,
  lineHeight: 1.55,
  color: '#333',
};

function excerpt(text: string | undefined, max = 140): string {
  if (!text?.trim()) return '';
  const t = text.trim().replace(/\s+/g, ' ');
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

/** Split "Mac OS X 10.4 (Tiger)" → main + gray (Tiger); all **Lucida Grande** via {@link AQUA_FONT} */
function VersionTitle({ label }: { label: string }) {
  const trimmed = label.trim();
  const paren = trimmed.match(/^(.+?)\s*(\([^)]+\))\s*$/);
  if (paren) {
    return (
      <span style={{ lineHeight: 1.25, fontFamily: AQUA_FONT }}>
        <span style={{ fontWeight: 700, color: '#000', letterSpacing: '-0.02em' }}>{paren[1]}</span>
        <span style={{ fontWeight: 600, color: '#888' }}> {paren[2]}</span>
      </span>
    );
  }
  return (
    <span style={{ fontFamily: AQUA_FONT, fontWeight: 700, color: '#000', letterSpacing: '-0.02em' }}>{trimmed}</span>
  );
}

export type HistoriMacPickerProps = {
  onClose?: () => void;
  onExitGame: () => void;
  /** Powered by Infinite Mac + Infinite Monkey links */
  attribution: React.ReactNode;
  whisperIdx: number;
  cycleWhisper: () => void;
  favoriteVersions: HistoriMacVersion[];
  favoriteIds: string[];
  resumeVersion?: HistoriMacVersion;
  timelineModel: HistoriMacTimelineModel | null;
  onActivateVersion: (id: string) => void;
  onPlay: (v: HistoriMacVersion) => void;
  onToggleFavorite: (id: string) => void;
  toast: string | null;
};

export default function HistoriMacPicker({
  onClose,
  onExitGame,
  attribution,
  whisperIdx,
  cycleWhisper,
  favoriteVersions,
  favoriteIds,
  resumeVersion,
  timelineModel,
  onActivateVersion,
  onPlay,
  onToggleFavorite,
  toast,
}: HistoriMacPickerProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PickerFilter>('all');
  const [yearSort, setYearSort] = useState<'asc' | 'desc'>('asc');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const yearSpan = useMemo(() => {
    if (!timelineModel) return null;
    return `${Math.round(timelineModel.rangeStart)}–${Math.round(timelineModel.rangeEnd)}`;
  }, [timelineModel]);

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...HISTORIMAC_VERSIONS];

    if (filter === 'saved') {
      list = list.filter((v) => favoriteIds.includes(v.id));
    } else if (filter !== 'all') {
      list = list.filter((v) => inferHistoriMacEra(v) === filter);
    }

    if (q) {
      list = list.filter((v) => {
        const blob = `${v.label} ${v.id} ${v.backgroundInfo ?? ''} ${v.deviceShowcase ?? ''}`.toLowerCase();
        return blob.includes(q);
      });
    }

    list.sort((a, b) => {
      const ya = a.timelineYear ?? 9999;
      const yb = b.timelineYear ?? 9999;
      const cmp = ya - yb;
      return yearSort === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [query, filter, yearSort, favoriteIds]);

  return (
    <div
      data-historimac-root
      data-era-hint="AQUA"
      style={{
        width: '100%',
        minHeight: '100vh',
        position: 'relative',
        overflowX: 'hidden',
        fontFamily: AQUA_FONT,
        ...aquaPinstripePage,
      }}
    >
      {onClose ? (
        <button
          type="button"
          title="Exit to the games grid — no saving to a floppy required."
          onClick={onExitGame}
          style={{
            position: 'fixed',
            top: '12px',
            left: '12px',
            zIndex: 9999,
            ...aquaGelButtonGraphite,
            fontSize: 11,
            padding: '8px 16px',
            boxShadow: `${aquaGelButtonGraphite.boxShadow}, 0 4px 16px rgba(0,0,0,0.2)`,
          }}
        >
          ◄ Back
        </button>
      ) : null}

      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '28px 20px 48px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Hero — floating window metaphor */}
        <header
          style={{
            textAlign: 'center',
            padding: 'clamp(16px, 4vw, 32px) 16px 8px',
          }}
        >
          <div
            style={{
              ...aquaSheet,
              maxWidth: '720px',
              margin: '0 auto',
              padding: '0',
              overflow: 'hidden',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                background: 'linear-gradient(180deg, #ededed 0%, #c8c8c8 100%)',
                borderBottom: '1px solid #888',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} aria-hidden>
                <span style={aquaTrafficLight('close')} />
                <span style={aquaTrafficLight('min')} />
                <span style={aquaTrafficLight('zoom')} />
              </div>
              <span
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#333',
                  textShadow: '0 1px 0 rgba(255,255,255,0.8)',
                }}
              >
                HistoriMac
              </span>
              <span style={{ width: 52 }} aria-hidden />
            </div>
            <div style={{ padding: '20px 22px 18px', textAlign: 'center' }}>
              <p
                style={{
                  margin: '0 0 8px',
                  fontSize: 11,
                  color: '#666',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Infinite Mac in one place
              </p>
              <h1
                title="A nod to history — and to every “one more thing” that shipped anyway."
                style={{
                  fontFamily: AQUA_FONT,
                  fontSize: 'clamp(22px, 4.5vw, 32px)',
                  fontWeight: 700,
                  margin: '0 0 12px',
                  lineHeight: 1.2,
                  color: '#111',
                  textShadow: '0 1px 0 rgba(255,255,255,0.95)',
                  letterSpacing: '-0.02em',
                }}
              >
                Histori
                <span title="The ROM knows what you did last session." style={{ color: '#0066cc' }}>
                  Mac
                </span>
              </h1>
              <p
                style={{
                  margin: '0 auto 14px',
                  maxWidth: '520px',
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: '#444',
                }}
              >
                Every major era — System through OS X and NeXT — one click. Fullscreen recommended once you’re in.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    ...aquaSegmentOff,
                    cursor: 'default',
                    fontSize: 12,
                    color: '#333',
                  }}
                >
                  {HISTORIMAC_VERSIONS.length} versions
                  {yearSpan ? (
                    <span style={{ color: '#666', fontWeight: 600 }}> · {yearSpan}</span>
                  ) : null}
                </span>
                <span style={{ fontSize: 12, color: '#555' }}>
                  <kbd
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'linear-gradient(180deg, #fff, #e0e0e0)',
                      border: '1px solid #999',
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 11,
                      boxShadow: 'inset 0 1px 0 #fff',
                    }}
                  >
                    /
                  </kbd>{' '}
                  focuses search
                </span>
              </div>

              <div style={{ margin: '0 auto', maxWidth: '640px' }}>{attribution}</div>

              <button
                type="button"
                onClick={cycleWhisper}
                title="Click to cycle hidden references. Shhh."
                style={{
                  display: 'block',
                  width: '100%',
                  maxWidth: '480px',
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
                  fontFamily: AQUA_FONT,
                  boxShadow: 'inset 0 1px 0 #fff',
                }}
              >
                {HISTORIMAC_WHISPERS[whisperIdx]}
              </button>
            </div>
          </div>
        </header>

        {/* Search + sort */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            maxWidth: '900px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <input
              ref={searchRef}
              id="historimac-search"
              type="search"
              aria-label="Search versions by name, year, or hardware"
              placeholder="Search by name, year, hardware…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setQuery('');
              }}
              style={{
                flex: '1 1 220px',
                minWidth: 0,
                padding: '10px 14px',
                fontSize: 14,
                ...aquaTextField,
              }}
            />
            <button
              type="button"
              onClick={() => setYearSort((s) => (s === 'asc' ? 'desc' : 'asc'))}
              title="Toggle sort by timeline year"
              style={{
                ...aquaGelButtonGraphite,
                padding: '10px 16px',
                whiteSpace: 'nowrap',
              }}
            >
              Year {yearSort === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div
            role="toolbar"
            aria-label="Filter by era"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#444',
                marginRight: 4,
                textShadow: '0 1px 0 rgba(255,255,255,0.5)',
              }}
            >
              SHOW
            </span>
            <button
              type="button"
              style={filter === 'all' ? aquaSegmentOn : aquaSegmentOff}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            {HISTORIMAC_ERA_ORDER.map((era) => (
              <button
                key={era}
                type="button"
                style={filter === era ? aquaSegmentOn : aquaSegmentOff}
                onClick={() => setFilter(era)}
              >
                {HISTORIMAC_ERA_LABELS[era]}
              </button>
            ))}
            <button
              type="button"
              style={filter === 'saved' ? aquaSegmentOn : aquaSegmentOff}
              onClick={() => setFilter('saved')}
              title="Versions you starred"
            >
              ★ Saved {favoriteIds.length > 0 ? `(${favoriteIds.length})` : ''}
            </button>
          </div>
        </div>

        {/* Quick row: favorites + resume */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            maxWidth: '900px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {favoriteVersions.length > 0 ? (
            <div
              style={{
                ...aquaSheet,
                padding: '16px',
                background: 'linear-gradient(180deg, #fffef5 0%, #f5f0dc 100%)',
                border: '1px solid #c9b87a',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#8a7220',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 10,
                  fontFamily: AQUA_FONT,
                }}
              >
                Your picks
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {favoriteVersions.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onPlay(v)}
                    style={{
                      ...aquaGelButtonGraphite,
                      padding: '8px 14px',
                      fontSize: 13,
                      borderColor: '#a89860',
                    }}
                  >
                    ★ {v.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {resumeVersion ? (
            <button
              type="button"
              onClick={() => onPlay(resumeVersion)}
              style={{
                width: '100%',
                padding: '14px 18px',
                ...aquaSheet,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                border: '1px solid #4a8cc8',
                background: 'linear-gradient(180deg, #eef6ff 0%, #d0e8fc 100%)',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>
                Resume <span style={{ color: '#0066cc' }}>{resumeVersion.label}</span>
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 600,
                  fontFamily: AQUA_FONT,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={HISTORIMAC_PLAY_ICON} alt="" width={28} height={28} style={{ imageRendering: 'pixelated' }} />
                Continue →
              </span>
            </button>
          ) : null}
        </div>

        {timelineModel ? (
          <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
            <HistoriMacTimelineStrip model={timelineModel} onActivateVersion={onActivateVersion} />
          </div>
        ) : null}

        {/* Version grid */}
        <section aria-label="Macintosh versions" style={{ width: '100%' }}>
          <h2
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#444',
              margin: '0 0 16px',
              textAlign: 'center',
              textShadow: '0 1px 0 rgba(255,255,255,0.5)',
            }}
          >
            Choose a version
          </h2>

          {HISTORIMAC_VERSIONS.length === 0 ? (
            <p style={{ color: '#444', fontSize: 14, textAlign: 'center', fontFamily: AQUA_FONT }}>
              No versions configured. Add entries in <code>lib/historiMacVersions.ts</code>.
            </p>
          ) : filteredSorted.length === 0 ? (
            <p
              style={{
                color: '#555',
                fontSize: 15,
                textAlign: 'center',
                padding: 32,
                fontFamily: AQUA_FONT,
              }}
            >
              No matches. Try another filter or clear search.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
                gap: '16px',
                alignItems: 'stretch',
              }}
            >
              {filteredSorted.map((v) => {
                const expanded = expandedIds.has(v.id);
                const fav = favoriteIds.includes(v.id);
                const era = inferHistoriMacEra(v);
                const blurb = excerpt(v.backgroundInfo);

                return (
                  <article
                    key={v.id}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      ...aquaCardInfiniteMac,
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ padding: '20px 20px 14px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                        <button
                          type="button"
                          aria-label={fav ? `Remove ${v.label} from picks` : `Save ${v.label} to picks`}
                          title={fav ? 'Remove from picks' : 'Save to picks (this device)'}
                          onClick={() => onToggleFavorite(v.id)}
                          style={{
                            flexShrink: 0,
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            ...aquaGelButtonGraphite,
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                            color: fav ? '#b8860b' : '#666',
                          }}
                        >
                          {fav ? '★' : '☆'}
                        </button>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 'clamp(17px, 2.5vw, 20px)', lineHeight: 1.3 }}>
                            <VersionTitle label={v.label} />
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              gap: '8px',
                              marginTop: '8px',
                            }}
                          >
                            {v.timelineYear != null ? (
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: '#666',
                                  fontFamily: AQUA_FONT,
                                }}
                              >
                                {v.timelineYear}
                              </span>
                            ) : null}
                            {v.warningBanner ? (
                              <span style={aquaUnstableBadge} title={v.warningBanner}>
                                Unstable
                              </span>
                            ) : null}
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                padding: '3px 8px',
                                borderRadius: 6,
                                background: 'rgba(0,0,0,0.06)',
                                border: '1px solid rgba(0,0,0,0.12)',
                                color: '#555',
                                fontFamily: AQUA_FONT,
                              }}
                            >
                              {HISTORIMAC_ERA_LABELS[era]}
                            </span>
                          </div>
                          {blurb && !expanded ? (
                            <p
                              style={{
                                margin: '10px 0 0',
                                fontSize: 13,
                                lineHeight: 1.5,
                                color: '#444',
                                fontFamily: AQUA_FONT,
                              }}
                            >
                              {blurb}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {expanded ? (
                        <div style={{ marginTop: '4px' }}>
                          {v.warningBanner ? (
                            <div
                              style={{
                                marginBottom: '12px',
                                padding: '12px',
                                background: 'linear-gradient(180deg, #fee2e2, #fecaca)',
                                border: '2px solid #dc2626',
                                borderRadius: 10,
                                textAlign: 'center',
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: AQUA_FONT,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: '#991b1b',
                                  lineHeight: 1.5,
                                }}
                              >
                                {v.warningBanner}
                              </span>
                            </div>
                          ) : null}
                          {v.backgroundInfo ? (
                            <>
                              <span style={{ display: 'block', ...showcaseHeadingStyle }}>Background</span>
                              <span
                                style={{
                                  display: 'block',
                                  fontSize: 13,
                                  lineHeight: 1.6,
                                  color: '#222',
                                  fontFamily: AQUA_FONT,
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
                                borderTop: v.backgroundInfo || v.warningBanner ? '1px solid #ccc' : 'none',
                              }}
                            >
                              <span style={{ display: 'block', ...showcaseHeadingStyle }}>Device</span>
                              {v.deviceShowcaseSubtitle ? (
                                <span style={{ display: 'block', ...showcaseSubtitleStyle }}>{v.deviceShowcaseSubtitle}</span>
                              ) : null}
                              <span style={{ display: 'block', ...showcaseBodyStyle }}>{v.deviceShowcase}</span>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => toggleExpanded(v.id)}
                        style={{
                          marginTop: '12px',
                          padding: '6px 0',
                          border: 'none',
                          background: 'none',
                          color: '#0066cc',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px',
                          fontFamily: AQUA_FONT,
                        }}
                      >
                        {expanded ? 'Show less' : 'Details & lore'}
                      </button>
                    </div>

                    <div style={{ padding: '0 20px 20px', display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        aria-label={`Run ${v.label} (play emulator)`}
                        onClick={() => onPlay(v)}
                        style={{
                          ...aquaRunButton,
                          minWidth: 'min(100%, 200px)',
                          width: '100%',
                          maxWidth: 280,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        Run
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

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
            boxShadow: `${aquaHudToast.boxShadow}, 0 4px 24px rgba(0,0,0,0.25)`,
          }}
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
