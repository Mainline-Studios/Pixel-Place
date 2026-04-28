import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, setDocument, deleteDocument, COLLECTIONS } from '@/lib/firestore';
import { GameSubmission } from '@/types';

function submissionFromDoc(doc: any): GameSubmission {
  return {
    id: doc.id,
    title: doc.title || '',
    desc: doc.description || doc.desc || '',
    owner: doc.owner || '',
    ts: doc.ts || 0,
    sceneData: typeof doc.scene_data === 'string' ? JSON.parse(doc.scene_data) : doc.scene_data,
    status: doc.status || 'pending',
    reviewedBy: doc.reviewed_by,
    adminNotes: doc.admin_notes,
    gameType: doc.game_type,
    fileContent: doc.file_content,
    fileType: doc.file_type
  };
}

export async function GET() {
  try {
    const docs = await getDocuments(COLLECTIONS.GAME_SUBMISSIONS, (ref) => ref.orderBy('ts', 'desc'));
    return NextResponse.json(docs.map(submissionFromDoc));
  } catch (error) {
    console.error('Error reading game submissions:', error);
    return NextResponse.json({ error: 'Failed to read game submissions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const submission: GameSubmission = await request.json();
    const id = submission.id || `submission_${Date.now()}`;

    await setDocument(COLLECTIONS.GAME_SUBMISSIONS, id, {
      id,
      title: submission.title,
      description: submission.desc || '',
      owner: submission.owner || '',
      ts: submission.ts || Date.now(),
      scene_data: submission.sceneData || null,
      status: submission.status || 'pending',
      reviewed_by: submission.reviewedBy,
      admin_notes: submission.adminNotes,
      game_type: submission.gameType || null,
      file_content: submission.fileContent || null,
      file_type: submission.fileType || null,
      created_at: Date.now()
    });

    return NextResponse.json({ success: true, submission: { ...submission, id } });
  } catch (error) {
    console.error('Error saving game submission:', error);
    return NextResponse.json({ error: 'Failed to save game submission' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    await deleteDocument(COLLECTIONS.GAME_SUBMISSIONS, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game submission:', error);
    return NextResponse.json({ error: 'Failed to delete game submission' }, { status: 500 });
  }
}
