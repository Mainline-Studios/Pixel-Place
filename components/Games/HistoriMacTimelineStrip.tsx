'use client';

import React from 'react';
import type { HistoriMacTimelineModel } from '@/lib/historiMacTimeline';
import { aquaTrafficLight } from '@/lib/historiMacAquaStyles';
import type { HistoriMacCardTheme } from '@/lib/historiMacCardTheme';
import {
  timelineStripChrome,
  shellTimelineCardStyle,
  usesClassicPlatinumPixelUi,
  classicPlatinumPixelOverlayStyle,
} from '@/lib/historiMacCardTheme';

type Props = {
  model: HistoriMacTimelineModel;
  /** Opens that version (same as Play). List below still scrolls normally. */
  onActivateVersion: (versionId: string) => void;
  /** Matches last-played era on the picker shell */
  shellTheme?: HistoriMacCardTheme;
};

/**
 * Timeline UI for HistoriMac — data comes from {@link computeHistoriMacTimeline} in `lib/historiMacTimeline.ts`.
 */
export default function HistoriMacTimelineStrip({ model, onActivateVersion, shellTheme = 'aqua' }: Props) {
  if (model.dots.length === 0) {
    return null;
  }

  const { rangeStart, rangeEnd, tickYears, dots } = model;
  const c = timelineStripChrome(shellTheme);

  return (
    <div style={shellTimelineCardStyle(shellTheme)}>
      {usesClassicPlatinumPixelUi(shellTheme) ? (
        <div aria-hidden style={classicPlatinumPixelOverlayStyle()} />
      ) : null}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: c.headerBorder,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {c.showLights ? (
          <div style={{ display: 'flex', gap: 7 }} aria-hidden>
            <span style={{ ...aquaTrafficLight('close'), width: 10, height: 10 }} />
            <span style={{ ...aquaTrafficLight('min'), width: 10, height: 10 }} />
            <span style={{ ...aquaTrafficLight('zoom'), width: 10, height: 10 }} />
          </div>
        ) : (
          <span style={{ width: 4 }} aria-hidden />
        )}
        <div style={{ flex: 1, fontFamily: c.font }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: c.titleColor,
              marginBottom: 4,
            }}
          >
            Timeline · {Math.round(rangeStart)}–{Math.round(rangeEnd)}
          </div>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: c.bodyColor }}>
            Tap a dot to <strong style={{ color: c.strongColor }}>jump in</strong>. Use the grid for filters & search.{' '}
            <strong style={{ color: c.accentStrong }}>Fullscreen</strong> is best once you’re running.
          </p>
        </div>
      </div>
      <div style={{ position: 'relative', height: 52, marginBottom: 10, zIndex: 1 }}>
        <div style={c.trackStyle} />
        {dots.map(({ versionId, label, leftPct, offsetX, year }) => (
          <button
            key={versionId}
            type="button"
            title={`${label} (${year}) — open`}
            onClick={() => onActivateVersion(versionId)}
            style={{
              ...c.dotStyle,
              left: `calc(${leftPct}% + ${offsetX}px)`,
              transition: 'transform 0.12s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
            }}
            aria-label={`Play ${label} (${year})`}
          />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          fontWeight: 700,
          color: c.tickColor,
          letterSpacing: '0.03em',
          fontFamily: c.font,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {tickYears.map((y) => (
          <span key={y}>{y}</span>
        ))}
      </div>
    </div>
  );
}
