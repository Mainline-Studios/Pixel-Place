'use client';

import React, { useMemo, useState } from 'react';
import Login from '@/components/Login';
import { useUser } from '@/contexts/UserContext';
import { authenticatedFetch } from '@/lib/api';
import { apiUrl } from '@/lib/apiBaseUrl';
import {
  clientEstimatePayUsdLabel,
  getPayPortalOrigin,
  isPayOrderAmountAllowed,
  isPayPortalHostname,
} from '@/lib/payPortal';

function formatCoins(n: number): string {
  return n.toLocaleString('en-US');
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch {
      /* ignore */
    }
  }
}

export function PayPortalLanding() {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return (
    <div className="pixel-place-pay pixel-place-pay--landing">
      <div className="pixel-place-pay__card">
        <div className="pixel-place-pay__brand">Pixel Place Pay</div>
        <p className="pixel-place-pay__lead">
          First-party checkout for Pixel Coins. Open a link with the amount in the path, then follow the payment instructions.
        </p>
        <p className="pixel-place-pay__mono">
          Example:{' '}
          <strong>
            {origin}/100Pixelcoins
          </strong>
        </p>
        <p className="pixel-place-pay__hint">Amounts from 100 to 10,000 coins (plus seasonal bundles). Sign in to place an order and get a reference code.</p>
      </div>
      <style jsx global>{landingCss}</style>
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
      <style jsx global>{landingCss}</style>
    </div>
  );
}

type CreatedOrder = {
  ref: string;
  coins: number;
  amountUsd: string;
  instructions: string;
};

