'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useWebDeployAuth } from '@/contexts/WebDeployAuthContext';
import { apiUrl } from '@/lib/apiBaseUrl';
import { webDeployAuthenticatedFetch } from '@/lib/webDeployAuthApi';
import { getWebDeployAuthToken } from '@/lib/webDeployAuth';
import WebDeployDnsPanel from '@/components/WebDeployDnsPanel';
import WebDeployFileImport from '@/components/WebDeployFileImport';
import WebDeployGitRepoInput from '@/components/WebDeployGitRepoInput';
import {
  validatePredomain,
  predomainToLiveUrl,
  WEB_DEPLOY_BASE_HOST,
  webDeploySourceLabel,
  type WebDeployDnsRecord,
  type WebDeployRequest,
  type WebDeploySourceType,
  type WebDeployUploadedFileMeta,
} from '@/lib/webDeploy';
import type { ParsedGitRepo } from '@/lib/webDeployGit';

export default function WebDeployServicesClient() {
  const { session, loading: authLoading, signInWithGoogle, signOut } = useWebDeployAuth();
  const [predomain, setPredomain] = useState('');
  const [projectName, setProjectName] = useState('');
  const [sourceType, setSourceType] = useState<WebDeploySourceType>('git');
  const [gitUrl, setGitUrl] = useState('');
  const [filesDescription, setFilesDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<WebDeployUploadedFileMeta[]>([]);
  const [parsedRepo, setParsedRepo] = useState<ParsedGitRepo | null>(null);
  const [lastDns, setLastDns] = useState<{
    predomain: string;
    records: WebDeployDnsRecord[];
    previewUrl?: string;
    livePreviewUrl?: string;
    message?: string;
  } | null>(null);
  const [codeRequestBrief, setCodeRequestBrief] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [availability, setAvailability] = useState<'unknown' | 'yes' | 'no'>('unknown');
  const [busy, setBusy] = useState(false);
  const [signInBusy, setSignInBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [requests, setRequests] = useState<WebDeployRequest[]>([]);

  useEffect(() => {
    if (session?.email && !contactEmail) setContactEmail(session.email);
  }, [session?.email, contactEmail]);

  useEffect(() => {
    if (parsedRepo && !projectName.trim()) setProjectName(parsedRepo.repo);
  }, [parsedRepo, projectName]);

  const loadMine = useCallback(async () => {
    if (!getWebDeployAuthToken()) return;
    const res = await webDeployAuthenticatedFetch(apiUrl('/api/web-deploy'), { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (res.ok && Array.isArray(data.requests)) setRequests(data.requests);
  }, []);

  useEffect(() => {
    if (session) void loadMine();
    else setRequests([]);
  }, [session, loadMine]);

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

  const handleGoogleSignIn = async () => {
    setSignInBusy(true);
    setMsg('');
    try {
      await signInWithGoogle();
      setMsg('');
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Google sign-in failed');
    } finally {
      setSignInBusy(false);
    }
  };

  const submit = async () => {
    if (!session) {
      setMsg('Sign in with Google to request a deploy (Web Deploy account only — not Pixel Place).');
      return;
    }
    if (sourceType === 'git' && !parsedRepo) {
      setMsg('Enter a valid public GitHub, GitLab, Bitbucket, or Codeberg repository URL.');
      return;
    }
    if (sourceType === 'files' && uploadedFiles.length === 0 && !filesDescription.trim()) {
      setMsg('Import at least one file or add notes for moderators.');
      return;
    }
    if (sourceType === 'coded' && codeRequestBrief.trim().length < 24) {
      setMsg('Describe what you want us to build (a few sentences at minimum).');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const res = await webDeployAuthenticatedFetch(apiUrl('/api/web-deploy'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predomain,
          projectName,
          sourceType,
          gitUrl: sourceType === 'git' ? (parsedRepo?.normalizedUrl ?? gitUrl) : undefined,
          gitProvider: sourceType === 'git' ? parsedRepo?.provider : undefined,
          gitRepoName: sourceType === 'git' ? parsedRepo?.displayName : undefined,
          uploadedFiles: sourceType === 'files' ? uploadedFiles : undefined,
          filesDescription: sourceType === 'files' ? filesDescription : undefined,
          codeRequestBrief: sourceType === 'coded' ? codeRequestBrief : undefined,
          contactEmail,
          notes,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Submit failed');
      const predParsed = validatePredomain(predomain);
      const submittedPredomain = predParsed.ok ? predParsed.value : predomain;
      if (data.provisioning?.dnsRecords) {
        setLastDns({
          predomain: submittedPredomain,
          records: data.provisioning.dnsRecords as WebDeployDnsRecord[],
          previewUrl: data.provisioning.previewUrl as string | undefined,
          livePreviewUrl: data.provisioning.livePreviewUrl as string | undefined,
          message: data.provisioning.dnsMessage as string | undefined,
        });
      }
      setMsg(
        data.provisioning?.dnsApplied
          ? 'Request submitted — your subdomain is being set up automatically. Open the link below to see “Getting this site ready!” (may take a few minutes for DNS). A moderator will review before go-live.'
          : 'Request submitted — placeholder is uploading. Add Cloudflare API keys on Functions for automatic DNS, or use the records below. A moderator will review before go-live.',
      );
      setPredomain('');
      setProjectName('');
      setGitUrl('');
      setFilesDescription('');
      setUploadedFiles([]);
      setParsedRepo(null);
      setCodeRequestBrief('');
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
        repo (GitHub, GitLab, Bitbucket, Codeberg), import your site files, or ask us to code the site for you.
        Every request must be
        accepted by a mod before anything goes live.
      </p>
      <p style={{ margin: '0 0 24px', fontSize: 13, opacity: 0.7 }}>
        <Link href="/" style={{ color: 'var(--accent, #7dd3fc)' }}>
          ← Back to Pixel Place
        </Link>
      </p>

      {authLoading ? (
        <div className="ai-box" style={{ marginBottom: 24 }}>
          <div className="ai-output">Loading…</div>
        </div>
      ) : !session ? (
        <div className="ai-box" style={{ marginBottom: 24 }}>
          <div className="ai-label">Web Deploy sign-in</div>
          <div className="ai-output" style={{ display: 'grid', gap: 12 }}>
            <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
              Use Google for a <strong>Web Deploy-only</strong> account. This does not sign you into Pixel Place games,
              coins, or your main profile.
            </p>
            <button
              type="button"
              className="btn auth-btn"
              disabled={signInBusy}
              onClick={() => void handleGoogleSignIn()}
            >
              {signInBusy ? 'Signing in…' : 'Continue with Google'}
            </button>
            {msg ? <p style={{ margin: 0, fontSize: 13, color: '#fca5a5' }}>{msg}</p> : null}
          </div>
        </div>
      ) : (
        <>
          <div
            className="ai-box"
            style={{
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {session.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.photoURL}
                  alt=""
                  width={36}
                  height={36}
                  style={{ borderRadius: '50%' }}
                />
              ) : null}
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{session.displayName}</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>{session.email}</div>
              </div>
            </div>
            <button type="button" className="btn" onClick={() => void signOut()}>
              Sign out
            </button>
          </div>

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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px' }}>
                  <label>
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
                    Import files
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={sourceType === 'coded'}
                      onChange={() => setSourceType('coded')}
                    />{' '}
                    Request we code it
                  </label>
                </div>
              </div>
              {sourceType === 'git' ? (
                <>
                  <WebDeployGitRepoInput value={gitUrl} onChange={setGitUrl} onParsedRepo={setParsedRepo} />
                  {parsedRepo ? (
                    <p style={{ margin: 0, fontSize: 12, opacity: 0.75 }}>
                      Moderators will pull and deploy from your repository URL after approval.
                    </p>
                  ) : null}
                  {parsedRepo && predomain.trim() ? (
                    <p style={{ margin: 0, fontSize: 12, color: '#86efac', lineHeight: 1.5 }}>
                      After submit, visitors to{' '}
                      <strong>
                        {(() => {
                          const p = validatePredomain(predomain);
                          return p.ok ? predomainToLiveUrl(p.value) : 'your subdomain';
                        })()}
                      </strong>{' '}
                      will see a “Getting this site ready!” page while mods review.
                    </p>
                  ) : null}
                </>
              ) : sourceType === 'files' ? (
                <>
                  <WebDeployFileImport files={uploadedFiles} onChange={setUploadedFiles} disabled={busy} />
                  <label style={{ display: 'block' }}>
                    <span style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                      Notes about your files (optional)
                    </span>
                    <textarea
                      value={filesDescription}
                      onChange={(e) => setFilesDescription(e.target.value)}
                      rows={3}
                      placeholder="e.g. index.html is the entry point"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8 }}
                    />
                  </label>
                </>
              ) : (
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                    What should we build?
                  </span>
                  <p style={{ margin: '0 0 8px', fontSize: 12, opacity: 0.75, lineHeight: 1.5 }}>
                    Describe pages, layout, colors, and features. Moderators review the request — we do not start
                    building until it is approved, and complex sites may need follow-up by email.
                  </p>
                  <textarea
                    value={codeRequestBrief}
                    onChange={(e) => setCodeRequestBrief(e.target.value)}
                    rows={8}
                    placeholder="Example: A portfolio site with a dark theme, home + projects + contact. Projects page lists 6 cards with title and link. Contact form can be a mailto link."
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
              {msg ? (
                <p style={{ margin: 0, fontSize: 13, color: msg.includes('submitted') ? '#86efac' : '#fca5a5' }}>
                  {msg}
                </p>
              ) : null}
            </div>
          </div>
        </>
      )}

      {lastDns ? (
        <WebDeployDnsPanel
          predomain={lastDns.predomain}
          records={lastDns.records}
          previewUrl={lastDns.previewUrl}
          livePreviewUrl={lastDns.livePreviewUrl}
          message={lastDns.message}
        />
      ) : null}

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
                  {webDeploySourceLabel(r.sourceType)} · Status: <strong>{r.status}</strong>
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
