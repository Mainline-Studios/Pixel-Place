import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const rootDir = path.join(process.cwd(), 'out');
const port = Number(process.env.PORT || 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
};

function toSafeRelativePath(urlPath) {
  try {
    const decoded = decodeURIComponent(urlPath);
    const normalized = path.posix.normalize('/' + decoded).replace(/^\/+/, '');
    if (normalized.includes('..')) return null;
    return normalized;
  } catch {
    return null;
  }
}

async function readIfExists(filePath) {
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) return null;
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

async function resolveAsset(requestPath) {
  const safeRel = toSafeRelativePath(requestPath);
  if (safeRel === null) return null;

  const candidates = [];
  if (!safeRel || safeRel.endsWith('/')) {
    candidates.push(path.join(rootDir, safeRel, 'index.html'));
  } else {
    candidates.push(path.join(rootDir, safeRel));
    candidates.push(path.join(rootDir, safeRel + '.html'));
    candidates.push(path.join(rootDir, safeRel, 'index.html'));
  }

  for (const candidate of candidates) {
    if (!candidate.startsWith(rootDir)) continue;
    const contents = await readIfExists(candidate);
    if (contents) {
      return {
        body: contents,
        ext: path.extname(candidate).toLowerCase(),
      };
    }
  }

  // SPA fallback for client-side routes.
  const fallback = path.join(rootDir, 'index.html');
  const fallbackContents = await readIfExists(fallback);
  if (!fallbackContents) return null;
  return { body: fallbackContents, ext: '.html' };
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    res.statusCode = 400;
    res.end('Bad Request');
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.end('Method Not Allowed');
    return;
  }

  const url = new URL(req.url, 'http://localhost');
  const asset = await resolveAsset(url.pathname);
  if (!asset) {
    res.statusCode = 404;
    res.end('Not Found');
    return;
  }

  const contentType = MIME[asset.ext] || 'application/octet-stream';
  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=120');
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  res.end(asset.body);
});

server.listen(port, () => {
  console.log(`[apphosting-static-server] Serving out/ on :${port}`);
});
