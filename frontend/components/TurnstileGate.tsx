'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: { sitekey: string; callback: (token: string) => void; 'error-callback'?: () => void }
      ) => string;
      reset?: (widgetId: string) => void;
      remove?: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

type Props = {
  onToken: (token: string) => void;
  onError?: () => void;
};

export default function TurnstileGate({ onToken, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) return;
      if (widgetIdRef.current && window.turnstile.remove) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onToken(token),
        'error-callback': () => onError?.(),
      });
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const existing = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
    if (!existing) {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }

    window.onTurnstileLoad = renderWidget;
    const id = window.setInterval(() => {
      if (window.turnstile) {
        clearInterval(id);
        renderWidget();
      }
    }, 200);

    return () => {
      clearInterval(id);
      if (widgetIdRef.current && window.turnstile?.remove) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
      }
    };
  }, [siteKey, onToken, onError]);

  if (!siteKey) {
    return (
      <p className="text-xs text-muted-foreground">
        Security challenge is not configured (set NEXT_PUBLIC_TURNSTILE_SITE_KEY). Use a dev backend with
        ABUSE_CHECKS_DISABLED if needed.
      </p>
    );
  }

  return <div ref={containerRef} className="min-h-[65px]" />;
}
