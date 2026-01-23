import React, { useEffect, useMemo, useRef, useState } from "react";

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
  board.push(new Array(8).fill({ type: "P", color: "black" }).map((p) => ({ ...p })));
  for (let i = 0; i < 4; i++) board.push([...emptyRow]);
  board.push(new Array(8).fill({ type: "P", color: "white" }).map((p) => ({ ...p })));
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

function cloneBoard(board: Square[][]): Square[][] {
  return board.map((row) => row.map((sq) => (sq ? { ...sq } : null)));
}

function inside(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function squareName([r, c]: [number, number]) {
  const file = "abcdefgh"[c];
  const rank = 8 - r;
  return `${file}${rank}`;
}

function findKing(board: Square[][], color: Color): [number, number] | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === "K" && p.color === color) return [r, c];
    }
  }
  return null;
}

// Check if square (r,c) is attacked by color `byColor`
function isSquareAttacked(board: Square[][], r: number, c: number, byColor: Color): boolean {
  // Pawns
  if (byColor === "white") {
    const rr = r + 1; // white pawns must be one rank below target
    for (const dc of [-1, 1]) {
      const cc = c + dc;
      if (inside(rr, cc)) {
        const p = board[rr][cc];
        if (p && p.color === "white" && p.type === "P") return true;
      }
    }
  } else {
    const rr = r - 1; // black pawns are one rank above target
    for (const dc of [-1, 1]) {
      const cc = c + dc;
      if (inside(rr, cc)) {
        const p = board[rr][cc];
        if (p && p.color === "black" && p.type === "P") return true;
      }
    }
  }

  // Knights
  const knightD = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];
  for (const [dr, dc] of knightD) {
    const rr = r + dr,
      cc = c + dc;
    if (!inside(rr, cc)) continue;
    const p = board[rr][cc];
    if (p && p.color === byColor && p.type === "N") return true;
  }

  // Sliding pieces: bishop/rook/queen
  const slideDirs: { dirs: [number, number][]; types: PieceType[] }[] = [
    { dirs: [[-1, -1], [-1, 1], [1, -1], [1, 1]], types: ["B", "Q"] },
    { dirs: [[-1, 0], [1, 0], [0, -1], [0, 1]], types: ["R", "Q"] },
  ];
  for (const group of slideDirs) {
    for (const [dr, dc] of group.dirs) {
      let rr = r + dr,
        cc = c + dc;
      while (inside(rr, cc)) {
        const p = board[rr][cc];
        if (p) {
          if (p.color === byColor && (group.types.includes(p.type))) return true;
          break; // blocked
        }
        rr += dr;
        cc += dc;
      }
    }
  }

  // King (adjacent)
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const rr = r + dr,
        cc = c + dc;
      if (!inside(rr, cc)) continue;
      const p = board[rr][cc];
      if (p && p.color === byColor && p.type === "K") return true;
    }
  }

  return false;
}

type CastlingRights = {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
};

function defaultCastling(): CastlingRights {
  return {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true,
  };
}

