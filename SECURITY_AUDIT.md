# Security Audit – Pixel Place

This document summarizes the security audit and fixes applied. **Never store or transmit raw passwords; always hash (e.g. bcrypt) before persisting.**

---

## 1. Passwords – FIXED

### What was wrong
- **Cloud Functions** `POST/PUT /users`: `password_hash` was set from `req.body.password` (raw).
- **Next.js** `app/api/users`: `password_hash` was set from `newUser.password` / `updatedUser.password` (raw).
- **API responses** returned `user.password` or `doc.password_hash` to the client (leaking hashes).
- **add-coins**: When auto-creating admin users, stored `adminAccount.password` as `password_hash`.
- **Migration script** wrote `user.password` as `password_hash` without hashing.

### Fixes applied
- **Functions** `POST/PUT /users`: Hash with `bcrypt.hash(plainPassword, 10)` before storing. On update without new password, keep existing `password_hash`. Response omits `password_hash` and sets `password: ''`.
- **Next.js** `app/api/users`: Use `hashPassword()` on create; on update hash only when a new password is supplied, otherwise keep existing hash. Responses never include hash; `userFromDoc` returns `password: ''`.
- **Functions** `userFromDoc`: Returns `password: ''` so no hash is ever sent to client.
- **lib/auth.ts** `userFromDoc`: Returns `password: ''`.
- **app/api/add-coins**: Use `hashPassword(adminAccount.password)` when creating admin users.
- **app/api/friends**, **lib/firestoreClient**: `userFromDoc` returns `password: ''`.
- **scripts/migrate-data-to-firebase.ts**: Hash `user.password` with `hashPassword()` before writing `password_hash`.

### Rules
- **Store**: Only ever persist `password_hash` (bcrypt), never plaintext.
- **Response**: Never return `password` or `password_hash` in JSON; use `password: ''` or omit.
- **Update**: When updating a user without a new password, keep the existing hash; do not overwrite with raw.

---

## 2. Authentication & Authorization – DONE (previous work)

- Identity from **JWT only**; no trust of `?username=` or `body.username`.
- Backend uses `requireAuth` / `requireAdmin` / `requireOwnerOrAdmin` so only allowed users can perform actions.
- Sensitive routes (published, prebuilt, skins, users, gamesubmissions) enforce auth and, where needed, role or ownership.

---

## 3. Remaining recommendations

### 3.1 Admin account list (medium)
- **Issue**: `ADMIN_ACCOUNTS_LIST` in `lib/storage.ts` (and similar in add-coins, cleanup-old-admins) contains plaintext passwords in source code.
- **Recommendation**: Move to environment variables or a server-only config; never ship admin passwords in client bundle. Use `hashPassword` when creating these accounts and verify with `bcrypt.compare` at login.

### 3.2 Offline login (low)
- **Issue**: UserContext offline fallback compares `found.password !== password`; with API now returning `password: ''`, this path only works if old data with a stored value exists locally.
- **Recommendation**: Treat offline login as best-effort only, or remove it and require backend login for security.

### 3.3 PasswordGate / PrivateAccess (low)
- **Issue**: Hardcoded or env-based access password; if weak or leaked, anyone can bypass.
- **Recommendation**: Keep in env, use a strong value, and rotate if exposed.

### 3.4 GET /users (consider)
- **Issue**: Returns list of all users (without passwords). May be needed for game features but exposes usernames and profile data.
- **Recommendation**: If not required for all clients, restrict to authenticated users or admins; or replace with a “search user” or “get current user” API.

### 3.5 JWT secret
- **Issue**: Default fallback `your-secret-key-change-in-production` in code.
- **Recommendation**: Require `JWT_SECRET` from environment in production; fail startup if missing.

### 3.6 Dependency vulnerabilities – partial
- **Done**: `npm audit fix` applied; functions have 0 vulnerabilities; root had some auto-fixed (e.g. ajv, hono, tar).
- **Remaining**: Root may still report vulnerabilities in transitive deps (e.g. `next`, `eslint-config-next`, `firebase-tools`, `glob`/`minimatch`). Fixing these typically requires major upgrades (`npm audit fix --force`). Run `npm audit` periodically and plan upgrades for Next.js and tooling when feasible.

### 3.7 HTTPS and cookies – documented
- **Recommendation**: Ensure production uses HTTPS only. If using cookie-based sessions, set `Secure`, `HttpOnly`, and `SameSite`.
- **Applied**: Production must be served over HTTPS (e.g. Vercel/Firebase default). If you add cookie-based sessions later, set `Secure`, `HttpOnly`, and `SameSite` on cookies.

---

## 4. Checklist for new auth-related code

- [ ] Never store or log raw passwords.
- [ ] Hash passwords with bcrypt (or equivalent) before persisting.
- [ ] Never return `password` or `password_hash` in API responses.
- [ ] Identify users from JWT (or other server-verified token), not from query/body.
- [ ] For each action, enforce authorization (owner or admin) after authentication.

---

## 5. Production deployment

- **HTTPS**: Serve the app over HTTPS only (Vercel/Firebase do this by default).
- **JWT_SECRET**: Set a strong `JWT_SECRET` in production; auth fails if it is missing or still the default.
- **Cookies**: If you add cookie-based sessions, use `Secure`, `HttpOnly`, and `SameSite`.

---

*Last updated: after password hashing, response-sanitization, admin-env, GET /users auth, and JWT-secret checks.*
