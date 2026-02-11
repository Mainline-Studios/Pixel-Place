import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { getDocument, setDocument, queryDocuments, COLLECTIONS } from '@/lib/firestore';
import { User } from '@/types';

function userFromDoc(doc: any): User {
  return {
    username: doc.username || doc.id,
    password: doc.password_hash || doc.password || '',
    gender: doc.gender || '',
    role: (doc.role || 'user') as 'admin' | 'user',
    coins: doc.coins || 0,
    ownedSkins: Array.isArray(doc.owned_skins) ? doc.owned_skins : (typeof doc.owned_skins === 'string' ? JSON.parse(doc.owned_skins || '[]') : []),
    equippedSkin: doc.equipped_skin || '',
    ownedAccessories: Array.isArray(doc.owned_accessories) ? doc.owned_accessories : (typeof doc.owned_accessories === 'string' ? JSON.parse(doc.owned_accessories || '[]') : []),
    equippedAccessories: Array.isArray(doc.equipped_accessories) ? doc.equipped_accessories : (typeof doc.equipped_accessories === 'string' ? JSON.parse(doc.equipped_accessories || '[]') : []),
    ownedServers: Array.isArray(doc.owned_servers) ? doc.owned_servers : (typeof doc.owned_servers === 'string' ? JSON.parse(doc.owned_servers || '[]') : []),
    friends: Array.isArray(doc.friends) ? doc.friends : (typeof doc.friends === 'string' ? JSON.parse(doc.friends || '[]') : []),
    friendRequests: Array.isArray(doc.friend_requests) ? doc.friend_requests : (typeof doc.friend_requests === 'string' ? JSON.parse(doc.friend_requests || '[]') : []),
    sentFriendRequests: Array.isArray(doc.sent_friend_requests) ? doc.sent_friend_requests : (typeof doc.sent_friend_requests === 'string' ? JSON.parse(doc.sent_friend_requests || '[]') : [])
  };
=======
import { promises as fs } from 'fs';
import path from 'path';
import { User } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, return empty array
    return [];
  }
}

async function writeUsers(users: User[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
}

// API endpoint to add coins directly (for free coins, admin grants, etc.)
export async function POST(request: NextRequest) {
  try {
    const { userId, coins, setAmount } = await request.json();

    if (!userId || (!coins && !setAmount)) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

<<<<<<< HEAD
    // Only allow free coins for specific users (like 6767kid)
    const allowedFreeUsers = ['6767kid'];
    if (!allowedFreeUsers.includes(userId)) {
      return NextResponse.json(
        { error: 'Free coins not available for this user' },
        { status: 403 }
      );
    }

    // Get user from Firestore
    const existingUsers = await queryDocuments(COLLECTIONS.USERS, 'username_lower', '==', userId.toLowerCase());
    let userDoc = existingUsers.length > 0 ? existingUsers[0] : null;

    if (!userDoc) {
      // User doesn't exist yet - create them (for admin accounts that auto-create on login)
=======
    // Allow free coins for specific users (like 6767kid)
    // Also allow manual coin addition for any user (for fixing webhook issues after payment)
    // Note: In production, you might want to add admin authentication or verify payment
    const allowedFreeUsers = ['6767kid'];
    const isFreeUser = allowedFreeUsers.includes(userId);
    
    if (!isFreeUser) {
      // Allow manual coin addition - useful for fixing webhook issues after successful payment
      console.log(`Manual coin addition for ${userId}: ${coins} coins (likely fixing webhook issue)`);
    }

    // Read users from file
    const users = await readUsers();
    const userIndex = users.findIndex((u) => u.username.toLowerCase() === userId.toLowerCase());

    if (userIndex === -1) {
      // User doesn't exist yet - create them (for admin accounts that auto-create on login)
      // Check if it's an admin account that should be created
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
      const ADMIN_ACCOUNTS = [
        { username: "admin", password: "extra" },
        { username: "TicTAK", password: "Thomas" },
        { username: "IDon'tKnow", password: "Titan" },
        { username: "6767kid", password: "67676767" },
        { username: "Billibob", password: "Luca" },
        { username: "Daniello1", password: "Daniel" },
        { username: "FunBoy", password: "Simon" },
        { username: "BelloBoy1", password: "Zac" },
        { username: "Bob", password: "Henry" },
        { username: "Mr.Noob", password: "Tyson" },
        { username: "BDawgsAwesome1", password: "20Minecraft15" }
      ];

      const adminAccount = ADMIN_ACCOUNTS.find(a => a.username.toLowerCase() === userId.toLowerCase());
      
      if (adminAccount) {
<<<<<<< HEAD
        // Create the admin user in Firestore
        const initialCoins = setAmount !== undefined ? setAmount : (coins || 0);
        const newUserData = {
          username: adminAccount.username,
          username_lower: adminAccount.username.toLowerCase(),
          password_hash: adminAccount.password,
          gender: 'N/A',
          role: 'admin',
          coins: initialCoins,
          owned_skins: ['starter_classic'],
          equipped_skin: 'starter_classic',
          owned_accessories: [],
          equipped_accessories: [],
          friends: [],
          created_at: Date.now(),
          updated_at: Date.now()
        };
        
        await setDocument(COLLECTIONS.USERS, adminAccount.username.toLowerCase(), newUserData);
=======
        // Create the admin user
        const initialCoins = setAmount !== undefined ? setAmount : (coins || 0);
        const newUser: User = {
          username: adminAccount.username,
          password: adminAccount.password,
          gender: 'N/A',
          role: 'admin',
          coins: initialCoins, // Start with the specified coins
          ownedSkins: ['starter_classic'],
          equippedSkin: 'starter_classic',
          ownedAccessories: [],
          equippedAccessories: {},
          friends: [] // Preserve friends array
        };
        users.push(newUser);
        await writeUsers(users);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
        
        return NextResponse.json({
          success: true,
          message: `Created user and set coins to ${initialCoins} for ${userId}`,
          newBalance: initialCoins
        });
      }

      return NextResponse.json(
        { error: 'User not found. Please log in first to create your account.' },
        { status: 404 }
      );
    }

    // Update existing user's coin balance
<<<<<<< HEAD
    const user = userFromDoc(userDoc);
    const newCoins = setAmount !== undefined ? setAmount : (user.coins + coins);
    
    await setDocument(COLLECTIONS.USERS, userDoc.id, {
      coins: newCoins,
      updated_at: Date.now()
    });
=======
    if (setAmount !== undefined) {
      // Set to specific amount
      users[userIndex].coins = setAmount;
    } else {
      // Add to current amount
      const currentCoins = typeof users[userIndex].coins === 'number' ? users[userIndex].coins : 0;
      users[userIndex].coins = currentCoins + coins;
    }
    
    // Preserve friends array if it exists
    if (!users[userIndex].friends) {
      users[userIndex].friends = [];
    }
    
    await writeUsers(users);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328

    return NextResponse.json({
      success: true,
      message: setAmount !== undefined ? `Set coins to ${setAmount} for ${userId}` : `Added ${coins} coins to ${userId}`,
<<<<<<< HEAD
      newBalance: newCoins
=======
      newBalance: users[userIndex].coins
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
    });
  } catch (error: any) {
    console.error('Add coins error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add coins' },
      { status: 500 }
    );
  }
}
<<<<<<< HEAD
=======

>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
