/**
 * Generates public/sitemap.xml (index), sitemap-main.xml, sitemap-historimac.xml, robots.txt
 * Run: node scripts/generate-sitemap.mjs (also runs in npm run build)
 *
 * Keep APP_TABS in sync with lib/appTabSeo.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const SITE = 'https://pixelplaceofficial.com';
const LOGO = `${SITE}/logo.png`;
const today = new Date().toISOString().slice(0, 10);

/** @type {Array<{ path: string; priority: string; changefreq: string; imageTitle: string }>} */
const APP_TABS = [
  { path: '/games', priority: '0.95', changefreq: 'daily', imageTitle: 'Pixel Place Games' },
  { path: '/studio', priority: '0.90', changefreq: 'weekly', imageTitle: 'Pixel Place Game Studio' },
  { path: '/avatarshop', priority: '0.88', changefreq: 'weekly', imageTitle: 'Pixel Place Avatar Shop' },
  { path: '/coins', priority: '0.85', changefreq: 'weekly', imageTitle: 'Pixel Coins' },
  { path: '/friends', priority: '0.84', changefreq: 'weekly', imageTitle: 'Pixel Place Friends' },
  { path: '/report', priority: '0.80', changefreq: 'monthly', imageTitle: 'Pixel Place Safety' },
  { path: '/settings', priority: '0.82', changefreq: 'weekly', imageTitle: 'Pixel Place Settings' },
  { path: '/donation', priority: '0.75', changefreq: 'monthly', imageTitle: 'Support Pixel Place' },
];

const MARKETING = [
  { path: '/', priority: '1.0', changefreq: 'daily', imageTitle: 'Pixel Place — Free Browser Games' },
  { path: '/about', priority: '0.96', changefreq: 'weekly', imageTitle: 'About Pixel Place' },
];

const HISTORIMAC_HUB = {
  path: '/historimac',
  priority: '0.86',
  changefreq: 'weekly',
  imageTitle: 'HistoriMac on Pixel Place',
};

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry({ path, priority, changefreq, imageTitle }) {
  const full = path === '/' ? `${SITE}/` : `${SITE}${path}`;
  return `  <url>
    <loc>${escapeXml(full)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <image:image xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
      <image:loc>${escapeXml(LOGO)}</image:loc>
      <image:title>${escapeXml(imageTitle)}</image:title>
    </image:image>
  </url>`;
}

function buildUrlset(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Pixel Place sitemap — ${entries.length} URLs — ${today} -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(urlEntry).join('\n')}
</urlset>
`;
}

function buildSitemapIndex(files) {
  const body = files
    .map(
      (file) => `  <sitemap>
    <loc>${escapeXml(`${SITE}/${file}`)}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Pixel Place sitemap index -->
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}

const historimacSrc = fs.readFileSync(path.join(root, 'lib/historiMacVersions.ts'), 'utf8');
const historimacIds = [...historimacSrc.matchAll(/^\s+id: '([^']+)'/gm)].map((m) => m[1]);

const mainEntries = [
  ...MARKETING,
  ...APP_TABS,
  HISTORIMAC_HUB,
];

const historimacEntries = historimacIds.map((id) => ({
  path: `/historimac/${encodeURIComponent(id)}`,
  priority: '0.65',
  changefreq: 'monthly',
  imageTitle: `HistoriMac ${id} — Pixel Place`,
}));

fs.writeFileSync(path.join(publicDir, 'sitemap-main.xml'), buildUrlset(mainEntries));
fs.writeFileSync(path.join(publicDir, 'sitemap-historimac.xml'), buildUrlset(historimacEntries));
fs.writeFileSync(
  path.join(publicDir, 'sitemap.xml'),
  buildSitemapIndex(['sitemap-main.xml', 'sitemap-historimac.xml']),
);

const tabAllows = APP_TABS.map((t) => `Allow: ${t.path}`).join('\n');
const robots = `User-agent: *
Allow: /
Allow: /about
Allow: /historimac
Allow: /historimac/
${tabAllows}

# Legacy aliases (redirect to / or tabs)
Disallow: /home
Disallow: /play
Disallow: /index.html
Disallow: /safety

# Account / auth (not for search)
Disallow: /verify
Disallow: /signoutall
Disallow: /mainlinelogin

Disallow: /api/

Sitemap: ${SITE}/sitemap.xml
`;

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots.trim() + '\n');

const total = mainEntries.length + historimacEntries.length;
console.log(
  `[sitemap] Wrote sitemap index + main (${mainEntries.length}) + historimac (${historimacEntries.length}) = ${total} URLs`,
);
