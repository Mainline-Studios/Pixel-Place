'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types';
import { downloadSignedPpaf } from '@/lib/ppaf';

export default function PpafBackupModal({
  user,
  open,
  onClose,
}: {
  user: User;
  open: boolean;
  onClose: () => void;
}) {
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    if (open) {
      setDownloadError('');
    }
  }, [open]);

  const createBackup = async () => {
    setDownloadError('');
    setCreatingBackup(true);
    try {
      const r = await downloadSignedPpaf(user);
      if (!r.ok) {
        setDownloadError(r.error);
        return;
      }
    } finally {
      setCreatingBackup(false);
    }
  };

  const uiBusy = creatingBackup;

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ppaf-backup-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={() => {
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        className="ai-box"
        style={{
          maxWidth: 520,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          margin: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div id="ppaf-backup-title" className="ai-label">
          Make backup (.ppaf)
        </div>
        <div className="ai-output" style={{ fontSize: 14, lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 12px', color: 'var(--text-dim)' }}>
            One tap downloads your signed <code style={{ fontSize: 12 }}>.ppaf</code> backup file.
          </p>

          <div style={{ marginBottom: 14 }}>
            <button type="button" className="btn" disabled={uiBusy} onClick={() => void createBackup()}>
              {creatingBackup ? 'Working…' : 'Create signed .ppaf file'}
            </button>
          </div>

          {downloadError && (
            <div
              role="alert"
              style={{
                marginBottom: 12,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid rgba(248, 113, 113, 0.4)',
                background: 'rgba(248, 113, 113, 0.08)',
                fontSize: 13,
                color: '#fecaca',
              }}
            >
              {downloadError}
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <button type="button" className="btn" style={{ opacity: 0.85 }} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
