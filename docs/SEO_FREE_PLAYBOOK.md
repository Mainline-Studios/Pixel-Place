# Pixel Place — free SEO & discovery playbook

Nothing here costs money. Ranking **first** on Google still takes time, backlinks, and Search Console — but these steps help crawlers and people find you.

## Already in the repo (deploy after changes)

- Rich meta tags, Open Graph, Twitter cards (`lib/seo.ts`, `app/layout.tsx`)
- JSON-LD: WebApplication, Organization, WebSite, FAQ (`lib/schemaOrg.ts`)
- Public **About** page: `/about` (keyword-rich, indexable HTML)
- `public/sitemap.xml` (auto-generated on `npm run build`)
- `public/robots.txt` points to the sitemap
- PWA `public/manifest.json` (install + categories)

## Do these manually (free)

### 1. Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://pixelplaceofficial.com`
3. Verify via HTML tag: set in `.env.local` then rebuild/deploy:
   ```bash
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-code-here
   ```
4. Submit sitemap: `https://pixelplaceofficial.com/sitemap.xml`
5. Request indexing for `/` and `/about`

### 2. Bing Webmaster Tools

Same steps at [Bing Webmaster](https://www.bing.com/webmasters) — submit the same sitemap.

### 3. Social “ads” (organic, free)

| Channel | What to post |
|--------|----------------|
| **YouTube** | Short clips of games; title/description: “Pixel Place free browser games” + link |
| **Discord** | Pin invite + “Play free at pixelplaceofficial.com” |
| **Reddit** | r/WebGames, r/incremental_games, r/gamedev (follow each sub’s rules; no spam) |
| **TikTok / Instagram** | 15s gameplay + link in bio |
| **GitHub** | README tagline + link; keep repo public for credibility |

### 4. On every video/post use the same phrase

> **Pixel Place** — free browser games & Game Studio · https://pixelplaceofficial.com

Consistency helps brand search (“pixel place games”).

### 5. Page speed & mobile

- Firebase Hosting is already fast; avoid huge unoptimized images in new marketing assets.
- Test: [PageSpeed Insights](https://pagespeed.web.dev/?url=https://pixelplaceofficial.com)

### 6. What we do **not** recommend without budget

- Buying fake traffic or “rank #1” services (often hurts SEO)
- Keyword stuffing hidden text (Google penalizes)
- Scraping emails for blast campaigns

## Fix “Duplicate without user-selected canonical” (Search Console)

Google flags this when many URLs serve the same app but lack a clear canonical (e.g. `/`, `/games`, `/settings` all looked like the homepage).

**What we did in code:**

- Homepage `/` and marketing `/about` + `/historimac/*` each have their own canonical URL.
- `/games` and other app tabs: `noindex` + canonical → `https://pixelplaceofficial.com`.
- Sitemap lists only `/`, `/about`, and HistoriMac invites (not `/games`).
- `robots.txt` disallows app-only paths.

**What you should do in Search Console:**

1. Use property **`https://pixelplaceofficial.com`** (not the `.web.app` URL).
2. **Settings → Crawling →** confirm sitemap submitted.
3. Open the duplicate report → **Validate fix** after deploy.
4. If both `pixel-place-823b1.web.app` and custom domain are properties, set the **custom domain as primary** or remove the `.web.app` property.

## After deploy checklist

- [ ] `npm run build` (regenerates sitemap)
- [ ] `firebase deploy --only hosting`
- [ ] Submit sitemap in Search Console
- [ ] Share `/about` link once on YouTube community tab

## Optional env vars

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_BASE_URL` | Canonical URL if not production domain |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google ownership verification |
