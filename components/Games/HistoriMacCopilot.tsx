'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { authenticatedFetch } from '@/lib/api';
import { apiUrl } from '@/lib/apiBaseUrl';
import { resolveAnthropicComputerProfile } from '@/lib/anthropicComputerUse';
import {
  normalizeEmulatorScreenPayload,
  rgbaCropRegionToPngDataUrl,
  rgbaToFullPngDataUrl,
} from '@/lib/infiniteMacEmbed';
import {
  executeAnthropicComputerInput,
  executeOpenAiComputerActions,
  resetMouseTracking,
} from '@/lib/historimacComputerUseActions';

type Props = {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  active: boolean;
  streamScreen: boolean;
  onStreamScreenChange: (on: boolean) => void;
  versionLabel: string;
  onToast: (msg: string) => void;
  /** Increment (e.g. from side rail) to expand this panel */
  expandRequest?: number;
};

const TURN_PATH = '/api/historimac-copilot-turn';
const MAX_TURNS = 14;

const SS_OPENAI_KEY = 'historimac_cu_openai_key';
const SS_ANTHROPIC_KEY = 'historimac_cu_anthropic_key';
const SS_OPENAI_MODEL = 'historimac_cu_openai_model';
const SS_ANTHROPIC_MODEL = 'historimac_cu_anthropic_model';
const SS_PROVIDER = 'historimac_cu_provider';

const DEFAULT_OPENAI_MODEL = 'gpt-5-mini';
const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';

function dataUrlToBase64(dataUrl: string): string {
  const i = dataUrl.indexOf(',');
  return i >= 0 ? dataUrl.slice(i + 1) : dataUrl;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractOpenAiAssistantText(output: unknown[]): string {
  const parts: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    if (o.type !== 'message') continue;
    const content = o.content;
    if (!Array.isArray(content)) continue;
    for (const c of content) {
      if (!c || typeof c !== 'object') continue;
      const b = c as Record<string, unknown>;
      if (b.type === 'output_text' && typeof b.text === 'string') parts.push(b.text);
    }
  }
  return parts.join('\n').trim();
}

function extractAnthropicTextBlocks(content: unknown[]): string {
  const parts: string[] = [];
  for (const block of content) {
    if (!block || typeof block !== 'object') continue;
    const b = block as Record<string, unknown>;
    if (b.type === 'text' && typeof b.text === 'string') parts.push(b.text);
  }
  return parts.join('\n').trim();
}

type LatestFrame = { data: Uint8ClampedArray; width: number; height: number };

