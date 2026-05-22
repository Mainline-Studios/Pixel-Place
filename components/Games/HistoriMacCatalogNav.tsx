'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AQUA_FONT, aquaGelButtonBlue, aquaSheet } from '@/lib/historiMacAquaStyles';

export default function HistoriMacCatalogNav() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100010,
        padding: '10px 16px',
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        background: 'rgba(236, 236, 236, 0.92)',
        backdropFilter: 'blur(10px)',
        fontFamily: AQUA_FONT,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            color: '#111',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          <Image src="/logo.png" alt="" width={28} height={28} />
          Pixel Place
        </Link>
        <span style={{ color: '#888', fontSize: 12 }} aria-hidden>
          /
        </span>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#000' }}>HistoriMac</span>
        <nav
          style={{
            marginLeft: 'auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
          }}
          aria-label="HistoriMac site"
        >
          <Link href="/games" style={navLinkStyle}>
            Games
          </Link>
          <Link href="/about" style={navLinkStyle}>
            About
          </Link>
          <a
            href="https://infinitemac.org"
            target="_blank"
            rel="noopener noreferrer"
            style={navLinkStyle}
          >
            Infinite Mac
          </a>
          <Link href="/" style={{ ...aquaGelButtonBlue, textDecoration: 'none', padding: '7px 14px', fontSize: 12 }}>
            Open app
          </Link>
        </nav>
      </div>
    </header>
  );
}

const navLinkStyle: CSSProperties = {
  ...aquaSheet,
  textDecoration: 'none',
  padding: '6px 12px',
  fontSize: 12,
  fontWeight: 600,
  color: '#111',
  borderRadius: 8,
  boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset',
};
