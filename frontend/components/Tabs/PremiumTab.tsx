'use client';

import { useCallback, useEffect, useState } from 'react';
import type { User } from '@/types';
import type { BackendBillingPayload, BillingPurchaseKind } from '@/types/backend';
import { backendV1Url, isBackendConfigured } from '@/lib/backendV1';
import { getBackendToken } from '@/lib/backendSession';
import { refreshBackendSession } from '@/lib/backendUser';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';

interface PremiumTabProps {
  user: User;
  editMode: boolean;
}

type CatalogConfigured = {
  premiumMonthly: boolean;
  cosmeticThemes: boolean;
  cooldownBoost: boolean;
  privateCanvasSlot: boolean;
  billingReady: boolean;
};

export default function PremiumTab({ user }: PremiumTabProps) {
  const { t } = useTranslation('premium');
  const { setUser } = useUser();
  const [busy, setBusy] = useState<BillingPurchaseKind | 'portal' | 'refresh' | null>(null);
  const [configured, setConfigured] = useState<CatalogConfigured | null>(null);
  const [banner, setBanner] = useState<'success' | 'canceled' | null>(null);

  const token = typeof window !== 'undefined' ? getBackendToken() : null;
  const billing: BackendBillingPayload | undefined = user.backendPayload?.billing;

  const refresh = useCallback(async () => {
    setBusy('refresh');
    try {
      const next = await refreshBackendSession();
      if (next) setUser(next);
    } finally {
      setBusy(null);
    }
  }, [setUser]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search);
    const checkout = q.get('checkout');
    if (checkout === 'success') {
      setBanner('success');
      void refresh();
      window.history.replaceState({}, '', window.location.pathname);
    } else if (checkout === 'canceled') {
      setBanner('canceled');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [refresh]);

  useEffect(() => {
    if (!isBackendConfigured()) return;
    void (async () => {
      try {
        const res = await fetch(backendV1Url('/billing/catalog'));
        const json = await res.json().catch(() => null);
        const c = json?.data?.configured;
        if (c) setConfigured(c);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const authHeader = (): HeadersInit => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  const startCheckout = async (purchaseKind: BillingPurchaseKind) => {
    if (!token) return;
    const priceOk =
      purchaseKind === 'premium_monthly'
        ? configured?.premiumMonthly
        : purchaseKind === 'cosmetic_themes'
          ? configured?.cosmeticThemes
          : purchaseKind === 'cooldown_boost'
            ? configured?.cooldownBoost
            : configured?.privateCanvasSlot;
    if (configured && !priceOk) return;

    setBusy(purchaseKind);
    try {
      const res = await fetch(backendV1Url('/billing/checkout-session'), {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ purchaseKind }),
      });
      const json = await res.json().catch(() => null);
      const url = json?.data?.url as string | undefined;
      if (url) {
        window.location.href = url;
        return;
      }
    } finally {
      setBusy(null);
    }
  };

  const openPortal = async () => {
    if (!token) return;
    setBusy('portal');
    try {
      const res = await fetch(backendV1Url('/billing/customer-portal'), {
        method: 'POST',
        headers: authHeader(),
      });
      const json = await res.json().catch(() => null);
      const url = json?.data?.url as string | undefined;
      if (url) {
        window.location.href = url;
        return;
      }
    } finally {
      setBusy(null);
    }
  };

  if (!isBackendConfigured()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('needsBackend')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!token || user.authBackend !== 'postgres') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('loginRequired')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const premiumActive = billing?.premiumActive;
  const portalOk = billing?.customerPortalAvailable;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{t('title')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      {banner === 'success' && (
        <Card className="border-emerald-500/40 bg-emerald-500/5">
          <CardHeader className="py-4">
            <CardTitle className="text-base">{t('successTitle')}</CardTitle>
            <CardDescription>{t('successHint')}</CardDescription>
          </CardHeader>
        </Card>
      )}
      {banner === 'canceled' && (
        <Card className="border-border">
          <CardHeader className="py-4">
            <CardTitle className="text-base">{t('canceledTitle')}</CardTitle>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-lg">{t('currentPlan')}</CardTitle>
            <Badge variant={premiumActive ? 'default' : 'secondary'}>
              {premiumActive ? t('planPremium') : t('planFree')}
            </Badge>
          </div>
          {billing?.subscriptionPeriodEnd && (
            <CardDescription>
              {t('premiumUntil', { date: billing.subscriptionPeriodEnd })}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">{t('themesLabel')}</p>
              <p className="mt-1 font-mono text-xs leading-relaxed">
                {(billing?.uiThemes ?? []).length ? billing.uiThemes.join(', ') : '—'}
              </p>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">{t('slotsLabel')}</p>
              <p className="mt-1 tabular-nums">{billing?.privateCanvasSlots ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/30 p-3 sm:col-span-2">
              <p className="text-xs font-medium text-muted-foreground">{t('cooldownLabel')}</p>
              <p className="mt-1 tabular-nums">
                {billing?.pixelCooldownMs != null ? `${billing.pixelCooldownMs} ms` : '—'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={() => void refresh()}
            >
              {busy === 'refresh' ? t('processing') : t('refresh')}
            </Button>
            {portalOk && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={busy !== null}
                onClick={() => void openPortal()}
              >
                {busy === 'portal' ? t('processing') : t('manageBilling')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-sky-500/25 bg-sky-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('fairnessHeading')}</CardTitle>
          <CardDescription>{billing?.fairnessNote ?? t('fairnessFallback')}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('offersHeading')}</CardTitle>
          <CardDescription>{t('offersHint')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <OfferRow
            title={t('upgradePremium')}
            description={t('upgradePremiumDesc')}
            disabled={
              !!premiumActive ||
              busy !== null ||
              (configured !== null && !configured.premiumMonthly)
            }
            hint={configured !== null && !configured.premiumMonthly ? t('offUnavailable') : undefined}
            actionLabel={
              premiumActive ? t('alreadyPremium') : busy === 'premium_monthly' ? t('processing') : t('ctaSubscribe')
            }
            onClick={() => void startCheckout('premium_monthly')}
          />
          <Separator />
          <OfferRow
            title={t('buyThemes')}
            description={t('buyThemesDesc')}
            disabled={busy !== null || (configured !== null && !configured.cosmeticThemes)}
            hint={configured !== null && !configured.cosmeticThemes ? t('offUnavailable') : undefined}
            actionLabel={busy === 'cosmetic_themes' ? t('processing') : t('ctaBuy')}
            onClick={() => void startCheckout('cosmetic_themes')}
          />
          <OfferRow
            title={t('buyCooldownBoost')}
            description={t('buyCooldownBoostDesc')}
            disabled={
              !!billing?.cooldownBoostPurchased ||
              busy !== null ||
              (configured !== null && !configured.cooldownBoost)
            }
            hint={
              configured !== null && !configured.cooldownBoost
                ? t('offUnavailable')
                : billing?.cooldownBoostPurchased
                  ? t('alreadyHasBoost')
                  : undefined
            }
            actionLabel={
              billing?.cooldownBoostPurchased ? t('alreadyHasBoost') : busy === 'cooldown_boost' ? t('processing') : t('ctaBuy')
            }
            onClick={() => void startCheckout('cooldown_boost')}
          />
          <OfferRow
            title={t('buySlot')}
            description={t('buySlotDesc')}
            disabled={busy !== null || (configured !== null && !configured.privateCanvasSlot)}
            hint={configured !== null && !configured.privateCanvasSlot ? t('offUnavailable') : undefined}
            actionLabel={busy === 'private_canvas_slot' ? t('processing') : t('ctaBuy')}
            onClick={() => void startCheckout('private_canvas_slot')}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function OfferRow(props: {
  title: string;
  description: string;
  actionLabel: string;
  disabled: boolean;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="font-medium leading-none">{props.title}</p>
        <p className="text-sm text-muted-foreground">{props.description}</p>
        {props.hint && <p className="text-xs text-amber-600 dark:text-amber-400">{props.hint}</p>}
      </div>
      <Button
        type="button"
        size="sm"
        className="shrink-0 sm:ml-4"
        disabled={props.disabled}
        onClick={props.onClick}
      >
        {props.actionLabel}
      </Button>
    </div>
  );
}
