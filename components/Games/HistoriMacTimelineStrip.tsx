'use client';

import React from 'react';
import type { HistoriMacTimelineModel } from '@/lib/historiMacTimeline';
import { AQUA_FONT, aquaCardInfiniteMac, aquaTrafficLight } from '@/lib/historiMacAquaStyles';

type Props = {
  model: HistoriMacTimelineModel;
  /** Opens that version (same as Play). List below still scrolls normally. */
  onActivateVersion: (versionId: string) => void;
};

/**
 * Timeline UI for HistoriMac — data comes from {@link computeHistoriMacTimeline} in `lib/historiMacTimeline.ts`.
 */
export default function HistoriMacTimelineStrip({ model, onActivateVersion }: Props) {
  if (model.dots.length === 0) {
    return null;
  }

  const { rangeStart, rangeEnd, tickYears, dots } = model;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 'min(900px, 100%)',
        margin: '0 auto',
        ...aquaCardInfiniteMac,
        padding: '16px 18px 14px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: '1px solid #c8c8c8',
        }}
      >
        <div style={{ display: 'flex', gap: 7 }} aria-hidden>
          <span style={{ ...aquaTrafficLight('close'), width: 10, height: 10 }} />
          <span style={{ ...aquaTrafficLight('min'), width: 10, height: 10 }} />
          <span style={{ ...aquaTrafficLight('zoom'), width: 10, height: 10 }} />
        </div>
        <div style={{ flex: 1, fontFamily: AQUA_FONT }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#0066cc',
              marginBottom: 4,
            }}
          >
            Timeline · {Math.round(rangeStart)}–{Math.round(rangeEnd)}
          </div>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: '#444' }}>
            Tap a dot to <strong style={{ color: '#111' }}>jump in</strong>. Use the grid for filters & search.{' '}
            <strong style={{ color: '#0066cc' }}>Fullscreen</strong> is best once you’re running.
          </p>
        </div>
      </div>
      <div style={{ position: 'relative', height: 52, marginBottom: 10 }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: 5,
            marginTop: -2,
            borderRadius: 4,
            background: 'linear-gradient(180deg, #b8b8b8 0%, #e8e8e8 40%, #d0d0d0 100%)',
            border: '1px solid #888',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.12)',
          }}
        />
        {dots.map(({ versionId, label, leftPct, offsetX, year }) => (
          <button
            key={versionId}
            type="button"
            title={`${label} (${year}) — open`}
            onClick={() => onActivateVersion(versionId)}
            style={{
              position: 'absolute',
              left: `calc(${leftPct}% + ${offsetX}px)`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: '2px solid #1a5a8a',
              background: `
                radial-gradient(circle at 32% 28%, #ffffff 0%, #a8dcff 35%, #4a9ee6 55%, #2a78c8 100%)
              `,
              cursor: 'pointer',
              padding: 0,
              boxShadow: `
                inset 0 2px 4px rgba(255,255,255,0.7),
                inset 0 -2px 4px rgba(0,60,120,0.25),
                0 2px 6px rgba(0,60,120,0.35)
              `,
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
          color: '#666',
          letterSpacing: '0.03em',
          fontFamily: AQUA_FONT,
        }}
      >
        {tickYears.map((y) => (
          <span key={y}>{y}</span>
        ))}
      </div>
    </div>
  );
}
