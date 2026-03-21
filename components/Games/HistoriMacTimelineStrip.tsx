'use client';

import React from 'react';
import type { HistoriMacTimelineModel } from '@/lib/historiMacTimeline';

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
        maxWidth: 'min(640px, 100%)',
        marginBottom: '8px',
        padding: '12px 14px',
        borderRadius: '12px',
        border: '1px solid var(--border, rgba(255,255,255,0.12))',
        background: 'rgba(20, 24, 36, 0.6)',
      }}
    >
      <div style={{ marginBottom: '10px' }}>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-dim, #8b90a8)',
            marginBottom: '6px',
          }}
        >
          Timeline · {Math.round(rangeStart)}–{Math.round(rangeEnd)}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '11px',
            lineHeight: 1.45,
            color: 'rgba(203, 213, 225, 0.82)',
          }}
        >
          Tap a dot to <strong style={{ color: '#e0f2fe' }}>open</strong> that version. You can still{' '}
          <strong style={{ color: '#e0f2fe' }}>scroll</strong> the list below.{' '}
          <span style={{ color: '#7dd3fc' }}>Fullscreen is recommended</span> once you’re playing.
        </p>
      </div>
      <div style={{ position: 'relative', height: '44px', marginBottom: '6px' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: '3px',
            marginTop: '-1px',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, rgba(0,162,255,0.35), rgba(180,200,255,0.5), rgba(0,162,255,0.35))',
          }}
        />
        {dots.map(({ versionId, label, leftPct, offsetX, year }) => (
          <button
            key={versionId}
            type="button"
            title={`Open ${label} (${year})`}
            onClick={() => onActivateVersion(versionId)}
            style={{
              position: 'absolute',
              left: `calc(${leftPct}% + ${offsetX}px)`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: '2px solid #7dd3fc',
              background: 'radial-gradient(circle at 30% 30%, #fff 0%, #00a2ff 45%, #0369a1 100%)',
              cursor: 'pointer',
              padding: 0,
              boxShadow: '0 0 10px rgba(0, 162, 255, 0.5)',
            }}
            aria-label={`Play ${label} (${year})`}
          />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '9px',
          color: 'rgba(139, 144, 168, 0.75)',
          letterSpacing: '0.04em',
        }}
      >
        {tickYears.map((y) => (
          <span key={y}>{y}</span>
        ))}
      </div>
    </div>
  );
}
