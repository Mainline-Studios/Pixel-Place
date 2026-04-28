'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@/types';
import { backendV1Url } from '@/lib/backendV1';
import { getBackendToken } from '@/lib/backendSession';
import { refreshBackendSession } from '@/lib/backendUser';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { attachBehaviorListeners, getBehaviorSnapshot, recordPlacementClick } from '@/lib/behaviorSignals';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';
import TurnstileGate from '@/components/TurnstileGate';

interface ProgressionTabProps {
  user: User;
  editMode: boolean;
}

export default function ProgressionTab({ user, editMode: _editMode }: ProgressionTabProps) {
  const { t } = useTranslation('progression');
  const { setUser } = useUser();
  const [busy, setBusy] = useState<'daily' | 'pixels' | 'profile' | 'equip' | null>(null);
  const [msg, setMsg] = useState('');
  const [needsCaptchaPixels, setNeedsCaptchaPixels] = useState(false);
  const pendingPixelCountRef = useRef(1);
  const [displayName, setDisplayName] = useState(user.backendPayload?.profile.displayName ?? '');
  const [bio, setBio] = useState(user.backendPayload?.profile.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user.backendPayload?.profile.avatarUrl ?? '');

  useEffect(() => {
    const p = user.backendPayload?.profile;
    if (!p) return;
    setDisplayName(p.displayName ?? '');
    setBio(p.bio ?? '');
    setAvatarUrl(p.avatarUrl ?? '');
  }, [user.backendPayload]);

  useEffect(() => {
    attachBehaviorListeners();
  }, []);

  useEffect(() => {
    if (user.backendPayload?.abuse?.captchaRequired) setNeedsCaptchaPixels(true);
  }, [user.backendPayload?.abuse?.captchaRequired]);

  const token = typeof window !== 'undefined' ? getBackendToken() : null;
  const payload = user.backendPayload;

  const refresh = useCallback(async () => {
    const next = await refreshBackendSession();
    if (next) setUser(next);
  }, [setUser]);

  const authHeader = (): HeadersInit => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  const claimDaily = async () => {
    if (!token) return;
    setBusy('daily');
    setMsg('');
    try {
      const res = await fetch(backendV1Url('/progression/daily-reward'), {
        method: 'POST',
        headers: authHeader(),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setMsg(json?.error?.message || t('claimFailed'));
      } else {
        setMsg(t('claimOk', { streak: json?.data?.streak ?? '—' }));
        await refresh();
      }
    } finally {
      setBusy(null);
    }
  };

  const reportPixels = async (count: number, captchaToken?: string) => {
    if (!token) return;
    pendingPixelCountRef.current = count;
    setBusy('pixels');
    setMsg('');
    try {
      recordPlacementClick();
      const fingerprint = await getDeviceFingerprint();
      const behavior = getBehaviorSnapshot();
      const res = await fetch(backendV1Url('/progression/pixels'), {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          count,
          fingerprint,
          behavior,
          ...(captchaToken ? { captchaToken } : {}),
        }),
      });
      const json = await res.json().catch(() => null);
      const code = json?.error?.code as string | undefined;
      if (code === 'CAPTCHA_REQUIRED') {
        setNeedsCaptchaPixels(true);
        setMsg(t('captchaRequired'));
        return;
      }
      setNeedsCaptchaPixels(false);
      if (!res.ok) setMsg(json?.error?.message || t('pixelsFailed'));
      else {
        const ids: string[] = json?.data?.newAchievements ?? [];
        setMsg(ids.length ? t('pixelsOkNew', { list: ids.join(', ') }) : t('pixelsOk'));
        await refresh();
      }
    } finally {
      setBusy(null);
    }
  };

  const saveProfile = async () => {
    if (!token) return;
    setBusy('profile');
    setMsg('');
    try {
      const res = await fetch(backendV1Url('/users/me/profile'), {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify({
          displayName: displayName.trim() || null,
          bio: bio.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setMsg(json?.error?.message || t('profileFailed'));
      } else {
        setMsg(t('profileOk'));
        await refresh();
      }
    } finally {
      setBusy(null);
    }
  };

  const toggleEquip = async (itemId: string, equipped: boolean) => {
    if (!token) return;
    setBusy('equip');
    try {
      const res = await fetch(backendV1Url(`/inventory/${encodeURIComponent(itemId)}`), {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify({ equipped }),
      });
      if (res.ok) await refresh();
      else setMsg(t('equipFailed'));
    } finally {
      setBusy(null);
    }
  };

  if (!token || user.authBackend !== 'postgres') {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <h2 className="text-xl font-semibold">{t('needDbTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('needDbBody')}</p>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="flex justify-center py-12">
        <Button type="button" variant="secondary" onClick={() => refresh()}>
          {t('loadProfile')}
        </Button>
      </div>
    );
  }

  const prog = payload.progression;
  const pct = Math.min(100, (prog.xpIntoLevel / Math.max(1, prog.xpForNextLevel)) * 100);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      {msg ? (
        <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm" role="status">
          {msg}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('levelCard')}</CardTitle>
          <CardDescription>
            {t('levelLine', {
              level: prog.level,
              xp: prog.xp,
              pixels: payload.progression.pixelsPlaced,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {t('xpBar', { cur: prog.xpIntoLevel, need: prog.xpForNextLevel })}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('dailyTitle')}</CardTitle>
          <CardDescription>
            {t('dailyStreak', {
              current: payload.engagement.currentStreak,
              longest: payload.engagement.longestStreak,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={claimDaily} disabled={busy !== null}>
            {busy === 'daily' ? t('working') : t('claimDaily')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('pixelsTitle')}</CardTitle>
          <CardDescription>{t('pixelsHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {needsCaptchaPixels ? (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
              <p className="mb-2 text-sm font-medium">{t('verifyHuman')}</p>
              <TurnstileGate
                onToken={(tok) => {
                  void reportPixels(pendingPixelCountRef.current, tok);
                }}
              />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" disabled={busy !== null} onClick={() => void reportPixels(1)}>
              +1
            </Button>
            <Button type="button" variant="secondary" disabled={busy !== null} onClick={() => void reportPixels(10)}>
              +10
            </Button>
            <Button type="button" variant="secondary" disabled={busy !== null} onClick={() => void reportPixels(50)}>
              +50
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('achievementsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {payload.achievements.list.map((a) => (
              <li
                key={a.id}
                className={`flex justify-between gap-4 rounded-md border px-3 py-2 ${a.unlocked ? 'border-primary/40 bg-primary/5' : 'opacity-70'}`}
              >
                <span>
                  <span className="font-medium">{a.name}</span>
                  <span className="block text-xs text-muted-foreground">{a.description}</span>
                </span>
                <span className="shrink-0 text-xs">{a.unlocked ? '✓' : `+${a.xpReward} XP`}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('inventoryTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {payload.inventory.map((inv) => (
              <li
                key={inv.itemId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium">{inv.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">×{inv.quantity}</span>
                  {inv.description ? (
                    <span className="block text-xs text-muted-foreground">{inv.description}</span>
                  ) : null}
                </div>
                {inv.type === 'tool' ? (
                  <Button
                    type="button"
                    variant={inv.equipped ? 'default' : 'outline'}
                    size="sm"
                    disabled={busy !== null}
                    onClick={() => void toggleEquip(inv.itemId, !inv.equipped)}
                  >
                    {inv.equipped ? t('equipped') : t('equip')}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('profileTitle')}</CardTitle>
          <CardDescription>{t('profileHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder={t('displayNamePh')}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Input placeholder={t('bioPh')} value={bio} onChange={(e) => setBio(e.target.value)} />
          <Input placeholder={t('avatarPh')} value={avatarUrl ?? ''} onChange={(e) => setAvatarUrl(e.target.value)} />
          <Button type="button" disabled={busy !== null} onClick={saveProfile}>
            {busy === 'profile' ? t('working') : t('saveProfile')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
