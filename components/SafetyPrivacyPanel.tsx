'use client';

import type { User } from '@/types';
import { useRef, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { navigateToTab } from '@/lib/routing';
import {
  downloadSignedPpaf,
  mergePpafPayloadIntoUserUpdates,
  PPAF_NOT_CONFIGURED_CODE,
  verifyPpafFile,
} from '@/lib/ppaf';
import { clearSiteTranslationCache } from '@/lib/siteTranslationCache';
import LocalizeText from '@/components/LocalizeText';
import PpafConfigurePanel from '@/components/PpafConfigurePanel';

interface SafetyPrivacyPanelProps {
  user: User;
}

export default function SafetyPrivacyPanel({ user }: SafetyPrivacyPanelProps) {
  const { setUser, updateUser } = useUser();
  const ppafInputRef = useRef<HTMLInputElement>(null);
  const [ppafBusy, setPpafBusy] = useState(false);
  const [ppafNeedsConfigureBanner, setPpafNeedsConfigureBanner] = useState(false);
  const [ppafConfigureOpen, setPpafConfigureOpen] = useState(false);

  const scrollToConfigure = () => {
    setPpafConfigureOpen(true);
    requestAnimationFrame(() => {
      document.getElementById('ppaf-configure-block')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const handleSignOut = () => {
    if (
      !confirm(
        'Sign out on this browser? Your session and auth token on this device will be cleared.',
      )
    ) {
      return;
    }
    setUser(null);
  };

  const handleDownloadPpaf = async () => {
    setPpafBusy(true);
    try {
      const r = await downloadSignedPpaf(user);
      if (!r.ok) {
        if (r.code === PPAF_NOT_CONFIGURED_CODE) {
          setPpafNeedsConfigureBanner(true);
          scrollToConfigure();
        } else {
          alert(r.error);
        }
        return;
      }
      setPpafNeedsConfigureBanner(false);
    } finally {
      setPpafBusy(false);
    }
  };

  const handleRestorePpaf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      alert('Could not read this file — it must be valid Pixel Place account backup (.ppaf) JSON.');
      return;
    }

    const verified = await verifyPpafFile(parsed);
    if (!verified.ok) {
      if (verified.code === PPAF_NOT_CONFIGURED_CODE) {
        setPpafNeedsConfigureBanner(true);
        scrollToConfigure();
      } else {
        alert(verified.error);
      }
      return;
    }

    const payload = verified.payload;
    const un =
      typeof payload.username === 'string' ? payload.username.trim().toLowerCase() : '';
    if (!un || un !== user.username.toLowerCase()) {
      alert('This backup belongs to a different account. Sign in as that user to restore it.');
      return;
    }

    if (
      !confirm(
        'Restore profile fields from this verified backup? Your password is never loaded from a file. Continue?',
      )
    ) {
      return;
    }

    const updates = mergePpafPayloadIntoUserUpdates(payload);
    await updateUser(updates);
    alert('Restored data from your .ppaf backup.');
  };

  return (
    <div className="ai-box">
      <div className="ai-label">
        <LocalizeText text="Privacy & safety" />
      </div>
      <div className="ai-output" style={{ lineHeight: 1.6 }}>
        <p style={{ margin: '0 0 10px' }}>
          <LocalizeText text="We take safety seriously: accounts use server-verified sign-in, reports go to moderators, and you control data on this device." />
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: '1.2em' }}>
          <li>
            <LocalizeText text="Never share your password or one-time codes with anyone — staff will never ask for them." />
          </li>
          <li>
            <LocalizeText text="Use the Safety tab to report harassment, cheating, or impersonation." />
          </li>
          <li>
            <LocalizeText text="Download a signed .ppaf (Pixel Place Account File) — only Pixel Place can issue a valid signature; corrupted edits fail verification." />
          </li>
        </ul>

        {ppafNeedsConfigureBanner && (
          <div
            role="alert"
            style={{
              marginBottom: 12,
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid rgba(251, 191, 36, 0.45)',
              background: 'rgba(251, 191, 36, 0.1)',
              fontSize: 14,
              lineHeight: 1.55,
            }}
          >
            <strong style={{ color: '#fcd34d' }}>Backup signing isn&apos;t configured on the server.</strong>{' '}
            Add the keys below (see <strong>Configure</strong>), redeploy Functions + hosting, then try again.
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button type="button" className="btn" onClick={scrollToConfigure}>
                Configure
              </button>
              <button
                type="button"
                className="btn"
                style={{ opacity: 0.85 }}
                onClick={() => setPpafNeedsConfigureBanner(false)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <input
          ref={ppafInputRef}
          type="file"
          accept=".ppaf,application/json"
          className="hidden"
          aria-hidden
          tabIndex={-1}
          onChange={handleRestorePpaf}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
          <button type="button" className="btn" onClick={() => navigateToTab('report')}>
            <LocalizeText text="Open Safety & reports" />
          </button>
          <button
            type="button"
            className="btn"
            disabled={ppafBusy}
            onClick={() => void handleDownloadPpaf()}
          >
            {ppafBusy ? 'Preparing…' : 'Download account backup (.ppaf)'}
          </button>
          <button type="button" className="btn" onClick={() => ppafInputRef.current?.click()}>
            <LocalizeText text="Restore from .ppaf" />
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              clearSiteTranslationCache();
              alert('Translation cache cleared for this tab. UI may reload translations as you browse.');
            }}
          >
            <LocalizeText text="Clear translation cache" />
          </button>
          <button type="button" className="btn" onClick={handleSignOut}>
            <LocalizeText text="Sign out on this browser" />
          </button>
        </div>

        <PpafConfigurePanel open={ppafConfigureOpen} onToggle={setPpafConfigureOpen} />
      </div>
    </div>
  );
}
