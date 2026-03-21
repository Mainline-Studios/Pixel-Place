/**
 * Infinite Mac /embed iframe helpers — screen frames + postMessage control.
 * @see https://infinitemac.org/embed-docs
 */

export const INFINITE_MAC_EMBED_ORIGIN = 'https://infinitemac.org';

export function isInfiniteMacEmbedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === 'infinitemac.org' && u.pathname === '/embed';
  } catch {
    return false;
  }
}

/** Add/remove screen_update_messages for AI copilot (heavier — only when needed). */
export function buildInfiniteMacEmbedSrc(
  baseUrl: string,
  opts: { screenUpdateMessages?: boolean },
): string {
  if (!isInfiniteMacEmbedUrl(baseUrl)) return baseUrl;
  const u = new URL(baseUrl);
  if (opts.screenUpdateMessages) {
    u.searchParams.set('screen_update_messages', 'true');
  } else {
    u.searchParams.delete('screen_update_messages');
  }
  return u.toString();
}

export type CopilotEmbedAction =
  | { type: 'mouse_move'; x: number; y: number }
  | { type: 'mouse_down'; button: number }
  | { type: 'mouse_up'; button: number }
  | { type: 'key_down'; code: string }
  | { type: 'key_up'; code: string }
  | { type: 'wait_ms'; ms: number };

export function postEmbedCommand(iframe: HTMLIFrameElement, cmd: Record<string, unknown>) {
  iframe.contentWindow?.postMessage(cmd, INFINITE_MAC_EMBED_ORIGIN);
}

/** Run a sequence from the copilot API (coordinates match emulator screen pixels). */
export async function executeEmbedActions(
  iframe: HTMLIFrameElement,
  actions: CopilotEmbedAction[],
): Promise<void> {
  let lastX = 0;
  let lastY = 0;
  for (const a of actions) {
    if (a.type === 'wait_ms') {
      await new Promise((r) => setTimeout(r, Math.min(8000, Math.max(0, a.ms))));
      continue;
    }
    if (a.type === 'mouse_move') {
      const deltaX = a.x - lastX;
      const deltaY = a.y - lastY;
      lastX = a.x;
      lastY = a.y;
      postEmbedCommand(iframe, {
        type: 'emulator_mouse_move',
        x: a.x,
        y: a.y,
        deltaX,
        deltaY,
      });
    } else if (a.type === 'mouse_down') {
      postEmbedCommand(iframe, { type: 'emulator_mouse_down', button: a.button });
    } else if (a.type === 'mouse_up') {
      postEmbedCommand(iframe, { type: 'emulator_mouse_up', button: a.button });
    } else if (a.type === 'key_down') {
      postEmbedCommand(iframe, { type: 'emulator_key_down', code: a.code });
    } else if (a.type === 'key_up') {
      postEmbedCommand(iframe, { type: 'emulator_key_up', code: a.code });
    }
    await new Promise((r) => setTimeout(r, 40));
  }
}

/** Parse postMessage payload from embedded Infinite Mac. */
export function normalizeEmulatorScreenPayload(raw: unknown): {
  data: Uint8ClampedArray;
  width: number;
  height: number;
} | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (o.type !== 'emulator_screen') return null;
  const width = Number(o.width);
  const height = Number(o.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 8 || height < 8) return null;
  if (width > 8192 || height > 8192) return null;
  const need = width * height * 4;
  const d = o.data;
  let buf: Uint8ClampedArray | null = null;
  if (d instanceof Uint8ClampedArray) buf = d;
  else if (d instanceof Uint8Array) buf = new Uint8ClampedArray(d.buffer, d.byteOffset, d.byteLength);
  else if (ArrayBuffer.isView(d)) {
    const v = d as ArrayBufferView;
    buf = new Uint8ClampedArray(v.buffer, v.byteOffset, v.byteLength);
  }
  if (!buf || buf.length < need) return null;
  return { data: buf.subarray(0, need), width, height };
}

/** Full-resolution PNG data URL for computer-use screenshot outputs (no downscale). */
export function rgbaToFullPngDataUrl(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): string | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  try {
    const need = width * height * 4;
    const copy = new Uint8ClampedArray(need);
    copy.set(data.subarray(0, need));
    ctx.putImageData(new ImageData(copy, width, height), 0, 0);
  } catch {
    return null;
  }
  return canvas.toDataURL('image/png');
}

/** Crop a region of RGBA framebuffer to a PNG data URL (for Anthropic `zoom` follow-up screenshots). */
export function rgbaCropRegionToPngDataUrl(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  crop: { x: number; y: number; w: number; h: number },
): string | null {
  if (typeof document === 'undefined') return null;
  let x = Math.max(0, Math.floor(crop.x));
  let y = Math.max(0, Math.floor(crop.y));
  let w = Math.max(1, Math.floor(crop.w));
  let h = Math.max(1, Math.floor(crop.h));
  if (x >= width || y >= height) return null;
  w = Math.min(w, width - x);
  h = Math.min(h, height - y);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  try {
    const out = new Uint8ClampedArray(w * h * 4);
    for (let row = 0; row < h; row++) {
      const srcRow = (y + row) * width + x;
      const srcStart = srcRow * 4;
      const dstStart = row * w * 4;
      out.set(data.subarray(srcStart, srcStart + w * 4), dstStart);
    }
    ctx.putImageData(new ImageData(out, w, h), 0, 0);
  } catch {
    return null;
  }
  return canvas.toDataURL('image/png');
}

/** Resize for vision API — keeps aspect ratio, max long edge `maxDim`. Returns PNG data URL + scaled size (model coords use scaled size; map back with realWidth/scaledWidth). */
export function rgbaToDownscaledPngDataUrl(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  maxDim = 896,
): { dataUrl: string; scaledWidth: number; scaledHeight: number } | null {
  if (typeof document === 'undefined') return null;
  const src = document.createElement('canvas');
  src.width = width;
  src.height = height;
  const sctx = src.getContext('2d');
  if (!sctx) return null;
  try {
    const need = width * height * 4;
    const copy = new Uint8ClampedArray(need);
    copy.set(data.subarray(0, need));
    const imageData = new ImageData(copy, width, height);
    sctx.putImageData(imageData, 0, 0);
  } catch {
    return null;
  }
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const w2 = Math.max(1, Math.round(width * scale));
  const h2 = Math.max(1, Math.round(height * scale));
  const out = document.createElement('canvas');
  out.width = w2;
  out.height = h2;
  const octx = out.getContext('2d');
  if (!octx) return null;
  octx.imageSmoothingEnabled = true;
  octx.drawImage(src, 0, 0, w2, h2);
  return { dataUrl: out.toDataURL('image/png'), scaledWidth: w2, scaledHeight: h2 };
}

/** Map mouse coords from model (scaled screenshot) to emulator pixels. */
export function scaleCopilotMouseActions(
  actions: CopilotEmbedAction[],
  realW: number,
  realH: number,
  modelW: number,
  modelH: number,
): CopilotEmbedAction[] {
  const sx = realW / Math.max(1, modelW);
  const sy = realH / Math.max(1, modelH);
  return actions.map((a) => {
    if (a.type === 'mouse_move') {
      return {
        type: 'mouse_move',
        x: Math.round(Math.min(realW - 1, Math.max(0, a.x * sx))),
        y: Math.round(Math.min(realH - 1, Math.max(0, a.y * sy))),
      };
    }
    return a;
  });
}
