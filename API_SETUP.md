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

### Step 3: Build with API URL

Before building the static app, set `NEXT_PUBLIC_API_URL` to your Cloud Functions base:

```bash
NEXT_PUBLIC_API_URL=https://us-central1-pixel-place-823b1.cloudfunctions.net npm run build
```

Or create `.env.production`:

```
NEXT_PUBLIC_API_URL=https://us-central1-pixel-place-823b1.cloudfunctions.net
NEXT_PUBLIC_BASE_URL=https://pixelplaceofficial.com
```

Then:

```bash
npm run build
```

### Step 4: Deploy Hosting

```bash
firebase deploy --only hosting
```

### Step 5: Verify

- Open your hosted URL.
- In DevTools → Network, confirm API calls go to `us-central1-pixel-place-823b1.cloudfunctions.net`.

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
