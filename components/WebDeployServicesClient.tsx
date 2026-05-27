'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { apiUrl } from '@/lib/apiBaseUrl';
import { authenticatedFetch, authErrorMessage, hasUsableAuthToken } from '@/lib/api';
import {
  validatePredomain,
  predomainToLiveUrl,
  WEB_DEPLOY_BASE_HOST,
  type WebDeployRequest,
  type WebDeploySourceType,
} from '@/lib/webDeploy';

export default function WebDeployServicesClient() {
  const { user } = useUser();
  const [predomain, setPredomain] = useState('');
  const [projectName, setProjectName] = useState('');
  const [sourceType, setSourceType] = useState<WebDeploySourceType>('git');
  const [gitUrl, setGitUrl] = useState('');
  const [filesDescription, setFilesDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [availability, setAvailability] = useState<'unknown' | 'yes' | 'no'>('unknown');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [requests, setRequests] = useState<WebDeployRequest[]>([]);

  const loadMine = useCallback(async () => {
    if (!hasUsableAuthToken()) return;
    const res = await authenticatedFetch(apiUrl('/api/web-deploy'), { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (res.ok && Array.isArray(data.requests)) setRequests(data.requests);
  }, []);

  useEffect(() => {
    void loadMine();
  }, [loadMine, user?.username]);

  const checkAvailability = async () => {
    const parsed = validatePredomain(predomain);
    if (!parsed.ok) {
      setAvailability('no');
      setMsg(parsed.error);
      return;
    }
    setMsg('');
    const res = await fetch(apiUrl(`/api/web-deploy/check?predomain=${encodeURIComponent(parsed.value)}`));
    const data = await res.json().catch(() => ({}));
    setAvailability(data.available ? 'yes' : 'no');
    if (!data.available) setMsg(data.error || 'That subdomain is taken or reserved.');
  };

  const submit = async () => {
    if (!user || !hasUsableAuthToken()) {
      setMsg('Sign in to Pixel Place to request a deploy.');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const res = await authenticatedFetch(apiUrl('/api/web-deploy'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predomain,
          projectName,
          sourceType,
          gitUrl: sourceType === 'git' ? gitUrl : undefined,
          filesDescription: sourceType === 'files' ? filesDescription : undefined,
          contactEmail,
          notes,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(authErrorMessage(res.status, data));
      setMsg('Request submitted. A moderator will review it — not part of Pixel Place games or accounts.');
      setPredomain('');
      setProjectName('');
      setGitUrl('');
      setFilesDescription('');
      setNotes('');
      setAvailability('unknown');
      await loadMine();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Submit failed');
    } finally {
      setBusy(false);
    }
  };

  const parsedPredomain = validatePredomain(predomain);
  const preview = parsedPredomain.ok ? predomainToLiveUrl(parsedPredomain.value) : null;

  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '32px 20px 64px',
        color: 'var(--text-main, #e8e8ef)',
        lineHeight: 1.6,
      }}
    >
      <p style={{ margin: '0 0 8px', fontSize: 11, opacity: 0.55, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Separate service · Not Pixel Place
      </p>
      <h1 style={{ margin: '0 0 12px', fontSize: '1.65rem' }}>Pixel Place Web Deploy Services</h1>
      <p style={{ margin: '0 0 20px', opacity: 0.88, fontSize: 15 }}>
        Host your own static site on an unoccupied <strong>*.${WEB_DEPLOY_BASE_HOST}</strong> subdomain. Submit a public Git
        repo (GitHub, GitLab, Bitbucket, Codeberg) or describe files you will send to moderators. Every request must be
        accepted by a mod before anything goes live.
      </p>
      <p style={{ margin: '0 0 24px', fontSize: 13, opacity: 0.7 }}>
        <Link href="/" style={{ color: 'var(--accent, #7dd3fc)' }}>
          ← Back to Pixel Place
        </Link>
      </p>

      {!user ? (
        <div className="ai-box" style={{ marginBottom: 24 }}>
          <div className="ai-output">Sign in on Pixel Place, then return here to request a deploy.</div>
        </div>
      ) : (
        <div className="ai-box" style={{ marginBottom: 24 }}>
          <div className="ai-label">New deploy request</div>
          <div className="ai-output" style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Project name</span>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8 }}
              />
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                Subdomain (predomain)
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="text"
                  value={predomain}
                  onChange={(e) => {
                    setPredomain(e.target.value);
                    setAvailability('unknown');
                  }}
                  placeholder="yourapp"
                  style={{ flex: '1 1 140px', padding: '10px 12px', borderRadius: 8 }}
                />
                <span style={{ fontSize: 13, opacity: 0.8 }}>.{WEB_DEPLOY_BASE_HOST}</span>
                <button type="button" className="btn" onClick={() => void checkAvailability()}>
                  Check
                </button>
              </div>
              {preview ? (
                <span style={{ fontSize: 12, opacity: 0.75, display: 'block', marginTop: 6 }}>
                  Preview: {preview}
                  {availability === 'yes' ? ' · available' : availability === 'no' ? ' · unavailable' : ''}
                </span>
              ) : null}
            </label>
            <div>
              <span style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>Source</span>
              <label style={{ marginRight: 14 }}>
                <input
                  type="radio"
                  checked={sourceType === 'git'}
                  onChange={() => setSourceType('git')}
                />{' '}
                Git repository
              </label>
              <label>
                <input
                  type="radio"
                  checked={sourceType === 'files'}
                  onChange={() => setSourceType('files')}
                />{' '}
                Other files (mod coordination)
              </label>
            </div>
            {sourceType === 'git' ? (
              <label style={{ display: 'block' }}>
                <span style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Repository URL</span>
                <input
                  type="url"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  placeholder="https://github.com/you/your-repo"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8 }}
                />
              </label>
            ) : (
              <label style={{ display: 'block' }}>
                <span style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                  Files / archive (describe what you will send)
                </span>
                <textarea
                  value={filesDescription}
                  onChange={(e) => setFilesDescription(e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8 }}
                />
              </label>
            )}
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Contact email (optional)</span>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8 }}
              />
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Notes for moderators</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8 }}
              />
            </label>
            <button type="button" className="btn auth-btn" disabled={busy} onClick={() => void submit()}>
              {busy ? 'Submitting…' : 'Submit for mod review'}
            </button>
            {msg ? <p style={{ margin: 0, fontSize: 13, color: msg.includes('submitted') ? '#86efac' : '#fca5a5' }}>{msg}</p> : null}
          </div>
        </div>
      )}

      {requests.length > 0 ? (
        <section>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Your requests</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            {requests.map((r) => (
              <li
                key={r.id}
                style={{
                  padding: 14,
                  borderRadius: 10,
                  border: '1px solid var(--border, #32394e)',
                  background: 'var(--panel-soft, rgba(255,255,255,0.04))',
                }}
              >
                <strong>{r.projectName}</strong> — <code>{r.predomain}</code>.{WEB_DEPLOY_BASE_HOST}
                <br />
                <span style={{ fontSize: 13, opacity: 0.85 }}>
                  Status: <strong>{r.status}</strong>
                  {r.liveUrl ? (
                    <>
                      {' '}
                      ·{' '}
                      <a href={r.liveUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                        {r.liveUrl}
                      </a>
                    </>
                  ) : null}
                </span>
                {r.adminNotes ? (
                  <p style={{ margin: '8px 0 0', fontSize: 12, opacity: 0.75 }}>Mod: {r.adminNotes}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
