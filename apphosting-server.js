const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');

const OUT_DIR = path.join(__dirname, 'out');
const PORT = Number(process.env.PORT || 8080);

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

function toSafePath(urlPathname) {
  const decoded = decodeURIComponent(urlPathname);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  return normalized === path.sep ? '' : normalized;
}

function resolveCandidates(urlPathname) {
  const safePath = toSafePath(urlPathname).replace(/^[/\\]+/, '');
  const hasExtension = path.extname(safePath) !== '';
  const candidates = [];

  if (safePath) {
    candidates.push(path.join(OUT_DIR, safePath));
    if (!hasExtension) {
      candidates.push(path.join(OUT_DIR, `${safePath}.html`));
      candidates.push(path.join(OUT_DIR, safePath, 'index.html'));
    }
  } else {
    candidates.push(path.join(OUT_DIR, 'index.html'));
  }

  // SPA fallback used by current firebase hosting rewrites.
  candidates.push(path.join(OUT_DIR, 'index.html'));
  return candidates;
}

function streamFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  res.statusCode = 200;
  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url || '/', 'http://localhost');
  const candidates = resolveCandidates(requestUrl.pathname);

  for (const candidate of candidates) {
    try {
      const stat = fs.statSync(candidate);
      if (stat.isFile()) {
        return streamFile(candidate, res);
      }
    } catch {
      // Try next candidate.
    }
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Not Found');
});

if (!fs.existsSync(OUT_DIR)) {
  console.error('Missing static output directory "out". Run "npm run build" first.');
  process.exit(1);
}

server.listen(PORT, () => {
  console.log(`App Hosting static server listening on port ${PORT}`);
});
