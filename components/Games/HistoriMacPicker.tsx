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
import type { HistoriMacCardTheme } from '@/lib/historiMacCardTheme';
import {
  inferHistoriMacCardTheme,
  cardArticleStyle,
  cardRunButtonStyle,
  cardFavButtonStyle,
  unstableBadgeStyle,
  eraChipStyle,
  themeYearStyle,
  themeBlurbStyle,
  themeDetailsLinkStyle,
  themeExpandedHeadingStyle,
  themeExpandedBodyStyle,
  themeExpandedSubtitleStyle,
  themeWarningBoxStyle,
  themeWarningTextStyle,
  themeExpandedBorderColor,
  THEME_FONT_SERIF_TITLE,
  shellRootStyle,
  shellBodyFont,
  shellHeroSheetStyle,
  shellHeroTitlebarStyle,
  shellHeroTitleStyle,
  shellShowTrafficLights,
  shellHeroBodyMuted,
  shellHeroBodyText,
  shellH1Style,
  shellH1AccentColor,
  shellBackButtonStyle,
  shellSearchFieldStyle,
  shellSortButtonStyle,
  shellSegmentOffStyle,
  shellSegmentOnStyle,
  shellToolbarLabelStyle,
  shellSectionHeadingStyle,
  shellFavoritesPanelStyle,
  shellFavoritesLabelStyle,
  shellPickPillStyle,
  shellResumeStyle,
  shellResumeFont,
  shellResumeAccent,
  shellWhisperButtonStyle,
  shellStatsPillStyle,
  shellKbdHintStyle,
  shellToastStyle,
  usesClassicPlatinumPixelUi,
  classicPlatinumPixelOverlayStyle,
} from '@/lib/historiMacCardTheme';
import { historiMacRunUsesImage, historiMacRunImageSrc } from '@/lib/historiMacRunAssets';
import HistoriMacTimelineStrip from './HistoriMacTimelineStrip';
import HistoriMacCustomPanel from './HistoriMacCustomPanel';
import { AQUA_FONT, aquaTrafficLight, aquaGelButtonBlue } from '@/lib/historiMacAquaStyles';
import {
  HISTORIMAC_FEATURED_BLURBS,
  HISTORIMAC_FEATURED_IDS,
  HISTORIMAC_HERO_LEAD,
  HISTORIMAC_TAGLINE,
} from '@/lib/historiMacMarketing';

const HISTORIMAC_PLAY_ICON = '/images/games/historimac-play.png';

type PickerFilter = 'all' | HistoriMacEraBucket | 'saved';

function excerpt(text: string | undefined, max = 140): string {
  if (!text?.trim()) return '';
  const t = text.trim().replace(/\s+/g, ' ');
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

/** Title line: Lucida for Aqua OS X; New York–style serif for classic / Platinum / NeXT */
function VersionTitle({ label, theme }: { label: string; theme: HistoriMacCardTheme }) {
  const trimmed = label.trim();
  const paren = trimmed.match(/^(.+?)\s*(\([^)]+\))\s*$/);
  const fontTitle = theme === 'aqua' ? AQUA_FONT : THEME_FONT_SERIF_TITLE;
  const subColor = theme === 'next' ? '#333' : theme === 'aqua' ? '#888' : '#888';
  if (paren) {
    return (
      <span style={{ lineHeight: 1.25, fontFamily: fontTitle }}>
        <span style={{ fontWeight: 700, color: '#000', letterSpacing: theme === 'aqua' ? '-0.02em' : '0' }}>{paren[1]}</span>
        <span style={{ fontWeight: 600, color: subColor }}> {paren[2]}</span>
      </span>
    );
  }
  return (
    <span style={{ fontFamily: fontTitle, fontWeight: 700, color: '#000', letterSpacing: theme === 'aqua' ? '-0.02em' : '0' }}>
      {trimmed}
    </span>
  );
}

