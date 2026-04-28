'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { AuditLogEntry, Ban, Report, User } from '@/types';
import { authenticatedFetch } from '@/lib/api';
import { apiUrl } from '@/lib/apiBaseUrl';
import { backendV1Url, isBackendConfigured } from '@/lib/backendV1';
import { getBackendToken } from '@/lib/backendSession';
import { isAdminActor, isModerator } from '@/lib/moderation/roles';
import { cn } from '@/lib/utils';

type TabId = 'overview' | 'reports' | 'bans' | 'logs' | 'flags' | 'analytics' | 'users';

type PostgresOverview = {
  totalUsers: number;
  signupsLast7Days: number;
  dauToday: number;
  wauRolling7d: number;
  retention14dApprox: number | null;
  pixelsPlacedLifetime: number;
  activeSeason: { id: string; name: string; slug: string } | null;
  seasonPixelsPlaced: number;
  abuseFlagsUnresolved: number;
};

type PostgresAdminUser = {
  id: string;
  username: string;
  email: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastActiveDate: string | null;
  streak: number;
  pixelsPlaced: number;
  lastPlacedAt: string | null;
  abuseSuspicionScore: number;
  placementLocked: boolean;
};

export default function AdminDashboardApp() {
  const [tab, setTab] = useState<TabId>('overview');
  const [viewer, setViewer] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [reports, setReports] = useState<Report[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [audit, setAudit] = useState<AuditLogEntry[]>([]);
  const [flags, setFlags] = useState<
    Array<{
      id: string;
      userId: string;
      username: string;
      reason: string;
      scoreSnapshot: number;
      metadata: unknown;
      createdAt: string;
      resolvedAt: string | null;
    }>
  >([]);
  const [pgOverview, setPgOverview] = useState<PostgresOverview | null>(null);
  const [pgUsers, setPgUsers] = useState<PostgresAdminUser[]>([]);
  const [pgTotal, setPgTotal] = useState(0);

  const [reportSearch, setReportSearch] = useState('');
  const [banSearch, setBanSearch] = useState('');
  const [reportStatus, setReportStatus] = useState<string>('all');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('');

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const banUserField = useState('');
  const banReasonField = useState('');
  const banPermanentField = useState(true);
  const banDaysField = useState(7);

  const canMod = viewer && isModerator(viewer.role);
  const canPgAdmin = viewer && isAdminActor(viewer.role) && isBackendConfigured() && !!getBackendToken();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await authenticatedFetch(apiUrl('/api/auth'));
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !json?.user) {
          setViewer(null);
        } else {
          setViewer(json.user as User);
        }
      } catch {
        if (!cancelled) setViewer(null);
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadReports = useCallback(async () => {
    const res = await authenticatedFetch(apiUrl('/api/reports'));
    if (!res.ok) throw new Error('Failed to load reports');
    const data = (await res.json()) as Report[];
    setReports(Array.isArray(data) ? data : []);
  }, []);

  const loadBans = useCallback(async () => {
    const res = await fetch(apiUrl('/api/bans'));
    if (!res.ok) throw new Error('Failed to load bans');
    const data = (await res.json()) as Ban[];
    setBans(Array.isArray(data) ? data : []);
  }, []);

  const loadAudit = useCallback(async () => {
    const res = await authenticatedFetch(apiUrl('/api/moderation/audit?limit=250'));
    if (!res.ok) throw new Error('Failed to load audit');
    const data = (await res.json()) as AuditLogEntry[];
    setAudit(Array.isArray(data) ? data : []);
  }, []);

  const loadFlags = useCallback(async () => {
    const bt = getBackendToken();
    if (!bt || !canPgAdmin) return;
    const res = await fetch(backendV1Url('/admin/abuse-flags'), {
      headers: { Authorization: `Bearer ${bt}` },
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.data?.flags) return;
    setFlags(json.data.flags);
  }, [canPgAdmin]);

  const loadPgOverview = useCallback(async () => {
    const bt = getBackendToken();
    if (!bt || !viewer || !isAdminActor(viewer.role)) return;
    const res = await fetch(backendV1Url('/admin/overview'), {
      headers: { Authorization: `Bearer ${bt}` },
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.data) setPgOverview(json.data as PostgresOverview);
  }, [viewer]);

  const loadPgUsers = useCallback(async () => {
    const bt = getBackendToken();
    if (!bt || !viewer || !isAdminActor(viewer.role)) return;
    const params = new URLSearchParams();
    if (userSearch.trim()) params.set('q', userSearch.trim());
    if (userRoleFilter) params.set('role', userRoleFilter);
    params.set('take', '50');
    const res = await fetch(`${backendV1Url('/admin/users')}?${params}`, {
      headers: { Authorization: `Bearer ${bt}` },
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.data) {
      setPgUsers(json.data.users as PostgresAdminUser[]);
      setPgTotal(json.data.total as number);
    }
  }, [viewer, userSearch, userRoleFilter]);

  useEffect(() => {
    if (!authChecked || !viewer || !canMod) return;
    void (async () => {
      setBusy('load');
      setError(null);
      try {
        await Promise.all([loadReports(), loadBans(), loadAudit()]);
        if (canPgAdmin) {
          await Promise.all([loadPgOverview(), loadFlags(), loadPgUsers()]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Load failed');
      } finally {
        setBusy(null);
      }
    })();
  }, [authChecked, viewer, canMod, canPgAdmin, loadReports, loadBans, loadAudit, loadPgOverview, loadFlags, loadPgUsers]);

  useEffect(() => {
    if (!canPgAdmin || tab !== 'users') return;
    const t = window.setTimeout(() => void loadPgUsers(), 320);
    return () => window.clearTimeout(t);
  }, [canPgAdmin, tab, userSearch, userRoleFilter, loadPgUsers]);

  useEffect(() => {
    if (!canPgAdmin) return;
    if (tab === 'analytics' || tab === 'overview') void loadPgOverview();
  }, [canPgAdmin, tab, loadPgOverview]);

  useEffect(() => {
    if (tab === 'flags' && canPgAdmin) void loadFlags();
  }, [tab, canPgAdmin, loadFlags]);

  const filteredReports = useMemo(() => {
    let r = reports;
    if (reportStatus !== 'all') {
      r = r.filter((x) => (x.status || '').toLowerCase() === reportStatus.toLowerCase());
    }
    const q = reportSearch.trim().toLowerCase();
    if (!q) return r;
    return r.filter(
      (x) =>
        (x.targetUsername || '').toLowerCase().includes(q) ||
        (x.reporterUsername || '').toLowerCase().includes(q) ||
        (x.reason || '').toLowerCase().includes(q)
    );
  }, [reports, reportSearch, reportStatus]);

  const filteredBans = useMemo(() => {
    const q = banSearch.trim().toLowerCase();
    if (!q) return bans;
    return bans.filter((b) => (b.username || '').toLowerCase().includes(q));
  }, [bans, banSearch]);

  const resolveReport = async (id: string, status: string) => {
    if (!viewer) return;
    setBusy(`report-${id}`);
    try {
      const res = await authenticatedFetch(apiUrl('/api/reports'), {
        method: 'PUT',
        body: JSON.stringify({
          id,
          status,
          reviewedBy: viewer.username,
          adminNotes: '',
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      await loadReports();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(null);
    }
  };

  const submitBan = async () => {
    const username = banUserField[0].trim();
    if (!username || !viewer) return;
    setBusy('ban');
    setError(null);
    try {
      const expiresAt = banPermanentField[0]
        ? undefined
        : Date.now() + (Number(banDaysField[0]) || 7) * 86400000;
      const body: Ban = {
        username,
        reason: banReasonField[0].trim() || 'moderation',
        bannedBy: viewer.username,
        timestamp: Date.now(),
        expiresAt,
        permanent: banPermanentField[0],
      };
      const res = await fetch(apiUrl('/api/bans'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Ban failed');
      banUserField[1]('');
      banReasonField[1]('');
      await loadBans();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ban failed');
    } finally {
      setBusy(null);
    }
  };

  const unban = async (username: string) => {
    setBusy('unban');
    try {
      const res = await fetch(`${apiUrl('/api/bans')}?username=${encodeURIComponent(username)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Unban failed');
      await loadBans();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unban failed');
    } finally {
      setBusy(null);
    }
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-300">
        Checking access…
      </div>
    );
  }

  if (!viewer || !canMod) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center text-zinc-300">
        <p className="text-lg font-medium text-white">Moderator sign-in required</p>
        <p className="max-w-md text-sm text-zinc-400">
          Open the game, log in as a moderator or admin, then return here. Your session token must be in{' '}
          <code className="rounded bg-zinc-800 px-1">localStorage</code>.
        </p>
        <Link href="/games" className="text-sky-400 underline">
          Back to Pixel Place
        </Link>
      </div>
    );
  }

  const navItems: { id: TabId; label: string; adminOnly?: boolean }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'reports', label: 'Reports' },
    { id: 'bans', label: 'Bans' },
    { id: 'logs', label: 'Audit log' },
    { id: 'flags', label: 'Abuse flags', adminOnly: true },
    { id: 'analytics', label: 'Analytics', adminOnly: true },
    { id: 'users', label: 'DB users', adminOnly: true },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-200">
      <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/80">
        <div className="border-b border-zinc-800 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Pixel Place</p>
          <p className="text-sm font-semibold text-white">Admin</p>
          <p className="mt-1 truncate text-xs text-zinc-500">{viewer.username}</p>
          <p className="text-xs text-amber-400/90">{viewer.role}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {navItems.map((item) => {
            if (item.adminOnly && !canPgAdmin) return null;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  'rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  tab === item.id
                    ? 'bg-zinc-800 font-medium text-white'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-zinc-800 p-3">
          <Link href="/games" className="text-xs text-sky-400 hover:underline">
            ← Game
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-6 py-4 backdrop-blur">
          <h1 className="text-lg font-semibold text-white">
            {navItems.find((n) => n.id === tab)?.label ?? tab}
          </h1>
          {busy ? <span className="text-xs text-zinc-500">{busy}</span> : null}
        </header>

        <div className="p-6">
          {error ? (
            <div className="mb-4 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Kpi title="Open reports" value={String(reports.filter((r) => r.status === 'pending').length)} hint="Firestore queue" />
                <Kpi title="Active bans" value={String(bans.length)} hint="Non-expired" />
                <Kpi title="Audit entries (loaded)" value={String(audit.length)} hint="Latest batch" />
                <Kpi
                  title="Backend"
                  value={canPgAdmin ? 'Connected' : 'N/A'}
                  hint={canPgAdmin ? 'Postgres metrics enabled' : 'Need admin + backend token'}
                />
              </div>

              {pgOverview && (
                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    PostgreSQL (live)
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Kpi title="Total users" value={String(pgOverview.totalUsers)} />
                    <Kpi title="DAU (today UTC)" value={String(pgOverview.dauToday)} hint="lastActiveDate = today" />
                    <Kpi title="WAU (rolling)" value={String(pgOverview.wauRolling7d)} hint="Last active ≥ 7d window" />
                    <Kpi title="Signups (7d)" value={String(pgOverview.signupsLast7Days)} />
                    <Kpi
                      title="Retention (approx)"
                      value={pgOverview.retention14dApprox != null ? `${Math.round(pgOverview.retention14dApprox * 100)}%` : '—'}
                      hint="Accounts 14d+ old active recently"
                    />
                    <Kpi title="Pixels (lifetime)" value={String(pgOverview.pixelsPlacedLifetime)} />
                    <Kpi title="Season pixels" value={String(pgOverview.seasonPixelsPlaced)} hint={pgOverview.activeSeason?.name ?? ''} />
                    <Kpi title="Unresolved flags" value={String(pgOverview.abuseFlagsUnresolved)} />
                  </div>
                </div>
              )}

              {!canPgAdmin && (
                <p className="text-sm text-zinc-500">
                  Sign in with a database-linked <strong className="text-zinc-400">admin</strong> account and ensure{' '}
                  <code className="rounded bg-zinc-800 px-1">NEXT_PUBLIC_BACKEND_URL</code> + backend session for Postgres
                  analytics and user tables.
                </p>
              )}
            </div>
          )}

          {tab === 'reports' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <input
                  type="search"
                  placeholder="Search target / reporter / reason…"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  className="min-w-[200px] flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-sky-600 focus:outline-none"
                />
                <select
                  value={reportStatus}
                  onChange={(e) => setReportStatus(e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">pending</option>
                  <option value="reviewed">reviewed</option>
                  <option value="dismissed">dismissed</option>
                </select>
                <button
                  type="button"
                  onClick={() => void loadReports()}
                  className="rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800"
                >
                  Refresh
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="border-b border-zinc-800 bg-zinc-900/50 text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Target</th>
                      <th className="px-3 py-2">Reporter</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Reason</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredReports.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-900/40">
                        <td className="px-3 py-2 text-xs">{r.status}</td>
                        <td className="px-3 py-2 font-medium text-white">{r.targetUsername || r.reportedUsername}</td>
                        <td className="px-3 py-2">{r.reporterUsername}</td>
                        <td className="px-3 py-2 text-zinc-400">{r.reportType ?? '—'}</td>
                        <td className="max-w-xs truncate px-3 py-2 text-zinc-400">{r.reason}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              className="rounded bg-emerald-900/50 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-900"
                              disabled={busy !== null}
                              onClick={() => void resolveReport(r.id, 'reviewed')}
                            >
              Reviewed
                            </button>
                            <button
                              type="button"
                              className="rounded bg-zinc-700 px-2 py-1 text-xs hover:bg-zinc-600"
                              disabled={busy !== null}
                              onClick={() => void resolveReport(r.id, 'dismissed')}
                            >
              Dismiss
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-zinc-500">{filteredReports.length} rows</p>
            </div>
          )}

          {tab === 'bans' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                <h3 className="mb-3 text-sm font-semibold text-white">Issue ban</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <input
                    placeholder="Username"
                    value={banUserField[0]}
                    onChange={(e) => banUserField[1](e.target.value)}
                    className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Reason"
                    value={banReasonField[0]}
                    onChange={(e) => banReasonField[1](e.target.value)}
                    className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={banPermanentField[0]}
                      onChange={(e) => banPermanentField[1](e.target.checked)}
                    />
                    Permanent
                  </label>
                  {!banPermanentField[0] ? (
                    <input
                      type="number"
                      min={1}
                      placeholder="Days"
                      value={banDaysField[0]}
                      onChange={(e) => banDaysField[1](Number(e.target.value))}
                      className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                    />
                  ) : (
                    <span />
                  )}
                </div>
                <button
                  type="button"
                  className="mt-3 rounded-lg bg-red-900/60 px-4 py-2 text-sm font-medium text-red-100 hover:bg-red-900"
                  disabled={busy !== null}
                  onClick={() => void submitBan()}
                >
                  Ban user
                </button>
              </div>

              <input
                type="search"
                placeholder="Filter banned users…"
                value={banSearch}
                onChange={(e) => setBanSearch(e.target.value)}
                className="mb-2 w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
              />

              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-zinc-800 bg-zinc-900/50 text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-3 py-2">User</th>
                      <th className="px-3 py-2">Reason</th>
                      <th className="px-3 py-2">By</th>
                      <th className="px-3 py-2">Expires</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredBans.map((b) => (
                      <tr key={b.username}>
                        <td className="px-3 py-2 font-medium text-white">{b.username}</td>
                        <td className="max-w-xs truncate px-3 py-2 text-zinc-400">{b.reason}</td>
                        <td className="px-3 py-2 text-zinc-500">{b.bannedBy}</td>
                        <td className="px-3 py-2 text-xs text-zinc-500">
                          {b.permanent ? 'Permanent' : b.expiresAt ? new Date(b.expiresAt).toLocaleString() : '—'}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            className="text-xs text-sky-400 hover:underline"
                            onClick={() => void unban(b.username)}
                          >
                            Unban
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'logs' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => void loadAudit()}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900"
              >
                Refresh audit log
              </button>
              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-zinc-800 bg-zinc-900/50 text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-3 py-2">When</th>
                      <th className="px-3 py-2">Actor</th>
                      <th className="px-3 py-2">Action</th>
                      <th className="px-3 py-2">Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {audit.map((a) => (
                      <tr key={a.id}>
                        <td className="whitespace-nowrap px-3 py-2 text-xs text-zinc-500">
                          {new Date(a.timestamp).toLocaleString()}
                        </td>
                        <td className="px-3 py-2">{a.actorUsername}</td>
                        <td className="px-3 py-2">{a.action}</td>
                        <td className="max-w-md truncate px-3 py-2 text-zinc-400">
                          {a.targetType} / {a.targetId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'flags' && canPgAdmin && (
            <div className="space-y-4">
              <button type="button" className="rounded-lg border border-zinc-700 px-3 py-2 text-sm" onClick={() => void loadFlags()}>
                Refresh flags
              </button>
              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-zinc-800 bg-zinc-900/50 text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-3 py-2">Created</th>
                      <th className="px-3 py-2">User</th>
                      <th className="px-3 py-2">Reason</th>
                      <th className="px-3 py-2">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {flags.map((f) => (
                      <tr key={f.id}>
                        <td className="whitespace-nowrap px-3 py-2 text-xs">{new Date(f.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2">
                          <span className="font-medium text-white">{f.username}</span>
                          <span className="ml-2 text-xs text-zinc-600">{f.userId.slice(0, 8)}…</span>
                        </td>
                        <td className="px-3 py-2">{f.reason}</td>
                        <td className="px-3 py-2">{f.scoreSnapshot}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'analytics' && canPgAdmin && (
            <div className="prose prose-invert max-w-none space-y-4 text-sm">
              {!pgOverview ? (
                <p className="text-zinc-500">No analytics loaded yet — check backend URL and admin token, then open Overview first.</p>
              ) : (
                <>
                  <p className="text-zinc-400">
                    <strong className="text-white">DAU</strong> counts users whose engagement{' '}
                    <code className="rounded bg-zinc-800 px-1">lastActiveDate</code> equals today (UTC).{' '}
                    <strong className="text-white">WAU</strong> uses the same date field within the last seven calendar days — a
                    lightweight proxy, not session analytics. <strong className="text-white">Retention</strong> compares accounts
                    older than 14 days against recent activity.
                  </p>
                  <p className="text-zinc-400">
                    <strong className="text-white">Pixel activity</strong> sums{' '}
                    <code className="rounded bg-zinc-800 px-1">pixel_stats</code> for lifetime totals and the active season aggregate for
                    seasonal throughput.
                  </p>
                </>
              )}
            </div>
          )}

          {tab === 'users' && canPgAdmin && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <input
                  type="search"
                  placeholder="Search username / email…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="min-w-[200px] flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
                >
                  <option value="">All roles</option>
                  <option value="user">user</option>
                  <option value="mod">mod</option>
                  <option value="admin">admin</option>
                  <option value="head_admin">head_admin</option>
                </select>
                <button type="button" className="rounded-lg border border-zinc-700 px-3 py-2 text-sm" onClick={() => void loadPgUsers()}>
                  Refresh
                </button>
              </div>
              <p className="text-xs text-zinc-500">{pgTotal} matching users</p>
              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full min-w-[960px] text-left text-sm">
                  <thead className="border-b border-zinc-800 bg-zinc-900/50 text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-3 py-2">Username</th>
                      <th className="px-3 py-2">Role</th>
                      <th className="px-3 py-2">Last active</th>
                      <th className="px-3 py-2">Pixels</th>
                      <th className="px-3 py-2">Abuse score</th>
                      <th className="px-3 py-2">Lock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {pgUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="px-3 py-2 font-medium text-white">{u.username}</td>
                        <td className="px-3 py-2">{u.role}</td>
                        <td className="px-3 py-2 text-xs text-zinc-400">{u.lastActiveDate ?? '—'}</td>
                        <td className="px-3 py-2">{u.pixelsPlaced}</td>
                        <td className="px-3 py-2">{Math.round(u.abuseSuspicionScore)}</td>
                        <td className="px-3 py-2">{u.placementLocked ? 'yes' : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Kpi({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-600">{hint}</p> : null}
    </div>
  );
}
