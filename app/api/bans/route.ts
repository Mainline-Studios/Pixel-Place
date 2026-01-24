import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Ban } from '@/types';

function banFromRow(row: any): Ban {
  return {
    username: row.username,
    reason: row.reason || '',
    bannedBy: row.banned_by || '',
    bannedAt: row.banned_at,
    expiresAt: row.expires_at,
    permanent: row.permanent === 1
  };
}

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM bans').all();
    const bans = rows.map(banFromRow);
    return NextResponse.json(bans);
  } catch (error) {
    console.error('Error reading bans:', error);
    return NextResponse.json({ error: 'Failed to read bans' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const newBan: Ban = await request.json();
    
    // Remove existing ban for this user
    db.prepare('DELETE FROM bans WHERE LOWER(username) = LOWER(?)').run(newBan.username);
    
    // Insert new ban
    db.prepare(`
      INSERT INTO bans (username, reason, banned_by, banned_at, expires_at, permanent)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      newBan.username,
      newBan.reason || '',
      newBan.bannedBy || '',
      newBan.bannedAt,
      newBan.expiresAt,
      newBan.permanent ? 1 : 0
    );
    
    return NextResponse.json(newBan);
  } catch (error) {
    console.error('Error creating ban:', error);
    return NextResponse.json({ error: 'Failed to create ban' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }
    
    const db = getDb();
    db.prepare('DELETE FROM bans WHERE LOWER(username) = LOWER(?)').run(username);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ban:', error);
    return NextResponse.json({ error: 'Failed to delete ban' }, { status: 500 });
  }
}




