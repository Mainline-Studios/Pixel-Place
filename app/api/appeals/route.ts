export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, getDocument, addDocument, updateDocument, queryDocuments, deleteDocument, COLLECTIONS } from '@/lib/firestore';
import { BanAppeal, Ban } from '@/types';
import { getAppealBotReply } from '@/lib/appealBot';

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

function appealFromDoc(doc: any, ban?: Ban | null): BanAppeal {
  return {
    id: doc.id,
    username: doc.username,
    appealText: doc.appeal_text,
    appealMessage: doc.appeal_text,
    timestamp: doc.created_at || Date.now(),
    status: doc.status || 'pending',
    reviewedBy: doc.reviewed_by,
    adminNotes: doc.admin_notes || undefined,
    reviewedAt: doc.reviewed_at,
    ban: ban || undefined as any,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usernameParam = searchParams.get('username');
    const appeals = await getDocuments(COLLECTIONS.BAN_APPEALS, (ref) => ref.orderBy('created_at', 'desc'));
    let result = await Promise.all(appeals.map(async (a) => {
      const banDoc = a.ban_id ? await getDocument(COLLECTIONS.BANS, a.ban_id) : null;
      const ban = banDoc ? banFromDoc({ ...banDoc, id: a.ban_id }) : null;
      return appealFromDoc(a, ban);
    }));
    if (usernameParam) {
      const u = usernameParam.toLowerCase();
      result = result.filter((a) => a.username.toLowerCase() === u);
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error reading appeals:', error);
    return NextResponse.json({ error: 'Failed to read appeals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = body.username;
    const appealMessage = (body.appealMessage || body.appealText || '').trim();
    if (!username || !appealMessage) {
      return NextResponse.json({ error: 'Username and appeal message required' }, { status: 400 });
    }

    const bans = await queryDocuments(COLLECTIONS.BANS, 'username_lower', '==', username.toLowerCase());
    if (bans.length === 0) {
      return NextResponse.json({ error: 'No ban found for this user' }, { status: 404 });
    }

    const ban = bans[0];
    const banReason = ban.reason || 'Not specified';
    const bannedBy = ban.banned_by || 'System';

    const appealId = await addDocument(COLLECTIONS.BAN_APPEALS, {
      ban_id: ban.id,
      username,
      appeal_text: appealMessage,
      status: 'pending',
      created_at: Date.now(),
    });

    const now = Date.now();
    await addDocument(COLLECTIONS.APPEAL_MESSAGES, {
      appeal_id: appealId,
      from_username: username,
      message: appealMessage,
      created_at: now,
    });

    const botReply = await getAppealBotReply(banReason, username, bannedBy, [
      { from: username, message: appealMessage },
    ]);
    await addDocument(COLLECTIONS.APPEAL_MESSAGES, {
      appeal_id: appealId,
      from_username: 'appeal_bot',
      message: botReply,
      created_at: now + 1,
    });

    const banForResponse = banFromDoc(ban);
    const createdAppeal: BanAppeal = {
      id: appealId,
      username,
      appealMessage,
      appealText: appealMessage,
      timestamp: now,
      status: 'pending',
      ban: banForResponse,
    };
    return NextResponse.json(createdAppeal);
  } catch (error) {
    console.error('Error creating appeal:', error);
    return NextResponse.json({ error: 'Failed to create appeal' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status, reviewedBy, adminNotes, shouldUnban } = await request.json();
    
    const appeals = await getDocuments(COLLECTIONS.BAN_APPEALS);
    const appeal = appeals.find(a => a.id === id);
    
    if (!appeal) {
      return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });
    }
    
    await updateDocument(COLLECTIONS.BAN_APPEALS, id, {
      status,
      reviewed_by: reviewedBy,
      reviewed_at: Date.now(),
      ...(adminNotes !== undefined && { admin_notes: adminNotes }),
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
    return NextResponse.json(appealFromDoc(updatedAppeal || appeal));  } catch (error) {
    console.error('Error updating appeal:', error);
    return NextResponse.json({ error: 'Failed to update appeal' }, { status: 500 });
  }
}
