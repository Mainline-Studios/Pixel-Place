'use client';

/**
 * Firestore-based chess multiplayer. Works on Firebase Hosting (pixelplaceofficial.com)
 * without a separate WebSocket server. Uses Firestore real-time listeners.
 */

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebaseConfig';

const CHESS_QUEUE = 'chess_matchmaking';
const CHESS_GAMES = 'chess_games';

function getDb() {
  if (typeof window === 'undefined') return null;
  try {
    if (getApps().length === 0) initializeApp(firebaseConfig);
    return getFirestore(getApps()[0]);
  } catch {
    return null;
  }
}

function genRoomId() {
  return 'chess-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export type ChessGameState = {
  board: any[][];
  turn: 'white' | 'black';
  castling: any;
  enPassant: [number, number] | null;
  gameOver: string | null;
  whiteUsername: string;
  blackUsername: string | null;
  roomId: string;
};

/** Join matchmaking queue; returns unsubscribe. When matched, callback fires with game. */
export function subscribeChessMatchmaking(
  username: string,
  onMatched: (game: ChessGameState) => void
): () => void {
  const db = getDb();
  if (!db) return () => {};

  const addToQueue = async () => {
    await addDoc(collection(db, CHESS_QUEUE), {
      username,
      createdAt: serverTimestamp(),
    });
  };

  addToQueue();

  const unsub = onSnapshot(
    query(collection(db, CHESS_QUEUE), orderBy('createdAt', 'asc'), limit(10)),
    async (snapshot) => {
      const docs = snapshot.docs;
      if (docs.length < 2) return;

      const firstTwo = docs.slice(0, 2);
      const roomId = genRoomId();

      try {
        await runTransaction(db, async (tx) => {
          const d0 = await tx.get(firstTwo[0].ref);
          const d1 = await tx.get(firstTwo[1].ref);
          if (!d0.exists || !d1.exists) return;
          const u0 = (d0.data()?.username as string) || 'Player';
          const u1 = (d1.data()?.username as string) || 'Player';

          const gameRef = doc(db, CHESS_GAMES, roomId);
          tx.set(gameRef, {
            board: initBoardSnapshot(),
            turn: 'white',
            castling: defaultCastlingSnapshot(),
            enPassant: null,
            gameOver: null,
            whiteUsername: u0,
            blackUsername: u1,
            roomId,
            createdAt: serverTimestamp(),
          });
          tx.delete(firstTwo[0].ref);
          tx.delete(firstTwo[1].ref);
        });
      } catch {
        // Transaction conflict - another client matched them
      }
    }
  );

  const unsubGame = onSnapshot(
    query(
      collection(db, CHESS_GAMES),
      orderBy('createdAt', 'desc'),
      limit(20)
    ),
    (snapshot) => {
      for (const d of snapshot.docs) {
        const g = d.data();
        if (g.whiteUsername === username || g.blackUsername === username) {
          onMatched(gameFromDoc(d.id, g));
          unsub();
          unsubGame();
          return;
        }
      }
    }
  );

  return () => {
    unsub();
    unsubGame();
  };
}

/** Cancel matchmaking (remove self from queue) */
export function cancelChessMatchmaking(username: string): void {
  const db = getDb();
  if (!db) return;
  getDocs(
    query(collection(db, CHESS_QUEUE), orderBy('createdAt', 'asc'))
  ).then((snap) => {
    const my = snap.docs.find((d) => d.data().username === username);
    if (my) deleteDoc(my.ref);
  });
}

/** Create private game; returns roomId */
export async function createChessGame(username: string): Promise<string> {
  const db = getDb();
  if (!db) throw new Error('Firestore not available');
  const roomId = genRoomId();
  await setDoc(doc(db, CHESS_GAMES, roomId), {
    roomId,
    board: initBoardSnapshot(),
    turn: 'white',
    castling: defaultCastlingSnapshot(),
    enPassant: null,
    gameOver: null,
    whiteUsername: username,
    blackUsername: null,
    createdAt: serverTimestamp(),
  });
  return roomId;
}

