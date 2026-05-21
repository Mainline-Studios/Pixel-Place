/**
 * Regenerates public/sitemap.xml before static export.
 * Run: node scripts/generate-sitemap.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const SITE = 'https://pixelplaceofficial.com';
const today = new Date().toISOString().slice(0, 10);

const historimacSrc = fs.readFileSync(path.join(root, 'lib/historiMacVersions.ts'), 'utf8');
const historimacIds = [...historimacSrc.matchAll(/^\s+id: '([^']+)'/gm)].map((m) => m[1]);

const pages = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/about', priority: '0.95', changefreq: 'weekly' },
  ...historimacIds.map((id) => ({
    loc: `/historimac/${encodeURIComponent(id)}`,
    priority: '0.65',
    changefreq: 'monthly',
  })),
];

const urls = pages
  .map(
    (p) => `  <url>
    <loc>${SITE}${p.loc === '/' ? '/' : p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

fs.writeFileSync(path.join(root, 'public/sitemap.xml'), xml);
console.log(`[sitemap] Wrote ${pages.length} URLs to public/sitemap.xml`);
