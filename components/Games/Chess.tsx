import React, { useEffect, useMemo, useState, useRef } from "react";

type Color = "white" | "black";
type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";
type Piece = { type: PieceType; color: Color };
type Square = Piece | null;

const UNICODE: Record<Color, Record<PieceType, string>> = {
  white: { K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙" },
  black: { K: "♚", Q: "♛", R: "♜", B: "♝", N: "♞", P: "♟︎" },
};

function initBoard(): Square[][] {
  const emptyRow: Square[] = new Array(8).fill(null);
  const board: Square[][] = [];

  board.push([
    { type: "R", color: "black" },
    { type: "N", color: "black" },
    { type: "B", color: "black" },
    { type: "Q", color: "black" },
    { type: "K", color: "black" },
    { type: "B", color: "black" },
    { type: "N", color: "black" },
    { type: "R", color: "black" },
  ]);
  board.push(new Array(8).fill({ type: "P", color: "black" }).map(p => ({ ...p })));
  for (let i = 0; i < 4; i++) board.push([...emptyRow]);
  board.push(new Array(8).fill({ type: "P", color: "white" }).map(p => ({ ...p })));
  board.push([
    { type: "R", color: "white" },
    { type: "N", color: "white" },
    { type: "B", color: "white" },
    { type: "Q", color: "white" },
    { type: "K", color: "white" },
    { type: "B", color: "white" },
    { type: "N", color: "white" },
    { type: "R", color: "white" },
  ]);

  return board;
}

function inside(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function cloneBoard(board: Square[][]): Square[][] {
  return board.map(row => row.map(sq => (sq ? { ...sq } : null)));
}

function getMoves(board: Square[][], r: number, c: number): [number, number][] {
  const piece = board[r][c];
  if (!piece) return [];
  const moves: [number, number][] = [];
  const enemy = (p: Square) => p && p.color !== piece.color;

  if (piece.type === "P") {
    const dir = piece.color === "white" ? -1 : 1;
    const r1 = r + dir;
    if (inside(r1, c) && !board[r1][c]) {
      moves.push([r1, c]);
      const startRow = piece.color === "white" ? 6 : 1;
      const r2 = r + dir * 2;
      if (r === startRow && inside(r2, c) && !board[r2][c]) {
        moves.push([r2, c]);
      }
    }
    for (const dc of [-1, 1]) {
      const cc = c + dc;
      if (inside(r1, cc) && enemy(board[r1][cc])) {
        moves.push([r1, cc]);
      }
    }
  }

  if (piece.type === "N") {
    const deltas = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];
    for (const [dr, dc] of deltas) {
      const rr = r + dr,
        cc = c + dc;
      if (!inside(rr, cc)) continue;
      if (!board[rr][cc] || board[rr][cc]!.color !== piece.color) moves.push([rr, cc]);
    }
  }

  const slide = (dirs: [number, number][]) => {
    for (const [dr, dc] of dirs) {
      let rr = r + dr,
        cc = c + dc;
      while (inside(rr, cc)) {
        if (!board[rr][cc]) {
          moves.push([rr, cc]);
        } else {
          if (board[rr][cc]!.color !== piece.color) moves.push([rr, cc]);
          break;
        }
        rr += dr;
        cc += dc;
      }
    }
  };

  if (piece.type === "B") slide([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
  if (piece.type === "R") slide([[-1, 0], [1, 0], [0, -1], [0, 1]]);
  if (piece.type === "Q") slide([[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]);

  if (piece.type === "K") {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const rr = r + dr,
          cc = c + dc;
        if (!inside(rr, cc)) continue;
        if (!board[rr][cc] || board[rr][cc]!.color !== piece.color) moves.push([rr, cc]);
      }
    }
  }

  return moves;
}

function squareName([r, c]: [number, number]) {
  const file = "abcdefgh"[c];
  const rank = 8 - r;
  return `${file}${rank}`;
}

// Helper: apply move to a board (used for local and remote moves)
function applyMove(board: Square[][], from: [number, number], to: [number, number]) {
  const [sr, sc] = from;
  const [r, c] = to;
  const moving = board[sr][sc];
  if (!moving) return board;
  const newBoard = cloneBoard(board);
  newBoard[r][c] = moving;
  newBoard[sr][sc] = null;
  if (moving.type === "P" && (r === 0 || r === 7)) {
    newBoard[r][c] = { type: "Q", color: moving.color };
  }
  return newBoard;
}

export default function Chess(): JSX.Element {
  const [board, setBoard] = useState<Square[][]>(() => initBoard());
  const [turn, setTurn] = useState<Color>("white");
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [legal, setLegal] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<string[]>([]);

  // Multiplayer state
  const [wsUrl, setWsUrl] = useState<string>("ws://localhost:4000");
  const wsRef = useRef<WebSocket | null>(null);
  const clientIdRef = useRef<string>(() => Math.random().toString(36).slice(2));
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<string>("");
  const [joinedRoom, setJoinedRoom] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean | null>(null);
  const [playerColor, setPlayerColor] = useState<Color | null>(null);

  useEffect(() => {
    clientIdRef.current = Math.random().toString(36).slice(2);
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const connect = (url: string) => {
    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log("ws open");
    };

    ws.onmessage = e => {
      try {
        const msg = JSON.parse(e.data);
        handleMessage(msg);
      } catch (err) {
        console.warn("invalid ws msg", e.data);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setJoinedRoom(null);
      setIsHost(null);
      setPlayerColor(null);
      console.log("ws closed");
    };

    ws.onerror = () => {
      console.warn("ws error");
    };
  };

  const send = (obj: any) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(obj));
  };

  const createRoom = () => {
    const roomId = Math.random().toString(36).slice(2, 8).toUpperCase();
    setRoom(roomId);
    connect(wsUrl);
    setTimeout(() => {
      send({ type: "join", room: roomId, clientId: clientIdRef.current, role: "host" });
      setJoinedRoom(roomId);
      setIsHost(true);
      setPlayerColor("white"); // host plays white by default
    }, 500);
  };

  const joinRoom = (roomId?: string) => {
    const toJoin = roomId || room;
    if (!toJoin) return;
    connect(wsUrl);
    setTimeout(() => {
      send({ type: "join", room: toJoin, clientId: clientIdRef.current });
      setJoinedRoom(toJoin);
      setIsHost(false);
      setPlayerColor("black"); // joiner plays black by default
    }, 500);
  };

  const leaveRoom = () => {
    if (wsRef.current && joinedRoom) {
      send({ type: "leave", room: joinedRoom, clientId: clientIdRef.current });
      wsRef.current.close();
    }
    setJoinedRoom(null);
    setIsHost(null);
    setPlayerColor(null);
  };

  const handleMessage = (msg: any) => {
    if (!msg || typeof msg.type !== "string") return;
    if (msg.type === "joined") {
      // server ack
      console.log("joined room", msg.room);
    }
    if (msg.type === "move") {
      // ignore moves originated from self
      if (msg.clientId === clientIdRef.current) return;
      // apply remote move
      const { from, to, turn: newTurn, notation } = msg;
      setBoard(prev => {
        const nb = applyMove(prev, from, to);
        return nb;
      });
      setTurn(newTurn === "white" ? "white" : "black");
      setHistory(h => [...h, `opponent: ${notation || `${squareName(from)}->${squareName(to)}`}`]);
    }
    if (msg.type === "reset") {
      setBoard(initBoard());
      setTurn("white");
      setHistory(h => [...h, "Game reset by remote"]);
    }
  };

  const onSelect = (r: number, c: number) => {
    const piece = board[r][c];
    if (piece && piece.color === turn) {
      // if multiplayer and playerColor set, enforce that player moves their color
      if (joinedRoom && playerColor && piece.color !== playerColor) {
        return; // can't select opponent's pieces
      }
      setSelected([r, c]);
      const moves = getMoves(board, r, c);
      const map: Record<string, boolean> = {};
      moves.forEach(m => (map[`${m[0]}:${m[1]}`] = true));
      setLegal(map);
      return;
    }

    if (selected) {
      const key = `${r}:${c}`;
      if (!legal[key]) {
        setSelected(null);
        setLegal({});
        return;
      }
      const [sr, sc] = selected;
      const moving = board[sr][sc]!;

      // If multiplayer: validate it's the player's turn and they're playing the right color
      if (joinedRoom && playerColor && moving.color !== playerColor) {
        setSelected(null);
        setLegal({});
        return;
      }

      const newBoard = applyMove(board, [sr, sc], [r, c]);
      setBoard(newBoard);
      const isCapture = board[r][c] !== null;
      const moveNotation =
        (moving.type !== "P" ? moving.type : "") + squareName([sr, sc]) + (isCapture ? "x" : "-") + squareName([r, c]);
      setHistory(h => [...h, `${turn}: ${moveNotation}`]);

      // send move to server if connected
      if (joinedRoom && connected) {
        send({
          type: "move",
          room: joinedRoom,
          clientId: clientIdRef.current,
          from: [sr, sc],
          to: [r, c],
          notation: moveNotation,
          turn: turn === "white" ? "black" : "white",
        });
      }

      setTurn(t => (t === "white" ? "black" : "white"));
      setSelected(null);
      setLegal({});
    }
  };

  const reset = () => {
    setBoard(initBoard());
    setTurn("white");
    setSelected(null);
    setLegal({});
    setHistory([]);
    if (joinedRoom && connected) send({ type: "reset", room: joinedRoom, clientId: clientIdRef.current });
  };

  const boardView = useMemo(() => board, [board]);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", display: "flex", gap: 16 }}>
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 56px)", border: "2px solid #333" }}>
          {boardView.map((row, r) =>
            row.map((sq, c) => {
              const dark = (r + c) % 2 === 1;
              const isSelected = selected && selected[0] === r && selected[1] === c;
              const isLegal = !!legal[`${r}:${c}`];
              const bg = isSelected
                ? "#f6d365"
                : isLegal
                ? "#c7f9cc"
                : dark
                ? "#769656"
                : "#eeeed2";
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => onSelect(r, c)}
                  style={{
                    width: 56,
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: bg,
                    cursor: "pointer",
                    userSelect: "none",
                    fontSize: 32,
                  }}
                  title={squareName([r, c])}
                >
                  {sq ? UNICODE[sq.color][sq.type] : ""}
                </div>
              );
            })
          )}
        </div>

        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <button onClick={reset} style={{ padding: "6px 10px" }}>
            Reset
          </button>
          <div style={{ padding: "6px 10px", background: "#f3f3f3", borderRadius: 6 }}>
            Turn: <strong style={{ textTransform: "capitalize" }}>{turn}</strong>
          </div>
        </div>
      </div>

      <div style={{ minWidth: 300 }}>
        <h3 style={{ marginTop: 0 }}>Multiplayer</h3>
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input value={wsUrl} onChange={e => setWsUrl(e.target.value)} style={{ flex: 1 }} />
            <button onClick={() => connect(wsUrl)} disabled={connected} style={{ padding: "6px 8px" }}>
              Connect
            </button>
            <button onClick={() => wsRef.current && wsRef.current.close()} disabled={!connected} style={{ padding: "6px 8px" }}>
              Disconnect
            </button>
          </div>

          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <input placeholder="ROOM" value={room} onChange={e => setRoom(e.target.value.toUpperCase())} />
            <button onClick={createRoom} style={{ padding: "6px 8px" }}>
              Create
            </button>
            <button onClick={() => joinRoom()} style={{ padding: "6px 8px" }}>
              Join
            </button>
            <button onClick={leaveRoom} style={{ padding: "6px 8px" }} disabled={!joinedRoom}>
              Leave
            </button>
          </div>

          <div style={{ marginTop: 8 }}>
            <div>WS: {connected ? "connected" : "disconnected"}</div>
            <div>Room: {joinedRoom || "—"}</div>
            <div>Role: {isHost === null ? "—" : isHost ? "Host" : "Guest"}</div>
            <div>Color: {playerColor || "spectator/local"}</div>
          </div>

          <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            Note: This component expects a simple WebSocket server that forwards JSON messages between clients in the same room. I can provide a reference Node.js server if you need one.
          </div>
        </div>

        <h3 style={{ marginTop: 12 }}>Move History</h3>
        <div
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: 8,
            maxHeight: 240,
            overflow: "auto",
            fontSize: 13,
          }}
        >
          {history.length === 0 && <div style={{ color: "#666" }}>No moves yet</div>}
          <ol style={{ paddingLeft: 16, margin: 0 }}>
            {history.map((m, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                {m}
              </li>
            ))}
          </ol>
        </div>

        <div style={{ marginTop: 12 }}>
          <h4 style={{ margin: "6px 0" }}>How to play</h4>
          <ul style={{ margin: "6px 0 0 18px" }}>
            <li>Click a piece of the side to move to see legal moves highlighted.</li>
            <li>Click a highlighted square to move. Captures are supported.</li>
            <li>Pawns auto-promote to queen. Castling/en-passant/check detection are omitted.</li>
            <li>Multiplayer uses WebSocket — host creates a room and plays white; joiner plays black.</li>
            <li>Reset will broadcast to the room.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
