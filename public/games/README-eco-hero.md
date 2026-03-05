# Eco Hero — API key in Firebase / Google Cloud

The game uses **no API key in the browser**. All Claude (Anthropic) calls go through your backend at `/api/eco-hero/chat`, which reads the key from the server environment.

## Where to set the key

- **Local dev:** Add `ANTHROPIC_API_KEY=sk-ant-...` to `.env.local` in the project root.
- **Firebase (Cloud Functions):** Add to `functions/.env` (see `functions/ENV_README.md`). Deploy with `firebase deploy --only functions`. Do not commit `functions/.env`.
- **Google Cloud (Secret Manager):** Create a secret for `ANTHROPIC_API_KEY` and inject it into your runtime (e.g. Cloud Run or Cloud Functions v2).
- **Vercel / Railway:** Set `ANTHROPIC_API_KEY` in the project’s Environment Variables in the dashboard.

The same variable is used for game generation and Eco Hero; one key is enough.
