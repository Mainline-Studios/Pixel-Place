import type { ReactNode } from 'react';

/**
 * HistoriMac invite routes — standalone “preview” feel (no main app chrome).
 * Works on any host (e.g. preview.pixelplaceofficial.com) as long as this path is deployed.
 */
export default function HistoriMacInviteLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-historimac-invite-layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #1a1d2e 0%, #0f1118 50%, #16192a 100%)',
        color: '#e8e8ef',
      }}
    >
      {children}
    </div>
  );
}
