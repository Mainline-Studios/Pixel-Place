'use client';

import { useCallback, useEffect, useState } from 'react';
import { User } from '@/types';
import { apiUrl } from '@/lib/apiBaseUrl';
import { authenticatedFetch, authErrorMessage, hasUsableAuthToken } from '@/lib/api';
import {
  USERBOARD_TIERS,
  userBoardEntry,
  USERBOARD_HALL_OF_FAME_MAX,
  USERBOARD_DANGEROUS_MIN,
  USERBOARD_REPORT_BUMP,
  clampUserBoardScore,
  type UserBoardEntry,
} from '@/lib/userBoard';

interface UserBoardPayload {
  hallOfFame: Array<{ username: string; safetyScore: number; reportCount: number }>;
  potentiallyDangerous: Array<{ username: string; safetyScore: number; reportCount: number }>;
  allUsers: Array<{ username: string; safetyScore: number; reportCount: number }>;
  yourScore: number;
  yourReportCount: number;
}

interface UserBoardPanelProps {
  user: User;
}

const TONE_COLORS: Record<UserBoardEntry['tone'], string> = {
  hero: '#86efac',
  good: '#a7f3d0',
  neutral: 'var(--text-dim)',
  watch: '#fde68a',
  danger: '#fdba74',
  critical: '#fca5a5',
};

function ScoreRow({ entry }: { entry: UserBoardEntry }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        padding: '8px 10px',
        borderRadius: 8,
        background: 'var(--panel-soft)',
        border: '1px solid var(--border)',
      }}
    >
      <div>
        <strong>{entry.username}</strong>
        <div style={{ fontSize: 12, color: TONE_COLORS[entry.tone], marginTop: 2 }}>{entry.label}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 700, color: TONE_COLORS[entry.tone] }}>{entry.safetyScore}</div>
        {entry.reportCount > 0 ? (
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{entry.reportCount} report(s)</div>
        ) : null}
      </div>
    </div>
  );
}

