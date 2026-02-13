# API Setup Guide – Make the API Work

The app uses **Firebase Cloud Functions** as the backend API when deployed. Follow these steps to get it working.

---

## Option 1: Local Development (API works immediately)

Run the Next.js dev server. API routes are served by Next.js:

```bash
npm run dev
```

Open http://localhost:3000. The API uses relative URLs (`/api/...`), so it works with no extra setup.

---

## Option 2: Production (Firebase Hosting + Cloud Functions)

For production (e.g. pixelplaceofficial.com), the static app is on Firebase Hosting and the API runs in Cloud Functions.

### Step 1: Install Firebase CLI & Log in

```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Deploy Cloud Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

On success you’ll see something like:

```
✔  functions[api(us-central1)]: Successful create operation.
Function URL (api(us-central1)): https://us-central1-pixel-place-823b1.cloudfunctions.net/api
```

### Step 3: Build the app

With Firebase Hosting rewrites (configured in `firebase.json`), `/api/**` requests are proxied to Cloud Functions. You can leave `NEXT_PUBLIC_API_URL` unset — the app uses relative URLs.

```bash
npm run build
```

For a custom domain or Stripe, optionally set in `.env.production`:

```
NEXT_PUBLIC_BASE_URL=https://pixelplaceofficial.com
```

### Step 4: Deploy Hosting + Functions

Firebase Hosting is configured to proxy `/api/**` to the Cloud Function, so the app can use relative URLs (no `NEXT_PUBLIC_API_URL` needed).

```bash
firebase deploy
```

Or from the project root:

```bash
npm run deploy
```

### Step 5: Verify

- Open your hosted URL.
- In DevTools → Network, API calls go to your site domain (e.g. `yoursite.web.app/api/users`) and are proxied to Cloud Functions.

---

### Step 6 (optional): Auto-deploy on push

A GitHub Actions workflow (`.github/workflows/deploy-firebase.yml`) deploys to Firebase when you push to `main`.

1. Get a CI token: `firebase login:ci` (run locally, follow prompts).
2. In GitHub → Repo → Settings → Secrets and variables → Actions, add secret:
   - Name: `FIREBASE_TOKEN`
   - Value: the token from step 1.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API returns 404 | Deploy functions: `cd functions && npm run build && firebase deploy --only functions` |
| CORS errors | Cloud Functions use `cors({ origin: true })` – check you’re on the right domain |
| API works locally but not in production | Ensure `NEXT_PUBLIC_API_URL` is set **before** running `npm run build` |
| Firestore permission denied | In Firebase Console → Firestore → Rules, set rules that allow read/write for your app (e.g. test mode for dev) |

---

## Environment Variables Summary

| Variable | When to set | Purpose |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Production build | Base URL for API (Cloud Functions). Leave empty for local dev. |
| `NEXT_PUBLIC_BASE_URL` | Production build | App base URL (e.g. https://pixelplaceofficial.com) |
| `JWT_SECRET` | Cloud Functions | Secret for JWT auth (set in Firebase Console → Functions → Secrets or `firebase functions:config:set`) |
| `FIREBASE_SERVICE_ACCOUNT` | Next.js API routes (local) | JSON string for Firebase Admin SDK (optional for local dev) |
