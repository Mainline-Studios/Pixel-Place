import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, setDocument, deleteDocument, queryDocuments, COLLECTIONS } from '@/lib/firestore';
import { Ban } from '@/types';

function banFromDoc(doc: any): Ban {
  return {
    username: doc.username,
    reason: doc.reason || '',
    bannedBy: doc.banned_by || '',
    bannedAt: doc.banned_at,
    expiresAt: doc.expires_at,
    permanent: doc.permanent === true
  };
}

export async function GET() {
  try {
    const bans = await getDocuments(COLLECTIONS.BANS);
    return NextResponse.json(bans.map(banFromDoc));
  } catch (error) {
    console.error('Error reading bans:', error);
    return NextResponse.json({ error: 'Failed to read bans' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
      banned_at: newBan.bannedAt,
      expires_at: newBan.expiresAt,
      permanent: newBan.permanent || false,
      created_at: Date.now()
    });
    
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
    
    const existingBans = await queryDocuments(COLLECTIONS.BANS, 'username_lower', '==', username.toLowerCase());
    for (const ban of existingBans) {
      await deleteDocument(COLLECTIONS.BANS, ban.id);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ban:', error);
    return NextResponse.json({ error: 'Failed to delete ban' }, { status: 500 });
  }
}
