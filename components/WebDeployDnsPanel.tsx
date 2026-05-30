'use client';

import type { WebDeployDnsRecord } from '@/lib/webDeploy';

type Props = {
  predomain: string;
  records: WebDeployDnsRecord[];
  previewUrl?: string;
  livePreviewUrl?: string;
  message?: string;
};

export default function WebDeployDnsPanel({
  predomain,
  records,
  previewUrl,
  livePreviewUrl,
  message,
}: Props) {
  if (!records.length) return null;
  return (
    <div
      className="ai-box"
      style={{
        marginTop: 16,
        padding: 14,
        borderRadius: 10,
        border: '1px solid rgba(125, 211, 252, 0.25)',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Your site</div>
      <p style={{ margin: '0 0 10px', fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>
        {message ||
          'We are configuring DNS and Firebase Hosting automatically. “Getting this site ready!” should appear on your subdomain within a few minutes.'}
      </p>
      {livePreviewUrl ? (
        <p style={{ margin: '0 0 10px', fontSize: 13 }}>
          Preview now (no DNS wait):{' '}
          <a href={livePreviewUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
            Open placeholder
          </a>
        </p>
      ) : null}
      {previewUrl ? (
        <p style={{ margin: '0 0 10px', fontSize: 13 }}>
          Live subdomain:{' '}
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
            {previewUrl}
          </a>
        </p>
      ) : null}
      <details style={{ fontSize: 12, opacity: 0.8 }}>
        <summary style={{ cursor: 'pointer', marginBottom: 8 }}>DNS details (managed automatically when Cloudflare API is configured)</summary>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', opacity: 0.75 }}>
              <th style={{ padding: '6px 8px' }}>Type</th>
              <th style={{ padding: '6px 8px' }}>Name</th>
              <th style={{ padding: '6px 8px' }}>Target</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={`${r.type}-${r.name}`} style={{ borderTop: '1px solid var(--border, #32394e)' }}>
                <td style={{ padding: '8px', fontFamily: 'ui-monospace, monospace' }}>{r.type}</td>
                <td style={{ padding: '8px', fontFamily: 'ui-monospace, monospace' }}>
                  {r.name || `${predomain}.pixelplaceofficial.com`}
                </td>
                <td style={{ padding: '8px', fontFamily: 'ui-monospace, monospace', wordBreak: 'break-all' }}>
                  {r.content}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
