export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, setDocument, deleteDocument, queryDocuments, COLLECTIONS } from '@/lib/firestore';
import { requireAdmin } from '@/lib/middleware';
import { Ban } from '@/types';

function banFromDoc(doc: any): Ban {
  return {
    username: doc.username,
    reason: doc.reason || '',
    bannedBy: doc.banned_by || '',
    timestamp: doc.banned_at || doc.timestamp || Date.now(),
    expiresAt: doc.expires_at,
    permanent: doc.permanent === true,
    hardwareBanDeviceId: doc.hardware_ban_device_id,
  };
}

export async function GET() {
  try {
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
    
    return NextResponse.json(activeBans);  } catch (error) {
    console.error('Error reading bans:', error);
    return NextResponse.json({ error: 'Failed to read bans' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult.error) return authResult.error;
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
      banned_at: newBan.timestamp || Date.now(),
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
  const authResult = requireAdmin(request);
  if (authResult.error) return authResult.error;
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




