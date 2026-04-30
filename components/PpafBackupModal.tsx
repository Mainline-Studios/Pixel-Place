'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types';
import { downloadSignedPpaf } from '@/lib/ppaf';
import { PPAF_KEYGEN_COMMAND } from '@/lib/ppafConstants';
import { parseGeneratePpafKeysOutput } from '@/lib/ppafPasteParser';
import {
  clearStoredPpafKeys,
  hasStoredPpafKeys,
  setStoredPpafKeys,
} from '@/lib/ppafBrowserKeys';
import { generatePpafKeyPairInBrowser } from '@/lib/ppafGenerateBrowserKeys';

export default function PpafBackupModal({
  user,
  open,
  onClose,
  onOpenConfigure,
}: {
  user: User;
  open: boolean;
  onClose: () => void;
  onOpenConfigure?: () => void;
}) {
  const [paste, setPaste] = useState('');
  const [pasteError, setPasteError] = useState('');
  const [generateError, setGenerateError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [keysSaved, setKeysSaved] = useState(false);
  const [lastRestorationBlock, setLastRestorationBlock] = useState('');
  const [backupDownloaded, setBackupDownloaded] = useState(false);
  const [restorationPopupOpen, setRestorationPopupOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setPasteError('');
      setGenerateError('');
      setDownloadError('');
      setBackupDownloaded(false);
      setRestorationPopupOpen(false);
      setKeysSaved(hasStoredPpafKeys());
    }
  }, [open]);

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(PPAF_KEYGEN_COMMAND);
    } catch {
      setPasteError('Could not copy — select the command and copy manually.');
    }
  };

  const copyRestorationBlock = async (block: string) => {
    try {
      await navigator.clipboard.writeText(block);
    } catch {
      setGenerateError('Could not copy — select the text and copy manually.');
    }
  };

  const generateInBrowser = async () => {
    setGenerateError('');
    setPasteError('');
    setGenerating(true);
    try {
      const { privatePem, publicPem, restorationBlock } = await generatePpafKeyPairInBrowser();
      setStoredPpafKeys(privatePem, publicPem);
      setKeysSaved(true);
      setLastRestorationBlock(restorationBlock);
      setPaste(restorationBlock);
      setRestorationPopupOpen(true);
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : 'Could not generate keys in this browser.');
    } finally {
      setGenerating(false);
    }
  };

  const savePaste = () => {
    setPasteError('');
    const parsed = parseGeneratePpafKeysOutput(paste);
    if (!parsed) {
      setPasteError(
        'Could not read that key blob. Paste only the long token starting with eyJ… (one line is fine), or the full "PPAF RESTORATION KEY" block, or both legacy PPAF_ED25519_* lines from a terminal.',
      );
      return;
    }
    setStoredPpafKeys(parsed.privatePem, parsed.publicPem);
    setKeysSaved(true);
    setPaste('');
  };

  const clearKeys = () => {
    clearStoredPpafKeys();
    setKeysSaved(false);
    setPasteError('');
    setLastRestorationBlock('');
    setPaste('');
  };

  const createBackup = async () => {
    setDownloadError('');
    setBackupDownloaded(false);
    setCreatingBackup(true);
    try {
      const r = await downloadSignedPpaf(user);
      if (!r.ok) {
        setDownloadError(r.error);
        return;
      }
      if (r.restorationBlockToSave) {
        setLastRestorationBlock(r.restorationBlockToSave);
        setPaste(r.restorationBlockToSave);
        setKeysSaved(true);
        setBackupDownloaded(true);
        setRestorationPopupOpen(true);
        return;
      }
      onClose();
    } finally {
      setCreatingBackup(false);
    }
  };

  const uiBusy = generating || creatingBackup;

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
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
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
            Downloads a cryptographically signed <code style={{ fontSize: 12 }}>.ppaf</code> file. When the deployment
            signs on the server, you are done in one tap. Otherwise this browser creates signing keys automatically,
            signs the file, and asks you to stash the restoration token somewhere safe.
          </p>

          {backupDownloaded && (
            <div
              role="status"
              style={{
                marginBottom: 14,
                padding: '12px 14px',
                borderRadius: 8,
                border: '1px solid rgba(110, 231, 183, 0.35)',
                background: 'rgba(110, 231, 183, 0.08)',
                fontSize: 13,
                color: '#6ee7b7',
              }}
            >
              Backup downloaded. This device just created new signing keys — copy the restoration block below (or use
              Copy) and save it somewhere secure if you will verify backups or use another browser later.
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => void copyRestorationBlock(lastRestorationBlock)}
                  disabled={!lastRestorationBlock}
                >
                  Copy restoration block
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ opacity: 0.9 }}
                  disabled={uiBusy}
                  onClick={() => {
                    setBackupDownloaded(false);
                    void createBackup();
                  }}
                >
                  Create another .ppaf
                </button>
                <button type="button" className="btn" style={{ opacity: 0.9 }} onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>Step 1: clone + run key script (terminal path)</strong>
            <div
              style={{
                marginTop: 8,
                padding: '10px 12px',
                borderRadius: 8,
                background: 'var(--panel-soft)',
                border: '1px solid var(--border)',
                fontFamily: 'ui-monospace, monospace',
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              <div>git clone https://github.com/Mainline-Studios/Pixel-Place.git</div>
              <div>cd Pixel-Place</div>
              <div>{PPAF_KEYGEN_COMMAND}</div>
            </div>
            <div style={{ marginTop: 8 }}>
              <button type="button" className="btn" style={{ flexShrink: 0 }} onClick={() => void copyCommand()}>
                Copy keygen command
              </button>
            </div>
          </div>

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

          {!backupDownloaded && (
            <div style={{ marginBottom: 16 }}>
              <button type="button" className="btn" disabled={uiBusy} onClick={() => void createBackup()}>
                {creatingBackup ? 'Working…' : 'Step 2: Create signed .ppaf file'}
              </button>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>Optional: device keys &amp; paste</strong>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--text-dim)' }}>
              Only needed if you want to reuse keys from before, or to prepare before going offline. You can paste{' '}
              <strong>only</strong> the <code style={{ fontSize: 12 }}>eyJ…</code> token.
            </p>
            <strong style={{ display: 'block', marginBottom: 8 }}>Generate new keys here</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <button type="button" className="btn" disabled={uiBusy} onClick={() => void generateInBrowser()}>
                {generating ? 'Generating…' : 'Generate keys in this browser'}
              </button>
              {lastRestorationBlock && (
                <button
                  type="button"
                  className="btn"
                  style={{ opacity: 0.9 }}
                  onClick={() => void copyRestorationBlock(lastRestorationBlock)}
                >
                  Copy restoration block
                </button>
              )}
            </div>
            {generateError && (
              <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{generateError}</div>
            )}
            <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--text-dim)' }}>
              Saves keys in this browser and fills the box so you can copy the token.
            </p>
          </div>

          <div style={{ marginBottom: 14 }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>Paste a saved token or block</strong>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--text-dim)' }}>
              Paste the single <code style={{ fontSize: 12 }}>eyJ…</code> line, a labeled block, or legacy terminal lines.
            </p>
            <strong style={{ display: 'block', marginBottom: 8 }}>Paste here</strong>
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              placeholder={'eyJ2ZXJzaW9uIjoxLCJhbGd… (one line) or full PPAF RESTORATION KEY block'}
              rows={6}
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
              }}
            />
            {pasteError && (
              <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{pasteError}</div>
            )}
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button type="button" className="btn" onClick={savePaste} disabled={!paste.trim()}>
                Save pasted keys
              </button>
              {keysSaved && (
                <button type="button" className="btn" style={{ opacity: 0.9 }} onClick={clearKeys}>
                  Clear saved keys
                </button>
              )}
            </div>
            {keysSaved && !backupDownloaded && (
              <p style={{ margin: '10px 0 0', fontSize: 13, color: '#6ee7b7' }}>
                Keys saved on this device for browser signing when the server does not sign.
              </p>
            )}
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
            {!backupDownloaded && (
              <button type="button" className="btn" disabled={uiBusy} onClick={() => void createBackup()}>
                {creatingBackup ? 'Working…' : 'Create signed .ppaf again'}
              </button>
            )}
            <button type="button" className="btn" style={{ opacity: 0.85 }} onClick={onClose}>
              {backupDownloaded ? 'Close' : 'Cancel'}
            </button>
            {onOpenConfigure && (
              <button
                type="button"
                className="btn"
                style={{ opacity: 0.85 }}
                onClick={() => {
                  onOpenConfigure();
                  onClose();
                }}
              >
                Server deploy help
              </button>
            )}
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
          onClick={() => setRestorationPopupOpen(false)}
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