export type HistoriMacPickerProps = {
  /** `/historimac` hub — enhanced hero + featured row (nav is outside). */
  standaloneCatalog?: boolean;
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
  standaloneCatalog = false,
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

  const featuredVersions = useMemo(
    () =>
      HISTORIMAC_FEATURED_IDS.map((id) => HISTORIMAC_VERSIONS.find((v) => v.id === id)).filter(
        Boolean,
      ) as HistoriMacVersion[],
    [],
  );

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

  const shellTheme = useMemo((): HistoriMacCardTheme => {
    if (resumeVersion) return inferHistoriMacCardTheme(resumeVersion);
    return 'aqua';
  }, [resumeVersion?.id]);

  return (
    <div
      data-historimac-root
      data-shell-era={shellTheme}
      style={{
        width: '100%',
        minHeight: '100vh',
        position: 'relative',
        overflowX: 'hidden',
        fontFamily: shellBodyFont(shellTheme),
        ...shellRootStyle(shellTheme),
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
            ...shellBackButtonStyle(shellTheme),
          }}
        >
          ◄ Back
        </button>
      ) : null}

      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: standaloneCatalog ? '16px 20px 48px' : '28px 20px 48px',
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
              ...shellHeroSheetStyle(shellTheme),
              maxWidth: '720px',
              margin: '0 auto',
              padding: '0',
              overflow: 'hidden',
              textAlign: 'left',
            }}
          >
            {usesClassicPlatinumPixelUi(shellTheme) ? (
              <div aria-hidden style={classicPlatinumPixelOverlayStyle()} />
            ) : null}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={shellHeroTitlebarStyle(shellTheme)}>
                {shellShowTrafficLights(shellTheme) ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} aria-hidden>
                    <span style={aquaTrafficLight('close')} />
                    <span style={aquaTrafficLight('min')} />
                    <span style={aquaTrafficLight('zoom')} />
                  </div>
                ) : (
                  <span style={{ width: 4 }} aria-hidden />
                )}
                <span style={shellHeroTitleStyle(shellTheme)}>HistoriMac</span>
                <span style={{ width: shellShowTrafficLights(shellTheme) ? 52 : 8 }} aria-hidden />
              </div>
              <div style={{ padding: '20px 22px 18px', textAlign: 'center' }}>
              <p
                style={{
                  margin: '0 0 8px',
                  fontSize: 11,
                  color: shellHeroBodyMuted(shellTheme),
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontFamily: shellBodyFont(shellTheme),
                }}
              >
                {standaloneCatalog ? 'Pixel Place × Infinite Mac' : 'Infinite Mac in one place'}
              </p>
              <h1
                title="A nod to history — and to every “one more thing” that shipped anyway."
                style={shellH1Style(shellTheme)}
              >
                Histori
                <span title="The ROM knows what you did last session." style={{ color: shellH1AccentColor(shellTheme) }}>
                  Mac
                </span>
              </h1>
              <p
                style={{
                  margin: '0 auto 14px',
                  maxWidth: '560px',
                  fontSize: standaloneCatalog ? 15 : 14,
                  lineHeight: 1.6,
                  color: shellHeroBodyText(shellTheme),
                  fontFamily: shellBodyFont(shellTheme),
                }}
              >
                {standaloneCatalog ? HISTORIMAC_TAGLINE : HISTORIMAC_HERO_LEAD}
              </p>
              {standaloneCatalog ? (
                <p
                  style={{
                    margin: '0 auto 16px',
                    maxWidth: '520px',
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: shellHeroBodyMuted(shellTheme),
                    fontFamily: shellBodyFont(shellTheme),
                  }}
                >
                  {HISTORIMAC_HERO_LEAD}
                </p>
              ) : null}

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
                <span style={shellStatsPillStyle(shellTheme)}>
                  {HISTORIMAC_VERSIONS.length} versions
                  {yearSpan ? (
                    <span style={{ opacity: 0.75, fontWeight: 600 }}> · {yearSpan}</span>
                  ) : null}
                </span>
                <span style={shellKbdHintStyle(shellTheme)}>
                  <kbd
                    style={{
                      padding: '3px 8px',
                      borderRadius: shellTheme === 'aqua' ? 6 : 0,
                      background:
                        shellTheme === 'next'
                          ? '#888'
                          : shellTheme === 'classic'
                            ? '#fff'
                            : 'linear-gradient(180deg, #fff, #e0e0e0)',
                      border:
                        shellTheme === 'classic'
                          ? '2px solid #000'
                          : shellTheme === 'next'
                            ? '1px solid #000'
                            : '1px solid #999',
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 11,
                      boxShadow: shellTheme === 'aqua' || shellTheme === 'platinum' ? 'inset 0 1px 0 #fff' : 'none',
                    }}
                  >
                    /
                  </kbd>{' '}
                  focuses search
                </span>
              </div>

              <div
                style={{
                  margin: '0 auto',
                  maxWidth: '640px',
                  color: shellHeroBodyText(shellTheme),
                  fontFamily: shellBodyFont(shellTheme),
                }}
              >
                {attribution}
              </div>

              <button
                type="button"
                onClick={cycleWhisper}
                title="Click to cycle hidden references. Shhh."
                style={shellWhisperButtonStyle(shellTheme)}
              >
                {HISTORIMAC_WHISPERS[whisperIdx]}
              </button>
              </div>
            </div>
          </div>
        </header>

        {standaloneCatalog && featuredVersions.length > 0 ? (
          <section aria-label="Featured Mac versions" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
            <h2 style={{ ...shellSectionHeadingStyle(shellTheme), marginBottom: 12 }}>Start here</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                gap: 14,
              }}
            >
              {featuredVersions.map((v) => {
                const blurb = HISTORIMAC_FEATURED_BLURBS[v.id as keyof typeof HISTORIMAC_FEATURED_BLURBS];
                const cardTheme = inferHistoriMacCardTheme(v);
                return (
                  <article
                    key={v.id}
                    style={{
                      ...cardArticleStyle(cardTheme),
                      padding: '18px 18px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {usesClassicPlatinumPixelUi(cardTheme) ? (
                      <div aria-hidden style={classicPlatinumPixelOverlayStyle()} />
                    ) : null}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ fontSize: 'clamp(16px, 2vw, 18px)' }}>
                        <VersionTitle label={v.label} theme={cardTheme} />
                      </div>
                      {v.timelineYear != null ? (
                        <span style={{ ...themeYearStyle(cardTheme), marginTop: 8, display: 'inline-block' }}>
                          {v.timelineYear}
                        </span>
                      ) : null}
                      {blurb ? (
                        <p style={{ margin: '10px 0 0', ...themeBlurbStyle(cardTheme), lineHeight: 1.5 }}>{blurb}</p>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onPlay(v)}
                        style={{
                          ...(cardTheme === 'aqua' ? aquaGelButtonBlue : cardRunButtonStyle(cardTheme)),
                          marginTop: 14,
                          width: '100%',
                          minHeight: cardTheme === 'aqua' ? 40 : 44,
                          cursor: 'pointer',
                        }}
                      >
                        {cardTheme === 'aqua' ? 'Run now' : historiMacRunUsesImage(cardTheme) ? (
                          <img
                            src={historiMacRunImageSrc(cardTheme)}
                            alt=""
                            width={44}
                            height={44}
                            style={{ display: 'block', imageRendering: 'pixelated' }}
                          />
                        ) : (
                          'Run'
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

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
              style={shellSearchFieldStyle(shellTheme)}
            />
            <button
              type="button"
              onClick={() => setYearSort((s) => (s === 'asc' ? 'desc' : 'asc'))}
              title="Toggle sort by timeline year"
              style={shellSortButtonStyle(shellTheme)}
            >
              Year {yearSort === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div
            role="toolbar"
            aria-label="Filter by era"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}
          >
            <span style={shellToolbarLabelStyle(shellTheme)}>SHOW</span>
            <button
              type="button"
              style={filter === 'all' ? shellSegmentOnStyle(shellTheme) : shellSegmentOffStyle(shellTheme)}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            {HISTORIMAC_ERA_ORDER.map((era) => (
              <button
                key={era}
                type="button"
                style={filter === era ? shellSegmentOnStyle(shellTheme) : shellSegmentOffStyle(shellTheme)}
                onClick={() => setFilter(era)}
              >
                {HISTORIMAC_ERA_LABELS[era]}
              </button>
            ))}
            <button
              type="button"
              style={filter === 'saved' ? shellSegmentOnStyle(shellTheme) : shellSegmentOffStyle(shellTheme)}
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
            <div style={shellFavoritesPanelStyle(shellTheme)}>
              <div style={shellFavoritesLabelStyle(shellTheme)}>Your picks</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {favoriteVersions.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onPlay(v)}
                    style={shellPickPillStyle(shellTheme)}
                  >
                    ★ {v.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {resumeVersion ? (
            <button type="button" onClick={() => onPlay(resumeVersion)} style={shellResumeStyle(shellTheme)}>
              <span style={shellResumeFont(shellTheme)}>
                Resume <span style={{ color: shellResumeAccent(shellTheme) }}>{resumeVersion.label}</span>
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: shellTheme === 'next' ? '#111' : '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 600,
                  fontFamily: shellBodyFont(shellTheme),
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
            <HistoriMacTimelineStrip
              model={timelineModel}
              onActivateVersion={onActivateVersion}
              shellTheme={shellTheme}
            />
          </div>
        ) : null}

        <HistoriMacCustomPanel shellTheme={shellTheme} onRun={onPlay} />

        {/* Version grid */}
        <section aria-label="Macintosh versions" style={{ width: '100%' }}>
          <h2 style={shellSectionHeadingStyle(shellTheme)}>Choose a version</h2>

          {HISTORIMAC_VERSIONS.length === 0 ? (
            <p
              style={{
                color: shellHeroBodyText(shellTheme),
                fontSize: 14,
                textAlign: 'center',
                fontFamily: shellBodyFont(shellTheme),
              }}
            >
              No versions configured. Add entries in <code>lib/historiMacVersions.ts</code>.
            </p>
          ) : filteredSorted.length === 0 ? (
            <p
              style={{
                color: shellHeroBodyText(shellTheme),
                fontSize: 15,
                textAlign: 'center',
                padding: 32,
                fontFamily: shellBodyFont(shellTheme),
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
                const cardTheme = inferHistoriMacCardTheme(v);
                const runRowJustify = cardTheme === 'aqua' ? 'center' : 'flex-end';

                return (
                  <article
                    key={v.id}
                    data-historimac-pixel-ui={usesClassicPlatinumPixelUi(cardTheme) ? 'true' : undefined}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      ...cardArticleStyle(cardTheme),
                      overflow: 'hidden',
                    }}
                  >
                    {usesClassicPlatinumPixelUi(cardTheme) ? (
                      <div aria-hidden style={classicPlatinumPixelOverlayStyle()} />
                    ) : null}
                    <div style={{ padding: '20px 20px 14px', flex: 1, position: 'relative', zIndex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                        <button
                          type="button"
                          aria-label={fav ? `Remove ${v.label} from picks` : `Save ${v.label} to picks`}
                          title={fav ? 'Remove from picks' : 'Save to picks (this device)'}
                          onClick={() => onToggleFavorite(v.id)}
                          style={cardFavButtonStyle(cardTheme, fav)}
                        >
                          {fav ? '★' : '☆'}
                        </button>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 'clamp(17px, 2.5vw, 20px)', lineHeight: 1.3 }}>
                            <VersionTitle label={v.label} theme={cardTheme} />
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
                            {v.timelineYear != null ? <span style={themeYearStyle(cardTheme)}>{v.timelineYear}</span> : null}
                            {v.warningBanner ? (
                              <span style={unstableBadgeStyle(cardTheme)} title={v.warningBanner}>
                                Unstable
                              </span>
                            ) : null}
                            <span style={eraChipStyle(cardTheme)}>{HISTORIMAC_ERA_LABELS[era]}</span>
                          </div>
                          {blurb && !expanded ? (
                            <p style={{ margin: '10px 0 0', ...themeBlurbStyle(cardTheme) }}>{blurb}</p>
                          ) : null}
                        </div>
                      </div>

                      {expanded ? (
                        <div style={{ marginTop: '4px' }}>
                          {v.warningBanner ? (
                            <div style={themeWarningBoxStyle(cardTheme)}>
                              <span style={themeWarningTextStyle(cardTheme)}>{v.warningBanner}</span>
                            </div>
                          ) : null}
                          {v.backgroundInfo ? (
                            <>
                              <span style={{ display: 'block', ...themeExpandedHeadingStyle(cardTheme) }}>Background</span>
                              <span style={{ display: 'block', ...themeExpandedBodyStyle(cardTheme) }}>{v.backgroundInfo}</span>
                            </>
                          ) : null}
                          {v.deviceShowcase ? (
                            <div
                              style={{
                                marginTop: v.backgroundInfo || v.warningBanner ? '14px' : 0,
                                paddingTop: v.backgroundInfo || v.warningBanner ? '14px' : 0,
                                borderTop:
                                  v.backgroundInfo || v.warningBanner
                                    ? `1px solid ${themeExpandedBorderColor(cardTheme)}`
                                    : 'none',
                              }}
                            >
                              <span style={{ display: 'block', ...themeExpandedHeadingStyle(cardTheme) }}>Device</span>
                              {v.deviceShowcaseSubtitle ? (
                                <span style={{ display: 'block', ...themeExpandedSubtitleStyle(cardTheme) }}>
                                  {v.deviceShowcaseSubtitle}
                                </span>
                              ) : null}
                              <span style={{ display: 'block', ...themeExpandedBodyStyle(cardTheme) }}>{v.deviceShowcase}</span>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      <button type="button" onClick={() => toggleExpanded(v.id)} style={themeDetailsLinkStyle(cardTheme)}>
                        {expanded ? 'Show less' : 'Details & lore'}
                      </button>
                    </div>

                    <div
                      style={{
                        padding: '0 20px 20px',
                        display: 'flex',
                        justifyContent: runRowJustify,
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <button
                        type="button"
                        aria-label={`Run ${v.label} (play emulator)`}
                        onClick={() => onPlay(v)}
                        data-historimac-pixel-run={cardTheme === 'aqua' ? undefined : 'true'}
                        style={{
                          ...cardRunButtonStyle(cardTheme),
                          ...(cardTheme === 'aqua'
                            ? {
                                minWidth: 'min(100%, 200px)',
                                width: '100%',
                                maxWidth: 280,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }
                            : {
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }),
                        }}
                      >
                        {historiMacRunUsesImage(cardTheme) ? (
                          <img
                            src={historiMacRunImageSrc(cardTheme)}
                            alt=""
                            draggable={false}
                            width={50}
                            height={50}
                            style={{
                              display: 'block',
                              width: 50,
                              height: 50,
                              objectFit: 'contain',
                              imageRendering: 'pixelated',
                            }}
                          />
                        ) : (
                          'Run'
                        )}
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
            ...shellToastStyle(shellTheme),
          }}
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
