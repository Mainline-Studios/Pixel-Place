'use client';

import React, { useMemo } from 'react';
import Login from '@/components/Login';
import EmbeddedStripePay from '@/components/EmbeddedStripePay';
import { useUser } from '@/contexts/UserContext';
import {
  clientEstimatePayUsdLabel,
  isPayOrderAmountAllowed,
  isPayPortalHostname,
} from '@/lib/payPortal';

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
          Buy Pixel Coins from your browser once Pixel Place Pay goes live. Sign in on the main app to see your balance.
        </p>
        <p className="pixel-place-pay__mono">
          Example:{' '}
          <strong>
            {origin}/100Pixelcoins
          </strong>
        </p>
        <p className="pixel-place-pay__hint">
          Amounts from 100 to 10,000 coins (plus seasonal bundles). Checkout is being implemented — thanks for your patience.
        </p>
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

export default function PixelPlacePay({ coins }: { coins: number }) {
  const { user, isRestoring, updateUser } = useUser();

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

  const refreshBalance = async () => {
    const { getUsers } = await import('@/lib/storage');
    const users = await getUsers();
    const u = user ? users.find((x) => x.username === user.username) : null;
    if (u) updateUser({ coins: u.coins });
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
          <p className="pixel-place-pay__hint">Pixel Place Pay is being implemented; you will see a status message after signing in.</p>
          <div className="pixel-place-pay__login">
            <Login />
          </div>
        </div>
        <style jsx global>{payShellCss}</style>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="pixel-place-pay">
        <div className="pixel-place-pay__card">
          <div className="pixel-place-pay__brand">Pixel Place Pay</div>
          <p className="pixel-place-pay__error">This amount is not available for your account.</p>
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
      <div className="pixel-place-pay__card pixel-place-pay__card--wide">
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
        <EmbeddedStripePay
          coins={coins}
          role={user.role}
          onClose={() => {
            window.location.href = `${mainAppUrl}/#coins`;
          }}
          onPaid={() => {
            void refreshBalance();
            window.location.href = `${mainAppUrl}/?success=true#coins`;
          }}
        />
        {payOrigin && (
          <p className="pixel-place-pay__fine">
            Bookmark <a href={`${payOrigin}/${coins}Pixelcoins`}>this link</a> to pay again later.
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
  .pixel-place-pay__error { margin: 12px 0; color: #fca5a5; font-size: 0.95rem; }
  .pixel-place-pay__fine {
    margin: 18px 0 0;
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
