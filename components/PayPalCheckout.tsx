'use client';

import { useEffect, useState } from 'react';
import {
  PayPalScriptProvider,
  PayPalButtons,
} from '@paypal/react-paypal-js';
import { apiUrl } from '@/lib/apiBaseUrl';
import { authenticatedFetch } from '@/lib/api';
import { clientEstimatePayUsdLabel } from '@/lib/payPortal';

export type PayPalCheckoutProps = {
  coins: number;
  role?: string;
  onClose: () => void;
  /** Called after the payment is captured + coins are credited server-side. */
  onPaid?: (result: { coins: number; newBalance: number }) => void;
};

type ClientConfig = { clientId: string; env: 'live' | 'sandbox' };

export default function PayPalCheckout({ coins, role, onClose, onPaid }: PayPalCheckoutProps) {
  const [config, setConfig] = useState<ClientConfig | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const estimate = clientEstimatePayUsdLabel(coins, role);

  // Load the public PayPal client id from our API (no build-time env var needed).
  useEffect(() => {
    let active = true;
    setLoadError(null);
    fetch(apiUrl('/api/pixel-pay/paypal/client-id'), { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'PayPal is not available right now.');
        if (active) setConfig({ clientId: data.clientId, env: data.env === 'live' ? 'live' : 'sandbox' });
      })
      .catch((e) => {
        if (active) setLoadError(e instanceof Error ? e.message : 'Could not load PayPal.');
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="paypal-checkout">
      <p className="paypal-checkout__summary">
        <strong>{coins.toLocaleString('en-US')}</strong> Pixel Coins
        {estimate ? (
          <>
            {' '}
            · <strong>{estimate}</strong>
          </>
        ) : null}
      </p>

      {loadError ? (
        <p className="paypal-checkout__error">{loadError}</p>
      ) : !config ? (
        <p className="paypal-checkout__muted">Loading PayPal…</p>
      ) : (
        <PayPalScriptProvider
          options={{
            clientId: config.clientId,
            currency: 'USD',
            intent: 'capture',
          }}
        >
          <PayPalButtons
            style={{ layout: 'vertical', shape: 'rect', label: 'paypal' }}
            disabled={status === 'processing'}
            createOrder={async () => {
              setStatus(null);
              const res = await authenticatedFetch(apiUrl('/api/pixel-pay/paypal/create-order'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coins }),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok || !data.orderID) {
                throw new Error(data.error || 'Could not start PayPal checkout.');
              }
              return data.orderID as string;
            }}
            onApprove={async (data) => {
              setStatus('processing');
              try {
                const res = await authenticatedFetch(apiUrl('/api/pixel-pay/paypal/capture'), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ orderID: data.orderID }),
                });
                const result = await res.json().catch(() => ({}));
                if (!res.ok || !result.success) {
                  throw new Error(result.error || 'Payment could not be completed.');
                }
                setStatus('done');
                onPaid?.({ coins: result.coins, newBalance: result.newBalance });
              } catch (e) {
                setStatus(null);
                setLoadError(e instanceof Error ? e.message : 'Payment failed.');
              }
            }}
            onError={(err) => {
              console.error('[paypal] button error', err);
              setStatus(null);
              setLoadError('PayPal ran into a problem. Please try again.');
            }}
            onCancel={() => setStatus(null)}
          />
        </PayPalScriptProvider>
      )}

      {status === 'processing' && <p className="paypal-checkout__muted">Confirming your payment…</p>}

      <button type="button" className="paypal-checkout__cancel" onClick={onClose} disabled={status === 'processing'}>
        Close
      </button>

      <style jsx global>{`
        .paypal-checkout {
          color: #e2e8f0;
          max-width: 420px;
          margin: 0 auto;
        }
        .paypal-checkout__summary {
          margin: 0 0 14px;
          font-size: 1rem;
        }
        .paypal-checkout__muted {
          margin: 10px 0 0;
          font-size: 0.9rem;
          color: #cbd5e1;
        }
        .paypal-checkout__error {
          margin: 0 0 14px;
          font-size: 0.95rem;
          color: #fecaca;
        }
        .paypal-checkout__cancel {
          width: 100%;
          margin-top: 14px;
          padding: 12px 18px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(56, 189, 248, 0.15);
          color: #e2e8f0;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
        }
        .paypal-checkout__cancel:hover {
          background: rgba(56, 189, 248, 0.25);
        }
        .paypal-checkout__cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
