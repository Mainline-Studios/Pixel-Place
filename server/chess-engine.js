/**
 * Server-side chess engine. Validates moves and applies them.
 * Mirrors logic from Chess.tsx for authoritative game state.
 */

function initBoard() {
  const emptyRow = new Array(8).fill(null);
  const board = [];
  board.push(
    [{ type: 'R', color: 'black' }, { type: 'N', color: 'black' }, { type: 'B', color: 'black' }, { type: 'Q', color: 'black' }, { type: 'K', color: 'black' }, { type: 'B', color: 'black' }, { type: 'N', color: 'black' }, { type: 'R', color: 'black' }]
  );
  board.push(new Array(8).fill({ type: 'P', color: 'black' }).map((p) => ({ ...p })));
  for (let i = 0; i < 4; i++) board.push([...emptyRow]);
  board.push(new Array(8).fill({ type: 'P', color: 'white' }).map((p) => ({ ...p })));
  board.push(
    [{ type: 'R', color: 'white' }, { type: 'N', color: 'white' }, { type: 'B', color: 'white' }, { type: 'Q', color: 'white' }, { type: 'K', color: 'white' }, { type: 'B', color: 'white' }, { type: 'N', color: 'white' }, { type: 'R', color: 'white' }]
  );
  return board;
}

function cloneBoard(board) {
  return board.map((row) => row.map((sq) => (sq ? { ...sq } : null)));
}

function inside(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function findKing(board, color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'K' && p.color === color) return [r, c];
    }
  }
  return null;
}

function isSquareAttacked(board, r, c, byColor) {
  if (byColor === 'white') {
    const rr = r + 1;
    for (const dc of [-1, 1]) {
      const cc = c + dc;
      if (inside(rr, cc)) {
        const p = board[rr][cc];
        if (p && p.color === 'white' && p.type === 'P') return true;
      }
    }
  } else {
    const rr = r - 1;
    for (const dc of [-1, 1]) {
      const cc = c + dc;
      if (inside(rr, cc)) {
        const p = board[rr][cc];
        if (p && p.color === 'black' && p.type === 'P') return true;
      }
    }
  }
  const knightD = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  for (const [dr, dc] of knightD) {
    const rr = r + dr, cc = c + dc;
    if (!inside(rr, cc)) continue;
    const p = board[rr][cc];
    if (p && p.color === byColor && p.type === 'N') return true;
  }
  const slideDirs = [
    { dirs: [[-1, -1], [-1, 1], [1, -1], [1, 1]], types: ['B', 'Q'] },
    { dirs: [[-1, 0], [1, 0], [0, -1], [0, 1]], types: ['R', 'Q'] }
  ];
  for (const group of slideDirs) {
    for (const [dr, dc] of group.dirs) {
      let rr = r + dr, cc = c + dc;
      while (inside(rr, cc)) {
        const p = board[rr][cc];
        if (p) {
          if (p.color === byColor && group.types.includes(p.type)) return true;
          break;
        }
        rr += dr;
        cc += dc;
      }
    }
  }
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const rr = r + dr, cc = c + dc;
      if (!inside(rr, cc)) continue;
      const p = board[rr][cc];
      if (p && p.color === byColor && p.type === 'K') return true;
    }
  }
  return false;
}

function defaultCastling() {
  return { whiteKingSide: true, whiteQueenSide: true, blackKingSide: true, blackQueenSide: true };
}

