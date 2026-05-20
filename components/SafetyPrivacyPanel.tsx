'use client';

import type { User } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { navigateToTab } from '@/lib/routing';
import {
  mergePpafPayloadIntoUserUpdates,
  PPAF_NOT_CONFIGURED_CODE,
  verifyPpafFile,
} from '@/lib/ppaf';
import { PPAF_MAX_RESTORE_AGE_MS } from '@/lib/ppafConstants';
import { apiUrl } from '@/lib/apiBaseUrl';
import { authenticatedFetch } from '@/lib/api';
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
  const [email, setEmail] = useState(user.email || '');
  const [emailCode, setEmailCode] = useState('');
  const [emailToken, setEmailToken] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailStatusBusy, setEmailStatusBusy] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    email: string;
    emailVerified: boolean;
    rewardGrantedAt: number | null;
    pendingExpiresAt: number | null;
  } | null>(null);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  const loadEmailStatus = async () => {
    setEmailStatusBusy(true);
    try {
      const res = await authenticatedFetch(apiUrl('/auth/email/status'));
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to load verification status');
      const normalized = {
        email: String(data?.email || ''),
        emailVerified: data?.emailVerified === true,
        rewardGrantedAt:
          typeof data?.rewardGrantedAt === 'number' && Number.isFinite(data.rewardGrantedAt)
            ? data.rewardGrantedAt
            : null,
        pendingExpiresAt:
          typeof data?.pendingExpiresAt === 'number' && Number.isFinite(data.pendingExpiresAt)
            ? data.pendingExpiresAt
            : null,
      };
      setEmailStatus(normalized);
      if (normalized.email) setEmail(normalized.email);
    } catch (error: any) {
      setEmailError(String(error?.message || 'Failed to load verification status'));
    } finally {
      setEmailStatusBusy(false);
    }
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

  const handleRequestVerification = async (): Promise<boolean> => {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('Enter your email address first.');
      return false;
    }
    setEmailBusy(true);
    setEmailMessage('');
    setEmailError('');
    try {
      const res = await authenticatedFetch(apiUrl('/auth/email/request-verification'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to send verification email');
      if (data?.sent === false) {
        throw new Error(
          data?.error ||
            'Verification email was not sent. Ask an admin to configure email on the server, then try again.',
        );
      }
      setEmailMessage(
        'Verification email sent. Check your inbox (and Promotions) for a code and magic link — it can take a minute.',
      );
      await loadEmailStatus();
      return true;
    } catch (error: any) {
      setEmailError(String(error?.message || 'Failed to send verification email'));
      return false;
    } finally {
      setEmailBusy(false);
    }
  };

  const handleVerifyEmail = async () => {
    const code = emailCode.trim();
    const token = emailToken.trim();
    if (!code && !token) {
      const sent = await handleRequestVerification();
      if (sent) {
        setEmailMessage(
          (prev) =>
            prev ||
            'Email sent. Enter the one-time code from that message below, then press Confirm code.',
        );
      }
      return;
    }
    setEmailBusy(true);
    setEmailMessage('');
    setEmailError('');
    try {
      const res = await authenticatedFetch(apiUrl('/auth/email/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code || undefined, token: token || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to verify email');
      const rewardCoins = Number(data?.rewardCoins || 0);
      setEmailMessage(
        rewardCoins > 0
          ? `Email verified! +${rewardCoins} Pixel Coins awarded.`
          : 'Email verified successfully.',
      );
      setEmailCode('');
      setEmailToken('');
      await updateUser({
        email: email.trim() || user.email,
        emailVerified: true,
        coins: typeof data?.coins === 'number' ? data.coins : user.coins,
      });
      await loadEmailStatus();
    } catch (error: any) {
      setEmailError(String(error?.message || 'Failed to verify email'));
    } finally {
      setEmailBusy(false);
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
        setPpafBackupOpen(true);
      } else {
        alert(verified.error);
      }
      return;
    }

    const payload = verified.payload;
    const maxAgeDays = Math.round(PPAF_MAX_RESTORE_AGE_MS / (24 * 60 * 60 * 1000));
    if (Date.now() - verified.issuedAtMs > PPAF_MAX_RESTORE_AGE_MS) {
      alert(`This backup is older than ${maxAgeDays} days and cannot be restored.`);
      return;
    }
    const userWithMeta = user as User & { ppafLastRestoreIssuedAt?: number };
    const lastAccepted = Number(userWithMeta.ppafLastRestoreIssuedAt || 0);
    if (Number.isFinite(lastAccepted) && lastAccepted > 0 && verified.issuedAtMs <= lastAccepted) {
      alert('This backup is older than or equal to your last restored backup and was blocked to prevent replay.');
      return;
    }
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

    const pickedUpdatesWithMeta = pickedUpdates as Partial<User> & { ppafLastRestoreIssuedAt?: number };
    pickedUpdatesWithMeta.ppafLastRestoreIssuedAt = verified.issuedAtMs;
    await updateUser(pickedUpdatesWithMeta);
    alert(`Restored ${selected.size} field(s) from your signed .ppaf backup.`);
  };

  useEffect(() => {
    void loadEmailStatus();
  }, []);

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
            <LocalizeText text="Make a signed .ppaf backup — one tap downloads a verified file." />
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
          <button
            type="button"
            className="btn"
            onClick={() => {
              if (typeof window !== 'undefined') window.location.href = '/signoutall';
            }}
          >
            <LocalizeText text="Sign out on all devices" />
          </button>
        </div>

        <PpafConfigurePanel open={ppafConfigureOpen} onToggle={setPpafConfigureOpen} />

        <div
          style={{
            marginTop: 14,
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid rgba(34, 197, 94, 0.35)',
            background: 'rgba(34, 197, 94, 0.06)',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Email verification (+20 Pixel Coins)</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10 }}>
            Enter your email, then use <strong>Send verification</strong> or <strong>Verify email</strong> to receive a
            code and magic link. Paste the code here to finish (+20 Pixel Coins once).
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              className="input"
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn"
                onClick={() => void handleRequestVerification()}
                disabled={emailBusy}
              >
                {emailBusy ? 'Sending...' : 'Send verification'}
              </button>
              <button type="button" className="btn" onClick={() => void loadEmailStatus()} disabled={emailStatusBusy}>
                {emailStatusBusy ? 'Refreshing...' : 'Refresh status'}
              </button>
            </div>
            <input
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
              placeholder="One-time code"
              type="text"
              className="input"
            />
            <input
              value={emailToken}
              onChange={(e) => setEmailToken(e.target.value)}
              placeholder="Magic link token (optional)"
              type="text"
              className="input"
            />
            <button type="button" className="btn" onClick={() => void handleVerifyEmail()} disabled={emailBusy}>
              {emailBusy
                ? 'Working...'
                : emailCode.trim() || emailToken.trim()
                  ? 'Confirm code'
                  : 'Verify email (send code)'}
            </button>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: emailStatus?.emailVerified ? '#86efac' : 'var(--text-dim)' }}>
            {emailStatus?.emailVerified
              ? `Verified${emailStatus.email ? `: ${emailStatus.email}` : ''}`
              : `Not verified${emailStatus?.email ? `: ${emailStatus.email}` : ''}`}
          </div>
          {emailMessage ? <div style={{ marginTop: 8, fontSize: 12, color: '#86efac' }}>{emailMessage}</div> : null}
          {emailError ? <div style={{ marginTop: 8, fontSize: 12, color: '#fca5a5' }}>{emailError}</div> : null}
        </div>

        <PpafBackupModal
          user={user}
          open={ppafBackupOpen}
          onClose={() => setPpafBackupOpen(false)}
        />
      </div>
    </div>
  );
}