// Generate pseudo-legal moves including en-passant and castling (does NOT filter out moves leaving king in check)
function getPseudoLegalMoves(
  board: Square[][],
  r: number,
  c: number,
  enPassant: [number, number] | null,
  castling: CastlingRights
): [number, number, { type?: "enpassant" | "castle"; castleSide?: "K" | "Q" }][] {
  const piece = board[r][c];
  if (!piece) return [];
  const moves: [number, number, { type?: "enpassant" | "castle"; castleSide?: "K" | "Q" }][] = [];
  const enemy = (p: Square) => p && p.color !== piece.color;

  if (piece.type === "P") {
    const dir = piece.color === "white" ? -1 : 1;
    const r1 = r + dir;
    // forward one
    if (inside(r1, c) && !board[r1][c]) moves.push([r1, c, {}]);
    // forward two from start
    const startRow = piece.color === "white" ? 6 : 1;
    const r2 = r + dir * 2;
    if (r === startRow && inside(r2, c) && !board[r1][c] && !board[r2][c]) moves.push([r2, c, {}]);
    // captures
    for (const dc of [-1, 1]) {
      const cc = c + dc;
      if (inside(r1, cc) && enemy(board[r1][cc])) {
        moves.push([r1, cc, {}]);
      }
    }
    // en-passant capture
    if (enPassant) {
      const [er, ec] = enPassant;
      // If enPassant target is diagonally one forward from pawn
      if (r1 === er && Math.abs(ec - c) === 1) {
        moves.push([er, ec, { type: "enpassant" }]);
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
      if (!board[rr][cc] || board[rr][cc]!.color !== piece.color) moves.push([rr, cc, {}]);
    }
  }

  const slide = (dirs: [number, number][]) => {
    for (const [dr, dc] of dirs) {
      let rr = r + dr,
        cc = c + dc;
      while (inside(rr, cc)) {
        if (!board[rr][cc]) {
          moves.push([rr, cc, {}]);
        } else {
          if (board[rr][cc]!.color !== piece.color) moves.push([rr, cc, {}]);
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
        if (!board[rr][cc] || board[rr][cc]!.color !== piece.color) moves.push([rr, cc, {}]);
      }
    }

    // Castling (only if king hasn't moved; we rely on castling flags)
    if (piece.color === "white" && r === 7 && c === 4) {
      // king-side
      if (castling.whiteKingSide) {
        // squares f1(7,5) and g1(7,6) empty and not attacked; rook at h1
        if (!board[7][5] && !board[7][6]) {
          const rook = board[7][7];
          if (rook && rook.type === "R" && rook.color === "white") {
            // note: we do NOT check for check here; caller will filter by resulting checks
            moves.push([7, 6, { type: "castle", castleSide: "K" }]);
          }
        }
      }
      // queen-side
      if (castling.whiteQueenSide) {
        // squares d1(7,3), c1(7,2), b1(7,1) empty and rook at a1
        if (!board[7][3] && !board[7][2] && !board[7][1]) {
          const rook = board[7][0];
          if (rook && rook.type === "R" && rook.color === "white") {
            moves.push([7, 2, { type: "castle", castleSide: "Q" }]);
          }
        }
      }
    }
    if (piece.color === "black" && r === 0 && c === 4) {
      if (castling.blackKingSide) {
        if (!board[0][5] && !board[0][6]) {
          const rook = board[0][7];
          if (rook && rook.type === "R" && rook.color === "black") {
            moves.push([0, 6, { type: "castle", castleSide: "K" }]);
          }
        }
      }
      if (castling.blackQueenSide) {
        if (!board[0][3] && !board[0][2] && !board[0][1]) {
          const rook = board[0][0];
          if (rook && rook.type === "R" && rook.color === "black") {
            moves.push([0, 2, { type: "castle", castleSide: "Q" }]);
          }
        }
      }
    }
  }

  return moves;
}

// Determine if king of `color` is in check in given board
function isKingInCheck(board: Square[][], color: Color): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  const [kr, kc] = kingPos;
  return isSquareAttacked(board, kr, kc, color === "white" ? "black" : "white");
}

// Filter pseudo-legal moves to actual legal moves (i.e., moves that don't leave own king in check)
function getLegalMoves(
  board: Square[][],
  r: number,
  c: number,
  enPassant: [number, number] | null,
  castling: CastlingRights
): [number, number, { type?: "enpassant" | "castle"; castleSide?: "K" | "Q" }][] {
  const pseudo = getPseudoLegalMoves(board, r, c, enPassant, castling);
  const piece = board[r][c];
  if (!piece) return [];
  const legal: typeof pseudo = [];

  for (const [tr, tc, meta] of pseudo) {
    // simulate
    const simBoard = cloneBoard(board);
    // handle en-passant removal
    if (meta.type === "enpassant") {
      // capturing pawn moves to en-passant target square; the captured pawn is behind it
      simBoard[tr][tc] = simBoard[r][c];
      simBoard[r][c] = null;
      if (piece.color === "white") {
        // captured pawn is at tr+1, tc
        simBoard[tr + 1][tc] = null;
      } else {
        simBoard[tr - 1][tc] = null;
      }
    } else if (meta.type === "castle") {
      // move king and rook
      simBoard[tr][tc] = simBoard[r][c];
      simBoard[r][c] = null;
      if (piece.color === "white") {
        if (meta.castleSide === "K") {
          // move rook from h1 to f1
          simBoard[7][5] = simBoard[7][7];
          simBoard[7][7] = null;
        } else {
          // Q-side: move rook from a1 to d1
          simBoard[7][3] = simBoard[7][0];
          simBoard[7][0] = null;
        }
      } else {
        if (meta.castleSide === "K") {
          simBoard[0][5] = simBoard[0][7];
          simBoard[0][7] = null;
        } else {
          simBoard[0][3] = simBoard[0][0];
          simBoard[0][0] = null;
        }
      }
    } else {
      // normal move (including captures)
      simBoard[tr][tc] = simBoard[r][c];
      simBoard[r][c] = null;
    }

    // After the move, check if own king is in check
    const inCheck = isKingInCheck(simBoard, piece.color);
    if (!inCheck) {
      legal.push([tr, tc, meta]);
    }
  }

  return legal;
}

// Apply move and update enPassant and castling rights; optionally accept promotion piece type
function applyMoveFull(
  board: Square[][],
  from: [number, number],
  to: [number, number],
  meta: { type?: "enpassant" | "castle"; castleSide?: "K" | "Q" } | null,
  castling: CastlingRights,
  enPassant: [number, number] | null,
  promotion?: PieceType
): {
  board: Square[][];
  castling: CastlingRights;
  enPassant: [number, number] | null;
} {
  const [sr, sc] = from;
  const [tr, tc] = to;
  const moving = board[sr][sc];
  if (!moving) return { board: cloneBoard(board), castling, enPassant: null };

  const nb = cloneBoard(board);
  let newCastling = { ...castling };
  let newEnPassant: [number, number] | null = null;

  // Handle castling rights removal if king or rook moves/captured
  const removeCastlingFor = (color: Color, side: "K" | "Q") => {
    if (color === "white") {
      if (side === "K") newCastling.whiteKingSide = false;
      else newCastling.whiteQueenSide = false;
    } else {
      if (side === "K") newCastling.blackKingSide = false;
      else newCastling.blackQueenSide = false;
    }
  };

  // If king moves, revoke both castling rights for that color
  if (moving.type === "K") {
    if (moving.color === "white") {
      newCastling.whiteKingSide = false;
      newCastling.whiteQueenSide = false;
    } else {
      newCastling.blackKingSide = false;
      newCastling.blackQueenSide = false;
    }
  }

  // If rook moves from starting square, revoke respective castling
  if (moving.type === "R") {
    if (sr === 7 && sc === 7) newCastling.whiteKingSide = false;
    if (sr === 7 && sc === 0) newCastling.whiteQueenSide = false;
    if (sr === 0 && sc === 7) newCastling.blackKingSide = false;
    if (sr === 0 && sc === 0) newCastling.blackQueenSide = false;
  }

  // Execute move
  if (meta && meta.type === "enpassant") {
    // Move pawn and remove captured pawn behind target
    nb[tr][tc] = nb[sr][sc];
    nb[sr][sc] = null;
    if (moving.color === "white") {
      nb[tr + 1][tc] = null;
    } else {
      nb[tr - 1][tc] = null;
    }
  } else if (meta && meta.type === "castle") {
    // Move king
    nb[tr][tc] = nb[sr][sc];
    nb[sr][sc] = null;
    // Move rook accordingly
    if (moving.color === "white") {
      if (meta.castleSide === "K") {
        nb[7][5] = nb[7][7];
        nb[7][7] = null;
        // revoke castling
        newCastling.whiteKingSide = false;
        newCastling.whiteQueenSide = false;
      } else {
        nb[7][3] = nb[7][0];
        nb[7][0] = null;
        newCastling.whiteQueenSide = false;
        newCastling.whiteKingSide = false;
      }
    } else {
      if (meta.castleSide === "K") {
        nb[0][5] = nb[0][7];
        nb[0][7] = null;
        newCastling.blackKingSide = false;
        newCastling.blackQueenSide = false;
      } else {
        nb[0][3] = nb[0][0];
        nb[0][0] = null;
        newCastling.blackQueenSide = false;
        newCastling.blackKingSide = false;
      }
    }
  } else {
    // Normal move / capture
    // If a rook is captured on its original square, revoke opponent castling rights
    const target = nb[tr][tc];
    if (target && target.type === "R") {
      // if white rook at a1/h1 captured -> white rights off
      if (tr === 7 && tc === 0) newCastling.whiteQueenSide = false;
      if (tr === 7 && tc === 7) newCastling.whiteKingSide = false;
      if (tr === 0 && tc === 0) newCastling.blackQueenSide = false;
      if (tr === 0 && tc === 7) newCastling.blackKingSide = false;
    }

    nb[tr][tc] = nb[sr][sc];
    nb[sr][sc] = null;
  }

  // Pawn double move sets enPassant target square (the square it passed over)
  if (moving.type === "P" && Math.abs(tr - sr) === 2) {
    const epR = (sr + tr) / 2;
    newEnPassant = [epR, tc];
  } else {
    newEnPassant = null;
  }

  // Promotion handling
  if (moving.type === "P" && (tr === 0 || tr === 7)) {
    const promotionPiece: PieceType = promotion && ["Q", "R", "B", "N"].includes(promotion) ? promotion : "Q";
    nb[tr][tc] = { type: promotionPiece, color: moving.color };
  }

  // If a rook was captured on original squares, adjust castling rights already handled above
  // Also, if rook moved from original square we revoked earlier

  return { board: nb, castling: newCastling, enPassant: newEnPassant };
}

// Helper to get all legal moves for a color (used for checkmate/stalemate detection)
function allLegalMovesForColor(
  board: Square[][],
  color: Color,
  enPassant: [number, number] | null,
  castling: CastlingRights
): { from: [number, number]; to: [number, number]; meta: any }[] {
  const moves: { from: [number, number]; to: [number, number]; meta: any }[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.color !== color) continue;
      const legal = getLegalMoves(board, r, c, enPassant, castling);
      for (const [tr, tc, meta] of legal) moves.push({ from: [r, c], to: [tr, tc], meta });
    }
  }
  return moves;
}

