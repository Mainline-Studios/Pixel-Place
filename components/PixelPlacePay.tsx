'use client';

import React, { useMemo, useState } from 'react';
import Login from '@/components/Login';
import { useUser } from '@/contexts/UserContext';
import { authenticatedFetch } from '@/lib/api';
import { apiUrl } from '@/lib/apiBaseUrl';
import { formatUsdFromCents, isPayPortalHostname, pixelPayCentsForCoins } from '@/lib/payPortal';
import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '').trim();
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function formatCoins(n: number): string {
  return n.toLocaleString('en-US');
}

export function PayPortalLanding() {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return (
    <div className="pixel-place-pay pixel-place-pay--landing">
      <div className="pixel-place-pay__card">
        <div className="pixel-place-pay__brand">Pixel Place Pay</div>
        <p className="pixel-place-pay__lead">
          First-party checkout for Pixel Coins. Share a link with the amount in the path.
        </p>
        <p className="pixel-place-pay__mono">
          Example:{' '}
          <strong>
            {origin}/100Pixelcoins
          </strong>
        </p>
        <p className="pixel-place-pay__hint">Amounts from 100 to 10,000 coins. You must be signed in to complete checkout.</p>
      </div>
      <style jsx global>{`
        .pixel-place-pay {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #1a1d29;
          background-image: radial-gradient(circle at 20% 20%, #2a2e3d 0%, #1a1d29 60%);
          color: #f2f2f5;
        }
        .pixel-place-pay__card {
          max-width: 420px;
          width: 100%;
          padding: 28px 24px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
        }
        .pixel-place-pay__brand {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .pixel-place-pay__lead {
          margin: 0 0 12px;
          line-height: 1.5;
          opacity: 0.92;
        }
        .pixel-place-pay__mono {
          font-size: 0.9rem;
          word-break: break-all;
          opacity: 0.95;
        }
        .pixel-place-pay__hint {
          margin: 16px 0 0;
          font-size: 0.85rem;
          opacity: 0.7;
          line-height: 1.45;
        }
      `}</style>
    </div>
  );
}

export function PayPortalInvalid({ path }: { path: string }) {
  return (
    <div className="pixel-place-pay pixel-place-pay--landing">
      <div className="pixel-place-pay__card">
        <div className="pixel-place-pay__brand">Pixel Place Pay</div>
        <p className="pixel-place-pay__lead">This link is not a valid checkout URL.</p>
        <p className="pixel-place-pay__mono">
          Path: <strong>{path}</strong>
        </p>
        <p className="pixel-place-pay__hint">Use a path like <strong>/500Pixelcoins</strong> (100–10,000 coins).</p>
      </div>
      <style jsx global>{`
        .pixel-place-pay {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #1a1d29;
          background-image: radial-gradient(circle at 20% 20%, #2a2e3d 0%, #1a1d29 60%);
          color: #f2f2f5;
        }
        .pixel-place-pay__card {
          max-width: 420px;
          width: 100%;
          padding: 28px 24px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
        }
        .pixel-place-pay__brand {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .pixel-place-pay__lead {
          margin: 0 0 12px;
          line-height: 1.5;
          opacity: 0.92;
        }
        .pixel-place-pay__mono {
          font-size: 0.9rem;
          word-break: break-all;
          opacity: 0.95;
        }
        .pixel-place-pay__hint {
          margin: 16px 0 0;
          font-size: 0.85rem;
          opacity: 0.7;
          line-height: 1.45;
        }
      `}</style>
    </div>
  );
}

