import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Red Rover (Multiplayer-capable)
 *
 * Changes:
 * - Adds optional multiplayer via a simple WebSocket relay server.
 * - Players can Host or Join a room (enter server URL + room ID).
 * - Host is authoritative: applies actions and broadcasts full state.
 * - Non-host clients send actions to the host through the server.
 * - If not connected to a server, falls back to local single-player behavior.
 *
 * Usage:
 * 1) Start the relay server (see scripts/red-rover-ws-server.js in this PR/message).
 * 2) In the game UI, enter server WebSocket URL (e.g. ws://localhost:8080), choose Host or Join.
 * 3) Host creates a room (random ID) or Joiner enters same room ID.
 *
 * Note: This component expects a simple relay server that supports room join/leave and relays messages.
 * The server script provided alongside this file implements minimal room/host assignment logic.
 */

/* ------------------------------
   Types & helpers
   ------------------------------ */
type TeamSide = "left" | "right";
type Player = {
  id: string;
  name: string;
  strength: number; // 1-10
};

type Phase = "call" | "chooseRunner" | "run" | "result" | "gameOver";

type WsMessage =
  | { type: "join"; room: string; name: string }
  | { type: "joined"; room: string; clientId: string; isHost: boolean }
  | { type: "action"; action: ClientAction }
  | { type: "state"; state: SerializableState }
  | { type: "host-assigned"; assigned: boolean }
  | { type: "error"; message: string };

type ClientAction =
  | { kind: "callPlayer"; targetId: string }
  | { kind: "chooseRunner"; runnerId: string }
  | { kind: "boost" }
  | { kind: "finishRun" }
  | { kind: "reset" }
  | { kind: "switchTurn" };

type SerializableState = {
  leftTeam: Player[];
  rightTeam: Player[];
  currentCaller: TeamSide;
  phase: Phase;
  calledPlayerId: string | null;
  runnerId: string | null;
  defenderPair: string[] | null;
  runnerPower: number;
  runProgress: number;
  boostsLeft: number;
  lastResult: string | null;
};

const seedPlayers = (prefix: string, names: string[]): Player[] =>
  names.map((n, i) => ({
    id: `${prefix}-${i}`,
    name: n,
    strength: Math.max(1, Math.floor(Math.random() * 6) + 3), // 3-8
  }));

/* ------------------------------
   Component
   ------------------------------ */
