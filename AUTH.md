# Authentication (AuthN) and Authorization (AuthZ)

This document describes how identity and permissions work in Pixel Place.

---

## Authentication (AuthN)

**Goal:** Establish *who* the user is. Identity comes only from a verified JWT; never trust `username` or `role` from query params or request body.

### Flow

1. **Login** — `POST /api/auth` with `{ action: 'login', username, password }`.
   - Backend checks credentials (Firestore user or server-only admin list from env).
   - On success, returns a **JWT** and user object. Client stores the token (e.g. `localStorage`) and sends it on subsequent requests.

2. **Register** — `POST /api/auth` with `{ action: 'register', username, password, gender? }`.
   - New users are always created with `role: 'user'` and default coins. Client cannot set `role` or `coins` for signup.

3. **Token verification** — `GET /api/auth` with `Authorization: Bearer <token>`.
   - Returns current user if the token is valid and not expired.

### Where AuthN is enforced

- **Next.js API routes:** Use `getAuthUser(request)` from `lib/auth.ts` or `requireAuth(request)` from `lib/middleware.ts`. Both read `Authorization: Bearer <token>` and validate the JWT.
- **Cloud Functions:** Use `getAuthFromRequest(req)` from `functions/src/authMiddleware.ts`. Same idea: JWT only; no trust of body/query.

### JWT contents

- Payload includes `username`, `role` (and optionally `id`). Signed with `JWT_SECRET`. Set a strong secret in production; reject requests when secret is default or missing.

---

## Authorization (AuthZ)

**Goal:** Decide *what* the authenticated user is allowed to do. Always enforce after authentication.

### Roles

| Role         | Description |
|--------------|-------------|
| `user`       | Normal user. Can access own data, play games, use coins, etc. |
| `admin`      | Can manage content, view reports, approve/reject submissions, manage users (within scope). |
| `head_admin` | Same as admin; can also ban users and perform sensitive moderation. |

### Helpers (Next.js — `lib/middleware.ts`)

| Helper | Use when |
|--------|----------|
| `requireAuth(request)` | Route requires any logged-in user. Returns 401 if no/invalid token. |
| `requireAdmin(request)` | Route is admin-only. Returns 401 if not logged in, 403 if not admin. |
| `requireOwnerOrAdmin(request, resourceOwnerUsername)` | Requester must be the resource owner (e.g. same username) or an admin. Use for draft, profile, “my games”, etc. |

### Helpers (Cloud Functions — `functions/src/authMiddleware.ts`)

| Helper | Use when |
|--------|----------|
| `getAuthFromRequest(req)` | Get current user or null. No response sent. |
| `requireAuth(req, res)` | Send 401 if not authenticated. |
| `requireAdmin(req, res)` | Send 401/403 if not admin. |
| `requireOwnerOrAdmin(req, res, resourceOwner)` | Send 401/403 if not owner and not admin. |
| `isAdmin(auth)` | Boolean check only. |

### Permission matrix (high level)

| Action / Resource | user | admin | head_admin |
|-------------------|------|-------|------------|
| Login, register   | ✓    | ✓     | ✓          |
| Own profile, draft, games | ✓ | ✓ (can view others) | ✓ |
| Publish game      | ✓ (own) | ✓   | ✓          |
| Prebuilt games CRUD | —  | ✓     | ✓          |
| Reports, appeals, bans | View own / respond | Full | Full + ban |
| User list (GET /users) | — (or restricted) | ✓ | ✓ |
| Add coins (paid/Admin) | — | ✓   | ✓          |
| AI generate (paid model) | ✓ (own coins) | ✓ | ✓ |

---

## Checklist for new endpoints

- [ ] **AuthN:** Identify the user from JWT only (`getAuthUser` / `getAuthFromRequest`). Do not use `body.username` or `query.username` as identity.
- [ ] **AuthZ:** After establishing identity, enforce role or ownership with `requireAdmin` or `requireOwnerOrAdmin` where appropriate.
- [ ] **Registration:** Never allow client to set `role` or privileged fields on signup; new accounts are `user` with default coins.
- [ ] **Sensitive ops:** Admin-only or owner-only actions must explicitly check role or ownership and return 403 when not allowed.

See also **SECURITY_AUDIT.md** for password handling, JWT secret, and HTTPS.
