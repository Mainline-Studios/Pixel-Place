'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Skin, TabContent } from '@/types';
import { getSkins, getTabContent } from '@/lib/storage';
import AdminPanelTab from './AdminPanelTab';
import { escapeHTML } from '@/lib/utils';

import { useStyle } from '@/components/StyleProvider';
import { useSound } from '@/contexts/SoundContext';
import { STYLE_OPTIONS } from '@/lib/styleTheme';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/lib/formatLocale';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { backendV1Url, isBackendConfigured } from '@/lib/backendV1';
import { getBackendToken, clearBackendToken } from '@/lib/backendSession';
import { mapBackendUserToAppUser } from '@/lib/backendUser';
import { useUser } from '@/contexts/UserContext';
import { Input } from '@/components/ui/input';
import * as THREE from 'three';
import { AssetImportDropzone } from '@/components/assets/AssetImportDropzone';
import {
  gameAssetRegistry,
  type GameRegistryAssetRecord,
  getVerifiedAssetsOnlyMode,
  setVerifiedAssetsOnlyMode,
  isUserAssetApprovedForVerifiedMode,
} from '@/lib/assets';

interface SettingsTabProps {
  user: User;
  editMode: boolean;
  onToggleEditMode: () => void;
}

export default function SettingsTab({ user, editMode, onToggleEditMode }: SettingsTabProps) {
  const { setUser } = useUser();
  const { t } = useTranslation(['settings', 'sidebar', 'common']);
  const { formatNumber } = useLocaleFormat();
  const { style, setStyle } = useStyle();
  const { soundsEnabled, setSoundsEnabled } = useSound();
  const [skins, setSkins] = useState<Skin[]>([]);
  const [tabContent, setTabContent] = useState<TabContent | null>(null);
  const coins = user.coins || 0;

  const [privacyBusy, setPrivacyBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [privacyMsg, setPrivacyMsg] = useState('');
  const [trustBusy, setTrustBusy] = useState(false);
  const [familyCodeDisplay, setFamilyCodeDisplay] = useState('');
  const [importedModels, setImportedModels] = useState<GameRegistryAssetRecord[]>([]);
  const [verifiedAssetsOnly, setVerifiedAssetsOnly] = useState(false);

  const refreshImportedList = useCallback(() => {
    setImportedModels(gameAssetRegistry.list());
  }, []);

  useEffect(() => {
    setVerifiedAssetsOnly(getVerifiedAssetsOnlyMode());
    refreshImportedList();
    void gameAssetRegistry.hydrate(THREE).then(refreshImportedList);
  }, [refreshImportedList]);

  const authHeader = useCallback((): HeadersInit => {
    const token = getBackendToken();
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    };
  }, []);

  const downloadExport = async () => {
    setPrivacyMsg('');
    setPrivacyBusy(true);
    try {
      const token = getBackendToken();
      if (!token) {
        setPrivacyMsg(t('deleteNeedLogin'));
        return;
      }
      const res = await fetch(backendV1Url('/users/me/export'), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        setPrivacyMsg(t('exportFailed'));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pixel-place-data-export.json`;
      a.click();
      URL.revokeObjectURL(url);
      setPrivacyMsg(t('downloadStarted'));
    } finally {
      setPrivacyBusy(false);
    }
  };

  const submitDelete = async () => {
    setPrivacyMsg('');
    setPrivacyBusy(true);
    try {
      const token = getBackendToken();
      if (!token) {
        setPrivacyMsg(t('deleteNeedLogin'));
        return;
      }
      const res = await fetch(backendV1Url('/users/me/delete'), {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          confirmation: deletePhrase.trim(),
          password: deletePassword ? deletePassword : undefined,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setPrivacyMsg(json?.error?.message || t('deleteFailed'));
        return;
      }
      clearBackendToken();
      setPrivacyMsg(t('deleteSuccess'));
      setDeleteOpen(false);
      window.setTimeout(() => {
        window.location.href = '/';
      }, 800);
    } finally {
      setPrivacyBusy(false);
    }
  };

  const patchTrust = async (patch: { safeModeEnabled?: boolean; educationalModeEnabled?: boolean }) => {
    setTrustBusy(true);
    try {
      const token = getBackendToken();
      if (!token) return;
      const res = await fetch(backendV1Url('/users/me/trust'), {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify(patch),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.data?.user) {
        setUser(mapBackendUserToAppUser(json.data.user));
      }
    } finally {
      setTrustBusy(false);
    }
  };

  const regenerateFamilyCode = async () => {
    setFamilyCodeDisplay('');
    setTrustBusy(true);
    try {
      const token = getBackendToken();
      if (!token) return;
      const res = await fetch(backendV1Url('/users/me/family-code'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.data?.code) {
        setFamilyCodeDisplay(
          `${json.data.code} · ${t('settings:familyCodeExpires', { date: new Date(json.data.expiresAt).toLocaleString() })}`
        );
      }
    } finally {
      setTrustBusy(false);
    }
  };

  const genderLine = useMemo(() => {
    const g = (user.gender || '').toLowerCase();
    if (g === 'boy') return t('sidebar:genderBoy');
    if (g === 'girl') return t('sidebar:genderGirl');
    if (g === 'other') return t('sidebar:genderOther');
    return t('sidebar:genderNA');
  }, [user.gender, t]);

  useEffect(() => {
    const load = async () => {
      try {
        const [skinsData, tabData] = await Promise.all([getSkins(), getTabContent()]);
        setSkins(Array.isArray(skinsData) ? skinsData : []);
        setTabContent(tabData || ({} as TabContent));
      } catch {
        setSkins([]);
        setTabContent({} as TabContent);
      }
    };
    load();
  }, []);

  const equippedSkin = skins.find((s) => s.id === user.equippedSkin);
  const equippedSkinName = equippedSkin ? equippedSkin.name : t('none');

  return (
    <div className="flex flex-col gap-6 p-1">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{t('title')}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings:account')}</CardTitle>
          <CardDescription>{t('settings:username')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">{t('settings:username')}:</span>{' '}
            {user.username || ''}
          </p>
          <p>
            <span className="font-medium text-foreground">{t('settings:accountRole')}:</span>{' '}
            {escapeHTML(user.role)}
          </p>
          <p>{genderLine}</p>
          <p>
            <span className="font-medium text-foreground">{t('settings:accountCoins')}:</span>{' '}
            {formatNumber(coins)}
          </p>
          <p>
            <span className="font-medium text-foreground">{t('settings:equippedSkin')}:</span>{' '}
            {escapeHTML(equippedSkinName)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings:language')}</CardTitle>
          <CardDescription>{t('settings:languageDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSwitcher />
        </CardContent>
      </Card>

      {isBackendConfigured() && user.authBackend === 'postgres' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('settings:trustTitle')}</CardTitle>
            <CardDescription>{t('settings:trustDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {user.backendPayload?.trust?.linkedToParent ? (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-900 dark:text-amber-200">
                {t('settings:trustParentManaged')}
              </p>
            ) : null}
            {user.backendPayload?.trust?.verifiedCreator ? (
              <p className="text-muted-foreground">
                {t('settings:verifiedCreatorBadge', {
                  label: user.backendPayload.trust.verifiedCreatorLabel || 'Verified creator',
                })}
              </p>
            ) : null}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-primary"
                checked={!!user.backendPayload?.trust?.safeModeEnabled}
                disabled={trustBusy || !!user.backendPayload?.trust?.linkedToParent}
                onChange={(e) => void patchTrust({ safeModeEnabled: e.target.checked })}
              />
              <span>{t('settings:trustSafeMode')}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-primary"
                checked={!!user.backendPayload?.trust?.educationalModeEnabled}
                disabled={trustBusy || !!user.backendPayload?.trust?.linkedToParent}
                onChange={(e) => void patchTrust({ educationalModeEnabled: e.target.checked })}
              />
              <span>{t('settings:trustEducational')}</span>
            </label>
            <div className="space-y-2 border-t border-border pt-4">
              <p className="font-medium text-foreground">{t('settings:familyPairTitle')}</p>
              <p className="text-muted-foreground">{t('settings:familyPairDescription')}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={trustBusy || !!user.backendPayload?.trust?.linkedToParent}
                onClick={() => void regenerateFamilyCode()}
              >
                {t('settings:familyPairGenerate')}
              </Button>
              {familyCodeDisplay ? (
                <p className="rounded-md bg-muted px-3 py-2 font-mono text-xs text-foreground">{familyCodeDisplay}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      )}

      {(user.role === 'admin' || user.role === 'head_admin') && (
        <Card>
          <CardHeader>
            <CardTitle>{t('settings:adminTools')}</CardTitle>
            <CardDescription>{t('settings:adminInstantPublish')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('settings:editMode')}:{' '}
              <span className="font-medium text-foreground">
                {editMode ? t('settings:editModeOn') : t('settings:editModeOff')}
              </span>
            </p>
            <Button onClick={onToggleEditMode} variant={editMode ? 'secondary' : 'default'}>
              {editMode ? t('settings:stopEditing') : t('settings:editMode')}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('settings:soundEffects')}</CardTitle>
          <CardDescription>{t('settings:soundDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={soundsEnabled}
              onChange={(e) => setSoundsEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <span>{t('settings:enableSounds')}</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings:style')}</CardTitle>
          <CardDescription>{t('settings:styleDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((opt) => (
              <Button
                key={opt.id}
                type="button"
                variant={style === opt.id ? 'default' : 'outline'}
                size="sm"
                className={cn(style === opt.id && 'shadow-sm')}
                onClick={() => setStyle(opt.id)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isBackendConfigured() && user.authBackend === 'postgres' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('settings:privacyCardTitle')}</CardTitle>
            <CardDescription>{t('settings:privacyCardDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/privacy">{t('settings:privacyPolicyLink')}</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/terms">{t('settings:termsLink')}</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" disabled={privacyBusy} onClick={downloadExport}>
                {t('settings:downloadMyData')}
              </Button>
              {!deleteOpen ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={privacyBusy}
                  onClick={() => {
                    setDeleteOpen(true);
                    setDeletePhrase('');
                    setDeletePassword('');
                    setPrivacyMsg('');
                  }}
                >
                  {t('settings:deleteAccount')}
                </Button>
              ) : null}
            </div>
            {deleteOpen ? (
              <div className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                <p className="text-muted-foreground">{t('settings:deleteWarning')}</p>
                <Input
                  placeholder={t('settings:deleteConfirmPhrase')}
                  value={deletePhrase}
                  onChange={(e) => setDeletePhrase(e.target.value)}
                  autoComplete="off"
                />
                <Input
                  type="password"
                  placeholder={t('settings:deletePasswordHint')}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  autoComplete="current-password"
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="destructive" size="sm" disabled={privacyBusy} onClick={submitDelete}>
                    {t('settings:deleteSubmit')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeleteOpen(false);
                      setPrivacyMsg(t('settings:deleteCancelled'));
                    }}
                  >
                    {t('cancel', { ns: 'common' })}
                  </Button>
                </div>
              </div>
            ) : null}
            {privacyMsg ? <p className="text-xs text-muted-foreground">{privacyMsg}</p> : null}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Imported 3D models</CardTitle>
          <CardDescription>
            Drag in GLB, GLTF, or FBX files. File names and embedded textures are checked (rules + AI) before textured
            models are accepted. Verified creators can auto-publish after AI clearance; others may require staff review.
            Geometry-only imports use filename rules; sign in with textures for full checks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex max-w-xl cursor-pointer items-start gap-3 rounded-md border border-border/60 bg-muted/20 p-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-border"
              checked={verifiedAssetsOnly}
              onChange={(e) => {
                const on = e.target.checked;
                setVerifiedAssetsOnlyMode(on);
                setVerifiedAssetsOnly(on);
                gameAssetRegistry.clearCacheOnly();
                void gameAssetRegistry.hydrate(THREE).then(refreshImportedList);
              }}
            />
            <span>
              <span className="font-medium text-foreground">Verified assets only</span>
              <span className="mt-1 block text-muted-foreground">
                When enabled, only server-reviewed imports (not offline filename-only entries) are loaded into the 3D
                cache for games. Recommended for public or kid-facing experiences.
              </span>
            </span>
          </label>
          <AssetImportDropzone onImported={refreshImportedList} className="w-full max-w-xl" />
          {importedModels.length > 0 ? (
            <ul className="max-w-xl space-y-2 text-sm text-muted-foreground">
              {importedModels.map((r) => {
                const mod = r.moderation;
                const statusLabel = !mod
                  ? 'Legacy (pre-safety)'
                  : mod.reviewStatus === 'approved'
                    ? 'Approved'
                    : mod.reviewStatus === 'pending_review'
                      ? 'Pending review'
                      : mod.reviewStatus === 'rejected'
                        ? 'Rejected'
                        : mod.reviewStatus;
                const usableVerified = isUserAssetApprovedForVerifiedMode(r);
                return (
                  <li
                    key={r.id}
                    className="flex flex-col gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                  >
                    <span className="min-w-0 truncate font-medium text-foreground" title={r.name}>
                      {r.name}
                    </span>
                    <span className="shrink-0 text-xs">
                      {formatNumber(r.triangleCount)} tris · {r.format.toUpperCase()}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 rounded px-2 py-0.5 text-xs',
                        usableVerified ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/15 text-amber-800 dark:text-amber-200'
                      )}
                      title={
                        verifiedAssetsOnly && !usableVerified
                          ? 'Hidden from 3D cache while verified-only mode is on'
                          : undefined
                      }
                    >
                      {statusLabel}
                      {mod?.source === 'local_filename_only' ? ' · local' : ''}
                      {mod?.aiChecked ? ' · AI' : ''}
                    </span>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {mod?.reviewStatus === 'pending_review' && mod.scanId ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            void gameAssetRegistry.refreshModerationStatus(r.id).then(() => refreshImportedList());
                          }}
                        >
                          Refresh status
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          void gameAssetRegistry.remove(r.id).then(refreshImportedList);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings:pyxStatus')}</CardTitle>
          <CardDescription>{t('settings:pyxDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://pyxaiapi-574247481583.us-central1.run.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              {t('settings:openPyx')}
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings:settingsInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-none whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {tabContent?.settings ?? ''}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-2" />

      {(user.role === 'mod' || user.role === 'admin' || user.role === 'head_admin') && (
        <div className="space-y-6 pt-2">
          <Card>
            <CardHeader>
              <CardTitle>Admin dashboard</CardTitle>
              <CardDescription>
                Full-screen internal tool: reports, bans, audit log, Postgres analytics, and abuse flags.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/admin">Open admin dashboard</Link>
              </Button>
            </CardContent>
          </Card>
          <AdminPanelTab user={user} editMode={editMode} />
        </div>
      )}
    </div>
  );
}