/** Join game by room code */
export async function joinChessGame(
  roomCode: string,
  username: string
): Promise<{ ok: boolean; error?: string }> {
  const db = getDb();
  if (!db) return { ok: false, error: 'Firestore not available' };
  const rid = roomCode.trim().toUpperCase();
  const gameRef = doc(db, CHESS_GAMES, rid);
  const gameSnap = await getDoc(gameRef);
  if (!gameSnap.exists()) {
    // Try finding by roomId field (legacy)
    const snap = await getDocs(query(collection(db, CHESS_GAMES), where('roomId', '==', rid), limit(1)));
    const d = snap.docs[0];
    if (!d || d.data().blackUsername) return { ok: false, error: 'Room not found or full' };
    await updateDoc(d.ref, { blackUsername: username });
    return { ok: true };
  }
  const g = gameSnap.data();
  if (g.blackUsername) return { ok: false, error: 'Room full' };
  await updateDoc(gameRef, { blackUsername: username });
  return { ok: true };
}

/** Subscribe to game; returns unsubscribe */
export function subscribeChessGame(
  roomId: string,
  callback: (game: ChessGameState) => void
): () => void {
  const db = getDb();
  if (!db) return () => {};
  const gameRef = doc(db, CHESS_GAMES, roomId);
  return onSnapshot(gameRef, (snapshot) => {
    if (snapshot.exists()) callback(gameFromDoc(snapshot.id, snapshot.data()!));
  });
}

/** Apply move (client-validated; server could add validation via Cloud Function) */
export async function chessApplyMove(
  roomId: string,
  _from: [number, number],
  _to: [number, number],
  _meta: any,
  _promotion: string | null,
  board: any[][],
  turn: 'white' | 'black',
  castling: any,
  enPassant: [number, number] | null,
  gameOver: string | null
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const gameRef = doc(db, CHESS_GAMES, roomId);
  const snap = await getDoc(gameRef);
  if (!snap.exists()) return;
  await updateDoc(gameRef, {
    board,
    turn: turn === 'white' ? 'black' : 'white',
    castling,
    enPassant,
    gameOver,
    lastMoveAt: serverTimestamp(),
  });
}

/** Leave game (delete if no opponent yet; else mark resigned) */
export async function leaveChessGame(roomId: string, username: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  const gameRef = doc(db, CHESS_GAMES, roomId);
  const snap = await getDoc(gameRef);
  if (!snap.exists()) return;
  const g = snap.data();
  if (!g.blackUsername) {
    await deleteDoc(gameRef);
  } else {
    await updateDoc(gameRef, {
      gameOver: `${username} resigned`,
    });
  }
}

function initBoardSnapshot() {
  const emptyRow = new Array(8).fill(null);
  const board: any[] = [];
  board.push([
    { type: 'R', color: 'black' }, { type: 'N', color: 'black' }, { type: 'B', color: 'black' },
    { type: 'Q', color: 'black' }, { type: 'K', color: 'black' }, { type: 'B', color: 'black' },
    { type: 'N', color: 'black' }, { type: 'R', color: 'black' },
  ]);
  board.push(new Array(8).fill({ type: 'P', color: 'black' }).map((p) => ({ ...p })));
  for (let i = 0; i < 4; i++) board.push([...emptyRow]);
  board.push(new Array(8).fill({ type: 'P', color: 'white' }).map((p) => ({ ...p })));
  board.push([
    { type: 'R', color: 'white' }, { type: 'N', color: 'white' }, { type: 'B', color: 'white' },
    { type: 'Q', color: 'white' }, { type: 'K', color: 'white' }, { type: 'B', color: 'white' },
    { type: 'N', color: 'white' }, { type: 'R', color: 'white' },
  ]);
  return board;
}

function defaultCastlingSnapshot() {
  return {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true,
  };
}

function gameFromDoc(id: string, g: any): ChessGameState {
  return {
    roomId: g.roomId || id,
    board: g.board || initBoardSnapshot(),
    turn: g.turn || 'white',
    castling: g.castling || defaultCastlingSnapshot(),
    enPassant: g.enPassant || null,
    gameOver: g.gameOver || null,
    whiteUsername: g.whiteUsername || 'White',
    blackUsername: g.blackUsername ?? null,
  };
}
