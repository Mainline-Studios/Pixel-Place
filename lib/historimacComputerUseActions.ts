/**
 * Map OpenAI + Anthropic Computer Use actions → Infinite Mac embed postMessage.
 * @see https://infinitemac.org/embed-docs
 */

import { INFINITE_MAC_EMBED_ORIGIN, postEmbedCommand } from '@/lib/infiniteMacEmbed';

let lastMouseX = 0;
let lastMouseY = 0;

export function resetMouseTracking() {
  lastMouseX = 0;
  lastMouseY = 0;
}

function mouseMoveTo(iframe: HTMLIFrameElement, x: number, y: number) {
  const deltaX = x - lastMouseX;
  const deltaY = y - lastMouseY;
  lastMouseX = x;
  lastMouseY = y;
  postEmbedCommand(iframe, {
    type: 'emulator_mouse_move',
    x,
    y,
    deltaX,
    deltaY,
  });
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, Math.min(10_000, Math.max(0, ms))));
}

/** Single-char to MDN Key code (US layout, classic Mac). */
function charToKeyCode(ch: string): string | null {
  const c = ch;
  if (c === '\n' || c === '\r') return 'Enter';
  if (c === ' ') return 'Space';
  if (c === '\t') return 'Tab';
  if (c.length !== 1) return null;
  if (c >= 'a' && c <= 'z') return `Key${c.toUpperCase()}`;
  if (c >= 'A' && c <= 'Z') return `Key${c}`;
  if (c >= '0' && c <= '9') return `Digit${c}`;
  if (c === '.') return 'Period';
  if (c === ',') return 'Comma';
  if (c === '/') return 'Slash';
  if (c === '-') return 'Minus';
  if (c === '=') return 'Equal';
  if (c === '[') return 'BracketLeft';
  if (c === ']') return 'BracketRight';
  if (c === ';') return 'Semicolon';
  if (c === "'") return 'Quote';
  if (c === '`') return 'Backquote';
  if (c === '\\') return 'Backslash';
  return null;
}

async function keyTap(iframe: HTMLIFrameElement, code: string) {
  postEmbedCommand(iframe, { type: 'emulator_key_down', code });
  await sleep(25);
  postEmbedCommand(iframe, { type: 'emulator_key_up', code });
  await sleep(35);
}

