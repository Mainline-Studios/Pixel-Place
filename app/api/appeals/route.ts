import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { getDocuments, addDocument, updateDocument, queryDocuments, deleteDocument, COLLECTIONS } from '@/lib/firestore';
import { BanAppeal } from '@/types';

function appealFromDoc(doc: any): BanAppeal {
  return {
    id: doc.id,
    username: doc.username,
    appealText: doc.appeal_text,
    status: doc.status || 'pending',
    reviewedBy: doc.reviewed_by,
    adminNotes: doc.admin_notes || undefined,
    reviewedAt: doc.reviewed_at
=======
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
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
  };
}

export async function GET() {
  try {
<<<<<<< HEAD
    const appeals = await getDocuments(COLLECTIONS.BAN_APPEALS, (ref) => ref.orderBy('created_at', 'desc'));
    return NextResponse.json(appeals.map(appealFromDoc));
=======
    const db = getDb();
    const rows = db.prepare('SELECT * FROM ban_appeals ORDER BY created_at DESC').all();
    const appeals = rows.map(appealFromRow);
    return NextResponse.json(appeals);
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
  } catch (error) {
    console.error('Error reading appeals:', error);
    return NextResponse.json({ error: 'Failed to read appeals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
<<<<<<< HEAD
    const newAppeal: BanAppeal = await request.json();
    
    // Find the ban for this user
    const bans = await queryDocuments(COLLECTIONS.BANS, 'username_lower', '==', newAppeal.username.toLowerCase());
    if (bans.length === 0) {
      return NextResponse.json({ error: 'No ban found for this user' }, { status: 404 });
    }
    
    const ban = bans[0];
    const appealId = await addDocument(COLLECTIONS.BAN_APPEALS, {
      ban_id: ban.id,
      username: newAppeal.username,
      appeal_text: newAppeal.appealText,
      status: 'pending',
      created_at: Date.now()
    });
    
    const createdAppeal: BanAppeal = {
      ...newAppeal,
      id: appealId,
=======
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
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
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
<<<<<<< HEAD
    const { id, status, reviewedBy, adminNotes, shouldUnban } = await request.json();
    
    const appeals = await getDocuments(COLLECTIONS.BAN_APPEALS);
    const appeal = appeals.find(a => a.id === id);
    
    if (!appeal) {
      return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });
    }
    
    await updateDocument(COLLECTIONS.BAN_APPEALS, id, {
      status: status,
      reviewed_by: reviewedBy,
      reviewed_at: Date.now()
    });
    
    // If approved and should unban, also unban the user
    if (status === 'approved' && shouldUnban) {
      const bans = await queryDocuments(COLLECTIONS.BANS, 'username_lower', '==', appeal.username.toLowerCase());
      for (const ban of bans) {
        await deleteDocument(COLLECTIONS.BANS, ban.id);
      }
    }
    
    const updated = await getDocuments(COLLECTIONS.BAN_APPEALS);
    const updatedAppeal = updated.find(a => a.id === id);
    return NextResponse.json(appealFromDoc(updatedAppeal || appeal));
=======
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
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
  } catch (error) {
    console.error('Error updating appeal:', error);
    return NextResponse.json({ error: 'Failed to update appeal' }, { status: 500 });
  }
}
<<<<<<< HEAD
=======




>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
