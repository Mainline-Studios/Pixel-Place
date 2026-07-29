#!/usr/bin/env node
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { createServer } from 'node:http';

const root = resolve(process.cwd(), 'out');
const indexPath = 'index.html';
const port = Number(process.env.PORT || 8080);

const mimeByExt = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function contentType(filePath) {
  return mimeByExt[extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function safePathFromUrl(urlPathname) {
  const decoded = decodeURIComponent(urlPathname || '/');
  const clean = normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, '');
  return clean;
}

async function existingFilePath(pathname) {
  const safe = safePathFromUrl(pathname);
  const direct = join(root, safe);
  const html = join(root, `${safe}.html`);
  const dirIndex = join(root, safe, indexPath);
  const fallback = join(root, indexPath);

  for (const candidate of [direct, html, dirIndex, fallback]) {
    try {
      const s = await stat(candidate);
      if (s.isFile()) return candidate;
    } catch {
      // Continue trying remaining candidates.
    }
  }
  return null;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const filePath = await existingFilePath(url.pathname);
    if (!filePath) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }

    res.setHeader('Content-Type', contentType(filePath));
    createReadStream(filePath).pipe(res);
  } catch {
    res.statusCode = 500;
    res.end('Internal server error');
  }
});

server.listen(port, () => {
  // Keep output concise for Cloud Run logs.
  console.log(`Serving static export from out/ on :${port}`);
});
