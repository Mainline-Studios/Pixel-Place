#!/usr/bin/env node
/**
 * Copies Latest Update Logs into public/ for static hosting fallback
 * (Settings → Release notes when GitHub is behind or API fails).
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const srcDir = path.join(root, 'Latest Update Logs');
const outDir = path.join(root, 'public', 'latest-update-logs');

function filenameToSlug(filename) {
  return filename
    .replace(/\.md$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseVersion(filename) {
  const m = filename.match(/^(\d+(?:\.\d+)?)/);
  return m ? m[1] : null;
}

function compareFiles(a, b) {
  const aLatest = /LATEST/i.test(a);
  const bLatest = /LATEST/i.test(b);
  if (aLatest !== bLatest) return aLatest ? -1 : 1;
  const av = parseVersion(a);
  const bv = parseVersion(b);
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

if (!fs.existsSync(srcDir)) {
  console.warn('[bundle-update-logs] Missing folder:', srcDir);
  process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });
const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.md'));
const logs = [];

for (const filename of files.sort(compareFiles)) {
  const src = path.join(srcDir, filename);
  const dest = path.join(outDir, filename);
  fs.copyFileSync(src, dest);
  const slug = filenameToSlug(filename);
  logs.push({
    slug,
    filename,
    title: filename.replace(/\.md$/i, '').replace(/\s+LATEST$/i, ''),
    version: parseVersion(filename),
    isLatest: /LATEST/i.test(filename),
    staticUrl: `/latest-update-logs/${encodeURIComponent(filename)}`,
  });
}

const manifest = {
  bundledAt: new Date().toISOString(),
  folder: 'Latest Update Logs',
  compiler: 'pixel-place-markdown/1',
  logs,
};

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`[bundle-update-logs] Wrote ${logs.length} logs to public/latest-update-logs/`);
