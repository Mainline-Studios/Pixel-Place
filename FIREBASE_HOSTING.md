# Firebase Hosting – pixelplaceofficial.com

Deploy the static Next.js export to Firebase Hosting and serve it on your custom domain.

## Prerequisites

1. **Firebase CLI** installed: `npm install -g firebase-tools`
2. **Logged in**: `firebase login`
3. **Cloud Functions** deployed (API backend): `cd functions && npm run build && firebase deploy --only functions`
4. **GitHub Actions**: add repository **Secrets** for every `NEXT_PUBLIC_FIREBASE_*` and `NEXT_PUBLIC_API_URL` (see `.github/workflows/deploy-firebase.yml`) so Hosting’s `npm run build` embeds your Firebase Web config.

### GitHub Actions secrets (deploy-firebase workflow)

Create secrets matching the `env` block in `.github/workflows/deploy-firebase.yml`, including:

- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`
- Optional: `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_API_URL`

## 1. Set production environment variables

Create or update `.env.production` (or set these before building):

```bash
# Cloud Functions API (required for static export)
NEXT_PUBLIC_API_URL=https://us-central1-YOUR_PROJECT.cloudfunctions.net

# Firebase Web config (required — copy from Firebase Console → Project settings → Web app; do not commit real keys)
# See .env.example for all NEXT_PUBLIC_FIREBASE_* variable names.

# Base URL for Stripe redirects
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Stripe publishable key (if using payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

Or pass inline for a one-off deploy (include every `NEXT_PUBLIC_FIREBASE_*` you use):

```bash
NEXT_PUBLIC_API_URL=... NEXT_PUBLIC_FIREBASE_API_KEY=... NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=... \
NEXT_PUBLIC_FIREBASE_PROJECT_ID=... NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=... \
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=... NEXT_PUBLIC_FIREBASE_APP_ID=... \
NEXT_PUBLIC_BASE_URL=... npm run build
```

## 2. Build and deploy

Hosting serves whatever is in the **`out/`** folder from **`next build`**. This repo’s **`firebase.json`** runs **`npm run build` automatically before any Hosting deploy** (`hosting.predeploy`), so a plain deploy always ships a fresh static export:

```bash
firebase deploy --only hosting
# or
npm run deploy
```

You can still run **`npm run build`** yourself first if you want to verify the build before uploading.

**One command** — build Next.js + build functions + deploy:

```bash
npm run deploy:full
```

### Site still looks old after deploy?

1. **Hard refresh** the tab (e.g. Cmd+Shift+R / Ctrl+Shift+R) or open in a private window — the browser or a CDN edge may cache JS/CSS.
2. Before the predeploy hook existed, **`firebase deploy` without `npm run build`** re-uploaded an **old `out/`**; that’s the usual reason changes didn’t appear.

After deploy, the app will be live at:
- `https://pixel-place-823b1.web.app`
- `https://pixel-place-823b1.firebaseapp.com`

## 3. Add custom domain (pixelplaceofficial.com)

1. Go to [Firebase Console](https://console.firebase.google.com/) → **pixel-place-823b1** → **Hosting**
2. Click **Add custom domain**
3. Enter `pixelplaceofficial.com` and click **Continue**
4. Choose how to verify:
   - **A records** (recommended): Add the A records shown by Firebase to your DNS
   - **TXT record**: Add the verification TXT record first, then add A records
5. After adding the records, click **Verify**
6. Firebase will provision an SSL certificate (can take a few minutes to a few hours)

### DNS records (typical)

Firebase usually provides something like:

| Type | Name | Value |
|------|------|-------|
| A | @ | 151.101.1.195 (or IPs shown in console) |
| A | @ | 151.101.65.195 |
| CNAME | www | pixel-place-823b1.web.app |

Add these where you manage DNS (e.g. Squarespace, Cloudflare, Namecheap, etc.).

**Note:** If `pixelplaceofficial.com` is on Squarespace:
- Go to **Settings** → **Domains** → **DNS Settings**
- Add the A and CNAME records from Firebase
- Remove any existing A/CNAME that point to Vercel or another host

## 4. Verify

- Visit `https://pixelplaceofficial.com`
- Ensure API calls go to Cloud Functions (check Network tab for requests to `us-central1-pixel-place-823b1.cloudfunctions.net`)

## Troubleshooting

- **404 on refresh**: Next.js static export serves real HTML files; no extra rewrites are needed.
- **API calls fail**: Confirm `NEXT_PUBLIC_API_URL` is set at build time and Cloud Functions are deployed.
- **Domain not resolving**: Wait up to 48 hours for DNS; SSL can take up to 24 hours.
