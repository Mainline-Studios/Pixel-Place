'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiUrl } from '@/lib/apiBaseUrl';
import { authenticatedFetch, getAuthToken } from '@/lib/api';
import { assertEmailApiJsonResponse, EMAIL_VERIFICATION_API } from '@/lib/emailVerificationApi';

type VerifyState = 'idle' | 'verifying' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [state, setState] = useState<VerifyState>('idle');
  const [message, setMessage] = useState('');
  const [rewardCoins, setRewardCoins] = useState(0);

  const runVerify = async () => {
    if (!token) {
      setState('error');
      setMessage('Missing verification token.');
      return;
    }
    if (!getAuthToken()) {
      setState('error');
      setMessage('Please sign in first, then open this magic link again.');
      return;
    }
    setState('verifying');
    setMessage('');
    try {
      const res = await authenticatedFetch(apiUrl(EMAIL_VERIFICATION_API.verify), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      assertEmailApiJsonResponse(res, data);
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to verify email');
      }
      const reward = Number(data?.rewardCoins || 0);
      setRewardCoins(reward);
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
  };

  useEffect(() => {
    void runVerify();
  }, [token]);

  return (
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
        <p style={{ margin: '0 0 16px', color: 'rgba(243,244,246,0.82)' }}>
          Verifying your magic link token now.
        </p>

        {state === 'verifying' ? (
          <div style={{ color: '#bfdbfe' }}>Verifying...</div>
        ) : null}
        {state === 'success' ? (
          <div style={{ color: '#86efac', fontWeight: 600 }}>
            {message}
            {rewardCoins > 0 ? ' Reward applied to your account.' : ''}
          </div>
        ) : null}
        {state === 'error' ? <div style={{ color: '#fca5a5', fontWeight: 600 }}>{message}</div> : null}

        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {state !== 'verifying' ? (
            <button type="button" className="btn" onClick={() => void runVerify()}>
              Retry verification
            </button>
          ) : null}
          <a
            href="/"
            className="btn"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            Go to sign in
          </a>
          <a
            href="/signoutall"
            className="btn"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            Sign out all devices
          </a>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 20 }}>
          <div style={{ color: 'var(--text-dim)' }}>Loading verification...</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
