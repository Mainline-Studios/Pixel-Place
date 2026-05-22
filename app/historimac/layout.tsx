import type { ReactNode } from 'react';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pixelplaceofficial.com';

/**
 * Absolute URLs for `og:image` / canonical (Messages, iOS link previews read Open Graph).
 * Set `NEXT_PUBLIC_SITE_URL` at build time if the canonical host differs.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

/**
 * HistoriMac invite routes — standalone “preview” feel (no main app chrome).
 * Works on any host (e.g. preview.pixelplaceofficial.com) as long as this path is deployed.
 */
export default function HistoriMacInviteLayout({ children }: { children: ReactNode }) {
  return (
    <div data-historimac-invite-layout style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}
