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

// Store active game rooms
const gameRooms = new Map();

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


