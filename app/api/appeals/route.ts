import { NextRequest, NextResponse } from 'next/server';
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
  };
}

export async function GET() {
  try {
    const appeals = await getDocuments(COLLECTIONS.BAN_APPEALS, (ref) => ref.orderBy('created_at', 'desc'));
    return NextResponse.json(appeals.map(appealFromDoc));
  } catch (error) {
    console.error('Error reading appeals:', error);
    return NextResponse.json({ error: 'Failed to read appeals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Error updating appeal:', error);
    return NextResponse.json({ error: 'Failed to update appeal' }, { status: 500 });
  }
}
