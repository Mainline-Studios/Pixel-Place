export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { denyUnlessAdminSetupSecret } from '@/lib/serverSetupSecret';

export async function POST(request: NextRequest) {
  const denied = denyUnlessAdminSetupSecret(request);
  if (denied) return denied;

  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Username and password are required' 
      }, { status: 400 });
    }
    
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(username) as any;
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // Hash the new password
    const passwordHash = await hashPassword(password);
    
    // Update the password
    db.prepare('UPDATE users SET password_hash = ?, updated_at = strftime(\'%s\', \'now\') WHERE id = ?').run(
      passwordHash,
      user.id
    );
    
    return NextResponse.json({ 
      success: true, 
      message: `Password updated for ${username}` 
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
