# Security review — Pixel Place (2026)

Long-form audit of secrets exposure, auth boundaries, and abuse vectors. **This is not a penetration test**; it is a code-and-config review. Re-run after major changes.

---

## Executive summary

| Area | Risk | Status / action |
|------|------|-----------------|
| Secrets in git (`vercel.json`, docs) | **Critical** (historical) | `vercel.json` no longer embeds gate passwords; rotate any value ever committed. |
| Unauthenticated admin Next routes | **Critical** (dev / future Node deploy) | `reset-password`, `initialize-accounts`, `cleanup-old-admins` now require `ADMIN_SETUP_SECRET` + header `x-admin-setup-secret`. |
| JWT / `check-config` info leak | Low | Response is now `{ ok: true }` only (no `jwtSecretSet`). |
| Site-wide password gate | — | **Removed** (`PrivateAccess` / `PasswordGate` deleted; no `NEXT_PUBLIC_ACCESS_PASSWORD`). |
| Firebase Web API key | — | **Not committed** — use `NEXT_PUBLIC_FIREBASE_*` at build time (`.env.example`). Restrict keys in Google Cloud / Firebase Console. |
| JWT in `localStorage` | Medium | XSS can steal token; mitigate with CSP, sanitization, dependency updates. |
| Global `Access-Control-Allow-Origin: *` | Low–medium | On static export, mostly affects public assets; tighten if you add credentialed cross-origin APIs on same host. |
| HistoriMac copilot BYOK | Medium | Logged-in relay reduces anonymous abuse; users’ keys pass through your backend — monitor rate limits / abuse. |
| Dependency CVEs | Ongoing | Run `npm audit` / Dependabot; plan Next major upgrades. |

---

## 1. Secrets & credentials

### 1.1 Never commit

- **Stripe** `sk_*`, **Anthropic** / **OpenAI** keys, **JWT_SECRET**, **ADMIN_PASSWORD**, **webhook secrets**, **Pyx** keys.
- **`functions/.env`** is gitignored — keep it that way.
- **Service account JSON** — gitignored (`scripts/serviceAccountKey.json`); never paste into issues or chat.

### 1.2 Found in repository (remediate / rotate)

1. **`vercel.json`** — historically contained a gate password; removed. Rotate if still in use anywhere.
2. **`START_HERE.md` / `QUICK_START.md`** — sample admin credentials → **treat as examples only**; production must use `ADMIN_*` env / Firestore config, not copied defaults.
3. **Firebase Web config** — supplied via **`NEXT_PUBLIC_FIREBASE_*`** at build time only (not hardcoded in `lib/firebaseConfig.ts`). Still treat as public in the bundle; enforce with **App Check**, **Auth**, and **Firestore rules**, plus **API key restrictions** in Google Cloud Console.

### 1.3 `NEXT_PUBLIC_*` variables

Anything prefixed `NEXT_PUBLIC_` is **bundled into client JavaScript**. Never put server secrets there.

---

## 2. Authentication & authorization

### 2.1 Production API (Firebase Cloud Function `api`)

- Uses **JWT** (`Authorization: Bearer`) with **`JWT_SECRET`**.
- If `JWT_SECRET` is still the default `your-secret-key-change-in-production`, **`getAuthFromRequest` rejects all tokens** (see `authMiddleware.ts`).
- **Set a strong `JWT_SECRET`** in Google Cloud / Firebase Functions environment.

### 2.2 Client session vs API token

- **Username/password login** via `POST /api/auth` (rewritten to Cloud Function) sets **`pixelPlaceAuthToken`** in `localStorage`.
- **Session restore** from `sessionStorage` can show a user as “logged in” **without** restoring that token → features like Pixel Monkey return **401** until sign-in again (by design).

### 2.3 Admin accounts

- **Cloud Functions**: `ADMIN_ACCOUNTS_JSON` or `ADMIN_USERNAME` + `ADMIN_PASSWORD` (or Firestore `config/admin`). Default dev fallback `admin`/`admin` in code — **must be overridden in production**.

### 2.4 Dangerous Next.js routes (local / hypothetical Node hosting)

With `output: 'export'`, **Next API routes are not deployed** on Firebase Hosting (all `/api/*` goes to the Cloud Function). These routes still matter for:

- Developers running **`next dev`**
- Any future deploy that **enables** Next server routes

**Locked behind `ADMIN_SETUP_SECRET` + header `x-admin-setup-secret`:**

- `POST /api/admin/reset-password` — was **unauthenticated arbitrary password reset** by username.
- `POST /api/admin/initialize-accounts` — mass create/update admins in SQLite.
- `POST /api/cleanup-old-admins` — **deletes Firestore users** matching a hardcoded list.

---

## 3. Data exposure

### 3.1 User lists

- **`GET /users`** (and similar) may return profile data for many users — confirm Firestore rules and product need; restrict or paginate if possible.

### 3.2 API responses

- Do not return `password_hash` or raw passwords (see `SECURITY_AUDIT.md`).

---

## 4. Supply chain & XSS

- Run **`npm audit`** regularly; address high/critical where feasible.
- **`dangerouslySetInnerHTML`** appears in a few components — ensure inputs are never user-controlled without sanitization.
- **innerHTML** in some games — keep game content static or sanitized.

---

## 5. Infrastructure

- **HTTPS**: Firebase Hosting / Vercel default — good.
- **CORS**: `next.config.js` sets `Access-Control-Allow-Origin: *` for all paths — acceptable for a fully public static site; revisit if you serve authenticated cross-origin APIs from the same Next app.

---

## 6. Third-party & BYOK

- **HistoriMac Pixel Monkey**: User API keys are sent **through your backend** to OpenAI/Anthropic — you are a **processor**; log retention and abuse policies should match your privacy stance.
- **Stripe**: Webhook signature verification must stay enabled (verify in `webhook` handler).

---

## 7. Checklist before production

- [ ] `JWT_SECRET` set and **not** default.
- [ ] `ADMIN_*` set in production; no reliance on `admin`/`admin`.
- [ ] No secrets in `vercel.json` or committed `.env`.
- [ ] Firebase API key restricted by referrer / app.
- [ ] Firestore / Storage **security rules** reviewed (not part of this doc).
- [ ] If using local admin Next routes: set **`ADMIN_SETUP_SECRET`** and use header on requests.
- [ ] Rotate any credential that ever appeared in git history.

---

## 8. References

- `SECURITY_AUDIT.md` — password hashing and prior fixes.
- `HISTORIMAC_COPILOT.md` — Pixel Monkey / JWT requirement.
- `.env.example` — variable names and comments.

*Generated as part of a repository security pass; update this file when architecture or threats change.*
