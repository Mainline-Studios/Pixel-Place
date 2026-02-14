/**
 * Integrated dev server: Next.js + Socket.io on one process.
 * Run: npm run dev
 * No separate server command needed.
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const chess = require('./server/chess-engine.js');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev });
const handle = app.getRequestHandler();

// Socket.io state (same as server.js)
const gameRooms = new Map();
const chessMatchmakingQueue = [];
const chessGames = new Map();

function genRoomId() {
  return 'chess-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: '/socket.io',
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket) => {
    socket.on('join-game', ({ serverId, gameId, username }) => {
      const roomId = `game-${gameId}-${serverId}`;
      socket.join(roomId);
      if (!gameRooms.has(roomId)) gameRooms.set(roomId, { players: [], gameId, serverId });
      const room = gameRooms.get(roomId);
      const player = { id: socket.id, username: username || 'Player', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } };
      room.players.push(player);
      socket.to(roomId).emit('player-joined', player);
      socket.emit('room-state', { players: room.players.filter(p => p.id !== socket.id) });
    });

    socket.on('chess-find', ({ username }) => {
      const u = username || 'Player';
      if (chessMatchmakingQueue.some(e => e.id === socket.id)) return;
      chessMatchmakingQueue.push({ id: socket.id, username: u });
      if (chessMatchmakingQueue.length >= 2) {
        const p1 = chessMatchmakingQueue.shift();
        const p2 = chessMatchmakingQueue.shift();
        const roomId = genRoomId();
        const game = { board: chess.initBoard(), turn: 'white', castling: chess.defaultCastling(), enPassant: null, gameOver: null, whiteId: p1.id, blackId: p2.id, whiteUsername: p1.username, blackUsername: p2.username };
        chessGames.set(roomId, game);
        io.sockets.sockets.get(p1.id)?.join(roomId);
        io.sockets.sockets.get(p2.id)?.join(roomId);
        io.to(roomId).emit('chess-matched', { roomId, whiteId: p1.id, blackId: p2.id, whiteUsername: p1.username, blackUsername: p2.username });
      }
    });

    socket.on('chess-create', ({ username }) => {
      const u = username || 'Player';
      const roomId = genRoomId();
      const game = { board: chess.initBoard(), turn: 'white', castling: chess.defaultCastling(), enPassant: null, gameOver: null, whiteId: socket.id, blackId: null, whiteUsername: u, blackUsername: null };
      chessGames.set(roomId, game);
      socket.join(roomId);
      socket.emit('chess-created', { roomId, role: 'host', color: 'white' });
    });

    socket.on('chess-join', ({ roomId, username }) => {
      const rid = (roomId || '').trim();
      const g = chessGames.get(rid);
      if (!g) return socket.emit('chess-error', { message: 'Room not found' });
      if (g.blackId) return socket.emit('chess-error', { message: 'Room full' });
      g.blackId = socket.id;
      g.blackUsername = username || 'Player';
      socket.join(rid);
      socket.emit('chess-joined', { roomId: rid, role: 'guest', color: 'black' });
      io.to(rid).emit('chess-game-start', { roomId: rid, whiteId: g.whiteId, blackId: g.blackId, whiteUsername: g.whiteUsername, blackUsername: g.blackUsername, board: g.board, turn: g.turn, castling: g.castling, enPassant: g.enPassant });
    });

    socket.on('chess-move', ({ roomId, from, to, meta, promotion }) => {
      const g = chessGames.get(roomId);
      if (!g || g.gameOver || !g.blackId) return;
      if (g.turn === 'white' && g.whiteId !== socket.id) return;
      if (g.turn === 'black' && g.blackId !== socket.id) return;
      if (!chess.isMoveLegal(g.board, from, to, meta || null, g.enPassant, g.castling)) return socket.emit('chess-error', { message: 'Invalid move' });
      const res = chess.applyMoveFull(g.board, from, to, meta || null, g.castling, g.enPassant, promotion);
      g.board = res.board;
      g.castling = res.castling;
      g.enPassant = res.enPassant;
      g.turn = g.turn === 'white' ? 'black' : 'white';
      g.gameOver = chess.checkGameEnd(g.board, g.turn === 'white' ? 'black' : 'white', g.enPassant, g.castling);
      io.to(roomId).emit('chess-move', { from, to, meta: meta || null, promotion: promotion || null, board: g.board, turn: g.turn, castling: g.castling, enPassant: g.enPassant, gameOver: g.gameOver });
    });

    socket.on('chess-leave', ({ roomId }) => {
      socket.leave(roomId);
      const g = chessGames.get(roomId);
      if (g) {
        const otherId = g.whiteId === socket.id ? g.blackId : g.blackId;
        if (otherId) io.to(otherId).emit('chess-opponent-left');
        chessGames.delete(roomId);
      }
    });

    socket.on('chess-cancel-queue', () => {
      const idx = chessMatchmakingQueue.findIndex(e => e.id === socket.id);
      if (idx !== -1) chessMatchmakingQueue.splice(idx, 1);
    });

    socket.on('player-update', ({ position, rotation }) => {
      const roomId = Array.from(socket.rooms).find(r => r.startsWith('game-'));
      if (roomId && gameRooms.has(roomId)) {
        const room = gameRooms.get(roomId);
        const player = room.players.find(p => p.id === socket.id);
        if (player) { player.position = position; player.rotation = rotation; socket.to(roomId).emit('player-update', player); }
      }
    });

    socket.on('disconnect', () => {
      const qIdx = chessMatchmakingQueue.findIndex(e => e.id === socket.id);
      if (qIdx !== -1) chessMatchmakingQueue.splice(qIdx, 1);
      chessGames.forEach((g, roomId) => {
        if (g.whiteId === socket.id || g.blackId === socket.id) {
          const otherId = g.whiteId === socket.id ? g.blackId : g.blackId;
          if (otherId) io.to(roomId).emit('chess-opponent-left');
          chessGames.delete(roomId);
        }
      });
      gameRooms.forEach((room, roomId) => {
        const i = room.players.findIndex(p => p.id === socket.id);
        if (i !== -1) { room.players.splice(i, 1); socket.to(roomId).emit('player-left', socket.id); if (room.players.length === 0) gameRooms.delete(roomId); }
      });
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 Pixel Place (Next.js + Socket.io) on http://localhost:${port}`);
    console.log(`   Chess & multiplayer servers are running.`);
  });
});
