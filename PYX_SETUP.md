# Pyx Content Filter Setup

Pixel Place calls the Pyx API for content filtering. Inappropriate text (score ≥ 0.7) is censored before display. Response includes `{ score, bad, censored }`; when `bad === true`, use `censored`.

## Required: Set PYX_SERVICE_URL

**Base URL:** `https://pyxaiapi-574247481583.us-central1.run.app`

**Firebase Cloud Functions:** Create `functions/.env` with:
```
PYX_SERVICE_URL=https://pyxaiapi-574247481583.us-central1.run.app
```

**Next.js / Vercel:** Add to `.env.local` or Vercel env:
```
PYX_SERVICE_URL=https://pyxaiapi-574247481583.us-central1.run.app
```

## Pyx API Endpoints

| Endpoint | Use | Trains Pyx |
|----------|-----|------------|
| **POST /score** | Normal checks (chat, messages) | No |
| **POST /ai-decide** | Game AI content (AI chat, prompts) | Yes |
| **POST /feedback** | Moderator override `{ text, safe }` | Yes |

Request body: `{ "text": "string" }`  
Response: `{ "score": number, "bad": boolean, "censored": string }`. When `bad === true`, use `censored`.

## Where Pyx is Used

- **/score:** User chat (FullScreenGameWrapper), messages API, FilteredText (game titles, descriptions, usernames)
- **/ai-decide:** AI chat responses (app/api/chat, functions chat) — trains from game usage
- **/feedback:** Call when a moderator overrides a decision (ready for future moderator UI)
