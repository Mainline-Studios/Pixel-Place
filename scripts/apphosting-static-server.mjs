import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const outDir = resolve(process.cwd(), 'out');
const port = Number(process.env.PORT || 8080);

const contentTypeByExt = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function safePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const normalized = normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, '');
  return normalized.startsWith('/') ? normalized.slice(1) : normalized;
}

async function readFirstExisting(candidates) {
  for (const relPath of candidates) {
    const absPath = resolve(outDir, relPath);
    if (!absPath.startsWith(outDir)) continue;
    try {
      const content = await readFile(absPath);
      return { absPath, content };
    } catch {
      // Try next candidate.
    }
  }
  return null;
}

const server = createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url || '/', 'http://localhost');
    const rel = safePath(reqUrl.pathname);
    const hasExt = extname(rel).length > 0;
    const candidates = [];

    if (!rel || rel === '.') {
      candidates.push('index.html');
    } else {
      candidates.push(rel);
      candidates.push(join(rel, 'index.html'));
      if (!hasExt) candidates.push(`${rel}.html`);
    }
    candidates.push('index.html');

    const file = await readFirstExisting(candidates);
    if (!file) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Not Found');
      return;
    }

    const ext = extname(file.absPath).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', contentTypeByExt[ext] || 'application/octet-stream');
    res.end(file.content);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(`Internal Server Error: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`App Hosting static server listening on :${port}`);
});
