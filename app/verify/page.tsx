'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { apiUrl } from '@/lib/apiBaseUrl';
import { authenticatedFetch, authErrorMessage, hasUsableAuthToken } from '@/lib/api';
import { assertEmailApiJsonResponse, EMAIL_VERIFICATION_API } from '@/lib/emailVerificationApi';
import {
  clearPendingVerifyToken,
  getPendingVerifyToken,
  savePendingVerifyToken,
} from '@/lib/pendingVerifyToken';
import FocusedSignIn from '@/components/FocusedSignIn';

type VerifyState = 'needs_signin' | 'verifying' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const queryToken = searchParams.get('token') || '';
  const verifyToken = useMemo(
    () => queryToken.trim() || getPendingVerifyToken(),
    [queryToken],
  );
  const [state, setState] = useState<VerifyState>(() =>
    hasUsableAuthToken() && verifyToken ? 'verifying' : 'needs_signin',
  );
  const [message, setMessage] = useState('');
  const [rewardCoins, setRewardCoins] = useState(0);

  useEffect(() => {
    if (verifyToken) savePendingVerifyToken(verifyToken);
  }, [verifyToken]);

  const runVerify = useCallback(async () => {
    if (!verifyToken) {
      setState('error');
      setMessage('Missing verification token. Open the link from your email again.');
      return;
    }
    if (!hasUsableAuthToken()) {
      setState('needs_signin');
      setMessage('');
      return;
    }
    setState('verifying');
    setMessage('');
    try {
      const res = await authenticatedFetch(apiUrl(EMAIL_VERIFICATION_API.verify), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyToken }),
      });
      const data = await res.json().catch(() => ({}));
      assertEmailApiJsonResponse(res, data);
      if (!res.ok) {
        throw new Error(authErrorMessage(res.status, data));
      }
      const reward = Number(data?.rewardCoins || 0);
      setRewardCoins(reward);
      clearPendingVerifyToken();
      setState('success');
      setMessage(
        reward > 0
          ? `Email verified! You received ${reward} Pixel Coins.`
          : 'Email verified successfully.',
      );
    } catch (error: any) {
      setState('error');
      setMessage(String(error?.message || 'Failed to verify email'));
    }
  }, [verifyToken]);

  useEffect(() => {
    if (!verifyToken) {
      setState('error');
      setMessage('Missing verification token. Open the link from your email again.');
      return;
    }
    if (hasUsableAuthToken()) {
      void runVerify();
    } else {
      setState('needs_signin');
    }
  }, [verifyToken, user?.username, runVerify]);

  const panelShell = (children: React.ReactNode) => (
    <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          background: 'rgba(18,22,36,0.9)',
          border: '1px solid rgba(132, 145, 255, 0.35)',
          borderRadius: 14,
          padding: 20,
          color: 'var(--text, #f3f4f6)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800 }}>Email Verification</h1>
        {children}
      </div>
    </div>
  );

  if (!verifyToken) {
    return panelShell(
      <p style={{ margin: 0, color: '#fca5a5', fontWeight: 600 }}>
        Missing verification link. Open the full link from your email (including the token).
      </p>,
    );
  }

  if (state === 'needs_signin') {
    return panelShell(
      <>
        <p style={{ margin: '0 0 4px', color: 'rgba(243,244,246,0.82)' }}>
          Sign in with the account that requested this email, then we&apos;ll verify automatically.
        </p>
        <FocusedSignIn
          title="Sign in to verify"
          subtitle="Use the same Pixel Place username and password you used when you asked for the verification email."
          submitLabel="Sign in and verify email"
          onSuccess={() => void runVerify()}
        />
      </>,
    );
  }

  return panelShell(
    <>
      {state === 'verifying' ? (
        <p style={{ margin: '0 0 8px', color: '#bfdbfe' }}>Verifying your email…</p>
      ) : (
        <p style={{ margin: '0 0 16px', color: 'rgba(243,244,246,0.82)' }}>
          {state === 'success' ? 'You are all set.' : 'Verification could not be completed.'}
        </p>
      )}

      {state === 'success' ? (
        <div style={{ color: '#86efac', fontWeight: 600, marginBottom: 12 }}>
          {message}
          {rewardCoins > 0 ? ' Reward applied to your account.' : ''}
        </div>
      ) : null}
      {state === 'error' ? (
        <div style={{ color: '#fca5a5', fontWeight: 600, marginBottom: 12 }}>{message}</div>
      ) : null}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {state === 'error' ? (
          <button type="button" className="btn" onClick={() => void runVerify()}>
            Retry verification
          </button>
        ) : null}
        {state === 'success' ? (
          <a
            href="/settings"
            className="btn"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            Open Settings
          </a>
        ) : null}
        <a
          href="/games"
          className="btn"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          Go to Pixel Place
        </a>
      </div>
    </>,
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 20 }}>
          <div style={{ color: 'var(--text-dim)' }}>Loading verification…</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
