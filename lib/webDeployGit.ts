/** Parse public Git host URLs for Web Deploy repo input preview. */

export type GitProviderId = 'github' | 'gitlab' | 'bitbucket' | 'codeberg' | 'unknown';

export type ParsedGitRepo = {
  provider: GitProviderId;
  providerLabel: string;
  owner: string;
  repo: string;
  displayName: string;
  normalizedUrl: string;
};

const PROVIDER_LABELS: Record<GitProviderId, string> = {
  github: 'GitHub',
  gitlab: 'GitLab',
  bitbucket: 'Bitbucket',
  codeberg: 'Codeberg',
  unknown: 'Git',
};

function detectProvider(hostname: string): GitProviderId {
  const h = hostname.toLowerCase();
  if (h === 'github.com' || h.endsWith('.github.com')) return 'github';
  if (h === 'gitlab.com' || h.endsWith('.gitlab.com')) return 'gitlab';
  if (h === 'bitbucket.org' || h.endsWith('.bitbucket.org')) return 'bitbucket';
  if (h === 'codeberg.org' || h.endsWith('.codeberg.org')) return 'codeberg';
  return 'unknown';
}

function stripGitSuffix(segment: string): string {
  return segment.replace(/\.git$/i, '');
}

/** Returns null if the string is not a recognizable public repo URL yet. */
export function parseGitRepoUrl(raw: string): ParsedGitRepo | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length < 8) return null;
  let url: URL;
  try {
    url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  const provider = detectProvider(url.hostname);
  if (provider === 'unknown') return null;

  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 2) return null;

  const owner = stripGitSuffix(parts[0]);
  const repo = stripGitSuffix(parts[1]);
  if (!owner || !repo) return null;

  const displayName = `${owner}/${repo}`;
  const normalizedUrl = `https://${url.hostname}/${owner}/${repo}`;

  return {
    provider,
    providerLabel: PROVIDER_LABELS[provider],
    owner,
    repo,
    displayName,
    normalizedUrl,
  };
}

export function getGitProviderAccent(provider: GitProviderId): string {
  switch (provider) {
    case 'github':
      return '#e8e8ef';
    case 'gitlab':
      return '#fc6d26';
    case 'bitbucket':
      return '#2684ff';
    case 'codeberg':
      return '#2185d0';
    default:
      return '#94a3b8';
  }
}
