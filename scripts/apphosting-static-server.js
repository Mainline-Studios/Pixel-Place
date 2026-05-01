#!/usr/bin/env node
/**
 * Firebase App Hosting runtime command for static Next.js export output.
 * Serves files from /workspace/out and supports clean URLs.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const root = path.resolve(process.cwd(), 'out');
const port = Number(process.env.PORT || 8080);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.map': 'application/json; charset=utf-8',
};

function safePathFromUrl(reqUrl) {
  const url = new URL(reqUrl, 'http://localhost');
  const decoded = decodeURIComponent(url.pathname);
  const normalized = path.posix.normalize(decoded);
  // Prevent traversal outside of out/
  if (normalized.includes('..')) return null;
  return normalized;
}

function resolveCandidateFiles(pathname) {
  const clean = pathname === '/' ? '/index.html' : pathname;
  const rel = clean.replace(/^\/+/, '');
  const abs = path.join(root, rel);
  if (path.extname(rel)) {
    return [abs];
  }

  // Clean URL support:
  // /foo -> /foo, /foo.html, /foo/index.html, /index.html (SPA fallback)
  return [
    abs,
    `${abs}.html`,
    path.join(abs, 'index.html'),
    path.join(root, 'index.html'),
  ];
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  res.statusCode = 200;
  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });
  stream.pipe(res);
}

function sendText(res, code, text) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(text);
}

if (!fs.existsSync(root)) {
  console.error(`[apphosting-static-server] Missing build output directory: ${root}`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    sendText(res, 400, 'Bad request');
    return;
  }

  const pathname = safePathFromUrl(req.url);
  if (!pathname) {
    sendText(res, 400, 'Bad request');
    return;
  }

  const candidates = resolveCandidateFiles(pathname);
  for (const filePath of candidates) {
    try {
      const st = fs.statSync(filePath);
      if (st.isFile()) {
        sendFile(res, filePath);
        return;
      }
    } catch {
      // try next candidate
    }
  }

  sendText(res, 404, 'Not found');
});

server.listen(port, () => {
  console.log(`[apphosting-static-server] Serving ${root} on port ${port}`);
});
