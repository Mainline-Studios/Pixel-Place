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
  const [lastRestorationBlock, setLastRestorationBlock] = useState('');
  const [restorationPopupOpen, setRestorationPopupOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setDownloadError('');
      setRestorationPopupOpen(false);
    }
  }, [open]);

  const copyRestorationBlock = async (block: string) => {
    try {
      await navigator.clipboard.writeText(block);
    } catch {
      setDownloadError('Could not copy — select the text and copy manually.');
    }
  };

  const createBackup = async () => {
    setDownloadError('');
    setCreatingBackup(true);
    try {
      const r = await downloadSignedPpaf(user);
      if (!r.ok) {
        setDownloadError(r.error);
        return;
      }
      if (r.restorationBlockToSave) {
        setLastRestorationBlock(r.restorationBlockToSave);
        setRestorationPopupOpen(true);
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
        if (!restorationPopupOpen) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !restorationPopupOpen) onClose();
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

          {lastRestorationBlock && (
            <div style={{ marginBottom: 14 }}>
              <button
                type="button"
                className="btn"
                style={{ opacity: 0.92 }}
                onClick={() => setRestorationPopupOpen(true)}
              >
                Open full restoration key popup
              </button>
            </div>
          )}

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

      {restorationPopupOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="PPAF restoration key"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1400,
            background: 'rgba(0,0,0,0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="ai-box"
            style={{
              width: 'min(1000px, 100%)',
              maxHeight: '92vh',
              overflow: 'auto',
              margin: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ai-label">PPAF restoration key (save this)</div>
            <div className="ai-output" style={{ fontSize: 14, lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 10px', color: 'var(--text-dim)' }}>
                This is intentionally large so the entire token is visible. Keep this safe and private.
              </p>
              <textarea
                readOnly
                value={lastRestorationBlock}
                rows={14}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--panel-soft)',
                  color: 'var(--text-main)',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 12,
                  resize: 'vertical',
                  overflowWrap: 'anywhere',
                }}
              />
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => void copyRestorationBlock(lastRestorationBlock)}
                  disabled={!lastRestorationBlock}
                >
                  Copy restoration block
                </button>
                <button type="button" className="btn" style={{ opacity: 0.9 }} onClick={() => setRestorationPopupOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
