import { getDb } from './lib/db';
import { createOrUpdateUser, hashPassword } from './lib/auth';
import { promises as fs } from 'fs';
import path from 'path';
import { User, UserMadeGame, PublishedGame, SceneData } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

async function migrateUsers() {
  try {
    const usersFile = path.join(DATA_DIR, 'users.json');
    const usersData = await fs.readFile(usersFile, 'utf-8');
    const users: User[] = JSON.parse(usersData);
    
    console.log(`Migrating ${users.length} users...`);
    
    for (const user of users) {
      try {
        await createOrUpdateUser(user, user.password);
        console.log(`Migrated user: ${user.username}`);
      } catch (e: any) {
        console.error(`Error migrating user ${user.username}:`, e.message);
      }
    }
    
    console.log('Users migration complete!');
  } catch (e) {
    console.log('No users.json file found or error reading it:', e);
  }
}

async function migrateGames() {
  try {
    const gamesDir = path.join(DATA_DIR, 'games');
    const files = await fs.readdir(gamesDir);
    const games: UserMadeGame[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(gamesDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const game = JSON.parse(content);
          games.push(game);
        } catch (e) {
          console.error(`Error reading game file ${file}:`, e);
        }
      }
    }
    
    console.log(`Migrating ${games.length} games...`);
    const db = getDb();
    
    for (const game of games) {
      try {
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO games (id, title, description, owner, ts, scene_data, preset_messages, controls, published_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
          game.id,
          game.title,
          game.desc || '',
          game.owner,
          game.ts,
          game.sceneData ? JSON.stringify(game.sceneData) : null,
          game.presetMessages ? JSON.stringify(game.presetMessages) : null,
          game.controls ? JSON.stringify(game.controls) : null,
          game.publishedBy || null
        );
        console.log(`Migrated game: ${game.title}`);
      } catch (e: any) {
        console.error(`Error migrating game ${game.title}:`, e.message);
      }
    }
    
    console.log('Games migration complete!');
  } catch (e) {
    console.log('No games directory found or error reading it:', e);
  }
}

async function migratePublishedGames() {
  try {
    const publishedFile = path.join(DATA_DIR, 'published.json');
    const publishedData = await fs.readFile(publishedFile, 'utf-8');
    const games: PublishedGame[] = JSON.parse(publishedData);
    
    console.log(`Migrating ${games.length} published games...`);
    const db = getDb();
    
    for (const game of games) {
      try {
        const stmt = db.prepare(`
          INSERT INTO published_games (title, description, owner, ts, thumbnail, game_code, scene_data, playable, multiplayer, max_players, server_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
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
        console.log(`Migrated published game: ${game.title}`);
      } catch (e: any) {
        console.error(`Error migrating published game ${game.title}:`, e.message);
      }
    }
    
    console.log('Published games migration complete!');
  } catch (e) {
    console.log('No published.json file found or error reading it:', e);
  }
}

async function migrateScenes() {
  try {
    const sceneFile = path.join(DATA_DIR, 'scene.json');
    const sceneData = await fs.readFile(sceneFile, 'utf-8');
    const scene: SceneData = JSON.parse(sceneData);
    
    console.log('Migrating scene data...');
    const db = getDb();
    
    // Note: Scene migration needs a user_id, so we'll use a default or skip
    // This should be handled per-user in the app
    console.log('Scene migration skipped - scenes are user-specific');
  } catch (e) {
    console.log('No scene.json file found or error reading it:', e);
  }
}

export async function runMigration() {
  console.log('Starting data migration...');
  await migrateUsers();
  await migrateGames();
  await migratePublishedGames();
  await migrateScenes();
  console.log('Migration complete!');
}

// Run migration if called directly
if (require.main === module) {
  runMigration().catch(console.error);
}