function getPseudoLegalMoves(board, r, c, enPassant, castling) {
  const piece = board[r][c];
  if (!piece) return [];
  const moves = [];
  const enemy = (p) => p && p.color !== piece.color;

  if (piece.type === 'P') {
    const dir = piece.color === 'white' ? -1 : 1;
    const r1 = r + dir;
    if (inside(r1, c) && !board[r1][c]) moves.push([r1, c, {}]);
    const startRow = piece.color === 'white' ? 6 : 1;
    const r2 = r + dir * 2;
    if (r === startRow && inside(r2, c) && !board[r1][c] && !board[r2][c]) moves.push([r2, c, {}]);
    for (const dc of [-1, 1]) {
      const cc = c + dc;
      if (inside(r1, cc) && enemy(board[r1][cc])) moves.push([r1, cc, {}]);
    }
    if (enPassant) {
      const [er, ec] = enPassant;
      if (r1 === er && Math.abs(ec - c) === 1) moves.push([er, ec, { type: 'enpassant' }]);
    }
  }

  if (piece.type === 'N') {
    const deltas = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (const [dr, dc] of deltas) {
      const rr = r + dr, cc = c + dc;
      if (!inside(rr, cc)) continue;
      if (!board[rr][cc] || board[rr][cc].color !== piece.color) moves.push([rr, cc, {}]);
    }
  }

  const slide = (dirs) => {
    for (const [dr, dc] of dirs) {
      let rr = r + dr, cc = c + dc;
      while (inside(rr, cc)) {
        if (!board[rr][cc]) moves.push([rr, cc, {}]);
        else {
          if (board[rr][cc].color !== piece.color) moves.push([rr, cc, {}]);
          break;
        }
        rr += dr;
        cc += dc;
      }
    }
  };
  if (piece.type === 'B') slide([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
  if (piece.type === 'R') slide([[-1, 0], [1, 0], [0, -1], [0, 1]]);
  if (piece.type === 'Q') slide([[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]);

  if (piece.type === 'K') {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const rr = r + dr, cc = c + dc;
        if (!inside(rr, cc)) continue;
        if (!board[rr][cc] || board[rr][cc].color !== piece.color) moves.push([rr, cc, {}]);
      }
    }
    if (piece.color === 'white' && r === 7 && c === 4) {
      if (castling.whiteKingSide && !board[7][5] && !board[7][6]) {
        const rook = board[7][7];
        if (rook && rook.type === 'R' && rook.color === 'white') moves.push([7, 6, { type: 'castle', castleSide: 'K' }]);
      }
      if (castling.whiteQueenSide && !board[7][3] && !board[7][2] && !board[7][1]) {
        const rook = board[7][0];
        if (rook && rook.type === 'R' && rook.color === 'white') moves.push([7, 2, { type: 'castle', castleSide: 'Q' }]);
      }
    }
    if (piece.color === 'black' && r === 0 && c === 4) {
      if (castling.blackKingSide && !board[0][5] && !board[0][6]) {
        const rook = board[0][7];
        if (rook && rook.type === 'R' && rook.color === 'black') moves.push([0, 6, { type: 'castle', castleSide: 'K' }]);
      }
      if (castling.blackQueenSide && !board[0][3] && !board[0][2] && !board[0][1]) {
        const rook = board[0][0];
        if (rook && rook.type === 'R' && rook.color === 'black') moves.push([0, 2, { type: 'castle', castleSide: 'Q' }]);
      }
    }
  }

  return moves;
}

function isKingInCheck(board, color) {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  const [kr, kc] = kingPos;
  return isSquareAttacked(board, kr, kc, color === 'white' ? 'black' : 'white');
}

function getLegalMoves(board, r, c, enPassant, castling) {
  const pseudo = getPseudoLegalMoves(board, r, c, enPassant, castling);
  const piece = board[r][c];
  if (!piece) return [];
  const legal = [];

  for (const [tr, tc, meta] of pseudo) {
    const simBoard = cloneBoard(board);
    if (meta.type === 'enpassant') {
      simBoard[tr][tc] = simBoard[r][c];
      simBoard[r][c] = null;
      if (piece.color === 'white') simBoard[tr + 1][tc] = null;
      else simBoard[tr - 1][tc] = null;
    } else if (meta.type === 'castle') {
      simBoard[tr][tc] = simBoard[r][c];
      simBoard[r][c] = null;
      if (piece.color === 'white') {
        if (meta.castleSide === 'K') {
          simBoard[7][5] = simBoard[7][7];
          simBoard[7][7] = null;
        } else {
          simBoard[7][3] = simBoard[7][0];
          simBoard[7][0] = null;
        }
      } else {
        if (meta.castleSide === 'K') {
          simBoard[0][5] = simBoard[0][7];
          simBoard[0][7] = null;
        } else {
          simBoard[0][3] = simBoard[0][0];
          simBoard[0][0] = null;
        }
      }
    } else {
      simBoard[tr][tc] = simBoard[r][c];
      simBoard[r][c] = null;
    }
    if (!isKingInCheck(simBoard, piece.color)) legal.push([tr, tc, meta]);
  }
  return legal;
}

function allLegalMovesForColor(board, color, enPassant, castling) {
  const moves = [];
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

function applyMoveFull(board, from, to, meta, castling, enPassant, promotion) {
  const [sr, sc] = from;
  const [tr, tc] = to;
  const moving = board[sr][sc];
  if (!moving) return { board: cloneBoard(board), castling, enPassant: null };

  const nb = cloneBoard(board);
  let newCastling = { ...castling };
  let newEnPassant = null;

  if (moving.type === 'K') {
    if (moving.color === 'white') newCastling.whiteKingSide = false, newCastling.whiteQueenSide = false;
    else newCastling.blackKingSide = false, newCastling.blackQueenSide = false;
  }
  if (moving.type === 'R') {
    if (sr === 7 && sc === 7) newCastling.whiteKingSide = false;
    if (sr === 7 && sc === 0) newCastling.whiteQueenSide = false;
    if (sr === 0 && sc === 7) newCastling.blackKingSide = false;
    if (sr === 0 && sc === 0) newCastling.blackQueenSide = false;
  }

  if (meta && meta.type === 'enpassant') {
    nb[tr][tc] = nb[sr][sc];
    nb[sr][sc] = null;
    if (moving.color === 'white') nb[tr + 1][tc] = null;
    else nb[tr - 1][tc] = null;
  } else if (meta && meta.type === 'castle') {
    nb[tr][tc] = nb[sr][sc];
    nb[sr][sc] = null;
    if (moving.color === 'white') {
      if (meta.castleSide === 'K') {
        nb[7][5] = nb[7][7];
        nb[7][7] = null;
        newCastling.whiteKingSide = false;
        newCastling.whiteQueenSide = false;
      } else {
        nb[7][3] = nb[7][0];
        nb[7][0] = null;
        newCastling.whiteQueenSide = false;
        newCastling.whiteKingSide = false;
      }
    } else {
      if (meta.castleSide === 'K') {
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
    const target = nb[tr][tc];
    if (target && target.type === 'R') {
      if (tr === 7 && tc === 0) newCastling.whiteQueenSide = false;
      if (tr === 7 && tc === 7) newCastling.whiteKingSide = false;
      if (tr === 0 && tc === 0) newCastling.blackQueenSide = false;
      if (tr === 0 && tc === 7) newCastling.blackKingSide = false;
    }
    nb[tr][tc] = nb[sr][sc];
    nb[sr][sc] = null;
  }

  if (moving.type === 'P' && Math.abs(tr - sr) === 2) {
    const epR = (sr + tr) / 2;
    newEnPassant = [epR, tc];
  }

  if (moving.type === 'P' && (tr === 0 || tr === 7)) {
    const promotionPiece = promotion && ['Q', 'R', 'B', 'N'].includes(promotion) ? promotion : 'Q';
    nb[tr][tc] = { type: promotionPiece, color: moving.color };
  }

  return { board: nb, castling: newCastling, enPassant: newEnPassant };
}

function checkGameEnd(board, turn, enPassant, castling) {
  const opponent = turn === 'white' ? 'black' : 'white';
  const opponentMoves = allLegalMovesForColor(board, opponent, enPassant, castling);
  const inCheck = isKingInCheck(board, opponent);
  if (opponentMoves.length === 0) {
    return inCheck ? `${turn} wins by checkmate` : 'Draw by stalemate';
  }
  return null;
}

function isMoveLegal(board, from, to, meta, enPassant, castling) {
  const [sr, sc] = from;
  const piece = board[sr] && board[sr][sc];
  if (!piece) return false;
  const legal = getLegalMoves(board, sr, sc, enPassant, castling);
  const m = meta || {};
  return legal.some(([tr, tc, lm]) => {
    if (tr !== to[0] || tc !== to[1]) return false;
    const lt = (lm && lm.type) || null;
    const lc = (lm && lm.castleSide) || null;
    return (lt === (m.type || null)) && (lc === (m.castleSide || null));
  });
}

module.exports = {
  initBoard,
  cloneBoard,
  defaultCastling,
  applyMoveFull,
  getLegalMoves,
  isMoveLegal,
  isKingInCheck,
  checkGameEnd,
};