export default function RedRover(): JSX.Element {
  // Game state (single source of truth, host will broadcast)
  const [leftTeam, setLeftTeam] = useState<Player[]>(
    () =>
      seedPlayers("L", [
        "Alex",
        "Bailey",
        "Casey",
        "Drew",
        "Evan",
        "Frankie",
        "Gab",
      ])
  );
  const [rightTeam, setRightTeam] = useState<Player[]>(
    () =>
      seedPlayers("R", [
        "Harper",
        "Indie",
        "Jordan",
        "Kai",
        "Lee",
        "Morgan",
        "Nova",
      ])
  );

  const [currentCaller, setCurrentCaller] = useState<TeamSide>("left");
  const [phase, setPhase] = useState<Phase>("call");
  const [calledPlayerId, setCalledPlayerId] = useState<string | null>(null);
  const [runnerId, setRunnerId] = useState<string | null>(null);
  const [defenderPair, setDefenderPair] = useState<string[] | null>(null);
  const [runnerPower, setRunnerPower] = useState<number>(0);
  const [runProgress, setRunProgress] = useState<number>(0);
  const [runDurationMs] = useState<number>(3000);
  const [boostsLeft, setBoostsLeft] = useState<number>(3);
  const [lastResult, setLastResult] = useState<string | null>(null);

  // Multiplayer meta-state
  const [serverUrl, setServerUrl] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>(() => `P-${Math.floor(Math.random()*1000)}`);
  const [wsConnected, setWsConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // convenience
  const callerTeam = currentCaller === "left" ? leftTeam : rightTeam;
  const defenderTeam = currentCaller === "left" ? rightTeam : leftTeam;

  const chainStrength = useMemo(() => {
    if (!defenderPair) return 0;
    const defenders = defenderPair
      .map((id) => defenderTeam.find((p) => p.id === id))
      .filter(Boolean) as Player[];
    return defenders.reduce((s, p) => s + p.strength, 0);
  }, [defenderPair, defenderTeam]);

  /* ------------------------------
     WebSocket helpers
     ------------------------------ */
  function connectToServer(url: string, room: string, name: string) {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        // send join
        const join: WsMessage = { type: "join", room, name };
        ws.send(JSON.stringify(join));
      };

      ws.onmessage = (ev) => {
        try {
          const data: WsMessage = JSON.parse(ev.data);
          handleWsMessage(data);
        } catch (err) {
          console.error("Invalid WS message", err);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        setIsHost(false);
        setClientId(null);
        wsRef.current = null;
      };

      ws.onerror = (ev) => {
        console.error("WS error", ev);
      };
    } catch (err) {
      console.error("WS connect error", err);
    }
  }

  function disconnectServer() {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
    }
    wsRef.current = null;
    setWsConnected(false);
    setIsHost(false);
    setClientId(null);
  }

  function sendAction(action: ClientAction) {
    // If connected & not host: send to host via server
    if (wsConnected && wsRef.current) {
      const msg: WsMessage = { type: "action", action };
      wsRef.current.send(JSON.stringify(msg));
      return;
    }
    // If not connected or we're host, apply immediately
    applyActionLocally(action, true);
  }

  function broadcastState(state: SerializableState) {
    if (!wsRef.current || !wsConnected) return;
    const msg: WsMessage = { type: "state", state };
    wsRef.current.send(JSON.stringify(msg));
  }

  function handleWsMessage(msg: WsMessage) {
    if (msg.type === "joined") {
      setClientId(msg.clientId);
      setIsHost(msg.isHost);
      if (msg.isHost) {
        // Host should broadcast current full state to others immediately
        broadcastState(serializeState());
      }
    } else if (msg.type === "host-assigned") {
      setIsHost(msg.assigned);
      if (msg.assigned) {
        // if we just became host, broadcast current state
        broadcastState(serializeState());
      }
    } else if (msg.type === "state") {
      // Non-hosts will receive authoritative full state updates
      if (!isHost) {
        restoreStateFromSerializable(msg.state);
      }
    } else if (msg.type === "action") {
      // Server relays actions: only host should apply them
      if (isHost) {
        applyActionLocally(msg.action, true);
      }
    } else if (msg.type === "error") {
      console.error("Server error:", msg.message);
    }
  }

  /* ------------------------------
     State serialization & restore
     ------------------------------ */
  function serializeState(): SerializableState {
    return {
      leftTeam,
      rightTeam,
      currentCaller,
      phase,
      calledPlayerId,
      runnerId,
      defenderPair,
      runnerPower,
      runProgress,
      boostsLeft,
      lastResult,
    };
  }

  function restoreStateFromSerializable(s: SerializableState) {
    setLeftTeam(s.leftTeam);
    setRightTeam(s.rightTeam);
    setCurrentCaller(s.currentCaller);
    setPhase(s.phase);
    setCalledPlayerId(s.calledPlayerId);
    setRunnerId(s.runnerId);
    setDefenderPair(s.defenderPair);
    setRunnerPower(s.runnerPower);
    setRunProgress(s.runProgress);
    setBoostsLeft(s.boostsLeft);
    setLastResult(s.lastResult);
  }

  /* ------------------------------
     Game action application (host-authoritative)
     - applyActionLocally(action, broadcast?)
     ------------------------------ */
  function applyActionLocally(action: ClientAction, broadcastAfter = false) {
    // For determinism, always operate on the latest state using setters
    // We make copies and then set state at the end
    // Many actions reuse functions already present in single-player version semantics
    if (action.kind === "callPlayer") {
      // find target in defender team
      setCalledPlayerId(action.targetId);
      setPhase("chooseRunner");
      // auto-select defender pair
      setTimeout(() => {
        const defTeam = currentCaller === "left" ? rightTeam : leftTeam;
        const idx = defTeam.findIndex((p) => p.id === action.targetId);
        if (idx !== -1) {
          const pair: string[] = [];
          pair.push(defTeam[idx].id);
          if (idx > 0) pair.push(defTeam[idx - 1].id);
          else if (idx < defTeam.length - 1) pair.push(defTeam[idx + 1].id);
          setDefenderPair(pair);
        }
      }, 0);
    } else if (action.kind === "chooseRunner") {
      setRunnerId(action.runnerId);
      setPhase("run");
      // start run loop locally for host only
      if (isHost) startRunLoop();
    } else if (action.kind === "boost") {
      setRunnerPower((p) => Math.min(200, p + 15 + Math.random() * 10));
      setBoostsLeft((b) => Math.max(0, b - 1));
    } else if (action.kind === "finishRun") {
      // force finalize
      finalizeRunHost();
    } else if (action.kind === "reset") {
      resetGameLocal();
    } else if (action.kind === "switchTurn") {
      setCalledPlayerId(null);
      setRunnerId(null);
      setDefenderPair(null);
      setLastResult(null);
      setCurrentCaller((c) => (c === "left" ? "right" : "left"));
      setPhase("call");
    }

    // broadcast new full state if we're host and required
    if (isHost && broadcastAfter) {
      setTimeout(() => {
        broadcastState(serializeState());
      }, 50);
    }
  }

  /* ------------------------------
     Run loop + finalize (host applies)
     ------------------------------ */
  const runTimerRef = useRef<number | null>(null);
  function startRunLoop() {
    // host will increment runProgress and runnerPower periodically
    setRunProgress(0);
    setRunnerPower(0);
    setBoostsLeft(3);
    const start = Date.now();
    if (runTimerRef.current) {
      window.clearInterval(runTimerRef.current);
      runTimerRef.current = null;
    }
    runTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / runDurationMs) * 100);
      setRunProgress(pct);
      setRunnerPower((prev) => Math.min(100, prev + (100 / (runDurationMs / 100))));
      if (pct >= 100) {
        if (runTimerRef.current) {
          window.clearInterval(runTimerRef.current);
          runTimerRef.current = null;
        }
        setTimeout(() => finalizeRunHost(), 200);
      }
    }, 100);
  }

  function finalizeRunHost() {
    // Host applies run resolution (same logic as single-player)
    if (!runnerId || !calledPlayerId || !defenderPair) {
      setPhase("result");
      setLastResult("Something went wrong (missing data).");
      if (isHost) broadcastState(serializeState());
      return;
    }

    const callerTeamLocal = currentCaller === "left" ? leftTeam : rightTeam;
    const defenderTeamLocal = currentCaller === "left" ? rightTeam : leftTeam;

    const runner = callerTeamLocal.find((p) => p.id === runnerId)!;
    const base = runner.strength * 10;
    const finalRunnerScore = base + runnerPower + Math.random() * 20;
    const finalChain = chainStrength * 10 + Math.random() * 10;
    const success = finalRunnerScore >= finalChain;

    if (success) {
      const takenPlayerId = calledPlayerId;
      const takenPlayer = defenderTeamLocal.find((p) => p.id === takenPlayerId)!;

      let newCallerTeam = [...callerTeamLocal];
      let newDefenderTeam = [...defenderTeamLocal];

      newDefenderTeam = newDefenderTeam.filter((p) => p.id !== takenPlayerId);
      newCallerTeam = [runner, ...newCallerTeam];
      newCallerTeam = newCallerTeam.filter((p, i) => i === 0 || p.id !== runnerId);

      if (currentCaller === "left") {
        setLeftTeam(newCallerTeam);
        setRightTeam(newDefenderTeam);
      } else {
        setRightTeam(newCallerTeam);
        setLeftTeam(newDefenderTeam);
      }

      setLastResult(`Success! ${runner.name} broke through and captured ${takenPlayer.name}.`);
    } else {
      const runnerPlayer = callerTeamLocal.find((p) => p.id === runnerId)!;
      let newCallerTeam = callerTeamLocal.filter((p) => p.id !== runnerId);
      let newDefenderTeam = [...defenderTeamLocal];
      const insertAfterId = defenderPair[0];
      const idx = newDefenderTeam.findIndex((p) => p.id === insertAfterId);
      if (idx === -1) newDefenderTeam.push(runnerPlayer);
      else newDefenderTeam.splice(idx + 1, 0, runnerPlayer);

      if (currentCaller === "left") {
        setLeftTeam(newCallerTeam);
        setRightTeam(newDefenderTeam);
      } else {
        setRightTeam(newCallerTeam);
        setLeftTeam(newDefenderTeam);
      }

      setLastResult(`Failed. ${runnerPlayer.name} was caught and added to the defenders.`);
    }

    // check for game over - simple check
    setTimeout(() => {
      if (leftTeam.length === 0 || rightTeam.length === 0) {
        setPhase("gameOver");
      } else {
        setPhase("result");
      }

      // host broadcasts final state
      if (isHost) broadcastState(serializeState());
    }, 300);
  }

  /* ------------------------------
     Helper actions for local (non-networked) use
     ------------------------------ */
  function resetGameLocal() {
    setLeftTeam(
      seedPlayers("L", ["Alex", "Bailey", "Casey", "Drew", "Evan", "Frankie", "Gab"])
    );
    setRightTeam(
      seedPlayers("R", ["Harper", "Indie", "Jordan", "Kai", "Lee", "Morgan", "Nova"])
    );
    setCurrentCaller(Math.random() > 0.5 ? "left" : "right");
    setPhase("call");
    setCalledPlayerId(null);
    setRunnerId(null);
    setDefenderPair(null);
    setLastResult(null);
  }

  /* ------------------------------
     UI action wrappers (sendAction when connected)
     ------------------------------ */
  function onCallPlayer(targetId: string) {
    if (wsConnected && !isHost) {
      sendAction({ kind: "callPlayer", targetId });
    } else {
      // immediate apply (host or offline)
      applyActionLocally({ kind: "callPlayer", targetId }, true);
    }
  }

  function onChooseRunner(rid: string) {
    if (wsConnected && !isHost) {
      sendAction({ kind: "chooseRunner", runnerId: rid });
    } else {
      applyActionLocally({ kind: "chooseRunner", runnerId: rid }, true);
    }
  }

  function onBoost() {
    if (wsConnected && !isHost) {
      sendAction({ kind: "boost" });
    } else {
      applyActionLocally({ kind: "boost" }, true);
    }
  }

  function onFinishRun() {
    if (wsConnected && !isHost) {
      sendAction({ kind: "finishRun" });
    } else {
      applyActionLocally({ kind: "finishRun" }, true);
    }
  }

  function onResetGame() {
    if (wsConnected && !isHost) {
      sendAction({ kind: "reset" });
    } else {
      resetGameLocal();
      if (isHost) broadcastState(serializeState());
    }
  }

  function continueAfterResult() {
    if (wsConnected && !isHost) {
      sendAction({ kind: "switchTurn" });
    } else {
      // local apply / host apply
      setCalledPlayerId(null);
      setRunnerId(null);
      setDefenderPair(null);
      setLastResult(null);
      setCurrentCaller((c) => (c === "left" ? "right" : "left"));
      setPhase("call");
      if (isHost) broadcastState(serializeState());
    }
  }

  /* ------------------------------
     Auto-broadcast when host state changes
     ------------------------------ */
  useEffect(() => {
    if (isHost && wsConnected) {
      broadcastState(serializeState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    leftTeam,
    rightTeam,
    currentCaller,
    phase,
    calledPlayerId,
    runnerId,
    defenderPair,
    runnerPower,
    runProgress,
    boostsLeft,
    lastResult,
  ]);

  /* ------------------------------
     Clean up on unmount
     ------------------------------ */
  useEffect(() => {
    return () => {
      if (runTimerRef.current) {
        window.clearInterval(runTimerRef.current);
        runTimerRef.current = null;
      }
      disconnectServer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------
     Rendering helpers
     ------------------------------ */
  function renderPlayer(p: Player, highlight = false) {
    return (
      <div
        key={p.id}
        style={{
          padding: "8px 10px",
          margin: "6px 4px",
          borderRadius: 8,
          background: highlight ? "#ffd" : "#fff",
          border: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          minWidth: 140,
        }}
      >
        <span style={{ fontWeight: 600 }}>{p.name}</span>
        <span style={{ opacity: 0.8 }}>{p.strength}</span>
      </div>
    );
  }

  /* ------------------------------
     UI
     ------------------------------ */
  return (
    <div
      style={{
        fontFamily:
          "Inter, Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        maxWidth: 980,
        margin: "20px auto",
        padding: 18,
      }}
    >
      <h2 style={{ margin: "4px 0 12px" }}>Red Rover (Multiplayer)</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <strong>Multiplayer</strong>
          <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
            <input
              placeholder="WebSocket server (ws://host:port)"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
            />
            <input
              placeholder="room id (auto if empty)"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              style={{ width: 140, padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
            />
            <input
              placeholder="your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              style={{ width: 140, padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
            />
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                const room = roomId || Math.random().toString(36).slice(2, 8);
                setRoomId(room);
                connectToServer(serverUrl || "ws://localhost:8080", room, playerName);
              }}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: "#dff",
                cursor: "pointer",
              }}
              disabled={wsConnected || !serverUrl}
            >
              Host / Join
            </button>

            <button
              onClick={() => disconnectServer()}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: "#ffd",
                cursor: "pointer",
              }}
              disabled={!wsConnected}
            >
              Disconnect
            </button>

            <div style={{ marginLeft: 8, color: wsConnected ? "#080" : "#888" }}>
              {wsConnected ? `Connected${isHost? " (host)" : ""}` : "Offline"}
            </div>
          </div>

          <div style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
            Server is a simple relay that assigns host to the first client in a room. Host is
            authoritative; others send actions to host. See server script in this message.
          </div>
        </div>

        <div style={{ width: 220 }}>
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background: "#fff",
              border: "1px solid #eee",
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <strong>Phase:</strong> {phase}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Turn:</strong> {currentCaller.toUpperCase()}
            </div>
            <div style={{ marginBottom: 6, fontSize: 13, color: "#666" }}>
              {wsConnected ? `Room: ${roomId}` : "Not connected"}
            </div>
            <div>
              <button
                onClick={() => onResetGame()}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "#fffb",
                  cursor: "pointer",
                }}
              >
                Reset Game
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: 6 }}>
            Left Team {currentCaller === "left" && phase !== "gameOver" ? "🔊 (caller)" : ""}
          </h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              background: "#f7f7f7",
              padding: 8,
              borderRadius: 8,
              minHeight: 120,
            }}
          >
            {leftTeam.map((p) =>
              currentCaller === "right" && phase === "call" ? (
                <div
                  key={p.id}
                  onClick={() => onCallPlayer(p.id)}
                  style={{
                    cursor: "pointer",
                    opacity: 1,
                  }}
                  title="Click to call this player"
                >
                  {renderPlayer(p)}
                </div>
              ) : (
                <div key={p.id}>{renderPlayer(p, runnerId === p.id)}</div>
              )
            )}
          </div>
        </div>

        <div style={{ width: 220, textAlign: "center" }}>
          {/* middle panel already above */}
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: 6 }}>
            Right Team {currentCaller === "right" && phase !== "gameOver" ? "🔊 (caller)" : ""}
          </h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              background: "#f7f7f7",
              padding: 8,
              borderRadius: 8,
              minHeight: 120,
              justifyContent: "flex-end",
            }}
          >
            {rightTeam.map((p) =>
              currentCaller === "left" && phase === "call" ? (
                <div
                  key={p.id}
                  onClick={() => onCallPlayer(p.id)}
                  style={{ cursor: "pointer" }}
                  title="Click to call this player"
                >
                  {renderPlayer(p)}
                </div>
              ) : (
                <div key={p.id}>{renderPlayer(p, runnerId === p.id)}</div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Call / choose runner / run UI */}
      <div style={{ marginTop: 18 }}>
        {phase === "call" && (
          <div>
            <strong>
              {currentCaller.toUpperCase()} — Choose a player on the opposite team to call.
            </strong>
            <div style={{ marginTop: 8, color: "#666" }}>
              Click any player on the opposing team to call them over.
            </div>
          </div>
        )}

        {phase === "chooseRunner" && calledPlayerId && (
          <div>
            <div style={{ marginBottom: 8 }}>
              <strong>
                {currentCaller.toUpperCase()} called{" "}
                {
                  defenderTeam.find((p) => p.id === calledPlayerId)?.name
                }{" "}
                — choose a runner from your team.
              </strong>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {callerTeam.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onChooseRunner(p.id)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    background: runnerId === p.id ? "#cff" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  {p.name} (str {p.strength})
                </button>
              ))}
            </div>

            <div style={{ marginTop: 8, color: "#666" }}>
              Defenders will form a chain using the called player and a neighbor.
            </div>
          </div>
        )}

        {phase === "run" && runnerId && defenderPair && (
          <div>
            <div style={{ marginBottom: 10 }}>
              <strong>
                {callerTeam.find((p) => p.id === runnerId)?.name} is running! Boost to increase power.
              </strong>
            </div>

            <div style={{ marginBottom: 8 }}>
              <div
                style={{
                  height: 16,
                  background: "#eee",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, runProgress)}%`,
                    height: "100%",
                    background:
                      runProgress < 40 ? "#f66" : runProgress < 80 ? "#ffb74d" : "#6ee66e",
                    transition: "width 0.1s linear",
                  }}
                ></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <div>Progress: {Math.floor(runProgress)}%</div>
                <div>Boosts left: {boostsLeft}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button
                onClick={() => onBoost()}
                disabled={boostsLeft <= 0}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  background: boostsLeft > 0 ? "#aaf" : "#eee",
                  cursor: boostsLeft > 0 ? "pointer" : "not-allowed",
                }}
              >
                Boost
              </button>

              <button
                onClick={() => onFinishRun()}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  background: "#ffd",
                  cursor: "pointer",
                }}
              >
                Finish Run
              </button>
            </div>

            <div style={{ marginTop: 10, color: "#444" }}>
              Defenders:{" "}
              {defenderPair
                .map((id) => defenderTeam.find((p) => p.id === id)?.name || "—")
                .join(" + ")}{" "}
              (strength {chainStrength})
            </div>
            <div style={{ marginTop: 6, color: "#666" }}>
              Runner base strength: {callerTeam.find((p) => p.id === runnerId)?.strength} → power
              {": " + Math.round(runnerPower)}
            </div>
          </div>
        )}

        {phase === "result" && lastResult && (
          <div>
            <div style={{ marginBottom: 8 }}>
              <strong>Result</strong>
            </div>
            <div style={{ padding: 12, background: "#fff", borderRadius: 8, border: "1px solid #eee" }}>
              {lastResult}
            </div>
            <div style={{ marginTop: 10 }}>
              <button
                onClick={() => continueAfterResult()}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  background: "#def",
                  cursor: "pointer",
                }}
              >
                Continue (switch turns)
              </button>
            </div>
          </div>
        )}

        {phase === "gameOver" && (
          <div>
            <h3>Game Over</h3>
            <div style={{ marginBottom: 8 }}>
              {leftTeam.length === 0 && <div>Right team wins!</div>}
              {rightTeam.length === 0 && <div>Left team wins!</div>}
              {leftTeam.length === 0 && rightTeam.length === 0 && <div>It&apos;s a tie?</div>}
            </div>
            <div style={{ marginTop: 6 }}>
              <button
                onClick={() => onResetGame()}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  background: "#fdf6d8",
                  cursor: "pointer",
                }}
              >
                Play again
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, color: "#888", fontSize: 13 }}>
        Tip: Host is authoritative. If you&apos;re offline, the game works locally (single-browser).
      </div>
    </div>
  );
}
