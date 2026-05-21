'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchUpdateLogDetail,
  fetchUpdateLogsList,
  type UpdateLogDetail,
  type UpdateLogListItem,
} from '@/lib/updateLogsApi';

const markdownStyles: React.CSSProperties = {
  textAlign: 'left',
  lineHeight: 1.65,
  fontSize: 14,
  color: 'var(--text-main)',
};

const summaryStyle: React.CSSProperties = {
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: 14,
  listStyle: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
  padding: '4px 0',
  userSelect: 'none',
};

export default function UpdateLogsPanel() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<UpdateLogListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<UpdateLogDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');

  const latestLog = logs.find((l) => l.isLatest) || logs[0];

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadingList(true);
      setListError('');
      const res = await fetchUpdateLogsList();
      if (cancelled) return;
      setLoadingList(false);
      if (!res.success || !res.logs?.length) {
        setListError(res.error || 'Could not load release notes.');
        setLogs([]);
        return;
      }
      const filtered = res.logs.filter((l) => l.filename.toLowerCase() !== 'readme.md');
      setLogs(filtered);
      const latest = filtered.find((l) => l.isLatest) || filtered[0];
      if (latest) setSelectedSlug(latest.slug);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadDetail = useCallback(async (slug: string) => {
    setLoadingDetail(true);
    setDetailError('');
    setDetail(null);
    const res = await fetchUpdateLogDetail(slug);
    setLoadingDetail(false);
    if (!res.success || !res.log) {
      setDetailError(res.error || 'Could not load this release note.');
      return;
    }
    setDetail(res.log);
  }, []);

  useEffect(() => {
    if (!open || !selectedSlug) return;
    void loadDetail(selectedSlug);
  }, [open, selectedSlug, loadDetail]);

  return (
    <div className="ai-box">
      <details
        open={open}
        onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
        style={{ margin: 0 }}
      >
        <summary style={summaryStyle}>
          <span>Release notes</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)' }}>
            {loadingList
              ? 'Loading…'
              : latestLog
                ? `${latestLog.version ? `v${latestLog.version}` : latestLog.title}${latestLog.isLatest ? ' · LATEST' : ''}`
                : ''}
          </span>
        </summary>

        <div style={{ marginTop: 12 }}>
          {listError ? (
            <p style={{ color: 'var(--danger)', fontSize: 13, margin: '0 0 8px' }}>{listError}</p>
          ) : null}

          {!loadingList && !listError && logs.length > 0 ? (
            <>
              <label
                htmlFor="update-log-select"
                style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}
              >
                Version
              </label>
              <select
                id="update-log-select"
                className="btn"
                value={selectedSlug || ''}
                onChange={(e) => setSelectedSlug(e.target.value)}
                style={{
                  width: '100%',
                  marginBottom: 12,
                  padding: '10px 12px',
                  fontSize: 14,
                  background: 'var(--panel-soft)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                }}
              >
                {logs.map((log) => (
                  <option key={log.slug} value={log.slug}>
                    {log.version ? `v${log.version}` : log.title}
                    {log.isLatest ? ' — LATEST' : ''}
                    {log.title && log.version ? ` (${log.title})` : ''}
                  </option>
                ))}
              </select>

              {loadingDetail ? (
                <p style={{ color: 'var(--text-dim)', fontSize: 13, margin: '0 0 8px' }}>Loading…</p>
              ) : null}
              {detailError ? (
                <p style={{ color: 'var(--danger)', fontSize: 13, margin: '0 0 8px' }}>{detailError}</p>
              ) : null}

              {detail ? (
                <div
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    background: 'var(--panel-soft)',
                    maxHeight: 'min(50vh, 420px)',
                    overflow: 'auto',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 8,
                      marginBottom: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{detail.title}</div>
                    {detail.githubUrl ? (
                      <a
                        href={detail.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 11, color: '#93c5fd' }}
                      >
                        GitHub
                      </a>
                    ) : null}
                  </div>
                  <div
                    className="update-log-markdown"
                    style={markdownStyles}
                    dangerouslySetInnerHTML={{ __html: detail.html }}
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </details>

      <style jsx global>{`
        details summary::-webkit-details-marker {
          display: none;
        }
        details summary::after {
          content: '▾';
          font-size: 12px;
          color: var(--text-dim);
          transition: transform 0.15s ease;
        }
        details:not([open]) summary::after {
          transform: rotate(-90deg);
        }
        .update-log-markdown h1,
        .update-log-markdown h2,
        .update-log-markdown h3 {
          margin: 1.1em 0 0.45em;
          font-weight: 800;
          line-height: 1.25;
        }
        .update-log-markdown h1 {
          font-size: 1.35rem;
        }
        .update-log-markdown h2 {
          font-size: 1.15rem;
        }
        .update-log-markdown h3 {
          font-size: 1rem;
        }
        .update-log-markdown p {
          margin: 0.55em 0;
        }
        .update-log-markdown ul {
          margin: 0.5em 0 0.75em;
          padding-left: 1.35em;
        }
        .update-log-markdown li {
          margin: 0.25em 0;
        }
        .update-log-markdown a {
          color: #93c5fd;
          text-decoration: underline;
        }
        .update-log-markdown code {
          font-family: ui-monospace, monospace;
          font-size: 0.9em;
          background: rgba(0, 0, 0, 0.25);
          padding: 0.1em 0.35em;
          border-radius: 4px;
        }
        .update-log-markdown pre {
          overflow: auto;
          padding: 12px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.35);
          margin: 0.75em 0;
        }
        .update-log-markdown pre code {
          background: none;
          padding: 0;
        }
        .update-log-markdown table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.75em 0;
          font-size: 13px;
        }
        .update-log-markdown th,
        .update-log-markdown td {
          border: 1px solid var(--border);
          padding: 8px 10px;
          text-align: left;
        }
        .update-log-markdown th {
          background: rgba(99, 102, 241, 0.15);
        }
        .update-log-markdown blockquote {
          margin: 0.75em 0;
          padding: 8px 12px;
          border-left: 3px solid rgba(132, 145, 255, 0.55);
          background: rgba(99, 102, 241, 0.08);
          border-radius: 0 8px 8px 0;
        }
        .update-log-markdown hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 1.25em 0;
        }
        .update-log-markdown .task-item {
          list-style: none;
          margin-left: -1.35em;
        }
      `}</style>
    </div>
  );
}
