# Why the cloud "removes" your edits

**Every time you run `firebase deploy --only functions`, Firebase replaces ALL environment variables in the cloud with whatever is in this folder's `.env` file.**

So:
- If you set JWT_SECRET (or anything) in **Google Cloud Console**, the **next deploy** will overwrite it with the contents of `functions/.env`.
- If a variable is **not** in `functions/.env`, it will be **removed** from the cloud on the next deploy.

## What to do

**Use `functions/.env` as the only place for secrets.** The Console is overwritten on each deploy.

1. **Create or edit `functions/.env`** (copy from `.env.example` if needed):
   ```bash
   cd functions
   cp .env.example .env
   # Then edit .env and set real values (do not commit .env)
   ```

2. **Put every value you want in production inside `functions/.env`**, for example:
   ```
   JWT_SECRET=paste-your-long-random-string-here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password

Optional (Next.js dev / maintenance tools only): `ADMIN_SETUP_SECRET` — required header `x-admin-setup-secret` for `/api/admin/*` and cleanup routes. See `docs/SECURITY_REVIEW_2026.md`.
   AI_PROVIDER=groq
   GROQ_API_KEY=your-real-groq-key
   ANTHROPIC_API_KEY=your-key-if-you-use-it
   OPENAI_API_KEY=sk-...   # optional: server-side OpenAI (HistoriMac Computer Use uses user keys)
   ```

3. **Deploy.** Those values will be pushed to the cloud and will stay until the next deploy (which will again use whatever is in `.env`).

4. **Do not commit `functions/.env`** (it’s in `.gitignore`). Keep a backup somewhere safe.

Summary: **Edit `functions/.env` locally. Deploy pushes it to the cloud. Console edits are overwritten on every deploy.**

---

## Firebase Hosting + custom domain (e.g. Squarespace)

If the app is on **Firebase Hosting** with a custom domain and `firebase.json` rewrites `/api/**` to the `api` function:

- **Do not set** `NEXT_PUBLIC_API_URL` when building. The app will call `/api/auth`, `/api/generate-game`, etc. as same-origin; Hosting sends those to the Cloud Function.
- **Set `JWT_SECRET`** in `functions/.env` and deploy. If `JWT_SECRET` is missing or still the default, the Cloud Function rejects all auth (login works but generate-game and other protected routes return “not logged in”). Use a long random string and keep it the same across deploys.
