'use client';

import { navigateToTab } from '@/lib/routing';

type VerifyAccountPromptProps = {
  open: boolean;
  onClose: () => void;
};

export default function VerifyAccountPrompt({ open, onClose }: VerifyAccountPromptProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-account-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 12000,
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        background: 'rgba(8, 10, 18, 0.72)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(440px, 100%)',
          background: 'rgba(18,22,36,0.98)',
          border: '1px solid rgba(132, 145, 255, 0.45)',
          borderRadius: 14,
          padding: 22,
          color: 'var(--text, #f3f4f6)',
          boxShadow: '0 18px 48px rgba(0,0,0,0.45)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="verify-account-title" style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 800 }}>
          Verify your account
        </h2>
        <p style={{ margin: '0 0 18px', lineHeight: 1.5, color: 'rgba(243,244,246,0.88)' }}>
          Add and verify your email in Settings to secure your account and unlock email sign-in codes.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn"
            style={{ fontWeight: 700 }}
            onClick={() => {
              onClose();
              navigateToTab('settings');
            }}
          >
            Go to Settings
          </button>
          <button type="button" className="btn" onClick={onClose}>
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
