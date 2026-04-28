'use client';

import { useCallback, useEffect, useState } from 'react';
import type { User } from '@/types';
import { backendV1Url } from '@/lib/backendV1';
import { getBackendToken } from '@/lib/backendSession';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

type ChildRow = {
  childId: string;
  username: string;
  safeModeEnabled: boolean;
  educationalModeEnabled: boolean;
  linkedAt: string;
};

interface ParentControlsTabProps {
  user: User;
  editMode: boolean;
}

export default function ParentControlsTab({ user: _user }: ParentControlsTabProps) {
  const { t } = useTranslation(['parent', 'common']);
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [childUsername, setChildUsername] = useState('');
  const [pairCode, setPairCode] = useState('');

  const authHeader = useCallback((): HeadersInit => {
    const token = getBackendToken();
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    };
  }, []);

  const loadChildren = useCallback(async () => {
    const token = getBackendToken();
    if (!token) return;
    const res = await fetch(backendV1Url('/family/children'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.data?.children) setChildren(json.data.children);
  }, []);

  useEffect(() => {
    void loadChildren();
  }, [loadChildren]);

  const linkChild = async () => {
    setMsg('');
    setBusy(true);
    try {
      const res = await fetch(backendV1Url('/family/link'), {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          childUsername: childUsername.trim(),
          code: pairCode.trim(),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setMsg(json?.error?.message || t('parent:linkFailed'));
        return;
      }
      setMsg(t('parent:linkOk', { name: json?.data?.childUsername || childUsername }));
      setChildUsername('');
      setPairCode('');
      await loadChildren();
    } finally {
      setBusy(false);
    }
  };

  const patchChild = async (childId: string, patch: { safeModeEnabled?: boolean; educationalModeEnabled?: boolean }) => {
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch(backendV1Url(`/family/child/${childId}`), {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify(patch),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setMsg(json?.error?.message || t('parent:updateFailed'));
        return;
      }
      await loadChildren();
      setMsg(t('parent:updated'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-1">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{t('parent:title')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('parent:subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('parent:linkTitle')}</CardTitle>
          <CardDescription>{t('parent:linkDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="childUsername" className="text-sm font-medium">
                {t('parent:childUsername')}
              </label>
              <Input
                id="childUsername"
                value={childUsername}
                onChange={(e) => setChildUsername(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="pairCode" className="text-sm font-medium">
                {t('parent:pairCode')}
              </label>
              <Input
                id="pairCode"
                value={pairCode}
                onChange={(e) => setPairCode(e.target.value.toUpperCase())}
                autoComplete="off"
                maxLength={16}
              />
            </div>
          </div>
          <Button type="button" disabled={busy || !childUsername.trim() || !pairCode.trim()} onClick={linkChild}>
            {t('parent:linkButton')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('parent:childrenTitle')}</CardTitle>
          <CardDescription>{t('parent:childrenDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {children.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('parent:noChildren')}</p>
          ) : (
            <ul className="space-y-4">
              {children.map((c) => (
                <li
                  key={c.childId}
                  className="flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{c.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('parent:linkedAt', { date: new Date(c.linkedAt).toLocaleString() })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={c.safeModeEnabled ? 'default' : 'outline'}
                      disabled={busy}
                      onClick={() => patchChild(c.childId, { safeModeEnabled: !c.safeModeEnabled })}
                    >
                      {c.safeModeEnabled ? t('parent:safeOn') : t('parent:safeOff')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={c.educationalModeEnabled ? 'default' : 'outline'}
                      disabled={busy}
                      onClick={() =>
                        patchChild(c.childId, { educationalModeEnabled: !c.educationalModeEnabled })
                      }
                    >
                      {c.educationalModeEnabled ? t('parent:eduOn') : t('parent:eduOff')}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {msg ? <p className="text-sm text-muted-foreground">{msg}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
