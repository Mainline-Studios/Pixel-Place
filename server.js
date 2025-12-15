// Socket.io Game Server
// Run this separately: node server.js
// Or integrate into your Next.js app

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Store active game rooms and sessions
const gameRooms = new Map();
const gameSessions = new Map();

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('join-game', ({ serverId, gameId, username, sessionId }) => {
    const roomId = sessionId || `game-${gameId}-${serverId || 'default'}`;
    socket.join(roomId);

    // Initialize room if needed
    if (!gameRooms.has(roomId)) {
      gameRooms.set(roomId, {
        players: [],
        gameId,
        serverId,
        sessionId,
      });
    }

    const room = gameRooms.get(roomId);
    const player = {
      id: socket.id,
      username: username || 'Player',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    };

    // Check if player already exists
    const existingPlayerIndex = room.players.findIndex(p => p.username === player.username);
    if (existingPlayerIndex !== -1) {
      room.players[existingPlayerIndex] = player;
    } else {
      room.players.push(player);
    }

    // Notify others
    socket.to(roomId).emit('player-joined', player);

    // Send current players to new player
    socket.emit('room-state', {
      players: room.players.filter(p => p.id !== socket.id)
    });

    // Broadcast updated player list to all
    io.to(roomId).emit('players-updated', {
      players: room.players,
      playerCount: room.players.length
    });

    console.log(`Player ${username} joined room ${roomId} (${room.players.length} players)`);
  });

  socket.on('player-update', ({ position, rotation }) => {
    const roomId = Array.from(socket.rooms).find(r => r.startsWith('game-') || r.startsWith('session-'));
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

  socket.on('game-state-update', ({ state }) => {
    const roomId = Array.from(socket.rooms).find(r => r.startsWith('game-') || r.startsWith('session-'));
    if (roomId) {
      // Broadcast game state to all players in room
      socket.to(roomId).emit('game-state-update', { state });
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);

    // Remove from all rooms
    gameRooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        socket.to(roomId).emit('player-left', socket.id);

        // Broadcast updated player list
        io.to(roomId).emit('players-updated', {
          players: room.players,
          playerCount: room.players.length
        });

        // Clean up empty rooms
        if (room.players.length === 0) {
          gameRooms.delete(roomId);
          console.log(`Cleaned up empty room: ${roomId}`);
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
