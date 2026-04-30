'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { HistoriMacVersion } from '@/lib/historiMacVersions';
import {
  INFINITE_MAC_DISK_NAMES,
  INFINITE_MAC_MACHINES,
  getInfiniteMacMachineSpec,
} from '@/lib/infiniteMacCatalog';
import {
  buildInfiniteMacEmbedUrl,
  stableHistoriMacCustomId,
} from '@/lib/infiniteMacEmbed';
import type { HistoriMacCardTheme } from '@/lib/historiMacCardTheme';
import {
  shellSectionHeadingStyle,
  shellBodyFont,
  shellSearchFieldStyle,
  themeYearStyle,
  cardArticleStyle,
  cardRunButtonStyle,
  classicPlatinumPixelOverlayStyle,
  usesClassicPlatinumPixelUi,
} from '@/lib/historiMacCardTheme';

type Props = {
  shellTheme: HistoriMacCardTheme;
  onRun: (version: HistoriMacVersion) => void;
};

export default function HistoriMacCustomPanel({ shellTheme, onRun }: Props) {
  const [open, setOpen] = useState(false);
  const [machine, setMachine] = useState(INFINITE_MAC_MACHINES[0]?.name ?? 'Mac Plus');
  const [disk1, setDisk1] = useState('System 7.1');
  const [disk2, setDisk2] = useState('');
  const [ram, setRam] = useState('');
  const [infiniteHd, setInfiniteHd] = useState(true);
  const [savedHd, setSavedHd] = useState(false);
  const [screenScale, setScreenScale] = useState('1');

  const spec = useMemo(() => getInfiniteMacMachineSpec(machine), [machine]);

  useEffect(() => {
    if (!spec) return;
    setRam(spec.ramSizes[0] ?? '');
  }, [spec]);

  const scaleNum = useMemo(() => {
    const n = parseFloat(screenScale.replace(',', '.'));
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [screenScale]);

  const handleRun = useCallback(() => {
    const disks = [disk1, disk2].map((s) => s.trim()).filter(Boolean);
    const embedUrl = buildInfiniteMacEmbedUrl({
      disks,
      machine,
      infiniteHd,
      savedHd,
      ram: ram.trim() || undefined,
      screenScale: scaleNum !== 1 ? scaleNum : undefined,
    });
    const frame = spec ?? { embedWidth: 640, embedHeight: 480 };
    const diskLabel = disks.length ? disks.join(' + ') : '(no disk)';
    const id = stableHistoriMacCustomId(embedUrl);
    const v: HistoriMacVersion = {
      id,
      label: `Custom (${diskLabel} · ${machine})`,
      embedUrl,
      embedAllow: 'cross-origin-isolated',
      embedWidth: frame.embedWidth,
      embedHeight: frame.embedHeight,
      backgroundInfo:
        'Custom Infinite Mac embed — disk and machine strings must match Infinite Mac’s catalog exactly (see their embed docs). Mixed or unsupported combos may fail, hang, or behave oddly; that’s expected when experimenting.',
    };
    onRun(v);
  }, [disk1, disk2, infiniteHd, machine, onRun, ram, savedHd, scaleNum, spec]);

  const inputStyle = shellSearchFieldStyle(shellTheme);
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: shellTheme === 'next' ? '#333' : '#555',
    marginBottom: 6,
    fontFamily: shellBodyFont(shellTheme),
  };

  return (
    <section
      aria-label="Custom Infinite Mac embed"
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
        padding: 0,
        overflow: 'hidden',
        ...cardArticleStyle(shellTheme),
      }}
    >
      {usesClassicPlatinumPixelUi(shellTheme) ? (
        <div aria-hidden style={{ ...classicPlatinumPixelOverlayStyle(), opacity: 0.04 }} />
      ) : null}
      <div style={{ position: 'relative', zIndex: 1, padding: '18px 20px 16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 style={{ ...shellSectionHeadingStyle(shellTheme), marginBottom: 6 }}>Custom mix</h2>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.5,
                color: shellTheme === 'next' ? '#222' : '#444',
                fontFamily: shellBodyFont(shellTheme),
                maxWidth: 560,
              }}
            >
              Pick disk(s) and hardware like Infinite Mac’s UI — including combos that may not work. URLs follow{' '}
              <a
                href="https://infinitemac.org/embed-docs"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0066cc', fontWeight: 600 }}
              >
                their embed schema
              </a>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            style={{
              border: shellTheme === 'classic' ? '2px solid #000' : '1px solid #888',
              background: shellTheme === 'aqua' ? 'linear-gradient(180deg,#fff,#e8e8e8)' : 'rgba(255,255,255,0.85)',
              cursor: 'pointer',
              fontSize: 13,
              whiteSpace: 'nowrap',
              padding: '6px 12px',
              borderRadius: shellTheme === 'aqua' ? 8 : 0,
              fontFamily: shellBodyFont(shellTheme),
              fontWeight: 600,
              color: '#222',
            }}
          >
            {open ? 'Hide builder ▴' : 'Open builder ▾'}
          </button>
        </div>

        {open ? (
          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop:
                shellTheme === 'classic' ? '2px solid #000' : `1px solid ${shellTheme === 'next' ? '#666' : '#ddd'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <datalist id="historimac-custom-disk-list">
              {INFINITE_MAC_DISK_NAMES.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
            <div>
              <div style={labelStyle}>Machine</div>
              <select
                aria-label="Emulated Macintosh model"
                value={machine}
                onChange={(e) => setMachine(e.target.value)}
                style={{ ...inputStyle, width: '100%', maxWidth: '100%', cursor: 'pointer' }}
              >
                {INFINITE_MAC_MACHINES.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={labelStyle}>Boot disk</div>
              <input
                aria-label="Primary disk name"
                list="historimac-custom-disk-list"
                value={disk1}
                onChange={(e) => setDisk1(e.target.value)}
                placeholder="e.g. System 7.1"
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <div style={labelStyle}>Second disk (optional)</div>
              <input
                aria-label="Second disk name"
                list="historimac-custom-disk-list"
                value={disk2}
                onChange={(e) => setDisk2(e.target.value)}
                placeholder="Another volume — empty for single disk"
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 140px' }}>
                <div style={labelStyle}>RAM</div>
                <select
                  aria-label="RAM size"
                  value={ram}
                  onChange={(e) => setRam(e.target.value)}
                  style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
                >
                  {(spec?.ramSizes ?? []).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: '0 1 120px' }}>
                <div style={labelStyle}>Screen scale</div>
                <input
                  aria-label="Screen scale factor"
                  type="text"
                  inputMode="decimal"
                  value={screenScale}
                  onChange={(e) => setScreenScale(e.target.value)}
                  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ flex: '1 1 200px', fontSize: 12, color: '#666', fontFamily: shellBodyFont(shellTheme), lineHeight: 1.45 }}>
                Frame uses{' '}
                <span style={themeYearStyle(shellTheme)}>
                  {spec ? `${spec.embedWidth}×${spec.embedHeight}` : '640×480'}
                </span>{' '}
                px for layout; Infinite Mac still respects iframe size + scale per{' '}
                <a href="https://infinitemac.org/embed-docs" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>
                  embed-docs
                </a>
                .
              </div>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: shellBodyFont(shellTheme),
                color: '#333',
              }}
            >
              <input type="checkbox" checked={infiniteHd} onChange={(e) => setInfiniteHd(e.target.checked)} />
              Infinite HD (infinite_hd=true)
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: shellBodyFont(shellTheme),
                color: '#333',
              }}
            >
              <input type="checkbox" checked={savedHd} onChange={(e) => setSavedHd(e.target.checked)} />
              Saved HD (saved_hd=true)
            </label>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 4 }}>
              <button
                type="button"
                onClick={handleRun}
                style={{
                  ...cardRunButtonStyle(shellTheme),
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 22px',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Run custom embed
              </button>
              <span style={{ fontSize: 12, color: '#888', fontFamily: shellBodyFont(shellTheme) }}>
                Typing a disk name not in the list is allowed if it matches Infinite Mac exactly.
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
