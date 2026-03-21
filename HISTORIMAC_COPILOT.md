# HistoriMac Computer Use — Pixel Monkey (in Pixel Place, BYOK)

HistoriMac can run a **multi-turn computer-use loop** inside the page: your **own** OpenAI or Anthropic API key, official **Computer Use** tools, and Infinite Mac’s [`postMessage` embed API](https://infinitemac.org/embed-docs). The in-app panel is branded **Pixel Monkey** (homage to the [Folklore “monkey” story](https://folklore.org/Monkey_Lives.html)); the 🐵 link on the rail still opens **Infinite Monkey** on infinitemac.org.

## Requirements

1. **Logged in** (JWT) — the proxy endpoint rejects anonymous calls to reduce relay abuse.
2. **Your API key** — pasted in the panel (optionally remembered in **sessionStorage** for the tab). Keys are **forwarded to OpenAI/Anthropic only** for each request; we do **not** persist them server-side.
3. **Stream screen** on — adds `screen_update_messages=true` to the `/embed` URL (higher CPU/bandwidth).

## Providers

| Provider   | API | Tool |
|-----------|-----|------|
| **OpenAI** | `POST https://api.openai.com/v1/responses` | `{ "type": "computer" }` — batched `computer_call` / `computer_call_output` loop ([guide](https://platform.openai.com/docs/guides/tools-computer-use)) |
| **Anthropic** | `POST https://api.anthropic.com/v1/messages` | Model-dependent (see below) ([Claude computer use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)) |

### Anthropic tool version & beta header

The proxy picks the tool type and `anthropic-beta` header from the **model id** string:

| Models (substring match on id) | Tool `type` | `anthropic-beta` | Extras |
|-------------------------------|-------------|------------------|--------|
| **Opus 4.6**, **Sonnet 4.6**, **Opus 4.5** (`opus-4-6`, `sonnet-4-6`, `opus-4-5`) | `computer_20251124` | `computer-use-2025-11-24` | `enable_zoom: true` |
| **All other** supported models (e.g. Sonnet 4, Sonnet 4.5) | `computer_20250124` | `computer-use-2025-01-24` | — |

Default model in the UI: **claude-sonnet-4-20250514** → `computer_20250124`. For **zoom** (`region` crop), use a model that maps to `computer_20251124`.

After a **`zoom`** action, the client returns a **cropped** PNG of that region so the model sees detail at full resolution (aligned with Anthropic’s zoom behavior).

Default OpenAI model: **gpt-5-mini**.

## Limitations

- **OpenAI safety checks**: If the API returns pending computer-use safety acknowledgements, we respond **409** — not implemented yet.
- **Anthropic**: Only the **`computer`** tool is executed. Other tool calls (if the model emits them) get an error tool result.
- **Embeds**: Actions are best-effort mappings to `emulator_mouse_*` / `emulator_key_*`. Some actions (e.g. complex drags) may not match a real Mac 1:1.
- **Fullscreen**: Pixel Monkey stays mounted below the fullscreen top bar so the 🍌 rail button still opens it.

## Endpoint

- `POST /api/historimac-copilot-turn` — body includes `provider`, `apiKey`, `displayWidth`, `displayHeight`, `model`, and either `openai: { input, previousResponseId? }` or `anthropic: { messages }`.
- Anthropic responses may include `anthropic_computer_tool: "computer_20250124" | "computer_20251124"` for debugging.

## Code

- `lib/anthropicComputerUse.ts` — model → Anthropic computer profile (mirrored in `functions/src/anthropicComputerUse.ts` for the proxy).
- `lib/historimacComputerUseActions.ts` — execute OpenAI / Anthropic actions against the iframe; **`zoom`** returns crop metadata for the next screenshot.
- `lib/infiniteMacEmbed.ts` — `rgbaToFullPngDataUrl`, `rgbaCropRegionToPngDataUrl`, embed helpers.
- `components/Games/HistoriMacCopilot.tsx` — Pixel Monkey UI + agent loop.
- `components/Games/HistoriMacSideRail.tsx` — 🍌 opens Pixel Monkey; 🐵 opens Infinite Monkey (external).
- `functions/src/historimac-copilot-turn.ts` — authenticated proxy (no stored keys).
