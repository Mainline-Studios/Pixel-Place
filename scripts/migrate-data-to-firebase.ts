/**
 * Migration Script: Move all data from /data folder to Firebase
 * 
 * This script reads all JSON files from the /data directory and migrates
 * them to Firebase Firestore using the existing API structure.
 */

import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  // Handle FIREBASE_SERVICE_ACCOUNT specially (it's a single-line JSON)
  const firebaseMatch = envContent.match(/^FIREBASE_SERVICE_ACCOUNT=(.+)$/m);
  if (firebaseMatch) {
    process.env.FIREBASE_SERVICE_ACCOUNT = firebaseMatch[1].trim();
  }
  // Handle other variables
  envContent.split('\n').forEach(line => {
    if (line.startsWith('FIREBASE_SERVICE_ACCOUNT=')) return; // Already handled
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

import { getFirestoreInstance, COLLECTIONS, setDocument, addDocument, getDocuments, deleteDocument } from '../lib/firestore';
import { hashPassword } from '../lib/auth';

// Initialize Firebase
const db = getFirestoreInstance();

interface MigrationStats {
  users: number;
  bans: number;
  reports: number;
  appeals: number;
  messages: number;
  skins: number;
  accessories: number;
  publishedGames: number;
  prebuiltGames: number;
  drafts: number;
  scenes: number;
  tabContent: number;
  gymPumpSessions: number;
  gymPumpProgress: number;
  errors: string[];
}

const stats: MigrationStats = {
  users: 0,
  bans: 0,
  reports: 0,
  appeals: 0,
  messages: 0,
  skins: 0,
  accessories: 0,
  publishedGames: 0,
  prebuiltGames: 0,
  drafts: 0,
  scenes: 0,
  tabContent: 0,
  gymPumpSessions: 0,
  gymPumpProgress: 0,
  errors: []
};

function readJsonFile(filePath: string): any {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

// Helper function to remove undefined values from objects
function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefined(value);
      }
    }
    return cleaned;
  }
  return obj;
}

