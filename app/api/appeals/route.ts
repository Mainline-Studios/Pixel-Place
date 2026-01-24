import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { BanAppeal } from '@/types';

function appealFromRow(row: any): BanAppeal {
  return {
    id: row.id.toString(),
    username: row.username,
    appealText: row.appeal_text,
    status: row.status || 'pending',
    reviewedBy: row.reviewed_by,
    adminNotes: row.admin_notes || undefined,
    reviewedAt: row.reviewed_at ? row.reviewed_at * 1000 : undefined
  };
}

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM ban_appeals ORDER BY created_at DESC').all();
    const appeals = rows.map(appealFromRow);
    return NextResponse.json(appeals);
  } catch (error) {
    console.error('Error reading appeals:', error);
    return NextResponse.json({ error: 'Failed to read appeals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const newAppeal: BanAppeal = await request.json();
    
    // Find the ban for this user
    const ban = db.prepare('SELECT * FROM bans WHERE LOWER(username) = LOWER(?)').get(newAppeal.username);
    if (!ban) {
      return NextResponse.json({ error: 'No ban found for this user' }, { status: 404 });
    }
    
    const result = db.prepare(`
      INSERT INTO ban_appeals (ban_id, username, appeal_text, status)
      VALUES (?, ?, ?, 'pending')
    `).run(ban.id, newAppeal.username, newAppeal.appealText);
    
    const createdAppeal: BanAppeal = {
      ...newAppeal,
      id: result.lastInsertRowid.toString(),
      status: 'pending'
    };
    
    return NextResponse.json(createdAppeal);
  } catch (error) {
    console.error('Error creating appeal:', error);
    return NextResponse.json({ error: 'Failed to create appeal' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = getDb();
    const { id, status, reviewedBy, adminNotes, shouldUnban } = await request.json();
    
    const row = db.prepare('SELECT * FROM ban_appeals WHERE id = ?').get(parseInt(id));
    if (!row) {
      return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });
    }
    
    db.prepare(`
      UPDATE ban_appeals SET
        status = ?,
        reviewed_by = ?,
        reviewed_at = strftime('%s', 'now')
      WHERE id = ?
    `).run(status, reviewedBy, parseInt(id));
    
    // If approved and should unban, also unban the user
    if (status === 'approved' && shouldUnban) {
      db.prepare('DELETE FROM bans WHERE LOWER(username) = LOWER(?)').run(row.username);
    }
    
    const updated = db.prepare('SELECT * FROM ban_appeals WHERE id = ?').get(parseInt(id));
    return NextResponse.json(appealFromRow(updated));
  } catch (error) {
    console.error('Error updating appeal:', error);
    return NextResponse.json({ error: 'Failed to update appeal' }, { status: 500 });
  }
}




