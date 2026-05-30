/**
 * Publish a public GitHub repo (zipball) to Storage for Web Deploy subdomains.
 */
import AdmZip from 'adm-zip';
import type { Bucket } from '@google-cloud/storage';
import { WEB_DEPLOY_HOSTING_PREFIX, WEB_DEPLOY_PLACEHOLDER_CACHE_MAX_AGE } from './webDeployPlaceholder';

const MAX_ZIP_BYTES = 28 * 1024 * 1024;
const SKIP_DIR = new Set(['.git', '.github', 'node_modules', 'dist', 'build', '.next', '__MACOSX']);

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json',
};

export function parseGithubRepoUrl(gitUrl: string): { owner: string; repo: string } | null {
  const trimmed = gitUrl.trim();
  const m = trimmed.match(/github\.com\/([^/]+)\/([^/?#]+)/i);
  if (!m) return null;
  const owner = m[1];
  const repo = m[2].replace(/\.git$/i, '');
  if (!owner || !repo) return null;
  return { owner, repo };
}

function contentTypeForPath(relPath: string): string {
  const dot = relPath.lastIndexOf('.');
  if (dot === -1) return 'application/octet-stream';
  return MIME[relPath.slice(dot).toLowerCase()] || 'application/octet-stream';
}

function shouldSkipEntry(entryName: string): boolean {
  const parts = entryName.split('/').filter(Boolean);
  if (parts.length === 0) return true;
  for (const p of parts) {
    if (p.startsWith('.') && p !== '.well-known') return true;
    if (SKIP_DIR.has(p)) return true;
  }
  return false;
}

/** Strip GitHub zip root folder (e.g. demo-repository-main/). */
function stripZipRoot(entryName: string): string | null {
  const idx = entryName.indexOf('/');
  if (idx === -1) return null;
  return entryName.slice(idx + 1);
}

export async function deployGithubRepoToStorage(
  bucket: Bucket,
  predomain: string,
  gitUrl: string,
  branch = 'main',
): Promise<{ filesUploaded: number; entryPath: string }> {
  const parsed = parseGithubRepoUrl(gitUrl);
  if (!parsed) {
    throw new Error('Only public GitHub repository URLs are supported for automatic deploy');
  }
  const { owner, repo } = parsed;
  const ref = branch.trim() || 'main';
  const zipUrl = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/${encodeURIComponent(ref)}`;

  const headers: Record<string, string> = { 'User-Agent': 'PixelPlace-WebDeploy/1.0' };
  const token = process.env.GITHUB_TOKEN || process.env.WEB_DEPLOY_GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(zipUrl, { headers, redirect: 'follow' });
  if (!res.ok) {
    const alt = ref === 'main' ? 'master' : 'main';
    if (res.status === 404 && alt !== ref) {
      return deployGithubRepoToStorage(bucket, predomain, gitUrl, alt);
    }
    throw new Error(`Could not download repository (${res.status}). Is it public?`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_ZIP_BYTES) {
    throw new Error('Repository archive is too large for Web Deploy (max ~28MB)');
  }

  const zip = new AdmZip(buf);
  const prefix = `${WEB_DEPLOY_HOSTING_PREFIX}/${predomain}/`;
  let filesUploaded = 0;
  let hasIndex = false;

  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;
    const rel = stripZipRoot(entry.entryName);
    if (!rel || shouldSkipEntry(rel)) continue;
    if (rel.includes('..')) continue;

    const storagePath = `${prefix}${rel}`;
    const data = entry.getData();
    const contentType = contentTypeForPath(rel);
    await bucket.file(storagePath).save(data, {
      contentType,
      metadata: { cacheControl: `public, max-age=${WEB_DEPLOY_PLACEHOLDER_CACHE_MAX_AGE}` },
    });
    filesUploaded += 1;
    if (rel === 'index.html' || rel.endsWith('/index.html')) hasIndex = true;
  }

  if (filesUploaded === 0) {
    throw new Error('No deployable files found in repository (need at least index.html or static assets)');
  }

  const entryPath = hasIndex ? 'index.html' : zip.getEntries().find((e) => !e.isDirectory)?.entryName ?? 'index.html';
  return { filesUploaded, entryPath };
}