async function migrateUsers() {
  console.log('📦 Migrating users...');
  const users = readJsonFile(path.join(process.cwd(), 'data', 'users.json'));
  if (!Array.isArray(users)) {
    console.error('Users data is not an array');
    return;
  }

  for (const user of users) {
    try {
      const password_hash = (user.password && typeof user.password === 'string')
        ? await hashPassword(user.password)
        : '';
      const userData = {
        username: user.username,
        username_lower: user.username.toLowerCase(),
        password_hash,
        gender: user.gender || '',
        role: user.role || 'user',
        coins: user.coins || 0,
        owned_skins: user.ownedSkins || [],
        equipped_skin: user.equippedSkin || '',
        owned_accessories: user.ownedAccessories || [],
        equipped_accessories: user.equippedAccessories || {},
        owned_servers: user.ownedServers || [],
        friends: user.friends || [],
        friend_requests: user.friendRequests || [],
        sent_friend_requests: user.sentFriendRequests || [],
        recently_played: user.recentlyPlayed || [],
        is_donor: user.isDonor ? 1 : 0,
        created_at: Date.now(),
        updated_at: Date.now()
      };

      await setDocument(COLLECTIONS.USERS, user.username.toLowerCase(), removeUndefined(userData));
      stats.users++;
      console.log(`  ✓ Migrated user: ${user.username}`);
    } catch (error: any) {
      const errorMsg = `Error migrating user ${user.username}: ${error.message}`;
      console.error(`  ✗ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }
}

async function migrateBans() {
  console.log('📦 Migrating bans...');
  const bans = readJsonFile(path.join(process.cwd(), 'data', 'bans.json'));
  if (!Array.isArray(bans)) {
    console.log('  No bans to migrate');
    return;
  }

  for (const ban of bans) {
    try {
      const banData = {
        username: ban.username,
        username_lower: ban.username.toLowerCase(),
        reason: ban.reason || '',
        banned_by: ban.bannedBy || ban.banned_by || '',
        banned_at: ban.timestamp || ban.banned_at || Date.now(),
        expires_at: ban.expiresAt || ban.expires_at,
        permanent: ban.permanent || false,
        created_at: Date.now()
      };

      await setDocument(COLLECTIONS.BANS, ban.username.toLowerCase(), removeUndefined(banData));
      stats.bans++;
      console.log(`  ✓ Migrated ban: ${ban.username}`);
    } catch (error: any) {
      const errorMsg = `Error migrating ban ${ban.username}: ${error.message}`;
      console.error(`  ✗ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }
}

async function migrateReports() {
  console.log('📦 Migrating reports...');
  const reports = readJsonFile(path.join(process.cwd(), 'data', 'reports.json'));
  if (!Array.isArray(reports)) {
    console.log('  No reports to migrate');
    return;
  }

  for (const report of reports) {
    try {
      const reportId = report.id || `report_${report.timestamp || Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const reportData = {
        reported_username: report.reportedUsername,
        reported_by: report.reporterUsername || report.reportedBy,
        reason: report.reason || '',
        description: report.description || '',
        status: report.status || 'pending',
        reviewed_by: report.reviewedBy,
        admin_notes: report.adminNotes,
        reviewed_at: report.reviewedAt,
        created_at: report.timestamp || Date.now()
      };

      await setDocument(COLLECTIONS.REPORTS, reportId, removeUndefined(reportData));
      stats.reports++;
      console.log(`  ✓ Migrated report: ${reportId}`);
    } catch (error: any) {
      const errorMsg = `Error migrating report ${report.id}: ${error.message}`;
      console.error(`  ✗ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }
}

async function migrateAppeals() {
  console.log('📦 Migrating appeals...');
  const appeals = readJsonFile(path.join(process.cwd(), 'data', 'appeals.json'));
  if (!Array.isArray(appeals)) {
    console.log('  No appeals to migrate');
    return;
  }

  for (const appeal of appeals) {
    try {
      const appealId = appeal.id || `appeal_${appeal.timestamp || Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const appealData = {
        username: appeal.username,
        appeal_text: appeal.appealMessage || appeal.appealText || '',
        status: appeal.status || 'pending',
        reviewed_by: appeal.reviewedBy,
        admin_notes: appeal.adminNotes,
        reviewed_at: appeal.reviewedAt,
        created_at: appeal.timestamp || Date.now()
      };

      await setDocument(COLLECTIONS.BAN_APPEALS, appealId, removeUndefined(appealData));
      stats.appeals++;
      console.log(`  ✓ Migrated appeal: ${appealId}`);
    } catch (error: any) {
      const errorMsg = `Error migrating appeal ${appeal.id}: ${error.message}`;
      console.error(`  ✗ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }
}

async function migrateMessages() {
  console.log('📦 Migrating messages...');
  const messages = readJsonFile(path.join(process.cwd(), 'data', 'messages.json'));
  if (!Array.isArray(messages)) {
    console.log('  No messages to migrate');
    return;
  }

  for (const message of messages) {
    try {
      const messageId = message.id || `msg_${message.timestamp || Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const messageData = {
        from_username: message.from,
        from_username_lower: message.from.toLowerCase(),
        to_username: message.to,
        to_username_lower: message.to.toLowerCase(),
        message: message.message || '',
        read: message.read || false,
        created_at: message.timestamp || Date.now()
      };

      await setDocument(COLLECTIONS.MESSAGES, messageId, removeUndefined(messageData));
      stats.messages++;
      console.log(`  ✓ Migrated message: ${messageId}`);
    } catch (error: any) {
      const errorMsg = `Error migrating message ${message.id}: ${error.message}`;
      console.error(`  ✗ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }
}

async function migrateSkins() {
  console.log('📦 Migrating skins...');
  const skins = readJsonFile(path.join(process.cwd(), 'data', 'skins.json'));
  if (!Array.isArray(skins)) {
    console.log('  No skins to migrate');
    return;
  }

  try {
    await setDocument(COLLECTIONS.SKINS_CATALOG, 'catalog', {
      skins: skins,
      updated_at: Date.now()
    });
    stats.skins = skins.length;
    console.log(`  ✓ Migrated ${skins.length} skins`);
  } catch (error: any) {
    const errorMsg = `Error migrating skins: ${error.message}`;
    console.error(`  ✗ ${errorMsg}`);
    stats.errors.push(errorMsg);
  }
}

async function migrateAccessories() {
  console.log('📦 Migrating accessories...');
  const accessories = readJsonFile(path.join(process.cwd(), 'data', 'accessories.json'));
  if (!Array.isArray(accessories)) {
    console.log('  No accessories to migrate');
    return;
  }

  try {
    await setDocument(COLLECTIONS.ACCESSORIES_CATALOG, 'catalog', {
      accessories: accessories,
      updated_at: Date.now()
    });
    stats.accessories = accessories.length;
    console.log(`  ✓ Migrated ${accessories.length} accessories`);
  } catch (error: any) {
    const errorMsg = `Error migrating accessories: ${error.message}`;
    console.error(`  ✗ ${errorMsg}`);
    stats.errors.push(errorMsg);
  }
}

async function migratePublishedGames() {
  console.log('📦 Migrating published games...');
  const games = readJsonFile(path.join(process.cwd(), 'data', 'published.json'));
  if (!Array.isArray(games)) {
    console.log('  No published games to migrate');
    return;
  }

  for (const game of games) {
    try {
      const gameId = `${game.owner}_${game.ts}`;
      const gameData = {
        title: game.title || '',
        description: game.desc || '',
        owner: game.owner || '',
        ts: game.ts || Date.now(),
        thumbnail: game.thumbnail || '',
        game_code: game.gameCode || '',
        playable: game.playable !== false,
        multiplayer: game.multiplayer === true,
        max_players: game.maxPlayers,
        created_at: Date.now()
      };

      await setDocument(COLLECTIONS.PUBLISHED_GAMES, gameId, removeUndefined(gameData));
      stats.publishedGames++;
      if (stats.publishedGames % 10 === 0) {
        console.log(`  ✓ Migrated ${stats.publishedGames} published games...`);
      }
    } catch (error: any) {
      const errorMsg = `Error migrating published game ${game.title}: ${error.message}`;
      console.error(`  ✗ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }
  console.log(`  ✓ Migrated ${stats.publishedGames} published games total`);
}

async function migratePrebuiltGames() {
  console.log('📦 Migrating prebuilt games...');
  const games = readJsonFile(path.join(process.cwd(), 'data', 'prebuilt.json'));
  if (!Array.isArray(games)) {
    console.log('  No prebuilt games to migrate');
    return;
  }

  for (const game of games) {
    try {
      const gameData = {
        id: game.id,
        title: game.title || '',
        description: game.desc || game.description || '',
        owner: game.owner || 'system',
        ts: game.ts || Date.now(),
        scene_data: game.sceneData ? JSON.stringify(game.sceneData) : null,
        created_at: Date.now()
      };

      await setDocument(COLLECTIONS.PREBUILT_GAMES, game.id, removeUndefined(gameData));
      stats.prebuiltGames++;
      console.log(`  ✓ Migrated prebuilt game: ${game.id}`);
    } catch (error: any) {
      const errorMsg = `Error migrating prebuilt game ${game.id}: ${error.message}`;
      console.error(`  ✗ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }
}

async function migrateDraft() {
  console.log('📦 Migrating draft...');
  const draft = readJsonFile(path.join(process.cwd(), 'data', 'draft.json'));
  if (!draft || typeof draft !== 'object') {
    console.log('  No draft to migrate');
    return;
  }

  try {
    const username = draft.owner || 'default';
    const draftData = {
      username: username,
      title: draft.title || '',
      desc: draft.desc || '',
      owner: draft.owner || '',
      game_code: draft.gameCode || '',
      thumbnail: draft.thumbnail,
      updated_at: Date.now()
    };

    await setDocument(COLLECTIONS.DRAFTS, username, removeUndefined(draftData));
    stats.drafts = 1;
    console.log(`  ✓ Migrated draft for: ${username}`);
  } catch (error: any) {
    const errorMsg = `Error migrating draft: ${error.message}`;
    console.error(`  ✗ ${errorMsg}`);
    stats.errors.push(errorMsg);
  }
}

async function migrateScene() {
  console.log('📦 Migrating scene...');
  const scene = readJsonFile(path.join(process.cwd(), 'data', 'scene.json'));
  if (!scene || typeof scene !== 'object') {
    console.log('  No scene to migrate');
    return;
  }

  try {
    await setDocument(COLLECTIONS.SCENES, 'default', {
      user_id: 'default',
      scene_data: scene,
      updated_at: Date.now()
    });
    stats.scenes = 1;
    console.log(`  ✓ Migrated scene`);
  } catch (error: any) {
    const errorMsg = `Error migrating scene: ${error.message}`;
    console.error(`  ✗ ${errorMsg}`);
    stats.errors.push(errorMsg);
  }
}

async function migrateTabContent() {
  console.log('📦 Migrating tab content...');
  const tabContent = readJsonFile(path.join(process.cwd(), 'data', 'tabcontent.json'));
  if (!tabContent || typeof tabContent !== 'object') {
    console.log('  No tab content to migrate');
    return;
  }

  try {
    for (const [tabName, content] of Object.entries(tabContent)) {
      await setDocument(COLLECTIONS.TAB_CONTENT, tabName, {
        tab_name: tabName,
        content: content,
        updated_at: Date.now()
      });
      stats.tabContent++;
      console.log(`  ✓ Migrated tab: ${tabName}`);
    }
  } catch (error: any) {
    const errorMsg = `Error migrating tab content: ${error.message}`;
    console.error(`  ✗ ${errorMsg}`);
    stats.errors.push(errorMsg);
  }
}

async function migrateGymPumpSessions() {
  console.log('📦 Migrating gym pump sessions...');
  const sessions = readJsonFile(path.join(process.cwd(), 'data', 'gym-pump-sessions.json'));
  if (!Array.isArray(sessions)) {
    console.log('  No gym pump sessions to migrate');
    return;
  }

  for (const session of sessions) {
    try {
      const sessionId = session.sessionId || `session_${session.timestamp || Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionData = {
        session_id: sessionId,
        game_id: session.gameId || 'gym-pump',
        username: session.username,
        created_at: session.timestamp || Date.now()
      };

      await setDocument(COLLECTIONS.GYM_PUMP_SESSIONS, sessionId, removeUndefined(sessionData));
      stats.gymPumpSessions++;
    } catch (error: any) {
      const errorMsg = `Error migrating gym pump session ${session.sessionId}: ${error.message}`;
      console.error(`  ✗ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }
  console.log(`  ✓ Migrated ${stats.gymPumpSessions} gym pump sessions`);
}

async function migrateGymPumpProgress() {
  console.log('📦 Migrating gym pump progress...');
  const progress = readJsonFile(path.join(process.cwd(), 'data', 'gym-pump-progress.json'));
  if (!Array.isArray(progress)) {
    console.log('  No gym pump progress to migrate');
    return;
  }

  for (const prog of progress) {
    try {
      const progressId = `${prog.username}_${prog.gameId || 'gym-pump'}`;
      const progressData = {
        username: prog.username,
        game_id: prog.gameId || 'gym-pump',
        power: prog.power || 0,
        coins: prog.coins || 0,
        level: prog.level || 1,
        last_synced: prog.lastSynced || Date.now()
      };

      await setDocument(COLLECTIONS.GYM_PUMP_PROGRESS, progressId, removeUndefined(progressData));
      stats.gymPumpProgress++;
      console.log(`  ✓ Migrated progress for: ${prog.username}`);
    } catch (error: any) {
      const errorMsg = `Error migrating gym pump progress for ${prog.username}: ${error.message}`;
      console.error(`  ✗ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }
}

async function main() {
  console.log('🚀 Starting data migration from /data to Firebase...\n');

  try {
    await migrateUsers();
    await migrateBans();
    await migrateReports();
    await migrateAppeals();
    await migrateMessages();
    await migrateSkins();
    await migrateAccessories();
    await migratePublishedGames();
    await migratePrebuiltGames();
    await migrateDraft();
    await migrateScene();
    await migrateTabContent();
    await migrateGymPumpSessions();
    await migrateGymPumpProgress();

    console.log('\n✅ Migration completed!\n');
    console.log('📊 Migration Statistics:');
    console.log(`  Users: ${stats.users}`);
    console.log(`  Bans: ${stats.bans}`);
    console.log(`  Reports: ${stats.reports}`);
    console.log(`  Appeals: ${stats.appeals}`);
    console.log(`  Messages: ${stats.messages}`);
    console.log(`  Skins: ${stats.skins}`);
    console.log(`  Accessories: ${stats.accessories}`);
    console.log(`  Published Games: ${stats.publishedGames}`);
    console.log(`  Prebuilt Games: ${stats.prebuiltGames}`);
    console.log(`  Drafts: ${stats.drafts}`);
    console.log(`  Scenes: ${stats.scenes}`);
    console.log(`  Tab Content: ${stats.tabContent}`);
    console.log(`  Gym Pump Sessions: ${stats.gymPumpSessions}`);
    console.log(`  Gym Pump Progress: ${stats.gymPumpProgress}`);

    if (stats.errors.length > 0) {
      console.log(`\n⚠️  ${stats.errors.length} errors occurred:`);
      stats.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    } else {
      console.log('\n✨ No errors occurred during migration!');
    }

    console.log('\n💡 Next steps:');
    console.log('  1. Verify all data in Firebase Console');
    console.log('  2. Test the application to ensure everything works');
    console.log('  3. Once verified, delete the /data folder');
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
