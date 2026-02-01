import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { ADMIN_ACCOUNTS_LIST } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const results = [];
    
    for (const adminAccount of ADMIN_ACCOUNTS_LIST) {
      try {
        // Check if user already exists
        const existing = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(adminAccount.username);
        
        // Determine special coin amounts
        let coins = 99999; // Default admin coins
        if (adminAccount.username === '6767kid') {
          coins = 4e471; // Massive amount for 6767kid
        } else if (adminAccount.username.toLowerCase() === 'daniello1') {
          coins = 5.534e200; // Massive amount for Daniello1
        }
        
        if (existing) {
          // Update existing user to ensure it's an admin
          const passwordHash = await hashPassword(adminAccount.password);
          db.prepare(`
            UPDATE users SET
              password_hash = ?,
              role = 'admin',
              coins = ?,
              owned_skins = ?,
              equipped_skin = ?,
              updated_at = strftime('%s', 'now')
            WHERE LOWER(username) = LOWER(?)
          `).run(
            passwordHash,
            coins,
            JSON.stringify(['starter_classic']),
            'starter_classic',
            adminAccount.username
          );
          results.push({ username: adminAccount.username, action: 'updated' });
        } else {
          // Create new user
          const passwordHash = await hashPassword(adminAccount.password);
          db.prepare(`
            INSERT INTO users (
              username, password_hash, gender, role, coins, owned_skins, equipped_skin,
              owned_accessories, equipped_accessories, owned_servers, friends,
              friend_requests, sent_friend_requests, is_donor
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            adminAccount.username,
            passwordHash,
            'N/A',
            'admin',
            coins,
            JSON.stringify(['starter_classic']),
            'starter_classic',
            JSON.stringify([]),
            JSON.stringify({}),
            JSON.stringify([]),
            JSON.stringify([]),
            JSON.stringify([]),
            JSON.stringify([]),
            0
          );
          results.push({ username: adminAccount.username, action: 'created' });
        }
      } catch (error: any) {
        results.push({ 
          username: adminAccount.username, 
          action: 'error', 
          error: error.message 
        });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Processed ${ADMIN_ACCOUNTS_LIST.length} admin accounts`,
      results 
    });
  } catch (error: any) {
    console.error('Error initializing admin accounts:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
