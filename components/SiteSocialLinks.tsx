'use client';

import type { CSSProperties } from 'react';
import {
  PIXEL_PLACE_GITHUB,
  PIXEL_PLACE_OFFICIAL_LINKS,
  PIXEL_PLACE_YOUTUBE,
} from '@/lib/siteLinks';

const linkStyle: CSSProperties = {
  color: 'var(--text-dim, #8b90a8)',
  fontWeight: 500,
  fontSize: 13,
  textDecoration: 'none',
};

type Props = {
  /** Tighter spacing between text links */
  compact?: boolean;
  /**
   * `inline` = short labels · `urls` = full URLs as link text · `dominant` = large buttons
   */
  variant?: 'inline' | 'urls' | 'dominant';
  className?: string;
};

/**
 * Official YouTube + GitHub for Pixel Place (opens in new tab).
 * @see https://www.youtube.com/@OfficialPixelPlace
 * @see https://github.com/Mainline-Studios/Pixel-Place
 */
export default function SiteSocialLinks({ compact, variant, className }: Props) {
  const resolvedVariant = variant ?? 'inline';

  if (resolvedVariant === 'urls') {
    return (
      <div
        className={['site-social-urls', className].filter(Boolean).join(' ')}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px 14px',
          rowGap: 8,
          width: '100%',
          maxWidth: 900,
          margin: '0 auto',
          padding: '0 4px',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase' as const,
            color: 'var(--text-dim, #8b90a8)',
            flexShrink: 0,
          }}
        >
          Official
        </span>
        {PIXEL_PLACE_OFFICIAL_LINKS.map((item, i) => (
          <span key={item.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
            {i > 0 ? (
              <span style={{ opacity: 0.35, userSelect: 'none' }} aria-hidden>
                |
              </span>
            ) : null}
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="site-social-urls-link"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--accent, #5ecfff)',
                textDecoration: 'none',
                wordBreak: 'break-all' as const,
                textAlign: 'center' as const,
                lineHeight: 1.35,
              }}
              title={item.label}
            >
              {item.label}
            </a>
          </span>
        ))}
      </div>
    );
  }

  if (resolvedVariant === 'dominant') {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: 14,
          width: '100%',
          maxWidth: 720,
          margin: '0 auto',
        }}
      >
        <a
          href={PIXEL_PLACE_YOUTUBE}
          target="_blank"
          rel="noopener noreferrer"
          className="site-social-dominant-yt"
          style={{
            flex: '1 1 200px',
            minHeight: 54,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '14px 22px',
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 'clamp(15px, 3.5vw, 17px)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
            color: '#fff',
            textDecoration: 'none',
            background: 'linear-gradient(145deg, #ff1a1a 0%, #b30000 55%, #8b0000 100%)',
            border: '2px solid rgba(255, 255, 255, 0.35)',
            boxShadow:
              '0 8px 28px rgba(255, 0, 0, 0.45), 0 0 0 1px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          title="Official Pixel Place on YouTube — @OfficialPixelPlace"
          aria-label="Official Pixel Place on YouTube"
        >
          <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden>
            ▶
          </span>
          <span style={{ textAlign: 'center', lineHeight: 1.25 }}>
            YouTube
            <span
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                opacity: 0.92,
                letterSpacing: '0.06em',
                marginTop: 4,
                textTransform: 'none' as const,
              }}
            >
              @OfficialPixelPlace
            </span>
          </span>
        </a>
        <a
          href={PIXEL_PLACE_GITHUB}
          target="_blank"
          rel="noopener noreferrer"
          className="site-social-dominant-gh"
          style={{
            flex: '1 1 200px',
            minHeight: 54,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '14px 22px',
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 'clamp(15px, 3.5vw, 17px)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
            color: '#f0f6fc',
            textDecoration: 'none',
            background: 'linear-gradient(145deg, #30363d 0%, #161b22 45%, #0d1117 100%)',
            border: '2px solid rgba(240, 246, 252, 0.22)',
            boxShadow:
              '0 8px 28px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          title="Pixel Place source on GitHub — Mainline-Studios/Pixel-Place"
          aria-label="Pixel Place on GitHub"
        >
          <svg
            width={26}
            height={26}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
            style={{ flexShrink: 0, opacity: 0.95 }}
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span style={{ textAlign: 'center', lineHeight: 1.25 }}>
            GitHub
            <span
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                opacity: 0.85,
                letterSpacing: '0.04em',
                marginTop: 4,
                textTransform: 'none' as const,
              }}
            >
              Mainline-Studios/Pixel-Place
            </span>
          </span>
        </a>
      </div>
    );
  }

  const gap = compact ? 10 : 14;
  return (
    <span
      className={['site-social-links-inline', className].filter(Boolean).join(' ')}
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap,
        rowGap: 8,
      }}
    >
      <a
        href={PIXEL_PLACE_YOUTUBE}
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
        title="Official Pixel Place on YouTube"
      >
        YouTube
      </a>
      <span style={{ opacity: 0.45, userSelect: 'none' }} aria-hidden>
        •
      </span>
      <a
        href={PIXEL_PLACE_GITHUB}
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
        title="Pixel Place on GitHub"
      >
        GitHub
      </a>
    </span>
  );
}