export default function UserBoardPanel({ user }: UserBoardPanelProps) {
  const [data, setData] = useState<UserBoardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminScore, setAdminScore] = useState('0');
  const [adminNote, setAdminNote] = useState('');
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminMsg, setAdminMsg] = useState('');

  const isAdmin = user.role === 'admin' || user.role === 'head_admin';

  const loadBoard = useCallback(async () => {
    if (!hasUsableAuthToken()) {
      setError('Sign in to view the UserBoard.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authenticatedFetch(apiUrl('/api/userboard'), { cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(authErrorMessage(res.status, json));
      setData(json as UserBoardPayload);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load UserBoard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  const adjustScore = async () => {
    const target = adminUsername.trim();
    if (!target) {
      setAdminMsg('Enter a username.');
      return;
    }
    const score = clampUserBoardScore(Number(adminScore));
    setAdminBusy(true);
    setAdminMsg('');
    try {
      const res = await authenticatedFetch(apiUrl('/api/userboard'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: target, safetyScore: score, note: adminNote.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(authErrorMessage(res.status, json));
      setAdminMsg(`Updated ${target} to ${score}.`);
      setAdminUsername('');
      setAdminNote('');
      await loadBoard();
    } catch (e: unknown) {
      setAdminMsg(e instanceof Error ? e.message : 'Failed to update score');
    } finally {
      setAdminBusy(false);
    }
  };

  const yourEntry = userBoardEntry(user.username, data?.yourScore ?? 0, data?.yourReportCount ?? 0);

  return (
    <div className="ai-box" style={{ marginBottom: 16 }}>
      <div className="ai-label">UserBoard — community safety scores</div>
      <div className="ai-output" style={{ fontSize: 14, lineHeight: 1.65 }}>
        <p style={{ marginTop: 0 }}>
          Every account has a <strong>Safety Score</strong> from <strong>−100</strong> (most trusted) to{' '}
          <strong>+100</strong> (highest risk). Scores are not coins — they reflect how the community and
          moderators see someone&apos;s impact on safety.
        </p>
        <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          <li>
            <strong>Negative scores</strong> — helpful, trusted players (Hall of Fame at{' '}
            <strong>{USERBOARD_HALL_OF_FAME_MAX} or lower</strong>).
          </li>
          <li>
            <strong>0</strong> — a normal user with no notable record.
          </li>
          <li>
            <strong>Positive scores</strong> — concern from reports;{' '}
            <strong>{USERBOARD_DANGEROUS_MIN}+</strong> appears under Potentially Dangerous Users.
          </li>
          <li>
            Each verified report filed against someone raises their score by{' '}
            <strong>+{USERBOARD_REPORT_BUMP}</strong> (capped at +100). False reports can affect your own
            account — only report real issues.
          </li>
        </ul>

        <details style={{ marginBottom: 12 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Score guide (−100 to +100)</summary>
          <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
            {USERBOARD_TIERS.map((t) => (
              <li key={`${t.min}-${t.max}`}>
                <strong>
                  {t.min === t.max ? t.min : `${t.min} … ${t.max}`}
                </strong>
                {' — '}
                {t.description}
              </li>
            ))}
          </ul>
        </details>

        {!loading && data ? (
          <div
            style={{
              marginBottom: 12,
              padding: 10,
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--panel-soft)',
            }}
          >
            Your score:{' '}
            <strong style={{ color: TONE_COLORS[yourEntry.tone] }}>{yourEntry.safetyScore}</strong> —{' '}
            {yourEntry.label}
          </div>
        ) : null}

        {loading ? <div style={{ color: 'var(--text-dim)' }}>Loading UserBoard…</div> : null}
        {error ? <div style={{ color: '#fca5a5' }}>{error}</div> : null}

        {!loading && data ? (
          <>
            <h3 style={{ fontSize: 15, margin: '16px 0 8px' }}>Hall of Fame (score ≤ {USERBOARD_HALL_OF_FAME_MAX})</h3>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--text-dim)' }}>
              Players who have gone above and beyond to keep Pixel Place safe.
            </p>
            {data.hallOfFame.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {data.hallOfFame.map((row) => (
                  <ScoreRow key={row.username} entry={userBoardEntry(row.username, row.safetyScore, row.reportCount)} />
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>No Hall of Fame entries yet.</p>
            )}

            <h3 style={{ fontSize: 15, margin: '0 0 8px' }}>Potentially Dangerous Users (score ≥ {USERBOARD_DANGEROUS_MIN})</h3>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--text-dim)' }}>
              Accounts with elevated scores — often from reports. Moderators may investigate.
            </p>
            {data.potentiallyDangerous.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {data.potentiallyDangerous.map((row) => (
                  <ScoreRow key={row.username} entry={userBoardEntry(row.username, row.safetyScore, row.reportCount)} />
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
                No users on the watch list right now.
              </p>
            )}

            <h3 style={{ fontSize: 15, margin: '0 0 8px' }}>All tracked users</h3>
            {data.allUsers.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
                {data.allUsers.map((row) => (
                  <ScoreRow key={`all-${row.username}`} entry={userBoardEntry(row.username, row.safetyScore, row.reportCount)} />
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>No scores recorded yet — reports will populate this board.</p>
            )}
          </>
        ) : null}

        {isAdmin ? (
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Admin: adjust safety score</div>
            <input
              type="text"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              placeholder="Username"
              style={{
                width: '100%',
                padding: '8px 10px',
                marginBottom: 8,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--panel-soft)',
                color: 'var(--text)',
              }}
            />
            <input
              type="number"
              min={-100}
              max={100}
              value={adminScore}
              onChange={(e) => setAdminScore(e.target.value)}
              placeholder="Score −100 … 100"
              style={{
                width: '100%',
                padding: '8px 10px',
                marginBottom: 8,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--panel-soft)',
                color: 'var(--text)',
              }}
            />
            <input
              type="text"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Optional note (internal)"
              style={{
                width: '100%',
                padding: '8px 10px',
                marginBottom: 8,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--panel-soft)',
                color: 'var(--text)',
              }}
            />
            <button type="button" className="btn" onClick={() => void adjustScore()} disabled={adminBusy}>
              {adminBusy ? 'Saving…' : 'Save score'}
            </button>
            {adminMsg ? <div style={{ marginTop: 8, color: adminMsg.startsWith('Updated') ? '#86efac' : '#fca5a5' }}>{adminMsg}</div> : null}
          </div>
        ) : null}

        <button type="button" className="btn" style={{ marginTop: 12 }} onClick={() => void loadBoard()} disabled={loading}>
          Refresh UserBoard
        </button>
      </div>
    </div>
  );
}
