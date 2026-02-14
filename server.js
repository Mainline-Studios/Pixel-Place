// Socket.io Game Server
// Run this separately: node server.js
// Chess: matchmaking + private rooms, authoritative move validation

const http = require('http');
const { Server } = require('socket.io');
const chess = require('./server/chess-engine.js');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Store active game rooms (general games)
const gameRooms = new Map();

// Chess: matchmaking queue and game rooms
const chessMatchmakingQueue = [];
const chessGames = new Map(); // roomId -> { board, turn, castling, enPassant, gameOver, whiteId, blackId, whiteUsername, blackUsername }

function genRoomId() {
  return 'chess-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('join-game', ({ serverId, gameId, username }) => {
    const roomId = `game-${gameId}-${serverId}`;
    socket.join(roomId);

    // Initialize room if needed
    if (!gameRooms.has(roomId)) {
      gameRooms.set(roomId, {
        players: [],
        gameId,
        serverId
      });
    }

    const room = gameRooms.get(roomId);
    const player = {
      id: socket.id,
      username: username || 'Player',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    };

    room.players.push(player);

    // Notify others
    socket.to(roomId).emit('player-joined', player);

    // Send current players to new player
    socket.emit('room-state', {
      players: room.players.filter(p => p.id !== socket.id)
    });

    console.log(`Player ${username} joined room ${roomId}`);
  });

  // ---- Chess ----
  socket.on('chess-find', ({ username }) => {
    const u = username || 'Player';
    const existing = chessMatchmakingQueue.find((e) => e.id === socket.id);
    if (existing) return;
    chessMatchmakingQueue.push({ id: socket.id, username: u });
    if (chessMatchmakingQueue.length >= 2) {
      const p1 = chessMatchmakingQueue.shift();
      const p2 = chessMatchmakingQueue.shift();
      const roomId = genRoomId();
      const game = {
        board: chess.initBoard(),
        turn: 'white',
        castling: chess.defaultCastling(),
        enPassant: null,
        gameOver: null,
        whiteId: p1.id,
        blackId: p2.id,
        whiteUsername: p1.username,
        blackUsername: p2.username
      };
      chessGames.set(roomId, game);
      io.sockets.sockets.get(p1.id)?.join(roomId);
      io.sockets.sockets.get(p2.id)?.join(roomId);
      io.to(roomId).emit('chess-matched', {
        roomId,
        whiteId: p1.id,
        blackId: p2.id,
        whiteUsername: p1.username,
        blackUsername: p2.username
      });
    }
  });

  socket.on('chess-create', ({ username }) => {
    const u = username || 'Player';
    const roomId = genRoomId();
    const game = {
      board: chess.initBoard(),
      turn: 'white',
      castling: chess.defaultCastling(),
      enPassant: null,
      gameOver: null,
      whiteId: socket.id,
      blackId: null,
      whiteUsername: u,
      blackUsername: null
    };
    chessGames.set(roomId, game);
    socket.join(roomId);
    socket.emit('chess-created', { roomId, role: 'host', color: 'white' });
  });

  socket.on('chess-join', ({ roomId, username }) => {
    const rid = (roomId || '').trim();
    const g = chessGames.get(rid);
    if (!g) {
      socket.emit('chess-error', { message: 'Room not found' });
      return;
    }
    if (g.blackId) {
      socket.emit('chess-error', { message: 'Room full' });
      return;
    }
    g.blackId = socket.id;
    g.blackUsername = username || 'Player';
    socket.join(rid);
    socket.emit('chess-joined', { roomId: rid, role: 'guest', color: 'black' });
    io.to(rid).emit('chess-game-start', {
      roomId: rid,
      whiteId: g.whiteId,
      blackId: g.blackId,
      whiteUsername: g.whiteUsername,
      blackUsername: g.blackUsername,
      board: g.board,
      turn: g.turn,
      castling: g.castling,
      enPassant: g.enPassant
    });
  });

  socket.on('chess-move', ({ roomId, from, to, meta, promotion }) => {
    const g = chessGames.get(roomId);
    if (!g || g.gameOver) return;
    if (!g.blackId) return; // wait for opponent to join
    if (g.turn === 'white' && g.whiteId !== socket.id) return;
    if (g.turn === 'black' && g.blackId !== socket.id) return;
    if (!chess.isMoveLegal(g.board, from, to, meta || null, g.enPassant, g.castling)) {
      socket.emit('chess-error', { message: 'Invalid move' });
      return;
    }
    const res = chess.applyMoveFull(g.board, from, to, meta || null, g.castling, g.enPassant, promotion);
    g.board = res.board;
    g.castling = res.castling;
    g.enPassant = res.enPassant;
    g.turn = g.turn === 'white' ? 'black' : 'white';
    g.gameOver = chess.checkGameEnd(g.board, g.turn === 'white' ? 'black' : 'white', g.enPassant, g.castling);
    io.to(roomId).emit('chess-move', {
      from,
      to,
      meta: meta || null,
      promotion: promotion || null,
      board: g.board,
      turn: g.turn,
      castling: g.castling,
      enPassant: g.enPassant,
      gameOver: g.gameOver
    });
  });

  socket.on('chess-leave', ({ roomId }) => {
    socket.leave(roomId);
    const g = chessGames.get(roomId);
    if (g) {
      const otherId = g.whiteId === socket.id ? g.blackId : g.blackId === socket.id ? g.whiteId : null;
      if (otherId) {
        io.to(otherId).emit('chess-opponent-left');
      }
      chessGames.delete(roomId);
    }
  });

  socket.on('chess-cancel-queue', () => {
    const idx = chessMatchmakingQueue.findIndex((e) => e.id === socket.id);
    if (idx !== -1) chessMatchmakingQueue.splice(idx, 1);
  });

  socket.on('player-update', ({ position, rotation }) => {
    const roomId = Array.from(socket.rooms).find(r => r.startsWith('game-'));
    if (roomId && gameRooms.has(roomId)) {
      const room = gameRooms.get(roomId);
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.position = position;
        player.rotation = rotation;
        // Broadcast to others in room
        socket.to(roomId).emit('player-update', player);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);

    // Chess: remove from queue and handle game abandonment
    const qIdx = chessMatchmakingQueue.findIndex((e) => e.id === socket.id);
    if (qIdx !== -1) chessMatchmakingQueue.splice(qIdx, 1);
    chessGames.forEach((g, roomId) => {
      if (g.whiteId === socket.id || g.blackId === socket.id) {
        const otherId = g.whiteId === socket.id ? g.blackId : g.blackId;
        if (otherId) io.to(roomId).emit('chess-opponent-left');
        chessGames.delete(roomId);
      }
    });

    // Remove from all rooms
    gameRooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        socket.to(roomId).emit('player-left', socket.id);

        // Clean up empty rooms
        if (room.players.length === 0) {
          gameRooms.delete(roomId);
        }
      }
    });
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎮 Socket.io Game Server running on port ${PORT}`);
  console.log(`Connect from: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}`);
});


















