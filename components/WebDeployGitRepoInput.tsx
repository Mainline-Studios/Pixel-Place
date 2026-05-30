'use client';

import { useEffect, useMemo } from 'react';
import { getGitProviderAccent, parseGitRepoUrl } from '@/lib/webDeployGit';
import WebDeployGitProviderIcon from '@/components/WebDeployGitProviderIcon';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onParsedRepo?: (repo: ReturnType<typeof parseGitRepoUrl>) => void;
};

export default function WebDeployGitRepoInput({ value, onChange, onParsedRepo }: Props) {
  const parsed = useMemo(() => parseGitRepoUrl(value), [value]);

  useEffect(() => {
    onParsedRepo?.(parsed);
  }, [parsed, onParsedRepo]);

  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Repository URL</span>
      <div style={{ position: 'relative' }}>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://github.com/you/your-repo"
          style={{
            width: '100%',
            padding: parsed ? '10px 12px 10px 44px' : '10px 12px',
            borderRadius: 8,
            boxSizing: 'border-box',
          }}
        />
        {parsed ? (
          <span
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              color: getGitProviderAccent(parsed.provider),
            }}
          >
            <WebDeployGitProviderIcon provider={parsed.provider} size={22} />
          </span>
        ) : null}
      </div>
      {parsed ? (
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid var(--border, #32394e)',
            background: 'var(--panel-soft, rgba(255,255,255,0.04))',
          }}
        >
          <span style={{ display: 'flex', color: getGitProviderAccent(parsed.provider) }}>
            <WebDeployGitProviderIcon provider={parsed.provider} size={28} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, wordBreak: 'break-word' }}>{parsed.displayName}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>{parsed.providerLabel}</div>
          </div>
        </div>
      ) : value.trim().length > 12 ? (
        <p style={{ margin: '6px 0 0', fontSize: 12, opacity: 0.65 }}>
          Paste a public GitHub, GitLab, Bitbucket, or Codeberg repo link.
        </p>
      ) : null}
    </label>
  );
}
