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

// Preset chat messages for different games
const PRESET_MESSAGES = {
  'tic-tac-toe': {
    waitingRoom: [
      'Ready to play!',
      'Good luck!',
      "Let's go!",
      'X or O?',
      'Best of 3?'
    ],
    gameChat: [
      'Nice move!',
      'Good game!',
      'Your turn',
      'I see what you did there',
      'Well played!'
    ]
  },
  'capture-the-flag': {
    waitingRoom: [
      'Ready for battle!',
      "Let's capture some flags!",
      'Team up!',
      'Protect the base!',
      'Time to dominate!'
    ],
    gameChat: [
      'Flag captured!',
      'Need backup!',
      'Enemy spotted!',
      'Returning to base',
      'Great teamwork!'
    ]
  },
  'hide-and-seek': {
    waitingRoom: [
      'Ready to hide!',
      "Who's the seeker?",
      'Find a good spot!',
      "Don't find me!",
      "Let's play!"
    ],
    gameChat: [
      'Found you!',
      'Still hiding',
      'Almost found me',
      'Good hiding spot',
      'Seeker coming!'
    ]
  }
};

// Waiting room management
const waitingRooms = new Map();

function getGameType(gameId) {
  // Determine game type from gameId or title
  if (gameId.includes('tic') || gameId.includes('Tic')) return 'tic-tac-toe';
  if (gameId.includes('flag') || gameId.includes('Flag')) return 'capture-the-flag';
  if (gameId.includes('hide') || gameId.includes('Hide')) return 'hide-and-seek';
  return 'default';
}

function getMinPlayers(gameType) {
  switch (gameType) {
    case 'tic-tac-toe': return 2;
    case 'capture-the-flag': return 4;
    case 'hide-and-seek': return 3;
    default: return 2;
  }
}


io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('join-game', ({ serverId, gameId, username, sessionId }) => {
    const roomId = sessionId || `game-${gameId}-${serverId || 'default'}`;
    const gameType = getGameType(gameId);
    const minPlayers = getMinPlayers(gameType);
    
    socket.join(roomId);
    
    // Initialize waiting room if needed
    if (!waitingRooms.has(roomId)) {
      waitingRooms.set(roomId, {
        players: [],
        gameId,
        gameType,
        minPlayers,
        maxPlayers: 16,
        status: 'waiting', // 'waiting' or 'playing'
        presets: PRESET_MESSAGES[gameType] || PRESET_MESSAGES['default']
      });
    }
    
    const waitingRoom = waitingRooms.get(roomId);
    const player = {
      id: socket.id,
      username: username || 'Player',
    };
    
    // Add player to waiting room
    if (!waitingRoom.players.find(p => p.username === player.username)) {
      waitingRoom.players.push(player);
      io.to(roomId).emit('player-joined-waiting', { username: player.username });
      io.to(roomId).emit('waiting-room-update', {
        players: waitingRoom.players.map(p => p.username),
        currentPlayers: waitingRoom.players.length,
        minPlayers: waitingRoom.minPlayers,
        maxPlayers: waitingRoom.maxPlayers,
        canStart: waitingRoom.players.length >= waitingRoom.minPlayers
      });
    }

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
    const gamePlayer = {
      id: socket.id,
      username: username || 'Player',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    };

    // Check if player already exists
    const existingPlayerIndex = room.players.findIndex(p => p.username === gamePlayer.username);
    if (existingPlayerIndex !== -1) {
      room.players[existingPlayerIndex] = gamePlayer;
    } else {
      room.players.push(gamePlayer);
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

  socket.on('chat-message', ({ message }) => {
    const roomId = Array.from(socket.rooms).find(r => r.startsWith('game-') || r.startsWith('session-'));
    if (roomId && gameRooms.has(roomId)) {
      const room = gameRooms.get(roomId);
      const player = room.players.find(p => p.id === socket.id);
      // Broadcast chat message to all players in room
      io.to(roomId).emit('chat-message', {
        username: player?.username || 'Player',
        message: message
      });
    }
  });

  
  
  socket.on('waiting-room-chat', ({ roomId, username, message }) => {
    const waitingRoom = waitingRooms.get(roomId);
    if (waitingRoom && waitingRoom.status === 'waiting') {
      io.to(roomId).emit('waiting-room-chat', { username, message });
    }
  });
  
  socket.on('start-game', ({ roomId }) => {
    const waitingRoom = waitingRooms.get(roomId);
    if (waitingRoom && waitingRoom.status === 'waiting') {
      if (waitingRoom.players.length >= waitingRoom.minPlayers) {
        waitingRoom.status = 'playing';
        io.to(roomId).emit('game-start', {
          players: waitingRoom.players,
          gameType: waitingRoom.gameType
        });
        
        // Assign roles for hide and seek
        if (waitingRoom.gameType === 'hide-and-seek') {
          const seekerIndex = Math.floor(Math.random() * waitingRoom.players.length);
          waitingRoom.players.forEach((player, idx) => {
            const role = idx === seekerIndex ? 'seeker' : 'hider';
            io.to(player.id).emit('role-assigned', { role });
          });
        }
      }
    }
  });
  
  socket.on('game-chat', ({ roomId, username, message }) => {
    const waitingRoom = waitingRooms.get(roomId);
    if (waitingRoom && waitingRoom.status === 'playing') {
      io.to(roomId).emit('game-chat', { username, message });
    }
  })
  
  socket.on('hider-found', ({ roomId, hiderId }) => {
    const waitingRoom = waitingRooms.get(roomId);
    if (waitingRoom && waitingRoom.status === 'playing') {
      // Notify all players that a hider was found
      io.to(roomId).emit('hider-found', { hiderId });
    }
  });
  
  socket.on('game-over', ({ roomId, winner }) => {
    const waitingRoom = waitingRooms.get(roomId);
    if (waitingRoom && waitingRoom.status === 'playing') {
      // Notify all players of game end
      io.to(roomId).emit('game-over', { winner });
      // Reset waiting room for next game
      waitingRoom.status = 'waiting';
    }
  });
;
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

const PORT = process.env.PORT || process.env.SOCKET_PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎮 Socket.io Game Server running on port ${PORT}`);
  console.log(`Connect from: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}`);
});
