'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@/types';
import { backendV1Url } from '@/lib/backendV1';
import { getBackendToken } from '@/lib/backendSession';
import { createFactionSocket } from '@/lib/factionSocket';
import type { Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';
import { attachBehaviorListeners, getBehaviorSnapshot, recordPlacementClick } from '@/lib/behaviorSignals';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';
import TurnstileGate from '@/components/TurnstileGate';

interface FactionsTabProps {
  user: User;
  editMode: boolean;
}

type ChatMsg = {
  id: string;
  userId: string;
  username: string;
  body: string;
  createdAt: string;
};

export default function FactionsTab({ user, editMode: _editMode }: FactionsTabProps) {
  const { t } = useTranslation('factions');
  const token = typeof window !== 'undefined' ? getBackendToken() : null;

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [membership, setMembership] = useState<{
    role: string;
    faction: { id: string; name: string; tag: string; color: string; memberCount: number };
  } | null>(null);

  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [seasonName, setSeasonName] = useState('');
  const [globalLb, setGlobalLb] = useState<Array<{ rank: number; username: string; pixelsPlaced: number }>>([]);
  const [factionLb, setFactionLb] = useState<
    Array<{ rank: number; tag: string; name: string; tilesOwned: number }>
  >([]);

  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');

  const [createName, setCreateName] = useState('');
  const [createTag, setCreateTag] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [inviteMax, setInviteMax] = useState('50');

  const [canvasId, setCanvasId] = useState('main');
  const [cellX, setCellX] = useState('0');
  const [cellY, setCellY] = useState('0');

  const socketRef = useRef<Socket | null>(null);
  /** Coalesce high-frequency territory socket messages before updating UI copy. */
  const territoryUiRaf = useRef<number | null>(null);
  const pendingTerritoryMsg = useRef<string | null>(null);
  const [needsCaptchaUi, setNeedsCaptchaUi] = useState(false);

  useEffect(() => {
    attachBehaviorListeners();
  }, []);

  const authHeader = useCallback((): HeadersInit => {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, [token]);

  const loadMembership = useCallback(async () => {
    if (!token) return;
    const res = await fetch(backendV1Url('/factions/me'), { headers: authHeader() });
    const json = await res.json().catch(() => null);
    if (!res.ok) return;
    const m = json?.data?.membership;
    if (!m) {
      setMembership(null);
      return;
    }
    setMembership({
      role: m.role,
      faction: m.faction,
    });
  }, [token, authHeader]);

  const loadSeason = useCallback(async () => {
    const res = await fetch(backendV1Url('/seasons/current'));
    const json = await res.json().catch(() => null);
    const s = json?.data?.season;
    if (s?.id) {
      setSeasonId(s.id);
      setSeasonName(s.name);
    } else {
      setSeasonId(null);
      setSeasonName('');
    }
  }, []);

  const loadLeaderboards = useCallback(async () => {
    const g = await fetch(backendV1Url('/leaderboards/global'));
    const fg = await fetch(backendV1Url('/leaderboards/factions'));
    const gj = await g.json().catch(() => null);
    const fj = await fg.json().catch(() => null);
    if (gj?.data?.rows) {
      setGlobalLb(
        gj.data.rows.map((r: { rank: number; username: string; pixelsPlaced: number }) => ({
          rank: r.rank,
          username: r.username,
          pixelsPlaced: r.pixelsPlaced,
        }))
      );
    }
    if (fj?.data?.rows) {
      setFactionLb(
        fj.data.rows.map(
          (r: { rank: number; tag: string; name: string; tilesOwned: number }) => ({
            rank: r.rank,
            tag: r.tag,
            name: r.name,
            tilesOwned: r.tilesOwned,
          })
        )
      );
    }
  }, []);

  const loadChat = useCallback(async () => {
    if (!token || !membership) return;
    const res = await fetch(backendV1Url(`/factions/${membership.faction.id}/chat?limit=80`), {
      headers: authHeader(),
    });
    const json = await res.json().catch(() => null);
    if (json?.data?.messages) setChat(json.data.messages);
  }, [token, membership, authHeader]);

  useEffect(() => {
    void loadSeason();
    void loadLeaderboards();
  }, [loadSeason, loadLeaderboards]);

  useEffect(() => {
    if (!token || user.authBackend !== 'postgres') return;
    void loadMembership();
  }, [token, user.authBackend, loadMembership]);

  useEffect(() => {
    void loadChat();
  }, [loadChat]);

  useEffect(() => {
    if (!token || !seasonId) return;
    const s = createFactionSocket(token);
    if (!s) return;
    socketRef.current = s;

    const sub = () => {
      s.emit('leaderboard:subscribe', { seasonId });
      if (membership?.faction.id) {
        s.emit('faction:subscribe', { factionId: membership.faction.id });
        s.emit('canvas:subscribe', { canvasId, seasonId });
      }
    };

    s.on('connect', sub);
    if (s.connected) sub();

    s.on('leaderboard:update', (payload: { global?: typeof globalLb; factions?: typeof factionLb }) => {
      if (payload.global)
        setGlobalLb(
          payload.global.map((r) => ({
            rank: r.rank,
            username: r.username,
            pixelsPlaced: r.pixelsPlaced,
          }))
        );
      if (payload.factions)
        setFactionLb(
          payload.factions.map((r) => ({
            rank: r.rank,
            tag: r.tag,
            name: r.name,
            tilesOwned: r.tilesOwned,
          }))
        );
    });

    s.on('faction:chat', (m: ChatMsg & { factionId?: string }) => {
      setChat((prev) => [...prev.slice(-199), m]);
    });

    s.on('season:tick', () => {
      void loadSeason();
    });

    s.on(
      'territory:batch',
      (b: {
        patches?: Array<{ factionTag?: string; x?: number; y?: number }>;
      }) => {
        const patches = b.patches;
        if (!patches?.length) return;
        const last = patches[patches.length - 1];
        pendingTerritoryMsg.current =
          patches.length === 1
            ? `Tile (${last.x}, ${last.y}) → [${last.factionTag}]`
            : `${patches.length} tiles updated · last (${last.x}, ${last.y}) → [${last.factionTag}]`;
        if (territoryUiRaf.current != null) return;
        territoryUiRaf.current = requestAnimationFrame(() => {
          territoryUiRaf.current = null;
          const t = pendingTerritoryMsg.current;
          if (t) setMsg(t);
        });
      }
    );

    return () => {
      if (territoryUiRaf.current != null) cancelAnimationFrame(territoryUiRaf.current);
      territoryUiRaf.current = null;
      pendingTerritoryMsg.current = null;
      s.disconnect();
      socketRef.current = null;
    };
  }, [token, seasonId, canvasId, membership?.faction.id, loadSeason]);

  const sendChat = () => {
    const s = socketRef.current;
    const body = chatInput.trim();
    if (!s || !membership || !body) return;
    s.emit('faction:chat', { factionId: membership.faction.id, body }, () => {});
    setChatInput('');
  };

  const createFaction = async () => {
    if (!token) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch(backendV1Url('/factions'), {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          name: createName.trim(),
          tag: createTag.trim(),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) setMsg(json?.error?.message || t('createFailed'));
      else {
        setCreateName('');
        setCreateTag('');
        await loadMembership();
      }
    } finally {
      setBusy(false);
    }
  };

  const joinFaction = async () => {
    if (!token) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch(backendV1Url('/factions/join'), {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) setMsg(json?.error?.message || t('joinFailed'));
      else {
        setJoinCode('');
        await loadMembership();
      }
    } finally {
      setBusy(false);
    }
  };

  const createInvite = async () => {
    if (!token || !membership) return;
    setBusy(true);
    try {
      const res = await fetch(backendV1Url(`/factions/${membership.faction.id}/invites`), {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ maxUses: Number(inviteMax) || 50 }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.data?.code) {
        setMsg(t('inviteCreated', { code: json.data.code }));
      } else setMsg(json?.error?.message || t('inviteFailed'));
    } finally {
      setBusy(false);
    }
  };

  const claimTile = async (captchaToken?: string) => {
    if (!token) return;
    setBusy(true);
    setMsg('');
    try {
      recordPlacementClick();
      const fingerprint = await getDeviceFingerprint();
      const behavior = getBehaviorSnapshot();
      const res = await fetch(backendV1Url('/territory/claim'), {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          canvasId: canvasId.trim(),
          x: Number(cellX),
          y: Number(cellY),
          fingerprint,
          behavior,
          ...(captchaToken ? { captchaToken } : {}),
        }),
      });
      const json = await res.json().catch(() => null);
      const code = json?.error?.code as string | undefined;

      if (code === 'CAPTCHA_REQUIRED') {
        setNeedsCaptchaUi(true);
        setMsg(t('captchaRequired'));
        return;
      }
      if (code === 'PLACEMENT_LOCKED') {
        setMsg(t('placementLocked'));
        return;
      }

      setNeedsCaptchaUi(false);
      if (!res.ok) setMsg(json?.error?.message || t('claimFailed'));
      else setMsg(t('claimOk', { tag: json?.data?.factionTag ?? '' }));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (user.backendPayload?.abuse?.captchaRequired) setNeedsCaptchaUi(true);
  }, [user.backendPayload?.abuse?.captchaRequired]);

  if (!token || user.authBackend !== 'postgres') {
    return (
      <div className="mx-auto max-w-lg space-y-2 text-center">
        <h2 className="text-xl font-semibold">{t('needAuthTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('needAuthBody')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        {seasonName ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {t('seasonLabel', { name: seasonName })}
          </p>
        ) : null}
      </div>

      {msg ? (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm" role="status">
          {msg}
        </p>
      ) : null}

      {!membership ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('createTitle')}</CardTitle>
              <CardDescription>{t('createHint')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input placeholder={t('factionName')} value={createName} onChange={(e) => setCreateName(e.target.value)} />
              <Input placeholder={t('factionTag')} value={createTag} onChange={(e) => setCreateTag(e.target.value)} />
              <Button type="button" disabled={busy} onClick={() => void createFaction()}>
                {t('createBtn')}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('joinTitle')}</CardTitle>
              <CardDescription>{t('joinHint')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                placeholder={t('inviteCodePh')}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
              <Button type="button" disabled={busy} onClick={() => void joinFaction()}>
                {t('joinBtn')}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              [{membership.faction.tag}] {membership.faction.name}
            </CardTitle>
            <CardDescription>
              {t('yourRole', { role: membership.role })} · {membership.faction.memberCount}{' '}
              {t('members')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {membership.role === 'leader' ? (
              <div className="flex flex-wrap gap-2">
                <Input
                  className="max-w-[120px]"
                  value={inviteMax}
                  onChange={(e) => setInviteMax(e.target.value)}
                />
                <Button type="button" variant="secondary" disabled={busy} onClick={() => void createInvite()}>
                  {t('genInvite')}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('lbGlobal')}</CardTitle>
            <CardDescription>{t('lbGlobalHint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-3">
              <ol className="space-y-1 text-sm">
                {globalLb.slice(0, 20).map((r) => (
                  <li key={r.rank + r.username} className="flex justify-between gap-2">
                    <span>
                      #{r.rank} {r.username}
                    </span>
                    <span className="text-muted-foreground">{r.pixelsPlaced}px</span>
                  </li>
                ))}
              </ol>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('lbFaction')}</CardTitle>
            <CardDescription>{t('lbFactionHint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-3">
              <ol className="space-y-1 text-sm">
                {factionLb.slice(0, 20).map((r) => (
                  <li key={r.rank + r.tag} className="flex justify-between gap-2">
                    <span>
                      #{r.rank} [{r.tag}] {r.name}
                    </span>
                    <span className="text-muted-foreground">{r.tilesOwned} tiles</span>
                  </li>
                ))}
              </ol>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {membership ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('chatTitle')}</CardTitle>
            <CardDescription>{t('chatHint')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScrollArea className="h-[220px] rounded-md border p-2 pr-3">
              <ul className="space-y-2 text-sm">
                {chat.map((c) => (
                  <li key={c.id}>
                    <span className="font-medium text-primary">{c.username}</span>{' '}
                    <span className="text-muted-foreground">{c.body}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder={t('chatPh')}
              />
              <Button type="button" onClick={sendChat}>
                {t('send')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {membership ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('territoryTitle')}</CardTitle>
            <CardDescription>{t('territoryHint')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {needsCaptchaUi ? (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
                <p className="mb-2 text-sm font-medium">{t('verifyHuman')}</p>
                <TurnstileGate
                  onToken={(tok) => {
                    void claimTile(tok);
                  }}
                />
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Input className="max-w-[160px]" value={canvasId} onChange={(e) => setCanvasId(e.target.value)} />
              <Input className="w-20" value={cellX} onChange={(e) => setCellX(e.target.value)} />
              <Input className="w-20" value={cellY} onChange={(e) => setCellY(e.target.value)} />
              <Button type="button" disabled={busy} onClick={() => void claimTile()}>
                {t('claim')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