/** OpenAI computer tool action batch (from Responses API). */
export async function executeOpenAiComputerActions(
  iframe: HTMLIFrameElement,
  actions: Array<Record<string, unknown>>,
): Promise<void> {
  for (const action of actions) {
    const t = String(action.type ?? '');
    const x = Number(action.x ?? 0);
    const y = Number(action.y ?? 0);
    const buttonRaw = action.button;
    const button =
      buttonRaw === 'right' || buttonRaw === 2 || buttonRaw === 3
        ? 2
        : buttonRaw === 'middle' || buttonRaw === 'wheel'
          ? 1
          : 0;

    switch (t) {
      case 'screenshot':
        break;
      case 'wait': {
        const ms = Number(action.ms ?? action.duration_ms ?? 500);
        await sleep(ms);
        break;
      }
      case 'move':
        mouseMoveTo(iframe, x, y);
        await sleep(50);
        break;
      case 'click':
        mouseMoveTo(iframe, x, y);
        await sleep(40);
        postEmbedCommand(iframe, { type: 'emulator_mouse_down', button });
        await sleep(35);
        postEmbedCommand(iframe, { type: 'emulator_mouse_up', button });
        await sleep(80);
        break;
      case 'double_click':
        mouseMoveTo(iframe, x, y);
        await sleep(40);
        postEmbedCommand(iframe, { type: 'emulator_mouse_down', button: 0 });
        await sleep(35);
        postEmbedCommand(iframe, { type: 'emulator_mouse_up', button: 0 });
        await sleep(60);
        postEmbedCommand(iframe, { type: 'emulator_mouse_down', button: 0 });
        await sleep(35);
        postEmbedCommand(iframe, { type: 'emulator_mouse_up', button: 0 });
        await sleep(80);
        break;
      case 'scroll': {
        mouseMoveTo(iframe, x, y);
        await sleep(30);
        const dx = Number(action.delta_x ?? action.deltaX ?? 0);
        const dy = Number(action.delta_y ?? action.deltaY ?? action.scroll_y ?? 0);
        postEmbedCommand(iframe, {
          type: 'emulator_mouse_move',
          x: lastMouseX,
          y: lastMouseY,
          deltaX: dx,
          deltaY: dy,
        });
        await sleep(50);
        break;
      }
      case 'drag': {
        const path = Array.isArray(action.path) ? action.path : [];
        if (path.length < 2) break;
        const p0 = path[0] as { x?: number; y?: number };
        mouseMoveTo(iframe, Number(p0.x), Number(p0.y));
        await sleep(40);
        postEmbedCommand(iframe, { type: 'emulator_mouse_down', button: 0 });
        for (let i = 1; i < path.length; i++) {
          const p = path[i] as { x?: number; y?: number };
          mouseMoveTo(iframe, Number(p.x), Number(p.y));
          await sleep(30);
        }
        postEmbedCommand(iframe, { type: 'emulator_mouse_up', button: 0 });
        await sleep(60);
        break;
      }
      case 'type': {
        const text = String(action.text ?? '');
        for (const ch of text) {
          const code = charToKeyCode(ch);
          if (code) await keyTap(iframe, code);
          else await sleep(20);
        }
        break;
      }
      case 'keypress': {
        const keys = Array.isArray(action.keys)
          ? action.keys.map((k) => String(k))
          : [String(action.key ?? '')];
        const normalized = keys
          .filter(Boolean)
          .map((k) => normalizeOpenAiKeyName(k));
        if (normalized.length === 0) break;
        const main = normalized[normalized.length - 1]!;
        const mods = normalized.slice(0, -1);
        for (const m of mods) {
          postEmbedCommand(iframe, { type: 'emulator_key_down', code: m });
        }
        await sleep(20);
        postEmbedCommand(iframe, { type: 'emulator_key_down', code: main });
        await sleep(25);
        postEmbedCommand(iframe, { type: 'emulator_key_up', code: main });
        for (const m of [...mods].reverse()) {
          postEmbedCommand(iframe, { type: 'emulator_key_up', code: m });
        }
        await sleep(40);
        break;
      }
      default:
        break;
    }
  }
}

function normalizeOpenAiKeyName(k: string): string {
  const u = k.trim();
  const map: Record<string, string> = {
    CTRL: 'ControlLeft',
    CONTROL: 'ControlLeft',
    CMD: 'MetaLeft',
    COMMAND: 'MetaLeft',
    META: 'MetaLeft',
    ALT: 'AltLeft',
    OPTION: 'AltLeft',
    SHIFT: 'ShiftLeft',
    ENTER: 'Enter',
    RETURN: 'Enter',
    ESC: 'Escape',
    ESCAPE: 'Escape',
    SPACE: 'Space',
    TAB: 'Tab',
    BACKSPACE: 'Backspace',
    DELETE: 'Delete',
    UP: 'ArrowUp',
    DOWN: 'ArrowDown',
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    ARROWUP: 'ArrowUp',
    ARROWDOWN: 'ArrowDown',
    ARROWLEFT: 'ArrowLeft',
    ARROWRIGHT: 'ArrowRight',
  };
  const up = u.toUpperCase();
  if (map[up]) return map[up];
  if (/^arrow/i.test(u)) {
    const m = u.toLowerCase();
    if (m.includes('up')) return 'ArrowUp';
    if (m.includes('down')) return 'ArrowDown';
    if (m.includes('left')) return 'ArrowLeft';
    if (m.includes('right')) return 'ArrowRight';
  }
  if (u.length === 1) {
    const code = charToKeyCode(u);
    return code || u;
  }
  if (/^f\d{1,2}$/i.test(u)) return `F${u.slice(1)}`;
  if (/^(Key|Digit|Arrow|Enter|Space|Tab|Escape)/.test(u)) return u;
  return u.length ? `Key${u.charAt(0).toUpperCase()}${u.slice(1)}` : 'Enter';
}

