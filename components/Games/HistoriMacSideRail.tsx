'use client';

import React from 'react';

/** [Infinite Monkey](https://infinitemac.org/monkey/) — LLM computer-use demo; not embeddable as a query on `/embed`. */
export const INFINITE_MONKEY_URL = 'https://infinitemac.org/monkey/';

export type HistoriMacSideRailProps = {
  favorited: boolean;
  onToggleFavorite: () => void;
  onCopyLink: () => void;
  openExternalUrl: string | null;
  loreExpanded: boolean;
  onToggleLore: () => void;
  hasLore: boolean;
  /** Slimmer hit targets in fullscreen */
  compact?: boolean;
};

const btnBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 44,
  height: 44,
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.22)',
  background: 'rgba(18, 22, 32, 0.92)',
  color: '#e2e8f0',
  cursor: 'pointer',
  fontSize: 18,
  lineHeight: 1,
  boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
  backdropFilter: 'blur(8px)',
  transition: 'background 0.15s, border-color 0.15s, transform 0.12s',
};

export default function HistoriMacSideRail({
  favorited,
  onToggleFavorite,
  onCopyLink,
  openExternalUrl,
  loreExpanded,
  onToggleLore,
  hasLore,
  compact,
}: HistoriMacSideRailProps) {
  const sz = compact ? 40 : 44;
  const fs = compact ? 16 : 18;
  const pad = compact ? 6 : 8;

  return (
    <div
      role="toolbar"
      aria-label="HistoriMac quick actions"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: pad,
        pointerEvents: 'auto',
      }}
    >
      <button
        type="button"
        aria-pressed={favorited}
        aria-label={favorited ? 'Remove from saved picks' : 'Save this version to your picks'}
        title={favorited ? 'Remove from saved picks' : 'Save version to your picks (this device)'}
        onClick={onToggleFavorite}
        style={{
          ...btnBase,
          width: sz,
          height: sz,
          fontSize: fs,
          borderColor: favorited ? 'rgba(250, 204, 21, 0.55)' : btnBase.border as string,
          background: favorited ? 'rgba(120, 90, 20, 0.55)' : (btnBase.background as string),
        }}
      >
        {favorited ? '★' : '☆'}
      </button>

      <button
        type="button"
        aria-label="Copy link to this version"
        title="Copy share link — opens Games with this Mac version"
        onClick={onCopyLink}
        style={{ ...btnBase, width: sz, height: sz, fontSize: fs }}
      >
        ⧉
      </button>

      {openExternalUrl ? (
        <a
          href={openExternalUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open this session on Infinite Mac in a new tab"
          title="Open on Infinite Mac (new tab) — best for saves inside their player"
          style={{
            ...btnBase,
            width: sz,
            height: sz,
            fontSize: fs,
            textDecoration: 'none',
            color: '#7dd3fc',
          }}
        >
          ↗
        </a>
      ) : null}

      <a
        href={INFINITE_MONKEY_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open Infinite Monkey — AI controls a classic Mac"
        title="Infinite Monkey: use OpenAI or Anthropic to drive a classic Mac (your API key on their site). Choose the matching disk in the dropdown."
        style={{
          ...btnBase,
          width: sz,
          height: sz,
          fontSize: compact ? 15 : 17,
          textDecoration: 'none',
          color: '#c4b5fd',
          borderColor: 'rgba(167, 139, 250, 0.35)',
        }}
      >
        🐵
      </a>

      {hasLore ? (
        <button
          type="button"
          aria-expanded={loreExpanded}
          aria-label={loreExpanded ? 'Hide background and device info' : 'Show background and device info'}
          title={loreExpanded ? 'Hide lore panel' : 'Show lore panel'}
          onClick={onToggleLore}
          style={{ ...btnBase, width: sz, height: sz, fontSize: fs }}
        >
          ℹ
        </button>
      ) : null}
    </div>
  );
}
