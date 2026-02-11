# Firebase Hosting – pixelplaceofficial.com

Deploy the static Next.js export to Firebase Hosting and serve it on your custom domain.

## Prerequisites

1. **Firebase CLI** installed: `npm install -g firebase-tools`
2. **Logged in**: `firebase login`
3. **Cloud Functions** deployed (API backend): `cd functions && npm run build && firebase deploy --only functions`

## 1. Set production environment variables

Create or update `.env.production` (or set these before building):

```bash
# Cloud Functions API (required for static export)
NEXT_PUBLIC_API_URL=https://us-central1-pixel-place-823b1.cloudfunctions.net

# Base URL for Stripe redirects
NEXT_PUBLIC_BASE_URL=https://pixelplaceofficial.com

# Stripe keys (if using payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

Or pass inline for a one-off deploy:
```bash
NEXT_PUBLIC_API_URL=https://us-central1-pixel-place-823b1.cloudfunctions.net NEXT_PUBLIC_BASE_URL=https://pixelplaceofficial.com npm run build
```

## 2. Build and deploy

```bash
# Build static export (outputs to out/)
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Or use the combined script:
```bash
npm run deploy
```

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