/** Anthropic computer tool_use.input */
export async function executeAnthropicComputerInput(
  iframe: HTMLIFrameElement,
  input: Record<string, unknown>,
): Promise<void> {
  const action = String(input.action ?? '');
  switch (action) {
    case 'screenshot':
      break;
    case 'wait': {
      await sleep(Number(input.duration ?? input.ms ?? 500));
      break;
    }
    case 'mouse_move': {
      const coord = input.coordinate as number[] | undefined;
      if (coord && coord.length >= 2) mouseMoveTo(iframe, coord[0], coord[1]);
      await sleep(45);
      break;
    }
    case 'left_click':
    case 'right_click':
    case 'middle_click': {
      const coord = input.coordinate as number[] | undefined;
      const btn = action === 'right_click' ? 2 : action === 'middle_click' ? 1 : 0;
      if (coord && coord.length >= 2) mouseMoveTo(iframe, coord[0], coord[1]);
      await sleep(40);
      postEmbedCommand(iframe, { type: 'emulator_mouse_down', button: btn });
      await sleep(35);
      postEmbedCommand(iframe, { type: 'emulator_mouse_up', button: btn });
      await sleep(70);
      break;
    }
    case 'double_click':
    case 'triple_click': {
      const coord = input.coordinate as number[] | undefined;
      const n = action === 'triple_click' ? 3 : 2;
      if (coord && coord.length >= 2) mouseMoveTo(iframe, coord[0], coord[1]);
      await sleep(40);
      for (let i = 0; i < n; i++) {
        postEmbedCommand(iframe, { type: 'emulator_mouse_down', button: 0 });
        await sleep(30);
        postEmbedCommand(iframe, { type: 'emulator_mouse_up', button: 0 });
        await sleep(55);
      }
      break;
    }
    case 'type': {
      const text = String(input.text ?? '');
      for (const ch of text) {
        const code = charToKeyCode(ch);
        if (code) await keyTap(iframe, code);
        else await sleep(15);
      }
      break;
    }
    case 'key': {
      const combo = String(input.text ?? '');
      const parts = combo.split(/\s*\+\s*/).filter(Boolean);
      if (parts.length <= 1) {
        await keyTap(iframe, normalizeOpenAiKeyName(combo.trim()));
        break;
      }
      const codes = parts.map((p) => normalizeOpenAiKeyName(p.trim()));
      const main = codes.pop()!;
      for (const c of codes) {
        postEmbedCommand(iframe, { type: 'emulator_key_down', code: c });
      }
      await sleep(15);
      postEmbedCommand(iframe, { type: 'emulator_key_down', code: main });
      await sleep(25);
      postEmbedCommand(iframe, { type: 'emulator_key_up', code: main });
      for (const c of [...codes].reverse()) {
        postEmbedCommand(iframe, { type: 'emulator_key_up', code: c });
      }
      await sleep(40);
      break;
    }
    case 'scroll': {
      const coord = input.coordinate as number[] | undefined;
      if (coord && coord.length >= 2) mouseMoveTo(iframe, coord[0], coord[1]);
      const dir = String(input.scroll_direction ?? 'down');
      const amt = Number(input.scroll_amount ?? 3);
      const dy = dir === 'up' ? -amt * 40 : amt * 40;
      postEmbedCommand(iframe, {
        type: 'emulator_mouse_move',
        x: lastMouseX,
        y: lastMouseY,
        deltaX: 0,
        deltaY: dy,
      });
      await sleep(50);
      break;
    }
    case 'left_click_drag': {
      const from = input.from as number[] | undefined;
      const to = input.to as number[] | undefined;
      if (!from || !to || from.length < 2 || to.length < 2) break;
      mouseMoveTo(iframe, from[0], from[1]);
      await sleep(40);
      postEmbedCommand(iframe, { type: 'emulator_mouse_down', button: 0 });
      mouseMoveTo(iframe, to[0], to[1]);
      await sleep(50);
      postEmbedCommand(iframe, { type: 'emulator_mouse_up', button: 0 });
      await sleep(60);
      break;
    }
    case 'left_mouse_down':
      postEmbedCommand(iframe, { type: 'emulator_mouse_down', button: 0 });
      await sleep(30);
      break;
    case 'left_mouse_up':
      postEmbedCommand(iframe, { type: 'emulator_mouse_up', button: 0 });
      await sleep(30);
      break;
    case 'hold_key':
      await sleep(Math.min(5000, Number(input.duration ?? 1) * 1000));
      break;
    case 'zoom':
      break;
    default:
      break;
  }
}
