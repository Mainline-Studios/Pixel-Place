# Pyx API Integration

Pixel Place uses the Pyx API (one base URL, four services). Base URL:

**https://pyxaiapi-574247481583.us-central1.run.app**

Set `PYX_SERVICE_URL` to this in `.env.local`, `functions/.env`, and Vercel.

---

## 1. Pyx Moderator (content filter)

Used for chat and any user/AI-generated text.

| Endpoint | Use | Trains Pyx |
|----------|-----|------------|
| **POST /score** | Decision only (chat, messages) | No |
| **POST /ai-decide** | Game AI decisions (AI chat, prompts) | Yes |
| **POST /feedback** | Moderator override | Yes |

- **POST /score**  
  Body: `{"text": "..."}`  
  Response: `{"score": number, "bad": boolean, "censored": "..."}`  
  Treat `score ≥ 0.7` or `bad === true` as inappropriate; use `censored` when bad.

- **POST /ai-decide**  
  Body: `{"text": "..."}` (optional: `"category": "phrases"`)  
  Response: same as `/score`, plus `"safe"`.  
  Use for game AI content so Pyx learns.

- **POST /feedback**  
  Body: `{"text": "...", "safe": true|false}` (optional: `"category": "phrases"`).  
  Use when a moderator overrides; trains Pyx.

**Where we use it:** `/score` for chat, messages, FilteredText. `/ai-decide` for AI chat. `/feedback` for moderator UI (ready).

---

## 2. Pyx Code (code assist)

For in-editor help, tooltips, or code-assist.

- **POST /code/complete** — Body: `{"prompt": "code prefix", "max_tokens": 256}` → `{"completion": "..."}`
- **POST /code/explain** — Body: `{"snippet": "code"}` → `{"explanation": "..."}`
- **POST /code/refactor** — Body: `{"snippet": "code", "instruction": "optional"}` → `{"refactored": "..."}`
- **GET /code/health** — `{"service": "pyx_code", "status": "ok", ...}`

*Not yet wired in Pixel Place; use for code editor completion / explain / refactor when needed.*

---

## 3. Pyx Check (code tips)

Lint-style tips or quality hints on code.

- **POST /check** — Body: `{"source": "full code", "language": "javascript"|"python"}`  
  Response: `{"tips": [{"line": 1, "message": "...", "severity": "info"|"warning"}], "language": "...", "checked": true}`

- **POST /check/three** — Body: `{"source": "three.js or WebGL code"}` — same shape, three.js-specific tips.

- **GET /check/health** — `{"service": "pyx_check", "status": "ok", ...}`

*Use before save/publish to show tips in the UI.*

---

## 4. Pyx Analyze (inappropriate content in code)

Scan code for bad strings/URLs before allowing publish.

- **POST /analyze** — Body: `{"source": "code", "language": "javascript"}`  
  Response: `{"safe": boolean, "flagged": [{"snippet": "...", "score": number, "reason": "..."}], "extracted_count": number}`

- **POST /analyze/three** — Body: `{"source": "three.js / WebGL code"}` — same shape.

- **GET /analyze/health** — `{"service": "pyx_analyze", "status": "ok", ...}`

**Integration:** When users publish game code, we call **POST /analyze/three**. If `safe === false`, we block and show/warn with flagged snippets.

---

## Overall health

- **GET /health** or **GET /**  
  Response: `{"status": "ok", "services": {"pyx_moderator": "ok", "pyx_code": "ok", "pyx_check": "ok", "pyx_analyze": "ok"}}`

Use to verify the API and all four services.

---

## Summary

| Service   | Endpoints | Use in Pixel Place |
|-----------|-----------|--------------------|
| Moderator | /score, /ai-decide, /feedback | Content filter + learning |
| Code      | /code/complete, /explain, /refactor | Code assist (optional) |
| Check     | /check, /check/three | Code tips before save (optional) |
| Analyze   | /analyze, /analyze/three | Scan game code before publish |

All endpoints accept and return JSON. CORS enabled.
