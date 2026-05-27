'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiUrl } from '@/lib/apiBaseUrl';
import { authenticatedFetch, authErrorMessage } from '@/lib/api';
import type { WebDeployRequest } from '@/lib/webDeploy';
import { WEB_DEPLOY_BASE_HOST } from '@/lib/webDeploy';

export default function AdminPanelWebDeploy() {
  const [requests, setRequests] = useState<WebDeployRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch(apiUrl('/api/web-deploy?all=1'), { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(authErrorMessage(res.status, data));
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (id: string, action: 'approve' | 'reject' | 'mark_live') => {
    setBusyId(id);
    try {
      const res = await authenticatedFetch(apiUrl('/api/web-deploy'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, adminNotes: notes[id] ?? '' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(authErrorMessage(res.status, data));
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const pending = requests.filter((r) => r.status === 'pending');

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Web Deploy Services</h3>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.55 }}>
        Third-party static hosting on *.{WEB_DEPLOY_BASE_HOST} — not part of Pixel Place games. Approve reserves the
        subdomain; mark live after you configure Firebase Hosting / DNS for that site.
      </p>
      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Loading…</p>
      ) : pending.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No pending deploy requests.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {pending.map((r) => (
            <div
              key={r.id}
              style={{
                padding: 14,
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--panel-soft)',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                {r.projectName} — <code>{r.predomain}</code>.{WEB_DEPLOY_BASE_HOST}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>
                By {r.requestedBy} · {r.sourceType === 'git' ? 'Git' : 'Files'}
                {r.gitUrl ? (
                  <>
                    <br />
                    <a href={r.gitUrl} target="_blank" rel="noopener noreferrer">
                      {r.gitUrl}
                    </a>
                  </>
                ) : null}
                {r.filesDescription ? (
                  <>
                    <br />
                    Files: {r.filesDescription}
                  </>
                ) : null}
                {r.notes ? (
                  <>
                    <br />
                    Notes: {r.notes}
                  </>
                ) : null}
              </div>
              <textarea
                placeholder="Mod notes (optional)"
                value={notes[r.id] ?? ''}
                onChange={(e) => setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                rows={2}
                style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 8 }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button type="button" className="btn" disabled={busyId === r.id} onClick={() => void act(r.id, 'approve')}>
                  Approve subdomain
                </button>
                <button type="button" className="btn" disabled={busyId === r.id} onClick={() => void act(r.id, 'reject')}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {requests.filter((r) => r.status === 'approved').length > 0 ? (
        <div style={{ marginTop: 16 }}>
          <h4 style={{ fontSize: 14, marginBottom: 8 }}>Approved (configure hosting, then mark live)</h4>
          {requests
            .filter((r) => r.status === 'approved')
            .map((r) => (
              <div key={r.id} style={{ marginBottom: 10, fontSize: 13 }}>
                <code>{r.predomain}</code> — {r.liveUrl ?? '—'}
                <button
                  type="button"
                  className="btn"
                  style={{ marginLeft: 8, fontSize: 12, padding: '4px 10px' }}
                  disabled={busyId === r.id}
                  onClick={() => void act(r.id, 'mark_live')}
                >
                  Mark live
                </button>
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
}