export default function PixelPlacePay({ coins }: { coins: number }) {
  const { user, isRestoring } = useUser();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [order, setOrder] = useState<CreatedOrder | null>(null);

  const allowed = useMemo(
    () => isPayOrderAmountAllowed(coins, user?.role),
    [coins, user?.role]
  );
  const priceLabel = useMemo(
    () => clientEstimatePayUsdLabel(coins, user?.role),
    [coins, user?.role]
  );

  const payOrigin =
    typeof window !== 'undefined' && isPayPortalHostname(window.location.hostname)
      ? window.location.origin
      : typeof window !== 'undefined'
        ? window.location.origin
        : '';

  const mainAppUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '') || 'https://pixelplaceofficial.com';

  const handleCreateOrder = async () => {
    setErr(null);
    if (!allowed || !user) return;
    setBusy(true);
    try {
      const res = await authenticatedFetch(apiUrl('/api/pixel-pay/create-order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || 'Could not create order');
      }
      const o = data as CreatedOrder;
      if (!o.ref || !o.instructions) throw new Error('Invalid response');
      setOrder({
        ref: o.ref,
        coins: o.coins ?? coins,
        amountUsd: o.amountUsd || priceLabel || '',
        instructions: o.instructions,
      });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Request failed');
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
          <p className="pixel-place-pay__hint">
            Payments run through Pixel Place — you will get a reference code and transfer instructions. No third-party card checkout.
          </p>
          <div className="pixel-place-pay__login">
            <Login />
          </div>
        </div>
        <style jsx global>{payShellCss}</style>
      </div>
    );
  }

  if (order) {
    return (
      <div className="pixel-place-pay">
        <div className="pixel-place-pay__card pixel-place-pay__card--wide">
          <div className="pixel-place-pay__brand">Order placed</div>
          <p className="pixel-place-pay__user">
            Hi <strong>{user.username}</strong> — complete payment using the details below.
          </p>
          <div className="pixel-place-pay__row">
            <span className="pixel-place-pay__label">Reference</span>
            <span className="pixel-place-pay__value pixel-place-pay__ref">{order.ref}</span>
          </div>
          <button type="button" className="pixel-place-pay__secondary" onClick={() => void copyText(order.ref)}>
            Copy reference
          </button>
          <div className="pixel-place-pay__row">
            <span className="pixel-place-pay__label">Coins</span>
            <span className="pixel-place-pay__value">{formatCoins(order.coins)}</span>
          </div>
          <div className="pixel-place-pay__row">
            <span className="pixel-place-pay__label">Amount</span>
            <span className="pixel-place-pay__value">{order.amountUsd}</span>
          </div>
          <div className="pixel-place-pay__instructions">
            <div className="pixel-place-pay__label" style={{ marginBottom: 8 }}>
              Instructions
            </div>
            <pre className="pixel-place-pay__pre">{order.instructions}</pre>
          </div>
          <button type="button" className="pixel-place-pay__secondary" onClick={() => void copyText(order.instructions)}>
            Copy instructions
          </button>
          <p className="pixel-place-pay__fine">
            Coins are credited after Mainline Studios confirms your payment. If you already paid, you can return to the game — your balance updates when the order is fulfilled.
          </p>
          <a className="pixel-place-pay__link" href={`${mainAppUrl}/#coins`}>
            Back to Pixel Place
          </a>
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
          <span className="pixel-place-pay__label">Total (estimate)</span>
          <span className="pixel-place-pay__value">{priceLabel ?? '—'}</span>
        </div>
        {err && <p className="pixel-place-pay__error">{err}</p>}
        <button
          type="button"
          className="pixel-place-pay__cta"
          disabled={busy || !allowed}
          onClick={() => void handleCreateOrder()}
        >
          {busy ? 'Creating order…' : 'Create payment order'}
        </button>
        {!allowed && (
          <p className="pixel-place-pay__error">This amount is not available for your account.</p>
        )}
        <p className="pixel-place-pay__fine">
          You will receive a unique reference code and payment instructions. We do not collect card numbers on this site.
        </p>
        {payOrigin && (
          <p className="pixel-place-pay__fine">
            You can return to{' '}
            <a href={`${payOrigin}/${coins}Pixelcoins`}>this link</a> later.
          </p>
        )}
      </div>
      <style jsx global>{payShellCss}</style>
    </div>
  );
}

const landingCss = `
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
  .pixel-place-pay__lead { margin: 0 0 12px; line-height: 1.5; opacity: 0.92; }
  .pixel-place-pay__mono { font-size: 0.9rem; word-break: break-all; opacity: 0.95; }
  .pixel-place-pay__hint { margin: 16px 0 0; font-size: 0.85rem; opacity: 0.7; line-height: 1.45; }
`;

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
  .pixel-place-pay__card--wide { max-width: 480px; }
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
  .pixel-place-pay__lead { margin: 0 0 12px; line-height: 1.5; opacity: 0.92; }
  .pixel-place-pay__user { margin: 0 0 16px; font-size: 0.95rem; opacity: 0.85; }
  .pixel-place-pay__row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .pixel-place-pay__label { opacity: 0.65; font-size: 0.9rem; }
  .pixel-place-pay__value { font-weight: 700; font-size: 1.05rem; text-align: right; }
  .pixel-place-pay__ref { font-family: ui-monospace, monospace; letter-spacing: 0.04em; }
  .pixel-place-pay__error { margin: 12px 0 0; color: #fca5a5; font-size: 0.9rem; }
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
  .pixel-place-pay__cta:disabled { opacity: 0.45; cursor: not-allowed; }
  .pixel-place-pay__secondary {
    margin-top: 10px;
    width: 100%;
    padding: 10px 14px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    color: #e2e8f0;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  .pixel-place-pay__instructions { margin-top: 16px; }
  .pixel-place-pay__pre {
    margin: 0;
    padding: 14px;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.85rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: ui-sans-serif, system-ui, sans-serif;
  }
  .pixel-place-pay__fine {
    margin: 14px 0 0;
    font-size: 0.78rem;
    line-height: 1.45;
    opacity: 0.55;
  }
  .pixel-place-pay__fine a { color: #7dd3fc; }
  .pixel-place-pay__link {
    display: inline-block;
    margin-top: 16px;
    color: #7dd3fc;
    font-weight: 600;
    font-size: 0.95rem;
  }
  .pixel-place-pay__hint { margin: 0 0 16px; font-size: 0.85rem; opacity: 0.7; line-height: 1.45; }
  .pixel-place-pay__login { margin-top: 8px; }
`;
