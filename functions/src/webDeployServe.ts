import type { Response } from 'express';
import type * as admin from 'firebase-admin';
import {
  buildGettingReadyHtml,
  WEB_DEPLOY_HOSTING_PREFIX,
  WEB_DEPLOY_PLACEHOLDER_CACHE_MAX_AGE,
} from './webDeployPlaceholder';
import { fetchWebDeploySiteContext } from './webDeploySiteContext';

type DeployStorageRef = {
  file: (path: string) => {
    download: () => Promise<Buffer[]>;
    exists: () => Promise<[boolean]>;
  };
};

type ServeCollections = {
  WEB_DEPLOY_SITES: string;
  WEB_DEPLOY_REQUESTS: string;
};

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
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
  '.wasm': 'application/wasm',
};

function contentTypeForPath(relPath: string): string {
  const dot = relPath.lastIndexOf('.');
  if (dot === -1) return 'application/octet-stream';
  return MIME[relPath.slice(dot).toLowerCase()] || 'application/octet-stream';
}

/** Safe relative path under site prefix (no traversal). */
export function sanitizeWebDeployRequestPath(raw: string): string {
  let p = String(raw || '/').split('?')[0].split('#')[0];
  if (!p.startsWith('/')) p = `/${p}`;
  const parts = p.split('/').filter((seg) => seg && seg !== '.' && seg !== '..');
  return parts.length ? parts.join('/') : '';
}

function isRootDocumentPath(rel: string): boolean {
  return !rel || rel === 'index.html';
}

async function trySendFile(
  bucket: DeployStorageRef,
  storagePath: string,
  res: Response,
): Promise<boolean> {
  try {
    const [exists] = await bucket.file(storagePath).exists();
    if (!exists) return false;
    const [buf] = await bucket.file(storagePath).download();
    const rel = storagePath.split('/').pop() || '';
    res.setHeader('Content-Type', contentTypeForPath(rel));
    res.setHeader('Cache-Control', `public, max-age=${WEB_DEPLOY_PLACEHOLDER_CACHE_MAX_AGE}`);
    res.status(200).send(buf);
    return true;
  } catch {
    return false;
  }
}

function sendPlaceholderHtml(
  res: Response,
  opts: Parameters<typeof buildGettingReadyHtml>[0],
): void {
  const html = buildGettingReadyHtml(opts);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', `public, max-age=${WEB_DEPLOY_PLACEHOLDER_CACHE_MAX_AGE}`);
  res.status(200).send(html);
}

export async function serveWebDeploySite(
  bucket: DeployStorageRef,
  predomain: string,
  requestPath: string,
  res: Response,
  db?: admin.firestore.Firestore,
  collections?: ServeCollections,
): Promise<void> {
  const rel = sanitizeWebDeployRequestPath(requestPath);
  const rootDoc = isRootDocumentPath(rel);

  let ctx = null;
  if (db && collections) {
    ctx = await fetchWebDeploySiteContext(db, collections, predomain);
  }

  const status = ctx?.status ?? 'pending';
  const isLive = status === 'live';
  const showDeployedApp = isLive || Boolean(ctx?.appDeployed);

  if (rootDoc && !showDeployedApp && ctx) {
    const phase = status === 'approved' ? 'approved' : 'pending';
    sendPlaceholderHtml(res, {
      projectName: ctx.projectName,
      predomain,
      phase,
      sourceType: ctx.sourceType,
    });
    return;
  }

  if (rootDoc && !showDeployedApp && !ctx) {
    sendPlaceholderHtml(res, {
      projectName: predomain,
      predomain,
      phase: 'pending',
      sourceType: 'git',
    });
    return;
  }

  const prefix = `${WEB_DEPLOY_HOSTING_PREFIX}/${predomain}/`;
  const candidates: string[] = [];
  if (!rel) {
    candidates.push('index.html');
  } else {
    candidates.push(rel);
    if (!rel.includes('.')) {
      candidates.push(`${rel}/index.html`);
      candidates.push(`${rel}.html`);
    }
  }
  if (rootDoc) candidates.push('index.html');

  const seen = new Set<string>();
  for (const c of candidates) {
    if (seen.has(c)) continue;
    seen.add(c);
    if (await trySendFile(bucket, prefix + c, res)) return;
  }

  sendPlaceholderHtml(res, {
    projectName: ctx?.projectName ?? predomain,
    predomain,
    phase: status === 'approved' ? 'approved' : 'pending',
    sourceType: ctx?.sourceType ?? 'git',
  });
}
