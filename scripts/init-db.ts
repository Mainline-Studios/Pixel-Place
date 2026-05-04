import { getDb } from './lib/db';
import { createOrUpdateUser, hashPassword } from './lib/auth';
import { ADMIN_ACCOUNTS_LIST } from './lib/storage';
import { User } from './types';

// Initialize database and migrate admin accounts
export async function initializeDatabase() {
  console.log('Initializing database...');
  
  // Initialize database (creates tables)
  const db = getDb();
  console.log('Database initialized');
  
  // Migrate admin accounts
  console.log('Migrating admin accounts...');
  for (const admin of ADMIN_ACCOUNTS_LIST) {
    try {
      const user: User = {
        username: admin.username,
        password: '', // Will be hashed
        gender: 'N/A',
        role: 'admin',
        coins: 99999,
        ownedSkins: ['pixel_placer'],
        equippedSkin: 'pixel_placer',
        ownedAccessories: [],
        equippedAccessories: [],
        ownedServers: [],
        friends: [],
        friendRequests: [],
        sentFriendRequests: [],
        isDonor: false,
      };
      
      await createOrUpdateUser(user, admin.password);
      console.log(`Migrated admin: ${admin.username}`);
    } catch (e: any) {
      console.error(`Error migrating admin ${admin.username}:`, e.message);
    }
  }
  
  console.log('Database initialization complete!');
}

// Run initialization if called directly
if (require.main === module) {
  initializeDatabase().catch(console.error);
}
