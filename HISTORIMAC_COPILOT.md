# HistoriMac Computer Use (in Pixel Place, BYOK)

HistoriMac can run a **multi-turn computer-use loop** inside the page: your **own** OpenAI or Anthropic API key, official **Computer Use** tools, and Infinite Mac’s [`postMessage` embed API](https://infinitemac.org/embed-docs).

## Requirements

1. **Logged in** (JWT) — the proxy endpoint rejects anonymous calls to reduce relay abuse.
2. **Your API key** — pasted in the panel (optionally remembered in **sessionStorage** for the tab). Keys are **forwarded to OpenAI/Anthropic only** for each request; we do **not** persist them server-side.
3. **Stream screen** on — adds `screen_update_messages=true` to the `/embed` URL (higher CPU/bandwidth).

## Providers

| Provider   | API | Tool |
|-----------|-----|------|
| **OpenAI** | `POST https://api.openai.com/v1/responses` | `{ "type": "computer" }` — batched `computer_call` / `computer_call_output` loop ([guide](https://platform.openai.com/docs/guides/tools-computer-use)) |
| **Anthropic** | `POST https://api.anthropic.com/v1/messages` | `computer_20250124` + header `anthropic-beta: computer-use-2025-01-24` ([docs](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/computer-use-tool)) |

Default models in the UI: **gpt-5-mini** (OpenAI), **claude-sonnet-4-20250514** (Anthropic). Override if your account supports other computer-use models.

## Limitations

- **OpenAI safety checks**: If the API returns pending computer-use safety acknowledgements, we respond **409** — not implemented yet.
- **Anthropic**: Only the **`computer`** tool is executed. Other tool calls (if the model emits them) get an error tool result.
- **Embeds**: Actions are best-effort mappings to `emulator_mouse_*` / `emulator_key_*`. Some actions (e.g. complex drags) may not match a real Mac 1:1.
- **Fullscreen**: Panel is only in the normal (non-fullscreen) chrome.

## Endpoint

- `POST /api/historimac-copilot-turn` — body includes `provider`, `apiKey`, `displayWidth`, `displayHeight`, `model`, and either `openai: { input, previousResponseId? }` or `anthropic: { messages }`.

## Code

- `lib/historimacComputerUseActions.ts` — execute OpenAI / Anthropic actions against the iframe.
- `lib/infiniteMacEmbed.ts` — `rgbaToFullPngDataUrl`, embed helpers.
- `components/Games/HistoriMacCopilot.tsx` — UI + agent loop.
- `functions/src/historimac-copilot-turn.ts` — authenticated proxy (no stored keys).
