'use client';

import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  RIDE_DEF,
  RIDES_REGISTRY,
  TILE,
  TOOL_GROUPS,
  TOOL_HINTS,
  isCoasterTool,
  toolToRideKind,
} from './coasterControl/catalog';
import type { RideCategory } from './coasterControl/ridesRegistry';
import { canvasSize, drawPark } from './coasterControl/draw';
import {
  cancelCoaster,
  createInitialState,
  finishCoaster,
  handleTileClick,
  loadSave,
  payLoan,
  saveGame,
  setTool,
  startGame,
  tickSimulation,
} from './coasterControl/engine';
import { SCENARIOS, formatGoal, getScenario, isGoalMet } from './coasterControl/scenarios';
import type { BuildTool, ParkState, ScenarioId } from './coasterControl/types';

interface CoasterControlProps {
  onClose?: () => void;
}

const COASTER_COUNT = RIDES_REGISTRY.filter((r) => r.category === 'coaster').length;
const FLAT_COUNT = RIDES_REGISTRY.length - COASTER_COUNT;

type Action =
  | { type: 'SET'; payload: ParkState }
  | { type: 'PATCH'; patch: Partial<ParkState> }
  | { type: 'CLICK'; x: number; y: number }
  | { type: 'TOOL'; tool: BuildTool }
  | { type: 'TICK' }
  | { type: 'START'; scenarioId: ScenarioId }
  | { type: 'LOAD' }
  | { type: 'FINISH_COASTER' }
  | { type: 'CANCEL_COASTER' }
  | { type: 'PAY_LOAN' };

const SIM_MS = 280;

function reducer(state: ParkState, action: Action): ParkState {
  switch (action.type) {
    case 'SET':
      return action.payload;
    case 'PATCH':
      return { ...state, ...action.patch };
    case 'CLICK':
      return handleTileClick(state, action.x, action.y);
    case 'TOOL':
      return setTool(state, action.tool);
    case 'TICK':
      return tickSimulation(state);
    case 'START':
      return startGame(action.scenarioId);
    case 'LOAD': {
      const loaded = loadSave();
      return loaded ?? startGame('firstPark');
    }
    case 'FINISH_COASTER':
      return finishCoaster(state);
    case 'CANCEL_COASTER':
      return cancelCoaster(state);
    case 'PAY_LOAN':
      return payLoan(state, 500);
    default:
      return state;
  }
}

