'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { hasCookieDecision, readCookieConsent, writeCookieConsent } from '@/lib/cookieConsent';
import { getBackendToken } from '@/lib/backendSession';
import { backendV1Url } from '@/lib/backendV1';
import { Button } from '@/components/ui/button';

export default function CookieConsentBanner() {
  const { t } = useTranslation('common');
  const [visible, setVisible] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (hasCookieDecision()) {
      const existing = readCookieConsent();
      if (existing) {
        setAnalytics(existing.analytics);
        setMarketing(existing.marketing);
      }
      return;
    }
    // Apply necessary-only consent without blocking the UI with a banner.
    void persist({ analytics: false, marketing: false });
  }, []);

  async function persist(prefs: { analytics: boolean; marketing: boolean }) {
    writeCookieConsent(prefs);
    const token = getBackendToken();
    if (token) {
      try {
        await fetch(backendV1Url('/users/me/consent'), {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            acceptTerms: true,
            acceptPrivacy: true,
            analyticsCookies: prefs.analytics,
            marketingCookies: prefs.marketing,
          }),
        });
      } catch {
        /* offline — local prefs still saved */
      }
    }
    setVisible(false);
  }

  function acceptNecessaryOnly() {
    void persist({ analytics: false, marketing: false });
  }

  function acceptSelection() {
    void persist({ analytics, marketing });
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-background/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md md:p-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8">
        <div className="min-w-0 flex-1 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <h2 id="cookie-consent-title" className="text-base font-semibold text-foreground">
            {t('cookieConsent.title')}
          </h2>
          <p>{t('cookieConsent.body')}</p>
          <p className="text-xs">
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              {t('cookieConsent.privacyLink')}
            </Link>
            {' · '}
            <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
              {t('cookieConsent.termsLink')}
            </Link>
          </p>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap sm:gap-x-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked disabled className="h-4 w-4 rounded accent-primary" />
              <span>{t('cookieConsent.necessary')}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="h-4 w-4 rounded accent-primary"
              />
              <span>{t('cookieConsent.analytics')}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="h-4 w-4 rounded accent-primary"
              />
              <span>{t('cookieConsent.marketing')}</span>
            </label>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
          <Button type="button" variant="outline" size="sm" onClick={acceptNecessaryOnly}>
            {t('cookieConsent.necessaryOnly')}
          </Button>
          <Button type="button" size="sm" onClick={acceptSelection}>
            {t('cookieConsent.saveChoice')}
          </Button>
        </div>
      </div>
    </div>
  );
}
