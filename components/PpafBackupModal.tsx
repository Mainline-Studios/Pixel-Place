'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types';
import { downloadSignedPpaf, PPAF_NOT_CONFIGURED_CODE } from '@/lib/ppaf';
import { PPAF_KEYGEN_COMMAND } from '@/lib/ppafConstants';
import { parseGeneratePpafKeysOutput } from '@/lib/ppafPasteParser';
import {
  clearStoredPpafKeys,
  getStoredPpafKeys,
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

  useEffect(() => {
    if (open) {
      setPasteError('');
      setGenerateError('');
      setDownloadError('');
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
        'Could not parse output. Paste the full output block that includes "PPAF RESTORATION KEY" and "KEEP THIS SAFE."',
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
    setCreatingBackup(true);
    try {
      const r = await downloadSignedPpaf(user);
      if (!r.ok) {
        if (r.code === PPAF_NOT_CONFIGURED_CODE && !getStoredPpafKeys()) {
          setDownloadError(
            'Server signing is off and no keys are saved here yet. Tap “Generate keys in this browser”, or paste a restoration block and Save pasted keys, then try again.',
          );
          return;
        }
        setDownloadError(r.error);
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
            Signed backups use Ed25519 keys. You can create keys right here—no project folder or terminal needed. Save
            the restoration block somewhere safe if you might restore on another device. Keys stay in this browser for
            signing until you clear them.
          </p>

          <div style={{ marginBottom: 14 }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>1. Generate keys (recommended)</strong>
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
              After you generate, we save the keys here and fill the box below so you can copy the block to a password
              manager or notes.
            </p>
          </div>

          <div style={{ marginBottom: 14 }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>2. Or paste keys from elsewhere</strong>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--text-dim)' }}>
              If you already ran the developer script or have a saved restoration block, paste it below and tap Save.
            </p>
            <details style={{ marginBottom: 10, fontSize: 13, color: 'var(--text-dim)' }}>
              <summary style={{ cursor: 'pointer', userSelect: 'none' }}>Advanced: run key script in a dev checkout</summary>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  marginTop: 8,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--panel-soft)',
                  border: '1px solid var(--border)',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 13,
                }}
              >
                <code style={{ flex: 1, minWidth: 0, wordBreak: 'break-all' }}>{PPAF_KEYGEN_COMMAND}</code>
                <button type="button" className="btn" style={{ flexShrink: 0 }} onClick={() => void copyCommand()}>
                  Copy command
                </button>
              </div>
            </details>
            <strong style={{ display: 'block', marginBottom: 8 }}>Paste restoration output</strong>
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              placeholder={
                'Paste output: PPAF RESTORATION KEY: ... KEEP THIS SAFE.'
              }
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
            {keysSaved && (
              <p style={{ margin: '10px 0 0', fontSize: 13, color: '#6ee7b7' }}>
                Keys saved on this device. If the server isn&apos;t configured, your backup will be signed in the
                browser instead.
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
            <button type="button" className="btn" disabled={uiBusy} onClick={() => void createBackup()}>
              {creatingBackup ? 'Working…' : 'Create signed .ppaf file'}
            </button>
            <button type="button" className="btn" style={{ opacity: 0.85 }} onClick={onClose}>
              Cancel
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
    </div>
  );
}