// --- Component

export default function Chess(): JSX.Element {
  const [board, setBoard] = useState<Square[][]>(() => initBoard());
  const [turn, setTurn] = useState<Color>("white");
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [legal, setLegal] = useState<Record<string, { meta: any }>>({});
  const [history, setHistory] = useState<string[]>([]);

  // Full-rule state
  const [castling, setCastling] = useState<CastlingRights>(() => defaultCastling());
  const [enPassant, setEnPassant] = useState<[number, number] | null>(null);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [promotionPending, setPromotionPending] = useState<{
    from: [number, number];
    to: [number, number];
    meta: any;
    color: Color;
  } | null>(null);

  // Multiplayer state (kept from previous implementation)
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
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log("ws open");
      };

      ws.onmessage = (e) => {
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
    } catch (err) {
      console.warn("ws failed", err);
    }
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
      setPlayerColor("white");
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
      setPlayerColor("black");
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
      console.log("joined room", msg.room);
    }
    if (msg.type === "move") {
      if (msg.clientId === clientIdRef.current) return;
      const { from, to, meta, promotion: prom, turn: newTurn, notation } = msg;
      // apply remote move (must use full validation on sender; here we apply)
      setBoard((prev) => {
        const res = applyMoveFull(prev, from, to, meta || null, castling, enPassant, prom);
        // update castling and enPassant after applying
        setCastling(res.castling);
        setEnPassant(res.enPassant);
        return res.board;
      });
      setTurn((_) => (newTurn === "white" ? "white" : "black"));
      setHistory((h) => [...h, `opponent: ${notation || `${squareName(from)}->${squareName(to)}`}`]);
      // after remote move, check for game end
      setTimeout(() => checkGameEnd(), 0);
    }
    if (msg.type === "reset") {
      setBoard(initBoard());
      setTurn("white");
      setCastling(defaultCastling());
      setEnPassant(null);
      setHistory((h) => [...h, "Game reset by remote"]);
      setGameOver(null);
    }
  };

  // Prepare legal moves for clicked piece and selection
  const onSelect = (r: number, c: number) => {
    if (gameOver) return;
    const piece = board[r][c];
    // Selecting your own piece (also enforce multiplayer color)
    if (piece && piece.color === turn) {
      if (joinedRoom && playerColor && piece.color !== playerColor) return;
      setSelected([r, c]);
      const moves = getLegalMoves(board, r, c, enPassant, castling);
      const map: Record<string, { meta: any }> = {};
      moves.forEach(([mr, mc, meta]) => (map[`${mr}:${mc}`] = { meta }));
      setLegal(map);
      return;
    }

    // Attempt move if piece selected
    if (selected) {
      const key = `${r}:${c}`;
      if (!legal[key]) {
        setSelected(null);
        setLegal({});
        return;
      }
      const [sr, sc] = selected;
      const moving = board[sr][sc]!;
      // multiplayer check
      if (joinedRoom && playerColor && moving.color !== playerColor) {
        setSelected(null);
        setLegal({});
        return;
      }

      const meta = legal[key].meta;
      // If this move is a pawn promotion, open promotion modal before finalizing
      if (moving.type === "P" && (r === 0 || r === 7) && meta.type !== "castle") {
        setPromotionPending({ from: [sr, sc], to: [r, c], meta, color: moving.color });
        // keep selection until promotion resolves
        return;
      }

      // finalize move
      const res = applyMoveFull(board, [sr, sc], [r, c], meta, castling, enPassant); // no promotion
      setBoard(res.board);
      setCastling(res.castling);
      setEnPassant(res.enPassant);

      const isCapture = board[r][c] !== null || meta?.type === "enpassant";
      const moveNotation =
        (moving.type !== "P" ? moving.type : "") +
        squareName([sr, sc]) +
        (isCapture ? "x" : "-") +
        squareName([r, c]);

      setHistory((h) => [...h, `${turn}: ${moveNotation}`]);

      // send multiplayer move
      if (joinedRoom && connected) {
        send({
          type: "move",
          room: joinedRoom,
          clientId: clientIdRef.current,
          from: [sr, sc],
          to: [r, c],
          meta,
          promotion: undefined,
          notation: moveNotation,
          turn: turn === "white" ? "black" : "white",
        });
      }

      setTurn((t) => (t === "white" ? "black" : "white"));
      setSelected(null);
      setLegal({});
      // check for checkmate/stalemate
      setTimeout(() => checkGameEnd(), 0);
    }
  };

  // Resolve promotion choice
  const choosePromotion = (pieceType: PieceType) => {
    if (!promotionPending) return;
    const { from, to, meta, color } = promotionPending;
    const res = applyMoveFull(board, from, to, meta, castling, enPassant, pieceType);
    setBoard(res.board);
    setCastling(res.castling);
    setEnPassant(res.enPassant);

    const moving = board[from[0]][from[1]]!;
    const isCapture = board[to[0]][to[1]] !== null;
    const moveNotation =
      (moving.type !== "P" ? moving.type : "") +
      squareName(from) +
      (isCapture ? "x" : "-") +
      squareName(to) +
      "=" +
      pieceType;

    setHistory((h) => [...h, `${turn}: ${moveNotation}`]);

    // send promotion move to server
    if (joinedRoom && connected) {
      send({
        type: "move",
        room: joinedRoom,
        clientId: clientIdRef.current,
        from,
        to,
        meta,
        promotion: pieceType,
        notation: moveNotation,
        turn: turn === "white" ? "black" : "white",
      });
    }

    setTurn((t) => (t === "white" ? "black" : "white"));
    setPromotionPending(null);
    setSelected(null);
    setLegal({});
    setTimeout(() => checkGameEnd(), 0);
  };

  const reset = () => {
    setBoard(initBoard());
    setTurn("white");
    setSelected(null);
    setLegal({});
    setHistory([]);
    setCastling(defaultCastling());
    setEnPassant(null);
    setGameOver(null);
    if (joinedRoom && connected) send({ type: "reset", room: joinedRoom, clientId: clientIdRef.current });
  };

  // Check for check, mate, stalemate and set gameOver accordingly
  const checkGameEnd = () => {
    const opponent: Color = turn === "white" ? "black" : "white";
    const opponentMoves = allLegalMovesForColor(board, opponent, enPassant, castling);
    const inCheck = isKingInCheck(board, opponent);
    if (opponentMoves.length === 0) {
      if (inCheck) {
        setGameOver(`${turn} wins by checkmate`);
        setHistory((h) => [...h, `Checkmate: ${turn} wins`]);
      } else {
        setGameOver("Draw by stalemate");
        setHistory((h) => [...h, `Stalemate`]);
      }
    } else {
      // if opponent in check, add a history entry (optional)
      if (inCheck) {
        setHistory((h) => [...h, `${opponent} is in check`]);
      }
    }
  };

  const boardView = useMemo(() => board, [board]);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", display: "flex", gap: 16 }}>
      <div>
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(8, 56px)", border: "2px solid #333" }}>
          {boardView.map((row, r) =>
            row.map((sq, c) => {
              const dark = (r + c) % 2 === 1;
              const isSelected = selected && selected[0] === r && selected[1] === c;
              const isLegal = !!legal[`${r}:${c}`];
              const bg = isSelected ? "#f6d365" : isLegal ? "#c7f9cc" : dark ? "#769656" : "#eeeed2";
              const title = `${squareName([r, c])}${sq ? " " + sq.color + " " + sq.type : ""}${
                enPassant && enPassant[0] === r && enPassant[1] === c ? " (en-passant target)" : ""
              }`;
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
                    cursor: gameOver ? "default" : "pointer",
                    userSelect: "none",
                    fontSize: 32,
                    position: "relative",
                  }}
                  title={title}
                >
                  {sq ? UNICODE[sq.color][sq.type] : ""}
                  {isLegal && <div style={{ position: "absolute", width: 10, height: 10, borderRadius: "50%", background: "#1b9e77", opacity: 0.9, bottom: 6, right: 6 }} />}
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
            {gameOver && <span style={{ marginLeft: 10, color: "crimson" }}> — {gameOver}</span>}
          </div>
        </div>
      </div>

      <div style={{ minWidth: 320 }}>
        <h3 style={{ marginTop: 0 }}>Multiplayer</h3>
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input value={wsUrl} onChange={(e) => setWsUrl(e.target.value)} style={{ flex: 1 }} />
            <button onClick={() => connect(wsUrl)} disabled={connected} style={{ padding: "6px 8px" }}>
              Connect
            </button>
            <button onClick={() => wsRef.current && wsRef.current.close()} disabled={!connected} style={{ padding: "6px 8px" }}>
              Disconnect
            </button>
          </div>

          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <input placeholder="ROOM" value={room} onChange={(e) => setRoom(e.target.value.toUpperCase())} />
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
            Note: This component validates full chess rules client-side (castling, en-passant, promotions, checks). In multiplayer the server is still a relay — for authoritative validation run a server-side validator.
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
            <li>Click a piece of the side to move to see legal moves highlighted (moves that would leave your king in check are excluded).</li>
            <li>Click a highlighted square to move. Captures, en-passant, castling, promotions are supported.</li>
            <li>On pawn promotion you'll be prompted to choose a piece.</li>
            <li>Multiplayer uses WebSocket — host creates a room and plays white; joiner plays black. Consider running an authoritative server for production.</li>
          </ul>
        </div>
      </div>

      {promotionPending && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div style={{ background: "#fff", padding: 16, borderRadius: 8, textAlign: "center" }}>
            <div style={{ marginBottom: 8 }}>Choose promotion for {promotionPending.color}</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {(["Q", "R", "B", "N"] as PieceType[]).map((pt) => (
                <button
                  key={pt}
                  onClick={() => choosePromotion(pt)}
                  style={{ padding: "8px 12px", fontSize: 18 }}
                >
                  {UNICODE[promotionPending.color][pt]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
