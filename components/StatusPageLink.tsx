'use client';

import { useEffect, useState } from 'react';
import { resolveClientApiUrl } from '@/lib/apiBaseUrl';
import { getStatusPageUrl } from '@/lib/statusPageUrl';

const LABELS: Record<string, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  maintenance: 'Maintenance',
  outage: 'Outage',
};

export default function StatusPageLink() {
  const [line, setLine] = useState<string>('System status');
  const [status, setStatus] = useState<string>('operational');

  useEffect(() => {
    let cancelled = false;
    fetch(resolveClientApiUrl('/status-page'))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (cancelled || !data?.pixelPlace) return;
        const s = String(data.pixelPlace.status || 'operational').toLowerCase();
        const custom = String(data.pixelPlace.customStatusLabel || '').trim();
        setStatus(s);
        const word = custom || LABELS[s] || 'Operational';
        setLine(`${word} · System status`);
      })
      .catch(() => {
        if (!cancelled) setLine('System status');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const href = getStatusPageUrl();
  const dotColor =
    status === 'outage'
      ? '#f87171'
      : status === 'degraded' || status === 'maintenance'
        ? '#fbbf24'
        : '#34d399';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 999,
        border: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.04)',
        color: 'var(--accent)',
        fontSize: 12,
        fontWeight: 600,
        textDecoration: 'none',
      }}
      title="Open status.pixelplaceofficial.com — outages and updates"
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: dotColor,
          boxShadow: `0 0 8px ${dotColor}`,
          flexShrink: 0,
        }}
      />
      <span>{line}</span>
    </a>
  );
}
