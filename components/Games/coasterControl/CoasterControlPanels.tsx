'use client';

import React, { useMemo, useState } from 'react';
import {
  RIDE_DEF,
  TOOL_GROUPS,
  TOOL_HINTS,
  getBuildCost,
  isCoasterTool,
  toolToRideKind,
} from './catalog';
import type { RideCategory } from './ridesRegistry';
import type { BuildTool, ParkState } from './types';

export type PanelId = 'build' | 'rides' | 'park' | null;

type BuildPanelProps = {
  state: ParkState;
  onClose: () => void;
  onPickTool: (tool: BuildTool) => void;
  onFinishCoaster: () => void;
  onCancelCoaster: () => void;
};

export function BuildPanel({ state, onClose, onPickTool, onFinishCoaster, onCancelCoaster }: BuildPanelProps) {
  const [tab, setTab] = useState<RideCategory | 'build' | 'all'>('build');
  const [search, setSearch] = useState('');
  const coasterBuilding =
    !!toolToRideKind(state.tool) && isCoasterTool(state.tool) && state.coasterDraft;

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TOOL_GROUPS.map((g) => ({
      ...g,
      tools: g.tools.filter((t) => {
        if (tab !== 'all' && g.category !== tab) return false;
        if (!q) return true;
        return (
          t.label.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          (TOOL_HINTS[t.id]?.toLowerCase().includes(q) ?? false)
        );
      }),
    })).filter((g) => g.tools.length > 0);
  }, [tab, search]);

  return (
    <ModalFrame title="Construction" onClose={onClose} wide>
      <div className="cc-popup-tabs">
        {(
          [
            ['build', 'Paths & scenery'],
            ['coaster', 'Roller coasters'],
            ['gentle', 'Gentle'],
            ['thrill', 'Thrill'],
            ['transport', 'Transport'],
            ['water', 'Water'],
            ['all', 'All'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`cc-popup-tab ${tab === id ? 'cc-popup-tab-on' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <input
        type="search"
        className="cc-popup-search"
        placeholder="Search rides and tools…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {coasterBuilding && (
        <div className="cc-coaster-bar">
          <span>
            {state.coasterDraft?.station
              ? `Track pieces: ${state.coasterDraft.cells.length}`
              : 'Click map — place station first'}
          </span>
          <button type="button" className="cc-popup-btn" onClick={onFinishCoaster}>
            Finish ride
          </button>
          <button type="button" className="cc-popup-btn cc-popup-btn-muted" onClick={onCancelCoaster}>
            Cancel
          </button>
        </div>
      )}
      <div className="cc-popup-scroll">
        {groups.map((group) => (
          <section key={group.title} className="cc-popup-section">
            <h3>{group.title}</h3>
            <div className="cc-popup-grid">
              {group.tools.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`cc-popup-item ${state.tool === t.id ? 'cc-popup-item-on' : ''}`}
                  title={TOOL_HINTS[t.id]}
                  onClick={() => {
                    onPickTool(t.id);
                    if (!isCoasterTool(t.id)) onClose();
                  }}
                >
                  <span className="cc-popup-item-icon">{t.icon}</span>
                  <span className="cc-popup-item-label">{t.label}</span>
                  {!state.sandbox && (
                    <span className="cc-popup-item-cost">
                      ${(getBuildCost(t.id) ?? t.cost ?? 0).toLocaleString()}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="cc-popup-foot">{TOOL_HINTS[state.tool] ?? 'Select a tool, then click the park.'}</p>
    </ModalFrame>
  );
}

type RidesPanelProps = {
  state: ParkState;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onClose: () => void;
  onToggleOpen: (id: number) => void;
  onOpenAll: () => void;
  onCloseAll: () => void;
  onTest: (id: number) => void;
  onDemolish: (id: number) => void;
};

export function RidesPanel({
  state,
  selectedId,
  onSelect,
  onClose,
  onToggleOpen,
  onOpenAll,
  onCloseAll,
  onTest,
  onDemolish,
}: RidesPanelProps) {
  const selected = state.rides.find((r) => r.id === selectedId) ?? null;

  return (
    <ModalFrame title="Ride management" onClose={onClose} wide>
      <div className="cc-rides-toolbar">
        <button type="button" className="cc-popup-btn" onClick={onOpenAll}>
          Open all
        </button>
        <button type="button" className="cc-popup-btn cc-popup-btn-muted" onClick={onCloseAll}>
          Close all
        </button>
      </div>
      {state.rides.length === 0 ? (
        <p className="cc-popup-empty">No rides yet. Use Build to add coasters and flat rides.</p>
      ) : (
        <div className="cc-rides-split">
          <ul className="cc-rides-list">
            {state.rides.map((r) => {
              const d = RIDE_DEF[r.kind];
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    className={`cc-ride-row ${selectedId === r.id ? 'cc-ride-row-on' : ''}`}
                    onClick={() => onSelect(r.id)}
                  >
                    <span>{d.icon}</span>
                    <span className="cc-ride-row-main">
                      <strong>{d.label}</strong>
                      <span className={r.open ? 'cc-status-open' : 'cc-status-closed'}>
                        {r.open ? 'Open' : 'Closed'}
                      </span>
                    </span>
                    <span className="cc-ride-row-meta">
                      Q{r.queue} · {r.running}/{d.capacity}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {selected && (
            <div className="cc-ride-detail">
              {(() => {
                const d = RIDE_DEF[selected.kind];
                return (
                  <>
                    <h3>
                      {d.icon} {d.label}
                    </h3>
                    <p className="cc-muted">{d.rctType}</p>
                    <dl className="cc-ride-stats">
                      <dt>Status</dt>
                      <dd>{selected.open ? 'Operating' : 'Closed'}</dd>
                      <dt>Excitement</dt>
                      <dd>{d.excitement.toFixed(1)}</dd>
                      <dt>Ticket</dt>
                      <dd>${d.ticket}</dd>
                      <dt>Capacity</dt>
                      <dd>{d.capacity}</dd>
                      <dt>Queue</dt>
                      <dd>{selected.queue}</dd>
                      <dt>Running</dt>
                      <dd>
                        {selected.running} / {d.capacity}
                      </dd>
                      <dt>Upkeep</dt>
                      <dd>${d.upkeep}/day</dd>
                    </dl>
                    <div className="cc-ride-actions">
                      <button type="button" className="cc-popup-btn" onClick={() => onToggleOpen(selected.id)}>
                        {selected.open ? 'Close ride' : 'Open ride'}
                      </button>
                      <button
                        type="button"
                        className="cc-popup-btn cc-popup-btn-muted"
                        disabled={!selected.open}
                        onClick={() => onTest(selected.id)}
                      >
                        Test ride
                      </button>
                      <button
                        type="button"
                        className="cc-popup-btn cc-popup-btn-danger"
                        onClick={() => onDemolish(selected.id)}
                      >
                        Demolish
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </ModalFrame>
  );
}

type ParkPanelProps = {
  state: ParkState;
  scenarioName: string;
  scenarioIcon: string;
  goals: Array<{ text: string; done: boolean }>;
  onClose: () => void;
};

export function ParkPanel({ state, scenarioName, scenarioIcon, goals, onClose }: ParkPanelProps) {
  return (
    <ModalFrame title="Park information" onClose={onClose}>
      <p className="cc-park-scenario">
        {scenarioIcon} {scenarioName}
      </p>
      {!state.sandbox && (
        <>
          <h3>Objectives</h3>
          <ul className="cc-goals">
            {goals.map((g, i) => (
              <li key={i} className={g.done ? 'cc-goal-done' : ''}>
                {g.done ? '✓ ' : '○ '}
                {g.text}
              </li>
            ))}
          </ul>
        </>
      )}
      <h3>Park report</h3>
      <ul className="cc-stats">
        <li>Scenery rating: {state.scenery}</li>
        <li>Excitement: {state.excitement}</li>
        <li>Cleanliness: {Math.round(state.cleanliness)}%</li>
        <li>Open rides: {state.rides.filter((r) => r.open).length}</li>
        <li>Income today: ${state.stats.incomeToday}</li>
        <li>Upkeep today: ${state.stats.upkeepToday}</li>
      </ul>
      <h3>Recent messages</h3>
      <ul className="cc-log">
        {state.messages.slice(0, 8).map((m, i) => (
          <li key={`${i}-${m.slice(0, 8)}`}>{m}</li>
        ))}
      </ul>
    </ModalFrame>
  );
}

function ModalFrame({
  title,
  children,
  onClose,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="cc-popup-backdrop" onClick={onClose} role="presentation">
      <div
        className={`cc-popup ${wide ? 'cc-popup-wide' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cc-popup-title"
      >
        <header className="cc-popup-header">
          <h2 id="cc-popup-title">{title}</h2>
          <button type="button" className="cc-popup-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="cc-popup-body">{children}</div>
      </div>
    </div>
  );
}
