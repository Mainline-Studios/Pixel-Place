'use client';

import type { User } from '@/types';
import { useRef, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { navigateToTab } from '@/lib/routing';
import {
  mergePpafPayloadIntoUserUpdates,
  PPAF_NOT_CONFIGURED_CODE,
  verifyPpafFile,
} from '@/lib/ppaf';
import { clearSiteTranslationCache } from '@/lib/siteTranslationCache';
import LocalizeText from '@/components/LocalizeText';
import PpafConfigurePanel from '@/components/PpafConfigurePanel';
import PpafBackupModal from '@/components/PpafBackupModal';

interface SafetyPrivacyPanelProps {
  user: User;
}

function previewRestoreValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value.length > 36 ? `"${value.slice(0, 36)}..."` : `"${value}"`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return `array(${value.length})`;
  if (typeof value === 'object') return 'object';
  return typeof value;
}

export default function SafetyPrivacyPanel({ user }: SafetyPrivacyPanelProps) {
  const { setUser, updateUser } = useUser();
  const ppafInputRef = useRef<HTMLInputElement>(null);
  const [ppafBackupOpen, setPpafBackupOpen] = useState(false);
  const [ppafConfigureOpen, setPpafConfigureOpen] = useState(false);

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
        setPpafBackupOpen(true);
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

    const updates = mergePpafPayloadIntoUserUpdates(payload);
    const updateEntries = Object.entries(updates).filter(([, value]) => value !== undefined);
    if (updateEntries.length === 0) {
      alert('Signature verified, but this backup has no restorable profile fields.');
      return;
    }

    const lines = updateEntries.map(([key, value], i) => `${i + 1}. ${key}: ${previewRestoreValue(value)}`);
    const picked = prompt(
      `Signature verified.\n\nWhat do you want restored?\n${lines.join(
        '\n',
      )}\n\nType numbers (example: 1,3,5) or "all".`,
      'all',
    );
    if (picked === null) return;
    const choice = picked.trim().toLowerCase();

    const selected = new Set<number>();
    if (choice === 'all') {
      for (let i = 1; i <= updateEntries.length; i++) selected.add(i);
    } else {
      for (const part of choice.split(',').map((p) => p.trim()).filter(Boolean)) {
        const n = Number(part);
        if (Number.isInteger(n) && n >= 1 && n <= updateEntries.length) selected.add(n);
      }
    }
    if (selected.size === 0) {
      alert('Nothing selected. Restore cancelled.');
      return;
    }

    const pickedUpdates: Partial<User> = {};
    for (const n of selected) {
      const [key, value] = updateEntries[n - 1];
      (pickedUpdates as Record<string, unknown>)[key] = value;
    }

    if (!confirm(`Restore ${selected.size} field(s) from this verified .ppaf backup?`)) {
      return;
    }

    await updateUser(pickedUpdates);
    alert(`Restored ${selected.size} field(s) from your signed .ppaf backup.`);
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
            <LocalizeText text="Make a signed .ppaf backup — one tap downloads a verified file; save the restoration token if your browser creates keys." />
          </li>
        </ul>

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
          <button type="button" className="btn" onClick={() => setPpafBackupOpen(true)}>
            <LocalizeText text="Make backup (.ppaf)" />
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

        <PpafBackupModal
          user={user}
          open={ppafBackupOpen}
          onClose={() => setPpafBackupOpen(false)}
        />
      </div>
    </div>
  );
}
