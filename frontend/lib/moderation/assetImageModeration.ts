import { GoogleGenerativeAI } from '@google/generative-ai';

export type TextureSnapshotInput = {
  /** Raw base64 without data: prefix */
  base64: string;
  mime: string;
};

function getGeminiApiKey(): string | null {
  return (
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    null
  );
}

const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

/**
 * Multi-image safety check for a family-friendly game platform.
 * Returns per-image safe flags; any unsafe fails the batch.
 */
export async function moderateTextureSnapshotsWithGemini(
  snapshots: TextureSnapshotInput[],
  context: { fileName: string }
): Promise<
  | { ok: true; model: string }
  | { ok: false; reason: string; detail?: string }
> {
  const key = getGeminiApiKey();
  if (!key) {
    return { ok: false, reason: 'moderation_unconfigured', detail: 'No Gemini API key' };
  }

  if (snapshots.length === 0) {
    return { ok: true, model: MODEL };
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
    },
  });

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    {
      text: `You are a strict content safety classifier for a children's / family gaming platform.
User uploaded a 3D model file named: "${context.fileName}".

You will receive ${snapshots.length} cropped texture image(s) from that model.

For EACH image, decide if it is SAFE to show to children and general audiences.

Mark UNSAFE if the image contains or clearly depicts ANY of:
- Sexual content, nudity, fetish imagery
- Graphic violence, gore, realistic mutilation
- Hate symbols (e.g. swastika used as Nazi symbol, SS bolts, KKK imagery)
- Hard drugs glorification (needles, drug use as focus)
- Self-harm glorification
- CSAM or sexualization of minors (always UNSAFE)

SAFE examples: plain wood, stone, solid colors, stylized non-gory game art, fantasy creatures without gore, simple patterns.

Reply with ONLY valid JSON (no markdown):
{"results":[{"i":0,"safe":true,"flags":[]}]}
- i is 0..${snapshots.length - 1} in order
- safe is boolean
- flags: short strings if unsafe (e.g. "hate_symbol", "sexual", "gore") else []`,
    },
  ];

  for (let i = 0; i < snapshots.length; i++) {
    const s = snapshots[i]!;
    const mime = s.mime || 'image/jpeg';
    const data = s.base64.replace(/^data:image\/\w+;base64,/, '').trim();
    if (!data || data.length > 6_000_000) {
      return { ok: false, reason: 'snapshot_invalid', detail: `index ${i}` };
    }
    parts.push({ inlineData: { mimeType: mime, data } });
  }

  try {
    const result = await model.generateContent(parts);
    const text = result.response?.text()?.trim() ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { ok: false, reason: 'ai_parse_error', detail: text.slice(0, 200) };
    }
    const parsed = JSON.parse(jsonMatch[0]) as {
      results?: Array<{ i?: number; safe?: boolean; flags?: string[] }>;
    };
    const rows = parsed.results;
    if (!Array.isArray(rows) || rows.length !== snapshots.length) {
      return { ok: false, reason: 'ai_shape_error' };
    }
    for (let i = 0; i < snapshots.length; i++) {
      const row = rows[i];
      if (!row || row.safe !== true) {
        const flags = Array.isArray(row?.flags) ? row!.flags!.join(',') : 'unsafe';
        return { ok: false, reason: 'image_unsafe', detail: `texture ${i}: ${flags}` };
      }
    }
    return { ok: true, model: MODEL };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[assetImageModeration]', msg);
    return { ok: false, reason: 'ai_error', detail: msg.slice(0, 300) };
  }
}
