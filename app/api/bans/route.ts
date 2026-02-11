import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { getDocuments, setDocument, deleteDocument, queryDocuments, COLLECTIONS } from '@/lib/firestore';
import { Ban } from '@/types';

function banFromDoc(doc: any): Ban {
  return {
    username: doc.username,
    reason: doc.reason || '',
    bannedBy: doc.banned_by || '',
    timestamp: doc.banned_at || doc.timestamp || Date.now(),
    expiresAt: doc.expires_at,
    permanent: doc.permanent === true
=======
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
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
  };
}

export async function GET() {
  try {
<<<<<<< HEAD
    const bans = await getDocuments(COLLECTIONS.BANS);
    const now = Date.now();
    // Filter out expired bans
    const activeBans = bans
      .map(banFromDoc)
      .filter((ban: Ban) => {
        if (ban.permanent) return true;
        if (ban.expiresAt && ban.expiresAt > now) return true;
        return false;
      });
    
    // Auto-delete expired bans
    const expiredBans = bans.filter((doc: any) => {
      const ban = banFromDoc(doc);
      if (ban.permanent) return false;
      if (ban.expiresAt && ban.expiresAt <= now) return true;
      return false;
    });
    
    for (const expiredBan of expiredBans) {
      await deleteDocument(COLLECTIONS.BANS, expiredBan.id);
    }
    
    return NextResponse.json(activeBans);
=======
    const db = getDb();
    const rows = db.prepare('SELECT * FROM bans').all();
    const bans = rows.map(banFromRow);
    return NextResponse.json(bans);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
  } catch (error) {
    console.error('Error reading bans:', error);
    return NextResponse.json({ error: 'Failed to read bans' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
<<<<<<< HEAD
    const newBan: Ban = await request.json();
    
    // Remove existing ban for this user
    const existingBans = await queryDocuments(COLLECTIONS.BANS, 'username_lower', '==', newBan.username.toLowerCase());
    for (const ban of existingBans) {
      await deleteDocument(COLLECTIONS.BANS, ban.id);
    }
    
    // Add new ban
    await setDocument(COLLECTIONS.BANS, newBan.username.toLowerCase(), {
      username: newBan.username,
      username_lower: newBan.username.toLowerCase(),
      reason: newBan.reason || '',
      banned_by: newBan.bannedBy || '',
      banned_at: newBan.timestamp || Date.now(),
      expires_at: newBan.expiresAt,
      permanent: newBan.permanent || false,
      created_at: Date.now()
    });
=======
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
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
    
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
    
<<<<<<< HEAD
    const existingBans = await queryDocuments(COLLECTIONS.BANS, 'username_lower', '==', username.toLowerCase());
    for (const ban of existingBans) {
      await deleteDocument(COLLECTIONS.BANS, ban.id);
    }
=======
    const db = getDb();
    db.prepare('DELETE FROM bans WHERE LOWER(username) = LOWER(?)').run(username);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ban:', error);
    return NextResponse.json({ error: 'Failed to delete ban' }, { status: 500 });
  }
}
<<<<<<< HEAD
=======




>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
