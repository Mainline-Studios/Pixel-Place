import { getDb } from './lib/db';
import { TIC_TAC_TOE_PRELOADED_GAME, CAPTURE_THE_FLAG_PRELOADED_GAME } from './lib/preloadedGames';
import { PublishedGame } from './types';

// Hide and Seek game code
const HIDE_AND_SEEK_GAME_CODE = `// Hide and Seek - Online Multiplayer
// THREE is provided by the game engine

function createGame(container) {
  const isOnline = typeof window !== 'undefined' && window.gameSocket !== undefined && window.gameSocket !== null;
  
  if (!isOnline) {
    container.innerHTML = '<div style="color: white; padding: 20px; text-align: center;"><h2>Hide and Seek</h2><p>This game requires online multiplayer. Click "Play Online" to start.</p></div>';
    return;
  }
  
  // Game implementation here
  container.innerHTML = '<div style="color: white; padding: 20px;"><h2>Hide and Seek - Coming Soon</h2></div>';
}

export const HIDE_AND_SEEK_PRELOADED_GAME: PublishedGame = {
  title: 'Hide and Seek',
  desc: 'Classic hide and seek! One seeker, multiple hiders. Online multiplayer only.',
  owner: 'System',
  ts: Date.now() + 3000,
  gameCode: HIDE_AND_SEEK_GAME_CODE,
  playable: true,
  multiplayer: true,
  maxPlayers: 8
};

async function initializePublishedGames() {
  console.log('Initializing published games...');
  
  const games: PublishedGame[] = [
    {
      ...TIC_TAC_TOE_PRELOADED_GAME,
      multiplayer: true,
      maxPlayers: 2,
    },
    {
      ...CAPTURE_THE_FLAG_PRELOADED_GAME,
      multiplayer: true,
      maxPlayers: 16,
    },
    HIDE_AND_SEEK_PRELOADED_GAME,
  ];
  
  const db = getDb();
  
  // Clear existing
  db.prepare('DELETE FROM published_games').run();
  
  // Insert games
  const stmt = db.prepare(`
    INSERT INTO published_games (title, description, owner, ts, thumbnail, game_code, scene_data, playable, multiplayer, max_players, server_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const game of games) {
    stmt.run(
      game.title,
      game.desc || '',
      game.owner,
      game.ts,
      game.thumbnail || null,
      game.gameCode || null,
      game.sceneData ? JSON.stringify(game.sceneData) : null,
      game.playable ? 1 : 0,
      game.multiplayer ? 1 : 0,
      game.maxPlayers || null,
      game.serverId || null
    );
  }
  
  console.log(`Initialized ${games.length} published games`);
}

if (require.main === module) {
  initializePublishedGames().catch(console.error);
}

export { initializePublishedGames };
