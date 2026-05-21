import { apiUrl } from '@/lib/apiBaseUrl';
import { compileMarkdownToHtml } from '@/lib/markdownCompile';

export type UpdateLogListItem = {
  slug: string;
  filename: string;
  title: string;
  version: string | null;
  isLatest: boolean;
  githubUrl?: string;
  staticUrl?: string;
};

export type UpdateLogDetail = UpdateLogListItem & {
  markdown: string;
  html: string;
  sha: string | null;
  compiledAt: string;
  source: 'github' | 'bundled' | 'merged';
};

export type UpdateLogsListResponse = {
  success: boolean;
  source?: string;
  repository?: string;
  ref?: string;
  folder?: string;
  compiler?: string;
  logs?: UpdateLogListItem[];
  error?: string;
};

export type UpdateLogDetailResponse = {
  success: boolean;
  log?: UpdateLogDetail;
  error?: string;
};

type StaticManifest = {
  bundledAt?: string;
  folder?: string;
  compiler?: string;
  logs?: Array<{
    slug: string;
    filename: string;
    title: string;
    version: string | null;
    isLatest: boolean;
    staticUrl: string;
  }>;
};

const STATIC_MANIFEST = '/latest-update-logs/manifest.json';

function parseTitleFromMarkdown(md: string, fallback: string): string {
  const m = md.match(/^#\s+(.+)$/m);
  if (!m) return fallback;
  return m[1].replace(/\s*—\s*.+$/, '').trim() || fallback;
}

function parseVersion(filename: string): number[] {
  const m = filename.match(/^(\d+(?:\.\d+)?)/);
  if (!m) return [0];
  return m[1].split('.').map((n) => Number(n) || 0);
}

function compareVersionFilenames(a: string, b: string): number {
  const aLatest = /LATEST/i.test(a);
  const bLatest = /LATEST/i.test(b);
  if (aLatest !== bLatest) return aLatest ? -1 : 1;
  const av = parseVersion(a);
  const bv = parseVersion(b);
  for (let i = 0; i < Math.max(av.length, bv.length); i += 1) {
    const d = (bv[i] || 0) - (av[i] || 0);
    if (d !== 0) return d;
  }
  return b.localeCompare(a);
}

function normalizeLatestFlags(logs: UpdateLogListItem[]): UpdateLogListItem[] {
  if (!logs.length) return logs;
  const sorted = [...logs].sort((a, b) => compareVersionFilenames(a.filename, b.filename));
  const winner = sorted.find((l) => /LATEST/i.test(l.filename)) || sorted[0];
  return logs.map((l) => ({ ...l, isLatest: l.slug === winner.slug }));
}

async function fetchStaticManifest(): Promise<StaticManifest | null> {
  try {
    const res = await fetch(STATIC_MANIFEST, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as StaticManifest;
  } catch {
    return null;
  }
}

async function fetchGithubUpdateLogsList(): Promise<UpdateLogsListResponse | null> {
  try {
    const res = await fetch(apiUrl('/api/update-logs'), { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as UpdateLogsListResponse | null;
    if (!data?.success || !data.logs?.length) return null;
    return data;
  } catch {
    return null;
  }
}

async function fetchStaticUpdateLogsList(): Promise<UpdateLogsListResponse> {
  const manifest = await fetchStaticManifest();
  if (!manifest?.logs?.length) {
    return { success: false, error: 'Bundled release notes are not available.' };
  }
  return {
    success: true,
    source: 'bundled',
    folder: manifest.folder || 'Latest Update Logs',
    compiler: manifest.compiler || 'pixel-place-markdown/1',
    logs: manifest.logs.map((l) => ({
      slug: l.slug,
      filename: l.filename,
      title: l.title,
      version: l.version,
      isLatest: l.isLatest,
      staticUrl: l.staticUrl,
    })),
  };
}

function logDedupeKey(filename: string): string {
  return filename
    .replace(/\s+LATEST\.md$/i, '.md')
    .toLowerCase();
}

/** Site bundle wins over GitHub when both exist (GitHub main may lag behind deploy). */
function mergeUpdateLogLists(
  bundled: UpdateLogsListResponse | null,
  github: UpdateLogsListResponse | null,
): UpdateLogsListResponse {
  const byKey = new Map<string, UpdateLogListItem>();

  if (github?.logs) {
    for (const log of github.logs) {
      if (log.filename.toLowerCase() === 'readme.md') continue;
      byKey.set(logDedupeKey(log.filename), { ...log });
    }
  }

  if (bundled?.logs) {
    for (const log of bundled.logs) {
      if (log.filename.toLowerCase() === 'readme.md') continue;
      const key = logDedupeKey(log.filename);
      const prev = byKey.get(key);
      byKey.set(key, {
        ...prev,
        ...log,
        githubUrl: prev?.githubUrl ?? log.githubUrl,
        staticUrl: log.staticUrl ?? prev?.staticUrl,
      });
    }
  }

  const logs = normalizeLatestFlags(
    [...byKey.values()].sort((a, b) => compareVersionFilenames(a.filename, b.filename)),
  );

  if (!logs.length) {
    return { success: false, error: 'No release notes found.' };
  }

  return {
    success: true,
    source: 'merged',
    repository: github?.repository,
    ref: github?.ref,
    folder: bundled?.folder || github?.folder || 'Latest Update Logs',
    compiler: bundled?.compiler || github?.compiler || 'pixel-place-markdown/1',
    logs,
  };
}

export async function fetchUpdateLogsList(): Promise<UpdateLogsListResponse> {
  const [bundled, github] = await Promise.all([
    fetchStaticUpdateLogsList(),
    fetchGithubUpdateLogsList(),
  ]);
  return mergeUpdateLogLists(
    bundled.success ? bundled : null,
    github,
  );
}

async function fetchStaticUpdateLogDetail(slug: string): Promise<UpdateLogDetailResponse> {
  const manifest = await fetchStaticManifest();
  const item = manifest?.logs?.find((l) => l.slug === slug);
  if (!item) return { success: false, error: 'Update log not found' };
  const res = await fetch(item.staticUrl, { cache: 'no-store' });
  if (!res.ok) return { success: false, error: 'Could not load bundled release note' };
  const markdown = await res.text();
  const title = parseTitleFromMarkdown(markdown, item.title);
  return {
    success: true,
    log: {
      slug: item.slug,
      filename: item.filename,
      title,
      version: item.version,
      isLatest: item.isLatest,
      staticUrl: item.staticUrl,
      markdown,
      html: compileMarkdownToHtml(markdown),
      sha: null,
      compiledAt: new Date().toISOString(),
      source: 'bundled',
    },
  };
}

async function fetchGithubUpdateLogDetail(slug: string): Promise<UpdateLogDetailResponse | null> {
  try {
    const res = await fetch(apiUrl(`/api/update-logs/${encodeURIComponent(slug)}`), {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as UpdateLogDetailResponse | null;
    if (!data?.success || !data.log) return null;
    return data;
  } catch {
    return null;
  }
}

export async function fetchUpdateLogDetail(slug: string): Promise<UpdateLogDetailResponse> {
  const manifest = await fetchStaticManifest();
  const hasBundled = manifest?.logs?.some((l) => l.slug === slug);
  if (hasBundled) {
    const bundled = await fetchStaticUpdateLogDetail(slug);
    if (bundled.success && bundled.log) {
      const github = await fetchGithubUpdateLogDetail(slug);
      if (github?.log?.githubUrl) {
        bundled.log.githubUrl = github.log.githubUrl;
        bundled.log.source = 'merged';
      }
      return bundled;
    }
  }
  const github = await fetchGithubUpdateLogDetail(slug);
  if (github) return github;
  return fetchStaticUpdateLogDetail(slug);
}