export default function CoasterControl({ onClose }: CoasterControlProps) {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [cam, setCam] = useState({ x: 0, y: 0 });
  const [toolSearch, setToolSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<RideCategory | 'build' | 'all'>('all');
  const camRef = useRef(cam);
  camRef.current = cam;

  const stateRef = useRef(state);
  stateRef.current = state;
  const lastTickRef = useRef(performance.now());
  const moveAlphaRef = useRef(0);
  const animTimeRef = useRef(0);

  const { width, height } = canvasSize();
  const scenario = getScenario(state.scenarioId);

  useEffect(() => {
    if (state.phase !== 'playing') return;
    const id = window.setInterval(() => {
      lastTickRef.current = performance.now();
      moveAlphaRef.current = 0;
      dispatch({ type: 'TICK' });
    }, SIM_MS);
    return () => clearInterval(id);
  }, [state.phase, state.paused, state.speed]);

  useEffect(() => {
    if (state.phase === 'playing') saveGame(state);
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const loop = (now: number) => {
      const elapsed = now - lastTickRef.current;
      moveAlphaRef.current = Math.min(1, elapsed / SIM_MS);
      animTimeRef.current = now / 1000;
      drawPark(
        ctx,
        stateRef.current,
        hover,
        camRef.current,
        animTimeRef.current,
        moveAlphaRef.current
      );
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [hover]);

  const screenToTile = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      const px = (clientX - rect.left) * scaleX + camRef.current.x;
      const py = (clientY - rect.top) * scaleY + camRef.current.y;
      const x = Math.floor(px / TILE);
      const y = Math.floor(py / TILE);
      if (x < 0 || y < 0 || x >= width / TILE || y >= height / TILE) return null;
      return { x, y };
    },
    [width, height]
  );

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (state.phase !== 'playing' || state.paused) return;
    const t = screenToTile(e.clientX, e.clientY);
    if (t) dispatch({ type: 'CLICK', x: t.x, y: t.y });
  };

  const ratingStars = Math.min(5, Math.floor(state.rating / 200));

  if (state.phase === 'menu') {
    return (
      <div className="coaster-control-root">
        <MenuScreen
          onClose={onClose}
          onStart={(id) => dispatch({ type: 'START', scenarioId: id })}
          onContinue={() => dispatch({ type: 'LOAD' })}
          hasSave={!!loadSave()}
        />
      </div>
    );
  }

  const coasterBuilding = !!toolToRideKind(state.tool) && isCoasterTool(state.tool) && state.coasterDraft;

  const filteredGroups = TOOL_GROUPS.map((group) => ({
    ...group,
    tools: group.tools.filter((t) => {
      if (categoryFilter !== 'all' && group.category !== categoryFilter) return false;
      const q = toolSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        t.label.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (TOOL_HINTS[t.id]?.toLowerCase().includes(q) ?? false)
      );
    }),
  })).filter((g) => g.tools.length > 0);

  return (
    <div className="coaster-control-root">
      <style>{COASTER_STYLES}</style>
      {onClose && (
        <button type="button" className="cc-back" onClick={onClose}>
          ◄ Back
        </button>
      )}

      <header className="cc-hud">
        <div className="cc-hud-block cc-scenario-tag">
          <span>{scenario.icon}</span>
          <span>{scenario.name}</span>
        </div>
        <div className="cc-hud-block">
          <span className="cc-label">Cash</span>
          <span className={state.sandbox ? 'cc-money' : state.money < 500 ? 'cc-warn' : 'cc-money'}>
            {state.sandbox ? '∞' : `$${state.money.toLocaleString()}`}
          </span>
        </div>
        {!state.sandbox && (
          <div className="cc-hud-block">
            <span className="cc-label">Loan</span>
            <span>${state.loan.toLocaleString()}</span>
            {state.loan > 0 && (
              <button type="button" className="cc-mini-btn" onClick={() => dispatch({ type: 'PAY_LOAN' })}>
                Pay $500
              </button>
            )}
          </div>
        )}
        <div className="cc-hud-block">
          <span className="cc-label">Date</span>
          <span>
            Y{state.year} M{state.month} D{state.day}
          </span>
        </div>
        <div className="cc-hud-block">
          <span className="cc-label">Guests</span>
          <span>
            {state.guestsInPark} / {state.guestsTotal}
          </span>
        </div>
        <div className="cc-hud-block">
          <span className="cc-label">Rating</span>
          <span>{'★'.repeat(ratingStars)}{'☆'.repeat(5 - ratingStars)}</span>
          <span className="cc-muted"> ({state.rating})</span>
        </div>
        <div className="cc-hud-actions">
          <button
            type="button"
            className="cc-mini-btn"
            onClick={() => dispatch({ type: 'PATCH', patch: { paused: !state.paused } })}
          >
            {state.paused ? '▶' : '⏸'}
          </button>
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              type="button"
              className={`cc-mini-btn ${state.speed === s ? 'cc-active' : ''}`}
              onClick={() => dispatch({ type: 'PATCH', patch: { speed: s as 1 | 2 | 3 } })}
            >
              {s}×
            </button>
          ))}
        </div>
      </header>

      <div className="cc-body">
        <aside className="cc-toolbar">
          <input
            type="search"
            className="cc-tool-search"
            placeholder="Search rides…"
            value={toolSearch}
            onChange={(e) => setToolSearch(e.target.value)}
          />
          <div className="cc-cat-tabs">
            {(['all', 'build', 'coaster', 'gentle', 'thrill', 'transport', 'water'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`cc-cat-tab ${categoryFilter === cat ? 'cc-cat-active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat === 'all' ? 'All' : cat === 'build' ? 'Build' : cat === 'coaster' ? '🎢' : cat === 'gentle' ? '🎠' : cat === 'thrill' ? '⚡' : cat === 'transport' ? '🚂' : '💧'}
              </button>
            ))}
          </div>
          {filteredGroups.map((group) => (
            <div key={group.title} className="cc-tool-group">
              <h3 className="cc-group-title">{group.title}</h3>
              <div className="cc-tool-grid">
                {group.tools.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`cc-tool ${state.tool === t.id ? 'cc-tool-active' : ''}`}
                    onClick={() => dispatch({ type: 'TOOL', tool: t.id })}
                    title={TOOL_HINTS[t.id]}
                  >
                    <span className="cc-tool-icon">{t.icon}</span>
                    <span className="cc-tool-label">{t.label}</span>
                    {t.cost != null && !state.sandbox && (
                      <span className="cc-tool-cost">${t.cost >= 1000 ? `${(t.cost / 1000).toFixed(1)}k` : t.cost}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {coasterBuilding && (
            <div className="cc-coaster-panel">
              <p className="cc-hint">
                {state.coasterDraft?.station
                  ? `Track: ${state.coasterDraft.cells.length} tiles`
                  : 'Click to place station'}
              </p>
              <button type="button" className="cc-btn" onClick={() => dispatch({ type: 'FINISH_COASTER' })}>
                Finish ride
              </button>
              <button type="button" className="cc-btn cc-btn-muted" onClick={() => dispatch({ type: 'CANCEL_COASTER' })}>
                Cancel
              </button>
            </div>
          )}
        </aside>

        <div
          className="cc-viewport"
          onWheel={(e) => {
            e.preventDefault();
            setCam((c) => ({
              x: Math.max(0, Math.min(width - 400, c.x + e.deltaX)),
              y: Math.max(0, Math.min(height - 300, c.y + e.deltaY)),
            }));
          }}
        >
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="cc-canvas"
            onClick={onCanvasClick}
            onMouseMove={(e) => setHover(screenToTile(e.clientX, e.clientY))}
            onMouseLeave={() => setHover(null)}
          />
        </div>

        <aside className="cc-sidebar">
          <h2 className="cc-title">Objectives</h2>
          {state.sandbox ? (
            <p className="cc-muted">Sandbox — no win condition. Build freely.</p>
          ) : (
            <ul className="cc-goals">
              {scenario.goals.map((g, i) => (
                <li key={i} className={isGoalMet(g, state) ? 'cc-goal-done' : ''}>
                  {isGoalMet(g, state) ? '✓ ' : '○ '}
                  {formatGoal(g)}
                </li>
              ))}
            </ul>
          )}
          <h2 className="cc-title">Park report</h2>
          <ul className="cc-stats">
            <li>Scenery: {state.scenery}</li>
            <li>Excitement: {state.excitement}</li>
            <li>Cleanliness: {Math.round(state.cleanliness)}%</li>
            <li>Rides: {state.rides.filter((r) => r.open).length}</li>
            <li>Income today: ${state.stats.incomeToday}</li>
          </ul>
          <h3 className="cc-subtitle">Rides</h3>
          {state.rides.length === 0 ? (
            <p className="cc-muted">No rides yet.</p>
          ) : (
            <ul className="cc-ride-list">
              {state.rides.map((r) => {
                const d = RIDE_DEF[r.kind];
                return (
                  <li key={r.id}>
                    <strong>{d.label}</strong>
                    <br />
                    <span className="cc-muted">
                      {r.isCoaster ? 'Coaster' : 'Flat'} · Q{r.queue} · {r.running}/{d.capacity}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <h3 className="cc-subtitle">Log</h3>
          <ul className="cc-log">
            {state.messages.map((m, i) => (
              <li key={`${i}-${m.slice(0, 12)}`}>{m}</li>
            ))}
          </ul>
          <p className="cc-hint">{TOOL_HINTS[state.tool]}</p>
        </aside>
      </div>

      {!state.sandbox && state.tutorialStep > 0 && state.tutorialStep < 4 && (
        <div className="cc-tutorial">
          {state.tutorialStep === 1 && 'Step 1: Place your park entrance.'}
          {state.tutorialStep === 2 && 'Step 2: Draw paths from the entrance.'}
          {state.tutorialStep === 3 && 'Step 3: Build any coaster or flat ride.'}
          <button
            type="button"
            className="cc-mini-btn"
            onClick={() => dispatch({ type: 'PATCH', patch: { tutorialStep: state.tutorialStep + 1 } })}
          >
            Got it
          </button>
        </div>
      )}

      {(state.phase === 'bankrupt' || state.phase === 'won') && (
        <div className="cc-overlay">
          <div className="cc-modal">
            <h1>{state.phase === 'won' ? '🎉 Scenario Complete!' : '📉 Bankrupt'}</h1>
            <p>
              {state.phase === 'won'
                ? `You beat ${scenario.name}! ${state.guestsTotal} guests, rating ${state.rating}.`
                : 'Your park ran out of money. Try Sandbox to practice or pick an easier scenario.'}
            </p>
            <button type="button" className="cc-btn" onClick={() => dispatch({ type: 'SET', payload: { ...createInitialState(), phase: 'menu' } })}>
              Choose scenario
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuScreen({
  onClose,
  onStart,
  onContinue,
  hasSave,
}: {
  onClose?: () => void;
  onStart: (id: ScenarioId) => void;
  onContinue: () => void;
  hasSave: boolean;
}) {
  const [picked, setPicked] = useState<ScenarioId | null>(null);

  return (
    <>
      <style>{COASTER_STYLES}</style>
      {onClose && (
        <button type="button" className="cc-back" onClick={onClose}>
          ◄ Back
        </button>
      )}
      <div className="cc-menu">
        <h1>Coaster Control</h1>
        <p className="cc-tagline">
          RCT2-inspired roster: {COASTER_COUNT} roller coasters + {FLAT_COUNT} gentle, thrill, transport & water rides.
        </p>
        {hasSave && (
          <button type="button" className="cc-btn cc-btn-large cc-btn-muted" onClick={onContinue}>
            Continue saved park
          </button>
        )}
        <div className="cc-scenario-grid">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`cc-scenario-card ${picked === s.id ? 'cc-scenario-picked' : ''}`}
              onClick={() => setPicked(s.id)}
            >
              <span className="cc-scenario-icon">{s.icon}</span>
              <strong>{s.name}</strong>
              <span className="cc-scenario-desc">{s.description}</span>
              <ul className="cc-scenario-goals">
                {s.goals.map((g, i) => (
                  <li key={i}>{formatGoal(g)}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="cc-btn cc-btn-large"
          disabled={!picked}
          onClick={() => picked && onStart(picked)}
        >
          {picked ? `Start ${SCENARIOS.find((s) => s.id === picked)?.name}` : 'Select a scenario'}
        </button>
        <p className="cc-credits">Scroll to pan · Guests animate smoothly between tiles</p>
      </div>
    </>
  );
}

const COASTER_STYLES = `
.coaster-control-root {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f1419 0%, #1a2634 50%, #0d3d2e 100%);
  color: #e8f0f2;
  font-family: system-ui, -apple-system, Segoe UI, sans-serif;
  display: flex;
  flex-direction: column;
}
.cc-back {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 100;
  padding: 8px 14px;
  background: rgba(0,0,0,0.65);
  border: 1px solid rgba(255,255,255,0.25);
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
}
.cc-hud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  align-items: center;
  padding: 10px 16px 10px 80px;
  background: rgba(0,0,0,0.45);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  font-size: 13px;
}
.cc-scenario-tag { gap: 8px; font-weight: 600; color: #a5d6a7; }
.cc-hud-block { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.cc-label { opacity: 0.65; font-size: 11px; text-transform: uppercase; }
.cc-money { color: #81c784; font-weight: 700; }
.cc-warn { color: #ff8a65; font-weight: 700; }
.cc-muted { opacity: 0.6; font-size: 12px; }
.cc-hud-actions { margin-left: auto; display: flex; gap: 6px; }
.cc-body { flex: 1; display: flex; min-height: 0; overflow: hidden; }
.cc-toolbar {
  width: 200px;
  padding: 8px;
  background: rgba(0,0,0,0.35);
  border-right: 1px solid rgba(255,255,255,0.08);
  overflow-y: auto;
}
.cc-tool-search {
  width: 100%;
  box-sizing: border-box;
  padding: 6px 8px;
  margin-bottom: 8px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(0,0,0,0.35);
  color: inherit;
  font-size: 11px;
}
.cc-cat-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}
.cc-cat-tab {
  padding: 4px 6px;
  font-size: 10px;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(0,0,0,0.25);
  color: inherit;
  cursor: pointer;
}
.cc-cat-tab.cc-cat-active { background: #2e7d32; border-color: #81c784; }
.cc-tool-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
}
.cc-tool-group { margin-bottom: 10px; }
.cc-group-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.55;
  margin: 0 0 4px 4px;
}
.cc-sidebar {
  width: 210px;
  padding: 10px;
  background: rgba(0,0,0,0.35);
  border-left: 1px solid rgba(255,255,255,0.08);
  overflow-y: auto;
  font-size: 12px;
}
.cc-title { font-size: 14px; margin: 0 0 8px; color: #a5d6a7; }
.cc-subtitle { font-size: 12px; margin: 12px 0 6px; color: #90caf9; }
.cc-tool {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  padding: 5px 6px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: rgba(255,255,255,0.05);
  color: inherit;
  cursor: pointer;
  font-size: 9px;
  text-align: left;
  min-height: 44px;
}
.cc-tool-label { line-height: 1.2; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
.cc-tool-cost { font-size: 8px; opacity: 0.55; }
.cc-tool:hover { background: rgba(255,255,255,0.12); }
.cc-tool-active { border-color: #66bb6a; background: rgba(102,187,106,0.2); }
.cc-tool-icon { font-size: 13px; }
.cc-viewport {
  flex: 1;
  overflow: auto;
  background: #0a120a;
}
.cc-canvas {
  display: block;
  cursor: crosshair;
  image-rendering: pixelated;
}
.cc-stats, .cc-ride-list, .cc-log, .cc-goals { list-style: none; padding: 0; margin: 0 0 12px; }
.cc-stats li, .cc-ride-list li, .cc-goals li { margin-bottom: 5px; }
.cc-goal-done { color: #81c784; }
.cc-log li { margin-bottom: 4px; opacity: 0.85; font-size: 11px; }
.cc-hint { font-size: 11px; opacity: 0.75; margin-top: 8px; }
.cc-coaster-panel { margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); }
.cc-btn {
  display: block;
  width: 100%;
  margin-top: 6px;
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: #43a047;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  font-size: 12px;
}
.cc-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.cc-btn:hover:not(:disabled) { filter: brightness(1.1); }
.cc-btn-muted { background: rgba(255,255,255,0.15); }
.cc-mini-btn {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(0,0,0,0.3);
  color: inherit;
  cursor: pointer;
  font-size: 11px;
}
.cc-mini-btn.cc-active { background: #2e7d32; border-color: #66bb6a; }
.cc-tutorial {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  background: rgba(33,150,243,0.9);
  border-radius: 10px;
  font-size: 13px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 12px;
}
.cc-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 80;
}
.cc-modal {
  background: #1e2a32;
  padding: 28px;
  border-radius: 12px;
  max-width: 360px;
  text-align: center;
}
.cc-modal h1 { margin-top: 0; }
.cc-menu {
  min-height: 100vh;
  padding: 24px 16px 48px;
  max-width: 900px;
  margin: 0 auto;
}
.cc-menu h1 {
  text-align: center;
  font-size: clamp(2rem, 6vw, 3rem);
  margin: 0 0 8px;
  background: linear-gradient(90deg, #ffeb3b, #ff9800, #e91e63);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.cc-tagline { text-align: center; opacity: 0.85; margin-bottom: 20px; }
.cc-scenario-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.cc-scenario-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 14px;
  border-radius: 10px;
  border: 2px solid rgba(255,255,255,0.12);
  background: rgba(0,0,0,0.25);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s, transform 0.2s;
}
.cc-scenario-card:hover { border-color: rgba(102,187,106,0.5); transform: translateY(-2px); }
.cc-scenario-picked { border-color: #66bb6a; background: rgba(102,187,106,0.12); }
.cc-scenario-icon { font-size: 28px; }
.cc-scenario-desc { font-size: 11px; opacity: 0.75; line-height: 1.4; }
.cc-scenario-goals {
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  font-size: 10px;
  opacity: 0.65;
}
.cc-scenario-goals li { margin-bottom: 2px; }
.cc-btn-large { max-width: 320px; margin: 0 auto 12px; padding: 14px 24px; font-size: 16px; }
.cc-credits { text-align: center; font-size: 11px; opacity: 0.5; margin-top: 16px; }
`;
