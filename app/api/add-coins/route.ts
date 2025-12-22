import { NextRequest, NextResponse } from 'next/server';
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

    // Only allow free coins for specific users (like 6767kid)
    const allowedFreeUsers = ['6767kid'];
    if (!allowedFreeUsers.includes(userId)) {
      return NextResponse.json(
        { error: 'Free coins not available for this user' },
        { status: 403 }
      );
    }

    // Read users from file
    const users = await readUsers();
    const userIndex = users.findIndex((u) => u.username.toLowerCase() === userId.toLowerCase());

    if (userIndex === -1) {
      // User doesn't exist yet - create them (for admin accounts that auto-create on login)
      // Check if it's an admin account that should be created
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

    return NextResponse.json({
      success: true,
      message: setAmount !== undefined ? `Set coins to ${setAmount} for ${userId}` : `Added ${coins} coins to ${userId}`,
      newBalance: users[userIndex].coins
    });
  } catch (error: any) {
    console.error('Add coins error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add coins' },
      { status: 500 }
    );
  }
}

