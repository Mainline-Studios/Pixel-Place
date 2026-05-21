import type { Express, Request, Response } from 'express';
import { compileMarkdownToHtml } from './markdownCompile';

const DEFAULT_OWNER = 'Mainline-Studios';
const DEFAULT_REPO = 'Pixel-Place';
const DEFAULT_REF = 'main';
const DEFAULT_FOLDER = 'Latest Update Logs';

export type UpdateLogListItem = {
  slug: string;
  filename: string;
  title: string;
  version: string | null;
  isLatest: boolean;
  githubUrl: string;
};

export type UpdateLogDetail = UpdateLogListItem & {
  markdown: string;
  html: string;
  sha: string | null;
  compiledAt: string;
  source: 'github';
};

function githubConfig() {
  const owner = process.env.UPDATE_LOGS_GITHUB_OWNER || DEFAULT_OWNER;
  const repo = process.env.UPDATE_LOGS_GITHUB_REPO || DEFAULT_REPO;
  const ref = process.env.UPDATE_LOGS_GITHUB_REF || DEFAULT_REF;
  const folder = process.env.UPDATE_LOGS_GITHUB_PATH || DEFAULT_FOLDER;
  return { owner, repo, ref, folder };
}

function filenameToSlug(filename: string): string {
  return filename
    .replace(/\.md$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseTitleFromMarkdown(md: string, fallback: string): string {
  const m = md.match(/^#\s+(.+)$/m);
  if (!m) return fallback;
  return m[1].replace(/\s*—\s*.+$/, '').trim() || fallback;
}

function parseVersionFromFilename(filename: string): string | null {
  const m = filename.match(/^(\d+(?:\.\d+)?)/);
  return m ? m[1] : null;
}

function compareLogFiles(a: string, b: string): number {
  const aLatest = /LATEST/i.test(a);
  const bLatest = /LATEST/i.test(b);
  if (aLatest !== bLatest) return aLatest ? -1 : 1;
  const av = parseVersionFromFilename(a);
  const bv = parseVersionFromFilename(b);
  if (av && bv) {
    const ap = av.split('.').map(Number);
    const bp = bv.split('.').map(Number);
    for (let i = 0; i < Math.max(ap.length, bp.length); i += 1) {
      const d = (bp[i] || 0) - (ap[i] || 0);
      if (d !== 0) return d;
    }
  }
  if (a === 'README.md') return 1;
  if (b === 'README.md') return -1;
  return b.localeCompare(a);
}

async function githubFetch(path: string): Promise<globalThis.Response> {
  const { ref } = githubConfig();
  const token = process.env.GITHUB_TOKEN || process.env.UPDATE_LOGS_GITHUB_TOKEN;
  let url = `https://api.github.com${path}`;
  if (ref) url += `${url.includes('?') ? '&' : '?'}ref=${encodeURIComponent(ref)}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Pixel-Place-Update-Logs',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { headers, cache: 'no-store' });
}

type GithubContentEntry = {
  name: string;
  path: string;
  sha: string;
  type: string;
  download_url?: string | null;
};

async function listMarkdownFiles(): Promise<GithubContentEntry[]> {
  const { owner, repo, folder } = githubConfig();
  const path = `/repos/${owner}/${repo}/contents/${encodeURIComponent(folder)}`;
  const res = await githubFetch(path);
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`GitHub list failed (${res.status}): ${err.slice(0, 200)}`);
  }
  const data = (await res.json()) as GithubContentEntry[] | { message?: string };
  if (!Array.isArray(data)) {
    throw new Error((data as { message?: string }).message || 'Unexpected GitHub response');
  }
  return data.filter((e) => e.type === 'file' && /\.md$/i.test(e.name));
}

async function fetchMarkdownByFilename(filename: string): Promise<{ markdown: string; sha: string | null }> {
  const { owner, repo, folder, ref } = githubConfig();
  const path = `/repos/${owner}/${repo}/contents/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`;
  const res = await githubFetch(path);
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`GitHub file failed (${res.status}): ${err.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    content?: string;
    encoding?: string;
    sha?: string;
    download_url?: string;
  };
  if (data.content && data.encoding === 'base64') {
    const markdown = Buffer.from(data.content, 'base64').toString('utf8');
    return { markdown, sha: data.sha || null };
  }
  if (data.download_url) {
    const raw = await fetch(data.download_url, { cache: 'no-store' });
    if (!raw.ok) throw new Error(`GitHub raw fetch failed (${raw.status})`);
    return { markdown: await raw.text(), sha: data.sha || null };
  }
  throw new Error('GitHub file had no content');
}

function buildGithubFileUrl(filename: string): string {
  const { owner, repo, ref, folder } = githubConfig();
  const folderPath = folder
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `https://github.com/${owner}/${repo}/blob/${ref}/${folderPath}/${encodeURIComponent(filename)}`;
}

function entryToListItem(filename: string): UpdateLogListItem {
  const slug = filenameToSlug(filename);
  const version = parseVersionFromFilename(filename);
  const titleBase = filename.replace(/\.md$/i, '').replace(/\s+LATEST$/i, '');
  return {
    slug,
    filename,
    title: titleBase,
    version,
    isLatest: /LATEST/i.test(filename),
    githubUrl: buildGithubFileUrl(filename),
  };
}

let listCache: { at: number; items: UpdateLogListItem[] } | null = null;
const LIST_CACHE_MS = 5 * 60 * 1000;
const detailCache = new Map<string, { at: number; data: UpdateLogDetail }>();
const DETAIL_CACHE_MS = 5 * 60 * 1000;

async function getCachedList(): Promise<UpdateLogListItem[]> {
  const now = Date.now();
  if (listCache && now - listCache.at < LIST_CACHE_MS) return listCache.items;
  const files = await listMarkdownFiles();
  const items = files
    .map((f) => entryToListItem(f.name))
    .sort((a, b) => compareLogFiles(a.filename, b.filename));
  listCache = { at: now, items };
  return items;
}

export function mountUpdateLogsRoutes(app: Express) {
  const listHandler = async (_req: Request, res: Response) => {
    try {
      const { owner, repo, ref, folder } = githubConfig();
      const logs = await getCachedList();
      res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
      res.json({
        success: true,
        source: 'github',
        repository: `${owner}/${repo}`,
        ref,
        folder,
        compiler: 'pixel-place-markdown/1',
        logs,
      });
    } catch (e) {
      console.error('[update-logs] list failed:', e);
      res.status(502).json({
        success: false,
        error: e instanceof Error ? e.message : 'Failed to load update logs from GitHub',
      });
    }
  };

  const detailHandler = async (req: Request, res: Response) => {
    try {
      const slug = String(req.params.slug || '').toLowerCase();
      if (!slug) return res.status(400).json({ success: false, error: 'Missing log slug' });

      const now = Date.now();
      const cached = detailCache.get(slug);
      if (cached && now - cached.at < DETAIL_CACHE_MS) {
        res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
        return res.json({ success: true, log: cached.data });
      }

      const list = await getCachedList();
      const item = list.find((l) => l.slug === slug);
      if (!item) return res.status(404).json({ success: false, error: 'Update log not found' });

      const { markdown, sha } = await fetchMarkdownByFilename(item.filename);
      const title = parseTitleFromMarkdown(markdown, item.title);
      const html = compileMarkdownToHtml(markdown);
      const detail: UpdateLogDetail = {
        ...item,
        title,
        markdown,
        html,
        sha,
        compiledAt: new Date().toISOString(),
        source: 'github',
      };
      detailCache.set(slug, { at: now, data: detail });
      res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
      res.json({ success: true, log: detail });
    } catch (e) {
      console.error('[update-logs] detail failed:', e);
      res.status(502).json({
        success: false,
        error: e instanceof Error ? e.message : 'Failed to compile update log',
      });
    }
  };

  ['/update-logs', '/api/update-logs'].forEach((path) => app.get(path, listHandler));
  ['/update-logs/:slug', '/api/update-logs/:slug'].forEach((path) => app.get(path, detailHandler));
}