export default function HistoriMacCopilot({
  iframeRef,
  active,
  streamScreen,
  onStreamScreenChange,
  versionLabel,
  onToast,
  expandRequest = 0,
}: Props) {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai');
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState(DEFAULT_OPENAI_MODEL);
  const [anthropicModel, setAnthropicModel] = useState(DEFAULT_ANTHROPIC_MODEL);
  const [rememberKeys, setRememberKeys] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [logLine, setLogLine] = useState<string | null>(null);
  const [frameHint, setFrameHint] = useState<string>('No frame yet.');
  const latestRef = useRef<LatestFrame | null>(null);
  const panelRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const p = sessionStorage.getItem(SS_PROVIDER);
      if (p === 'anthropic' || p === 'openai') setProvider(p);
      setOpenaiKey(sessionStorage.getItem(SS_OPENAI_KEY) || '');
      setAnthropicKey(sessionStorage.getItem(SS_ANTHROPIC_KEY) || '');
      setOpenaiModel(sessionStorage.getItem(SS_OPENAI_MODEL) || DEFAULT_OPENAI_MODEL);
      setAnthropicModel(sessionStorage.getItem(SS_ANTHROPIC_MODEL) || DEFAULT_ANTHROPIC_MODEL);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!rememberKeys) return;
    try {
      sessionStorage.setItem(SS_PROVIDER, provider);
      sessionStorage.setItem(SS_OPENAI_KEY, openaiKey);
      sessionStorage.setItem(SS_ANTHROPIC_KEY, anthropicKey);
      sessionStorage.setItem(SS_OPENAI_MODEL, openaiModel);
      sessionStorage.setItem(SS_ANTHROPIC_MODEL, anthropicModel);
    } catch {
      /* ignore */
    }
  }, [rememberKeys, provider, openaiKey, anthropicKey, openaiModel, anthropicModel]);

  useEffect(() => {
    if (expandRequest <= 0) return;
    setOpen(true);
    requestAnimationFrame(() => {
      panelRootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, [expandRequest]);

  useEffect(() => {
    if (!active || !streamScreen) {
      latestRef.current = null;
      setFrameHint(streamScreen ? 'Waiting for frames…' : 'Enable streaming to capture the Mac screen.');
      return;
    }
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== 'https://infinitemac.org') return;
      const parsed = normalizeEmulatorScreenPayload(e.data);
      if (!parsed) return;
      latestRef.current = {
        data: parsed.data,
        width: parsed.width,
        height: parsed.height,
      };
      setFrameHint(`Frame ${parsed.width}×${parsed.height} (live)`);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [active, streamScreen]);

  const postTurn = useCallback(
    async (body: Record<string, unknown>) => {
      return authenticatedFetch(apiUrl(TURN_PATH), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    },
    [],
  );

  const runOpenAiLoop = useCallback(
    async (iframe: HTMLIFrameElement, userPrompt: string, snap: LatestFrame, apiKey: string, model: string) => {
      const png = rgbaToFullPngDataUrl(snap.data, snap.width, snap.height);
      if (!png) {
        onToast('Could not encode screenshot');
        return;
      }
      resetMouseTracking();
      let previousResponseId: string | undefined;
      let input: unknown = [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: userPrompt },
            { type: 'input_image', image_url: png, detail: 'original' },
          ],
        },
      ];

      for (let turn = 0; turn < MAX_TURNS; turn++) {
        setLogLine(`OpenAI computer use · turn ${turn + 1}…`);
        const res = await postTurn({
          provider: 'openai',
          apiKey,
          model,
          displayWidth: snap.width,
          displayHeight: snap.height,
          openai: { input, previousResponseId },
        });
        const data = (await res.json()) as {
          error?: string;
          responseId?: string;
          output?: unknown[];
          status?: string;
        };
        if (!res.ok) {
          onToast(data.error || `OpenAI error (${res.status})`);
          return;
        }
        previousResponseId = data.responseId;
        const output = Array.isArray(data.output) ? data.output : [];
        const toolOutputs: unknown[] = [];

        for (const item of output) {
          if (!item || typeof item !== 'object') continue;
          const o = item as Record<string, unknown>;
          if (o.type !== 'computer_call') continue;
          const actions = Array.isArray(o.actions) ? (o.actions as Record<string, unknown>[]) : [];
          const callId =
            typeof o.call_id === 'string'
              ? o.call_id
              : typeof o.id === 'string'
                ? o.id
                : '';
          if (!callId) {
            onToast('OpenAI computer_call missing call_id');
            return;
          }
          await executeOpenAiComputerActions(iframe, actions);
          await sleep(150);
          const after = latestRef.current;
          if (!after) {
            onToast('Lost screen capture — keep streaming on');
            return;
          }
          const shot = rgbaToFullPngDataUrl(after.data, after.width, after.height);
          if (!shot) {
            onToast('Screenshot encode failed');
            return;
          }
          toolOutputs.push({
            type: 'computer_call_output',
            call_id: callId,
            output: {
              type: 'computer_screenshot',
              image_url: shot,
            },
          });
        }

        if (toolOutputs.length === 0) {
          const txt = extractOpenAiAssistantText(output);
          setLogLine(txt || 'Done (no text reply).');
          onToast('Computer use finished');
          return;
        }

        input = toolOutputs;
      }
      onToast('Stopped after max turns');
    },
    [onToast, postTurn],
  );

  const runAnthropicLoop = useCallback(
    async (iframe: HTMLIFrameElement, userPrompt: string, snap: LatestFrame, apiKey: string, model: string) => {
      const pngUrl = rgbaToFullPngDataUrl(snap.data, snap.width, snap.height);
      if (!pngUrl) {
        onToast('Could not encode screenshot');
        return;
      }
      const b64 = dataUrlToBase64(pngUrl);
      if (!b64) {
        onToast('Could not encode screenshot');
        return;
      }
      resetMouseTracking();
      const messages: unknown[] = [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: b64,
              },
            },
            { type: 'text', text: userPrompt },
          ],
        },
      ];

      for (let turn = 0; turn < MAX_TURNS; turn++) {
        setLogLine(`Anthropic computer use · turn ${turn + 1}…`);
        const res = await postTurn({
          provider: 'anthropic',
          apiKey,
          model,
          displayWidth: snap.width,
          displayHeight: snap.height,
          anthropic: { messages },
        });
        const data = (await res.json()) as {
          error?: string;
          content?: unknown[];
          stop_reason?: string;
        };
        if (!res.ok) {
          onToast(data.error || `Anthropic error (${res.status})`);
          return;
        }

        const content = Array.isArray(data.content) ? data.content : [];
        messages.push({ role: 'assistant', content });

        const toolResults: unknown[] = [];
        for (const block of content) {
          if (!block || typeof block !== 'object') continue;
          const b = block as Record<string, unknown>;
          if (b.type !== 'tool_use') continue;
          const id = typeof b.id === 'string' ? b.id : '';
          const name = typeof b.name === 'string' ? b.name : '';
          const inputObj = b.input && typeof b.input === 'object' ? (b.input as Record<string, unknown>) : {};

          if (name === 'computer') {
            const meta = await executeAnthropicComputerInput(iframe, inputObj);
            await sleep(150);
            const after = latestRef.current;
            if (!after) {
              onToast('Lost screen capture — keep streaming on');
              return;
            }
            let shot = rgbaToFullPngDataUrl(after.data, after.width, after.height);
            if (meta.zoomCrop && shot) {
              const cropped = rgbaCropRegionToPngDataUrl(
                after.data,
                after.width,
                after.height,
                meta.zoomCrop,
              );
              if (cropped) shot = cropped;
            }
            if (!shot) {
              onToast('Screenshot encode failed');
              return;
            }
            toolResults.push({
              type: 'tool_result',
              tool_use_id: id,
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/png',
                    data: dataUrlToBase64(shot),
                  },
                },
              ],
            });
          } else {
            toolResults.push({
              type: 'tool_result',
              tool_use_id: id,
              content: `Tool "${name}" is not available in HistoriMac — only the emulated Mac UI can be controlled.`,
              is_error: true,
            });
          }
        }

        if (toolResults.length === 0) {
          setLogLine(extractAnthropicTextBlocks(content) || 'Done.');
          onToast('Computer use finished');
          return;
        }

        messages.push({ role: 'user', content: toolResults });
      }
      onToast('Stopped after max turns');
    },
    [onToast, postTurn],
  );

  const runAgent = useCallback(async () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) {
      onToast('Emulator not ready');
      return;
    }
    const p = prompt.trim();
    if (!p) {
      onToast('Describe what the Mac should do');
      return;
    }
    const key = provider === 'openai' ? openaiKey.trim() : anthropicKey.trim();
    if (!key) {
      onToast(`Paste your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key`);
      return;
    }
    const snap = latestRef.current;
    if (!snap) {
      onToast('No frame — enable streaming and wait for boot');
      return;
    }

    setBusy(true);
    setLogLine(null);
    try {
      if (provider === 'openai') {
        await runOpenAiLoop(iframe, p, snap, key, openaiModel.trim() || DEFAULT_OPENAI_MODEL);
      } else {
        await runAnthropicLoop(iframe, p, snap, key, anthropicModel.trim() || DEFAULT_ANTHROPIC_MODEL);
      }
    } catch (e) {
      console.error(e);
      onToast('Computer use run failed');
    } finally {
      setBusy(false);
    }
  }, [
    iframeRef,
    prompt,
    provider,
    openaiKey,
    anthropicKey,
    openaiModel,
    anthropicModel,
    onToast,
    runOpenAiLoop,
    runAnthropicLoop,
  ]);

  if (!active) return null;

  const anthropicCu = resolveAnthropicComputerProfile(anthropicModel.trim() || DEFAULT_ANTHROPIC_MODEL);

  return (
    <div
      ref={panelRootRef}
      data-historimac-pixel-monkey
      style={{
        flexShrink: 0,
        borderBottom: '1px solid var(--border, rgba(255,255,255,0.1))',
        background: 'linear-gradient(180deg, rgba(30, 25, 55, 0.5) 0%, rgba(15, 18, 28, 0.92) 100%)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          padding: '10px 14px',
          border: 'none',
          background: 'transparent',
          color: '#c4b5fd',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <span>Pixel Monkey — computer use (BYOK) · {versionLabel}</span>
        <span aria-hidden>{open ? '▼' : '▶'}</span>
      </button>

      {open ? (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: 0, fontSize: '11px', lineHeight: 1.55, color: 'rgba(203, 213, 225, 0.9)' }}>
            Our in-page take on the classic “infinite monkey” idea —{' '}
            <a
              href="https://folklore.org/Monkey_Lives.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#a5b4fc' }}
            >
              Folklore.org
            </a>
            . Uses your keys with the vendors’ official{' '}
            <a
              href="https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#a5b4fc' }}
            >
              computer use
            </a>{' '}
            APIs: <strong>OpenAI</strong> <code style={{ fontSize: '10px' }}>computer</code> (Responses) or{' '}
            <strong>Anthropic</strong>{' '}
            <code style={{ fontSize: '10px' }}>{anthropicCu.toolType}</code>
            {anthropicCu.enableZoom ? ' (zoom to region supported)' : ''}. Keys go through Pixel Place’s proxy to the
            provider only — not stored server-side. Log in, enable streaming, then run — up to {MAX_TURNS} turns per
            session.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="radio"
                name="hm-cu-provider"
                checked={provider === 'openai'}
                onChange={() => setProvider('openai')}
              />
              OpenAI
            </label>
            <label style={{ fontSize: '12px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="radio"
                name="hm-cu-provider"
                checked={provider === 'anthropic'}
                onChange={() => setProvider('anthropic')}
              />
              Anthropic
            </label>
          </div>

          {provider === 'openai' ? (
            <>
              <input
                type="password"
                autoComplete="off"
                placeholder="OpenAI API key (sk-…)"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                style={keyInputStyle}
              />
              <input
                type="text"
                placeholder={`Model (default ${DEFAULT_OPENAI_MODEL})`}
                value={openaiModel}
                onChange={(e) => setOpenaiModel(e.target.value)}
                style={{ ...keyInputStyle, fontFamily: 'monospace', fontSize: 12 }}
              />
            </>
          ) : (
            <>
              <input
                type="password"
                autoComplete="off"
                placeholder="Anthropic API key (sk-ant-…)"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                style={keyInputStyle}
              />
              <input
                type="text"
                placeholder={`Model (default ${DEFAULT_ANTHROPIC_MODEL})`}
                value={anthropicModel}
                onChange={(e) => setAnthropicModel(e.target.value)}
                style={{ ...keyInputStyle, fontFamily: 'monospace', fontSize: 12 }}
              />
            </>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#94a3b8', cursor: 'pointer' }}>
            <input type="checkbox" checked={rememberKeys} onChange={(e) => setRememberKeys(e.target.checked)} />
            Remember keys &amp; models in session storage (this browser tab session)
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: '#e2e8f0', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={streamScreen}
              onChange={(e) => onStreamScreenChange(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span>
              Stream screen (<code style={{ fontSize: '10px' }}>screen_update_messages=true</code>) — required
            </span>
          </label>
          <div style={{ fontSize: '10px', color: 'rgba(148, 163, 184, 0.95)' }}>{frameHint}</div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='Goal for the Mac, e.g. "Open the Puzzle desk accessory"'
            rows={3}
            style={textareaStyle}
          />

          <button
            type="button"
            disabled={busy}
            title={
              busy
                ? 'Run in progress'
                : !streamScreen
                  ? 'Turn on “Stream screen” above first — the agent needs live frames'
                  : 'Start the computer-use loop with your API key'
            }
            onClick={() => {
              if (busy) return;
              if (!streamScreen) {
                onToast('Turn on “Stream screen” above — Pixel Monkey needs live frames from the emulator.');
                return;
              }
              void runAgent();
            }}
            style={{
              alignSelf: 'flex-start',
              padding: '10px 18px',
              borderRadius: 8,
              border: '1px solid rgba(167, 139, 250, 0.5)',
              background: busy ? 'rgba(100, 80, 160, 0.35)' : 'rgba(109, 40, 217, 0.45)',
              color: '#f5f3ff',
              fontWeight: 700,
              fontSize: 13,
              opacity: !streamScreen && !busy ? 0.72 : 1,
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            {busy ? 'Running…' : 'Run Pixel Monkey'}
          </button>

          {logLine ? (
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(196, 181, 253, 0.95)', whiteSpace: 'pre-wrap' }}>
              {logLine}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const keyInputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 8,
  border: '1px solid rgba(167, 139, 250, 0.35)',
  background: 'rgba(0,0,0,0.35)',
  color: '#f1f5f9',
  padding: '10px 12px',
  fontSize: 13,
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  resize: 'vertical',
  borderRadius: 8,
  border: '1px solid rgba(167, 139, 250, 0.35)',
  background: 'rgba(0,0,0,0.35)',
  color: '#f1f5f9',
  padding: '10px 12px',
  fontSize: 13,
  fontFamily: 'inherit',
};
