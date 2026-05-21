'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import BanScreen from '@/components/BanScreen';
import { resendLoginCode } from '@/lib/loginApi';

type FocusedSignInProps = {
  title: string;
  subtitle: string;
  submitLabel?: string;
  onSuccess?: () => void;
};

export default function FocusedSignIn({
  title,
  subtitle,
  submitLabel = 'Sign in',
  onSuccess,
}: FocusedSignInProps) {
  const { login, completeLoginWithCode } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginChallenge, setLoginChallenge] = useState<{ challengeToken: string; maskedEmail: string } | null>(
    null,
  );
  const [loginCode, setLoginCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [banInfo, setBanInfo] = useState<{ ban: any; deviceBanned?: boolean } | null>(null);

  const handleSignIn = async () => {
    if (!username.trim() || !password) {
      setMessage('Enter username and password.');
      return;
    }
    setBusy(true);
    setMessage('');
    setBanInfo(null);
    try {
      const result = await login(username.trim(), password);
      if (result.ban) {
        setBanInfo({ ban: result.ban, deviceBanned: result.deviceBanned });
        return;
      }
      if (!result.success) {
        setMessage(result.message || 'Sign in failed.');
        return;
      }
      if (result.requiresLoginCode && result.challengeToken) {
        setLoginChallenge({
          challengeToken: result.challengeToken,
          maskedEmail: result.maskedEmail || 'your email',
        });
        setMessage(`Enter the code sent to ${result.maskedEmail}.`);
        return;
      }
      onSuccess?.();
    } finally {
      setBusy(false);
    }
  };

  const handleLoginCodeSubmit = async () => {
    if (!loginChallenge) return;
    if (!loginCode.trim()) {
      setMessage('Enter the login code from your email.');
      return;
    }
    setBusy(true);
    const result = await completeLoginWithCode(loginChallenge.challengeToken, loginCode);
    setBusy(false);
    if (!result.success) {
      setMessage(result.message);
      return;
    }
    onSuccess?.();
  };

  const handleResendLoginCode = async () => {
    if (!loginChallenge) return;
    setBusy(true);
    const { res, data } = await resendLoginCode(loginChallenge.challengeToken);
    setBusy(false);
    if (!res.ok || !data?.challengeToken) {
      setMessage(data?.error || 'Could not resend code.');
      return;
    }
    setLoginChallenge({
      challengeToken: String(data.challengeToken),
      maskedEmail: String(data.maskedEmail || loginChallenge.maskedEmail),
    });
    setMessage(`New code sent to ${data.maskedEmail || loginChallenge.maskedEmail}.`);
  };

  if (banInfo) {
    const displayName = banInfo.deviceBanned ? 'This device' : username;
    const ban =
      banInfo.ban && typeof banInfo.ban === 'object'
        ? {
            ...banInfo.ban,
            bannedBy: banInfo.ban.bannedBy ?? banInfo.ban.banned_by ?? 'Administrator',
            timestamp: banInfo.ban.timestamp ?? banInfo.ban.banned_at ?? Date.now(),
          }
        : banInfo.ban;
    return (
      <BanScreen
        ban={ban}
        username={displayName}
        onAppealSubmitted={() => {
          setBanInfo(null);
          setUsername('');
          setPassword('');
        }}
      />
    );
  }

  return (
    <div style={{ marginTop: 4 }}>
      <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>{title}</h2>
      <p style={{ margin: '0 0 14px', color: 'rgba(243,244,246,0.88)', lineHeight: 1.5 }}>{subtitle}</p>
      {loginChallenge ? (
        <>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            value={loginCode}
            onChange={(e) => setLoginCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={(e) => e.key === 'Enter' && void handleLoginCodeSubmit()}
            placeholder="6-digit login code"
            style={{
              width: '100%',
              marginBottom: 10,
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid rgba(132, 145, 255, 0.35)',
              background: 'rgba(15, 18, 28, 0.85)',
              color: 'var(--text, #f3f4f6)',
            }}
          />
          {message ? (
            <div style={{ marginBottom: 10, color: '#93c5fd', fontWeight: 600, fontSize: 14 }}>{message}</div>
          ) : null}
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={() => void handleLoginCodeSubmit()}
            style={{ width: '100%', padding: '11px 14px', fontWeight: 700, marginBottom: 8 }}
          >
            {busy ? 'Verifying…' : 'Verify code'}
          </button>
          <button type="button" className="btn" disabled={busy} onClick={() => void handleResendLoginCode()}>
            Resend code
          </button>
        </>
      ) : (
        <>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'rgba(243,244,246,0.75)' }}>
            Username
          </label>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleSignIn()}
            placeholder="Username"
            style={{
              width: '100%',
              marginBottom: 10,
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid rgba(132, 145, 255, 0.35)',
              background: 'rgba(15, 18, 28, 0.85)',
              color: 'var(--text, #f3f4f6)',
            }}
          />
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'rgba(243,244,246,0.75)' }}>
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleSignIn()}
            placeholder="Password"
            style={{
              width: '100%',
              marginBottom: 12,
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid rgba(132, 145, 255, 0.35)',
              background: 'rgba(15, 18, 28, 0.85)',
              color: 'var(--text, #f3f4f6)',
            }}
          />
          {message ? (
            <div style={{ marginBottom: 10, color: '#fca5a5', fontWeight: 600, fontSize: 14 }}>{message}</div>
          ) : null}
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={() => void handleSignIn()}
            style={{ width: '100%', padding: '11px 14px', fontWeight: 700 }}
          >
            {busy ? 'Signing in…' : submitLabel}
          </button>
        </>
      )}
    </div>
  );
}
