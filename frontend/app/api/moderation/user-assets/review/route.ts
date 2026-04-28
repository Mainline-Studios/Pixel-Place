import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserOrBackend } from '@/lib/server/apiAuth';
import { isModerator } from '@/lib/moderation/roles';
import { getDocument, updateDocument, COLLECTIONS } from '@/lib/firestore';

type Body = {
  scanId?: string;
  decision?: 'approve' | 'reject';
};

export async function POST(request: NextRequest) {
  try {
    const actor = await getAuthenticatedUserOrBackend(request);
    if (!actor || !isModerator(actor.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as Body;
    const scanId = typeof body.scanId === 'string' ? body.scanId : '';
    const decision = body.decision;
    if (!scanId || (decision !== 'approve' && decision !== 'reject')) {
      return NextResponse.json({ error: 'scanId and decision (approve|reject) required' }, { status: 400 });
    }

    const doc = await getDocument(COLLECTIONS.USER_ASSET_SCANS, scanId);
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await updateDocument(COLLECTIONS.USER_ASSET_SCANS, scanId, {
      review_status: decision === 'approve' ? 'approved' : 'rejected',
      reviewer: actor.username,
      reviewed_at: Date.now(),
    });

    return NextResponse.json({ ok: true, scanId, reviewStatus: decision === 'approve' ? 'approved' : 'rejected' });
  } catch (e) {
    console.error('[moderation/user-assets/review]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
