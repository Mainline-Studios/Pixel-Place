'use client';

import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  RIDE_DEF,
  RIDES_REGISTRY,
  TOOL_GROUPS,
  TOOL_HINTS,
  isCoasterTool,
  toolToRideKind,
} from './coasterControl/catalog';
import {
  BuildPanel,
  HowToPlayModal,
  ParkPanel,
  RidesPanel,
  type PanelId,
} from './coasterControl/CoasterControlPanels';
import { HOW_TO_PLAY_STEPS, getTutorialObjective, isGuideSeen, markGuideSeen } from './coasterControl/guide';
import { canvasSize, drawPark } from './coasterControl/draw';
import {
  cancelCoaster,
  createInitialState,
  demolishRide,
  finishCoaster,
  handleTileClick,
  loadSave,
  payLoan,
  saveGame,
  setAllRidesOpen,
  setTool,
  startGame,
  testRide,
  tickSimulation,
  toggleRideOpen,
} from './coasterControl/engine';
import { canvasSize as isoCanvasSize, defaultCamera, screenToTile as isoScreenToTile } from './coasterControl/iso';
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

const TOOL_GROUPS_FLAT = TOOL_GROUPS.flatMap((g) => g.tools);

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
  const [panel, setPanel] = useState<PanelId>(null);
  const [selectedRideId, setSelectedRideId] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const camRef = useRef(cam);
  camRef.current = cam;

  const stateRef = useRef(state);
  stateRef.current = state;
  const lastTickRef = useRef(performance.now());
  const moveAlphaRef = useRef(0);
  const animTimeRef = useRef(0);

  const { width, height } = canvasSize();
  const scenario = getScenario(state.scenarioId);
  const viewportRef = useRef<HTMLDivElement>(null);
  const tutorialActive = !state.sandbox && state.tutorialStep > 0 && state.tutorialStep <= 5;
  const highlightBuild = tutorialActive && state.tutorialStep === 1;
  const highlightRides = tutorialActive && state.tutorialStep === 5;

  useEffect(() => {
    if (panel === 'rides' && state.tutorialStep === 5 && !state.sandbox) {
      dispatch({ type: 'PATCH', patch: { tutorialStep: 0 } });
    }
  }, [panel, state.tutorialStep, state.sandbox]);

  useEffect(() => {
    if (state.sandbox || state.phase !== 'playing') return;
    if (state.tutorialStep === 3 && state.tool !== 'path') {
      setPanel('build');
      dispatch({ type: 'TOOL', tool: 'path' });
    }
  }, [state.tutorialStep, state.sandbox, state.phase, state.tool]);

  useEffect(() => {
    if (state.phase !== 'playing') return;
    const el = viewportRef.current;
    if (!el) return;
    const vw = el.clientWidth || 800;
    const vh = el.clientHeight || 500;
    setCam(defaultCamera(vw, vh));
  }, [state.phase, state.scenarioId]);

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

  const screenToTile = useCallback((clientX: number, clientY: number): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const px = (clientX - rect.left) * scaleX + camRef.current.x;
    const py = (clientY - rect.top) * scaleY + camRef.current.y;
    return isoScreenToTile(px, py);
  }, [width, height]);

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (state.phase !== 'playing' || state.paused) return;
    const t = screenToTile(e.clientX, e.clientY);
    if (!t) return;
    if (state.tool === 'select') {
      const cell = state.cells[t.y * state.mapW + t.x];
      if (cell?.rideId != null) {
        setSelectedRideId(cell.rideId);
        setPanel('rides');
        return;
      }
    }
    dispatch({ type: 'CLICK', x: t.x, y: t.y });
  };

  const panBy = (dx: number, dy: number) => {
    const el = viewportRef.current;
    const vw = el?.clientWidth ?? 800;
    const vh = el?.clientHeight ?? 500;
    const { width: cw, height: ch } = isoCanvasSize();
    setCam((c) => ({
      x: Math.max(0, Math.min(Math.max(0, cw - vw), c.x + dx)),
      y: Math.max(0, Math.min(Math.max(0, ch - vh), c.y + dy)),
    }));
  };

  const handleStartScenario = (id: ScenarioId) => {
    dispatch({ type: 'START', scenarioId: id });
    const sc = getScenario(id);
    if (!sc.sandbox) {
      setPanel('build');
      dispatch({ type: 'TOOL', tool: 'entrance' });
    }
    if (!isGuideSeen()) setShowGuide(true);
  };

  const handleContinue = () => {
    dispatch({ type: 'LOAD' });
  };

  const ratingStars = Math.min(5, Math.floor(state.rating / 200));

  if (state.phase === 'menu') {
    return (
      <div className="coaster-control-root">
        <MenuScreen
          onClose={onClose}
          onStart={handleStartScenario}
          onContinue={handleContinue}
          hasSave={!!loadSave()}
        />
      </div>
    );
  }

  const coasterBuilding = !!toolToRideKind(state.tool) && isCoasterTool(state.tool) && state.coasterDraft;
  const activeTool = TOOL_GROUPS_FLAT.find((t) => t.id === state.tool);
  const parkGoals = scenario.goals.map((g) => ({
    text: formatGoal(g),
    done: isGoalMet(g, state),
  }));

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
        <div className="cc-hud-block" title={state.guestsInPark === 0 ? 'Place an entrance and paths so guests can enter.' : undefined}>
          <span className="cc-label">Guests</span>
          <span>
            {state.guestsInPark} / {state.guestsTotal}
          </span>
          {state.guestsInPark === 0 && state.phase === 'playing' && (
            <span className="cc-muted"> — need entrance + paths</span>
          )}
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

      <div className="cc-play-area">
        <div className="cc-viewport-wrap">
        <div className="cc-pan-pad">
          <button type="button" className="cc-pan-btn" onClick={() => panBy(0, -80)} aria-label="Pan up">
            ▲
          </button>
          <div className="cc-pan-row">
            <button type="button" className="cc-pan-btn" onClick={() => panBy(-80, 0)} aria-label="Pan left">
              ◀
            </button>
            <button type="button" className="cc-pan-btn cc-pan-home" onClick={() => {
              const el = viewportRef.current;
              if (el) setCam(defaultCamera(el.clientWidth, el.clientHeight));
            }} aria-label="Center park">
              ⌂
            </button>
            <button type="button" className="cc-pan-btn" onClick={() => panBy(80, 0)} aria-label="Pan right">
              ▶
            </button>
          </div>
          <button type="button" className="cc-pan-btn" onClick={() => panBy(0, 80)} aria-label="Pan down">
            ▼
          </button>
        </div>
        <div
          ref={viewportRef}
          className="cc-viewport"
          onWheel={(e) => {
            e.preventDefault();
            const vw = typeof window !== 'undefined' ? window.innerWidth : 800;
            const vh = typeof window !== 'undefined' ? window.innerHeight - 120 : 600;
            setCam((c) => ({
              x: Math.max(0, Math.min(Math.max(0, width - vw), c.x + e.deltaX)),
              y: Math.max(0, Math.min(Math.max(0, height - vh), c.y + e.deltaY)),
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
        </div>

        {tutorialActive && getTutorialObjective(state.tutorialStep) && (
          <div className="cc-objective-bar" role="status">
            <span className="cc-objective-label">Objective</span>
            {getTutorialObjective(state.tutorialStep)}
          </div>
        )}

        <div className="cc-dock">
          <button
            type="button"
            className={`cc-dock-btn ${panel === 'build' ? 'cc-dock-on' : ''} ${highlightBuild ? 'cc-dock-highlight' : ''}`}
            onClick={() => setPanel(panel === 'build' ? null : 'build')}
          >
            <span className="cc-dock-icon">🔨</span>
            <span>Build</span>
          </button>
          <button
            type="button"
            className={`cc-dock-btn ${panel === 'rides' ? 'cc-dock-on' : ''} ${highlightRides ? 'cc-dock-highlight' : ''}`}
            onClick={() => setPanel(panel === 'rides' ? null : 'rides')}
          >
            <span className="cc-dock-icon">🎢</span>
            <span>Rides</span>
          </button>
          <button
            type="button"
            className={`cc-dock-btn ${panel === 'park' ? 'cc-dock-on' : ''}`}
            onClick={() => setPanel(panel === 'park' ? null : 'park')}
          >
            <span className="cc-dock-icon">📋</span>
            <span>Park</span>
          </button>
          <button
            type="button"
            className={`cc-dock-btn ${state.tool === 'select' ? 'cc-dock-on' : ''}`}
            onClick={() => dispatch({ type: 'TOOL', tool: 'select' })}
          >
            <span className="cc-dock-icon">🔍</span>
            <span>Inspect</span>
          </button>
          <button
            type="button"
            className={`cc-dock-btn ${state.tool === 'bulldoze' ? 'cc-dock-on' : ''}`}
            onClick={() => dispatch({ type: 'TOOL', tool: 'bulldoze' })}
          >
            <span className="cc-dock-icon">🚧</span>
            <span>Bulldoze</span>
          </button>
          <button type="button" className="cc-dock-btn" onClick={() => setShowGuide(true)} title="How to play">
            <span className="cc-dock-icon">?</span>
            <span>Help</span>
          </button>
          <div className="cc-dock-tool">
            {activeTool ? (
              <>
                <span className="cc-dock-tool-icon">{activeTool.icon}</span>
                <span className="cc-dock-tool-label">{activeTool.label}</span>
              </>
            ) : (
              <span className="cc-muted">No tool selected</span>
            )}
          </div>
          {coasterBuilding && (
            <div className="cc-dock-coaster">
              <span className="cc-dock-coaster-hint">Station → track → Finish</span>
              <button type="button" className="cc-mini-btn" onClick={() => dispatch({ type: 'FINISH_COASTER' })}>
                Finish
              </button>
              <button type="button" className="cc-mini-btn" onClick={() => dispatch({ type: 'CANCEL_COASTER' })}>
                Cancel
              </button>
            </div>
          )}
        </div>
        <p className="cc-status-hint">
          {coasterBuilding
            ? 'Coaster: place station, add connected track tiles, then Finish.'
            : TOOL_HINTS[state.tool]}
        </p>
      </div>

      {showGuide && (
        <HowToPlayModal
          steps={HOW_TO_PLAY_STEPS}
          onClose={() => setShowGuide(false)}
          onDontShowAgain={() => {
            markGuideSeen();
            setShowGuide(false);
          }}
        />
      )}

      {panel === 'build' && (
        <BuildPanel
          state={state}
          onClose={() => setPanel(null)}
          onPickTool={(tool) => dispatch({ type: 'TOOL', tool })}
          onFinishCoaster={() => dispatch({ type: 'FINISH_COASTER' })}
          onCancelCoaster={() => dispatch({ type: 'CANCEL_COASTER' })}
        />
      )}
      {panel === 'rides' && (
        <RidesPanel
          state={state}
          selectedId={selectedRideId}
          onSelect={setSelectedRideId}
          onClose={() => setPanel(null)}
          onToggleOpen={(id) => dispatch({ type: 'SET', payload: toggleRideOpen(state, id) })}
          onOpenAll={() => dispatch({ type: 'SET', payload: setAllRidesOpen(state, true) })}
          onCloseAll={() => dispatch({ type: 'SET', payload: setAllRidesOpen(state, false) })}
          onTest={(id) => dispatch({ type: 'SET', payload: testRide(state, id) })}
          onDemolish={(id) => {
            dispatch({ type: 'SET', payload: demolishRide(state, id) });
            setSelectedRideId(null);
          }}
        />
      )}
      {panel === 'park' && (
        <ParkPanel
          state={state}
          scenarioName={scenario.name}
          scenarioIcon={scenario.icon}
          goals={parkGoals}
          onClose={() => setPanel(null)}
        />
      )}

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
        <div className="cc-menu-window">
        <h1>Coaster Control</h1>
        <p className="cc-tagline">
          Isometric park builder — {COASTER_COUNT} coasters + {FLAT_COUNT} flat & water rides (RCT2-style).
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
        </div>
        <div className="cc-quickstart">
          <span>Quick start:</span>
          <span>🎫 Entrance</span>
          <span>🛤️ Path</span>
          <span>🎠 Ride</span>
          <span>🎢 Rides panel</span>
        </div>
        <p className="cc-credits">Press ? in-game for the full how-to-play guide</p>
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
.coaster-control-root { height: 100vh; overflow: hidden; }
.cc-play-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.cc-viewport-wrap {
  flex: 1;
  display: flex;
  min-height: 0;
  position: relative;
}
.cc-pan-pad {
  position: absolute;
  left: 12px;
  bottom: 12px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  pointer-events: none;
}
.cc-pan-pad button { pointer-events: auto; }
.cc-pan-row { display: flex; gap: 2px; }
.cc-pan-btn {
  width: 36px;
  height: 32px;
  border: 2px outset #8d6e63;
  background: linear-gradient(180deg, #a1887f, #5d4037);
  color: #fff8e1;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
}
.cc-pan-home { font-size: 14px; }
.cc-viewport {
  flex: 1;
  overflow: auto;
  background: linear-gradient(180deg, #5eb0e8 0%, #87ceeb 40%, #2d5a27 100%);
}
.cc-canvas {
  display: block;
  cursor: crosshair;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
.cc-dock {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 8px 12px 6px;
  background: linear-gradient(180deg, #5d4037 0%, #3e2723 100%);
  border-top: 3px solid #8d6e63;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.35);
}
.cc-dock-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 56px;
  padding: 6px 8px;
  border: 2px outset #a1887f;
  border-radius: 4px;
  background: linear-gradient(180deg, #8d6e63, #5d4037);
  color: #fff8e1;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}
.cc-dock-btn:hover { filter: brightness(1.08); }
.cc-dock-btn.cc-dock-on {
  background: linear-gradient(180deg, #66bb6a, #2e7d32);
  border-color: #c8e6c9;
}
.cc-dock-icon { font-size: 18px; line-height: 1; }
.cc-dock-tool {
  flex: 1;
  min-width: 120px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  font-size: 12px;
  color: #ffe0b2;
}
.cc-dock-tool-icon { font-size: 20px; }
.cc-dock-coaster { display: flex; gap: 6px; margin-left: auto; }
.cc-status-hint {
  margin: 0;
  padding: 4px 12px 8px;
  font-size: 11px;
  background: #3e2723;
  color: #ffcc80;
  border-top: 1px solid rgba(0,0,0,0.3);
}
.cc-objective-bar {
  padding: 10px 14px;
  background: linear-gradient(90deg, #1b5e20, #2e7d32);
  color: #e8f5e9;
  font-size: 13px;
  font-weight: 600;
  border-top: 2px solid #81c784;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.cc-objective-label {
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.08em;
  opacity: 0.85;
}
.cc-dock-highlight {
  animation: ccPulse 1.2s ease-in-out infinite;
  box-shadow: 0 0 0 3px #ffeb3b, 0 0 12px rgba(255,235,59,0.6);
}
@keyframes ccPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
.cc-dock-coaster-hint { font-size: 10px; color: #ffcc80; margin-right: 6px; }
.cc-guide-intro { margin: 0 0 12px; font-size: 13px; color: #4e342e; }
.cc-guide-steps { margin: 0 0 16px; padding-left: 22px; font-size: 12px; line-height: 1.5; }
.cc-guide-steps li { margin-bottom: 10px; }
.cc-guide-steps p { margin: 4px 0 0; color: #5d4037; }
.cc-guide-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.cc-quickstart {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  justify-content: center;
  margin: 16px 0 8px;
  font-size: 12px;
  color: rgba(255,255,255,0.75);
}
.cc-popup-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.cc-popup {
  width: min(420px, 96vw);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #efebe9, #d7ccc8);
  color: #1b1b1b;
  border: 3px solid #5d4037;
  border-radius: 6px;
  box-shadow: 8px 8px 0 rgba(0,0,0,0.35);
  font-family: Georgia, 'Times New Roman', serif;
}
.cc-popup-wide { width: min(720px, 98vw); }
.cc-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: linear-gradient(180deg, #6d4c41, #4e342e);
  color: #fff8e1;
}
.cc-popup-header h2 { margin: 0; font-size: 16px; font-weight: 700; }
.cc-popup-close {
  border: none;
  background: transparent;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
}
.cc-popup-body { padding: 12px 14px; overflow: hidden; display: flex; flex-direction: column; min-height: 0; }
.cc-popup-tabs { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
.cc-popup-tab {
  padding: 5px 8px;
  font-size: 10px;
  border: 2px outset #bcaaa4;
  background: #efebe9;
  cursor: pointer;
  border-radius: 3px;
}
.cc-popup-tab-on { background: #a5d6a7; border-color: #2e7d32; font-weight: 700; }
.cc-popup-search {
  width: 100%;
  box-sizing: border-box;
  padding: 8px;
  margin-bottom: 8px;
  border: 2px inset #bcaaa4;
  border-radius: 4px;
  font-size: 12px;
}
.cc-popup-scroll { overflow-y: auto; flex: 1; max-height: 50vh; padding-right: 4px; }
.cc-popup-section h3 {
  margin: 10px 0 6px;
  font-size: 11px;
  text-transform: uppercase;
  color: #4e342e;
}
.cc-popup-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 6px;
}
.cc-popup-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px;
  border: 2px outset #d7ccc8;
  background: #fff;
  cursor: pointer;
  text-align: left;
  font-size: 10px;
  border-radius: 4px;
}
.cc-popup-item-on { border-color: #2e7d32; background: #e8f5e9; }
.cc-popup-item-icon { font-size: 16px; }
.cc-popup-item-label { font-weight: 600; line-height: 1.2; }
.cc-popup-item-cost { opacity: 0.65; font-size: 9px; }
.cc-popup-foot { margin: 8px 0 0; font-size: 11px; color: #4e342e; }
.cc-popup-btn {
  padding: 8px 12px;
  border: 2px outset #81c784;
  background: linear-gradient(180deg, #66bb6a, #388e3c);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
}
.cc-popup-btn-muted {
  border-color: #bcaaa4;
  background: linear-gradient(180deg, #efebe9, #bcaaa4);
  color: #3e2723;
}
.cc-popup-btn-danger {
  border-color: #e57373;
  background: linear-gradient(180deg, #ef5350, #c62828);
}
.cc-coaster-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px;
  background: #fff8e1;
  border: 2px inset #ffcc80;
  font-size: 12px;
}
.cc-rides-toolbar { display: flex; gap: 8px; margin-bottom: 10px; }
.cc-rides-split { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; min-height: 200px; }
@media (max-width: 600px) { .cc-rides-split { grid-template-columns: 1fr; } }
.cc-rides-list { list-style: none; margin: 0; padding: 0; overflow-y: auto; max-height: 45vh; }
.cc-ride-row {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 8px;
  margin-bottom: 4px;
  border: 2px outset #d7ccc8;
  background: #fff;
  cursor: pointer;
  text-align: left;
  font-size: 11px;
}
.cc-ride-row-on { background: #e8f5e9; border-color: #2e7d32; }
.cc-ride-row-main { display: flex; flex-direction: column; }
.cc-ride-row-meta { font-size: 10px; opacity: 0.7; }
.cc-status-open { color: #2e7d32; font-weight: 700; }
.cc-status-closed { color: #c62828; font-weight: 700; }
.cc-ride-detail {
  padding: 10px;
  background: #fff;
  border: 2px inset #bcaaa4;
}
.cc-ride-detail h3 { margin: 0 0 8px; font-size: 14px; }
.cc-ride-stats { display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; font-size: 11px; margin: 0 0 12px; }
.cc-ride-stats dt { font-weight: 700; color: #5d4037; }
.cc-ride-stats dd { margin: 0; }
.cc-ride-actions { display: flex; flex-direction: column; gap: 6px; }
.cc-popup-empty { font-size: 13px; color: #5d4037; }
.cc-park-scenario { font-weight: 700; margin-top: 0; }
.cc-title { font-size: 14px; margin: 12px 0 8px; color: #4e342e; }
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
  max-width: 920px;
  margin: 0 auto;
}
.cc-menu-window {
  padding: 20px 24px 28px;
  border: 4px solid #5d4037;
  border-radius: 8px;
  background: linear-gradient(180deg, #efebe9 0%, #d7ccc8 100%);
  color: #1b1b1b;
  box-shadow: 8px 8px 0 rgba(0,0,0,0.35);
}
.cc-menu-window h1 {
  -webkit-text-fill-color: #3e2723;
  color: #3e2723;
  background: none;
}
.cc-menu-window .cc-tagline { color: #4e342e; }
.cc-menu-window .cc-scenario-card {
  background: rgba(255,255,255,0.65);
  color: #1b1b1b;
}
.cc-menu-window .cc-btn-large { color: #fff; }
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