export default function PixelPlacePay({ coins }: { coins: number }) {
  const { user, isRestoring } = useUser();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const cents = useMemo(() => pixelPayCentsForCoins(coins), [coins]);
  const priceLabel = cents != null ? formatUsdFromCents(cents) : null;

  const payOrigin =
    typeof window !== 'undefined' && isPayPortalHostname(window.location.hostname)
      ? window.location.origin
      : typeof window !== 'undefined'
        ? window.location.origin
        : '';

  const handlePay = async () => {
    setErr(null);
    if (cents == null) {
      setErr('This amount is not available. Use between 100 and 10,000 Pixel Coins.');
      return;
    }
    if (!user) return;
    setBusy(true);
    try {
      const res = await authenticatedFetch(apiUrl('/api/pixel-pay/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || 'Could not start checkout');
      }
      const sessionId = (data as { sessionId?: string }).sessionId;
      if (!sessionId) throw new Error('Missing session');
      const stripe = stripePromise ? await stripePromise : null;
      if (!stripe) throw new Error('Payments are not configured (Stripe publishable key).');
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setBusy(false);
    }
  };

  if (isRestoring) {
    return (
      <div className="pixel-place-pay">
        <div className="pixel-place-pay__card">Loading…</div>
        <style jsx global>{payShellCss}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pixel-place-pay pixel-place-pay--auth">
        <div className="pixel-place-pay__card pixel-place-pay__card--wide">
          <div className="pixel-place-pay__brand">Pixel Place Pay</div>
          <p className="pixel-place-pay__lead">Sign in to buy {formatCoins(coins)} Pixel Coins.</p>
          <p className="pixel-place-pay__hint">Secure checkout — card details are handled by our payment processor; we never store your card number.</p>
          <div className="pixel-place-pay__login">
            <Login />
          </div>
        </div>
        <style jsx global>{payShellCss}</style>
      </div>
    );
  }

  return (
    <div className="pixel-place-pay">
      <div className="pixel-place-pay__card">
        <div className="pixel-place-pay__brand">Pixel Place Pay</div>
        <p className="pixel-place-pay__user">
          Signed in as <strong>{user.username}</strong>
        </p>
        <div className="pixel-place-pay__row">
          <span className="pixel-place-pay__label">Pack</span>
          <span className="pixel-place-pay__value">{formatCoins(coins)} Pixel Coins</span>
        </div>
        <div className="pixel-place-pay__row">
          <span className="pixel-place-pay__label">Total</span>
          <span className="pixel-place-pay__value">{priceLabel ?? '—'}</span>
        </div>
        {err && <p className="pixel-place-pay__error">{err}</p>}
        <button
          type="button"
          className="pixel-place-pay__cta"
          disabled={busy || cents == null}
          onClick={() => void handlePay()}
        >
          {busy ? 'Starting…' : 'Continue to secure payment'}
        </button>
        <p className="pixel-place-pay__fine">
          You will complete payment on a secure Stripe-hosted page, then return to Pixel Place with your balance updated.
        </p>
        {payOrigin && (
          <p className="pixel-place-pay__fine">
            Cancel anytime — you can return to{' '}
            <a href={`${payOrigin}/${coins}Pixelcoins`}>this link</a> later.
          </p>
        )}
      </div>
      <style jsx global>{payShellCss}</style>
    </div>
  );
}

const payShellCss = `
  .pixel-place-pay {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: #1a1d29;
    background-image: radial-gradient(circle at 20% 20%, #2a2e3d 0%, #1a1d29 60%);
    color: #f2f2f5;
  }
  .pixel-place-pay__card {
    max-width: 400px;
    width: 100%;
    padding: 28px 24px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  }
  .pixel-place-pay__card--wide {
    max-width: 440px;
  }
  .pixel-place-pay__brand {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 12px;
    background: linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .pixel-place-pay__lead {
    margin: 0 0 12px;
    line-height: 1.5;
    opacity: 0.92;
  }
  .pixel-place-pay__user {
    margin: 0 0 16px;
    font-size: 0.95rem;
    opacity: 0.85;
  }
  .pixel-place-pay__row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .pixel-place-pay__label {
    opacity: 0.65;
    font-size: 0.9rem;
  }
  .pixel-place-pay__value {
    font-weight: 700;
    font-size: 1.05rem;
  }
  .pixel-place-pay__error {
    margin: 12px 0 0;
    color: #fca5a5;
    font-size: 0.9rem;
  }
  .pixel-place-pay__cta {
    margin-top: 20px;
    width: 100%;
    padding: 14px 18px;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    color: #0f172a;
    background: linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%);
  }
  .pixel-place-pay__cta:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .pixel-place-pay__fine {
    margin: 14px 0 0;
    font-size: 0.78rem;
    line-height: 1.45;
    opacity: 0.55;
  }
  .pixel-place-pay__fine a {
    color: #7dd3fc;
  }
  .pixel-place-pay__hint {
    margin: 0 0 16px;
    font-size: 0.85rem;
    opacity: 0.7;
    line-height: 1.45;
  }
  .pixel-place-pay__login {
    margin-top: 8px;
  }
`;
